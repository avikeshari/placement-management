import axios from "axios";
import toast from "react-hot-toast";

const configuredBaseUrl = (import.meta.env.VITE_API_URL || "/api").trim();
const baseURL = configuredBaseUrl.replace(/\/$/, "") || "/api";

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  // Let the browser/Axios set the multipart boundary for FormData.
  // A global JSON Content-Type prevents multer from receiving req.file.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        toast.error("Your session has expired. Please sign in again.");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
