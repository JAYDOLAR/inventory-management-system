# 🚀 Nexus IMS v2.0 – StockMaster 

A modern, enterprise-grade Inventory Management System (IMS) designed to fully satisfy the **StockMaster Problem Statement**.

This system, built with Next.js 14, Supabase, and Tailwind CSS, digitizes and streamlines all stock operations—receipts, deliveries, transfers, adjustments, stock visibility, analytics, and warehouse management.

---

## 📌 1. Overview

[cite_start]Modern businesses often rely on manual registers and scattered spreadsheets [cite: 5] to track stock. Nexus IMS v2.0 replaces this with a centralized, real-time, secure, and intuitive platform that handles all core inventory flows:

* [cite_start]**Product registration** 
* [cite_start]**Stock receipts** (incoming goods) [cite: 35]
* [cite_start]**Delivery orders** (outgoing goods) [cite: 36]
* [cite_start]**Internal warehouse transfers** [cite: 70]
* [cite_start]**Physical inventory adjustments** [cite: 37]
* [cite_start]**Stock movement ledger** [cite: 76, 103]
* [cite_start]**Dashboard analytics** [cite: 16]
* [cite_start]**Multi-warehouse operations** [cite: 87]

[cite_start]This implementation fulfills 100% of the StockMaster requirements, providing a robust solution for Inventory Managers [cite: 9] [cite_start]and Warehouse Staff[cite: 10].

---

## ⭐ 2. Key Highlights of v2.0

### 🎨 Modern UI/UX
* Complete glassmorphism design.
* Polished Indigo/Zinc theme.
* Lightning-fast UI with smooth transitions and full mobile responsiveness.
* **🌗 Dark/Light Mode:** Fully synchronized theme support across all pages.

### 📊 Analytics-Driven Dashboard
[cite_start]A real-time operational snapshot [cite: 16] [cite_start]with critical Key Performance Indicators (KPIs)[cite: 17]:

* [cite_start]Total products in stock [cite: 18]
* [cite_start]Low/out-of-stock items [cite: 19]
* [cite_start]Pending receipts [cite: 20]
* [cite_start]Pending deliveries [cite: 21]
* [cite_start]Scheduled internal transfers [cite: 22]
* Warehouse capacity usage
* Stock movement trends (14-day graph)

### 🧩 Modular IMS Architecture
[cite_start]Each operation type (receipt, delivery, transfer, adjustment) is a separate module with its own flow, status, validation, and audit trail[cite: 24, 25].

---

## 🎯 3. Problem Statement Mapping

The system is built to directly address the specified StockMaster requirements:

| Requirement | Feature Implemented | Source |
| :--- | :--- | :--- |
| **Target Users** | [cite_start]Inventory Managers, Warehouse Staff | [cite: 9, 10] |
| **Authentication** | [cite_start]Supabase Auth, Secure signup/login, OTP-based password reset | [cite: 12, 13] |
| **Dashboard KPIs** | [cite_start]Total stock, Low stock alerts, Pending documents | [cite: 18, 19, 20, 21, 22] |
| **Dynamic Filters** | [cite_start]By Document Type, Status, Warehouse/location, Product category, SKU search | [cite: 24, 25, 26, 88] |
| **Navigation** | [cite_start]Dashboard, Products, Operations (Receipts, Deliveries, Transfers, Adjustments), Move History, Warehouses, Profile Menu | [cite: 27, 28, 34, 39, 41, 42] |
| **Multi-Warehouse** | [cite_start]Dedicated location and warehouse management module | [cite: 87] |

### Core Inventory Flows

1.  [cite_start]**Product Management** [cite: 45]
    * [cite_start]Create/update products with SKU, name, category, UoM[cite: 46, 47, 48, 49, 50].
    * [cite_start]Set initial stock [cite: 52] [cite_start]and low stock thresholds[cite: 86].
    * [cite_start]Multi-warehouse stock visibility[cite: 31].
2.  [cite_start]**Goods Receipt (Incoming Stock)** [cite: 53]
    * [cite_start]Flow: Supplier → Add products → Enter quantities → **Validate** → Stock increases automatically[cite: 55, 56, 57, 58, 59].
3.  [cite_start]**Delivery Orders (Outgoing Stock)** [cite: 62]
    * [cite_start]Flow: **Pick** → **Pack** → **Validate** → Stock decreases automatically[cite: 65, 66, 67].
    * Real-time stock validation prevents negative stock.
4.  [cite_start]**Internal Transfers** [cite: 70]
    * [cite_start]Move stock between locations (e.g., Main Store → Production Floor)[cite: 73, 75].
    * [cite_start]Ensures stock stays the same overall, but location distribution updates.
5.  [cite_start]**Stock Adjustments (Physical Count)** [cite: 77]
    * [cite_start]Fixes mismatches between physical count and system-recorded stock[cite: 78, 79, 80].
    * [cite_start]Flow: Select product/location → Enter counted quantity → System updates difference → Adjustment logged[cite: 82, 83, 84].
6.  [cite_start]**Move History (Stock Ledger)** [cite: 38, 103]
    * [cite_start]Every transaction—receipt, delivery, transfer, adjustment—is permanently logged  with a timestamp, operation type, quantity, source/destination, and User ID.

---

## 🛠️ 5. Tech Stack

| Layer | Technology | Framework |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | Language: TypeScript |
| **Backend/DB** | Supabase (PostgreSQL) | Auth: Supabase Auth |
| **UI/Styling** | Tailwind CSS + shadcn/ui | Charts: Recharts |
| **Icons** | Lucide React | |

---

## ⚙️ 6. Installation & Setup

### 1. Clone Repository

```bash
git clone [https://github.com/JAYDOLAR/inventory-management-system.git](https://github.com/JAYDOLAR/inventory-management-system.git)
cd inventory-management-system
```
### 2. Install Dependencies

```bash
npm install
```

### 3\. Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4\. Setup Database

Run all provided SQL scripts against your Supabase instance:

```
scripts/setup_database.sql
scripts/atomic_inventory_functions.sql
```

### 5\. Start Development

Bash

```
npm run dev
```

Open: `http://localhost:3000`

## 🗄️ 7. Database Schema Highlights

The schema is designed for speed and accuracy, aligned with the StockMaster requirements:

**Table**

**Key Fields & Purpose**

`products`

SKU, name, category, UoM, Minimum stock level.

`warehouses`

Stores, return centers, and capacity fields.

`inventory_levels`

Per-product per-warehouse quantities with bin location support.

`stock_moves`

Unified audit ledger. Tracks move type (receipt, delivery, transfer, adjustment), quantity, source, and destination.

## 🧭 8. Usage Guide (System Flow)

**Action**

**Navigation Path**

**Result**

Add Products

Inventory → Add Product

Product registered

Receive Goods

Operations → Receipts → Validate

Stock increases

Deliver Orders

Operations → Deliveries → Validate

Stock decreases

Transfer Stock

Operations → Transfers

Location changes, total stock same

Adjust Physical Count

Operations → Adjustments

System updates difference, adjustment logged

View Movement Log

Move History

View every transaction

## 🔒 9. Security

-   Row Level Security (RLS) is enabled on all critical tables.
    
-   All operations are authenticated and authorized based on user roles.
    
-   Atomic PostgreSQL functions are used to prevent inconsistent stock levels.
    
-   Movement audit logs track every change and the user responsible.
    

## 📄 10. License

This project is licensed under the MIT License. See the `LICENSE` file for details.

### 🙋 Support

For any issues or feature requests, please open a GitHub issue.
