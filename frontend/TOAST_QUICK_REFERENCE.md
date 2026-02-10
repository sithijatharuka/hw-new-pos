# Toast Helper - Quick Reference

## Import

```javascript
import {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  successMessages,
  errorMessages,
  confirmAction,
  showLoading,
  updateLoadingToSuccess,
  updateLoadingToError,
  getErrorMessage,
  dismissToast,
  dismissAll,
} from "../utils/toastHelper";
```

## Basic Usage

### Success Message

```javascript
// With predefined message
showSuccess(successMessages.create("Item"));

// With custom message
showSuccess("Operation completed successfully");
```

### Error Message

```javascript
// With predefined message
showError(errorMessages.save("item"));

// With API error fallback
showError(err?.response?.data?.message || errorMessages.delete("item"));

// Quick helper
showError(getErrorMessage(err, errorMessages.load("items")));
```

### Info Message

```javascript
showInfo("Feature coming soon");
```

### Warning Message

```javascript
showWarning("This action is irreversible");
```

## CRUD Operations Pattern

### Create

```javascript
try {
  const result = await createItem(api, data);
  showSuccess(successMessages.create("Item"));
} catch (err) {
  showError(err?.response?.data?.message || errorMessages.create("item"));
}
```

### Update

```javascript
try {
  const result = await updateItem(api, id, data);
  showSuccess(successMessages.update("Item"));
} catch (err) {
  showError(err?.response?.data?.message || errorMessages.update("item"));
}
```

### Delete

```javascript
try {
  await deleteItem(api, id);
  showSuccess(successMessages.delete("Item"));
} catch (err) {
  showError(err?.response?.data?.message || errorMessages.delete("item"));
}
```

### Save (generic)

```javascript
try {
  await saveItem(api, id, data);
  showSuccess(successMessages.save("Item"));
} catch (err) {
  showError(err?.response?.data?.message || errorMessages.save("item"));
}
```

## Confirmation Dialog

```javascript
const confirmed = await confirmAction(
  "Are you sure you want to delete this item?",
  "Delete Item",
);

if (confirmed) {
  // Perform action
  await deleteItem(api, id);
  showSuccess(successMessages.delete("Item"));
}
```

## Loading States

```javascript
// Start loading
const toastId = showLoading("Processing your request...");

try {
  const result = await heavyOperation();
  updateLoadingToSuccess(toastId, "Operation completed!");
} catch (err) {
  updateLoadingToError(toastId, "Operation failed. Please try again.");
}
```

## Predefined Messages

### Success Messages

```javascript
successMessages.create("Item"); // "Item created successfully"
successMessages.update("Item"); // "Item updated successfully"
successMessages.delete("Item"); // "Item deleted successfully"
successMessages.save("Item"); // "Item saved successfully"
successMessages.added("Item"); // "Item added successfully"
successMessages.activated("Item"); // "Item activated"
successMessages.deactivated("Item"); // "Item deactivated"
successMessages.logout; // "Logged out successfully"
successMessages.login; // "Logged in successfully"
successMessages.paymentReceived; // "Payment received successfully"
successMessages.paymentRecorded; // "Payment recorded successfully"
successMessages.synced; // "Saved offline. Will sync when online."
```

### Error Messages

```javascript
errorMessages.load("items"); // "Failed to load items"
errorMessages.create("item"); // "Failed to create item"
errorMessages.update("item"); // "Failed to update item"
errorMessages.delete("item"); // "Failed to delete item"
errorMessages.save("item"); // "Failed to save item"
errorMessages.validation; // "Please fix all errors before submitting"
errorMessages.network; // "Network error. Please try again."
errorMessages.unauthorized; // "You are not authorized to perform this action"
errorMessages.invalidInput; // "Invalid input. Please check your entries."
errorMessages.permission; // "You don't have permission to perform this action"
errorMessages.postFailed("Item"); // "Failed to post Item"
errorMessages.cannotEdit; // "Only draft items can be edited"
errorMessages.cannotDelete; // "Only draft items can be deleted"
errorMessages.cannotPost; // "Only draft items can be posted"
errorMessages.inactive("item"); // "This item is inactive"
errorMessages.required("field"); // "field is required"
```

## Custom Options

```javascript
// Custom duration
showSuccess("Saved!", { duration: 2000 });

// Short duration
showError(message, { duration: 3000 });

// Long duration
showWarning(message, { duration: 6000 });

// Infinite duration (for loading states)
const id = showLoading("Processing...");
// Show indefinitely until dismissed
```

## Common Scenarios

### Validation Error

```javascript
if (!validateForm()) {
  showError(errorMessages.validation);
  return;
}
```

### Payment Validation

```javascript
if (amount < 0) {
  showError("Amount must be greater than 0");
  return;
}
if (amount > balance) {
  showError("Payment exceeds outstanding balance");
  return;
}
```

### Conditional Success/Error

```javascript
if (success) {
  showSuccess(
    editingUser
      ? successMessages.update("User")
      : successMessages.create("User"),
  );
} else {
  showError(errorMessages.save("user"));
}
```

### Multiple Field Validation

```javascript
const errors = validateForm(form);
if (Object.keys(errors).length > 0) {
  showError(errorMessages.validation);
  setErrors(errors);
  return;
}
```

### Success with Navigation

```javascript
try {
  const result = await createItem(api, data);
  showSuccess(successMessages.create("Item"));
  setTimeout(() => navigate("/items"), 800); // Wait for toast fade
} catch (err) {
  showError(err?.response?.data?.message || errorMessages.create("item"));
}
```

## DO's and DON'Ts

### ✅ DO

- Use predefined messages for consistency
- Include entity name in messages (Item, Customer, User, etc.)
- Use `getErrorMessage()` for API errors
- Provide meaningful error messages to users
- Use confirmation dialogs for destructive actions
- Handle errors appropriately before showing toast

### ❌ DON'T

- Import `toast` directly from "react-hot-toast"
- Render `<Toaster />` component in pages
- Use inconsistent message formats
- Show technical error messages without fallback
- Mix old and new toast methods
- Ignore validation before showing success message
- Use setTimeout for critical operations with toasts

## File Locations

- **Utility**: `src/utils/toastHelper.js`
- **Documentation**: `frontend/TOAST_STANDARDIZATION.md`
- **Examples**: Check any updated page or component file

## Support

For more details, see `frontend/TOAST_STANDARDIZATION.md`
