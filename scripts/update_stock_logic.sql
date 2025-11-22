-- Function to process stock movements and update inventory levels
CREATE OR REPLACE FUNCTION process_stock_move()
RETURNS TRIGGER AS $$
BEGIN
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
        ON CONFLICT (product_id, warehouse_id, bin_location) -- Assuming generic bin for now or NULL
        DO UPDATE SET 
            quantity = inventory_levels.quantity + NEW.quantity,
            last_updated = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after a stock move is recorded
DROP TRIGGER IF EXISTS trigger_process_stock_move ON stock_moves;
CREATE TRIGGER trigger_process_stock_move
AFTER INSERT ON stock_moves
FOR EACH ROW
EXECUTE FUNCTION process_stock_move();
