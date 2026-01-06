import api from "../../../api";

/**
 * Save a new sale/invoice
 * @param {Object} salePayload - Sale data including items, payments, and totals
 * @returns {Promise<Object>} Saved sale data
 */
export const saveSale = async (salePayload) => {
  try {
    const { data } = await api.post("/sales", salePayload);
    return data;
  } catch (error) {
    console.error("Failed to save sale:", error);
    throw error;
  }
};

/**
 * Save sale offline to localStorage
 * @param {Object} salePayload - Sale data
 */
export const saveSaleOffline = (salePayload) => {
  try {
    const queue = JSON.parse(localStorage.getItem("offlineSales") || "[]");
    queue.push(salePayload);
    localStorage.setItem("offlineSales", JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save sale offline:", error);
    throw error;
  }
};
