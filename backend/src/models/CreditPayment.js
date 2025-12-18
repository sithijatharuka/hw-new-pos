import mongoose from "mongoose";

/**
 * Money helpers (Decimal128 in DB, numbers in API)
 */
const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);

const creditPaymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    method: { type: String, enum: ["cash", "card", "bank"], required: true },
    reference: String, // optional: slip no, note
    note: String,
    appliedInvoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sale" }], // optional
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

creditPaymentSchema.index({ customer: 1, createdAt: -1 });

export const CreditPayment = mongoose.model(
  "CreditPayment",
  creditPaymentSchema
);
