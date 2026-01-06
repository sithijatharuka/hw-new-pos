import React, { useMemo } from "react";
import {
  PAYMENT_TERM_TYPES,
  NET_DAY_OPTIONS,
  normalizePaymentTerms,
} from "../../../utils/paymentTerms";

const SupplierDetailsSection = ({ form, errors, isEdit, onFormChange }) => {
  const pt = useMemo(
    () => normalizePaymentTerms(form.paymentTerms),
    [form.paymentTerms]
  );

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          className={`w-full px-4 py-3 border ${
            errors.address ? "border-red-300 bg-red-50" : "border-gray-200"
          } rounded-xl focus:outline-none focus:ring-2 ${
            errors.address ? "focus:ring-red-200" : "focus:ring-primary/20"
          } focus:border-primary text-sm resize-none`}
          value={form.address}
          onChange={(e) => onFormChange({ address: e.target.value })}
        />
        {errors.address && (
          <p className="mt-2 text-xs text-red-600">{errors.address}</p>
        )}
      </div>

      {/* Payment Terms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Terms
        </label>

        <div className="grid grid-cols-2 gap-3">
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={pt.type}
            onChange={(e) => {
              const type = e.target.value;
              onFormChange({
                paymentTerms:
                  type === "NET"
                    ? { type, days: form.paymentTerms?.days || 30 }
                    : { type, days: 0 },
              });
            }}
          >
            {PAYMENT_TERM_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              pt.type !== "NET" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            value={pt.days}
            disabled={pt.type !== "NET"}
            onChange={(e) =>
              onFormChange({
                paymentTerms: {
                  type: "NET",
                  days: Number(e.target.value) || 0,
                },
              })
            }
          >
            {NET_DAY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                Net {d} days
              </option>
            ))}
            <option value={pt.days}>Custom: {pt.days} days</option>
          </select>
        </div>

        {pt.type === "NET" && (
          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">
              Custom Net Days (optional)
            </label>
            <input
              type="number"
              min={0}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={pt.days}
              onChange={(e) =>
                onFormChange({
                  paymentTerms: {
                    type: "NET",
                    days: Number(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
        )}

        {errors.paymentTerms && (
          <p className="mt-2 text-xs text-red-600">{errors.paymentTerms}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opening Balance <span className="text-red-500">*</span>{" "}
            {isEdit && (
              <span className="text-gray-400 text-xs">(read-only)</span>
            )}
          </label>
          <input
            type="number"
            step="0.01"
            disabled={isEdit}
            className={`w-full px-4 py-3 border ${
              errors.openingBalance
                ? "border-red-300 bg-red-50"
                : "border-gray-200"
            } rounded-xl focus:outline-none focus:ring-2 ${
              errors.openingBalance
                ? "focus:ring-red-200"
                : "focus:ring-primary/20"
            } focus:border-primary text-sm ${
              isEdit ? "bg-gray-50 cursor-not-allowed" : ""
            }`}
            value={form.openingBalance}
            onChange={(e) => onFormChange({ openingBalance: e.target.value })}
          />
          {errors.openingBalance && (
            <p className="mt-2 text-xs text-red-600">{errors.openingBalance}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Limit <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            className={`w-full px-4 py-3 border ${
              errors.creditLimit
                ? "border-red-300 bg-red-50"
                : "border-gray-200"
            } rounded-xl focus:outline-none focus:ring-2 ${
              errors.creditLimit
                ? "focus:ring-red-200"
                : "focus:ring-primary/20"
            } focus:border-primary text-sm`}
            value={form.creditLimit}
            onChange={(e) => onFormChange({ creditLimit: e.target.value })}
          />
          {errors.creditLimit && (
            <p className="mt-2 text-xs text-red-600">{errors.creditLimit}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          value={form.status}
          onChange={(e) => onFormChange({ status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
          value={form.notes}
          onChange={(e) => onFormChange({ notes: e.target.value })}
        />
      </div>
    </div>
  );
};

export default SupplierDetailsSection;
