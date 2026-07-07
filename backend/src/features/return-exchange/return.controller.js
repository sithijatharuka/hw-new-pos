import mongoose from "mongoose";
import { Item } from "../../models/Item.js";
import { Return } from "./Return.js";
import { addStock } from "../../services/stockService.js";

/**
 * GET /api/returns/search?q=<barcode|sku>&type=barcode|sku
 * Finds a product from inventory by barcode or SKU.
 */
export const searchProduct = async (req, res) => {
  const tenantId = req.user?.tenantId;
  const { q, type = "barcode" } = req.query;

  if (!q?.trim()) {
    return res.status(400).json({ message: "Query is required" });
  }

  const field = type === "sku" ? "sku" : "barcode";
  const item = await Item.findOne({
    tenantId,
    [field]: { $regex: new RegExp(`^${q.trim()}$`, "i") },
    isActive: true,
  }).select("name sku barcode baseUnit sellingPrice taxApplicable currentStock");

  if (!item) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json({
    item: {
      _id: item._id,
      name: item.name,
      sku: item.sku,
      barcode: item.barcode,
      unit: item.baseUnit,
      unitPrice: item.sellingPrice,
      vatApplicable: item.taxApplicable,
      currentStock: item.currentStock ?? 0,
    },
  });
};

/**
 * POST /api/returns
 * Creates a return record and restores stock for each returned line.
 */
export const createReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Tenant context missing" });
    }

    const { reason, reasonNote, returnLines } = req.body;

    if (!reason || !Array.isArray(returnLines) || !returnLines.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "reason and returnLines are required" });
    }

    // Build return lines with refund amounts
    const processedLines = returnLines.map((line) => {
      const qty = Number(line.returnQty);
      const price = Number(line.unitPrice);
      if (!qty || qty <= 0) throw new Error(`Invalid returnQty for item ${line.itemId}`);
      if (!price || price < 0) throw new Error(`Invalid unitPrice for item ${line.itemId}`);
      return {
        item: line.itemId,
        name: line.name,
        sku: line.sku,
        returnQty: qty,
        unit: line.unit,
        unitPrice: price,
        refundAmount: qty * price,
      };
    });

    const totalRefund = processedLines.reduce((sum, l) => sum + l.refundAmount, 0);

    // Restore stock for each returned item
    for (const line of processedLines) {
      await addStock(
        {
          itemId: line.item,
          tenantId,
          qty: line.returnQty,
          note: `Direct inventory return`,
          type: "return",
          createdBy: req.user?._id,
        },
        session,
      );
    }

    const [returnDoc] = await Return.create(
      [
        {
          tenantId,
          reason,
          reasonNote: reasonNote?.trim() || undefined,
          returnLines: processedLines,
          totalRefund,
          createdBy: req.user?._id,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(returnDoc);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("[createReturn] error:", err.message);
    res.status(400).json({ message: err.message || "Failed to process return" });
  }
};
