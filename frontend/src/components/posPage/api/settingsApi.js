import api from "../../../api";

/**
 * Load VAT rate from settings
 * @returns {Promise<number>} VAT rate
 */
export const loadVatRate = async () => {
  try {
    const { data } = await api.get("/settings");
    if (typeof data.vatRate === "number" && data.vatRate >= 0) {
      return data.vatRate;
    }
    return 0.15; // Default VAT rate
  } catch (error) {
    console.error("Failed to load VAT rate:", error);
    return 0.15; // Default VAT rate
  }
};
