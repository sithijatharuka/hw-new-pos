import React from "react";
import { PageHeader } from "../common";

const POSHeader = ({ isOffline, vatRate }) => {
  return (
    <PageHeader
      icon="🧾"
      title="Point of Sale Billing"
      description="Barcode scanning, VAT compliance, and real-time calculations."
      action={
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
      }
    />
  );
};

export default POSHeader;
