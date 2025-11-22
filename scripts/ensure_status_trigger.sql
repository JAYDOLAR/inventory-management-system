-- 1. Ensure status column exists
-- We add it as nullable first to avoid issues with existing data
ALTER TABLE stock_moves 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled'));

-- 2. Backfill existing records to 'done' so we don't re-process them
-- This assumes all previous moves were already applied to inventory
UPDATE stock_moves SET status = 'done' WHERE status IS NULL;

-- 3. Set the default to 'draft' for new records
ALTER TABLE stock_moves ALTER COLUMN status SET DEFAULT 'draft';

-- 4. Create or replace the function to process stock moves
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
            -- Check if enough stock exists
            -- We check specifically for the NULL bin location (default)
            IF (SELECT quantity FROM inventory_levels 
                WHERE product_id = NEW.product_id 
                AND warehouse_id = NEW.from_warehouse_id
                AND bin_location IS NULL) < NEW.quantity THEN
                RAISE EXCEPTION 'Insufficient stock in source warehouse';
            END IF;

            -- Decrease stock
            UPDATE inventory_levels
            SET quantity = quantity - NEW.quantity,
                last_updated = NOW()
            WHERE product_id = NEW.product_id 
            AND warehouse_id = NEW.from_warehouse_id
            AND bin_location IS NULL;
        END IF;

        -- Handle INCOMING moves (Receipt, Transfer In)
        IF NEW.to_warehouse_id IS NOT NULL THEN
            -- Try to update existing stock first (handling NULL bin_location)
            UPDATE inventory_levels 
            SET quantity = quantity + NEW.quantity,
                last_updated = NOW()
            WHERE product_id = NEW.product_id 
            AND warehouse_id = NEW.to_warehouse_id
            AND bin_location IS NULL;
            
            -- If no row was updated, insert a new one
            IF NOT FOUND THEN
                INSERT INTO inventory_levels (product_id, warehouse_id, quantity, last_updated, bin_location)
                VALUES (NEW.product_id, NEW.to_warehouse_id, NEW.quantity, NOW(), NULL);
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Drop the old trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS trigger_process_stock_move ON stock_moves;

-- 6. Create the trigger that fires on INSERT and UPDATE
CREATE TRIGGER trigger_process_stock_move
AFTER INSERT OR UPDATE ON stock_moves
FOR EACH ROW
EXECUTE FUNCTION process_stock_move();
