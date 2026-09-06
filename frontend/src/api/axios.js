import axios from "axios";

const configuredBaseUrl = (import.meta.env.VITE_API_URL || "/api").trim();
const baseURL = configuredBaseUrl.replace(/\/$/, "") || "/api";

const api = axios.create({
  baseURL,
  timeout: 60000,
  withCredentials: true,
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

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const hadSession = Boolean(localStorage.getItem("user"));
      localStorage.removeItem("user");

      // A guest visiting public or auth pages legitimately receives 401
      // (e.g. the bootstrap GET /auth/me). Only hard-redirect when a real
      // session just expired mid-use, and never redirect away from the
      // login/auth pages themselves.
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (hadSession && !isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
