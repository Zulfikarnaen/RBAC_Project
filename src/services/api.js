import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; 
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Otomatis nempelin token tiap kali manggil API (kalau sudah login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;