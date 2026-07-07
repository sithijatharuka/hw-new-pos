import React, { useState } from "react";
import { formatCurrency } from "../../../utils/currency";
import ReturnSearchBar from "./ReturnSearchBar";
import ReturnReasonSelect from "./ReturnReasonSelect";

// TODO: ADD BACKEND CODE HERE — fetch new product details via inventory API
// TODO: ADD BACKEND CODE HERE — submit exchange via returnApi.createExchange(payload)
// On success: add returned item back to stock, deduct new item from stock,
//             settle balance (collect extra payment or issue refund), update dashboard

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "N/A"];

const ExchangePanel = ({
  returnedItem,
  returnQty,
  billingPrice,
  reason,
  onReasonChange,
  reasonNote,
  onReasonNoteChange,
  onSubmit,
  isSubmitting,
  errors = {},
  currencySymbol = "Rs.",
  currencyPosition = "before",
}) => {
  const [newProduct, setNewProduct] = useState(null);   // { sale, item }
  const [newSize, setNewSize] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [notFoundQuery, setNotFoundQuery] = useState("");

  const returnCredit = returnQty * (Number(billingPrice) || 0);
  const newItemTotal = newQty * (newProduct?.item?.unitPrice || 0);
  const balance = newItemTotal - returnCredit;
  // balance > 0  → customer pays extra
  // balance < 0  → customer gets refund
  // balance === 0 → even exchange

  const canSubmit = reason && newProduct && Number(billingPrice) > 0 && !isSubmitting;

  const handleNewProductFound = ({ sale, item }) => {
    setNewProduct({ sale, item });
    setNewSize("");
    setNewQty(1);
    setNotFoundQuery("");
  };

  const handleNewProductNotFound = (q) => {
    setNewProduct(null);
    setNotFoundQuery(q);
  };

  return (
    <div className="space-y-4">
      {/* Reason */}
      {/* <div className="rounded-2xl border border-gray-200 bg-background-secondary p-5 shadow-soft">
        <ReturnReasonSelect
          mode="exchange"
          value={reason}
          onChange={onReasonChange}
          note={reasonNote}
          onNoteChange={onReasonNoteChange}
          error={errors.reason}
        />
      </div> */}

      {/* ── Exchange With section ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-background-secondary shadow-soft">
        {/* Section header */}
        {/* <div className="border-b border-gray-200 bg-background-subtle px-5 py-3.5">
          <p className="text-sm font-bold text-text-primary">Exchange With</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            Search for the new product the customer wants
          </p>
        </div> */}

        <div className="px-5 py-5 space-y-5">
          {/* New product search */}
          {!newProduct ? (
            <>
              <ReturnSearchBar
                label=""
                onFound={handleNewProductFound}
                onNotFound={handleNewProductNotFound}
                autoFocus={false}
              />
              {notFoundQuery && (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-error/40 bg-error-subtle px-4 py-3">
                  <span className="text-lg">🔎</span>
                  <div>
                    <p className="text-xs font-bold text-error">Product Not Found</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      No product matched "{notFoundQuery}". Try a different code.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected new product card */}
              <div className="rounded-2xl border border-primary/25 bg-primary-subtle p-4">
                {/* <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                      📦
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary">{newProduct.item.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-white/70 px-2 py-0.5 text-xs font-medium text-text-secondary">
                          SKU: {newProduct.item.sku}
                        </span>
                        <span className="rounded-lg bg-white/70 px-2 py-0.5 text-xs font-medium text-text-secondary">
                          {formatCurrency(newProduct.item.unitPrice, currencySymbol, currencyPosition)} / {newProduct.item.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setNewProduct(null); setNotFoundQuery(""); }}
                    className="flex-shrink-0 text-xs font-semibold text-error hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div> */}

                {/* New item: size + qty */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {/* <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Size
                    </label>
                    <div className="relative">
                      <select
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 pr-7 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">— Select —</option>
                        {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-tertiary">▼</span>
                    </div>
                  </div> */}
                  {/* <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Qty
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewQty((q) => Math.max(1, q - 1))}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-base font-bold text-text-secondary hover:bg-background-subtle transition-all active:scale-95 cursor-pointer"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={newQty}
                        onChange={(e) => setNewQty(Math.max(1, Number(e.target.value) || 1))}
                        onWheel={(e) => e.target.blur()}
                        className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-center text-sm font-bold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setNewQty((q) => q + 1)}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-base font-bold text-text-secondary hover:bg-background-subtle transition-all active:scale-95 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* ── Financial breakdown ── */}
              <div className="rounded-2xl border border-gray-200 bg-background-subtle overflow-hidden">
                <div className="px-5 py-4 space-y-3 text-sm">
                  {/* Returned item row */}
                  {/* <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-text-tertiary uppercase tracking-wide font-semibold mb-0.5">
                        Returned Item
                      </p>
                      <p className="font-medium text-text-primary truncate">{returnedItem?.name}</p>
                    </div>
                    <span className="ml-4 flex-shrink-0 font-bold text-text-primary">
                      {formatCurrency(returnCredit, currencySymbol, currencyPosition)}
                    </span>
                  </div> */}

                  <div className="border-t border-gray-200" />

                  {/* New item row */}
                  {/* <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-text-tertiary uppercase tracking-wide font-semibold mb-0.5">
                        New Item
                      </p>
                      <p className="font-medium text-text-primary truncate">{newProduct.item.name}</p>
                    </div>
                    <span className="ml-4 flex-shrink-0 font-bold text-text-primary">
                      {formatCurrency(newItemTotal, currencySymbol, currencyPosition)}
                    </span>
                  </div> */}
                </div>

                {/* Balance result — prominent */}
                {/* <div className={[
                  "flex items-center justify-between px-5 py-4 border-t border-gray-200",
                  balance > 0
                    ? "bg-error-subtle"
                    : balance < 0
                    ? "bg-status-success-bg"
                    : "bg-background-subtle",
                ].join(" ")}>
                  <div>
                    <p className={[
                      "text-xs font-semibold uppercase tracking-wide mb-0.5",
                      balance > 0 ? "text-error" : balance < 0 ? "text-status-success-text" : "text-text-tertiary",
                    ].join(" ")}>
                      {balance > 0 ? "Extra Payment" : balance < 0 ? "Refund" : "Even Exchange"}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {balance > 0
                        ? "Customer pays the difference"
                        : balance < 0
                        ? "Refund the difference to customer"
                        : "No payment needed"}
                    </p>
                  </div>
                  <span className={[
                    "text-xl font-bold",
                    balance > 0 ? "text-error" : balance < 0 ? "text-status-success-DEFAULT" : "text-text-tertiary",
                  ].join(" ")}>
                    {balance !== 0
                      ? formatCurrency(Math.abs(balance), currencySymbol, currencyPosition)
                      : "—"}
                  </span>
                </div> */}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Impact info */}
      {/* <div className="rounded-2xl border border-gray-200 bg-background-subtle px-5 py-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">
          On Confirm
        </p>
        {[
          { icon: "📦", text: `${returnedItem?.name ?? "Returned item"} stock +${returnQty}` },
          { icon: "📤", text: `${newProduct?.item?.name ?? "New item"} stock reduced` },
          { icon: "💹", text: "Dashboard profit & sales updated" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs text-text-secondary">
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div> */}

      {/* Submit */}
      <button
        type="button"
        onClick={() => onSubmit({ newProduct, newSize, newQty, balance })}
        disabled={!canSubmit}
        className={[
          "w-full rounded-2xl px-6 py-3.5 text-sm font-bold text-text-inverse shadow-card",
          "transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent/30",
          canSubmit
            ? "bg-accent hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-float cursor-pointer"
            : "bg-accent/40 cursor-not-allowed",
        ].join(" ")}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Processing Exchange…
          </span>
        ) : "Complete Exchange"}
      </button>
    </div>
  );
};

export default ExchangePanel;
