import React from "react";

const CustomerTableRow = ({
  customer,
  onDetails,
  onEdit,
  onDelete,
  onPayment,
}) => {
  const c = customer;
  const creditLimit = Number(c.creditLimit || 0);
  const currentBalance = Number(c.currentBalance || 0);
  const ratio = creditLimit > 0 ? currentBalance / creditLimit : 0;

  return (
    <tr
      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
      onClick={() => onDetails(c)}
    >
      {/* Customer Details */}
      <td className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              currentBalance > 0
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            <span className="text-lg">{currentBalance > 0 ? "💳" : "✅"}</span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="truncate max-w-[160px] sm:max-w-xs md:max-w-none">
                {c.name}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  c.type === "cash"
                    ? "bg-yellow-100 text-yellow-800"
                    : c.type === "credit"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {c.type === "cash"
                  ? "Cash Only"
                  : c.type === "credit"
                  ? "Credit Only"
                  : "Cash & Credit"}
              </span>
            </div>
            {c.address && (
              <p className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                📍 {c.address}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          {c.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>📞</span>
              <span className="break-all">{c.phone}</span>
            </div>
          )}
          {c.nic && <div className="text-xs text-gray-500">NIC: {c.nic}</div>}
        </div>
      </td>

      {/* Credit Information */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-600">Credit Limit:</span>
            <span className="font-medium text-gray-900">
              Rs. {creditLimit.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-600">Outstanding:</span>
            <span
              className={`font-bold ${
                currentBalance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              Rs. {currentBalance.toFixed(2)}
            </span>
          </div>
          {creditLimit > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  ratio > 0.8
                    ? "bg-red-500"
                    : ratio > 0.5
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(ratio * 100, 100)}%`,
                }}
              ></div>
            </div>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 flex-wrap">
          {currentBalance > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPayment(c);
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-md active:scale-95 transition-all duration-200 font-medium cursor-pointer"
            >
              💳 Pay
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(c);
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg hover:shadow-md active:scale-95 transition-all duration-200 font-medium cursor-pointer"
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(c);
            }}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg hover:shadow-md active:scale-95 transition-all duration-200 font-medium cursor-pointer"
            title="Delete customer"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerTableRow;
