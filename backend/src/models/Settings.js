import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    shopName: { type: String, default: "Your Hardware Shop Name" },
    shopAddress: {
      type: String,
      default: "No. 123, Main Street, Colombo 10, Sri Lanka",
    },
    shopPhone: { type: String, default: "011-2345678" },
    shopWhatsapp: { type: String, default: "07X-XXXXXXX" },
    vatRegNo: { type: String, default: "123456789-7000" },
    vatRate: { type: Number, default: 0.15 }, // 15%
    currency: { type: String, default: "LKR" }, // Currency code
    currencySymbol: { type: String, default: "Rs." }, // Currency symbol
    currencyPosition: {
      type: String,
      enum: ["before", "after"],
      default: "before",
    }, // Symbol position
    expenseCategories: {
      type: [String],
      default: [
        "Rent",
        "Salaries",
        "Transport",
        "Electricity",
        "Water",
        "Telephone",
        "Maintenance",
        "Office Supplies",
        "Other",
      ],
    },
  },
  { timestamps: true },
);

// Single document collection - minimal indexing needed
// but included for consistency and potential future queries
settingsSchema.index({ createdAt: -1 }, { name: "settings_recent" });
settingsSchema.index(
  { tenantId: 1 },
  { unique: true, name: "settings_tenant_unique" },
);

// There will normally be only one settings document
export const Settings = mongoose.model("Settings", settingsSchema);
