import store from "../store/store";
import { refreshTokenThunk } from "../store/authSlice";
import { decodeJwt } from "./jwt";

let refreshTimeout;

export const scheduleTokenRefresh = (accessToken) => {
  clearTimeout(refreshTimeout);

  const payload = decodeJwt(accessToken);
  if (!payload?.exp) return;

  const expiryTime = payload.exp * 1000; // exp is in seconds
  const now = Date.now();
  const refreshTime = expiryTime - now - 60 * 1000; // 1 min before expiry

  if (refreshTime <= 0) return; // already expired or too close

  refreshTimeout = setTimeout(() => {
    store.dispatch(refreshTokenThunk());
  }, refreshTime);

  console.log("🔄 Refresh scheduled in", Math.round(refreshTime / 1000), "seconds");
};

export const clearTokenRefresh = () => {
  clearTimeout(refreshTimeout);
};
