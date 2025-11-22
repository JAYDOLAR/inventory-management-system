-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

-- Create index for barcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
