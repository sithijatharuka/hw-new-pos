import { useState } from "react";
import { mockBarcodeItem } from "../mock/barcodeMockData";

export default function useBarcode() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Pass a real item object; falls back to mock only when nothing is provided
  const openPreview = (item) => {
    setSelectedItem(item?.barcode ? item : mockBarcodeItem);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedItem(null);
  };

  return {
    selectedItem,
    previewOpen,
    openPreview,
    closePreview,
  };
}