import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api"; // adjust if needed

/**
 * AddNewItem (MASTER ONLY)
 * 🔒 No stock mutation fields (onHand, reserved, openingStock, batches) are allowed here.
 *
 * Props:
 * - open, onClose, onSuccess
 * - item: existing item for edit
 * - suppliers, categories, baseUnits
 * - onCategoryAdd, onBaseUnitAdd, onCategoryDelete
 * - mode (optional): "default" | "grn" (you can use to hide fields if you want)
 */
const AddNewItem = ({
  open,
  onClose,
  onSuccess,
  item: existingItem,

  suppliers = [],
  categories = [],
  baseUnits = [],

  onCategoryAdd,
  onBaseUnitAdd,
  onCategoryDelete,

  mode = "default",
  defaultSupplierId,
}) => {
  const emptyForm = useMemo(
    () => ({
      sku: "",
      name: "",
      barcode: "",
      category: "",
      description: "",

      baseUnit: baseUnits?.[0] || "pcs",
      units: [], // { fromUnit, toUnit, multiplier }

      sellingPrice: "",
      costPrice: "",

      taxApplicable: false,
      taxRate: "",
      taxCode: "",

      defaultSupplier: defaultSupplierId || "",

      isBatchTracked: false,
      isSerialTracked: false,

      // ✅ safe “stock policy” fields (not stock qty)
      lowStockLevel: "",
      reorderQuantity: "",

      isActive: true,
    }),
    [baseUnits, defaultSupplierId]
  );

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // ---------- init ----------
  useEffect(() => {
    if (!open) return;

    if (existingItem) {
      setEditingId(existingItem._id);

      setForm({
        ...emptyForm,
        ...existingItem,

        sku: existingItem.sku || "",
        name: existingItem.name || "",
        barcode: existingItem.barcode || "",
        category: existingItem.category || "",
        description: existingItem.description || "",

        baseUnit: existingItem.baseUnit || emptyForm.baseUnit,
        units: Array.isArray(existingItem.units) ? existingItem.units : [],

        sellingPrice:
          existingItem.sellingPrice === 0 || existingItem.sellingPrice
            ? String(existingItem.sellingPrice)
            : "",
        costPrice:
          existingItem.costPrice === 0 || existingItem.costPrice
            ? String(existingItem.costPrice)
            : "",

        taxApplicable: Boolean(existingItem.taxApplicable),
        taxRate:
          existingItem.taxRate === 0 || existingItem.taxRate
            ? String(existingItem.taxRate)
            : "",
        taxCode: existingItem.taxCode || "",

        defaultSupplier:
          existingItem.defaultSupplier?._id ||
          existingItem.defaultSupplier ||
          defaultSupplierId ||
          "",

        isBatchTracked: Boolean(existingItem.isBatchTracked),
        isSerialTracked: Boolean(existingItem.isSerialTracked),

        lowStockLevel:
          existingItem.inventory?.lowStockLevel === 0 ||
          existingItem.inventory?.lowStockLevel
            ? String(existingItem.inventory.lowStockLevel)
            : "",
        reorderQuantity:
          existingItem.inventory?.reorderQuantity === 0 ||
          existingItem.inventory?.reorderQuantity
            ? String(existingItem.inventory.reorderQuantity)
            : "",

        isActive: existingItem.isActive ?? true,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }

    setErrs({});
    setShowCategoryDropdown(false);
  }, [open, existingItem, emptyForm, defaultSupplierId]);

  const setError = (k, v) => setErrs((p) => ({ ...p, [k]: v }));

  const validateNumber = (
    value,
    { required = false, min = 0, max = null } = {}
  ) => {
    const v = (value ?? "").toString().trim();
    if (!v) return required ? "Required" : "";
    const n = Number(v);
    if (Number.isNaN(n)) return "Must be a valid number";
    if (n < min) return `Must be ≥ ${min}`;
    if (max !== null && n > max) return `Must be ≤ ${max}`;
    return "";
  };

  const validate = (next = form) => {
    const e = {};

    // required
    if (!String(next.sku || "").trim()) e.sku = "SKU is required";
    if (!String(next.name || "").trim()) e.name = "Item name is required";
    if (!String(next.baseUnit || "").trim())
      e.baseUnit = "Base unit is required";
    if (!String(next.category || "").trim())
      e.category = "Category is required";

    // pricing
    {
      const msg = validateNumber(next.costPrice, { required: true, min: 0 });
      if (msg) e.costPrice = `Cost price ${msg.toLowerCase()}`;
    }
    {
      const msg = validateNumber(next.sellingPrice, { required: true, min: 0 });
      if (msg) e.sellingPrice = `Selling price ${msg.toLowerCase()}`;
    }

    // tax
    if (next.taxApplicable) {
      const msg = validateNumber(next.taxRate, {
        required: true,
        min: 0,
        max: 100,
      });
      if (msg) e.taxRate = `Tax rate ${msg.toLowerCase()}`;
    }

    // tracking mode safety
    if (next.isBatchTracked && next.isSerialTracked) {
      e.tracking = "Item cannot be both batch-tracked and serial-tracked.";
    }

    // unit conversions
    const baseUnit = String(next.baseUnit || "").trim();
    const units = Array.isArray(next.units) ? next.units : [];
    const seen = new Set();

    for (let i = 0; i < units.length; i++) {
      const u = units[i] || {};
      const fromUnit = String(u.fromUnit || "").trim();
      const multRaw = u.multiplier;

      if (!fromUnit) {
        e.units = "All unit conversions must include a From Unit.";
        break;
      }
      const key = fromUnit.toLowerCase();
      if (seen.has(key)) {
        e.units = `Duplicate unit conversion: ${fromUnit}`;
        break;
      }
      seen.add(key);

      const mult = Number(multRaw);
      if (Number.isNaN(mult) || mult <= 0) {
        e.units = "Multiplier must be a valid number > 0.";
        break;
      }

      // force toUnit == baseUnit
      if (u.toUnit && String(u.toUnit).trim() !== baseUnit) {
        e.units = "Unit conversion toUnit must equal base unit.";
        break;
      }
    }

    // thresholds (optional but must be valid if provided)
    {
      const msg = validateNumber(next.lowStockLevel, {
        required: false,
        min: 0,
      });
      if (msg) e.lowStockLevel = `Low stock level ${msg.toLowerCase()}`;
    }
    {
      const msg = validateNumber(next.reorderQuantity, {
        required: false,
        min: 0,
      });
      if (msg) e.reorderQuantity = `Reorder quantity ${msg.toLowerCase()}`;
    }

    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // normalize sku
      if (field === "sku")
        next.sku = String(value || "")
          .trim()
          .toUpperCase();

      // baseUnit change -> force units[].toUnit = baseUnit
      if (field === "baseUnit") {
        next.units = (prev.units || []).map((u) => ({
          ...u,
          toUnit: value,
        }));
      }

      // tax off -> clear rate
      if (field === "taxApplicable" && !value) {
        next.taxRate = "";
      }

      // tracking toggle safety: if enabling one, auto-disable the other
      if (field === "isBatchTracked" && value === true) {
        next.isSerialTracked = false;
      }
      if (field === "isSerialTracked" && value === true) {
        next.isBatchTracked = false;
      }

      // validate as you type (light)
      validate(next);
      return next;
    });
  };

  const addUnitRow = () => {
    setForm((prev) => {
      const next = {
        ...prev,
        units: [
          ...(prev.units || []),
          { fromUnit: "", toUnit: prev.baseUnit, multiplier: "" },
        ],
      };
      validate(next);
      return next;
    });
  };

  const updateUnitRow = (idx, patch) => {
    setForm((prev) => {
      const units = [...(prev.units || [])];
      units[idx] = { ...(units[idx] || {}), ...patch, toUnit: prev.baseUnit };
      const next = { ...prev, units };
      validate(next);
      return next;
    });
  };

  const removeUnitRow = (idx) => {
    setForm((prev) => {
      const units = [...(prev.units || [])];
      units.splice(idx, 1);
      const next = { ...prev, units };
      validate(next);
      return next;
    });
  };

  const handleSave = async () => {
    if (!validate(form)) {
      toast.error("Please fix validation errors");
      return;
    }

    setSaving(true);
    try {
      // ✅ MASTER ONLY payload (no openingStock, no inventory.onHand/reserved, no batches)
      const payload = {
        sku: String(form.sku || "")
          .trim()
          .toUpperCase(),
        name: String(form.name || "").trim(),
        barcode: String(form.barcode || "").trim() || undefined,
        category: String(form.category || "").trim(),
        description: String(form.description || "").trim() || undefined,

        baseUnit: String(form.baseUnit || "").trim(),
        units: (form.units || []).map((u) => ({
          fromUnit: String(u.fromUnit || "").trim(),
          toUnit: String(form.baseUnit || "").trim(),
          multiplier: Number(u.multiplier),
        })),

        sellingPrice: Number(form.sellingPrice),
        costPrice: Number(form.costPrice),

        taxApplicable: Boolean(form.taxApplicable),
        taxRate: form.taxApplicable ? Number(form.taxRate || 0) : 0,
        taxCode: String(form.taxCode || "").trim() || undefined,

        defaultSupplier: form.defaultSupplier || undefined,

        isBatchTracked: Boolean(form.isBatchTracked),
        isSerialTracked: Boolean(form.isSerialTracked),
        isActive: Boolean(form.isActive),

        // ✅ thresholds only (safe)
        inventory: {
          lowStockLevel:
            form.lowStockLevel === "" || form.lowStockLevel === null
              ? 0
              : Number(form.lowStockLevel),
          reorderQuantity:
            form.reorderQuantity === "" || form.reorderQuantity === null
              ? 0
              : Number(form.reorderQuantity),
        },
      };

      if (editingId) {
        await api.put(`/items/${editingId}`, payload);
        toast.success("Item updated successfully");
      } else {
        await api.post("/items", payload);
        toast.success("Item created successfully");
      }

      if (onSuccess) await onSuccess();
      onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save item"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 py-4 sm:py-6 overflow-auto">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-lg sm:text-xl">📦</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingId ? "Update Item" : "Add New Item"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Master data only — stock & batches are managed via
                  GRN/Sales/Adjustments.
                </p>
              </div>
            </div>

            <button
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              onClick={() => {
                setShowCategoryDropdown(false);
                onClose?.();
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-8">
          {/* Essentials */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Essential Information
            </h3>

            {errs.tracking && (
              <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {errs.tracking}
              </div>
            )}

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
                {errs.name && (
                  <p className="text-xs text-red-600">{errs.name}</p>
                )}
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Barcode (unique)
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                  value={form.barcode}
                  onChange={(e) => updateField("barcode", e.target.value)}
                  placeholder="Optional barcode"
                />
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
                    onClick={() => onCategoryAdd?.()}
                  >
                    + Add New
                  </button>
                </div>

                <button
                  type="button"
                  className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl text-left text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    errs.category
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } ${showCategoryDropdown ? "border-primary" : ""}`}
                  onClick={() => setShowCategoryDropdown((p) => !p)}
                >
                  <span
                    className={
                      form.category ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {form.category || "Select category"}
                  </span>
                  <span className="text-gray-500 text-sm">▾</span>
                </button>

                {errs.category && (
                  <p className="text-xs text-red-600">{errs.category}</p>
                )}

                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-xl shadow-lg text-sm">
                    {categories.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500">
                        No categories. Click + Add New to create one.
                      </div>
                    ) : (
                      categories.map((cat) => (
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Base Unit <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => onBaseUnitAdd?.()}
                  >
                    + Add New
                  </button>
                </div>

                <select
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
                    errs.baseUnit
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={form.baseUnit}
                  onChange={(e) => updateField("baseUnit", e.target.value)}
                >
                  <option value="">Select unit</option>
                  {baseUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                {errs.baseUnit && (
                  <p className="text-xs text-red-600">{errs.baseUnit}</p>
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

          {/* Pricing */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cost Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
                    errs.costPrice
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={form.costPrice}
                  onChange={(e) => updateField("costPrice", e.target.value)}
                />
                {errs.costPrice && (
                  <p className="text-xs text-red-600">{errs.costPrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Selling Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
                    errs.sellingPrice
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={form.sellingPrice}
                  onChange={(e) => updateField("sellingPrice", e.target.value)}
                />
                {errs.sellingPrice && (
                  <p className="text-xs text-red-600">{errs.sellingPrice}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stock policy fields (safe) */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Stock Policy
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              These do not change stock quantities. Stock changes happen only
              via GRN/Sales/Adjustments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Low Stock Level
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
                    errs.lowStockLevel
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={form.lowStockLevel}
                  onChange={(e) => updateField("lowStockLevel", e.target.value)}
                />
                {errs.lowStockLevel && (
                  <p className="text-xs text-red-600">{errs.lowStockLevel}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Reorder Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
                    errs.reorderQuantity
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={form.reorderQuantity}
                  onChange={(e) =>
                    updateField("reorderQuantity", e.target.value)
                  }
                />
                {errs.reorderQuantity && (
                  <p className="text-xs text-red-600">{errs.reorderQuantity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tax */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Tax Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="taxApplicable"
                  checked={form.taxApplicable}
                  onChange={(e) =>
                    updateField("taxApplicable", e.target.checked)
                  }
                  className="h-5 w-5 text-primary rounded focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="taxApplicable"
                  className="text-sm font-medium text-gray-700"
                >
                  This item is taxable
                </label>
              </div>

              {form.taxApplicable && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tax Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${
                      errs.taxRate
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    value={form.taxRate}
                    onChange={(e) => updateField("taxRate", e.target.value)}
                  />
                  {errs.taxRate && (
                    <p className="text-xs text-red-600">{errs.taxRate}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tax Code (HSN/SAC)
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                  value={form.taxCode}
                  onChange={(e) => updateField("taxCode", e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Tracking Mode
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={form.isBatchTracked}
                  onChange={(e) =>
                    updateField("isBatchTracked", e.target.checked)
                  }
                  className="h-5 w-5 text-primary rounded focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="font-medium text-gray-900">Batch-tracked</div>
                  <div className="text-xs text-gray-500">
                    Requires batch number + expiry in GRN.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={form.isSerialTracked}
                  onChange={(e) =>
                    updateField("isSerialTracked", e.target.checked)
                  }
                  className="h-5 w-5 text-primary rounded focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Serial-tracked
                  </div>
                  <div className="text-xs text-gray-500">
                    Use only if you have a serial model/workflow.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Supplier + Status */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Supplier & Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Default Supplier
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                  value={form.defaultSupplier}
                  onChange={(e) =>
                    updateField("defaultSupplier", e.target.value)
                  }
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                  className="h-5 w-5 text-primary rounded focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="font-medium text-gray-900">Active</div>
                  <div className="text-xs text-gray-500">
                    Active items are visible in sales & search.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Unit conversions */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Unit Conversions
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Example: 1 box = 10 {form.baseUnit}
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 active:scale-95 transition-all text-sm"
                onClick={addUnitRow}
              >
                + Add Unit
              </button>
            </div>

            {errs.units && (
              <p className="text-sm text-red-600 mb-3">{errs.units}</p>
            )}

            {(form.units || []).length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-600">
                No unit conversions added.
              </div>
            ) : (
              <div className="space-y-3">
                {(form.units || []).map((u, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Unit
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                          value={u.fromUnit || ""}
                          onChange={(e) =>
                            updateUnitRow(idx, { fromUnit: e.target.value })
                          }
                          placeholder="e.g., box"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Multiplier
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                          value={u.multiplier ?? ""}
                          onChange={(e) =>
                            updateUnitRow(idx, { multiplier: e.target.value })
                          }
                          placeholder="e.g., 10"
                        />
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2">
                          <span className="text-sm text-gray-900">
                            = {form.baseUnit}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                          onClick={() => removeUnitRow(idx)}
                          title="Remove"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-95 transition-all font-medium"
              onClick={() => {
                setShowCategoryDropdown(false);
                onClose?.();
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:shadow-lg active:scale-95 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update Item" : "Create Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewItem;
