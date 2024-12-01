import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

const api = {
  login: async (credentials) => {
    const response = await axios.post('/auth/login', {
      email: credentials.identifier || credentials.email,
      password: credentials.password
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },

  // Add auth header to all requests
  setAuthHeader: (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  },

  getProducts: async () => {
    const response = await axios.get('/api/products');
    return response.data;
  },
  
  createProduct: async (product) => {
    const response = await axios.post('/api/products', product);
    return response.data;
  },
  
  updateProduct: async (id, product) => {
    const response = await axios.put(`/api/products/${id}`, product);
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await axios.delete(`/api/products/${id}`);
    return response.data;
  },
  
  deleteProducts: async (ids) => {
    const response = await fetch('/api/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete products');
    }
    
    return response.json();
  }
};

export default api;