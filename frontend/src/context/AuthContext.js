// Context for managing auth state
import React, { createContext, useContext, useState, useEffect } from "react";
import auth from "../services/auth";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [loading, setLoading] = useState(true);

  // Validate token on mount and token change
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.list("auth/validate");
        if (response.valid) {
          setUser(response.user);
        } else {
          // Token is invalid
          logout();
        }
      } catch (error) {
        console.error("Token validation error:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await auth.login(credentials);

      setToken(response.token);
      setUser(response.user);

      return response.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        loading,
        isAdmin: () => user?.role === "admin",
        updateCart: (cart) => setUser((prev) => ({ ...prev, cart })),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
