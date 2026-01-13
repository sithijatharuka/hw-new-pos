import api from "../client";

export const fetchCustomers = async (query = "") => {
  const { data } = await api.get("/customers", { params: { q: query } });
  return data || [];
};

export const loadCustomers = async () => {
  const { data } = await api.get("/customers");
  return data || [];
};

export const createCustomer = async (payload) => {
  const { data } = await api.post("/customers", payload);
  return data;
};

export const updateCustomer = async (id, payload) => {
  const { data } = await api.put(`/customers/${id}`, payload);
  return data;
};

export const deleteCustomer = async (id) => api.delete(`/customers/${id}`);

export const receivePayment = async (id, payload) =>
  api.post(`/customers/${id}/receive-payment`, payload);

export const fetchPayments = async (id) => {
  const { data } = await api.get(`/customers/${id}/payments`);
  return data || [];
};
