import React from "react";
import CustomerSelector from "../customer/CustomerSelector";

const POSCustomerSection = ({
  customer,
  setCustomer,
  filteredCustomers,
  customers,
  setShowCustomerModal,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
          Customer Information
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Required for{" "}
          <span className="font-semibold text-primary">credit sales</span>,
          optional for cash sales.
        </p>

        <CustomerSelector
          customers={filteredCustomers.length ? filteredCustomers : customers}
          value={customer}
          onChange={setCustomer}
          onAddNew={() => setShowCustomerModal(true)}
          showBalances={true}
        />
      </div>
    </div>
  );
};

export default POSCustomerSection;
