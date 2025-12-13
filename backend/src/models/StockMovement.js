import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

    type: {
      type: String,
      enum: ["sale", "purchase", "adjustment", "opening", "grn", "grn_cancel"],
      required: true,
      index: true,
    },

    qty: { type: Number, required: true, min: 0.000001 },

    direction: { type: String, enum: ["in", "out"], required: true },

    // we will store GRN _id here
    referenceId: { type: mongoose.Schema.Types.ObjectId, index: true },

    note: { type: String, trim: true },
  },
  { timestamps: true }
);

stockMovementSchema.index({ item: 1, createdAt: -1 });

export const StockMovement = mongoose.model(
  "StockMovement",
  stockMovementSchema
);
