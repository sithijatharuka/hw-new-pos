import React from "react";
import { formatCurrency } from "../../utils/currency";

const POSSummarySection = ({
  baseTotal,
  taxTotal,
  discountTotal,
  setDiscountTotal,
  grandTotal,
  currencySymbol = "Rs.",
  currencyPosition = "before",
}) => {
  return (
    <div className="p-4 border border-gray-200 bg-gray-50 rounded-2xl sm:p-6">
      <h3 className="mb-4 text-base font-bold text-gray-900 sm:text-lg">
        Bill Summary
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center py-1.5">
          <span className="text-gray-700">Sub Total</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(baseTotal, currencySymbol, currencyPosition)}
          </span>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span className="text-gray-700">Total VAT</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(taxTotal, currencySymbol, currencyPosition)}
          </span>
        </div>
        <div className="flex justify-between items-center py-1.5 gap-3">
          <span className="text-gray-700">Bill Discount</span>
          <input
            type="number"
            min="0"
            className="px-3 py-2 text-sm text-right transition-all bg-white border border-gray-300 rounded-lg w-28 sm:w-32 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={discountTotal}
            onChange={(e) => setDiscountTotal(Number(e.target.value || 0))}
          />
        </div>
        <div className="pt-3 mt-2 border-t border-gray-300 sm:pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 sm:text-xl">
              Grand Total
            </span>
            <span className="text-xl font-bold sm:text-2xl text-primary">
              {formatCurrency(grandTotal, currencySymbol, currencyPosition)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSSummarySection;
