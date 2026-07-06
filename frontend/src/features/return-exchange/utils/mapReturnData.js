/**
 * Map frontend return form state to the shape expected by the backend API.
 * TODO: ADD BACKEND CODE HERE — adjust field names to match the actual Return model schema
 */
export const mapReturnData = ({
  sale,
  returnItems,
  reason,
  reasonNote,
  refundMethod,
  mode, // "return" | "exchange"
  exchangeItems,
}) => ({
  originalSaleId: sale?._id,
  invoiceNumber: sale?.invoiceNumber,
  mode,
  reason,
  reasonNote: reasonNote?.trim() || undefined,
  refundMethod,
  returnLines: returnItems.map((item) => ({
    itemId: item._id,
    name: item.name,
    sku: item.sku,
    returnQty: item.returnQty,
    unitPrice: item.unitPrice,
    unit: item.unit,
    vatApplicable: item.vatApplicable,
  })),
  exchangeLines: mode === "exchange" ? exchangeItems : [],
});
