import React from "react";

const CustomerDetailsModal = ({ open, customer, onClose }) => {
  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Customer Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm text-gray-800">
          <DetailRow label="Name" value={customer.name} />
          <DetailRow label="Phone" value={customer.phone} />
          <DetailRow label="Address" value={customer.address || "-"} />
          <DetailRow label="NIC" value={customer.nic || "-"} />
          <DetailRow label="Type" value={customer.type || "-"} />
          <DetailRow
            label="Credit Limit"
            value={formatCurrency(customer.creditLimit)}
          />
          <DetailRow
            label="Outstanding"
            value={formatCurrency(customer.currentBalance)}
          />
          <DetailRow label="Notes" value={customer.notes || "-"} />
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-soft cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-4">
    <span className="font-semibold text-gray-700">{label}:</span>
    <span className="text-gray-800 text-right flex-1">{value}</span>
  </div>
);

const formatCurrency = (val) =>
  typeof val === "number" ? `Rs. ${val.toFixed(2)}` : "-";

export default CustomerDetailsModal;
