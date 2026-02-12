# SL Hardware POS System - Complete Project Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Models & Schema](#database-models--schema)
5. [Feature Documentation](#feature-documentation)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Authentication & Security](#authentication--security)
8. [Data Flow & System Integration](#data-flow--system-integration)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Missing Features & Recommendations](#missing-features--recommendations)

---

## Executive Summary

**SL Hardware POS** is a comprehensive Point of Sale (POS) system specifically designed for hardware shops in Sri Lanka. The system provides complete inventory management, billing, customer & supplier management, reporting, and multi-user support with role-based access control.

### Key Highlights

- **Target Market**: Hardware stores in Sri Lanka
- **Architecture**: Full-stack web application (MERN stack)
- **Deployment**: Separate frontend and backend deployments
- **Multi-tenancy**: Tenant-based data isolation
- **VAT Compliance**: Sri Lankan tax invoice generation with VAT support
- **Offline Support**: POS can operate with offline mode detection
- **Multi-format Invoices**: A4 tax invoices & 80mm thermal receipts
- **Batch Tracking**: Support for batch-tracked inventory items

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  (React SPA - Vite, TailwindCSS, React Router)                  │
│  • Authentication UI                                             │
│  • Dashboard & Analytics                                         │
│  • POS Interface                                                 │
│  • Inventory Management                                          │
│  • Customer & Supplier Management                                │
│  • Reports & Exports                                             │
│  • Settings & User Management                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/REST API
┌────────────────────────▼────────────────────────────────────────┐
│                      API LAYER (Express.js)                      │
│  • JWT Authentication (Access + Refresh Tokens)                  │
│  • Role-based Authorization Middleware                           │
│  • Request Validation & Sanitization                             │
│  • Cache Control Headers                                         │
│  • Rate Limiting                                                 │
│  • Error Handling & Logging                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB)                      │
│  Collections:                                                    │
│  • users, refreshtokens                                          │
│  • items, stockmovements, grns                                   │
│  • sales, purchases, creditpayments                              │
│  • customers, suppliers                                          │
│  • expenses, settings                                            │
│  • otps                                                          │
└─────────────────────────────────────────────────────────────────┘
```

### System Components

#### Frontend (React)

- **Location**: `/frontend`
- **Entry Point**: `src/main.jsx`
- **Routing**: React Router v6 with nested routes
- **State Management**: React hooks (useState, useEffect, useCallback, useMemo)
- **API Client**: Axios with interceptors for auth token refresh
- **UI Framework**: TailwindCSS 4.x
- **Icons**: Heroicons, Lucide React
- **Notifications**: React Hot Toast (centralized toast system)

#### Backend (Node.js)

- **Location**: `/backend`
- **Entry Point**: `src/server.js`
- **Framework**: Express v5
- **Database**: MongoDB via Mongoose
- **Authentication**: JWT (access tokens + refresh tokens in httpOnly cookies)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston logger
- **Validation**: Express Validator

#### Database (MongoDB)

- **Type**: NoSQL Document Database
- **Multi-tenancy**: All collections include `tenantId` field
- **Indexes**: Optimized compound indexes for multi-tenant queries
- **Decimal Handling**: Mongoose Decimal128 for precise monetary values

---

## Technology Stack

### Frontend Technologies

| Technology       | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| React            | 18.3.1  | UI framework            |
| React Router DOM | 6.28.0  | Client-side routing     |
| Vite             | 7.2.4   | Build tool & dev server |
| TailwindCSS      | 4.1.18  | Styling framework       |
| Axios            | 1.13.2  | HTTP client             |
| React Hot Toast  | 2.6.0   | Toast notifications     |
| Framer Motion    | 12.29.2 | Animations              |
| Headless UI      | 2.2.9   | Unstyled UI components  |
| Heroicons        | 2.2.0   | Icon set                |
| Lucide React     | 0.563.0 | Additional icons        |
| React Barcode    | 1.6.1   | Barcode generation      |

### Backend Technologies

| Technology         | Version      | Purpose                         |
| ------------------ | ------------ | ------------------------------- |
| Node.js            | (Latest LTS) | Runtime environment             |
| Express            | 5.2.1        | Web framework                   |
| Mongoose           | 9.0.1        | MongoDB ODM                     |
| bcryptjs           | 3.0.3        | Password hashing                |
| jsonwebtoken       | 9.0.3        | JWT token generation            |
| cookie-parser      | 1.4.7        | Cookie parsing                  |
| dotenv             | 17.2.3       | Environment variables           |
| helmet             | 8.1.0        | Security headers                |
| cors               | 2.8.5        | CORS handling                   |
| express-rate-limit | 7.1.5        | Rate limiting                   |
| express-validator  | 7.0.4        | Request validation              |
| winston            | 3.11.0       | Logging                         |
| morgan             | 1.10.1       | HTTP request logging            |
| axios              | 1.13.3       | HTTP client (for external APIs) |

### Development Tools

- **Nodemon**: Auto-restart backend on file changes
- **ESLint**: Code linting for frontend
- **VS Code**: Primary IDE

---

## Database Models & Schema

### 1. User Model (`users` collection)

**Purpose**: Stores all system users (owners, admins, managers, cashiers)

**Schema**:

```javascript
{
  _id: ObjectId,
  name: String (required) // Full name
  username: String (required, unique, indexed) // Login username
  password: String (required, hashed with bcrypt, not returned by default)
  phone: String (unique, optional) // Phone number for SMS OTP
  tenantId: String (required, indexed) // Multi-tenant identifier
  role: String (enum: ["admin", "owner", "cashier", "manager"], default: "cashier")
  permissions: [String] // Array of feature IDs user can access
  isActive: Boolean (default: true) // Account status
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `username`: Unique index
- `tenantId + isActive`: Compound index
- `tenantId + role + isActive`: Compound index

**Key Behaviors**:

- Password is automatically hashed before saving
- On password change, all refresh tokens are revoked
- Default permissions are assigned based on role

---

### 2. RefreshToken Model (`refreshtokens` collection)

**Purpose**: Stores hashed refresh tokens for JWT authentication

**Schema**:

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: "User", required, indexed)
  tokenHash: String (required) // bcrypt hash of refresh token
  expiresAt: Date (required, indexed)
  revoked: Boolean (default: false, indexed)
  revokedAt: Date
  createdAt: Date (auto)
}
```

**Key Behaviors**:

- Auto-deletes expired tokens via TTL index
- Revoked on user password change
- Used for rotating token authentication

---

### 3. Item Model (`items` collection)

**Purpose**: Product/inventory master data

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)
  sku: String (required, indexed, uppercase) // Stock Keeping Unit
  name: String (required, indexed) // Product name
  barcode: String (indexed, sparse, optional) // Barcode for scanning
  category: String (indexed, optional) // Product category
  brand: String (optional)
  description: String (optional)

  baseUnit: String (required) // e.g., "pcs", "kg", "ltr", "box"

  // Pricing (Decimal128 for precision)
  sellingPrice: Decimal128 (required) // Retail price
  costPrice: Decimal128 (required) // Purchase/cost price
  lastPurchasePrice: Decimal128 (optional) // Last purchase cost

  // Stock tracking mode
  isBatchTracked: Boolean (default: false, indexed)
  isSerialTracked: Boolean (default: false)

  // Stock levels (only when NOT batch tracked)
  inventory: {
    onHand: Number (default: 0, min: 0) // Available stock
    reserved: Number (default: 0, min: 0) // Reserved for orders
  }

  // Batch tracking (only when isBatchTracked = true)
  batches: [{
    batchNumber: String (required, indexed)
    qtyOnHand: Number (default: 0, min: 0)
    reserved: Number (default: 0, min: 0)
    expiryDate: Date (optional)
    costPrice: Decimal128 (optional) // Batch-specific cost
    sellingPrice: Decimal128 (optional) // Batch-specific price
  }]

  // Stock alerts
  lowStockLevel: Number (default: 10, min: 0)

  // Tax settings
  taxApplicable: Boolean (default: true)
  taxRate: Number (default: 0, min: 0, max: 1)
  taxCode: String (optional)

  // Supplier info
  defaultSupplier: ObjectId (ref: "Supplier", optional)

  isActive: Boolean (default: true, indexed)

  createdBy: ObjectId (ref: "User", optional)
  updatedBy: ObjectId (ref: "User", optional)

  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId + sku`: Unique compound index
- `tenantId + name`: Text search index
- `tenantId + category`: Filter by category
- `tenantId + barcode`: Barcode lookup (sparse)
- `tenantId + isBatchTracked`: Batch mode filtering
- `tenantId + isActive + lowStockLevel`: Low stock alerts

**Key Behaviors**:

- Virtual field `totalStock` computes total from batches if batch-tracked
- Batch tracking is optional per item
- Prices stored as Decimal128, returned as numbers in JSON

---

### 4. StockMovement Model (`stockmovements` collection)

**Purpose**: Audit trail for all inventory changes

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)
  item: ObjectId (ref: "Item", required, indexed)

  type: String (enum: ["sale", "purchase", "adjustment", "opening", "grn", "grn_cancel"], required, indexed)

  qty: Number (required, min: 0.000001) // Quantity moved
  direction: String (enum: ["in", "out"], required) // Stock direction

  referenceId: ObjectId (indexed, optional) // ID of Sale/Purchase/GRN
  referenceNumber: String (optional) // Bill/GRN number

  batchNumber: String (optional) // For batch-tracked items

  note: String (optional)
  createdBy: ObjectId (ref: "User", optional)

  createdAt: Date (auto, indexed)
}
```

**Indexes**:

- `tenantId + item + createdAt`: Item history
- `tenantId + type + createdAt`: Movement type reports
- `tenantId + referenceId + type`: Reference lookup

**Key Behaviors**:

- Created automatically on sales, purchases, GRN posting
- Immutable after creation (audit trail)
- Direction "in" increases stock, "out" decreases

---

### 5. GRN Model (`grns` collection - Goods Receipt Note)

**Purpose**: Record incoming stock from suppliers (draft → post workflow)

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)
  grnNo: String (required, indexed) // e.g., "GRN-2024-001"

  supplier: ObjectId (ref: "Supplier", required, indexed)
  grnDate: Date (default: now, indexed)

  status: String (enum: ["draft", "posted", "cancelled"], default: "draft", indexed)
  postedAt: Date (optional)
  cancelledAt: Date (optional)

  lines: [{
    item: ObjectId (ref: "Item", required)
    batchNumber: String (optional) // Required for batch-tracked items
    qty: Number (required, min: 0.000001)
    unitCost: Decimal128 (required)
    lineTotal: Decimal128 (computed)
  }] (required, min length: 1)

  totalQty: Number (default: 0, computed)
  grandTotal: Decimal128 (default: 0, computed)

  remarks: String (optional)

  createdBy: ObjectId (ref: "User", optional)
  updatedBy: ObjectId (ref: "User", optional)

  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId + grnNo`: Unique compound
- `tenantId + supplier + grnDate`: Supplier history
- `tenantId + status + grnDate`: Status filtering
- `tenantId + createdAt`: Recent GRNs

**Key Behaviors**:

- Draft GRNs can be edited/deleted
- Posting a GRN:
  - Updates item inventory (batch or regular)
  - Creates StockMovement records
  - Sets status to "posted" (immutable)
- Cancelling a GRN reverses stock movements

---

### 6. Sale Model (`sales` collection)

**Purpose**: Records all sales transactions (invoices)

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)
  billNumber: String (required, indexed) // e.g., "INV-2024-0001"

  customer: ObjectId (ref: "Customer", optional) // Null for walk-in

  items: [{
    item: ObjectId (ref: "Item", required)
    description: String (optional)
    qty: Number (required)
    unit: String (required)
    batchNumber: String (optional)
    unitPrice: Decimal128 (required) // Price per unit
    discount: Decimal128 (default: 0)
    taxAmount: Decimal128 (default: 0) // VAT amount
    lineTotal: Decimal128 (required) // Final line total
  }]

  subTotal: Decimal128 (required) // Sum of line totals before tax
  discountTotal: Decimal128 (default: 0)
  taxTotal: Decimal128 (default: 0) // Total VAT
  grandTotal: Decimal128 (required) // Final payable

  payments: [{
    method: String (enum: ["cash", "card", "bank", "credit", "mixed"], required)
    amount: Decimal128 (required)
    reference: String (optional) // Transaction ref
  }]

  balanceDue: Decimal128 (default: 0) // Remaining credit balance

  isTaxInvoice: Boolean (default: false) // Official VAT invoice
  status: String (enum: ["paid", "partial", "unpaid"], default: "paid")

  note: String (optional)

  createdBy: ObjectId (ref: "User", optional)

  createdAt: Date (auto, indexed)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId + billNumber`: Unique compound
- `tenantId + customer + createdAt`: Customer sales history
- `tenantId + status + createdAt`: Payment status filtering
- `tenantId + createdAt`: Recent sales

**Key Behaviors**:

- Automatically decrements item stock on save
- Creates StockMovement records
- Updates customer balance if credit sale
- Cannot be edited after creation (audit compliance)

---

### 7. Purchase Model (`purchases` collection)

**Purpose**: Records stock purchases from suppliers (old system, partially replaced by GRN)

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)

  supplier: ObjectId (ref: "Supplier", required, indexed)
  billNumber: String (required) // Supplier's invoice number
  billDate: Date (required)

  items: [{
    item: ObjectId (ref: "Item", required)
    qty: Number (required)
    unit: String (required)
    costPrice: Decimal128 (required)
    lineTotal: Decimal128 (required)
    batchNumber: String (optional)
    expiryDate: Date (optional)
  }]

  note: String (optional)

  subTotal: Decimal128 (required)
  taxTotal: Decimal128 (default: 0)
  grandTotal: Decimal128 (required)

  amountPaid: Decimal128 (default: 0)
  balanceDue: Decimal128 (default: 0)
  status: String (enum: ["paid", "partial", "unpaid"], default: "unpaid")

  createdBy: ObjectId (ref: "User", optional)
  updatedBy: ObjectId (ref: "User", optional)

  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId + billNumber`: Unique compound
- `tenantId + supplier + createdAt`: Supplier purchase history

**Key Behaviors**:

- Direct stock update on creation
- Updates supplier balance
- Partially deprecated in favor of GRN workflow

---

### 8. Customer Model (`customers` collection)

**Purpose**: Customer master data with credit tracking

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)

  name: String (required, indexed)
  phone: String (indexed, optional)
  address: String (optional)
  nic: String (optional) // National ID

  type: String (enum: ["cash", "credit", "both"], default: "both")

  creditLimit: Decimal128 (default: 0) // Maximum credit allowed
  currentBalance: Decimal128 (default: 0) // Outstanding balance

  notes: String (optional)

  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId + name`: Text search
- `tenantId + phone`: Phone lookup
- `tenantId + type + createdAt`: Filter by type
- Full-text search on name, phone, address

**Key Behaviors**:

- Balance increases on credit sales
- Balance decreases on payment receipt
- Credit limit enforced at POS

---

### 9. Supplier Model (`suppliers` collection)

**Purpose**: Supplier master data with payment terms

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)

  supplierCode: String (indexed, optional)
  name: String (required, indexed)

  contactPerson: String (optional)
  phones: [String] (array of phone numbers)
  email: String (optional)
  address: String (optional)

  openingBalance: Decimal128 (default: 0) // Initial balance owed
  currentBalance: Decimal128 (default: 0) // Current balance owed
  creditLimit: Decimal128 (optional)

  paymentTerms: {
    type: String (enum: ["CASH", "COD", "ADVANCE", "NET"], default: "CASH")
    days: Number (default: 0, min: 0) // NET days
  }

  notes: String (optional)
  status: String (enum: ["active", "inactive"], default: "active")

  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId + supplierCode`: Unique compound
- `tenantId + name`: Name lookup
- `tenantId + status + createdAt`: Active suppliers
- Full-text search on name, email, contactPerson

**Key Behaviors**:

- Balance updated on purchases and payments
- Used for GRN and Purchase records

---

### 10. Expense Model (`expenses` collection)

**Purpose**: Business expense tracking

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)

  category: String (required) // e.g., "Rent", "Salaries", "Utilities"
  description: String (optional)
  amount: Decimal128 (required)
  date: Date (required, indexed)

  createdBy: ObjectId (ref: "User", optional)
  updatedBy: ObjectId (ref: "User", optional)

  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId + category + date`: Category-wise filtering
- `tenantId + date`: Date range queries
- `tenantId + createdBy + date`: User expense tracking

---

### 11. CreditPayment Model (`creditpayments` collection)

**Purpose**: Records customer credit payments

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, indexed)

  customer: ObjectId (ref: "Customer", required, indexed)
  amount: Decimal128 (required)
  method: String (enum: ["cash", "card", "bank"], required)
  reference: String (optional) // Slip number, transaction ID
  note: String (optional)

  appliedInvoices: [ObjectId] (ref: "Sale", optional) // Which invoices paid

  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId + customer + createdAt`: Customer payment history
- `tenantId + method + createdAt`: Payment method reports
- `appliedInvoices`: Invoice settlement tracking

**Key Behaviors**:

- Automatically reduces customer balance
- Can be linked to specific invoices

---

### 12. Settings Model (`settings` collection)

**Purpose**: Shop configuration (single document per tenant)

**Schema**:

```javascript
{
  _id: ObjectId,
  tenantId: String (required, unique indexed)

  // Shop details (for invoices)
  shopName: String (default: "Your Hardware Shop Name")
  shopAddress: String (default: "No. 123, Main Street, Colombo 10, Sri Lanka")
  shopPhone: String (default: "011-2345678")
  shopWhatsapp: String (default: "07X-XXXXXXX")
  vatRegNo: String (default: "123456789-7000") // VAT registration number

  // Tax configuration
  vatRate: Number (default: 0.15) // 15%

  // Currency settings
  currency: String (default: "LKR") // ISO currency code
  currencySymbol: String (default: "Rs.")
  currencyPosition: String (enum: ["before", "after"], default: "before")

  // Expense categories
  expenseCategories: [String] (default: ["Rent", "Salaries", "Transport", ...])

  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `tenantId`: Unique index (one document per tenant)

**Key Behaviors**:

- Created automatically on owner signup
- Used by POS for VAT calculation
- Used by invoice printing

---

### 13. Otp Model (`otps` collection)

**Purpose**: SMS OTP for password reset

**Schema**:

```javascript
{
  _id: ObjectId,
  phone: String (required, indexed) // E.164 format
  otp: String (required, hashed)
  expiresAt: Date (required, indexed, TTL)
  verified: Boolean (default: false)
  createdAt: Date (auto)
}
```

**Indexes**:

- `phone + expiresAt`: Lookup active OTPs
- `expiresAt`: TTL index for auto-delete

**Key Behaviors**:

- Auto-deleted after expiry
- Used for password reset flow

---

## Feature Documentation

### 1. Authentication System

#### 1.1 Owner Signup

**Purpose**: Register the first user (owner) and create a new tenant

**Page**: `OwnerSignupPage.jsx`

**Form Fields**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Full Name | Text | Required, min 2 chars, must contain 2+ words (letters only) | Owner's full name |
| Username | Text | Required, 4-20 chars, starts with letter, alphanumeric+underscore | Login username |
| Phone | Text | Required, 9 digits starting with 7 (no +94) | Mobile number for SMS OTP |
| Password | Password | Required, min 8 chars, uppercase, lowercase, number, special char | Account password |
| Confirm Password | Password | Required, must match password | Password confirmation |

**Flow**:

1. User fills signup form
2. Frontend validates all fields
3. POST `/api/auth/owner-signup` with payload
4. Backend creates:
   - New tenant ID (UUID)
   - Owner user with role "owner"
   - Default Settings document
5. Returns access token + refresh token (httpOnly cookie)
6. User redirected to dashboard

**API Endpoint**: `POST /api/auth/owner-signup`

**Security**:

- Rate limited (5 requests per 15 minutes per IP)
- Password hashed with bcrypt (10 rounds)
- Phone number stored in E.164 format

---

#### 1.2 User Login

**Purpose**: Authenticate existing users

**Page**: `LoginPage.jsx`

**Form Fields**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Username | Text | Required | Login username |
| Password | Password | Required | Account password |

**Flow**:

1. User enters credentials
2. POST `/api/auth/login`
3. Backend validates username/password
4. Returns:
   - Access token (15 min expiry) in JSON response
   - Refresh token (7 days expiry) in httpOnly cookie
5. User data stored in React state
6. Redirect to dashboard

**API Endpoint**: `POST /api/auth/login`

**Security**:

- Rate limited (10 requests per 15 minutes per IP)
- Failed login attempts logged
- Refresh token rotated on each use

---

#### 1.3 Token Refresh

**Purpose**: Silently refresh expired access tokens

**Flow**:

1. Frontend detects expired access token (401 response)
2. Axios interceptor automatically calls `POST /api/auth/refresh-token`
3. Backend validates refresh token cookie
4. Returns new access token
5. Original request retried with new token

**API Endpoint**: `POST /api/auth/refresh-token`

**Key Behaviors**:

- Happens transparently to user
- Refresh token cookie must be present
- Old refresh token is revoked
- New refresh token issued

---

#### 1.4 Logout

**Purpose**: End user session

**Flow**:

1. User clicks logout
2. POST `/api/auth/logout`
3. Backend clears refresh token cookie
4. Frontend clears user state
5. Redirect to login page

**API Endpoint**: `POST /api/auth/logout`

---

#### 1.5 Password Reset Flow

**Purpose**: Reset forgotten password via SMS OTP

**Pages**: `ForgotPassword.jsx`, `ResetPassword.jsx`

**Step 1: Request OTP**

- User enters phone number
- POST `/api/otp/send`
- Backend generates 6-digit OTP
- SMS sent via NotifySMS service
- OTP valid for 10 minutes

**Step 2: Verify OTP & Reset**

- User enters OTP + new password
- POST `/api/otp/verify-and-reset`
- Backend verifies OTP
- Updates user password
- All refresh tokens revoked
- User redirected to login

**API Endpoints**:

- `POST /api/otp/send`
- `POST /api/otp/verify-and-reset`

---

### 2. Dashboard

**Purpose**: Overview of business metrics and quick actions

**Page**: `DashboardPage.jsx`

**Metrics Displayed**:

1. **Today's Sales**
   - Total amount
   - Number of transactions
   - Average ticket size

2. **Profit Overview**
   - Gross profit
   - Net profit (after expenses)
   - Profit margin %

3. **Low Stock Alerts**
   - Count of items below threshold
   - Quick link to inventory

4. **Today's Expenses**
   - Total expense amount
   - Breakdown by category

5. **Recent Transactions**
   - Last 10 sales
   - Quick view of invoice details

**Data Sources**:

- `GET /api/dashboard/daily-sales` - Sales overview
- `GET /api/dashboard/profit-metrics` - Profit calculations
- `GET /api/dashboard/expenses-summary` - Expense totals
- `GET /api/sales?limit=10` - Recent sales

**Refresh Interval**: Manual (button click) or on page load

---

### 3. POS (Point of Sale)

**Purpose**: Create sales transactions, print invoices

**Page**: `POSPage.jsx`

**Screen Sections**:

#### 3.1 POS Header

- Current date/time
- Selected customer display
- VAT rate indicator

#### 3.2 Product Search Section

**Fields**:
| Field | Purpose | Behavior |
|-------|---------|----------|
| Search Bar | Find products | Searches by name, SKU, barcode, brand, category (debounced 300ms) |
| Category Filter | Filter by category | Dropdown of all categories |
| Barcode Input | Quick add by scan | Auto-adds item on Enter |

**Search Results**:

- Dropdown with top 50 matches
- Shows: Name, SKU, Price, Stock
- Click to add to cart

#### 3.3 Items Section (Cart)

**Line Item Fields**:
| Field | Type | Purpose | Validation |
|-------|------|---------|-----------|
| Item | Select | Product selection | Required, must be active item |
| Description | Text | Override display name | Optional |
| Qty | Number | Quantity to sell | Required, > 0, cannot exceed stock |
| Unit | Display | Unit of measure | From item master |
| Unit Price | Currency | Selling price | Required, > 0, can be edited |
| Discount | Currency | Per-line discount | >= 0 |
| Tax Amount | Currency | VAT amount (auto-calc) | Auto-calculated if tax invoice |
| Line Total | Currency | Final line amount | Auto-calculated |

**Actions**:

- Add new line
- Remove line
- Clear all lines

**Calculations**:

```
Line Total = (Qty × Unit Price) - Discount + Tax Amount
Tax Amount = (Qty × Unit Price - Discount) × VAT Rate (if tax invoice)
```

#### 3.4 Customer Section

**Fields**:
| Field | Type | Purpose |
|-------|------|---------|
| Customer Search | Autocomplete | Select existing customer |
| Add New Customer | Button | Open customer creation modal |

**Customer Modal Fields**:
| Field | Validation | Purpose |
|-------|-----------|---------|
| Name | Required, min 2 chars | Customer name |
| Phone | Optional, 9 digits | Contact number |
| Address | Optional | Billing address |
| NIC | Optional | National ID |
| Type | Enum: cash/credit/both | Payment type |
| Credit Limit | Number >= 0 | Maximum credit |

#### 3.5 Summary Section

**Displays**:

- Sub Total: Sum of all line totals (before discount & tax)
- Discount Total: Sum of all line discounts
- Tax Total: Sum of all line VAT amounts
- Grand Total: Final payable amount

**Controls**:

- Tax Invoice Toggle: Enable/disable VAT calculation
- Discount Total Input: Additional overall discount

#### 3.6 Payments Section

**Payment Line Fields**:
| Field | Type | Options | Validation |
|-------|------|---------|-----------|
| Method | Select | Cash, Card, Bank, Credit, Mixed | Required |
| Amount | Currency | - | Required, > 0 |
| Reference | Text | - | Optional |

**Calculations**:

- Total Paid: Sum of all payment amounts
- Balance Due: Grand Total - Total Paid
- Change: Total Paid - Grand Total (if cash payment)

**Multi-payment Support**: Can add multiple payment methods

#### 3.7 Actions Section

**Buttons**:

- **Save & Print**: Submit sale, open thermal invoice in new tab
- **Clear**: Reset entire form
- **Hold**: (Future feature - save draft)

**Save Flow**:

1. Validate all lines (qty, price, stock)
2. Validate payments (total paid >= grand total for paid sales)
3. Check customer credit limit (if credit)
4. POST `/api/sales` with payload
5. Backend:
   - Decrements item stock
   - Creates StockMovement records
   - Updates customer balance (if credit)
   - Generates unique bill number
6. Returns sale ID
7. Open `/invoice/thermal/:id` in new tab
8. Clear form

**Data Validation**:

- At least one line item required
- All line items must have valid item, qty, price
- Total paid must equal/exceed grand total (unless credit payment)
- Stock availability check per line

**API Endpoints**:

- `GET /api/items?active=true` - Load products
- `GET /api/items/categories/list` - Load categories
- `GET /api/items/search-barcode?code=XXX` - Barcode lookup
- `GET /api/customers` - Load customers
- `POST /api/customers` - Create new customer
- `GET /api/settings` - Load VAT rate, currency
- `POST /api/sales` - Create sale

**Offline Support**:

- Detects network status
- Can save sales to localStorage (future enhancement)

---

### 4. Inventory Management

**Purpose**: Manage product catalog, stock levels, pricing

**Page**: `InventoryPage.jsx`

#### 4.1 Inventory Header

**Actions**:

- **Add New Item**: Open product form modal
- **Low Stock Filter**: Toggle to show only items below threshold
- **Total Items Count**: Display total active items

#### 4.2 Search & Filters

**Search Bar**:

- Searches: Name, SKU, Barcode, Category, Stock level
- Debounced 300ms
- Case-insensitive

**Filters**:
| Filter | Options | Purpose |
|--------|---------|---------|
| Category | All categories | Filter by product category |
| Low Stock Only | Toggle | Show items below low stock level |

#### 4.3 Inventory Table (Desktop)

**Columns**:
| Column | Display | Sortable | Actions |
|--------|---------|----------|---------|
| SKU | Item SKU code | No | - |
| Name | Product name | No | Click for details |
| Category | Category name | No | - |
| Barcode | Barcode number | No | - |
| Unit | Base unit | No | - |
| Stock | Current quantity | No | Color-coded (red if low) |
| Cost | Cost price | No | Formatted with currency |
| Price | Selling price | No | Formatted with currency |
| Status | Active/Inactive badge | No | - |
| Actions | Buttons | No | View, Edit, Print Barcode, Activate/Deactivate, Delete |

#### 4.4 Inventory Cards (Mobile/Tablet)

- Responsive card layout
- Shows key info: Name, SKU, Stock, Price
- Quick action buttons

#### 4.5 Add/Edit Item Form Modal

**Purpose**: Create or update product master data

**Form Tabs**:

**Tab 1: Basic Info**
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| SKU | Text | Required, auto-uppercase, unique | Stock Keeping Unit code |
| Name | Text | Required, min 2 chars | Product name |
| Barcode | Text | Optional, unique | Scannable barcode |
| Category | Select/Create | Required | Product category |
| Brand | Text | Optional | Brand name |
| Description | Textarea | Optional | Detailed description |
| Base Unit | Select/Create | Required | Unit of measure (pcs, kg, ltr, box, pkt) |

**Tab 2: Pricing**
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Cost Price | Currency | Required, >= 0 | Purchase cost per unit |
| Selling Price | Currency | Required, > 0 | Retail price per unit |

**Tab 3: Stock Tracking**
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Enable Batch Tracking | Checkbox | - | Track by batch numbers |
| Current Stock | Number | Required, >= 0 | Current quantity on hand (only if NOT batch-tracked) |
| Low Stock Level | Number | >= 0 | Alert threshold |

**Tab 4: Tax Settings**
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| VAT Applicable | Checkbox | Default: true | Item subject to VAT |
| Tax Rate | Number | 0-1 (0-100%) | VAT rate (if different from default) |

**Tab 5: Supplier Info**
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Default Supplier | Select | Optional | Preferred supplier |

**Save Flow**:

1. Validate all required fields
2. Check uniqueness (SKU, barcode)
3. POST `/api/items` (create) or PUT `/api/items/:id` (update)
4. Refresh inventory list
5. Close modal
6. Show success toast

**API Endpoints**:

- `GET /api/items` - List items
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item (hard delete)
- `PATCH /api/items/:id/activate` - Activate item
- `PATCH /api/items/:id/deactivate` - Deactivate item
- `GET /api/items/categories/list` - Get categories
- `GET /api/items/units/list` - Get base units
- `GET /api/suppliers` - Get suppliers for default supplier

**Key Behaviors**:

- SKU auto-converted to uppercase
- Cannot edit SKU after creation
- Cannot delete item with transactions (recommended: deactivate instead)
- Stock changes via GRN, not item form (master data only)
- Batch-tracked items don't show stock field (managed via GRN)

#### 4.6 Item Detail Modal

**Purpose**: View complete item information

**Sections**:

- Basic Info (SKU, Name, Category, Brand)
- Pricing (Cost, Selling Price, Last Purchase Price)
- Stock Info (Current stock, reserved, available)
- Batch Info (if batch-tracked): List of batches with qty, expiry
- Tags & Categories
- Transaction History (last 10 stock movements)

**Actions**:

- Edit Item
- Print Barcode
- Close

#### 4.7 Barcode Printing

**Purpose**: Generate printable barcodes for products

**Page**: `BarcodePrintPage.jsx` (route: `/barcode/:id`)

**Display**:

- Product name
- SKU
- Barcode image (Code128 format)
- Selling price
- Print-optimized layout (58mm label size)

**Flow**:

1. Click "Print Barcode" in inventory
2. Opens `/barcode/:id` in new tab
3. Browser print dialog
4. User prints to label printer or PDF

---

### 5. Customers Management

**Purpose**: Manage customer data, track credit, receive payments

**Page**: `CustomersPage.jsx`

#### 5.1 Customer Header

**Actions**:

- **Add New Customer**: Open customer form modal

#### 5.2 Search Bar

- Searches: Name, Phone, NIC, Address
- Debounced 300ms
- Case-insensitive prefix matching

#### 5.3 Stats Bar

**Displays**:

- Total Customers: Count
- Total Credit Outstanding: Sum of all balances
- Average Credit: Mean balance

#### 5.4 Customer Table (Desktop)

**Columns**:
| Column | Display | Description |
|--------|---------|-------------|
| Name | Customer name | Full name |
| Phone | Contact number | Phone with country code formatting |
| Type | Badge | cash/credit/both |
| Credit Limit | Currency | Maximum allowed credit |
| Balance | Currency | Current outstanding (color: green if 0, red if > 0) |
| Actions | Buttons | Details, Edit, Receive Payment, Delete |

#### 5.5 Customer Cards (Mobile)

- Responsive card layout
- Shows: Name, Phone, Balance
- Quick actions

#### 5.6 Customer Form Modal

**Purpose**: Create or edit customer

**Form Fields**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Name | Text | Required, min 2 chars | Customer full name |
| Phone | Text | Optional, 9 digits starting with 7 | Contact number |
| Address | Textarea | Optional | Full address |
| NIC | Text | Optional | National Identity Card number |
| Type | Radio | Required (cash/credit/both) | Payment preference |
| Credit Limit | Currency | >= 0, required if type includes credit | Maximum credit allowed |
| Notes | Textarea | Optional | Internal notes |

**Save Flow**:

1. Validate required fields
2. POST `/api/customers` (create) or PUT `/api/customers/:id` (update)
3. Refresh customer list
4. Close modal
5. Show success toast

**API Endpoints**:

- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id/receive-payment` - Record payment

#### 5.7 Customer Details Modal

**Purpose**: View complete customer information

**Sections**:

1. **Customer Info**
   - Name, Phone, NIC
   - Address
   - Type, Credit Limit
   - Current Balance

2. **Sales History**
   - Recent invoices (last 20)
   - Invoice number, date, amount, status
   - Total sales amount

3. **Payment History**
   - Recent payments (last 20)
   - Date, amount, method, reference

4. **Outstanding Invoices**
   - Unpaid/partial invoices
   - Due amounts

**Actions**:

- Edit Customer
- Receive Payment
- Close

#### 5.8 Receive Payment Modal

**Purpose**: Record customer credit payment

**Form Fields**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Customer | Display | Read-only | Customer name & current balance |
| Amount | Currency | Required, > 0, <= balance | Payment amount |
| Method | Select | Required (cash/card/bank) | Payment method |
| Reference | Text | Optional | Slip number, transaction ref |
| Notes | Textarea | Optional | Payment notes |

**Save Flow**:

1. Validate amount <= current balance
2. POST `/api/customers/:id/receive-payment`
3. Backend:
   - Creates CreditPayment record
   - Reduces customer balance
4. Refresh customer list
5. Close modal
6. Show success toast

**API Endpoint**: `POST /api/customers/:id/receive-payment`

#### 5.9 Delete Customer

**Confirmation**: Modal dialog with customer name

**Logic**:

- Cannot delete customer with outstanding balance
- Cannot delete customer with transactions (recommended: mark inactive)
- Hard delete from database

---

### 6. Suppliers Management

**Purpose**: Manage supplier data, create GRNs, track payments

**Page**: `SuppliersPage.jsx`

#### 6.1 Supplier Header

**Actions**:

- **Add New Supplier**: Open supplier form modal

#### 6.2 Search Bar

- Searches: Name, Supplier Code, Contact Person, Phones, Address
- Debounced 300ms
- Prefix matching

#### 6.3 Supplier Table/Cards

**Desktop Table Columns**:
| Column | Display | Description |
|--------|---------|-------------|
| Code | Supplier code | Unique identifier |
| Name | Supplier name | Company name |
| Contact | Contact person | Primary contact |
| Phone | Primary phone | First in phones array |
| Payment Terms | Badge | CASH/COD/NET days |
| Balance | Currency | Amount owed to supplier |
| Status | Badge | active/inactive |
| Actions | Buttons | Details, Edit, Create GRN, Pay, View GRNs, Delete |

**Mobile Cards**: Condensed view with key fields

#### 6.4 Supplier Form Modal

**Purpose**: Create or edit supplier

**Form Sections**:

**Basic Info**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Supplier Code | Text | Optional, unique | Unique code |
| Name | Text | Required, min 2 chars | Company name |
| Contact Person | Text | Optional | Primary contact name |
| Email | Email | Optional, valid email format | Email address |
| Address | Textarea | Optional | Full address |

**Phone Numbers**:

- Add multiple phone numbers (array)
- Each phone: 9 digits starting with 7

**Payment Terms**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Payment Type | Select | Required (CASH/COD/ADVANCE/NET) | Payment terms type |
| NET Days | Number | >= 0, required if type=NET | Number of days for NET terms |

**Financial Info**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Opening Balance | Currency | >= 0 | Initial balance owed |
| Credit Limit | Currency | >= 0, optional | Maximum credit allowed |

**Other**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Notes | Textarea | Optional | Internal notes |
| Status | Select | active/inactive | Supplier status |

**Save Flow**:

1. Validate required fields
2. POST `/api/suppliers` (create) or PUT `/api/suppliers/:id` (update)
3. If creating: currentBalance = openingBalance
4. Refresh supplier list
5. Close modal
6. Show success toast

**API Endpoints**:

- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `POST /api/suppliers/:id/pay` - Record payment

#### 6.5 Supplier Details Modal

**Purpose**: View complete supplier information

**Tabs**:

**Tab 1: Details**

- Basic info, contact, payment terms
- Current balance, credit limit
- Status

**Tab 2: GRNs**

- List of all GRNs for supplier
- Filters: All, Draft, Posted, Cancelled
- Actions: View, Edit (draft only), Post, Cancel

**Tab 3: Purchases**

- Historical purchase records
- Total purchase amount
- Payment status

**Tab 4: Payments**

- Payment history
- Date, amount, method

#### 6.6 Create GRN Flow

**Purpose**: Receive goods from supplier

**Modal**: `GRNFormModal.jsx`

**Form Fields (Header)**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| GRN Number | Text | Required, unique | Auto-generated (e.g., GRN-2024-001) |
| Supplier | Display | Read-only | Selected supplier |
| GRN Date | Date | Required | Receipt date |
| Status | Display | Read-only | draft/posted/cancelled |

**Form Fields (Lines)**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Item | Select | Required | Product from inventory |
| Batch Number | Text | Required if item is batch-tracked | Batch identifier |
| Expiry Date | Date | Optional | Batch expiry (if applicable) |
| Quantity | Number | Required, > 0 | Quantity received |
| Unit Cost | Currency | Required, >= 0 | Cost per unit |
| Line Total | Currency | Auto-calculated | Qty × Unit Cost |

**Actions**:

- Add new line
- Remove line
- Save as Draft
- Post GRN

**Calculations**:

```
Line Total = Qty × Unit Cost
Total Qty = Sum of all line quantities
Grand Total = Sum of all line totals
```

**Save as Draft Flow**:

1. Validate at least one line
2. POST `/api/grns` with status "draft"
3. Save to database
4. Can edit later

**Post GRN Flow**:

1. Validate all lines (item, qty, cost)
2. If batch-tracked items: validate batch numbers present
3. POST `/api/grns/:id/post`
4. Backend:
   - Sets status to "posted", postedAt = now
   - For each line:
     - If batch-tracked: Add/update batch in item
     - If not batch-tracked: Increment item.inventory.onHand
     - Create StockMovement record (type: "grn", direction: "in")
   - Update supplier balance (increase by grandTotal)
5. GRN becomes immutable (cannot edit/delete)
6. Close modal
7. Show success toast

**Cancel GRN Flow**:

1. Only posted GRNs can be cancelled
2. PUT `/api/grns/:id/cancel`
3. Backend:
   - Sets status to "cancelled", cancelledAt = now
   - Reverses stock movements (creates matching "grn_cancel" movements)
   - Reverses supplier balance

**API Endpoints**:

- `POST /api/grns` - Create GRN (draft)
- `GET /api/grns/:id` - Get GRN details
- `PUT /api/grns/:id` - Update GRN (draft only)
- `POST /api/grns/:id/post` - Post GRN (finalize)
- `PUT /api/grns/:id/cancel` - Cancel posted GRN
- `DELETE /api/grns/:id` - Delete draft GRN
- `GET /api/suppliers/:id/grns` - List supplier GRNs

#### 6.7 GRN List Modal

**Purpose**: View all GRNs for a supplier

**Filters**:

- All
- Draft
- Posted
- Cancelled

**Table Columns**:
| Column | Display | Description |
|--------|---------|-------------|
| GRN Number | Link | Clickable to view details |
| Date | Date | GRN date |
| Status | Badge | draft/posted/cancelled |
| Total Qty | Number | Sum of quantities |
| Grand Total | Currency | Total amount |
| Actions | Buttons | View, Edit (draft), Post, Cancel, Delete (draft) |

#### 6.8 GRN Details Modal

**Purpose**: View complete GRN information

**Sections**:

1. **Header Info**
   - GRN Number, Date
   - Supplier name
   - Status, Posted/Cancelled timestamps

2. **Line Items**
   - Item name, SKU
   - Batch number (if batch-tracked)
   - Quantity, Unit Cost, Line Total

3. **Totals**
   - Total Quantities
   - Grand Total

4. **Remarks**
   - GRN notes/remarks

**Actions** (based on status):

- Draft: Edit, Post, Delete
- Posted: Cancel, Print
- Cancelled: View only

#### 6.9 Supplier Payment

**Modal**: `SupplierPayModal.jsx`

**Form Fields**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Supplier | Display | Read-only | Supplier name & current balance |
| Amount | Currency | Required, > 0, <= balance | Payment amount |
| Notes | Textarea | Optional | Payment notes |

**Save Flow**:

1. Validate amount <= current balance
2. POST `/api/suppliers/:id/pay`
3. Backend:
   - Reduces supplier currentBalance
   - Creates payment record
4. Refresh supplier list
5. Close modal
6. Show success toast

---

### 7. Purchases (Legacy Feature)

**Purpose**: Record direct purchases (older system, partially replaced by GRN)

**Page**: `PurchasesPage.jsx`

**Note**: This feature is being phased out in favor of the GRN workflow. New implementations should use GRN for stock receipt.

**Form Sections**:

**Header**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Supplier | Select | Required | Supplier selection |
| Bill Number | Text | Required | Supplier's invoice number |
| Bill Date | Date | Required | Invoice date |

**Line Items**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Item | Select | Required | Product |
| Quantity | Number | Required, > 0 | Quantity received |
| Unit Cost | Currency | Required, >= 0 | Cost per unit |
| Batch Number | Text | Optional | Batch identifier |
| Expiry Date | Date | Optional | Batch expiry |
| Line Total | Currency | Auto-calculated | Qty × Unit Cost |

**Payment**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Amount Paid | Currency | >= 0, <= grandTotal | Amount paid immediately |

**Calculations**:

```
Sub Total = Sum of line totals
Grand Total = Sub Total
Amount Paid = User input
Balance Due = Grand Total - Amount Paid
Status = Balance Due == 0 ? "paid" : Balance Due < Grand Total ? "partial" : "unpaid"
```

**Save Flow**:

1. Validate all lines
2. POST `/api/purchases`
3. Backend:
   - Creates purchase record
   - Updates item stock (direct increment)
   - Creates StockMovement records
   - Updates supplier balance (increase by balanceDue)
4. Clear form
5. Show success toast

**API Endpoint**: `POST /api/purchases`

---

### 8. Reports & Analytics

**Purpose**: View and export business data

**Page**: `ReportsPage.jsx`

#### 8.1 Date Range Selector

**Options**:

- Today
- Yesterday
- Last 7 Days
- Last 30 Days
- Custom Range (max 90 days)

**Validation**:

- Custom range cannot exceed 90 days

#### 8.2 Summary Metrics

**Displays** (for selected date range):

1. **Total Sales**
   - Amount
   - Count
   - Average per sale

2. **Total Profit**
   - Gross profit (sales - cost)
   - Net profit (gross - expenses)
   - Margin %

3. **Total Expenses**
   - Sum of all expenses
   - Count

4. **Top Selling Items**
   - Top 5 items by revenue
   - Quantity sold

#### 8.3 Daily Breakdown Table

**Columns**:
| Column | Description |
|--------|-------------|
| Date | Day in range |
| Sales | Total sales amount |
| Transactions | Number of sales |
| Expenses | Total expenses |
| Profit | Sales - Expenses |

**Features**:

- Sortable by any column
- Color-coded profit (green positive, red negative)

#### 8.4 Detailed Reports (Modals)

**Sales Report**:

- All sales in date range
- Columns: Bill #, Date, Customer, Items, Total, Payment Status
- Searchable

**Expenses Report**:

- All expenses in date range
- Columns: Date, Category, Description, Amount
- Filterable by category
- Searchable

**Inventory Report**:

- Current stock levels
- Columns: SKU, Name, Category, Stock, Value, Status
- Filterable by category
- Low stock indicator
- Searchable

#### 8.5 Export Features

**Formats**:

- CSV (Excel-compatible)
- PDF (formatted report)

**Exportable Data**:

- Summary metrics
- Daily breakdown
- Detailed sales list
- Detailed expenses list
- Inventory valuation

**Export Flow**:

1. User clicks "Export to CSV" or "Export to PDF"
2. Frontend generates file client-side (no API call)
3. Browser downloads file
4. Filename: `{reportType}_{dateRange}_{timestamp}.{ext}`

**Utilities**:

- `utils/reportExports.js` - Export functions

**API Endpoints**:

- `GET /api/dashboard/daily-sales?startDate=X&endDate=Y` - Sales data
- `GET /api/dashboard/profit-metrics?startDate=X&endDate=Y` - Profit data
- `GET /api/dashboard/expenses-summary?startDate=X&endDate=Y` - Expenses data
- `GET /api/sales?startDate=X&endDate=Y` - Detailed sales
- `GET /api/expenses?startDate=X&endDate=Y` - Detailed expenses
- `GET /api/items` - Inventory data

---

### 9. Expenses Management

**Purpose**: Track business expenses by category

**Page**: `ExpensesPage.jsx`

#### 9.1 Expenses Header

**Actions**:

- Add New Expense

#### 9.2 Expense Form

**Location**: Left sidebar (desktop) or top section (mobile)

**Form Fields**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Category | Select/Create | Required | Expense category (e.g., Rent, Salaries) |
| Description | Text | Optional | Detailed description |
| Amount | Currency | Required, > 0 | Expense amount |
| Date | Date | Required | Expense date |

**Categories**:

- Loaded from Settings.expenseCategories
- User can add new categories on-the-fly
- Common defaults: Rent, Salaries, Transport, Electricity, Water, Telephone, Maintenance, Office Supplies, Other

**Save Flow**:

1. Validate required fields
2. POST `/api/expenses` (create) or PUT `/api/expenses/:id` (update)
3. Refresh expenses list
4. Clear form
5. Show success toast

**API Endpoints**:

- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/settings` - Load expense categories
- `POST /api/settings/expense-categories` - Add new category

#### 9.3 Expenses Table

**Columns**:
| Column | Display | Sortable | Description |
|--------|---------|----------|-------------|
| Date | Formatted date | Yes | Expense date |
| Category | Category name | Yes | Expense type |
| Description | Text | No | Details |
| Amount | Currency | Yes | Expense amount |
| Created By | User name | No | Who created |
| Actions | Buttons | No | Edit, Delete |

**Features**:

- Sortable by date, category, amount
- Filterable by category (dropdown)
- Searchable by description
- Color-coded categories (badges)

#### 9.4 Expenses Footer

**Summary Stats**:

- Total Expenses: Sum of all expenses
- By Category: Breakdown pie chart or list
- Average per Day: Total / days in range

#### 9.5 Delete Expense

**Confirmation**: Toast notification with action buttons

**Logic**:

- Hard delete from database
- Updates totals in reports

---

### 10. Settings

**Purpose**: Configure shop details, VAT, currency

**Page**: `SettingsPage.jsx`

**Permissions**: Only `admin` and `owner` roles can edit (others view-only)

#### 10.1 Settings Form

**Section 1: Shop Information**
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Shop Name | Text | Required | Business name (appears on invoices) |
| Shop Address | Textarea | Required | Full address (appears on invoices) |
| Phone | Text | Required | Primary contact number |
| WhatsApp | Text | Optional | WhatsApp number for customer contact |
| VAT Reg. No. | Text | Optional | VAT registration number (TIN) |

**Section 2: Tax Settings**
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| VAT Rate | Number | Required, 0-1 (0-100%) | Default VAT rate (e.g., 0.15 for 15%) |

**Section 3: Currency Settings**
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Currency | Select | Required | Currency code (LKR, USD, EUR, GBP, INR, AED, SAR) |
| Currency Symbol | Text | Auto-filled | Symbol (Rs., $, €, £, ₹, د.إ, ر.س) |
| Symbol Position | Radio | Required (before/after) | Currency symbol placement |

**Currency Options**:

- LKR - Rs. - Sri Lankan Rupee
- USD - $ - US Dollar
- EUR - € - Euro
- GBP - £ - British Pound
- INR - ₹ - Indian Rupee
- AED - د.إ - UAE Dirham
- SAR - ر.س - Saudi Riyal

**Section 4: Expense Categories**
| Field | Type | Description |
|-------|------|-------------|
| Categories List | Chips | Editable list of expense categories |
| Add Category | Input + Button | Add new category |

**Default Categories**:

- Rent, Salaries, Transport, Electricity, Water, Telephone, Maintenance, Office Supplies, Other

**Save Flow**:

1. Check user role (must be admin or owner)
2. Validate required fields
3. PUT `/api/settings` with payload
4. Backend updates single Settings document for tenant
5. Show success message

**API Endpoints**:

- `GET /api/settings` - Load current settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/expense-categories` - Add category

**Key Behaviors**:

- Settings are tenant-specific (one document per tenantId)
- Changes affect new transactions immediately
- VAT rate used for POS tax calculations
- Shop details appear on printed invoices
- Currency settings affect all displays and reports

---

### 11. User Management

**Purpose**: Manage staff users, roles, permissions

**Page**: `UsersPage.jsx`

**Permissions**: Only `owner` role can access this feature

#### 11.1 Users List

**Table Columns**:
| Column | Display | Description |
|--------|---------|-------------|
| Name | Full name | Staff member name |
| Username | Login username | Unique identifier |
| Phone | Contact number | Phone (optional) |
| Role | Badge | cashier/manager/admin/owner |
| Status | Badge | active/inactive |
| Actions | Buttons | Edit, Deactivate/Reactivate, Delete |

#### 11.2 Add/Edit User Modal

**Purpose**: Create or update staff user

**Form Fields**:
| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| Full Name | Text | Required, min 2 chars, 2+ words (letters only) | Staff member name |
| Username | Text | Required, 4-20 chars, starts with letter, alphanumeric+underscore | Login username |
| Phone | Text | Optional, 9 digits starting with 7 | Mobile number |
| Password | Password | Required (create only), min 8 chars, uppercase, lowercase, number, special char | Login password |
| Confirm Password | Password | Required (create only), must match password | Password confirmation |
| Role | Select | Required | User role (cashier/manager) |

**Role Options** (for staff):

- **Cashier**: Limited access (Dashboard, POS, Customers)
- **Manager**: Extended access (+ Inventory, Suppliers, Purchases, Reports, Expenses)

**Note**: Cannot create `admin` or `owner` roles via this form (owner created via signup)

**Create Flow**:

1. Validate all fields (including password)
2. POST `/api/users`
3. Backend:
   - Hashes password
   - Assigns default permissions based on role
   - Sets tenantId from creator's tenant
4. Refresh user list
5. Close modal
6. Show success toast

**Update Flow**:

1. Validate fields (password not required)
2. PUT `/api/users/:id`
3. If password provided: hash and update
4. Refresh user list
5. Close modal
6. Show success toast

**API Endpoints**:

- `GET /api/users` - List all staff users
- `POST /api/users` - Create staff user
- `PUT /api/users/:id` - Update staff user
- `PATCH /api/users/:id/deactivate` - Deactivate user
- `PATCH /api/users/:id/reactivate` - Reactivate user
- `DELETE /api/users/:id` - Delete user

#### 11.3 Deactivate/Reactivate User

**Deactivate**:

- Sets `isActive = false`
- User cannot login
- User's data preserved
- Reversible action

**Reactivate**:

- Sets `isActive = true`
- User can login again
- All previous data intact

#### 11.4 Delete User

**Confirmation**: Modal dialog with username

**Logic**:

- Cannot delete owner
- Cannot delete self
- Hard delete from database
- All refresh tokens revoked

**API Endpoint**: `DELETE /api/users/:id`

#### 11.5 Custom Permissions (Advanced)

**Feature**: Granular feature-level permissions

**Available Features** (from `featurePermissions.js`):

- dashboard - Dashboard
- pos - POS (Point of Sale)
- inventory - Inventory Management
- suppliers - Suppliers Management
- purchases - Purchase Management (legacy)
- customers - Customer Management
- reports - Reports & Analytics
- expenses - Expense Tracking
- settings - Settings Configuration
- users - User Management

**Default Permissions by Role**:

- **Cashier**: dashboard, pos, customers
- **Manager**: dashboard, pos, inventory, suppliers, purchases, customers, reports, expenses
- **Admin**: All features
- **Owner**: All features

**Custom Permission Assignment** (Future Enhancement):

- UI to toggle individual features per user
- Override default role permissions
- Fine-grained access control

---

### 12. Invoice Printing

**Purpose**: Generate printable invoices/receipts

**Pages**:

- `InvoicePrintA4.jsx` - A4 tax invoice
- `InvoicePrintThermal.jsx` - 80mm thermal receipt
- `InvoicePrintPage.jsx` - Router/selector

**Routes**:

- `/invoice/a4/:id` - A4 format
- `/invoice/thermal/:id` - Thermal format

#### 12.1 A4 Tax Invoice

**Format**: A4 paper (210mm × 297mm)

**Purpose**: Official VAT tax invoice for business customers

**Layout Sections**:

**Header**:

- Shop name (large, bold)
- Shop address
- Phone, WhatsApp numbers
- VAT Reg. No.
- Invoice title: "TAX INVOICE"

**Invoice Details**:
| Field | Description |
|-------|-------------|
| Invoice Number | Bill number (e.g., INV-2024-0001) |
| Date | Sale date & time |
| Customer | Customer name & address (if provided) |

**Line Items Table**:
| Column | Description |
|--------|-------------|
| # | Row number |
| Item Description | Product name |
| Qty | Quantity sold |
| Unit | Unit of measure |
| Unit Price | Price per unit |
| Discount | Line discount |
| Tax | VAT amount |
| Amount | Line total |

**Totals Section**:

- Sub Total (before tax)
- Discount Total
- Taxable Amount
- VAT @ 15% (or configured rate)
- **Grand Total** (large, bold)

**Payment Details**:

- Payment Method(s)
- Amount Paid
- Balance Due (if credit)

**Footer**:

- Thank you message
- Return policy
- Terms & conditions

**Print Settings**:

- Print-optimized CSS
- Portrait orientation
- No headers/footers
- Auto-print dialog

#### 12.2 Thermal Receipt (80mm)

**Format**: 80mm thermal paper (continuous)

**Purpose**: Quick POS receipt

**Layout**:

- Compact, single-column
- Text-optimized (no graphics)
- Monospace font for alignment
- Dashed lines for separators

**Sections**:

1. Shop name & contact (centered)
2. Invoice number & date/time
3. Customer name (if provided)
4. Line items (condensed):
   - Item name
   - Qty × Price = Total
5. Totals:
   - Sub Total
   - Discount
   - VAT (if tax invoice)
   - **TOTAL** (bold)
6. Payment:
   - Method & amount
   - Change (if cash)
7. Footer:
   - Thank you message
   - "Powered by SL Hardware POS"

**Print Settings**:

- Print-optimized CSS
- 80mm width (approx. 302px)
- Portrait orientation
- No margins
- Auto-print dialog

#### 12.3 Invoice Data Loading

**API Endpoint**: `GET /api/sales/:id`

**Data Retrieved**:

- Sale document with populated item references
- Customer details (if provided)
- Shop settings (name, address, VAT rate, etc.)

**Error Handling**:

- If invoice not found: Display error message
- If settings error: Use default values

**Key Behaviors**:

- Invoices are read-only (cannot edit)
- Currency formatting from settings
- VAT calculation display
- Barcode QR code (optional enhancement)

---

### 13. Barcode Printing

**Purpose**: Generate printable barcode labels for products

**Page**: `BarcodePrintPage.jsx`

**Route**: `/barcode/:id`

**Layout**:

- Product name (truncated to fit)
- SKU code
- Barcode image (Code128 format via `react-barcode`)
- Selling price
- Print-optimized for 58mm labels

**Print Flow**:

1. Click "Print Barcode" in inventory
2. Opens route in new tab
3. Loads item data via `GET /api/items/:id`
4. Renders barcode with react-barcode library
5. Browser print dialog opens
6. Print to label printer or save as PDF

**Configuration**:

- Barcode format: Code128
- Height: 50px
- Display value: true
- Font size: 12px

---

## User Roles & Permissions

### Role Hierarchy

```
Owner (Highest)
  └── Admin
      └── Manager
          └── Cashier (Lowest)
```

### Role Definitions

#### 1. Owner

**Purpose**: Business owner with full system access

**Characteristics**:

- Created during initial signup
- One per tenant (primary account)
- Cannot be deleted
- Full administrative privileges

**Default Permissions**: All features

- dashboard, pos, inventory, suppliers, purchases, customers, reports, expenses, settings, users

**Special Abilities**:

- Create/manage all user roles
- Access user management
- Modify system settings
- View all data

---

#### 2. Admin

**Purpose**: System administrator (backup to owner)

**Characteristics**:

- Created by owner as staff user
- Can perform most administrative tasks
- Cannot access user management (owner-only)

**Default Permissions**: All features

- dashboard, pos, inventory, suppliers, purchases, customers, reports, expenses, settings, users

**Limitations**:

- Cannot manage users (owner-only feature)
- Can be deactivated by owner

---

#### 3. Manager

**Purpose**: Operations manager with extended access

**Characteristics**:

- Created by owner as staff user
- Manages daily operations
- Access to inventory, purchasing, reporting

**Default Permissions**:

- dashboard, pos, inventory, suppliers, purchases, customers, reports, expenses

**Limitations**:

- Cannot access settings
- Cannot manage users
- Cannot change VAT rate or shop details

---

#### 4. Cashier

**Purpose**: Front-line sales staff

**Characteristics**:

- Created by owner as staff user
- Limited to POS and customer interactions
- Cannot view business analytics or costs

**Default Permissions**:

- dashboard (limited view), pos, customers

**Limitations**:

- Cannot view inventory costs
- Cannot access reports (no profit visibility)
- Cannot manage suppliers or expenses
- Cannot configure settings
- Cannot manage users

---

### Permission System

**Implementation**: Feature-based access control

**Model Field**: `User.permissions` (array of feature IDs)

**Enforcement**:

- **Backend**: Middleware `requireFeature(featureId)` checks user permissions
- **Frontend**: `FeatureRoute` component wraps protected routes

**Feature IDs**:

```javascript
{
  id: "dashboard", label: "Dashboard", category: "Core"
  id: "pos", label: "POS (Point of Sale)", category: "Core"
  id: "inventory", label: "Inventory", category: "Stock"
  id: "suppliers", label: "Suppliers", category: "Stock"
  id: "purchases", label: "Purchases", category: "Stock"
  id: "customers", label: "Customers", category: "People"
  id: "reports", label: "Reports", category: "Analytics"
  id: "expenses", label: "Expenses", category: "Finance"
  id: "settings", label: "Settings", category: "Admin"
  id: "users", label: "User Management", category: "Admin"
}
```

**Middleware Example**:

```javascript
router.get("/items", protect, requireFeature("inventory"), (req, res) => {
  // Only users with 'inventory' permission can access
});
```

**Frontend Route Protection**:

```jsx
<Route
  path="/inventory"
  element={
    <FeatureRoute featureId="inventory" user={user}>
      <InventoryPage />
    </FeatureRoute>
  }
/>
```

---

### Multi-Tenancy

**Tenant Isolation**: All data strictly partitioned by `tenantId`

**Tenant ID**:

- Generated on owner signup (UUIDv4)
- Stored in User model
- Included in JWT access token payload
- Automatically added to all database queries

**Data Access Rules**:

1. User can only access data within their tenant
2. All API endpoints filter by `req.user.tenantId`
3. Cross-tenant access prohibited (authentication fails)
4. Each tenant has independent settings, inventory, customers, etc.

**Database Indexes**:

- All collections have `tenantId` as first field in compound indexes
- Ensures efficient multi-tenant queries
- Example: `{ tenantId: 1, createdAt: -1 }`

---

## Authentication & Security

### Authentication Flow

#### 1. JWT Token Strategy

**Token Types**:

1. **Access Token**:
   - Type: JWT signed with JWT_SECRET
   - Payload: `{ id, tenantId, role }`
   - Expiry: 15 minutes (configurable)
   - Storage: Frontend React state (memory)
   - Transmission: Authorization header `Bearer <token>`

2. **Refresh Token**:
   - Type: Cryptographically secure random string (64 bytes hex)
   - Storage: Backend database (hashed with bcrypt)
   - Transmission: httpOnly, secure cookie
   - Expiry: 7 days (configurable)
   - Purpose: Rotate access tokens

#### 2. Login Flow

```
1. User enters username + password
2. POST /api/auth/login
3. Backend validates credentials
4. Generate access token (JWT)
5. Generate refresh token (random + hash)
6. Store refresh token hash in DB
7. Return:
   - Access token in JSON response
   - Refresh token in httpOnly cookie
8. Frontend stores access token in memory
9. User redirected to dashboard
```

#### 3. Token Refresh Flow

```
1. API request fails with 401 (token expired)
2. Axios interceptor detects 401
3. POST /api/auth/refresh-token (with cookie)
4. Backend:
   - Validates refresh token cookie
   - Verifies hash in database
   - Generates new access token
   - Generates new refresh token
   - Revokes old refresh token
   - Returns new tokens
5. Retry original request with new access token
6. User unaware of refresh (seamless)
```

#### 4. Logout Flow

```
1. User clicks logout
2. POST /api/auth/logout
3. Backend clears refresh token cookie
4. Frontend clears access token from memory
5. User redirected to login
```

---

### Security Measures

#### 1. Password Security

- **Hashing**: bcrypt with salt rounds = 10
- **Requirements**: Min 8 chars, uppercase, lowercase, number, special character
- **Validation**: Frontend + backend (express-validator)
- **Pre-save hook**: Auto-hash on User.save()
- **On change**: All refresh tokens revoked

#### 2. Token Security

- **Access Token**:
  - Short expiry (15 min) limits exposure
  - Signed with strong secret (256-bit recommended)
  - Cannot be revoked (mitigated by short expiry)

- **Refresh Token**:
  - httpOnly cookie (not accessible via JavaScript, prevents XSS)
  - Secure flag (HTTPS only in production)
  - SameSite=Strict (CSRF protection)
  - Stored as bcrypt hash in DB
  - Revoked on password change, logout, or use

#### 3. CORS Configuration

- **Development**: Allows `localhost:5173`, `localhost:5174`, `127.0.0.1`
- **Production**: Whitelist specific origins via `CORS_ORIGIN` env var
- **Credentials**: `credentials: true` (allows cookies)

#### 4. Rate Limiting

**Auth Endpoints**:

- Login: 10 requests per 15 min per IP
- Signup: 5 requests per 15 min per IP
- OTP: 3 requests per 15 min per phone

**Implementation**: `express-rate-limit` middleware

#### 5. Input Validation

**Method**: `express-validator` middleware

**Validation Points**:

- Login: username, password format
- Signup: all fields + password strength
- OTP: phone format (E.164)
- Item creation: SKU, prices, stock
- Sale creation: line items, payments

**Sanitization**:

- Trim strings
- Normalize phone numbers
- Uppercase SKU codes
- Prevent XSS (HTML escaping)

#### 6. SQL/NoSQL Injection Prevention

- **Mongoose**: Parameterized queries (safe by default)
- **Input sanitization**: Remove special characters
- **ObjectId validation**: Validate MongoDB IDs before queries

#### 7. Security Headers

**Helmet.js** configured with:

- `Content-Security-Policy`: Prevent XSS
- `X-Frame-Options`: DENY (prevent clickjacking)
- `X-Content-Type-Options`: nosniff
- `Strict-Transport-Security`: HTTPS enforcement
- `X-XSS-Protection`: 1; mode=block

#### 8. HTTPS Enforcement

- **Production**: Redirect HTTP to HTTPS
- **Cookies**: Secure flag enabled
- **Headers**: HSTS header set

#### 9. Error Handling

**Error Middleware** (`errorMiddleware.js`):

- Generic error messages to client (no stack traces in production)
- Detailed logging to backend logs (Winston)
- Consistent error response format

**Example**:

```json
{
  "message": "Resource not found",
  "stack": "[only in development]"
}
```

#### 10. Logging

**Winston Logger** (`utils/logger.js`):

- Logs to console (development)
- Logs to files (production):
  - `error.log`: Error level
  - `combined.log`: All levels
- Sensitive data excluded (passwords, tokens)
- Request logging with Morgan

---

### Password Reset Flow (OTP)

**Purpose**: Allow users to reset password via SMS OTP

**Steps**:

1. **Request OTP**:
   - User enters phone number on forgot password page
   - POST `/api/otp/send` with `{ phone }`
   - Backend:
     - Validates user exists with phone
     - Generates 6-digit random OTP
     - Hashes OTP with bcrypt
     - Stores in `otps` collection with 10-min expiry
     - Sends SMS via NotifySMS API
   - Frontend shows "OTP sent" message

2. **Verify & Reset**:
   - User enters OTP + new password on reset page
   - POST `/api/otp/verify-and-reset` with `{ phone, otp, newPassword }`
   - Backend:
     - Validates OTP exists and not expired
     - Compares OTP hash
     - Updates user password (triggers pre-save hook)
     - Revokes all refresh tokens
     - Marks OTP as verified (prevents reuse)
   - Frontend redirects to login

**Security**:

- OTP valid for 10 minutes (TTL index auto-deletes)
- OTP stored as bcrypt hash (not plaintext)
- Rate limited (3 requests per 15 min per phone)
- One-time use (marked verified after success)
- All refresh tokens revoked on password change

**SMS Service**:

- Provider: NotifySMS (Sri Lanka)
- Integration: `services/notifySmsService.js`
- Template: "Your OTP is: {otp}. Valid for 10 minutes."

---

## Data Flow & System Integration

### Overall System Flow

```
User Action (Browser)
    ↓
React Component (Frontend)
    ↓
Axios API Client
    ↓
HTTP Request (REST API)
    ↓
Express Route Handler (Backend)
    ↓
Auth Middleware (JWT Validation)
    ↓
Feature Permission Check
    ↓
Controller Logic
    ↓
Mongoose Model
    ↓
MongoDB Database
    ↓
Response (JSON)
    ↓
React Component Updates
    ↓
User Sees Result
```

---

### Detailed Data Flows

#### 1. Sale Transaction Flow

**User Journey**:

1. User opens POS page
2. Searches for products
3. Adds items to cart
4. Selects customer (optional)
5. Enters payments
6. Clicks "Save & Print"

**Technical Flow**:

**Step 1: Load Data**

```
Frontend (POSPage)
  ↓ GET /api/items?active=true
Backend (itemRoutes)
  ↓ protect middleware → check JWT
  ↓ requireFeature('pos')
  ↓ Item.find({ tenantId, isActive: true })
  ↓ returns items array
Frontend
  ↓ stores in state (allItems)
  ↓ enables search/filtering
```

**Step 2: Add Items to Cart**

```
User selects item
  ↓ updates lines state
  ↓ recalcLine() calculates totals
  ↓ validates stock availability
  ↓ updates cart display
```

**Step 3: Submit Sale**

```
User clicks Save & Print
  ↓ validate all lines (qty, price, stock)
  ↓ validate payments (total paid >= grand total)
  ↓ POST /api/sales with payload:
      {
        customer: customerId,
        items: [{item, qty, unitPrice, discount, taxAmount, lineTotal}],
        subTotal, discountTotal, taxTotal, grandTotal,
        payments: [{method, amount, reference}],
        balanceDue,
        isTaxInvoice
      }
Backend (saleRoutes)
  ↓ protect middleware
  ↓ requireFeature('pos')
  ↓ validate payload (express-validator)
  ↓ START TRANSACTION (Mongoose session)
  ↓
  ├─ Generate unique billNumber (e.g., INV-2024-0001)
  ├─ Create Sale document
  ├─ For each line item:
  │   ├─ Load Item document
  │   ├─ Check stock availability
  │   ├─ Decrement stock:
  │   │   └─ If batch-tracked: reduce batch.qtyOnHand
  │   │   └─ If regular: reduce inventory.onHand
  │   ├─ Create StockMovement record:
  │   │     { type: "sale", direction: "out", qty, item, referenceId: saleId }
  │   └─ Save Item
  ├─ If customer & (balanceDue > 0):
  │   ├─ Load Customer document
  │   ├─ Increase currentBalance by balanceDue
  │   └─ Save Customer
  ├─ Save Sale document
  └─ COMMIT TRANSACTION
  ↓
  ↓ returns { _id: saleId, billNumber, ... }
Frontend
  ↓ receives saleId
  ↓ opens /invoice/thermal/{saleId} in new tab
  ↓ shows success toast
  ↓ clears POS form
```

**Error Handling**:

- Insufficient stock: Abort, show error
- Validation fail: Abort, show errors
- Database error: Rollback transaction, show error

---

#### 2. GRN Posting Flow

**User Journey**:

1. User opens Suppliers page
2. Selects supplier, clicks "Create GRN"
3. Adds line items with quantities and costs
4. Saves as draft (optional)
5. Posts GRN (finalizes)

**Technical Flow**:

**Step 1: Create Draft GRN**

```
User fills GRN form
  ↓ adds line items
  ↓ validates batch numbers (if required)
  ↓ clicks "Save Draft"
  ↓ POST /api/grns with:
      {
        grnNo: "GRN-2024-001",
        supplier: supplierId,
        grnDate: date,
        status: "draft",
        lines: [{item, batchNumber, qty, unitCost, lineTotal}],
        totalQty, grandTotal
      }
Backend (grnRoutes)
  ↓ protect middleware
  ↓ requireFeature('suppliers')
  ↓ validate payload
  ↓ pre-validate hook calculates totals
  ↓ Create GRN document (status: draft)
  ↓ returns GRN
Frontend
  ↓ shows success toast
  ↓ GRN saved (can edit later)
```

**Step 2: Post GRN (Finalize)**

```
User clicks "Post GRN"
  ↓ POST /api/grns/:id/post
Backend (grnRoutes)
  ↓ protect middleware
  ↓ requireFeature('suppliers')
  ↓ Load GRN (must be status: draft)
  ↓ START TRANSACTION
  ↓
  ├─ For each line:
  │   ├─ Load Item document
  │   ├─ If item.isBatchTracked:
  │   │   ├─ Find or create batch in item.batches[]
  │   │   ├─ Increment batch.qtyOnHand by line.qty
  │   │   ├─ Update batch.costPrice (optional)
  │   │   └─ Save Item
  │   ├─ If NOT batch-tracked:
  │   │   ├─ Increment item.inventory.onHand by line.qty
  │   │   └─ Save Item
  │   ├─ Update item.lastPurchasePrice = line.unitCost
  │   └─ Create StockMovement record:
  │         { type: "grn", direction: "in", qty, item, referenceId: grnId }
  ├─ Update GRN:
  │   ├─ Set status = "posted"
  │   ├─ Set postedAt = now
  │   └─ Save GRN
  ├─ Load Supplier document
  ├─ Increase supplier.currentBalance by GRN.grandTotal
  └─ Save Supplier
  ↓ COMMIT TRANSACTION
  ↓ returns updated GRN
Frontend
  ↓ shows success toast
  ↓ closes modal
  ↓ refreshes supplier GRN list
```

**Cancel GRN Flow** (reverse stock movements):

```
User clicks "Cancel GRN" (on posted GRN)
  ↓ PUT /api/grns/:id/cancel
Backend
  ↓ Load GRN (must be status: posted)
  ↓ START TRANSACTION
  ↓
  ├─ For each line:
  │   ├─ Load Item
  │   ├─ Decrement stock (batch or regular)
  │   ├─ Create StockMovement record:
  │   │     { type: "grn_cancel", direction: "out", qty, item, referenceId }
  │   └─ Save Item
  ├─ Update GRN:
  │   ├─ Set status = "cancelled"
  │   ├─ Set cancelledAt = now
  │   └─ Save GRN
  ├─ Load Supplier
  ├─ Decrease supplier.currentBalance by GRN.grandTotal
  └─ Save Supplier
  ↓ COMMIT TRANSACTION
Frontend
  ↓ shows success toast
  ↓ GRN marked cancelled
```

---

#### 3. Customer Credit Payment Flow

**User Journey**:

1. User opens Customers page
2. Selects customer with balance
3. Clicks "Receive Payment"
4. Enters payment details
5. Submits payment

**Technical Flow**:

```
User fills payment form
  ↓ validates amount <= customer.currentBalance
  ↓ POST /api/customers/:id/receive-payment with:
      { amount, method, reference, note }
Backend (customerRoutes)
  ↓ protect middleware
  ↓ requireFeature('customers')
  ↓ validate payload
  ↓ START TRANSACTION
  ↓
  ├─ Load Customer document
  ├─ Validate amount > 0 && amount <= currentBalance
  ├─ Create CreditPayment record:
  │     { tenantId, customer, amount, method, reference, note }
  ├─ Decrease customer.currentBalance by amount
  ├─ Save Customer
  └─ Save CreditPayment
  ↓ COMMIT TRANSACTION
  ↓ returns updated customer
Frontend
  ↓ shows success toast
  ↓ refreshes customer list
  ↓ closes modal
```

---

#### 4. Report Generation Flow

**User Journey**:

1. User opens Reports page
2. Selects date range
3. Views metrics & breakdown
4. Clicks "Export to CSV/PDF"

**Technical Flow**:

**Load Report Data**:

```
User selects date range
  ↓ Frontend calculates startDate, endDate
  ↓ Parallel API calls:
      ├─ GET /api/dashboard/daily-sales?startDate=X&endDate=Y
      ├─ GET /api/dashboard/profit-metrics?startDate=X&endDate=Y
      └─ GET /api/dashboard/expenses-summary?startDate=X&endDate=Y
Backend (dashboardController)
  ↓ protect middleware
  ↓ requireFeature('reports')
  ↓ For daily-sales:
  │   └─ Sale.aggregate([
  │       { $match: { tenantId, createdAt: {$gte, $lte} } },
  │       { $group: { _id: null, total: {$sum: "$grandTotal"}, count: {$sum: 1} } }
  │     ])
  ↓ For profit-metrics:
  │   ├─ Calculate gross profit (sales revenue - cost of goods)
  │   ├─ Load expenses in range
  │   └─ Net profit = gross - expenses
  ↓ For expenses-summary:
  │   └─ Expense.aggregate([
  │       { $match: { tenantId, date: {$gte, $lte} } },
  │       { $group: { _id: "$category", total: {$sum: "$amount"} } }
  │     ])
  ↓ returns JSON data
Frontend
  ↓ renders summary metrics
  ↓ generates daily breakdown table
```

**Export to CSV**:

```
User clicks "Export to CSV"
  ↓ Frontend (reportExports.js):
      ├─ Converts report data to CSV format
      ├─ Generates CSV string
      ├─ Creates Blob
      ├─ Triggers download (no API call)
      └─ Filename: Sales_Report_2024-01-01_to_2024-01-31.csv
```

**Export to PDF**:

```
User clicks "Export to PDF"
  ↓ Frontend (reportExports.js):
      ├─ Uses jsPDF library (future enhancement) OR
      ├─ Opens print dialog with print-optimized CSS
      └─ User prints to PDF
```

---

#### 5. Settings Update Flow

**User Journey**:

1. Admin/Owner opens Settings page
2. Modifies shop details, VAT rate, currency
3. Clicks "Save Settings"

**Technical Flow**:

```
User modifies form
  ↓ changes state values
  ↓ clicks Save Settings
  ↓ validates required fields
  ↓ PUT /api/settings with payload:
      {
        shopName, shopAddress, shopPhone, shopWhatsapp,
        vatRegNo, vatRate,
        currency, currencySymbol, currencyPosition,
        expenseCategories
      }
Backend (settingsRoutes)
  ↓ protect middleware
  ↓ check user.role === 'admin' || 'owner' (in controller)
  ↓ Load Settings document (by tenantId)
  ↓ Update fields
  ↓ Save Settings
  ↓ returns updated settings
Frontend
  ↓ shows success message
  ↓ updates local state
  ↓ (Settings take effect immediately for new transactions)
```

---

### API Request/Response Cycle

**Standard Request**:

```
Frontend Axios Client
  ↓ Adds Authorization header: "Bearer {accessToken}"
  ↓ Adds Content-Type: "application/json"
  ↓ Sends request
Backend Express
  ↓ CORS middleware (validates origin)
  ↓ Helmet middleware (security headers)
  ↓ Morgan middleware (logs request)
  ↓ express.json() (parses JSON body)
  ↓ Route handler
  ↓   ↓ protect middleware:
  ↓   │   ├─ Extract token from Authorization header
  ↓   │   ├─ Verify JWT signature & expiry
  ↓   │   ├─ Decode payload {id, tenantId, role}
  ↓   │   ├─ Load User from database
  ↓   │   ├─ Check isActive=true
  ↓   │   └─ req.user = user
  ↓   ↓ requireFeature('featureId') middleware:
  ↓   │   └─ Check featureId in user.permissions[]
  ↓   ↓ Controller logic:
  ↓       ├─ Validate input
  ↓       ├─ Query database (with tenantId filter)
  ↓       └─ Return response
  ↓ Response sent
Frontend Axios Interceptor
  ↓ If 401 (Unauthorized):
  │   ├─ Call /api/auth/refresh-token
  │   ├─ Get new accessToken
  │   └─ Retry original request
  ↓ If 200-299 (Success):
  │   └─ Resolve promise, return data
  ↓ If 4xx/5xx (Error):
      └─ Reject promise, show error
Component
  ↓ Updates state with response data
  ↓ Re-renders UI
```

---

### Database Query Patterns

**All queries include `tenantId`**:

```javascript
// Example: Get all items for current user's tenant
const items = await Item.find({ tenantId: req.user.tenantId });

// Example: Get specific item (with tenant check)
const item = await Item.findOne({ _id: itemId, tenantId: req.user.tenantId });

// Example: Aggregate sales by date
const sales = await Sale.aggregate([
  {
    $match: {
      tenantId: req.user.tenantId,
      createdAt: { $gte: startDate, $lte: endDate },
    },
  },
  { $group: { _id: "$date", total: { $sum: "$grandTotal" } } },
]);
```

**Prevents**:

- Cross-tenant data access
- Accidental data leakage
- Unauthorized queries

---

### Caching Strategy

**Frontend Caching**:

- API responses cached in React state
- Settings cached for session duration
- Item list cached until refresh triggered
- No service worker/offline cache (future enhancement)

**Backend Caching**:

- Cache-Control headers set by `cacheMiddleware.js`
- Static data (categories, units): `max-age=3600` (1 hour)
- Dynamic data (sales, items): `no-cache` (always revalidate)
- Authentication: `no-store` (never cache)

**Database Indexing** (query optimization):

- Compound indexes on `tenantId + field`
- Ensures fast multi-tenant queries
- Examples:
  - `{ tenantId: 1, createdAt: -1 }` - Recent records
  - `{ tenantId: 1, sku: 1 }` - Unique SKU lookup
  - `{ tenantId: 1, barcode: 1 }` - Barcode search

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint                  | Auth              | Description                    |
| ------ | ------------------------- | ----------------- | ------------------------------ |
| POST   | `/api/auth/owner-signup`  | Public            | Create owner account & tenant  |
| POST   | `/api/auth/login`         | Public            | Login with username/password   |
| POST   | `/api/auth/logout`        | Public            | Logout (clear refresh cookie)  |
| POST   | `/api/auth/refresh-token` | Cookie            | Refresh access token           |
| POST   | `/api/auth/seed-admin`    | Public (dev only) | Seed admin user (dev database) |

---

### User Management Endpoints

| Method | Endpoint                    | Auth     | Feature | Description          |
| ------ | --------------------------- | -------- | ------- | -------------------- |
| GET    | `/api/users`                | Required | users   | List all staff users |
| POST   | `/api/users`                | Required | users   | Create staff user    |
| PUT    | `/api/users/:id`            | Required | users   | Update staff user    |
| PATCH  | `/api/users/:id/deactivate` | Required | users   | Deactivate user      |
| PATCH  | `/api/users/:id/reactivate` | Required | users   | Reactivate user      |
| DELETE | `/api/users/:id`            | Required | users   | Delete user          |

---

### Item/Inventory Endpoints

| Method | Endpoint                     | Auth     | Feature   | Description                             |
| ------ | ---------------------------- | -------- | --------- | --------------------------------------- |
| GET    | `/api/items`                 | Required | inventory | List items (query: q, lowStock, active) |
| GET    | `/api/items/:id`             | Required | inventory | Get item by ID                          |
| POST   | `/api/items`                 | Required | inventory | Create item                             |
| PUT    | `/api/items/:id`             | Required | inventory | Update item (master data only)          |
| DELETE | `/api/items/:id`             | Required | inventory | Delete item                             |
| PATCH  | `/api/items/:id/activate`    | Required | inventory | Activate item                           |
| PATCH  | `/api/items/:id/deactivate`  | Required | inventory | Deactivate item                         |
| GET    | `/api/items/categories/list` | Required | inventory | List all categories                     |
| GET    | `/api/items/units/list`      | Required | inventory | List base units                         |
| GET    | `/api/items/search-barcode`  | Required | pos       | Search by barcode                       |

---

### Sale Endpoints

| Method | Endpoint         | Auth     | Feature      | Description                                              |
| ------ | ---------------- | -------- | ------------ | -------------------------------------------------------- |
| GET    | `/api/sales`     | Required | pos, reports | List sales (query: startDate, endDate, customer, status) |
| GET    | `/api/sales/:id` | Required | pos          | Get sale by ID (for invoice)                             |
| POST   | `/api/sales`     | Required | pos          | Create sale (decrements stock)                           |

---

### Customer Endpoints

| Method | Endpoint                             | Auth     | Feature   | Description            |
| ------ | ------------------------------------ | -------- | --------- | ---------------------- |
| GET    | `/api/customers`                     | Required | customers | List customers         |
| GET    | `/api/customers/:id`                 | Required | customers | Get customer by ID     |
| POST   | `/api/customers`                     | Required | customers | Create customer        |
| PUT    | `/api/customers/:id`                 | Required | customers | Update customer        |
| DELETE | `/api/customers/:id`                 | Required | customers | Delete customer        |
| POST   | `/api/customers/:id/receive-payment` | Required | customers | Receive credit payment |

---

### Supplier Endpoints

| Method | Endpoint                  | Auth     | Feature   | Description                       |
| ------ | ------------------------- | -------- | --------- | --------------------------------- |
| GET    | `/api/suppliers`          | Required | suppliers | List suppliers (query: q, status) |
| GET    | `/api/suppliers/:id`      | Required | suppliers | Get supplier by ID                |
| POST   | `/api/suppliers`          | Required | suppliers | Create supplier                   |
| PUT    | `/api/suppliers/:id`      | Required | suppliers | Update supplier                   |
| DELETE | `/api/suppliers/:id`      | Required | suppliers | Delete supplier                   |
| POST   | `/api/suppliers/:id/pay`  | Required | suppliers | Record supplier payment           |
| GET    | `/api/suppliers/:id/grns` | Required | suppliers | List supplier GRNs                |

---

### GRN (Goods Receipt Note) Endpoints

| Method | Endpoint               | Auth     | Feature   | Description                                             |
| ------ | ---------------------- | -------- | --------- | ------------------------------------------------------- |
| GET    | `/api/grns`            | Required | suppliers | List GRNs (query: supplier, status, startDate, endDate) |
| GET    | `/api/grns/:id`        | Required | suppliers | Get GRN by ID                                           |
| POST   | `/api/grns`            | Required | suppliers | Create GRN (draft)                                      |
| PUT    | `/api/grns/:id`        | Required | suppliers | Update GRN (draft only)                                 |
| POST   | `/api/grns/:id/post`   | Required | suppliers | Post GRN (finalize, update stock)                       |
| PUT    | `/api/grns/:id/cancel` | Required | suppliers | Cancel posted GRN (reverse stock)                       |
| DELETE | `/api/grns/:id`        | Required | suppliers | Delete draft GRN                                        |

---

### Purchase Endpoints (Legacy)

| Method | Endpoint             | Auth     | Feature   | Description                     |
| ------ | -------------------- | -------- | --------- | ------------------------------- |
| GET    | `/api/purchases`     | Required | purchases | List purchases                  |
| GET    | `/api/purchases/:id` | Required | purchases | Get purchase by ID              |
| POST   | `/api/purchases`     | Required | purchases | Create purchase (updates stock) |
| PUT    | `/api/purchases/:id` | Required | purchases | Update purchase                 |
| DELETE | `/api/purchases/:id` | Required | purchases | Delete purchase                 |

---

### Expense Endpoints

| Method | Endpoint            | Auth     | Feature  | Description                                         |
| ------ | ------------------- | -------- | -------- | --------------------------------------------------- |
| GET    | `/api/expenses`     | Required | expenses | List expenses (query: startDate, endDate, category) |
| GET    | `/api/expenses/:id` | Required | expenses | Get expense by ID                                   |
| POST   | `/api/expenses`     | Required | expenses | Create expense                                      |
| PUT    | `/api/expenses/:id` | Required | expenses | Update expense                                      |
| DELETE | `/api/expenses/:id` | Required | expenses | Delete expense                                      |

---

### Settings Endpoints

| Method | Endpoint                           | Auth     | Feature  | Description                        |
| ------ | ---------------------------------- | -------- | -------- | ---------------------------------- |
| GET    | `/api/settings`                    | Required | All      | Get tenant settings                |
| PUT    | `/api/settings`                    | Required | settings | Update settings (admin/owner only) |
| POST   | `/api/settings/expense-categories` | Required | settings | Add expense category               |

---

### Dashboard/Report Endpoints

| Method | Endpoint                          | Auth     | Feature   | Description                                     |
| ------ | --------------------------------- | -------- | --------- | ----------------------------------------------- |
| GET    | `/api/dashboard/daily-sales`      | Required | dashboard | Sales overview (query: startDate, endDate)      |
| GET    | `/api/dashboard/profit-metrics`   | Required | dashboard | Profit calculations (query: startDate, endDate) |
| GET    | `/api/dashboard/expenses-summary` | Required | dashboard | Expenses summary (query: startDate, endDate)    |
| GET    | `/api/reports/sales-by-date`      | Required | reports   | Sales grouped by date                           |
| GET    | `/api/reports/top-items`          | Required | reports   | Top selling items                               |
| GET    | `/api/reports/low-stock`          | Required | reports   | Items below threshold                           |

---

### OTP Endpoints

| Method | Endpoint                    | Auth   | Feature | Description                 |
| ------ | --------------------------- | ------ | ------- | --------------------------- |
| POST   | `/api/otp/send`             | Public | N/A     | Send OTP to phone           |
| POST   | `/api/otp/verify-and-reset` | Public | N/A     | Verify OTP & reset password |

---

### Health Check

| Method | Endpoint  | Auth   | Feature | Description                |
| ------ | --------- | ------ | ------- | -------------------------- |
| GET    | `/`       | Public | N/A     | API health check           |
| GET    | `/health` | Public | N/A     | Database connection health |

---

## Missing Features & Recommendations

### Critical Missing Features

#### 1. **Advanced Reporting & Analytics**

**Current State**: Basic daily/range reports with CSV export

**Missing**:

- Month-over-month comparison
- Year-over-year trends
- Customer segmentation analysis
- Product performance matrix (ABC analysis)
- Supplier performance metrics
- Profit margin analysis by category/product
- Interactive charts (line, bar, pie)
- Dashboard widgets with drill-down

**Recommendation**: Implement using Chart.js or Recharts for visualizations

---

#### 2. **Stock Adjustment & Transfer**

**Current State**: Stock changes only via sales, purchases, GRN

**Missing**:

- Manual stock adjustment (damage, loss, found)
- Stock transfer between batches
- Physical stock count/reconciliation
- Adjustment approval workflow
- Audit trail for adjustments

**Recommendation**: Add `StockAdjustment` model and dedicated UI

---

#### 3. **Batch & Serial Number Management**

**Current State**: Basic batch tracking in GRN, no serial numbers

**Missing**:

- Serial number assignment & tracking
- Batch expiry alerts & reports
- First-in-first-out (FIFO) automatic batch selection
- Batch-wise profitability
- Recall/return by batch

**Recommendation**: Enhance Item model with serial tracking, add batch selection logic in POS

---

#### 4. **Purchase Order (PO) System**

**Current State**: Direct purchases and GRNs, no formal PO workflow

**Missing**:

- Create purchase orders
- Send PO to suppliers (email/print)
- Track PO status (pending, partial, received)
- Convert PO to GRN on receipt
- PO approval workflow

**Recommendation**: Add `PurchaseOrder` model, link to GRN

---

#### 5. **Invoice Payment Tracking**

**Current State**: Sales track payments, but no invoice settlement details

**Missing**:

- Link payments to specific invoices
- Partial payment allocation
- Invoice aging report (30, 60, 90+ days)
- Customer statement of account
- Payment due reminders

**Recommendation**: Enhance `CreditPayment` with `appliedInvoices` array, build invoice settlement UI

---

#### 6. **Barcode Scanner Integration**

**Current State**: Manual barcode entry in POS

**Missing**:

- Real-time barcode scanner input detection
- USB/Bluetooth scanner support
- Scan-to-add in inventory management
- Scan-to-search in all modules

**Recommendation**: Add keyboard event listener for scanner input (most scanners emulate keyboard)

---

#### 7. **Offline Mode & Sync**

**Current State**: Network detection, but no offline functionality

**Missing**:

- Service worker for offline caching
- IndexedDB for local data storage
- Offline POS transactions
- Background sync when connection restored
- Conflict resolution

**Recommendation**: Implement Progressive Web App (PWA) with service workers

---

#### 8. **Multi-Currency Support**

**Current State**: Single currency per tenant

**Missing**:

- Multi-currency pricing
- Foreign exchange rate management
- Currency conversion in reports
- Multi-currency payments

**Recommendation**: Add `currencies` field to items, track exchange rates in Settings

---

#### 9. **Tax Compliance & Reporting**

**Current State**: Basic VAT calculation

**Missing**:

- VAT return report (VAT collected vs. paid)
- Tax-exempt customer handling
- Multiple tax rates per region/item
- Tax invoice numbering compliance
- E-invoice integration (future: Sri Lanka IRD system)

**Recommendation**: Research Sri Lanka tax regulations, implement compliant reporting

---

#### 10. **Mobile App**

**Current State**: Responsive web app only

**Missing**:

- Native iOS/Android app
- Mobile POS with camera barcode scanner
- Push notifications (low stock, payments due)
- Mobile receipts (email/SMS)

**Recommendation**: Use React Native or consider PWA as mobile app

---

### Feature Enhancements

#### 1. **Advanced Search & Filtering**

- Full-text search across all entities
- Saved filters/searches
- Bulk actions (select multiple, delete/deactivate)
- Advanced filtering UI (multi-select filters)

#### 2. **User Activity Logs**

- Audit trail for all changes (who, when, what)
- Login history
- Session management
- IP address tracking

#### 3. **Notifications System**

- In-app notifications
- Email notifications (sales summary, low stock)
- SMS alerts (critical events)
- Notification preferences

#### 4. **Supplier Portal**

- Supplier login (view POs, GRNs)
- Supplier catalog upload
- Request for quotation (RFQ)

#### 5. **Customer Portal**

- Customer login (view invoices, payments)
- Online ordering
- Payment gateway integration
- Loyalty points

#### 6. **Backup & Restore**

- Automated database backups
- One-click restore
- Data export (full database)

#### 7. **Multi-Location Support**

- Multiple shop locations per tenant
- Stock transfer between locations
- Consolidated reporting

#### 8. **Promotion & Discount Engine**

- Time-based discounts
- Buy X Get Y promotions
- Coupon codes
- Bulk discounts

#### 9. **Integration APIs**

- Accounting software integration (QuickBooks, Xero)
- E-commerce integration (WooCommerce, Shopify)
- Payment gateway (Stripe, PayPal)
- WhatsApp Business API

#### 10. **Advanced Permissions**

- Granular field-level permissions
- Approval workflows (multi-level)
- Branch/department isolation

---

### UI/UX Improvements

#### 1. **Keyboard Shortcuts**

- Hotkeys for common actions (Alt+N for new, Ctrl+S for save)
- Quick navigation (Ctrl+K for command palette)
- POS shortcuts (F1-F12 for quick items)

#### 2. **Drag & Drop**

- Reorder items in cart
- File uploads (product images)
- Batch operations

#### 3. **Dark Mode**

- System preference detection
- Manual toggle
- Persistent user choice

#### 4. **Print Templates**

- Customizable invoice templates
- Logo upload
- Footer text customization
- Multiple template support

#### 5. **Data Visualization**

- Real-time dashboard updates
- Interactive charts
- Comparison views (side-by-side periods)

---

### Performance Optimizations

#### 1. **Database**

- Query optimization (explain slow queries)
- Add more compound indexes
- Implement database sharding (if multi-tenant grows large)

#### 2. **Frontend**

- Code splitting (lazy load routes)
- Optimize bundle size
- Image optimization (WebP format)
- Virtual scrolling for large lists

#### 3. **Backend**

- API response pagination (limit/offset)
- Redis caching for frequently accessed data
- Rate limiting per user (not just IP)
- Background jobs for heavy operations (reports)

#### 4. **Monitoring**

- APM (Application Performance Monitoring) - New Relic, Datadog
- Error tracking - Sentry
- Uptime monitoring
- Database query profiling

---

### Security Enhancements

#### 1. **Two-Factor Authentication (2FA)**

- SMS OTP on login (optional)
- TOTP apps (Google Authenticator)
- Backup codes

#### 2. **Advanced Audit Logging**

- Log all database changes
- IP address tracking
- Session management
- Failed login attempts

#### 3. **Data Encryption**

- Encrypt sensitive fields (customer NIC, phone)
- Database encryption at rest
- SSL/TLS certificate enforcement

#### 4. **API Security**

- API key authentication (for integrations)
- Webhook signatures
- Request signing

---

### Testing & Quality Assurance

#### Missing Tests:

- **Unit tests**: Model methods, utility functions
- **Integration tests**: API endpoints
- **E2E tests**: User workflows (Playwright, Cypress)
- **Load testing**: Concurrent users, high transaction volume

**Recommendation**: Implement Jest for unit tests, Supertest for API tests, Cypress for E2E

---

### Documentation Gaps

#### Missing Documentation:

- **API documentation**: OpenAPI/Swagger spec
- **Developer setup guide**: Step-by-step local dev setup
- **Deployment guide**: Production hosting (AWS, Render, Heroku)
- **User manual**: End-user screenshots & tutorials
- **Troubleshooting guide**: Common errors & fixes

**Recommendation**: Use Swagger for API docs, create Wiki for developer/user docs

---

### Deployment & DevOps

#### Missing Infrastructure:

- **CI/CD pipeline**: Automated testing, build, deploy
- **Environment management**: Dev, Staging, Production
- **Docker containerization**: Consistent deployment
- **Database migrations**: Versioned schema changes (migrate-mongo)
- **Secrets management**: Secure env var storage (AWS Secrets Manager)

**Recommendation**: Set up GitHub Actions or GitLab CI for CI/CD, use Docker Compose for local dev

---

## Conclusion

This Point of Sale system is a comprehensive, production-ready application with the following strengths:

**Strengths**:
✅ Robust authentication & authorization system
✅ Multi-tenant architecture with strong data isolation
✅ Complete POS workflow with VAT support
✅ Inventory management with batch tracking
✅ Customer & supplier management with credit tracking
✅ GRN workflow for structured stock receipt
✅ Reporting & analytics with export capabilities
✅ Responsive UI (desktop, tablet, mobile)
✅ Role-based access control
✅ Centralized error handling & logging
✅ Well-structured codebase with separation of concerns

**Areas for Enhancement** (prioritized):

1. **Critical**: Stock adjustment & reconciliation
2. **High**: Advanced reporting & analytics with charts
3. **High**: Batch expiry management & FIFO logic
4. **High**: Purchase order system
5. **Medium**: Invoice payment tracking & aging reports
6. **Medium**: Barcode scanner integration
7. **Medium**: Offline mode & PWA
8. **Medium**: 2FA for enhanced security
9. **Low**: Mobile native app
10. **Low**: Supplier/customer portals

**Technology Decisions**:

- **Frontend**: React with hooks (modern, maintainable)
- **Backend**: Express with Mongoose (scalable, flexible)
- **Database**: MongoDB (document-oriented, multi-tenant friendly)
- **Auth**: JWT + Refresh Tokens (secure, stateless)

This documentation serves as a complete reference for developers, stakeholders, and users to understand the system's capabilities, architecture, and future roadmap.

---

**Document Version**: 1.0
**Last Updated**: February 10, 2026
**Prepared By**: AI Documentation Assistant
**Review Status**: Ready for Review
