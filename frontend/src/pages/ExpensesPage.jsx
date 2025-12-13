import React, { useEffect, useState } from "react";
import api from "../api";
import toast, { Toaster } from "react-hot-toast";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");

  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [errors, setErrors] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
  });

  // ---------- Helpers ----------

  const validateField = (field, value, currentForm = form) => {
    let error = "";

    switch (field) {
      case "category": {
        const v = (value || "").trim();
        if (!v) {
          error = "Category is required.";
        } else if (v.length > 50) {
          error = "Category must not exceed 50 characters.";
        }
        break;
      }

      case "description": {
        const v = (value || "").trim();
        if (!v) {
          error = "";
        } else if (v.length < 3) {
          error = "Description must be at least 3 characters.";
        } else if (v.length > 200) {
          error = "Description must not exceed 200 characters.";
        }
        break;
      }

      case "amount": {
        if (value === "" || value === null || value === undefined) {
          error = "Amount is required.";
        } else {
          const num = Number(value);
          if (Number.isNaN(num)) {
            error = "Amount must be a number.";
          } else if (num <= 0) {
            error = "Amount must be greater than 0.";
          } else if (num > 1_000_000_000) {
            error = "Amount is too large.";
          }
        }
        break;
      }

      case "date": {
        if (!value) {
          error = "Date is required.";
        } else {
          const d = new Date(value);
          if (Number.isNaN(d.getTime())) {
            error = "Invalid date.";
          } else {
            const today = new Date();
            const todayMidnight = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            const selectedMidnight = new Date(
              d.getFullYear(),
              d.getMonth(),
              d.getDate()
            );
            if (selectedMidnight > todayMidnight) {
              error = "Date cannot be in the future.";
            }
          }
        }
        break;
      }

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    const f = form;
    const newErrors = {};

    // Category
    const category = (f.category || "").trim();
    if (!category) {
      newErrors.category = "Category is required.";
    } else if (category.length > 50) {
      newErrors.category = "Category must not exceed 50 characters.";
    }

    // Description
    const desc = (f.description || "").trim();
    if (desc) {
      if (desc.length < 3) {
        newErrors.description = "Description must be at least 3 characters.";
      } else if (desc.length > 200) {
        newErrors.description = "Description must not exceed 200 characters.";
      }
    }

    // Amount
    if (f.amount === "" || f.amount === null || f.amount === undefined) {
      newErrors.amount = "Amount is required.";
    } else {
      const num = Number(f.amount);
      if (Number.isNaN(num)) {
        newErrors.amount = "Amount must be a number.";
      } else if (num <= 0) {
        newErrors.amount = "Amount must be greater than 0.";
      } else if (num > 1_000_000_000) {
        newErrors.amount = "Amount is too large.";
      }
    }

    // Date
    if (!f.date) {
      newErrors.date = "Date is required.";
    } else {
      const d = new Date(f.date);
      if (Number.isNaN(d.getTime())) {
        newErrors.date = "Invalid date.";
      } else {
        const today = new Date();
        const todayMidnight = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const selectedMidnight = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate()
        );
        if (selectedMidnight > todayMidnight) {
          newErrors.date = "Date cannot be in the future.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const confirmWithToast = (message) =>
    new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div
            className={`max-w-sm w-full bg-white border border-gray-200 shadow-xl rounded-2xl px-4 py-3 text-sm flex flex-col gap-2 transition-all ${
              t.visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="font-semibold text-gray-800">Confirm action</p>
            <p className="text-xs text-gray-600">{message}</p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

  // ---------- Data loading ----------

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/expenses");
      setExpenses(data || []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load expenses. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await api.get("/settings");
      setCategories(data.expenseCategories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  // ---------- Form handlers ----------

  const resetForm = () => {
    setEditingId(null);
    setForm({
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setErrors({
      category: "",
      description: "",
      amount: "",
      date: "",
    });
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    validateField(field, value, { ...form, [field]: value });
  };

  const saveExpense = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload = {
      category: form.category.trim(),
      description: form.description.trim() || "",
      amount: Number(form.amount),
      date: form.date,
    };

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        toast.success("Expense updated successfully.");
      } else {
        await api.post("/expenses", payload);
        toast.success("Expense saved successfully.");
      }
      resetForm();
      await loadExpenses();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save expense. Try again."
      );
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp._id);
    setForm({
      category: exp.category || "",
      description: exp.description || "",
      amount:
        typeof exp.amount === "number"
          ? exp.amount.toString()
          : exp.amount || "",
      date: exp.date
        ? exp.date.substring(0, 10)
        : new Date().toISOString().slice(0, 10),
    });
    setErrors({
      category: "",
      description: "",
      amount: "",
      date: "",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmWithToast("Delete this expense?");
    if (!confirmed) return;

    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted successfully.");
      await loadExpenses();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete expense. Try again."
      );
    }
  };

  const validateNewCategory = (value) => {
    let error = "";
    const v = (value || "").trim();

    if (!v) {
      error = "Category name is required.";
    } else if (v.length > 50) {
      error = "Category name must not exceed 50 characters.";
    } else if (
      categories.some((c) => (c || "").toLowerCase() === v.toLowerCase())
    ) {
      error = "This category already exists.";
    }

    setNewCategoryError(error);
    return !error;
  };

  const handleAddCategory = async () => {
    const value = newCategory.trim();
    if (!validateNewCategory(value)) {
      if (newCategoryError) {
        toast.error(newCategoryError);
      }
      return;
    }

    try {
      const { data } = await api.post("/settings/expense-categories", {
        category: value,
      });
      setCategories(data.expenseCategories || []);
      setForm((f) => ({ ...f, category: value }));
      setNewCategory("");
      setNewCategoryError("");
      setShowAddCategory(false);
      toast.success("Category added successfully.");
    } catch (error) {
      toast.error("Failed to add category. Try again.");
    }
  };

  // Totals (used in multiple places)
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  const currentMonthTotal = expenses
    .filter((e) => {
      const expenseDate = new Date(e.date);
      const now = new Date();
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 md:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "text-sm font-medium shadow-lg rounded-xl",
          duration: 3000,
        }}
      />

      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Expense Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base max-w-3xl">
                Record and track daily expenses including rent, salaries,
                transport, electricity, and other operational costs. Maintain
                financial clarity with categorized expense tracking.
              </p>
            </div>
            <div className="flex md:justify-end">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 min-w-[200px]">
                <p className="text-xs text-gray-500 font-medium">
                  Total Expenses
                </p>
                <p className="text-xl font-bold text-gray-800 truncate">
                  Rs. {totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Categories</p>
                <p className="text-lg font-bold text-gray-800">
                  {categories.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-lg">📊</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Total Records
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {expenses.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-lg">📈</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">
                  Current Month
                </p>
                <p className="text-lg font-bold text-gray-800 truncate">
                  Rs. {currentMonthTotal.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-lg">💰</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid gap-6 md:grid-cols-2 md:items-start">
          {/* Form Section */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {editingId ? "Edit Expense" : "Add New Expense"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {editingId
                    ? "Update the expense details below."
                    : "Fill in the details to record a new expense."}
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form
              onSubmit={saveExpense}
              className="space-y-5"
              autoComplete="off"
            >
              {/* Category Field */}
              <div>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategory((prev) => !prev);
                      setNewCategoryError("");
                    }}
                    className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span className="text-base leading-none">＋</span>
                    <span>Add Category</span>
                  </button>
                </div>

                {showAddCategory && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          className={`w-full rounded-xl px-3 sm:px-4 py-2.5 text-sm border transition-colors ${
                            newCategoryError
                              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          }`}
                          value={newCategory}
                          onChange={(e) => {
                            setNewCategory(e.target.value);
                            if (newCategoryError) {
                              validateNewCategory(e.target.value);
                            }
                          }}
                          placeholder="Enter new category name"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                        />
                        {newCategoryError && (
                          <p className="text-xs text-red-600 mt-2 ml-1">
                            {newCategoryError}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:self-stretch">
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategory("");
                            setNewCategoryError("");
                          }}
                          className="px-3 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="text-gray-500 text-sm">✕</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Category will be available for all future expenses.
                    </p>
                  </div>
                )}

                <div className="relative">
                  <select
                    className={`w-full rounded-xl px-3 sm:px-4 py-2.5 text-sm border transition-colors appearance-none cursor-pointer ${
                      errors.category
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    value={form.category}
                    onChange={(e) =>
                      handleFieldChange("category", e.target.value)
                    }
                  >
                    <option value="" className="text-gray-400">
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="text-gray-700">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ▼
                  </span>
                </div>
                {errors.category && (
                  <p className="text-xs text-red-600 mt-2 ml-1">
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  className={`w-full rounded-xl px-3 sm:px-4 py-2.5 text-sm border transition-colors ${
                    errors.description
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                  value={form.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="e.g., Lorry hire for cement delivery, office supplies"
                />
                {errors.description && (
                  <p className="text-xs text-red-600 mt-2 ml-1">
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Optional: Add details to help identify this expense.
                </p>
              </div>

              {/* Amount and Date Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      Rs.
                    </span>
                    <input
                      type="number"
                      className={`w-full rounded-xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 text-sm border transition-colors ${
                        errors.amount
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }`}
                      value={form.amount}
                      onChange={(e) =>
                        handleFieldChange("amount", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-red-600 mt-2 ml-1">
                      {errors.amount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full rounded-xl px-3 sm:px-4 py-2.5 text-sm border transition-colors ${
                      errors.date
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    value={form.date}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                  />
                  {errors.date && (
                    <p className="text-xs text-red-600 mt-2 ml-1">
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  {editingId ? "Update Expense" : "Save Expense"}
                </button>
              </div>
            </form>
          </section>

          {/* Expenses List Section */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    Expense History
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Recent expense records sorted by date.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={loadExpenses}
                    className="px-3 sm:px-4 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                  >
                    <span className="text-base">↻</span>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <p className="text-gray-500 mt-3 text-sm">
                    Loading expenses...
                  </p>
                </div>
              ) : expenses.length > 0 ? (
                <>
                  {/* Table wrapper with responsive scroll & max height */}
                  <div className="overflow-x-auto max-h-[420px]">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {expenses.map((e) => (
                          <tr
                            key={e._id}
                            className="hover:bg-gray-50 transition-colors group"
                          >
                            <td className="py-3 sm:py-4 px-4 sm:px-6 align-top whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {e.date ? e.date.substring(0, 10) : ""}
                              </div>
                            </td>
                            <td className="py-3 sm:py-4 px-4 sm:px-6 align-top min-w-[140px] sm:min-w-[200px]">
                              <div className="font-medium text-gray-900 text-xs sm:text-sm">
                                {e.category}
                              </div>
                              {e.description && (
                                <div className="text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
                                  {e.description}
                                </div>
                              )}
                            </td>
                            <td className="py-3 sm:py-4 px-4 sm:px-6 align-top whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-semibold text-gray-900">
                                Rs.{" "}
                                {Number(e.amount || 0).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </td>
                            <td className="py-3 sm:py-4 px-4 sm:px-6 align-top">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  className="text-[11px] sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-50"
                                  onClick={() => handleEdit(e)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="text-[11px] sm:text-sm font-medium text-red-600 hover:text-red-800 hover:underline cursor-pointer transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50"
                                  onClick={() => handleDelete(e._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer summary */}
                  <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Showing{" "}
                        <span className="font-medium">{expenses.length}</span>{" "}
                        expense{expenses.length !== 1 ? "s" : ""}.
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        Total: Rs.{" "}
                        {totalExpenses.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl text-gray-400">📄</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                    No expenses recorded yet
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                    Start by adding your first expense using the form on the
                    left. Your expense history will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Footer Note */}
        <footer className="pt-2">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            💡 Tip: Regularly update expenses for accurate financial tracking.
            Use descriptive categories for better analysis.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ExpensesPage;
