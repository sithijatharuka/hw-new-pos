# Feature Permission System - Example Implementations

This file provides concrete examples of how to implement feature-based access control in your existing routes and components.

## Backend Examples

### Example 1: Dashboard Route with Feature Check

**File:** `backend/src/routes/dashboardRoutes.js`

```javascript
import express from "express";
import { protect, requireFeature } from "../middleware/authMiddleware.js";
import dashboardController from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/dashboard/stats
// Only accessible to users with "dashboard" feature
router.get(
  "/stats",
  protect,
  requireFeature("dashboard"),
  dashboardController.getStats,
);

router.get(
  "/sales-summary",
  protect,
  requireFeature("dashboard"),
  dashboardController.getSalesSummary,
);

export default router;
```

### Example 2: POS Route with Feature Check

**File:** `backend/src/routes/saleRoutes.js`

```javascript
import express from "express";
import { protect, requireFeature } from "../middleware/authMiddleware.js";
import saleController from "../controllers/saleController.js";

const router = express.Router();

// POST /api/sales
// Only users with "pos" feature can create sales
router.post("/", protect, requireFeature("pos"), saleController.createSale);

// GET /api/sales/:id
// Only users with "pos" feature can view sales
router.get("/:id", protect, requireFeature("pos"), saleController.getSale);

export default router;
```

### Example 3: Inventory Route with Feature Check

**File:** `backend/src/routes/itemRoutes.js`

```javascript
import express from "express";
import { protect, requireFeature } from "../middleware/authMiddleware.js";
import itemController from "../controllers/itemController.js";

const router = express.Router();

// GET /api/items
// Accessible to users with "inventory" feature
router.get("/", protect, requireFeature("inventory"), itemController.getItems);

// POST /api/items
// Only users with "inventory" feature can create items
router.post(
  "/",
  protect,
  requireFeature("inventory"),
  itemController.createItem,
);

// PUT /api/items/:id
// Only users with "inventory" feature can update items
router.put(
  "/:id",
  protect,
  requireFeature("inventory"),
  itemController.updateItem,
);

export default router;
```

### Example 4: Multi-Feature Requirements

Some routes might need multiple features:

```javascript
// Create a combined middleware function
const requireFeatures = (...features) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return res.json({ message: "Not authenticated" });
    }

    // Owners and admins bypass checks
    if (req.user.role === "owner" || req.user.role === "admin") {
      return next();
    }

    // Check if user has ALL required features
    const hasAllFeatures = features.every(
      (featureId) =>
        Array.isArray(req.user.permissions) &&
        req.user.permissions.includes(featureId),
    );

    if (!hasAllFeatures) {
      res.status(403);
      return res.json({
        message: `You need access to: ${features.join(", ")}`,
      });
    }

    next();
  };
};

// Usage: Require both "purchases" and "suppliers" features
router.post(
  "/",
  protect,
  requireFeatures("purchases", "suppliers"),
  purchaseController.createPurchase,
);
```

## Frontend Examples

### Example 1: Navigation with Permission Checks

**File:** `frontend/src/components/common/Navigation.jsx`

```javascript
import { userHasFeatureAccess } from "../../utils/permissionHelper";
import { colors } from "../../themes/colors";

const Navigation = ({ user }) => {
  const navItems = [
    {
      id: "dashboard",
      label: "📊 Dashboard",
      path: "/dashboard",
      feature: "dashboard",
    },
    { id: "pos", label: "🛒 POS", path: "/pos", feature: "pos" },
    {
      id: "inventory",
      label: "📦 Inventory",
      path: "/inventory",
      feature: "inventory",
    },
    {
      id: "suppliers",
      label: "🏭 Suppliers",
      path: "/suppliers",
      feature: "suppliers",
    },
    {
      id: "purchases",
      label: "📥 Purchases",
      path: "/purchases",
      feature: "purchases",
    },
    {
      id: "customers",
      label: "👥 Customers",
      path: "/customers",
      feature: "customers",
    },
    {
      id: "reports",
      label: "📈 Reports",
      path: "/reports",
      feature: "reports",
    },
    {
      id: "expenses",
      label: "💸 Expenses",
      path: "/expenses",
      feature: "expenses",
    },
    {
      id: "settings",
      label: "⚙️ Settings",
      path: "/settings",
      feature: "settings",
    },
    { id: "users", label: "👤 Users", path: "/users", feature: "users" },
  ];

  return (
    <nav style={{ background: colors.background.secondary }}>
      <ul>
        {navItems.map((item) => {
          // Only show if user has access to the feature
          if (!userHasFeatureAccess(user, item.feature)) {
            return null;
          }

          return (
            <li key={item.id}>
              <a href={item.path} style={{ color: colors.text.primary }}>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
```

### Example 2: Protected Route Component

**File:** `frontend/src/components/common/FeatureRoute.jsx`

```javascript
import { userHasFeatureAccess } from "../../utils/permissionHelper";
import { colors } from "../../themes/colors";

const FeatureRoute = ({ user, feature, element, fallback }) => {
  if (!userHasFeatureAccess(user, feature)) {
    if (fallback) return fallback;

    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: colors.background.primary }}
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text.primary }}
          >
            Access Denied
          </h1>
          <p className="text-sm mb-6" style={{ color: colors.text.tertiary }}>
            You don't have access to the "{feature}" feature. Contact your
            administrator for access.
          </p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            style={{
              background: colors.button.primary.bg,
              color: colors.button.primary.text,
            }}
            className="px-4 py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return element;
};

export default FeatureRoute;
```

### Example 3: Router Setup with Protected Routes

**File:** `frontend/src/App.jsx`

```javascript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FeatureRoute from "./components/common/FeatureRoute";
import { userHasFeatureAccess } from "./utils/permissionHelper";

// Import your pages
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import InventoryPage from "./pages/InventoryPage";
import SuppliersPage from "./pages/SuppliersPage";
import PurchasesPage from "./pages/PurchasesPage";
import CustomersPage from "./pages/CustomersPage";
import ReportsPage from "./pages/ReportsPage";
import ExpensesPage from "./pages/ExpensesPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";

function App({ user }) {
  return (
    <Router>
      <Routes>
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <FeatureRoute
              user={user}
              feature="dashboard"
              element={<DashboardPage user={user} />}
            />
          }
        />

        {/* POS */}
        <Route
          path="/pos"
          element={
            <FeatureRoute
              user={user}
              feature="pos"
              element={<POSPage user={user} />}
            />
          }
        />

        {/* Inventory */}
        <Route
          path="/inventory"
          element={
            <FeatureRoute
              user={user}
              feature="inventory"
              element={<InventoryPage user={user} />}
            />
          }
        />

        {/* Suppliers */}
        <Route
          path="/suppliers"
          element={
            <FeatureRoute
              user={user}
              feature="suppliers"
              element={<SuppliersPage user={user} />}
            />
          }
        />

        {/* Purchases */}
        <Route
          path="/purchases"
          element={
            <FeatureRoute
              user={user}
              feature="purchases"
              element={<PurchasesPage user={user} />}
            />
          }
        />

        {/* Customers */}
        <Route
          path="/customers"
          element={
            <FeatureRoute
              user={user}
              feature="customers"
              element={<CustomersPage user={user} />}
            />
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <FeatureRoute
              user={user}
              feature="reports"
              element={<ReportsPage user={user} />}
            />
          }
        />

        {/* Expenses */}
        <Route
          path="/expenses"
          element={
            <FeatureRoute
              user={user}
              feature="expenses"
              element={<ExpensesPage user={user} />}
            />
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <FeatureRoute
              user={user}
              feature="settings"
              element={<SettingsPage user={user} />}
            />
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <FeatureRoute
              user={user}
              feature="users"
              element={<UsersPage user={user} />}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
```

### Example 4: Conditional UI in Components

**File:** `frontend/src/components/dashboard/Dashboard.jsx`

```javascript
import {
  userHasFeatureAccess,
  userHasAnyFeature,
} from "../../utils/permissionHelper";
import { colors } from "../../themes/colors";

const DashboardPage = ({ user }) => {
  return (
    <div style={{ background: colors.background.primary }}>
      <h1>Dashboard</h1>

      {/* Only show sales widget if user has "pos" feature */}
      {userHasFeatureAccess(user, "pos") && (
        <div className="card">
          <h2>Recent Sales</h2>
          {/* Sales data */}
        </div>
      )}

      {/* Only show inventory summary if user has "inventory" feature */}
      {userHasFeatureAccess(user, "inventory") && (
        <div className="card">
          <h2>Inventory Status</h2>
          {/* Inventory data */}
        </div>
      )}

      {/* Show reports button if user has access to ANY reporting feature */}
      {userHasAnyFeature(user, ["reports", "expenses"]) && (
        <div className="card">
          <h2>Quick Reports</h2>
          {/* Reports */}
        </div>
      )}

      {/* Admin-only settings */}
      {userHasFeatureAccess(user, "settings") && (
        <div className="card">
          <h2>System Settings</h2>
          {/* Settings */}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
```

### Example 5: Disabled Buttons Based on Permissions

```javascript
import { userHasFeatureAccess } from "../../utils/permissionHelper";
import { colors } from "../../themes/colors";

const ActionButtons = ({ user }) => {
  const hasInventory = userHasFeatureAccess(user, "inventory");
  const hasPOS = userHasFeatureAccess(user, "pos");

  return (
    <div>
      {/* Button disabled if user lacks permission */}
      <button
        onClick={() => createSale()}
        disabled={!hasPOS}
        style={{
          background: hasPOS
            ? colors.button.primary.bg
            : colors.background.subtle,
          opacity: hasPOS ? 1 : 0.6,
          cursor: hasPOS ? "pointer" : "not-allowed",
        }}
      >
        {hasPOS ? "Create Sale" : "Create Sale (No Access)"}
      </button>

      <button
        onClick={() => openInventory()}
        disabled={!hasInventory}
        style={{
          background: hasInventory
            ? colors.button.primary.bg
            : colors.background.subtle,
          opacity: hasInventory ? 1 : 0.6,
          cursor: hasInventory ? "pointer" : "not-allowed",
        }}
      >
        {hasInventory ? "Manage Inventory" : "Manage Inventory (No Access)"}
      </button>
    </div>
  );
};

export default ActionButtons;
```

## Testing Examples

### Test Case 1: Cashier User

```javascript
const cashierUser = {
  _id: "123",
  name: "John Cashier",
  username: "john.cashier",
  role: "cashier",
  permissions: ["dashboard", "pos", "customers"],
};

// ✅ Can access
userHasFeatureAccess(cashierUser, "dashboard"); // true
userHasFeatureAccess(cashierUser, "pos"); // true
userHasFeatureAccess(cashierUser, "customers"); // true

// ❌ Cannot access
userHasFeatureAccess(cashierUser, "inventory"); // false
userHasFeatureAccess(cashierUser, "reports"); // false
userHasFeatureAccess(cashierUser, "settings"); // false
```

### Test Case 2: Manager User

```javascript
const managerUser = {
  _id: "456",
  name: "Jane Manager",
  username: "jane.manager",
  role: "manager",
  permissions: [
    "dashboard",
    "pos",
    "inventory",
    "suppliers",
    "purchases",
    "customers",
    "reports",
    "expenses",
  ],
};

// ✅ Can access (8 features)
userHasFeatureAccess(managerUser, "inventory"); // true
userHasFeatureAccess(managerUser, "reports"); // true

// ❌ Cannot access
userHasFeatureAccess(managerUser, "settings"); // false
userHasFeatureAccess(managerUser, "users"); // false
```

### Test Case 3: Owner/Admin (Full Access)

```javascript
const ownerUser = {
  _id: "789",
  name: "Shop Owner",
  username: "owner",
  role: "owner",
  permissions: [
    "dashboard",
    "pos",
    "inventory",
    "suppliers",
    "purchases",
    "customers",
    "reports",
    "expenses",
    "settings",
    "users",
  ],
};

// ✅ Can access everything
userHasFeatureAccess(ownerUser, "dashboard"); // true
userHasFeatureAccess(ownerUser, "settings"); // true
userHasFeatureAccess(ownerUser, "users"); // true
userHasAllFeatures(ownerUser, ["dashboard", "pos", "inventory"]); // true
```

## API Integration Examples

### Request with Permissions

```javascript
// Creating a user with specific permissions
const response = await api.post("/users/staff", {
  name: "Custom Cashier",
  username: "custom.cashier",
  password: "Secure@123",
  role: "cashier",
  permissions: ["dashboard", "pos"], // Custom permissions
});
```

### Response with Permissions

```json
{
  "_id": "607f1f77bcf86cd799439012",
  "name": "Custom Cashier",
  "username": "custom.cashier",
  "role": "cashier",
  "phone": null,
  "permissions": ["dashboard", "pos"],
  "isActive": true,
  "createdAt": "2026-02-05T10:00:00Z",
  "updatedAt": "2026-02-05T10:00:00Z"
}
```

---

These examples provide a complete implementation pattern for integrating feature-based access control throughout your application.
