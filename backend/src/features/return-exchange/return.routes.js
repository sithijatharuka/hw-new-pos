import express from "express";
import { protect, requireFeature } from "../../middleware/authMiddleware.js";
import { searchProduct, createReturn } from "./return.controller.js";

const router = express.Router();

// GET /api/returns/search?q=<value>&type=barcode|sku
router.get("/search", protect, requireFeature("return-exchange"), searchProduct);

// POST /api/returns
router.post("/", protect, requireFeature("return-exchange"), createReturn);

export default router;
