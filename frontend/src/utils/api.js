import axios from 'axios';

// Automatically strip trailing /api to prevent double /api/api in combined requests
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  return envUrl.replace(/\/api\/?$/, '');
};

const api = axios.create({
  baseURL: getBaseURL(),
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
