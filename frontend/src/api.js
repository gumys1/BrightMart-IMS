const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("brightmart_access_token");
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  login: (username, password) =>
    request("/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  products: () => request("/products/"),
  lowStockProducts: () => request("/products/low-stock/"),
  transactions: () => request("/transactions/"),
  receiveStock: (payload) =>
    request("/transactions/receive/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  issueStock: (payload) =>
    request("/transactions/issue/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
