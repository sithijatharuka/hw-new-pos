import mongoose from "mongoose";
import { Sale } from "../../models/Sale.js";
import { Item } from "../../models/Item.js";
import { Return } from "./Return.js";
import { addStock } from "../../services/stockService.js";

/**
 * GET /api/returns/search?q=<barcode|sku>&type=barcode|sku
 * Finds the most recent sale containing the matched item.
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
  }).select("name sku barcode baseUnit sellingPrice taxApplicable");

  if (!item) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Find the most recent sale that contains this item
  const sale = await Sale.findOne({
    tenantId,
    "items.item": item._id,
    status: { $in: ["paid", "partial", "credit"] },
  })
    .sort({ createdAt: -1 })
    .populate("customer", "name phone")
    .select("billNumber customer items createdAt isTaxInvoice");

  if (!sale) {
    return res.status(404).json({ message: "No sale found for this product" });
  }

  const saleItem = sale.items.find(
    (l) => String(l.item) === String(item._id),
  );

  res.json({
    sale: {
      _id: sale._id,
      billNumber: sale.billNumber,
      customerName: sale.customer?.name || "Walk-in Customer",
      customerPhone: sale.customer?.phone || "",
      date: sale.createdAt,
      isTaxInvoice: sale.isTaxInvoice,
    },
    item: {
      _id: item._id,
      name: item.name,
      sku: item.sku,
      barcode: item.barcode,
      unit: saleItem?.unit || item.baseUnit,
      unitPrice: saleItem?.unitPrice ?? item.sellingPrice,
      vatApplicable: item.taxApplicable,
      maxQty: saleItem?.qty || 1,
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

    const { originalSaleId, reason, reasonNote, returnLines } = req.body;

    if (!originalSaleId || !reason || !Array.isArray(returnLines) || !returnLines.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "originalSaleId, reason, and returnLines are required" });
    }

    const sale = await Sale.findOne({ _id: originalSaleId, tenantId }).session(session);
    if (!sale) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Original sale not found" });
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
          note: `Return from sale ${sale.billNumber}`,
          referenceId: sale._id,
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
          originalSaleId: sale._id,
          billNumber: sale.billNumber,
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
    res.status(400).json({ message: err.message || "Failed to process return" });
  }
};
