import express from "express";

import {
  validateBarcodeController,
  getItemByBarcodeController,
  previewBarcodeController,
} from "./barcode.controller.js";

const router = express.Router();

router.post(
  "/validate",
  validateBarcodeController
);

router.get(
  "/item/:barcode",
  getItemByBarcodeController
);

router.get(
  "/preview/:itemId",
  previewBarcodeController
);

export default router;