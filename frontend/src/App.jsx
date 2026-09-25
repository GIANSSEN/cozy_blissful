import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';

// Code-split route pages so Vite dev only transforms the active route.
// This is the biggest cold-start win: before, all 22 pages + framer-motion +
// gsap/lenis/xlsx were parsed on `npm run dev` startup.
// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminUserMaintenance = lazy(() => import('./pages/admin/AdminUserMaintenance'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminHistory = lazy(() => import('./pages/admin/AdminHistory'));

// Therapist Pages
const TherapistDashboard = lazy(() => import('./pages/therapist/TherapistDashboard'));

// Staff Pages
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffTherapists = lazy(() => import('./pages/staff/StaffTherapists'));
const StaffAppointments = lazy(() => import('./pages/staff/StaffAppointments'));

// Client Pages
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));

// Payment Pages (PayMongo)
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/payment/PaymentCancel'));

// 404 Page
const NotFound = lazy(() => import('./pages/NotFound'));

// Lightweight route fallback — no spinner lib, no extra dep to parse
const RouteFallback = () => (
  <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#0a3d30' }}>
    Loading…
  </div>
);

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] } }}
    exit={{ opacity: 0, y: -4, transition: { duration: 0.08, ease: 'easeIn' } }}
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
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* ── Payment Callback Pages (PayMongo) — require client auth ─────── */}
        <Route
          path="/payment/success"
          element={<ProtectedRoute allowedRoles={['client']}><PageTransition><PaymentSuccess /></PageTransition></ProtectedRoute>}
        />
        <Route
          path="/payment/cancel"
          element={<ProtectedRoute allowedRoles={['client']}><PageTransition><PaymentCancel /></PageTransition></ProtectedRoute>}
        />

        {/* ── Admin ──────────────────────────────────────────────────────── */}
        <Route path="/admin/dashboard"   element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminAppointments /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/customers"   element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminCustomers /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/services"    element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminServices /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/staff"       element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminStaff /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/users"       element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminUserMaintenance /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/history"     element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminHistory /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/audit-logs"  element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminAuditLogs /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/settings"    element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminSettings /></PageTransition></ProtectedRoute>} />

        {/* ── Therapist ──────────────────────────────────────────────────── */}
        <Route path="/therapist/dashboard" element={<ProtectedRoute allowedRoles={['therapist']}><PageTransition><TherapistDashboard /></PageTransition></ProtectedRoute>} />

        {/* ── Staff ──────────────────────────────────────────────────────── */}
        <Route path="/staff/dashboard"    element={<ProtectedRoute allowedRoles={['staff']}><PageTransition><StaffDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/staff/therapists"   element={<ProtectedRoute allowedRoles={['staff']}><PageTransition><StaffTherapists /></PageTransition></ProtectedRoute>} />
        <Route path="/staff/appointments" element={<ProtectedRoute allowedRoles={['staff']}><PageTransition><StaffAppointments /></PageTransition></ProtectedRoute>} />

        {/* ── Client ─────────────────────────────────────────────────────── */}
        {/* /booking/dashboard redirects to canonical /client/dashboard (MED-7) */}
        <Route path="/booking/dashboard" element={<Navigate to="/client/dashboard" replace />} />
        <Route path="/client/dashboard"  element={<ProtectedRoute allowedRoles={['client']}><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute>} />

        {/* 404 — proper Not Found page instead of silent redirect (HIGH-4) */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
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
                <ErrorBoundary>
                  <AnimatedRoutes />
                </ErrorBoundary>
              </BrowserRouter>
            </CartProvider>
          </ToastProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
