import React, { useState, useCallback } from "react";
import PageHeader from "../../../components/common/PageHeader";
import ReturnSearchBar from "../components/ReturnSearchBar";
import ProductDetailsCard from "../components/ProductDetailsCard";
import ReturnForm from "../components/ReturnForm";
import ExchangePanel from "../components/ExchangePanel";
import { mapReturnData } from "../utils/mapReturnData";
import { showSuccess } from "../../../utils/toastHelper";

import * as returnApi from "../api/returnApi";

// ─── Steps ───────────────────────────────────────────────────────────────────
// STEP 1 → Scan / search returned product
// STEP 2 → Fill details (billing price, qty) + reason + process
// ─────────────────────────────────────────────────────────────────────────────
const STEP = { SEARCH: 1, DETAILS: 2 };

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, mode }) => {
  const steps =
    mode === "return"
      ? [
          { id: 1, label: "Find Product" },
          { id: 2, label: "Return Details" },
        ]
      : [
          { id: 1, label: "Find Product" },
          { id: 2, label: "Exchange Details" },
        ];

  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                done
                  ? "bg-status-success-DEFAULT text-white"
                  : active
                  ? "bg-primary text-white shadow-card"
                  : "border border-gray-200 bg-background-subtle text-text-tertiary",
              ].join(" ")}>
                {done ? "✓" : s.id}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                active ? "text-primary" : done ? "text-status-success-DEFAULT" : "text-text-tertiary"
              }`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mb-4 mx-1.5 transition-all ${
                current > s.id ? "bg-status-success-DEFAULT" : "bg-gray-200"
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const ReturnPage = ({ api }) => {  // `api` = axios instance from createApiClient
  const [mode, setMode] = useState("return");
  const [step, setStep] = useState(STEP.SEARCH);

  const [foundSale, setFoundSale] = useState(null);
  const [foundItem, setFoundItem] = useState(null);
  const [notFoundQuery, setNotFoundQuery] = useState("");

  const [billingPrice, setBillingPrice] = useState("");
  const [returnQty, setReturnQty] = useState(1);

  const [reason, setReason] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Helpers ────────────────────────────────────────────────────────────────

  const resetAll = useCallback((keepMode = false) => {
    if (!keepMode) setMode("return");
    setStep(STEP.SEARCH);
    setFoundSale(null);
    setFoundItem(null);
    setNotFoundQuery("");
    setBillingPrice("");
    setReturnQty(1);
    setReason("");
    setReasonNote("");
    setErrors({});
  }, []);

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setStep(STEP.SEARCH);
    setFoundSale(null);
    setFoundItem(null);
    setNotFoundQuery("");
    setBillingPrice("");
    setReturnQty(1);
    setReason("");
    setReasonNote("");
    setErrors({});
  };

  const handleProductFound = useCallback(({ sale, item }) => {
    setFoundSale(sale);
    setFoundItem(item);
    setBillingPrice(String(item.unitPrice));
    setReturnQty(1);
    setNotFoundQuery("");
    setStep(STEP.DETAILS);
  }, []);

  const handleNotFound = useCallback((q) => {
    setNotFoundQuery(q);
    setFoundSale(null);
    setFoundItem(null);
  }, []);

  const validate = () => {
    const errs = {};
    if (!billingPrice || Number(billingPrice) <= 0) errs.billingPrice = "Enter a valid billing price.";
    if (!reason) errs.reason = "Please select a reason.";
    if (reason === "other" && !reasonNote.trim()) errs.reason = "Please describe the reason.";
    return errs;
  };

  const handleReturnSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);

    const payload = mapReturnData({
      sale: foundSale,
      returnItems: [{ ...foundItem, returnQty, unitPrice: Number(billingPrice) }],
      reason,
      reasonNote,
      mode: "return",
      exchangeItems: [],
    });

    try {
      await returnApi.createReturn(api, payload);
      showSuccess("Return processed successfully");
      resetAll(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to process return";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExchangeSubmit = ({ newProduct, newSize, newQty }) => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);

    const payload = mapReturnData({
      sale: foundSale,
      returnItems: [{ ...foundItem, returnQty, unitPrice: Number(billingPrice) }],
      reason,
      reasonNote,
      mode: "exchange",
      exchangeItems: [{ ...newProduct?.item, qty: newQty, size: newSize }],
    });

    // TODO: ADD BACKEND CODE HERE — await returnApi.createExchange(api, payload)
    console.log("Exchange payload:", payload);
    setTimeout(() => {
      setIsSubmitting(false);
      showSuccess("Exchange processed successfully");
      resetAll(true);
    }, 800);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        icon="↩"
        title="Return & Exchange"
        description="Select transaction type, then scan or enter the product code."
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-background-secondary shadow-soft">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {[
            { value: "return", label: "↩ Return", desc: "Refund a purchased item" },
            // { value: "exchange", label: "🔄 Exchange", desc: "Swap for a different item" },
          ].map((tab) => {
            const active = mode === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                // onClick={() => handleTabChange(tab.value)}
                className={[
                  "flex-1 px-5 py-4 text-left transition-all cursor-pointer focus:outline-none",
                  "border-b-2",
                  active
                    ? "border-primary bg-primary-subtle"
                    : "border-transparent hover:bg-background-subtle",
                ].join(" ")}
              >
                <p className={`text-sm font-bold ${active ? "text-primary" : "text-text-secondary"}`}>
                  {tab.label}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">{tab.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {/* Step indicator + start over */}
          <div className="mb-5 flex items-center justify-between">
            <StepIndicator current={step} mode={mode} />
            {step > STEP.SEARCH && (
              <button
                type="button"
                onClick={() => resetAll(true)}
                className="text-xs font-semibold text-text-tertiary hover:text-error transition-colors cursor-pointer"
              >
                ✕ Start Over
              </button>
            )}
          </div>

          {/* ── STEP 1: Scan / search ── */}
          {step === STEP.SEARCH && (
            <div className="space-y-4">
              <ReturnSearchBar
                api={api}
                label="Scan Barcode / Enter Product Code"
                onFound={handleProductFound}
                onNotFound={handleNotFound}
                autoFocus
              />
              {notFoundQuery && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-error/40 bg-error-subtle py-8 text-center">
                  <span className="text-3xl">🔎</span>
                  <div>
                    <p className="text-sm font-bold text-error">Product Not Found</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      No product matched{" "}
                      <span className="font-semibold">"{notFoundQuery}"</span>.
                      Check the code and try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Product details + form ── */}
          {step === STEP.DETAILS && (
            <div className="space-y-5">
              <ProductDetailsCard
                heading="Returned Product"
                sale={foundSale}
                item={foundItem}
                billingPrice={billingPrice}
                onBillingPriceChange={(v) => {
                  setBillingPrice(v);
                  if (errors.billingPrice) setErrors((e) => ({ ...e, billingPrice: undefined }));
                }}
                returnQty={returnQty}
                onReturnQtyChange={setReturnQty}
              />
              {errors.billingPrice && (
                <p className="text-xs font-medium text-error">{errors.billingPrice}</p>
              )}

              {mode === "return" && (
                <ReturnForm
                  item={foundItem}
                  returnQty={returnQty}
                  billingPrice={billingPrice}
                  reason={reason}
                  onReasonChange={setReason}
                  reasonNote={reasonNote}
                  onReasonNoteChange={setReasonNote}
                  onSubmit={handleReturnSubmit}
                  isSubmitting={isSubmitting}
                  errors={errors}
                />
              )}
              {/* EXCHANGE TAB DISABLED
              {mode === "exchange" && (
                <ExchangePanel
                  returnedItem={foundItem}
                  returnQty={returnQty}
                  billingPrice={billingPrice}
                  reason={reason}
                  onReasonChange={setReason}
                  reasonNote={reasonNote}
                  onReasonNoteChange={setReasonNote}
                  onSubmit={handleExchangeSubmit}
                  isSubmitting={isSubmitting}
                  errors={errors}
                />
              )}
              */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnPage;
