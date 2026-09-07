import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CreditCard, Wallet, QrCode, Smartphone,
  ShieldCheck, Loader2, ExternalLink, AlertCircle, Sparkles,
} from 'lucide-react';
import { createCheckoutSession, PAYMENT_METHODS } from '../../api/paymongo';

// ─── Payment Method Option Card ──────────────────────────────────────────────
const MethodCard = ({ method, selected, onSelect }) => {
  const meta = PAYMENT_METHODS[method.id] || {};
  const isSelected = selected === method.id;

  const iconMap = {
    gcash:   <Smartphone className="w-5 h-5" />,
    paymaya: <Wallet className="w-5 h-5" />,
    qrph:    <QrCode className="w-5 h-5" />,
    card:    <CreditCard className="w-5 h-5" />,
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(method.id)}
      className="w-full p-4 rounded-2xl text-left transition-all border flex items-center gap-3 cursor-pointer"
      style={{
        background: isSelected ? meta.bg : '#fff',
        border: `1.5px solid ${isSelected ? meta.color : 'rgba(0,0,0,0.08)'}`,
        boxShadow: isSelected ? `0 4px 16px ${meta.color}22` : 'none',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isSelected ? meta.color : '#f1f5f9', color: isSelected ? '#fff' : '#64748b' }}
      >
        {iconMap[method.id] || <CreditCard className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-800">{method.label}</p>
        <p className="text-xs text-slate-500 leading-tight mt-0.5">{method.description}</p>
      </div>
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          borderColor: isSelected ? meta.color : '#cbd5e1',
          background: isSelected ? meta.color : 'transparent',
        }}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
};

// ── Payment Methods Config ───────────────────────────────────────────────────
const ONLINE_METHODS = [
  { id: 'gcash',   label: 'GCash',               description: 'Pay via GCash e-wallet — instant and secure' },
  { id: 'paymaya', label: 'Maya',                 description: 'Pay via Maya (formerly PayMaya) wallet' },
  { id: 'qrph',    label: 'QR Ph (UnionBank)',    description: 'Scan a QR code with any PH banking app' },
  { id: 'card',    label: 'Credit / Debit Card',  description: 'Visa, Mastercard, JCB — 3D Secure protected' },
];

// ── PayMongo Payment Modal ───────────────────────────────────────────────────
export default function PaymentModal({ appointment, onClose, onSuccess }) {
  const [selected, setSelected]   = useState('gcash');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const price = Number(appointment?.service_price || appointment?.service?.price || 0);
  const serviceName = appointment?.service || appointment?.service?.name || 'Spa Treatment';
  const formattedPrice = price > 0
    ? `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
    : '—';

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await createCheckoutSession({
        appointmentId:       appointment.id,
        paymentMethodTypes:  [selected],
      });
      // Redirect to PayMongo hosted checkout
      window.location.href = data.checkout_url;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initiate payment. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="w-full max-w-md flex flex-col rounded-[2rem] overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
            boxShadow: '0 30px 70px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.8)',
            maxHeight: '92vh',
          }}
        >
          {/* Fixed Header */}
          <div
            className="px-6 py-5 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <CreditCard className="w-5 h-5 text-amber-300" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-200 hover:text-white transition cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-white font-black text-lg">Pay Online via PayMongo</h2>
            <p className="text-emerald-200/80 text-xs mt-0.5">
              #{String(appointment?.id || 1).padStart(5, '0')} — {serviceName}
            </p>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 no-scrollbar">
            {/* Amount */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.1)' }}
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Due</p>
                <p className="text-2xl font-black text-emerald-900 mt-0.5">{formattedPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5 max-w-[150px] text-right truncate">{serviceName}</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Payment Method</p>
              {ONLINE_METHODS.map((m) => (
                <MethodCard key={m.id} method={m} selected={selected} onSelect={setSelected} />
              ))}
            </div>

            {/* Security Badge */}
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-2xl text-xs"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <p className="text-slate-600 leading-relaxed">
                <span className="font-bold text-emerald-800">Secured by PayMongo</span> — PCI DSS compliant. Your card & wallet details are never stored on our servers.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-xs text-red-700"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div
            className="p-5 border-t flex items-center gap-3 flex-shrink-0"
            style={{ borderColor: 'rgba(6,44,34,0.08)', background: '#fcfbfa' }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-600 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={loading}
              className="flex-2 py-3 px-5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to PayMongo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Proceed to Pay {formattedPrice}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
