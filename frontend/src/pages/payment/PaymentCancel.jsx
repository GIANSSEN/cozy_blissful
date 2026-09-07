import React from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, PhoneCall } from 'lucide-react';

export default function PaymentCancel() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const apptId   = params.get('appointment_id');

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg,#1e0a0a 0%,#3b0f0f 50%,#5c1515 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#f87171,transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-8 text-center" style={{ background: 'linear-gradient(135deg,#b91c1c,#dc2626)' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <XCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-black text-white mb-1">Payment Cancelled</h1>
          <p className="text-red-100/80 text-sm">You cancelled the payment process. Your booking slot is still reserved for a limited time.</p>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-4">
          {apptId && (
            <div className="rounded-2xl p-4 space-y-1 text-xs" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointment Reference</p>
              <p className="font-black text-slate-800 text-sm">#{String(apptId).padStart(5, '0')}</p>
              <p className="text-slate-500">Booking status: <span className="font-semibold text-amber-600">Awaiting Payment</span></p>
            </div>
          )}

          <div className="p-4 rounded-2xl text-xs space-y-1" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
            <p className="font-bold text-amber-700">Your slot is still held</p>
            <p className="text-slate-500 leading-relaxed">You can retry payment from your dashboard. Need help? Contact our salon directly.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/client/dashboard')}
              className="py-3 rounded-2xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 transition hover:bg-slate-100"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> My Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/client/dashboard')}
              className="py-3 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] shadow-md"
              style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Payment
            </button>
          </div>

          <a
            href="tel:+63"
            className="w-full py-3 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-center gap-2 transition hover:bg-emerald-50"
            style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.1)' }}
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call Cozy Blissful Spa
          </a>
        </div>
      </motion.div>
    </div>
  );
}
