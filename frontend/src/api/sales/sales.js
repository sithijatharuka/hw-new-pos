import api from "../client";

export const saveSale = async (salePayload) => {
  const { data } = await api.post("/sales", salePayload);
  return data;
};

export const getSale = async (id) => {
  const { data } = await api.get(`/sales/${id}`);
  return data;
};

export const saveSaleOffline = (salePayload) => {
  const queue = JSON.parse(localStorage.getItem("offlineSales") || "[]");
  queue.push(salePayload);
  localStorage.setItem("offlineSales", JSON.stringify(queue));
};
