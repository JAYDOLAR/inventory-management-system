-- Seed Script for Inventory Management System
-- This script populates the database with sample data

-- Clear existing data (in reverse order of dependencies)
DELETE FROM stock_moves;
DELETE FROM inventory_levels;
DELETE FROM products;
DELETE FROM warehouses;

-- Insert Warehouses
INSERT INTO warehouses (id, name, location, type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Main Warehouse', 'New York, NY', 'warehouse'),
  ('22222222-2222-2222-2222-222222222222', 'West Coast Distribution', 'Los Angeles, CA', 'warehouse'),
  ('33333333-3333-3333-3333-333333333333', 'Chicago Store', 'Chicago, IL', 'store'),
  ('44444444-4444-4444-4444-444444444444', 'Return Processing Center', 'Dallas, TX', 'return_center'),
  ('55555555-5555-5555-5555-555555555555', 'Miami Warehouse', 'Miami, FL', 'warehouse');

-- Insert Products
INSERT INTO products (id, sku, name, description, category, uom, min_stock_level) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LAPTOP-001', 'Dell Latitude 5420', 'Business laptop with i5 processor', 'Electronics', 'unit', 10),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'LAPTOP-002', 'HP ProBook 450', '15.6" business laptop', 'Electronics', 'unit', 8),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'MONITOR-001', 'Dell 24" Monitor', '24 inch Full HD monitor', 'Electronics', 'unit', 15),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'MONITOR-002', 'LG 27" UltraWide', '27 inch UltraWide monitor', 'Electronics', 'unit', 10),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'KEYBOARD-001', 'Logitech Wireless Keyboard', 'Wireless keyboard with USB receiver', 'Accessories', 'unit', 25),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'MOUSE-001', 'Logitech MX Master 3', 'Wireless ergonomic mouse', 'Accessories', 'unit', 30),
  ('10101010-1010-1010-1010-101010101010', 'DESK-001', 'Standing Desk', 'Adjustable height standing desk', 'Furniture', 'unit', 5),
  ('20202020-2020-2020-2020-202020202020', 'CHAIR-001', 'Ergonomic Office Chair', 'Mesh back office chair', 'Furniture', 'unit', 8),
  ('30303030-3030-3030-3030-303030303030', 'CABLE-001', 'USB-C Cable 6ft', 'USB-C to USB-C cable', 'Accessories', 'pack', 50),
  ('40404040-4040-4040-4040-404040404040', 'CABLE-002', 'HDMI Cable 10ft', 'High-speed HDMI cable', 'Accessories', 'pack', 40),
  ('50505050-5050-5050-5050-505050505050', 'PHONE-001', 'iPhone 15 Pro', '256GB Space Black', 'Electronics', 'unit', 12),
  ('60606060-6060-6060-6060-606060606060', 'PHONE-002', 'Samsung Galaxy S24', '512GB Phantom Black', 'Electronics', 'unit', 10),
  ('70707070-7070-7070-7070-707070707070', 'TABLET-001', 'iPad Air', '11" 128GB WiFi', 'Electronics', 'unit', 15),
  ('80808080-8080-8080-8080-808080808080', 'HEADSET-001', 'Jabra Evolve2 65', 'Wireless headset with ANC', 'Accessories', 'unit', 20),
  ('90909090-9090-9090-9090-909090909090', 'WEBCAM-001', 'Logitech Brio 4K', '4K webcam with HDR', 'Electronics', 'unit', 12),
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'DOCK-001', 'USB-C Docking Station', 'Dual monitor docking station', 'Accessories', 'unit', 10),
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', 'PRINTER-001', 'HP LaserJet Pro', 'Monochrome laser printer', 'Electronics', 'unit', 5),
  ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0', 'SCANNER-001', 'Epson Document Scanner', 'Duplex document scanner', 'Electronics', 'unit', 3),
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'ROUTER-001', 'Cisco Business Router', 'Enterprise WiFi 6 router', 'Electronics', 'unit', 8),
  ('e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0', 'SWITCH-001', '24-Port Network Switch', 'Gigabit managed switch', 'Electronics', 'unit', 5);

-- Insert Inventory Levels
INSERT INTO inventory_levels (product_id, warehouse_id, quantity, bin_location) VALUES
  -- Main Warehouse (NY)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 45, 'A-1-5'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 32, 'A-1-6'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 78, 'A-2-3'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 56, 'A-2-4'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 120, 'A-3-1'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 95, 'A-3-2'),
  ('10101010-1010-1010-1010-101010101010', '11111111-1111-1111-1111-111111111111', 15, 'B-1-1'),
  ('20202020-2020-2020-2020-202020202020', '11111111-1111-1111-1111-111111111111', 28, 'B-1-2'),
  ('30303030-3030-3030-3030-303030303030', '11111111-1111-1111-1111-111111111111', 200, 'A-4-5'),
  ('40404040-4040-4040-4040-404040404040', '11111111-1111-1111-1111-111111111111', 150, 'A-4-6'),
  
  -- West Coast Distribution (LA)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 38, 'C-2-1'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 65, 'C-2-2'),
  ('50505050-5050-5050-5050-505050505050', '22222222-2222-2222-2222-222222222222', 42, 'C-1-3'),
  ('60606060-6060-6060-6060-606060606060', '22222222-2222-2222-2222-222222222222', 38, 'C-1-4'),
  ('70707070-7070-7070-7070-707070707070', '22222222-2222-2222-2222-222222222222', 55, 'C-1-5'),
  ('80808080-8080-8080-8080-808080808080', '22222222-2222-2222-2222-222222222222', 72, 'C-3-1'),
  ('90909090-9090-9090-9090-909090909090', '22222222-2222-2222-2222-222222222222', 25, 'C-3-2'),
  
  -- Chicago Store
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 18, 'D-1-1'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 22, 'D-1-2'),
  ('30303030-3030-3030-3030-303030303030', '33333333-3333-3333-3333-333333333333', 45, 'D-2-1'),
  ('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', '33333333-3333-3333-3333-333333333333', 12, 'D-1-3'),
  
  -- Miami Warehouse
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 28, 'E-1-1'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 35, 'E-1-2'),
  ('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', '55555555-5555-5555-5555-555555555555', 8, 'E-2-1'),
  ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0', '55555555-5555-5555-5555-555555555555', 5, 'E-2-2'),
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', '55555555-5555-5555-5555-555555555555', 15, 'E-3-1'),
  ('e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0', '55555555-5555-5555-5555-555555555555', 10, 'E-3-2');

-- Insert Stock Movements (Recent History)
INSERT INTO stock_moves (product_id, from_warehouse_id, to_warehouse_id, quantity, type, reference, notes, created_at) VALUES
  -- Recent Receipts
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, '11111111-1111-1111-1111-111111111111', 50, 'receipt', 'PO-2024-001', 'Received from Dell supplier', NOW() - INTERVAL '15 days'),
  ('50505050-5050-5050-5050-505050505050', NULL, '22222222-2222-2222-2222-222222222222', 30, 'receipt', 'PO-2024-002', 'iPhone shipment from Apple', NOW() - INTERVAL '12 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '11111111-1111-1111-1111-111111111111', 100, 'receipt', 'PO-2024-003', 'Bulk keyboard order', NOW() - INTERVAL '10 days'),
  
  -- Recent Deliveries
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', NULL, 25, 'delivery', 'SO-2024-045', 'Customer order fulfillment', NOW() - INTERVAL '8 days'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', NULL, 15, 'delivery', 'SO-2024-046', 'Corporate order', NOW() - INTERVAL '7 days'),
  ('70707070-7070-7070-7070-707070707070', '22222222-2222-2222-2222-222222222222', NULL, 10, 'delivery', 'SO-2024-047', 'Retail customer', NOW() - INTERVAL '5 days'),
  
  -- Recent Transfers
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 20, 'transfer', 'TR-2024-012', 'Stock rebalancing to West Coast', NOW() - INTERVAL '6 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 15, 'transfer', 'TR-2024-013', 'Transfer to Chicago store', NOW() - INTERVAL '4 days'),
  ('30303030-3030-3030-3030-303030303030', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 50, 'transfer', 'TR-2024-014', 'Replenish store inventory', NOW() - INTERVAL '3 days'),
  
  -- Recent Adjustments
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '11111111-1111-1111-1111-111111111111', 5, 'adjustment', 'ADJ-2024-008', 'Cycle count correction', NOW() - INTERVAL '2 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, '55555555-5555-5555-5555-555555555555', -3, 'adjustment', 'ADJ-2024-009', 'Damaged units removed', NOW() - INTERVAL '1 day'),
  
  -- Today's activities
  ('60606060-6060-6060-6060-606060606060', NULL, '22222222-2222-2222-2222-222222222222', 25, 'receipt', 'PO-2024-004', 'Samsung Galaxy shipment', NOW() - INTERVAL '3 hours'),
  ('80808080-8080-8080-8080-808080808080', '22222222-2222-2222-2222-222222222222', NULL, 8, 'delivery', 'SO-2024-048', 'Enterprise customer order', NOW() - INTERVAL '1 hour');

-- Display summary
SELECT 
  'Warehouses' as entity, 
  COUNT(*) as count 
FROM warehouses
UNION ALL
SELECT 
  'Products' as entity, 
  COUNT(*) as count 
FROM products
UNION ALL
SELECT 
  'Inventory Levels' as entity, 
  COUNT(*) as count 
FROM inventory_levels
UNION ALL
SELECT 
  'Stock Movements' as entity, 
  COUNT(*) as count 
FROM stock_moves;
