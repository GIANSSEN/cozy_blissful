import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import API from '../../api/axios';
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  XCircle, Check, X, ChevronLeft, ChevronRight, UserCheck,
  Zap, Mail, CalendarDays,
  Search, RotateCcw, CheckCircle2, CalendarCheck, Sparkles, Banknote,
  ArrowRight, Shield, Star,
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
/*  REUSABLE HOVER BUTTON                                              */
/* ─────────────────────────────────────────────────────────────────── */

const HoverButton = ({ onClick, children, baseStyle, hoverStyle, title, disabled = false, id }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...baseStyle,
        ...(hovered && !disabled ? hoverStyle : {}),
        transition: 'all 0.18s ease',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
};



/* ─────────────────────────────────────────────────────────────────── */
/*  APPOINTMENT DETAIL MODAL (CONTEXTUAL ACTIONS)                       */
/* ─────────────────────────────────────────────────────────────────── */

const DetailModal = ({ appt, onClose, onOpenAccept, onOpenReject, onOpenReschedule, onComplete }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ss = getStatusStyle(appt.status, isDark);

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    modalBg:       isDark ? '#141927' : '#ffffff',
    cardBg:        isDark ? '#0f1420' : '#f8fafc',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    noteBg:        isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,252,232,1)',
    noteBorder:    isDark ? 'rgba(245,158,11,0.2)' : 'rgba(253,230,138,1)',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="cb-modal-sheet"
        initial={{ scale: 0.95, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 24, opacity: 0 }}
        style={{ background: C.modalBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', width: '100%', maxWidth: 520, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#062c22,#0a3d30)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a7f3d0' }}>Booking Details</span>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '4px 0 0' }}>{appt.service}</h3>
            </div>
            <HoverButton
              onClick={onClose}
              baseStyle={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              hoverStyle={{ background: 'rgba(255,255,255,0.22)' }}
              title="Close"
            >
              <X size={16} />
            </HoverButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d1fae5', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> {fmtDate(appt.datetime)} at {fmt12(appt.datetime)}
            </span>
            {appt.service_duration && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a7f3d0', background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {appt.service_duration} min
              </span>
            )}
            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
              {appt.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ padding: 16, borderRadius: 16, background: C.cardBg, border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Client Information</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.client_name || appt.client}</p>
            {appt.client_email && (
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0' }}>
                <Mail size={14} style={{ color: '#059669' }} /> {appt.client_email}
              </p>
            )}
          </div>

          <div style={{ padding: 16, borderRadius: 16, background: C.cardBg, border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Assigned Practitioner</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: appt.therapist_name && appt.therapist_name !== 'Unassigned' ? C.textPrimary : C.textMuted, margin: 0 }}>
              {appt.therapist_name || 'Unassigned'}
            </p>
            {appt.service_price && (
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0' }}>
                <Zap size={13} style={{ color: '#f59e0b' }} /> Session Fee: ₱{appt.service_price}
              </p>
            )}
          </div>

          {appt.notes && (
            <div style={{ padding: 14, borderRadius: 16, background: C.noteBg, border: `1px solid ${C.noteBorder}` }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706', margin: 0 }}>Special Notes</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '4px 0 0', lineHeight: 1.6 }}>{appt.notes}</p>
            </div>
          )}

          {appt.status === 'Completed by Therapist' && (
            <div style={{ padding: 14, borderRadius: 16, background: isDark ? 'rgba(217,119,6,0.15)' : '#fefce8', border: '1.5px solid rgba(217,119,6,0.35)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: '#d97706' }} />
                <p style={{ fontSize: 12, fontWeight: 900, color: isDark ? '#fbbf24' : '#92400e', margin: 0 }}>Therapist Concluded Treatment Session</p>
              </div>
              <p style={{ fontSize: 11, color: isDark ? '#fef3c7' : '#78350f', margin: 0, lineHeight: 1.6 }}>
                Specialist <strong>{appt.therapist_name || 'Assigned Therapist'}</strong> marked this treatment as complete. Confirm below to settle cash and archive this booking into History.
              </p>
            </div>
          )}
        </div>

        {/* Footer — contextual actions by status */}
        <div className="cb-modal-footer-actions" style={{ padding: '14px 20px', borderTop: `1px solid ${C.cardBorder}`, background: C.cardBg, flexShrink: 0 }}>
          <HoverButton
            onClick={onClose}
            baseStyle={{ padding: '10px 18px', borderRadius: 14, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900 }}
            hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
          >
            Close
          </HoverButton>

          {/* PENDING: Decline + Assign */}
          {appt.status === 'Pending' && (
            <>
              {onOpenReject && (
                <HoverButton
                  onClick={() => { onClose(); onOpenReject(appt); }}
                  baseStyle={{ padding: '10px 16px', borderRadius: 14, fontSize: 12, fontWeight: 900, color: '#dc2626', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                  hoverStyle={{ background: 'rgba(239,68,68,0.18)', borderColor: 'rgba(239,68,68,0.45)' }}
                >
                  Decline
                </HoverButton>
              )}
              {onOpenAccept && (
                <HoverButton
                  onClick={() => { onClose(); onOpenAccept(appt); }}
                  baseStyle={{ flex: 1, padding: '10px 18px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#ffffff', fontSize: 12, fontWeight: 900, boxShadow: '0 4px 14px rgba(6,44,34,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  hoverStyle={{ boxShadow: '0 6px 20px rgba(6,44,34,0.45)', transform: 'translateY(-1px)' }}
                >
                  <UserCheck size={16} style={{ color: '#6ee7b7' }} /> Assign Specialist & Confirm
                </HoverButton>
              )}
            </>
          )}

          {/* CONFIRMED: Reassign + Reschedule (NO Complete — therapist must do In Progress first) */}
          {appt.status === 'Confirmed' && (
            <>
              {onOpenAccept && (
                <HoverButton
                  onClick={() => { onClose(); onOpenAccept(appt); }}
                  baseStyle={{ padding: '10px 14px', borderRadius: 14, fontSize: 12, fontWeight: 900, color: '#059669', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', gap: 5 }}
                  hoverStyle={{ background: 'rgba(5,150,105,0.2)', borderColor: 'rgba(5,150,105,0.45)' }}
                >
                  <UserCheck size={14} /> Reassign
                </HoverButton>
              )}
              {onOpenReschedule && (
                <HoverButton
                  onClick={() => { onClose(); onOpenReschedule(appt); }}
                  baseStyle={{ padding: '10px 14px', borderRadius: 14, fontSize: 12, fontWeight: 900, color: '#2563eb', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', gap: 5 }}
                  hoverStyle={{ background: 'rgba(37,99,235,0.2)', borderColor: 'rgba(37,99,235,0.45)' }}
                >
                  <RotateCcw size={14} /> Reschedule
                </HoverButton>
              )}
            </>
          )}

          {/* IN PROGRESS or COMPLETED BY THERAPIST: settle cash */}
          {(appt.status === 'In Progress' || appt.status === 'Completed by Therapist') && onComplete && (
            <HoverButton
              onClick={() => { onClose(); onComplete(appt); }}
              baseStyle={{
                flex: 1, padding: '10px 18px', borderRadius: 14, border: 'none',
                background: appt.status === 'Completed by Therapist' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#062c22,#0f5040)',
                color: '#ffffff', fontSize: 12, fontWeight: 900,
                boxShadow: '0 4px 14px rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              hoverStyle={{ boxShadow: '0 6px 20px rgba(5,150,105,0.45)', transform: 'translateY(-1px)' }}
            >
              <Banknote size={15} style={{ color: '#fde68a' }} />
              {appt.status === 'Completed by Therapist' ? 'Settle Cash & Confirm' : 'Settle Cash & Complete'}
            </HoverButton>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  ACCEPT & ASSIGN THERAPIST MODAL                                    */
/* ─────────────────────────────────────────────────────────────────── */

const AcceptAssignModal = ({ appt, therapists, onClose, onConfirmAssign }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedTherapistId, setSelectedTherapistId] = useState(appt.therapist_id || '');
  const [submitting, setSubmitting] = useState(false);

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    modalBg:       isDark ? '#141927' : '#ffffff',
    cardBg:        isDark ? '#0f1420' : '#f8fafc',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    footerBg:      isDark ? '#0f1420' : '#f8fafc',
  };

  const apptDateStr = appt.datetime
    ? appt.datetime.split(' ')[0] || new Date(appt.datetime).toISOString().split('T')[0]
    : '';

  const availableTherapists = therapists.filter(t => t.availabilities && Array.isArray(t.availabilities) && t.availabilities.includes(apptDateStr));
  const unavailableTherapists = therapists.filter(t => !t.availabilities || !Array.isArray(t.availabilities) || !t.availabilities.includes(apptDateStr));

  useEffect(() => {
    if (!selectedTherapistId && availableTherapists.length > 0) setSelectedTherapistId(availableTherapists[0].id);
  }, [availableTherapists]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTherapistId) return;
    setSubmitting(true);
    await onConfirmAssign(appt.id, selectedTherapistId);
    setSubmitting(false);
    onClose();
  };

  const TherapistCard = ({ t, showAvailBadge = false }) => {
    const isSelected = String(selectedTherapistId) === String(t.id);
    const [hovered, setHovered] = useState(false);
    return (
      <div
        onClick={() => setSelectedTherapistId(t.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isSelected ? 'linear-gradient(135deg,#062c22,#0a3d30)' : hovered ? (isDark ? '#162030' : '#f0fdf4') : C.cardBg,
          border: `1px solid ${isSelected ? '#10b981' : hovered ? 'rgba(16,185,129,0.4)' : C.cardBorder}`,
          boxShadow: isSelected ? '0 4px 14px rgba(16,185,129,0.2)' : '0 2px 6px rgba(0,0,0,0.04)',
          transition: 'all 0.18s ease',
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="cb-modal-sheet"
        initial={{ scale: 0.95, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 24, opacity: 0 }}
        style={{ background: C.modalBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', width: '100%', maxWidth: 520, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#062c22,#0a3d30)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={20} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a7f3d0' }}>Accept & Match Therapist</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{appt.service}</h3>
              </div>
            </div>
            <HoverButton onClick={onClose} baseStyle={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} hoverStyle={{ background: 'rgba(255,255,255,0.22)' }}>
              <X size={16} />
            </HoverButton>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: 14, borderRadius: 16, background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>
              <span>Client Request</span>
              <span>#{String(appt.id).padStart(4, '0')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.client_name || appt.client}</p>
                {appt.client_email && <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '2px 0 0' }}>{appt.client_email}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: 0 }}>{fmtDate(appt.datetime)}</p>
                <p style={{ fontSize: 12, fontWeight: 900, color: '#059669', margin: '2px 0 0' }}>{fmt12(appt.datetime)}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={14} style={{ color: '#059669' }} /> Select Practitioner
            </label>

            {availableTherapists.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                  <CheckCircle size={13} /> Available on this date ({availableTherapists.length})
                </p>
                {availableTherapists.map(t => <TherapistCard key={t.id} t={t} showAvailBadge />)}
              </div>
            ) : (
              <div style={{ padding: 14, borderRadius: 16, fontSize: 11, fontWeight: 600, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: C.textSecondary, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                <span>No therapists have listed availability for <strong>{apptDateStr}</strong>. Select any active practitioner below.</span>
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
            disabled={!selectedTherapistId || submitting}
            baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#062c22,#0f5040)', color: '#ffffff', fontSize: 12, fontWeight: 900, boxShadow: '0 4px 14px rgba(6,44,34,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            hoverStyle={{ boxShadow: '0 6px 20px rgba(6,44,34,0.45)', transform: 'translateY(-1px)' }}
          >
            {submitting ? 'Confirming…' : <><CheckCircle size={16} style={{ color: '#6ee7b7' }} /> Confirm & Assign</>}
          </HoverButton>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  REJECT MODAL                                                       */
/* ─────────────────────────────────────────────────────────────────── */

const RejectModal = ({ appt, onClose, onConfirmReject }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    modalBg:       isDark ? '#141927' : '#ffffff',
    cardBg:        isDark ? '#0f1420' : '#f8fafc',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    inputBg:       isDark ? '#0f1420' : '#ffffff',
    presetBg:      isDark ? '#1e293b' : '#f1f5f9',
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
      await onConfirmReject(appt.id, reason.trim());
      // parent's onConfirmReject already closes the modal via setRejectTarget(null)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="cb-modal-sheet"
        initial={{ scale: 0.95, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 24, opacity: 0 }}
        style={{ background: C.modalBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', width: '100%', maxWidth: 460, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#7f1d1d,#991b1b)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={20} /></div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fca5a5' }}>Reject Booking Request</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{appt.service}</h3>
              </div>
            </div>
            <HoverButton onClick={onClose} baseStyle={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} hoverStyle={{ background: 'rgba(255,255,255,0.22)' }}>
              <X size={16} />
            </HoverButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: 14, borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626', margin: 0 }}>Client & Schedule</p>
            <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: '4px 0 0' }}>{appt.client_name || appt.client}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '2px 0 0' }}>{fmtDate(appt.datetime)} at {fmt12(appt.datetime)}</p>
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
                <HoverButton
                  key={p} onClick={() => { setReason(p); setError(''); }}
                  baseStyle={{ fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 10, background: reason === p ? '#dc2626' : C.presetBg, color: reason === p ? '#ffffff' : C.textSecondary, border: reason === p ? '1px solid #b91c1c' : `1px solid ${C.cardBorder}` }}
                  hoverStyle={{ background: reason === p ? '#b91c1c' : (isDark ? '#2a3a4a' : '#e2e8f0') }}
                >
                  {p}
                </HoverButton>
              ))}
            </div>
          </div>

          <div className="cb-modal-footer-actions" style={{ paddingTop: 10, borderTop: `1px solid ${C.cardBorder}` }}>
            <HoverButton onClick={onClose} baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900 }} hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
              Keep Pending
            </HoverButton>
            <HoverButton
              disabled={submitting}
              baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: '#dc2626', color: '#ffffff', fontSize: 12, fontWeight: 900, boxShadow: '0 4px 12px rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              hoverStyle={{ background: '#b91c1c', boxShadow: '0 6px 18px rgba(220,38,38,0.45)' }}
              onClick={handleSubmit}
            >
              {submitting ? 'Rejecting…' : <><XCircle size={16} /> Confirm Decline</>}
            </HoverButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  RESCHEDULE MODAL                                                   */
/* ─────────────────────────────────────────────────────────────────── */

const RescheduleModal = ({ request, onClose, onConfirmReschedule }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('14:00');
  const [reasonNote, setReasonNote] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    modalBg:       isDark ? '#141927' : '#ffffff',
    cardBg:        isDark ? '#0f1420' : '#f8fafc',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    inputBg:       isDark ? '#0f1420' : '#ffffff',
  };

  useEffect(() => {
    const tom = new Date(); tom.setDate(tom.getDate() + 1);
    setNewDate(tom.toISOString().split('T')[0]);
  }, []);

  const validate = () => {
    const errs = {};
    if (!newDate) errs.newDate = 'Select a new date';
    else { const sel = new Date(`${newDate}T${newTime}`); if (sel < new Date()) errs.newDate = 'Date/time cannot be in the past'; }
    if (!newTime) errs.newTime = 'Select a time';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await onConfirmReschedule(request.id, `${newDate} ${newTime}:00`, reasonNote);
    setSubmitting(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="cb-modal-sheet"
        initial={{ scale: 0.95, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 24, opacity: 0 }}
        style={{ background: C.modalBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', width: '100%', maxWidth: 460, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#1e3a8a,#3b55e6)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={20} /></div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#bfdbfe' }}>Reschedule Session</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{request.service}</h3>
              </div>
            </div>
            <HoverButton onClick={onClose} baseStyle={{ width: 32, height: 32, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} hoverStyle={{ background: 'rgba(255,255,255,0.22)' }}>
              <X size={16} />
            </HoverButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: 14, borderRadius: 16, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb', margin: 0 }}>Current Schedule</p>
            <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: '4px 0 0' }}>{request.client_name || request.client}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', margin: '2px 0 0' }}>{fmtDate(request.datetime)} at {fmt12(request.datetime)}</p>
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
                type="time" value={newTime}
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

          <div className="cb-modal-footer-actions" style={{ paddingTop: 10, borderTop: `1px solid ${C.cardBorder}` }}>
            <HoverButton onClick={onClose} baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900 }} hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
              Cancel
            </HoverButton>
            <HoverButton
              disabled={submitting}
              baseStyle={{ flex: 1, padding: 12, borderRadius: 14, border: 'none', background: '#2563eb', color: '#ffffff', fontSize: 12, fontWeight: 900, boxShadow: '0 4px 12px rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              hoverStyle={{ background: '#1d4ed8', boxShadow: '0 6px 18px rgba(37,99,235,0.45)' }}
              onClick={handleSubmit}
            >
              {submitting ? 'Saving…' : <><CheckCircle size={16} /> Save New Schedule</>}
            </HoverButton>
          </div>
        </form>
      </motion.div>
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
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    headerBg:      isDark ? '#1a2236' : '#dde3ec',
    rowBorder:     isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
    popupBg:       isDark ? '#1a2236' : '#ffffff',
    popupBorder:   isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    inputBg:       isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    inputBorder:   isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    inputTxt:      isDark ? '#e8ecf3' : '#0f172a',
  };

  const dayAppts = appointments.filter(a => {
    if (!a.datetime) return false;
    if (!['Pending', 'Confirmed', 'In Progress', 'Completed by Therapist'].includes(a.status)) return false;
    const d = new Date(a.datetime);
    return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === dateKey;
  });

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
            {dayAppts.length} session{dayAppts.length !== 1 ? 's' : ''} scheduled
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
              const slotAppts = dayAppts.filter(a => new Date(a.datetime).getHours() === hour);
              return (
                <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', minHeight: 68, borderBottom: `1px solid ${C.rowBorder}` }}>
                  <div style={{ borderRight: `1px solid ${C.rowBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{h12}:00</p>
                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textMuted, margin: '2px 0 0' }}>{period}</p>
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    {slotAppts.map(appt => {
                      const ss = getStatusStyle(appt.status, isDark);
                      const isConfirmed = appt.status === 'Confirmed';
                      const isInProgress = appt.status === 'In Progress';
                      const isEmphasized = isConfirmed || isInProgress;
                      return (
                        <motion.button
                          key={appt.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectAppt(appt)}
                          style={{
                            flexShrink: 0, textAlign: 'left', padding: '10px 14px', borderRadius: 14, cursor: 'pointer', minWidth: 170, maxWidth: 280,
                            background: isInProgress ? 'linear-gradient(135deg,#0c4a6e,#075985)' : isConfirmed ? 'linear-gradient(135deg,#062c22,#0a3d30)' : C.cardBg,
                            border: `1px solid ${isInProgress ? '#38bdf8' : isConfirmed ? '#10b981' : ss.border}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ fontWeight: 900, fontSize: 12, margin: 0, color: isEmphasized ? '#ffffff' : C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.service}</p>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, flexShrink: 0 }}>{appt.status}</span>
                          </div>
                          <p style={{ fontSize: 11, fontWeight: 700, margin: '5px 0 0', color: isEmphasized ? '#a7f3d0' : C.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>👤 {appt.client_name || appt.client}</p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: `1px solid ${isEmphasized ? 'rgba(255,255,255,0.15)' : C.rowBorder}`, fontSize: 11, fontWeight: 700, color: isEmphasized ? '#d1fae5' : C.textMuted }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🙌 {appt.therapist_name || 'Unassigned'}</span>
                            <span style={{ flexShrink: 0, fontWeight: 900 }}>{appt.service_duration || 60}m</span>
                          </div>
                        </motion.button>
                      );
                    })}
                    {slotAppts.length === 0 && (
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
/*  PENDING CARD ITEM                                                   */
/* ─────────────────────────────────────────────────────────────────── */

const PendingCardItem = ({ appt, isDark, C, onOpenAccept, onOpenReject }) => {
  const [cardHovered, setCardHovered] = useState(false);
  return (
    <motion.div
      key={appt.id}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      onClick={() => onOpenAccept(appt)}
      style={{
        background: cardHovered ? (isDark ? '#162030' : '#f0fdf4') : C.cardBg,
        border: `1px solid ${cardHovered ? (isDark ? 'rgba(16,185,129,0.45)' : 'rgba(5,150,105,0.4)') : C.cardBorder}`,
        borderRadius: 16, padding: '16px 20px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14,
        boxShadow: cardHovered ? (isDark ? '0 8px 24px rgba(0,0,0,0.3), 0 0 16px rgba(16,185,129,0.1)' : '0 8px 24px rgba(0,0,0,0.08)') : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
      title="Click card to accept and assign practitioner"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 0, flex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.service}</p>
            {appt.service_price && (
              <span style={{ fontSize: 11, fontWeight: 900, padding: '2px 9px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' }}>₱{appt.service_price}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, fontFamily: 'monospace' }}>#{String(appt.id).padStart(4, '0')}</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '5px 0 0' }}>
            Client: <strong style={{ color: C.textPrimary }}>{appt.client_name || appt.client}</strong>
            {appt.client_email && <span style={{ fontWeight: 700, color: C.textMuted }}> ({appt.client_email})</span>}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: '#059669' }}>
              <Calendar size={13} /> {fmtDate(appt.datetime)} at {fmt12(appt.datetime)}
            </span>
            {appt.service_duration && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: C.textSecondary, background: isDark ? '#1e293b' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, padding: '2px 8px', borderRadius: 6 }}>
                <Zap size={12} style={{ color: '#f59e0b' }} /> {appt.service_duration} min
              </span>
            )}
          </div>
          {appt.notes && (
            <p style={{ fontSize: 11, fontWeight: 500, fontStyle: 'italic', color: C.textSecondary, margin: '8px 0 0', padding: '8px 12px', borderRadius: 10, background: C.noteBg, border: `1px solid ${C.noteBorder}` }}>
              📝 "{appt.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="booking-card-actions"
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}
      >
        <HoverButton
          id={`accept-btn-${appt.id}`}
          onClick={() => onOpenAccept(appt)}
          baseStyle={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px', borderRadius: 11, fontSize: 12, fontWeight: 900, color: '#fff', background: '#059669', border: 'none', boxShadow: '0 3px 10px rgba(5,150,105,0.25)' }}
          hoverStyle={{ background: '#047857', boxShadow: '0 5px 16px rgba(5,150,105,0.45)', transform: 'translateY(-1px)' }}
        >
          <Check size={15} /> Accept & Assign
        </HoverButton>
        <HoverButton
          id={`reject-btn-${appt.id}`}
          onClick={() => onOpenReject(appt)}
          baseStyle={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 11, fontSize: 12, fontWeight: 900, color: '#dc2626', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
          hoverStyle={{ background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.45)', transform: 'translateY(-1px)' }}
        >
          <X size={15} /> Decline
        </HoverButton>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  VIEW 2: PENDING APPROVALS QUEUE                                     */
/* ─────────────────────────────────────────────────────────────────── */

const PendingApprovalsQueue = ({ appointments, onOpenAccept, onOpenReject }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pending = appointments.filter(a => a.status === 'Pending');

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    noteBg:        isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,252,232,1)',
    noteBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(253,230,138,1)',
  };

  if (pending.length === 0) {
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
      <h3 style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
        Requests Awaiting Action ({pending.length})
      </h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {pending.map(appt => (
          <PendingCardItem
            key={appt.id}
            appt={appt}
            isDark={isDark}
            C={C}
            onOpenAccept={onOpenAccept}
            onOpenReject={onOpenReject}
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

const TherapistDoneCard = ({ appt, isDark, C, onSettle, onDetail }) => {
  const [hovered, setHovered] = useState(false);
  const therapist = appt.therapist_name || appt.therapist || 'Assigned Therapist';
  const price = Number(appt.service_price || appt.amount_paid || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered
          ? (isDark ? 'linear-gradient(145deg,#1a2a1a,#0f2a1a)' : 'linear-gradient(145deg,#f0fdf4,#dcfce7)')
          : C.cardBg,
        border: hovered ? '1.5px solid #059669' : `1px solid ${C.cardBorder}`,
        borderRadius: 22,
        padding: '18px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 14,
        boxShadow: hovered
          ? '0 8px 32px rgba(5,150,105,0.2), 0 0 0 1px rgba(5,150,105,0.1)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      {/* Glow accent bar on left */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: 'linear-gradient(180deg,#059669,#34d399)',
        borderRadius: '22px 0 0 22px',
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.22s',
      }} />

      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 16, flexShrink: 0, marginLeft: 4,
        background: hovered ? 'linear-gradient(135deg,#059669,#34d399)' : 'rgba(5,150,105,0.12)',
        color: hovered ? '#ffffff' : '#059669',
        border: `1.5px solid ${hovered ? 'transparent' : 'rgba(5,150,105,0.28)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.22s',
        boxShadow: hovered ? '0 4px 16px rgba(5,150,105,0.35)' : 'none',
      }}>
        <CheckCircle2 size={22} />
      </div>

      {/* Info */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.service}</p>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 999,
            background: 'rgba(5,150,105,0.14)', color: '#059669',
            border: '1px solid rgba(5,150,105,0.28)', letterSpacing: '0.05em'
          }}>✓ Therapist Done</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, fontFamily: 'monospace' }}>#{String(appt.id).padStart(4, '0')}</span>
        </div>

        <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '3px 0 0' }}>
          Client: <span style={{ fontWeight: 900, color: C.textPrimary }}>{appt.client_name || appt.client || '—'}</span>
        </p>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '3px 0 0' }}>
          Therapist: <span style={{ fontWeight: 900, color: '#059669' }}>{therapist}</span>
        </p>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '3px 0 0' }}>
          Session: <span style={{ fontWeight: 900, color: C.textPrimary }}>{fmtDate(appt.datetime)} at {fmt12(appt.datetime)}</span>
        </p>
        {price > 0 && (
          <p style={{ fontSize: 13, fontWeight: 900, color: '#d97706', margin: '6px 0 0' }}>
            Service Fee: <span style={{ color: '#059669' }}>₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        className="booking-card-actions"
        style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, alignSelf: 'center' }}
      >
        <HoverButton
          onClick={() => onDetail(appt)}
          baseStyle={{ height: 36, padding: '0 14px', borderRadius: 12, fontSize: 12, fontWeight: 800, color: C.textSecondary, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.cardBorder}` }}
          hoverStyle={{ background: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)' }}
        >Details</HoverButton>
        <HoverButton
          id={`settle-btn-${appt.id}`}
          onClick={() => onSettle(appt)}
          baseStyle={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 40, padding: '0 18px', borderRadius: 14,
            fontSize: 12, fontWeight: 900,
            color: '#ffffff',
            background: hovered
              ? 'linear-gradient(135deg,#059669,#047857)'
              : 'linear-gradient(135deg,#047857,#064e3b)',
            border: 'none',
            boxShadow: hovered
              ? '0 4px 20px rgba(5,150,105,0.45)'
              : '0 2px 8px rgba(5,150,105,0.25)',
            letterSpacing: '0.01em',
          }}
          hoverStyle={{ transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(5,150,105,0.5)' }}
        >
          <Banknote size={15} />
          Confirm & Settle Cash
        </HoverButton>
      </div>
    </motion.div>
  );
};

const TherapistDoneTab = ({ appointments, onSettle, onDetail }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
  };

  const doneItems = useMemo(
    () => appointments.filter(a => a.status === 'Completed by Therapist'),
    [appointments]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
            Therapist Completed Sessions
          </h3>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '4px 0 0' }}>
            Sessions marked done by therapist · Admin must confirm and settle payment to close.
          </p>
        </div>
        {doneItems.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 12, background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)', color: '#b45309',
            fontSize: 12, fontWeight: 800,
          }}>
            <AlertCircle size={14} />
            {doneItems.length} Awaiting Admin Sign-off
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
          The therapist has submitted their session as complete. As admin, you must <strong>verify the service, collect cash payment, and confirm</strong> to finalize the record. Cancelled bookings are archived in <strong>History</strong>.
        </p>
      </div>

      {/* Cards */}
      {doneItems.length === 0 ? (
        <div style={{ padding: 52, textAlign: 'center', borderRadius: 24, background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <CheckCircle2 size={44} style={{ color: '#059669', margin: '0 auto 14px', opacity: 0.5 }} />
          <p style={{ fontSize: 17, fontWeight: 900, color: C.textPrimary, margin: 0 }}>All clear!</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, margin: '6px 0 0' }}>No sessions are pending admin confirmation right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {doneItems.map(appt => (
            <TherapistDoneCard
              key={appt.id}
              appt={appt}
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
/*  CRITICAL: "Complete" only shown for In Progress or                  */
/*  Completed by Therapist — NOT for plain Confirmed cards              */
/* ─────────────────────────────────────────────────────────────────── */

const ConfirmedSessionsTab = ({ appointments, onOpenReassign, onOpenReschedule, onOpenCancel, onComplete, onSelectAppt }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    inputBg:       isDark ? '#0f1420' : '#ffffff',
    pillBg:        isDark ? '#1e2a3a' : '#f8fafc',
    pillBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
  };

  const awaitingVerification = useMemo(() => appointments.filter(a => a.status === 'Completed by Therapist'), [appointments]);

  const confirmed = useMemo(() => {
    return appointments.filter(a => {
      if (!['Confirmed', 'In Progress', 'Completed by Therapist'].includes(a.status)) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      return (a.service || '').toLowerCase().includes(q) ||
             (a.client_name || a.client || '').toLowerCase().includes(q) ||
             (a.therapist_name || '').toLowerCase().includes(q) ||
             String(a.id).includes(q);
    }).sort((a, b) => {
      const order = { 'Completed by Therapist': 1, 'In Progress': 2, 'Confirmed': 3 };
      return (order[a.status] || 4) - (order[b.status] || 4);
    });
  }, [appointments, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Removed: sign-off banner now shown in dedicated Therapist Done tab */}

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
          {confirmed.map(appt => {
            const isCompletedByTherapist = appt.status === 'Completed by Therapist';
            const isInProgress = appt.status === 'In Progress';
            const isConfirmed = appt.status === 'Confirmed';

            return (
              <motion.div
                key={appt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: isCompletedByTherapist
                    ? (isDark ? 'linear-gradient(135deg,#231b08,#141927)' : 'linear-gradient(135deg,#fffbeb,#ffffff)')
                    : isInProgress
                    ? (isDark ? 'linear-gradient(135deg,#0c2233,#141927)' : 'linear-gradient(135deg,#f0f9ff,#ffffff)')
                    : C.cardBg,
                  border: `1px solid ${isCompletedByTherapist ? 'rgba(217,119,6,0.5)' : isInProgress ? 'rgba(14,165,233,0.35)' : C.cardBorder}`,
                  borderRadius: 20, padding: '16px 18px',
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14,
                  boxShadow: isCompletedByTherapist ? '0 0 18px rgba(217,119,6,0.18), 0 4px 14px rgba(217,119,6,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Left Info — clickable for detail modal */}
                <div
                  onClick={() => onSelectAppt && onSelectAppt(appt)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 0, flex: 1, cursor: 'pointer' }}
                  title="Click to view full booking details"
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: isCompletedByTherapist ? 'rgba(217,119,6,0.15)' : isInProgress ? 'rgba(14,165,233,0.12)' : 'rgba(5,150,105,0.10)',
                    color: isCompletedByTherapist ? '#d97706' : isInProgress ? '#0284c7' : '#059669',
                    border: `1px solid ${isCompletedByTherapist ? 'rgba(217,119,6,0.35)' : isInProgress ? 'rgba(14,165,233,0.25)' : 'rgba(5,150,105,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isCompletedByTherapist ? <Sparkles size={20} /> : isInProgress ? <Zap size={20} /> : <CheckCircle2 size={20} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.service}</p>
                      {isCompletedByTherapist && (
                        <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 9px', borderRadius: 999, background: 'rgba(217,119,6,0.18)', color: '#d97706', border: '1px solid rgba(217,119,6,0.35)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          ⚡ Awaiting Admin Confirmation
                        </span>
                      )}
                      {isInProgress && (
                        <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: 'rgba(14,165,233,0.12)', color: '#0284c7', border: '1px solid rgba(14,165,233,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          🔵 In Progress
                        </span>
                      )}
                      {isConfirmed && (
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: 'rgba(5,150,105,0.08)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>Confirmed</span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, fontFamily: 'monospace' }}>#{String(appt.id).padStart(4, '0')}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary }}>
                        Client: <strong style={{ color: C.textPrimary }}>{appt.client_name || appt.client}</strong>
                      </span>
                      <span style={{ color: C.textMuted, opacity: 0.5 }}>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: isCompletedByTherapist ? 'rgba(217,119,6,0.1)' : isInProgress ? 'rgba(14,165,233,0.08)' : 'rgba(5,150,105,0.08)', color: isCompletedByTherapist ? '#d97706' : isInProgress ? '#0284c7' : '#047857', border: `1px solid ${isCompletedByTherapist ? 'rgba(217,119,6,0.25)' : isInProgress ? 'rgba(14,165,233,0.2)' : 'rgba(5,150,105,0.18)'}` }}>
                        <UserCheck size={12} /> {appt.therapist_name || 'Unassigned'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 5 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: isCompletedByTherapist ? '#d97706' : isInProgress ? '#0284c7' : '#059669' }}>
                        <Calendar size={13} /> {fmtDate(appt.datetime)} at {fmt12(appt.datetime)}
                      </span>
                      {appt.service_duration && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: C.textSecondary, background: C.pillBg, border: `1px solid ${C.pillBorder}`, padding: '2px 8px', borderRadius: 6 }}>
                          <Clock size={11} style={{ color: '#f59e0b' }} /> {appt.service_duration} min
                        </span>
                      )}
                      {appt.payment_status === 'paid' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: '#059669', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', padding: '2px 8px', borderRadius: 6 }}>
                          <Check size={11} /> Paid {appt.amount_paid ? `(₱${Number(appt.amount_paid).toFixed(2)})` : ''}
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#d97706', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)', padding: '2px 8px', borderRadius: 6 }}>
                          <Banknote size={11} /> Cash on Visit {appt.service_price ? `(₱${Number(appt.service_price).toFixed(2)})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Context-Aware Action Controls
                  ┌────────────────────────────────────────────────────────────────┐
                  │  Status              │ Actions shown                          │
                  │────────────────────────────────────────────────────────────────│
                  │  Confirmed           │ Reassign | Reschedule | [X] Cancel     │
                  │  In Progress         │ Settle Cash & Complete | [X] Cancel    │
                  │  Completed by Thera… │ [★ BIG] Settle Cash & Confirm (admin)  │
                  └────────────────────────────────────────────────────────────────┘
                */}
                <div className="booking-card-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>

                  {/* ── CONFIRMED: No complete button — therapist must start session first ── */}
                  {isConfirmed && (
                    <>
                      {onOpenReassign && (
                        <HoverButton
                          onClick={() => onOpenReassign(appt)}
                          title="Switch assigned therapist"
                          baseStyle={{ display: 'flex', alignItems: 'center', gap: 5, height: 36, padding: '0 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: C.textPrimary, background: C.pillBg, border: `1px solid ${C.cardBorder}` }}
                          hoverStyle={{ background: isDark ? '#2a3a4a' : '#e2e8f0', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                        >
                          <UserCheck size={13} style={{ color: '#059669' }} /> Reassign
                        </HoverButton>
                      )}
                      {onOpenReschedule && (
                        <HoverButton
                          onClick={() => onOpenReschedule(appt)}
                          title="Reschedule date or time"
                          baseStyle={{ display: 'flex', alignItems: 'center', gap: 5, height: 36, padding: '0 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: C.textPrimary, background: C.pillBg, border: `1px solid ${C.cardBorder}` }}
                          hoverStyle={{ background: isDark ? '#2a3a4a' : '#e2e8f0', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                        >
                          <RotateCcw size={13} style={{ color: '#2563eb' }} /> Reschedule
                        </HoverButton>
                      )}
                      <HoverButton
                        onClick={() => onOpenCancel(appt)}
                        title="Cancel Appointment"
                        baseStyle={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#fecaca'}` }}
                        hoverStyle={{ background: isDark ? 'rgba(239,68,68,0.22)' : '#fee2e2', borderColor: '#f87171' }}
                      >
                        <X size={15} />
                      </HoverButton>
                    </>
                  )}

                  {/* ── IN PROGRESS: Settle Cash + Cancel ── */}
                  {isInProgress && (
                    <>
                      <HoverButton
                        onClick={() => onComplete(appt)}
                        title="Settle cash payment and complete this treatment"
                        baseStyle={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', borderRadius: 12, fontSize: 12, fontWeight: 800, color: '#ffffff', background: 'linear-gradient(135deg,#062c22,#0a3d30)', border: 'none', boxShadow: '0 2px 8px rgba(6,44,34,0.2)' }}
                        hoverStyle={{ boxShadow: '0 4px 16px rgba(6,44,34,0.45)', transform: 'translateY(-1px)' }}
                      >
                        <Banknote size={14} /> Settle & Complete
                      </HoverButton>
                      <HoverButton
                        onClick={() => onOpenCancel(appt)}
                        title="Cancel Appointment"
                        baseStyle={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#fecaca'}` }}
                        hoverStyle={{ background: isDark ? 'rgba(239,68,68,0.22)' : '#fee2e2', borderColor: '#f87171' }}
                      >
                        <X size={15} />
                      </HoverButton>
                    </>
                  )}

                  {/* ── COMPLETED BY THERAPIST: Big golden confirm button — most prominent ── */}
                  {isCompletedByTherapist && (
                    <HoverButton
                      onClick={() => onComplete(appt)}
                      title="Settle cash & officially complete — archives to History"
                      baseStyle={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 20px', borderRadius: 14, fontSize: 13, fontWeight: 900, color: '#ffffff', background: 'linear-gradient(135deg,#059669,#047857)', border: 'none', boxShadow: '0 4px 14px rgba(5,150,105,0.45)', letterSpacing: '0.02em' }}
                      hoverStyle={{ boxShadow: '0 6px 22px rgba(5,150,105,0.65)', transform: 'translateY(-2px)' }}
                    >
                      <Banknote size={17} style={{ color: '#fde68a' }} /> Settle Cash & Confirm
                    </HoverButton>
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
        {pulse && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              boxShadow: '0 0 8px #f59e0b',
            }}
          />
        )}
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

const TabButtonItem = ({ tab, active, isDark, C, onClick }) => {
  const Icon = tab.icon;
  const [tabHov, setTabHov] = useState(false);
  return (
    <button
      id={`tab-${tab.id}`}
      type="button"
      onClick={onClick}
      onMouseEnter={() => setTabHov(true)}
      onMouseLeave={() => setTabHov(false)}
      style={{
        width: '100%',
        minHeight: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
        padding: '9px 14px',
        fontSize: 12.5,
        fontWeight: 800,
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
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
        boxSizing: 'border-box',
      }}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      <span>{tab.label}</span>
      {tab.badge !== undefined && tab.badge > 0 && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            padding: '1px 7px',
            borderRadius: 999,
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
  const navigate = useNavigate();

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    pillBg:        isDark ? '#1e2a3a' : '#f1f5f9',
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

  const loadData = async () => {
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
  };

  useEffect(() => { loadData(); }, []);

  // Auto-open appointment from URL param (notification deep-link)
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (!targetId || appointments.length === 0) return;
    const found = appointments.find(a => String(a.id) === String(targetId));
    if (found) {
      if (found.status === 'Pending') setAcceptTarget(found);
      else if (found.notes && found.notes.toLowerCase().includes('reschedule')) setRescheduleTarget(found);
      else setSelectedAppt(found);
    }
  }, [searchParams, appointments]);

  const handleAssignTherapist = async (apptId, therapistId) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/assign`, { therapist_id: therapistId });
      showToast(res.data?.message || 'Therapist assigned — booking confirmed!');
      setAppointments(prev => prev.map(a => a.id === apptId
        ? { ...a, therapist_id: therapistId, therapist_name: res.data?.appointment?.therapist_name || 'Assigned', status: res.data?.appointment?.status || 'Confirmed' }
        : a));
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to assign therapist';
      showToast(msg, 'error');
    }
  };

  const handleUpdateStatus = async (apptId, newStatus, reason = '') => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/status`, { status: newStatus, reason });
      showToast(res.data?.message || `Status updated to ${newStatus}`);
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: newStatus, notes: reason ? `${a.notes ? a.notes + ' | ' : ''}${reason}` : a.notes } : a));
    } catch (err) {
      const msg = err?.response?.data?.message || `Failed to update status`;
      showToast(msg, 'error');
    }
  };

  const handleReschedule = async (apptId, newDateTime, note) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/reschedule`, { datetime: newDateTime, notes: note });
      showToast(res.data?.message || `Rescheduled to ${fmtDate(newDateTime)} at ${fmt12(newDateTime)}`);
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, datetime: newDateTime, notes: note ? `${a.notes || ''} | Rescheduled: ${note}` : a.notes, status: 'Confirmed' } : a));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reschedule', 'error');
    }
  };

  const handleSettleCash = async (apptId, payload) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/settle-payment`, payload);
      showToast(res.data?.message || 'Cash settled — session completed and archived!');
      setAppointments(prev => prev.map(a => a.id === apptId
        ? { ...a, status: 'Completed', payment_status: 'paid', payment_method: 'cash', amount_paid: payload.amount_paid, paid_at: new Date().toISOString() }
        : a));
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to settle cash payment.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Metrics
  const confirmedOnlyCount = appointments.filter(a => a.status === 'Confirmed').length;
  const inProgressCount = appointments.filter(a => a.status === 'In Progress').length;
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const awaitingSignoffCount = appointments.filter(a => a.status === 'Completed by Therapist').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

  const searchData = useMemo(() => appointments.map((a, i) => ({
    label: a.service || 'Appointment',
    desc: `${a.status} · Client: ${a.client_name || a.client || 'Unknown'} · ${fmtDate(a.datetime)}`,
    path: '/admin/appointments',
    category: 'Booking',
    _key: `booking-${a.id || i}`,
    onSelect: () => setSelectedAppt(a),
  })), [appointments]);

  const STAT_CARDS = [
    { label: 'Upcoming Scheduled', value: confirmedOnlyCount, color: '#059669', accent: 'rgba(5,150,105,0.12)', Icon: CalendarCheck, tab: 'confirmed' },
    { label: 'Pending Queue',       value: pendingCount,        color: '#d97706', accent: 'rgba(217,119,6,0.12)',  Icon: Clock, tab: 'pending' },
    { label: 'In Treatment Now',    value: inProgressCount,     color: '#0284c7', accent: 'rgba(14,165,233,0.12)', Icon: Zap, tab: 'confirmed' },
    { label: 'Awaiting Sign-off',   value: awaitingSignoffCount, color: '#b45309', accent: awaitingSignoffCount > 0 ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.12)', Icon: AlertCircle, pulse: awaitingSignoffCount > 0, tab: 'confirmed' },
    { label: 'Completed History',   value: completedCount,      color: '#6366f1', accent: 'rgba(99,102,241,0.12)', Icon: CheckCircle, navigate: '/admin/history' },
  ];

  const TABS = [
    { id: 'calendar',  label: 'Schedule Calendar', icon: CalendarDays },
    { id: 'pending',   label: 'Pending Queue',      icon: Clock,         badge: pendingCount },
    { id: 'confirmed', label: 'Active Treatments',  icon: CheckCircle2,  badge: confirmedOnlyCount + inProgressCount },
    { id: 'requests',  label: 'Therapist Done',     icon: CheckCircle,   badge: awaitingSignoffCount, pulse: awaitingSignoffCount > 0 },
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
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 1100px) {
          .cb-booking-stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
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
            min-width: max-content;
          }
        }

        /* ── Card Action Buttons ── */
        @media (max-width: 768px) {
          .booking-card-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 8px;
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

        /* ── Modal Responsive Width ── */
        @media (max-width: 540px) {
          .cb-modal-sheet {
            border-radius: 24px 24px 0 0 !important;
            align-self: flex-end !important;
            max-height: 96vh !important;
          }
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
                C={C}
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
                <PendingApprovalsQueue appointments={appointments} onOpenAccept={appt => setAcceptTarget(appt)} onOpenReject={appt => setRejectTarget(appt)} />
              </motion.div>
            )}
            {activeTab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TherapistDoneTab
                  appointments={appointments}
                  onSettle={appt => setSettleCashTarget(appt)}
                  onDetail={appt => setSelectedAppt(appt)}
                />
              </motion.div>
            )}
            {activeTab === 'confirmed' && (
              <motion.div key="confirmed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConfirmedSessionsTab
                  appointments={appointments}
                  onSelectAppt={appt => setSelectedAppt(appt)}
                  onOpenReassign={appt => setAcceptTarget(appt)}
                  onOpenReschedule={appt => setRescheduleTarget(appt)}
                  onOpenCancel={appt => setRejectTarget(appt)}
                  onComplete={appt => setSettleCashTarget(appt)}
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
              appt={selectedAppt}
              onClose={() => setSelectedAppt(null)}
              onOpenAccept={appt => setAcceptTarget(appt)}
              onOpenReject={appt => setRejectTarget(appt)}
              onOpenReschedule={appt => setRescheduleTarget(appt)}
              onComplete={appt => { setSelectedAppt(null); setSettleCashTarget(appt); }}
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
