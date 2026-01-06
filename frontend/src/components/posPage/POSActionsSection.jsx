import React from "react";

const POSActionsSection = ({
  canSavePending,
  canSaveCredit,
  canSavePaid,
  onSavePending,
  onSaveCredit,
  onSavePaid,
}) => {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-end">
        <button
          type="button"
          disabled={!canSavePending}
          onClick={onSavePending}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 font-semibold text-sm sm:text-base transition-all duration-200 ${
            canSavePending
              ? "border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 hover:shadow-md active:scale-95 cursor-pointer"
              : "border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save as Pending
        </button>

        <button
          type="button"
          disabled={!canSaveCredit}
          onClick={onSaveCredit}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 font-semibold text-sm sm:text-base transition-all duration-200 ${
            canSaveCredit
              ? "border-primary text-primary hover:bg-primary hover:text-white hover:shadow-lg active:scale-95 cursor-pointer"
              : "border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save as Credit Sale
        </button>

        <button
          type="button"
          disabled={!canSavePaid}
          onClick={onSavePaid}
          className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
            canSavePaid
              ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save & Print Invoice
        </button>
      </div>
    </div>
  );
};

export default POSActionsSection;
