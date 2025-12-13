import React from "react";

/**
 * Daily Sales Card Component
 * Displays today's sales metrics including net profit (after expenses)
 *
 * NOTE: Logic is unchanged. Only styling and layout have been enhanced.
 */
const DailySalesCard = ({
  invoiceCount,
  totalSales,
  grossProfit,
  netProfit,
  totalExpenses,
  totalVAT,
  paymentBreakdown,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Real-Time Sales Overview
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Track performance at a glance – sales, profit, VAT and payment
            methods.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
        {/* Total Sales */}
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transform transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
          <div className="border-l-4 border-blue-500 pl-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Sales</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {typeof totalSales === "number"
                ? `LKR ${totalSales.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "LKR 0.00"}
            </p>
          </div>
        </div>

        {/* Invoice Count */}
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transform transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
          <div className="border-l-4 border-purple-500 pl-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              No. of Invoices
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {invoiceCount}
            </p>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transform transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
          <div className="border-l-4 border-green-500 pl-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              Gross Profit
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 leading-tight">
              {typeof grossProfit === "number"
                ? `LKR ${grossProfit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "LKR 0.00"}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transform transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
          <div className="border-l-4 border-emerald-600 pl-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Net Profit</p>
            <p
              className={`text-xl sm:text-2xl font-bold leading-tight ${
                netProfit >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {typeof netProfit === "number"
                ? `LKR ${netProfit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "LKR 0.00"}
            </p>
          </div>
        </div>

        {/* VAT Collected */}
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transform transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
          <div className="border-l-4 border-orange-500 pl-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              VAT Collected
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {typeof totalVAT === "number"
                ? `LKR ${totalVAT.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "LKR 0.00"}
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transform transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
          <div className="border-l-4 border-red-500 pl-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              Total Expenses
            </p>
            <p className="text-xl sm:text-2xl font-bold text-red-600 leading-tight">
              {typeof totalExpenses === "number"
                ? `LKR ${totalExpenses.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "LKR 0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="mt-4">
        <div className="bg-white border rounded-xl p-4 sm:p-5 transform transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-gray-900">
              Payment Breakdown
            </p>
            <p className="text-[11px] sm:text-xs text-gray-600">
              Cash, card, credit and bank totals
            </p>
          </div>

          {/* Desktop / tablet grid view */}
          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-l-4 border-indigo-500 pl-3 sm:pl-4">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-600 mb-1">Cash</p>
              <p className="font-semibold text-sm text-gray-900">
                {paymentBreakdown?.cash
                  ? `LKR ${paymentBreakdown.cash.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`
                  : "LKR 0"}
              </p>
            </div>

            <div>
              <p className="text-[11px] sm:text-xs text-gray-600 mb-1">Card</p>
              <p className="font-semibold text-sm text-gray-900">
                {paymentBreakdown?.card
                  ? `LKR ${paymentBreakdown.card.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`
                  : "LKR 0"}
              </p>
            </div>

            <div>
              <p className="text-[11px] sm:text-xs text-gray-600 mb-1">
                Credit
              </p>
              <p className="font-semibold text-sm text-gray-900">
                {paymentBreakdown?.credit
                  ? `LKR ${paymentBreakdown.credit.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`
                  : "LKR 0"}
              </p>
            </div>

            <div>
              <p className="text-[11px] sm:text-xs text-gray-600 mb-1">Bank</p>
              <p className="font-semibold text-sm text-gray-900">
                {paymentBreakdown?.bank
                  ? `LKR ${paymentBreakdown.bank.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`
                  : "LKR 0"}
              </p>
            </div>
          </div>

          {/* Mobile-friendly stacked view */}
          <div className="sm:hidden flex flex-col gap-3 border-l-4 border-indigo-500 pl-3 mt-1">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[11px] text-gray-600">Cash</p>
                <p className="font-semibold text-xs text-gray-900">
                  {paymentBreakdown?.cash
                    ? `LKR ${paymentBreakdown.cash.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : "LKR 0"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[11px] text-gray-600">Card</p>
                <p className="font-semibold text-xs text-gray-900">
                  {paymentBreakdown?.card
                    ? `LKR ${paymentBreakdown.card.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : "LKR 0"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[11px] text-gray-600">Credit</p>
                <p className="font-semibold text-xs text-gray-900">
                  {paymentBreakdown?.credit
                    ? `LKR ${paymentBreakdown.credit.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : "LKR 0"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[11px] text-gray-600">Bank</p>
                <p className="font-semibold text-xs text-gray-900">
                  {paymentBreakdown?.bank
                    ? `LKR ${paymentBreakdown.bank.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : "LKR 0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySalesCard;
