import api from "../../../api";

/**
 * Load all active items
 * @returns {Promise<Array>} Array of items with inventory and pricing info
 */
export const loadItems = async () => {
  try {
    const { data } = await api.get("/items", {
      params: { isActive: true },
    });
    return data || [];
  } catch (error) {
    console.error("Failed to load items:", error);
    throw error;
  }
};

/**
 * Load item categories
 * @returns {Promise<Array>} Array of categories
 */
export const loadCategories = async () => {
  try {
    const { data } = await api.get("/items/categories/list");
    return data || [];
  } catch (error) {
    console.error("Failed to load categories:", error);
    return [];
  }
};

/**
 * Search item by barcode
 * @param {string} barcode - Item barcode
 * @returns {Promise<Object>} Item data
 */
export const searchItemByBarcode = async (barcode) => {
  try {
    const { data } = await api.get(
      `/items/barcode/${encodeURIComponent(barcode)}`
    );
    return data;
  } catch (error) {
    console.error("Failed to search item by barcode:", error);
    throw error;
  }
};
