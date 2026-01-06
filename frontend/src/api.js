import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000" || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const errorMessage = error.response.data?.message || "Session expired";

      // Only show toast and redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        toast.error(errorMessage + ". Please login again.");

        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
