import React, { useState, useEffect, useCallback } from "react";
import {
  DashboardHeader,
  LoadingState,
  ErrorDisplay,
  QuickSummarySection,
  DashboardSections,
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
} from "../api/dashboard/dashboard";

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
    return <ErrorDisplay error={error} onRetry={loadDashboardData} />;
  }

  const { startDate, endDate } = getDateRangeParams();
  const isRangeMode = startDate !== endDate;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
          {/* Page Header with Date Filters */}
          <DashboardHeader
            dateRange={dateRange}
            setDateRange={setDateRange}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
            startDate={startDate}
            endDate={endDate}
            isRangeMode={isRangeMode}
          />

          {loading && !dailySalesOverview ? (
            <LoadingState />
          ) : (
            <>
              <DashboardSections
                dailySalesOverview={dailySalesOverview}
                profitMetrics={profitMetrics}
                expensesSummary={expensesSummary}
                lowStockItems={lowStockItems}
                creditSummary={creditSummary}
                supplierPayables={supplierPayables}
                monthlySalesTrend={monthlySalesTrend}
                topCategoriesData={topCategoriesData}
                loading={loading}
              />

              <QuickSummarySection
                dailySalesOverview={dailySalesOverview}
                creditSummary={creditSummary}
                supplierPayables={supplierPayables}
                startDate={startDate}
                endDate={endDate}
                isRangeMode={isRangeMode}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
