import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const baseURL = envBaseUrl ? (envBaseUrl.endsWith('/api') ? envBaseUrl : `${envBaseUrl}/api`) : '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sorteiohub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para redirecionar em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sorteiohub_token');
      localStorage.removeItem('sorteiohub_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
