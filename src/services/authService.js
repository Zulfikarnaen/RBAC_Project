import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Simpan token ke localStorage kalau login berhasil
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Server Error');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};