import React from "react";
import { formatCurrency } from "../../../utils/currency";

const TrendDataTable = ({
  data,
  currencySymbol = "Rs.",
  currencyPosition = "before",
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
      <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-3">
        Trend Details
      </h4>
      <div className="overflow-x-auto text-xs sm:text-sm">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-2 py-2.5 text-gray-600 font-medium">
                Period
              </th>
              <th className="text-right px-2 py-2.5 text-gray-600 font-medium">
                Sales ({currencySymbol})
              </th>
              <th className="text-right px-2 py-2.5 text-gray-600 font-medium">
                Invoices
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-2 py-2.5 text-gray-700">{row.month}</td>
                <td className="px-2 py-2.5 text-right text-gray-900 font-semibold">
                  {formatCurrency(
                    row.totalSales,
                    currencySymbol,
                    currencyPosition,
                  )}
                </td>
                <td className="px-2 py-2.5 text-right text-gray-700">
                  {row.invoiceCount}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-2 py-4 text-center text-gray-500">
                  No data available for the selected range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrendDataTable;
