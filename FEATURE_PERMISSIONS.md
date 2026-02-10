# Feature Permission System Documentation

## Overview

The POS system now supports **feature-based access control**. When creating or editing staff accounts, administrators can select which system features each user should have access to. Only the selected features will be accessible to that user.

## Available Features

The system supports 10 main features, organized into categories:

### Core Features

- **Dashboard** (📊) - View sales overview and key metrics
- **POS (Point of Sale)** (🛒) - Create and manage sales transactions

### Stock Management

- **Inventory** (📦) - Manage stock, items, and GRN
- **Suppliers** (🏭) - Manage supplier information
- **Purchases** (📥) - Create and manage purchase orders

### People Management

- **Customers** (👥) - Manage customer information and credit

### Analytics

- **Reports** (📈) - View sales, inventory, and financial reports

### Finance

- **Expenses** (💸) - Track and manage business expenses

### Administration

- **Settings** (⚙️) - Configure shop and system settings
- **User Management** (👤) - Create and manage staff accounts

## Default Feature Sets by Role

### Cashier (Default)

- Dashboard
- POS
- Customers

### Manager

- Dashboard
- POS
- Inventory
- Suppliers
- Purchases
- Customers
- Reports
- Expenses

### Admin / Owner

- All Features (full access)

## How to Use

### Creating a User with Custom Permissions

1. Go to **User Management** page
2. Click **"Create staff"** button
3. Fill in user details (name, username, password, phone)
4. Select a **Role** (Cashier or Manager)
   - The system will automatically suggest default features for that role
5. Customize **Feature Permissions** by checking/unchecking features
6. Click **"Create staff"** to save

### Editing User Permissions

1. Click **"Edit"** on a staff user in the list
2. Modify the **Feature Permissions** section
3. You can change individual features without affecting other fields
4. Click **"Save changes"**

### Automatic Role Updates

When you change a user's **Role**, the system automatically updates their permissions to match the default feature set for that role. You can then customize further if needed.

## Implementation Details

### Backend

#### User Model (`backend/src/models/User.js`)

```javascript
permissions: {
  type: [String],
  default: function() {
    return DEFAULT_FEATURES_BY_ROLE[this.role] || DEFAULT_FEATURES_BY_ROLE.cashier;
  }
}
```

The `permissions` field stores an array of feature IDs the user can access.

#### Feature Permissions Utility (`backend/src/utils/featurePermissions.js`)

- `AVAILABLE_FEATURES` - List of all system features with metadata
- `DEFAULT_FEATURES_BY_ROLE` - Default permission sets by role
- `validateFeatures()` - Validates that provided features are valid
- `getFeaturesByRole()` - Returns default features for a role

#### Permission Middleware (`backend/src/middleware/authMiddleware.js`)

```javascript
export const requireFeature = (featureId) => {
  // Middleware to check if user has access to a feature
};
```

Usage in routes:

```javascript
router.get(
  "/dashboard",
  protect,
  requireFeature("dashboard"),
  dashboardController,
);
```

#### API Updates

- **POST /users/staff** - Now accepts `permissions` array in request body
- **PUT /users/:userId** - Now accepts `permissions` array to update user permissions

### Frontend

#### Feature Permissions Utility (`frontend/src/utils/featurePermissions.js`)

- `AVAILABLE_FEATURES` - List of all system features
- `DEFAULT_FEATURES_BY_ROLE` - Default permission sets
- `getFeaturesByRole()` - Get default features for a role
- `hasFeatureAccess()` - Check if user has access to a feature

#### Permission Helper (`frontend/src/utils/permissionHelper.js`)

```javascript
userHasFeatureAccess(user, featureId); // Check single feature
userHasAllFeatures(user, featureIds); // Check multiple features (AND)
userHasAnyFeature(user, featureIds); // Check multiple features (OR)
getUserFeatures(user); // Get all user's features
```

#### Updated EditStaffModal (`frontend/src/components/users/EditStaffModal.jsx`)

- Added "Feature Permissions" section with organized checkboxes
- Features grouped by category (Core, Stock, People, Analytics, Finance, Admin)
- Auto-updates permissions when role is changed
- Submits permissions array with user creation/update request

## Usage Examples

### Frontend - Protecting Routes

```javascript
import { userHasFeatureAccess } from "../utils/permissionHelper";

// In a component
if (!userHasFeatureAccess(user, "pos")) {
  return <AccessDenied />;
}
```

### Frontend - Conditional UI

```javascript
import { userHasFeatureAccess } from "../utils/permissionHelper";

// Show button only if user has access
{
  userHasFeatureAccess(user, "inventory") && (
    <button onClick={() => navigate("/inventory")}>Go to Inventory</button>
  );
}
```

### Backend - Protecting Routes

```javascript
import { requireFeature } from "../middleware/authMiddleware";

// Require specific feature
router.get(
  "/reports/sales",
  protect,
  requireFeature("reports"),
  reportController,
);
```

## Data Migration (If Existing Database)

If you have existing users in your database, you may need to backfill the `permissions` field:

```javascript
// Add default permissions for existing users without permissions
const users = await User.find({ permissions: { $exists: false } });
for (const user of users) {
  user.permissions =
    DEFAULT_FEATURES_BY_ROLE[user.role] || DEFAULT_FEATURES_BY_ROLE.cashier;
  await user.save();
}
```

A migration script can be found at `backend/scripts/backfillPermissions.js` (create if needed).

## API Contract Examples

### Create User with Permissions

```bash
POST /api/users/staff
{
  "name": "John Doe",
  "username": "john.doe",
  "password": "Secure@123",
  "role": "cashier",
  "permissions": ["dashboard", "pos", "customers"]
}
```

### Update User Permissions

```bash
PUT /api/users/65abc123def456
{
  "permissions": ["dashboard", "pos", "customers", "inventory"]
}
```

### Get User (Response includes permissions)

```json
{
  "_id": "65abc123def456",
  "name": "John Doe",
  "username": "john.doe",
  "role": "cashier",
  "permissions": ["dashboard", "pos", "customers"],
  "isActive": true,
  "createdAt": "2025-02-05T10:00:00Z"
}
```

## Best Practices

1. **Always use the permission check middleware** - Add `requireFeature()` to protected routes
2. **Check permissions on frontend** - Hide UI elements users can't access
3. **Validate role changes** - When changing roles, update default permissions
4. **Document feature dependencies** - Some features may depend on others
5. **Audit permission changes** - Consider logging when permissions are modified

## Future Enhancements

Possible future improvements:

- **Permission templates** - Pre-defined permission sets
- **Granular permissions** - More fine-grained access control (e.g., "create invoice" vs "view reports")
- **Permission audit log** - Track all permission changes
- **Expiring permissions** - Temporary access for specific durations
- **Dynamic permission checks** - Real-time permission updates without page refresh

## Troubleshooting

### User can't access a feature they should have

1. Check user's `permissions` array in database
2. Verify the feature ID is correct (case-sensitive)
3. Check that `requireFeature()` middleware is applied to the route

### Permissions not updating in UI

1. Clear browser cache and localStorage
2. Check API response includes updated permissions
3. Verify the user's session is refreshed after permission change

### Feature shows for user but middleware rejects

1. Ensure feature IDs match exactly (database vs code)
2. Check that owner/admin bypass works (they should always have access)
3. Verify `permissions` field exists in user document
