import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [isAuthenticated]);
  
  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };
  
  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        const response = await axios.post('/api/cart/items', {
          productId: product.id,
          quantity
        });
        setCart(response.data.items);
      } else {
        const existingItem = cart.find(item => item.productId === product.id);
        const newCart = existingItem
          ? cart.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [...cart, {
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.primary_image,
              description: product.description,
              stock: product.stock,
              quantity
            }];
        
        setCart(newCart);
        localStorage.setItem('guestCart', JSON.stringify(newCart));
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };
  
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const response = await axios.delete(`/api/cart/items/${productId}`);
        setCart(response.data.items);
      } catch (err) {
        console.error('Error removing from cart:', err);
      }
    } else {
      const newCart = cart.filter(item => item.productId !== productId);
      setCart(newCart);
      localStorage.setItem('guestCart', JSON.stringify(newCart));
    }
  };
  
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    
    if (isAuthenticated) {
      try {
        const response = await axios.post('/api/cart/items', {
          productId,
          quantity
        });
        setCart(response.data.items);
      } catch (err) {
        console.error('Error updating cart:', err);
      }
    } else {
      const newCart = cart.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
      setCart(newCart);
      localStorage.setItem('guestCart', JSON.stringify(newCart));
    }
  };
  
  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 