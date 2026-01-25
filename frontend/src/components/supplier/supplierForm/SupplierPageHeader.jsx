// SupplierPageHeader.jsx
import React from "react";

const SupplierPageHeader = ({ onAddSupplier }) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
          Suppliers
        </h1>
        <p className="text-sm text-text-secondary">
          Manage suppliers, track outstanding payments, and receive goods.
        </p>
      </div>

      <button
        onClick={onAddSupplier}
        className={[
          "inline-flex items-center justify-center",
          "rounded-2xl px-5 py-3 text-sm font-semibold",
          "bg-primary text-white",
          "shadow-md transition-all duration-200 ease-out",
          "hover:shadow-lg hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.99]",
          "focus:outline-none focus:ring-2 focus:ring-focus/20",
          "cursor-pointer",
        ].join(" ")}
      >
        + Add Supplier
      </button>
    </div>
  );
};

export default SupplierPageHeader;
