import api from "../../../api";

/**
 * Load all items with optional filters
 * @param {string} query - Search query
 * @param {boolean} lowStock - Filter for low stock items
 * @returns {Promise<Array>} Array of items
 */
export const loadItems = async (query, lowStock) => {
  try {
    const { data } = await api.get("/items", {
      params: { q: query || undefined, lowStock: lowStock || undefined },
    });
    return data || [];
  } catch (error) {
    console.error("Failed to load items:", error);
    throw error;
  }
};

/**
 * Delete an item
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Deleted item data
 */
export const deleteItem = async (id) => {
  try {
    const { data } = await api.delete(`/items/${id}`);
    return data;
  } catch (error) {
    console.error("Failed to delete item:", error);
    throw error;
  }
};

/**
 * Activate an item
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Updated item data
 */
export const activateItem = async (id) => {
  try {
    const { data } = await api.patch(`/items/${id}/activate`);
    return data;
  } catch (error) {
    console.error("Failed to activate item:", error);
    throw error;
  }
};

/**
 * Deactivate an item
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Updated item data
 */
export const deactivateItem = async (id) => {
  try {
    const { data } = await api.patch(`/items/${id}/deactivate`);
    return data;
  } catch (error) {
    console.error("Failed to deactivate item:", error);
    throw error;
  }
};
