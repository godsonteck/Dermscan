import axios from 'axios';

const getBaseURL = () => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_URL) {
    return metaEnv.VITE_API_URL;
  }
  // When running inside a native mobile app/webview (e.g. android-webview, capacitor, or file://)
  // we must talk to the deployed server instead of local file-system routing.
  const isCapacitorOrWebView = 
    window.location.protocol === 'file:' || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '10.0.2.2' || // Android emulator loopback
    window.location.origin.includes('capacitor');

  if (isCapacitorOrWebView) {
    // Dynamic fallback to the hosted Cloud Run server
    return 'https://ais-pre-rbnk22m5tsatvchbsrb64e-899591562881.europe-west2.run.app/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
