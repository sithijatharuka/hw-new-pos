import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../../utils/currency";

// TODO: ADD BACKEND CODE HERE — validate returnQty against original sale qty from the API

const ProductDetailsCard = ({
  sale,
  onReturnItemsChange,
  currencySymbol = "Rs.",
  currencyPosition = "before",
}) => {
  // returnQtys: { [itemId]: number }
  const [returnQtys, setReturnQtys] = useState({});

  // Reset when sale changes
  useEffect(() => {
    if (!sale) {
      setReturnQtys({});
      return;
    }
    const initial = {};
    sale.items.forEach((item) => {
      initial[item._id] = 0;
    });
    setReturnQtys(initial);
  }, [sale]);

  // Notify parent whenever return qtys change
  useEffect(() => {
    if (!sale) return;
    const selected = sale.items
      .map((item) => ({
        ...item,
        returnQty: returnQtys[item._id] ?? 0,
      }))
      .filter((item) => item.returnQty > 0);
    onReturnItemsChange?.(selected);
  }, [returnQtys]);

  const handleQtyChange = (itemId, value, maxQty) => {
    const parsed = Math.max(0, Math.min(Number(value) || 0, maxQty));
    setReturnQtys((prev) => ({ ...prev, [itemId]: parsed }));
  };

  const refundTotal = sale
    ? sale.items.reduce((sum, item) => {
        const qty = returnQtys[item._id] ?? 0;
        return sum + qty * item.unitPrice;
      }, 0)
    : 0;

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white py-14 text-center shadow-sm">
        <span className="text-4xl">🧾</span>
        <p className="text-sm font-semibold text-gray-700">No sale selected</p>
        <p className="text-xs text-gray-400">
          Search for an invoice above to view product details
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {sale.invoiceNumber}
          </h3>
          <p className="text-xs text-gray-500">
            {sale.customerName} · {sale.date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
          </span>
          <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {formatCurrency(sale.total, currencySymbol, currencyPosition)}
          </span>
        </div>
      </div>

      {/* Items table — desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Product
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Sold Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Unit Price
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Return Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Refund
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sale.items.map((item) => {
              const rQty = returnQtys[item._id] ?? 0;
              const lineRefund = rQty * item.unitPrice;
              return (
                <tr key={item._id} className="hover:bg-orange-50/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm flex-shrink-0">
                        📦
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 font-medium">
                    {item.qty}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(item.unitPrice, currencySymbol, currencyPosition)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={item.qty}
                      value={rQty}
                      onChange={(e) =>
                        handleQtyChange(item._id, e.target.value, item.qty)
                      }
                      className={[
                        "w-20 rounded-lg border px-2 py-1.5 text-center text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                        rQty > 0
                          ? "border-accent bg-orange-50 text-gray-900 font-semibold"
                          : "border-gray-300 bg-white text-gray-700",
                      ].join(" ")}
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {rQty > 0
                      ? formatCurrency(lineRefund, currencySymbol, currencyPosition)
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Items — mobile cards */}
      <div className="block sm:hidden divide-y divide-gray-100">
        {sale.items.map((item) => {
          const rQty = returnQtys[item._id] ?? 0;
          const lineRefund = rQty * item.unitPrice;
          return (
            <div key={item._id} className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-base flex-shrink-0">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">{item.unit}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                  <p className="text-gray-500 mb-0.5">Sold</p>
                  <p className="font-semibold text-gray-800">{item.qty}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                  <p className="text-gray-500 mb-0.5">Price</p>
                  <p className="font-semibold text-gray-800">
                    {formatCurrency(item.unitPrice, currencySymbol, currencyPosition)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                  <p className="text-gray-500 mb-1">Return Qty</p>
                  <input
                    type="number"
                    min={0}
                    max={item.qty}
                    value={rQty}
                    onChange={(e) =>
                      handleQtyChange(item._id, e.target.value, item.qty)
                    }
                    className={[
                      "w-full rounded-lg border px-1 py-1 text-center text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                      rQty > 0
                        ? "border-accent bg-orange-50 font-semibold"
                        : "border-gray-300 bg-white",
                    ].join(" ")}
                  />
                </div>
              </div>
              {rQty > 0 && (
                <p className="text-right text-xs font-semibold text-gray-700">
                  Refund:{" "}
                  <span className="text-green-700">
                    {formatCurrency(lineRefund, currencySymbol, currencyPosition)}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer — refund total */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-4">
        <p className="text-sm font-semibold text-gray-700">Total Refund</p>
        <p
          className={[
            "text-base font-bold",
            refundTotal > 0 ? "text-green-700" : "text-gray-400",
          ].join(" ")}
        >
          {formatCurrency(refundTotal, currencySymbol, currencyPosition)}
        </p>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
