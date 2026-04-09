import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DataStore from './utils/DataStore';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginSelectionPage from './pages/LoginSelectionPage';
import LoginPage from './pages/LoginPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerDashboard from './pages/CustomerDashboard';

// Admin Layout & Pages
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Masters from './pages/Masters';
import BookingPage from './pages/BookingPage';
import BillingPage from './pages/BillingPage';
import ReportPage from './pages/ReportPage';
import HelpdeskPage from './pages/HelpdeskPage';
import InventoryPage from './pages/InventoryPage';
import GalleryPage from './pages/GalleryPage';
import BackupPage from './pages/BackupPage';
import FinancePage from './pages/FinancePage';
import GaragePage from './pages/GaragePage';
import Settings from './pages/Settings';
import SuperAdminPage from './pages/SuperAdminPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login-selection" element={<LoginSelectionPage />} />
        <Route path="/admin-login" element={<LoginPage />} />
        <Route path="/customer-login" element={<CustomerLoginPage />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />

        {/* --- PROTECTED ADMIN ROUTES --- */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <div style={{ display: 'flex' }}>
                <Sidebar />
                <div style={{ flex: 1, marginLeft: '250px', background: '#f4f7f6', minHeight: '100vh' }}>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="masters" element={<Masters />} />
                    <Route path="booking" element={<BookingPage />} />
                    <Route path="billing" element={<BillingPage />} />
                    <Route path="finance" element={<FinancePage />} />
                    <Route path="reports" element={<ReportPage />} />
                    <Route path="helpdesk" element={<HelpdeskPage />} />
                    <Route path="garage" element={<GaragePage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="gallery" element={<GalleryPage />} />
                    <Route path="backup" element={<BackupPage />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="super-admin" element={<SuperAdminPage />} />
                  </Routes>
                </div>
              </div>
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

const ProtectedAdminRoute = ({ children }) => {
  const session = DataStore.getSession();
  // This check is now valid because we save 'userId' in the session
  if (!session || !session.userId) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
};

export default App;