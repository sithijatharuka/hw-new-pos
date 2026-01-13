import api from "../client";

export const loadExpenseCategories = async () => {
  try {
    const { data } = await api.get("/settings");
    return data.expenseCategories || [];
  } catch (error) {
    console.error("Failed to load expense categories:", error);
    return [];
  }
};

export const addExpenseCategory = async (category) => {
  const { data } = await api.post("/settings/expense-categories", {
    category,
  });
  return data;
};
