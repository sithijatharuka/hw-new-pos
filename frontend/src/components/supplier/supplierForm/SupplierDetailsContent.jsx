import React from "react";
import { formatPaymentTerms } from "../../../utils/paymentTerms";

const SupplierDetailsContent = ({ supplier }) => {
  return (
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
          <span className="font-semibold text-gray-700">Opening Balance:</span>
          <p className="text-gray-600">
            Rs. {Number(supplier.openingBalance || 0).toFixed(2)}
          </p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Current Balance:</span>
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
};

export default SupplierDetailsContent;
