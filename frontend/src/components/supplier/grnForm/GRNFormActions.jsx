import React from "react";
import AppLoader from "../../common/AppLoader";
import colors from "../../../themes/colors";
const GRNFormActions = ({
  saving,
  isEditable,
  existingGRN,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex justify-end gap-3 pt-0 ">
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
        className="bg-primary text-white hover:bg-primary/90 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {existingGRN ? "Update GRN" : "Save GRN"}
      </button>

      {saving && (
        <div className="pt-4 w-full">
          <AppLoader
            open
            variant="inline"
            title={existingGRN ? "Updating GRN" : "Saving GRN"}
            subtitle="Recording goods received details"
          />
        </div>
      )}
    </div>
  );
};

export default GRNFormActions;
