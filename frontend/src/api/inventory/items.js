import api from "../client";

const fetchItems = async (params = {}) => {
  const { data } = await api.get("/items", { params });
  return data || [];
};

export const loadItems = async (query, lowStock) =>
  fetchItems({
    q: query || undefined,
    lowStock: lowStock || undefined,
  });

export const loadActiveItems = async () => fetchItems({ isActive: true });

export const fetchItemsForGrn = async (limit = 999) =>
  fetchItems({ limit });

export const deleteItem = async (id) => {
  const { data } = await api.delete(`/items/${id}`);
  return data;
};

export const createItem = async (payload) => {
  const { data } = await api.post("/items", payload);
  return data;
};

export const updateItem = async (id, payload) => {
  const { data } = await api.put(`/items/${id}`, payload);
  return data;
};

export const activateItem = async (id) => {
  const { data } = await api.patch(`/items/${id}/activate`);
  return data;
};

export const deactivateItem = async (id) => {
  const { data } = await api.patch(`/items/${id}/deactivate`);
  return data;
};

export const loadItemCategories = async () => {
  const { data } = await api.get("/items/categories/list");
  return data || [];
};

export const searchItemByBarcode = async (barcode) => {
  const { data } = await api.get(
    `/items/barcode/${encodeURIComponent(barcode)}`
  );
  return data;
};

export const getItemBatches = async (itemId) => {
  const { data } = await api.get(`/items/${itemId}/batches`);
  return data;
};

export const getItem = async (id) => {
  const { data } = await api.get(`/items/${id}`);
  return data;
};
