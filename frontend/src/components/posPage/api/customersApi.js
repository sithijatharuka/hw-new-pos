import api from "../../../api";

/**
 * Load all customers
 * @returns {Promise<Array>} Array of customers
 */
export const loadCustomers = async () => {
  try {
    const { data } = await api.get("/customers");
    return data || [];
  } catch (error) {
    console.error("Failed to load customers:", error);
    return [];
  }
};

/**
 * Create a new customer
 * @param {Object} customerData - Customer form data
 * @returns {Promise<Object>} Created customer data
 */
export const createCustomer = async (customerData) => {
  try {
    const { data } = await api.post("/customers", customerData);
    return data;
  } catch (error) {
    console.error("Failed to create customer:", error);
    throw error;
  }
};
