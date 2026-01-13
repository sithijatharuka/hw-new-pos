import api from "../client";

export const getSuppliers = async (query) => {
  const { data } = await api.get("/suppliers", { params: { q: query } });
  return data || [];
};

export const createSupplier = async (payload) => {
  const { data } = await api.post("/suppliers", {
    ...payload,
    currentBalance: payload.openingBalance,
  });
  return data;
};

export const updateSupplier = async (id, payload) => {
  const { data } = await api.put(`/suppliers/${id}`, payload);
  return data;
};

export const deleteSupplier = async (id) => {
  await api.delete(`/suppliers/${id}`);
};

export const recordSupplierPayment = async (id, amount) => {
  const { data } = await api.post(`/suppliers/${id}/pay`, { amount });
  return data?.supplier || data;
};

export const getCategoriesAndUnits = async (defaultUnits = []) => {
  const [catRes, unitRes] = await Promise.allSettled([
    api.get("/items/categories/list"),
    api.get("/items/units/list"),
  ]);

  const categories =
    catRes.status === "fulfilled" ? catRes.value.data || [] : [];
  const fetchedUnits =
    unitRes.status === "fulfilled" ? unitRes.value.data || [] : [];

  const baseUnits = Array.from(
    new Set([...(defaultUnits || []), ...fetchedUnits])
  );
  return { categories, baseUnits };
};
