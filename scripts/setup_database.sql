-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    uom TEXT DEFAULT 'unit', -- Unit of Measure
    min_stock_level INTEGER DEFAULT 0,
    barcode TEXT UNIQUE,
    image_url TEXT,
    supplier_id UUID, -- Foreign key added later or can be added here if suppliers table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for barcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT,
    type TEXT DEFAULT 'warehouse', -- warehouse, store, return_center
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_levels table (Current stock snapshot)
CREATE TABLE IF NOT EXISTS inventory_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    bin_location TEXT, -- Specific shelf/bin location
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id, bin_location)
);

-- Create stock_moves table (Ledger of all movements)
CREATE TABLE IF NOT EXISTS stock_moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    from_warehouse_id UUID REFERENCES warehouses(id),
    to_warehouse_id UUID REFERENCES warehouses(id),
    quantity INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('receipt', 'delivery', 'transfer', 'adjustment')),
    reference TEXT, -- PO Number, Order ID, etc.
    notes TEXT,
    created_by UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_moves ENABLE ROW LEVEL SECURITY;

-- Create generic policies (Open for now, can be restricted later)
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON products FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON warehouses FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all" ON warehouses FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON inventory_levels FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all" ON inventory_levels FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON stock_moves FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON stock_moves FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Seed some initial data
INSERT INTO warehouses (name, location, type) VALUES 
('Main Warehouse', 'New York', 'warehouse'),
('West Coast Hub', 'Los Angeles', 'warehouse'),
('Retail Store #1', 'Chicago', 'store')
ON CONFLICT DO NOTHING;
