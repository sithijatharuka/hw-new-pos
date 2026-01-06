import api from "../../../api";

/**
 * Load all expenses
 * @returns {Promise<Array>} Array of expenses
 */
export const loadExpenses = async () => {
  try {
    const { data } = await api.get("/expenses");
    return data || [];
  } catch (error) {
    console.error("Failed to load expenses:", error);
    throw error;
  }
};

/**
 * Create a new expense
 * @param {Object} payload - Expense data
 * @returns {Promise<Object>} Created expense data
 */
export const createExpense = async (payload) => {
  try {
    const { data } = await api.post("/expenses", payload);
    return data;
  } catch (error) {
    console.error("Failed to create expense:", error);
    throw error;
  }
};

/**
 * Update an existing expense
 * @param {string} id - Expense ID
 * @param {Object} payload - Updated expense data
 * @returns {Promise<Object>} Updated expense data
 */
export const updateExpense = async (id, payload) => {
  try {
    const { data } = await api.put(`/expenses/${id}`, payload);
    return data;
  } catch (error) {
    console.error("Failed to update expense:", error);
    throw error;
  }
};

/**
 * Delete an expense
 * @param {string} id - Expense ID
 * @returns {Promise<Object>} Deleted expense data
 */
export const deleteExpense = async (id) => {
  try {
    const { data } = await api.delete(`/expenses/${id}`);
    return data;
  } catch (error) {
    console.error("Failed to delete expense:", error);
    throw error;
  }
};
