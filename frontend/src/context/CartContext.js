import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import apiService from "../services/api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { isAuthenticated, user } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      console.log("Fetching cart for user:", user?.id);
      const response = await apiService.list("cart");
      console.log("Fetched cart response:", response);
      if (response && Array.isArray(response.items)) {
        setCart(response.items);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart([]);
    }
  }, [user?.id]);

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
  }, [isAuthenticated, user?.id, fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated && user?.id) {
        // For authenticated users - use the API
        console.log("Adding to cart for user:", user?.id, {
          productId: product.id,
          quantity,
        });
        const response = await apiService.create("cartItems", {
          productId: product.id,
          quantity,
        });
        console.log("Add to cart response:", response);

        if (response && Array.isArray(response.items)) {
          setCart(response.items);
        }
      } else {
        // For guest users - use localStorage
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
        // For authenticated users - use the API
        console.log(
          "Removing from cart for user:",
          user?.id,
          "product:",
          productId
        );
        const response = await apiService.delete("cartItems", productId);
        console.log("Remove from cart response:", response);

        if (response && Array.isArray(response.items)) {
          setCart(response.items);
        }
      } else {
        // For guest users - use localStorage
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
        // For authenticated users - use the API
        console.log("Updating cart quantity for user:", user?.id, {
          productId,
          quantity,
        });
        const response = await apiService.create("cartItems", {
          productId,
          quantity,
        });
        console.log("Update quantity response:", response);

        if (response && Array.isArray(response.items)) {
          setCart(response.items);
        }
      } else {
        // For guest users - use localStorage
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
  const mergeGuestCart = useCallback(async () => {
    const savedCart = localStorage.getItem("guestCart");
    if (savedCart && isAuthenticated && user?.id) {
      const guestCartItems = JSON.parse(savedCart);
      for (const item of guestCartItems) {
        await addToCart({ id: item.productId, ...item }, item.quantity);
      }
      localStorage.removeItem("guestCart");
    }
  }, [isAuthenticated, user?.id, addToCart]);

  // Add effect to handle cart merging on login
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      mergeGuestCart();
    }
  }, [isAuthenticated, user?.id, mergeGuestCart]);

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
