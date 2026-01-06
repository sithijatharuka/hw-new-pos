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

// Text indexes for full-text search
customerSchema.index(
  { name: "text", phone: "text" },
  { name: "customer_text_search" }
);

// Single field indexes for common queries
customerSchema.index({ name: 1 }, { name: "customer_name" });
customerSchema.index({ phone: 1 }, { name: "customer_phone" });
customerSchema.index({ type: 1 }, { name: "customer_type" });

// Compound indexes for balanced queries
customerSchema.index(
  { type: 1, createdAt: -1 },
  { name: "customer_type_recent" }
);
customerSchema.index({ createdAt: -1 }, { name: "customer_recent" });

// Index for filtering by status in queries
customerSchema.index({ currentBalance: 1 }, { name: "customer_balance" });

export const Customer = mongoose.model("Customer", customerSchema);
