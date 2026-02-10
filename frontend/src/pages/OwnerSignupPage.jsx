import React, { useMemo, useState, useCallback } from "react";
import AppLoader from "../components/common/AppLoader";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createOwner } from "../api/users/users";
import regexValidations from "../utils/regexValidations";
import { showSuccess, showError } from "../utils/toastHelper";

const OwnerSignupPage = ({ api }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  // Use centralized regexValidations
  const regex = useMemo(
    () => ({
      name: regexValidations.name,
      username: regexValidations.username,
      phone: regexValidations.phone,
      password: regexValidations.password,
    }),
    [],
  );

  const validateField = useCallback(
    (name, value, nextForm = form) => {
      if (name === "name") {
        if (!regex.name.test(value)) {
          return "Enter a real full name (e.g. Vinayak Mahadevan)";
        }
      }

      if (name === "username") {
        if (!regex.username.test(value)) {
          return "Username must start with a letter, 4-20 chars, letters/numbers/_ only.";
        }
      }

      if (name === "phone") {
        if (!regex.phone.test(value)) {
          return "Enter a valid Sri Lankan mobile (e.g. 712345678)";
        }
      }

      if (name === "password") {
        if (!regex.password.test(value)) {
          return "Password must be 8+ chars, include upper, lower, number, special.";
        }
      }

      if (name === "confirmPassword") {
        if (!value) return "Please confirm your password";
        if (nextForm.password !== value) {
          return "Passwords do not match";
        }
      }

      return "";
    },
    [regex, form],
  );

  const validate = useCallback(() => {
    const newErrors = {};

    const nameErr = validateField("name", form.name);
    if (nameErr) newErrors.name = nameErr;

    const userErr = validateField("username", form.username);
    if (userErr) newErrors.username = userErr;

    const phoneErr = validateField("phone", form.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const passErr = validateField("password", form.password);
    if (passErr) newErrors.password = passErr;

    const confirmErr = validateField(
      "confirmPassword",
      form.confirmPassword,
      form,
    );
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    return newErrors;
  }, [form, validateField]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Preserve logic: update form + clear that field error
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // Immediately remove/refresh inline error once user types again
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };

        // If that field had an error, re-validate live and clear when valid
        if (prevErrors?.[name]) {
          const msg = validateField(name, value, next);
          if (msg) nextErrors[name] = msg;
          else delete nextErrors[name];
        }

        // Special case: confirmPassword depends on password too
        if (name === "password" && prevErrors?.confirmPassword) {
          const confirmMsg = validateField(
            "confirmPassword",
            next.confirmPassword,
            next,
          );
          if (confirmMsg) nextErrors.confirmPassword = confirmMsg;
          else delete nextErrors.confirmPassword;
        }

        return nextErrors;
      });

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);

      await createOwner(api, {
        name: form.name,
        username: form.username,
        phone: `+94${form.phone}`,
        password: form.password,
      });

      showSuccess("Owner account created. Please log in.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to create owner");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = useMemo(() => {
    return (
      form.name &&
      form.username &&
      form.password &&
      form.confirmPassword &&
      Object.values(errors).every((v) => !v) &&
      !saving
    );
  }, [form, errors, saving]);

  const inputBase =
    "w-full px-4 py-3 text-sm sm:text-[15px] transition outline-none rounded-2xl border bg-background-secondary text-text-primary placeholder:text-text-tertiary shadow-soft";
  const inputFocus =
    "focus:border-border-focus focus:ring-4 focus:ring-ring-focus/25 hover:border-border";
  const inputError = "border-status-error focus:border-status-error";
  const inputOk = "border-border-light";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-primary">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-28 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary-subtle blur-3xl opacity-70 motion-safe:animate-pulse" />
        <div className="absolute -bottom-32 -left-20 h-[30rem] w-[30rem] rounded-full bg-accent-subtle blur-3xl opacity-70 motion-safe:animate-pulse" />
        <div className="absolute -bottom-28 -right-20 h-[26rem] w-[26rem] rounded-full bg-primary-subtle blur-3xl opacity-55 motion-safe:animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-background-primary via-background-primary to-background-subtle opacity-85" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        >
          {/* Card */}
          <div
            className="
              group relative overflow-hidden
              rounded-3xl border border-border-light
              bg-background-secondary
              shadow-card
              transition-all duration-300 ease-out
              hover:-translate-y-0.5 hover:shadow-float
              motion-safe:will-change-transform
            "
          >
            {/* Top accent */}
            <div className="h-1.5 w-full bg-accent" />

            {/* Hover glow */}
            <div className="absolute inset-0 transition duration-500 opacity-0 pointer-events-none group-hover:opacity-100">
              <div className="absolute w-64 h-64 -translate-x-1/2 rounded-full -top-24 left-1/2 bg-accent-subtle blur-3xl" />
              <div className="absolute w-56 h-56 rounded-full -bottom-24 left-10 bg-primary-subtle blur-3xl" />
            </div>

            <div className="relative px-5 py-7 sm:px-8 sm:py-9">
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-2xl border border-border-light bg-background-subtle px-3 py-1.5 shadow-soft">
                  <span className="relative inline-flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full rounded-full opacity-25 bg-accent motion-safe:animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-accent" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider text-text-secondary">
                    OWNER SIGNUP
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                  Create Owner Account
                </h1>

                <p className="max-w-sm mx-auto mt-2 text-xs leading-relaxed text-text-tertiary sm:text-sm">
                  This creates a new tenant and your first owner user.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 mt-7 sm:mt-8"
                noValidate
              >
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                    FULL NAME
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={() => {
                      const msg = validateField("name", form.name);
                      setErrors((prev) => {
                        if (!msg) {
                          const next = { ...prev };
                          delete next.name;
                          return next;
                        }
                        return { ...prev, name: msg };
                      });
                    }}
                    placeholder="Vinayak Mahadevan"
                    autoComplete="name"
                    className={[
                      inputBase,
                      inputFocus,
                      errors.name ? inputError : inputOk,
                    ].join(" ")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />

                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        key="name-error"
                        id="name-error"
                        className="mt-1 text-xs leading-relaxed text-status-error"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.18 }}
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                    USERNAME
                  </label>

                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    onBlur={() => {
                      const msg = validateField("username", form.username);
                      setErrors((prev) => {
                        if (!msg) {
                          const next = { ...prev };
                          delete next.username;
                          return next;
                        }
                        return { ...prev, username: msg };
                      });
                    }}
                    placeholder="user123"
                    autoComplete="username"
                    className={[
                      inputBase,
                      inputFocus,
                      errors.username ? inputError : inputOk,
                    ].join(" ")}
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={
                      errors.username ? "username-error" : undefined
                    }
                  />

                  <AnimatePresence>
                    {errors.username && (
                      <motion.p
                        key="username-error"
                        id="username-error"
                        className="mt-1 text-xs leading-relaxed text-status-error"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.18 }}
                      >
                        {errors.username}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                    PHONE NUMBER
                  </label>

                  <div className="flex items-stretch">
                    <span className="px-3 py-3 text-sm border border-r-0 select-none rounded-l-2xl border-border-light bg-background-subtle text-text-tertiary">
                      +94
                    </span>

                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={() => {
                        const msg = validateField("phone", form.phone);
                        setErrors((prev) => {
                          if (!msg) {
                            const next = { ...prev };
                            delete next.phone;
                            return next;
                          }
                          return { ...prev, phone: msg };
                        });
                      }}
                      placeholder="712345678"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={9}
                      className={[
                        "w-full rounded-r-2xl border border-l-0 bg-background-secondary px-4 py-3 text-sm sm:text-[15px] text-text-primary placeholder:text-text-tertiary shadow-soft outline-none transition",
                        inputFocus,
                        errors.phone
                          ? "border-status-error focus:border-status-error"
                          : "border-border-light focus:border-border-focus",
                      ].join(" ")}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={
                        errors.phone ? "phone-error" : undefined
                      }
                    />
                  </div>

                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        key="phone-error"
                        id="phone-error"
                        className="mt-1 text-xs leading-relaxed text-status-error"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.18 }}
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                    PASSWORD
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={() => {
                        const msg = validateField("password", form.password);
                        setErrors((prev) => {
                          const next = { ...prev };
                          if (!msg) delete next.password;
                          else next.password = msg;

                          if (prev?.confirmPassword) {
                            const cmsg = validateField(
                              "confirmPassword",
                              form.confirmPassword,
                              form,
                            );
                            if (!cmsg) delete next.confirmPassword;
                            else next.confirmPassword = cmsg;
                          }

                          return next;
                        });
                      }}
                      placeholder="Enter password"
                      autoComplete="new-password"
                      className={[
                        inputBase,
                        "pr-12",
                        inputFocus,
                        errors.password ? inputError : inputOk,
                      ].join(" ")}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                    />

                    <button
                      type="button"
                      tabIndex={-1}
                      className={[
                        "absolute right-3 top-1/2 -translate-y-1/2",
                        "cursor-pointer rounded-xl p-2 transition",
                        "hover:bg-background-subtle active:scale-[0.98]",
                        "focus:outline-none focus:ring-4 focus:ring-ring-focus/25",
                        showPassword
                          ? "text-accent"
                          : "text-text-tertiary hover:text-text-primary",
                      ].join(" ")}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        key="password-error"
                        id="password-error"
                        className="mt-1 text-xs leading-relaxed text-status-error"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.18 }}
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                    CONFIRM PASSWORD
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => {
                        const msg = validateField(
                          "confirmPassword",
                          form.confirmPassword,
                          form,
                        );
                        setErrors((prev) => {
                          if (!msg) {
                            const next = { ...prev };
                            delete next.confirmPassword;
                            return next;
                          }
                          return { ...prev, confirmPassword: msg };
                        });
                      }}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      className={[
                        inputBase,
                        "pr-12",
                        inputFocus,
                        errors.confirmPassword ? inputError : inputOk,
                      ].join(" ")}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword
                          ? "confirm-password-error"
                          : undefined
                      }
                    />

                    <button
                      type="button"
                      tabIndex={-1}
                      className={[
                        "absolute right-3 top-1/2 -translate-y-1/2",
                        "cursor-pointer rounded-xl p-2 transition",
                        "hover:bg-background-subtle active:scale-[0.98]",
                        "focus:outline-none focus:ring-4 focus:ring-ring-focus/25",
                        showConfirmPassword
                          ? "text-accent"
                          : "text-text-tertiary hover:text-text-primary",
                      ].join(" ")}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.22 1.125-4.575"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        key="confirm-password-error"
                        id="confirm-password-error"
                        className="mt-1 text-xs leading-relaxed text-status-error"
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.18 }}
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={canSubmit ? { y: -2 } : {}}
                  whileTap={canSubmit ? { scale: 0.99 } : {}}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className={[
                    "relative mt-2 w-full overflow-hidden rounded-2xl px-4 py-3",
                    "text-sm font-semibold tracking-wide shadow-md transition",
                    "focus:outline-none focus:ring-4 focus:ring-ring-focus/25",
                    "disabled:cursor-not-allowed disabled:opacity-60 bg-accent ",
                    canSubmit
                      ? "cursor-pointer bg-accent text-text-inverse hover:shadow-lg active:bg-accent-active"
                      : "cursor-not-allowed bg-accent-light text-text-inverse",
                  ].join(" ")}
                >
                  {/* Framer shimmer */}
                  <span className="absolute inset-0 pointer-events-none">
                    <motion.span
                      aria-hidden="true"
                      className="absolute top-0 w-1/2 h-full -skew-x-12 -left-1/2 bg-gradient-to-r from-transparent via-background-secondary/40 to-transparent"
                      initial={{ x: "-120%", opacity: 0 }}
                      animate={
                        canSubmit
                          ? { x: "240%", opacity: [0, 1, 1, 0] }
                          : { x: "-120%", opacity: 0.35 }
                      }
                      transition={
                        canSubmit
                          ? {
                              duration: 2.1,
                              ease: "easeInOut",
                              repeat: Infinity,
                            }
                          : { duration: 0.2 }
                      }
                    />
                  </span>

                  <span className="relative inline-flex items-center justify-center gap-2 ">
                    <span>Create owner</span>
                  </span>
                </motion.button>

                {saving && (
                  <div className="mt-4">
                    <AppLoader
                      open
                      variant="inline"
                      title="Creating owner account"
                      subtitle="Setting up your shop profile"
                    />
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="mt-6 text-xs text-center text-text-tertiary sm:mt-7">
                <span>Already have an account?</span>{" "}
                <Link
                  to="/login"
                  className="font-semibold underline transition cursor-pointer decoration-border-dark underline-offset-4 hover:text-primary-hover text-text-primary"
                >
                  Go to login
                </Link>
              </div>

              <div className="flex items-center justify-center mt-6">
                <div className="h-px w-full max-w-[10rem] bg-border-light" />
              </div>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-text-tertiary">
                Tip: Use a strong password. You can update your details later
                from the account settings.
              </p>
            </div>

            {/* Subtle ring on hover */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100">
              <div className="absolute inset-0 rounded-3xl ring-1 ring-ring-subtle" />
            </div>
          </div>

          <p className="mt-6 px-2 text-center text-[11px] text-text-tertiary">
            By creating an account, you agree to your organization’s policies.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerSignupPage;
