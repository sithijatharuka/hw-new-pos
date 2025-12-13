import React, { useState, useEffect, useCallback } from "react";
import {
  DailySalesCard,
  LowStockItemsCard,
  CreditSummaryCard,
  SupplierPayablesCard,
  MonthlySalesTrendCard,
  TopCategoriesCard,
  ProfitCardsSection,
  ExpensesSummaryCard,
} from "../components/dashboard/index";
import {
  getDashboardSummary,
  getDailySalesOverview,
  getLowStockItems,
  getOutstandingCredits,
  getSupplierPayables,
  getMonthlySalesTrend,
  getTopCategories,
  getProfitMetrics,
  getExpensesSummary,
} from "../components/dashboard/dashboardApi";

const DashboardPage = () => {
  // Date range state
  const [dateRange, setDateRange] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // State for all dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Feature data states
  const [dailySalesOverview, setDailySalesOverview] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [creditSummary, setCreditSummary] = useState(null);
  const [supplierPayables, setSupplierPayables] = useState(null);
  const [monthlySalesTrend, setMonthlySalesTrend] = useState({
    daily: [],
    monthly: [],
  });
  const [topCategoriesData, setTopCategoriesData] = useState({
    today: [],
    month: [],
  });
  const [profitMetrics, setProfitMetrics] = useState(null);
  const [expensesSummary, setExpensesSummary] = useState(null);

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
        weekAgo.setDate(weekAgo.getDate() - 6); // inclusive of today -> 7 days total
        startDate = weekAgo.toISOString().split("T")[0];
        endDate = new Date().toISOString().split("T")[0];
        break;
      case "last30days":
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 29); // inclusive of today -> 30 days total
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

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRangeParams();

      // Fetch all data in parallel for better performance
      const [
        dailySales,
        lowStock,
        credits,
        payables,
        dailyTrend,
        monthlyTrend,
        catToday,
        catMonth,
        profit,
        expenses,
      ] = await Promise.all([
        getDailySalesOverview(startDate, endDate),
        getLowStockItems(),
        getOutstandingCredits(),
        getSupplierPayables(),
        getMonthlySalesTrend({ range: "days", days: 30 }),
        getMonthlySalesTrend({ range: "months", months: 12 }),
        getTopCategories("today", startDate, endDate),
        getTopCategories("month", startDate, endDate),
        getProfitMetrics(startDate, endDate),
        getExpensesSummary(startDate, endDate),
      ]);

      // Update states
      setDailySalesOverview(dailySales);
      setLowStockItems(lowStock.lowStockItems || []);
      setCreditSummary(credits);
      setSupplierPayables(payables);
      setMonthlySalesTrend({
        daily: dailyTrend.trendData || [],
        monthly: monthlyTrend.trendData || [],
      });
      setTopCategoriesData({
        today: catToday.topCategories || [],
        month: catMonth.topCategories || [],
      });
      setProfitMetrics(profit);
      setExpensesSummary(expenses);

      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  }, [getDateRangeParams]);

  // Initial load and reload on date change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl shadow-md p-6 sm:p-7">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50">
              <span className="text-red-600 text-lg">!</span>
            </div>
            <div>
              <p className="font-semibold text-red-800 text-base">
                Error Loading Dashboard
              </p>
              <p className="text-sm mt-1 text-gray-600">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadDashboardData()}
            className="mt-4 inline-flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { startDate, endDate } = getDateRangeParams();
  const isRangeMode = startDate !== endDate;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
          {/* Page Header with Date Filters */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center text-center gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Real-time insights into your hardware store operations
                  </p>
                </div>
              </div>

              {/* Date Range Selector */}
              <div className="flex flex-col gap-4 items-center">
                {/* Preset Buttons */}
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

          {loading && !dailySalesOverview ? (
            // Loading State
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                <p className="text-gray-600 font-medium">
                  Loading dashboard...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Real-Time Daily Sales Overview with Net Profit */}
              <section>
                <DailySalesCard
                  invoiceCount={dailySalesOverview?.invoiceCount}
                  totalSales={dailySalesOverview?.totalSalesAmount}
                  grossProfit={dailySalesOverview?.grossProfit}
                  netProfit={profitMetrics?.today?.netProfit}
                  totalExpenses={profitMetrics?.today?.totalExpenses}
                  totalVAT={dailySalesOverview?.totalVAT}
                  paymentBreakdown={dailySalesOverview?.paymentBreakdown}
                />
              </section>

              {/* Expenses Summary - Below Real-Time Sales */}
              <section>
                <ExpensesSummaryCard
                  totalExpenses={expensesSummary?.totalExpenses}
                  expenseCount={expensesSummary?.expenseCount}
                  categoryBreakdown={expensesSummary?.categoryBreakdown}
                  loading={loading}
                />
              </section>

              {/* Profit Cards Section - High Visibility */}
              <section>
                <ProfitCardsSection
                  todayMetrics={profitMetrics?.today}
                  monthMetrics={profitMetrics?.month}
                  loading={loading}
                />
              </section>

              {/* Metrics Grid - Top Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Critical Items */}
                <section>
                  <LowStockItemsCard items={lowStockItems} loading={loading} />
                </section>

                {/* Outstanding Customer Credit Summary */}
                <section>
                  <CreditSummaryCard
                    totalCreditGiven={creditSummary?.totalCreditGiven}
                    topCustomers={creditSummary?.topCustomers}
                    warningCount={creditSummary?.warningCount}
                    loading={loading}
                  />
                </section>
              </div>

              {/* Supplier Payables - Full Width */}
              <section>
                <SupplierPayablesCard
                  totalOutstanding={supplierPayables?.totalOutstanding}
                  supplierPayables={supplierPayables?.supplierPayables}
                  loading={loading}
                />
              </section>

              {/* Monthly Sales Trend - Full Width */}
              <section>
                <MonthlySalesTrendCard
                  trendDaily={monthlySalesTrend.daily}
                  trendMonthly={monthlySalesTrend.monthly}
                  loading={loading}
                />
              </section>

              {/* Top Selling Categories */}
              <section>
                <TopCategoriesCard
                  topCategoriesToday={topCategoriesData.today}
                  topCategoriesMonth={topCategoriesData.month}
                  loading={loading}
                />
              </section>

              {/* Quick Stats Footer */}
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
                    <p className="text-blue-100 text-xs sm:text-sm mb-2">
                      Credit Given
                    </p>
                    <p className="font-bold text-lg sm:text-xl text-red-200">
                      {typeof creditSummary?.totalCreditGiven === "number"
                        ? `LKR ${creditSummary.totalCreditGiven.toLocaleString(
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
                      Payables
                    </p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
