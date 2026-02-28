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

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('With data:', config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response);
    return response;
  },
  (error) => {
    console.error('Request failed:', error.config?.url);
    console.error('Error details:', error.response?.data);
    console.error('Status:', error.response?.status);
    
    const message = error.response?.data?.error || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Registration flow
  sendOTP: (email) => api.post('/users/send-otp/', { email }),
  
  // Forgot password flow
  forgotPasswordSendOTP: (email) => api.post('/users/forgot-password/', { email }),
  
  // Common
  verifyOTP: (email, otp) => api.post('/users/verify-otp/', { email, otp }),
  
  // Register new user
  register: (userData) => api.post('/users/register/', {
    email: userData.email,
    name: userData.name,
    mobile: userData.mobile,
    password: userData.password
  }),
  
  // Reset password
  resetPassword: (email, otp, new_password) => 
    api.post('/users/reset-password/', { 
      email: email,
      otp: otp,
      new_password: new_password
     }),
  
  // Login
  login: (email, password) => api.post('/users/login/', { email, password }),
};

export default api;