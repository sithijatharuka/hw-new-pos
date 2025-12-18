// models/Item.v1.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Money helpers (Decimal128 in DB, numbers in API)
 */
const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);
const sumBatchQty = (batches = []) =>
  batches.reduce((sum, b) => sum + (Number(b.qtyOnHand) || 0), 0);

/**
 * Batch schema with optional pricing per batch
 * Falls back to item-level pricing if not specified
 */
const batchSchema = new Schema(
  {
    batchNumber: { type: String, required: true, trim: true, index: true },
    qtyOnHand: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date },

    // Optional: batch-specific pricing (overrides item-level pricing)
    costPrice: {
      type: Schema.Types.Decimal128,
      set: toDecimal,
      get: decimalGetter,
    },
    sellingPrice: {
      type: Schema.Types.Decimal128,
      set: toDecimal,
      get: decimalGetter,
    },
  },
  { _id: true, toJSON: { getters: true }, toObject: { getters: true } }
);

/**
 * Minimal inventory for v1
 */
const inventorySchema = new Schema(
  {
    onHand: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 }, // keep for future, unused in v1
  },
  { _id: false }
);

const itemSchema = new Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    name: { type: String, required: true, index: true, trim: true },
    barcode: { type: String, trim: true, index: true, sparse: true },
    category: { type: String, index: true, trim: true },
    brand: { type: String, trim: true },

    // Keep a single base unit for v1 (e.g. "pcs")
    baseUnit: { type: String, required: true, trim: true },

    // Minimal pricing
    sellingPrice: {
      type: Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    costPrice: {
      type: Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    lastPurchasePrice: {
      type: Schema.Types.Decimal128,
      set: toDecimal,
      get: decimalGetter,
    },

    // Stock mode
    isBatchTracked: { type: Boolean, default: false, index: true },

    // Stock
    inventory: { type: inventorySchema, default: () => ({}) },

    // Only used when isBatchTracked=true
    batches: { type: [batchSchema], default: undefined },

    // Stock alerts
    lowStockLevel: { type: Number, default: 10, min: 0 },

    // Tax configuration
    taxApplicable: { type: Boolean, default: true },
    taxRate: { type: Number, default: 0, min: 0, max: 1 }, // 0 to 1 (e.g., 0.15 for 15%)

    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

itemSchema.virtual("availableStock").get(function () {
  const onHand = this.inventory?.onHand || 0;
  const reserved = this.inventory?.reserved || 0;
  return Math.max(0, onHand - reserved);
});

// Virtual field for backward compatibility
itemSchema.virtual("currentStock").get(function () {
  return this.inventory?.onHand || 0;
});

// Expose opening stock as the total quantity across batches (or inventory)
itemSchema.virtual("openingStock").get(function () {
  if (this.isBatchTracked) {
    return sumBatchQty(this.batches || []);
  }
  return Number(this.inventory?.onHand || 0);
});

// Keep totals consistent for batch-tracked items
itemSchema.pre("save", function () {
  if (this.isBatchTracked) {
    // For batch-tracked items, calculate total from batches
    const batches = Array.isArray(this.batches) ? this.batches : [];
    const totalOnHand = sumBatchQty(batches);

    this.inventory = this.inventory || {};
    this.inventory.onHand = totalOnHand;
    // reserved stays as-is (future feature)
  } else {
    // If not batch tracked, clear any stale batches
    this.batches = undefined;
  }
});

export const Item = mongoose.model("Item", itemSchema);
