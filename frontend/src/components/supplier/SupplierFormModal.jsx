// src/components/supplier/SupplierFormModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  PAYMENT_TERM_TYPES,
  NET_DAY_OPTIONS,
  normalizePaymentTerms,
} from "../../utils/paymentTerms";
import { isValidEmail, isValidPhoneNumber } from "../common/formValidation"; // same import you already use

const empty = {
  supplierCode: "",
  name: "",
  contactPerson: "",
  phones: [],
  phoneInput: "",
  address: "",
  email: "",
  openingBalance: 0,
  creditLimit: 0,
  paymentTerms: { type: "CASH", days: 0 },
  vatNo: "",
  brn: "",
  notes: "",
  status: "active",
};

export default function SupplierFormModal({
  open,
  editingSupplier, // null or supplier object
  saving,
  onClose,
  onSubmit, // async (payload) => void
}) {
  const isEdit = !!editingSupplier;

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (!editingSupplier) {
      setForm(empty);
      setErrors({});
      return;
    }

    setForm({
      supplierCode: editingSupplier.supplierCode || "",
      name: editingSupplier.name || "",
      contactPerson: editingSupplier.contactPerson || "",
      phones: editingSupplier.phones || [],
      phoneInput: "",
      address: editingSupplier.address || "",
      email: editingSupplier.email || "",
      openingBalance:
        editingSupplier.openingBalance !== undefined &&
        editingSupplier.openingBalance !== null
          ? editingSupplier.openingBalance
          : 0,
      creditLimit:
        editingSupplier.creditLimit !== undefined &&
        editingSupplier.creditLimit !== null
          ? editingSupplier.creditLimit
          : 0,
      paymentTerms: normalizePaymentTerms(editingSupplier.paymentTerms),
      vatNo: editingSupplier.vatNo || "",
      brn: editingSupplier.brn || "",
      notes: editingSupplier.notes || "",
      status: editingSupplier.status || "active",
    });
    setErrors({});
  }, [open, editingSupplier]);

  const validate = () => {
    const e = {};

    if (!form.name || form.name.trim().length < 2)
      e.name = "Supplier name is required (min 2 chars).";
    if (!form.address || form.address.trim().length < 5)
      e.address = "Address is required (min 5 chars).";
    const phoneInput = form.phoneInput.trim();
    if (!form.phones || form.phones.length === 0)
      e.phones = "At least one phone number is required.";

    // Validate all entered numbers + pending input
    const invalidPhones = (form.phones || []).filter(
      (phone) => !isValidPhoneNumber(phone)
    );
    if (invalidPhones.length > 0)
      e.phones = `Phone number "${invalidPhones[0]}" is invalid.`;
    else if (phoneInput && !isValidPhoneNumber(phoneInput))
      e.phones = "Enter a valid phone number and click Add.";
    else if (phoneInput && !e.phones)
      e.phones = "Click Add to include the phone number.";

    const cl = Number(form.creditLimit);
    if (Number.isNaN(cl) || cl <= 0)
      e.creditLimit = "Credit limit must be greater than 0.";

    const ob = Number(form.openingBalance);
    if (Number.isNaN(ob) || ob < 0)
      e.openingBalance = "Opening balance must be 0 or greater.";

    if (form.email && !isValidEmail(form.email))
      e.email = "Email address is invalid.";

    // paymentTerms sanity
    const pt = normalizePaymentTerms(form.paymentTerms);
    if (pt.type === "NET" && (Number.isNaN(pt.days) || pt.days < 0)) {
      e.paymentTerms = "Net days must be 0 or more.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addPhone = () => {
    const phone = form.phoneInput.trim();
    if (!phone) return;

    if (!isValidPhoneNumber(phone))
      return toast.error(`Phone number is invalid.`);
    if (form.phones.includes(phone))
      return toast.error("This phone number is already added.");

    const newPhones = [...form.phones, phone];
    setForm((p) => ({ ...p, phones: newPhones, phoneInput: "" }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phones;
      return next;
    });
  };

  const submit = async () => {
    if (!validate()) return;

    const payload = {
      supplierCode: form.supplierCode?.trim() || undefined,
      name: form.name.trim(),
      contactPerson: form.contactPerson?.trim() || undefined,
      phones: form.phones,
      address: form.address.trim(),
      email: form.email?.trim() || undefined,
      openingBalance: Number(form.openingBalance || 0),
      creditLimit: Number(form.creditLimit || 0),
      paymentTerms: normalizePaymentTerms(form.paymentTerms),
      vatNo: form.vatNo?.trim() || undefined,
      brn: form.brn?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      status: form.status,
    };

    await onSubmit(payload);
  };

  const pt = useMemo(
    () => normalizePaymentTerms(form.paymentTerms),
    [form.paymentTerms]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Supplier" : "Add New Supplier"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? "Update supplier information"
                : "Fill in the details to add a new supplier"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Code
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  value={form.supplierCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supplierCode: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                  } rounded-xl focus:outline-none focus:ring-2 ${
                    errors.name ? "focus:ring-red-200" : "focus:ring-primary/20"
                  } focus:border-primary text-sm`}
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
                {errors.name && (
                  <p className="mt-2 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactPerson: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-3 border ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  } rounded-xl focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "focus:ring-red-200"
                      : "focus:ring-primary/20"
                  } focus:border-primary text-sm`}
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Numbers <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className={`flex-1 px-4 py-3 border ${
                      errors.phones
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    } rounded-xl focus:outline-none focus:ring-2 ${
                      errors.phones
                        ? "focus:ring-red-200"
                        : "focus:ring-primary/20"
                    } focus:border-primary text-sm`}
                    placeholder="Add phone number"
                    value={form.phoneInput}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phoneInput: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPhone();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium"
                    onClick={addPhone}
                  >
                    Add
                  </button>
                </div>

                {form.phones.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.phones.map((phone, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs flex items-center gap-2"
                      >
                        {phone}
                        <button
                          type="button"
                          onClick={() => {
                            const newPhones = form.phones.filter(
                              (_, i) => i !== idx
                            );
                            setForm((p) => ({ ...p, phones: newPhones }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.phones && (
                  <p className="mt-2 text-xs text-red-600">{errors.phones}</p>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className={`w-full px-4 py-3 border ${
                    errors.address
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  } rounded-xl focus:outline-none focus:ring-2 ${
                    errors.address
                      ? "focus:ring-red-200"
                      : "focus:ring-primary/20"
                  } focus:border-primary text-sm resize-none`}
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
                {errors.address && (
                  <p className="mt-2 text-xs text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT No
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    value={form.vatNo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, vatNo: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BRN
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    value={form.brn}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, brn: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* ✅ Payment Terms dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={pt.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      setForm((p) => ({
                        ...p,
                        paymentTerms:
                          type === "NET"
                            ? { type, days: p.paymentTerms?.days || 30 }
                            : { type, days: 0 },
                      }));
                    }}
                  >
                    {PAYMENT_TERM_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <select
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      pt.type !== "NET" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    value={pt.days}
                    disabled={pt.type !== "NET"}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        paymentTerms: {
                          type: "NET",
                          days: Number(e.target.value) || 0,
                        },
                      }))
                    }
                  >
                    {NET_DAY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        Net {d} days
                      </option>
                    ))}
                    <option value={pt.days}>Custom: {pt.days} days</option>
                  </select>
                </div>

                {pt.type === "NET" && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">
                      Custom Net Days (optional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={pt.days}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          paymentTerms: {
                            type: "NET",
                            days: Number(e.target.value) || 0,
                          },
                        }))
                      }
                    />
                  </div>
                )}

                {errors.paymentTerms && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.paymentTerms}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Balance <span className="text-red-500">*</span>{" "}
                    {isEdit && (
                      <span className="text-gray-400 text-xs">(read-only)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={isEdit}
                    className={`w-full px-4 py-3 border ${
                      errors.openingBalance
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    } rounded-xl focus:outline-none focus:ring-2 ${
                      errors.openingBalance
                        ? "focus:ring-red-200"
                        : "focus:ring-primary/20"
                    } focus:border-primary text-sm ${
                      isEdit ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    value={form.openingBalance}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, openingBalance: e.target.value }))
                    }
                  />
                  {errors.openingBalance && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.openingBalance}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Limit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`w-full px-4 py-3 border ${
                      errors.creditLimit
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    } rounded-xl focus:outline-none focus:ring-2 ${
                      errors.creditLimit
                        ? "focus:ring-red-200"
                        : "focus:ring-primary/20"
                    } focus:border-primary text-sm`}
                    value={form.creditLimit}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, creditLimit: e.target.value }))
                    }
                  />
                  {errors.creditLimit && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.creditLimit}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : isEdit
              ? "Update Supplier"
              : "Save Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}
