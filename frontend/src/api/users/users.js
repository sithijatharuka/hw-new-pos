import api from "../client";

export const createOwner = async (payload) => {
  const { data } = await api.post("/users/owner-signup", payload);
  return data?.user || data;
};

export const createStaff = async (payload) => {
  const { data } = await api.post("/users/staff", payload);
  return data?.user || data;
};

export const getUsers = async () => {
  const { data } = await api.get("/users");
  return data || [];
};
