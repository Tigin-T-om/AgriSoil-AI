import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import TwitterCallback from './pages/TwitterCallback';
import ForgotPassword from './pages/ForgotPassword';
import SoilInput from './pages/SoilInput';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import ProductDetail from './pages/ProductDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/callback/twitter" element={<TwitterCallback />} />

          {/* Shop/Products - both paths work */}
          <Route path="/shop" element={<Shop />} />
          <Route path="/products" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Cart */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          {/* My Orders - both paths work */}
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* Soil Analysis - both paths work */}
          <Route
            path="/soil-analysis"
            element={
              <ProtectedRoute>
                <SoilInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/soil-input"
            element={
              <ProtectedRoute>
                <SoilInput />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <Products />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <Orders />
              </AdminRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
