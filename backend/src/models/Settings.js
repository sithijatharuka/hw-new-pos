import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    shopName: { type: String, default: "Your Hardware Shop Name" },
    shopAddress: {
      type: String,
      default: "No. 123, Main Street, Colombo 10, Sri Lanka",
    },
    shopPhone: { type: String, default: "011-2345678" },
    shopWhatsapp: { type: String, default: "07X-XXXXXXX" },
    vatRegNo: { type: String, default: "123456789-7000" },
    vatRate: { type: Number, default: 0.15 }, // 15%
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
  { timestamps: true }
);

// There will normally be only one settings document
export const Settings = mongoose.model("Settings", settingsSchema);
