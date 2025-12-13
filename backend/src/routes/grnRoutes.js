import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createGRN,
  getSupplierGRNs,
  getAllGRNs,
  getGRN,
  updateGRN,
  deleteGRN,
  postGRN,
  cancelGRN,
} from "../controllers/grnController.js";

const router = express.Router();

// Create DRAFT GRN
router.post("/", protect, createGRN);

// List all GRNs
router.get("/", protect, getAllGRNs);

// Supplier GRNs (must be before "/:id")
router.get("/supplier/:supplierId", protect, getSupplierGRNs);

// Post / Cancel (locking actions)
router.post("/:id/post", protect, postGRN);
router.post("/:id/cancel", protect, cancelGRN);

// Single GRN
router.get("/:id", protect, getGRN);

// Update/Delete only draft
router.put("/:id", protect, updateGRN);
router.delete("/:id", protect, deleteGRN);

export default router;
