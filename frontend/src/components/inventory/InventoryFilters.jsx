import React from "react";
import { SearchBar } from "../common";

const InventoryFilters = ({
  q,
  setQ,
  isSearching,
  filterCategory,
  setFilterCategory,
  tableCategories,
  onSearch,
  onClear,
}) => {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, barcode, brand, category..."
            isSearching={isSearching}
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              className="h-10 px-4 bg-white border-2 border-gray-300 rounded-xl"
              onClick={onSearch}
            >
              Search
            </button>
            <button
              className="h-10 px-4 bg-white border-2 border-gray-300 rounded-xl"
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="w-full md:w-64">
          <select
            className="w-full h-10 pl-4 pr-10 bg-white border-2 border-gray-300 rounded-xl text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {tableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
