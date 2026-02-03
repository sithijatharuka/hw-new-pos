import React, { useState, useEffect, useCallback } from "react";
import AppLoader from "../components/common/AppLoader";
import PageHeader from "../components/common/PageHeader";
import {
  getDailySalesOverview,
  getProfitMetrics,
  getExpensesSummary,
} from "../api/dashboard/dashboard";
import { getSales } from "../api/sales/sales";
import { getExpenses } from "../api/expenses/expenses";

// Import new report components
import DateRangeSelector from "../components/report/DateRangeSelector";
import ExportButtons from "../components/report/ExportButtons";
import ReportSkeleton from "../components/report/ReportSkeleton";
import SummaryMetrics from "../components/report/SummaryMetrics";
import DailyBreakdownTable from "../components/report/DailyBreakdownTable";
import ReportModal from "../components/report/ReportModal";

// Import export utilities
import {
  exportToCSV,
  exportToPDF,
  exportModalData,
  exportModalDataAsPDF,
} from "../utils/reportExports";

const ReportsPage = ({ api }) => {
  // Validate api prop
  if (!api) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-6 bg-gray-50">
        <div className="p-6 text-center bg-white border border-red-200 shadow-md rounded-2xl">
          <p className="text-lg font-semibold text-red-600">
            Configuration Error
          </p>
          <p className="mt-2 text-sm text-gray-600">
            API client not initialized
          </p>
        </div>
      </div>
    );
  }

  const [dateRange, setDateRange] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [breakdownError, setBreakdownError] = useState(null);
  const [dateRangeError, setDateRangeError] = useState(null);

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'sales', 'invoices', 'expenses', 'profit'
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Format date in local timezone (YYYY-MM-DD)
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calculate date range based on selection
  const getDateRangeParams = useCallback(() => {
    const today = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case "today":
        startDate = endDate = formatLocalDate(today);
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = formatLocalDate(yesterday);
        break;
      case "last7days":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);
        startDate = formatLocalDate(weekAgo);
        endDate = formatLocalDate(today);
        break;
      case "last30days":
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 29);
        startDate = formatLocalDate(monthAgo);
        endDate = formatLocalDate(today);
        break;
      case "custom":
        startDate = customStartDate;
        endDate = customEndDate;
        // Validate max 90 days range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        if (daysDiff > 90) {
          setDateRangeError("Date range cannot exceed 90 days");
          return null;
        }
        setDateRangeError(null);
        break;
      default:
        startDate = endDate = formatLocalDate(today);
    }

    return { startDate, endDate };
  }, [dateRange, customStartDate, customEndDate]);

  // Generate daily breakdown data
  const generateDailyBreakdown = useCallback(
    async (startDate, endDate) => {
      try {
        setBreakdownError(null);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = [];

        // Fix: Create new date object in each iteration to avoid mutation
        let currentDate = new Date(start);
        while (currentDate <= end) {
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, "0");
          const day = String(currentDate.getDate()).padStart(2, "0");
          days.push(`${year}-${month}-${day}`);
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Fetch data for all days in parallel
        const dayDataPromises = days.map((date) =>
          Promise.all([
            getDailySalesOverview(api, date, date),
            getProfitMetrics(api, date, date),
            getExpensesSummary(api, date, date),
          ]),
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
        setBreakdownError(
          "Failed to load daily breakdown data. Showing summary only.",
        );
        return [];
      }
    },
    [api],
  );

  // Load report data
  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dateParams = getDateRangeParams();
      if (!dateParams) {
        setLoading(false);
        return; // Date range validation failed
      }
      const { startDate, endDate } = dateParams;
      const isSingleDay = startDate === endDate;
      const isRangeMode = !["today", "yesterday"].includes(dateRange);

      // Fetch all required data
      const [sales, profit, expenses] = await Promise.all([
        getDailySalesOverview(api, startDate, endDate),
        getProfitMetrics(api, startDate, endDate),
        getExpensesSummary(api, startDate, endDate),
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
  }, [api, getDateRangeParams, generateDailyBreakdown]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!reportData) return;

    const csvRows = [];
    csvRows.push("SL Hardware POS - Sales Report");
    csvRows.push(`Period: ${reportData.startDate} to ${reportData.endDate}`);
    csvRows.push("");
    csvRows.push("Summary");
    csvRows.push("Metric,Amount");
    csvRows.push(`Total Sales,LKR ${reportData.totalSales.toFixed(2)}`);
    csvRows.push(`Invoice Count,${reportData.invoiceCount}`);
    csvRows.push(`VAT Collected,LKR ${reportData.totalVAT.toFixed(2)}`);
    csvRows.push(`Gross Profit,LKR ${reportData.grossProfit.toFixed(2)}`);
    csvRows.push(`Total Expenses,LKR ${reportData.totalExpenses.toFixed(2)}`);
    csvRows.push(`Net Profit,LKR ${reportData.netProfit.toFixed(2)}`);

    if (dailyBreakdown.length > 0) {
      csvRows.push("");
      csvRows.push("Daily Breakdown");
      csvRows.push(
        "Date,Total Sales,Invoices,VAT,Gross Profit,Expenses,Net Profit",
      );
      dailyBreakdown.forEach((day) => {
        csvRows.push(
          `${day.date},${day.totalSales.toFixed(2)},${day.invoiceCount},${day.totalVAT.toFixed(2)},${day.grossProfit.toFixed(2)},${day.totalExpenses.toFixed(2)},${day.netProfit.toFixed(2)}`,
        );
      });
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales-report-${reportData.startDate}-to-${reportData.endDate}.csv`;
    link.click();
  }, [reportData, dailyBreakdown]);

  // Export to PDF
  const exportToPDF = useCallback(() => {
    if (!reportData) return;

    const printWindow = window.open("", "_blank");
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #4b5563; margin-top: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .period { color: #6b7280; font-size: 14px; }
          .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .metric { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
          .metric-label { font-size: 12px; color: #6b7280; font-weight: 600; }
          .metric-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: 600; color: #374151; }
          tr:hover { background: #f9fafb; }
          .text-right { text-align: right; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 SL Hardware POS - Sales Report</h1>
          <p class="period">Period: ${reportData.startDate} to ${reportData.endDate}</p>
        </div>
        
        <h2>Summary Report</h2>
        <div class="summary">
          <div class="metric">
            <div class="metric-label">Total Sales</div>
            <div class="metric-value">LKR ${reportData.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="metric">
            <div class="metric-label">No. of Invoices</div>
            <div class="metric-value">${reportData.invoiceCount}</div>
          </div>
          <div class="metric">
            <div class="metric-label">VAT Collected</div>
            <div class="metric-value">LKR ${reportData.totalVAT.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Gross Profit</div>
            <div class="metric-value positive">LKR ${reportData.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Expenses</div>
            <div class="metric-value negative">LKR ${reportData.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Net Profit</div>
            <div class="metric-value ${reportData.netProfit >= 0 ? "positive" : "negative"}">LKR ${reportData.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
        
        ${
          dailyBreakdown.length > 0
            ? `
        <h2>Daily Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th class="text-right">Total Sales</th>
              <th class="text-right">Invoices</th>
              <th class="text-right">VAT</th>
              <th class="text-right">Gross Profit</th>
              <th class="text-right">Expenses</th>
              <th class="text-right">Net Profit</th>
            </tr>
          </thead>
          <tbody>
            ${dailyBreakdown
              .map(
                (day) => `
            <tr>
              <td>${new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</td>
              <td class="text-right">LKR ${day.totalSales.toLocaleString("en-US", { minimumFractionDigits: 0 })}</td>
              <td class="text-right">${day.invoiceCount}</td>
              <td class="text-right">LKR ${day.totalVAT.toLocaleString("en-US", { minimumFractionDigits: 0 })}</td>
              <td class="text-right positive">LKR ${day.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 0 })}</td>
              <td class="text-right negative">LKR ${day.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 0 })}</td>
              <td class="text-right ${day.netProfit >= 0 ? "positive" : "negative"}">LKR ${day.netProfit.toLocaleString("en-US", { minimumFractionDigits: 0 })}</td>
            </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        `
            : ""
        }
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Print / Save as PDF</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }, [reportData, dailyBreakdown]);

  // Fetch detailed sales data
  const fetchSalesDetails = useCallback(async () => {
    setModalLoading(true);
    try {
      const dateParams = getDateRangeParams();
      if (!dateParams) return;
      const { startDate, endDate } = dateParams;
      const response = await getSales(api, { startDate, endDate, limit: 1000 });
      const sales = response.sales || [];

      // Calculate payment method breakdown
      const paymentBreakdown = sales.reduce((acc, sale) => {
        const method = sale.paymentMethod || "Unknown";
        acc[method] = (acc[method] || 0) + parseFloat(sale.finalAmount || 0);
        return acc;
      }, {});

      // Hourly distribution
      const hourlyData = sales.reduce((acc, sale) => {
        const hour = new Date(sale.saleDate).getHours();
        const hourKey = `${hour}:00 - ${hour + 1}:00`;
        acc[hourKey] = (acc[hourKey] || 0) + parseFloat(sale.finalAmount || 0);
        return acc;
      }, {});

      setModalData({
        invoices: sales.map((s) => ({
          id: s.invoiceNo,
          customer: s.customerName || "Walk-in Customer",
          amount: parseFloat(s.finalAmount || 0),
          paymentMethod: s.paymentMethod,
          date: s.saleDate,
          items: s.items?.length || 0,
        })),
        paymentBreakdown,
        hourlyData,
        avgInvoiceValue:
          sales.length > 0
            ? sales.reduce(
                (sum, s) => sum + parseFloat(s.finalAmount || 0),
                0,
              ) / sales.length
            : 0,
      });
    } catch (err) {
      console.error("Error fetching sales details:", err);
      setModalData({ error: "Failed to load sales details" });
    }
    setModalLoading(false);
  }, [api, getDateRangeParams]);

  // Fetch detailed expenses data
  const fetchExpensesDetails = useCallback(async () => {
    setModalLoading(true);
    try {
      const dateParams = getDateRangeParams();
      if (!dateParams) return;
      const { startDate, endDate } = dateParams;
      const response = await getExpenses(api, { startDate, endDate });
      const expenses = response.expenses || [];

      // Category breakdown
      const categoryBreakdown = expenses.reduce((acc, exp) => {
        const cat = exp.category || "Uncategorized";
        acc[cat] = (acc[cat] || 0) + parseFloat(exp.amount || 0);
        return acc;
      }, {});

      setModalData({
        expenses: expenses.map((e) => ({
          id: e.expenseId,
          category: e.category,
          description: e.description,
          amount: parseFloat(e.amount || 0),
          date: e.expenseDate,
          addedBy: e.addedBy,
        })),
        categoryBreakdown,
        totalExpenses: expenses.reduce(
          (sum, e) => sum + parseFloat(e.amount || 0),
          0,
        ),
      });
    } catch (err) {
      console.error("Error fetching expenses details:", err);
      setModalData({ error: "Failed to load expenses details" });
    }
    setModalLoading(false);
  }, [api, getDateRangeParams]);

  // Fetch profit breakdown by category
  const fetchProfitDetails = useCallback(async () => {
    setModalLoading(true);
    try {
      const dateParams = getDateRangeParams();
      if (!dateParams) return;
      const { startDate, endDate } = dateParams;
      const response = await getSales(api, { startDate, endDate, limit: 1000 });
      const sales = response.sales || [];

      // Calculate profit by category
      const categoryProfit = {};
      const itemProfit = [];

      sales.forEach((sale) => {
        (sale.items || []).forEach((item) => {
          const sellingPrice = parseFloat(item.unitPrice || 0);
          const costPrice = parseFloat(item.costPrice || 0);
          const quantity = parseInt(item.qty || 0);
          const profit = (sellingPrice - costPrice) * quantity;
          const category = item.category || "Uncategorized";

          categoryProfit[category] = (categoryProfit[category] || 0) + profit;

          itemProfit.push({
            name: item.itemName || item.name || "Unknown Item",
            category,
            profit,
            margin:
              costPrice > 0
                ? ((sellingPrice - costPrice) / costPrice) * 100
                : 0,
            quantity,
          });
        });
      });

      // Sort items by profit
      itemProfit.sort((a, b) => b.profit - a.profit);

      setModalData({
        categoryProfit,
        topProfitable: itemProfit.slice(0, 10),
        leastProfitable:
          itemProfit.length > 10 ? itemProfit.slice(-10).reverse() : [],
        avgMargin:
          itemProfit.length > 0
            ? itemProfit.reduce((sum, i) => sum + i.margin, 0) /
              itemProfit.length
            : 0,
      });
    } catch (err) {
      console.error("Error fetching profit details:", err);
      setModalData({ error: "Failed to load profit details" });
    }
    setModalLoading(false);
  }, [api, getDateRangeParams]);

  // Open modal handler
  const openModal = useCallback(
    (type) => {
      setActiveModal(type);
      setModalData(null);
      setSearchTerm("");

      if (type === "sales") fetchSalesDetails();
      else if (type === "expenses") fetchExpensesDetails();
      else if (type === "profit") fetchProfitDetails();
    },
    [fetchSalesDetails, fetchExpensesDetails, fetchProfitDetails],
  );

  // Close modal
  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
    setSearchTerm("");
  };

  // Export modal data as CSV
  const exportModalData = useCallback(() => {
    if (!modalData || !activeModal) return;

    let csvContent = "";

    if (activeModal === "sales" && modalData.invoices) {
      csvContent = "Invoice #,Customer,Amount,Payment Method,Date,Items\\n";
      modalData.invoices.forEach((inv) => {
        csvContent += `${inv.id},"${inv.customer}",${inv.amount},${inv.paymentMethod},${inv.date},${inv.items}\\n`;
      });
    } else if (activeModal === "expenses" && modalData.expenses) {
      csvContent = "ID,Category,Description,Amount,Date,Added By\\n";
      modalData.expenses.forEach((exp) => {
        csvContent += `${exp.id},${exp.category},"${exp.description}",${exp.amount},${exp.date},${exp.addedBy}\\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeModal}-details-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }, [modalData, activeModal]);

  // Export modal data as PDF
  const exportModalDataAsPDF = useCallback(() => {
    if (!modalData || !activeModal) return;

    const printWindow = window.open("", "_blank");
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activeModal === "sales" ? "Sales Details" : activeModal === "expenses" ? "Expenses Breakdown" : "Profit Analysis"}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #4b5563; margin-top: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .period { color: #6b7280; font-size: 14px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
          .stat-label { font-size: 12px; color: #6b7280; font-weight: 600; }
          .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .breakdown { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; }
          .breakdown-item { padding: 10px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; }
          .breakdown-label { font-size: 11px; color: #6b7280; }
          .breakdown-value { font-size: 16px; font-weight: bold; margin-top: 3px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: 600; color: #374151; font-size: 12px; }
          td { font-size: 13px; }
          tr:hover { background: #f9fafb; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .badge-cash { background: #d1fae5; color: #065f46; }
          .badge-card { background: #dbeafe; color: #1e40af; }
          .badge-credit { background: #fef3c7; color: #92400e; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
    `;

    if (activeModal === "sales" && modalData.invoices) {
      html += `
        <div class="header">
          <h1>💰 Sales Details Report</h1>
          <p class="period">Period: ${reportData?.startDate} to ${reportData?.endDate}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Invoices</div>
            <div class="stat-value">${modalData.invoices.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Avg Invoice Value</div>
            <div class="stat-value positive">LKR ${modalData.avgInvoiceValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Payment Methods</div>
            <div class="stat-value">${Object.keys(modalData.paymentBreakdown).length}</div>
          </div>
        </div>

        <h2>Payment Method Breakdown</h2>
        <div class="breakdown">
          ${Object.entries(modalData.paymentBreakdown)
            .map(
              ([method, amount]) => `
            <div class="breakdown-item">
              <div class="breakdown-label">${method}</div>
              <div class="breakdown-value">LKR ${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}</div>
            </div>
          `,
            )
            .join("")}
        </div>

        <h2>Invoice Details</h2>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th class="text-right">Amount</th>
              <th>Payment Method</th>
              <th>Date & Time</th>
              <th class="text-center">Items</th>
            </tr>
          </thead>
          <tbody>
            ${modalData.invoices
              .map(
                (inv) => `
              <tr>
                <td><strong>${inv.id}</strong></td>
                <td>${inv.customer}</td>
                <td class="text-right"><strong>LKR ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
                <td><span class="badge badge-${inv.paymentMethod.toLowerCase()}">${inv.paymentMethod}</span></td>
                <td>${new Date(inv.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td class="text-center">${inv.items}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `;
    } else if (activeModal === "expenses" && modalData.expenses) {
      html += `
        <div class="header">
          <h1>💸 Expenses Breakdown Report</h1>
          <p class="period">Period: ${reportData?.startDate} to ${reportData?.endDate}</p>
        </div>

        <h2>Expenses by Category</h2>
        <div class="breakdown">
          ${Object.entries(modalData.categoryBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(
              ([category, amount]) => `
            <div class="breakdown-item">
              <div class="breakdown-label">${category}</div>
              <div class="breakdown-value negative">LKR ${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}</div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 5px;">
                ${((amount / modalData.totalExpenses) * 100).toFixed(1)}% of total
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <h2>Expense Details</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th class="text-right">Amount</th>
              <th>Date</th>
              <th>Added By</th>
            </tr>
          </thead>
          <tbody>
            ${modalData.expenses
              .map(
                (exp) => `
              <tr>
                <td><span class="badge" style="background: #f3f4f6; color: #374151;">${exp.category}</span></td>
                <td>${exp.description}</td>
                <td class="text-right negative"><strong>LKR ${exp.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
                <td>${new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td>${exp.addedBy}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `;
    } else if (activeModal === "profit" && modalData.categoryProfit) {
      html += `
        <div class="header">
          <h1>📈 Profit Analysis Report</h1>
          <p class="period">Period: ${reportData?.startDate} to ${reportData?.endDate}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Average Profit Margin</div>
            <div class="stat-value positive">${modalData.avgMargin.toFixed(2)}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Categories Analyzed</div>
            <div class="stat-value">${Object.keys(modalData.categoryProfit).length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Items Analyzed</div>
            <div class="stat-value">${modalData.topProfitable.length + modalData.leastProfitable.length}</div>
          </div>
        </div>

        <h2>Profit by Category</h2>
        <div class="breakdown">
          ${Object.entries(modalData.categoryProfit)
            .sort(([, a], [, b]) => b - a)
            .map(
              ([category, profit]) => `
            <div class="breakdown-item">
              <div class="breakdown-label">${category}</div>
              <div class="breakdown-value ${profit >= 0 ? "positive" : "negative"}">
                LKR ${profit.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <h2>🏆 Top 10 Most Profitable Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Profit</th>
              <th class="text-right">Margin %</th>
            </tr>
          </thead>
          <tbody>
            ${modalData.topProfitable
              .map(
                (item) => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right positive"><strong>LKR ${item.profit.toLocaleString("en-US", { minimumFractionDigits: 0 })}</strong></td>
                <td class="text-right">${item.margin.toFixed(1)}%</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        ${
          modalData.leastProfitable.length > 0
            ? `
        <h2>⚠️ 10 Least Profitable Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Profit</th>
              <th class="text-right">Margin %</th>
            </tr>
          </thead>
          <tbody>
            ${modalData.leastProfitable
              .map(
                (item) => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right ${item.profit >= 0 ? "positive" : "negative"}">
                  <strong>LKR ${item.profit.toLocaleString("en-US", { minimumFractionDigits: 0 })}</strong>
                </td>
                <td class="text-right">${item.margin.toFixed(1)}%</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        `
            : ""
        }
      `;
    }

    html += `
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Print / Save as PDF</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }, [modalData, activeModal, reportData]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-6 bg-gray-50 sm:px-6 lg:px-8">
        <div className="w-full max-w-md p-6 bg-white border border-red-200 shadow-md rounded-2xl sm:p-7">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex items-center justify-center rounded-full w-9 h-9 bg-red-50">
              <span className="text-lg text-red-600">!</span>
            </div>
            <div>
              <p className="text-base font-semibold text-red-800">Error</p>
              <p className="mt-1 text-sm text-gray-600">{error}</p>
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
        <div className="pb-10 mx-auto space-y-6 max-w-7xl">
          {/* Page Header */}
          <PageHeader
            icon="📊"
            title="Reports"
            description="Detailed financial and sales reports with date range filtering"
          />

          {/* Date Range Selector */}
          <div className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl sm:p-6 lg:p-7">
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-2">
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

                {/* Date Range Error */}
                {dateRangeError && (
                  <div className="px-4 py-2 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-red-700">
                      <span className="font-semibold">⚠️ {dateRangeError}</span>
                    </p>
                  </div>
                )}

                {/* Active Date Range Display */}
                <div className="px-4 py-2 border border-blue-200 rounded-lg bg-blue-50">
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

          {/* Export Buttons */}
          {reportData && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 active:scale-95 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 active:scale-95 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Export PDF
              </button>
            </div>
          )}

          {loading ? (
            <>
              {/* Summary Skeleton */}
              <div className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl sm:p-6 lg:p-7 animate-pulse">
                <div className="h-6 mb-5 bg-gray-200 rounded w-36"></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="p-5 border border-gray-200 rounded-xl bg-gray-50"
                    >
                      <div className="w-24 h-4 mb-3 bg-gray-200 rounded"></div>
                      <div className="w-32 h-8 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Breakdown Skeleton */}
              {dateRange !== "today" && dateRange !== "yesterday" && (
                <div className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl sm:p-6 lg:p-7 animate-pulse">
                  <div className="h-6 mb-5 bg-gray-200 rounded w-36"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : reportData ? (
            <>
              {/* Summary Section */}
              <div className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl sm:p-6 lg:p-7">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 sm:text-xl">
                  Summary Report
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Total Sales */}
                  <div
                    onClick={() => openModal("sales")}
                    className="p-5 transition-all border border-blue-200 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg hover:scale-105 group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Total Sales
                      </p>
                      <svg
                        className="w-5 h-5 text-blue-600 transition-opacity opacity-0 group-hover:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-700 sm:text-3xl">
                      LKR{" "}
                      {reportData.totalSales.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Invoice Count */}
                  <div className="p-5 border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">
                      No. of Invoices
                    </p>
                    <p className="mt-2 text-2xl font-bold text-purple-700 sm:text-3xl">
                      {reportData.invoiceCount}
                    </p>
                  </div>

                  {/* Total VAT */}
                  <div className="p-5 border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">
                      VAT Collected
                    </p>
                    <p className="mt-2 text-2xl font-bold text-orange-700 sm:text-3xl">
                      LKR{" "}
                      {reportData.totalVAT.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Gross Profit */}
                  <div className="p-5 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">
                      Gross Profit
                    </p>
                    <p className="mt-2 text-2xl font-bold text-green-700 sm:text-3xl">
                      LKR{" "}
                      {reportData.grossProfit.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Total Expenses */}
                  <div
                    onClick={() => openModal("expenses")}
                    className="p-5 transition-all border border-red-200 cursor-pointer bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:shadow-lg hover:scale-105 group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Total Expenses
                      </p>
                      <svg
                        className="w-5 h-5 text-red-600 transition-opacity opacity-0 group-hover:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-red-700 sm:text-3xl">
                      LKR{" "}
                      {reportData.totalExpenses.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-red-600 transition-opacity opacity-0 group-hover:opacity-100">
                      Click for details →
                    </p>
                  </div>

                  {/* Net Profit */}
                  <div
                    onClick={() => openModal("profit")}
                    className={`bg-gradient-to-br rounded-xl p-5 border cursor-pointer hover:shadow-lg hover:scale-105 transition-all group ${
                      reportData.netProfit >= 0
                        ? "from-emerald-50 to-emerald-100 border-emerald-200"
                        : "from-red-50 to-red-100 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Net Profit
                      </p>
                      <svg
                        className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${
                          reportData.netProfit >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
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
                    <p
                      className={`text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                        reportData.netProfit >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      Click for breakdown →
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown Section - Only for Range Modes */}
              {reportData.isRangeMode && (
                <div className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl sm:p-6 lg:p-7">
                  {breakdownError && (
                    <div className="p-4 mb-5 border border-yellow-200 rounded-xl bg-yellow-50">
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">
                          ⚠️ {breakdownError}
                        </span>
                      </p>
                    </div>
                  )}

                  {dailyBreakdown.length > 0 ? (
                    <>
                      <h2 className="mb-5 text-lg font-semibold text-gray-900 sm:text-xl">
                        Daily Breakdown
                      </h2>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-xs sm:text-sm">
                          <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Date
                              </th>
                              <th className="px-4 py-3 font-semibold text-right text-gray-700">
                                Total Sales
                              </th>
                              <th className="px-4 py-3 font-semibold text-right text-gray-700">
                                Invoices
                              </th>
                              <th className="px-4 py-3 font-semibold text-right text-gray-700">
                                VAT
                              </th>
                              <th className="px-4 py-3 font-semibold text-right text-gray-700">
                                Gross Profit
                              </th>
                              <th className="px-4 py-3 font-semibold text-right text-gray-700">
                                Expenses
                              </th>
                              <th className="px-4 py-3 font-semibold text-right text-gray-700">
                                Net Profit
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {dailyBreakdown.map((day, idx) => (
                              <tr
                                key={idx}
                                className="transition-colors border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {new Date(day.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </td>
                                <td className="px-4 py-3 font-semibold text-right text-gray-900">
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
                                <td className="px-4 py-3 font-semibold text-right text-green-700">
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
                    </>
                  ) : (
                    !breakdownError && (
                      <p className="text-sm text-center text-gray-500">
                        No daily breakdown data available for this period.
                      </p>
                    )
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Modal for Detailed Views */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeModal === "sales" && "💰 Sales Details"}
                  {activeModal === "expenses" && "💸 Expenses Breakdown"}
                  {activeModal === "profit" && "📈 Profit Analysis"}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {reportData?.startDate} to {reportData?.endDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {modalData && !modalData.error && (
                  <>
                    <button
                      onClick={exportModalData}
                      className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      📥 Export CSV
                    </button>
                    <button
                      onClick={exportModalDataAsPDF}
                      className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      📄 Export PDF
                    </button>
                  </>
                )}
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-5 overflow-y-auto">
              {modalLoading ? (
                <div className="flex items-center justify-center py-20">
                  <AppLoader open variant="inline" title="Loading details..." />
                </div>
              ) : modalData?.error ? (
                <div className="py-10 text-center">
                  <p className="text-red-600">{modalData.error}</p>
                </div>
              ) : modalData ? (
                <>
                  {/* Sales Details */}
                  {activeModal === "sales" && modalData.invoices && (
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                          <p className="text-sm text-gray-600">
                            Total Invoices
                          </p>
                          <p className="text-2xl font-bold text-blue-700">
                            {modalData.invoices.length}
                          </p>
                        </div>
                        <div className="p-4 border border-green-200 bg-green-50 rounded-xl">
                          <p className="text-sm text-gray-600">
                            Avg Invoice Value
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            LKR{" "}
                            {modalData.avgInvoiceValue.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="p-4 border border-purple-200 bg-purple-50 rounded-xl">
                          <p className="text-sm text-gray-600">
                            Payment Methods
                          </p>
                          <p className="text-2xl font-bold text-purple-700">
                            {Object.keys(modalData.paymentBreakdown).length}
                          </p>
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl">
                        <h3 className="mb-3 font-semibold text-gray-900">
                          Payment Method Breakdown
                        </h3>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {Object.entries(modalData.paymentBreakdown).map(
                            ([method, amount]) => (
                              <div
                                key={method}
                                className="p-3 bg-white border border-gray-200 rounded-lg"
                              >
                                <p className="text-xs text-gray-600">
                                  {method}
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  LKR{" "}
                                  {amount.toLocaleString("en-US", {
                                    minimumFractionDigits: 0,
                                  })}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by invoice #, customer name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                          className="absolute w-5 h-5 text-gray-400 left-3 top-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      {/* Invoices Table */}
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-sm">
                          <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Invoice #
                              </th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Customer
                              </th>
                              <th className="px-4 py-3 font-semibold text-right text-gray-700">
                                Amount
                              </th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Payment
                              </th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Date
                              </th>
                              <th className="px-4 py-3 font-semibold text-center text-gray-700">
                                Items
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {modalData.invoices
                              .filter(
                                (inv) =>
                                  searchTerm === "" ||
                                  inv.id
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                  inv.customer
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()),
                              )
                              .map((inv, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 font-medium text-gray-900">
                                    {inv.id}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">
                                    {inv.customer}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-right text-gray-900">
                                    LKR{" "}
                                    {inv.amount.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        inv.paymentMethod === "Cash"
                                          ? "bg-green-100 text-green-700"
                                          : inv.paymentMethod === "Card"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {inv.paymentMethod}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">
                                    {new Date(inv.date).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-700">
                                    {inv.items}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Expenses Details */}
                  {activeModal === "expenses" && modalData.expenses && (
                    <div className="space-y-6">
                      {/* Category Breakdown */}
                      <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl">
                        <h3 className="mb-3 font-semibold text-gray-900">
                          Expenses by Category
                        </h3>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                          {Object.entries(modalData.categoryBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, amount]) => (
                              <div
                                key={category}
                                className="p-3 bg-white border border-gray-200 rounded-lg"
                              >
                                <p className="text-xs text-gray-600">
                                  {category}
                                </p>
                                <p className="text-lg font-bold text-red-700">
                                  LKR{" "}
                                  {amount.toLocaleString("en-US", {
                                    minimumFractionDigits: 0,
                                  })}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {(
                                    (amount / modalData.totalExpenses) *
                                    100
                                  ).toFixed(1)}
                                  % of total
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search expenses..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                          className="absolute w-5 h-5 text-gray-400 left-3 top-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      {/* Expenses Table */}
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-sm">
                          <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Category
                              </th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Description
                              </th>
                              <th className="px-4 py-3 font-semibold text-right text-gray-700">
                                Amount
                              </th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Date
                              </th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-700">
                                Added By
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {modalData.expenses
                              .filter(
                                (exp) =>
                                  searchTerm === "" ||
                                  exp.category
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                  exp.description
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()),
                              )
                              .map((exp, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                                      {exp.category}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">
                                    {exp.description}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-right text-red-700">
                                    LKR{" "}
                                    {exp.amount.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">
                                    {new Date(exp.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">
                                    {exp.addedBy}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Profit Analysis */}
                  {activeModal === "profit" && modalData.categoryProfit && (
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="p-4 border bg-emerald-50 border-emerald-200 rounded-xl">
                          <p className="text-sm text-gray-600">
                            Average Profit Margin
                          </p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {modalData.avgMargin.toFixed(2)}%
                          </p>
                        </div>
                        <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                          <p className="text-sm text-gray-600">
                            Categories Analyzed
                          </p>
                          <p className="text-2xl font-bold text-blue-700">
                            {Object.keys(modalData.categoryProfit).length}
                          </p>
                        </div>
                      </div>

                      {/* Category Profit */}
                      <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl">
                        <h3 className="mb-3 font-semibold text-gray-900">
                          Profit by Category
                        </h3>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                          {Object.entries(modalData.categoryProfit)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, profit]) => (
                              <div
                                key={category}
                                className="p-3 bg-white border border-gray-200 rounded-lg"
                              >
                                <p className="text-xs text-gray-600">
                                  {category}
                                </p>
                                <p
                                  className={`text-lg font-bold ${
                                    profit >= 0
                                      ? "text-emerald-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  LKR{" "}
                                  {profit.toLocaleString("en-US", {
                                    minimumFractionDigits: 0,
                                  })}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Top Profitable Items */}
                      <div className="p-4 border border-green-200 bg-green-50 rounded-xl">
                        <h3 className="mb-3 font-semibold text-gray-900">
                          🏆 Top 10 Most Profitable Items
                        </h3>
                        <div className="space-y-2">
                          {modalData.topProfitable.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.category} • Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-700">
                                  LKR{" "}
                                  {item.profit.toLocaleString("en-US", {
                                    minimumFractionDigits: 0,
                                  })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Margin: {item.margin.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Least Profitable Items */}
                      <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                        <h3 className="mb-3 font-semibold text-gray-900">
                          ⚠️ 10 Least Profitable Items
                        </h3>
                        <div className="space-y-2">
                          {modalData.leastProfitable.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.category} • Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-bold ${
                                    item.profit >= 0
                                      ? "text-emerald-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  LKR{" "}
                                  {item.profit.toLocaleString("en-US", {
                                    minimumFractionDigits: 0,
                                  })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Margin: {item.margin.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
