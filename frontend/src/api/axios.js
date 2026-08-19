import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF hint for Laravel + marks as non-simple request
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor — attach bearer token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle expired / invalid tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear all auth state on token invalidation / expiry
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');

      // Redirect to login (only if not already on an auth page to avoid loops)
      const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
      const currentPath = window.location.pathname;
      if (!authRoutes.some(r => currentPath.startsWith(r))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;