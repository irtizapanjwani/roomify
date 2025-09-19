import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000',
  withCredentials: true
});

// Add a request interceptor to include credentials and auth token
instance.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    
    // Add Authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access - clear tokens and redirect
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Handle forbidden access
          console.error('Access forbidden');
          break;
        case 404:
          // Don't log 404 errors for room availability checks
          if (!error.config.url.includes('/api/hotels/room/')) {
            console.error('Resource not found:', error.config.url);
          }
          break;
        default:
          // Handle other errors
          if (!error.config.url.includes('/api/hotels/room/') || error.response.status !== 404) {
            console.error('API Error:', error.response.data);
          }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.message);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 