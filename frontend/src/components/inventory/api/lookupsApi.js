import api from "../../../api";

/**
 * Load suppliers, categories, and units in parallel
 * @returns {Promise<Object>} Object containing suppliers, categories, and baseUnits
 */
export const loadInventoryLookups = async (defaultUnits = []) => {
  try {
    const [supRes, catRes, unitRes] = await Promise.allSettled([
      api.get("/suppliers"),
      api.get("/items/categories/list"),
      api.get("/items/units/list"),
    ]);

    const suppliers =
      supRes.status === "fulfilled" ? supRes.value.data || [] : [];
    const categories =
      catRes.status === "fulfilled" ? catRes.value.data || [] : [];
    const fetchedUnits =
      unitRes.status === "fulfilled" ? unitRes.value.data || [] : [];

    // Merge with default units
    const allUnits = Array.from(new Set([...defaultUnits, ...fetchedUnits]));

    return {
      suppliers,
      categories,
      baseUnits: allUnits,
    };
  } catch (error) {
    console.error("Failed to load lookups:", error);
    throw error;
  }
};

/**
 * Load suppliers
 * @returns {Promise<Array>} Array of suppliers
 */
export const loadSuppliers = async () => {
  try {
    const { data } = await api.get("/suppliers");
    return data || [];
  } catch (error) {
    console.error("Failed to load suppliers:", error);
    return [];
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
 * Load base units
 * @param {Array} defaultUnits - Default units to merge with fetched units
 * @returns {Promise<Array>} Array of units
 */
export const loadUnits = async (defaultUnits = []) => {
  try {
    const { data } = await api.get("/items/units/list");
    const fetchedUnits = data || [];
    return Array.from(new Set([...defaultUnits, ...fetchedUnits]));
  } catch (error) {
    console.error("Failed to load units:", error);
    return defaultUnits;
  }
};
