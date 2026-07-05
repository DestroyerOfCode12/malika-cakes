import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCatalogStore } from './store/catalogStore';
import { useAuthStore } from './store/authStore';

// Pages (to be created)
import HomePage from './pages/HomePage';
import OrderFormPage from './pages/OrderFormPage';
import OrderStatusPage from './pages/OrderStatusPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import FAQPage from './pages/FAQPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const fetchCatalog = useCatalogStore((state) => state.fetchCatalog);
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Load catalog and auth state on app init
    fetchCatalog();
    initializeAuth();
  }, [fetchCatalog, initializeAuth]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/order" element={<OrderFormPage />} />
        <Route path="/order-status" element={<OrderStatusPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
