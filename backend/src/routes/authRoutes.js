import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import bcrypt from "bcryptjs";

const router = express.Router();

import dotenv from "dotenv";
dotenv.config();

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

const ms = (val) => {
  // Converts 7d, 15m, etc. to ms
  if (typeof val === "number") return val;
  const match = /^([0-9]+)([smhd])$/.exec(val);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s":
      return num * 1000;
    case "m":
      return num * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "d":
      return num * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};

const generateAccessToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return jwt.sign(
    { id: user._id, tenantId: user.tenantId, role: user.role },
    secret,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );
};

const generateRefreshToken = async (user) => {
  const refreshToken = crypto.randomBytes(64).toString("hex");
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRES_IN));
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
    revoked: false,
  });
  return refreshToken;
};

const verifyRefreshToken = async (userId, refreshToken) => {
  const tokens = await RefreshToken.find({ user: userId, revoked: false }).sort(
    { createdAt: -1 },
  );
  for (const tokenDoc of tokens) {
    if (await bcrypt.compare(refreshToken, tokenDoc.tokenHash)) {
      if (tokenDoc.expiresAt < new Date()) {
        tokenDoc.revoked = true;
        tokenDoc.revokedAt = new Date();
        await tokenDoc.save();
        throw new Error("Refresh token expired");
      }
      return tokenDoc;
    }
  }
  throw new Error("Invalid refresh token");
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
  const tenantId = crypto.randomUUID();
  const user = await User.create({
    name: name || "Admin",
    username: username || "admin",
    password: password || "admin123",
    role: "admin",
    tenantId,
  });
  res.json({ message: "Admin created", user });
});

// Login route with access/refresh token
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await user.matchPassword(password))) {
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

// Refresh token endpoint
router.post("/refresh-token", async (req, res) => {
  const { userId, refreshToken } = req.body;
  if (!userId || !refreshToken) {
    return res
      .status(400)
      .json({ message: "userId and refreshToken required" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  try {
    const oldTokenDoc = await verifyRefreshToken(userId, refreshToken);
    // Rotate: revoke old, issue new
    oldTokenDoc.revoked = true;
    oldTokenDoc.revokedAt = new Date();
    const newRefreshToken = await generateRefreshToken(user);
    oldTokenDoc.replacedByToken = newRefreshToken;
    await oldTokenDoc.save();
    const accessToken = generateAccessToken(user);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res
      .status(401)
      .json({ message: err.message || "Invalid refresh token" });
  }
});

export default router;
