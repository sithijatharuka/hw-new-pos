import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { Sale } from "../models/Sale.js";
import { Item } from "../models/Item.js";
import { Customer } from "../models/Customer.js";
import { StockMovement } from "../models/StockMovement.js";
import { Settings } from "../models/Settings.js";

const router = express.Router();

const vatRateFromSettings = async () => {
  const s = await Settings.findOne();
  if (s && typeof s.vatRate === "number") return s.vatRate;
  return Number(process.env.VAT_RATE || 0.15);
};

// Calculate VAT-aware totals on server-side to keep source of truth
const hydrateAndCalculateSale = async (payload) => {
  const VAT_RATE = await vatRateFromSettings();
  const itemIds = payload.items.map((l) => l.item);
  const items = await Item.find({ _id: { $in: itemIds } }).select(
    "taxApplicable"
  );
  const itemMap = new Map(items.map((it) => [String(it._id), it]));

  let subTotal = 0;
  let taxTotal = 0;

  payload.items = payload.items.map((line) => {
    const dbItem = itemMap.get(String(line.item));
    const qty = Number(line.qty) || 0;
    const price = Number(line.unitPrice) || 0;
    const discountPercent = Number(line.discount) || 0;

    const baseBeforeDisc = qty * price;
    const discountAmount = (baseBeforeDisc * discountPercent) / 100;
    const lineBase = baseBeforeDisc - discountAmount;
    let tax = 0;

    if (payload.isTaxInvoice && dbItem?.taxApplicable) {
      tax = lineBase * VAT_RATE;
    }

    const lineTotal = lineBase + tax;

    subTotal += lineBase;
    taxTotal += tax;

    return {
      ...line,
      discount: discountAmount,
      taxAmount: tax,
      lineTotal,
    };
  });

  const discountTotal = Number(payload.discountTotal || 0);
  const grandTotal = subTotal - discountTotal + taxTotal;

  return {
    ...payload,
    subTotal,
    taxTotal,
    discountTotal,
    grandTotal,
  };
};

// Helper to update stock + customer
const applySaleEffects = async (sale) => {
  for (const line of sale.items) {
    const item = await Item.findById(line.item);
    if (!item) continue;
    item.currentStock = (item.currentStock || 0) - line.qty;
    await item.save();
    await StockMovement.create({
      item: item._id,
      type: "sale",
      qty: line.qty,
      direction: "out",
      referenceId: sale._id,
      note: `Sale ${sale.billNumber}`,
    });
  }

  if (sale.customer && sale.balanceDue > 0) {
    const customer = await Customer.findById(sale.customer);
    if (customer) {
      customer.currentBalance += sale.balanceDue;
      await customer.save();
    }
  }
};

// Create sale
router.post("/", protect, async (req, res) => {
  const calculated = await hydrateAndCalculateSale(req.body);
  const sale = await Sale.create(calculated);
  if (!sale.savedAsPending) {
    await applySaleEffects(sale);
  }
  res.status(201).json(sale);
});

// Update pending sale (convert to final)
router.put("/:id/finalize", protect, async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }
  if (!sale.savedAsPending) {
    return res.status(400).json({ message: "Sale already finalized" });
  }
  const calculated = await hydrateAndCalculateSale({
    ...sale.toObject(),
    ...req.body,
    savedAsPending: false,
  });
  sale.set(calculated);
  await sale.save();
  await applySaleEffects(sale);
  res.json(sale);
});

// List sales (daily)
router.get("/", protect, async (req, res) => {
  const { date } = req.query;
  const filter = {};
  if (date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));
    filter.createdAt = { $gte: start, $lte: end };
  }
  const sales = await Sale.find(filter)
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .limit(500);
  res.json(sales);
});

// Get sale
router.get("/:id", protect, async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate(
    "customer",
    "name phone address"
  );
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }
  res.json(sale);
});

export default router;
