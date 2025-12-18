import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import { SearchBar, EmptyState, ActionButton } from "../components/common";
import EntityCardList from "../components/common/EntityCardList";
import AddItemModal from "../components/product/AddNewItem";

const InventoryPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // batches in detail modal
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batches, setBatches] = useState([]);

  // Lookups
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [baseUnits, setBaseUnits] = useState([
    "pcs",
    "kg",
    "ltr",
    "box",
    "pkt",
  ]); // ✅ Common units

  const {
    query: q,
    setQuery: setQ,
    filteredItems: searchFiltered,
    isSearching,
  } = usePrefixSearch(
    items,
    (item) => {
      const inv = item.inventory || {};
      return [
        item.name,
        item.sku,
        item.barcode,
        item.category,
        String(inv.onHand ?? ""),
      ];
    },
    300
  );

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/items", {
        params: { q: q || undefined, lowStock: lowStockOnly || undefined },
      });
      setItems(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load items");
    }
  };

  const fetchLookups = async () => {
    try {
      const [supRes, catRes, unitRes] = await Promise.allSettled([
        api.get("/suppliers"),
        api.get("/items/categories/list"),
        api.get("/items/units/list"),
      ]);

      if (supRes.status === "fulfilled") setSuppliers(supRes.value.data || []);
      if (catRes.status === "fulfilled") setCategories(catRes.value.data || []);
      if (unitRes.status === "fulfilled") {
        const fetchedUnits = unitRes.value.data || [];
        // Merge with default units
        const allUnits = Array.from(new Set([...baseUnits, ...fetchedUnits]));
        setBaseUnits(allUnits);
      }
    } catch {}
  };

  const confirmWithToast = (message) =>
    new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div className="max-w-sm w-full bg-white border border-gray-200 shadow-xl rounded-2xl px-4 py-3 text-sm flex flex-col gap-2">
            <p className="font-semibold text-gray-800">Confirm action</p>
            <p className="text-xs text-gray-600">{message}</p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white font-medium"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

  const handleDelete = async (id) => {
    const confirmed = await confirmWithToast("Delete this item? (Hard delete)");
    if (!confirmed) return;

    try {
      await api.delete(`/items/${id}`);
      toast.success("Item deleted");
      await fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete item");
    }
  };

  const openNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const openDetails = async (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
    setBatches([]);
    if (!item?.isBatchTracked) return;

    try {
      setBatchesLoading(true);
      const { data } = await api.get(`/items/${item._id}/batches`);
      setBatches(data?.batches || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load batches");
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStockOnly]);

  const tableCategories = useMemo(() => {
    const fromItems = Array.from(
      new Set(items.map((i) => i.category).filter(Boolean))
    );
    const fromLookups = (categories || []).filter(Boolean);
    return Array.from(new Set([...fromLookups, ...fromItems]));
  }, [items, categories]);

  const filteredItems = useMemo(() => {
    return searchFiltered.filter(
      (i) => !filterCategory || i.category === filterCategory
    );
  }, [searchFiltered, filterCategory]);

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{ className: "text-sm font-medium", duration: 3000 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Inventory Management
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Stock changes happen only via GRN / Sales / Adjustments
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-semibold rounded-xl shadow-lg"
              onClick={openNew}
            >
              <span>+</span>
              <span>Add New Item</span>
            </button>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <input
                type="checkbox"
                id="lowStockOnly"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="h-4 w-4 text-primary rounded focus:ring-primary cursor-pointer"
              />
              <label
                htmlFor="lowStockOnly"
                className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer"
              >
                Show Only Low Stock Items
              </label>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Search/Filter */}
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
                    onClick={fetchItems}
                  >
                    Search
                  </button>
                  <button
                    className="h-10 px-4 bg-white border-2 border-gray-300 rounded-xl"
                    onClick={() => {
                      setQ("");
                      setFilterCategory("");
                      fetchItems();
                    }}
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

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    On-hand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Selling
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((i) => {
                  const inv = i.inventory || {};
                  const onHand = Number(inv.onHand || 0);
                  const lowLevel = Number(inv.lowStockLevel || 0);
                  const low = onHand <= lowLevel;

                  return (
                    <tr
                      key={i._id}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => openDetails(i)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <span className="truncate max-w-[260px]">
                            {i.name}
                          </span>
                          {!i.isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                              Inactive
                            </span>
                          )}
                          {i.isBatchTracked && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              Batch
                            </span>
                          )}
                          {low && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                              Low
                            </span>
                          )}
                        </div>
                        {i.barcode && (
                          <div className="text-xs text-gray-500 mt-1 break-all">
                            📟 {i.barcode}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {i.category || "Uncategorized"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-bold ${
                            low ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {onHand} {i.baseUnit}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-primary">
                          Rs. {Number(i.sellingPrice || 0).toFixed(2)}
                        </span>
                      </td>

                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg"
                            onClick={() => openEdit(i)}
                          >
                            Edit
                          </button>

                          {i.isActive ? (
                            <button
                              className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg"
                              onClick={async () => {
                                await api.patch(`/items/${i._id}/deactivate`);
                                toast.success("Item deactivated");
                                fetchItems();
                              }}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg"
                              onClick={async () => {
                                await api.patch(`/items/${i._id}/activate`);
                                toast.success("Item activated");
                                fetchItems();
                              }}
                            >
                              Activate
                            </button>
                          )}

                          <button
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg"
                            onClick={() => handleDelete(i._id)}
                          >
                            Delete
                          </button>

                          <button
                            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg"
                            onClick={() => navigate(`/barcode/${i._id}`)}
                          >
                            Print Barcode
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12">
                      <EmptyState
                        icon="📦"
                        title="No items found"
                        description={
                          lowStockOnly
                            ? "No low stock items"
                            : "Try adjusting your search or filters"
                        }
                        action={
                          <ActionButton
                            label="+ Add Your First Item"
                            onClick={openNew}
                          />
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="block lg:hidden">
            <EntityCardList
              items={filteredItems}
              renderCard={(i) => {
                const inv = i.inventory || {};
                const onHand = Number(inv.onHand || 0);
                const lowLevel = Number(inv.lowStockLevel || 0);
                const low = onHand <= lowLevel;

                return (
                  <div
                    className="border border-gray-200 rounded-xl shadow-sm bg-white p-4"
                    onClick={() => openDetails(i)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {i.name}
                        </div>
                        {i.barcode && (
                          <div className="text-[11px] text-gray-500 break-all">
                            📟 {i.barcode}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-500">
                          Stock:{" "}
                          <span
                            className={`font-bold ${
                              low ? "text-red-600" : "text-gray-900"
                            }`}
                          >
                            {onHand} {i.baseUnit}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {!i.isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200">
                            Inactive
                          </span>
                        )}
                        {i.isBatchTracked && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            Batch
                          </span>
                        )}
                        {low && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            Low
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
              emptyState={
                <div className="px-4 py-10">
                  <EmptyState
                    icon="📦"
                    title="No items found"
                    description={
                      lowStockOnly
                        ? "No low stock items"
                        : "Try adjusting your search or filters"
                    }
                    action={
                      <ActionButton
                        label="+ Add Your First Item"
                        onClick={openNew}
                      />
                    }
                  />
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddItemModal
        open={showForm}
        onClose={() => setShowForm(false)}
        item={editingItem}
        suppliers={suppliers}
        categories={tableCategories}
        baseUnits={baseUnits}
        onSuccess={async () => {
          setShowForm(false);
          setEditingItem(null);
          await fetchItems();
        }}
        onCategoryAdd={() => toast.info("Category management coming soon")}
        onBaseUnitAdd={() => toast.info("Unit management coming soon")}
        onCategoryDelete={(cat) => toast.info(`Category delete: ${cat}`)}
      />

      {/* Detail Modal (with batches) */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedItem.name}
                  </h3>
                  <p className="text-xs text-gray-600 break-all">
                    {selectedItem.barcode || "No barcode"}
                  </p>
                </div>
                <button
                  className="w-8 h-8 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowDetailModal(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {(() => {
                const inv = selectedItem.inventory || {};
                const onHand = Number(inv.onHand || 0);
                const reserved = Number(inv.reserved || 0);
                const low = Number(inv.lowStockLevel || 0);
                const openingStock = Number(
                  selectedItem.openingStock ?? inv.onHand ?? 0
                );

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 uppercase">
                        Basic
                      </h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Category</span>
                          <span className="font-medium text-gray-900">
                            {selectedItem.category || "Uncategorized"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Base Unit</span>
                          <span className="font-medium text-gray-900">
                            {selectedItem.baseUnit}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Status</span>
                          <span className="font-medium text-gray-900">
                            {selectedItem.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 uppercase">
                        Stock
                      </h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">On-hand</span>
                          <span className="font-bold text-gray-900">
                            {onHand} {selectedItem.baseUnit}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Opening Stock</span>
                          <span className="font-medium text-gray-900">
                            {openingStock} {selectedItem.baseUnit}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Reserved</span>
                          <span className="font-medium text-gray-900">
                            {reserved} {selectedItem.baseUnit}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Low Level</span>
                          <span className="font-medium text-gray-900">
                            {low}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Batches */}
              {selectedItem.isBatchTracked && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 uppercase">
                    Batches
                  </h4>
                  <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                    {batchesLoading ? (
                      <div className="p-4 text-sm text-gray-600">
                        Loading batches...
                      </div>
                    ) : batches.length === 0 ? (
                      <div className="p-4 text-sm text-gray-600">
                        No batches found.
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                              Batch
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                              Expiry
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                              On-hand
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                              Reserved
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                              Available
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {batches.map((b) => (
                            <tr key={b._id}>
                              <td className="px-4 py-3">
                                {b.batchNumber || "-"}
                              </td>
                              <td className="px-4 py-3">
                                {b.expiryDate
                                  ? new Date(b.expiryDate)
                                      .toISOString()
                                      .slice(0, 10)
                                  : "-"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {Number(b.qtyOnHand || 0)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {Number(b.reserved || 0)}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold">
                                {Number(b.available || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5">
              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl"
                  onClick={() => {
                    openEdit(selectedItem);
                    setShowDetailModal(false);
                  }}
                >
                  Edit Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
