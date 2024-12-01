import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import Home from './pages/Home';
import Metrics from './pages/Metrics';
import SettingsPage from './pages/SettingsPage';
import StorefrontPage from './pages/StorefrontPage';
import { SettingsProvider } from './context/SettingsContext';
import { AppProvider } from './context/AppContext';
import MainNav from './components/navigation/MainNav';
import Layout from './components/Layout';
import AdminIndicator from './components/AdminIndicator';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import RegisterPage from './pages/RegisterPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetailsPage from './pages/ProductDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppProvider>
            <SettingsProvider>
              <MainNav />
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<StorefrontPage />} />
                  <Route path="/products" element={<StorefrontPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute adminOnly={true}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<Home />} />
                        <Route path="products" element={<ProductsPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="metrics" element={<Metrics />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="categories" element={<CategoriesPage />} />
                      </Routes>
                    </ProtectedRoute>
                  } />
                </Routes>
              </Layout>
              <AdminIndicator />
            </SettingsProvider>
          </AppProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;