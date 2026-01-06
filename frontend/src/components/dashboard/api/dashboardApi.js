import api from "../../../api";

/**
 * Dashboard API client - handles all dashboard-related API calls
 */

// Get complete dashboard summary (all metrics at once)
export const getDashboardSummary = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get("/dashboard/summary", { params });
  return response.data;
};

// Get daily sales overview (today's sales, invoices, profit, VAT, payment split)
export const getDailySalesOverview = async (
  startDate = null,
  endDate = null
) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get("/dashboard/daily-sales", { params });
  return response.data;
};

// Get low stock items with color coding
export const getLowStockItems = async () => {
  const response = await api.get("/dashboard/low-stock");
  return response.data;
};

// Get outstanding customer credits
export const getOutstandingCredits = async () => {
  const response = await api.get("/dashboard/outstanding-credits");
  return response.data;
};

// Get supplier payables
export const getSupplierPayables = async () => {
  const response = await api.get("/dashboard/supplier-payables");
  return response.data;
};

// Get sales trend data (monthly by default, or daily when range="days")
export const getMonthlySalesTrend = async (options = {}) => {
  const { months = 12, range = "months", days = 30 } = options;
  const params = { months, range };
  if (range === "days") params.days = days;

  const response = await api.get("/dashboard/monthly-trend", {
    params,
  });
  return response.data;
};

// Get top selling categories
export const getTopCategories = async (
  period = "today",
  startDate = null,
  endDate = null
) => {
  const params = { period };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get("/dashboard/top-categories", {
    params,
  });
  return response.data;
};

// Get profit metrics
export const getProfitMetrics = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get("/dashboard/profit-metrics", {
    params,
  });
  return response.data;
};

// Get expenses summary
export const getExpensesSummary = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get("/dashboard/expenses-summary", {
    params,
  });
  return response.data;
};
