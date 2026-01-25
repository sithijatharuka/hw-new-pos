import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HorizontalNav from "./HorizontalNav";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pos", label: "POS Billing" },
  { to: "/inventory", label: "Inventory" },
  { to: "/customers", label: "Customers" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/reports", label: "Reports" },
  { to: "/expenses", label: "Expenses" },
  { to: "/users", label: "Users" },
  { to: "/settings", label: "Settings" },
];

export const AppShell = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-soft md:flex-row">
      {/* ================= MOBILE HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 md:hidden">
        <div>
          <h1 className="text-base font-bold leading-tight text-primary">
            SL Hardware POS
          </h1>
          <p className="text-xs font-medium text-gray-500 truncate">
            {user?.name} • {user?.role}
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg
          hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          Logout
        </button>
      </header>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="fixed top-0 bottom-0 left-0 flex-col hidden w-64 overflow-y-auto bg-white border-r border-gray-100 shadow-xl md:flex">
        <div className="px-6 py-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-primary">SL Hardware POS</h1>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Designed for Lanka hardware shops
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs font-medium text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="ml-3 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg
              hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto md:ml-64 mt-[60px] md:mt-0 mb-[60px] md:mb-0">
        {/* Horizontal Navigation Bar */}
        <HorizontalNav />

        <div className="flex items-center justify-center min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-56px)] p-3 md:p-6">
          <div className="w-full transition-all duration-300 bg-white border border-gray-100 shadow-lg max-w-7xl rounded-2xl hover:shadow-xl">
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </div>
        </div>
      </main>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium
                  transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex flex-col items-center px-3 py-2 text-xs font-medium text-gray-600 transition-all duration-200 rounded-lg cursor-pointer hover:text-gray-900"
            >
              More
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 min-w-[160px]">
                {navItems.slice(4).map((item) => {
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setShowMoreMenu(false)}
                      className={`
                        block px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer
                        ${
                          isActive
                            ? "text-primary bg-primary/5"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default function Layout({ children }) {
  return <>{children}</>;
}
