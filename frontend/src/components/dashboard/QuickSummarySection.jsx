import React from "react";

const QuickSummarySection = ({
  dailySalesOverview,
  creditSummary,
  supplierPayables,
  startDate,
  endDate,
  isRangeMode,
}) => {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-600 rounded-2xl p-6 sm:p-7 lg:p-8 shadow-lg">
      <h3 className="font-bold text-white mb-6 text-base sm:text-lg flex items-center gap-2">
        <span className="text-xl">📊</span>
        Quick Summary {isRangeMode && `(${startDate} to ${endDate})`}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-colors">
          <p className="text-blue-100 text-xs sm:text-sm mb-2">
            {isRangeMode ? "Period Revenue" : "Daily Revenue"}
          </p>
          <p className="font-bold text-lg sm:text-xl text-white">
            {typeof dailySalesOverview?.totalSalesAmount === "number"
              ? `LKR ${dailySalesOverview.totalSalesAmount.toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }
                )}`
              : "LKR 0"}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-colors">
          <p className="text-blue-100 text-xs sm:text-sm mb-2">
            {isRangeMode ? "Total Invoices" : "Invoices Today"}
          </p>
          <p className="font-bold text-lg sm:text-xl text-white">
            {dailySalesOverview?.invoiceCount || 0}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-colors">
          <p className="text-blue-100 text-xs sm:text-sm mb-2">Credit Given</p>
          <p className="font-bold text-lg sm:text-xl text-red-200">
            {typeof creditSummary?.totalCreditGiven === "number"
              ? `LKR ${creditSummary.totalCreditGiven.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
              : "LKR 0"}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-colors">
          <p className="text-blue-100 text-xs sm:text-sm mb-2">Payables</p>
          <p className="font-bold text-lg sm:text-xl text-orange-200">
            {typeof supplierPayables?.totalOutstanding === "number"
              ? `LKR ${supplierPayables.totalOutstanding.toLocaleString(
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
    </section>
  );
};

export default QuickSummarySection;
