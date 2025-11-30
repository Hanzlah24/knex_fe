import axios from 'axios';
import { toast } from 'sonner';

// Create base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store for refresh token requests to avoid multiple calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const publicEndpoints = ['/auth/login', '/auth/refresh'];
    const isPublic = publicEndpoints.some((ep) =>
      config.url && config.url.includes(ep)
    );

    if (!isPublic) {
      const token = localStorage.getItem('@token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config: originalRequest } = error;

    // 1) If 401 on login → invalid credentials: reject immediately
    if (
      response &&
      response.status === 401 &&
      originalRequest.url &&
      originalRequest.url.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    // 2) If not a 401 or already retried → reject
    if (!response || response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 3) Mark request as retried
    originalRequest._retry = true;

    // 4) If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // 5) Otherwise, start a token refresh
    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const {data}  = await axios.post(
        `${api.defaults.baseURL}/auth/refresh/`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const {access, refresh } = data;
      localStorage.setItem('@token', access);
      localStorage.setItem('refreshToken', refresh);

      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      originalRequest.headers['Authorization'] = `Bearer ${access}`;

      processQueue(null, access);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.clear();
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login?message=session-expired';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
