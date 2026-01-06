import api from "../../../api";

/**
 * Load expense categories from settings
 * @returns {Promise<Array>} Array of expense categories
 */
export const loadExpenseCategories = async () => {
  try {
    const { data } = await api.get("/settings");
    return data.expenseCategories || [];
  } catch (error) {
    console.error("Failed to load expense categories:", error);
    return [];
  }
};

/**
 * Add a new expense category
 * @param {string} category - Category name
 * @returns {Promise<Object>} Updated settings with new categories
 */
export const addExpenseCategory = async (category) => {
  try {
    const { data } = await api.post("/settings/expense-categories", {
      category,
    });
    return data;
  } catch (error) {
    console.error("Failed to add expense category:", error);
    throw error;
  }
};
