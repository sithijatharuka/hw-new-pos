import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { createOwner } from "../api/users/users";

const OwnerSignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) {
      toast.error("Name, username, and password are required.");
      return;
    }
    try {
      setSaving(true);
      await createOwner(form);
      toast.success("Owner account created. Please log in.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create owner");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = useMemo(() => {
    return Boolean(form.name && form.username && form.password) && !saving;
  }, [form.name, form.username, form.password, saving]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-primary">
      <Toaster position="top-right" />

      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary-subtle blur-3xl opacity-70 animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute -bottom-28 -left-20 h-[30rem] w-[30rem] rounded-full bg-accent-subtle blur-3xl opacity-70 animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -right-20 h-[26rem] w-[26rem] rounded-full bg-primary-subtle blur-3xl opacity-60 animate-[pulse_7s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background-primary via-background-primary to-background-subtle opacity-80" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="relative overflow-hidden border shadow-lg group rounded-3xl border-border-light bg-background-secondary">
            {/* Top accent bar */}
            <div className="w-full h-1 bg-accent" />

            {/* Subtle inner glow */}
            <div className="absolute inset-0 transition duration-500 opacity-0 pointer-events-none group-hover:opacity-100">
              <div className="absolute w-48 h-48 -translate-x-1/2 rounded-full -top-20 left-1/2 bg-accent-subtle blur-2xl" />
            </div>

            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
              {/* Header */}
              <div className="space-y-2 text-center">
                <div className="mx-auto inline-flex items-center justify-center rounded-2xl border border-border-light bg-background-subtle px-3 py-1.5 shadow-sm">
                  <span className="text-[11px] font-semibold tracking-wider text-text-secondary">
                    OWNER SIGNUP
                  </span>
                </div>

                <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
                  Create Owner Account
                </h1>

                <p className="max-w-sm mx-auto text-xs leading-relaxed text-text-tertiary sm:text-sm">
                  This creates a new tenant and your first owner user.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-7 sm:mt-8">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Owner name"
                      autoComplete="name"
                      className="w-full px-4 py-3 text-sm transition border shadow-sm outline-none rounded-2xl border-border-light bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:ring-4 focus:ring-focus/20 hover:border-border-default"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                    USERNAME
                  </label>
                  <div className="relative">
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="owner"
                      autoComplete="username"
                      className="w-full px-4 py-3 text-sm transition border shadow-sm outline-none rounded-2xl border-border-light bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:ring-4 focus:ring-focus/20 hover:border-border-default"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="********"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 text-sm transition border shadow-sm outline-none rounded-2xl border-border-light bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:ring-4 focus:ring-focus/20 hover:border-border-default"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`
                    relative mt-2 w-full overflow-hidden rounded-2xl px-4 py-3
                    text-sm font-semibold tracking-wide shadow-md transition
                    focus:outline-none focus:ring-4 focus:ring-focus/25
                    disabled:cursor-not-allowed disabled:opacity-60
                    ${
                      canSubmit
                        ? "cursor-pointer bg-accent text-text-inverse hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:bg-accent-active"
                        : "cursor-not-allowed bg-accent-light text-text-inverse"
                    }
                  `}
                >
                  {/* Shine animation */}
                  <span
                    className={`
                      pointer-events-none absolute inset-0 opacity-0 transition duration-300
                      ${canSubmit ? "opacity-100" : "opacity-40"}
                    `}
                  >
                    <span
                      className="
                        absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12
                        bg-gradient-to-r from-transparent via-background-secondary/40 to-transparent
                        animate-[shimmer_2.1s_ease-in-out_infinite]
                      "
                    />
                  </span>

                  <span className="relative inline-flex items-center justify-center gap-2">
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 rounded-full animate-spin border-background-secondary/40 border-t-background-secondary" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create owner</span>
                    )}
                  </span>
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-xs text-center text-text-tertiary sm:mt-7">
                <span>Already have an account?</span>{" "}
                <Link
                  to="/login"
                  className="font-semibold underline transition cursor-pointer text-text-primary decoration-border-dark underline-offset-4 hover:text-primary-hover"
                >
                  Go to login
                </Link>
              </div>

              {/* Bottom hint */}
              <div className="flex items-center justify-center mt-6">
                <div className="h-px w-full max-w-[10rem] bg-border-light" />
              </div>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-text-tertiary">
                Tip: Use a strong password. You can update your details later
                from the account settings.
              </p>
            </div>
          </div>

          {/* Tiny safe-note */}
          <p className="mt-6 text-center text-[11px] text-text-tertiary">
            By creating an account, you agree to your organization’s policies.
          </p>
        </div>
      </div>

      {/* Tailwind keyframes (works if your setup allows arbitrary animations; otherwise move to global CSS) */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
            15% { opacity: 1; }
            50% { transform: translateX(220%) skewX(-12deg); opacity: 1; }
            85% { opacity: 0.7; }
            100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default OwnerSignupPage;
