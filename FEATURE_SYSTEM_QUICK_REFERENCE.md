# Feature Permission System - Quick Reference

## For Developers

### Adding Feature Protection to a New Route

**Backend:**

```javascript
// 1. Update import
import { protect, requireFeature } from "../middleware/authMiddleware.js";

// 2. Add middleware to route
router.get(
  "/endpoint",
  protect,
  requireFeature("feature-id"),
  async (req, res) => {
    // Handler code
  },
);
```

**Frontend:**

```jsx
// 1. Import FeatureRoute
import FeatureRoute from "../components/common/FeatureRoute.jsx";

// 2. Wrap route
<Route
  path="/feature-page"
  element={
    <FeatureRoute featureId="feature-id" user={user}>
      <FeaturePage api={api} />
    </FeatureRoute>
  }
/>

// 3. Add to navigation (Layout.jsx)
{ to: "/feature-page", label: "Feature Page", featureId: "feature-id" }
```

### Feature IDs Reference

- `"dashboard"` - Dashboard & analytics
- `"pos"` - POS billing & sales
- `"inventory"` - Inventory & stock management
- `"suppliers"` - Supplier management
- `"purchases"` - Purchase orders & GRN
- `"customers"` - Customer management
- `"reports"` - Reports & analytics
- `"expenses"` - Expense management
- `"settings"` - Shop settings
- `"users"` - User & staff management

---

## For Testing

### Test User Creation

**Cashier (Limited Access):**

- Role: Cashier
- Features: dashboard, pos, customers (3 features)
- Can: See dashboard, use POS, manage customers
- Cannot: Inventory, purchases, reports, expenses, settings, users

**Manager (Extended Access):**

- Role: Manager
- Features: dashboard, pos, inventory, suppliers, purchases, customers, reports (7 features)
- Can: All manager operations
- Cannot: Settings, user management

**Admin (Full Access):**

- Role: Admin
- Features: All 10 features
- Can: Access everything

### Verification Checklist

When testing a new user:

- [ ] Login succeeds, permissions loaded
- [ ] Navigation shows only allowed features
- [ ] Restricted nav items are hidden (not disabled)
- [ ] Direct URL to restricted feature shows "Access Denied"
- [ ] API calls to restricted endpoints return 403 Forbidden
- [ ] Can navigate to allowed features without issues

---

## For DevOps/Deployment

### Pre-Deployment Verification

**Backend:**

```bash
# Check all route files have requireFeature import and usage
grep -r "requireFeature" backend/src/routes/*.js

# Verify middleware exists
cat backend/src/middleware/authMiddleware.js | grep -A 5 "requireFeature"
```

**Frontend:**

```bash
# Check FeatureRoute component exists
ls -la frontend/src/components/common/FeatureRoute.jsx

# Check App.jsx has FeatureRoute imports
grep "FeatureRoute" frontend/src/App.jsx

# Check Layout.jsx has feature checks
grep "userHasFeatureAccess" frontend/src/components/common/Layout.jsx
```

### Monitoring in Production

**Permission Denials:**

- Monitor API 403 responses with X-Denied-Feature header
- Alert on unusual denial patterns (potential attacks)
- Log permission denials for audit trail

**User Permissions:**

- Verify user tokens include permissions array
- Check permission cache expiration
- Monitor permission update latency

---

## Troubleshooting

### Issue: User can access feature but shouldn't

**Solution:**

1. Verify user.permissions includes the feature
2. Check requireFeature middleware is applied to route
3. Clear browser cache and re-login
4. Check token expiration in JWT

### Issue: Feature hidden in nav but accessible via URL

**Solution:**

1. Verify FeatureRoute wrapper is in App.jsx
2. Check featureId matches feature name
3. Verify userHasFeatureAccess() returns false

### Issue: Navigation shows feature but API calls fail with 403

**Solution:**

1. Backend route missing requireFeature middleware
2. Feature ID mismatch between frontend and backend
3. User token doesn't include feature in permissions
4. Token expired - need re-login

### Issue: Can't create user with specific permissions

**Solution:**

1. Open EditStaffModal
2. Select role (auto-fills defaults)
3. Manually check/uncheck individual features
4. Verify checkboxes state before save
5. Check browser console for validation errors

---

## Permission System Flow Diagram

```
User Login
    ↓
Backend returns JWT with permissions array
    ↓
Frontend stores user + permissions
    ↓
Navigation Component
  ├→ Checks userHasFeatureAccess() for each nav item
  ├→ Hides items where access = false
  └→ Shows only accessible features
    ↓
User clicks on feature
    ↓
FeatureRoute Component
  ├→ Checks userHasFeatureAccess()
  ├→ If allowed: renders page
  └→ If denied: shows "Access Denied"
    ↓
Page makes API calls
    ↓
Backend Middleware
  ├→ Checks protect() - is user logged in?
  ├→ Checks requireFeature() - does user have permission?
  ├→ If allowed: executes handler
  └→ If denied: returns 403 Forbidden
```

---

## Configuration

### Adding a New Feature

1. **Backend** (`backend/src/utils/featurePermissions.js`):

```javascript
export const AVAILABLE_FEATURES = [
  // ...existing features...
  { id: "new-feature", name: "New Feature", description: "..." }
];

export const DEFAULT_FEATURES_BY_ROLE = {
  cashier: [..., "new-feature"],  // or not
  manager: [..., "new-feature"],  // or not
  admin: [...],  // always has all
};
```

2. **Frontend** (`frontend/src/utils/featurePermissions.js`):

```javascript
// Same structure as backend
export const AVAILABLE_FEATURES = [
  // ...
  { id: "new-feature", name: "New Feature", description: "..." },
];
```

3. **Add Route** (`backend/src/routes/newRoutes.js`):

```javascript
import { protect, requireFeature } from "../middleware/authMiddleware.js";
router.get("/", protect, requireFeature("new-feature"), async (req, res) => { ... });
```

4. **Add Navigation** (`frontend/src/components/common/Layout.jsx`):

```javascript
const navItems = [
  // ...
  { to: "/new-feature", label: "New Feature", featureId: "new-feature" },
];
```

5. **Protect Routes** (`frontend/src/App.jsx`):

```jsx
<Route
  path="/new-feature"
  element={
    <FeatureRoute featureId="new-feature" user={user}>
      <NewFeaturePage api={api} />
    </FeatureRoute>
  }
/>
```

---

## Key Files

| File                                               | Purpose                     | Modified      |
| -------------------------------------------------- | --------------------------- | ------------- |
| `backend/src/middleware/authMiddleware.js`         | requireFeature middleware   | No (existing) |
| `backend/src/routes/*.js`                          | Route protection (10 files) | Yes           |
| `frontend/src/components/common/FeatureRoute.jsx`  | Route wrapper               | Created       |
| `frontend/src/components/common/Layout.jsx`        | Navigation filtering        | Yes           |
| `frontend/src/App.jsx`                             | Route protection            | Yes           |
| `frontend/src/utils/permissionHelper.js`           | Permission utilities        | No (existing) |
| `frontend/src/components/users/EditStaffModal.jsx` | Permission UI               | No (existing) |

---

## Support

For questions or issues:

1. Check [FEATURE_PERMISSION_IMPLEMENTATION.md](./FEATURE_PERMISSION_IMPLEMENTATION.md)
2. Review [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
3. Check test scenarios in [TESTING_SCENARIOS.md](./TESTING_SCENARIOS.md)
4. Review API documentation in [FEATURE_API_DOCS.md](./FEATURE_API_DOCS.md)
