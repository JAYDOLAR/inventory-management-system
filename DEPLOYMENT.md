# Deployment Guide

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and API keys
3. Run database migrations from `scripts/setup_database.sql` in SQL Editor
4. Run `scripts/atomic_inventory_functions.sql` for inventory operations

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

Or use the Vercel button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Database Setup

### Required Tables

Run these SQL scripts in order:

1. `scripts/setup_database.sql` - Creates tables, policies, and seed data
2. `scripts/atomic_inventory_functions.sql` - Creates inventory functions

### Authentication Configuration

In Supabase Dashboard → Authentication:

- Enable Email authentication
- Configure email templates (optional)
- Add your production URL to redirect URLs

## Performance

### Recommended Database Indexes

```sql
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_product ON inventory_levels(product_id);
CREATE INDEX idx_moves_created ON stock_moves(created_at DESC);
```

### Caching

Enable revalidation in `app/layout.tsx`:

```typescript
export const revalidate = 60;
```

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all operations
- Never commit `.env.local` to version control

## Troubleshooting

**Missing environment variables**
- Verify `.env.local` exists locally
- Check Vercel environment variables are set

**Authentication issues**
- Clear browser cookies
- Verify Supabase URL has no trailing slash

**Inventory not updating**
- Check Supabase logs
- Verify atomic functions are deployed

## Monitoring

- Supabase Dashboard: Database usage and API requests
- Vercel Analytics: Performance metrics
- Browser Console: Client-side errors

For detailed help, see [README.md](README.md)

