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
    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center">
      <div className="relative flex-1">
        <input
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          placeholder="Search suppliers..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {isSearching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            …
          </span>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      <div className="text-xs text-gray-500">
        {filteredCount} of {totalCount}
      </div>
    </div>
  );
};

export default SupplierSearchBar;
