# Toast Message Standardization Guide

## Overview

All toast notifications across the application now use a centralized, consistent standard implemented through the `toastHelper.js` utility. This ensures a unified look, feel, and behavior across the entire application.

## Key Implementation Details

### 1. Centralized Toaster Configuration

- **Location**: `src/App.jsx`
- **Position**: `top-right`
- **Features**:
  - Consistent styling across all pages
  - Standard duration: 4000ms (4 seconds)
  - Centered container with pointer events disabled

### 2. Toast Helper Utility

- **Location**: `src/utils/toastHelper.js`
- **Exports**:

#### Core Functions

```javascript
// Success, Error, Info, Warning toasts
showSuccess(message, options);
showError(message, options);
showInfo(message, options);
showWarning(message, options);

// Custom content
showCustom(content, options);

// Dismissal
dismissToast(toastId);
dismissAll();

// Loading states
showLoading(message);
updateLoadingToSuccess(toastId, message);
updateLoadingToError(toastId, message);

// Confirmation dialogs
confirmAction(message, title); // Returns Promise<boolean>
```

#### Predefined Message Constants

```javascript
// Success messages
successMessages.create(entity); // "Item created successfully"
successMessages.update(entity); // "Item updated successfully"
successMessages.delete(entity); // "Item deleted successfully"
successMessages.save(entity); // "Item saved successfully"
successMessages.added(entity); // "Item added successfully"
successMessages.activated(entity); // "Item activated"
successMessages.deactivated(entity); // "Item deactivated"
successMessages.logout;
successMessages.login;
successMessages.paymentReceived;
successMessages.paymentRecorded;
successMessages.synced;

// Error messages
errorMessages.load(entity); // "Failed to load items"
errorMessages.create(entity); // "Failed to create item"
errorMessages.update(entity); // "Failed to update item"
errorMessages.delete(entity); // "Failed to delete item"
errorMessages.save(entity); // "Failed to save item"
errorMessages.validation;
errorMessages.network;
errorMessages.unauthorized;
errorMessages.invalidInput;
errorMessages.permission;
errorMessages.postFailed(entity);
errorMessages.cannotEdit;
errorMessages.cannotDelete;
errorMessages.cannotPost;
errorMessages.inactive(entity);
errorMessages.required(fieldName);
```

#### Helper Functions

```javascript
// Format API error messages
getErrorMessage(err, fallbackMessage);

// Prompt user to confirm action
confirmAction(message, title); // Returns Promise<boolean>
```

### 3. Visual Styling

All toasts follow a consistent design system:

#### Success Toast

- **Colors**: bg-green-50, border-green-200, text-green-900
- **Icon**: ✓
- **Duration**: 4 seconds

#### Error Toast

- **Colors**: bg-red-50, border-red-200, text-red-900
- **Icon**: ✕
- **Duration**: 4 seconds

#### Info Toast

- **Colors**: bg-blue-50, border-blue-200, text-blue-900
- **Icon**: ℹ
- **Duration**: 4 seconds

#### Warning Toast

- **Colors**: bg-yellow-50, border-yellow-200, text-yellow-900
- **Icon**: ⚠
- **Duration**: 4 seconds

#### Custom/Confirmation Dialog

- **Colors**: white with gray border
- **Features**: Drop shadow, rounded corners, fade in/out transitions
- **Buttons**: Cancel (outline), Confirm (red background)
- **Duration**: Persistent until user action

## Migration Guide

### Before (Old Way)

```javascript
import toast from "react-hot-toast";

// Old style - inconsistent messages
toast.success("Customer created successfully!");
toast.error("Failed to save customer.");
toast.info("Coming soon");
```

### After (New Way)

```javascript
import {
  showSuccess,
  showError,
  showInfo,
  successMessages,
  errorMessages,
} from "../utils/toastHelper";

// Standardized messages
showSuccess(successMessages.create("Customer"));
showError(errorMessages.save("customer"));
showInfo("Feature coming soon");
```

## Common Patterns

### CRUD Operations

```javascript
// Create
try {
  const result = await createItem(api, data);
  showSuccess(successMessages.create("Item"));
} catch (err) {
  showError(err?.response?.data?.message || errorMessages.create("item"));
}

// Update
try {
  const result = await updateItem(api, id, data);
  showSuccess(successMessages.update("Item"));
} catch (err) {
  showError(err?.response?.data?.message || errorMessages.update("item"));
}

// Delete
try {
  await deleteItem(api, id);
  showSuccess(successMessages.delete("Item"));
} catch (err) {
  showError(err?.response?.data?.message || errorMessages.delete("item"));
}
```

### Loading States

```javascript
const toastId = showLoading("Processing...");

try {
  const result = await heavyOperation();
  updateLoadingToSuccess(toastId, "Done!");
} catch (err) {
  updateLoadingToError(toastId, "Operation failed");
}
```

### Confirmation Dialogs

```javascript
const confirmed = await confirmAction(
  "Are you sure you want to delete this item?",
  "Delete Item",
);

if (confirmed) {
  await deleteItem(api, id);
  showSuccess(successMessages.delete("Item"));
}
```

### API Error Handling

```javascript
import { getErrorMessage } from "../utils/toastHelper";

try {
  const result = await api.post("/endpoint", data);
} catch (err) {
  const message = getErrorMessage(err, "Operation failed");
  showError(message);
}
```

## Files Updated

### Pages (All Toaster components removed)

- ✅ `App.jsx` - Central Toaster configuration
- ✅ `pages/OwnerSignupPage.jsx`
- ✅ `pages/ResetPassword.jsx`
- ✅ `pages/SuppliersPage.jsx`
- ✅ `pages/InventoryPage.jsx`
- ✅ `pages/CustomersPage.jsx`
- ✅ `pages/UsersPage.jsx`
- ✅ `pages/POSPage.jsx`
- ✅ `pages/ExpensesPage.jsx`

### Components

- ✅ `components/auth/PhoneAuth.jsx`
- ✅ `components/supplier/grnForm/GRNForm.jsx`
- 🔄 Remaining components (see checklist below)

### Utilities

- ✅ `utils/toastHelper.js` - New centralized utility

## Remaining Components Checklist

The following components still need to be updated:

- [ ] `components/supplier/grnForm/grnFormModal/GRNFormModal.jsx`
- [ ] `components/supplier/supplierForm/SupplierContactSection.jsx`
- [ ] `components/supplier/supplierForm/supplierFormModal/SupplierFormModal.jsx`
- [ ] `components/inventory/ItemDetailModal.jsx`
- [ ] `components/inventory/product/addProduct/AddNewItem.jsx`
- [ ] `components/inventory/product/addProduct/productForm/EssentialInformation.jsx`
- [ ] `components/inventory/confirmDialog.jsx`
- [ ] `components/customer/ReceivePaymentModal.jsx`
- [ ] `hooks/useCustomers.js`
- [ ] Any other components using `import toast from "react-hot-toast"`

## Updating Remaining Components

For each component still using old toast:

1. **Replace imports**:

   ```javascript
   // OLD
   import toast from "react-hot-toast";
   // or
   import toast, { Toaster } from "react-hot-toast";

   // NEW
   import {
     showSuccess,
     showError,
     successMessages,
     errorMessages,
   } from "../utils/toastHelper";
   ```

2. **Remove Toaster component**: Delete any `<Toaster ... />` elements

3. **Replace toast calls**:

   ```javascript
   // OLD
   toast.success("Item saved successfully");
   toast.error("Failed to save item");

   // NEW
   showSuccess(successMessages.save("Item"));
   showError(errorMessages.save("item"));
   ```

4. **Use consistent error patterns**:

   ```javascript
   // OLD
   catch (err) {
     toast.error(err?.response?.data?.message || "Failed to save");
   }

   // NEW
   catch (err) {
     showError(err?.response?.data?.message || errorMessages.save("item"));
   }
   ```

## Benefits of Standardization

1. **Consistency**: Users see the same toast style everywhere
2. **Maintainability**: Single point of configuration
3. **Accessibility**: Standardized icons and colors
4. **Developer Experience**: Predefined messages reduce typos and inconsistencies
5. **Easy Updates**: Changes to styling apply application-wide
6. **Better UX**: Predictable behavior and timing

## Configuration

To adjust global toast settings, modify `src/utils/toastHelper.js`:

```javascript
const TOAST_CONFIG = {
  default: {
    duration: 4000, // Change global duration
    position: "top-right", // Change position
  },
  short: { duration: 3000 },
  long: { duration: 5000 },
};

const TOAST_STYLES = {
  success: "bg-green-50 ...", // Modify success styling
  error: "bg-red-50 ...", // Modify error styling
  // etc.
};
```

## Future Improvements

- [ ] Add sound notifications (optional)
- [ ] Add animation preferences (respect prefers-reduced-motion)
- [ ] Add toast persistence options
- [ ] Add analytics/logging of toast messages
- [ ] Create toast message template system
- [ ] Add multi-language support for predefined messages
