import React from "react";
import { formatPaymentTerms } from "../../../utils/paymentTerms";

const SupplierTableRow = ({
  supplier,
  onViewDetails,
  onReceiveGoods,
  onViewGRNs,
  onPay,
  onEdit,
  onDelete,
}) => {
  return (
    <tr
      className="hover:bg-blue-50 cursor-pointer transition-colors"
      onClick={() => onViewDetails(supplier)}
    >
      <td className="py-4 px-6">
        <div className="font-medium text-gray-900">{supplier.name}</div>
        <div className="text-xs text-gray-500">
          {supplier.supplierCode || "No code"}
        </div>
      </td>
      <td className="py-4 px-6 text-sm text-gray-700">
        {formatPaymentTerms(supplier.paymentTerms)}
      </td>
      <td className="py-4 px-6">
        <span
          className={`font-semibold ${
            Number(supplier.currentBalance || 0) > 0
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          Rs. {Number(supplier.currentBalance || 0).toFixed(2)}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-wrap gap-2">
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
      </td>
    </tr>
  );
};

export default SupplierTableRow;
