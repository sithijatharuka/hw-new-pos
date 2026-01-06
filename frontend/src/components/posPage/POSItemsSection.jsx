import React from "react";
import EntityCardList from "../common/EntityCardList";

const POSItemsSection = ({
  lines,
  lineErrors,
  updateLine,
  deleteLine,
  addEmptyLineIfNeeded,
}) => {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Items List
        </h3>
        <button
          type="button"
          onClick={addEmptyLineIfNeeded}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:scale-95 transition-all duration-200 font-medium cursor-pointer text-sm self-start sm:self-auto"
        >
          + Add Row
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-3 sm:px-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Item
                </th>
                <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Qty
                </th>
                <th className="py-3 px-3 sm:px-4 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Unit
                </th>
                <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Disc %
                </th>
                <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  VAT
                </th>
                <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="py-3 px-3 sm:px-4 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lines.map((line, idx) => {
                const err = lineErrors[idx] || {};
                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-3 sm:px-4 align-top min-w-[180px]">
                      <div
                        className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border transition-all break-words ${
                          err.name
                            ? "border-red-300 bg-red-50 text-red-900"
                            : "border-gray-200 bg-gray-50 text-gray-900"
                        }`}
                      >
                        <span
                          className={line.name ? "" : "text-gray-400 text-xs"}
                        >
                          {line.name || "Select item from search or barcode"}
                        </span>
                      </div>
                      {err.name && (
                        <p className="mt-1 text-[10px] sm:text-xs text-red-600">
                          {err.name}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 sm:px-4 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`w-20 sm:w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                          err.qty
                            ? "border-red-300 bg-red-50 text-red-900"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        value={line.qty}
                        onChange={(e) =>
                          updateLine(idx, { qty: e.target.value })
                        }
                      />
                      {err.qty && (
                        <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                          {err.qty}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 sm:px-4 align-top">
                      <input
                        className={`w-20 sm:w-full px-3 py-2 text-xs sm:text-sm text-center rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                          err.unit
                            ? "border-red-300 bg-red-50 text-red-900"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        value={line.unit}
                        onChange={(e) =>
                          updateLine(idx, { unit: e.target.value })
                        }
                        placeholder="unit"
                      />
                      {err.unit && (
                        <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-center">
                          {err.unit}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 sm:px-4 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`w-24 sm:w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                          err.unitPrice
                            ? "border-red-300 bg-red-50 text-red-900"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        value={line.unitPrice}
                        onChange={(e) =>
                          updateLine(idx, { unitPrice: e.target.value })
                        }
                      />
                      {err.unitPrice && (
                        <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                          {err.unitPrice}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 sm:px-4 align-top">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className={`w-20 sm:w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                          err.discount
                            ? "border-red-300 bg-red-50 text-red-900"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        value={line.discount}
                        onChange={(e) =>
                          updateLine(idx, { discount: e.target.value })
                        }
                      />
                      {err.discount && (
                        <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                          {err.discount}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm text-gray-700 font-medium align-top whitespace-nowrap">
                      {Number(line.taxAmount || 0).toFixed(2)}
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm text-gray-900 font-bold align-top whitespace-nowrap">
                      {Number(line.lineTotal || 0).toFixed(2)}
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-center align-top">
                      {line.item && (
                        <button
                          type="button"
                          onClick={() => deleteLine(idx)}
                          className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete line"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="block lg:hidden">
        <EntityCardList
          items={lines}
          renderCard={(line, idx) => {
            const err = lineErrors[idx] || {};
            return (
              <div className="border border-gray-200 rounded-xl bg-gray-50 p-3 sm:p-4 space-y-3">
                <div>
                  <div
                    className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border transition-all break-words ${
                      err.name
                        ? "border-red-300 bg-red-50 text-red-900"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <span className={line.name ? "" : "text-gray-400 text-xs"}>
                      {line.name || "Select item from search or barcode"}
                    </span>
                  </div>
                  {err.name && (
                    <p className="mt-1 text-[10px] sm:text-xs text-red-600">
                      {err.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        err.qty
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                      value={line.qty}
                      onChange={(e) => updateLine(idx, { qty: e.target.value })}
                    />
                    {err.qty && (
                      <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                        {err.qty}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Unit
                    </label>
                    <input
                      className={`w-full px-3 py-2 text-xs sm:text-sm text-center rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        err.unit
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                      value={line.unit}
                      onChange={(e) =>
                        updateLine(idx, { unit: e.target.value })
                      }
                      placeholder="unit"
                    />
                    {err.unit && (
                      <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-center">
                        {err.unit}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        err.unitPrice
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                      value={line.unitPrice}
                      onChange={(e) =>
                        updateLine(idx, { unitPrice: e.target.value })
                      }
                    />
                    {err.unitPrice && (
                      <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                        {err.unitPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Disc %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        err.discount
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                      value={line.discount}
                      onChange={(e) =>
                        updateLine(idx, { discount: e.target.value })
                      }
                    />
                    {err.discount && (
                      <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                        {err.discount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs sm:text-sm text-gray-600">
                    <div>
                      VAT:{" "}
                      <span className="font-medium text-gray-800">
                        {Number(line.taxAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      Total:{" "}
                      <span className="font-bold text-gray-900">
                        {Number(line.lineTotal || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {line.item && (
                    <button
                      type="button"
                      onClick={() => deleteLine(idx)}
                      className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete line"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          }}
          emptyState={
            <div className="flex flex-col items-center justify-center space-y-3 text-center py-8 text-gray-400">
              <p className="text-sm">
                No items added yet. Start by adding items above.
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default POSItemsSection;
