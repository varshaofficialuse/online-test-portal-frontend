import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  // optional: disable devTools in production
  // devTools: process.env.NODE_ENV !== 'production',
});

export default store;
