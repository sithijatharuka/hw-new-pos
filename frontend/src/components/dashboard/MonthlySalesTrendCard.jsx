import React, { useMemo, useState } from "react";

/**
 * Monthly Sales Trend Component
 * - Line charts (no area / bar feel)
 * - Clear X/Y axis values
 * - Same logic (range filter), but visuals simplified & clarified
 */
const MonthlySalesTrendCard = ({
  trendDaily = [],
  trendMonthly = [],
  loading = false,
}) => {
  // If there is absolutely no data at all, don't render the card
  if (
    (!trendDaily || trendDaily.length === 0) &&
    (!trendMonthly || trendMonthly.length === 0)
  ) {
    return null;
  }

  const [range, setRange] = useState("30d"); // "7d" | "30d" | "month"

  // Filtered data based on selected range
  const filteredData = useMemo(() => {
    if (range === "month") return trendMonthly || [];
    const source = trendDaily || [];
    if (source.length === 0) return [];
    if (range === "7d") return source.slice(-7);
    return source.slice(-30);
  }, [range, trendDaily, trendMonthly]);

  // Helper to safely get max value
  const getMax = (arr, key) => {
    if (!arr || arr.length === 0) return 1;
    const vals = arr.map((d) => Number(d[key] || 0));
    const max = Math.max(...vals);
    return max > 0 ? max : 1;
  };

  const maxSales = getMax(filteredData, "totalSales");
  const maxInvoices = getMax(filteredData, "invoiceCount");

  // Simple line path generator
  const createLinePath = (
    data,
    maxValue,
    valueKey,
    height = 180,
    width = 800
  ) => {
    if (!data || data.length === 0) return { path: "", points: [] };

    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const stepX = chartWidth / (data.length - 1 || 1);

    const points = data.map((point, index) => {
      const x = paddingLeft + index * stepX;
      const value = Number(point[valueKey] || 0);
      const ratio = value / maxValue;
      const y =
        paddingTop + chartHeight - (isNaN(ratio) ? 0 : ratio) * chartHeight;
      return { x, y, value };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    return { path, points };
  };

  const salesLineData = createLinePath(
    filteredData,
    maxSales,
    "totalSales",
    220
  );
  const invoicesLineData = createLinePath(
    filteredData,
    maxInvoices,
    "invoiceCount",
    160
  );

  const hasDataForRange = filteredData && filteredData.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7 w-full">
      {/* Header + Range Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-1.5">
            <span className="text-xl">📈</span>
            <span>Sales Trend</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            View sales and invoice trends for the last 7 days, 30 days, or
            monthly.
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-2 rounded-xl p-1">
          <button
            onClick={() => setRange("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
              range === "7d"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            } active:scale-95`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setRange("30d")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
              range === "30d"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            } active:scale-95`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setRange("month")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
              range === "month"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            } active:scale-95`}
          >
            Monthly (12m)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
          <p className="text-xs sm:text-sm text-gray-600">
            Loading sales trend…
          </p>
        </div>
      ) : !hasDataForRange ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm sm:text-base text-gray-600">
            No data available for the selected range.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SALES LINE CHART */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-700">
                  Sales Amount
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Y-axis: LKR (sales), X-axis: date/month
                </p>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500">
                {filteredData.length} point
                {filteredData.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="-mx-2 sm:mx-0 overflow-x-auto">
              <div className="min-w-[560px]">
                <svg viewBox="0 0 800 220" className="w-full h-52">
                  {/* Y-axis & grid */}
                  {(() => {
                    const ticks = 5;
                    const paddingLeft = 50;
                    const paddingRight = 20;
                    const paddingTop = 30;
                    const paddingBottom = 30;
                    const chartHeight = 220 - paddingTop - paddingBottom;
                    const chartWidth = 800 - paddingLeft - paddingRight;

                    const lines = [];
                    for (let i = 0; i <= ticks; i++) {
                      const ratio = i / ticks;
                      const y = paddingTop + chartHeight - ratio * chartHeight;
                      const value = Math.round(maxSales * ratio);

                      lines.push(
                        <g key={i}>
                          {/* Horizontal grid line */}
                          <line
                            x1={paddingLeft}
                            y1={y}
                            x2={paddingLeft + chartWidth}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                          {/* Y-axis label */}
                          <text
                            x={paddingLeft - 8}
                            y={y + 4}
                            fontSize="10"
                            fill="#6b7280"
                            textAnchor="end"
                          >
                            {value.toLocaleString()}
                          </text>
                        </g>
                      );
                    }
                    // Y-axis line
                    lines.push(
                      <line
                        key="y-axis"
                        x1={paddingLeft}
                        y1={paddingTop}
                        x2={paddingLeft}
                        y2={paddingTop + chartHeight}
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      />
                    );
                    // X-axis line
                    lines.push(
                      <line
                        key="x-axis"
                        x1={paddingLeft}
                        y1={paddingTop + chartHeight}
                        x2={paddingLeft + chartWidth}
                        y2={paddingTop + chartHeight}
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      />
                    );
                    return lines;
                  })()}

                  {/* Sales Line */}
                  <path
                    d={salesLineData.path}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points */}
                  {salesLineData.points.map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#2563eb"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <title>
                          {filteredData[index].month}: LKR{" "}
                          {point.value.toLocaleString("en-US")}
                        </title>
                      </circle>
                    </g>
                  ))}

                  {/* X-axis labels */}
                  {(() => {
                    const paddingLeft = 50;
                    const paddingRight = 20;
                    const paddingTop = 30;
                    const paddingBottom = 30;
                    const chartWidth = 800 - paddingLeft - paddingRight;
                    const chartHeight = 220 - paddingTop - paddingBottom;

                    return filteredData.map((d, index) => {
                      const x =
                        paddingLeft +
                        (chartWidth * index) / (filteredData.length - 1 || 1);
                      // For 7d and 30d ranges, show only the date part (e.g., "15" instead of "Dec 15")
                      let label = d.month;
                      if (range === "7d" || range === "30d") {
                        // Extract just the day number from formats like "Dec 15" or "2024-12-15"
                        const parts = label.split(/[\s-]/);
                        label = parts[parts.length - 1]; // Get the last part (day)
                      }
                      return (
                        <text
                          key={index}
                          x={x}
                          y={paddingTop + chartHeight + 16}
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          {label}
                        </text>
                      );
                    });
                  })()}
                </svg>
              </div>
            </div>
          </div>

          {/* INVOICE COUNT LINE CHART */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-700">
                  Invoice Count
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Y-axis: number of invoices, X-axis: date/month
                </p>
              </div>
            </div>

            <div className="-mx-2 sm:mx-0 overflow-x-auto">
              <div className="min-w-[560px]">
                <svg viewBox="0 0 800 160" className="w-full h-40">
                  {/* Y-axis & grid */}
                  {(() => {
                    const ticks = 5;
                    const paddingLeft = 50;
                    const paddingRight = 20;
                    const paddingTop = 20;
                    const paddingBottom = 30;
                    const chartHeight = 160 - paddingTop - paddingBottom;
                    const chartWidth = 800 - paddingLeft - paddingRight;

                    const lines = [];
                    for (let i = 0; i <= ticks; i++) {
                      const ratio = i / ticks;
                      const y = paddingTop + chartHeight - ratio * chartHeight;
                      const value = Math.round(maxInvoices * ratio);

                      lines.push(
                        <g key={i}>
                          <line
                            x1={paddingLeft}
                            y1={y}
                            x2={paddingLeft + chartWidth}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                          <text
                            x={paddingLeft - 8}
                            y={y + 4}
                            fontSize="10"
                            fill="#6b7280"
                            textAnchor="end"
                          >
                            {value}
                          </text>
                        </g>
                      );
                    }
                    lines.push(
                      <line
                        key="y-axis"
                        x1={paddingLeft}
                        y1={paddingTop}
                        x2={paddingLeft}
                        y2={paddingTop + chartHeight}
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      />
                    );
                    lines.push(
                      <line
                        key="x-axis"
                        x1={paddingLeft}
                        y1={paddingTop + chartHeight}
                        x2={paddingLeft + chartWidth}
                        y2={paddingTop + chartHeight}
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      />
                    );
                    return lines;
                  })()}

                  {/* Invoices Line */}
                  <path
                    d={invoicesLineData.path}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points */}
                  {invoicesLineData.points.map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#7c3aed"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <title>
                          {filteredData[index].month}: {point.value} invoices
                        </title>
                      </circle>
                    </g>
                  ))}

                  {/* X-axis labels */}
                  {(() => {
                    const paddingLeft = 50;
                    const paddingRight = 20;
                    const paddingTop = 20;
                    const paddingBottom = 30;
                    const chartWidth = 800 - paddingLeft - paddingRight;
                    const chartHeight = 160 - paddingTop - paddingBottom;

                    return filteredData.map((d, index) => {
                      const x =
                        paddingLeft +
                        (chartWidth * index) / (filteredData.length - 1 || 1);
                      // For 7d and 30d ranges, show only the date part (e.g., "15" instead of "Dec 15")
                      let label = d.month;
                      if (range === "7d" || range === "30d") {
                        // Extract just the day number from formats like "Dec 15" or "2024-12-15"
                        const parts = label.split(/[\s-]/);
                        label = parts[parts.length - 1]; // Get the last part (day)
                      }
                      return (
                        <text
                          key={index}
                          x={x}
                          y={paddingTop + chartHeight + 16}
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          {label}
                        </text>
                      );
                    });
                  })()}
                </svg>
              </div>
            </div>
          </div>

          {/* SIMPLE DATA TABLE (kept, no extra decorations) */}
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
                      Sales (LKR)
                    </th>
                    <th className="text-right px-2 py-2.5 text-gray-600 font-medium">
                      Invoices
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2.5 text-gray-700">{row.month}</td>
                      <td className="px-2 py-2.5 text-right text-gray-900 font-semibold">
                        {row.totalSales.toLocaleString("en-US")}
                      </td>
                      <td className="px-2 py-2.5 text-right text-gray-700">
                        {row.invoiceCount}
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-2 py-4 text-center text-gray-500"
                      >
                        No data available for the selected range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySalesTrendCard;
