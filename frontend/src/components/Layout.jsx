import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/pos", label: "POS" },
  { to: "/inventory", label: "Inventory" },
  { to: "/customers", label: "Customers" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/reports", label: "Reports" },
  { to: "/expenses", label: "Expenses" },
  { to: "/settings", label: "Settings" },
];

export const AppShell = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-bold">
            POS
          </div>
          <div>
            <div className="text-sm font-semibold">SL Hardware POS</div>
            <div className="text-[11px] text-gray-500">
              Sri Lanka hardware billing & stock
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="font-semibold">{user?.name}</div>
            <div className="text-gray-500 capitalize">{user?.role}</div>
          </div>
          <button
            className="px-3 py-1.5 rounded-xl border text-xs hover:bg-soft cursor-pointer"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:block w-52 border-r bg-white/70 backdrop-blur">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-3 md:p-4">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
