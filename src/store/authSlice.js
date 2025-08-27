import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// ---- SAFE localStorage GETTERS ----
const token = localStorage.getItem('token');

let user = null;
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
    user = JSON.parse(storedUser);
  }
} catch (e) {
  user = null;
}

const initialState = {
  token: token || null,
  user: user || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    start(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.loading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    failure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { start, loginSuccess, logout, failure } = authSlice.actions;

// ---------- AUTH ACTIONS ----------

// SIGNUP
export const signup = (data) => async (dispatch) => {
  dispatch(start());
  try {
    const res = await axios.post("http://127.0.0.1:8000/auth/signup", data, {
      headers: { "Content-Type": "application/json" },
    });

    // Backend does not return user, so store minimal user info
    const minimalUser = {
      name: data.name,
      email: data.email,
      role: "student",
    };

    dispatch(
      loginSuccess({
        token: res.data.access_token || "", // if backend returns token
        user: minimalUser,
      })
    );
    return { ok: true };
  } catch (e) {
    dispatch(failure(e.response?.data?.detail || "Signup failed"));
    return { ok: false };
  }
};

// LOGIN
export const login = ({ email, password }) => async (dispatch) => {
  dispatch(start());
  try {
    const res = await axios.post("http://127.0.0.1:8000/auth/login", { email, password }, {
      headers: { "Content-Type": "application/json" },
    });

    // Backend does not return user, so store minimal user info
    const minimalUser = {
      name: email.split('@')[0],
      email: email,
      role: "student",
    };

    dispatch(
      loginSuccess({
        token: res.data.access_token,
        user: minimalUser,
      })
    );
    return { meta: { requestStatus: "fulfilled" } };
  } catch (e) {
    dispatch(failure(e.response?.data?.detail || "Login failed"));
    return { meta: { requestStatus: "rejected" } };
  }
};

// REFRESH TOKEN
export const refreshToken = () => async (dispatch, getState) => {
  const { token, user } = getState().auth;
  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/auth/refresh",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch(
      loginSuccess({
        token: res.data.access_token,
        user: user, // reuse the same minimal user info
      })
    );
  } catch (e) {
    dispatch(failure("Token refresh failed"));
    dispatch(logout());
  }
};

export default authSlice.reducer;
