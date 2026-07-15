import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence, motion } from 'framer-motion';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminServices from './pages/admin/AdminServices';
import AdminPayments from './pages/admin/AdminPayments';
import AdminStaff from './pages/admin/AdminStaff';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSettings from './pages/admin/AdminSettings';

// Therapist Pages
import TherapistDashboard from './pages/therapist/TherapistDashboard';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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

        {/* ── Admin ──────────────────────────────────────── */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminAppointments /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminServices /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminPayments /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminStaff /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminProducts /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminSettings /></PageTransition></ProtectedRoute>} />

        {/* ── Therapist ────────────────────────────────── */}
        <Route path="/therapist/dashboard" element={<ProtectedRoute allowedRoles={['therapist']}><PageTransition><TherapistDashboard /></PageTransition></ProtectedRoute>} />

        {/* ── Client ──────────────────────────────────── */}
        <Route path="/booking/dashboard" element={<ProtectedRoute allowedRoles={['client']}><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute>} />

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
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
