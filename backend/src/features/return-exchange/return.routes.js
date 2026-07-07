import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { searchProduct, createReturn } from "./return.controller.js";

const router = express.Router();

// GET /api/returns/search?q=<value>&type=barcode|sku
router.get("/search", protect, searchProduct);

// POST /api/returns
router.post("/", protect, createReturn);

export default router;
