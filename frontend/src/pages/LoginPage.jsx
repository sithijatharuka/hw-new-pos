import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

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

      if (!data.token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", data.token);
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

  return (
    <div className="min-h-screen  flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          {/* Brand / Info Panel (hidden on mobile) */}
          <section className="hidden md:flex flex-col justify-between rounded-3xl bg-soft border shadow-xl px-10 py-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-red-50 border border-red-100" />
                <span>Secure Admin Access</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary">
                  SL Hardware POS
                </h1>
                <p className="text-sm leading-relaxed text-gray-500 max-w-md">
                  Manage inventory, billing, and daily operations from one
                  centralized dashboard. Log in with your admin account to
                  continue.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div className="space-y-1">
                  <p className="font-medium tracking-wide uppercase">
                    Fast Access
                  </p>
                  <p className="leading-relaxed">
                    Quick login experience with clear, focused layout for busy
                    retail environments.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium tracking-wide uppercase">
                    Secure Sessions
                  </p>
                  <p className="leading-relaxed">
                    Your credentials are handled securely via the backend
                    authentication service.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Login Panel */}
          <section className="flex items-center">
            <div className="w-full rounded-3xl bg-soft border shadow-xl px-6 py-8 md:px-8 md:py-10 flex flex-col gap-6">
              {/* Mobile title */}
              <div className="md:hidden text-center space-y-1">
                <h2 className="text-2xl font-semibold text-primary tracking-tight">
                  SL Hardware POS
                </h2>
                <p className="text-xs text-gray-500">
                  Login to continue (seed an admin via backend if first time)
                </p>
              </div>

              {/* Desktop subtitle */}
              <div className="hidden md:block space-y-1">
                <h2 className="text-xl font-semibold text-primary tracking-tight">
                  Welcome back
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  Enter your admin credentials to access the POS dashboard.
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-2xl shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium tracking-wide text-gray-500">
                    USERNAME
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <svg
                        className="h-4 w-4 text-gray-500"
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
                      className="w-full rounded-2xl border px-9 py-2.5 text-sm outline-none bg-soft placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-out"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium tracking-wide text-gray-500">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <svg
                        className="h-4 w-4 text-gray-500"
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
                      className="w-full rounded-2xl border px-9 py-2.5 text-sm outline-none bg-soft placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-out"
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
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-2xl border text-sm font-semibold tracking-wide text-primary shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition duration-200 ease-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-soft"
                    disabled={loading}
                  >
                    {loading ? "Logging in…" : "Login"}
                  </button>

                  <p className="text-[11px] leading-relaxed text-gray-500 text-center">
                    First time using the system? Make sure an admin user is
                    seeded via the backend before attempting to log in.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
