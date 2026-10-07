import axios from "axios";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const api = axios.create({ baseURL: `${SERVER_URL}/api`, timeout: 60000 });

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch { /* ignore bad saved data */ }
  return config;
});

export default api;