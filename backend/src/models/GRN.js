import mongoose from "mongoose";
const { Schema } = mongoose;

const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
};

const paymentTermsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["CASH", "COD", "ADVANCE", "NET"],
      default: "CASH",
    },
    days: { type: Number, default: 0, min: 0 }, // used when type="NET"
  },
  { _id: false }
);

const grnLineSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },

    batchNumber: { type: String, trim: true },
    expiryDate: { type: Date },

    qty: { type: Number, required: true, min: 0.000001 },

    unitCost: { type: Schema.Types.Decimal128, required: true, set: toDecimal },

    lineTotal: {
      type: Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
    },
  },
  { _id: false }
);

const grnSchema = new Schema(
  {
    grnNo: {
      type: String,
      required: true,
      unique: true,
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

    // ✅ v1: GRN acts as Purchase Invoice
    paymentTerms: {
      type: paymentTermsSchema,
      default: () => ({ type: "CASH", days: 0 }),
    },

    // ✅ due date is calculated from grnDate + terms.days (if NET)
    dueDate: { type: Date, index: true },

    // ✅ v1 simple partial payments (single total paid)
    amountPaid: {
      type: Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
    },

    balanceDue: {
      type: Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
      index: true,
    },

    // LOCKING fields
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
    },

    remarks: { type: String, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

grnSchema.index({ supplier: 1, grnDate: -1 });
grnSchema.index({ supplier: 1, status: 1, grnDate: -1 });
grnSchema.index({ supplier: 1, paymentStatus: 1, dueDate: 1 });

/**
 * Always compute totals + due date server-side
 */
grnSchema.pre("validate", function (next) {
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

  // ✅ compute dueDate (v1 uses grnDate only)
  const baseDate = this.grnDate || new Date();
  const terms = this.paymentTerms || { type: "CASH", days: 0 };

  if (terms.type === "NET") {
    this.dueDate = addDays(baseDate, terms.days);
  } else {
    // CASH/COD/ADVANCE: due immediately
    this.dueDate = baseDate;
  }

  // ✅ compute balance + payment status
  const paid = this.amountPaid ? Number(this.amountPaid.toString()) : 0;
  const total = this.grandTotal ? Number(this.grandTotal.toString()) : 0;

  const bal = Math.max(total - paid, 0);
  this.balanceDue = toDecimal(bal);

  if (total > 0 && bal === 0) this.paymentStatus = "paid";
  else if (paid > 0 && bal > 0) this.paymentStatus = "partial";
  else this.paymentStatus = "unpaid";

  next();
});

export const GRN = mongoose.model("GRN", grnSchema);
