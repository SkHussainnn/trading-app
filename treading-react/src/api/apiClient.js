import axios from "axios";

// Default to relative path to use Vite's configured proxy (/auth, /api, /coins -> http://localhost:5454)
const BASE_URL = import.meta.env.VITE_API_URL || "";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Interceptor to attach Authorization header automatically
apiClient.interceptors.request.use(
  (config) => {
    const isPublicRoute =
      config.url?.startsWith("/auth/") || config.url?.startsWith("/coins");

    const token = localStorage.getItem("jwt");
    // Only send Authorization header for protected routes and real JWT tokens
    if (token && !token.startsWith("demo-") && !isPublicRoute) {
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle responses and common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Clearing credentials.");
      localStorage.removeItem("jwt");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
