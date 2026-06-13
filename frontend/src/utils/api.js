import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Reads from Vercel env in production, fallback to Vite dev proxy
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linkflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
