import api from "../client";

export const createPurchase = async (payload) => {
  const { data } = await api.post("/purchases", payload);
  return data;
};
