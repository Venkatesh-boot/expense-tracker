
import axios from 'axios';
import API_CONFIG from '../config/api-config';
import store from '../store/store';
import { logout } from '../store/slices/loginSlice';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach token except for login, register, verify-otp
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  const skipAuth = [
    API_CONFIG.LOGIN,
    API_CONFIG.LOGIN_MOBILE,
    API_CONFIG.REGISTER,
    API_CONFIG.VERIFY_OTP,
  ];
  // Remove baseURL if present in url
  let url = config.url || '';
  if (url.startsWith(API_CONFIG.BASE_URL)) {
    url = url.replace(API_CONFIG.BASE_URL, '');
  }
  if (token && !skipAuth.some((apiPath) => url.startsWith(apiPath))) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle invalid/expired token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      sessionStorage.clear();
      // Dispatch logout to update redux state
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
