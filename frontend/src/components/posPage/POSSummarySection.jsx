import React from "react";

const POSSummarySection = ({
  baseTotal,
  taxTotal,
  discountTotal,
  setDiscountTotal,
  grandTotal,
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
        Bill Summary
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center py-1.5">
          <span className="text-gray-700">Sub Total</span>
          <span className="font-medium text-gray-900">
            Rs. {baseTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span className="text-gray-700">Total VAT</span>
          <span className="font-medium text-gray-900">
            Rs. {taxTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center py-1.5 gap-3">
          <span className="text-gray-700">Bill Discount</span>
          <input
            type="number"
            min="0"
            className="w-28 sm:w-32 px-3 py-2 text-right bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={discountTotal}
            onChange={(e) => setDiscountTotal(Number(e.target.value || 0))}
          />
        </div>
        <div className="border-t border-gray-300 pt-3 sm:pt-4 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Grand Total
            </span>
            <span className="text-xl sm:text-2xl font-bold text-primary">
              Rs. {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSSummarySection;
