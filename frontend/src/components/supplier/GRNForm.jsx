// GRNForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createGRN, updateGRN } from "./grnApi";

// Product modal (must NOT allow any stock fields; master-only)
import AddNewItem from "../product/AddNewItem";

/**
 * New workflow assumptions:
 * - Stock changes happen ONLY via GRN, Sales, StockAdjustments endpoints.
 * - Item endpoints are master-only, so AddNewItem must not send inventory/batches/openingStock.
 * - For batch-tracked items, GRN creates/updates batches; item endpoints never mutate batches.
 */
function GRNForm({
  supplier,
  items = [],
  existingGRN = null,
  onSuccess,
  onClose,

  // ✅ parent refresh hook: fetch items list again after adding a new item
  onItemsRefresh, // async () => { ...fetch items... }

  // lookups for product modal
  suppliers = [],
  categories = [],
  baseUnits = [],
}) {
  const [form, setForm] = useState({
    grnDate: new Date().toISOString().substring(0, 10),
    remarks: "",
    lines: [{ item: "", batchNumber: "", qty: "", unitCost: "" }],
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isEditable = !existingGRN || existingGRN.status === "draft";
  const fieldsDisabled = saving || !isEditable;

  // Add Product modal state
  const [showAddItem, setShowAddItem] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(null);

  // Build item map
  const itemById = useMemo(() => {
    const m = new Map();
    for (const it of items) m.set(String(it._id), it);
    return m;
  }, [items]);

  useEffect(() => {
    if (!existingGRN) return;

    setForm({
      grnDate: existingGRN.grnDate
        ? new Date(existingGRN.grnDate).toISOString().substring(0, 10)
        : new Date().toISOString().substring(0, 10),
      remarks: existingGRN.remarks || "",
      lines: (existingGRN.lines || []).length
        ? existingGRN.lines.map((l) => ({
            item: l.item?._id || l.item || "",
            batchNumber: l.batchNumber || "",
            qty: l.qty ?? "",
            unitCost: l.unitCost === 0 || l.unitCost ? String(l.unitCost) : "",
          }))
        : [
            {
              item: "",
              batchNumber: "",
              qty: "",
              unitCost: "",
            },
          ],
    });
  }, [existingGRN]);

  const clearError = (key) => {
    if (!errors[key]) return;
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleLineChange = (index, e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const lines = [...prev.lines];
      const nextLine = { ...lines[index], [name]: value };

      // If item changes, clear batch fields (safest)
      if (name === "item") {
        nextLine.batchNumber = "";
      }

      lines[index] = nextLine;
      return { ...prev, lines };
    });

    clearError(`line_${index}_${name}`);
  };

  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        { item: "", batchNumber: "", qty: "", unitCost: "" },
      ],
    }));
  };

  const removeLine = (index) => {
    setForm((prev) => {
      const next = prev.lines.filter((_, i) => i !== index);
      return { ...prev, lines: next.length ? next : prev.lines };
    });
  };

  const lineTotal = (line) => {
    const qty = Number(line.qty) || 0;
    const cost = Number(line.unitCost) || 0;
    return qty * cost;
  };

  const totals = useMemo(() => {
    return form.lines.reduce(
      (acc, line) => {
        const qty = Number(line.qty) || 0;
        const base = qty * (Number(line.unitCost) || 0);
        acc.totalQty += qty;
        acc.grandTotal += base;
        return acc;
      },
      { totalQty: 0, grandTotal: 0 }
    );
  }, [form.lines]);

  const validateForm = () => {
    const newErrors = {};

    // No need to validate grnNo - it's auto-generated
    if (!supplier?._id) newErrors.supplier = "Supplier is required";
    if (!form.lines?.length) newErrors.lines = "At least one item is required";

    form.lines.forEach((line, idx) => {
      const it = line.item ? itemById.get(String(line.item)) : null;

      // ✅ do not allow selecting inactive items
      if (it && it.isActive === false)
        newErrors[`line_${idx}_item`] = "This item is inactive";

      const isBatchTracked = Boolean(it?.isBatchTracked);

      if (!line.item) newErrors[`line_${idx}_item`] = "Item is required";
      if (!line.qty || Number(line.qty) <= 0)
        newErrors[`line_${idx}_qty`] = "Qty must be > 0";

      if (
        line.unitCost === "" ||
        line.unitCost === null ||
        line.unitCost === undefined
      )
        newErrors[`line_${idx}_unitCost`] = "Unit Cost is required";
      if (Number.isNaN(Number(line.unitCost)) || Number(line.unitCost) < 0)
        newErrors[`line_${idx}_unitCost`] = "Unit Cost must be >= 0";

      // ✅ batch fields required only for batch-tracked
      if (isBatchTracked) {
        if (!line.batchNumber?.trim())
          newErrors[`line_${idx}_batchNumber`] = "Batch number is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openAddProductForLine = (idx) => {
    setActiveLineIndex(idx);
    setShowAddItem(true);
  };

  const onItemCreatedFromModal = async () => {
    if (onItemsRefresh) await onItemsRefresh();
    // Optional auto-select: if your AddNewItem can return created item, set it here.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditable && existingGRN) {
      toast.error("Posted GRNs cannot be edited");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      setSaving(true);

      // Clean payload: GRN drives stock movement; server recomputes totals & batches.
      const payload = {
        grnDate: form.grnDate
          ? new Date(form.grnDate).toISOString()
          : undefined,
        remarks: form.remarks?.trim() || undefined,
        supplier: supplier._id,
        lines: form.lines.map((l) => ({
          item: l.item,
          batchNumber: l.batchNumber?.trim() || undefined,
          qty: Number(l.qty),
          unitCost: Number(l.unitCost),
        })),
      };

      let saved;
      if (existingGRN) {
        saved = await updateGRN(existingGRN._id, payload);
        toast.success("GRN updated successfully");
      } else {
        saved = await createGRN(payload);
        toast.success("GRN created successfully");
      }

      onSuccess && onSuccess(saved);
      onClose && onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save GRN");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            {existingGRN ? "Edit GRN" : "Create Goods Received Note (GRN)"}
          </h2>

          {supplier && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    Supplier Name
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {supplier.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    Contact Person
                  </p>
                  <p className="text-sm text-gray-900">
                    {supplier.contactPerson || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Phone</p>
                  <p className="text-sm text-gray-900">
                    {supplier.phones?.[0] || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!existingGRN && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                GRN Number will be automatically generated when you save this GRN
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingGRN && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GRN No
                </label>
                <input
                  type="text"
                  value={existingGRN.grnNo || "Auto-generated"}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-sm text-gray-600"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GRN Date
              </label>
              <input
                type="date"
                name="grnDate"
                value={form.grnDate}
                onChange={handleHeaderChange}
                disabled={fieldsDisabled}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>

            <button
              type="button"
              onClick={addLine}
              disabled={!isEditable}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              + Add Line Item
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Batch No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Unit Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {form.lines.map((line, index) => {
                  const it = line.item ? itemById.get(String(line.item)) : null;
                  const isBatchTracked = Boolean(it?.isBatchTracked);

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1">
                            <select
                            name="item"
                            value={line.item}
                            onChange={(e) => handleLineChange(index, e)}
                            disabled={fieldsDisabled}
                            className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                              errors[`line_${index}_item`]
                                ? "border-red-300 bg-red-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <option value="">-- Select Item --</option>
                              {items
                                .filter((x) => x.isActive !== false) // ✅ only active items selectable
                                .map((it) => (
                                  <option key={it._id} value={it._id}>
                                    {it.name} ({it.sku})
                                  </option>
                                ))}
                            </select>
                            {errors[`line_${index}_item`] && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors[`line_${index}_item`]}
                              </p>
                            )}

                            {it?.isBatchTracked && (
                              <p className="text-[11px] text-gray-500 mt-1">
                                Batch tracked (batch number required)
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => openAddProductForLine(index)}
                            disabled={fieldsDisabled}
                            className="px-3 py-2 text-xs font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/15"
                            title="Add new item"
                          >
                            + New
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          name="batchNumber"
                          value={line.batchNumber}
                          onChange={(e) => handleLineChange(index, e)}
                          disabled={!isBatchTracked || fieldsDisabled}
                          className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            errors[`line_${index}_batchNumber`]
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          } ${
                            !isBatchTracked
                              ? "bg-gray-50 cursor-not-allowed"
                              : ""
                          }`}
                          placeholder={isBatchTracked ? "Batch" : "N/A"}
                        />
                        {errors[`line_${index}_batchNumber`] && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors[`line_${index}_batchNumber`]}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          name="qty"
                          min="0"
                          step="0.01"
                          value={line.qty}
                          onChange={(e) => handleLineChange(index, e)}
                          disabled={fieldsDisabled}
                          className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            errors[`line_${index}_qty`]
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                          placeholder="0"
                        />
                        {errors[`line_${index}_qty`] && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors[`line_${index}_qty`]}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          name="unitCost"
                          min="0"
                          step="0.01"
                          value={line.unitCost}
                          onChange={(e) => handleLineChange(index, e)}
                          disabled={fieldsDisabled}
                          className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            errors[`line_${index}_unitCost`]
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                          placeholder="0.00"
                        />
                        {errors[`line_${index}_unitCost`] && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors[`line_${index}_unitCost`]}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Rs. {lineTotal(line).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          disabled={form.lines.length === 1 || !isEditable}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Qty:</span>
            <span className="font-semibold text-gray-900">
              {totals.totalQty}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
            <span className="font-medium text-gray-700">Grand Total:</span>
            <span className="text-lg font-bold text-primary">
              Rs. {totals.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleHeaderChange}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
            placeholder="Any additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !isEditable}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : existingGRN ? "Update GRN" : "Save GRN"}
          </button>
        </div>
      </form>

      {/* ✅ Add Product Modal (master-only; no stock fields) */}
      <AddNewItem
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        onSuccess={async () => {
          await onItemCreatedFromModal();
          setShowAddItem(false);
          setActiveLineIndex(null);
        }}
        item={null}
        suppliers={suppliers}
        categories={categories}
        baseUnits={baseUnits}
        // IMPORTANT: AddNewItem should respect mode and hide/ignore inventory/batches/openingStock
        mode="master-only"
        defaultSupplierId={supplier?._id}
      />
    </>
  );
}

export default GRNForm;









