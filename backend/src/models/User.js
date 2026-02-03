import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { RefreshToken } from "./RefreshToken.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: false, unique: true },
    tenantId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["admin", "owner", "cashier", "manager"],
      default: "cashier",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Optimized indexes for user lookups
// Primary: username is unique, indexed in schema definition
userSchema.index({ tenantId: 1, isActive: 1 }, { name: "user_tenant_status" });
userSchema.index(
  { tenantId: 1, role: 1, isActive: 1 },
  { name: "user_tenant_role_status" },
);

// ✅ Async pre-save hook (no next)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Revoke all refresh tokens on password change
  if (!this.isNew) {
    await RefreshToken.updateMany(
      { user: this._id, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
