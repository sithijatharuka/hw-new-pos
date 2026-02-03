import React, { useEffect, useState } from "react";
import AppLoader from "../common/AppLoader";
import { colors } from "../../themes/colors";
import regexValidations from "../../utils/regexValidations";

const roleOptions = [
  { value: "cashier", label: "Cashier" },
  { value: "manager", label: "Manager" },
];

const EditStaffModal = ({
  open,
  user,
  onClose,
  onSubmit,
  saving,
  api,
  mode = "edit",
}) => {
  const isCreateMode = mode === "create";

  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    role: "cashier",
    newPassword: "",
    confirmPassword: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (isCreateMode) {
        // Reset form for create mode
        setForm({
          name: "",
          username: "",
          phone: "",
          role: "cashier",
          newPassword: "",
          confirmPassword: "",
          isActive: true,
        });
      } else if (user) {
        // Load user data for edit mode
        setForm({
          name: user.name || "",
          username: user.username || "",
          phone: user.phone || "",
          role: user.role || "cashier",
          newPassword: "",
          confirmPassword: "",
          isActive: user.isActive !== false,
        });
      }
      setErrors({});
    }
  }, [open, user, isCreateMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (fieldName, value) => {
    const fieldErrors = {};

    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          fieldErrors.name = "Full name is required.";
        } else if (value.trim().length < 2) {
          fieldErrors.name = "Full name must be at least 2 characters.";
        } else if (!regexValidations.name.test(value)) {
          fieldErrors.name =
            "Full name must contain at least 2 words (letters only, separated by spaces).";
        }
        break;

      case "username":
        if (!value.trim()) {
          fieldErrors.username = "Username is required.";
        } else if (!regexValidations.username.test(value)) {
          fieldErrors.username =
            "Username must be 4-20 characters, start with a letter, and contain only letters, numbers, and underscores.";
        }
        break;

      case "phone":
        if (value && !regexValidations.phone.test(value)) {
          fieldErrors.phone =
            "Phone number must be a valid 9-digit number starting with 7 (without +94).";
        }
        break;

      case "newPassword":
        if (isCreateMode && !value) {
          fieldErrors.newPassword = "Password is required.";
        } else if (value && !regexValidations.password.test(value)) {
          fieldErrors.newPassword =
            "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&).";
        }
        break;

      case "confirmPassword":
        if (isCreateMode && !value) {
          fieldErrors.confirmPassword = "Please confirm your password.";
        } else if (value !== form.newPassword) {
          fieldErrors.confirmPassword = "Passwords do not match.";
        }
        break;

      default:
        break;
    }

    return fieldErrors;
  };

  const validateForm = () => {
    const newErrors = {};

    const nameErrors = validateField("name", form.name);
    const phoneErrors = validateField("phone", form.phone);
    const newPasswordErrors = validateField("newPassword", form.newPassword);
    const confirmPasswordErrors = validateField(
      "confirmPassword",
      form.confirmPassword,
    );

    // Validate username in create mode
    if (isCreateMode) {
      const usernameErrors = validateField("username", form.username);
      Object.assign(newErrors, usernameErrors);
    }

    Object.assign(
      newErrors,
      nameErrors,
      phoneErrors,
      newPasswordErrors,
      confirmPasswordErrors,
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: form.name,
      phone: form.phone || undefined,
      role: form.role,
    };

    // Add username for create mode
    if (isCreateMode) {
      payload.username = form.username;
      payload.password = form.newPassword;
      payload.confirmPassword = form.confirmPassword;
    } else {
      // Only include password if provided in edit mode
      payload.isActive = form.isActive;
      if (form.newPassword) {
        payload.password = form.newPassword;
      }
    }

    await onSubmit(payload);
  };

  if (!open) return null;

  const inputBase =
    "w-full rounded-2xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 " +
    "shadow-sm focus:shadow-md " +
    "disabled:opacity-70 disabled:cursor-not-allowed " +
    "placeholder:opacity-60";

  const labelBase =
    "block mb-1.5 text-xs font-semibold tracking-wide select-none";

  const buttonBase =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold " +
    "transition-all duration-200 ease-out " +
    "shadow-sm hover:shadow-md active:scale-[0.99] " +
    "disabled:opacity-70 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/75 backdrop-blur-sm">
      <div
        className="w-full max-w-lg duration-200 shadow-2xl rounded-3xl animate-in fade-in"
        style={{
          background: colors.background.secondary,
          border: `1px solid ${colors.border.light}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-5 py-4 border-b sm:px-6 sm:py-5"
          style={{ borderBottomColor: colors.border.light }}
        >
          <div>
            <h2
              className="text-lg font-extrabold tracking-tight sm:text-xl"
              style={{ color: colors.text.primary }}
            >
              {isCreateMode ? "Create Staff User" : "Edit Staff User"}
            </h2>
            <p
              className="mt-1 text-[11px] sm:text-xs"
              style={{ color: colors.text.tertiary }}
            >
              {isCreateMode
                ? "Add a new cashier or manager account"
                : `Update ${user?.name || "user"}'s details`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-9 h-9 rounded-xl text-text-tertiary hover:bg-background-subtle"
            aria-label="Close modal"
          >
            ?
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 sm:p-6">
          <div>
            <label
              className={labelBase}
              style={{ color: colors.text.secondary }}
            >
              Full name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Nimal Perera"
              className={inputBase}
              style={{
                background: colors.background.primary,
                border: `1px solid ${colors.border.light}`,
                color: colors.text.primary,
              }}
              disabled={saving}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-status-error-text">
                {errors.name}
              </p>
            )}
          </div>

          {isCreateMode && (
            <div>
              <label
                className={labelBase}
                style={{ color: colors.text.secondary }}
              >
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g., nimal.staff"
                className={inputBase}
                style={{
                  background: colors.background.primary,
                  border: `1px solid ${colors.border.light}`,
                  color: colors.text.primary,
                }}
                disabled={saving}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-status-error-text">
                  {errors.username}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              className={labelBase}
              style={{ color: colors.text.secondary }}
            >
              Phone (optional)
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="7XXXXXXXX"
              className={inputBase}
              style={{
                background: colors.background.primary,
                border: `1px solid ${colors.border.light}`,
                color: colors.text.primary,
              }}
              disabled={saving}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-status-error-text">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              className={labelBase}
              style={{ color: colors.text.secondary }}
            >
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={inputBase}
              style={{
                background: colors.background.primary,
                border: `1px solid ${colors.border.light}`,
                color: colors.text.primary,
              }}
              disabled={saving}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {!isCreateMode && (
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                disabled={saving}
              />
              <span style={{ color: colors.text.secondary }}>
                Active account
              </span>
            </label>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className={labelBase}
                style={{ color: colors.text.secondary }}
              >
                {isCreateMode ? "Password" : "New password"}
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder={
                  isCreateMode ? "Set a password" : "Leave blank to keep"
                }
                className={inputBase}
                style={{
                  background: colors.background.primary,
                  border: `1px solid ${colors.border.light}`,
                  color: colors.text.primary,
                }}
                disabled={saving}
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-status-error-text">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label
                className={labelBase}
                style={{ color: colors.text.secondary }}
              >
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={inputBase}
                style={{
                  background: colors.background.primary,
                  border: `1px solid ${colors.border.light}`,
                  color: colors.text.primary,
                }}
                disabled={saving}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-status-error-text">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={buttonBase}
              style={{
                background: colors.background.subtle,
                color: colors.text.primary,
                border: `1px solid ${colors.border.light}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={
                buttonBase +
                " cursor-pointer hover:-translate-y-[1px] active:translate-y-0 bg-primary text-white hover:bg-primary/90"
              }
            >
              {isCreateMode ? "Create staff" : "Save changes"}
            </button>
          </div>

          {saving && (
            <div className="pt-2">
              <AppLoader
                open
                variant="inline"
                title={
                  isCreateMode ? "Creating staff user" : "Saving staff changes"
                }
                subtitle="Applying updates to the staff record"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditStaffModal;
