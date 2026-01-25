import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is missing");
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }
    if (decoded.tenantId && req.user.tenantId !== decoded.tenantId) {
      res.status(401);
      throw new Error("Tenant mismatch");
    }
    if (!req.user.tenantId) {
      res.status(403);
      throw new Error("Tenant context missing");
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(401);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid access token" });
    } else {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "owner")) {
    next();
  } else {
    res.status(403);
    throw new Error("Admin or owner access only");
  }
};
