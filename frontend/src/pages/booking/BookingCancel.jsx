import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, Home, HelpCircle, ArrowRight } from 'lucide-react';

const BookingCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointment_id');

  useEffect(() => {
    document.title = 'Payment Cancelled | Cozy Blissful Spa';
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'radial-gradient(circle at top, #faf8f5 0%, #f3ede2 100%)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* ── Top Header ───────────────────────────────────────────── */}
        <div className="p-7 text-center bg-slate-50 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-amber-100 text-amber-700 shadow-inner">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Payment Not Completed
          </span>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Checkout Cancelled
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            You cancelled or exited the PayMongo checkout session before payment was finalized.
          </p>
        </div>

        {/* ── Guidance Content ─────────────────────────────────────── */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-800">
              No charges were made to your account.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Your appointment slot has not been finalized. You can re-open the booking or try paying again with another payment method (GCash, Maya, Card, or QR Ph).
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <button
              onClick={() => navigate('/client/dashboard')}
              className="w-full py-3.5 px-5 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 100%)' }}
            >
              <RotateCcw className="w-4 h-4 text-emerald-300" />
              <span>Retry Booking from Dashboard</span>
            </button>

            <Link
              to="/"
              className="w-full py-3 px-5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition text-center border border-slate-200"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingCancel;
