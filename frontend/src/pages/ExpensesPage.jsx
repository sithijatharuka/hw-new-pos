import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  ExpensesHeader,
  ExpensesForm,
  ExpensesTable,
  ExpensesFooter,
} from "../components/expenses";
import {
  validateField,
  validateForm,
  validateNewCategory,
  emptyForm,
  emptyErrors,
} from "../utils/expenses";
import {
  loadExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  loadExpenseCategories,
  addExpenseCategory,
} from "../components/expenses/api";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");

  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState(emptyErrors());

  // ---------- Helpers ----------

  const handleValidateField = (field, value) => {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleValidateForm = () => {
    const newErrors = validateForm(form);
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

  const loadExpensesData = async () => {
    setLoading(true);
    try {
      const expenses = await loadExpenses();
      setExpenses(expenses);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load expenses. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesData = async () => {
    try {
      const cats = await loadExpenseCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    loadExpensesData();
    loadCategoriesData();
  }, []);

  // ---------- Form handlers ----------

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors(emptyErrors());
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    handleValidateField(field, value);
  };

  const saveExpense = async (e) => {
    e.preventDefault();

    if (!handleValidateForm()) {
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
        await updateExpense(editingId, payload);
        toast.success("Expense updated successfully.");
      } else {
        await createExpense(payload);
        toast.success("Expense saved successfully.");
      }
      resetForm();
      await loadExpensesData();
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
    setErrors(emptyErrors());
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmWithToast("Delete this expense?");
    if (!confirmed) return;

    try {
      await deleteExpense(id);
      toast.success("Expense deleted successfully.");
      await loadExpensesData();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete expense. Try again."
      );
    }
  };

  const handleValidateNewCategory = (value) => {
    const error = validateNewCategory(value, categories);
    setNewCategoryError(error);
    return !error;
  };

  const handleAddCategory = async () => {
    const value = newCategory.trim();
    if (!handleValidateNewCategory(value)) {
      if (newCategoryError) {
        toast.error(newCategoryError);
      }
      return;
    }

    try {
      const result = await addExpenseCategory(value);
      setCategories(result.expenseCategories || []);
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
        <ExpensesHeader
          totalExpenses={totalExpenses}
          categories={categories}
          expenses={expenses}
        />

        {/* Main Content */}
        <main className="grid gap-6 md:grid-cols-2 md:items-start">
          <ExpensesForm
            editingId={editingId}
            form={form}
            errors={errors}
            categories={categories}
            showAddCategory={showAddCategory}
            setShowAddCategory={setShowAddCategory}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            newCategoryError={newCategoryError}
            validateNewCategory={handleValidateNewCategory}
            handleAddCategory={handleAddCategory}
            handleFieldChange={handleFieldChange}
            saveExpense={saveExpense}
            resetForm={resetForm}
          />

          <ExpensesTable
            expenses={expenses}
            loading={loading}
            totalExpenses={totalExpenses}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            loadExpenses={loadExpensesData}
          />
        </main>

        <ExpensesFooter />
      </div>
    </div>
  );
};

export default ExpensesPage;
