// SupplierMobileCard.jsx
import React from "react";
import { formatPaymentTerms } from "../../../utils/paymentTerms";

const SupplierMobileCard = ({
  supplier,
  onViewDetails,
  onReceiveGoods,
  onViewGRNs,
  onPay,
  onEdit,
  onDelete,
}) => {
  const outstanding = Number(supplier.currentBalance || 0);

  return (
    <div
      className={[
        "group relative",
        "rounded-2xl border border-border-light bg-background-secondary",
        "p-4 sm:p-5",
        "shadow-sm transition-all duration-200 ease-out",
        "hover:shadow-md hover:-translate-y-0.5",
        "cursor-pointer",
      ].join(" ")}
      onClick={() => onViewDetails(supplier)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-base font-bold truncate text-text-primary">
              {supplier.name}
            </div>
            <span className="inline-flex items-center rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary">
              {supplier.supplierCode || "No code"}
            </span>
          </div>

          <div className="mt-1 text-xs text-text-tertiary">
            Terms:{" "}
            <span className="font-semibold text-text-secondary">
              {formatPaymentTerms(supplier.paymentTerms)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-medium text-text-tertiary">
            Outstanding
          </div>
          <div
            className={[
              "mt-1 text-base font-extrabold tabular-nums",
              outstanding > 0 ? "text-red-600" : "text-success",
            ].join(" ")}
          >
            Rs. {outstanding.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          className={[
            "inline-flex items-center justify-center",
            "rounded-xl px-3 py-2 text-xs font-semibold",
            "bg-accent-subtle text-accent",
            "border border-border-light",
            "transition-all duration-200 ease-out",
            "hover:bg-accent-light hover:shadow-sm",
            "active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-focus/20",
            "cursor-pointer",
          ].join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            onReceiveGoods(supplier);
          }}
        >
          Receive Goods
        </button>

        <button
          className={[
            "inline-flex items-center justify-center",
            "rounded-xl px-3 py-2 text-xs font-semibold",
            "bg-pending-bg text-pending",
            "border border-border-light",
            "transition-all duration-200 ease-out",
            "hover:shadow-sm hover:-translate-y-[1px]",
            "active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-focus/20",
            "cursor-pointer",
          ].join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            onViewGRNs(supplier);
          }}
        >
          View GRNs
        </button>

        <button
          className={[
            "inline-flex items-center justify-center",
            "rounded-xl px-3 py-2 text-xs font-semibold",
            "bg-success-bg text-success",
            "border border-border-light",
            "transition-all duration-200 ease-out",
            "hover:shadow-sm hover:-translate-y-[1px]",
            "active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-focus/20",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "cursor-pointer",
          ].join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            onPay(supplier);
          }}
          disabled={outstanding <= 0}
        >
          Pay
        </button>

        <button
          className={[
            "inline-flex items-center justify-center",
            "rounded-xl px-3 py-2 text-xs font-semibold",
            "bg-primary-subtle text-primary",
            "border border-border-light",
            "transition-all duration-200 ease-out",
            "hover:shadow-sm hover:-translate-y-[1px]",
            "active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-focus/20",
            "cursor-pointer",
          ].join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(supplier);
          }}
        >
          Edit
        </button>

        <button
          className={[
            "inline-flex items-center justify-center",
            "rounded-xl px-3 py-2 text-xs font-semibold",
            "bg-error-bg text-red-600",
            "border border-border-light",
            "transition-all duration-200 ease-out",
            "hover:shadow-sm hover:-translate-y-[1px]",
            "active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-error/20",
            "cursor-pointer",
          ].join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(supplier);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SupplierMobileCard;
