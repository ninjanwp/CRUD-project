// Context for managing auth state
import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.login(credentials);
      const { token, user } = response;
      
      // User object now includes role and cart
      const enrichedUser = {
        ...user,
        role: user.role || 'customer',
        cart: user.cart || []
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      
      setToken(token);
      setUser(enrichedUser);
      
      return enrichedUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  
  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      login, 
      logout, 
      loading,
      isAdmin,
      updateCart: (cart) => setUser(prev => ({...prev, cart}))
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 