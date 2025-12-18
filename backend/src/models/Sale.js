import mongoose from "mongoose";

/**
 * Money helpers (Decimal128 in DB, numbers in API)
 */
const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);

const saleItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    description: String,
    qty: { type: Number, required: true },
    unit: { type: String, required: true },
    unitPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    discount: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    taxAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    lineTotal: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
  },
  { _id: false, toJSON: { getters: true }, toObject: { getters: true } }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["cash", "card", "bank", "credit", "mixed"],
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    reference: String,
  },
  { _id: false, toJSON: { getters: true }, toObject: { getters: true } }
);

const saleSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [saleItemSchema],
    subTotal: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    discountTotal: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    taxTotal: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    grandTotal: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    payments: [paymentSchema],
    balanceDue: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    status: {
      type: String,
      enum: ["paid", "partial", "credit", "cancelled"],
      default: "paid",
    },
    isTaxInvoice: { type: Boolean, default: false },
    savedAsPending: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

saleSchema.index({ createdAt: 1 });

export const Sale = mongoose.model("Sale", saleSchema);
