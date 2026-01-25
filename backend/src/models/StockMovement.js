import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for stock movement tracking
stockMovementSchema.index({ item: 1 }, { name: "stock_movement_item" });
stockMovementSchema.index({ type: 1 }, { name: "stock_movement_type" });
stockMovementSchema.index(
  { direction: 1 },
  { name: "stock_movement_direction" }
);
stockMovementSchema.index({ tenantId: 1 }, { name: "stock_movement_tenant" });
stockMovementSchema.index(
  { referenceId: 1 },
  { name: "stock_movement_reference" }
);
stockMovementSchema.index({ createdAt: -1 }, { name: "stock_movement_recent" });

// Compound indexes for efficient filtering
stockMovementSchema.index(
  { item: 1, createdAt: -1 },
  { name: "stock_movement_item_recent" }
);
stockMovementSchema.index(
  { item: 1, type: 1, createdAt: -1 },
  { name: "stock_movement_item_type_recent" }
);
stockMovementSchema.index(
  { type: 1, createdAt: -1 },
  { name: "stock_movement_type_recent" }
);

// Index for direction-based queries
stockMovementSchema.index(
  { direction: 1, createdAt: -1 },
  { name: "stock_movement_direction_recent" }
);

// Index for reference tracking (GRN, sales, purchases)
stockMovementSchema.index(
  { referenceId: 1, type: 1 },
  { name: "stock_movement_reference_type" }
);

export const StockMovement = mongoose.model(
  "StockMovement",
  stockMovementSchema
);
