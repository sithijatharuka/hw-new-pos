import React, { useState } from "react";
import toast from "react-hot-toast";

const EssentialInformation = ({
  form,
  errs,
  hasSubmitted,
  categories,
  customCategories,
  baseUnits,
  customBaseUnits,
  onCategoryAdd,
  onCategoryDelete,
  onBaseUnitAdd,
  onBaseUnitDelete,
  updateField,
  setError,
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBaseUnitDropdown, setShowBaseUnitDropdown] = useState(false);

  const categoryOptions = Array.from(
    new Set([...(categories || []), ...customCategories])
  );
  const baseUnitOptions = Array.from(
    new Set([...(baseUnits || []), ...customBaseUnits])
  );

  const CUSTOM_CATEGORIES_KEY = "pos_custom_item_categories";
  const CUSTOM_UNITS_KEY = "pos_custom_item_units";

  const handleAddCategoryClick = async () => {
    if (onCategoryAdd) return onCategoryAdd();

    const name = window.prompt("Enter new category name");
    const trimmed = (name || "").trim();
    if (!trimmed) return;

    const exists = categoryOptions.some(
      (c) => (c || "").toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError("category", "Category already exists.");
      return;
    }

    try {
      const storedCats = JSON.parse(
        localStorage.getItem(CUSTOM_CATEGORIES_KEY) || "[]"
      );
      const next = [...storedCats, trimmed];
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(next));
      updateField("category", trimmed);
      setError("category", "");
      toast.success("Category added");
    } catch (err) {
      console.error("Failed to add category", err);
    }
  };

  const handleAddBaseUnitClick = async () => {
    if (onBaseUnitAdd) return onBaseUnitAdd();

    const name = window.prompt("Enter new base unit (e.g., box)");
    const trimmed = (name || "").trim();
    if (!trimmed) return;

    const exists = baseUnitOptions.some(
      (u) => (u || "").toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError("baseUnit", "Base unit already exists.");
      return;
    }

    try {
      const storedUnits = JSON.parse(
        localStorage.getItem(CUSTOM_UNITS_KEY) || "[]"
      );
      const next = [...storedUnits, trimmed];
      localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify(next));
      updateField("baseUnit", trimmed);
      setError("baseUnit", "");
      toast.success("Base unit added");
    } catch (err) {
      console.error("Failed to add base unit", err);
    }
  };

  const handleDeleteBaseUnit = (unit) => {
    const isCustom = customBaseUnits.includes(unit);
    if (isCustom) {
      try {
        const storedUnits = JSON.parse(
          localStorage.getItem(CUSTOM_UNITS_KEY) || "[]"
        );
        const next = storedUnits.filter((u) => u !== unit);
        localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify(next));
        if (form.baseUnit === unit) updateField("baseUnit", "");
      } catch (err) {
        console.error("Failed to delete base unit", err);
      }
      return;
    }

    onBaseUnitDelete?.(unit);
  };

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
        Essential Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* SKU */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
              errs.sku ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            value={form.sku}
            onChange={(e) => updateField("sku", e.target.value)}
            placeholder="e.g., MILK001"
          />
          {errs.sku && <p className="text-xs text-red-600">{errs.sku}</p>}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
              errs.name ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Enter item name"
          />
          {errs.name && <p className="text-xs text-red-600">{errs.name}</p>}
        </div>

        {/* Barcode */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Barcode (unique)
          </label>
          <input
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
              errs.barcode ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            value={form.barcode}
            onChange={(e) => updateField("barcode", e.target.value)}
            placeholder="Optional barcode"
          />
          {errs.barcode && (
            <p className="text-xs text-red-600">{errs.barcode}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={handleAddCategoryClick}
            >
              + Add New
            </button>
          </div>

          <button
            type="button"
            className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl text-left text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errs.category ? "border-red-300 bg-red-50" : "border-gray-300"
            } ${showCategoryDropdown ? "border-primary" : ""}`}
            onClick={() => setShowCategoryDropdown((p) => !p)}
          >
            <span className={form.category ? "text-gray-900" : "text-gray-400"}>
              {form.category || "Select category"}
            </span>
            <span className="text-gray-500 text-sm">▾</span>
          </button>

          {errs.category && (
            <p className="text-xs text-red-600">{errs.category}</p>
          )}

          {showCategoryDropdown && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-lg text-sm">
              {categoryOptions.length === 0 ? (
                <div className="px-4 py-3 text-gray-500">
                  No categories. Click + Add New to create one.
                </div>
              ) : (
                categoryOptions.map((cat) => (
                  <div
                    key={cat}
                    className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      updateField("category", cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <span className="text-gray-900">{cat}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryDelete?.(cat);
                      }}
                      title="Delete category"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Base Unit */}
        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Base Unit <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={handleAddBaseUnitClick}
            >
              + Add New
            </button>
          </div>

          <button
            type="button"
            className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl text-left text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              errs.baseUnit ? "border-red-300 bg-red-50" : "border-gray-300"
            } ${showBaseUnitDropdown ? "border-primary" : ""}`}
            onClick={() => setShowBaseUnitDropdown((p) => !p)}
          >
            <span className={form.baseUnit ? "text-gray-900" : "text-gray-400"}>
              {form.baseUnit || "Select unit"}
            </span>
            <span className="text-gray-500 text-sm">▾</span>
          </button>

          {errs.baseUnit && (
            <p className="text-xs text-red-600">{errs.baseUnit}</p>
          )}

          {showBaseUnitDropdown && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-lg text-sm">
              {baseUnitOptions.length === 0 ? (
                <div className="px-4 py-3 text-gray-500">
                  No base units. Click + Add New to create one.
                </div>
              ) : (
                baseUnitOptions.map((u) => (
                  <div
                    key={u}
                    className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      updateField("baseUnit", u);
                      setShowBaseUnitDropdown(false);
                    }}
                  >
                    <span className="text-gray-900">{u}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBaseUnit(u);
                      }}
                      title="Delete base unit"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Optional description..."
        />
      </div>
    </div>
  );
};

export default EssentialInformation;
