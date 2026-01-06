import React from "react";
import SupplierContactSection from "../SupplierContactSection";
import SupplierDetailsSection from "../SupplierDetailsSection";

const SupplierFormBody = ({ form, errors, isEdit, onFormChange, addPhone }) => {
  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left */}
        <SupplierContactSection
          form={form}
          errors={errors}
          onFormChange={onFormChange}
          addPhone={addPhone}
        />

        {/* Right */}
        <SupplierDetailsSection
          form={form}
          errors={errors}
          isEdit={isEdit}
          onFormChange={onFormChange}
        />
      </div>
    </div>
  );
};

export default SupplierFormBody;
