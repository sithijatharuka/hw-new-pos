import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.message || "Session expired";
      if (!window.location.pathname.includes("/login")) {
        toast.error(errorMessage + ". Please login again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
