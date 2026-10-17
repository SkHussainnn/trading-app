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
    const token = localStorage.getItem("jwt");
    if (token) {
      // Backend JwtTokenValidator expects "Bearer <token>"
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
      // Token expired or invalid
      console.warn("Session expired or unauthorized. Clearing credentials.");
      // Do not force reload if testing unauthenticated routes
    }
    return Promise.reject(error);
  }
);

export default apiClient;
