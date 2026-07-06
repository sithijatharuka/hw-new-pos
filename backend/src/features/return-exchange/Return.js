import mongoose from "mongoose";

const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);

const returnLineSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    name: String,
    sku: String,
    returnQty: { type: Number, required: true, min: 1 },
    unit: String,
    unitPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    refundAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
  },
  { _id: false, toJSON: { getters: true }, toObject: { getters: true } },
);

const returnSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    originalSaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },
    billNumber: { type: String },
    reason: { type: String, required: true },
    reasonNote: { type: String },
    returnLines: { type: [returnLineSchema], required: true },
    totalRefund: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    status: {
      type: String,
      enum: ["processed"],
      default: "processed",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  },
);

returnSchema.index(
  { tenantId: 1, originalSaleId: 1 },
  { name: "return_tenant_sale" },
);
returnSchema.index(
  { tenantId: 1, createdAt: -1 },
  { name: "return_tenant_recent" },
);

export const Return = mongoose.model("Return", returnSchema);
