import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = express.Router();

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};

// Seed an admin if none exists (dev helper)
router.post("/seed-admin", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res
      .status(403)
      .json({ message: "Admin seeding is disabled in production" });
  }
  const { name, username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(400).json({ message: "Username already exists" });
  }
  const user = await User.create({
    name: name || "Admin",
    username: username || "admin",
    password: password || "admin123",
    role: "admin",
  });
  res.json({ message: "Admin created", user });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

export default router;
