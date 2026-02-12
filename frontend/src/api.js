/**
 * CampusHelper API Configuration
 * Centralized API calls for easier deployment and maintenance.
 */

// Deployment Tip: Change this to your production URL when you go live!
// Initial URL from environment or default
const rawBaseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).trim();

// Typo-proof processing:
// 1. Strip any existing http:// or https:// and any trailing slashes
const cleanUrl = rawBaseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

// 2. Force the correct protocol
export const BASE_URL = rawBaseUrl.includes("localhost")
  ? `http://${cleanUrl}`
  : `https://${cleanUrl}`;

/**
 * Universal request wrapper with Auth Token support
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("campus_auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Safely parse JSON or return empty object for 204 No Content
  let data = {};
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error:", e);
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    register: (userData) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
  },

  // Building endpoints
  buildings: {
    getAll: () => request("/buildings"),
    getOne: (id) => request(`/buildings/${id}`),
  },

  // Report endpoints
  reports: {
    getAll: () => request("/reports"),
    create: (reportData) =>
      request("/reports", {
        method: "POST",
        body: JSON.stringify(reportData),
      }),
    update: (id, reportData) =>
      request(`/reports/${id}`, {
        method: "PATCH",
        body: JSON.stringify(reportData),
      }),
    delete: (id) =>
      request(`/reports/${id}`, {
        method: "DELETE",
      }),
  },

  // User endpoints
  users: {
    update: (id, userData) =>
      request(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(userData),
      }),
  },
};
