import React from "react";

const InventoryHeader = ({ onAddNew, lowStockOnly, setLowStockOnly }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 mb-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <span className="text-xl">📦</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Stock changes happen only via GRN / Sales / Adjustments
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3">
        <button
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-semibold rounded-xl shadow-lg"
          onClick={onAddNew}
        >
          <span>+</span>
          <span>Add New Item</span>
        </button>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <input
            type="checkbox"
            id="lowStockOnly"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="h-4 w-4 text-primary rounded focus:ring-primary cursor-pointer"
          />
          <label
            htmlFor="lowStockOnly"
            className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer"
          >
            Show Only Low Stock Items
          </label>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;
