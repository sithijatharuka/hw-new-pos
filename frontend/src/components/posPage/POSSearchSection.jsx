import React, { useState } from "react";
import AppLoader from "../common/AppLoader";
import CloseButton from "../common/CloseButton";
import { SearchBar } from "../common";
import { getItemBatches } from "../../api/inventory/items";
import { formatCurrency } from "../../utils/currency";

const emptyBatchModal = {
  open: false,
  item: null,
  batches: [],
  loading: false,
  error: null,
  selectedBatch: null,
};

const POSSearchSection = ({
  api,
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
  currencySymbol = "Rs.",
  currencyPosition = "before",
}) => {
  const [batchModal, setBatchModal] = useState(emptyBatchModal);

  const closeBatchModal = () => setBatchModal(emptyBatchModal);

  // Open batch modal and fetch batches
  const handleBatchItemClick = async (item) => {
    setBatchModal({
      open: true,
      item,
      batches: [],
      loading: true,
      error: null,
      selectedBatch: null,
    });

    try {
      const data = await getItemBatches(api, item._id);
      // data.batches is the array we want
      setBatchModal((prev) => ({
        ...prev,
        batches: Array.isArray(data?.batches) ? data.batches : [],
        loading: false,
      }));
    } catch (err) {
      setBatchModal((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load batches",
      }));
    }
  };

  const handleBatchSelect = (batch) => {
    setBatchModal((prev) => ({ ...prev, selectedBatch: batch }));
  };

  const handleBatchConfirm = () => {
    const selected = batchModal.selectedBatch;
    if (!selected || !batchModal.item) return;

    // Use batch.sellingPrice if set (> 0), else fallback to item.sellingPrice
    const batchPrice =
      selected.sellingPrice > 0
        ? Number(selected.sellingPrice)
        : Number(batchModal.item.sellingPrice) || 0;

    // Attach batchNumber and batchId directly for validation
    const itemWithBatch = {
      ...batchModal.item,
      selectedBatch: selected,
      batchNumber: selected.batchNumber,
      batchId: selected._id,
      sellingPrice: batchPrice,
    };

    handleSelectItem(null, itemWithBatch);
    closeBatchModal();
  };

  return (
    <div className="p-4 border-b border-gray-200 sm:p-6 bg-gradient-to-r from-gray-50 to-white">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Search */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 min-w-0">
              <label className="block mb-2 text-sm font-semibold text-gray-800">
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
              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Category
              </label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 text-sm text-gray-800 transition-all duration-200 bg-white border-2 border-gray-300 appearance-none cursor-pointer h-11 sm:h-12 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                <div className="absolute text-xs text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                  ▼
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setQuery("")}
                className="w-full px-4 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border-2 border-gray-300 cursor-pointer md:w-auto h-11 sm:h-12 sm:px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 active:scale-95 whitespace-nowrap"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search Results */}
          {query && searchResults.length > 0 && (
            <div className="overflow-hidden bg-white border-2 border-gray-200 shadow-lg rounded-xl">
              <div className="overflow-y-auto max-h-64">
                {searchResults.map((item) => {
                  const onHand = Number(item?.inventory?.onHand || 0);
                  const isBatchTracked = !!item.isBatchTracked;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      className="flex items-center justify-between w-full px-3 py-3 transition-colors duration-150 border-b border-gray-100 cursor-pointer sm:px-4 hover:bg-gray-50 last:border-b-0"
                      onClick={() =>
                        isBatchTracked
                          ? handleBatchItemClick(item)
                          : handleSelectItem(null, item)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                          <span className="text-sm">📦</span>
                        </div>

                        <div className="min-w-0 text-left">
                          <div className="text-sm font-medium text-gray-900 break-words sm:text-base">
                            {item.name}
                            {isBatchTracked && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                Batch
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.category || "Uncategorized"}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-2 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            item.sellingPrice,
                            currencySymbol,
                            currencyPosition,
                          )}
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

          {/* Batch Modal */}
          {batchModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/75 backdrop-blur-sm">
              {/* backdrop click */}
              <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 cursor-default"
                onClick={closeBatchModal}
              />

              <div className="relative z-10 w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl">
                <div className="flex items-start justify-between p-5 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Batch
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {batchModal.item?.name}
                    </p>
                  </div>
                  <CloseButton
                    onClick={closeBatchModal}
                    size="md"
                    ariaLabel="Close batch modal"
                  />
                </div>

                <div className="p-5">
                  {batchModal.loading && (
                    <div className="flex justify-center items-center py-4">
                      <AppLoader
                        open
                        variant="inline"
                        title="Loading batches"
                        subtitle="Checking batch availability"
                      />
                    </div>
                  )}

                  {batchModal.error && (
                    <div className="text-sm text-red-600">
                      {batchModal.error}
                    </div>
                  )}

                  {!batchModal.loading &&
                    !batchModal.error &&
                    batchModal.batches.length === 0 && (
                      <div className="text-sm text-gray-500">
                        No batches found for this item.
                      </div>
                    )}

                  {!batchModal.loading &&
                    !batchModal.error &&
                    batchModal.batches.length > 0 && (
                      <div className="pr-1 space-y-2 overflow-y-auto max-h-56">
                        {batchModal.batches.map((batch) => {
                          const selected =
                            batchModal.selectedBatch?._id === batch._id;
                          // Use qtyOnHand for stock, sellingPrice for price
                          const batchOnHand = Number(batch?.qtyOnHand ?? 0);
                          const disabled = batchOnHand <= 0;
                          return (
                            <label
                              key={batch._id}
                              className={[
                                "flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition",
                                selected
                                  ? "border-primary bg-primary/10"
                                  : "border-gray-200 hover:bg-gray-50",
                                disabled ? "opacity-50 cursor-not-allowed" : "",
                              ].join(" ")}
                            >
                              <input
                                type="radio"
                                name="batch"
                                value={batch._id}
                                checked={selected}
                                disabled={disabled}
                                onChange={() => handleBatchSelect(batch)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  Batch: {batch.batchNumber || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Stock: {batchOnHand}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(
                                    selected.sellingPrice > 0
                                      ? Number(selected.sellingPrice)
                                      : Number(batchModal.item?.sellingPrice) || 0,
                                    currencySymbol,
                                    currencyPosition,
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95"
                    onClick={closeBatchModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white rounded-xl bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleBatchConfirm}
                    disabled={!batchModal.selectedBatch}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barcode + Invoice type */}
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800">
              Barcode Scanner
            </label>

            <form onSubmit={handleBarcodeSearch}>
              <div className="relative">
                <input
                  ref={barcodeInputRef}
                  className="w-full pl-10 pr-24 text-sm text-gray-800 placeholder-gray-500 transition-all duration-200 bg-white border-2 border-gray-300 h-11 sm:h-12 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan barcode here"
                />
                <div className="absolute text-sm text-gray-400 -translate-y-1/2 left-3 top-1/2">
                  📟
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-accent text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-accent/90 active:scale-95 transition-all duration-200 cursor-pointer"
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
            <label className="block mb-2 text-sm font-semibold text-gray-800">
              Invoice Type
            </label>

            <div className="flex flex-col gap-2 xs:flex-row">
              <button
                type="button"
                className={[
                  "flex-1 h-10 sm:h-11 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 active:scale-95",
                  !isTaxInvoice
                    ? "bg-accent text-white border-accent shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
                ].join(" ")}
                onClick={() => {
                  setIsTaxInvoice(false);
                  recalcLinesForVat(false);
                }}
              >
                Normal Bill
              </button>

              <button
                type="button"
                className={[
                  "flex-1 h-10 sm:h-11 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 active:scale-95",
                  isTaxInvoice
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
                ].join(" ")}
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
