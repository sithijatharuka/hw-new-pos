# Feature Permission System - Visual Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      POS APPLICATION                            │
└─────────────────────────────────────────────────────────────────┘

                           FRONTEND (React)
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Edit Staff Modal                                    │  │
│  │  ├─ Feature Permissions Section                      │  │
│  │  │  ├─ ☑ Dashboard (📊)                              │  │
│  │  │  ├─ ☑ POS (🛒)                                    │  │
│  │  │  ├─ ☑ Customers (👥)                              │  │
│  │  │  ├─ ☐ Inventory (📦) [disabled]                   │  │
│  │  │  └─ ...                                           │  │
│  │  └─ Auto-updates when role changes                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  permissionHelper.js Utilities                       │  │
│  │  ├─ userHasFeatureAccess(user, "pos")               │  │
│  │  ├─ userHasAllFeatures(user, [...])                 │  │
│  │  ├─ userHasAnyFeature(user, [...])                  │  │
│  │  └─ getUserFeatures(user)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Navigation & Routes                                 │  │
│  │  ├─ Hide menu items user can't access               │  │
│  │  ├─ Protect routes with FeatureRoute component      │  │
│  │  └─ Show access denied message if needed            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴──────────────┐
            │                              │
            ▼                              ▼
    POST /users/staff             PUT /users/{id}
    (Create User)                 (Update User)
    {                              {
      name: "...",                   permissions: ["dashboard",
      username: "...",                            "pos",
      password: "...",                            "customers"]
      role: "cashier",             }
      permissions: [
        "dashboard",
        "pos",
        "customers"
      ]
    }
            │                              │
            └───────────────┬──────────────┘
                            │
                     API Validation
                            │
                            ▼
                           BACKEND (Node.js/Express)
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Routes (userRoutes.js)                         │  │
│  │  ├─ Validate permissions array                       │  │
│  │  ├─ Default permissions if not provided              │  │
│  │  └─ Store in database                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB - User Document                             │  │
│  │  {                                                   │  │
│  │    _id: ObjectId,                                    │  │
│  │    name: "John Cashier",                             │  │
│  │    role: "cashier",                                  │  │
│  │    permissions: ["dashboard", "pos", "customers"],  │  │
│  │    ...                                               │  │
│  │  }                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Protected Routes (with requireFeature)              │  │
│  │  ├─ GET /dashboard/stats                             │  │
│  │  │  ├─ protect middleware (auth check)               │  │
│  │  │  ├─ requireFeature("dashboard")                   │  │
│  │  │  └─ dashboardController.getStats()                │  │
│  │  ├─ POST /sales                                      │  │
│  │  │  ├─ protect middleware (auth check)               │  │
│  │  │  ├─ requireFeature("pos")                         │  │
│  │  │  └─ saleController.createSale()                   │  │
│  │  └─ GET /items                                       │  │
│  │     ├─ protect middleware (auth check)               │  │
│  │     ├─ requireFeature("inventory")                   │  │
│  │     └─ itemController.getItems()                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                     PERMISSION VALIDATION FLOW                  │
└─────────────────────────────────────────────────────────────────┘

User Login
    │
    ▼
Token contains user ID
    │
    ▼
protect middleware: Get full user from DB
    │
    ├─ Load user with permissions array
    │
    ▼
User available to all routes as req.user
    │
    ├─ req.user.role
    ├─ req.user.permissions = ["dashboard", "pos", "customers"]
    │
    ▼
Route checks access with requireFeature("feature-id")
    │
    ├─ Is user owner/admin? → ALLOW ✅
    │
    └─ Is feature in user.permissions?
        │
        ├─ YES → ALLOW ✅
        │
        └─ NO → DENY 🚫 (403 Forbidden)


┌─────────────────────────────────────────────────────────────────┐
│                  FEATURE CONFIGURATION STRUCTURE                │
└─────────────────────────────────────────────────────────────────┘

AVAILABLE_FEATURES (in both frontend & backend)
│
├─ Core
│  ├─ dashboard (📊)
│  └─ pos (🛒)
│
├─ Stock
│  ├─ inventory (📦)
│  ├─ suppliers (🏭)
│  └─ purchases (📥)
│
├─ People
│  └─ customers (👥)
│
├─ Analytics
│  └─ reports (📈)
│
├─ Finance
│  └─ expenses (💸)
│
└─ Admin
   ├─ settings (⚙️)
   └─ users (👤)


DEFAULT_FEATURES_BY_ROLE
│
├─ cashier → ["dashboard", "pos", "customers"]
│
├─ manager → ["dashboard", "pos", "inventory", "suppliers",
│              "purchases", "customers", "reports", "expenses"]
│
├─ admin → [all features]
│
└─ owner → [all features]


┌─────────────────────────────────────────────────────────────────┐
│                    USER ACCESS FLOW EXAMPLE                     │
└─────────────────────────────────────────────────────────────────┘

Scenario: Cashier "John" tries to access POS (allowed)
│
├─ User "John": role="cashier", permissions=["dashboard", "pos", "customers"]
│
├─ Route: POST /api/sales (requireFeature("pos"))
│
├─ Check: Is "pos" in permissions?
│  │
│  └─ YES ✅
│
└─ Response: 201 Sale created


Scenario: Cashier "John" tries to access Inventory (denied)
│
├─ User "John": role="cashier", permissions=["dashboard", "pos", "customers"]
│
├─ Route: GET /api/items (requireFeature("inventory"))
│
├─ Check: Is "inventory" in permissions?
│  │
│  └─ NO ❌
│
└─ Response: 403 {"message": "You do not have access to the "inventory" feature"}


┌─────────────────────────────────────────────────────────────────┐
│                  MODAL UI FLOW - CREATE USER                    │
└─────────────────────────────────────────────────────────────────┘

User clicks "Create staff"
    │
    ▼
Modal opens with empty form
    │
    ▼
Admin enters basic info
    │
    ├─ Name: "John Cashier"
    ├─ Username: "john.cashier"
    ├─ Password: "Secure@123"
    │
    ▼
Admin selects Role: "Cashier"
    │
    ├─ handleRoleChange() triggered
    │
    ▼
Permissions auto-populate based on role
    │
    ├─ Dashboard ✅ (auto-selected)
    ├─ POS ✅ (auto-selected)
    ├─ Customers ✅ (auto-selected)
    ├─ Inventory ☐
    ├─ ... (others unchecked)
    │
    ▼
Admin can customize (optional)
    │
    ├─ Uncheck Dashboard → user won't see dashboard
    ├─ Check Inventory → user gets inventory access
    │
    ▼
Admin clicks "Create staff"
    │
    ▼
Form validation + API call
    │
    ├─ Payload:
    │  {
    │    name: "John Cashier",
    │    username: "john.cashier",
    │    password: "Secure@123",
    │    role: "cashier",
    │    permissions: ["pos", "customers"] // modified from default
    │  }
    │
    ▼
Backend creates user with permissions
    │
    └─ User successfully created!


┌─────────────────────────────────────────────────────────────────┐
│                   PERMISSION INHERITANCE RULES                  │
└─────────────────────────────────────────────────────────────────┘

Role Change Behavior:
    │
    ├─ When role changes from "cashier" to "manager"
    │  │
    │  ├─ OLD permissions: ["dashboard", "pos", "customers"]
    │  │
    │  └─ NEW permissions: [manager defaults]
    │     (Dashboard, POS, Inventory, Suppliers, Purchases,
    │      Customers, Reports, Expenses)
    │
    └─ User can then customize further if needed


Owner/Admin Rules:
    │
    ├─ Owner users: ALWAYS have all permissions
    ├─ Admin users: ALWAYS have all permissions
    │
    └─ The permissions field is ignored for these roles
       (they bypass all checks)


┌─────────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIOS                            │
└─────────────────────────────────────────────────────────────────┘

Invalid feature in permissions array
    │
    ├─ Request: { role: "cashier", permissions: ["dashboard", "invalid_feature"] }
    │
    ├─ Backend validation fails
    │
    └─ Response: 400 Bad Request (invalid permission)


Unauthorized feature access
    │
    ├─ User permissions: ["dashboard", "pos"]
    │
    ├─ Attempts: GET /api/items (requires "inventory")
    │
    ├─ requireFeature("inventory") middleware blocks it
    │
    └─ Response: 403 {"message": "You do not have access to..."}


Token expired/invalid
    │
    ├─ protect middleware checks authentication first
    │
    ├─ If no valid token → 401 Unauthorized
    │
    └─ Permission checks only happen after auth passes
```

## Key Takeaways

1. **Two-Layer Protection:**
   - `protect` middleware - Verifies user is authenticated
   - `requireFeature()` middleware - Verifies user has feature permission

2. **Auto-Default Behavior:**
   - When role is selected, permissions auto-populate
   - Admins can still customize if needed

3. **Owner/Admin Bypass:**
   - These roles ALWAYS have access to all features
   - Their permissions array is technically ignored

4. **Frontend-Backend Sync:**
   - Same feature definitions in both places
   - Frontend hides UI, Backend enforces access
   - Defense-in-depth approach

5. **Easy Extension:**
   - Add new feature to `AVAILABLE_FEATURES`
   - Use `requireFeature()` on new routes
   - Update UI navigation accordingly
