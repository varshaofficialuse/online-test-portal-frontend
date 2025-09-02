
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios"; 
import toast from "react-hot-toast";
import { scheduleTokenRefresh, clearTokenRefresh } from '../utils/autoRefresh';

// const API_URL = "http://127.0.0.1:8000";
const API_URL = process.env.API_URL;

const initialState = {
  accessToken: localStorage.getItem("access_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  user: (() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        return JSON.parse(storedUser);
      }
    } catch (e) {}
    return null;
  })(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    start(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const { accessToken, refreshToken, user } = action.payload;
      state.loading = false;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken || state.refreshToken;
      state.user = user;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken || state.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      scheduleTokenRefresh(accessToken); // ✅ auto refresh setup

    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.loading = false;
      localStorage.clear();
      clearTokenRefresh(); 
    },
    failure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { start, loginSuccess, logout, failure } = authSlice.actions;

// ===================== Thunks ===================== //

// LOGIN
export const login = (formData) => async (dispatch) => {
  dispatch(start());
  try {
    const res = await axios.post(`${API_URL}/auth/login`, formData);

    // Save tokens
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);

    // Fetch user info
    const userRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${res.data.access_token}` },
    });

    dispatch(
      loginSuccess({
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
        user: userRes.data,
      })
    );

    toast.success("Login successful!");
    return { meta: { requestStatus: "fulfilled" } }; 
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    dispatch(failure(err.response?.data?.detail || "Login failed"));
    toast.error(err.response?.data?.detail || "Login failed");
    return { meta: { requestStatus: "rejected" } }; 
  }
};


// SIGNUP
export const signup = (formData) => async (dispatch) => {
  dispatch(start());
  try {
    await axios.post(`${API_URL}/auth/signup`, formData);

    // Auto-login after signup
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: formData.email,
      password: formData.password,
    });

    localStorage.setItem("access_token", loginRes.data.access_token);
    localStorage.setItem("refresh_token", loginRes.data.refresh_token);

    const userRes = await axios.post(`${API_URL}/auth/me`, {}, {
      headers: { Authorization: `Bearer ${loginRes.data.access_token}` },
    });

    dispatch(
      loginSuccess({
        accessToken: loginRes.data.access_token,
        refreshToken: loginRes.data.refresh_token,
        user: userRes.data,
      })
    );

    toast.success("Signup successful!");
    return { ok: true };
  } catch (err) {
    dispatch(failure(err.response?.data?.detail || "Signup failed"));
    toast.error(err.response?.data?.detail || "Signup failed");
    return { ok: false };
  }
};

// FETCH USER
export const fetchUser = () => async (dispatch, getState) => {
  const { accessToken } = getState().auth;
  if (!accessToken) return;

  dispatch(start());
  try {
    const res = await axios.post(`${API_URL}/auth/me`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    dispatch(
      loginSuccess({
        accessToken,
        user: res.data,
      })
    );
  } catch (err) {
    dispatch(logout());
    toast.error("Session expired, please login again.");
  }
};

// REFRESH TOKEN
export const refreshTokenThunk = () => async (dispatch, getState) => {
  const { refreshToken, user } = getState().auth;
  if (!refreshToken) {
    dispatch(logout());
    return { type: "auth/logout" };
  }

  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    if (!res.data.access_token) throw new Error("No new access token");

    dispatch(
      loginSuccess({
        accessToken: res.data.access_token,
        refreshToken,
        user,
      })
    );

    return { type: "auth/loginSuccess" };
  } catch (err) {
    dispatch(logout());
    toast.error("Session expired. Please login again.");
    return { type: "auth/logout" };
  }
};

export default authSlice.reducer;
