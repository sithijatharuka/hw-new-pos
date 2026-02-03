// src/pages/SuppliersPage.jsx
import React, { useEffect, useState } from "react";
import AppLoader from "../components/common/AppLoader";
import toast, { Toaster } from "react-hot-toast";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import EntityCardList from "../components/common/EntityCardList";

import GrnDetailsModal from "../components/supplier/grnDetail/GrnDetailsModal";
import { getSupplierGRNs, deleteGRN, postGRN } from "../api/supplier/grn";

import SupplierFormModal from "../components/supplier/supplierForm/supplierFormModal/SupplierFormModal";
import SupplierPayModal from "../components/supplier/supplierForm/SupplierPayModal";
import SupplierPageHeader from "../components/supplier/supplierForm/SupplierPageHeader";
import SupplierSearchBar from "../components/supplier/supplierForm/SupplierSearchBar";
import SupplierMobileCard from "../components/supplier/supplierForm/SupplierMobileCard";
import SupplierTableRow from "../components/supplier/supplierForm/SupplierTableRow";
import SupplierDetailsContent from "../components/supplier/supplierForm/SupplierDetailsContent";
import GRNFormModal from "../components/supplier/grnForm/grnFormModal/GRNFormModal";
import GRNListModal from "../components/supplier/grnDetail/GRNListModal";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  recordSupplierPayment,
  getCategoriesAndUnits,
} from "../api/supplier/suppliers";
import { fetchItemsForGrn } from "../api/inventory/items";

const SuppliersPage = ({ api }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [savingSupplier, setSavingSupplier] = useState(false);

  const [showPayModal, setShowPayModal] = useState(false);
  const [paySupplier, setPaySupplier] = useState(null);
  const [paySaving, setPaySaving] = useState(false);

  // GRN State
  const [showGRNForm, setShowGRNForm] = useState(false);
  const [grnSupplier, setGrnSupplier] = useState(null);
  const [items, setItems] = useState([]);
  const [editingGRN, setEditingGRN] = useState(null);

  const [categories, setCategories] = useState([]);
  const [baseUnits, setBaseUnits] = useState([
    "pcs",
    "kg",
    "ltr",
    "box",
    "pkt",
  ]);

  const [showGRNsList, setShowGRNsList] = useState(false);
  const [grnsList, setGrnsList] = useState([]);
  const [loadingGRNs, setLoadingGRNs] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [showGRNDetails, setShowGRNDetails] = useState(false);

  const {
    query: q,
    setQuery: setQ,
    filteredItems: filtered,
    isSearching,
  } = usePrefixSearch(
    suppliers,
    (s) => [
      s.name,
      s.supplierCode,
      s.contactPerson,
      ...(s.phones || []),
      s.address,
    ],
    300,
  );

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers(api, q);
      setSuppliers(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Supplier Actions ----------
  const openCreate = () => {
    setEditingSupplier(null);
    setShowSupplierForm(true);
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierForm(true);
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetSupplier, setDeleteTargetSupplier] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteSupplier = (supplier) => {
    setDeleteTargetSupplier(supplier);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSupplier = async () => {
    if (!deleteTargetSupplier) return;
    setDeleteLoading(true);
    try {
      await deleteSupplier(api, deleteTargetSupplier._id);
      setSuppliers((prev) =>
        prev.filter((s) => s._id !== deleteTargetSupplier._id),
      );
      toast.success("Supplier deleted");
      setDeleteModalOpen(false);
      setDeleteTargetSupplier(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete supplier");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveSupplier = async (payload) => {
    try {
      setSavingSupplier(true);

      if (editingSupplier) {
        const updated = await updateSupplier(api, editingSupplier._id, payload);
        setSuppliers((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s)),
        );
        toast.success("Supplier updated");
      } else {
        // For new suppliers, set currentBalance = openingBalance
        const created = await createSupplier(api, payload);
        setSuppliers((prev) => [...prev, created]);
        toast.success("Supplier created");
      }

      setShowSupplierForm(false);
      setEditingSupplier(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save supplier");
    } finally {
      setSavingSupplier(false);
    }
  };

  // ---------- Payment ----------
  const openPay = (supplier) => {
    if (Number(supplier.currentBalance || 0) <= 0) return;
    setPaySupplier(supplier);
    setShowPayModal(true);
  };

  const handleConfirmPay = async (amount) => {
    if (!paySupplier) return;

    try {
      setPaySaving(true);
      const updated = await recordSupplierPayment(api, paySupplier._id, amount);

      setSuppliers((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s)),
      );
      setShowPayModal(false);
      setPaySupplier(null);
      toast.success("Payment recorded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to record payment");
    } finally {
      setPaySaving(false);
    }
  };

  // ---------- GRN ----------

  const fetchItems = async () => {
    try {
      const fetched = await fetchItemsForGrn(api);
      setItems(fetched);
    } catch {
      toast.error("Failed to load items");
    }
  };

  const fetchCategories = async () => {
    try {
      const { categories: cats, baseUnits: units } =
        await getCategoriesAndUnits(api, baseUnits);
      setCategories(cats);
      setBaseUnits(units);
    } catch (err) {
      console.error(err);
    }
  };

  const openReceiveGoods = async (supplier) => {
    setGrnSupplier(supplier);
    setEditingGRN(null);
    if (items.length === 0) await fetchItems();
    if (categories.length === 0) await fetchCategories();
    setShowGRNForm(true);
  };

  const handleGRNSuccess = (savedGrn) => {
    const wasEditing = Boolean(editingGRN);
    const activeSupplierId = grnSupplier?._id || grnSupplier?.id || grnSupplier;

    setShowGRNForm(false);
    setEditingGRN(null);
    setGrnSupplier(null);

    if (savedGrn?._id) {
      setGrnsList((prev) => {
        const exists = prev.some((g) => g._id === savedGrn._id);
        if (exists) {
          return prev.map((g) => (g._id === savedGrn._id ? savedGrn : g));
        }

        const savedSupplierId = savedGrn.supplier?._id || savedGrn.supplier;
        if (
          activeSupplierId &&
          savedSupplierId &&
          String(savedSupplierId) === String(activeSupplierId)
        ) {
          return [savedGrn, ...prev];
        }
        return prev;
      });
    }

    toast.success(
      savedGrn && savedGrn._id && wasEditing
        ? "GRN updated successfully"
        : "GRN created successfully",
    );
  };

  const openViewGRNs = async (supplier) => {
    try {
      setLoadingGRNs(true);
      const grns = await getSupplierGRNs(api, supplier._id);
      setGrnsList(grns || []);
      setGrnSupplier(supplier);
      setShowGRNsList(true);
    } catch {
      toast.error("Failed to load GRNs");
    } finally {
      setLoadingGRNs(false);
    }
  };

  const openEditGRN = async (grn) => {
    if (!grn || grn.status !== "draft") {
      toast.error("Only draft GRNs can be edited");
      return;
    }

    const supplierRef =
      grn.supplier && typeof grn.supplier === "object"
        ? grn.supplier
        : suppliers.find((s) => String(s._id) === String(grn.supplier));

    setEditingGRN(grn);
    setGrnSupplier(supplierRef || grnSupplier);
    if (items.length === 0) await fetchItems();
    if (categories.length === 0) await fetchCategories();
    setShowGRNForm(true);
  };

  const handleDeleteGRN = async () => {
    if (!selectedGRN) return;
    if (selectedGRN.status !== "draft") {
      toast.error("Only draft GRNs can be deleted");
      return;
    }
    try {
      await deleteGRN(selectedGRN._id);
      setGrnsList((prev) => prev.filter((g) => g._id !== selectedGRN._id));
      setShowGRNDetails(false);
      setSelectedGRN(null);
      toast.success("GRN deleted successfully");
    } catch {
      toast.error("Failed to delete GRN");
    }
  };

  const handlePostGRN = async () => {
    if (!selectedGRN) return;
    if (selectedGRN.status !== "draft") {
      toast.error("Only draft GRNs can be posted");
      return;
    }

    try {
      const posted = await postGRN(selectedGRN._id);
      setGrnsList((prev) =>
        prev.map((g) => (g._id === posted._id ? posted : g)),
      );
      setSelectedGRN(posted);
      setShowGRNDetails(false);
      toast.success("GRN posted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post GRN");
    }
  };

  // ---------- Show Supplier Details ----------
  const showSupplierDetails = (supplier) => {
    toast.custom(
      (t) => (
        <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto max-h-96">
            <SupplierDetailsContent supplier={supplier} />
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <SupplierPageHeader onAddSupplier={openCreate} />

      {/* Search */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-2xl">
        <SupplierSearchBar
          query={q}
          onQueryChange={setQ}
          isSearching={isSearching}
          onRefresh={fetchSuppliers}
          loading={loading}
          filteredCount={filtered.length}
          totalCount={suppliers.length}
        />

        {(loading || isSearching) && (
          <div className="px-4 py-6">
            <AppLoader
              open
              variant="inline"
              title={loading ? "Loading suppliers" : "Searching suppliers"}
              subtitle={
                loading
                  ? "Syncing supplier list"
                  : "Matching suppliers to your query"
              }
            />
          </div>
        )}

        {/* Mobile cards */}
        <div className="block lg:hidden">
          <EntityCardList
            items={filtered}
            renderCard={(s) => (
              <SupplierMobileCard
                supplier={s}
                onViewDetails={showSupplierDetails}
                onReceiveGoods={openReceiveGoods}
                onViewGRNs={openViewGRNs}
                onPay={openPay}
                onEdit={openEdit}
                onDelete={handleDeleteSupplier}
              />
            )}
          />
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-600 uppercase">
                  Supplier
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-600 uppercase">
                  Terms
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-600 uppercase">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <SupplierTableRow
                  key={s._id}
                  supplier={s}
                  onViewDetails={showSupplierDetails}
                  onReceiveGoods={openReceiveGoods}
                  onViewGRNs={openViewGRNs}
                  onPay={openPay}
                  onEdit={openEdit}
                  onDelete={handleDeleteSupplier}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Supplier Modal with Overlay */}
      {/* Delete Supplier Confirmation Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Delete Supplier?"
        message={
          deleteTargetSupplier
            ? `This action cannot be undone.\nAre you sure you want to delete ${deleteTargetSupplier.name}?`
            : ""
        }
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTargetSupplier(null);
        }}
        onConfirm={confirmDeleteSupplier}
        loading={deleteLoading}
        confirmText="Delete"
        cancelText="Cancel"
      />
      {showSupplierForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0" />
          {/* Centered Modal */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <SupplierFormModal
              open={true}
              editingSupplier={editingSupplier}
              saving={savingSupplier}
              onClose={() => {
                setShowSupplierForm(false);
                setEditingSupplier(null);
              }}
              onSubmit={handleSaveSupplier}
            />
          </div>
        </div>
      )}

      {/* Pay Modal */}
      <SupplierPayModal
        open={showPayModal}
        supplier={paySupplier}
        saving={paySaving}
        onClose={() => {
          setShowPayModal(false);
          setPaySupplier(null);
        }}
        onConfirm={handleConfirmPay}
      />

      {/* GRN Form Modal */}
      <GRNFormModal
        open={showGRNForm}
        supplier={grnSupplier}
        items={items}
        existingGRN={editingGRN}
        onSuccess={handleGRNSuccess}
        onClose={() => {
          setShowGRNForm(false);
          setGrnSupplier(null);
          setEditingGRN(null);
        }}
        onItemsRefresh={fetchItems}
        suppliers={suppliers}
        categories={categories}
        baseUnits={baseUnits}
      />

      {/* GRNs List Modal */}
      <GRNListModal
        open={showGRNsList}
        supplier={grnSupplier}
        grnsList={grnsList}
        loading={loadingGRNs}
        onClose={() => {
          setShowGRNsList(false);
          setGrnSupplier(null);
          setGrnsList([]);
        }}
        onSelectGRN={(grn) => {
          setSelectedGRN(grn);
          setShowGRNDetails(true);
        }}
      />

      {/* GRN Details Modal */}
      <GrnDetailsModal
        open={showGRNDetails}
        grn={selectedGRN}
        onClose={() => {
          setShowGRNDetails(false);
          setSelectedGRN(null);
        }}
        onEdit={
          selectedGRN?.status === "draft"
            ? () => openEditGRN(selectedGRN)
            : null
        }
        onDelete={selectedGRN?.status === "draft" ? handleDeleteGRN : null}
        onPost={selectedGRN?.status === "draft" ? handlePostGRN : null}
      />
    </div>
  );
};

export default SuppliersPage;
