import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { username, password });
      const data = response.data;
      console.log("Login response:", data);

      if (!data.accessToken) {
        throw new Error("No access token received from server");
      }
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(data));
      console.log("Calling onLogin with:", data);
      onLogin(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(() => {
    return Boolean(username && password) && !loading;
  }, [username, password, loading]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-primary">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary-subtle blur-3xl opacity-70 animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute -bottom-28 -left-20 h-[32rem] w-[32rem] rounded-full bg-accent-subtle blur-3xl opacity-70 animate-[pulse_7s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary-subtle blur-3xl opacity-60 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background-primary via-background-primary to-background-subtle opacity-80" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <div className="grid items-stretch gap-6 md:grid-cols-[1.1fr_0.9fr] md:gap-8">
            {/* Brand / Info Panel */}
            <section className="hidden md:flex">
              <div className="relative w-full overflow-hidden border shadow-lg group rounded-3xl border-border-light bg-background-secondary">
                <div className="w-full h-1 bg-primary" />
                <div className="absolute inset-0 transition duration-500 opacity-0 pointer-events-none group-hover:opacity-100">
                  <div className="absolute w-56 h-56 rounded-full -top-24 left-10 bg-primary-subtle blur-2xl" />
                  <div className="absolute w-64 h-64 rounded-full -bottom-28 right-10 bg-accent-subtle blur-2xl" />
                </div>

                <div className="relative flex flex-col justify-between h-full px-10 py-10">
                  <div className="space-y-7">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-background-subtle px-3 py-1.5 text-xs font-semibold tracking-wide text-text-secondary shadow-sm">
                      <span className="relative inline-flex h-2.5 w-2.5">
                        <span className="absolute inline-flex w-full h-full rounded-full opacity-25 animate-ping bg-accent" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                      </span>
                      <span>Secure Admin Access</span>
                    </div>

                    <div className="space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-text-primary lg:text-4xl">
                        SL Hardware POS
                      </h1>
                      <p className="max-w-md text-sm leading-relaxed text-text-tertiary">
                        Manage inventory, billing, and daily operations from one
                        centralized dashboard. Log in with your admin account to
                        continue.
                      </p>
                    </div>

                    <div className="grid gap-3 pt-2">
                      <div className="p-4 border shadow-sm rounded-2xl border-border-light bg-background-subtle">
                        <p className="text-xs font-semibold tracking-wider text-text-secondary">
                          POS-READY UI
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-text-tertiary">
                          Clean layout optimized for quick decision-making at
                          the counter.
                        </p>
                      </div>
                      <div className="p-4 border shadow-sm rounded-2xl border-border-light bg-background-subtle">
                        <p className="text-xs font-semibold tracking-wider text-text-secondary">
                          SESSION SAFETY
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-text-tertiary">
                          Your credentials are handled securely via the backend
                          authentication service.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-8 border-t border-border-light">
                    <div className="grid grid-cols-2 gap-4 text-xs text-text-tertiary">
                      <div className="space-y-1">
                        <p className="font-semibold tracking-wide text-text-secondary">
                          Fast Access
                        </p>
                        <p className="leading-relaxed">
                          Focused login flow for busy retail environments.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold tracking-wide text-text-secondary">
                          Reliable Control
                        </p>
                        <p className="leading-relaxed">
                          Admin dashboard access with token-based sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Login Panel */}
            <section className="flex items-center">
              <div className="relative w-full overflow-hidden border shadow-lg group rounded-3xl border-border-light bg-background-secondary">
                <div className="w-full h-1 bg-accent" />

                {/* subtle hover glow */}
                <div className="absolute inset-0 transition duration-500 opacity-0 pointer-events-none group-hover:opacity-100">
                  <div className="absolute w-56 h-56 -translate-x-1/2 rounded-full -top-24 left-1/2 bg-accent-subtle blur-2xl" />
                </div>

                <div className="relative px-6 py-8 md:px-8 md:py-10">
                  {/* Mobile title */}
                  <div className="space-y-2 text-center md:hidden">
                    <div className="mx-auto inline-flex items-center justify-center rounded-2xl border border-border-light bg-background-subtle px-3 py-1.5 shadow-sm">
                      <span className="text-[11px] font-semibold tracking-wider text-text-secondary">
                        ADMIN LOGIN
                      </span>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                      SL Hardware POS
                    </h2>
                    <p className="text-xs leading-relaxed text-text-tertiary">
                      Login to continue (seed an admin via backend if first
                      time)
                    </p>
                  </div>

                  {/* Desktop subtitle */}
                  <div className="hidden space-y-1 md:block">
                    <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                      Welcome back
                    </h2>
                    <p className="text-sm text-text-tertiary">
                      Enter your admin credentials to access the POS dashboard.
                    </p>
                  </div>

                  {error && (
                    <div
                      className="
                        mt-6 rounded-2xl border border-border-light bg-background-subtle
                        px-4 py-3 text-sm text-text-primary shadow-sm
                        animate-[shake_450ms_ease-in-out]
                      "
                      role="alert"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-accent" />
                        <p className="leading-relaxed">{error}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={submit} className="space-y-5 mt-7">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                        USERNAME
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
                          <svg
                            className="w-4 h-4 text-text-tertiary"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 20.4C6.52 18.4 8.86 17 12 17s5.48 1.4 7 3.4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        <input
                          className="w-full py-3 text-sm transition border shadow-sm outline-none rounded-2xl border-border-light bg-background-secondary px-9 text-text-primary placeholder:text-text-tertiary hover:border-border-default focus:border-border-focus focus:ring-4 focus:ring-focus/20"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="admin"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold tracking-wider text-text-secondary">
                        PASSWORD
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
                          <svg
                            className="w-4 h-4 text-text-tertiary"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="5"
                              y="11"
                              width="14"
                              height="9"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M9 11V9a3 3 0 0 1 6 0v2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        <input
                          type="password"
                          className="w-full py-3 text-sm transition border shadow-sm outline-none rounded-2xl border-border-light bg-background-secondary px-9 text-text-primary placeholder:text-text-tertiary hover:border-border-default focus:border-border-focus focus:ring-4 focus:ring-focus/20"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="admin123"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    <div className="pt-1 space-y-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`
                          relative w-full overflow-hidden rounded-2xl px-4 py-3
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
                        {/* shine */}
                        <span
                          className={`
                            pointer-events-none absolute inset-0
                            ${canSubmit ? "opacity-100" : "opacity-40"}
                          `}
                        >
                          <span
                            className="
                              absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12
                              bg-gradient-to-r from-transparent via-background-secondary/40 to-transparent
                              animate-[shimmer_2.2s_ease-in-out_infinite]
                            "
                          />
                        </span>

                        <span className="relative inline-flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <span className="w-4 h-4 border-2 rounded-full animate-spin border-background-secondary/40 border-t-background-secondary" />
                              <span>Logging in...</span>
                            </>
                          ) : (
                            <span>Login</span>
                          )}
                        </span>
                      </button>

                      <p className="text-[11px] leading-relaxed text-text-tertiary text-center">
                        First time using the system? Make sure an admin user is
                        seeded via the backend before attempting to log in.
                      </p>

                      <p className="text-[11px] leading-relaxed text-text-tertiary text-center">
                        New shop?{" "}
                        <Link
                          to="/signup"
                          className="font-semibold underline transition cursor-pointer text-text-primary decoration-border-dark underline-offset-4 hover:text-primary-hover"
                        >
                          Create owner account
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>

          {/* Mobile-only tiny footer */}
          <p className="mt-6 text-center text-[11px] text-text-tertiary md:hidden">
            Use your admin credentials to access the dashboard securely.
          </p>
        </div>
      </div>

      {/* Keyframes (kept local; remove if your project disallows style tags) */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
            15% { opacity: 1; }
            50% { transform: translateX(220%) skewX(-12deg); opacity: 1; }
            85% { opacity: 0.7; }
            100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
