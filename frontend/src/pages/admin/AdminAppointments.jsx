import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import API from '../../api/axios';
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  XCircle, Check, X, ChevronLeft, ChevronRight, UserCheck,
  Zap, Mail, CalendarDays,
  Search, RotateCcw, CheckCircle2, CalendarCheck, Banknote,
  Shield,
} from 'lucide-react';
import { MiniCalendar } from '../../components/ui/mini-calendar';
import { DatePickerInput } from '../../components/ui/date-picker';
import { format } from 'date-fns';
import CashSettlementModal from '../../components/CashSettlementModal';



/* ─────────────────────────────────────────────────────────────────── */
/*  HELPERS & STYLING MAPS                                              */
/* ─────────────────────────────────────────────────────────────────── */

const getStatusStyle = (status, isDark = false) => {
  switch (status) {
    case 'In Progress':
      return { bg: isDark ? 'rgba(14,165,233,0.22)' : 'rgba(14,165,233,0.12)', color: isDark ? '#38bdf8' : '#0284c7', border: isDark ? 'rgba(56,189,248,0.45)' : 'rgba(2,132,199,0.35)', dot: isDark ? '#38bdf8' : '#0284c7' };
    case 'Confirmed':
      return { bg: isDark ? 'rgba(22,163,74,0.22)' : 'rgba(22,163,74,0.12)', color: isDark ? '#4ade80' : '#15803d', border: isDark ? 'rgba(74,222,128,0.4)' : 'rgba(21,128,61,0.3)', dot: isDark ? '#4ade80' : '#16a34a' };
    case 'Pending':
      return { bg: isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.14)', color: isDark ? '#fbbf24' : '#b45309', border: isDark ? 'rgba(251,191,36,0.45)' : 'rgba(180,83,9,0.35)', dot: isDark ? '#fbbf24' : '#d97706' };
    case 'Cancelled':
      return { bg: isDark ? 'rgba(239,68,68,0.22)' : 'rgba(239,68,68,0.12)', color: isDark ? '#f87171' : '#b91c1c', border: isDark ? 'rgba(248,113,113,0.4)' : 'rgba(185,28,28,0.3)', dot: isDark ? '#f87171' : '#dc2626' };
    case 'Completed by Therapist':
      return { bg: isDark ? 'rgba(217,119,6,0.22)' : 'rgba(217,119,6,0.12)', color: isDark ? '#fbbf24' : '#b45309', border: isDark ? 'rgba(251,191,36,0.45)' : 'rgba(217,119,6,0.35)', dot: isDark ? '#fbbf24' : '#d97706' };
    case 'Completed':
      return { bg: isDark ? 'rgba(99,102,241,0.22)' : 'rgba(99,102,241,0.12)', color: isDark ? '#a5b4fc' : '#4338ca', border: isDark ? 'rgba(165,180,252,0.4)' : 'rgba(67,56,202,0.3)', dot: isDark ? '#a5b4fc' : '#4f46e5' };
    default:
      return { bg: isDark ? 'rgba(148,163,184,0.22)' : 'rgba(100,116,139,0.12)', color: isDark ? '#cbd5e1' : '#334155', border: isDark ? 'rgba(203,213,225,0.4)' : 'rgba(51,65,85,0.3)', dot: isDark ? '#cbd5e1' : '#64748b' };
  }
};

const fmt12 = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  return isNaN(d.getTime()) ? dt : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  return isNaN(d.getTime()) ? dt : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ─────────────────────────────────────────────────────────────────── */
/*  BOOKING GROUPS — one client visit may contain multiple treatments   */
/*  Backend stores one row per service, so we group rows that share the  */
/*  same client + same schedule + same status into a single visit card.  */
/*  This is the core fix for "client chose 2 services = 2 separate cards" */
/* ─────────────────────────────────────────────────────────────────── */

const normalizeGroupDateTime = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return String(dt).slice(0, 16);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const getGroupClientKey = (a) => String(
  a.client_id ?? a.client_email ?? a.client_name ?? a.client ?? ''
).trim().toLowerCase();

const stripBillingBlock = (notes) => {
  if (!notes) return '';
  return String(notes)
    .replace(/\[Billing & Contact Info\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const groupAppointments = (list = []) => {
  const map = new Map();
  for (const a of list) {
    const key = `${getGroupClientKey(a)}|${normalizeGroupDateTime(a.datetime)}|${a.status || ''}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        ids: [],
        items: [],
        client_name: a.client_name || a.client,
        client_email: a.client_email || '',
        datetime: a.datetime,
        status: a.status,
        therapist_name: a.therapist_name || 'Unassigned',
        therapist_id: a.therapist_id || null,
        payment_method: a.payment_method || 'cash',
        payment_status: a.payment_status || 'unpaid',
        notes: a.notes || '',
        totalPrice: 0,
        totalDuration: 0,
      });
    }
    const g = map.get(key);
    g.ids.push(a.id);
    g.items.push(a);
    g.totalPrice += Number(a.service_price || 0);
    g.totalDuration += Number(a.service_duration || 0);
    // Keep the richest contact info / earliest notes (rows share the same block)
    if (!g.client_email && a.client_email) g.client_email = a.client_email;
    if ((!g.notes || g.notes.length < (a.notes || '').length) && a.notes) g.notes = a.notes;
    if (g.therapist_name === 'Unassigned' && a.therapist_name && a.therapist_name !== 'Unassigned') {
      g.therapist_name = a.therapist_name;
      g.therapist_id = a.therapist_id;
    }
  }
  return [...map.values()].sort((x, y) => new Date(x.datetime) - new Date(y.datetime));
};

const groupRefLabel = (g) => {
  const first = Math.min(...g.ids.map(Number).filter(Number.isFinite));
  if (!Number.isFinite(first)) return `#${String(g.ids[0]).padStart(4, '0')}`;
  if (g.ids.length === 1) return `#${String(first).padStart(4, '0')}`;
  return `#${String(first).padStart(4, '0')} · ${g.ids.length} treatments`;
};

/* ─────────────────────────────────────────────────────────────────── */
/*  REUSABLE HOVER BUTTON                                              */
/* ─────────────────────────────────────────────────────────────────── */

const HoverButton = ({ onClick, children, baseStyle, hoverStyle, title, disabled = false, id, type = 'button' }) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      id={id}
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onFocus={() => !disabled && setHovered(true)}
      onBlur={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        ...baseStyle,
        ...(hovered && !disabled ? hoverStyle : {}),
        transform: pressed && !disabled ? 'scale(0.98)' : (hovered && !disabled && hoverStyle?.transform ? hoverStyle.transform : 'none'),
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        touchAction: 'manipulation',
      }}
    >
      {children}
    </button>
  );
};



/* ─────────────────────────────────────────────────────────────────── */
/*  SHARED DIALOG BEHAVIOR — ESC to close, body scroll-lock, safe-area   */
/*  Every booking popup uses this so keyboard, mobile, and screen-reader */
/*  behavior stays identical across Detail / Assign / Decline / Move.    */
/* ─────────────────────────────────────────────────────────────────── */

const useDialogBehavior = (onClose, disabled = false) => {
  useEffect(() => {
    if (disabled) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, disabled]);
};

/* Salon hours (24h) — single source shared by reschedule validation. */
const SALON_OPEN_HOUR = 9;
const SALON_CLOSE_HOUR = 21;

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
};

const DetailModal = ({ appt, group, onClose, onOpenAccept, onOpenReject, onOpenReschedule, onComplete }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  useDialogBehavior(onClose);
  // Accept either a single appointment or a grouped visit. Group wins when present.
  const view = group || (appt ? {
    ids: [appt.id], items: [appt], client_name: appt.client_name || appt.client,
    client_email: appt.client_email, datetime: appt.datetime, status: appt.status,
    therapist_name: appt.therapist_name, therapist_id: appt.therapist_id,
    payment_method: appt.payment_method, notes: appt.notes,
    totalPrice: Number(appt.service_price || 0), totalDuration: Number(appt.service_duration || 0),
  } : null);
  if (!view) return null;
  const primary = view.items[0] || {};
  const ss = getStatusStyle(view.status, isDark);
  // Single source for the visit reference — groupRefLabel already yields
  // "#0008 · 3 treatments" (or "#0001" for singles), so the header adds
  // "· 1 visit" exactly once. Never duplicate the visit count.
  const refLabel = groupRefLabel(view);

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    modalBg: isDark ? '#141927' : '#ffffff',
    cardBg: isDark ? '#0f1420' : '#f8fafc',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    noteBg: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,252,232,1)',
    noteBorder: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(253,230,138,1)',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Booking details ${refLabel}`}
      className="cb-modal-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto', overscrollBehavior: 'contain', background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div
        className="cb-modal-inner"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', width: '100%', padding: 'clamp(12px, 2.5vh, 24px) clamp(10px, 2.5vw, 20px)', boxSizing: 'border-box' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
      <motion.div
        className="cb-modal-sheet"
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ background: C.modalBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, boxShadow: '0 25px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)', width: '100%', maxWidth: 560, maxHeight: 'min(90vh, calc(100dvh - 32px))', margin: 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }}
      >
        {/* Header — one visit, not one row */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#062c22,#0a3d30)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a7f3d0' }}>
                Booking Details · {refLabel} · 1 visit
              </span>
              <h3 style={{ fontSize: 19, fontWeight: 900, color: '#ffffff', margin: '4px 0 0', lineHeight: 1.3 }}>
                {view.items.length > 1 ? `${primary.service || 'Treatment'} + ${view.items.length - 1} more` : (primary.service || 'Booking')}
              </h3>
            </div>
            <HoverButton
              onClick={onClose}
              baseStyle={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              hoverStyle={{ background: 'rgba(255,255,255,0.22)' }}
              title="Close"
            >
              <X size={16} />
            </HoverButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d1fae5', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> {fmtDate(view.datetime)} at {fmt12(view.datetime)}
            </span>
            {view.totalDuration > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a7f3d0', background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {view.totalDuration} min total
              </span>
            )}
            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
              {view.status}
            </span>
          </div>
        </div>

        {/* Body — flex:1 + minHeight:0 so long visits scroll instead of
            sliding the practitioner card behind the sticky footer */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          <div style={{ padding: 16, borderRadius: 16, background: C.cardBg, border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Client</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{view.client_name}</p>
            {view.client_email && (
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0' }}>
                <Mail size={14} style={{ color: '#059669' }} /> {view.client_email}
              </p>
            )}
          </div>

          <div style={{ padding: 16, borderRadius: 16, background: C.cardBg, border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>
              Treatments in this visit ({view.items.length})
            </p>
            {view.items.map((it) => (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{it.service}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, margin: '2px 0 0' }}>
                    {it.service_duration ? `${it.service_duration} min` : ''}{it.service_duration && it.service_price ? ' · ' : ''}{it.service_price ? `₱${Number(it.service_price).toLocaleString()}` : ''}
                  </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, fontFamily: 'monospace', flexShrink: 0 }}>#{String(it.id).padStart(4, '0')}</span>
              </div>
            ))}
            {view.totalPrice > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${C.cardBorder}` }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.textSecondary }}>Visit total</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#059669' }}>₱{view.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <div style={{ padding: 16, borderRadius: 16, background: C.cardBg, border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Assigned Practitioner</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: view.therapist_name && view.therapist_name !== 'Unassigned' ? C.textPrimary : C.textMuted, margin: 0 }}>
              {view.therapist_name || 'Unassigned'}
            </p>
          </div>

          {stripBillingBlock(view.notes) && (
            <div style={{ padding: 14, borderRadius: 16, background: C.noteBg, border: `1px solid ${C.noteBorder}` }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706', margin: 0 }}>Special Notes</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '4px 0 0', lineHeight: 1.6 }}>{stripBillingBlock(view.notes)}</p>
            </div>
          )}

          {view.status === 'Completed by Therapist' && (
            <div style={{ padding: 14, borderRadius: 16, background: isDark ? 'rgba(217,119,6,0.15)' : '#fefce8', border: '1.5px solid rgba(217,119,6,0.35)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: isDark ? '#fbbf24' : '#92400e', margin: 0 }}>Therapist Concluded Treatment Session</p>
              <p style={{ fontSize: 11, color: isDark ? '#fef3c7' : '#78350f', margin: 0, lineHeight: 1.6 }}>
                Specialist <strong>{view.therapist_name || 'Assigned Therapist'}</strong> marked this visit as complete. Verify the service and payment below to confirm and archive this booking into History.
              </p>
            </div>
          )}

          {view.status === 'In Progress' && (
            <div style={{ padding: 14, borderRadius: 16, background: isDark ? 'rgba(14,165,233,0.12)' : '#f0f9ff', border: '1.5px solid rgba(14,165,233,0.3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: isDark ? '#38bdf8' : '#0369a1', margin: 0 }}>Session Ongoing with Therapist</p>
              <p style={{ fontSize: 11, color: isDark ? '#e0f2fe' : '#0c4a6e', margin: 0, lineHeight: 1.6 }}>
                Specialist <strong>{view.therapist_name || 'Assigned Therapist'}</strong> is currently with the client. Only the therapist can mark this session as done from their panel — it will then move to Therapist Done for your verification.
              </p>
            </div>
          )}
        </div>

        {/* Footer — one action set per visit, never per treatment */}
        <div className="cb-modal-footer-actions" style={{ padding: '14px 20px', borderTop: `1px solid ${C.cardBorder}`, background: C.cardBg, flexShrink: 0 }}>
          <HoverButton
            onClick={onClose}
            baseStyle={{ padding: '10px 18px', borderRadius: 14, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900 }}
            hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
          >
            Close
          </HoverButton>

          {/* PENDING: Decline + Assign */}
          {view.status === 'Pending' && (
            <>
              {onOpenReject && (
                <HoverButton
                  onClick={() => { onClose(); onOpenReject(group || primary); }}
                  baseStyle={{ padding: '10px 16px', borderRadius: 14, fontSize: 12, fontWeight: 900, color: '#dc2626', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                  hoverStyle={{ background: 'rgba(239,68,68,0.18)', borderColor: 'rgba(239,68,68,0.45)' }}
                >
                  Decline
                </HoverButton>
              )}
              {onOpenAccept && (
                <HoverButton
                  onClick={() => { onClose(); onOpenAccept(group || primary); }}
                  baseStyle={{ flex: 1, padding: '10px 18px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#ffffff', fontSize: 12, fontWeight: 900, boxShadow: '0 4px 14px rgba(6,44,34,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  hoverStyle={{ boxShadow: '0 6px 20px rgba(6,44,34,0.45)' }}
                >
                  <UserCheck size={16} style={{ color: '#6ee7b7' }} /> Assign Specialist & Confirm
                </HoverButton>
              )}
            </>
          )}

          {/* CONFIRMED: Reassign + Reschedule */}
          {view.status === 'Confirmed' && (
            <>
              {onOpenAccept && (
                <HoverButton
                  onClick={() => { onClose(); onOpenAccept(group || primary); }}
                  baseStyle={{ padding: '10px 14px', borderRadius: 14, fontSize: 12, fontWeight: 900, color: '#059669', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', gap: 5 }}
                  hoverStyle={{ background: 'rgba(5,150,105,0.2)', borderColor: 'rgba(5,150,105,0.45)' }}
                >
                  <UserCheck size={14} /> Reassign
                </HoverButton>
              )}
              {onOpenReschedule && (
                <HoverButton
                  onClick={() => { onClose(); onOpenReschedule(group || primary); }}
                  baseStyle={{ padding: '10px 14px', borderRadius: 14, fontSize: 12, fontWeight: 900, color: '#2563eb', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', gap: 5 }}
                  hoverStyle={{ background: 'rgba(37,99,235,0.2)', borderColor: 'rgba(37,99,235,0.45)' }}
                >
                  <RotateCcw size={14} /> Reschedule
                </HoverButton>
              )}
            </>
          )}

          {view.status === 'Completed by Therapist' && onComplete && (
            <HoverButton
              onClick={() => { onClose(); onComplete(group || primary); }}
              baseStyle={{
                flex: 1, padding: '10px 18px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg,#059669,#047857)',
                color: '#ffffff', fontSize: 12, fontWeight: 900,
                boxShadow: '0 4px 14px rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              hoverStyle={{ boxShadow: '0 6px 20px rgba(5,150,105,0.45)' }}
            >
              <Banknote size={15} style={{ color: '#fde68a' }} />
              Verify & Complete
            </HoverButton>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  ACCEPT & ASSIGN THERAPIST MODAL                                    */
/* ─────────────────────────────────────────────────────────────────── */

const AcceptAssignModal = ({ appt, therapists, onClose, onConfirmAssign }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // `appt` may be a single row or a grouped visit ({ ids, items, ... }).
  const grp = appt?.ids ? appt : null;
  const view = grp || { ids: [appt.id], items: [appt], client_name: appt.client_name || appt.client, client_email: appt.client_email, datetime: appt.datetime, therapist_id: appt.therapist_id, totalPrice: Number(appt.service_price || 0), totalDuration: Number(appt.service_duration || 0) };
  const primary = view.items[0] || appt;
  const titleText = view.items.length > 1 ? `${view.items.length} treatments · 1 visit` : (primary.service || 'Booking');
  const [selectedTherapistId, setSelectedTherapistId] = useState(appt.therapist_id || '');
  const [submitting, setSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [conflictPrompt, setConflictPrompt] = useState(null);
  useDialogBehavior(onClose);

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    modalBg: isDark ? '#141927' : '#ffffff',
    cardBg: isDark ? '#0f1420' : '#f8fafc',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    footerBg: isDark ? '#0f1420' : '#f8fafc',
  };

  const apptDateStr = useMemo(() => {
    if (!appt.datetime) return '';
    const raw = String(appt.datetime);
    const ymd = raw.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return '';
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [appt.datetime]);

  const { availableTherapists, unavailableTherapists } = useMemo(() => {
    const available = [];
    const unavailable = [];
    for (const t of therapists) {
      if (t.availabilities && Array.isArray(t.availabilities) && t.availabilities.includes(apptDateStr)) available.push(t);
      else unavailable.push(t);
    }
    return { availableTherapists: available, unavailableTherapists: unavailable };
  }, [therapists, apptDateStr]);

  useEffect(() => {
    if (!selectedTherapistId && availableTherapists.length > 0) setSelectedTherapistId(availableTherapists[0].id);
  }, [availableTherapists, selectedTherapistId]);

  const handleSubmit = async (e, forced = false) => {
    e?.preventDefault?.();
    if (!selectedTherapistId) {
      setAssignError('Please select a practitioner from the list before confirming.');
      return;
    }
    setSubmitting(true);
    setAssignError('');
    setConflictPrompt(null);
    try {
      // If no therapists are available on this date, admin is explicitly
      // assigning an active practitioner to make service happen.
      const shouldForce = forced || availableTherapists.length === 0;
      const res = await onConfirmAssign(view.ids, selectedTherapistId, shouldForce);
      if (res?.conflict && res?.canForce) {
        setConflictPrompt(res.message || 'This specialist has an overlapping booking or is off-schedule.');
        setSubmitting(false);
        return;
      }
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.conflict && data?.can_force) {
        setConflictPrompt(data.message || 'This specialist has a booking or is off-schedule in this window.');
      } else {
        setAssignError(data?.message || 'Failed to assign practitioner. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const TherapistCard = ({ t, showAvailBadge = false }) => {
    const isSelected = String(selectedTherapistId) === String(t.id);
    const [hovered, setHovered] = useState(false);
    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={() => { setSelectedTherapistId(t.id); setAssignError(''); setConflictPrompt(null); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedTherapistId(t.id);
            setAssignError('');
            setConflictPrompt(null);
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={{
          padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isSelected ? 'linear-gradient(135deg,#062c22,#0a3d30)' : hovered ? (isDark ? '#162030' : '#f0fdf4') : C.cardBg,
          border: `1px solid ${isSelected ? '#10b981' : hovered ? 'rgba(16,185,129,0.5)' : C.cardBorder}`,
          boxShadow: isSelected ? '0 4px 14px rgba(16,185,129,0.25)' : hovered ? '0 3px 10px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
          transform: isSelected ? 'scale(1.01)' : hovered ? 'translateY(-1px)' : 'none',
          transition: 'all 0.18s ease',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: isSelected ? 'rgba(255,255,255,0.2)' : showAvailBadge ? 'rgba(5,150,105,0.15)' : (isDark ? '#1e293b' : '#e2e8f0'), color: isSelected ? '#ffffff' : showAvailBadge ? '#059669' : C.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
            {t.name.charAt(0)}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 900, color: isSelected ? '#ffffff' : C.textPrimary, margin: 0 }}>{t.name}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#a7f3d0' : C.textMuted, margin: '1px 0 0' }}>{t.specialty || 'Therapist'}</p>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 999, background: isSelected ? '#047857' : showAvailBadge ? 'rgba(5,150,105,0.12)' : (isDark ? '#1e293b' : '#e2e8f0'), color: isSelected ? '#ffffff' : showAvailBadge ? '#059669' : C.textSecondary, border: `1px solid ${isSelected ? '#10b981' : showAvailBadge ? 'rgba(5,150,105,0.3)' : C.cardBorder}` }}>
          {showAvailBadge ? 'Available' : 'Assign'}
        </span>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Assign therapist dialog"
      className="cb-modal-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto', overscrollBehavior: 'contain', background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div
        className="cb-modal-inner"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', width: '100%', padding: 'clamp(12px, 2.5vh, 24px) clamp(10px, 2.5vw, 20px)', boxSizing: 'border-box' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
      <motion.div
        className="cb-modal-sheet"
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ background: C.modalBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, boxShadow: '0 25px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)', width: '100%', maxWidth: 520, maxHeight: 'min(90vh, calc(100dvh - 32px))', margin: 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#062c22,#0a3d30)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={20} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a7f3d0' }}>Accept & Match Therapist · 1 action confirms all</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{titleText}</h3>
              </div>
            </div>
            <HoverButton onClick={onClose} baseStyle={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} hoverStyle={{ background: 'rgba(255,255,255,0.22)' }}>
              <X size={16} />
            </HoverButton>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
          <div style={{ padding: 14, borderRadius: 16, background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>
              <span>Client visit · {view.items.length} treatment{view.items.length > 1 ? 's' : ''}</span>
              <span>{groupRefLabel({ ids: view.ids })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{view.client_name}</p>
                {view.client_email && <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '2px 0 0' }}>{view.client_email}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: 0 }}>{fmtDate(view.datetime)}</p>
                <p style={{ fontSize: 12, fontWeight: 900, color: '#059669', margin: '2px 0 0' }}>{fmt12(view.datetime)}</p>
              </div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {view.items.map((it) => (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12 }}>
                  <span style={{ fontWeight: 800, color: C.textPrimary }}>• {it.service}</span>
                  <span style={{ fontWeight: 700, color: C.textSecondary }}>{it.service_duration ? `${it.service_duration}m` : ''}{it.service_price ? ` · ₱${Number(it.service_price).toLocaleString()}` : ''}</span>
                </div>
              ))}
              {(view.totalDuration > 0 || view.totalPrice > 0) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: `1px solid ${C.cardBorder}`, fontSize: 12, fontWeight: 900 }}>
                  <span style={{ color: C.textSecondary }}>Visit total · {view.totalDuration} min</span>
                  <span style={{ color: '#059669' }}>₱{view.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={14} style={{ color: '#059669' }} /> Select Practitioner
            </label>

            {assignError && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {assignError}
              </div>
            )}

            {conflictPrompt && (
              <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 900, color: '#d97706', margin: 0 }}>
                      Schedule Overlap / Busy Window
                    </p>
                    <p style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, margin: '2px 0 0', lineHeight: 1.4 }}>
                      {conflictPrompt} As administrator, you have authority to force-assign to make this service happen.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 2 }}>
                  <HoverButton
                    type="button"
                    onClick={() => setConflictPrompt(null)}
                    baseStyle={{ padding: '7px 12px', borderRadius: 10, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, fontSize: 11, fontWeight: 700 }}
                    hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}
                  >
                    Select Another
                  </HoverButton>
                  <HoverButton
                    type="button"
                    onClick={() => handleSubmit(null, true)}
                    disabled={submitting}
                    baseStyle={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#059669,#047857)', color: '#ffffff', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}
                    hoverStyle={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                  >
                    <Zap size={13} style={{ color: '#6ee7b7' }} /> Force-Assign &amp; Make Service Happen
                  </HoverButton>
                </div>
              </div>
            )}

            {availableTherapists.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                  <CheckCircle size={13} /> Available on this date ({availableTherapists.length})
                </p>
                {availableTherapists.map(t => <TherapistCard key={t.id} t={t} showAvailBadge />)}
              </div>
            ) : (
              <div style={{ padding: 14, borderRadius: 16, fontSize: 11.5, fontWeight: 600, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)', color: C.textSecondary, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Zap size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                <span>
                  No therapists have listed availability for <strong>{apptDateStr}</strong>. Choose any active practitioner below to <strong>assign and make this service happen</strong> (admin authority).
                </span>
              </div>
            )}

            {unavailableTherapists.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>
                  All Practitioners ({unavailableTherapists.length})
                </p>
                {unavailableTherapists.map(t => <TherapistCard key={t.id} t={t} showAvailBadge={false} />)}
              </div>
            )}
          </div>
        </div>

        <div className="cb-modal-footer-actions" style={{ padding: '14px 20px', borderTop: `1px solid ${C.cardBorder}`, background: C.footerBg, flexShrink: 0 }}>
          <HoverButton onClick={onClose} baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900 }} hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
            Cancel
          </HoverButton>
          <HoverButton
            onClick={handleSubmit}
            disabled={submitting}
            baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#062c22,#0f5040)', color: '#ffffff', fontSize: 12, fontWeight: 900, boxShadow: '0 4px 14px rgba(6,44,34,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            hoverStyle={{ boxShadow: '0 6px 20px rgba(6,44,34,0.45)', transform: 'translateY(-1px)' }}
          >
            {submitting ? 'Confirming…' : <><CheckCircle size={16} style={{ color: '#6ee7b7' }} /> Confirm & Assign{view.ids.length > 1 ? ` ${view.ids.length} treatments` : ''}</>}
          </HoverButton>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  REJECT MODAL                                                       */
/* ─────────────────────────────────────────────────────────────────── */

const RejectModal = ({ appt, onClose, onConfirmReject }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const grp = appt?.ids ? appt : null;
  const view = grp || { ids: [appt.id], items: [appt], client_name: appt.client_name || appt.client, datetime: appt.datetime };
  const titleText = view.items.length > 1 ? `${view.items.length} treatments · 1 visit` : ((view.items[0] || {}).service || 'Booking');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useDialogBehavior(onClose);

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    modalBg: isDark ? '#141927' : '#ffffff',
    cardBg: isDark ? '#0f1420' : '#f8fafc',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    inputBg: isDark ? '#0f1420' : '#ffffff',
    presetBg: isDark ? '#1e293b' : '#f1f5f9',
  };

  const presets = [
    'Therapist fully booked for requested slot',
    'Requested time outside operating hours',
    'Client requested cancellation',
    'Outside service coverage area',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Please select or type a reason for declining.'); return; }
    if (reason.trim().length < 5) { setError('Reason must be at least 5 characters.'); return; }
    setSubmitting(true);
    try {
      await onConfirmReject(view.ids, reason.trim());
      // parent's onConfirmReject already closes the modal via setRejectTarget(null)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Decline visit dialog"
      className="cb-modal-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto', overscrollBehavior: 'contain', background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div
        className="cb-modal-inner"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', width: '100%', padding: 'clamp(12px, 2.5vh, 24px) clamp(10px, 2.5vw, 20px)', boxSizing: 'border-box' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
      <motion.div
        className="cb-modal-sheet"
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ background: C.modalBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, boxShadow: '0 25px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)', width: '100%', maxWidth: 480, maxHeight: 'min(90vh, calc(100dvh - 32px))', margin: 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#7f1d1d,#991b1b)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={20} /></div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fca5a5' }}>Decline visit · applies to all treatments</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{titleText}</h3>
              </div>
            </div>
            <HoverButton onClick={onClose} baseStyle={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} hoverStyle={{ background: 'rgba(255,255,255,0.22)' }}>
              <X size={16} />
            </HoverButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
            <div style={{ padding: 14, borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626', margin: 0 }}>Client visit · {view.items.length} treatment{view.items.length > 1 ? 's' : ''}</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: '4px 0 0' }}>{view.client_name}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '2px 0 0' }}>{fmtDate(view.datetime)} at {fmt12(view.datetime)}</p>
              {view.items.length > 1 && (
                <p style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, margin: '6px 0 0' }}>
                  {view.items.map((it) => it.service).join(' + ')}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>Decline Reason *</label>
              <textarea
                value={reason} rows={3}
                onChange={(e) => { setReason(e.target.value); if (error) setError(''); }}
                placeholder="Select a preset or type a custom reason..."
                style={{ width: '100%', padding: 12, borderRadius: 14, fontSize: 12, fontWeight: 600, color: C.textPrimary, background: C.inputBg, border: `1px solid ${error ? '#ef4444' : C.cardBorder}`, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
              {error && <p style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', margin: 0 }}>{error}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Quick Presets</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {presets.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setReason(p); setError(''); }}
                    className="cb-preset-chip"
                    data-selected={reason === p ? 'true' : 'false'}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 10,
                      background: reason === p ? '#dc2626' : C.presetBg,
                      color: reason === p ? '#ffffff' : C.textSecondary,
                      border: reason === p ? '1px solid #b91c1c' : `1px solid ${C.cardBorder}`,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="cb-modal-footer-actions" style={{ padding: '14px 20px', borderTop: `1px solid ${C.cardBorder}`, background: C.cardBg, flexShrink: 0 }}>
            <HoverButton onClick={onClose} baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900 }} hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
              Keep Pending
            </HoverButton>
            <HoverButton
              type="submit"
              disabled={submitting}
              baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: '#dc2626', color: '#ffffff', fontSize: 12, fontWeight: 900, boxShadow: '0 4px 12px rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              hoverStyle={{ background: '#b91c1c', boxShadow: '0 6px 18px rgba(220,38,38,0.45)' }}
            >
              {submitting ? 'Rejecting…' : <><XCircle size={16} /> Confirm Decline</>}
            </HoverButton>
          </div>
        </form>
      </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  RESCHEDULE MODAL                                                   */
/* ─────────────────────────────────────────────────────────────────── */

const RescheduleModal = ({ request, onClose, onConfirmReschedule }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const grp = request?.ids ? request : null;
  const rview = grp || { ids: [request.id], items: [request], client_name: request.client_name || request.client, datetime: request.datetime };
  const rtitle = rview.items.length > 1 ? `${rview.items.length} treatments · 1 visit` : (request.service || 'Booking');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('14:00');
  const [reasonNote, setReasonNote] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  useDialogBehavior(onClose);

  // Whole-visit duration drives the salon-hours fit check (all treatments move together).
  const visitMinutes = Number(
    rview.totalDuration
    ?? (Array.isArray(rview.items) ? rview.items.reduce((n, it) => n + Number(it.service_duration || 0), 0) : 0)
    ?? 0
  ) || 60;

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    modalBg: isDark ? '#141927' : '#ffffff',
    cardBg: isDark ? '#0f1420' : '#f8fafc',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    inputBg: isDark ? '#0f1420' : '#ffffff',
  };

  useEffect(() => {
    const tom = new Date(); tom.setDate(tom.getDate() + 1);
    setNewDate(tom.toISOString().split('T')[0]);
  }, []);

  const validate = () => {
    const errs = {};
    if (!newDate) errs.newDate = 'Select a new date';
    if (!newTime) errs.newTime = 'Select a time';
    if (newDate && newTime) {
      const sel = new Date(`${newDate}T${newTime}`);
      if (Number.isNaN(sel.getTime())) {
        errs.newDate = 'Invalid date or time';
      } else if (sel <= new Date()) {
        errs.newDate = 'Date/time must be in the future';
      } else {
        // Mirror salon operating hours (9:00 AM – 9:00 PM): the whole visit,
        // including every treatment back-to-back, must fit inside the day.
        const startMin = toMinutes(newTime);
        const endMin = startMin + visitMinutes;
        if (!Number.isFinite(startMin) || startMin < SALON_OPEN_HOUR * 60 || endMin > SALON_CLOSE_HOUR * 60) {
          errs.newTime = `Must fit salon hours 9:00 AM – 9:00 PM (${visitMinutes} min visit)`;
        } else if (Number(String(newTime).split(':')[1]) % 30 !== 0) {
          errs.newTime = 'Pick a time on the hour or half hour';
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await onConfirmReschedule(rview.ids, `${newDate} ${newTime}:00`, reasonNote);
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reschedule visit dialog"
      className="cb-modal-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto', overscrollBehavior: 'contain', background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div
        className="cb-modal-inner"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', width: '100%', padding: 'clamp(12px, 2.5vh, 24px) clamp(10px, 2.5vw, 20px)', boxSizing: 'border-box' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
      <motion.div
        className="cb-modal-sheet"
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ background: C.modalBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, boxShadow: '0 25px 60px -15px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)', width: '100%', maxWidth: 480, maxHeight: 'min(90vh, calc(100dvh - 32px))', margin: 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#1e3a8a,#3b55e6)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={20} /></div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#bfdbfe' }}>Reschedule visit · moves all treatments together</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{rtitle}</h3>
              </div>
            </div>
            <HoverButton onClick={onClose} baseStyle={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} hoverStyle={{ background: 'rgba(255,255,255,0.22)' }}>
              <X size={16} />
            </HoverButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
            <div style={{ padding: 14, borderRadius: 16, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb', margin: 0 }}>Current visit schedule</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: '4px 0 0' }}>{rview.client_name}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', margin: '2px 0 0' }}>{fmtDate(rview.datetime)} at {fmt12(rview.datetime)}</p>
            </div>

            <div className="cb-modal-grid-2col">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>New Date *</label>
                <DatePickerInput value={newDate} onChange={d => { setNewDate(d); setErrors({}); }} placeholder="mm/dd/yyyy" isDark={isDark} />
                {errors.newDate && <p style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', margin: 0 }}>{errors.newDate}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>New Time *</label>
                <input
                  type="time" value={newTime} min="09:00" max="21:00" step={1800}
                  onChange={e => { setNewTime(e.target.value); setErrors({}); }}
                  style={{ padding: '10px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: C.inputBg, color: C.textPrimary, border: `1px solid ${errors.newTime ? '#ef4444' : C.cardBorder}`, outline: 'none', width: '100%', boxSizing: 'border-box' }}
                />
                {errors.newTime && <p style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', margin: 0 }}>{errors.newTime}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>Admin Note (Optional)</label>
              <input type="text" placeholder="e.g. Approved per client request" value={reasonNote} onChange={e => setReasonNote(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: C.inputBg, color: C.textPrimary, border: `1px solid ${C.cardBorder}`, outline: 'none' }} />
            </div>
          </div>

          <div className="cb-modal-footer-actions" style={{ padding: '14px 20px', borderTop: `1px solid ${C.cardBorder}`, background: C.cardBg, flexShrink: 0 }}>
            <HoverButton onClick={onClose} baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900 }} hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
              Cancel
            </HoverButton>
            <HoverButton
              type="submit"
              disabled={submitting}
              baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: '#2563eb', color: '#ffffff', fontSize: 12, fontWeight: 900, boxShadow: '0 4px 12px rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              hoverStyle={{ background: '#1d4ed8', boxShadow: '0 6px 18px rgba(37,99,235,0.45)' }}
            >
              {submitting ? 'Saving…' : <><CheckCircle size={16} /> Save New Schedule</>}
            </HoverButton>
          </div>
        </form>
      </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  VIEW 1: MASTER CALENDAR VIEW                                        */
/* ─────────────────────────────────────────────────────────────────── */

const HOUR_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

const MasterCalendarView = ({ appointments, selectedDate, onDateChange, onSelectAppt }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dateKey = selectedDate.toISOString().split('T')[0];
  const [calPickerOpen, setCalPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setCalPickerOpen(false); };
    if (calPickerOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calPickerOpen]);

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    cardBg: isDark ? '#141927' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    headerBg: isDark ? '#1a2236' : '#dde3ec',
    rowBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
    popupBg: isDark ? '#1a2236' : '#ffffff',
    popupBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    inputTxt: isDark ? '#e8ecf3' : '#0f172a',
  };

  const dayRows = appointments.filter(a => {
    if (!a.datetime) return false;
    if (!['Pending', 'Confirmed', 'In Progress', 'Completed by Therapist'].includes(a.status)) return false;
    const d = new Date(a.datetime);
    return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === dateKey;
  });
  const dayGroups = useMemo(() => groupAppointments(dayRows), [dayRows]);
  const dayTreatmentCount = dayGroups.reduce((n, g) => n + g.items.length, 0);

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onDateChange(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onDateChange(d); };
  const setToday = () => { onDateChange(new Date()); setCalPickerOpen(false); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HoverButton onClick={prevDay} baseStyle={{ padding: '7px 11px', borderRadius: 10, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, display: 'flex', alignItems: 'center' }} hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
              <ChevronLeft size={16} />
            </HoverButton>
            <HoverButton onClick={setToday} baseStyle={{ padding: '7px 16px', borderRadius: 10, fontWeight: 800, fontSize: 13, background: 'rgba(5,150,105,0.12)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }} hoverStyle={{ background: 'rgba(5,150,105,0.22)', borderColor: 'rgba(5,150,105,0.45)' }}>
              Today
            </HoverButton>
            <HoverButton onClick={nextDay} baseStyle={{ padding: '7px 11px', borderRadius: 10, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, display: 'flex', alignItems: 'center' }} hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
              <ChevronRight size={16} />
            </HoverButton>
          </div>

          <div ref={pickerRef} style={{ position: 'relative' }}>
            <HoverButton
              onClick={() => setCalPickerOpen(p => !p)}
              baseStyle={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', borderRadius: 10, background: C.inputBg, color: C.inputTxt, border: `1px solid ${calPickerOpen ? (isDark ? '#34d399' : '#0a3d30') : C.inputBorder}`, fontWeight: 700, fontSize: 13, minWidth: 140 }}
              hoverStyle={{ borderColor: isDark ? '#34d399' : '#0a3d30' }}
            >
              <span style={{ flex: 1, textAlign: 'left' }}>{format(selectedDate, 'MM/dd/yyyy')}</span>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', color: isDark ? '#94a3b8' : '#64748b' }}>
                <CalendarDays size={13} />
              </span>
            </HoverButton>
            <AnimatePresence>
              {calPickerOpen && (
                <motion.div key="cal-popup" initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.16 }}
                  style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100, width: 280, background: C.popupBg, border: `1px solid ${C.popupBorder}`, borderRadius: 16, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}
                >
                  <div style={{ padding: '12px 12px 0' }}>
                    <MiniCalendar isDark={isDark} selectedDate={selectedDate} onSelectDate={(d) => { onDateChange(d); setCalPickerOpen(false); }} accentColor={isDark ? '#34d399' : '#0a3d30'} selectedBg={isDark ? '#34d399' : '#0a3d30'} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${C.popupBorder}`, marginTop: 8 }}>
                    <HoverButton onClick={() => { onDateChange(new Date()); setCalPickerOpen(false); }} baseStyle={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: isDark ? '#34d399' : '#0a3d30', padding: '4px 8px', borderRadius: 8 }} hoverStyle={{ background: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.07)' }}>Clear</HoverButton>
                    <HoverButton onClick={setToday} baseStyle={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: isDark ? '#34d399' : '#0a3d30', padding: '4px 8px', borderRadius: 8 }} hoverStyle={{ background: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.07)' }}>Today</HoverButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: `1px solid ${C.rowBorder}`, paddingTop: 10 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '4px 0 0' }}>
            {dayGroups.length} visit{dayGroups.length !== 1 ? 's' : ''} · {dayTreatmentCount} treatment{dayTreatmentCount !== 1 ? 's' : ''} scheduled
          </p>
        </div>
      </div>

      <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: 440 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', background: C.headerBg, borderBottom: `1px solid ${C.rowBorder}`, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textPrimary, textAlign: 'center' }}>Time</div>
              <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textPrimary, paddingLeft: 12 }}>Sessions</div>
            </div>
            {HOUR_SLOTS.map(hour => {
              const h12 = hour > 12 ? hour - 12 : hour;
              const period = hour >= 12 ? 'PM' : 'AM';
              const slotGroups = dayGroups.filter(g => new Date(g.datetime).getHours() === hour);
              return (
                <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', minHeight: 68, borderBottom: `1px solid ${C.rowBorder}` }}>
                  <div style={{ borderRight: `1px solid ${C.rowBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{h12}:00</p>
                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textMuted, margin: '2px 0 0' }}>{period}</p>
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    {slotGroups.map(g => {
                      const ss = getStatusStyle(g.status, isDark);
                      const isConfirmed = g.status === 'Confirmed';
                      const isInProgress = g.status === 'In Progress';
                      const isEmphasized = isConfirmed || isInProgress;
                      const label = g.items.length > 1 ? `${g.items.length} treatments · 1 visit` : (g.items[0]?.service || 'Visit');
                      return (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => onSelectAppt(g)}
                          style={{
                            flexShrink: 0, textAlign: 'left', padding: '10px 14px', borderRadius: 14, cursor: 'pointer', minWidth: 190, maxWidth: 300,
                            background: isInProgress ? 'linear-gradient(135deg,#0c4a6e,#075985)' : isConfirmed ? 'linear-gradient(135deg,#062c22,#0a3d30)' : C.cardBg,
                            border: `1px solid ${isInProgress ? '#38bdf8' : isConfirmed ? '#10b981' : ss.border}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ fontWeight: 900, fontSize: 12, margin: 0, color: isEmphasized ? '#ffffff' : C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</p>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, flexShrink: 0 }}>{g.status}</span>
                          </div>
                          <p style={{ fontSize: 11, fontWeight: 700, margin: '5px 0 0', color: isEmphasized ? '#a7f3d0' : C.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.client_name} · {fmt12(g.datetime)}</p>
                          <p style={{ fontSize: 11, fontWeight: 600, margin: '3px 0 0', color: isEmphasized ? '#d1fae5' : C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {g.items.map((it) => it.service).join(' + ')}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: `1px solid ${isEmphasized ? 'rgba(255,255,255,0.15)' : C.rowBorder}`, fontSize: 11, fontWeight: 700, color: isEmphasized ? '#d1fae5' : C.textMuted }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.therapist_name || 'Unassigned'}</span>
                            <span style={{ flexShrink: 0, fontWeight: 900 }}>{g.totalDuration || 60}m · {groupRefLabel(g)}</span>
                          </div>
                        </button>
                      );
                    })}
                    {slotGroups.length === 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, fontStyle: 'italic', color: C.textMuted }}>Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  PENDING VISIT CARD — one card per client visit (not per service)     */
/*  Direct, no hidden hover actions: Details / Decline / Accept & Assign  */
/* ─────────────────────────────────────────────────────────────────── */

const PendingCardItem = ({ group, isDark, C, onOpenAccept, onOpenReject, onOpenDetail }) => {
  const g = group;
  const contactLine = stripBillingBlock(g.notes);
  return (
    <motion.div
      key={g.key}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 18, padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Row 1: client + schedule — shown once per visit */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{g.client_name}</p>
            {g.items.length > 1 && (
              <span style={{ fontSize: 11, fontWeight: 900, padding: '2px 10px', borderRadius: 999, background: '#062c22', color: '#e8cc8a' }}>
                {g.items.length} services · 1 visit
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, fontFamily: 'monospace' }}>{groupRefLabel(g)}</span>
          </div>
          {g.client_email && (
            <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '4px 0 0' }}>{g.client_email}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: '#059669' }}>
              <Calendar size={13} /> {fmtDate(g.datetime)} at {fmt12(g.datetime)}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: C.textSecondary, background: isDark ? '#1e293b' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, padding: '2px 8px', borderRadius: 8 }}>
              <Zap size={12} style={{ color: '#f59e0b' }} /> {g.totalDuration} min total
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 900, color: '#b45309', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', padding: '2px 8px', borderRadius: 8 }}>
              ₱{g.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })} total
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: treatments in this visit */}
      <div style={{ borderRadius: 12, border: `1px solid ${C.cardBorder}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', overflow: 'hidden' }}>
        {g.items.map((it, idx) => (
          <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderTop: idx === 0 ? 'none' : `1px solid ${C.cardBorder}` }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary }}>{idx + 1}. {it.service}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, flexShrink: 0 }}>
              {it.service_duration ? `${it.service_duration} min` : ''}{it.service_price ? ` · ₱${Number(it.service_price).toLocaleString()}` : ''}
            </span>
          </div>
        ))}
      </div>

      {contactLine && (
        <p style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, margin: 0, padding: '8px 12px', borderRadius: 10, background: C.noteBg, border: `1px solid ${C.noteBorder}` }}>
          {contactLine.length > 160 ? `${contactLine.slice(0, 160)}…` : contactLine}
        </p>
      )}

      {/* Row 3: exactly 3 clear actions — Details (view), Decline (secondary), Accept & Assign (primary) */}
      <div className="booking-card-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <HoverButton
          onClick={() => onOpenDetail && onOpenDetail(g)}
          baseStyle={{ display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 14px', borderRadius: 12, fontSize: 12, fontWeight: 800, color: C.textSecondary, background: 'transparent', border: `1px solid ${C.cardBorder}` }}
          hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}
        >
          View details
        </HoverButton>
        <HoverButton
          id={`reject-btn-${g.ids[0]}`}
          onClick={() => onOpenReject(g)}
          baseStyle={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, padding: '0 14px', borderRadius: 12, fontSize: 12, fontWeight: 900, color: '#dc2626', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          hoverStyle={{ background: 'rgba(239,68,68,0.16)' }}
        >
          <X size={15} /> Decline{ g.ids.length > 1 ? ` all (${g.ids.length})` : '' }
        </HoverButton>
        <HoverButton
          id={`accept-btn-${g.ids[0]}`}
          onClick={() => onOpenAccept(g)}
          baseStyle={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, padding: '0 18px', borderRadius: 12, fontSize: 12, fontWeight: 900, color: '#fff', background: '#059669', border: 'none' }}
          hoverStyle={{ background: '#047857' }}
        >
          <Check size={15} /> Accept & Assign{ g.ids.length > 1 ? ` · ${g.ids.length} in 1 go` : '' }
        </HoverButton>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  VIEW 2: PENDING APPROVALS QUEUE (grouped by visit)                   */
/* ─────────────────────────────────────────────────────────────────── */

const PendingApprovalsQueue = ({ appointments, onOpenAccept, onOpenReject, onOpenDetail }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const groups = useMemo(() => groupAppointments(appointments.filter(a => a.status === 'Pending')), [appointments]);
  const treatmentCount = groups.reduce((n, g) => n + g.items.length, 0);

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    cardBg: isDark ? '#141927' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    noteBg: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,252,232,1)',
    noteBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(253,230,138,1)',
  };

  if (groups.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center', borderRadius: 24, background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <CheckCircle size={48} style={{ color: '#059669', margin: '0 auto 12px', opacity: 0.85 }} />
        <p style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>All pending requests resolved!</p>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '8px 0 0' }}>New client booking requests will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
          Visits awaiting action ({groups.length})
        </h3>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, margin: '4px 0 0' }}>
          {treatmentCount} treatment{treatmentCount !== 1 ? 's' : ''} grouped into {groups.length} client visit{groups.length !== 1 ? 's' : ''} — accept or decline the whole visit once.
        </p>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {groups.map(g => (
          <PendingCardItem
            key={g.key}
            group={g}
            isDark={isDark}
            C={C}
            onOpenAccept={onOpenAccept}
            onOpenReject={onOpenReject}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  VIEW 3: THERAPIST DONE — ADMIN CONFIRM & SETTLE                    */
/*  Shows sessions marked "Completed by Therapist"                     */
/*  Admin reviews, confirms, and settles cash payment                  */
/* ─────────────────────────────────────────────────────────────────── */

const TherapistDoneCard = ({ group, isDark, C, onSettle, onDetail }) => {
  const g = group;
  const therapist = g.therapist_name || 'Assigned Therapist';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'relative',
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 18,
        padding: '16px 18px 16px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: 'linear-gradient(180deg,#059669,#34d399)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: 'rgba(5,150,105,0.12)', color: '#059669',
          border: '1px solid rgba(5,150,105,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle2 size={22} />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
              {g.items.length > 1 ? `${g.items.length} treatments · 1 visit` : (g.items[0]?.service || 'Visit')}
            </p>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 999,
              background: 'rgba(5,150,105,0.14)', color: '#059669',
              border: '1px solid rgba(5,150,105,0.28)', letterSpacing: '0.05em'
            }}>✓ Therapist Done</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, fontFamily: 'monospace' }}>{groupRefLabel(g)}</span>
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '3px 0 0' }}>
            Client: <span style={{ fontWeight: 900, color: C.textPrimary }}>{g.client_name || '—'}</span>
            {g.client_email ? <span style={{ fontWeight: 600, color: C.textMuted }}> · {g.client_email}</span> : null}
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '3px 0 0' }}>
            Therapist: <span style={{ fontWeight: 900, color: '#059669' }}>{therapist}</span>
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '3px 0 0' }}>
            Visit: <span style={{ fontWeight: 900, color: C.textPrimary }}>{fmtDate(g.datetime)} at {fmt12(g.datetime)} · {g.totalDuration} min</span>
          </p>
          <div style={{ marginTop: 8, borderRadius: 12, border: `1px solid ${C.cardBorder}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', overflow: 'hidden' }}>
            {g.items.map((it, idx) => (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '7px 12px', borderTop: idx === 0 ? 'none' : `1px solid ${C.cardBorder}`, fontSize: 12 }}>
                <span style={{ fontWeight: 800, color: C.textPrimary }}>{it.service}</span>
                <span style={{ fontWeight: 700, color: C.textSecondary }}>₱{Number(it.service_price || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
          {g.totalPrice > 0 && (
            <p style={{ fontSize: 13, fontWeight: 900, color: '#059669', margin: '8px 0 0' }}>
              Visit total: ₱{g.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      <div
        className="booking-card-actions therapist-done-actions"
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
      >
        <HoverButton
          onClick={() => onDetail(g)}
          baseStyle={{ height: 40, padding: '0 16px', borderRadius: 12, fontSize: 12, fontWeight: 800, color: C.textSecondary, background: 'transparent', border: `1px solid ${C.cardBorder}`, whiteSpace: 'nowrap' }}
          hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9' }}
        >View details</HoverButton>
        <HoverButton
          id={`settle-btn-${g.ids[0]}`}
          onClick={() => onSettle(g)}
          baseStyle={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            minHeight: 40, padding: '10px 18px', borderRadius: 12,
            fontSize: 12, fontWeight: 900, color: '#ffffff',
            background: 'linear-gradient(135deg,#047857,#064e3b)',
            border: 'none', whiteSpace: 'nowrap',
          }}
          hoverStyle={{ background: 'linear-gradient(135deg,#059669,#047857)' }}
        >
          <Banknote size={15} style={{ flexShrink: 0 }} />
          Verify &amp; Complete{ g.ids.length > 1 ? ` (${g.ids.length})` : '' }
        </HoverButton>
      </div>
    </motion.div>
  );
};

const TherapistDoneTab = ({ appointments, onSettle, onDetail }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    cardBg: isDark ? '#141927' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
  };

  const doneGroups = useMemo(
    () => groupAppointments(appointments.filter(a => a.status === 'Completed by Therapist')),
    [appointments]
  );
  const doneTreatments = doneGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
            Visits ready for sign-off ({doneGroups.length})
          </h3>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '4px 0 0' }}>
            {doneTreatments} treatment{doneTreatments !== 1 ? 's' : ''} marked done by therapist · Verify the whole visit once to close.
          </p>
        </div>
        {doneGroups.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 12, background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)', color: '#b45309',
            fontSize: 12, fontWeight: 800,
          }}>
            <AlertCircle size={14} />
            {doneGroups.length} visit{doneGroups.length !== 1 ? 's' : ''} awaiting sign-off
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '12px 16px', borderRadius: 16,
        background: isDark ? 'rgba(5,150,105,0.10)' : 'rgba(5,150,105,0.06)',
        border: '1px solid rgba(5,150,105,0.2)',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <Shield size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: isDark ? '#6ee7b7' : '#064e3b', lineHeight: 1.6 }}>
          The therapist has submitted their session as complete. As admin, please <strong>verify the service details and confirm the payment channel</strong> (Cash walk-in, GCash, Maya, or QR Ph) to finalize the record. Cancelled bookings are archived in <strong>History</strong>.
        </p>
      </div>

      {/* Cards */}
      {doneGroups.length === 0 ? (
        <div style={{ padding: 52, textAlign: 'center', borderRadius: 24, background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <CheckCircle2 size={44} style={{ color: '#059669', margin: '0 auto 14px', opacity: 0.5 }} />
          <p style={{ fontSize: 17, fontWeight: 900, color: C.textPrimary, margin: 0 }}>All clear!</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, margin: '6px 0 0' }}>No sessions are pending admin confirmation right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {doneGroups.map(g => (
            <TherapistDoneCard
              key={g.key}
              group={g}
              isDark={isDark}
              C={C}
              onSettle={onSettle}
              onDetail={onDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  VIEW 4: ACTIVE & CONFIRMED TREATMENTS                              */
/*  Active Treatments displays ongoing & scheduled sessions.           */
/*  Settle Cash is NOT done here — it belongs exclusively in           */
/*  Therapist Done after the specialist concludes treatment.          */
/* ─────────────────────────────────────────────────────────────────── */

const ConfirmedSessionsTab = ({ appointments, onOpenReassign, onOpenReschedule, onOpenCancel, onSelectAppt }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    cardBg: isDark ? '#141927' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    inputBg: isDark ? '#0f1420' : '#ffffff',
    pillBg: isDark ? '#1e2a3a' : '#f8fafc',
    pillBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
  };

  const confirmed = useMemo(() => {
    const rows = appointments.filter(a => {
      if (!['Confirmed', 'In Progress'].includes(a.status)) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      return (a.service || '').toLowerCase().includes(q) ||
        (a.client_name || a.client || '').toLowerCase().includes(q) ||
        (a.therapist_name || '').toLowerCase().includes(q) ||
        String(a.id).includes(q);
    });
    return groupAppointments(rows).sort((a, b) => {
      const order = { 'In Progress': 1, 'Confirmed': 2 };
      return (order[a.status] || 3) - (order[b.status] || 3);
    });
  }, [appointments, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Search bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 240px', maxWidth: 440, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 16, background: C.inputBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <Search size={15} style={{ color: C.textMuted, flexShrink: 0 }} />
          <input
            type="text" placeholder="Search active sessions..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, fontWeight: 600, color: C.textPrimary }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <span style={{ fontSize: 11, fontWeight: 900, padding: '7px 14px', borderRadius: 12, background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>
          {confirmed.length} Active
        </span>
      </div>

      {confirmed.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', borderRadius: 24, background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <CalendarCheck size={48} style={{ color: '#059669', margin: '0 auto 12px', opacity: 0.85 }} />
          <p style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>No active sessions right now</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '8px 0 0' }}>Accept a pending booking and assign a therapist — it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {confirmed.map(g => {
            const isInProgress = g.status === 'In Progress';
            const isConfirmed = g.status === 'Confirmed';

            return (
              <motion.div
                key={g.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: isInProgress
                    ? (isDark ? 'linear-gradient(135deg,#0c2233,#141927)' : 'linear-gradient(135deg,#f0f9ff,#ffffff)')
                    : C.cardBg,
                  border: `1px solid ${isInProgress ? 'rgba(14,165,233,0.35)' : C.cardBorder}`,
                  borderRadius: 18, padding: '16px 18px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: isInProgress ? 'rgba(14,165,233,0.12)' : 'rgba(5,150,105,0.10)',
                    color: isInProgress ? '#0284c7' : '#059669',
                    border: `1px solid ${isInProgress ? 'rgba(14,165,233,0.25)' : 'rgba(5,150,105,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isInProgress ? <Zap size={20} /> : <CheckCircle2 size={20} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
                        {g.items.length > 1 ? `${g.items.length} treatments · 1 visit` : (g.items[0]?.service || 'Visit')}
                      </p>
                      {isInProgress && (
                        <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: 'rgba(14,165,233,0.12)', color: '#0284c7', border: '1px solid rgba(14,165,233,0.3)' }}>
                          In Progress
                        </span>
                      )}
                      {isConfirmed && (
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: 'rgba(5,150,105,0.08)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>Confirmed</span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, fontFamily: 'monospace' }}>{groupRefLabel(g)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>
                        {g.client_name}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: isInProgress ? 'rgba(14,165,233,0.08)' : 'rgba(5,150,105,0.08)', color: isInProgress ? '#0284c7' : '#047857', border: `1px solid ${isInProgress ? 'rgba(14,165,233,0.2)' : 'rgba(5,150,105,0.18)'}` }}>
                        <UserCheck size={12} /> {g.therapist_name || 'Unassigned'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 5 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: isInProgress ? '#0284c7' : '#059669' }}>
                        <Calendar size={13} /> {fmtDate(g.datetime)} at {fmt12(g.datetime)} · {g.totalDuration} min
                      </span>
                      {g.totalPrice > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 900, color: '#059669' }}>₱{g.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, margin: '6px 0 0' }}>
                      {g.items.map((it) => it.service).join(' + ')}
                    </p>
                  </div>
                </div>

                {/* Actions — always visible, never hover-only */}
                <div className="booking-card-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {isConfirmed && (
                    <>
                      {onOpenReassign && (
                        <HoverButton
                          onClick={() => onOpenReassign(g)}
                          title="Switch assigned therapist for the whole visit"
                          baseStyle={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 40, padding: '0 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: C.textPrimary, background: C.pillBg, border: `1px solid ${C.cardBorder}` }}
                          hoverStyle={{ background: isDark ? '#2a3a4a' : '#e2e8f0' }}
                        >
                          <UserCheck size={13} style={{ color: '#059669' }} /> Reassign
                        </HoverButton>
                      )}
                      {onOpenReschedule && (
                        <HoverButton
                          onClick={() => onOpenReschedule(g)}
                          title="Reschedule the whole visit"
                          baseStyle={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 40, padding: '0 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: C.textPrimary, background: C.pillBg, border: `1px solid ${C.cardBorder}` }}
                          hoverStyle={{ background: isDark ? '#2a3a4a' : '#e2e8f0' }}
                        >
                          <RotateCcw size={13} style={{ color: '#2563eb' }} /> Reschedule
                        </HoverButton>
                      )}
                      <HoverButton
                        onClick={() => onSelectAppt && onSelectAppt(g)}
                        title="View details"
                        baseStyle={{ height: 40, padding: '0 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: C.textSecondary, background: 'transparent', border: `1px solid ${C.cardBorder}` }}
                        hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9' }}
                      >
                        View details
                      </HoverButton>
                      <HoverButton
                        onClick={() => onOpenCancel(g)}
                        title="Cancel whole visit"
                        baseStyle={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 40, padding: '0 12px', borderRadius: 12, fontSize: 12, fontWeight: 800, color: '#dc2626', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
                        hoverStyle={{ background: 'rgba(239,68,68,0.16)' }}
                      >
                        <X size={14} /> Cancel visit
                      </HoverButton>
                    </>
                  )}

                  {isInProgress && (
                    <>
                      <span className="booking-card-notice" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '0 12px', borderRadius: 12, fontSize: 12, fontWeight: 800, color: '#0284c7', background: isDark ? 'rgba(14,165,233,0.14)' : 'rgba(14,165,233,0.09)', border: '1px solid rgba(14,165,233,0.28)' }}>
                        <Zap size={13} style={{ flexShrink: 0 }} /> Ongoing visit — therapist completes it
                      </span>
                      <HoverButton
                        onClick={() => onSelectAppt && onSelectAppt(g)}
                        title="View details"
                        baseStyle={{ height: 40, padding: '0 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: C.textSecondary, background: 'transparent', border: `1px solid ${C.cardBorder}` }}
                        hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9' }}
                      >
                        View details
                      </HoverButton>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  STAT CARD ITEM                                                     */
/* ─────────────────────────────────────────────────────────────────── */

const StatCardItem = ({ label, value, color, accent, Icon, pulse, isWide, isDark, C }) => {
  return (
    <div
      id={`stat-card-${label.replace(/\s+/g, '-').toLowerCase()}`}
      style={{
        /* All stat cards share the same neutral non-interactive look regardless of pulse */
        background: isDark ? 'linear-gradient(145deg, #141927 0%, #0f1420 100%)' : '#ffffff',
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 16,
        padding: isWide ? '14px 14px' : '10px 10px',
        minHeight: isWide ? 80 : 70,
        display: 'flex',
        alignItems: 'center',
        gap: isWide ? 10 : 8,
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        cursor: 'default',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: isWide ? 40 : 34,
          height: isWide ? 40 : 34,
          borderRadius: 12,
          flexShrink: 0,
          background: pulse ? (isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.15)') : accent,
          color: pulse ? '#f59e0b' : color,
          border: `1px solid ${pulse ? 'rgba(245,158,11,0.3)' : `${color}25`}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Icon size={isWide ? 19 : 16} />
      </div>
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p
          style={{
            fontSize: isWide ? 10 : 9,
            fontWeight: 800,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: C.textMuted,
            margin: 0,
            lineHeight: 1.25,
            wordBreak: 'break-word',
          }}
        >
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <p style={{ fontSize: isWide ? 22 : 18, fontWeight: 900, color: pulse ? '#f59e0b' : color, margin: 0, lineHeight: 1 }}>
            {value}
          </p>
          {pulse && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: isDark ? '#fbbf24' : '#92400e',
                background: isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.15)',
                border: isDark ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(217,119,6,0.3)',
                padding: '1px 5px',
                borderRadius: 5,
                letterSpacing: '0.02em',
                lineHeight: 1.3,
              }}
            >
              Action
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  TAB BUTTON ITEM                                                    */
/* ─────────────────────────────────────────────────────────────────── */

const TabButtonItem = ({ tab, active, isDark, onClick }) => {
  const Icon = tab.icon;
  const [tabHov, setTabHov] = useState(false);
  const [tabPressed, setTabPressed] = useState(false);
  return (
    <button
      id={`tab-${tab.id}`}
      type="button"
      onClick={onClick}
      onMouseEnter={() => setTabHov(true)}
      onMouseLeave={() => { setTabHov(false); setTabPressed(false); }}
      onFocus={() => setTabHov(true)}
      onBlur={() => { setTabHov(false); setTabPressed(false); }}
      onMouseDown={() => setTabPressed(true)}
      onMouseUp={() => setTabPressed(false)}
      style={{
        width: '100%',
        minHeight: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 12,
        padding: '9px 10px',
        fontSize: 12.5,
        fontWeight: 800,
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: tabPressed ? 'scale(0.97)' : 'none',
        border: active
          ? (isDark ? '1px solid rgba(52,211,153,0.5)' : '1px solid #047857')
          : '1px solid transparent',
        background: active
          ? (isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(5,150,105,0.16) 100%)' : '#059669')
          : tabHov
            ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
            : 'transparent',
        color: active
          ? (isDark ? '#34d399' : '#ffffff')
          : tabHov
            ? (isDark ? '#f1f5f9' : '#0f172a')
            : (isDark ? '#94a3b8' : '#64748b'),
        boxShadow: active
          ? (isDark ? '0 2px 12px rgba(16,185,129,0.25)' : '0 2px 10px rgba(5,150,105,0.25)')
          : 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        boxSizing: 'border-box',
        outline: 'none',
      }}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
      {tab.badge !== undefined && tab.badge > 0 && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            padding: '1px 7px',
            borderRadius: 999,
            flexShrink: 0,
            background: active
              ? (isDark ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.25)')
              : tab.pulse
                ? 'rgba(245,158,11,0.25)'
                : (tab.id === 'pending' ? 'rgba(217,119,6,0.22)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
            color: active
              ? (isDark ? '#a7f3d0' : '#ffffff')
              : tab.pulse
                ? '#b45309'
                : (tab.id === 'pending' ? '#fbbf24' : isDark ? '#94a3b8' : '#64748b'),
            border: active
              ? (isDark ? '1px solid rgba(52,211,153,0.45)' : '1px solid rgba(255,255,255,0.3)')
              : tab.pulse
                ? '1px solid rgba(245,158,11,0.5)'
                : (tab.id === 'pending' ? '1px solid rgba(217,119,6,0.4)' : '1px solid transparent'),
            minWidth: 18,
            textAlign: 'center',
            animation: tab.pulse && !active ? 'pulse-badge 1.6s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
          }}
        >
          {tab.badge}
        </span>
      )}
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  MAIN APPOINTMENTS PAGE                                              */
/* ─────────────────────────────────────────────────────────────────── */

const AdminAppointments = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const C = {
    textPrimary: isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#334155',
    cardBg: isDark ? '#141927' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    pillBg: isDark ? '#1e2a3a' : '#f1f5f9',
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'calendar';

  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [settleCashTarget, setSettleCashTarget] = useState(null);

  const [isWide, setIsWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  useEffect(() => {
    const fn = () => setIsWide(window.innerWidth >= 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    document.title = 'Bookings & Appointments | Cozy Blissful Admin';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', 'Manage all spa appointments, pending approvals, therapist assignments, and session completion for Cozy Blissful.');
    return () => { document.title = 'Admin | Cozy Blissful'; };
  }, []);

  const showToast = useCallback((msg, type = 'success') => toast[type]?.(msg) ?? toast.success(msg), [toast]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [apptRes, therapistRes] = await Promise.all([
        API.get('/admin/appointments'),
        API.get('/admin/therapists'),
      ]);
      const apptList = apptRes.data?.appointments || apptRes.data?.recent_appointments || [];
      setAppointments(apptList);
      setTherapists(therapistRes.data?.therapists || []);
    } catch {
      showToast('Failed to sync appointment data from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-open appointment from URL param (notification deep-link) — opens the whole visit
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (!targetId || appointments.length === 0) return;
    const found = appointments.find(a => String(a.id) === String(targetId));
    if (found) {
      const visit = groupAppointments(appointments.filter(a =>
        getGroupClientKey(a) === getGroupClientKey(found) &&
        normalizeGroupDateTime(a.datetime) === normalizeGroupDateTime(found.datetime) &&
        a.status === found.status
      ))[0] || found;
      if (found.status === 'Pending') setAcceptTarget(visit);
      else if (found.notes && found.notes.toLowerCase().includes('reschedule')) setRescheduleTarget(visit);
      else setSelectedAppt(visit);
    }
  }, [searchParams, appointments]);

  const toIds = (idOrIds) => Array.isArray(idOrIds) ? idOrIds : [idOrIds];

  const handleAssignTherapist = async (idOrIds, therapistId, forceAssign = false) => {
    const ids = toIds(idOrIds);
    try {
      let lastName = 'Assigned';
      let lastStatus = 'Confirmed';
      let wasForced = forceAssign;
      const results = await Promise.all(
        ids.map(apptId => API.post(`/admin/appointments/${apptId}/assign`, { therapist_id: therapistId, ...(forceAssign ? { force_assign: true } : {}) }))
      );
      if (results.length > 0) {
        const last = results[results.length - 1];
        lastName = last.data?.appointment?.therapist_name || lastName;
        lastStatus = last.data?.appointment?.status || lastStatus;
        wasForced = last.data?.forced_override || wasForced;
      }
      showToast(wasForced ? `Admin override — ${lastName} force-assigned even though busy/off-schedule!` : (ids.length > 1 ? `Visit confirmed — ${ids.length} treatments assigned in 1 go!` : (lastStatus ? 'Therapist assigned — booking confirmed!' : 'Therapist assigned!')));
      setAppointments(prev => prev.map(a => ids.includes(a.id)
        ? { ...a, therapist_id: therapistId, therapist_name: lastName, status: lastStatus }
        : a));
    } catch (err) {
      const data = err?.response?.data;
      // Admin authority: offer mandatory force-assign even if busy / off-schedule.
      if (data?.conflict && data?.can_force && !forceAssign) {
        const ok = window.confirm(`${data?.message || 'This specialist is already booked in that window.'}\n\nAs admin, do you want to FORCE-ASSIGN this therapist anyway (mandatory override, logged in audit trail)?`);
        if (ok) return handleAssignTherapist(idOrIds, therapistId, true);
      }
      const msg = data?.message || 'Failed to assign therapist';
      showToast(msg, 'error');
    }
  };

  const handleUpdateStatus = async (idOrIds, newStatus, reason = '') => {
    const ids = toIds(idOrIds);
    try {
      await Promise.all(
        ids.map(apptId => API.post(`/admin/appointments/${apptId}/status`, { status: newStatus, reason }))
      );
      showToast(ids.length > 1 ? `Visit updated — ${ids.length} treatments set to ${newStatus}` : `Status updated to ${newStatus}`);
      setAppointments(prev => prev.map(a => ids.includes(a.id) ? { ...a, status: newStatus, notes: reason ? `${a.notes ? a.notes + ' | ' : ''}${reason}` : a.notes } : a));
    } catch (err) {
      const msg = err?.response?.data?.message || `Failed to update status`;
      showToast(msg, 'error');
    }
  };

  const handleReschedule = async (idOrIds, newDateTime, note, forceAssign = false) => {
    const ids = toIds(idOrIds);
    try {
      const results = await Promise.all(
        ids.map(apptId => API.post(`/admin/appointments/${apptId}/reschedule`, { datetime: newDateTime, notes: note, ...(forceAssign ? { force_assign: true } : {}) }))
      );
      const wasForced = results.some(r => r.data?.forced_override) || forceAssign;
      showToast(wasForced ? `Admin override — visit force-moved to ${fmtDate(newDateTime)} at ${fmt12(newDateTime)}!` : (ids.length > 1 ? `Visit rescheduled — ${ids.length} treatments moved to ${fmtDate(newDateTime)} at ${fmt12(newDateTime)}` : `Rescheduled to ${fmtDate(newDateTime)} at ${fmt12(newDateTime)}`));
      setAppointments(prev => prev.map(a => ids.includes(a.id) ? { ...a, datetime: newDateTime, notes: note ? `${a.notes || ''} | Rescheduled: ${note}` : a.notes, status: 'Confirmed' } : a));
    } catch (err) {
      const data = err?.response?.data;
      if (data?.conflict && data?.can_force && !forceAssign) {
        const ok = window.confirm(`${data?.message || 'Slot is already full.'}\n\nAs admin, do you want to FORCE-MOVE anyway (mandatory override, logged)?`);
        if (ok) return handleReschedule(idOrIds, newDateTime, note, true);
      }
      showToast(data?.message || 'Failed to reschedule', 'error');
    }
  };

  const handleSettleCash = async (idOrIds, payload) => {
    const ids = toIds(idOrIds);
    try {
      const normalizedMethod = String(payload?.payment_method || 'cash').toLowerCase();
      // When settling a whole visit, the modal sends the visit total — split it
      // proportionally across treatments so History stays accurate.
      let perShare = null;
      if (ids.length > 1) {
        const byId = new Map(appointments.filter(a => ids.includes(a.id)).map(a => [a.id, a]));
        const sum = ids.reduce((n, id) => n + Number(byId.get(id)?.service_price || 0), 0);
        if (sum > 0) {
          perShare = ids.map(id => (Number(byId.get(id)?.service_price || 0) / sum) * Number(payload.amount_paid || 0));
        }
      }
      await Promise.all(
        ids.map((apptId, i) => {
          const share = perShare ? Math.round(perShare[i] * 100) / 100 : payload.amount_paid;
          return API.post(`/admin/appointments/${apptId}/settle-payment`, {
            amount_paid: share,
            payment_method: normalizedMethod,
            notes: payload.notes,
          });
        })
      );
      showToast(ids.length > 1 ? `Visit verified — ${ids.length} treatments completed and archived!` : ( 'Session verified — completed and archived!'));
      // Optimistic update uses the per-treatment shares already sent to the server.
      const shareById = {};
      if (perShare) ids.forEach((id, i) => { shareById[id] = Math.round(perShare[i] * 100) / 100; });
      setAppointments(prev => prev.map(a => ids.includes(a.id)
        ? {
          ...a,
          status: 'Completed',
          payment_status: 'paid',
          payment_method: normalizedMethod,
          amount_paid: shareById[a.id] ?? Number(payload?.amount_paid || 0),
          paid_at: new Date().toISOString(),
        }
        : a));
      // Refresh amounts from server to avoid rounding drift
      loadData();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to confirm settlement.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Metrics — count visits (groups), not rows, so multi-service bookings don't inflate numbers
  const visitGroups = useMemo(() => groupAppointments(appointments), [appointments]);
  const countVisits = (status) => visitGroups.filter(g => g.status === status).length;
  const confirmedOnlyCount = countVisits('Confirmed');
  const inProgressCount = countVisits('In Progress');
  const pendingCount = countVisits('Pending');
  const awaitingSignoffCount = countVisits('Completed by Therapist');

  const searchData = useMemo(() => appointments.map((a, i) => ({
    label: a.service || 'Appointment',
    desc: `${a.status} · Client: ${a.client_name || a.client || 'Unknown'} · ${fmtDate(a.datetime)}`,
    path: '/admin/appointments',
    category: 'Booking',
    _key: `booking-${a.id || i}`,
    onSelect: () => {
      const visit = groupAppointments(appointments.filter(x =>
        getGroupClientKey(x) === getGroupClientKey(a) &&
        normalizeGroupDateTime(x.datetime) === normalizeGroupDateTime(a.datetime) &&
        x.status === a.status
      ))[0];
      setSelectedAppt(visit || a);
    },
  })), [appointments]);

  const STAT_CARDS = [
    { label: 'Upcoming Scheduled', value: confirmedOnlyCount, color: '#059669', accent: 'rgba(5,150,105,0.12)', Icon: CalendarCheck, tab: 'confirmed' },
    { label: 'Pending Queue', value: pendingCount, color: '#d97706', accent: 'rgba(217,119,6,0.12)', Icon: Clock, tab: 'pending' },
    { label: 'In Treatment Now', value: inProgressCount, color: '#0284c7', accent: 'rgba(14,165,233,0.12)', Icon: Zap, tab: 'confirmed' },
    { label: 'Awaiting Sign-off', value: awaitingSignoffCount, color: '#b45309', accent: awaitingSignoffCount > 0 ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.12)', Icon: AlertCircle, pulse: awaitingSignoffCount > 0, tab: 'requests' },
  ];

  const TABS = [
    { id: 'calendar', label: 'Schedule Calendar', icon: CalendarDays },
    { id: 'pending', label: 'Pending Queue', icon: Clock, badge: pendingCount },
    { id: 'confirmed', label: 'Active Treatments', icon: CheckCircle2, badge: confirmedOnlyCount + inProgressCount },
    { id: 'requests', label: 'Therapist Done', icon: CheckCircle, badge: awaitingSignoffCount, pulse: awaitingSignoffCount > 0 },
  ];

  return (
    <AdminLayout
      title="Bookings"
      subtitle="Manage client schedules, therapist assignments, and treatment verification"
      icon={CalendarCheck}
      searchData={searchData}
      onSearchSelect={item => item.onSelect && item.onSelect()}
    >
      <style>{`
        /* ── Stat Cards Grid ── */
        .cb-booking-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .cb-booking-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
        }
        @media (max-width: 640px) {
          .cb-booking-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
        }

        /* ── Tab Bar ── */
        .cb-tab-scroll-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .cb-tab-scroll-container::-webkit-scrollbar { display: none; }
        .cb-tab-inner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
          width: 100%;
        }
        @media (max-width: 600px) {
          .cb-tab-inner {
            display: flex;
            gap: 5px;
            width: 100%;
          }
          .cb-tab-inner > button {
            flex: 1 1 0;
            min-width: 0;
            padding: 9px 6px;
          }
        }
        @media (max-width: 440px) {
          .cb-tab-inner > button {
            font-size: 10.5px;
            gap: 4px;
            padding: 8px 4px;
          }
        }

        /* ── Card Action Buttons ──
         * Desktop: flex-wrap row
         * Tablet  (<=768px): 2-column grid so 4 buttons sit 2×2, never orphaned
         * Mobile  (<=480px): single full-width column stack
         */
        .therapist-done-actions { min-width: 0; }
        @media (max-width: 768px) {
          .booking-card-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            width: 100%;
          }
          .booking-card-actions > * {
            width: 100% !important;
            justify-content: center !important;
            min-height: 44px !important;
          }
          .booking-card-notice {
            grid-column: 1 / -1 !important;
            text-align: center;
            justify-content: center !important;
          }
          .therapist-done-actions {
            display: grid !important;
            grid-template-columns: auto 1fr;
            width: 100%;
          }
          .therapist-done-actions > * {
            min-height: 44px !important;
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .booking-card-actions {
            grid-template-columns: 1fr !important;
          }
          .booking-card-actions > * {
            width: 100% !important;
          }
          .booking-card-notice {
            grid-column: 1 / -1 !important;
          }
          .therapist-done-actions {
            grid-template-columns: 1fr;
          }
          .therapist-done-actions > * {
            width: 100% !important;
          }
        }

        /* ── Modal Responsive Footer ── */
        .cb-modal-footer-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        @media (max-width: 480px) {
          .cb-modal-footer-actions {
            flex-direction: column;
            gap: 8px;
          }
          .cb-modal-footer-actions > * {
            width: 100% !important;
            flex: unset !important;
          }
        }

        /* ── RescheduleModal 2-col inputs ── */
        .cb-modal-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 400px) {
          .cb-modal-grid-2col {
            grid-template-columns: 1fr;
          }
        }

        /* ── Modal Responsive Centered Styling ── */
        /*
         * INNER-WRAPPER PATTERN with margin: auto (Bulletproof)
         * ─────────────────────────────────────────────────────────
         * .cb-modal-backdrop  → position:fixed scroll container (overflow-y: auto)
         * .cb-modal-inner     → flex-direction: column, min-height: 100%
         * .cb-modal-sheet     → margin: auto, max-height: min(90vh, calc(100dvh - 32px))
         *
         * When sheet fits viewport, margin: auto centers it vertically & horizontally.
         * When sheet is taller than short viewport, margin-top: auto collapses to 0,
         * so the dark green header is NEVER clipped or placed at negative Y.
         */
        .cb-modal-backdrop {
          position: fixed !important;
          inset: 0 !important;
          z-index: 100 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          overscroll-behavior: contain !important;
          background: rgba(15, 23, 42, 0.75) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          box-sizing: border-box !important;
        }
        .cb-modal-inner {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 100% !important;
          width: 100% !important;
          padding: clamp(12px, 2.5vh, 24px) clamp(10px, 2.5vw, 20px) !important;
          box-sizing: border-box !important;
        }
        .cb-modal-sheet {
          width: 100% !important;
          max-height: min(90vh, calc(100dvh - 32px)) !important;
          margin: auto !important;
          border-radius: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
        }
        @media (max-width: 640px) {
          .cb-modal-inner {
            padding: 10px 8px !important;
          }
          .cb-modal-sheet {
            max-width: 100% !important;
            max-height: calc(100dvh - 20px) !important;
            border-radius: 16px !important;
          }
        }
        @media (max-height: 600px) {
          .cb-modal-inner {
            padding: 8px !important;
          }
          .cb-modal-sheet {
            max-height: calc(100dvh - 16px) !important;
          }
        }

        /* ── Preset chip (RejectModal) — single hover, no redundant layer ── */
        .cb-preset-chip:hover,
        .cb-preset-chip:focus-visible {
          filter: brightness(0.9);
          outline: none;
        }
        .cb-preset-chip[data-selected="true"]:hover,
        .cb-preset-chip[data-selected="true"]:focus-visible {
          background: #b91c1c !important;
        }
        .cb-preset-chip:focus-visible {
          box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.4);
        }

        /* ── Pulse badge animation ── */
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(0.92); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Stat Cards — display only, non-interactive */}
        <div className="cb-booking-stat-grid">
          {STAT_CARDS.map(({ label, value, color, accent, Icon, pulse }) => (
            <StatCardItem
              key={label}
              label={label}
              value={value}
              color={color}
              accent={accent}
              Icon={Icon}
              pulse={pulse}
              isWide={isWide}
              isDark={isDark}
              C={C}
            />
          ))}
        </div>

        {/* Tab Navigation — full width grid on desktop, scroll on mobile */}
        <div className="cb-tab-scroll-container" style={{ background: C.pillBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div className="cb-tab-inner">
            {TABS.map(tab => (
              <TabButtonItem
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                isDark={isDark}
                onClick={() => setSearchParams({ tab: tab.id })}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div style={{ paddingTop: 48, paddingBottom: 48 }}><LoadingSpinner /></div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MasterCalendarView appointments={appointments} selectedDate={selectedDate} onDateChange={setSelectedDate} onSelectAppt={setSelectedAppt} />
              </motion.div>
            )}
            {activeTab === 'pending' && (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PendingApprovalsQueue appointments={appointments} onOpenAccept={g => setAcceptTarget(g)} onOpenReject={g => setRejectTarget(g)} onOpenDetail={g => setSelectedAppt(g)} />
              </motion.div>
            )}
            {activeTab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TherapistDoneTab
                  appointments={appointments}
                  onSettle={g => setSettleCashTarget(g)}
                  onDetail={g => setSelectedAppt(g)}
                />
              </motion.div>
            )}
            {activeTab === 'confirmed' && (
              <motion.div key="confirmed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConfirmedSessionsTab
                  appointments={appointments}
                  onSelectAppt={g => setSelectedAppt(g)}
                  onOpenReassign={g => setAcceptTarget(g)}
                  onOpenReschedule={g => setRescheduleTarget(g)}
                  onOpenCancel={g => setRejectTarget(g)}
                  onComplete={g => setSettleCashTarget(g)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Modals ── */}
        <AnimatePresence>
          {acceptTarget && (
            <AcceptAssignModal
              appt={acceptTarget} therapists={therapists}
              onClose={() => setAcceptTarget(null)}
              onConfirmAssign={async (id, tid) => { await handleAssignTherapist(id, tid); setAcceptTarget(null); }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rejectTarget && (
            <RejectModal
              appt={rejectTarget}
              onClose={() => setRejectTarget(null)}
              onConfirmReject={async (id, reason) => { await handleUpdateStatus(id, 'Cancelled', reason); setRejectTarget(null); }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rescheduleTarget && (
            <RescheduleModal
              request={rescheduleTarget}
              onClose={() => setRescheduleTarget(null)}
              onConfirmReschedule={async (id, dt, note) => { await handleReschedule(id, dt, note); setRescheduleTarget(null); }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedAppt && (
            <DetailModal
              group={selectedAppt?.ids ? selectedAppt : null}
              appt={selectedAppt?.ids ? selectedAppt.items[0] : selectedAppt}
              onClose={() => setSelectedAppt(null)}
              onOpenAccept={g => setAcceptTarget(g)}
              onOpenReject={g => setRejectTarget(g)}
              onOpenReschedule={g => setRescheduleTarget(g)}
              onComplete={g => { setSelectedAppt(null); setSettleCashTarget(g); }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {settleCashTarget && (
            <CashSettlementModal
              appt={settleCashTarget}
              onClose={() => setSettleCashTarget(null)}
              onConfirmSettlement={handleSettleCash}
              isDark={isDark}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
