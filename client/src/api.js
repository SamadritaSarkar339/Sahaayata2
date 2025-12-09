import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("sahaayata_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("sahaayata_token");
  }
};

// Initialize from localStorage on first load
const stored = localStorage.getItem("sahaayata_token");
if (stored) {
  api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
}
