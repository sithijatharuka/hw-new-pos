import React from "react";
import { isValidPhoneNumber } from "../../common/formValidation";
import toast from "react-hot-toast";

const SupplierContactSection = ({ form, errors, onFormChange, addPhone }) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplier Code
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          value={form.supplierCode}
          onChange={(e) => onFormChange({ supplierCode: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplier Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`w-full px-4 py-3 border ${
            errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
          } rounded-xl focus:outline-none focus:ring-2 ${
            errors.name ? "focus:ring-red-200" : "focus:ring-primary/20"
          } focus:border-primary text-sm`}
          value={form.name}
          onChange={(e) => onFormChange({ name: e.target.value })}
        />
        {errors.name && (
          <p className="mt-2 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Person
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          value={form.contactPerson}
          onChange={(e) => onFormChange({ contactPerson: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          className={`w-full px-4 py-3 border ${
            errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
          } rounded-xl focus:outline-none focus:ring-2 ${
            errors.email ? "focus:ring-red-200" : "focus:ring-primary/20"
          } focus:border-primary text-sm`}
          value={form.email}
          onChange={(e) => onFormChange({ email: e.target.value })}
        />
        {errors.email && (
          <p className="mt-2 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Numbers <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            className={`flex-1 px-4 py-3 border ${
              errors.phones ? "border-red-300 bg-red-50" : "border-gray-200"
            } rounded-xl focus:outline-none focus:ring-2 ${
              errors.phones ? "focus:ring-red-200" : "focus:ring-primary/20"
            } focus:border-primary text-sm`}
            placeholder="Add phone number"
            value={form.phoneInput}
            onChange={(e) => onFormChange({ phoneInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPhone();
              }
            }}
          />
          <button
            type="button"
            className="px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium"
            onClick={addPhone}
          >
            Add
          </button>
        </div>

        {form.phones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.phones.map((phone, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs flex items-center gap-2"
              >
                {phone}
                <button
                  type="button"
                  onClick={() => {
                    const newPhones = form.phones.filter((_, i) => i !== idx);
                    onFormChange({ phones: newPhones });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.phones && (
          <p className="mt-2 text-xs text-red-600">{errors.phones}</p>
        )}
      </div>
    </div>
  );
};

export default SupplierContactSection;
