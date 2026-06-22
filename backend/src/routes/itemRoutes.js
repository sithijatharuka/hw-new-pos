import express from "express";
import mongoose from "mongoose";
import { protect, requireFeature } from "../middleware/authMiddleware.js";
import { Item } from "../models/Item.js";
import { StockMovement } from "../models/StockMovement.js";
import logger from "../utils/logger.js";

const router = express.Router();

const pick = (obj, allowed = []) => {
  const out = {};
  for (const k of allowed) {
    if (obj?.[k] !== undefined) out[k] = obj[k];
  }
  return out;
};

/**
 * ✅ MASTER fields only (NO inventory/batches changes via items endpoints)
 * Add Product modal can call these safely.
 */
const sanitizeItemPayload = (body = {}) => {
  const allowed = [
    "sku",
    "name",
    "barcode",
    "category",
    "brand",
    "description",

    "baseUnit",

    "sellingPrice",
    "costPrice",

    "taxApplicable",
    "taxRate",
    "taxCode",

    "lowStockLevel",
    "defaultSupplier",
    "isBatchTracked",
    "isSerialTracked",
    "isActive",
  ];

  const safe = pick(body, allowed);

  // Normalize strings
  if (safe.sku !== undefined)
    safe.sku = String(safe.sku || "")
      .trim()
      .toUpperCase();
  if (safe.name !== undefined) safe.name = String(safe.name || "").trim();
  if (safe.category !== undefined)
    safe.category = String(safe.category || "").trim();
  if (safe.description !== undefined)
    safe.description = String(safe.description || "").trim();
  if (safe.barcode !== undefined)
    safe.barcode = String(safe.barcode || "").trim();
  if (safe.brand !== undefined) safe.brand = String(safe.brand || "").trim();

  // Numeric safety
  if (safe.lowStockLevel !== undefined) {
    safe.lowStockLevel = Math.max(0, Number(safe.lowStockLevel) || 0);
  }
  if (safe.taxRate !== undefined) {
    safe.taxRate = Math.min(1, Math.max(0, Number(safe.taxRate) || 0));
  }

  // Tax safety (extra guard – your model also enforces)
  if (safe.taxApplicable === false) safe.taxRate = 0;

  return safe;
};

const isValidId = (id) => mongoose.isValidObjectId(id);

/**
 * ----------------------------
 * LOOKUPS / LISTING
 * ----------------------------
 */

// Categories list
router.get("/categories/list", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const categories = await Item.distinct("category", { tenantId });
    res.json(categories.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Base Units list
router.get("/units/list", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const units = await Item.distinct("baseUnit", { tenantId });
    res.json(units.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List items (search + lowStock + category + isActive) - requires "inventory" feature
router.get("/", protect, requireFeature("inventory"), async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const { q, lowStock, category, isActive } = req.query;

    const filter = { tenantId };
    if (category) filter.category = category;

    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    if (q) {
      const qq = String(q).trim();
      filter.$or = [
        { $text: { $search: qq } },
        { barcode: qq },
        { sku: qq.toUpperCase() },
        { name: new RegExp(qq, "i") },
      ];
    }

    if (lowStock === "true") {
      filter.$expr = {
        $lte: ["$inventory.onHand", "$lowStockLevel"],
      };
    }

    // Keep list light; batches are fetched via /:id/batches
    const items = await Item.find(filter)
      .select(
        "sku name barcode category brand baseUnit sellingPrice costPrice inventory isActive isBatchTracked lowStockLevel taxApplicable taxRate lastPurchasePrice",
      )
      .limit(300)
      .sort({ name: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ----------------------------
 * BARCODE LOOKUP
 * ----------------------------
 */

// Barcode lookup (exact match) -> fast for POS scanning
router.get("/barcode/:code", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const code = String(req.params.code || "").trim();
    const item = await Item.findOne({ tenantId, barcode: code }).select(
      "sku name barcode category brand baseUnit sellingPrice costPrice lastPurchasePrice inventory isActive isBatchTracked lowStockLevel taxApplicable taxRate batches",
    );

    if (!item)
      return res
        .status(404)
        .json({ message: "Item not found for this barcode" });
    if (item.isActive === false) {
      return res.status(400).json({ message: "Item is inactive" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ----------------------------
 * ITEM BATCHES (optimized for scan → show item + batches)
 * ----------------------------
 */
router.get("/:id/batches", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid item id" });

    // Only fetch what's needed for "show item + batches"
    const item = await Item.findOne({ _id: id, tenantId }).select(
      "sku name barcode baseUnit isActive isBatchTracked inventory.onHand inventory.reserved batches",
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    const batches = Array.isArray(item.batches) ? item.batches : [];
    const cleaned = batches
      .map((b) => ({
        _id: b._id,
        batchNumber: b.batchNumber || "",
        expiryDate: b.expiryDate || null,
        qtyOnHand: Number(b.qtyOnHand || 0),
        reserved: Number(b.reserved || 0),
        available: Math.max(
          0,
          Number(b.qtyOnHand || 0) - Number(b.reserved || 0),
        ),
        sellingPrice: b.sellingPrice != null ? Number(b.sellingPrice) : null,
      }))
      // FEFO-ish sort (earliest expiry first), then batchNumber
      .sort((a, b) => {
        const ax = a.expiryDate
          ? new Date(a.expiryDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bx = b.expiryDate
          ? new Date(b.expiryDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        if (ax !== bx) return ax - bx;
        return String(a.batchNumber).localeCompare(String(b.batchNumber));
      });

    res.json({
      item: {
        _id: item._id,
        sku: item.sku,
        name: item.name,
        barcode: item.barcode,
        baseUnit: item.baseUnit,
        isActive: item.isActive,
        isBatchTracked: item.isBatchTracked,
        inventory: item.inventory,
      },
      batches: item.isBatchTracked ? cleaned : [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ----------------------------
 * GET SINGLE ITEM BY ID
 * ----------------------------
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant context missing" });
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid item id" });

    const item = await Item.findOne({ _id: id, tenantId });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ----------------------------
 * CREATE / UPDATE (MASTER ONLY)
 * ----------------------------
 */

// Create item (MASTER ONLY, always zero stock)
router.post("/", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const payload = sanitizeItemPayload(req.body);

    if (!payload.sku || !payload.name || !payload.baseUnit) {
      return res
        .status(400)
        .json({ message: "sku, name, and baseUnit are required" });
    }

    // Optional business rule: unique name + category
    const existing = await Item.findOne({
      tenantId,
      name: new RegExp(`^${payload.name}$`, "i"),
      category: payload.category || "",
    });

    if (existing) {
      return res.status(400).json({
        message: `Product "${payload.name}" already exists in "${
          payload.category || "Uncategorized"
        }" category`,
      });
    }

    // Duplicate barcode check
    if (payload.barcode) {
      const barcodeExists = await Item.exists({ tenantId, barcode: payload.barcode });
      if (barcodeExists) {
        return res.status(400).json({ message: `Barcode "${payload.barcode}" is already in use by another item` });
      }
    }

    const item = await Item.create({
      ...payload,
      tenantId,
      // enforce clean stock state
      inventory: {
        onHand: 0,
        reserved: 0,
      },
      // batches default to undefined per model
      batches: undefined,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    });

    res.status(201).json(item);
  } catch (err) {
    if (err?.code === 11000) {
      const key = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({ message: `Duplicate value for ${key}` });
    }
    logger.error("Error creating item:", { error: err.message });
    res.status(500).json({ message: err.message });
  }
});

// Update item (MASTER ONLY)
router.put("/:id", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid item id" });

    const payload = sanitizeItemPayload(req.body);

    const item = await Item.findOne({ _id: id, tenantId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Duplicate barcode check (exclude the item being updated)
    if (payload.barcode && payload.barcode !== item.barcode) {
      const barcodeExists = await Item.exists({ tenantId, barcode: payload.barcode, _id: { $ne: id } });
      if (barcodeExists) {
        return res.status(400).json({ message: `Barcode "${payload.barcode}" is already in use by another item` });
      }
    }

    Object.assign(item, payload);
    await item.save();

    res.json(item);
  } catch (err) {
    if (err?.code === 11000) {
      const key = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({ message: `Duplicate value for ${key}` });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * ----------------------------
 * ACTIVATE / DEACTIVATE (preferred over delete)
 * ----------------------------
 */

router.patch("/:id/activate", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid item id" });

    const item = await Item.findOne({ _id: id, tenantId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.isActive = true;
    await item.save();

    res.json({ message: "Item activated", item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/deactivate", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid item id" });

    const item = await Item.findOne({ _id: id, tenantId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.isActive = false;
    await item.save();

    res.json({ message: "Item deactivated", item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ----------------------------
 * DELETE (keep as-is)
 * ----------------------------
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid item id" });

    const item = await Item.findOneAndDelete({ _id: id, tenantId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item deleted", id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ----------------------------
 * STOCK HISTORY (read-only)
 * ----------------------------
 */
router.get("/:id/stock-history", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ message: "Invalid item id" });

    const history = await StockMovement.find({ tenantId, item: id })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
