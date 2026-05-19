import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored token to every request
const token = localStorage.getItem('acms_token');
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Response interceptor — strip wrapper, surface clean errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

export default api;
