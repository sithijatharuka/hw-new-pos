import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CustomerDetailsModal from "../components/customer/CustomerDetailsModal";
import CustomerFormModal from "../components/customer/CustomerFormModal";
import ReceivePaymentModal from "../components/customer/ReceivePaymentModal";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  receivePayment,
} from "../components/customer/customerApi";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import {
  PageHeader,
  SearchBar,
  EmptyState,
  StatsCard,
  ActionButton,
} from "../components/common";
import EntityCardList from "../components/common/EntityCardList";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formSaving, setFormSaving] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsCustomer, setDetailsCustomer] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [paymentSaving, setPaymentSaving] = useState(false);

  // Prefix search hook with debouncing
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filteredItems: filteredCustomers,
    isSearching,
  } = usePrefixSearch(
    customers,
    (customer) => [
      customer.name,
      customer.phone,
      customer.nic,
      customer.address,
    ],
    300 // 300ms debounce
  );

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load customers.");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setFormSaving(true);
    try {
      if (editingCustomer) {
        // Update existing
        const updated = await updateCustomer(editingCustomer._id, formData);
        setCustomers((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c))
        );
        toast.success("Customer updated successfully!");
      } else {
        // Create new
        const created = await createCustomer(formData);
        setCustomers((prev) => [...prev, created]);
        toast.success("Customer created successfully!");
      }
      closeFormModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save customer.");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!confirm(`Delete "${customer.name}"?`)) return;
    try {
      await deleteCustomer(customer._id);
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      toast.success("Customer deleted successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete customer.");
    }
  };

  const handleReceivePayment = async (payload) => {
    if (!paymentCustomer) return;
    setPaymentSaving(true);
    try {
      await receivePayment(paymentCustomer._id, payload);
      toast.success("Payment received successfully!");
      closePaymentModal();
      loadCustomers(); // Refresh to update balance
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to receive payment.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const openFormModal = (customer = null) => {
    setEditingCustomer(customer);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingCustomer(null);
  };

  const openDetailsModal = (customer) => {
    setDetailsCustomer(customer);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsCustomer(null);
  };

  const openPaymentModal = (customer) => {
    setPaymentCustomer(customer);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentCustomer(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "text-sm font-medium",
          duration: 3000,
        }}
      />

      {/* Header Section */}
      <PageHeader
        icon="👥"
        title="Customer Management"
        description="Manage customer profiles, track credit limits, and process payments in one centralized view."
        action={
          <ActionButton
            label="Add New Customer"
            icon="+"
            onClick={() => openFormModal()}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          />
        }
      />

      {/* Main Content Card */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name, phone, NIC, or address..."
              isSearching={isSearching}
            />
          </div>

          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Directory
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery
                    ? `${filteredCustomers.length} of ${customers.length}`
                    : customers.length}{" "}
                  customer
                  {(searchQuery
                    ? filteredCustomers.length
                    : customers.length) !== 1
                    ? "s"
                    : ""}
                  {searchQuery && " matching search"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
                <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  Active:{" "}
                  {
                    filteredCustomers.filter((c) => c.currentBalance === 0)
                      .length
                  }
                </div>
                <div className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                  Due:{" "}
                  {filteredCustomers.filter((c) => c.currentBalance > 0).length}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table (lg and up) */}
          <div className="overflow-x-auto hidden lg:block">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Credit Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <EmptyState
                        icon="👥"
                        title={
                          searchQuery
                            ? "No customers found"
                            : "No customers yet"
                        }
                        description={
                          searchQuery
                            ? "Try adjusting your search query"
                            : "Get started by adding your first customer"
                        }
                        action={
                          !searchQuery && (
                            <ActionButton
                              label="Add First Customer"
                              icon="+"
                              onClick={() => openFormModal()}
                              variant="primary"
                            />
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      onClick={() => openDetailsModal(c)}
                    >
                      {/* Customer Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              c.currentBalance > 0
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            <span className="text-lg">
                              {c.currentBalance > 0 ? "💳" : "✅"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              <span className="truncate max-w-[160px] sm:max-w-xs md:max-w-none">
                                {c.name}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  c.type === "cash"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : c.type === "credit"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {c.type === "cash"
                                  ? "Cash Only"
                                  : c.type === "credit"
                                  ? "Credit Only"
                                  : "Cash & Credit"}
                              </span>
                            </div>
                            {c.address && (
                              <p className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                                📍 {c.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {c.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <span>📞</span>
                              <span className="break-all">{c.phone}</span>
                            </div>
                          )}
                          {c.nic && (
                            <div className="text-xs text-gray-500">
                              NIC: {c.nic}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Credit Information */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-gray-600">
                              Credit Limit:
                            </span>
                            <span className="font-medium text-gray-900">
                              Rs. {Number(c.creditLimit || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-gray-600">
                              Outstanding:
                            </span>
                            <span
                              className={`font-bold ${
                                c.currentBalance > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              Rs. {Number(c.currentBalance || 0).toFixed(2)}
                            </span>
                          </div>
                          {c.creditLimit > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  c.currentBalance / c.creditLimit > 0.8
                                    ? "bg-red-500"
                                    : c.currentBalance / c.creditLimit > 0.5
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (c.currentBalance / c.creditLimit) * 100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          {c.currentBalance > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPaymentModal(c);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-md active:scale-95 transition-all duration-200 font-medium cursor-pointer"
                            >
                              💳 Pay
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openFormModal(c);
                            }}
                            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg hover:shadow-md active:scale-95 transition-all duration-200 font-medium cursor-pointer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomer(c);
                            }}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg hover:shadow-md active:scale-95 transition-all duration-200 font-medium cursor-pointer"
                            title="Delete customer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Card List (using EntityCardList) */}
          <div className="block lg:hidden">
            <EntityCardList
              items={filteredCustomers}
              renderCard={(c) => {
                const creditLimit = Number(c.creditLimit || 0);
                const currentBalance = Number(c.currentBalance || 0);
                const ratio =
                  creditLimit > 0 ? currentBalance / creditLimit : 0;
                const barColor =
                  ratio > 0.8
                    ? "bg-red-500"
                    : ratio > 0.5
                    ? "bg-yellow-500"
                    : "bg-green-500";

                return (
                  <div
                    className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white p-3 sm:p-4"
                    onClick={() => openDetailsModal(c)}
                  >
                    {/* Top Row: Icon + Name + Type + Outstanding */}
                    <div className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          c.currentBalance > 0
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        <span className="text-lg">
                          {c.currentBalance > 0 ? "💳" : "✅"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[160px] xs:max-w-[200px] sm:max-w-[240px]">
                                {c.name}
                              </p>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                                  c.type === "cash"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : c.type === "credit"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {c.type === "cash"
                                  ? "Cash Only"
                                  : c.type === "credit"
                                  ? "Credit Only"
                                  : "Cash & Credit"}
                              </span>
                            </div>
                            {c.address && (
                              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                                📍 {c.address}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-gray-600">
                              Outstanding
                            </p>
                            <p
                              className={`text-sm font-bold ${
                                currentBalance > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              Rs. {currentBalance.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="mt-2 space-y-1">
                      {c.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                          <span>📞</span>
                          <span className="break-all">{c.phone}</span>
                        </div>
                      )}
                      {c.nic && (
                        <div className="text-[11px] text-gray-500">
                          NIC: {c.nic}
                        </div>
                      )}
                    </div>

                    {/* Credit Info + Progress */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Credit Limit</span>
                        <span className="font-medium text-gray-900">
                          Rs. {creditLimit.toFixed(2)}
                        </span>
                      </div>
                      {creditLimit > 0 && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${barColor}`}
                              style={{
                                width: `${Math.min(ratio * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[11px] text-gray-500">
                            <span>Used</span>
                            <span>
                              {Math.min(ratio * 100, 100).toFixed(0)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions – tap-friendly buttons */}
                    <div
                      className="mt-3 flex flex-wrap gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {currentBalance > 0 && (
                        <button
                          onClick={() => openPaymentModal(c)}
                          className="flex-1 min-w-[90px] px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer text-center"
                        >
                          💳 Pay
                        </button>
                      )}
                      <button
                        onClick={() => openFormModal(c)}
                        className="flex-1 min-w-[90px] px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs sm:text-sm font-medium hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer text-center"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c)}
                        className="flex-1 min-w-[90px] px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs sm:text-sm font-medium hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer text-center"
                        title="Delete customer"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              }}
              emptyState={
                <div className="px-6 py-10">
                  <EmptyState
                    icon="👥"
                    title={
                      searchQuery ? "No customers found" : "No customers yet"
                    }
                    description={
                      searchQuery
                        ? "Try adjusting your search query"
                        : "Get started by adding your first customer"
                    }
                    action={
                      !searchQuery && (
                        <ActionButton
                          label="Add First Customer"
                          icon="+"
                          onClick={() => openFormModal()}
                          variant="primary"
                          size="md"
                        />
                      )
                    }
                  />
                </div>
              }
            />
          </div>

          {/* Table Footer */}
          {customers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 text-center md:text-left">
                  Showing {customers.length} customer
                  {customers.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Total Credit Limit:</span>
                    <span className="ml-2 font-bold">
                      Rs.{" "}
                      {customers
                        .reduce((sum, c) => sum + (c.creditLimit || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Total Outstanding:</span>
                    <span className="ml-2 font-bold text-red-600">
                      Rs.{" "}
                      {customers
                        .reduce((sum, c) => sum + (c.currentBalance || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        open={showDetailsModal}
        customer={detailsCustomer}
        onClose={closeDetailsModal}
      />

      {/* Customer Form Modal */}
      <CustomerFormModal
        open={showFormModal}
        initialData={editingCustomer}
        onClose={closeFormModal}
        onSubmit={handleCreateOrUpdate}
        saving={formSaving}
      />

      {/* Receive Payment Modal */}
      <ReceivePaymentModal
        open={showPaymentModal}
        customer={paymentCustomer}
        onClose={closePaymentModal}
        onSubmit={handleReceivePayment}
        saving={paymentSaving}
      />
    </div>
  );
};

export default CustomersPage;
