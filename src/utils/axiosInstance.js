// import axios from 'axios';
// import store from '../store/store';
// import { refreshTokenThunk, logout } from '../store/authSlice';

// const API_URL = 'http://127.0.0.1:8000';

// const axiosInstance = axios.create({ baseURL: API_URL });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const state = store.getState();
//     const token = state.auth.accessToken;
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const result = await store.dispatch(refreshTokenThunk());

//         if (result.type === 'auth/loginSuccess') {
//           const state = store.getState();
//           originalRequest.headers.Authorization = `Bearer ${state.auth.accessToken}`;
//           return axiosInstance(originalRequest);
//         } else {
//           store.dispatch(logout());
//           return Promise.reject(error);
//         }
//       } catch (err) {
//         store.dispatch(logout());
//         return Promise.reject(err);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
