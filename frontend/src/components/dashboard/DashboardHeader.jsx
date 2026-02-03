import React from "react";
import { PageHeader } from "../common";

const DashboardHeader = ({
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  startDate,
  endDate,
  isRangeMode,
}) => {
  return (
    <>
      <PageHeader
        icon="📊"
        title="Dashboard"
        description="Real-time insights into your hardware store operations"
        className="mb-6"
      />
      <div className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Date Range Selector */}
            <div className="flex flex-col items-center gap-4">
              {/* Preset Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setDateRange("today")}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border cursor-pointer active:scale-95 ${
                    dateRange === "today"
                      ? "bg-accent text-white border-accent shadow-sm"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  📅 Today
                </button>
                <button
                  onClick={() => setDateRange("yesterday")}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border cursor-pointer active:scale-95 ${
                    dateRange === "yesterday"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  📆 Yesterday
                </button>
                <button
                  onClick={() => setDateRange("last7days")}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border cursor-pointer active:scale-95 ${
                    dateRange === "last7days"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  📊 Last 7 Days
                </button>
                <button
                  onClick={() => setDateRange("last30days")}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border cursor-pointer active:scale-95 ${
                    dateRange === "last30days"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  📈 Last 30 Days
                </button>
                <button
                  onClick={() => setDateRange("custom")}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border cursor-pointer active:scale-95 ${
                    dateRange === "custom"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  🗓️ Custom Range
                </button>
              </div>

              {/* Custom Date Inputs */}
              {dateRange === "custom" && (
                <div className="flex flex-wrap items-center justify-center gap-3 p-4 border border-gray-200 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      From:
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      max={customEndDate}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      To:
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      max={new Date().toISOString().split("T")[0]}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Active Date Range Display */}
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Viewing data for:</span>{" "}
                  {isRangeMode ? (
                    <>
                      <span className="font-mono">{startDate}</span>
                      {" to "}
                      <span className="font-mono">{endDate}</span>
                    </>
                  ) : (
                    <span className="font-mono">{startDate}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default DashboardHeader;
