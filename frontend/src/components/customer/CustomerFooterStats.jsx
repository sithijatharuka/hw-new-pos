import React from "react";

const CustomerFooterStats = ({ customers }) => {
  if (customers.length === 0) return null;

  const totalCreditLimit = customers
    .reduce((sum, c) => sum + (c.creditLimit || 0), 0)
    .toFixed(2);

  const totalOutstanding = customers
    .reduce((sum, c) => sum + (c.currentBalance || 0), 0)
    .toFixed(2);

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 text-center md:text-left">
          Showing {customers.length} customer
          {customers.length !== 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Total Credit Limit:</span>
            <span className="ml-2 font-bold">Rs. {totalCreditLimit}</span>
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-medium">Total Outstanding:</span>
            <span className="ml-2 font-bold text-red-600">
              Rs. {totalOutstanding}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFooterStats;
