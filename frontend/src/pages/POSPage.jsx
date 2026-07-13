import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOffline } from "../hooks/useOffline";
import CustomerFormModal from "../components/customer/CustomerFormModal";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import {
  POSHeader,
  POSSearchSection,
  POSItemsSection,
  POSCustomerSection,
  POSSummarySection,
  POSPaymentsSection,
  POSActionsSection,
  emptyLine,
  emptyPayment,
  validateLine,
  validatePayment,
  recalcLine,
} from "../components/posPage";
import { loadVatRate, loadCurrencySettings } from "../api/settings/settings";
import {
  loadActiveItems as loadItems,
  loadItemCategories as loadCategories,
  searchItemByBarcode,
} from "../api/inventory/items";
import { loadCustomers, createCustomer } from "../api/customer/customers";
import { saveSale, saveSaleOffline } from "../api/sales/sales";
import { showSuccess, showError, errorMessages } from "../utils/toastHelper";

const POSPage = ({ api }) => {
  const navigate = useNavigate();
  const { isOffline } = useOffline();
  const barcodeInputRef = useRef(null);

  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [lines, setLines] = useState([]);
  const [lineErrors, setLineErrors] = useState([{}]);

  // Search + debounce
  const {
    query,
    setQuery,
    filteredItems: searchFiltered,
    isSearching,
  } = usePrefixSearch(
    allItems,
    (item) => [item.name, item.barcode, item.brand, item.category, item.sku],
    300,
  );

  // ✅ local list for UI dropdown (your old code referenced setSearchResults but never defined it)
  const [searchResults, setSearchResults] = useState([]);

  const [barcode, setBarcode] = useState("");

  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerFormSaving, setCustomerFormSaving] = useState(false);

  const [discountTotal, setDiscountTotal] = useState(0);
  const [isTaxInvoice, setIsTaxInvoice] = useState(false);
  const [vatRate, setVatRate] = useState(0.15);

  const [currencySymbol, setCurrencySymbol] = useState("Rs.");
  const [currencyPosition, setCurrencyPosition] = useState("before");

  const [payments, setPayments] = useState([emptyPayment()]);
  const [paymentErrors, setPaymentErrors] = useState([{}]);

  // Load VAT rate and currency settings
  useEffect(() => {
    const initSettings = async () => {
      try {
        const rate = await loadVatRate(api);
        setVatRate(rate);

        const currencySettings = await loadCurrencySettings(api);
        setCurrencySymbol(currencySettings.currencySymbol);
        setCurrencyPosition(currencySettings.currencyPosition);
      } catch (error) {
        showError(errorMessages.load("settings") + ". Using defaults.");
      }
    };
    initSettings();
  }, [api]);

  // Load items (✅ must include inventory.onHand + sellingPrice + tax fields)
  useEffect(() => {
    const initItems = async () => {
      try {
        const items = await loadItems(api);
        setAllItems(items);
      } catch (error) {
        showError(errorMessages.load("items"));
      }
    };
    initItems();
  }, [api]);

  // Load categories
  useEffect(() => {
    const initCategories = async () => {
      try {
        const cats = await loadCategories(api);
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    initCategories();
  }, [api]);

  // Derive categories fallback
  useEffect(() => {
    if (!allItems.length) return;
    setCategories((prev) => {
      if (prev && prev.length) return prev;
      return Array.from(
        new Set(allItems.map((i) => i.category).filter(Boolean)),
      );
    });
  }, [allItems]);

  // Load customers
  const refreshCustomers = async () => {
    try {
      const custs = await loadCustomers(api);
      setCustomers(custs);
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  };

  useEffect(() => {
    refreshCustomers();
  }, [api]);

  // Search results (apply category filter on top of debounced results)
  const filteredByCategory = useMemo(() => {
    const base = selectedCategory
      ? searchFiltered.filter(
          (item) => (item.category || "") === selectedCategory,
        )
      : searchFiltered;
    return base;
  }, [searchFiltered, selectedCategory]);

  useEffect(() => {
    // show dropdown only when query exists
    if (!query) {
      setSearchResults([]);
      return;
    }
    setSearchResults(filteredByCategory.slice(0, 50));
  }, [query, filteredByCategory]);

  const recalcLineWithVat = (line, useTaxInvoice = isTaxInvoice) => {
    return recalcLine(line, vatRate, useTaxInvoice);
  };

  const recalcLinesForVat = (nextIsTaxInvoice) => {
    setLines((prev) =>
      prev.map((line) => recalcLineWithVat(line, nextIsTaxInvoice)),
    );
  };

  const ensureLineErrorsLength = (linesArr) => {
    setLineErrors((prev) => {
      const next = [...prev];
      while (next.length < linesArr.length) next.push({});
      while (next.length > linesArr.length) next.pop();
      return next;
    });
  };

  const ensurePaymentErrorsLength = (paymentsArr) => {
    setPaymentErrors((prev) => {
      const next = [...prev];
      while (next.length < paymentsArr.length) next.push({});
      while (next.length > paymentsArr.length) next.pop();
      return next;
    });
  };

  const syncLineError = (idx, line) => {
    setLineErrors((prev) => {
      const next = [...prev];
      next[idx] = validateLine(line);
      return next;
    });
  };

  const updateLine = (idx, updates) => {
    setLines((prev) => {
      const next = [...prev];
      const merged = { ...next[idx], ...updates };
      const recalculated = recalcLineWithVat(merged);
      next[idx] = recalculated;
      ensureLineErrorsLength(next);
      syncLineError(idx, recalculated);
      return next;
    });
  };

  const deleteLine = (idx) => {
    setLines((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      ensureLineErrorsLength(next);
      return next.length ? next : [];
    });
  };

  const findFirstEmptyLineIndex = () => {
    const index = lines.findIndex((l) => !l.item && !l.name);
    return index === -1 ? lines.length : index;
  };

  // Only add a new row when user clicks '+ Add Row'
  const addEmptyLineIfNeeded = () => {
    setLines((prev) => {
      const newLines = [...prev, emptyLine()];
      ensureLineErrorsLength(newLines);
      return newLines;
    });
  };

  const handleSelectItem = (idx, item) => {
    if (!item) return;

    // block inactive (extra safety)
    if (item.isActive === false) {
      showError(errorMessages.inactive("item"));
      return;
    }

    const indexToUse = idx ?? findFirstEmptyLineIndex();

    setLines((prev) => {
      const next = [...prev];
      // Only add/replace at index if it exists, else push
      let targetIdx = indexToUse;
      if (targetIdx >= next.length) {
        next.push({});
      }

      // If batch-tracked and batch info present, copy batchNumber/_id to line
      let batchNumber = undefined;
      let batchId = undefined;
      if (item.isBatchTracked && item.selectedBatch) {
        batchNumber = item.selectedBatch.batchNumber;
        batchId = item.selectedBatch._id;
      }

      const baseLine = {
        ...next[targetIdx],
        item,
        itemId: item._id,
        name: item.name,
        unit: item.baseUnit,
        unitPrice: Number(item.sellingPrice || 0),
        qty: Number(next[targetIdx]?.qty || 1),
        discount: Number(next[targetIdx]?.discount || 0),
        ...(batchNumber ? { batchNumber } : {}),
        ...(batchId ? { batchId } : {}),
        ...(item.selectedBatch ? { selectedBatch: item.selectedBatch } : {}),
      };

      const recalculated = recalcLineWithVat(baseLine);
      next[targetIdx] = recalculated;

      ensureLineErrorsLength(next);
      syncLineError(targetIdx, recalculated);
      return next;
    });

    setQuery("");
    setSearchResults([]);
  };

  const [barcodeScannedItem, setBarcodeScannedItem] = useState(null);

  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) {
      showError("Please scan or enter a barcode");
      return;
    }

    try {
      const item = await searchItemByBarcode(api, code);
      if (item.isBatchTracked) {
        setBarcodeScannedItem(item);
        setBarcode("");
      } else {
        handleSelectItem(null, item);
        showSuccess(`Item added: ${item.name}`);
        setBarcode("");
        barcodeInputRef.current?.focus();
      }
    } catch (err) {
      showError(
        err?.response?.data?.message || "No item found for this barcode",
      );
    }
  };

  // Totals
  const lineTotalsSum = lines.reduce(
    (sum, l) => sum + (Number(l.lineTotal) || 0),
    0,
  );
  const taxTotal = lines.reduce(
    (sum, l) => sum + (Number(l.taxAmount) || 0),
    0,
  );
  const baseTotal = lineTotalsSum - taxTotal;

  const discountAmount = Number(discountTotal) || 0;
  const grandTotalRaw = lineTotalsSum - discountAmount;
  const grandTotal = grandTotalRaw > 0 ? grandTotalRaw : 0;

  const totalPayments = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );

  const updatePayment = (idx, updates) => {
    setPayments((prev) => {
      const next = [...prev];
      const merged = { ...next[idx], ...updates };
      next[idx] = merged;

      ensurePaymentErrorsLength(next);
      setPaymentErrors((prevErr) => {
        const errs = [...prevErr];
        errs[idx] = validatePayment(merged);
        return errs;
      });

      return next;
    });
  };

  const addPaymentRow = () => {
    setPayments((prev) => {
      const next = [...prev, emptyPayment()];
      ensurePaymentErrorsLength(next);
      return next;
    });
  };

  const deletePaymentRow = (idx) => {
    setPayments((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      const final = next.length === 0 ? [emptyPayment()] : next;
      ensurePaymentErrorsLength(final);
      return final;
    });
  };

  const filteredCustomers = useMemo(
    () => customers.filter((c) => c.type === "credit" || c.type === "both"),
    [customers],
  );

  const handleCreateOrUpdateCustomer = async (formData) => {
    try {
      setCustomerFormSaving(true);
      const data = await createCustomer(api, formData);
      setCustomers((prev) => [...prev, data]);
      setCustomer(data);
      setShowCustomerModal(false);
      showSuccess("Customer created successfully.");
    } catch (err) {
      showError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create customer.",
      );
    } finally {
      setCustomerFormSaving(false);
    }
  };

  const validateBeforeSave = (status) => {
    const newLineErrors = lines.map((l) => validateLine(l));
    setLineErrors(newLineErrors);

    const validLines = lines.filter((l) => l.item);
    if (!validLines.length) {
      showError("Please add at least one item to the bill.");
      return false;
    }

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].item) {
        const err = newLineErrors[i];
        if (err && Object.keys(err).length > 0) {
          showError(
            `Please check in line ${i + 1} (check red-highlighted fields).`,
          );
          return false;
        }
      }
    }

    if (discountAmount < 0) {
      showError(errorMessages.validation);
      return false;
    }
    if (discountAmount > baseTotal + taxTotal) {
      showError("Bill discount cannot be greater than the total amount");
      return false;
    }

    const newPaymentErrors = payments.map((p) => validatePayment(p));
    setPaymentErrors(newPaymentErrors);

    if (newPaymentErrors.some((e) => e && Object.keys(e).length > 0)) {
      showError("Please check the payment details");
      return false;
    }

    const sumPayments = totalPayments;

    if (status === "paid") {
      if (sumPayments <= 0) {
        showError("Payment amount must be greater than 0 for a paid bill");
        return false;
      }
      if (sumPayments < grandTotal) {
        showError(
          "Total payments cannot be less than the grand total for a paid invoice",
        );
        return false;
      }
    }

    if (status === "credit") {
      if (!customer) {
        showError("Customer is required for credit sales");
        return false;
      }
      if (customer.type === "cash") {
        showError(
          "This customer is marked as cash-only. Select a credit-enabled customer",
        );
        return false;
      }
      const creditPortion = grandTotal - sumPayments;
      if (creditPortion <= 0) {
        showError(
          "Credit amount must be greater than 0 for a credit sale. Use Paid instead",
        );
        return false;
      }
      if (
        typeof customer.creditLimit === "number" &&
        customer.creditLimit > 0 &&
        typeof customer.currentBalance === "number"
      ) {
        const newBalance = customer.currentBalance + creditPortion;
        if (newBalance > customer.creditLimit) {
          showError(
            "This sale would exceed the customer's credit limit. Reduce credit or update limit",
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async (status = "paid", saveAsPending = false) => {
    if (!validateBeforeSave(status)) return;
    setIsSaving(true);

    const validLines = lines.filter((l) => l.item);

    const cleanedPayments = payments
      .filter((p) => Number(p.amount) > 0)
      .map((p) => ({
        method: p.method,
        amount: Number(p.amount),
      }));

    const sumPayments = cleanedPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0,
    );

    let balanceDue = grandTotal - sumPayments;
    if (status === "paid" && sumPayments >= grandTotal) balanceDue = 0;
    if (balanceDue < 0) balanceDue = 0;

    let finalStatus = status;
    if (status === "credit" && sumPayments > 0 && sumPayments < grandTotal)
      finalStatus = "partial";

    const payload = {
      billNumber: `BILL-${Date.now()}`,
      customer: customer?._id || null,
      items: validLines.map((l) => ({
        item: l.itemId,
        description: l.name,
        qty: Number(l.qty),
        unit: l.unit,
        unitPrice: Number(l.unitPrice),
        discount: Number(l.discount),
        taxAmount: Number(l.taxAmount),
        lineTotal: Number(l.lineTotal),
        // Ensure batchNumber is sent for batch-tracked items
        ...(l.item && l.item.isBatchTracked && l.batchNumber
          ? { batchNumber: l.batchNumber }
          : {}),
      })),
      subTotal: baseTotal,
      discountTotal: discountAmount,
      taxTotal,
      grandTotal,
      payments: cleanedPayments,
      balanceDue,
      status: finalStatus,
      isTaxInvoice,
      savedAsPending: saveAsPending,
    };

    try {
      if (isOffline) {
        saveSaleOffline(payload);
        showSuccess("Saved offline. Will sync when online");
      } else {
        const savedSale = await saveSale(api, payload);
        showSuccess("Sale saved successfully");

        // Refresh customers so credit balances are up to date in this session
        const updatedCustomers = await loadCustomers(api);
        setCustomers(updatedCustomers);
        // Keep the selected customer object in sync (updated balance)
        if (customer) {
          const fresh = updatedCustomers.find((c) => c._id === customer._id);
          if (fresh) setCustomer(fresh);
        }

        if (
          finalStatus === "paid" ||
          finalStatus === "credit" ||
          finalStatus === "partial"
        ) {
          navigate(`/invoice/thermal/${savedSale._id}`);
        }
      }

      // reset
      setLines([]);
      setLineErrors([{}]);
      setDiscountTotal(0);
      setPayments([emptyPayment()]);
      setPaymentErrors([{}]);
      setQuery("");
      setSearchResults([]);
      setSelectedCategory("");
      setBarcode("");
      barcodeInputRef.current?.focus();
    } catch (err) {
      showError(
        err?.response?.data?.message || err?.message || "Failed to save sale.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasValidLine = lines.some((l) => l.item);
  const hasLineError = lines.some(
    (l, idx) =>
      l.item && lineErrors[idx] && Object.keys(lineErrors[idx]).length,
  );
  const discountInvalid =
    discountAmount < 0 || discountAmount > baseTotal + taxTotal;
  const paymentHasError = paymentErrors.some(
    (e) => e && Object.keys(e).length > 0,
  );

  const [isSaving, setIsSaving] = useState(false);

  const canSavePaid =
    !isSaving &&
    hasValidLine &&
    !hasLineError &&
    !discountInvalid &&
    !paymentHasError &&
    grandTotal > 0 &&
    totalPayments >= grandTotal;
  const canSaveCredit =
    !isSaving &&
    hasValidLine && !hasLineError && !discountInvalid && !paymentHasError;
  const canSavePending =
    !isSaving &&
    hasValidLine && !hasLineError && !discountInvalid && !paymentHasError;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-4 md:px-6 lg:px-8">
      {/* No Toaster component needed - centralized in App.jsx */}

      <POSHeader isOffline={isOffline} vatRate={vatRate} />

      {/* Main */}
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
          {/* Search & Barcode */}
          <POSSearchSection
            api={api}
            query={query}
            setQuery={setQuery}
            isSearching={isSearching}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchResults={searchResults}
            handleSelectItem={handleSelectItem}
            barcode={barcode}
            setBarcode={setBarcode}
            barcodeInputRef={barcodeInputRef}
            currencySymbol={currencySymbol}
            currencyPosition={currencyPosition}
            handleBarcodeSearch={handleBarcodeSearch}
            barcodeScannedItem={barcodeScannedItem}
            onBarcodeScannedItemClear={() => {
              setBarcodeScannedItem(null);
              barcodeInputRef.current?.focus();
            }}
            isTaxInvoice={isTaxInvoice}
            setIsTaxInvoice={setIsTaxInvoice}
            recalcLinesForVat={recalcLinesForVat}
          />

          {/* Items table */}
          <POSItemsSection
            lines={lines}
            lineErrors={lineErrors}
            updateLine={updateLine}
            deleteLine={deleteLine}
            addEmptyLineIfNeeded={addEmptyLineIfNeeded}
          />

          {/* Customer + Summary */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              {/* Customer */}
              <POSCustomerSection
                customer={customer}
                setCustomer={setCustomer}
                filteredCustomers={filteredCustomers}
                customers={customers}
                setShowCustomerModal={setShowCustomerModal}
                currencySymbol={currencySymbol}
                currencyPosition={currencyPosition}
              />

              {/* Totals + Payments */}
              <div className="space-y-6">
                <POSSummarySection
                  baseTotal={baseTotal}
                  currencySymbol={currencySymbol}
                  currencyPosition={currencyPosition}
                  taxTotal={taxTotal}
                  discountTotal={discountTotal}
                  setDiscountTotal={setDiscountTotal}
                  grandTotal={grandTotal}
                />

                <POSPaymentsSection
                  payments={payments}
                  currencySymbol={currencySymbol}
                  currencyPosition={currencyPosition}
                  paymentErrors={paymentErrors}
                  updatePayment={updatePayment}
                  addPaymentRow={addPaymentRow}
                  deletePaymentRow={deletePaymentRow}
                  totalPayments={totalPayments}
                  grandTotal={grandTotal}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <POSActionsSection
            canSavePending={canSavePending}
            canSaveCredit={canSaveCredit}
            canSavePaid={canSavePaid}
            onSavePending={() => handleSave("pending", true)}
            onSaveCredit={() => handleSave("credit", false)}
            onSavePaid={() => handleSave("paid", false)}
          />
        </div>
      </div>

      {/* Add Customer Modal */}
      <CustomerFormModal
        open={showCustomerModal}
        initialData={null}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleCreateOrUpdateCustomer}
        saving={customerFormSaving}
      />
    </div>
  );
};

export default POSPage;
