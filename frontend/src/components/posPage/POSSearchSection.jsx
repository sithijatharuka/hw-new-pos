import React from "react";
import { SearchBar } from "../common";

const POSSearchSection = ({
  query,
  setQuery,
  isSearching,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchResults,
  handleSelectItem,
  barcode,
  setBarcode,
  barcodeInputRef,
  handleBarcodeSearch,
  isTaxInvoice,
  setIsTaxInvoice,
  recalcLinesForVat,
}) => {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Search Items
              </label>
              <SearchBar
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, barcode, sku..."
                isSearching={isSearching}
              />
            </div>

            <div className="w-full md:w-56">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 sm:h-12 pl-4 pr-10 bg-white border-2 border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all duration-200 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                  ▼
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  // Manually clear search results if needed
                }}
                className="w-full md:w-auto h-11 sm:h-12 px-4 sm:px-6 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all duration-200 font-medium cursor-pointer whitespace-nowrap text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search Results */}
          {query && searchResults.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((item) => {
                  const onHand = Number(item?.inventory?.onHand || 0);
                  return (
                    <button
                      key={item._id}
                      type="button"
                      className="w-full px-3 sm:px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors duration-150"
                      onClick={() => handleSelectItem(null, item)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm">📦</span>
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.category || "Uncategorized"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <div className="font-semibold text-gray-900 text-sm">
                          Rs. {Number(item.sellingPrice || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stock: {onHand} {item.baseUnit}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Barcode + Invoice type */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Barcode Scanner
            </label>
            <form onSubmit={handleBarcodeSearch}>
              <div className="relative">
                <input
                  ref={barcodeInputRef}
                  className="w-full h-11 sm:h-12 pl-10 pr-24 bg-white border-2 border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan barcode here"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  📟
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
            <p className="mt-2 text-xs text-gray-500">
              Focus here and scan barcode for instant item lookup.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Invoice Type
            </label>
            <div className="flex gap-2 flex-col xs:flex-row">
              <button
                type="button"
                className={`flex-1 h-10 sm:h-11 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 ${
                  !isTaxInvoice
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                } cursor-pointer active:scale-95`}
                onClick={() => {
                  setIsTaxInvoice(false);
                  recalcLinesForVat(false);
                }}
              >
                Normal Bill
              </button>
              <button
                type="button"
                className={`flex-1 h-10 sm:h-11 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 ${
                  isTaxInvoice
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                } cursor-pointer active:scale-95`}
                onClick={() => {
                  setIsTaxInvoice(true);
                  recalcLinesForVat(true);
                }}
              >
                VAT Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSSearchSection;
