import mongoose from "mongoose";

/**
 * Money helpers (Decimal128 in DB, numbers in API)
 */
const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);

const purchaseItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    qty: { type: Number, required: true },
    unit: { type: String, required: true },
    costPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    lineTotal: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    batchNumber: String,
    expiryDate: Date,
  },
  { _id: false, toJSON: { getters: true }, toObject: { getters: true } }
);

const purchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    billNumber: { type: String, required: true },
    billDate: { type: Date, required: true },
    items: [purchaseItemSchema],
    note: { type: String },
    subTotal: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
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
    amountPaid: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    balanceDue: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

purchaseSchema.index({ billNumber: 1 });
purchaseSchema.index({ createdAt: 1 });

export const Purchase = mongoose.model("Purchase", purchaseSchema);
