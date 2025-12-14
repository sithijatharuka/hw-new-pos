import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: { type: String, unique: true },
    name: { type: String, required: true, index: true },

    contactPerson: String,
    phones: [String],
    email: String,
    address: String,

    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    creditLimit: Number,
    paymentTerms: {
      type: {
        type: String,
        enum: ["CASH", "COD", "ADVANCE", "NET"],
        default: "CASH",
      },
      days: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    notes: String,

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

supplierSchema.index({
  name: "text",
  phones: "text",
  email: "text",
});

supplierSchema.index({ name: "text", phone: "text" });

export const Supplier = mongoose.model("Supplier", supplierSchema);
