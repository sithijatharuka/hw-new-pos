import api from "../client";

export const createGRN = async (payload) => {
  const { data } = await api.post("/grns", payload);
  return data;
};

export const getAllGRNs = async () => {
  const { data } = await api.get("/grns");
  return data;
};

export const getSupplierGRNs = async (supplierId) => {
  const { data } = await api.get(`/grns/supplier/${supplierId}`);
  return data;
};

export const getGRN = async (id) => {
  const { data } = await api.get(`/grns/${id}`);
  return data;
};

export const updateGRN = async (id, payload) => {
  const { data } = await api.put(`/grns/${id}`, payload);
  return data;
};

export const postGRN = async (id) => {
  const { data } = await api.post(`/grns/${id}/post`);
  return data;
};

export const deleteGRN = async (id) => {
  const { data } = await api.delete(`/grns/${id}`);
  return data;
};
