import axios from 'axios';

const BASE_URL = 'https://kasi360.onrender.com';

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kasi360_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginAdmin = (data) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');

// Users
export const getUsers = () => api.get('/api/admin/users');
export const toggleUser = (id, is_active) => api.patch(`/api/admin/users/${id}`, { is_active });

// Listings
export const getListings = () => api.get('/api/listings');
export const deleteListing = (id) => api.delete(`/api/listings/${id}`);

// Orders
export const getOrders = () => api.get('/api/orders');
export const updateOrderStatus = (id, status) => api.patch(`/api/orders/${id}/status`, { status });

// Stats
export const getStats = () => api.get('/api/admin/stats');

export default api;
