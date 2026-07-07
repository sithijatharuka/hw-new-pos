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
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfiguration" });
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (decoded.tenantId && req.user.tenantId !== decoded.tenantId) {
      return res.status(401).json({ message: "Tenant mismatch" });
    }
    if (!req.user.tenantId) {
      return res.status(403).json({ message: "Tenant context missing" });
    }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid access token" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "owner")) {
    next();
  } else {
    return res.status(403).json({ message: "Admin or owner access only" });
  }
};

/**
 * Middleware to check if user has access to a specific feature
 * Usage: router.get("/dashboard", protect, requireFeature("dashboard"), controller)
 */
export const requireFeature = (featureId) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    // Owners and admins always have full access
    if (req.user.role === "owner" || req.user.role === "admin") {
      return next();
    }

    // Check if user has the required feature permission
    const hasPermission =
      Array.isArray(req.user.permissions) &&
      req.user.permissions.includes(featureId);

    if (!hasPermission) {
      res.status(403);
      return res.json({
        message: `You do not have access to the "${featureId}" feature`,
      });
    }

    next();
  };
};
