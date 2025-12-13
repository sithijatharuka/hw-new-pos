import React from "react";

/**
 * Low Stock Items Component
 * Displays items below low stock level with auto color coding
 *
 * NOTE: Logic is unchanged. Only styling and layout have been enhanced.
 */
const LowStockItemsCard = ({ items, loading = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "red":
        return "bg-red-50 border-red-200";
      case "orange":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "red":
        return "bg-red-100 text-red-800";
      case "orange":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasItems = items && items.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 sm:p-6 lg:p-7 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <span>Low Stock Critical Items</span>
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Keep an eye on critical and low-stock items before they run out.
          </p>
        </div>
        {hasItems && (
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              {items.length} item{items.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
          <p className="text-xs sm:text-sm text-gray-500">
            Checking stock levels...
          </p>
        </div>
      ) : hasItems ? (
        <div className="space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className={`border rounded-xl px-4 py-3 sm:px-5 sm:py-4 ${getStatusColor(
                item.status
              )} transform transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 cursor-default`}
            >
              {/* Item header row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base break-words">
                    {item.name}
                  </h4>
                  {item.code && (
                    <p className="text-[11px] text-gray-600 mt-0.5 break-words">
                      {item.code}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  {item.statusMessage}
                </span>
              </div>

              {/* Stock info – desktop/tablet (table-like grid) */}
              <div className="hidden sm:grid grid-cols-2 gap-3 text-xs sm:text-sm mb-2">
                <div className="pr-2 border-r border-gray-200">
                  <p className="text-[11px] text-gray-600 mb-1">
                    Current Stock
                  </p>
                  <p className="font-semibold text-gray-900">
                    {item.currentStock}
                  </p>
                </div>
                <div className="pl-2">
                  <p className="text-[11px] text-gray-600 mb-1">
                    Low Stock Level
                  </p>
                  <p className="font-semibold text-gray-900">
                    {item.lowStockLevel}
                  </p>
                </div>
              </div>

              {/* Stock info – mobile-friendly stacked layout */}
              <div className="grid grid-cols-1 gap-2 text-xs mb-2 sm:hidden">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-600">Current Stock</p>
                  <p className="font-semibold text-gray-900">
                    {item.currentStock}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-600">Low Stock Level</p>
                  <p className="font-semibold text-gray-900">
                    {item.lowStockLevel}
                  </p>
                </div>
              </div>

              {/* Stock Percentage Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.status === "red"
                        ? "bg-red-500"
                        : item.status === "orange"
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(item.stockPercentage, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] sm:text-xs text-gray-600 mt-1">
                  {item.stockPercentage}% of low stock level
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-7 sm:py-8 text-center">
          <p className="text-sm sm:text-base text-gray-500">
            ✅ All items are well stocked
          </p>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">
            No items are currently below the configured low stock levels.
          </p>
        </div>
      )}
    </div>
  );
};

export default LowStockItemsCard;
