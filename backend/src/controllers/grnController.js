import mongoose from "mongoose";
import { GRN } from "../models/GRN.js";
import { Supplier } from "../models/Supplier.js";
import { Item } from "../models/Item.js";
import { StockMovement } from "../models/StockMovement.js";

const asNumber = (v) =>
  v === null || v === undefined || v === "" ? NaN : Number(v);

/**
 * Generate GRN number for a supplier: SUPPLIERCODE-GRN####
 */
const generateGRNNumber = async (supplierId) => {
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) throw new Error("Supplier not found");

  const supplierCode =
    supplier.supplierCode || `SUP${String(supplier._id).slice(-6)}`;

  // Find the last GRN for this supplier to get the next sequence number
  const lastGRN = await GRN.findOne({
    supplier: supplierId,
    grnNo: new RegExp(`^${supplierCode}-GRN\\d+$`),
  })
    .sort({ grnNo: -1 })
    .limit(1);

  let nextNum = 1;
  if (lastGRN) {
    const match = lastGRN.grnNo.match(/GRN(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `${supplierCode}-GRN${String(nextNum).padStart(4, "0")}`;
};

/**
 * CREATE GRN (DRAFT only) - no stock changes here
 */
export const createGRN = async (req, res) => {
  try {
    const { supplier, lines } = req.body;
    let { grnNo } = req.body;

    if (!supplier || !Array.isArray(lines) || lines.length === 0) {
      return res
        .status(400)
        .json({ message: "Supplier and Items are required" });
    }

    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists)
      return res.status(404).json({ message: "Supplier not found" });

    // Auto-generate GRN number if not provided
    if (!grnNo || !grnNo.trim()) {
      grnNo = await generateGRNNumber(supplier);
    } else {
      grnNo = String(grnNo).trim();
      const exists = await GRN.findOne({ grnNo });
      if (exists)
        return res.status(400).json({ message: "GRN No already exists" });
    }

    // Validate items exist + batch requirements (but do not change stock)
    const itemIds = lines.map((l) => l.item);
    const items = await Item.find({ _id: { $in: itemIds } });
    const itemMap = new Map(items.map((it) => [String(it._id), it]));

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const it = itemMap.get(String(line.item));
      if (!it)
        return res
          .status(404)
          .json({ message: `Item not found in line ${i + 1}` });

      const qty = asNumber(line.qty);
      const unitCost = asNumber(line.unitCost);

      if (!qty || qty <= 0)
        return res
          .status(400)
          .json({ message: `Qty must be > 0 (line ${i + 1})` });
      if (Number.isNaN(unitCost) || unitCost < 0)
        return res
          .status(400)
          .json({ message: `Unit cost must be ≥ 0 (line ${i + 1})` });

      if (it.isBatchTracked) {
        if (!line.batchNumber?.trim())
          return res.status(400).json({
            message: `Batch number required for "${it.name}" (line ${i + 1})`,
          });
        if (!line.expiryDate)
          return res.status(400).json({
            message: `Expiry date required for "${it.name}" (line ${i + 1})`,
          });
      }
    }

    const grn = await GRN.create({
      ...req.body,
      grnNo,
      status: "draft",
      createdBy: req.user?._id,
    });

    const populated = await GRN.findById(grn._id)
      .populate("supplier")
      .populate("lines.item");
    res.status(201).json(populated);
  } catch (err) {
    if (err?.code === 11000)
      return res.status(400).json({ message: "GRN No already exists" });
    console.log(err);
    console.log(err.message);
    res.status(500).json({ message: err.message || "Failed to create GRN" });
  }
};

/**
 * POST GRN - applies stock + stock movements, locks GRN
 */
export const postGRN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const grn = await GRN.findById(req.params.id).session(session);
    if (!grn) return res.status(404).json({ message: "GRN not found" });

    if (grn.status !== "draft") {
      return res.status(400).json({ message: "Only DRAFT GRNs can be posted" });
    }

    const itemIds = grn.lines.map((l) => l.item);
    const items = await Item.find({ _id: { $in: itemIds } }).session(session);
    const itemMap = new Map(items.map((it) => [String(it._id), it]));

    for (let i = 0; i < grn.lines.length; i++) {
      const line = grn.lines[i];
      const it = itemMap.get(String(line.item));
      if (!it)
        return res
          .status(404)
          .json({ message: `Item not found in line ${i + 1}` });

      const qty = Number(line.qty);
      const unitCostNum = line.unitCost
        ? Number(line.unitCost.toString())
        : NaN;

      if (!qty || qty <= 0)
        return res.status(400).json({ message: `Invalid qty (line ${i + 1})` });
      if (Number.isNaN(unitCostNum) || unitCostNum < 0)
        return res
          .status(400)
          .json({ message: `Invalid unitCost (line ${i + 1})` });

      // Update lastPurchasePrice (Decimal setter in Item will handle)
      it.lastPurchasePrice = unitCostNum;

      if (it.isBatchTracked) {
        const bn = String(line.batchNumber || "").trim();
        const exp = new Date(line.expiryDate);

        const existingBatch = (it.batches || []).find(
          (b) =>
            b.batchNumber === bn &&
            b.expiryDate &&
            new Date(b.expiryDate).getTime() === exp.getTime()
        );

        if (existingBatch) {
          existingBatch.qtyOnHand = Number(existingBatch.qtyOnHand || 0) + qty;
        } else {
          it.batches.push({
            batchNumber: bn,
            expiryDate: exp,
            qtyOnHand: qty,
            reserved: 0,
          });
        }

        // Do NOT set inventory.onHand; item pre-save derives totals from batches
      } else {
        it.inventory = it.inventory || {};
        it.inventory.onHand = Number(it.inventory.onHand || 0) + qty;
      }

      await it.save({ session });

      await StockMovement.create(
        [
          {
            item: it._id,
            type: "grn",
            direction: "in",
            qty,
            referenceId: grn._id,
            note: `GRN Posted: ${grn.grnNo}`,
          },
        ],
        { session }
      );
    }

    grn.status = "posted";
    grn.postedAt = new Date();
    await grn.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await GRN.findById(grn._id)
      .populate("supplier")
      .populate("lines.item");
    res.json(populated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message || "Failed to post GRN" });
  }
};

/**
 * CANCEL GRN - reverses stock, locks cancelled
 */
export const cancelGRN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const grn = await GRN.findById(req.params.id).session(session);
    if (!grn) return res.status(404).json({ message: "GRN not found" });

    if (grn.status !== "posted") {
      return res
        .status(400)
        .json({ message: "Only POSTED GRNs can be cancelled" });
    }

    const itemIds = grn.lines.map((l) => l.item);
    const items = await Item.find({ _id: { $in: itemIds } }).session(session);
    const itemMap = new Map(items.map((it) => [String(it._id), it]));

    for (let i = 0; i < grn.lines.length; i++) {
      const line = grn.lines[i];
      const it = itemMap.get(String(line.item));
      if (!it)
        return res
          .status(404)
          .json({ message: `Item not found in line ${i + 1}` });

      const qty = Number(line.qty);

      if (it.isBatchTracked) {
        const bn = String(line.batchNumber || "").trim();
        const exp = new Date(line.expiryDate);

        const batch = (it.batches || []).find(
          (b) =>
            b.batchNumber === bn &&
            b.expiryDate &&
            new Date(b.expiryDate).getTime() === exp.getTime()
        );

        if (!batch || Number(batch.qtyOnHand || 0) < qty) {
          return res.status(400).json({
            message: `Cannot cancel: insufficient batch stock for "${
              it.name
            }" (line ${i + 1})`,
          });
        }

        batch.qtyOnHand = Number(batch.qtyOnHand) - qty;

        // optional: remove empty batches
        if (batch.qtyOnHand === 0 && (batch.reserved || 0) === 0) {
          it.batches = it.batches.filter(
            (b) => String(b._id) !== String(batch._id)
          );
        }
      } else {
        const onHand = Number(it.inventory?.onHand || 0);
        if (onHand < qty) {
          return res.status(400).json({
            message: `Cannot cancel: insufficient stock for "${
              it.name
            }" (line ${i + 1})`,
          });
        }
        it.inventory.onHand = onHand - qty;
      }

      await it.save({ session });

      await StockMovement.create(
        [
          {
            item: it._id,
            type: "grn_cancel",
            direction: "out",
            qty,
            referenceId: grn._id,
            note: `GRN Cancelled: ${grn.grnNo}`,
          },
        ],
        { session }
      );
    }

    grn.status = "cancelled";
    grn.cancelledAt = new Date();
    await grn.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await GRN.findById(grn._id)
      .populate("supplier")
      .populate("lines.item");
    res.json(populated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message || "Failed to cancel GRN" });
  }
};

/**
 * Get all GRNs
 */
export const getAllGRNs = async (req, res) => {
  try {
    const grns = await GRN.find()
      .populate("supplier")
      .populate("lines.item")
      .sort({ grnDate: -1 });
    res.json(grns);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch GRNs" });
  }
};

/**
 * Get single GRN
 */
export const getGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id)
      .populate("supplier")
      .populate("lines.item");
    if (!grn) return res.status(404).json({ message: "GRN not found" });
    res.json(grn);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch GRN" });
  }
};

/**
 * Get supplier GRNs
 */
export const getSupplierGRNs = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    const grns = await GRN.find({ supplier: supplierId })
      .populate("supplier")
      .populate("lines.item")
      .sort({ grnDate: -1 });

    res.json(grns);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch GRNs" });
  }
};

/**
 * Update GRN - DRAFT only
 */
export const updateGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id);
    if (!grn) return res.status(404).json({ message: "GRN not found" });

    if (grn.status !== "draft") {
      return res
        .status(400)
        .json({ message: "Only DRAFT GRNs can be updated" });
    }

    // Prevent changing status via update
    const { status, postedAt, cancelledAt, ...safe } = req.body;

    Object.assign(grn, safe);
    grn.status = "draft";

    await grn.save();

    const populated = await GRN.findById(grn._id)
      .populate("supplier")
      .populate("lines.item");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update GRN" });
  }
};

/**
 * Delete GRN - DRAFT only
 */
export const deleteGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id);
    if (!grn) return res.status(404).json({ message: "GRN not found" });

    if (grn.status !== "draft") {
      return res
        .status(400)
        .json({ message: "Only DRAFT GRNs can be deleted" });
    }

    await GRN.findByIdAndDelete(req.params.id);
    res.json({ message: "Draft GRN deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete GRN" });
  }
};
