import axios from 'axios';

const auth = {
  login: async (credentials) => {
    console.log('Attempting login with email:', credentials.email);
    try {
      const response = await axios.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },

  getToken: () => localStorage.getItem('token'),
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default auth; 