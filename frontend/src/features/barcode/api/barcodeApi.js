import axios from "../../../api/axios";

// Get barcode preview (real backend later)
export const getBarcodePreview = (itemId) => {
  return axios.get(`/barcode/preview/${itemId}`);
};

// Download PDF
export const downloadBarcodePDF = (itemId) => {
  return axios.get(`/barcode/download/pdf/${itemId}`);
};

// Download PNG
export const downloadBarcodePNG = (itemId) => {
  return axios.get(`/barcode/download/png/${itemId}`);
};

// Search item by barcode (POS)
export const getItemByBarcode = (barcode) => {
  return axios.get(`/items/barcode/${barcode}`);
};