import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Banknote,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Receipt,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────── */
/*  FRONT DESK CASH SETTLEMENT MODAL                                   */
/*  Senior-grade, high-efficiency POS cash checkout for Spa Admin.    */
/*  Single-screen flow with live change calculation & quick cash chips */
/* ─────────────────────────────────────────────────────────────────── */

export default function CashSettlementModal({
  appt,
  onClose,
  onConfirmSettlement,
  isDark = false,
}) {
  const initialDue = Number(appt.service_price || appt.amount_paid || 0);
  const [amountDue, setAmountDue] = useState(initialDue);
  const [cashTendered, setCashTendered] = useState(initialDue > 0 ? String(initialDue) : '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialDue > 0) {
      setAmountDue(initialDue);
      setCashTendered(String(initialDue));
    }
  }, [initialDue]);

  const numDue = Number(amountDue) || 0;
  const numTendered = Number(cashTendered) || 0;
  const change = Math.max(0, numTendered - numDue);
  const isUnderpaid = numTendered > 0 && numTendered < numDue;
  const isExact = numTendered > 0 && numTendered === numDue;
  const canSettle = numDue > 0 && numTendered >= numDue && !submitting;

  const rawDt = appt.datetime || '';
  const fmtFullDate = rawDt
    ? new Date(rawDt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';
  const fmtTime = rawDt
    ? new Date(rawDt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';
  const clientName = appt.client_name || appt.client || 'Client';
  const serviceName = appt.service || 'Spa Treatment';
  const therapist = appt.therapist_name || appt.therapist || 'Assigned Therapist';

  // Dynamic quick-cash presets based on amount due
  const quickPresets = useMemo(() => {
    const presets = [{ label: 'Exact', value: numDue }];
    const billOptions = [500, 1000, 1500, 2000, 3000, 5000];
    for (const b of billOptions) {
      if (b > numDue && !presets.some((p) => p.value === b)) {
        presets.push({ label: `₱${b.toLocaleString()}`, value: b });
      }
      if (presets.length >= 5) break;
    }
    return presets;
  }, [numDue]);

  const handleConfirm = async (e) => {
    e?.preventDefault();
    setError('');

    if (numDue <= 0) {
      setError('Total treatment fee must be greater than ₱0.00.');
      return;
    }
    if (numTendered <= 0) {
      setError('Please enter the cash received amount.');
      return;
    }
    if (numTendered < numDue) {
      setError(`Cash tendered (₱${numTendered.toFixed(2)}) is less than total due (₱${numDue.toFixed(2)}).`);
      return;
    }

    setSubmitting(true);
    try {
      await onConfirmSettlement(appt.id, {
        amount_paid: numDue,
        cash_tendered: numTendered,
        change,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to settle cash payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitting, onClose]);

  const textColor = isDark ? '#e2e8f3' : '#1e293b';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const inputBorder = isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(2, 6, 23, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
      className="sm:items-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{
          width: '100%',
          maxWidth: 520,
          background: isDark
            ? 'linear-gradient(145deg, #161f30, #0f1725)'
            : 'linear-gradient(145deg, #ffffff, #faf8f5)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
          color: textColor,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
        }}
        className="rounded-t-3xl sm:rounded-3xl"
      >
        {/* ── Mobile Grab Indicator ── */}
        <div className="sm:hidden w-12 h-1 bg-slate-400/40 rounded-full mx-auto my-2.5 shrink-0" />

        {/* ── Luxury Header ── */}
        <div
          style={{
            padding: '18px 24px 16px',
            background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 60%, #0f5c47 100%)',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'rgba(191,161,95,0.2)',
                  border: '1.5px solid rgba(191,161,95,0.4)',
                  color: '#fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Banknote size={22} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#e8cc8a',
                  }}
                >
                  Front Desk Checkout
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0', letterSpacing: '-0.01em' }}>
                  Settle Cash Payment
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              title="Close (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── Main POS Form Body ── */}
        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 1. Session Information Card */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 16,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(6,44,34,0.03)',
                border: `1px solid ${cardBorder}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: textMuted }}>
                  Treatment Details
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: '#b45309',
                    background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.08)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    border: '1px solid rgba(217,119,6,0.2)',
                  }}
                >
                  #{String(appt.id).padStart(5, '0')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 15, margin: 0, color: textColor }}>{clientName}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#34d399' : '#059669', margin: '2px 0 0' }}>
                    {serviceName}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={12} style={{ opacity: 0.7 }} /> Specialist: <strong style={{ color: textColor }}>{therapist}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: textColor, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                    <Calendar size={12} style={{ color: isDark ? '#38bdf8' : '#0284c7' }} /> {fmtFullDate}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: textMuted, margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <Clock size={11} style={{ color: '#d97706' }} /> {fmtTime}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Amount Due Banner (Prominent, not duplicate input) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 16,
                background: isDark ? 'rgba(6,44,34,0.35)' : 'rgba(6,44,34,0.05)',
                border: '1.5px solid rgba(6,44,34,0.18)',
              }}
            >
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted, margin: 0 }}>
                  Total Treatment Fee Due
                </p>
                <p style={{ fontSize: 26, fontWeight: 900, color: isDark ? '#34d399' : '#064e3b', margin: '2px 0 0', letterSpacing: '-0.02em' }}>
                  ₱{numDue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.12)',
                  color: isDark ? '#6ee7b7' : '#047857',
                  fontSize: 11,
                  fontWeight: 900,
                  border: '1px solid rgba(5,150,105,0.25)',
                }}
              >
                Cash Checkout
              </div>
            </div>

            {/* 3. Cash Received Input & Quick Chips */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted }}>
                  Cash Received from Client <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Philippine Peso (₱)</span>
              </div>

              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 900,
                    fontSize: 18,
                    color: isDark ? '#34d399' : '#064e3b',
                  }}
                >
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashTendered}
                  onChange={(e) => {
                    setCashTendered(e.target.value);
                    setError('');
                  }}
                  placeholder="0.00"
                  autoFocus
                  style={{
                    width: '100%',
                    height: 48,
                    padding: '0 14px 0 34px',
                    borderRadius: 14,
                    border: `2px solid ${isUnderpaid ? '#ef4444' : error ? '#ef4444' : isExact ? '#10b981' : inputBorder}`,
                    background: inputBg,
                    color: textColor,
                    fontSize: 20,
                    fontWeight: 900,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s',
                  }}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {quickPresets.map((p, i) => {
                  const isSelected = numTendered === p.value;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCashTendered(String(p.value));
                        setError('');
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: isSelected
                          ? 'linear-gradient(135deg, #062c22, #0a3d30)'
                          : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : '#f1f5f9',
                        color: isSelected ? '#ffffff' : textColor,
                        border: isSelected ? '1px solid #062c22' : `1px solid ${cardBorder}`,
                        boxShadow: isSelected ? '0 2px 8px rgba(6,44,34,0.25)' : 'none',
                      }}
                    >
                      {p.label === 'Exact' ? `Exact (₱${numDue.toFixed(2)})` : p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Real-time Calculation Result Card */}
            {numDue > 0 && numTendered > 0 && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 16,
                  border: `1.5px solid ${isUnderpaid ? '#f87171' : isExact ? '#34d399' : '#38bdf8'}`,
                  background: isUnderpaid
                    ? isDark
                      ? 'rgba(239,68,68,0.12)'
                      : '#fef2f2'
                    : isExact
                    ? isDark
                      ? 'rgba(16,185,129,0.12)'
                      : '#f0fdf4'
                    : isDark
                    ? 'rgba(2,132,199,0.12)'
                    : '#f0f9ff',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: isUnderpaid ? '#dc2626' : isExact ? '#059669' : '#0284c7',
                      }}
                    >
                      {isUnderpaid
                        ? 'Payment Shortfall (Underpaid)'
                        : isExact
                        ? 'Exact Payment — No Change Due'
                        : 'Change to Return to Client'}
                    </span>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        margin: '2px 0 0',
                        color: isUnderpaid ? '#dc2626' : isExact ? '#059669' : '#0284c7',
                      }}
                    >
                      ₱
                      {isUnderpaid
                        ? (numDue - numTendered).toLocaleString('en-PH', { minimumFractionDigits: 2 })
                        : change.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isUnderpaid
                        ? 'rgba(239,68,68,0.15)'
                        : isExact
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(2,132,199,0.15)',
                      color: isUnderpaid ? '#dc2626' : isExact ? '#059669' : '#0284c7',
                    }}
                  >
                    {isUnderpaid ? <AlertCircle size={20} /> : isExact ? <CheckCircle size={20} /> : <Receipt size={20} />}
                  </div>
                </div>

                {isUnderpaid && (
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', margin: '8px 0 0' }}>
                    ⚠️ Collect at least ₱{numDue.toFixed(2)} from client before finalizing this session.
                  </p>
                )}
              </div>
            )}

            {/* 5. Optional Notes */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted, marginBottom: 5 }}>
                Front Desk Notes <span style={{ fontWeight: 500, textTransform: 'none', opacity: 0.6 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Client paid exact cash, requested paper receipt..."
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: textColor,
                  fontSize: 12,
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* ── Footer Actions (Clean, high-visibility 44px buttons) ── */}
          <div
            style={{
              padding: '14px 24px',
              borderTop: `1px solid ${cardBorder}`,
              background: isDark ? 'rgba(0,0,0,0.25)' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                height: 44,
                padding: '0 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                background: 'transparent',
                color: textMuted,
                border: `1px solid ${inputBorder}`,
                transition: 'all 0.15s',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSettle}
              style={{
                height: 44,
                padding: '0 24px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 900,
                cursor: canSettle ? 'pointer' : 'not-allowed',
                background: canSettle
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : isDark
                  ? '#1e293b'
                  : '#e2e8f0',
                color: canSettle ? '#ffffff' : isDark ? '#64748b' : '#94a3b8',
                border: 'none',
                boxShadow: canSettle ? '0 4px 14px rgba(5,150,105,0.35)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                letterSpacing: '0.01em',
                transition: 'all 0.18s',
              }}
            >
              {submitting ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#ffffff',
                      animation: 'spin 0.65s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Confirm Payment (₱{numDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
