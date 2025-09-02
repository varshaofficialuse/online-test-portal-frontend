import axios from "axios";
import store from "../store/store";
import { logout } from "../store/authSlice";

// Base URL (optional, if you want all calls to share it)
// axios.defaults.baseURL = "http://127.0.0.1:8000";
axios.defaults.baseURL = "https://online-test-portal-extended.up.railway.app";

// Attach token to every request
axios.interceptors.request.use(
  (config) => {
    const { accessToken } = store.getState().auth;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handler
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/login"; // 👈 redirect
    }
    return Promise.reject(err);
  }
);

export default axios;