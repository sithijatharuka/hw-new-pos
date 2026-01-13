// src/pages/SuppliersPage.jsx
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import EntityCardList from "../components/common/EntityCardList";

import GrnDetailsModal from "../components/supplier/grnDetail/GrnDetailsModal";
import {
  getSupplierGRNs,
  deleteGRN,
  postGRN,
} from "../api/supplier/grn";

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

const SuppliersPage = () => {
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
    300
  );

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers(q);
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

  const handleDeleteSupplier = async (supplier) => {
    const ok = window.confirm("Delete this supplier? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteSupplier(supplier._id);
      setSuppliers((prev) => prev.filter((s) => s._id !== supplier._id));
      toast.success("Supplier deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete supplier");
    }
  };

  const handleSaveSupplier = async (payload) => {
    try {
      setSavingSupplier(true);

      if (editingSupplier) {
        const updated = await updateSupplier(editingSupplier._id, payload);
        setSuppliers((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s))
        );
        toast.success("Supplier updated");
      } else {
        // For new suppliers, set currentBalance = openingBalance
        const created = await createSupplier(payload);
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
      const updated = await recordSupplierPayment(paySupplier._id, amount);

      setSuppliers((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
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
      const fetched = await fetchItemsForGrn();
      setItems(fetched);
    } catch {
      toast.error("Failed to load items");
    }
  };

  const fetchCategories = async () => {
    try {
      const { categories: cats, baseUnits: units } =
        await getCategoriesAndUnits(baseUnits);
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
        : "GRN created successfully"
    );
  };

  const openViewGRNs = async (supplier) => {
    try {
      setLoadingGRNs(true);
      const grns = await getSupplierGRNs(supplier._id);
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
        prev.map((g) => (g._id === posted._id ? posted : g))
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
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <SupplierDetailsContent supplier={supplier} />
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <SupplierPageHeader onAddSupplier={openCreate} />

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <SupplierSearchBar
          query={q}
          onQueryChange={setQ}
          isSearching={isSearching}
          onRefresh={fetchSuppliers}
          loading={loading}
          filteredCount={filtered.length}
          totalCount={suppliers.length}
        />

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
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Supplier
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Terms
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Outstanding
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
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

      {/* Add/Edit Supplier Modal */}
      <SupplierFormModal
        open={showSupplierForm}
        editingSupplier={editingSupplier}
        saving={savingSupplier}
        onClose={() => {
          setShowSupplierForm(false);
          setEditingSupplier(null);
        }}
        onSubmit={handleSaveSupplier}
      />

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
