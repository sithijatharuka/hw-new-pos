import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/common/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import ReportsPage from "./pages/ReportsPage";
import ExpensesPage from "./pages/ExpensesPage";
import SettingsPage from "./pages/SettingsPage";
import InvoicePrintA4 from "./pages/InvoicePrintA4";
import InvoicePrintThermal from "./pages/InvoicePrintThermal";
import BarcodePrintPage from "./pages/BarcodePrintPage";

const ProtectedLayout = ({ children, user, onLogout }) => {
  return (
    <AppShell user={user} onLogout={onLogout}>
      {children}
    </AppShell>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route
        path="/*"
        element={
          user ? (
            <ProtectedLayout user={user} onLogout={handleLogout}>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route
                  path="/settings"
                  element={<SettingsPage user={user} />}
                />
                {/* A4 layout */}
                <Route path="/invoice/a4/:id" element={<InvoicePrintA4 />} />
                {/* 80mm thermal layout */}
                <Route
                  path="/invoice/thermal/:id"
                  element={<InvoicePrintThermal />}
                />
                {/* Backwards compatible: default to A4 */}
                <Route path="/invoice/:id" element={<InvoicePrintA4 />} />
                <Route path="/barcode/:id" element={<BarcodePrintPage />} />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
