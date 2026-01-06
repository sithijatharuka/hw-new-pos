import React from "react";

const TrendCardHeader = ({ range, onRangeChange }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-1.5">
          <span className="text-xl">📈</span>
          <span>Sales Trend</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          View sales and invoice trends for the last 7 days, 30 days, or
          monthly.
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-2 rounded-xl p-1">
        <button
          onClick={() => onRangeChange("7d")}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
            range === "7d"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          } active:scale-95`}
        >
          Last 7 days
        </button>
        <button
          onClick={() => onRangeChange("30d")}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
            range === "30d"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          } active:scale-95`}
        >
          Last 30 days
        </button>
        <button
          onClick={() => onRangeChange("month")}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
            range === "month"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          } active:scale-95`}
        >
          Monthly (12m)
        </button>
      </div>
    </div>
  );
};

export default TrendCardHeader;
