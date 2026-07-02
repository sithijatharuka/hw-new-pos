import React, { useState } from "react";
import ReturnSearchBar from "../components/ReturnSearchBar";
import ProductDetailsCard from "../components/ProductDetailsCard";

// TODO: ADD BACKEND CODE HERE — fetch/submit return data via returnApi.js

export default function ReturnPage() {
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Return &amp; Exchange</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search a sale invoice to process a return or exchange.
          </p>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
            Find Sale
          </h2>
          <ReturnSearchBar onSaleSelect={setSelectedSale} />
        </div>

        {/* Product details */}
        <ProductDetailsCard
          sale={selectedSale}
          onReturnItemsChange={setReturnItems}
        />

        {/* Submit — only shown when items are selected */}
        {returnItems.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
              onClick={() => {
                // TODO: ADD BACKEND CODE HERE — submit returnItems to the return API
                console.log("Return items to process:", returnItems);
              }}
            >
              Process Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
