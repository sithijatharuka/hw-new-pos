import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api";
import { useOffline } from "../hooks/useOffline";
import CustomerSelector from "../components/customer/CustomerSelector";
import CustomerFormModal from "../components/customer/CustomerFormModal";
import * as customerApi from "../components/customer/customerApi";
import { usePrefixSearch } from "../hooks/usePrefixSearch";
import { SearchBar } from "../components/common";
import EntityCardList from "../components/common/EntityCardList";

const emptyLine = () => ({
  item: null,
  itemId: "",
  name: "",
  qty: 1,
  unit: "",
  unitPrice: 0,
  discount: 0,
  taxAmount: 0,
  lineTotal: 0,
});

const emptyPayment = () => ({
  method: "cash",
  amount: "",
});

const validateLine = (line) => {
  const errors = {};
  const hasContent =
    line.item ||
    line.name?.trim() ||
    line.qty ||
    line.unit ||
    line.unitPrice ||
    line.discount;

  if (!hasContent) return errors;

  const name = (line.name || "").trim();
  if (!name) errors.name = "Item name is required.";

  const qty = Number(line.qty);
  if (Number.isNaN(qty) || qty <= 0)
    errors.qty = "Quantity must be greater than 0.";

  const unit = (line.unit || "").trim();
  if (!unit) errors.unit = "Unit is required.";

  const price = Number(line.unitPrice);
  if (Number.isNaN(price) || price < 0)
    errors.unitPrice = "Unit price must be a non-negative number.";

  const disc = Number(line.discount);
  if (Number.isNaN(disc) || disc < 0 || disc > 100)
    errors.discount = "Discount must be between 0 and 100.";

  return errors;
};

const validatePayment = (payment) => {
  const errors = {};
  if (!payment.method) errors.method = "Payment method is required.";
  const amountNum = Number(payment.amount);
  if (Number.isNaN(amountNum) || amountNum < 0)
    errors.amount = "Amount must be 0 or greater.";
  return errors;
};

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
    const loadVat = async () => {
      try {
        const { data } = await api.get("/settings");
        if (typeof data.vatRate === "number" && data.vatRate >= 0)
          setVatRate(data.vatRate);
      } catch {}
    };
    loadVat();
  }, []);

  // Load items (✅ must include inventory.onHand + sellingPrice + tax fields)
  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data } = await api.get("/items", {
          params: { isActive: true },
        });
        setAllItems(data || []);
      } catch {
        toast.error("Failed to load items.");
      }
    };
    loadItems();
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get("/items/categories/list");
        setCategories(data || []);
      } catch {}
    };
    loadCategories();
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
    const loadCustomers = async () => {
      try {
        const { data } = await api.get("/customers");
        setCustomers(data || []);
      } catch {}
    };
    loadCustomers();
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

  const recalcLine = (line, useTaxInvoice = isTaxInvoice) => {
    const qty = Number(line.qty) || 0;
    const price = Number(line.unitPrice) || 0;
    const discPercent = Number(line.discount) || 0;

    const baseBeforeDisc = qty * price;
    const discAmount = baseBeforeDisc * (discPercent / 100);
    const base = baseBeforeDisc - discAmount;

    const taxable = !!(line.item && line.item.taxApplicable);
    const tax = useTaxInvoice && taxable ? base * vatRate : 0;

    return { ...line, taxAmount: tax, lineTotal: base + tax };
  };

  const recalcLinesForVat = (nextIsTaxInvoice) => {
    setLines((prev) => prev.map((line) => recalcLine(line, nextIsTaxInvoice)));
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
      const recalculated = recalcLine(merged);
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

      const recalculated = recalcLine(baseLine);
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
      // ✅ uses /items/barcode/:code
      const { data } = await api.get(
        `/items/barcode/${encodeURIComponent(code)}`
      );
      handleSelectItem(null, data);
      toast.success(`Item added: ${data.name}`);
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
      const { data } = await customerApi.createCustomer(formData);
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
        const queue = JSON.parse(localStorage.getItem("offlineSales") || "[]");
        queue.push(payload);
        localStorage.setItem("offlineSales", JSON.stringify(queue));
        toast.success("Saved offline. Will sync when online.");
      } else {
        const { data: savedSale } = await api.post("/sales", payload);
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

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 px-2 sm:px-0">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🧾</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Point of Sale Billing
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl text-xs sm:text-sm md:text-base px-2">
            Barcode scanning, VAT compliance, and real-time calculations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                isOffline
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              {isOffline ? "🔴 Offline Mode" : "🟢 Online Mode"}
            </div>
            <div className="px-4 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
              VAT: {(vatRate * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Search & Barcode */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Search Items
                    </label>
                    <SearchBar
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, barcode, sku..."
                      isSearching={isSearching}
                    />
                  </div>

                  <div className="w-full md:w-56">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        className="w-full h-11 sm:h-12 pl-4 pr-10 bg-white border-2 border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all duration-200 text-sm"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSearchResults([]);
                      }}
                      className="w-full md:w-auto h-11 sm:h-12 px-4 sm:px-6 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all duration-200 font-medium cursor-pointer whitespace-nowrap text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {query && searchResults.length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((item) => {
                        const onHand = Number(item?.inventory?.onHand || 0);
                        return (
                          <button
                            key={item._id}
                            type="button"
                            className="w-full px-3 sm:px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors duration-150"
                            onClick={() => handleSelectItem(null, item)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-sm">📦</span>
                              </div>
                              <div className="text-left min-w-0">
                                <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.category || "Uncategorized"}
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <div className="font-semibold text-gray-900 text-sm">
                                Rs. {Number(item.sellingPrice || 0).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Stock: {onHand} {item.baseUnit}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Barcode + Invoice type */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Barcode Scanner
                  </label>
                  <form onSubmit={handleBarcodeSearch}>
                    <div className="relative">
                      <input
                        ref={barcodeInputRef}
                        className="w-full h-11 sm:h-12 pl-10 pr-24 bg-white border-2 border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Scan barcode here"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        📟
                      </div>
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-200 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                  <p className="mt-2 text-xs text-gray-500">
                    Focus here and scan barcode for instant item lookup.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Invoice Type
                  </label>
                  <div className="flex gap-2 flex-col xs:flex-row">
                    <button
                      type="button"
                      className={`flex-1 h-10 sm:h-11 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 ${
                        !isTaxInvoice
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      } cursor-pointer active:scale-95`}
                      onClick={() => {
                        setIsTaxInvoice(false);
                        recalcLinesForVat(false);
                      }}
                    >
                      Normal Bill
                    </button>
                    <button
                      type="button"
                      className={`flex-1 h-10 sm:h-11 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 ${
                        isTaxInvoice
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      } cursor-pointer active:scale-95`}
                      onClick={() => {
                        setIsTaxInvoice(true);
                        recalcLinesForVat(true);
                      }}
                    >
                      VAT Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Items List
              </h3>
              <button
                type="button"
                onClick={addEmptyLineIfNeeded}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:scale-95 transition-all duration-200 font-medium cursor-pointer text-sm self-start sm:self-auto"
              >
                + Add Row
              </button>
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-3 sm:px-4 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="py-3 px-3 sm:px-4 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Disc %
                      </th>
                      <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        VAT
                      </th>
                      <th className="py-3 px-3 sm:px-4 text-right text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="py-3 px-3 sm:px-4 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lines.map((line, idx) => {
                      const err = lineErrors[idx] || {};
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-3 sm:px-4 align-top min-w-[180px]">
                            <div
                              className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border transition-all break-words ${
                                err.name
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-gray-200 bg-gray-50 text-gray-900"
                              }`}
                            >
                              <span
                                className={
                                  line.name ? "" : "text-gray-400 text-xs"
                                }
                              >
                                {line.name ||
                                  "Select item from search or barcode"}
                              </span>
                            </div>
                            {err.name && (
                              <p className="mt-1 text-[10px] sm:text-xs text-red-600">
                                {err.name}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-3 sm:px-4 align-top">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={`w-20 sm:w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                                err.qty
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-gray-300 bg-white text-gray-900"
                              }`}
                              value={line.qty}
                              onChange={(e) =>
                                updateLine(idx, { qty: e.target.value })
                              }
                            />
                            {err.qty && (
                              <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                                {err.qty}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-3 sm:px-4 align-top">
                            <input
                              className={`w-20 sm:w-full px-3 py-2 text-xs sm:text-sm text-center rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                                err.unit
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-gray-300 bg-white text-gray-900"
                              }`}
                              value={line.unit}
                              onChange={(e) =>
                                updateLine(idx, { unit: e.target.value })
                              }
                              placeholder="unit"
                            />
                            {err.unit && (
                              <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-center">
                                {err.unit}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-3 sm:px-4 align-top">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className={`w-24 sm:w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                                err.unitPrice
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-gray-300 bg-white text-gray-900"
                              }`}
                              value={line.unitPrice}
                              onChange={(e) =>
                                updateLine(idx, { unitPrice: e.target.value })
                              }
                            />
                            {err.unitPrice && (
                              <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                                {err.unitPrice}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-3 sm:px-4 align-top">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              className={`w-20 sm:w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                                err.discount
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-gray-300 bg-white text-gray-900"
                              }`}
                              value={line.discount}
                              onChange={(e) =>
                                updateLine(idx, { discount: e.target.value })
                              }
                            />
                            {err.discount && (
                              <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                                {err.discount}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm text-gray-700 font-medium align-top whitespace-nowrap">
                            {Number(line.taxAmount || 0).toFixed(2)}
                          </td>

                          <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm text-gray-900 font-bold align-top whitespace-nowrap">
                            {Number(line.lineTotal || 0).toFixed(2)}
                          </td>

                          <td className="py-3 px-3 sm:px-4 text-center align-top">
                            {line.item && (
                              <button
                                type="button"
                                onClick={() => deleteLine(idx)}
                                className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete line"
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="block lg:hidden">
              <EntityCardList
                items={lines}
                renderCard={(line, idx) => {
                  const err = lineErrors[idx] || {};
                  return (
                    <div className="border border-gray-200 rounded-xl bg-gray-50 p-3 sm:p-4 space-y-3">
                      <div>
                        <div
                          className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border transition-all break-words ${
                            err.name
                              ? "border-red-300 bg-red-50 text-red-900"
                              : "border-gray-200 bg-white text-gray-900"
                          }`}
                        >
                          <span
                            className={line.name ? "" : "text-gray-400 text-xs"}
                          >
                            {line.name || "Select item from search or barcode"}
                          </span>
                        </div>
                        {err.name && (
                          <p className="mt-1 text-[10px] sm:text-xs text-red-600">
                            {err.name}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-gray-600 mb-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={`w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                              err.qty
                                ? "border-red-300 bg-red-50 text-red-900"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                            value={line.qty}
                            onChange={(e) =>
                              updateLine(idx, { qty: e.target.value })
                            }
                          />
                          {err.qty && (
                            <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                              {err.qty}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-600 mb-1">
                            Unit
                          </label>
                          <input
                            className={`w-full px-3 py-2 text-xs sm:text-sm text-center rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                              err.unit
                                ? "border-red-300 bg-red-50 text-red-900"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                            value={line.unit}
                            onChange={(e) =>
                              updateLine(idx, { unit: e.target.value })
                            }
                            placeholder="unit"
                          />
                          {err.unit && (
                            <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-center">
                              {err.unit}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-gray-600 mb-1">
                            Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={`w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                              err.unitPrice
                                ? "border-red-300 bg-red-50 text-red-900"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                            value={line.unitPrice}
                            onChange={(e) =>
                              updateLine(idx, { unitPrice: e.target.value })
                            }
                          />
                          {err.unitPrice && (
                            <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                              {err.unitPrice}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-600 mb-1">
                            Disc %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            className={`w-full px-3 py-2 text-xs sm:text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                              err.discount
                                ? "border-red-300 bg-red-50 text-red-900"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                            value={line.discount}
                            onChange={(e) =>
                              updateLine(idx, { discount: e.target.value })
                            }
                          />
                          {err.discount && (
                            <p className="mt-1 text-[10px] sm:text-xs text-red-600 text-right">
                              {err.discount}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs sm:text-sm text-gray-600">
                          <div>
                            VAT:{" "}
                            <span className="font-medium text-gray-800">
                              {Number(line.taxAmount || 0).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            Total:{" "}
                            <span className="font-bold text-gray-900">
                              {Number(line.lineTotal || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {line.item && (
                          <button
                            type="button"
                            onClick={() => deleteLine(idx)}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete line"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }}
                emptyState={
                  <div className="flex flex-col items-center justify-center space-y-3 text-center py-8 text-gray-400">
                    <p className="text-sm">
                      No items added yet. Start by adding items above.
                    </p>
                  </div>
                }
              />
            </div>
          </div>

          {/* Customer + Summary */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Customer */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                    Customer Information
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Required for{" "}
                    <span className="font-semibold text-primary">
                      credit sales
                    </span>
                    , optional for cash sales.
                  </p>

                  <CustomerSelector
                    customers={
                      filteredCustomers.length ? filteredCustomers : customers
                    }
                    value={customer}
                    onChange={setCustomer}
                    onAddNew={() => setShowCustomerModal(true)}
                    showBalances={true}
                  />
                </div>
              </div>

              {/* Totals + Payments */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                    Bill Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-700">Sub Total</span>
                      <span className="font-medium text-gray-900">
                        Rs. {baseTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-700">Total VAT</span>
                      <span className="font-medium text-gray-900">
                        Rs. {taxTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 gap-3">
                      <span className="text-gray-700">Bill Discount</span>
                      <input
                        type="number"
                        min="0"
                        className="w-28 sm:w-32 px-3 py-2 text-right bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        value={discountTotal}
                        onChange={(e) =>
                          setDiscountTotal(Number(e.target.value || 0))
                        }
                      />
                    </div>
                    <div className="border-t border-gray-300 pt-3 sm:pt-4 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">
                          Grand Total
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-primary">
                          Rs. {grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Payments
                    </h3>
                    <button
                      type="button"
                      onClick={addPaymentRow}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 font-medium cursor-pointer text-sm self-stretch sm:self-auto"
                    >
                      + Add Payment
                    </button>
                  </div>

                  <div className="space-y-4">
                    {payments.map((p, idx) => {
                      const err = paymentErrors[idx] || {};
                      const paymentsSoFar = payments
                        .slice(0, idx)
                        .reduce(
                          (sum, payment) => sum + (Number(payment.amount) || 0),
                          0
                        );
                      const balance =
                        grandTotal - paymentsSoFar - (Number(p.amount) || 0);

                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
                            <div className="md:col-span-4">
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                Method
                              </label>
                              <select
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                                  err.method
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                value={p.method}
                                onChange={(e) =>
                                  updatePayment(idx, { method: e.target.value })
                                }
                              >
                                <option value="cash">💵 Cash</option>
                                <option value="card">💳 Card</option>
                                <option value="bank">🏦 Bank Transfer</option>
                              </select>
                              {err.method && (
                                <p className="mt-1 text-xs text-red-600">
                                  {err.method}
                                </p>
                              )}
                            </div>

                            <div className="md:col-span-4">
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                Amount
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={`w-full px-3 py-2 border rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                                  err.amount
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                value={p.amount}
                                onChange={(e) =>
                                  updatePayment(idx, {
                                    amount: Number(e.target.value || 0),
                                  })
                                }
                                placeholder="0.00"
                              />
                              {err.amount && (
                                <p className="mt-1 text-xs text-red-600 text-right">
                                  {err.amount}
                                </p>
                              )}
                            </div>

                            <div className="md:col-span-3">
                              <div
                                className={`px-3 py-2 border rounded-lg text-right font-medium text-xs sm:text-sm ${
                                  balance < 0
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : balance === 0
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-blue-50 border-blue-200 text-blue-700"
                                }`}
                              >
                                {balance.toFixed(2)}
                              </div>
                              <div className="text-[11px] text-gray-500 text-right mt-1">
                                Balance
                              </div>
                            </div>

                            <div className="md:col-span-1 flex justify-end">
                              {payments.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => deletePaymentRow(idx)}
                                  className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remove payment"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 text-sm">
                          Total Payments
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-gray-900">
                          Rs. {totalPayments.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-end">
              <button
                type="button"
                disabled={!canSavePending}
                onClick={() => handleSave("pending", true)}
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
                onClick={() => handleSave("credit", false)}
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
                onClick={() => handleSave("paid", false)}
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
