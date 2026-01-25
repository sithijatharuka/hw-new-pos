// src/components/supplier/SupplierFormFooter.jsx
import React from "react";

const SupplierFormFooter = ({ saving, isEdit, onCancel, onSubmit }) => {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border-light bg-background-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/80">
      <div className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:items-center sm:justify-end sm:p-6">
        <button
          type="button"
          onClick={onCancel}
          className="
            inline-flex w-full items-center justify-center rounded-2xl border border-border-default
            bg-background-secondary px-5 py-2.5 text-sm font-semibold text-text-primary
            shadow-sm transition duration-200 ease-out
            hover:-translate-y-0.5 hover:bg-background-subtle hover:shadow-md
            active:translate-y-0
            focus:outline-none focus:ring-4 focus:ring-focus/20
            cursor-pointer
            sm:w-auto
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="
            inline-flex w-full items-center justify-center rounded-2xl
            bg-accent px-5 py-2.5 text-sm font-semibold text-text-inverse
            shadow-md transition duration-200 ease-out
            hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg
            active:translate-y-0 active:bg-accent-active
            focus:outline-none focus:ring-4 focus:ring-focus/25
            disabled:cursor-not-allowed disabled:opacity-60
            cursor-pointer
            sm:w-auto
          "
        >
          {saving ? "Saving..." : isEdit ? "Update Supplier" : "Save Supplier"}
        </button>
      </div>
    </div>
  );
};

export default SupplierFormFooter;
