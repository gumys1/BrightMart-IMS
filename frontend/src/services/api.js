import axios from "axios";

export const TRANSACTION_UPDATED_EVENT = "brightmart:transaction-updated";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost/api";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL.replace(/\/+$/, "")}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("brightmart_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const api = {
  login: (username, password) =>
    apiClient.post("token/", { username, password }).then((response) => response.data),
  products: () => apiClient.get("products/").then((response) => response.data),
  lowStockProducts: () =>
    apiClient.get("products/low-stock/").then((response) => response.data),
  transactions: () => apiClient.get("transactions/").then((response) => response.data),
  receiveStock: (payload) =>
    apiClient.post("transactions/receive/", payload).then((response) => response.data),
  issueStock: (payload) =>
    apiClient.post("transactions/issue/", payload).then((response) => response.data),
};
