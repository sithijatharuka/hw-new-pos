import barcodeService from "./barcode.service.js";

export const validateBarcodeController =
  async (req, res, next) => {
    try {
      await barcodeService.validate({
        barcode: req.body.barcode,
        tenantId: req.user.tenantId,
      });

      return res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

export const getItemByBarcodeController =
  async (req, res, next) => {
    try {
      const item =
        await barcodeService.getItemByBarcode(
          req.params.barcode,
          req.user.tenantId
        );

      return res.json(item);
    } catch (error) {
      next(error);
    }
  };

export const previewBarcodeController =
  async (req, res, next) => {
    try {
      const item =
        await barcodeService.previewBarcode(
          req.params.itemId,
          req.user.tenantId
        );

      return res.json(item);
    } catch (error) {
      next(error);
    }
  };