import React, { useEffect, useRef, useState } from "react";
import AppLoader from "../components/common/AppLoader";
import { useParams } from "react-router-dom";
import Barcode from "react-barcode";
import { getItem } from "../api/inventory/items";
import { loadCurrencySettings } from "../api/settings/settings";
import { formatCurrency } from "../utils/currency";

const SIZES = [
  { label: "Small (40 × 25 mm)", w: 40, h: 25 },
  { label: "Medium (50 × 30 mm)", w: 50, h: 30 },
  { label: "Large (60 × 40 mm)", w: 60, h: 40 },
];

const MM_TO_PX = 3.7795275591; // 1mm @ 96dpi

const BarcodePrintPage = ({ api }) => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");
  const [currencyPosition, setCurrencyPosition] = useState("before");
  const [sizeIdx, setSizeIdx] = useState(0); // 0-2 = predefined, 3 = custom
  const [custom, setCustom] = useState({ w: 50, h: 30 });
  const barcodeRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [data, cs] = await Promise.all([
        getItem(api, id),
        loadCurrencySettings(api),
      ]);
      setItem(data);
      setCurrencySymbol(cs.currencySymbol);
      setCurrencyPosition(cs.currencyPosition);
    };
    load();
  }, [api, id]);

  if (!item) {
    return (
      <div className="flex justify-center items-center py-6">
        <AppLoader
          open
          variant="inline"
          title="Loading barcode"
          subtitle="Preparing barcode preview"
        />
      </div>
    );
  }

  const isCustom = sizeIdx === 3;
  const selected = isCustom ? custom : SIZES[sizeIdx];
  const pxW = Math.round(selected.w * MM_TO_PX);
  const pxH = Math.round(selected.h * MM_TO_PX);

  const barcodeValue = String(item.barcode || item.sku || item._id);
  const priceLabel = `${formatCurrency(item.sellingPrice, currencySymbol, currencyPosition)} / ${item.baseUnit}`;

  const handleDownload = () => {
    const svgEl = barcodeRef.current?.querySelector("svg");
    if (!svgEl) return;

    const canvas = document.createElement("canvas");
    canvas.width = pxW;
    canvas.height = pxH;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pxW, pxH);

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      // Center the barcode svg inside the canvas
      const scale = Math.min(pxW / img.width, pxH / img.height) * 0.9;
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (pxW - dw) / 2;
      const dy = (pxH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `barcode-${barcodeValue}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center py-10 px-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm space-y-6">
        <h1 className="text-lg font-semibold text-gray-800 text-center">Barcode Preview</h1>

        {/* Live preview */}
        <div
          ref={barcodeRef}
          className="flex flex-col items-center border border-dashed border-gray-300 rounded-xl p-3 bg-white"
          style={{ width: pxW, maxWidth: "100%", margin: "0 auto" }}
        >
          <p className="text-[11px] font-semibold text-gray-800 truncate w-full text-center mb-1">
            {item.name}
          </p>
          <p className="text-[10px] text-gray-500 mb-1">{priceLabel}</p>
          <Barcode value={barcodeValue} height={40} width={1.2} fontSize={10} displayValue />
        </div>

        {/* Size selector */}
        {/* <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Label Size</p>
          <div className="grid grid-cols-1 gap-2">
            {SIZES.map((s, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="size"
                  checked={sizeIdx === i}
                  onChange={() => setSizeIdx(i)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">{s.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="size"
                checked={sizeIdx === 3}
                onChange={() => setSizeIdx(3)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">Custom</span>
            </label>
          </div>

          {isCustom && (
            <div className="flex gap-3 mt-2">
              <label className="flex-1 space-y-1">
                <span className="text-xs text-gray-600">Width (mm)</span>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={custom.w}
                  onChange={(e) => setCustom((p) => ({ ...p, w: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="flex-1 space-y-1">
                <span className="text-xs text-gray-600">Height (mm)</span>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={custom.h}
                  onChange={(e) => setCustom((p) => ({ ...p, h: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>
          )}
        </div> */}

        {/* Download */}
        {/* <button
          onClick={handleDownload}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          ⬇️ Download PNG
        </button> */}
      </div>
    </div>
  );
};

export default BarcodePrintPage;
