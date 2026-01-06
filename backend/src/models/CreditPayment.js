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

// Indexes for credit payment queries
creditPaymentSchema.index({ customer: 1 }, { name: "credit_payment_customer" });
creditPaymentSchema.index({ method: 1 }, { name: "credit_payment_method" });
creditPaymentSchema.index({ createdAt: -1 }, { name: "credit_payment_recent" });

// Compound indexes for common queries
creditPaymentSchema.index(
  { customer: 1, createdAt: -1 },
  { name: "credit_payment_customer_recent" }
);
creditPaymentSchema.index(
  { customer: 1, method: 1 },
  { name: "credit_payment_customer_method" }
);

// Index for applied invoices tracking
creditPaymentSchema.index(
  { appliedInvoices: 1 },
  { name: "credit_payment_applied_invoices", sparse: true }
);

// Index for amount-based queries
creditPaymentSchema.index({ amount: 1 }, { name: "credit_payment_amount" });

export const CreditPayment = mongoose.model(
  "CreditPayment",
  creditPaymentSchema
);
