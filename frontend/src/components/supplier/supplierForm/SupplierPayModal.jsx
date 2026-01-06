// src/components/supplier/SupplierPayModal.jsx
import React, { useMemo, useState } from "react";

const validatePayAmount = (value, outstanding) => {
  const amountNum = Number(value);
  if (Number.isNaN(amountNum) || amountNum <= 0)
    return "Enter an amount greater than 0";
  if (amountNum > outstanding) return "Cannot pay more than outstanding";
  return "";
};

export default function SupplierPayModal({
  open,
  supplier,
  onClose,
  onConfirm, // async (amountNumber) => void
  saving,
}) {
  const outstanding = useMemo(
    () => Number(supplier?.currentBalance || 0),
    [supplier]
  );

  const [amount, setAmount] = useState(() =>
    outstanding > 0 ? outstanding.toFixed(2) : ""
  );
  const [error, setError] = useState("");

  if (!open || !supplier) return null;

  const submit = async () => {
    const msg = validatePayAmount(amount, outstanding);
    if (msg) return setError(msg);

    setError("");
    await onConfirm(Number(amount));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Record Payment</h3>
            <p className="text-sm text-gray-500 mt-1">{supplier.name}</p>
          </div>
          <button
            onClick={() => {
              setError("");
              onClose();
            }}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Outstanding</span>
            <span className="text-lg font-bold text-red-600">
              Rs. {outstanding.toFixed(2)}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Rs.
              </span>
              <input
                type="number"
                step="0.01"
                className={`w-full pl-12 pr-4 py-3 border ${
                  error ? "border-red-300 bg-red-50" : "border-gray-200"
                } rounded-xl focus:outline-none focus:ring-2 ${
                  error ? "focus:ring-red-200" : "focus:ring-primary/20"
                } focus:border-primary text-sm`}
                value={amount}
                onChange={(e) => {
                  const v = e.target.value;
                  setAmount(v);
                  setError(validatePayAmount(v, outstanding));
                }}
                placeholder="0.00"
              />
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => {
              setError("");
              onClose();
            }}
            className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
