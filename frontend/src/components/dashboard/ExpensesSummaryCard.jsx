import React from "react";

/**
 * Expenses Summary Card Component
 * Displays total expenses, count, and breakdown by category
 */
const ExpensesSummaryCard = ({
  totalExpenses = 0,
  expenseCount = 0,
  categoryBreakdown = [],
  loading = false,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-1.5">
            <span className="text-xl">💰</span>
            <span>Expenses</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Breakdown of operating expenses by category
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total Expenses Summary */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Total Expenses
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1">
                  LKR{" "}
                  {typeof totalExpenses === "number"
                    ? totalExpenses.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm sm:text-base font-semibold text-gray-700">
                  {expenseCount}
                </p>
                <p className="text-xs text-gray-500">
                  expense{expenseCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown && categoryBreakdown.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                By Category
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {categoryBreakdown.map((item, idx) => {
                  const percentage =
                    totalExpenses > 0
                      ? Math.round((item.amount / totalExpenses) * 100)
                      : 0;

                  return (
                    <div key={idx} className="flex items-stretch gap-3 py-1">
                      <div className="flex-1">
                        {/* Desktop / tablet header row */}
                        <div className="hidden sm:flex items-center justify-between mb-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-700">
                            {item.category}
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">
                            {percentage}%
                          </p>
                        </div>

                        {/* Mobile-friendly stacked header */}
                        <div className="flex flex-col sm:hidden mb-1 gap-0.5">
                          <p className="text-xs font-medium text-gray-700">
                            {item.category}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-gray-500">
                              Share of total
                            </p>
                            <p className="text-xs font-semibold text-gray-900">
                              {percentage}%
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {/* Amount */}
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 flex justify-between sm:justify-start sm:gap-2">
                          <span className="hidden sm:inline">Amount:</span>
                          <span>LKR {item.amount.toLocaleString("en-US")}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">No expenses recorded</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpensesSummaryCard;
