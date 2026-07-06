import React from "react";
import { formatCurrency } from "../../../utils/currency";

const ProductDetailsCard = ({
  heading = "Returned Product",
  sale,
  item,
  billingPrice,
  onBillingPriceChange,
  returnQty,
  onReturnQtyChange,
  currencySymbol = "Rs.",
  currencyPosition = "before",
}) => {
  if (!sale || !item) return null;

  const effectivePrice = Number(billingPrice) || 0;
  const refundAmount = returnQty * effectivePrice;

  const paymentBadge = {
    cash: { label: "💵 Cash", cls: "bg-status-success-bg text-status-success-text" },
    card: { label: "💳 Card", cls: "bg-status-pending-bg text-status-pending-text" },
    bank: { label: "🏦 Bank", cls: "bg-primary-subtle text-primary" },
  }[sale.paymentMethod] ?? { label: sale.paymentMethod, cls: "bg-background-subtle text-text-secondary" };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-background-secondary shadow-soft">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-gray-200 bg-background-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-0.5">
            {heading}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-text-primary">{sale.invoiceNumber}</span>
            <span className={`rounded-xl px-2.5 py-0.5 text-xs font-semibold ${paymentBadge.cls}`}>
              {paymentBadge.label}
            </span>
          </div>
        </div>
        <span className="rounded-xl bg-status-success-bg px-3 py-1 text-xs font-semibold text-status-success-text w-fit">
          {formatCurrency(sale.total, currencySymbol, currencyPosition)}
        </span>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Product identity */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-xl">
            📦
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-text-primary">{item.name}</h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-background-subtle px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                SKU: {item.sku}
              </span>
              <span className="rounded-lg bg-background-subtle px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                Barcode: {item.barcode}
              </span>
              <span className="rounded-lg bg-background-subtle px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                Unit: {item.unit}
              </span>
              {item.vatApplicable && (
                <span className="rounded-lg bg-status-pending-bg px-2.5 py-0.5 text-xs font-semibold text-status-pending-text">
                  VAT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Original price stat */}
        <div className="flex items-center gap-3 rounded-2xl bg-background-subtle px-4 py-3">
          <span className="text-xs text-text-tertiary">Original Sale Price</span>
          <span className="ml-auto text-sm font-bold text-text-primary">
            {formatCurrency(item.unitPrice, currencySymbol, currencyPosition)}
          </span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="text-xs text-text-tertiary">
            Purchased: {item.qty} {item.unit}
          </span>
        </div>

        {/* Inputs grid: Billing Price | Return Qty */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Billing price */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Billing Price <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-tertiary">
                Rs.
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={billingPrice}
                onChange={(e) => onBillingPriceChange(e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="w-full rounded-2xl border border-gray-200 bg-background-secondary py-2.5 pl-10 pr-3 text-right text-sm font-semibold text-text-primary shadow-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Return qty */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Return Qty <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onReturnQtyChange(Math.max(1, returnQty - 1))}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-background-subtle text-base font-bold text-text-secondary hover:bg-background-primary hover:text-text-primary transition-all active:scale-95 cursor-pointer"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={item.qty}
                value={returnQty}
                onChange={(e) =>
                  onReturnQtyChange(Math.max(1, Math.min(Number(e.target.value) || 1, item.qty)))
                }
                onWheel={(e) => e.target.blur()}
                className="flex-1 rounded-2xl border border-gray-200 bg-background-secondary py-2.5 text-center text-sm font-bold text-text-primary shadow-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => onReturnQtyChange(Math.min(item.qty, returnQty + 1))}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-background-subtle text-base font-bold text-text-secondary hover:bg-background-primary hover:text-text-primary transition-all active:scale-95 cursor-pointer"
              >
                +
              </button>
            </div>
            <p className="mt-1 text-[11px] text-text-tertiary">Max: {item.qty}</p>
          </div>
        </div>

        {/* Refund preview */}
        {effectivePrice > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-background-subtle px-5 py-3">
            <div>
              <p className="text-xs text-text-tertiary">Return Credit</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                {returnQty} × {formatCurrency(effectivePrice, currencySymbol, currencyPosition)}
              </p>
            </div>
            <p className="text-lg font-bold text-status-success-DEFAULT">
              {formatCurrency(refundAmount, currencySymbol, currencyPosition)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsCard;
