import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const api = {
  getProducts: async () => {
    return axios.get(`${BASE_URL}/products`);
  },

  createProduct: async (product) => {
    return axios.post(`${BASE_URL}/products`, product);
  },

  updateProduct: async (id, product) => {
    return axios.put(`${BASE_URL}/products/${id}`, product);
  },

  deleteProducts: async (ids) => {
    return axios.delete(`${BASE_URL}/products`, { data: { ids } });
  },

  getOrders: async () => {
    return axios.get(`${BASE_URL}/orders`);
  },

  createOrder: async (order) => {
    return axios.post(`${BASE_URL}/orders`, order);
  }
};

export default api;