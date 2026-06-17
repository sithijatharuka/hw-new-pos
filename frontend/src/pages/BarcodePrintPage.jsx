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

const MM_TO_PX = 3.7795275591; // 1 mm @ 96 dpi

const BarcodePrintPage = ({ api }) => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");
  const [currencyPosition, setCurrencyPosition] = useState("before");
  const [sizeIdx, setSizeIdx] = useState(1); // default: Medium
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

  // ── Barcode field ONLY — no SKU / _id fallback ──
  const barcodeValue = item.barcode?.trim() || "";
  const hasBarcode = barcodeValue.length > 0;

  const isCustom = sizeIdx === 3;
  const selected = isCustom ? custom : SIZES[sizeIdx];
  const pxW = Math.round(selected.w * MM_TO_PX);
  const pxH = Math.round(selected.h * MM_TO_PX);

  const priceLabel = formatCurrency(
    item.sellingPrice,
    currencySymbol,
    currencyPosition,
  );

  /**
   * Build the PNG entirely on canvas so the downloaded image always contains:
   *  1. Item Name   (top)
   *  2. Barcode SVG (middle)
   *  3. Barcode Number (below barcode, explicit — react-barcode may omit it at small sizes)
   *  4. Selling Price  (bottom)
   */
  const handleDownload = () => {
    if (!hasBarcode) return;

    const svgEl = barcodeRef.current?.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const svgImg = new Image();

    svgImg.onload = () => {
      const PADDING = 8;
      const TEXT_LINE = 14; // px per text row
      const BARCODE_H = Math.round(pxH * 0.45); // ~45% of label height for the barcode image

      const canvas = document.createElement("canvas");
      canvas.width = pxW;
      canvas.height = pxH;
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pxW, pxH);

      // ── 1. Item Name ──
      ctx.fillStyle = "#111111";
      ctx.font = `bold ${TEXT_LINE - 2}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const nameY = PADDING;
      ctx.fillText(item.name, pxW / 2, nameY, pxW - PADDING * 2);

      // ── 2. Barcode SVG image ──
      const barcodeY = nameY + TEXT_LINE + 2;
      const barcodeDrawW = pxW - PADDING * 2;
      const scale = Math.min(barcodeDrawW / svgImg.width, BARCODE_H / svgImg.height);
      const dw = svgImg.width * scale;
      const dh = svgImg.height * scale;
      const dx = (pxW - dw) / 2;
      ctx.drawImage(svgImg, dx, barcodeY, dw, dh);
      URL.revokeObjectURL(svgUrl);

      // ── 3. Barcode Number ──
      const numY = barcodeY + dh + 2;
      ctx.font = `${TEXT_LINE - 3}px monospace`;
      ctx.fillStyle = "#333333";
      ctx.fillText(barcodeValue, pxW / 2, numY, pxW - PADDING * 2);

      // ── 4. Selling Price ──
      const priceY = numY + TEXT_LINE;
      ctx.font = `bold ${TEXT_LINE - 1}px sans-serif`;
      ctx.fillStyle = "#1d4ed8";
      ctx.fillText(priceLabel, pxW / 2, priceY, pxW - PADDING * 2);

      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `barcode-${barcodeValue}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
    };

    svgImg.src = svgUrl;
  };

  return (
    <div className="flex flex-col items-center py-10 px-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm space-y-6">
        <h1 className="text-lg font-semibold text-gray-800 text-center">
          Barcode Preview
        </h1>

        {/* ── Preview area ── */}
        {hasBarcode ? (
          <div
            ref={barcodeRef}
            className="flex flex-col items-center border border-dashed border-gray-300 rounded-xl p-3 bg-white"
            style={{ width: pxW, maxWidth: "100%", margin: "0 auto" }}
          >
            <p className="text-[11px] font-semibold text-gray-800 truncate w-full text-center mb-1">
              {item.name}
            </p>
            <Barcode
              value={barcodeValue}
              height={38}
              width={1.2}
              fontSize={9}
              displayValue={false}
            />
            <p className="text-[9px] font-mono text-gray-600 mt-0.5">
              {barcodeValue}
            </p>
            <p className="text-[10px] font-semibold text-blue-700 mt-0.5">
              {priceLabel}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-red-200 rounded-xl p-6 bg-red-50 text-center gap-2">
            <span className="text-3xl">🚫</span>
            <p className="text-sm font-semibold text-red-600">
              Barcode not available
            </p>
            <p className="text-xs text-red-400">
              This item does not have a barcode assigned. Please add a barcode
              in Inventory before printing.
            </p>
          </div>
        )}

        {/* ── Size selector (only shown when barcode exists) ── */}
        {hasBarcode && (
          <div className="space-y-2">
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
                  checked={isCustom}
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
                    onChange={(e) =>
                      setCustom((p) => ({ ...p, w: Number(e.target.value) }))
                    }
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
                    onChange={(e) =>
                      setCustom((p) => ({ ...p, h: Number(e.target.value) }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* ── Download button ── */}
        <button
          onClick={handleDownload}
          disabled={!hasBarcode}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          ⬇️ Download PNG
        </button>
      </div>
    </div>
  );
};

export default BarcodePrintPage;
