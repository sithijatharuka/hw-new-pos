import { useState } from "react";
import { BARCODE_TYPES } from "../constants/barcodeConstants";

// Generates a simple numeric barcode value from a name/value string (UI only)
// TODO: implement backend code here for barcode persistence
const generateBarcodeValue = (input) => {
  const base = input.trim().toUpperCase().replace(/\s+/g, "-");
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `${base}-${suffix}`;
};

const BARCODE_IMG_URL = (value) =>
  `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(value)}&code=Code128&dpi=96`;

export default function BarcodeForm({ formData, setFormData }) {
  const [generateInput, setGenerateInput] = useState("");
  const [scanInput, setScanInput] = useState(formData.barcode || "");
  const [previewValue, setPreviewValue] = useState(formData.barcode || "");

  const isCompany = formData.barcodeType === "COMPANY";
  const isGenerate = formData.barcodeType === "GENERATE";

  const handleTypeChange = (val) => {
    setPreviewValue("");
    setScanInput("");
    setGenerateInput("");
    setFormData({ ...formData, barcodeType: val, barcode: "" });
  };

  // Company path: user types / scans → confirm on blur or Enter
  const commitScan = (val) => {
    const trimmed = val.trim();
    setPreviewValue(trimmed);
    setFormData({ ...formData, barcode: trimmed });
  };

  // Generate path: derive a barcode value from the name input
  const handleGenerate = () => {
    if (!generateInput.trim()) return;
    const generated = generateBarcodeValue(generateInput);
    setPreviewValue(generated);
    setFormData({ ...formData, barcode: generated });
  };

  const barcodeTypeLabel =
    BARCODE_TYPES.find((t) => t.value === formData.barcodeType)?.label ?? "";

  return (
    <div className="border-t border-gray-200 pt-6 space-y-5">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
        Barcode Setup
      </h3>

      {/* Step 1 – Type selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Barcode Type
        </label>
        <div className="flex flex-wrap gap-3">
          {BARCODE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTypeChange(t.value)}
              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                formData.barcodeType === t.value
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 – Company / Existing path */}
      {isCompany && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Enter Barcode
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
              placeholder="Type or scan barcode value"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onBlur={(e) => commitScan(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitScan(scanInput)}
            />
            {/* TODO: implement backend code here – wire physical scanner input / camera scan */}
            <button
              type="button"
              onClick={() => commitScan(scanInput)}
              className="px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
            >
              📷 Scan Barcode
            </button>
          </div>
        </div>
      )}

      {/* Step 2 – Generate path */}
      {isGenerate && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Enter Barcode Name / Value
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
              placeholder="e.g., HP-INK-001"
              value={generateInput}
              onChange={(e) => setGenerateInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: "#1F3A5F" }}
            >
              Generate Barcode
            </button>
          </div>
        </div>
      )}

      {/* Step 3 – Preview card (shown after a value is committed) */}
      {previewValue && (
        <>
          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Barcode Type
                </p>
                <p className="mt-0.5 font-medium text-gray-900">
                  {barcodeTypeLabel}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Barcode Number
                </p>
                <p className="mt-0.5 font-medium text-gray-900 break-all">
                  {previewValue}
                </p>
              </div>
            </div>

            {/* Barcode image */}
            <div className="flex flex-col items-center py-3 bg-white rounded-lg border border-gray-200">
              <img
                src={BARCODE_IMG_URL(previewValue)}
                alt="barcode preview"
                className="h-16 object-contain"
              />
              <p className="mt-2 text-xs text-gray-500 tracking-widest font-mono">
                {previewValue}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
