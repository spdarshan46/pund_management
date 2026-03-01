// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    console.log('With token:', token ? 'Yes' : 'No');
    console.log('With data:', config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response);
    return response;
  },
  (error) => {
    console.error('Request failed:', error.config?.url);
    console.error('Error details:', error.response?.data);
    console.error('Status:', error.response?.status);
    
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    const message = error.response?.data?.error || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendOTP: (email) => api.post('/users/send-otp/', { email }),
  forgotPasswordSendOTP: (email) => api.post('/users/forgot-password/', { email }),
  verifyOTP: (email, otp) => api.post('/users/verify-otp/', { email, otp }),
  register: (userData) => api.post('/users/register/', userData),
  resetPassword: (email, otp, new_password) => 
    api.post('/users/reset-password/', { email, otp, new_password }),
  login: (email, password) => api.post('/users/login/', { email, password }),
};

// Export api for other endpoints
export default api;