-- Fix for "more than one row returned by a subquery" error in stock transfer
-- This replaces the trigger function with a robust version that handles multiple inventory rows (bins) correctly

CREATE OR REPLACE FUNCTION process_stock_move()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if we should process this move
    -- 1. It's a new record and status is 'done'
    -- 2. It's an update and status changed to 'done'
    IF (TG_OP = 'INSERT' AND NEW.status = 'done') OR 
       (TG_OP = 'UPDATE' AND OLD.status != 'done' AND NEW.status = 'done') THEN
        
        -- Handle OUTGOING moves (Delivery, Transfer Out)
        IF NEW.from_warehouse_id IS NOT NULL THEN
            -- Check if enough stock exists (Summing up all bins)
            IF (SELECT COALESCE(SUM(quantity), 0) FROM inventory_levels 
                WHERE product_id = NEW.product_id 
                AND warehouse_id = NEW.from_warehouse_id) < NEW.quantity THEN
                RAISE EXCEPTION 'Insufficient stock in source warehouse';
            END IF;

            -- Decrease stock (Targeting the largest pile to avoid double subtraction)
            -- We use a CTE to identify a single row to update, preventing "multiple rows updated" issues
            WITH target_stock AS (
                SELECT id 
                FROM inventory_levels 
                WHERE product_id = NEW.product_id 
                AND warehouse_id = NEW.from_warehouse_id
                ORDER BY quantity DESC, last_updated DESC
                LIMIT 1
            )
            UPDATE inventory_levels
            SET quantity = quantity - NEW.quantity,
                last_updated = NOW()
            WHERE id IN (SELECT id FROM target_stock);
        END IF;

        -- Handle INCOMING moves (Receipt, Transfer In)
        IF NEW.to_warehouse_id IS NOT NULL THEN
            -- Insert or Update stock (Defaulting to NULL bin location if not specified)
            INSERT INTO inventory_levels (product_id, warehouse_id, quantity, last_updated, bin_location)
            VALUES (NEW.product_id, NEW.to_warehouse_id, NEW.quantity, NOW(), NULL)
            ON CONFLICT (product_id, warehouse_id, bin_location)
            DO UPDATE SET 
                quantity = inventory_levels.quantity + NEW.quantity,
                last_updated = NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
