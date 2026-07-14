export const mapReturnData = ({ returnItems, reason, reasonNote }) => ({
  reason,
  reasonNote: reasonNote?.trim() || undefined,
  returnLines: returnItems.map((item) => ({
    itemId: item._id,
    name: item.name,
    sku: item.sku,
    returnQty: item.returnQty,
    unitPrice: item.unitPrice,
    unit: item.unit,
    vatApplicable: item.vatApplicable,
    ...(item.batchId && { batchId: item.batchId }),
    ...(item.batchNumber && { batchNumber: item.batchNumber }),
  })),
});
