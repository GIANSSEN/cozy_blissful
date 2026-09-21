import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DASHBOARD_BY_ROLE = {
  admin: '/admin/dashboard',
  staff: '/staff/dashboard',
  therapist: '/therapist/dashboard',
  client: '/client/dashboard',
};

export default function NotFound() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleGoHome = () => {
    const dest = DASHBOARD_BY_ROLE[role] || '/';
    navigate(dest, { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #03140e 0%, #041e16 50%, #062c22 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #bfa15f, transparent)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #bfa15f, transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md text-center"
      >
        {/* Gold glow number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <span
            className="text-[8rem] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #bfa15f, #e8cc8a, #8c7033)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 40px rgba(191,161,95,0.3))',
            }}
          >
            404
          </span>
        </motion.div>

        {/* Page label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: '#bfa15f' }}
          >
            Page Not Found
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-2xl font-bold text-white mb-3"
        >
          Oops! This page doesn't exist.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm mb-8"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          The page you're looking for may have been moved, deleted, or never existed.
          Let's get you back to a safe place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #bfa15f, #d4b87a)',
              color: '#03140e',
              boxShadow: '0 6px 20px rgba(191,161,95,0.35)',
            }}
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </button>
        </motion.div>

        {/* Brand watermark */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-xs"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Cozy Blissful Spa &amp; Salon
        </motion.p>
      </motion.div>
    </div>
  );
}
