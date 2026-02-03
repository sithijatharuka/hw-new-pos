// GRNForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createGRN, updateGRN } from "../../../api/supplier/grn";
import AddNewItem from "../../inventory/product/addProduct/AddNewItem";
import GRNFormHeader from "./GRNFormHeader";
import GRNFormMetadata from "./GRNFormMetadata";
import GRNLineItemsTable from "./GRNLineItemsTable";
import GRNTotalsSection from "./GRNTotalsSection";
import GRNRemarksSection from "./GRNRemarksSection";
import GRNFormActions from "./GRNFormActions";

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
  hideHeader = false,
  hideActions = false,
  formId = "grn-form",
  onSavingChange = null,

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
      { totalQty: 0, grandTotal: 0 },
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
      onSavingChange && onSavingChange(true);

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
      onSavingChange && onSavingChange(false);
    }
  };

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} className="space-y-6">
        {!hideHeader && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <GRNFormHeader existingGRN={existingGRN} supplier={supplier} />
            </div>
          </div>
        )}

        <GRNFormMetadata
          existingGRN={existingGRN}
          form={form}
          fieldsDisabled={fieldsDisabled}
          onHeaderChange={handleHeaderChange}
        />

        <GRNLineItemsTable
          form={form}
          items={items}
          errors={errors}
          fieldsDisabled={fieldsDisabled}
          isEditable={isEditable}
          itemById={itemById}
          lineTotal={lineTotal}
          onLineChange={handleLineChange}
          onAddProduct={openAddProductForLine}
          onRemoveLine={removeLine}
          onAddLine={addLine}
        />

        <GRNTotalsSection totals={totals} />

        <GRNRemarksSection form={form} onHeaderChange={handleHeaderChange} />

        {!hideActions && (
          <GRNFormActions
            saving={saving}
            isEditable={isEditable}
            existingGRN={existingGRN}
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        )}
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
