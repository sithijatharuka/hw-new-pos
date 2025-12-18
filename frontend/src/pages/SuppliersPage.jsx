// src/pages/SuppliersPage.jsx
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import EntityCardList from "../components/common/EntityCardList";

import GRNForm from "../components/supplier/GRNForm";
import GrnDetailsModal from "../components/supplier/GrnDetailsModal";
import { getSupplierGRNs, deleteGRN, postGRN } from "../components/supplier/grnApi";

import SupplierFormModal from "../components/supplier/SupplierFormModal";
import SupplierPayModal from "../components/supplier/SupplierPayModal";
import { formatPaymentTerms } from "../utils/paymentTerms";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  recordSupplierPayment,
  getItemsForGrn,
  getCategoriesAndUnits,
} from "../components/supplier/supplierApi";

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
      toast.success(data.message || "Payment recorded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to record payment");
    } finally {
      setPaySaving(false);
    }
  };

  // ---------- GRN ----------
  const fetchItems = async () => {
    try {
      const fetched = await getItemsForGrn();
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
    const detailsContent = (
      <div className="space-y-4 text-sm">
        <div>
          <span className="font-semibold text-gray-700">Supplier Code:</span>
          <p className="text-gray-600">{supplier.supplierCode || "—"}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Name:</span>
          <p className="text-gray-600">{supplier.name}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Contact Person:</span>
          <p className="text-gray-600">{supplier.contactPerson || "—"}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Phone(s):</span>
          <p className="text-gray-600">
            {supplier.phones && supplier.phones.length > 0
              ? supplier.phones.join(", ")
              : "—"}
          </p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Email:</span>
          <p className="text-gray-600">{supplier.email || "—"}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Address:</span>
          <p className="text-gray-600">{supplier.address || "—"}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Payment Terms:</span>
          <p className="text-gray-600">
            {formatPaymentTerms(supplier.paymentTerms)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <span className="font-semibold text-gray-700">
              Opening Balance:
            </span>
            <p className="text-gray-600">
              Rs. {Number(supplier.openingBalance || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">
              Current Balance:
            </span>
            <p
              className={
                Number(supplier.currentBalance || 0) > 0
                  ? "text-red-600 font-semibold"
                  : "text-green-600 font-semibold"
              }
            >
              Rs. {Number(supplier.currentBalance || 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Credit Limit:</span>
          <p className="text-gray-600">
            Rs. {Number(supplier.creditLimit || 0).toFixed(2)}
          </p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Status:</span>
          <p
            className={
              supplier.status === "active"
                ? "text-green-600 font-semibold"
                : "text-gray-600"
            }
          >
            {supplier.status === "active" ? "Active" : "Inactive"}
          </p>
        </div>
        {supplier.notes && (
          <div>
            <span className="font-semibold text-gray-700">Notes:</span>
            <p className="text-gray-600">{supplier.notes}</p>
          </div>
        )}
      </div>
    );

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
          <div className="max-h-96 overflow-y-auto">{detailsContent}</div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Suppliers
          </h1>
          <p className="text-sm text-gray-600">
            Manage suppliers, track outstanding payments, and receive goods.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-md"
        >
          + Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <input
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              placeholder="Search suppliers..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {isSearching && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                …
              </span>
            )}
          </div>
          <button
            onClick={fetchSuppliers}
            disabled={loading}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <div className="text-xs text-gray-500">
            {filtered.length} of {suppliers.length}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="block lg:hidden">
          <EntityCardList
            items={filtered}
            renderCard={(s) => (
              <div
                className="p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => showSupplierDetails(s)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-500">
                      {s.supplierCode || "No code"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Terms: {formatPaymentTerms(s.paymentTerms)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Outstanding</div>
                    <div
                      className={`font-bold ${
                        Number(s.currentBalance || 0) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Rs. {Number(s.currentBalance || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs cursor-pointer hover:bg-orange-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      openReceiveGoods(s);
                    }}
                  >
                    Receive Goods
                  </button>
                  <button
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs cursor-pointer hover:bg-purple-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      openViewGRNs(s);
                    }}
                  >
                    View GRNs
                  </button>
                  <button
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs disabled:opacity-50 cursor-pointer hover:bg-green-100 disabled:cursor-not-allowed"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPay(s);
                    }}
                    disabled={Number(s.currentBalance || 0) <= 0}
                  >
                    Pay
                  </button>
                  <button
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs cursor-pointer hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(s);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs cursor-pointer hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSupplier(s);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          />
        </div>

        {/* Desktop table (simple) */}
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
                <tr
                  key={s._id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => showSupplierDetails(s)}
                >
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-500">
                      {s.supplierCode || "No code"}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {formatPaymentTerms(s.paymentTerms)}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`font-semibold ${
                        Number(s.currentBalance || 0) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Rs. {Number(s.currentBalance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs cursor-pointer hover:bg-orange-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openReceiveGoods(s);
                        }}
                      >
                        Receive Goods
                      </button>
                      <button
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs cursor-pointer hover:bg-purple-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewGRNs(s);
                        }}
                      >
                        View GRNs
                      </button>
                      <button
                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs disabled:opacity-50 cursor-pointer hover:bg-green-100 disabled:cursor-not-allowed"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPay(s);
                        }}
                        disabled={Number(s.currentBalance || 0) <= 0}
                      >
                        Pay
                      </button>
                      <button
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs cursor-pointer hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(s);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs cursor-pointer hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSupplier(s);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
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
      {showGRNForm && grnSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Receive Goods from {grnSupplier.name}
              </h2>
              <button
                onClick={() => {
                  setShowGRNForm(false);
                  setGrnSupplier(null);
                }}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <GRNForm
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
            </div>
          </div>
        </div>
      )}

      {/* GRNs List + Details */}
      {showGRNsList && grnSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  GRNs - {grnSupplier.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {grnsList.length} Goods Received Notes
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGRNsList(false);
                  setGrnSupplier(null);
                  setGrnsList([]);
                }}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingGRNs ? (
                <div className="text-center py-10">Loading…</div>
              ) : grnsList.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No GRNs found
                </div>
              ) : (
                <div className="space-y-3">
                  {grnsList.map((grn) => {
                    const statusClasses =
                      grn.status === "posted"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200";

                    return (
                      <div
                        key={grn._id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm cursor-pointer"
                        onClick={() => {
                          setSelectedGRN(grn);
                          setShowGRNDetails(true);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-900">
                                {grn.grnNo}
                              </div>
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusClasses}`}
                              >
                                {(grn.status || "draft").toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Date:{" "}
                              {new Date(grn.grnDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              Rs. {Number(grn.grandTotal || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {grn.lines?.length || 0} items
                            </div>
                          </div>
                        </div>
                        {grn.remarks && (
                          <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {grn.remarks}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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


