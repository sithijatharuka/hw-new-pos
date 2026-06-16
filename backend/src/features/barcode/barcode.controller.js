import { Item } from "../../models/Item.js";

/**
 * GET /api/barcode/preview/:id
 * Returns item data needed to render a barcode label.
 */
export const getBarcodePreview = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant context missing" });

    const item = await Item.findOne({ _id: req.params.id, tenantId }).select(
      "sku name barcode sellingPrice baseUnit"
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    const value = item.barcode || item.sku;
    res.json({
      _id: item._id,
      name: item.name,
      sku: item.sku,
      barcode: value,
      sellingPrice: item.sellingPrice,
      baseUnit: item.baseUnit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/barcode/:id
 * Save / update the barcode field on an existing item.
 */
export const saveBarcode = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant context missing" });

    const { barcode } = req.body;
    if (typeof barcode !== "string" || !barcode.trim()) {
      return res.status(400).json({ message: "barcode is required" });
    }

    const trimmed = barcode.trim();
    if (trimmed.length > 64) {
      return res.status(400).json({ message: "Barcode must be 64 characters or less" });
    }

    const item = await Item.findOne({ _id: req.params.id, tenantId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.barcode = trimmed;
    await item.save();

    res.json({ _id: item._id, barcode: item.barcode });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Barcode already in use by another item" });
    }
    res.status(500).json({ message: err.message });
  }
};
