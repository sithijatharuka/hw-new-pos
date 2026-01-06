import React from "react";

const SupplierFormFooter = ({ saving, isEdit, onCancel, onSubmit }) => {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={saving}
        className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : isEdit ? "Update Supplier" : "Save Supplier"}
      </button>
    </div>
  );
};

export default SupplierFormFooter;
