export const formatBarcodeLabel = (item) => {
  return {
    title: item.name,
    sku: item.sku,
    price: item.sellingPrice,
    barcode: item.barcode,
  };
};