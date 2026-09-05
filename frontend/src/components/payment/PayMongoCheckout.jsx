import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, ShieldCheck, Lock, Sparkles, AlertCircle,
  ExternalLink, ArrowRight, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { createCheckoutSession } from '../../api/payment';

// ── Payment method icons & badges ──────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'gcash', name: 'GCash', desc: 'Instant mobile e-wallet', color: '#007dfc', bg: 'rgba(0,125,252,0.1)' },
  { id: 'paymaya', name: 'Maya', desc: 'Maya account & wallet', color: '#00b04f', bg: 'rgba(0,176,79,0.1)' },
  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, JCB', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { id: 'qrph', name: 'QR Ph', desc: 'Scan to pay with any banking app', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
];

/**
 * PayMongo Checkout Component for Cozy Blissful Spa & Salon.
 *
 * @param {Object} props
 * @param {Object} props.bookingData - { appointment_id, service_id, service_name, price, duration, datetime, client_name, client_email, client_phone, notes }
 * @param {Function} [props.onCancel] - Optional cancel callback
 * @param {Function} [props.onError] - Optional error callback
 */
const PayMongoCheckout = ({ bookingData, onCancel, onError }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const serviceName = bookingData?.service_name || bookingData?.service || 'Luxury Spa Treatment';
  const price = Number(bookingData?.price || bookingData?.service_price || 750);
  const formattedPrice = `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const handleProceedToPay = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        appointment_id: bookingData?.appointment_id || bookingData?.id,
        service_id: bookingData?.service_id,
        datetime: bookingData?.datetime,
        notes: bookingData?.notes,
        client_name: bookingData?.client_name,
        client_email: bookingData?.client_email,
        client_phone: bookingData?.client_phone,
      };

      const res = await createCheckoutSession(payload);

      if (res?.checkout_url) {
        // Redirect directly to PayMongo's secure hosted checkout page
        window.location.href = res.checkout_url;
      } else {
        throw new Error('No checkout URL received from payment server.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment initialization failed. Please try again.';
      setErrorMsg(msg);
      if (onError) onError(msg);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl border border-emerald-950/10"
      style={{ background: '#ffffff', fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Luxury Header Banner ─────────────────────────────────── */}
      <div
        className="p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 50%, #0f5c47 100%)' }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <CreditCard className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-300">
                Secure Checkout
              </span>
              <h2 className="text-lg font-black tracking-tight leading-tight">
                Cozy Blissful Spa
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-white/70">Total Due</span>
            <p className="text-xl font-black text-amber-300 tracking-tight">{formattedPrice}</p>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div
          className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: '#bfa15f' }}
        />
      </div>

      <div className="p-6 space-y-5">
        {/* ── Treatment Summary Box ──────────────────────────────── */}
        <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Selected Service</span>
            {bookingData?.duration && (
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                {bookingData.duration} mins session
              </span>
            )}
          </div>
          <p className="font-black text-slate-900 text-base">{serviceName}</p>

          {bookingData?.datetime && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Appointment Schedule:</span>
              <span className="font-bold text-slate-800">
                {new Date(bookingData.datetime).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          )}
        </div>

        {/* ── Supported Payment Methods ──────────────────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider text-[10px]">
              Supported Payment Channels
            </label>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> PayMongo Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl border border-slate-200 flex items-center gap-2.5 bg-white transition hover:border-slate-300"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs"
                  style={{ background: m.bg, color: m.color }}
                >
                  {m.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 leading-tight truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security Badge Notice ──────────────────────────────── */}
        <div className="rounded-2xl p-3.5 bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900 leading-relaxed">
          <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            You will be redirected to PayMongo's PCI-DSS Level 1 certified checkout environment. No card numbers or e-wallet PINs are stored on our servers.
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="rounded-2xl p-3 bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────────────────── */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={handleProceedToPay}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 50%, #0f5c47 100%)',
              boxShadow: '0 8px 24px rgba(6,44,34,0.3)',
            }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Redirecting to PayMongo…</span>
              </>
            ) : (
              <>
                <span>Proceed to Pay</span>
                <span className="font-extrabold text-amber-300">({formattedPrice})</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel and Return
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PayMongoCheckout;
