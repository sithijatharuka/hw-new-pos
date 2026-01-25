// src/components/supplier/SupplierFormHeader.jsx
import React from "react";

const SupplierFormHeader = ({ isEdit, onClose }) => {
  return (
    <div className="sticky top-0 z-10 border-b border-border-light bg-background-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/80">
      <div className="flex items-start justify-between gap-4 p-4 sm:items-center sm:p-6">
        <div className="min-w-0">
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            {isEdit ? "Edit Supplier" : "Add New Supplier"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-text-tertiary">
            {isEdit
              ? "Update supplier information"
              : "Fill in the details to add a new supplier"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            inline-flex h-11 w-11 items-center justify-center rounded-2xl
            border border-border-light bg-background-secondary text-text-tertiary
            shadow-sm transition duration-200 ease-out
            hover:-translate-y-0.5 hover:bg-background-subtle hover:text-text-primary hover:shadow-md
            active:translate-y-0
            focus:outline-none focus:ring-4 focus:ring-focus/20
            cursor-pointer
          "
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SupplierFormHeader;
