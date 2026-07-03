import { Platform } from 'react-native';

const BASE_URL = 'https://kasi360.onrender.com';

const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('kasi360_token');
  }
  const SecureStore = await import('expo-secure-store');
  return await SecureStore.getItemAsync('kasi360_token');
};

const request = async (method, endpoint, body = null, requiresAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth
export const registerUser = (body) => request('POST', '/api/auth/register', body);
export const loginUser = (body) => request('POST', '/api/auth/login', body);
export const getMe = () => request('GET', '/api/auth/me', null, true);

// Listings
export const getListings = (params = '') => request('GET', `/api/listings${params}`);
export const getListing = (id) => request('GET', `/api/listings/${id}`);
export const createListing = (body) => request('POST', '/api/listings', body, true);
export const updateListing = (id, body) => request('PATCH', `/api/listings/${id}`, body, true);

// Orders
export const createOrder = (body) => request('POST', '/api/orders', body, true);
export const getOrders = () => request('GET', '/api/orders', null, true);
export const updateOrderStatus = (id, status) =>
  request('PATCH', `/api/orders/${id}/status`, { status }, true);