import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getDailySalesOverview,
  getLowStockItems,
  getOutstandingCredits,
  getSupplierPayables,
  getMonthlySalesTrend,
  getTopCategories,
  getProfitMetrics,
  getExpensesSummary,
  getDashboardSummary,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Protected routes - all dashboard endpoints require authentication
router.get("/summary", protect, getDashboardSummary);
router.get("/daily-sales", protect, getDailySalesOverview);
router.get("/low-stock", protect, getLowStockItems);
router.get("/outstanding-credits", protect, getOutstandingCredits);
router.get("/supplier-payables", protect, getSupplierPayables);
router.get("/monthly-trend", protect, getMonthlySalesTrend);
router.get("/top-categories", protect, getTopCategories);
router.get("/profit-metrics", protect, getProfitMetrics);
router.get("/expenses-summary", protect, getExpensesSummary);

export default router;
