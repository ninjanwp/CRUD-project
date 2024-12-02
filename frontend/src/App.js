import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import Home from './pages/Home';
import Metrics from './pages/Metrics';
import StorefrontPage from './pages/StorefrontPage';
import { AppProvider } from './context/AppContext';
import MainNav from './components/navigation/MainNav';
import Layout from './components/Layout';
import AdminIndicator from './components/AdminIndicator';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import UsersPage from './pages/admin/UsersPage';
import InventoryPage from './pages/InventoryPage';
import InventoryDashboard from './pages/InventoryDashboard';
import { SettingsProvider } from './context/SettingsContext';

const routes = [
  {
    path: '/admin/inventory',
    name: 'Inventory',
    icon: 'bi-box-seam',
    component: InventoryPage
  },
  {
    path: '/admin/orders',
    name: 'Orders',
    icon: 'bi-bag-check',
    component: OrdersPage
  },
  {
    path: '/admin/users',
    name: 'Users',
    icon: 'bi-people',
    component: UsersPage
  },
  {
    path: '/admin/metrics',
    name: 'Metrics',
    icon: 'bi-graph-up',
    component: Metrics
  }
];

function App() {
  return (
    <BrowserRouter>
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
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute adminOnly={true}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="metrics" element={<Metrics />} />
                      </Routes>
                    </ProtectedRoute>
                  } />
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