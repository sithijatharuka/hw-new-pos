import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import AddItemModal from "../components/inventory/product/addProduct/AddNewItem";
import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryMobileCard from "../components/inventory/InventoryMobileCard";
import ItemDetailModal from "../components/inventory/ItemDetailModal";
import { confirmWithToast } from "../components/inventory/confirmDialog.jsx";
import * as itemApi from "../api/inventory/items";
import { loadInventoryLookups } from "../api/inventory/lookups";

const InventoryPage = ({ api }) => {
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
    300,
  );

  const fetchItems = async () => {
    try {
      const items = await itemApi.loadItems(api, q, lowStockOnly);
      setItems(items);
    } catch (err) {
      toast.error("Failed to load items");
    }
  };

  const fetchLookups = async () => {
    try {
      const result = await loadInventoryLookups(api, baseUnits);
      setSuppliers(result.suppliers);
      setCategories(result.categories);
      setBaseUnits(result.baseUnits);
    } catch (error) {
      toast.error("Failed to load inventory lookups");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmWithToast("Delete this item? (Hard delete)");
    if (!confirmed) return;

    try {
      await itemApi.deleteItem(api, id);
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

  const openDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  useEffect(() => {
    fetchItems();
    fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStockOnly]);

  const tableCategories = useMemo(() => {
    const fromItems = Array.from(
      new Set(items.map((i) => i.category).filter(Boolean)),
    );
    const fromLookups = (categories || []).filter(Boolean);
    return Array.from(new Set([...fromLookups, ...fromItems]));
  }, [items, categories]);

  const filteredItems = useMemo(() => {
    return searchFiltered.filter(
      (i) => !filterCategory || i.category === filterCategory,
    );
  }, [searchFiltered, filterCategory]);

  const handleActivate = async (id) => {
    try {
      await itemApi.activateItem(api, id);
      toast.success("Item activated");
      fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to activate item");
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await itemApi.deactivateItem(api, id);
      toast.success("Item deactivated");
      fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to deactivate item");
    }
  };

  const handlePrintBarcode = (id) => {
    navigate(`/barcode/${id}`);
  };

  const handleSearch = () => {
    fetchItems();
  };

  const handleClear = () => {
    setQ("");
    setFilterCategory("");
    fetchItems();
  };

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{ className: "text-sm font-medium", duration: 3000 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <InventoryHeader
          onAddNew={openNew}
          lowStockOnly={lowStockOnly}
          setLowStockOnly={setLowStockOnly}
        />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Search/Filter */}
          <InventoryFilters
            q={q}
            setQ={setQ}
            isSearching={isSearching}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            tableCategories={tableCategories}
            onSearch={handleSearch}
            onClear={handleClear}
          />

          {/* Desktop table */}
          <InventoryTable
            items={filteredItems}
            onEdit={openEdit}
            onDetails={openDetails}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
            onPrintBarcode={handlePrintBarcode}
            onAddNew={openNew}
            lowStockOnly={lowStockOnly}
          />

          {/* Mobile cards */}
          <InventoryMobileCard
            items={filteredItems}
            onDetails={openDetails}
            onAddNew={openNew}
            lowStockOnly={lowStockOnly}
          />
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
      <ItemDetailModal
        item={selectedItem}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={(item) => {
          openEdit(item);
          setShowDetailModal(false);
        }}
      />
    </div>
  );
};

export default InventoryPage;
