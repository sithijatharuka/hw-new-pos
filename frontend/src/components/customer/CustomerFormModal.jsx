import React, { useEffect, useState } from "react";
import AppLoader from "../common/AppLoader";
import toast from "react-hot-toast";
import { validateCustomerForm } from "../common/formValidation"; // adjust path

const defaultForm = {
  name: "",
  phone: "",
  address: "",
  nic: "",
  type: "both",
  creditLimit: 0,
  notes: "",
};

const CustomerFormModal = ({
  open,
  initialData = null,
  onClose,
  onSubmit,
  saving = false,
}) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        nic: initialData.nic || "",
        type: initialData.type || "both",
        creditLimit:
          initialData.creditLimit !== undefined &&
          initialData.creditLimit !== null
            ? initialData.creditLimit
            : 0,
        notes: initialData.notes || "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const { isValid, errors, data } = validateCustomerForm(form);
    if (!isValid) {
      toast.error(errors[0] || "Please fix validation errors.");
      return;
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {initialData ? "Update Customer" : "Add New Customer"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            aria-label="Close customer form"
          >
            ✕
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <TextInput
            label="Name *"
            value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
          />
          <TextInput
            label="Phone *"
            value={form.phone}
            onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
          />
          <TextInput
            label="Address *"
            value={form.address}
            onChange={(v) => setForm((p) => ({ ...p, address: v }))}
          />
          <TextInput
            label="NIC *"
            value={form.nic}
            onChange={(v) => setForm((p) => ({ ...p, nic: v }))}
          />
          <SelectInput
            label="Customer type *"
            value={form.type}
            onChange={(v) => setForm((p) => ({ ...p, type: v }))}
            options={[
              { value: "cash", label: "Cash only" },
              { value: "credit", label: "Credit only" },
              { value: "both", label: "Cash & Credit" },
            ]}
          />
          <TextInput
            label="Credit limit (Rs.) *"
            type="number"
            min="0"
            value={form.creditLimit}
            onChange={(v) => setForm((p) => ({ ...p, creditLimit: v }))}
          />
          <TextArea
            label="Notes (optional)"
            value={form.notes}
            onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-soft cursor-pointer"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 cursor-pointer disabled:opacity-60"
              disabled={saving}
            >
              {initialData ? "Update" : "Save"}
            </button>
          </div>

          {saving && (
            <div className="pt-4">
              <AppLoader
                open
                variant="inline"
                title="Saving customer"
                subtitle="Updating customer details"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const TextInput = ({ label, value, onChange, type = "text", ...rest }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-xl px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
      {...rest}
    />
  </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      className="w-full border rounded-xl px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      rows={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-xl px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default CustomerFormModal;
