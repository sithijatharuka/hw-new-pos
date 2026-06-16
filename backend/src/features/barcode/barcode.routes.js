import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getBarcodePreview, saveBarcode } from "./barcode.controller.js";

const router = express.Router();

// GET /api/barcode/preview/:id  – fetch barcode label data for an item
router.get("/preview/:id", protect, getBarcodePreview);

// PATCH /api/barcode/:id        – save / update barcode on an item
router.patch("/:id", protect, saveBarcode);

export default router;
