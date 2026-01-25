import { StockMovement } from "../models/StockMovement.js";
import { Item } from "../models/Item.js";

const ensureNumber = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error("Quantity must be a valid number");
  return n;
};

const loadItemOrThrow = async (itemId, tenantId, session) => {
  const item = await Item.findOne({ _id: itemId, tenantId }).session(
    session || null
  );
  if (!item) throw new Error("Item not found");
  if (item.isActive === false) throw new Error("Item is inactive");
  return item;
};

export const addStock = async (
  {
    itemId,
    tenantId,
    qty,
    batchNumber,
    note,
    referenceId,
    type = "adjustment",
    createdBy,
  },
  session
) => {
  const item = await loadItemOrThrow(itemId, tenantId, session);
  const amount = ensureNumber(qty);
  if (amount <= 0) throw new Error("Quantity must be greater than zero");

  if (item.isBatchTracked) {
    const bn = String(batchNumber || "").trim();
    if (!bn) throw new Error(`Batch number required for "${item.name}"`);

    if (!Array.isArray(item.batches)) item.batches = [];
    const existingBatch = item.batches.find((b) => b.batchNumber === bn);
    if (existingBatch) {
      existingBatch.qtyOnHand = Number(existingBatch.qtyOnHand || 0) + amount;
    } else {
      item.batches.push({ batchNumber: bn, qtyOnHand: amount, reserved: 0 });
    }
  } else {
    item.inventory = item.inventory || {};
    item.inventory.onHand = Number(item.inventory.onHand || 0) + amount;
  }

  await item.save({ session });

  await StockMovement.create(
    [
      {
        tenantId,
        item: item._id,
        type,
        direction: "in",
        qty: amount,
        referenceId,
        note,
        createdBy,
      },
    ],
    { session }
  );

  return item;
};

export const deductStock = async (
  {
    itemId,
    tenantId,
    qty,
    batchNumber,
    note,
    referenceId,
    type = "adjustment",
    createdBy,
  },
  session
) => {
  const item = await loadItemOrThrow(itemId, tenantId, session);
  const amount = ensureNumber(qty);
  if (amount <= 0) throw new Error("Quantity must be greater than zero");

  if (item.isBatchTracked) {
    const bn = String(batchNumber || "").trim();
    if (!bn) throw new Error(`Batch number required for "${item.name}"`);

    const batch = (item.batches || []).find((b) => b.batchNumber === bn);
    if (!batch) throw new Error(`Batch "${bn}" not found for "${item.name}"`);

    const onHand = Number(batch.qtyOnHand || 0);
    if (onHand < amount)
      throw new Error(`Insufficient batch stock for "${item.name}" (${bn})`);

    batch.qtyOnHand = onHand - amount;
    // optional cleanup
    if (batch.qtyOnHand === 0 && (batch.reserved || 0) === 0) {
      item.batches = item.batches.filter(
        (b) => String(b._id) !== String(batch._id)
      );
    }
  } else {
    const onHand = Number(item.inventory?.onHand || 0);
    if (onHand < amount)
      throw new Error(`Insufficient stock for "${item.name}"`);
    item.inventory.onHand = onHand - amount;
  }

  await item.save({ session });

  await StockMovement.create(
    [
      {
        tenantId,
        item: item._id,
        type,
        direction: "out",
        qty: amount,
        referenceId,
        note,
        createdBy,
      },
    ],
    { session }
  );

  return item;
};
