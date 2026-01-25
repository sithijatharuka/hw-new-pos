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
    [supplier],
  );

  const [amount, setAmount] = useState(() =>
    outstanding > 0 ? outstanding.toFixed(2) : "",
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
    <div
      className={[
        "fixed inset-0 z-50",
        "flex items-center justify-center p-4 sm:p-6",
        "bg-primary/60 backdrop-blur-sm",
      ].join(" ")}
    >
      <div
        className={[
          "w-full max-w-md",
          "rounded-3xl border border-border-light bg-background-secondary",
          "shadow-2xl",
          "transition-all duration-200 ease-out",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border-light sm:p-6">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-text-primary">
              Record Payment
            </h3>
            <p className="mt-1 text-sm truncate text-text-secondary">
              {supplier.name}
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              onClose();
            }}
            className={[
              "inline-flex h-11 w-11 items-center justify-center",
              "rounded-2xl border border-border-light",
              "bg-background-secondary text-text-secondary",
              "transition-all duration-200 ease-out",
              "hover:bg-background-subtle hover:shadow-sm",
              "active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-focus/20",
              "cursor-pointer",
            ].join(" ")}
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 sm:p-6">
          <div className="p-4 border rounded-2xl border-border-light bg-background-subtle">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-text-secondary">
                Outstanding
              </span>
              <span className="text-lg font-extrabold text-red-600 tabular-nums">
                Rs. {outstanding.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-primary">
              Payment Amount
            </label>

            <div className="relative">
              <span className="absolute text-sm font-semibold -translate-y-1/2 left-4 top-1/2 text-text-tertiary">
                Rs.
              </span>
              <input
                type="number"
                step="0.01"
                className={[
                  "w-full rounded-2xl py-3 pl-12 pr-4 text-sm",
                  "bg-background-secondary text-text-primary placeholder:text-text-tertiary",
                  "border focus:outline-none focus:ring-2 focus:border-primary",
                  error
                    ? "border-error bg-error-bg focus:ring-error/20"
                    : "border-border-light focus:ring-focus/20",
                  "shadow-sm transition-all duration-200 ease-out hover:shadow-md",
                ].join(" ")}
                value={amount}
                onChange={(e) => {
                  const v = e.target.value;
                  setAmount(v);
                  setError(validatePayAmount(v, outstanding));
                }}
                placeholder="0.00"
              />
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 p-5 border-t border-border-light sm:flex-row sm:justify-end sm:p-6">
          <button
            onClick={() => {
              setError("");
              onClose();
            }}
            className={[
              "inline-flex items-center justify-center",
              "rounded-2xl px-5 py-2.5 text-sm font-semibold",
              "border border-border-light bg-background-secondary text-text-secondary",
              "transition-all duration-200 ease-out",
              "hover:bg-background-subtle hover:shadow-sm",
              "active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-focus/20",
              "cursor-pointer",
            ].join(" ")}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={saving}
            className={[
              "inline-flex items-center justify-center",
              "rounded-2xl px-5 py-2.5 text-sm font-semibold",
              "bg-primary text-text-inverse",
              "shadow-md transition-all duration-200 ease-out",
              "hover:shadow-lg hover:-translate-y-0.5",
              "active:translate-y-0 active:scale-[0.99]",
              "focus:outline-none focus:ring-2 focus:ring-focus/20",
              "disabled:opacity-70 disabled:cursor-not-allowed",
              "cursor-pointer",
            ].join(" ")}
          >
            {saving ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
