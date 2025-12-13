import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    description: String,
    qty: { type: Number, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // absolute
    taxAmount: { type: Number, default: 0 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["cash", "card", "bank", "credit", "mixed"],
      required: true,
    },
    amount: { type: Number, required: true },
    reference: String,
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [saleItemSchema],
    subTotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    payments: [paymentSchema],
    balanceDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["paid", "partial", "credit", "cancelled"],
      default: "paid",
    },
    isTaxInvoice: { type: Boolean, default: false },
    savedAsPending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: 1 });

export const Sale = mongoose.model("Sale", saleSchema);
