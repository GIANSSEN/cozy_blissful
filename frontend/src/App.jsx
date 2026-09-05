import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence, motion } from 'framer-motion';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminServices from './pages/admin/AdminServices';
import AdminStaff from './pages/admin/AdminStaff';
import AdminUserMaintenance from './pages/admin/AdminUserMaintenance';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHistory from './pages/admin/AdminHistory';

// Therapist Pages
import TherapistDashboard from './pages/therapist/TherapistDashboard';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffTherapists from './pages/staff/StaffTherapists';
import StaffAppointments from './pages/staff/StaffAppointments';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import BookingSuccess from './pages/booking/BookingSuccess';
import BookingCancel from './pages/booking/BookingCancel';

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] } }}
    exit={{ opacity: 0, y: -4, transition: { duration: 0.08, ease: "easeIn" } }}
  >
    {children}
  </motion.div>
);

// Animated routes (needs location)
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public ──────────────────────────────────────── */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* ── Admin ──────────────────────────────────────── */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminAppointments /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminCustomers /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminServices /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminStaff /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminUserMaintenance /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/history" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminHistory /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminAuditLogs /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminSettings /></PageTransition></ProtectedRoute>} />

        {/* ── Therapist ────────────────────────────────── */}
        <Route path="/therapist/dashboard" element={<ProtectedRoute allowedRoles={['therapist']}><PageTransition><TherapistDashboard /></PageTransition></ProtectedRoute>} />

        {/* ── Staff ────────────────────────────────────── */}
        <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff']}><PageTransition><StaffDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/staff/therapists" element={<ProtectedRoute allowedRoles={['staff']}><PageTransition><StaffTherapists /></PageTransition></ProtectedRoute>} />
        <Route path="/staff/appointments" element={<ProtectedRoute allowedRoles={['staff']}><PageTransition><StaffAppointments /></PageTransition></ProtectedRoute>} />

        {/* ── Client & Payment ──────────────────────── */}
        <Route path="/booking/dashboard" element={<ProtectedRoute allowedRoles={['client']}><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['client']}><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/booking/success" element={<PageTransition><BookingSuccess /></PageTransition>} />
        <Route path="/booking/cancel" element={<PageTransition><BookingCancel /></PageTransition>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <ToastProvider>
            <CartProvider>
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </CartProvider>
          </ToastProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
