// All functions now accept api as the first argument
export const loadExpenses = async (api, params = {}) => {
  const { data } = await api.get("/expenses", { params });
  return data || [];
};

export const getExpenses = async (api, params = {}) => {
  const { data } = await api.get("/expenses", { params });
  return data || [];
};

export const createExpense = async (api, payload) => {
  const { data } = await api.post("/expenses", payload);
  return data;
};

export const updateExpense = async (api, id, payload) => {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data;
};

export const deleteExpense = async (api, id) => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
};
