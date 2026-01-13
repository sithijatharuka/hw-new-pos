import api from "../client";

export const loadInventoryLookups = async (defaultUnits = []) => {
  const [supRes, catRes] = await Promise.allSettled([
    api.get("/suppliers"),
    api.get("/items/categories/list"),
  ]);

  const suppliers = supRes.status === "fulfilled" ? supRes.value.data || [] : [];
  const categories = catRes.status === "fulfilled" ? catRes.value.data || [] : [];

  return {
    suppliers,
    categories,
    baseUnits: Array.from(new Set([...defaultUnits])),
  };
};

export const loadSuppliers = async () => {
  try {
    const { data } = await api.get("/suppliers");
    return data || [];
  } catch (error) {
    console.error("Failed to load suppliers:", error);
    return [];
  }
};

export const loadCategories = async () => {
  try {
    const { data } = await api.get("/items/categories/list");
    return data || [];
  } catch (error) {
    console.error("Failed to load categories:", error);
    return [];
  }
};
