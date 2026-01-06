import React from "react";
import GRNForm from "../GRNForm";

const GRNFormModal = ({
  open,
  supplier,
  items,
  existingGRN,
  onSuccess,
  onClose,
  onItemsRefresh,
  suppliers,
  categories,
  baseUnits,
}) => {
  if (!open || !supplier) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Receive Goods from {supplier.name}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <GRNForm
            supplier={supplier}
            items={items}
            existingGRN={existingGRN}
            onSuccess={onSuccess}
            onClose={onClose}
            onItemsRefresh={onItemsRefresh}
            suppliers={suppliers}
            categories={categories}
            baseUnits={baseUnits}
          />
        </div>
      </div>
    </div>
  );
};

export default GRNFormModal;
