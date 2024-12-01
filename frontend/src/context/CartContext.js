import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, updateCart } = useAuth();

  const addToCart = (product) => {
    const currentCart = user?.cart || [];
    const existingItem = currentCart.find(item => item.productId === product.id);
    
    let newCart;
    if (existingItem) {
      newCart = currentCart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...currentCart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        image: product.primary_image,
        description: product.description
      }];
    }
    
    updateCart(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = user?.cart.filter(item => item.productId !== productId) || [];
    updateCart(newCart);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    const item = user?.cart.find(i => i.productId === productId);
    if (item && quantity > item.stock) return;
    const newCart = user?.cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ) || [];
    updateCart(newCart);
  };

  return (
    <CartContext.Provider value={{
      cart: user?.cart || [],
      addToCart,
      removeFromCart,
      updateQuantity,
      total: (user?.cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 