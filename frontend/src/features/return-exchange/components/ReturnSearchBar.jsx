import React, { useState, useRef, useEffect } from "react";

// Mock sale results for UI development
// TODO: ADD BACKEND CODE HERE — replace MOCK_RESULTS with API call to fetch sales by invoice/barcode
const MOCK_RESULTS = [
  {
    _id: "sale_001",
    invoiceNumber: "INV-2024-001",
    date: "2024-01-15",
    customerName: "John Silva",
    total: 4500.0,
    items: [
      { _id: "item_1", name: "PVC Pipe 1\"", qty: 10, unitPrice: 150, unit: "pcs" },
      { _id: "item_2", name: "Cement Bag 50kg", qty: 3, unitPrice: 1200, unit: "bag" },
    ],
  },
  {
    _id: "sale_002",
    invoiceNumber: "INV-2024-002",
    date: "2024-01-16",
    customerName: "Nimal Perera",
    total: 2800.0,
    items: [
      { _id: "item_3", name: "Steel Rod 10mm", qty: 5, unitPrice: 560, unit: "pcs" },
    ],
  },
];

const SEARCH_TYPES = [
  { value: "invoice", label: "Invoice No." },
  { value: "barcode", label: "Barcode" },
];

const ReturnSearchBar = ({ onSaleSelect }) => {
  const [searchType, setSearchType] = useState("invoice");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a search value.");
      return;
    }
    setError("");
    setIsSearching(true);
    setShowDropdown(false);

    // TODO: ADD BACKEND CODE HERE — call returnApi to search sales by invoice number or barcode
    // Simulated async search with mock data
    setTimeout(() => {
      const filtered = MOCK_RESULTS.filter((s) =>
        s.invoiceNumber.toLowerCase().includes(trimmed.toLowerCase()),
      );
      setResults(filtered);
      setShowDropdown(true);
      setIsSearching(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSelect = (sale) => {
    setQuery(sale.invoiceNumber);
    setShowDropdown(false);
    onSaleSelect?.(sale);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setError("");
    onSaleSelect?.(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Search type selector */}
        <div className="w-full sm:w-40">
          <label className="block mb-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Search By
          </label>
          <div className="relative">
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setQuery("");
                setResults([]);
                setShowDropdown(false);
                setError("");
              }}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-8 text-sm text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {SEARCH_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ▼
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="flex-1">
          <label className="block mb-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {searchType === "invoice" ? "Invoice Number" : "Barcode"}
          </label>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  searchType === "invoice"
                    ? "e.g. INV-2024-001"
                    : "Scan or enter barcode"
                }
                className={[
                  "w-full rounded-xl border pl-9 pr-9 py-2.5 text-sm text-gray-800 shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                  error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
                ].join(" ")}
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className={[
                "inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm",
                "bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {isSearching ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Searching
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {error && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-500">
              <span className="text-2xl">🔎</span>
              <p className="text-sm font-medium">No sale found</p>
              <p className="text-xs text-gray-400">
                Try a different invoice number or barcode
              </p>
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {results.map((sale) => (
                <li key={sale._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(sale)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-orange-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {sale.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.customerName} · {sale.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        Rs. {Number(sale.total).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ReturnSearchBar;
