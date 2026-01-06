import React, { useState, useEffect, useCallback } from "react";
import {
  getDailySalesOverview,
  getProfitMetrics,
  getExpensesSummary,
  getMonthlySalesTrend,
} from "../components/dashboard/api/dashboardApi";

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);

  // Calculate date range based on selection
  const getDateRangeParams = useCallback(() => {
    const today = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case "today":
        startDate = endDate = new Date().toISOString().split("T")[0];
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split("T")[0];
        break;
      case "last7days":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);
        startDate = weekAgo.toISOString().split("T")[0];
        endDate = new Date().toISOString().split("T")[0];
        break;
      case "last30days":
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 29);
        startDate = monthAgo.toISOString().split("T")[0];
        endDate = new Date().toISOString().split("T")[0];
        break;
      case "custom":
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = endDate = new Date().toISOString().split("T")[0];
    }

    return { startDate, endDate };
  }, [dateRange, customStartDate, customEndDate]);

  // Generate daily breakdown data
  const generateDailyBreakdown = useCallback(async (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        days.push(dateStr);
      }

      // Fetch data for all days in parallel
      const dayDataPromises = days.map((date) =>
        Promise.all([
          getDailySalesOverview(date, date),
          getProfitMetrics(date, date),
          getExpensesSummary(date, date),
        ])
      );

      const allDayData = await Promise.all(dayDataPromises);

      return days.map((date, idx) => {
        const [sales, profit, expenses] = allDayData[idx];
        return {
          date,
          totalSales: sales?.totalSalesAmount || 0,
          invoiceCount: sales?.invoiceCount || 0,
          totalVAT: sales?.totalVAT || 0,
          grossProfit: profit?.today?.grossProfit || 0,
          netProfit: profit?.today?.netProfit || 0,
          totalExpenses: expenses?.totalExpenses || 0,
        };
      });
    } catch (err) {
      console.error("Error generating daily breakdown:", err);
      return [];
    }
  }, []);

  // Load report data
  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRangeParams();
      const isSingleDay = startDate === endDate;
      const isRangeMode = !["today", "yesterday"].includes(dateRange);

      // Fetch all required data
      const [sales, profit, expenses] = await Promise.all([
        getDailySalesOverview(startDate, endDate),
        getProfitMetrics(startDate, endDate),
        getExpensesSummary(startDate, endDate),
      ]);

      setReportData({
        startDate,
        endDate,
        isSingleDay,
        isRangeMode,
        totalSales: sales?.totalSalesAmount || 0,
        invoiceCount: sales?.invoiceCount || 0,
        totalVAT: sales?.totalVAT || 0,
        grossProfit: profit?.today?.grossProfit || 0,
        netProfit: profit?.today?.netProfit || 0,
        totalExpenses: expenses?.totalExpenses || 0,
        paymentBreakdown: sales?.paymentBreakdown || {},
      });

      // Generate daily breakdown for range modes
      if (isRangeMode) {
        const breakdown = await generateDailyBreakdown(startDate, endDate);
        setDailyBreakdown(breakdown);
      } else {
        setDailyBreakdown([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading report:", err);
      setError("Failed to load report data. Please try again.");
      setLoading(false);
    }
  }, [getDateRangeParams, generateDailyBreakdown]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl shadow-md p-6 sm:p-7">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50">
              <span className="text-red-600 text-lg">!</span>
            </div>
            <div>
              <p className="font-semibold text-red-800 text-base">Error</p>
              <p className="text-sm mt-1 text-gray-600">{error}</p>
            </div>
          </div>
          <button
            onClick={loadReportData}
            className="mt-4 inline-flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { startDate, endDate } = getDateRangeParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
          {/* Page Header */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7">
            <div className="space-y-5">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  📊 Reports
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Detailed financial and sales reports with date range filtering
                </p>
              </div>

              {/* Date Range Selector */}
              <div className="flex flex-col gap-4 items-center">
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setDateRange("today")}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border cursor-pointer active:scale-95 ${
                      dateRange === "today"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
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
                  <div className="flex flex-wrap items-center justify-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        From:
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        max={customEndDate}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Active Date Range Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Report for:</span>{" "}
                    {reportData?.isSingleDay ? (
                      <span className="font-mono">{startDate}</span>
                    ) : (
                      <>
                        <span className="font-mono">{startDate}</span>
                        {" to "}
                        <span className="font-mono">{endDate}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                <p className="text-gray-600 font-medium">Loading report...</p>
              </div>
            </div>
          ) : reportData ? (
            <>
              {/* Summary Section */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5">
                  Summary Report
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Total Sales */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-700">
                      Total Sales
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700 mt-2">
                      LKR{" "}
                      {reportData.totalSales.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Invoice Count */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-700">
                      No. of Invoices
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-700 mt-2">
                      {reportData.invoiceCount}
                    </p>
                  </div>

                  {/* Total VAT */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-700">
                      VAT Collected
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-700 mt-2">
                      LKR{" "}
                      {reportData.totalVAT.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Gross Profit */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-700">
                      Gross Profit
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-2">
                      LKR{" "}
                      {reportData.grossProfit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Total Expenses */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-700">
                      Total Expenses
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-2">
                      LKR{" "}
                      {reportData.totalExpenses.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Net Profit */}
                  <div
                    className={`bg-gradient-to-br rounded-xl p-5 border ${
                      reportData.netProfit >= 0
                        ? "from-emerald-50 to-emerald-100 border-emerald-200"
                        : "from-red-50 to-red-100 border-red-200"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-700">
                      Net Profit
                    </p>
                    <p
                      className={`text-2xl sm:text-3xl font-bold mt-2 ${
                        reportData.netProfit >= 0
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      LKR{" "}
                      {reportData.netProfit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown Section - Only for Range Modes */}
              {reportData.isRangeMode && dailyBreakdown.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5">
                    Daily Breakdown
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-xs sm:text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Date
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Total Sales
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Invoices
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            VAT
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Gross Profit
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Expenses
                          </th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">
                            Net Profit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyBreakdown.map((day, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                              LKR{" "}
                              {day.totalSales.toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {day.invoiceCount}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              LKR{" "}
                              {day.totalVAT.toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="px-4 py-3 text-right text-green-700 font-semibold">
                              LKR{" "}
                              {day.grossProfit.toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="px-4 py-3 text-right text-red-700">
                              LKR{" "}
                              {day.totalExpenses.toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-semibold ${
                                day.netProfit >= 0
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              LKR{" "}
                              {day.netProfit.toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
