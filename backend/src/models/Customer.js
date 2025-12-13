import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    phone: { type: String, index: true },
    address: String,
    nic: String,
    type: { type: String, enum: ["cash", "credit", "both"], default: "both" },
    creditLimit: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

customerSchema.index({ name: "text", phone: "text" });

export const Customer = mongoose.model("Customer", customerSchema);
