import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Banknote,
  CheckCircle,
  X,
  Clock,
  User,
  AlertCircle,
  Sparkles,
  Receipt,
  Check,
} from 'lucide-react';

export default function CashSettlementModal({
  appt,
  onClose,
  onConfirmSettlement,
  isDark = false,
}) {
  const initialDue = Number(appt.service_price || appt.amount_paid || 0);
  const [amountDue, setAmountDue] = useState(initialDue);
  const [cashTendered, setCashTendered] = useState(initialDue > 0 ? initialDue : '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const numDue = Number(amountDue) || 0;
  const numTendered = Number(cashTendered) || 0;
  const change = Math.max(0, numTendered - numDue);
  const isUnderpaid = numTendered < numDue;

  useEffect(() => {
    if (initialDue > 0) {
      setAmountDue(initialDue);
      setCashTendered(initialDue);
    }
  }, [initialDue]);

  const rawDt = appt.datetime || '';
  const fmtFullDate = rawDt
    ? new Date(rawDt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const fmtTime = rawDt
    ? new Date(rawDt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const clientName = appt.client_name || appt.client || 'Client';
  const serviceName = appt.service || 'Spa Treatment';

  const quickPresets = [
    { label: 'Exact', value: numDue },
    { label: '₱500', value: 500 },
    { label: '₱1,000', value: 1000 },
    { label: '₱1,500', value: 1500 },
    { label: '₱2,000', value: 2000 },
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (numDue <= 0) {
      setError('Please provide a valid session amount due.');
      return;
    }
    if (isUnderpaid) {
      setError(`Cash tendered (₱${numTendered.toFixed(2)}) is less than amount due (₱${numDue.toFixed(2)}).`);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onConfirmSettlement(appt.id, {
        amount_paid: numDue,
        cash_tendered: numTendered,
        change: change,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to settle cash payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{
          background: isDark
            ? 'linear-gradient(145deg, #182030 0%, #121824 100%)'
            : 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.8)',
          color: isDark ? '#e2e8f3' : '#1e293b',
        }}
      >
        {/* Modal Header */}
        <div
          className="p-6 pb-5 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-400/20 border border-amber-400/30 text-amber-300 shadow-md">
                <Banknote className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80">
                  Front Desk Checkout
                </span>
                <h3 className="text-white font-black text-lg leading-tight mt-0.5">
                  Settle Cash &amp; Complete Session
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          {/* Appointment Recap Card */}
          <div
            className="rounded-2xl p-4 space-y-2 border"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(6,44,34,0.03)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(6,44,34,0.08)',
            }}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold uppercase tracking-wider opacity-60">
                Session Overview
              </span>
              <span className="font-mono font-bold text-amber-700 bg-amber-100/60 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                Booking #{String(appt.id).padStart(5, '0')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
              <div>
                <p className="font-black text-sm">{clientName}</p>
                <p className="text-xs opacity-75 font-semibold">{serviceName}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-bold">{fmtFullDate}</p>
                <p className="text-xs opacity-70 flex items-center gap-1 sm:justify-end">
                  <Clock className="w-3 h-3 text-emerald-700" />
                  {fmtTime} {appt.service_duration ? `(${appt.service_duration} min)` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Due and Cash Tendered Form */}
          <div className="space-y-4">
            {/* Amount Due Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">
                Total Treatment Fee (₱)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm opacity-50">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-bold outline-none transition focus:ring-2 focus:ring-emerald-600/20"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                  }}
                />
              </div>
            </div>

            {/* Cash Tendered Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                  Cash Received from Client (₱)
                </label>
                <span className="text-[10px] font-bold text-emerald-700">Cash only</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm opacity-50">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-black outline-none transition focus:ring-2 focus:ring-emerald-600/20"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                  }}
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashTendered(preset.value)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition hover:scale-105 active:scale-95 border cursor-pointer"
                    style={{
                      background:
                        numTendered === preset.value
                          ? 'linear-gradient(135deg,#062c22,#0f5040)'
                          : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                      color: numTendered === preset.value ? '#ffffff' : 'inherit',
                      borderColor:
                        numTendered === preset.value
                          ? 'transparent'
                          : isDark
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.08)',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Change Calculation Display */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isUnderpaid
                  ? 'bg-red-50/70 border-red-200 dark:bg-red-950/20 dark:border-red-900/40'
                  : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                    {isUnderpaid ? 'Shortfall Amount' : 'Change Due to Client'}
                  </span>
                  <p
                    className={`text-2xl font-black tabular-nums mt-0.5 ${
                      isUnderpaid ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    ₱{isUnderpaid ? (numDue - numTendered).toFixed(2) : change.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isUnderpaid
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/40'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40'
                  }`}
                >
                  {isUnderpaid ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Receipt className="w-5 h-5" />
                  )}
                </div>
              </div>
              {isUnderpaid && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">
                  ⚠️ Cash received is less than the total bill. Please collect at least ₱{numDue.toFixed(2)}.
                </p>
              )}
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70">
                Payment / Counter Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Paid exact cash, client requested paper receipt..."
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition focus:ring-2 focus:ring-emerald-600/20 resize-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                }}
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-100/70 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          className="p-5 border-t flex items-center gap-3 flex-shrink-0"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 rounded-2xl text-xs font-bold transition hover:bg-black/5 disabled:opacity-50 cursor-pointer"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUnderpaid || numDue <= 0 || submitting}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-2xl text-xs font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20"
            style={{
              background: 'linear-gradient(135deg,#062c22,#0f5040)',
            }}
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Finalizing…
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                Confirm Cash &amp; Finalize
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
