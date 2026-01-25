import express from "express";
import crypto from "crypto";
import { User } from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

const sanitizeRole = (role) => {
  const value = String(role || "").toLowerCase().trim();
  if (value === "manager") return "manager";
  return "cashier";
};

// Owner signup (creates a new tenant)
router.post("/owner-signup", async (req, res) => {
  const { name, username, password } = req.body || {};

  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ message: "name, username, and password are required" });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const tenantId = crypto.randomUUID();
  const user = await User.create({
    name: String(name).trim(),
    username: String(username).trim(),
    password: String(password),
    role: "owner",
    tenantId,
  });

  const safeUser = await User.findById(user._id).select("-password");
  res.status(201).json({ message: "Owner created", user: safeUser });
});

// Create staff user (same tenant as owner/admin)
router.post("/staff", protect, adminOnly, async (req, res) => {
  const { name, username, password, role } = req.body || {};

  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ message: "name, username, and password are required" });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const user = await User.create({
    name: String(name).trim(),
    username: String(username).trim(),
    password: String(password),
    role: sanitizeRole(role),
    tenantId: req.user.tenantId,
  });

  const safeUser = await User.findById(user._id).select("-password");
  res.status(201).json({ message: "Staff user created", user: safeUser });
});

// List users for the tenant
router.get("/", protect, adminOnly, async (req, res) => {
  const users = await User.find({ tenantId: req.user.tenantId })
    .select("-password")
    .sort({ createdAt: -1 });
  res.json(users);
});

export default router;
