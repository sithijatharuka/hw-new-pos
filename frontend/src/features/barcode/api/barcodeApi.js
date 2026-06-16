// All functions accept `api` (the shared axios instance from client.js)

export const getBarcodePreview = (api, itemId) =>
  api.get(`/barcode/preview/${itemId}`).then((r) => r.data);

export const saveBarcode = (api, itemId, barcode) =>
  api.patch(`/barcode/${itemId}`, { barcode }).then((r) => r.data);

export const searchItemByBarcode = (api, barcode) =>
  api.get(`/items/barcode/${encodeURIComponent(barcode)}`).then((r) => r.data);
