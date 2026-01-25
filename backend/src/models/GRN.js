// models/GRN.v1.model.js
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

const grnLineSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },

    // Batch tracking fields (enforced in post GRN for batch-tracked items)
    batchNumber: { type: String, trim: true },

    qty: { type: Number, required: true, min: 0.000001 },

    unitCost: {
      type: Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },

    lineTotal: {
      type: Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
  },
  { _id: false, toJSON: { getters: true }, toObject: { getters: true } }
);

const grnSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    grnNo: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },

    grnDate: { type: Date, default: Date.now, index: true },

    status: {
      type: String,
      enum: ["draft", "posted", "cancelled"],
      default: "draft",
      index: true,
    },
    postedAt: { type: Date },
    cancelledAt: { type: Date },

    lines: {
      type: [grnLineSchema],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        "GRN must have at least one item line",
      ],
    },

    totalQty: { type: Number, default: 0 },
    grandTotal: {
      type: Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },

    remarks: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

// Indexes for GRN (Goods Receipt Note) queries
grnSchema.index({ grnNo: 1 }, { name: "grn_number" });
grnSchema.index({ supplier: 1 }, { name: "grn_supplier" });
grnSchema.index({ status: 1 }, { name: "grn_status" });
grnSchema.index({ grnDate: -1 }, { name: "grn_date" });
grnSchema.index({ createdAt: -1 }, { name: "grn_recent" });
grnSchema.index({ tenantId: 1 }, { name: "grn_tenant" });
grnSchema.index(
  { tenantId: 1, grnNo: 1 },
  { unique: true, name: "grn_tenant_number" }
);

// Compound indexes for common queries
grnSchema.index({ supplier: 1, grnDate: -1 }, { name: "grn_supplier_date" });
grnSchema.index(
  { supplier: 1, status: 1, grnDate: -1 },
  { name: "grn_supplier_status_date" }
);

// Index for status-based queries
grnSchema.index({ status: 1, grnDate: -1 }, { name: "grn_status_date" });

// Index for user-specific GRN tracking
grnSchema.index({ createdBy: 1, grnDate: -1 }, { name: "grn_user_recent" });

// Index for posted records
grnSchema.index({ status: 1, postedAt: -1 }, { name: "grn_posted_records" });

/**
 * v1: Always compute totals server-side
 */
grnSchema.pre("validate", function () {
  let totalQty = 0;
  let grand = 0;

  for (const line of this.lines || []) {
    const qty = Number(line.qty || 0);
    const unitCostNum = line.unitCost ? Number(line.unitCost.toString()) : 0;

    totalQty += qty;
    const lt = qty * unitCostNum;

    line.lineTotal = toDecimal(lt);
    grand += lt;
  }

  this.totalQty = totalQty;
  this.grandTotal = toDecimal(grand);
});

export const GRN = mongoose.model("GRN", grnSchema);
