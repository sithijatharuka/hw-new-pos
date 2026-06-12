import { useState } from "react";
import { mockBarcodeItem } from "../mock/barcodeMockData";

export default function useBarcode() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = (item = mockBarcodeItem) => {
    setSelectedItem(item);
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