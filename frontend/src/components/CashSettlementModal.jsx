import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Smartphone,
  User,
  Wallet,
  X,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────── */
/*  SETTLEMENT CONFIRMATION MODAL (Admin / Staff sign-off)              */
/*  Pure confirmation: client already chose the payment channel at      */
/*  booking (Walk-in Cash / GCash / Maya / QR Ph). Admin only verifies  */
/*  the completed service, reviews the read-only payment channel,      */
/*  ticks the checklist, and confirms to finalize into History.        */
/*  Fully responsive: centered dialog on sm+ / bottom-sheet on mobile. */
/* ─────────────────────────────────────────────────────────────────── */

const normalizeMethod = (raw) => {
  const m = String(raw || '').toLowerCase().trim();
  if (['cash', 'counter', 'walkin', 'walk-in', 'cod'].includes(m)) return 'cash';
  if (['gcash', 'g-cash'].includes(m)) return 'gcash';
  if (['maya', 'paymaya'].includes(m)) return 'maya';
  if (['qrph', 'qr_ph', 'qr', 'qrcode'].includes(m)) return 'qrph';
  if (['online', 'card', 'paymongo'].includes(m)) return 'online';
  return 'cash';
};

const methodMeta = (value) => {
  switch (normalizeMethod(value)) {
    case 'gcash': return { label: 'GCash', Icon: Smartphone };
    case 'maya': return { label: 'Maya', Icon: Wallet };
    case 'qrph': return { label: 'QR Ph', Icon: QrCode };
    case 'online': return { label: 'Online Payment', Icon: BadgeCheck };
    default: return { label: 'Walk-in Cash', Icon: Banknote };
  }
};

const SETTLEABLE = ['Confirmed', 'In Progress', 'Completed by Therapist'];

export default function CashSettlementModal({
  appt,
  onClose,
  onConfirmSettlement,
  isDark = false,
}) {
  const fee = useMemo(() => {
    const v = Number(appt?.service_price ?? appt?.amount_paid ?? 0);
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [appt]);

  // Read-only: channel the client chose at booking time. Never editable here.
  const displayMethod = useMemo(
    () => normalizeMethod(appt?.payment_method),
    [appt],
  );
  const { label: methodLabelText, Icon: MethodIcon } = methodMeta(displayMethod);

  const [acknowledged, setAcknowledged] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAcknowledged(false);
    setNotes('');
    setError('');
  }, [appt?.id]);

  // Lock body scroll while open + Escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [submitting, onClose]);

  const rawDt = appt?.datetime || '';
  const parsedDt = rawDt ? new Date(rawDt) : null;
  const validDt = parsedDt && !Number.isNaN(parsedDt.getTime()) ? parsedDt : null;
  const fmtFullDate = validDt
    ? validDt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const fmtTime = validDt
    ? validDt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '';

  const clientName = appt?.client_name || appt?.client || 'Client';
  const clientEmail = appt?.client_email || '';
  const serviceName = appt?.service || 'Spa Treatment';
  const therapist = appt?.therapist_name || appt?.therapist || 'Assigned Therapist';
  const duration = appt?.service_duration ? `${appt.service_duration} min` : '';
  const bookingNo = `#${String(appt?.id ?? 0).padStart(5, '0')}`;
  const paymentStatus = String(appt?.payment_status || 'unpaid').toLowerCase();
  const alreadyPaid = paymentStatus === 'paid';
  const amountPaid = Number(appt?.amount_paid || 0);
  const statusOk = SETTLEABLE.includes(appt?.status);
  const feeOk = fee > 0;

  const canConfirm = statusOk && feeOk && acknowledged && !submitting;

  const handleConfirm = async (e) => {
    e?.preventDefault();
    setError('');

    if (!appt?.id) {
      setError('Missing booking reference. Please reopen the booking and try again.');
      return;
    }
    if (!statusOk) {
      setError(`Only active sessions can be confirmed (${SETTLEABLE.join(', ')}). Current status: ${appt?.status || 'unknown'}.`);
      return;
    }
    if (!feeOk) {
      setError('Service fee is missing or invalid. Please check the service catalog before confirming.');
      return;
    }
    if (!acknowledged) {
      setError('Please tick the confirmation checklist to finalize this session.');
      return;
    }
    if (notes.trim().length > 500) {
      setError('Admin note must be 500 characters or fewer.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirmSettlement(appt.id, {
        amount_paid: fee,
        payment_method: displayMethod,
        notes: notes.trim() || undefined,
      });
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to confirm. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const t = {
    text: isDark ? '#e2e8f3' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    heading: isDark ? '#ffffff' : '#0f172a',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(6,44,34,0.03)',
    border: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(2,6,23,0.10)',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    inputBorder: isDark ? 'rgba(255,255,255,0.16)' : '#cbd5e1',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose?.()}
      className="cb-settle-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cb-settle-title"
    >
      <style>{`
        .cb-settle-overlay {
          position: fixed; inset: 0; z-index: 60;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          background: rgba(2, 6, 23, 0.72);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .cb-settle-sheet {
          width: 100%; max-width: 560px;
          max-height: min(92dvh, 860px);
          display: flex; flex-direction: column;
          overflow: hidden;
          border-radius: 24px;
          box-shadow: 0 25px 60px -15px rgba(0,0,0,0.55);
        }
        .cb-settle-body {
          flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          padding: 18px 20px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .cb-settle-footer {
          flex-shrink: 0;
          display: flex; gap: 10px; align-items: stretch; justify-content: flex-end;
          padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid ${t.border};
          background: ${isDark ? 'rgba(0,0,0,0.30)' : '#f8fafc'};
        }
        .cb-settle-footer > button { min-height: 46px; }
        .cb-settle-summary-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        @media (max-width: 560px) {
          .cb-settle-overlay { padding: 0; align-items: flex-end; }
          .cb-settle-sheet {
            max-width: 100%; border-radius: 24px 24px 0 0;
            max-height: 96dvh;
          }
          .cb-settle-body { padding: 16px 16px 20px; }
          .cb-settle-footer { padding-left: 16px; padding-right: 16px; }
        }
        @media (max-width: 420px) {
          .cb-settle-summary-grid { grid-template-columns: 1fr; }
          .cb-settle-footer { flex-direction: column; }
          .cb-settle-footer > button { width: 100% !important; flex: unset !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cb-settle-sheet { transition: none !important; }
        }
        @keyframes cb-spin { to { transform: rotate(360deg); } }
      `}</style>

      <motion.div
        initial={{ scale: 0.96, y: 28, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 28, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="cb-settle-sheet"
        style={{
          background: isDark ? 'linear-gradient(145deg, #161f30, #0f1725)' : 'linear-gradient(145deg, #ffffff, #faf8f5)',
          border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid #e2e8f0',
          color: t.text,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 48, height: 4, borderRadius: 999,
            background: 'rgba(148,163,184,0.45)',
            margin: '10px auto 0',
          }}
          className="cb-settle-grab-bar"
        />
        <style>{`@media (min-width: 561px) { .cb-settle-grab-bar { display: none; } }`}</style>

        {/* ── Header ── */}
        <div
          style={{
            padding: '16px 20px 14px',
            background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 60%, #0f5c47 100%)',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: 'rgba(191,161,95,0.20)',
                  border: '1.5px solid rgba(191,161,95,0.40)',
                  color: '#fde68a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <BadgeCheck size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#e8cc8a' }}>
                  Admin Sign-off · Front Desk
                </span>
                <h3 id="cb-settle-title" style={{ fontSize: 'clamp(16px, 2.5vw + 12px, 19px)', fontWeight: 900, color: '#ffffff', margin: '2px 0 0', letterSpacing: '-0.01em' }}>
                  Confirm Session Completion
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close dialog"
              title="Close (Esc)"
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0,
                background: 'rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.85)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={17} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 900, fontFamily: 'monospace', color: '#fde68a', background: 'rgba(191,161,95,0.16)', padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(191,161,95,0.35)' }}>
              {bookingNo}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#a7f3d0', background: 'rgba(255,255,255,0.10)', padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)' }}>
              {appt?.status || '—'}
            </span>
            <span
              style={{
                fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 8,
                background: alreadyPaid ? 'rgba(52,211,153,0.18)' : 'rgba(251,191,36,0.18)',
                color: alreadyPaid ? '#a7f3d0' : '#fde68a',
                border: `1px solid ${alreadyPaid ? 'rgba(52,211,153,0.40)' : 'rgba(251,191,36,0.40)'}`,
              }}
            >
              {alreadyPaid
                ? `Paid${amountPaid > 0 ? ` · ₱${amountPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : ''}`
                : 'Unpaid · confirm at sign-off'}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="cb-settle-body">
            {!statusOk && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)', color: '#ef4444', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>This booking (status: {appt?.status || 'unknown'}) can no longer be confirmed here. Only {SETTLEABLE.join(', ')} sessions can be signed off.</span>
              </div>
            )}

            {/* 1. Full service summary */}
            <section aria-label="Service summary" style={{ padding: '14px 16px', borderRadius: 16, background: t.cardBg, border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.muted, margin: 0 }}>
                Client · Service · Session
              </p>
              <p style={{ fontWeight: 900, fontSize: 'clamp(15px, 1vw + 13px, 17px)', margin: '6px 0 0', color: t.heading, overflowWrap: 'anywhere' }}>{clientName}</p>
              {clientEmail ? (
                <p style={{ fontSize: 12, fontWeight: 600, color: t.muted, margin: '2px 0 0', overflowWrap: 'anywhere' }}>{clientEmail}</p>
              ) : null}
              <p style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#34d399' : '#059669', margin: '4px 0 0' }}>{serviceName}</p>

              <div className="cb-settle-summary-grid" style={{ marginTop: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: t.muted, margin: 0, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <User size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Specialist: <strong style={{ color: t.text }}>{therapist}</strong></span>
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: t.muted, margin: 0, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <Calendar size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{fmtFullDate}{duration ? ` · ${duration}` : ''}</span>
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: t.muted, margin: 0, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <Clock size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{fmtTime || 'Time to be confirmed'}</span>
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: t.muted, margin: 0, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Payment: <strong style={{ color: t.text }}>{methodLabelText}</strong></span>
                </p>
              </div>
              {appt?.notes ? (
                <p style={{ fontSize: 11.5, fontWeight: 500, fontStyle: 'italic', color: t.muted, margin: '10px 0 0', padding: '8px 12px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc', border: `1px solid ${t.border}`, lineHeight: 1.6, overflowWrap: 'anywhere' }}>
                  “{String(appt.notes).slice(0, 280)}{String(appt.notes).length > 280 ? '…' : ''}”
                </p>
              ) : null}
            </section>

            {/* 2. Amount + read-only payment channel (no selection, no cash input) */}
            <section
              aria-label="Amount and payment channel"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
                padding: '14px 18px', borderRadius: 16,
                background: isDark ? 'rgba(6,44,34,0.35)' : 'rgba(6,44,34,0.05)',
                border: '1.5px solid rgba(6,44,34,0.18)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: t.muted, margin: 0 }}>
                  Total treatment fee
                </p>
                <p style={{ fontSize: 'clamp(22px, 4vw + 14px, 28px)', fontWeight: 900, color: isDark ? '#34d399' : '#064e3b', margin: '2px 0 0', letterSpacing: '-0.02em' }}>
                  ₱{fee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: t.text, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MethodIcon size={15} style={{ color: isDark ? '#34d399' : '#047857', flexShrink: 0 }} />
                  <span>{methodLabelText}{alreadyPaid ? ' · Paid' : ''}</span>
                </p>
              </div>
              <div
                style={{
                  padding: '6px 12px', borderRadius: 10, flexShrink: 0,
                  background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.12)',
                  color: isDark ? '#6ee7b7' : '#047857',
                  fontSize: 11, fontWeight: 900,
                  border: '1px solid rgba(5,150,105,0.25)',
                }}
              >
                {displayMethod === 'cash'
                  ? 'Walk-in · Counter'
                  : alreadyPaid ? 'Paid Online' : 'Client-Paid'}
              </div>
            </section>

            {/* 3. Confirmation checklist (required) */}
            <label
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                background: acknowledged ? (isDark ? 'rgba(16,185,129,0.10)' : '#f0fdf4') : t.cardBg,
                border: `1.5px solid ${acknowledged ? '#10b981' : t.border}`,
                transition: 'all 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => { setAcknowledged(e.target.checked); setError(''); }}
                aria-label="Confirmation checklist"
                style={{ width: 20, height: 20, marginTop: 1, accentColor: '#059669', flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: t.text, lineHeight: 1.6 }}>
                I confirm the <strong>{serviceName}</strong> for <strong>{clientName}</strong> was fully rendered
                by <strong>{therapist}</strong>, and payment of{' '}
                <strong>₱{fee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> via{' '}
                <strong>{methodLabelText}</strong> is confirmed. <span style={{ color: '#ef4444' }}>*</span>
              </span>
            </label>

            {/* 4. Optional admin note */}
            <div>
              <label htmlFor="cb-settle-notes" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: t.muted, marginBottom: 6 }}>
                <span>Sign-off note <span style={{ fontWeight: 500, textTransform: 'none', opacity: 0.65 }}>(optional)</span></span>
                <span style={{ fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>{notes.trim().length}/500</span>
              </label>
              <textarea
                id="cb-settle-notes"
                value={notes}
                rows={2}
                maxLength={500}
                onChange={(e) => { setNotes(e.target.value); setError(''); }}
                placeholder="e.g. Verified with therapist · receipt issued…"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 12,
                  border: `1px solid ${t.inputBorder}`,
                  background: t.inputBg, color: t.text,
                  fontSize: 13, fontWeight: 500, outline: 'none',
                  boxSizing: 'border-box', resize: 'vertical', minHeight: 56, lineHeight: 1.5,
                }}
              />
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.30)',
                  color: '#ef4444', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ overflowWrap: 'anywhere' }}>{error}</span>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="cb-settle-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: '0 0 auto',
                padding: '0 20px', borderRadius: 12,
                fontSize: 13, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                background: 'transparent', color: t.muted,
                border: `1px solid ${t.inputBorder}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canConfirm}
              title={
                !statusOk ? 'Session is not confirmable'
                : !feeOk ? 'Invalid service fee'
                : !acknowledged ? 'Tick the confirmation checklist first'
                : `Confirm completion · ₱${fee.toFixed(2)}`
              }
              style={{
                flex: 1,
                padding: '0 20px', borderRadius: 12,
                fontSize: 'clamp(12px, 1vw + 10px, 13.5px)', fontWeight: 900,
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                background: canConfirm ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : (isDark ? '#1e293b' : '#e2e8f0'),
                color: canConfirm ? '#ffffff' : (isDark ? '#64748b' : '#94a3b8'),
                border: 'none',
                boxShadow: canConfirm ? '0 4px 14px rgba(5,150,105,0.35)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.18s',
              }}
            >
              {submitting ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', animation: 'cb-spin 0.65s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                  <span>Confirming…</span>
                </>
              ) : (
                <>
                  <BadgeCheck size={17} style={{ flexShrink: 0 }} />
                  <span style={{ overflowWrap: 'anywhere' }}>
                    Confirm Completion · ₱{fee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
