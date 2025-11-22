-- Add status column to stock_moves
ALTER TABLE stock_moves 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled'));

-- Update existing moves to 'done' so they are consistent (optional, depending on if you want to process old ones)
-- UPDATE stock_moves SET status = 'done' WHERE status IS NULL;

-- Update the trigger function to only process 'done' moves and handle status changes
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
            IF (SELECT quantity FROM inventory_levels 
                WHERE product_id = NEW.product_id 
                AND warehouse_id = NEW.from_warehouse_id) < NEW.quantity THEN
                RAISE EXCEPTION 'Insufficient stock in source warehouse';
            END IF;

            -- Decrease stock
            UPDATE inventory_levels
            SET quantity = quantity - NEW.quantity,
                last_updated = NOW()
            WHERE product_id = NEW.product_id 
            AND warehouse_id = NEW.from_warehouse_id;
        END IF;

        -- Handle INCOMING moves (Receipt, Transfer In)
        IF NEW.to_warehouse_id IS NOT NULL THEN
            -- Insert or Update stock
            INSERT INTO inventory_levels (product_id, warehouse_id, quantity, last_updated)
            VALUES (NEW.product_id, NEW.to_warehouse_id, NEW.quantity, NOW())
            ON CONFLICT (product_id, warehouse_id, bin_location)
            DO UPDATE SET 
                quantity = inventory_levels.quantity + NEW.quantity,
                last_updated = NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS trigger_process_stock_move ON stock_moves;

-- Create the new trigger that fires on INSERT and UPDATE
CREATE TRIGGER trigger_process_stock_move
AFTER INSERT OR UPDATE ON stock_moves
FOR EACH ROW
EXECUTE FUNCTION process_stock_move();
