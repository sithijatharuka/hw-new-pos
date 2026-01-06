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
  return (
    <div
      className="p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
      onClick={() => onViewDetails(supplier)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-900">{supplier.name}</div>
          <div className="text-xs text-gray-500">
            {supplier.supplierCode || "No code"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Terms: {formatPaymentTerms(supplier.paymentTerms)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Outstanding</div>
          <div
            className={`font-bold ${
              Number(supplier.currentBalance || 0) > 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            Rs. {Number(supplier.currentBalance || 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs cursor-pointer hover:bg-orange-100"
          onClick={(e) => {
            e.stopPropagation();
            onReceiveGoods(supplier);
          }}
        >
          Receive Goods
        </button>
        <button
          className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs cursor-pointer hover:bg-purple-100"
          onClick={(e) => {
            e.stopPropagation();
            onViewGRNs(supplier);
          }}
        >
          View GRNs
        </button>
        <button
          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs disabled:opacity-50 cursor-pointer hover:bg-green-100 disabled:cursor-not-allowed"
          onClick={(e) => {
            e.stopPropagation();
            onPay(supplier);
          }}
          disabled={Number(supplier.currentBalance || 0) <= 0}
        >
          Pay
        </button>
        <button
          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs cursor-pointer hover:bg-blue-100"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(supplier);
          }}
        >
          Edit
        </button>
        <button
          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs cursor-pointer hover:bg-red-100"
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
