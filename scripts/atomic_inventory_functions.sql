-- Atomic function for receipt operation
CREATE OR REPLACE FUNCTION process_receipt(
  p_product_id UUID,
  p_warehouse_id UUID,
  p_quantity INTEGER,
  p_reference TEXT,
  p_notes TEXT,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_move_id UUID;
  v_current_qty INTEGER;
  v_new_qty INTEGER;
BEGIN
  -- Start transaction (implicit in function)
  
  -- Insert stock move
  INSERT INTO stock_moves (
    product_id, to_warehouse_id, quantity, reference, type, notes, created_by
  )
  VALUES (
    p_product_id, p_warehouse_id, p_quantity, p_reference, 'receipt', p_notes, p_user_id
  )
  RETURNING id INTO v_move_id;
  
  -- Get current inventory level
  SELECT quantity INTO v_current_qty
  FROM inventory_levels
  WHERE product_id = p_product_id
    AND warehouse_id = p_warehouse_id
    AND (bin_location IS NULL OR bin_location = '');
  
  -- Calculate new quantity
  v_new_qty := COALESCE(v_current_qty, 0) + p_quantity;
  
  -- Upsert inventory level
  INSERT INTO inventory_levels (product_id, warehouse_id, quantity, last_updated, bin_location)
  VALUES (p_product_id, p_warehouse_id, v_new_qty, NOW(), NULL)
  ON CONFLICT (product_id, warehouse_id, bin_location)
  DO UPDATE SET
    quantity = v_new_qty,
    last_updated = NOW();
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'move_id', v_move_id,
    'new_quantity', v_new_qty
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Atomic function for delivery operation
CREATE OR REPLACE FUNCTION process_delivery(
  p_product_id UUID,
  p_warehouse_id UUID,
  p_quantity INTEGER,
  p_reference TEXT,
  p_notes TEXT,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_move_id UUID;
  v_current_qty INTEGER;
  v_new_qty INTEGER;
BEGIN
  -- Get current inventory level
  SELECT quantity INTO v_current_qty
  FROM inventory_levels
  WHERE product_id = p_product_id
    AND warehouse_id = p_warehouse_id
    AND (bin_location IS NULL OR bin_location = '');
  
  -- Check if enough stock
  IF v_current_qty IS NULL OR v_current_qty < p_quantity THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient stock',
      'available', COALESCE(v_current_qty, 0)
    );
  END IF;
  
  -- Insert stock move
  INSERT INTO stock_moves (
    product_id, from_warehouse_id, quantity, reference, type, notes, created_by
  )
  VALUES (
    p_product_id, p_warehouse_id, p_quantity, p_reference, 'delivery', p_notes, p_user_id
  )
  RETURNING id INTO v_move_id;
  
  -- Calculate new quantity
  v_new_qty := v_current_qty - p_quantity;
  
  -- Update inventory level
  UPDATE inventory_levels
  SET quantity = v_new_qty,
      last_updated = NOW()
  WHERE product_id = p_product_id
    AND warehouse_id = p_warehouse_id
    AND (bin_location IS NULL OR bin_location = '');
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'move_id', v_move_id,
    'new_quantity', v_new_qty
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Atomic function for transfer operation
CREATE OR REPLACE FUNCTION process_transfer(
  p_product_id UUID,
  p_from_warehouse_id UUID,
  p_to_warehouse_id UUID,
  p_quantity INTEGER,
  p_reference TEXT,
  p_notes TEXT,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_move_id UUID;
  v_from_current INTEGER;
  v_to_current INTEGER;
  v_from_new INTEGER;
  v_to_new INTEGER;
BEGIN
  -- Validate warehouses are different
  IF p_from_warehouse_id = p_to_warehouse_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Source and destination warehouses must be different'
    );
  END IF;
  
  -- Get current inventory at source
  SELECT quantity INTO v_from_current
  FROM inventory_levels
  WHERE product_id = p_product_id
    AND warehouse_id = p_from_warehouse_id
    AND (bin_location IS NULL OR bin_location = '');
  
  -- Check if enough stock at source
  IF v_from_current IS NULL OR v_from_current < p_quantity THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient stock at source',
      'available', COALESCE(v_from_current, 0)
    );
  END IF;
  
  -- Insert stock move
  INSERT INTO stock_moves (
    product_id, from_warehouse_id, to_warehouse_id, quantity, reference, type, notes, created_by
  )
  VALUES (
    p_product_id, p_from_warehouse_id, p_to_warehouse_id, p_quantity, p_reference, 'transfer', p_notes, p_user_id
  )
  RETURNING id INTO v_move_id;
  
  -- Update source warehouse
  v_from_new := v_from_current - p_quantity;
  UPDATE inventory_levels
  SET quantity = v_from_new,
      last_updated = NOW()
  WHERE product_id = p_product_id
    AND warehouse_id = p_from_warehouse_id
    AND (bin_location IS NULL OR bin_location = '');
  
  -- Get current inventory at destination
  SELECT quantity INTO v_to_current
  FROM inventory_levels
  WHERE product_id = p_product_id
    AND warehouse_id = p_to_warehouse_id
    AND (bin_location IS NULL OR bin_location = '');
  
  -- Update destination warehouse
  v_to_new := COALESCE(v_to_current, 0) + p_quantity;
  INSERT INTO inventory_levels (product_id, warehouse_id, quantity, last_updated, bin_location)
  VALUES (p_product_id, p_to_warehouse_id, v_to_new, NOW(), NULL)
  ON CONFLICT (product_id, warehouse_id, bin_location)
  DO UPDATE SET
    quantity = v_to_new,
    last_updated = NOW();
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'move_id', v_move_id,
    'from_new_quantity', v_from_new,
    'to_new_quantity', v_to_new
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Atomic function for adjustment operation
CREATE OR REPLACE FUNCTION process_adjustment(
  p_product_id UUID,
  p_warehouse_id UUID,
  p_new_quantity INTEGER,
  p_reference TEXT,
  p_notes TEXT,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_move_id UUID;
  v_current_qty INTEGER;
  v_difference INTEGER;
BEGIN
  -- Get current inventory level
  SELECT quantity INTO v_current_qty
  FROM inventory_levels
  WHERE product_id = p_product_id
    AND warehouse_id = p_warehouse_id
    AND (bin_location IS NULL OR bin_location = '');
  
  -- Calculate difference
  v_difference := p_new_quantity - COALESCE(v_current_qty, 0);
  
  -- Only proceed if there's a difference
  IF v_difference = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No adjustment needed - quantities match'
    );
  END IF;
  
  -- Insert stock move
  INSERT INTO stock_moves (
    product_id, to_warehouse_id, quantity, reference, type, notes, created_by
  )
  VALUES (
    p_product_id, p_warehouse_id, p_new_quantity, p_reference, 'adjustment', p_notes, p_user_id
  )
  RETURNING id INTO v_move_id;
  
  -- Update inventory level to exact quantity
  INSERT INTO inventory_levels (product_id, warehouse_id, quantity, last_updated, bin_location)
  VALUES (p_product_id, p_warehouse_id, p_new_quantity, NOW(), NULL)
  ON CONFLICT (product_id, warehouse_id, bin_location)
  DO UPDATE SET
    quantity = p_new_quantity,
    last_updated = NOW();
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'move_id', v_move_id,
    'new_quantity', p_new_quantity,
    'difference', v_difference
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION process_receipt TO authenticated;
GRANT EXECUTE ON FUNCTION process_delivery TO authenticated;
GRANT EXECUTE ON FUNCTION process_transfer TO authenticated;
GRANT EXECUTE ON FUNCTION process_adjustment TO authenticated;
