import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CustomerDetailsModal from "../components/customer/CustomerDetailsModal";
import CustomerFormModal from "../components/customer/CustomerFormModal";
import ReceivePaymentModal from "../components/customer/ReceivePaymentModal";
import CustomerPageHeader from "../components/customer/CustomerPageHeader";
import CustomerStatsBar from "../components/customer/CustomerStatsBar";
import CustomerTable from "../components/customer/CustomerTable";
import CustomerMobileCard from "../components/customer/CustomerMobileCard";
import CustomerFooterStats from "../components/customer/CustomerFooterStats";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  receivePayment,
} from "../api/customer/customers";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import { SearchBar } from "../components/common";

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
      <CustomerPageHeader onAddNew={() => openFormModal()} />

      {/* Main Content Card */}
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
          {/* Search Bar */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name, phone, NIC, or address..."
              isSearching={isSearching}
            />
          </div>

          {/* Table Header */}
          <CustomerStatsBar
            customers={filteredCustomers}
            searchQuery={searchQuery}
          />

          {/* Desktop Table (lg and up) */}
          <CustomerTable
            customers={filteredCustomers}
            searchQuery={searchQuery}
            onDetails={openDetailsModal}
            onEdit={openFormModal}
            onDelete={handleDeleteCustomer}
            onPayment={openPaymentModal}
            onAddNew={() => openFormModal()}
          />

          {/* Mobile / Tablet Card List */}
          <CustomerMobileCard
            customers={filteredCustomers}
            searchQuery={searchQuery}
            onDetails={openDetailsModal}
            onEdit={openFormModal}
            onDelete={handleDeleteCustomer}
            onPayment={openPaymentModal}
            onAddNew={() => openFormModal()}
          />

          {/* Table Footer */}
          <CustomerFooterStats customers={customers} />
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
