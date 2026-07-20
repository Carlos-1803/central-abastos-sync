import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  // If using relative URL from same origin, you can leave baseURL as '' or '/api'
  // But we'll assume the backend is at /api
});

// Request interceptor for auth token (if needed)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized, etc.
    return Promise.reject(error);
  }
);

export default api;