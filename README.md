# Nexus IMS - Inventory Management System

A production-ready, full-featured Inventory Management System built with Next.js 16, Supabase, and shadcn/ui.

## 🚀 Features

### ✅ **Implemented Features**

#### 1. **Authentication System**
- ✅ User signup and login
- ✅ OTP-based password reset
- ✅ Protected routes with middleware
- ✅ Session management with Supabase Auth
- ✅ Automatic redirect for authenticated/unauthenticated users

#### 2. **Product Management**
- ✅ Create, view, edit, and delete products
- ✅ SKU/Product code tracking
- ✅ Product categories
- ✅ Unit of Measure (UoM) management
- ✅ Minimum stock level alerts
- ✅ Product search and filtering
- ✅ Multi-location stock tracking

#### 3. **Inventory Operations**

**Receipts (Incoming Stock)**
- ✅ Create receipt orders
- ✅ Automatic inventory level updates
- ✅ Supplier reference tracking
- ✅ Multi-product receipts

**Deliveries (Outgoing Stock)**
- ✅ Delivery order creation
- ✅ Stock validation before delivery
- ✅ Automatic inventory decrease
- ✅ Insufficient stock alerts

**Internal Transfers**
- ✅ Transfer between warehouses
- ✅ Stock validation at source
- ✅ Dual inventory updates (source & destination)
- ✅ Full movement history

**Stock Adjustments**
- ✅ Physical count adjustments
- ✅ Real-time difference calculation
- ✅ Damage/loss recording
- ✅ Complete audit trail

#### 4. **Dashboard & Reporting**
- ✅ Real-time KPIs:
  - Total products in stock
  - Low stock alerts
  - Out of stock items
  - Recent movements count
- ✅ Warehouse summary cards
- ✅ Recent movements visualization
- ✅ Dynamic filtering by type/status/warehouse
- ✅ Date range filtering

#### 5. **Warehouse Management**
- ✅ Multi-warehouse support
- ✅ Warehouse CRUD operations
- ✅ Warehouse type classification (warehouse, store, return center)
- ✅ Stock level tracking per warehouse
- ✅ Product count per location

#### 6. **Stock Movement History**
- ✅ Complete ledger of all movements
- ✅ Advanced filtering (type, warehouse, date range)
- ✅ Real-time filter application
- ✅ Detailed movement tracking with references
- ✅ CSV export capabilities

#### 7. **Batch Operations**
- ✅ Batch receipts (receive multiple products at once)
- ✅ Batch deliveries (ship multiple products at once)
- ✅ Dynamic product line management
- ✅ Real-time stock validation
- ✅ Total quantity calculation

#### 8. **Real-time Features**
- ✅ Low stock notifications
- ✅ Supabase Realtime subscriptions
- ✅ Automatic inventory change detection
- ✅ Toast notifications for alerts

#### 9. **Barcode Scanning**
- ✅ QR code and barcode scanner
- ✅ Camera-based product lookup
- ✅ Auto-fill product selection
- ✅ Integrated into receipt operations

#### 10. **Data Export**
- ✅ CSV export for stock moves
- ✅ CSV export for products
- ✅ Filtered data export
- ✅ Timestamped file naming

#### 11. **UI/UX Features**
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Collapsible sidebar navigation
- ✅ Clean, modern interface
- ✅ Real-time alerts and notifications
- ✅ Camera integration for barcode scanning

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, RPC Functions)
- **UI**: shadcn/ui, Tailwind CSS 4, Radix UI
- **Forms**: React Hook Form, Zod validation
- **State**: React Server Components
- **Barcode**: html5-qrcode
- **Deployment**: Vercel-ready

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and project

### Setup Steps

1. **Clone and Install**
```bash
git clone <repository>
cd inventory-management-system
npm install
```

2. **Configure Supabase**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. **Run Database Migrations**
- Go to Supabase SQL Editor
- Run `scripts/setup_database.sql`
- This creates all necessary tables, policies, and seed data

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Database Schema

### Tables

**products**
- id (UUID, PK)
- sku (TEXT, UNIQUE)
- name (TEXT)
- description (TEXT)
- category (TEXT)
- uom (TEXT) - Unit of Measure
- min_stock_level (INTEGER)
- created_at, updated_at

**warehouses**
- id (UUID, PK)
- name (TEXT)
- location (TEXT)
- type (TEXT) - warehouse, store, return_center
- created_at

**inventory_levels**
- id (UUID, PK)
- product_id (FK → products)
- warehouse_id (FK → warehouses)
- quantity (INTEGER)
- bin_location (TEXT)
- last_updated

**stock_moves**
- id (UUID, PK)
- product_id (FK → products)
- from_warehouse_id (FK → warehouses, nullable)
- to_warehouse_id (FK → warehouses, nullable)
- quantity (INTEGER)
- type (ENUM: receipt, delivery, transfer, adjustment)
- reference (TEXT) - PO #, SO #, etc.
- notes (TEXT)
- created_by (UUID, FK → auth.users)
- created_at

## 🎯 Usage Guide

### 1. **Adding Products**
1. Navigate to **Inventory** → **Add Product**
2. Fill in SKU, name, category, UoM, and minimum stock level
3. Click **Create Product**

### 2. **Receiving Stock**
1. Navigate to **Operations** → **Receipts** → **New Receipt**
2. Select destination warehouse
3. Add products and quantities
4. Enter PO reference (optional)
5. Click **Confirm Receipt**
   - ✅ Inventory automatically increases

### 3. **Shipping Orders**
1. Navigate to **Operations** → **Deliveries** → **New Delivery**
2. Select source warehouse
3. Select products and quantities
4. System validates stock availability
5. Click **Confirm Delivery**
   - ⚠️ Inventory automatically decreases

### 4. **Internal Transfers**
1. Navigate to **Operations** → **Transfers** → **New Transfer**
2. Select source and destination warehouses
3. Select products and quantities
4. Click **Confirm Transfer**
   - ⚠️ Stock moves from source to destination

### 5. **Stock Adjustments**
1. Navigate to **Operations** → **Adjustments** → **New Adjustment**
2. Select warehouse and product
3. Enter actual counted quantity
4. System calculates difference
5. Click **Confirm Adjustment**
   - ⚠️ Inventory updated to actual count

### 6. **Batch Operations**
1. Navigate to **Operations** → **Receipts** → **Batch Receipt**
2. Select warehouse and reference
3. Add multiple product lines
4. Enter quantities for each product
5. Click **Confirm Receipt**
   - ✅ All products received in single operation

### 7. **Using Barcode Scanner**
1. On any receipt page, click **Scan Barcode**
2. Allow camera access
3. Point camera at product barcode or QR code
4. Product auto-selected when detected

### 8. **Exporting Data**
1. Navigate to **Stock Moves** or **Inventory**
2. Apply desired filters
3. Click **Export CSV**
4. File downloads automatically

### 9. **Viewing Movement History**
1. Navigate to **Stock Moves**
2. View complete ledger of all transactions
3. Filter by type, warehouse, product, or date range
4. Export filtered data for reporting

## 🔒 Security & Permissions

- **Row Level Security (RLS)** enabled on all tables
- **Authentication required** for all operations
- **Audit trail** on all stock movements (created_by field)
- **API routes protected** with Supabase auth

## 🚧 Future Enhancements

### High Priority
- [ ] User roles and permissions (admin, warehouse staff, viewer)
- [ ] Advanced analytics dashboard with charts and trends
- [ ] Email notifications for low stock
- [ ] Automated reorder point triggers
- [ ] Product image uploads

### Medium Priority
- [ ] Barcode scanning integration
- [ ] CSV import for bulk product creation
- [ ] Product images and attachments
- [ ] Supplier management module
- [ ] Customer order management
- [ ] Purchase order generation

### Nice to Have
- [ ] Mobile app (React Native)
- [ ] Automated reordering workflows
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Advanced bin/rack location tracking

## 🐛 Known Limitations

1. **Concurrent updates**: Multiple users updating same product simultaneously
   - **Impact**: Last write wins (no conflict resolution)
   - **Note**: Atomic database functions mitigate most issues
   - **Future Fix**: Implement optimistic locking with version numbers

2. **Camera permissions**: Barcode scanner requires camera access
   - **Impact**: User must grant camera permission
   - **Workaround**: Manual SKU entry still available

3. **Large exports**: CSV export loads all data in memory
   - **Impact**: Very large datasets (>10k records) may be slow
   - **Future Fix**: Implement server-side streaming export

## 🛠️ Development

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
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── inventory/         # Product management
│   ├── operations/        # Stock operations
│   ├── moves/             # Movement history
│   ├── warehouses/        # Warehouse management
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── products/         # Product-specific components
├── lib/                   # Utilities and helpers
│   ├── api/              # API helper functions
│   ├── supabase/         # Supabase clients
│   └── types/            # TypeScript types
├── scripts/               # Database scripts
└── public/                # Static assets
```

## 📝 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Dashboard
- `GET /api/dashboard` - Get dashboard KPIs and stats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙋‍♂️ Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Supabase**
