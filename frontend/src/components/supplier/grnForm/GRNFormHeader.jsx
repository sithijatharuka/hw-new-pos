import React from "react";

const GRNFormHeader = ({ existingGRN, supplier }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        {existingGRN ? "Edit GRN" : "Create Goods Received Note (GRN)"}
      </h2>

      {supplier && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-blue-600 font-medium">Supplier Name</p>
              <p className="text-sm font-semibold text-gray-900">
                {supplier.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">
                Contact Person
              </p>
              <p className="text-sm text-gray-900">
                {supplier.contactPerson || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Phone</p>
              <p className="text-sm text-gray-900">
                {supplier.phones?.[0] || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {!existingGRN && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            GRN Number will be automatically generated when you save this GRN
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {existingGRN && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GRN No
            </label>
            <input
              type="text"
              value={existingGRN.grnNo || "Auto-generated"}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-sm text-gray-600"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GRN Date
          </label>
          <input
            type="date"
            name="grnDate"
            value={arguments[3]} // grnDate from parent
            onChange={arguments[4]} // handleHeaderChange from parent
            disabled={arguments[5]} // fieldsDisabled from parent
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default GRNFormHeader;
