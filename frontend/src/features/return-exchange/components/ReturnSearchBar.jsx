import React, { useState, useRef, useEffect } from "react";
import { MOCK_SALES } from "../constants/returnReasons";

// TODO: ADD BACKEND CODE HERE — replace mock lookup with:
//   returnApi.findProductBySku(sku)  /  returnApi.findProductByBarcode(barcode)

const findProductInSales = (query, type) => {
  const q = query.trim().toLowerCase();
  for (const sale of MOCK_SALES) {
    for (const item of sale.items) {
      const match =
        type === "sku"
          ? item.sku.toLowerCase() === q
          : item.barcode?.toLowerCase() === q;
      if (match) return { sale, item };
    }
  }
  return null;
};

/**
 * ReturnSearchBar
 * Props:
 *   label        – section heading shown above the bar
 *   onFound      – ({ sale, item }) called on successful match
 *   onNotFound   – (query) called when no match
 *   autoFocus    – whether to focus input on mount
 */
const ReturnSearchBar = ({
  label = "Scan Barcode / Enter Product Code",
  onFound,
  onNotFound,
  autoFocus = false,
}) => {
  const [searchType, setSearchType] = useState("barcode");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const runSearch = () => {
    const q = query.trim();
    if (!q) { setError("Please enter a value."); return; }
    setError("");
    setIsSearching(true);

    // TODO: ADD BACKEND CODE HERE — await returnApi.findProduct(q, searchType)
    setTimeout(() => {
      const result = findProductInSales(q, searchType);
      setIsSearching(false);
      if (result) {
        onFound?.(result);
      } else {
        onNotFound?.(q);
      }
    }, 350);
  };

  const handleClear = () => {
    setQuery("");
    setError("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {label}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Type toggle — pill style */}
        <div className="flex rounded-xl border border-gray-200 bg-background-subtle p-1 w-fit flex-shrink-0">
          {[
            { value: "barcode", label: "📟 Barcode" },
            { value: "sku", label: "🔖 Product Code" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setSearchType(t.value);
                setQuery("");
                setError("");
                inputRef.current?.focus();
              }}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                searchType === t.value
                  ? "bg-primary text-text-inverse shadow-soft"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Input + search button */}
        <div className="flex flex-1 gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">
              {searchType === "barcode" ? "📟" : "🔍"}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (error) setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder={searchType === "barcode" ? "Scan or type barcode…" : "e.g. PVC-001"}
              className={[
                "w-full rounded-2xl border py-2.5 pl-10 pr-9 text-sm text-text-primary shadow-soft",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                error ? "border-error bg-error-subtle" : "border-gray-200 bg-background-secondary",
              ].join(" ")}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={runSearch}
            disabled={isSearching}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-text-inverse shadow-soft hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSearching ? (
              <>
                <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Searching…
              </>
            ) : "Search"}
          </button>
        </div>
      </div>

      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
};

export default ReturnSearchBar;
