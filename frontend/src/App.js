import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
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
import { SettingsProvider } from "./context/SettingsContext";
import React, { useEffect } from "react";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgress from "./components/ScrollProgress";
// Initialize AOS in your App.js useEffect

function App() {
  useEffect(() => {

  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <AppProvider>
              <MainNav />
              <ScrollProgress />
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
