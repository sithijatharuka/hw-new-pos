import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "cashier", "manager"],
      default: "cashier",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for user lookups
userSchema.index({ username: 1 }, { name: "user_username" });
userSchema.index({ role: 1 }, { name: "user_role" });
userSchema.index({ isActive: 1 }, { name: "user_status" });
userSchema.index(
  { isActive: 1, createdAt: -1 },
  { name: "user_status_recent" }
);

// ✅ Async pre-save hook (no next)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
