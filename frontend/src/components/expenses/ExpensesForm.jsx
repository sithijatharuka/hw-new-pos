import React from "react";

const ExpensesForm = ({
  editingId,
  form,
  errors,
  categories,
  showAddCategory,
  setShowAddCategory,
  newCategory,
  setNewCategory,
  newCategoryError,
  validateNewCategory,
  handleAddCategory,
  handleFieldChange,
  saveExpense,
  resetForm,
}) => {
  return (
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

      <form onSubmit={saveExpense} className="space-y-5" autoComplete="off">
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
              onChange={(e) => handleFieldChange("category", e.target.value)}
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
            <p className="text-xs text-red-600 mt-2 ml-1">{errors.category}</p>
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
            onChange={(e) => handleFieldChange("description", e.target.value)}
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
                onChange={(e) => handleFieldChange("amount", e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-600 mt-2 ml-1">{errors.amount}</p>
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
              <p className="text-xs text-red-600 mt-2 ml-1">{errors.date}</p>
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
  );
};

export default ExpensesForm;
