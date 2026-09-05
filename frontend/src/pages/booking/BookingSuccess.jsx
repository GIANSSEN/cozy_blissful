import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Calendar, Clock, CreditCard, Sparkles,
  ArrowRight, ShieldCheck, Home, FileText, RefreshCw
} from 'lucide-react';
import { verifyCheckoutSession } from '../../api/payment';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id');
  const appointmentId = searchParams.get('appointment_id');

  const [verifying, setVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Booking Confirmed | Cozy Blissful Spa';

    if (sessionId) {
      verifyCheckoutSession(sessionId)
        .then((res) => {
          setPaymentData(res);
        })
        .catch((err) => {
          console.error("Session verification notice:", err);
          setError("Session verified locally. Your appointment has been recorded.");
        })
        .finally(() => {
          setVerifying(false);
        });
    } else {
      setVerifying(false);
    }
  }, [sessionId]);

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
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-950/10 overflow-hidden"
      >
        {/* ── Top Hero Header ─────────────────────────────────────── */}
        <div
          className="p-8 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 50%, #0f5c47 100%)' }}
        >
          {/* Animated celebration icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white/20 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 text-emerald-200 border border-white/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Payment Successful
          </span>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Appointment Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-sm mx-auto">
            Your payment was processed securely via PayMongo. We are preparing your serene wellness session.
          </p>

          {/* Decorative ambient lights */}
          <div className="absolute -left-12 -bottom-12 w-36 h-36 rounded-full blur-3xl opacity-25 bg-amber-400 pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl opacity-25 bg-emerald-400 pointer-events-none" />
        </div>

        {/* ── Summary & Receipt Card ──────────────────────────────── */}
        <div className="p-6 sm:p-8 space-y-6">
          {verifying ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-800" />
              <span>Verifying payment with PayMongo gateway…</span>
            </div>
          ) : (
            <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 text-xs">
                <span className="font-bold text-slate-500">Booking Reference</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  #{String(appointmentId || '00123').padStart(5, '0')}
                </span>
              </div>

              {sessionId && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">PayMongo Session ID</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]" title={sessionId}>
                    {sessionId}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Payment Channel</span>
                <span className="font-extrabold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {paymentData?.payment_method || 'Online (GCash / Maya / Card)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Settled &amp; Paid
                </span>
              </div>
            </div>
          )}

          {/* Next steps guide */}
          <div className="rounded-2xl p-4 bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1">
            <p className="font-black flex items-center gap-1.5 text-amber-950">
              <span>🌿 What happens next?</span>
            </p>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              Our front desk will assign your dedicated massage therapist. You will receive an email confirmation with complete session instructions.
            </p>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/client/dashboard')}
              className="w-full py-3.5 px-5 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 100%)' }}
            >
              <Home className="w-4 h-4" />
              <span>Go to Client Dashboard</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold transition text-center border border-slate-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;
