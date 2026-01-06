import mongoose from "mongoose";

/**
 * Money helpers (Decimal128 in DB, numbers in API)
 */
const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: { type: String, unique: true },
    name: { type: String, required: true, index: true },

    contactPerson: String,
    phones: [String],
    email: String,
    address: String,

    openingBalance: {
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
    creditLimit: {
      type: mongoose.Schema.Types.Decimal128,
      set: toDecimal,
      get: decimalGetter,
    },
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
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Text indexes for full-text search
supplierSchema.index(
  {
    name: "text",
    phones: "text",
    email: "text",
    contactPerson: "text",
  },
  { name: "supplier_text_search" }
);

// Single field indexes for common queries
supplierSchema.index({ name: 1 }, { name: "supplier_name" });
supplierSchema.index({ email: 1 }, { name: "supplier_email", sparse: true });
supplierSchema.index({ status: 1 }, { name: "supplier_status" });
supplierSchema.index({ supplierCode: 1 }, { name: "supplier_code" });

// Compound indexes for filtering and sorting
supplierSchema.index(
  { status: 1, createdAt: -1 },
  { name: "supplier_status_recent" }
);
supplierSchema.index({ createdAt: -1 }, { name: "supplier_recent" });

// Index for balance-related queries
supplierSchema.index({ currentBalance: 1 }, { name: "supplier_balance" });

// Index for payment terms queries
supplierSchema.index(
  { "paymentTerms.type": 1 },
  { name: "supplier_payment_terms" }
);

export const Supplier = mongoose.model("Supplier", supplierSchema);
