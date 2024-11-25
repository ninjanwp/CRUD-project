import axios from 'axios';

// Mock credentials for development
const MOCK_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Mock user data
const MOCK_USER = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin'
};

const api = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check credentials
    if (credentials.identifier === MOCK_CREDENTIALS.email && 
        credentials.password === MOCK_CREDENTIALS.password) {
      return {
        token: 'mock-jwt-token',
        user: MOCK_USER
      };
    }
    throw new Error('Invalid credentials');
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