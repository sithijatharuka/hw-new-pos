import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    qty: { type: Number, required: true },
    unit: { type: String, required: true },
    costPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    batchNumber: String,
    expiryDate: Date,
  },
  { _id: false }
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
    subTotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

purchaseSchema.index({ billNumber: 1 });
purchaseSchema.index({ createdAt: 1 });

export const Purchase = mongoose.model("Purchase", purchaseSchema);
