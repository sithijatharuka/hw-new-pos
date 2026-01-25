// Empty line template
export const emptyLine = () => ({
  item: null,
  itemId: "",
  name: "",
  qty: 1,
  unit: "",
  unitPrice: 0,
  discount: 0,
  taxAmount: 0,
  lineTotal: 0,
});

// Empty payment template
export const emptyPayment = () => ({
  method: "cash",
  amount: "",
});

// Validate a single line item
export const validateLine = (line) => {
  const errors = {};
  const hasContent =
    line.item ||
    line.name?.trim() ||
    line.qty ||
    line.unit ||
    line.unitPrice ||
    line.discount;

  if (!hasContent) return errors;

  const name = (line.name || "").trim();
  if (!name) errors.name = "Item name is required.";

  const qty = Number(line.qty);
  if (Number.isNaN(qty) || qty <= 0)
    errors.qty = "Quantity must be greater than 0.";

  const unit = (line.unit || "").trim();
  if (!unit) errors.unit = "Unit is required.";

  const price = Number(line.unitPrice);
  if (Number.isNaN(price) || price < 0)
    errors.unitPrice = "Unit price must be a non-negative number.";

  const disc = Number(line.discount);
  if (Number.isNaN(disc) || disc < 0 || disc > 100)
    errors.discount = "Discount must be between 0 and 100.";

  // Batch-tracked item: require batch selection
  if (line.item && line.item.isBatchTracked) {
    if (
      !line.batchNumber &&
      !line.batchId &&
      !(
        line.selectedBatch &&
        (line.selectedBatch.batchNumber || line.selectedBatch._id)
      )
    ) {
      errors.batch = `Batch number required for "${line.name}"`;
    }
  }

  return errors;
};

// Validate a payment entry
export const validatePayment = (payment) => {
  const errors = {};
  if (!payment.method) errors.method = "Payment method is required.";
  const amountNum = Number(payment.amount);
  if (Number.isNaN(amountNum) || amountNum < 0)
    errors.amount = "Amount must be 0 or greater.";
  return errors;
};

// Recalculate a single line (qty, price, discount, tax, total)
export const recalcLine = (line, vatRate, isTaxInvoice) => {
  const qty = Number(line.qty) || 0;
  const price = Number(line.unitPrice) || 0;
  const discPercent = Number(line.discount) || 0;

  const baseBeforeDisc = qty * price;
  const discAmount = baseBeforeDisc * (discPercent / 100);
  const base = baseBeforeDisc - discAmount;

  const taxable = !!(line.item && line.item.taxApplicable);
  const tax = isTaxInvoice && taxable ? base * vatRate : 0;

  return { ...line, taxAmount: tax, lineTotal: base + tax };
};
