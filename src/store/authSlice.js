import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance'; // Axios with interceptors

// --- Safe localStorage getters ---
let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');
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
  accessToken: accessToken || null,
  refreshToken: refreshToken || null,
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
      console.log('inside login success reducer state and action',state,action)
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || state.refreshToken;
      state.user = action.payload.user;

      localStorage.setItem('access_token', state.accessToken);
      localStorage.setItem('refresh_token', state.refreshToken);
      localStorage.setItem('user', JSON.stringify(state.user));
      console.log("DONE FLOW");
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.loading = false;
      localStorage.clear();
    },
    failure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { start, loginSuccess, logout, failure } = authSlice.actions;


// Fetch user info
export const fetchUser = (navigate) => async (dispatch, getState) => {
  try {
    console.log("inside fetch user")
    const accessToken = localStorage.getItem('access_token')
    console.log("Access token",accessToken)
    if (!accessToken) return;

    const res = await axios.get('http://127.0.0.1:8000/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("RESULT in fetchuser",res)
    dispatch(loginSuccess({ accessToken, user: res.data }));
    console.log("Dispath login success done")
    
  } catch (err) {
    console.error('Fetch user error:', err);
    dispatch(logout());
  }
};

// LOGIN
export const login = (formData, navigate) => async (dispatch) => {
  dispatch(start());
  try {
    const res = await axios.post('http://127.0.0.1:8000/auth/login', formData);
    console.log("RES in login",res);
    // Save tokens
    localStorage.setItem('access_token', res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);

    // Fetch user info and navigate
    await dispatch(fetchUser(navigate));

    console.log("96 dispatch done")
    return { meta: { requestStatus: 'fulfilled' } };
  } catch (err) {
    dispatch(failure(err.response?.data?.detail || 'Login failed'));
    return { meta: { requestStatus: 'rejected' } };
  }
};

// SIGNUP
export const signup = (formData, navigate) => async (dispatch) => {
  dispatch(start());
  try {
    const res = await axios.post('http://127.0.0.1:8000/auth/signup', formData);


    await dispatch(fetchUser(navigate));
    return { ok: true };
  } catch (err) {
    dispatch(failure(err.response?.data?.detail || 'Signup failed'));
    return { ok: false };
  }
};

// Refresh token
export const refreshTokenThunk = () => async (dispatch, getState) => {
  const { refreshToken, user } = getState().auth;
  if (!refreshToken) {
    dispatch(logout());
    return;
  }

  try {
    const res = await axios.post(
      'http://127.0.0.1:8000/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    );

    dispatch(
      loginSuccess({
        accessToken: res.data.access_token,
        refreshToken,
        user,
      })
    );

    return { type: 'auth/loginSuccess' };
  } catch (err) {
    console.error('Token refresh failed:', err);
    dispatch(logout());
    return { type: 'auth/logout' };
  }
};

export default authSlice.reducer;
