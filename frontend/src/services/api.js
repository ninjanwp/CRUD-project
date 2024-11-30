import axios from 'axios';

// Mock credentials for development
const MOCK_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    data: {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      cart: []
    }
  },
  customer: {
    email: 'user@example.com',
    password: 'user123',
    data: {
      id: 2,
      email: 'user@example.com',
      name: 'John Doe',
      role: 'customer',
      cart: []
    }
  }
};

const api = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check admin credentials
    const adminUser = MOCK_USERS.admin;
    const customerUser = MOCK_USERS.customer;

    if (credentials.identifier === adminUser.email && 
        credentials.password === adminUser.password) {
      return {
        token: 'mock-admin-jwt-token',
        user: adminUser.data
      };
    }

    // Check customer credentials
    if (credentials.identifier === customerUser.email && 
        credentials.password === customerUser.password) {
      return {
        token: 'mock-customer-jwt-token',
        user: customerUser.data
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