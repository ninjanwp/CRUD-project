import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/InventoryPage";
import OrdersPage from "./pages/OrdersPage";
import Home from "./pages/Home";
import Metrics from "./pages/Metrics";
import StorefrontPage from "./pages/StorefrontPage";
import { AppProvider } from "./context/AppContext";
import MainNav from "./components/navigation/MainNav";
import Layout from "./components/Layout";
import AdminIndicator from "./components/AdminIndicator";
import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/CartPage";
import RegisterPage from "./pages/RegisterPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import UsersPage from "./pages/admin/UsersPage";
import InventoryPage from "./pages/InventoryPage";
import InventoryDashboard from "./pages/InventoryDashboard";
import { SettingsProvider } from "./context/SettingsContext";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import CategoriesPage from "./pages/admin/CategoriesPage";

// Initialize AOS in your App.js useEffect

function App() {
  useEffect(() => {
    // Check system preference
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    // Set initial theme
    document.documentElement.setAttribute(
      "data-theme",
      darkModeMediaQuery.matches ? "dark" : "light"
    );

    // Listen for system theme changes
    const handleThemeChange = (e) => {
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light"
      );
    };

    darkModeMediaQuery.addEventListener("change", handleThemeChange);

    // Cleanup
    return () => {
      darkModeMediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <AppProvider>
              <MainNav />
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<StorefrontPage />} />
                  <Route path="/products" element={<StorefrontPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/products/:id"
                    element={<ProductDetailsPage />}
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={<Navigate to="/admin" replace />}
                  />
                  <Route
                    path="/admin/inventory"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <InventoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/metrics"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Metrics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <CategoriesPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
              <AdminIndicator />
            </AppProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
