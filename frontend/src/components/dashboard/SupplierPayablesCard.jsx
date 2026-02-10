import React from "react";
import AppLoader from "../common/AppLoader";
import { formatCurrency } from "../../utils/currency";

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
  currencySymbol = "Rs.",
  currencyPosition = "before",
}) => {
  return (
    <div className="w-full p-5 bg-white border border-gray-200 shadow-md rounded-2xl sm:p-6 lg:p-7">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold sm:text-xl text-accent">
            <span className="text-xl">💰</span>
            <span>Supplier Payables (Cash Flow Planning)</span>
          </h3>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Monitor what you owe suppliers and prepare for upcoming settlements.
          </p>
        </div>
      </div>

      {/* Total Outstanding */}
      <div className="mb-6">
        <div className="p-4 border border-red-200 shadow-sm bg-red-50 rounded-xl sm:p-5">
          <p className="mb-1 text-xs text-gray-600 sm:text-sm">
            Total Outstanding
          </p>
          <p className="text-2xl font-bold leading-tight text-red-600 sm:text-3xl">
            {typeof totalOutstanding === "number"
              ? formatCurrency(
                  totalOutstanding,
                  currencySymbol,
                  currencyPosition,
                )
              : formatCurrency(0, currencySymbol, currencyPosition)}
          </p>
          <p className="mt-1 text-[11px] sm:text-xs text-gray-600">
            Includes all unpaid supplier bills.
          </p>
        </div>
      </div>

      {/* List of supplier payables */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-700 sm:text-base sm:mb-4">
          Top Suppliers with Outstanding Payables
        </h4>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <AppLoader
              open
              variant="inline"
              title="Loading supplier payables"
              subtitle="Syncing outstanding balances"
            />
          </div>
        ) : supplierPayables && supplierPayables.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {supplierPayables.map((supplier) => (
              <div
                key={supplier._id}
                className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-150 cursor-default"
              >
                {/* Supplier header row */}
                <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 sm:text-base">
                      {supplier.supplierName}
                    </h4>
                    {supplier.code && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {supplier.code}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-red-600 sm:text-base">
                    {typeof supplier.totalPayable === "number"
                      ? formatCurrency(
                          supplier.totalPayable,
                          currencySymbol,
                          currencyPosition,
                        )
                      : formatCurrency(0, currencySymbol, currencyPosition)}
                  </span>
                </div>

                {/* Unpaid purchases list */}
                {supplier.unpaidPurchases &&
                  supplier.unpaidPurchases.length > 0 && (
                    <div className="p-3 rounded-lg bg-gray-50 sm:p-4">
                      <p className="mb-2 text-xs font-medium text-gray-600 sm:text-sm">
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
                                className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm"
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
                                <span className="font-semibold text-right text-gray-900">
                                  {typeof purchase.amount === "number"
                                    ? formatCurrency(
                                        purchase.amount,
                                        currencySymbol,
                                        currencyPosition,
                                      )
                                    : formatCurrency(
                                        0,
                                        currencySymbol,
                                        currencyPosition,
                                      )}
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
                              className="flex flex-col gap-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg"
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
                                    ? formatCurrency(
                                        purchase.amount,
                                        currencySymbol,
                                        currencyPosition,
                                      )
                                    : formatCurrency(
                                        0,
                                        currencySymbol,
                                        currencyPosition,
                                      )}
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
          <div className="py-6 text-center sm:py-8">
            <p className="text-sm text-gray-500 sm:text-base">
              ✅ All supplier payments are up to date
            </p>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
              No outstanding payables at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierPayablesCard;
