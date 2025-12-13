import mongoose from "mongoose";

const creditPaymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["cash", "card", "bank"], required: true },
    reference: String, // optional: slip no, note
    note: String,
    appliedInvoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sale" }], // optional
  },
  { timestamps: true }
);

creditPaymentSchema.index({ customer: 1, createdAt: -1 });

export const CreditPayment = mongoose.model(
  "CreditPayment",
  creditPaymentSchema
);
