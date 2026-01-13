import api from "../client";

export const getSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

export const updateSettings = async (settings) => {
  const { data } = await api.put("/settings", settings);
  return data;
};

export const loadVatRate = async () => {
  try {
    const data = await getSettings();
    if (typeof data.vatRate === "number" && data.vatRate >= 0) {
      return data.vatRate;
    }
    return 0.15;
  } catch (error) {
    console.error("Failed to load VAT rate:", error);
    return 0.15;
  }
};
