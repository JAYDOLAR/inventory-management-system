# Database Schema Update Instructions

The error "Could not find the 'barcode' column of 'products' in the schema cache" occurs because the `products` table in your database is missing the `barcode`, `image_url`, and `supplier_id` columns, which are expected by the application.

To resolve this issue, you need to run the following SQL commands in your Supabase SQL Editor or your database client.

## 1. Run the Migration Script

Copy and run the contents of `scripts/update_products_schema.sql`:

```sql
-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);

-- Create index for barcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
```

## 2. Reload Schema Cache

After running the SQL, you may need to reload the schema cache in your application.
- If you are running the development server (`npm run dev`), restart it.
- If you are using Supabase, the schema cache should update automatically, but restarting the dev server ensures the local client is aware of the changes.

## 3. Verify the Fix

1.  Go to the "New Product" page. You should now see a "Barcode" field.
2.  Try adding a product with a barcode.
3.  Go to "Operations" -> "Receipts" -> "New Receipt".
4.  Try scanning a barcode or entering a SKU/Barcode manually. It should now work correctly.
