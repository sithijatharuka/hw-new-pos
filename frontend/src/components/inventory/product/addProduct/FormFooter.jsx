import React from "react";

const FormFooter = ({ saving, editingId, onCancel, onSave }) => {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="button"
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-95 transition-all font-medium"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:shadow-lg active:scale-95 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : editingId ? "Update Item" : "Create Item"}
        </button>
      </div>
    </div>
  );
};

export default FormFooter;
