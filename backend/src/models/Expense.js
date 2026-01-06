import mongoose from "mongoose";

/**
 * Money helpers (Decimal128 in DB, numbers in API)
 */
const toDecimal = (v) => {
  if (v === null || v === undefined || v === "") return undefined;
  return mongoose.Types.Decimal128.fromString(String(v));
};
const decimalGetter = (v) => (v ? parseFloat(v.toString()) : 0);

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    description: String,
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: toDecimal,
      get: decimalGetter,
    },
    date: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Indexes for expense queries
expenseSchema.index({ category: 1 }, { name: "expense_category" });
expenseSchema.index({ date: -1 }, { name: "expense_date" });
expenseSchema.index({ createdBy: 1 }, { name: "expense_creator" });
expenseSchema.index({ createdAt: -1 }, { name: "expense_recent" });

// Compound indexes for reporting
expenseSchema.index(
  { category: 1, date: -1 },
  { name: "expense_category_date" }
);
expenseSchema.index(
  { date: -1, category: 1 },
  { name: "expense_date_category" }
);

// Index for amount-based queries
expenseSchema.index({ amount: 1 }, { name: "expense_amount" });

// Index for user and date tracking
expenseSchema.index(
  { createdBy: 1, date: -1 },
  { name: "expense_creator_date" }
);

export const Expense = mongoose.model("Expense", expenseSchema);
