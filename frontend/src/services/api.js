import axios from 'axios';
import auth from './auth';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = auth.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid auth state
      auth.logout();
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define endpoints exactly as they exist in your backend server.js
const endpoints = {
  // Admin routes
  products: '/api/admin/products',
  categories: '/api/admin/categories', 
  manufacturers: '/api/admin/manufacturers',
  attributes: '/api/admin/attributes',
  users: '/api/admin/users',
  orders: '/api/admin/orders',
  
  // Public routes
  storefront: {
    products: '/api/storefront/products',
    categories: '/api/categories',
    manufacturers: '/api/manufacturers'
  },
  
  // Auth endpoints
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    profile: '/api/auth/profile'
  }
};

export default {
  list: async (resource) => {
    try {
      console.log(`Fetching ${resource} from ${endpoints[resource]}`);
      const response = await api.get(endpoints[resource] || resource);
      console.log(`Response for ${resource}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${resource}:`, error);
      throw error;
    }
  },

  get: async (resource, id) => {
    try {
      const response = await api.get(`${endpoints[resource]}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting ${resource}:`, error);
      throw error;
    }
  },

  create: async (resource, data) => {
    try {
      const response = await api.post(endpoints[resource], data);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${resource}:`, error);
      throw error;
    }
  },

  update: async (resource, id, data) => {
    try {
      console.log(`Updating ${resource}/${id} with data:`, data); // Debug log
      const response = await api.put(`${endpoints[resource]}/${id}`, data);
      console.log(`Update response:`, response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error(`Error updating ${resource}:`, error);
      throw error;
    }
  },

  delete: async (resource, id) => {
    try {
      if (!id) {
        throw new Error(`No ID provided for ${resource} deletion`);
      }
      
      console.log(`Deleting ${resource} with ID:`, id);
      const response = await api.delete(`${endpoints[resource]}/${id}`);
      console.log(`Delete response for ${resource}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting ${resource}:`, error);
      if (error.response?.status === 404) {
        console.log(`${resource} with ID ${id} not found`);
      }
      throw error;
    }
  }
};