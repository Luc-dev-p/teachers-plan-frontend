import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401 (SAUF sur /auth/login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne PAS rediriger si c'est la route de connexion
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export default api;