import api from "../client";

export const getDailySalesReport = async () => {
  const { data } = await api.get("/reports/sales-daily");
  return data;
};

export const getInventoryValue = async () => {
  const { data } = await api.get("/reports/inventory-value");
  return data;
};

export const getProfitReport = async () => {
  const { data } = await api.get("/reports/profit");
  return data;
};

export const getCustomerCreditReport = async () => {
  const { data } = await api.get("/reports/customer-credit");
  return data || [];
};

export const getLowStockItems = async () => {
  const { data } = await api.get("/items", { params: { lowStock: "true" } });
  return data || [];
};
