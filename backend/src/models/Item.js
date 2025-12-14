import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Money helpers (avoid floating rounding errors)
 * Store as Decimal128, expose as JS number in toJSON/toObject via getters.
 */
const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);

/**
 * 1) Unit conversion (recommended: always convert TO baseUnit)
 * Example: fromUnit="box", toUnit=baseUnit="pcs", multiplier=24
 */
const unitConversionSchema = new Schema(
  {
    fromUnit: { type: String, required: true, trim: true }, // "box"
    toUnit: { type: String, required: true, trim: true }, // must equal baseUnit
    multiplier: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/**
 * 2) Batch stock
 */
const batchSchema = new Schema(
  {
    batchNumber: { type: String, trim: true, index: true },
    expiryDate: { type: Date, index: true },
    qtyOnHand: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

/**
 * 3) Inventory totals
 * For batch tracked items, totals are derived from batches to avoid drift.
 */
const inventorySchema = new Schema(
  {
    onHand: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    lowStockLevel: { type: Number, default: 0, min: 0 },
    reorderQuantity: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/**
 * 4) Item / Product (production-safe)
 * - single unique barcode per item (fast scanning)
 * - batch totals derived to prevent mismatches
 * - money fields stored as Decimal128
 */
const itemSchema = new Schema(
  {
    // Identification
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    name: { type: String, required: true, index: true, trim: true },
    category: { type: String, index: true, trim: true },
    description: { type: String, trim: true },

    // Single barcode per item
    // If some items don't have barcodes, keep sparse:true so multiple nulls don't conflict.
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },

    // Units
    baseUnit: { type: String, required: true, trim: true }, // e.g. "pcs", "kg"
    units: [unitConversionSchema],

    // Pricing (Decimal128)
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
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },

    // Tax
    taxApplicable: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0, min: 0 }, // %
    taxCode: { type: String, trim: true },

    // Stock
    // openingStock: only for initial setup (you can remove it if you initialize via stock transactions)
    openingStock: { type: Number, default: 0, min: 0 },
    inventory: { type: inventorySchema, default: () => ({}) },

    // Tracking mode
    isBatchTracked: { type: Boolean, default: false, index: true },
    isSerialTracked: { type: Boolean, default: false, index: true },

    // Batch stock lives here when isBatchTracked=true
    batches: [batchSchema],

    // Relationships
    defaultSupplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

/**
 * Virtuals
 */
itemSchema.virtual("availableStock").get(function () {
  const onHand = this.inventory?.onHand || 0;
  const reserved = this.inventory?.reserved || 0;
  return Math.max(0, onHand - reserved);
});

/**
 * Indexes
 */
itemSchema.index({ name: 1, category: 1, isActive: 1 });
itemSchema.index({ category: 1, isActive: 1 });

// Optional: text search for UI search boxes
itemSchema.index({
  name: "text",
  category: "text",
  description: "text",
  sku: "text",
  barcode: "text",
});

/**
 * Validation rules (production-safety)
 */
itemSchema.pre("validate", function (next) {
  // Tax safety: if tax is off, rate must be 0
  if (!this.taxApplicable) this.taxRate = 0;

  // Prevent ambiguous tracking mode
  if (this.isBatchTracked && this.isSerialTracked) {
    return next(
      new mongoose.Error.ValidationError(
        new Error(
          "Item cannot be both batch-tracked and serial-tracked without a dedicated serial model."
        )
      )
    );
  }

  // Unit conversion safety: enforce toUnit == baseUnit and no duplicate fromUnit
  if (Array.isArray(this.units) && this.baseUnit) {
    const seen = new Set();
    for (const u of this.units) {
      if (!u?.fromUnit || !u?.toUnit) continue;

      if (u.toUnit !== this.baseUnit) {
        return next(
          new mongoose.Error.ValidationError(
            new Error(
              `Unit conversion toUnit must equal baseUnit (${this.baseUnit}). Got ${u.toUnit}.`
            )
          )
        );
      }

      const key = u.fromUnit.trim().toLowerCase();
      if (seen.has(key)) {
        return next(
          new mongoose.Error.ValidationError(
            new Error(`Duplicate unit conversion fromUnit: ${u.fromUnit}`)
          )
        );
      }
      seen.add(key);

      if (u.multiplier <= 0) {
        return next(
          new mongoose.Error.ValidationError(
            new Error(`Multiplier must be > 0 for unit ${u.fromUnit}.`)
          )
        );
      }
    }
  }

  if (typeof next === "function") next();
});

/**
 * Keep totals consistent when batch-tracked (avoid drift)
 * inventory.onHand/reserved are derived from batches.
 */
itemSchema.pre("save", function (next) {
  if (this.isBatchTracked) {
    const batches = Array.isArray(this.batches) ? this.batches : [];
    const totalOnHand = batches.reduce((sum, b) => sum + (b.qtyOnHand || 0), 0);
    const totalReserved = batches.reduce(
      (sum, b) => sum + (b.reserved || 0),
      0
    );

    this.inventory = this.inventory || {};
    this.inventory.onHand = totalOnHand;
    this.inventory.reserved = totalReserved;
  }
  if (typeof next === "function") next();
});

/**
 * Guard against silent corruption via findOneAndUpdate
 * (recommended: do stock changes through a service that updates batches + totals correctly)
 */
itemSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const $set = update.$set || {};
  const $inc = update.$inc || {};

  const touchesTotals =
    Object.keys($set).some(
      (k) =>
        k.startsWith("inventory.onHand") || k.startsWith("inventory.reserved")
    ) ||
    Object.keys($inc).some(
      (k) =>
        k.startsWith("inventory.onHand") || k.startsWith("inventory.reserved")
    );

  if (touchesTotals) {
    return next(
      new Error(
        "Do not update inventory.onHand/reserved directly with findOneAndUpdate. Update batches (for batch-tracked) or use a stock service."
      )
    );
  }

  if (typeof next === "function") next();
});

export const Item = mongoose.model("Item", itemSchema);
