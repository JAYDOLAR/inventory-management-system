# Database Seeding Guide

This guide explains how to populate your Inventory Management System with sample data.

## Prerequisites

1. **Supabase Project Setup**: Ensure your Supabase project is set up and tables are created
2. **Environment Variables**: Configure your `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   # Optional but recommended for seeding:
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Method 1: TypeScript Seed Script (Recommended)

### Install tsx if not already installed:
```bash
pnpm add -D tsx
```

### Run the seed script:
```bash
pnpm seed
# or
pnpm db:seed
```

### What it does:
- ✅ Clears existing data (warehouses, products, inventory, stock moves)
- ✅ Creates 5 warehouses across different US locations
- ✅ Creates 20 products (laptops, monitors, accessories, furniture, phones, etc.)
- ✅ Generates realistic inventory levels across multiple warehouses
- ✅ Creates 50 stock movement records (receipts, deliveries, transfers, adjustments)

### Sample Data Includes:

**Warehouses:**
- Main Warehouse (New York, NY)
- West Coast Distribution (Los Angeles, CA)
- Chicago Store (Chicago, IL)
- Return Processing Center (Dallas, TX)
- Miami Warehouse (Miami, FL)

**Product Categories:**
- Electronics (laptops, monitors, phones, tablets, routers)
- Accessories (keyboards, mice, cables, headsets, docks)
- Furniture (desks, chairs)

**Stock Movements:**
- Recent receipts from suppliers
- Customer deliveries
- Inter-warehouse transfers
- Inventory adjustments

## Method 2: SQL Seed Script

If you prefer to run SQL directly in Supabase:

1. Open Supabase Dashboard → SQL Editor
2. Copy contents from `scripts/seed.sql`
3. Run the script

This creates the same data with predefined UUIDs.

## Method 3: Manual Seeding via API

You can also use the application's API endpoints to create data:

```bash
# Create a warehouse
curl -X POST http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Warehouse","location":"New York, NY","type":"warehouse"}'

# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"TEST-001","name":"Test Product","category":"Electronics","min_stock_level":10}'

# Create a stock movement
curl -X POST http://localhost:3000/api/stock-moves \
  -H "Content-Type: application/json" \
  -d '{"product_id":"uuid","to_warehouse_id":"uuid","quantity":100,"type":"receipt","reference":"PO-001"}'
```

## Verifying the Seed

After seeding, you should see:
- 5 warehouses in `/warehouses`
- 20 products in `/inventory`
- Multiple inventory levels per product
- 50+ stock movements in `/moves`

Navigate to the dashboard to see KPIs and recent activity.

## Troubleshooting

### Permission Errors
If you get permission errors, ensure:
1. You're using the Service Role Key (not just Anon Key)
2. Row Level Security (RLS) policies allow the operations
3. Your Supabase user has the necessary permissions

### Connection Errors
```bash
# Check your environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Clear and Re-seed
The TypeScript seed script automatically clears data before seeding. To manually clear:

```sql
-- Run in Supabase SQL Editor
DELETE FROM stock_moves;
DELETE FROM inventory_levels;
DELETE FROM products;
DELETE FROM warehouses;
```

## Customizing Seed Data

Edit `scripts/seed.ts` to:
- Add more products
- Change warehouse locations
- Adjust inventory quantities
- Modify stock movement patterns

Example:
```typescript
const products = [
  { 
    sku: 'CUSTOM-001', 
    name: 'Your Product', 
    description: 'Your description',
    category: 'Your Category',
    uom: 'unit',
    min_stock_level: 20
  },
  // ... more products
]
```

## Production Warning

⚠️ **Never run the seed script in production!** It will delete all existing data.

The seed script is intended for:
- Development environments
- Testing
- Demos
- Staging environments (with caution)

## Next Steps

After seeding:
1. Test creating new products via `/inventory/new`
2. Test stock operations via `/operations/*`
3. Verify inventory calculations
4. Test warehouse transfers
5. Review dashboard analytics
