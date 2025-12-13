import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { Supplier } from "../models/Supplier.js";
import { Purchase } from "../models/Purchase.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(supplier);
});

// Update supplier
router.put("/:id", protect, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const fields = [
      "supplierCode",
      "name",
      "contactPerson",
      "phones",
      "address",
      "email",
      "creditLimit",
      "paymentTerms",
      "vatNo",
      "brn",
      "notes",
      "status",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        supplier[f] = req.body[f];
      }
    });

    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, async (req, res) => {
  const { q } = req.query;
  const filter = {};
  if (q) {
    filter.$text = { $search: q };
  }
  const suppliers = await Supplier.find(filter).limit(200).sort({ name: 1 });
  res.json(suppliers);
});

router.get("/:id", protect, async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  const purchases = await Purchase.find({ supplier: supplier._id }).sort({
    createdAt: -1,
  });
  res.json({ supplier, purchases });
});

// Pay down supplier outstanding (reduces currentBalance)
router.post("/:id/pay", protect, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const amount = Number(req.body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Payment amount must be greater than 0" });
    }

    const outstanding = Number(supplier.currentBalance || 0);
    if (amount > outstanding) {
      return res.status(400).json({ message: "Amount exceeds outstanding" });
    }

    supplier.currentBalance = Math.max(0, outstanding - amount);
    await supplier.save();

    res.json({ supplier, message: "Payment recorded" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete supplier (only if no outstanding balance and no purchases)
router.delete("/:id", protect, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    if (supplier.currentBalance > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete supplier with outstanding balance" });
    }

    const purchaseCount = await Purchase.countDocuments({
      supplier: supplier._id,
    });
    if (purchaseCount > 0) {
      return res.status(400).json({
        message: "Cannot delete supplier with existing purchase records",
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
