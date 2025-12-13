import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { Expense } from '../models/Expense.js';

const router = express.Router();

// Create expense
router.post('/', protect, async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    createdBy: req.user?._id,
  });
  res.status(201).json(expense);
});

// List expenses with optional date range
router.get('/', protect, async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(expenses);
});

// Update expense
router.put('/:id', protect, async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json(expense);
});

// Delete expense
router.delete('/:id', protect, async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  await expense.deleteOne();
  res.json({ message: 'Expense removed' });
});

export default router;