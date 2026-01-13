import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
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
import { loadVatRate } from "../api/settings/settings";
import {
  loadActiveItems as loadItems,
  loadItemCategories as loadCategories,
  searchItemByBarcode,
} from "../api/inventory/items";
import { loadCustomers, createCustomer } from "../api/customer/customers";
import { saveSale, saveSaleOffline } from "../api/sales/sales";

const POSPage = () => {
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
    300
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

  const [payments, setPayments] = useState([emptyPayment()]);
  const [paymentErrors, setPaymentErrors] = useState([{}]);

  // Load VAT rate
  useEffect(() => {
    const initVat = async () => {
      try {
        const rate = await loadVatRate();
        setVatRate(rate);
      } catch (error) {
        toast.error("Failed to load VAT rate. Using default.");
      }
    };
    initVat();
  }, []);

  // Load items (✅ must include inventory.onHand + sellingPrice + tax fields)
  useEffect(() => {
    const initItems = async () => {
      try {
        const items = await loadItems();
        setAllItems(items);
      } catch (error) {
        toast.error("Failed to load items.");
      }
    };
    initItems();
  }, []);

  // Load categories
  useEffect(() => {
    const initCategories = async () => {
      try {
        const cats = await loadCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    initCategories();
  }, []);

  // Derive categories fallback
  useEffect(() => {
    if (!allItems.length) return;
    setCategories((prev) => {
      if (prev && prev.length) return prev;
      return Array.from(
        new Set(allItems.map((i) => i.category).filter(Boolean))
      );
    });
  }, [allItems]);

  // Load customers
  useEffect(() => {
    const initCustomers = async () => {
      try {
        const custs = await loadCustomers();
        setCustomers(custs);
      } catch (error) {
        console.error("Failed to load customers:", error);
      }
    };
    initCustomers();
  }, []);

  // Search results (apply category filter on top of debounced results)
  const filteredByCategory = useMemo(() => {
    const base = selectedCategory
      ? searchFiltered.filter(
          (item) => (item.category || "") === selectedCategory
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
      prev.map((line) => recalcLineWithVat(line, nextIsTaxInvoice))
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

  const addEmptyLineIfNeeded = () => {
    setLines((prev) => {
      if (prev.length === 0) {
        const init = [emptyLine()];
        ensureLineErrorsLength(init);
        return init;
      }
      const last = prev[prev.length - 1];
      if (last.item || last.name) {
        const newLines = [...prev, emptyLine()];
        ensureLineErrorsLength(newLines);
        return newLines;
      }
      ensureLineErrorsLength(prev);
      return prev;
    });
  };

  const handleSelectItem = (idx, item) => {
    if (!item) return;

    // block inactive (extra safety)
    if (item.isActive === false) {
      toast.error("This item is inactive.");
      return;
    }

    const indexToUse = idx ?? findFirstEmptyLineIndex();

    setLines((prev) => {
      const next = [...prev];
      if (!next[indexToUse]) next.push(emptyLine());

      const baseLine = {
        ...next[indexToUse],
        item,
        itemId: item._id,
        name: item.name,
        unit: item.baseUnit,
        unitPrice: Number(item.sellingPrice || 0),
        qty: Number(next[indexToUse].qty || 1),
        discount: Number(next[indexToUse].discount || 0),
      };

      const recalculated = recalcLineWithVat(baseLine);
      next[indexToUse] = recalculated;

      // always ensure one extra row at end
      if (indexToUse === next.length - 1) next.push(emptyLine());

      ensureLineErrorsLength(next);
      syncLineError(indexToUse, recalculated);
      return next;
    });

    setQuery("");
    setSearchResults([]);
  };

  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) {
      toast.error("Please scan or enter a barcode.");
      return;
    }

    try {
      const item = await searchItemByBarcode(code);
      handleSelectItem(null, item);
      toast.success(`Item added: ${item.name}`);
      setBarcode("");
      barcodeInputRef.current?.focus();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "No item found for this barcode."
      );
    }
  };

  // Totals
  const lineTotalsSum = lines.reduce(
    (sum, l) => sum + (Number(l.lineTotal) || 0),
    0
  );
  const taxTotal = lines.reduce(
    (sum, l) => sum + (Number(l.taxAmount) || 0),
    0
  );
  const baseTotal = lineTotalsSum - taxTotal;

  const discountAmount = Number(discountTotal) || 0;
  const grandTotalRaw = lineTotalsSum - discountAmount;
  const grandTotal = grandTotalRaw > 0 ? grandTotalRaw : 0;

  const totalPayments = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
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
    [customers]
  );

  const handleCreateOrUpdateCustomer = async (formData) => {
    try {
      setCustomerFormSaving(true);
      const data = await createCustomer(formData);
      setCustomers((prev) => [...prev, data]);
      setCustomer(data);
      setShowCustomerModal(false);
      toast.success("Customer created successfully.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create customer."
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
      toast.error("Please add at least one item to the bill.");
      return false;
    }

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].item) {
        const err = newLineErrors[i];
        if (err && Object.keys(err).length > 0) {
          toast.error(
            `Please check in line ${i + 1} (check red-highlighted fields).`
          );
          return false;
        }
      }
    }

    if (discountAmount < 0) {
      toast.error("Bill discount must be a non-negative number.");
      return false;
    }
    if (discountAmount > baseTotal + taxTotal) {
      toast.error("Bill discount cannot be greater than the total amount.");
      return false;
    }

    const newPaymentErrors = payments.map((p) => validatePayment(p));
    setPaymentErrors(newPaymentErrors);

    if (newPaymentErrors.some((e) => e && Object.keys(e).length > 0)) {
      toast.error("Please check the payment details");
      return false;
    }

    const sumPayments = totalPayments;

    if (status === "paid") {
      if (sumPayments <= 0) {
        toast.error("Payment amount must be greater than 0 for a paid bill.");
        return false;
      }
      if (sumPayments < grandTotal) {
        toast.error(
          "Total payments cannot be less than the grand total for a paid invoice."
        );
        return false;
      }
    }

    if (status === "credit") {
      if (!customer) {
        toast.error("Customer is required for credit sales.");
        return false;
      }
      if (customer.type === "cash") {
        toast.error(
          "This customer is marked as cash-only. Select a credit-enabled customer."
        );
        return false;
      }
      const creditPortion = grandTotal - sumPayments;
      if (creditPortion <= 0) {
        toast.error(
          "Credit amount must be greater than 0 for a credit sale. Use Paid instead."
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
          toast.error(
            "This sale would exceed the customer's credit limit. Reduce credit or update limit."
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async (status = "paid", saveAsPending = false) => {
    if (!validateBeforeSave(status)) return;

    const validLines = lines.filter((l) => l.item);

    const cleanedPayments = payments
      .filter((p) => Number(p.amount) > 0)
      .map((p) => ({
        method: p.method,
        amount: Number(p.amount),
      }));

    const sumPayments = cleanedPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
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
        toast.success("Saved offline. Will sync when online.");
      } else {
        const savedSale = await saveSale(payload);
        toast.success("Sale saved successfully.");

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
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save sale."
      );
    }
  };

  const hasValidLine = lines.some((l) => l.item);
  const hasLineError = lines.some(
    (l, idx) => l.item && lineErrors[idx] && Object.keys(lineErrors[idx]).length
  );
  const discountInvalid =
    discountAmount < 0 || discountAmount > baseTotal + taxTotal;
  const paymentHasError = paymentErrors.some(
    (e) => e && Object.keys(e).length > 0
  );

  const canSavePaid =
    hasValidLine &&
    !hasLineError &&
    !discountInvalid &&
    !paymentHasError &&
    grandTotal > 0 &&
    totalPayments >= grandTotal;
  const canSaveCredit =
    hasValidLine && !hasLineError && !discountInvalid && !paymentHasError;
  const canSavePending =
    hasValidLine && !hasLineError && !discountInvalid && !paymentHasError;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-4 md:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{ className: "text-sm font-medium", duration: 3000 }}
      />

      <POSHeader isOffline={isOffline} vatRate={vatRate} />

      {/* Main */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Search & Barcode */}
          <POSSearchSection
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
            handleBarcodeSearch={handleBarcodeSearch}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Customer */}
              <POSCustomerSection
                customer={customer}
                setCustomer={setCustomer}
                filteredCustomers={filteredCustomers}
                customers={customers}
                setShowCustomerModal={setShowCustomerModal}
              />

              {/* Totals + Payments */}
              <div className="space-y-6">
                <POSSummarySection
                  baseTotal={baseTotal}
                  taxTotal={taxTotal}
                  discountTotal={discountTotal}
                  setDiscountTotal={setDiscountTotal}
                  grandTotal={grandTotal}
                />

                <POSPaymentsSection
                  payments={payments}
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
