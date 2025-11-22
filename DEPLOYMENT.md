# 🚀 Nexus IMS - Deployment & Setup Guide

## Production Deployment Checklist

### ✅ Pre-Deployment

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Production build tested locally

### 📊 Supabase Setup

#### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - Project URL
   - Anon/Public API Key
   - Service Role Key (keep secret!)

#### 2. Run Database Migrations

Go to your Supabase project → SQL Editor → New Query

**Run this SQL:**

```sql
-- Copy and paste the entire content from scripts/setup_database.sql
```

This will create:
- `products` table
- `warehouses` table  
- `inventory_levels` table
- `stock_moves` table
- Row Level Security policies
- Seed data (3 warehouses)

#### 3. Configure Authentication

In Supabase Dashboard → Authentication → Settings:

1. **Email Auth**: Enable
2. **Confirm Email**: Optional (disable for testing)
3. **Email Templates**: Customize if needed
4. **Redirect URLs**: Add your production URL

### 🔧 Environment Configuration

Create `.env.local` in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ Important:** Never commit `.env.local` to Git!

### 🌐 Vercel Deployment

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nexus-ims)

#### Manual Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Add Environment Variables**
In Vercel Dashboard → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Redeploy**
```bash
vercel --prod
```

### 📱 Testing Deployment

1. **Create Account**
   - Visit `/auth`
   - Sign up with email
   - Verify email (if enabled)

2. **Test Core Features**
   - ✅ Create a product
   - ✅ Create a receipt (incoming stock)
   - ✅ Create a delivery (outgoing stock)
   - ✅ Create a transfer
   - ✅ Create an adjustment
   - ✅ View stock moves history
   - ✅ Check inventory levels

3. **Verify Data Integrity**
   - Check Supabase dashboard → Table Editor
   - Verify inventory_levels match stock_moves
   - Confirm all operations logged correctly

### 🔒 Security Hardening

#### Row Level Security (RLS)

Already enabled! Review policies in `scripts/setup_database.sql`

**Current Policies:**
- All tables: Read access for authenticated users
- Products: Authenticated users can create/update
- Stock moves: Authenticated users can create
- Warehouses: Authenticated users can manage

#### Enhance Security (Production)

Add role-based policies:

```sql
-- Example: Restrict deletions to admin role only
CREATE POLICY "Only admins can delete products"
ON products FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

#### API Route Protection

All API routes use Supabase auth automatically.

### 📊 Monitoring & Analytics

#### Supabase Dashboard
- Monitor database usage
- Check API requests
- Review auth events

#### Vercel Analytics
- Install `@vercel/analytics` (already included)
- View real-time metrics in Vercel dashboard

### 🐛 Troubleshooting

#### Issue: "Missing Supabase environment variables"

**Solution:**
```bash
# Check .env.local exists
cat .env.local

# Verify variables in Vercel
vercel env ls
```

#### Issue: "Authentication redirect loop"

**Solution:**
- Check middleware.ts is correctly configured
- Verify Supabase URL doesn't have trailing slash
- Clear browser cookies

#### Issue: "Inventory not updating"

**Solution:**
- Check stock_moves table for entries
- Verify inventory_levels table has upsert permissions
- Check browser console for errors

#### Issue: "Products table is empty"

**Solution:**
```sql
-- Check RLS policies
SELECT * FROM products; -- May fail if not authenticated

-- Temporarily disable RLS for testing
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

### 📈 Performance Optimization

#### Database Indexes

Add these for better performance:

```sql
-- Product lookups
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

-- Inventory queries
CREATE INDEX idx_inventory_product ON inventory_levels(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory_levels(warehouse_id);

-- Stock moves filtering
CREATE INDEX idx_moves_type ON stock_moves(type);
CREATE INDEX idx_moves_created ON stock_moves(created_at DESC);
CREATE INDEX idx_moves_product ON stock_moves(product_id);
```

#### Caching

Enable Vercel Edge Caching for static pages:

```typescript
// app/layout.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

### 🔄 CI/CD Pipeline

#### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 📖 User Documentation

#### Quick Start Guide for Users

**1. First Login**
- Go to `/auth`
- Create account or sign in

**2. Add Products**
- Inventory → Add Product
- Fill in SKU, name, category, UoM
- Set minimum stock level

**3. Set Up Warehouses**
- Warehouses → Add Warehouse
- Enter name and location

**4. Receive Stock**
- Operations → Receipts → New Receipt
- Select warehouse and products
- Enter quantities received

**5. Ship Orders**
- Operations → Deliveries → New Delivery
- Select warehouse and products
- System validates stock availability

**6. Transfer Stock**
- Operations → Transfers → New Transfer
- Select source and destination
- System updates both locations

**7. Adjust Inventory**
- Operations → Adjustments
- Select product and warehouse
- Enter actual counted quantity
- System calculates difference

### 🎯 Success Metrics

Monitor these KPIs:

- ✅ Daily active users
- ✅ Stock movements per day
- ✅ Inventory accuracy (adjustments/total moves)
- ✅ Response time (should be <200ms)
- ✅ Error rate (should be <1%)

### 📞 Support

For issues or questions:
1. Check this documentation
2. Review README.md
3. Check Supabase logs
4. Open GitHub issue

---

**🎉 You're all set! Happy inventory managing!**

