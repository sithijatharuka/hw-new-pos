import React from "react";

const POSHeader = ({ isOffline, vatRate }) => {
  return (
    <div className="max-w-7xl mx-auto mb-8 px-2 sm:px-0">
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🧾</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            Point of Sale Billing
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl text-xs sm:text-sm md:text-base px-2">
          Barcode scanning, VAT compliance, and real-time calculations.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              isOffline
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            {isOffline ? "🔴 Offline Mode" : "🟢 Online Mode"}
          </div>
          <div className="px-4 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
            VAT: {(vatRate * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSHeader;
