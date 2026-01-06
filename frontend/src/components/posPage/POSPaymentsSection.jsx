import React from "react";

const POSPaymentsSection = ({
  payments,
  paymentErrors,
  updatePayment,
  addPaymentRow,
  deletePaymentRow,
  totalPayments,
  grandTotal,
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Payments
        </h3>
        <button
          type="button"
          onClick={addPaymentRow}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 font-medium cursor-pointer text-sm self-stretch sm:self-auto"
        >
          + Add Payment
        </button>
      </div>

      <div className="space-y-4">
        {payments.map((p, idx) => {
          const err = paymentErrors[idx] || {};
          const paymentsSoFar = payments
            .slice(0, idx)
            .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
          const balance = grandTotal - paymentsSoFar - (Number(p.amount) || 0);

          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Method
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      err.method
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    value={p.method}
                    onChange={(e) =>
                      updatePayment(idx, { method: e.target.value })
                    }
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="bank">🏦 Bank Transfer</option>
                  </select>
                  {err.method && (
                    <p className="mt-1 text-xs text-red-600">{err.method}</p>
                  )}
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      err.amount
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    value={p.amount}
                    onChange={(e) =>
                      updatePayment(idx, {
                        amount: Number(e.target.value || 0),
                      })
                    }
                    placeholder="0.00"
                  />
                  {err.amount && (
                    <p className="mt-1 text-xs text-red-600 text-right">
                      {err.amount}
                    </p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <div
                    className={`px-3 py-2 border rounded-lg text-right font-medium text-xs sm:text-sm ${
                      balance < 0
                        ? "bg-red-50 border-red-200 text-red-700"
                        : balance === 0
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}
                  >
                    {balance.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-gray-500 text-right mt-1">
                    Balance
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-end">
                  {payments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deletePaymentRow(idx)}
                      className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove payment"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700 text-sm">
              Total Payments
            </span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Rs. {totalPayments.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPaymentsSection;
