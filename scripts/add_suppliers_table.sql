CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add supplier_id to stock_moves (for receipts)
ALTER TABLE stock_moves 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all" ON suppliers FOR ALL USING (auth.role() = 'authenticated');

-- Seed some suppliers
INSERT INTO suppliers (name, contact_person, email, phone) VALUES 
('Acme Corp', 'John Smith', 'john@acme.com', '555-0101'),
('Global Steel', 'Sarah Jones', 'sarah@globalsteel.com', '555-0102'),
('Tech Parts Ltd', 'Mike Brown', 'mike@techparts.com', '555-0103')
ON CONFLICT DO NOTHING;
