import React from "react";

/**
 * Supplier Payables Component
 * Shows money owed to suppliers and upcoming settlement dates
 *
 * NOTE: Logic is unchanged. Only styling and layout have been enhanced.
 */
const SupplierPayablesCard = ({
  totalOutstanding,
  supplierPayables,
  loading = false,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span>Supplier Payables (Cash Flow Planning)</span>
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Monitor what you owe suppliers and prepare for upcoming settlements.
          </p>
        </div>
      </div>

      {/* Total Outstanding */}
      <div className="mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            Total Outstanding
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 leading-tight">
            {typeof totalOutstanding === "number"
              ? `LKR ${totalOutstanding.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "LKR 0.00"}
          </p>
          <p className="mt-1 text-[11px] sm:text-xs text-gray-600">
            Includes all unpaid supplier bills.
          </p>
        </div>
      </div>

      {/* List of supplier payables */}
      <div>
        <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">
          Top Suppliers with Outstanding Payables
        </h4>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mb-2" />
            <p className="text-xs sm:text-sm text-gray-500">
              Loading supplier payables…
            </p>
          </div>
        ) : supplierPayables && supplierPayables.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {supplierPayables.map((supplier) => (
              <div
                key={supplier._id}
                className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-150 cursor-default"
              >
                {/* Supplier header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      {supplier.supplierName}
                    </h4>
                    {supplier.code && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {supplier.code}
                      </p>
                    )}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-red-600">
                    {typeof supplier.totalPayable === "number"
                      ? `LKR ${supplier.totalPayable.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`
                      : "LKR 0"}
                  </span>
                </div>

                {/* Unpaid purchases list */}
                {supplier.unpaidPurchases &&
                  supplier.unpaidPurchases.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">
                        {supplier.unpaidPurchases.length} unpaid bill
                        {supplier.unpaidPurchases.length > 1 ? "s" : ""}:
                      </p>

                      {/* Desktop / tablet row-style layout */}
                      <div className="hidden sm:block">
                        <div className="space-y-1.5">
                          {supplier.unpaidPurchases
                            .slice(0, 3)
                            .map((purchase, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs sm:text-sm"
                              >
                                <span className="text-gray-700">
                                  Bill #{purchase.billNumber}
                                  <span
                                    className={`ml-2 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                                      purchase.status === "unpaid"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {purchase.status}
                                  </span>
                                </span>
                                <span className="font-semibold text-gray-900 text-right">
                                  {typeof purchase.amount === "number"
                                    ? `LKR ${purchase.amount.toLocaleString(
                                        "en-US",
                                        {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }
                                      )}`
                                    : "LKR 0"}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Mobile-friendly card layout for each unpaid bill */}
                      <div className="grid grid-cols-1 gap-2 sm:hidden">
                        {supplier.unpaidPurchases
                          .slice(0, 3)
                          .map((purchase, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800">
                                  Bill #{purchase.billNumber}
                                </span>
                                <span
                                  className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    purchase.status === "unpaid"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {purchase.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-gray-600">
                                  Amount
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {typeof purchase.amount === "number"
                                    ? `LKR ${purchase.amount.toLocaleString(
                                        "en-US",
                                        {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }
                                      )}`
                                    : "LKR 0"}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* "More bills" indicator (shared for both layouts) */}
                      {supplier.unpaidPurchases.length > 3 && (
                        <p className="text-[11px] sm:text-xs text-gray-600 pt-2 border-t border-gray-200 mt-2">
                          +{supplier.unpaidPurchases.length - 3} more bill
                          {supplier.unpaidPurchases.length - 3 > 1
                            ? "s"
                            : ""}{" "}
                          pending
                        </p>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 sm:py-8 text-center">
            <p className="text-gray-500 text-sm sm:text-base">
              ✅ All supplier payments are up to date
            </p>
            <p className="mt-1 text-xs sm:text-sm text-gray-400">
              No outstanding payables at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierPayablesCard;
