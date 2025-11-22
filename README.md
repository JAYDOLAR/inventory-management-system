# Nexus IMS - Inventory Management System

A modern, full-stack Inventory Management System built with Next.js 16, Supabase, and shadcn/ui.

## Features

### Authentication & Security
- User signup and login
- OTP-based password reset
- Protected routes with middleware
- Session management with Supabase Auth

### Product Management
- Complete CRUD operations for products
- SKU tracking and categorization
- Unit of Measure (UoM) management
- Minimum stock level alerts
- Advanced search and filtering
- Multi-location inventory tracking

### Inventory Operations

**Stock Receipts**
- Create receipt orders
- Automatic inventory level updates
- Supplier reference tracking
- Single and batch product receipts

**Deliveries**
- Delivery order creation
- Real-time stock validation
- Automatic inventory adjustments
- Insufficient stock alerts

**Internal Transfers**
- Transfer stock between warehouses
- Source stock validation
- Automated dual inventory updates
- Complete movement history

**Stock Adjustments**
- Physical count reconciliation
- Real-time variance calculation
- Damage/loss recording
- Complete audit trail

### Dashboard & Reporting
- Real-time inventory KPIs
- Warehouse capacity monitoring
- Recent movements tracking
- Low stock alerts
- Stock movement filtering by type, warehouse, and date
- CSV export for reports

### Warehouse Management
- Multi-warehouse support
- Location tracking and categorization
- Stock level tracking per warehouse
- Product count per location

### Additional Features
- Batch operations (multi-product receipts and deliveries)
- Real-time notifications for low stock
- Barcode/QR code scanning
- Data export (CSV)
- Dark mode support
- Fully responsive design

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI**: shadcn/ui, Tailwind CSS 4, Radix UI
- **Forms**: React Hook Form, Zod validation
- **Barcode**: html5-qrcode

## Installation

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and project

### Setup Steps

1. **Clone and Install**
```bash
git clone https://github.com/JAYDOLAR/inventory-management-system.git
cd inventory-management-system
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. **Setup Database**
- Open Supabase SQL Editor
- Run `scripts/setup_database.sql`
- Run `scripts/atomic_inventory_functions.sql`

4. **Start Development**
```bash
npm run dev
```

Visit `http://localhost:3000`

## Database Schema

### Core Tables

**products**
- Product master data with SKU, name, category
- Unit of measure and minimum stock levels

**warehouses**
- Location management with type classification
- Supports warehouses, stores, and return centers

**inventory_levels**
- Current stock quantities by product and location
- Bin location tracking

**stock_moves**
- Complete audit trail of all inventory movements
- Supports receipts, deliveries, transfers, and adjustments

## Usage

### Adding Products
1. Go to **Inventory** → **Add Product**
2. Enter product details (SKU, name, category, UoM)
3. Set minimum stock level
4. Save

### Receiving Stock
1. Navigate to **Operations** → **Receipts**
2. Select destination warehouse
3. Choose products and enter quantities
4. Submit receipt

### Shipping Orders
1. Go to **Operations** → **Deliveries**
2. Select source warehouse
3. Choose products (system validates stock)
4. Confirm delivery

### Stock Transfers
1. Navigate to **Operations** → **Transfers**
2. Select source and destination warehouses
3. Choose products and quantities
4. Confirm transfer

### Stock Adjustments
1. Go to **Operations** → **Adjustments**
2. Select warehouse and product
3. Enter actual counted quantity
4. System calculates and applies difference

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Project Structure

```
inventory-management-system/
├── app/                    # Next.js app routes
├── components/            # React components
├── lib/                   # Utilities and API helpers
├── scripts/               # Database scripts
└── public/                # Static assets
```

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all operations
- Complete audit trail with user tracking
- Atomic database operations for data integrity

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.
