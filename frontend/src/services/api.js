import axios from 'axios';
import auth from './auth';
import { toast } from 'react-hot-toast';

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
      auth.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add API methods to the existing api instance
Object.assign(api, {
  async list(endpoint) {
    console.log('Fetching', endpoint, 'from', this.baseURL);
    const response = await this.get(`${endpoint}`);
    return response.data;
  },

  async create(endpoint, data) {
    try {
      const response = await this.post(`${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating', endpoint + ':', error);
      throw error;
    }
  },

  async update(endpoint, id, data) {
    try {
      const response = await this.put(`${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating', endpoint + ':', error);
      throw error;
    }
  },

  async delete(endpoint, id) {
    try {
      const response = await this.delete(`${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting', endpoint + ':', error);
      throw error;
    }
  }
});

export default api;