import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    description: String,
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

expenseSchema.index({ date: 1 });

export const Expense = mongoose.model('Expense', expenseSchema);