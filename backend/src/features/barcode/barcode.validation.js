import Item from "../../models/Item.js";

export const validateBarcode = async ({
  barcode,
  tenantId,
  itemId = null,
}) => {
  if (!barcode) {
    throw new Error("Barcode is required");
  }

  const existing = await Item.findOne({
    barcode,
    tenantId,
  });

  if (
    existing &&
    existing._id.toString() !== itemId
  ) {
    throw new Error(
      "This barcode is already assigned to another item."
    );
  }

  return true;
};