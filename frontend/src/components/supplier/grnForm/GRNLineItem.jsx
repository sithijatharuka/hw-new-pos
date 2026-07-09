import React from "react";
import { formatCurrency } from "../../../utils/currency";

const GRNLineItem = ({
  line,
  lineIndex,
  items,
  errors,
  fieldsDisabled,
  itemById,
  lineTotal,
  onLineChange,
  onAddProduct,
  onRemoveLine,
  linesLength,
  currencySymbol = "",
  currencyPosition = "before",
}) => {
  const it = line.item ? itemById.get(String(line.item)) : null;
  const isBatchTracked = Boolean(it?.isBatchTracked);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-600">{lineIndex + 1}</td>

      <td className="px-4 py-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <select
              name="item"
              value={line.item}
              onChange={(e) => onLineChange(lineIndex, e)}
              disabled={fieldsDisabled}
              className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors[`line_${lineIndex}_item`]
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              <option value="">-- Select Item --</option>
              {items
                .filter((x) => x.isActive !== false)
                .map((it) => (
                  <option key={it._id} value={it._id}>
                    {it.name} ({it.sku})
                  </option>
                ))}
            </select>
            {errors[`line_${lineIndex}_item`] && (
              <p className="mt-1 text-xs text-red-600">
                {errors[`line_${lineIndex}_item`]}
              </p>
            )}

            {it?.isBatchTracked && (
              <p className="text-[11px] text-gray-500 mt-1">
                Batch tracked (batch number required)
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onAddProduct(lineIndex)}
            disabled={fieldsDisabled}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/15"
            title="Add new item"
          >
            + New
          </button>
        </div>
      </td>

      <td className="px-4 py-3">
        <input
          type="text"
          name="batchNumber"
          value={line.batchNumber}
          onChange={(e) => onLineChange(lineIndex, e)}
          disabled={!isBatchTracked || fieldsDisabled}
          className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors[`line_${lineIndex}_batchNumber`]
              ? "border-red-300 bg-red-50"
              : "border-gray-200"
          } ${!isBatchTracked ? "bg-gray-50 cursor-not-allowed" : ""}`}
          placeholder={isBatchTracked ? "Batch" : "N/A"}
        />
        {errors[`line_${lineIndex}_batchNumber`] && (
          <p className="mt-1 text-xs text-red-600">
            {errors[`line_${lineIndex}_batchNumber`]}
          </p>
        )}
      </td>

      <td className="px-4 py-3">
        <input
          type="number"
          name="qty"
          min="0"
          step="0.01"
          value={line.qty}
          onChange={(e) => onLineChange(lineIndex, e)}
          onWheel={(e) => e.target.blur()}
          disabled={fieldsDisabled}
          className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors[`line_${lineIndex}_qty`]
              ? "border-red-300 bg-red-50"
              : "border-gray-200"
          }`}
          placeholder="0"
        />
        {errors[`line_${lineIndex}_qty`] && (
          <p className="mt-1 text-xs text-red-600">
            {errors[`line_${lineIndex}_qty`]}
          </p>
        )}
      </td>

      <td className="px-4 py-3">
        <input
          type="number"
          name="unitCost"
          min="0"
          step="0.01"
          value={line.unitCost}
          onChange={(e) => onLineChange(lineIndex, e)}
          onWheel={(e) => e.target.blur()}
          disabled={fieldsDisabled}
          className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors[`line_${lineIndex}_unitCost`]
              ? "border-red-300 bg-red-50"
              : "border-gray-200"
          }`}
          placeholder="0.00"
        />
        {errors[`line_${lineIndex}_unitCost`] && (
          <p className="mt-1 text-xs text-red-600">
            {errors[`line_${lineIndex}_unitCost`]}
          </p>
        )}
      </td>

      <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">
        {formatCurrency(lineTotal(line), currencySymbol, currencyPosition)}
      </td>

      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onRemoveLine(lineIndex)}
          disabled={linesLength === 1 || fieldsDisabled}
          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default GRNLineItem;
