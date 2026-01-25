// SupplierSearchBar.jsx
import React from "react";

const SupplierSearchBar = ({
  query,
  onQueryChange,
  isSearching,
  onRefresh,
  loading,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 border-b border-border-light bg-background-secondary sm:p-6 md:flex-row md:items-center">
      <div className="relative flex-1">
        <input
          className={[
            "w-full rounded-2xl px-4 py-3 text-sm",
            "bg-background-secondary text-text-primary placeholder:text-text-tertiary",
            "border border-border-light shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-focus/20 focus:border-primary",
            "transition-all duration-200 ease-out hover:shadow-md",
          ].join(" ")}
          placeholder="Search suppliers..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />

        {isSearching && (
          <span className="absolute -translate-y-1/2 right-4 top-1/2 text-text-tertiary">
            …
          </span>
        )}
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className={[
          "inline-flex items-center justify-center",
          "rounded-2xl px-4 py-3 text-sm font-semibold",
          "border border-border-light bg-background-secondary text-text-secondary",
          "shadow-sm transition-all duration-200 ease-out",
          "hover:bg-background-subtle hover:shadow-md",
          "active:scale-[0.99]",
          "focus:outline-none focus:ring-2 focus:ring-focus/20",
          "disabled:opacity-70 disabled:cursor-not-allowed",
          "cursor-pointer",
        ].join(" ")}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>

      <div className="text-xs font-medium text-text-tertiary md:text-right">
        {filteredCount} of {totalCount}
      </div>
    </div>
  );
};

export default SupplierSearchBar;
