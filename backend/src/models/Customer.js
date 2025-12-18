import mongoose from "mongoose";

/**
 * Money helpers (Decimal128 in DB, numbers in API)
 */
const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    phone: { type: String, index: true },
    address: String,
    nic: String,
    type: { type: String, enum: ["cash", "credit", "both"], default: "both" },
    creditLimit: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    currentBalance: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => toDecimal(0),
      set: toDecimal,
      get: decimalGetter,
    },
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

customerSchema.index({ name: "text", phone: "text" });

export const Customer = mongoose.model("Customer", customerSchema);
