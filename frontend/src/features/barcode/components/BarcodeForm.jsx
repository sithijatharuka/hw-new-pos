import { useState } from "react";
import {
  BARCODE_TYPES,
  LABEL_SIZES,
} from "../constants/barcodeConstants";

export default function BarcodeForm({
  formData,
  setFormData,
}) {
  return (
    <div className="p-4 border rounded">

      <h3 className="font-bold mb-3">
        Barcode Setup
      </h3>

      {/* Barcode Type */}
      <select
        value={formData.barcodeType}
        onChange={(e) =>
          setFormData({
            ...formData,
            barcodeType: e.target.value,
          })
        }
      >
        {BARCODE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Barcode Input */}
      <input
        className="mt-2 border p-2 w-full"
        placeholder="Scan or Enter Barcode"
        value={formData.barcode}
        onChange={(e) =>
          setFormData({
            ...formData,
            barcode: e.target.value,
          })
        }
      />

      {/* Label Size */}
      <select
        className="mt-2"
        value={formData.labelSize}
        onChange={(e) =>
          setFormData({
            ...formData,
            labelSize: e.target.value,
          })
        }
      >
        {LABEL_SIZES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}