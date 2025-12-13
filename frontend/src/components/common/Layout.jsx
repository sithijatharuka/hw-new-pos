import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pos", label: "POS Billing" },
  { to: "/inventory", label: "Inventory" },
  { to: "/customers", label: "Customers" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/reports", label: "Reports" },
  { to: "/expenses", label: "Expenses" },
  { to: "/settings", label: "Settings" },
];

export const AppShell = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <div className="min-h-screen flex bg-soft font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl overflow-hidden transition-all duration-300">
        {/* Brand Section */}
        <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            SL Hardware POS
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Designed for Lanka hardware shops
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center px-4 py-3.5 rounded-xl text-sm font-medium
                  transition-all duration-200 ease-out cursor-pointer
                  ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20 transform -translate-x-0.5"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                  }
                `}
              >
                <span
                  className={`transition-transform duration-200 ${
                    isActive ? "translate-x-1" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="px-5 py-5 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize font-medium mt-0.5">
                {user?.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="ml-4 px-3 py-1.5 text-xs font-medium text-red-500 
                hover:text-red-600 hover:bg-red-50 rounded-lg transition-all 
                duration-200 cursor-pointer border border-red-100 
                hover:border-red-200 active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white shadow-lg rounded-b-2xl mx-3 mt-2">
          <div>
            <h1 className="text-lg font-bold text-primary">SL Hardware POS</h1>
            <p className="text-xs text-gray-500 font-medium">
              {user?.name} • {user?.role}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-medium text-red-500 
              hover:text-red-600 hover:bg-red-50 rounded-lg transition-all 
              duration-200 cursor-pointer border border-red-100 
              hover:border-red-200 active:scale-95"
          >
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 pl-[8px]">
          <div
            className="bg-white rounded-2xl shadow-lg h-full overflow-hidden 
            border border-gray-100 transition-all duration-300 hover:shadow-xl"
          >
            <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white 
          border-t border-gray-200 shadow-2xl rounded-t-2xl px-4 py-3"
        >
          <div className="flex justify-around items-center">
            {navItems.slice(0, 4).map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex flex-col items-center px-3 py-2 rounded-lg
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  `}
                >
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex flex-col items-center px-3 py-2 rounded-lg
                  text-gray-600 hover:text-gray-900 transition-all duration-200 cursor-pointer"
              >
                <span className="text-xs font-medium">More</span>
              </button>
              {showMoreMenu && (
                <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 min-w-max z-50">
                  {navItems.slice(4).map((item) => {
                    const isActive = location.pathname.startsWith(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowMoreMenu(false)}
                        className={`
                          block px-4 py-2.5 text-sm font-medium
                          transition-all duration-200 cursor-pointer
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
        </div>
      </div>
    </div>
  );
};

// Remove any padding or margin classes from the main wrapper
export default function Layout({ children }) {
  return <div>{children}</div>;
}
