import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { Purchase } from "../models/Purchase.js";
import { Supplier } from "../models/Supplier.js";
import { Item } from "../models/Item.js";
import { StockMovement } from "../models/StockMovement.js";

const router = express.Router();

// Apply inventory + supplier balance
const applyPurchaseEffects = async (purchase) => {
  for (const line of purchase.items) {
    const item = await Item.findById(line.item);
    if (!item) continue;

    // Convert selected unit to base unit quantity
    const baseUnit = item.baseUnit;
    let factorToBase = 1;
    if (line.unit !== baseUnit) {
      const conversion = (item.units || []).find(
        (u) => u.fromUnit === line.unit && u.toUnit === baseUnit
      );
      factorToBase = conversion?.multiplier || 1;
    }

    const baseQty = line.qty * factorToBase;
    item.currentStock = (item.currentStock || 0) + baseQty;

    // Update latest cost per base unit
    const costPerBase = factorToBase
      ? line.costPrice / factorToBase
      : line.costPrice;
    item.costPrice = costPerBase;

    await item.save();
    await StockMovement.create({
      item: item._id,
      type: "purchase",
      qty: baseQty,
      direction: "in",
      referenceId: purchase._id,
      note: `Purchase ${purchase.billNumber}`,
    });
  }

  const supplier = await Supplier.findById(purchase.supplier);
  if (supplier) {
    supplier.currentBalance += purchase.balanceDue;
    await supplier.save();
  }
};

router.post("/", protect, async (req, res) => {
  const {
    supplier,
    billNumber,
    billDate,
    items = [],
    amountPaid = 0,
  } = req.body;

  if (!supplier) {
    return res.status(400).json({ message: "Supplier is required" });
  }
  if (!items.length) {
    return res.status(400).json({ message: "At least one item is required" });
  }

  const subTotal = items.reduce((sum, l) => sum + Number(l.lineTotal || 0), 0);
  const grandTotal = subTotal; // extend with tax later
  const paid = Number(amountPaid) || 0;
  const balanceDue = grandTotal - paid;
  const status = paid >= grandTotal ? "paid" : paid > 0 ? "partial" : "unpaid";

  const purchase = await Purchase.create({
    ...req.body,
    supplier,
    billNumber,
    billDate,
    subTotal,
    grandTotal,
    amountPaid: paid,
    balanceDue,
    status,
  });
  await applyPurchaseEffects(purchase);
  res.status(201).json(purchase);
});

router.get("/", protect, async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.billDate = {};
    if (from) filter.billDate.$gte = new Date(from);
    if (to) filter.billDate.$lte = new Date(to);
  }
  const purchases = await Purchase.find(filter)
    .populate("supplier", "name")
    .sort({ billDate: -1 })
    .limit(500);
  res.json(purchases);
});

export default router;
