import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach authorization headers dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dermscan_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Catch 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dermscan_token');
      localStorage.removeItem('dermscan_user');
      // Redirect to login if path is not public
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
