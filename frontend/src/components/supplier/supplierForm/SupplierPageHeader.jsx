import React from "react";

const SupplierPageHeader = ({ onAddSupplier }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between gap-3">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Suppliers
        </h1>
        <p className="text-sm text-gray-600">
          Manage suppliers, track outstanding payments, and receive goods.
        </p>
      </div>

      <button
        onClick={onAddSupplier}
        className="px-5 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-md"
      >
        + Add Supplier
      </button>
    </div>
  );
};

export default SupplierPageHeader;
