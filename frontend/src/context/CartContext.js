import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { isAuthenticated, user } = useAuth();

  // Fetch cart when auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Clear any guest cart data when logging in
      localStorage.removeItem("guestCart");
      fetchCart();
    } else {
      // When logging out, clear the authenticated cart and load guest cart
      const savedCart = localStorage.getItem("guestCart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]); // Reset cart when logging out
      }
    }
  }, [isAuthenticated, user?.id]); // Add user?.id as dependency to ensure we have the user data

  const fetchCart = async () => {
    try {
      const response = await axios.get("/api/cart");
      if (response.data && Array.isArray(response.data.items)) {
        const transformedItems = response.data.items.map((item) => ({
          productId: item.product_id,
          name: item.name,
          price: parseFloat(item.price),
          image: item.image,
          description: item.description,
          stock: parseInt(item.stock),
          quantity: parseInt(item.quantity),
        }));
        setCart(transformedItems);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart([]);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated && user?.id) {
        const response = await axios.post("/api/cart/items", {
          productId: product.id,
          quantity,
        });
        if (response.data && Array.isArray(response.data.items)) {
          const transformedItems = response.data.items.map((item) => ({
            productId: item.product_id,
            name: item.name,
            price: parseFloat(item.price),
            image: item.image,
            description: item.description,
            stock: parseInt(item.stock),
            quantity: parseInt(item.quantity),
          }));
          setCart(transformedItems);
        }
      } else {
        const existingItem = cart.find((item) => item.productId === product.id);
        const imageUrl =
          product.images?.length > 0 && product.images[0]?.url
            ? `http://localhost:8000${product.images[0].url}`
            : null;

        const newCart = existingItem
          ? cart.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [
              ...cart,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: imageUrl,
                description: product.description,
                stock: product.stock,
                quantity,
              },
            ];

        setCart(newCart);
        localStorage.setItem("guestCart", JSON.stringify(newCart));
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated && user?.id) {
        const response = await axios.delete(`/api/cart/items/${productId}`);
        if (response.data && Array.isArray(response.data.items)) {
          const transformedItems = response.data.items.map((item) => ({
            productId: item.product_id,
            name: item.name,
            price: parseFloat(item.price),
            image: item.image,
            description: item.description,
            stock: parseInt(item.stock),
            quantity: parseInt(item.quantity),
          }));
          setCart(transformedItems);
        }
      } else {
        const newCart = cart.filter((item) => item.productId !== productId);
        setCart(newCart);
        localStorage.setItem("guestCart", JSON.stringify(newCart));
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        return removeFromCart(productId);
      }

      if (isAuthenticated && user?.id) {
        const response = await axios.post("/api/cart/items", {
          productId,
          quantity,
        });
        if (response.data && Array.isArray(response.data.items)) {
          const transformedItems = response.data.items.map((item) => ({
            productId: item.product_id,
            name: item.name,
            price: parseFloat(item.price),
            image: item.image,
            description: item.description,
            stock: parseInt(item.stock),
            quantity: parseInt(item.quantity),
          }));
          setCart(transformedItems);
        }
      } else {
        const newCart = cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        setCart(newCart);
        localStorage.setItem("guestCart", JSON.stringify(newCart));
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  // Add function to merge guest cart with user cart on login
  const mergeGuestCart = async () => {
    const savedCart = localStorage.getItem("guestCart");
    if (savedCart && isAuthenticated && user?.id) {
      const guestCartItems = JSON.parse(savedCart);
      for (const item of guestCartItems) {
        await addToCart(item, item.quantity);
      }
      localStorage.removeItem("guestCart");
    }
  };

  // Add effect to handle cart merging on login
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      mergeGuestCart();
    }
  }, [isAuthenticated, user?.id]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
