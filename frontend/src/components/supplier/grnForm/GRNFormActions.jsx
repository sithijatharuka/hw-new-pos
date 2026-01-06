import React from "react";

const GRNFormActions = ({
  saving,
  isEditable,
  existingGRN,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving || !isEditable}
        className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : existingGRN ? "Update GRN" : "Save GRN"}
      </button>
    </div>
  );
};

export default GRNFormActions;
