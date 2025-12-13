import React from "react";

/**
 * Outstanding Customer Credit Summary Component
 * Shows total credit given and top customers owing money
 *
 * NOTE: Logic is unchanged. Only styling and layout have been enhanced.
 */
const CreditSummaryCard = ({
  totalCreditGiven,
  topCustomers,
  warningCount,
  loading = false,
}) => {
  const hasCustomers = topCustomers && topCustomers.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">💳</span>
            <span>Outstanding Customer Credit Summary</span>
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Monitor your total credit exposure and keep an eye on customers
            approaching their limits.
          </p>
        </div>
      </div>

      {/* Summary Top Strip for smaller screens */}
      <div className="sm:hidden mb-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-600 mb-1">Total Credit Given</p>
          <p className="text-2xl font-bold text-blue-600">
            {typeof totalCreditGiven === "number"
              ? `LKR ${totalCreditGiven.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "LKR 0.00"}
          </p>
          {warningCount > 0 && (
            <p className="text-[11px] text-orange-600 mt-2 font-medium">
              ⚠️ {warningCount} customer(s) nearing credit limit
            </p>
          )}
        </div>
      </div>

      {/* Main Summary & Stats Row (tablet/desktop) */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 flex flex-col justify-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            Total Credit Given
          </p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600">
            {typeof totalCreditGiven === "number"
              ? `LKR ${totalCreditGiven.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "LKR 0.00"}
          </p>
        </div>
        <div className="flex flex-col justify-center items-start md:items-center bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            Credit Limit Alerts
          </p>
          <p className="font-semibold text-gray-900 text-sm sm:text-base">
            {warningCount > 0
              ? `${warningCount} customer(s) nearing limit`
              : "No current alerts"}
          </p>
          {warningCount > 0 && (
            <span className="mt-2 inline-flex items-center text-[11px] font-semibold bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              ⚠️ Attention needed
            </span>
          )}
        </div>
      </div>

      {/* Top Customers Section */}
      <div className="border-t border-gray-200 pt-5 sm:pt-6">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <h4 className="text-sm sm:text-base font-semibold text-gray-800">
            Top Customers Owing Money
          </h4>
          {hasCustomers && (
            <p className="text-[11px] sm:text-xs text-gray-500">
              Showing {topCustomers.length} customer
              {topCustomers.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600 mb-2" />
            <p className="text-xs sm:text-sm text-gray-500">
              Loading credit data...
            </p>
          </div>
        ) : hasCustomers ? (
          <>
            {/* Mobile-friendly compact cards */}
            <div className="sm:hidden space-y-3">
              {topCustomers.map((customer) => {
                const isWarning = customer.status === "warning";
                const percentage = Math.min(
                  customer.creditPercentage || 0,
                  100
                );

                return (
                  <div
                    key={customer._id}
                    className={`rounded-xl border p-3 transition-all duration-150 ${
                      isWarning
                        ? "bg-orange-50 border-orange-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {customer.name}
                        </p>
                        {customer.phone && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {customer.phone}
                          </p>
                        )}
                      </div>
                      {isWarning && (
                        <span className="inline-flex items-center text-[10px] font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                          ⚠️ Nearing limit
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between text-[11px] mb-1.5">
                      <div>
                        <p className="text-gray-600 mb-0.5">Balance</p>
                        <p className="font-semibold text-gray-900">
                          {typeof customer.currentBalance === "number"
                            ? `LKR ${customer.currentBalance.toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }
                              )}`
                            : "LKR 0"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 mb-0.5">Limit</p>
                        <p className="font-semibold text-gray-900">
                          {typeof customer.creditLimit === "number"
                            ? `LKR ${customer.creditLimit.toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }
                              )}`
                            : "LKR 0"}
                        </p>
                      </div>
                    </div>

                    {customer.creditLimit > 0 && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              percentage >= 80
                                ? "bg-red-500"
                                : percentage >= 60
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {percentage}% of limit used
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tablet / Desktop detailed cards (original layout) */}
            <div className="hidden sm:block">
              <div className="space-y-3 sm:space-y-4">
                {topCustomers.map((customer) => {
                  const isWarning = customer.status === "warning";
                  const percentage = Math.min(
                    customer.creditPercentage || 0,
                    100
                  );

                  return (
                    <div
                      key={customer._id}
                      className={`rounded-xl border p-3 sm:p-4 transition-all duration-150 ${
                        isWarning
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {customer.name}
                          </p>
                          {customer.phone && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {customer.phone}
                            </p>
                          )}
                        </div>
                        {isWarning && (
                          <span className="inline-flex items-center text-[11px] font-semibold bg-orange-100 text-orange-800 px-2 py-1 rounded-full self-start sm:self-auto">
                            ⚠️ Nearing Credit Limit
                          </span>
                        )}
                      </div>

                      {/* Financials row */}
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mb-2">
                        <div className="pr-2 border-r border-gray-200">
                          <p className="text-[11px] text-gray-600 mb-1">
                            Balance Due
                          </p>
                          <p className="font-semibold text-gray-900">
                            {typeof customer.currentBalance === "number"
                              ? `LKR ${customer.currentBalance.toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }
                                )}`
                              : "LKR 0"}
                          </p>
                        </div>
                        <div className="pl-2">
                          <p className="text-[11px] text-gray-600 mb-1">
                            Credit Limit
                          </p>
                          <p className="font-semibold text-gray-900">
                            {typeof customer.creditLimit === "number"
                              ? `LKR ${customer.creditLimit.toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }
                                )}`
                              : "LKR 0"}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {customer.creditLimit > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                percentage >= 80
                                  ? "bg-red-500"
                                  : percentage >= 60
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1">
                            {percentage}% of credit limit used
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 sm:py-8 text-center">
            <p className="text-sm sm:text-base text-gray-500">
              ✅ No outstanding credits at the moment
            </p>
            <p className="mt-1 text-xs sm:text-sm text-gray-400">
              Customers are all within their credit limits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditSummaryCard;
