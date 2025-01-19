import axios from "axios";
import auth from "./auth";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = auth.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Define API endpoints
const endpoints = {
  users: "/api/admin/users",
  products: "/api/admin/products",
  orders: "/api/admin/orders",
  categories: "/api/admin/categories",
  manufacturers: "/api/admin/manufacturers",
  attributes: "/api/admin/attributes",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    profile: "/auth/profile",
  },
};

// Add API methods
const apiService = {
  async list(resource) {
    console.log("Fetching", resource, "from", endpoints[resource] || resource);
    try {
      const response = await api.get(endpoints[resource] || resource);
      return response.data;
    } catch (error) {
      console.error("Error fetching", resource + ":", error);
      throw error;
    }
  },

  async create(endpoint, data) {
    try {
      const response = await api.post(`${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating", endpoint + ":", error);
      throw error;
    }
  },

  async update(endpoint, id, data) {
    try {
      const response = await api.put(`${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating", endpoint + ":", error);
      throw error;
    }
  },

  async delete(endpoint, id) {
    try {
      const response = await api.delete(`${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting", endpoint + ":", error);
      throw error;
    }
  },
};

export default apiService;
