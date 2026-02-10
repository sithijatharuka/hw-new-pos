# Feature Permission System - Integration Guide

## Quick Start

The feature permission system has been fully implemented. Here's what was added:

### Files Created/Modified

#### Backend

✅ **Modified**: `backend/src/models/User.js`

- Added `permissions` field to store array of feature IDs

✅ **Created**: `backend/src/utils/featurePermissions.js`

- `AVAILABLE_FEATURES` - All 10 system features
- `DEFAULT_FEATURES_BY_ROLE` - Default permissions by role
- Helper functions for validation

✅ **Modified**: `backend/src/routes/userRoutes.js`

- Updated POST `/users/staff` to accept and validate permissions
- Updated PUT `/users/:userId` to accept and validate permissions

✅ **Modified**: `backend/src/middleware/authMiddleware.js`

- Added `requireFeature(featureId)` middleware for route protection

✅ **Created**: `backend/scripts/backfillPermissions.js`

- Migration script to backfill existing users with default permissions

#### Frontend

✅ **Created**: `frontend/src/utils/featurePermissions.js`

- `AVAILABLE_FEATURES` with descriptions and icons
- `DEFAULT_FEATURES_BY_ROLE` matching backend
- Helper functions for permission checks

✅ **Created**: `frontend/src/utils/permissionHelper.js`

- `userHasFeatureAccess(user, featureId)`
- `userHasAllFeatures(user, featureIds)`
- `userHasAnyFeature(user, featureIds)`
- `getUserFeatures(user)`

✅ **Modified**: `frontend/src/components/users/EditStaffModal.jsx`

- Added "Feature Permissions" section with checkboxes
- Features organized by category
- Auto-updates when role changes
- Sends permissions in API payload

#### Documentation

✅ **Created**: `FEATURE_PERMISSIONS.md` - Complete reference guide
✅ **This file** - Integration guide

## Implementation Status

### ✅ Completed

- User model supports permissions
- API endpoints accept/store permissions
- Modal UI for selecting features
- Backend middleware for feature checks
- Helper utilities for permission checks
- Comprehensive documentation

### 🚧 Ready to Implement (Next Steps)

1. **Protect routes** - Add `requireFeature()` middleware to existing routes
2. **Hide UI elements** - Use permission helpers to conditionally show navigation
3. **Migrate existing data** - Run backfill script if you have existing users
4. **Test the system** - Create users with different permissions and verify access

## Step-by-Step Integration

### Step 1: Run Migration (If Needed)

If you have existing users in your database:

```bash
cd backend
node scripts/backfillPermissions.js
```

This will add default permissions to all existing users based on their role.

### Step 2: Protect Routes in Backend

Add the `requireFeature()` middleware to routes that require specific features:

```javascript
import { protect, requireFeature } from "../middleware/authMiddleware.js";

// Example: Dashboard route requires "dashboard" feature
router.get(
  "/dashboard/stats",
  protect,
  requireFeature("dashboard"),
  dashboardController,
);

// Example: POS route requires "pos" feature
router.post("/sales", protect, requireFeature("pos"), createSaleController);
```

**Route-Feature Mapping Guide:**

| Feature     | Routes to Protect                |
| ----------- | -------------------------------- |
| `dashboard` | `/dashboard/*`                   |
| `pos`       | `/sales/*`                       |
| `inventory` | `/items/*`, `/stock-movements/*` |
| `suppliers` | `/suppliers/*`                   |
| `purchases` | `/purchases/*`, `/grn/*`         |
| `customers` | `/customers/*`                   |
| `reports`   | `/reports/*`                     |
| `expenses`  | `/expenses/*`                    |
| `settings`  | `/settings/*`                    |
| `users`     | `/users/staff`, `/users/:userId` |

### Step 3: Control Frontend Navigation

Update the frontend to hide/disable navigation for features user doesn't have access to:

```javascript
import { userHasFeatureAccess } from "../utils/permissionHelper";

// In a navigation component
const Navigation = ({ user }) => {
  return (
    <nav>
      {userHasFeatureAccess(user, "dashboard") && (
        <a href="/dashboard">Dashboard</a>
      )}
      {userHasFeatureAccess(user, "pos") && <a href="/pos">POS</a>}
      {userHasFeatureAccess(user, "inventory") && (
        <a href="/inventory">Inventory</a>
      )}
      {/* ... more features ... */}
    </nav>
  );
};
```

### Step 4: Add Route-Level Protection (Frontend)

In your router configuration, protect routes:

```javascript
import { userHasFeatureAccess } from "../utils/permissionHelper";

// Create a protected route component
const FeatureRoute = ({ user, feature, element }) => {
  if (!userHasFeatureAccess(user, feature)) {
    return <AccessDenied feature={feature} />;
  }
  return element;
};

// Use in router
<Route
  path="/pos"
  element={<FeatureRoute user={user} feature="pos" element={<POSPage />} />}
/>;
```

### Step 5: Test the System

1. **Create a Cashier user:**
   - Name: Test Cashier
   - Role: Cashier
   - Permissions: Dashboard, POS, Customers (auto-selected)
   - ✅ Should only see Dashboard, POS, Customers in UI

2. **Create a Manager user:**
   - Name: Test Manager
   - Role: Manager
   - Permissions: All 8 default manager features
   - ✅ Should see Dashboard, POS, Inventory, etc.

3. **Create a Custom user:**
   - Name: Inventory Only
   - Role: Cashier
   - Permissions: Manually select just Inventory
   - ✅ Should only see Inventory feature

## API Testing

### Create User with Permissions

```bash
curl -X POST http://localhost:5000/api/users/staff \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Cashier",
    "username": "john.cashier",
    "password": "Secure@123",
    "role": "cashier",
    "permissions": ["dashboard", "pos", "customers"]
  }'
```

### Update User Permissions

```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["dashboard", "pos", "customers", "inventory"]
  }'
```

### Check What Permissions User Has

Look for the `permissions` field in the user response:

```json
{
  "_id": "...",
  "name": "John Cashier",
  "username": "john.cashier",
  "role": "cashier",
  "permissions": ["dashboard", "pos", "customers"],
  "isActive": true
}
```

## Troubleshooting

### "Feature not found" error

- Check that feature ID matches exactly (case-sensitive)
- Verify feature exists in `AVAILABLE_FEATURES`

### User can't access feature in UI but they should

- Check user's permissions array in database
- Clear browser cache and refresh token
- Verify route has proper permission check

### Modal not showing permission checkboxes

- Check that `featurePermissions.js` is imported
- Verify `AVAILABLE_FEATURES` and `DEFAULT_FEATURES_BY_ROLE` are exported
- Check browser console for import errors

## Best Practices

1. **Always protect routes** - Add `requireFeature()` to every route that requires specific access
2. **Use permission helpers** - Don't manually check arrays; use helper functions
3. **Test permission combinations** - Test users with different permission sets
4. **Document dependencies** - Some features depend on others (e.g., POS might need Customers)
5. **Handle denials gracefully** - Show friendly error messages, not raw 403 errors

## Feature Relationships

Some features naturally depend on others:

- **POS** works best with **Customers** (for credit sales)
- **Purchases** might need **Suppliers** and **Inventory**
- **Reports** can work with any business feature
- **Settings** is typically admin-only

Consider these when designing permission sets for custom roles.

## Support

For more details, see:

- `FEATURE_PERMISSIONS.md` - Complete reference documentation
- `frontend/src/utils/featurePermissions.js` - Feature definitions
- `backend/src/utils/featurePermissions.js` - Backend validation
- `frontend/src/utils/permissionHelper.js` - Permission checking utilities

## Next Steps

1. ✅ Run migration script for existing users
2. ⬜ Add `requireFeature()` middleware to all backend routes
3. ⬜ Hide navigation items based on user permissions
4. ⬜ Add route-level protection on frontend
5. ⬜ Test with different user permission combinations
6. ⬜ Deploy to production

---

**Implementation Date:** February 5, 2026  
**System Version:** Feature Permissions v1.0
