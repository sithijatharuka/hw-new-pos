import { Sale } from "../models/Sale.js";
import { Item } from "../models/Item.js";
import { Customer } from "../models/Customer.js";
import { Purchase } from "../models/Purchase.js";
import { Supplier } from "../models/Supplier.js";
import { Expense } from "../models/Expense.js";

// ==========================================
// 1. REAL-TIME DAILY SALES OVERVIEW
// ==========================================
export const getDailySalesOverview = async (req, res) => {
  const { date, startDate, endDate } = req.query;

  let start, end;

  if (startDate && endDate) {
    // Date range mode
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    start = new Date(
      startD.getFullYear(),
      startD.getMonth(),
      startD.getDate(),
      0,
      0,
      0,
      0
    );
    end = new Date(
      endD.getFullYear(),
      endD.getMonth(),
      endD.getDate(),
      23,
      59,
      59,
      999
    );
  } else {
    // Single date mode (backward compatibility)
    const d = date ? new Date(date) : new Date();
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  const sales = await Sale.find({
    createdAt: { $gte: start, $lte: end },
  });

  // Calculate metrics
  const invoiceCount = sales.length;
  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCost = sales.reduce((sum, s) => {
    const itemCosts = s.items.reduce(
      (itemSum, item) => itemSum + item.qty * item.unitPrice,
      0
    );
    return sum + itemCosts;
  }, 0);
  const grossProfit = totalSales - totalCost;
  const totalVAT = sales.reduce((sum, s) => sum + (s.taxTotal || 0), 0);

  // Payment method breakdown
  const paymentBreakdown = {
    cash: 0,
    card: 0,
    credit: 0,
    bank: 0,
  };

  sales.forEach((sale) => {
    sale.payments.forEach((payment) => {
      if (paymentBreakdown.hasOwnProperty(payment.method)) {
        paymentBreakdown[payment.method] += payment.amount;
      }
    });
  });

  res.json({
    startDate: start,
    endDate: end,
    invoiceCount,
    totalSalesAmount: totalSales,
    grossProfit,
    totalVAT,
    paymentBreakdown,
  });
};

// ==========================================
// 2. LOW STOCK CRITICAL ITEMS
// ==========================================
export const getLowStockItems = async (req, res) => {
  const items = await Item.find({ isActive: true });

  const lowStockItems = items
    .map((item) => {
      let status = "green";
      let statusMessage = "Good";

      const stockPercentage = (item.currentStock / item.lowStockLevel) * 100;

      if (item.currentStock <= 0) {
        status = "red";
        statusMessage = "Empty";
      } else if (item.currentStock <= item.lowStockLevel * 0.5) {
        status = "red";
        statusMessage = "Critical";
      } else if (item.currentStock <= item.lowStockLevel) {
        status = "orange";
        statusMessage = "Low";
      }

      return {
        _id: item._id,
        name: item.name,
        currentStock: item.currentStock,
        lowStockLevel: item.lowStockLevel,
        status,
        statusMessage,
        category: item.category,
        stockPercentage: Math.round(stockPercentage),
      };
    })
    .filter((item) => item.status !== "green")
    .sort((a, b) => {
      const statusOrder = { red: 0, orange: 1 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.stockPercentage - b.stockPercentage;
    });

  res.json({ lowStockItems });
};

// ==========================================
// 3. OUTSTANDING CUSTOMER CREDIT SUMMARY
// ==========================================
export const getOutstandingCredits = async (req, res) => {
  const customers = await Customer.find();

  const creditData = customers
    .map((customer) => ({
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      currentBalance: customer.currentBalance,
      creditLimit: customer.creditLimit,
      creditPercentage: customer.creditLimit
        ? Math.round((customer.currentBalance / customer.creditLimit) * 100)
        : 0,
      status:
        customer.currentBalance > (customer.creditLimit * 0.8 || 0)
          ? "warning"
          : "normal",
    }))
    .filter((c) => c.currentBalance > 0)
    .sort((a, b) => b.currentBalance - a.currentBalance);

  const totalCreditGiven = creditData.reduce(
    (sum, c) => sum + c.currentBalance,
    0
  );
  const topCustomers = creditData.slice(0, 10);

  res.json({
    totalCreditGiven,
    topCustomers,
    warningCount: creditData.filter((c) => c.status === "warning").length,
  });
};

// ==========================================
// 4. SUPPLIER PAYABLES
// ==========================================
export const getSupplierPayables = async (req, res) => {
  // Get all active suppliers with outstanding balance
  const suppliers = await Supplier.find({
    currentBalance: { $gt: 0 },
    status: "active",
  }).sort({ currentBalance: -1 });

  // For each supplier, fetch unpaid purchases
  const supplierPayables = [];

  for (const supplier of suppliers.slice(0, 10)) {
    const unpaidPurchases = await Purchase.find({
      supplier: supplier._id,
      status: { $ne: "paid" },
    })
      .sort({ billDate: -1 })
      .limit(10);

    supplierPayables.push({
      _id: supplier._id,
      supplierName: supplier.name,
      totalPayable: supplier.currentBalance,
      lastPurchaseDate: supplier.lastPurchaseDate,
      unpaidPurchases: unpaidPurchases.map((p) => ({
        billNumber: p.billNumber,
        amount: p.balanceDue,
        dueDate: p.billDate,
        status: p.status,
      })),
    });
  }

  const totalOutstanding = suppliers.reduce(
    (sum, s) => sum + s.currentBalance,
    0
  );

  res.json({
    totalOutstanding,
    supplierPayables,
  });
};

// ==========================================
// 5. MONTHLY / DAILY SALES TREND
// Supports monthly aggregation (default) or daily aggregation for a given
// range of days (e.g., last 7 or last 30 days)
// ==========================================
export const getMonthlySalesTrend = async (req, res) => {
  const { months = 12, range = "months", days = 30 } = req.query;

  // Daily trend (used for last 7 / last 30 days)
  if (range === "days") {
    const daysNum = Math.min(parseInt(days, 10) || 30, 60); // safety cap
    const trendData = [];

    for (let i = daysNum - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
        0
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
      );

      const sales = await Sale.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
      const invoiceCount = sales.length;

      trendData.push({
        month: startOfDay.toLocaleString("default", {
          month: "short",
          day: "numeric",
        }),
        totalSales: Math.round(totalSales * 100) / 100,
        invoiceCount,
      });
    }

    return res.json({ trendData });
  }

  // Monthly trend (existing behaviour)
  const monthsNum = Math.min(parseInt(months, 10) || 12, 12);
  const trendData = [];

  for (let i = monthsNum - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const sales = await Sale.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const invoiceCount = sales.length;

    trendData.push({
      month: startOfMonth.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      totalSales: Math.round(totalSales * 100) / 100,
      invoiceCount,
    });
  }

  res.json({ trendData });
};

// ==========================================
// 6. TOP SELLING CATEGORIES
// ==========================================
export const getTopCategories = async (req, res) => {
  const { period = "today", startDate, endDate } = req.query;
  let dateFilter = {};

  if (startDate && endDate) {
    // Custom date range
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    const start = new Date(
      startD.getFullYear(),
      startD.getMonth(),
      startD.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      endD.getFullYear(),
      endD.getMonth(),
      endD.getDate(),
      23,
      59,
      59,
      999
    );
    dateFilter = { createdAt: { $gte: start, $lte: end } };
  } else if (period === "today") {
    // Today's data
    const d = new Date();
    const start = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      23,
      59,
      59,
      999
    );
    dateFilter = { createdAt: { $gte: start, $lte: end } };
  } else if (period === "month") {
    // This month's data
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    dateFilter = { createdAt: { $gte: start, $lte: end } };
  }

  const sales = await Sale.find(dateFilter).populate("items.item");

  const categoryStats = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!item.item) return;
      const category = item.item.category || "Uncategorized";
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          totalQty: 0,
          totalAmount: 0,
          invoiceCount: new Set(),
        };
      }
      categoryStats[category].totalQty += item.qty;
      categoryStats[category].totalAmount += item.lineTotal;
      categoryStats[category].invoiceCount.add(sale._id.toString());
    });
  });

  const topCategories = Object.values(categoryStats)
    .map((c) => ({
      category: c.category,
      totalQty: c.totalQty,
      totalAmount: Math.round(c.totalAmount * 100) / 100,
      invoiceCount: c.invoiceCount.size,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  res.json({ topCategories, period });
};

// ==========================================
// 7. PROFIT CARDS
// ==========================================
export const getProfitMetrics = async (req, res) => {
  const { startDate, endDate } = req.query;

  let todayStart, todayEnd, monthStart, monthEnd;

  if (startDate && endDate) {
    // Custom range mode - use the provided range for "today" metrics
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    todayStart = new Date(
      startD.getFullYear(),
      startD.getMonth(),
      startD.getDate(),
      0,
      0,
      0,
      0
    );
    todayEnd = new Date(
      endD.getFullYear(),
      endD.getMonth(),
      endD.getDate(),
      23,
      59,
      59,
      999
    );

    // For "month", use the current month
    const today = new Date();
    monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
  } else {
    // Default mode
    const today = new Date();
    todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );
    todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );
    monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
  }

  // Today's/Range sales
  const todaySales = await Sale.find({
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });

  // This month's sales
  const monthSales = await Sale.find({
    createdAt: { $gte: monthStart, $lte: monthEnd },
  });

  // Today's/Range expenses
  const todayExpenses = await Expense.find({
    date: { $gte: todayStart, $lte: todayEnd },
  });

  // This month's expenses
  const monthExpenses = await Expense.find({
    date: { $gte: monthStart, $lte: monthEnd },
  });

  // Calculate profit for a sales array and expenses array
  const calculateProfit = (sales, expenses) => {
    let totalRevenue = 0;
    let totalCost = 0;

    sales.forEach((sale) => {
      totalRevenue += sale.grandTotal;
      sale.items.forEach((item) => {
        totalCost += item.qty * item.unitPrice;
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      profitPerInvoice:
        sales.length > 0
          ? Math.round(((totalRevenue - totalCost) / sales.length) * 100) / 100
          : 0,
      invoiceCount: sales.length,
    };
  };

  const todayMetrics = calculateProfit(todaySales, todayExpenses);
  const monthMetrics = calculateProfit(monthSales, monthExpenses);

  res.json({
    today: todayMetrics,
    month: monthMetrics,
  });
};

// ==========================================
// EXPENSES SUMMARY
// ==========================================
export const getExpensesSummary = async (req, res) => {
  const { startDate, endDate } = req.query;

  let expenseStart, expenseEnd;

  if (startDate && endDate) {
    // Date range mode
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    expenseStart = new Date(
      startD.getFullYear(),
      startD.getMonth(),
      startD.getDate(),
      0,
      0,
      0,
      0
    );
    expenseEnd = new Date(
      endD.getFullYear(),
      endD.getMonth(),
      endD.getDate(),
      23,
      59,
      59,
      999
    );
  } else {
    // Default to today
    const today = new Date();
    expenseStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );
    expenseEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );
  }

  // Fetch expenses
  const expenses = await Expense.find({
    date: { $gte: expenseStart, $lte: expenseEnd },
  });

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by category
  const expensesByCategory = {};
  expenses.forEach((exp) => {
    if (!expensesByCategory[exp.category]) {
      expensesByCategory[exp.category] = 0;
    }
    expensesByCategory[exp.category] += exp.amount;
  });

  // Convert to array and sort by amount descending
  const categoryBreakdown = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  res.json({
    startDate: expenseStart,
    endDate: expenseEnd,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    expenseCount: expenses.length,
    categoryBreakdown,
    expenses,
  });
};

// ==========================================
// COMBINED DASHBOARD SUMMARY
// ==========================================
export const getDashboardSummary = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let start, end;

    if (startDate && endDate) {
      // Date range mode
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      start = new Date(
        startD.getFullYear(),
        startD.getMonth(),
        startD.getDate(),
        0,
        0,
        0,
        0
      );
      end = new Date(
        endD.getFullYear(),
        endD.getMonth(),
        endD.getDate(),
        23,
        59,
        59,
        999
      );
    } else {
      // Single date mode
      const d = date ? new Date(date) : new Date();
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      end = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59,
        999
      );
    }

    // 1. Daily Sales
    const todaySales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
    });

    const invoiceCount = todaySales.length;
    const totalSalesAmount = todaySales.reduce(
      (sum, s) => sum + s.grandTotal,
      0
    );
    const totalVAT = todaySales.reduce((sum, s) => sum + (s.taxTotal || 0), 0);
    const totalCost = todaySales.reduce((sum, s) => {
      return (
        sum +
        s.items.reduce(
          (itemSum, item) => itemSum + item.qty * item.unitPrice,
          0
        )
      );
    }, 0);
    const grossProfit = totalSalesAmount - totalCost;

    const paymentBreakdown = {
      cash: 0,
      card: 0,
      credit: 0,
      bank: 0,
    };

    todaySales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        if (paymentBreakdown.hasOwnProperty(payment.method)) {
          paymentBreakdown[payment.method] += payment.amount;
        }
      });
    });

    // 2. Low Stock Items
    const items = await Item.find({ isActive: true });
    const lowStockItems = items
      .filter((item) => item.currentStock <= item.lowStockLevel)
      .map((item) => ({
        _id: item._id,
        name: item.name,
        currentStock: item.currentStock,
        lowStockLevel: item.lowStockLevel,
        status:
          item.currentStock <= 0
            ? "red"
            : item.currentStock <= item.lowStockLevel * 0.5
            ? "red"
            : "orange",
      }))
      .sort((a, b) => a.currentStock - b.currentStock)
      .slice(0, 5);

    // 3. Outstanding Credits
    const customers = await Customer.find();
    const totalCredit = customers.reduce((sum, c) => sum + c.currentBalance, 0);
    const topCreditCustomers = customers
      .filter((c) => c.currentBalance > 0)
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 3)
      .map((c) => ({
        _id: c._id,
        name: c.name,
        balance: c.currentBalance,
        limit: c.creditLimit,
      }));

    // 4. Supplier Payables
    const unpaidPurchases = await Purchase.find({
      status: { $ne: "paid" },
    }).populate("supplier");

    const totalPayables = unpaidPurchases.reduce(
      (sum, p) => sum + p.balanceDue,
      0
    );

    res.json({
      dailySalesOverview: {
        date: startOfDay,
        invoiceCount,
        totalSalesAmount: Math.round(totalSalesAmount * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        totalVAT: Math.round(totalVAT * 100) / 100,
        paymentBreakdown,
      },
      lowStockItems,
      outstandingCredits: {
        totalCredit: Math.round(totalCredit * 100) / 100,
        topCustomers: topCreditCustomers,
      },
      supplierPayables: {
        totalPayables: Math.round(totalPayables * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
