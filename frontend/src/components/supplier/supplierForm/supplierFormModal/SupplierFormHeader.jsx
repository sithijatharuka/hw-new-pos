import React from "react";

const SupplierFormHeader = ({ isEdit, onClose }) => {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Supplier" : "Add New Supplier"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? "Update supplier information"
            : "Fill in the details to add a new supplier"}
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
};

export default SupplierFormHeader;
