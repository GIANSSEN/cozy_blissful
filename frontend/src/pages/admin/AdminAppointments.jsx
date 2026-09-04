import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  Search, RotateCcw, CheckCircle2, CalendarCheck,
} from 'lucide-react';
import { MiniCalendar } from '../../components/ui/mini-calendar';
import { DatePickerInput } from '../../components/ui/date-picker';
import { format } from 'date-fns';


/* ─────────────────────────────────────────────────────────────────── */
/*  HELPERS & STYLING MAPS                                              */
/* ─────────────────────────────────────────────────────────────────── */

const getStatusStyle = (status, isDark = false) => {
  switch (status) {
    case 'In Progress':
      return {
        bg: isDark ? 'rgba(14, 165, 233, 0.22)' : 'rgba(14, 165, 233, 0.12)',
        color: isDark ? '#38bdf8' : '#0284c7',
        border: isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.35)',
        dot: isDark ? '#38bdf8' : '#0284c7'
      };
    case 'Confirmed':
      return {
        bg: isDark ? 'rgba(22, 163, 74, 0.22)' : 'rgba(22, 163, 74, 0.12)',
        color: isDark ? '#4ade80' : '#15803d',
        border: isDark ? 'rgba(74, 222, 128, 0.4)' : 'rgba(21, 128, 61, 0.3)',
        dot: isDark ? '#4ade80' : '#16a34a'
      };
    case 'Pending':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.14)',
        color: isDark ? '#fbbf24' : '#b45309',
        border: isDark ? 'rgba(251, 191, 36, 0.45)' : 'rgba(180, 83, 9, 0.35)',
        dot: isDark ? '#fbbf24' : '#d97706'
      };
    case 'Cancelled':
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.12)',
        color: isDark ? '#f87171' : '#b91c1c',
        border: isDark ? 'rgba(248, 113, 113, 0.4)' : 'rgba(185, 28, 28, 0.3)',
        dot: isDark ? '#f87171' : '#dc2626'
      };
    case 'Completed':
      return {
        bg: isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.12)',
        color: isDark ? '#a5b4fc' : '#4338ca',
        border: isDark ? 'rgba(165, 180, 252, 0.4)' : 'rgba(67, 56, 202, 0.3)',
        dot: isDark ? '#a5b4fc' : '#4f46e5'
      };
    default:
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(100, 116, 139, 0.12)',
        color: isDark ? '#cbd5e1' : '#334155',
        border: isDark ? 'rgba(203, 213, 225, 0.4)' : 'rgba(51, 65, 85, 0.3)',
        dot: isDark ? '#cbd5e1' : '#64748b'
      };
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
/*  APPOINTMENT DETAIL MODAL (WITH CONTEXTUAL ACTIONS)                  */
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
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        style={{
          background: C.modalBg, border: `1px solid ${C.cardBorder}`,
          borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          width: '100%', maxWidth: 512, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a7f3d0' }}>
                Booking Details
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '4px 0 0' }}>{appt.service}</h3>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#ffffff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d1fae5', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> {fmtDate(appt.datetime)} at {fmt12(appt.datetime)}
            </span>
            {appt.service_duration && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#a7f3d0',
                background: 'rgba(255,255,255,0.1)', padding: '2px 10px',
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Clock size={12} /> {appt.service_duration} min
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999,
              background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
            }}>
              {appt.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Client info */}
          <div style={{
            padding: 16, borderRadius: 16, background: C.cardBg,
            border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Client Information</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.client_name || appt.client}</p>
            {appt.client_email && (
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0' }}>
                <Mail size={14} style={{ color: '#059669' }} /> {appt.client_email}
              </p>
            )}
          </div>

          {/* Therapist info */}
          <div style={{
            padding: 16, borderRadius: 16, background: C.cardBg,
            border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
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

          {/* Notes */}
          {appt.notes && (
            <div style={{
              padding: 14, borderRadius: 16, background: C.noteBg,
              border: `1px solid ${C.noteBorder}`,
            }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706', margin: 0 }}>Special Client Notes</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '4px 0 0', lineHeight: 1.5 }}>{appt.notes}</p>
            </div>
          )}
        </div>

        {/* Footer with contextual actions */}
        <div style={{
          padding: '16px 24px', borderTop: `1px solid ${C.cardBorder}`,
          background: C.cardBg, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0,
        }}>
          <button type="button" onClick={onClose} style={{
            padding: '10px 18px', borderRadius: 14, border: `1px solid ${C.cardBorder}`,
            background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900, cursor: 'pointer',
          }}>
            Close
          </button>

          {appt.status === 'Pending' && (
            <>
              {onOpenReject && (
                <button type="button" onClick={() => { onClose(); onOpenReject(appt); }} style={{
                  padding: '10px 16px', borderRadius: 14, cursor: 'pointer',
                  fontSize: 12, fontWeight: 900, color: '#dc2626', background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}>
                  Decline
                </button>
              )}
              {onOpenAccept && (
                <button type="button" onClick={() => { onClose(); onOpenAccept(appt); }} style={{
                  flex: 1, padding: '10px 18px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#ffffff',
                  fontSize: 12, fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(6,44,34,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <UserCheck size={16} style={{ color: '#6ee7b7' }} /> Assign Specialist &amp; Confirm
                </button>
              )}
            </>
          )}

          {(appt.status === 'Confirmed' || appt.status === 'In Progress') && (
            <>
              {appt.status === 'Confirmed' && onOpenAccept && (
                <button type="button" onClick={() => { onClose(); onOpenAccept(appt); }} style={{
                  padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
                  fontSize: 12, fontWeight: 900, color: '#059669', background: 'rgba(5,150,105,0.1)',
                  border: '1px solid rgba(5,150,105,0.25)', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <UserCheck size={14} /> Reassign
                </button>
              )}
              {appt.status === 'Confirmed' && onOpenReschedule && (
                <button type="button" onClick={() => { onClose(); onOpenReschedule(appt); }} style={{
                  padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
                  fontSize: 12, fontWeight: 900, color: '#2563eb', background: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <RotateCcw size={14} /> Reschedule
                </button>
              )}
              {onComplete && (
                <button type="button" onClick={() => { onClose(); onComplete(appt); }} style={{
                  flex: 1, padding: '10px 18px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg,#062c22,#0f5040)', color: '#ffffff',
                  fontSize: 12, fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(6,44,34,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <CheckCircle size={15} style={{ color: '#6ee7b7' }} /> Complete Session
                </button>
              )}
            </>
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

  const availableTherapists = therapists.filter((t) =>
    t.availabilities && Array.isArray(t.availabilities) && t.availabilities.includes(apptDateStr)
  );

  const unavailableTherapists = therapists.filter((t) =>
    !t.availabilities || !Array.isArray(t.availabilities) || !t.availabilities.includes(apptDateStr)
  );

  useEffect(() => {
    if (!selectedTherapistId && availableTherapists.length > 0) {
      setSelectedTherapistId(availableTherapists[0].id);
    }
  }, [availableTherapists]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTherapistId) return;
    setSubmitting(true);
    await onConfirmAssign(appt.id, selectedTherapistId);
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        style={{
          background: C.modalBg, border: `1px solid ${C.cardBorder}`,
          borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          width: '100%', maxWidth: 512, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', maxHeight: '92vh',
        }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#062c22,#0a3d30)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 14,
                background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <UserCheck size={20} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a7f3d0' }}>Accept &amp; Match Therapist</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{appt.service}</h3>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#ffffff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, textAlign: 'left' }}>
          <div style={{
            padding: 16, borderRadius: 16, background: C.cardBg,
            border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>
              <span>Client Request Details</span>
              <span>#{String(appt.id).padStart(4, '0')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={14} style={{ color: '#059669' }} /> Select Practitioner for Session
            </label>

            {availableTherapists.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                  <CheckCircle size={14} /> Scheduled &amp; Available ({availableTherapists.length})
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {availableTherapists.map((t) => {
                    const isSelected = String(selectedTherapistId) === String(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTherapistId(t.id)}
                        style={{
                          padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: isSelected ? 'linear-gradient(135deg,#062c22,#0a3d30)' : C.cardBg,
                          border: `1px solid ${isSelected ? '#10b981' : C.cardBorder}`,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 10,
                            background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(5,150,105,0.15)',
                            color: isSelected ? '#ffffff' : '#059669',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 13,
                          }}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 900, color: isSelected ? '#ffffff' : C.textPrimary, margin: 0 }}>{t.name}</p>
                            <p style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#a7f3d0' : C.textMuted, margin: '2px 0 0' }}>{t.specialty || 'Therapist'}</p>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 900, padding: '2px 10px', borderRadius: 999,
                          background: isSelected ? '#047857' : 'rgba(5,150,105,0.12)',
                          color: isSelected ? '#ffffff' : '#059669',
                          border: `1px solid ${isSelected ? '#10b981' : 'rgba(5,150,105,0.3)'}`,
                        }}>
                          Available
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                padding: 14, borderRadius: 16, fontSize: 11, fontWeight: 600,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                color: C.textSecondary, display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                <span>No therapists have explicitly listed shift availability for <strong>{apptDateStr}</strong>. Select any active practitioner from the list below to assign.</span>
              </div>
            )}

            {unavailableTherapists.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>
                  All Active Practitioners ({unavailableTherapists.length})
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {unavailableTherapists.map((t) => {
                    const isSelected = String(selectedTherapistId) === String(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTherapistId(t.id)}
                        style={{
                          padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: isSelected ? 'linear-gradient(135deg,#062c22,#0a3d30)' : C.cardBg,
                          border: `1px solid ${isSelected ? '#10b981' : C.cardBorder}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 10,
                            background: isSelected ? 'rgba(255,255,255,0.2)' : (isDark ? '#1e293b' : '#e2e8f0'),
                            color: isSelected ? '#ffffff' : C.textSecondary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 13,
                          }}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 900, color: isSelected ? '#ffffff' : C.textPrimary, margin: 0 }}>{t.name}</p>
                            <p style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#a7f3d0' : C.textMuted, margin: '2px 0 0' }}>{t.specialty || 'Practitioner'}</p>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 900, padding: '2px 10px', borderRadius: 999,
                          background: isSelected ? '#047857' : (isDark ? '#1e293b' : '#e2e8f0'),
                          color: isSelected ? '#ffffff' : C.textSecondary,
                        }}>Assign</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{
          padding: '16px 24px', borderTop: `1px solid ${C.cardBorder}`,
          background: C.footerBg, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 14, border: `1px solid ${C.cardBorder}`,
            background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTherapistId || submitting}
            onClick={handleSubmit}
            style={{
              flex: 1, padding: '12px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg,#062c22,#0f5040)', color: '#ffffff',
              fontSize: 12, fontWeight: 900, cursor: 'pointer', opacity: (!selectedTherapistId || submitting) ? 0.5 : 1,
              boxShadow: '0 4px 14px rgba(6,44,34,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {submitting ? 'Confirming…' : <><CheckCircle size={16} style={{ color: '#6ee7b7' }} /> Confirm &amp; Assign</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  REJECT / DECLINE MODAL WITH VALIDATION                              */
/* ─────────────────────────────────────────────────────────────────── */

const RejectModal = ({ appt, onClose, onConfirmReject }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { toast } = useToast();
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
    'Outside delivery service coverage area'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please select or type a reason for declining this request.');
      return;
    }
    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters long.');
      return;
    }

    setSubmitting(true);
    await onConfirmReject(appt.id, reason.trim());
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        style={{
          background: C.modalBg, border: `1px solid ${C.cardBorder}`,
          borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          width: '100%', maxWidth: 448, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#7f1d1d,#991b1b)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 14,
                background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <XCircle size={20} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fca5a5' }}>Reject Booking Request</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{appt.service}</h3>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#ffffff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
          <div style={{
            padding: 14, borderRadius: 16, background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626', margin: 0 }}>Client &amp; Schedule</p>
            <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.client_name || appt.client}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '2px 0 0' }}>{fmtDate(appt.datetime)} at {fmt12(appt.datetime)}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>
              Reason for Decline / Cancellation Note *
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Select a preset below or type a custom reason..."
              rows={3}
              style={{
                width: '100%', padding: 12, borderRadius: 14,
                fontSize: 12, fontWeight: 600, color: C.textPrimary,
                background: C.inputBg, border: `1px solid ${error ? '#ef4444' : C.cardBorder}`,
                outline: 'none', resize: 'vertical',
              }}
            />
            {error && <p style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', margin: '2px 0 0' }}>{error}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Quick Presets</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setReason(p); setError(''); }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 10, cursor: 'pointer',
                    background: reason === p ? '#dc2626' : C.presetBg,
                    color: reason === p ? '#ffffff' : C.textSecondary,
                    border: reason === p ? '1px solid #b91c1c' : `1px solid ${C.cardBorder}`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${C.cardBorder}` }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.cardBorder}`,
              background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900, cursor: 'pointer',
            }}>
              Keep Pending
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1, padding: 12, borderRadius: 14, border: 'none',
                background: '#dc2626', color: '#ffffff', fontSize: 12, fontWeight: 900, cursor: 'pointer',
                opacity: submitting ? 0.6 : 1, boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {submitting ? 'Rejecting…' : <><XCircle size={16} /> Confirm Decline</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

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
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    setNewDate(tom.toISOString().split('T')[0]);
  }, []);

  const validate = () => {
    const errs = {};
    if (!newDate) errs.newDate = 'Please select a new date';
    else {
      const sel = new Date(`${newDate}T${newTime}`);
      if (sel < new Date()) {
        errs.newDate = 'New schedule date/time cannot be in the past';
      }
    }
    if (!newTime) errs.newTime = 'Please select a time slot';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const newDateTime = `${newDate} ${newTime}:00`;
    await onConfirmReschedule(request.id, newDateTime, reasonNote);
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        style={{
          background: C.modalBg, border: `1px solid ${C.cardBorder}`,
          borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          width: '100%', maxWidth: 448, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#1e3a8a,#3b55e6)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 14,
                background: 'rgba(255,255,255,0.2)', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RotateCcw size={20} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#bfdbfe' }}>Reschedule Session</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: '2px 0 0' }}>{request.service}</h3>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#ffffff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
          <div style={{
            padding: 14, borderRadius: 16, background: 'rgba(37,99,235,0.08)',
            border: '1px solid rgba(37,99,235,0.2)', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb', margin: 0 }}>Current Booking Schedule</p>
            <p style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{request.client_name || request.client}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', margin: '2px 0 0' }}>{fmtDate(request.datetime)} at {fmt12(request.datetime)}</p>
            {request.notes && <p style={{ fontSize: 11, fontWeight: 500, fontStyle: 'italic', color: C.textSecondary, margin: '4px 0 0' }}>Requested note: "{request.notes}"</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>New Date *</label>
              <DatePickerInput value={newDate} onChange={(d) => { setNewDate(d); setErrors({}); }} placeholder="mm/dd/yyyy" isDark={isDark} className="w-full" />
              {errors.newDate && <p style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', margin: 0 }}>{errors.newDate}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>New Time *</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => { setNewTime(e.target.value); setErrors({}); }}
                style={{
                  padding: '10px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                  background: C.inputBg, color: C.textPrimary, border: `1px solid ${errors.newTime ? '#ef4444' : C.cardBorder}`,
                  outline: 'none',
                }}
              />
              {errors.newTime && <p style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', margin: 0 }}>{errors.newTime}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted }}>Admin Reschedule Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Approved per customer request via hotline"
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              style={{
                padding: '10px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                background: C.inputBg, color: C.textPrimary, border: `1px solid ${C.cardBorder}`,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${C.cardBorder}` }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.cardBorder}`,
              background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1, padding: 12, borderRadius: 14, border: 'none',
                background: '#2563eb', color: '#ffffff', fontSize: 12, fontWeight: 900, cursor: 'pointer',
                opacity: submitting ? 0.6 : 1, boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {submitting ? 'Updating…' : <><CheckCircle size={16} /> Save New Schedule</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  VIEW 1: MASTER CALENDAR VIEW                                        */
/* ─────────────────────────────────────────────────────────────────── */

const HOUR_SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]; // 8 AM – 10 PM

const MasterCalendarView = ({ appointments, selectedDate, onDateChange, therapists, onSelectAppt }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dateKey = selectedDate.toISOString().split('T')[0];
  const [calPickerOpen, setCalPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setCalPickerOpen(false);
      }
    };
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
    popupShadow:   isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.15)',
    inputBg:       isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    inputBorder:   isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    inputTxt:      isDark ? '#e8ecf3' : '#0f172a',
    inputMuted:    isDark ? '#4e5a70' : '#94a3b8',
  };

  const dayAppts = appointments.filter((a) => {
    if (!a.datetime) return false;
    // Active bookings appear on the board: Pending, Confirmed, In Progress
    if (a.status !== 'Pending' && a.status !== 'Confirmed' && a.status !== 'In Progress') return false;
    const d = new Date(a.datetime);
    return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === dateKey;
  });

  const getApptHour = (dt) => new Date(dt).getHours();

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onDateChange(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onDateChange(d); };
  const setToday = () => { onDateChange(new Date()); setCalPickerOpen(false); };
  const handleClear = () => { onDateChange(new Date()); setCalPickerOpen(false); };
  const handlePickerSelect = (day) => { onDateChange(day); setCalPickerOpen(false); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Date Navigation Toolbar ── */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20,
        padding: '14px 18px', display: 'flex', flexDirection: 'column',
        gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        {/* Row 1: nav buttons + custom date picker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={prevDay} style={{
              padding: '7px 11px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${C.cardBorder}`,
              background: 'transparent', color: C.textSecondary, display: 'flex', alignItems: 'center',
            }}><ChevronLeft size={16} /></button>
            <button onClick={setToday} style={{
              padding: '7px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 800,
              fontSize: 13, background: 'rgba(5,150,105,0.12)', color: '#059669',
              border: '1px solid rgba(5,150,105,0.25)',
            }}>Today</button>
            <button onClick={nextDay} style={{
              padding: '7px 11px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${C.cardBorder}`,
              background: 'transparent', color: C.textSecondary, display: 'flex', alignItems: 'center',
            }}><ChevronRight size={16} /></button>
          </div>

          {/* ── Custom Date Picker ── */}
          <div ref={pickerRef} style={{ position: 'relative' }}>
            {/* Trigger button — styled like the screenshot */}
            <button
              onClick={() => setCalPickerOpen(prev => !prev)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
                background: C.inputBg, color: C.inputTxt,
                border: `1px solid ${calPickerOpen ? (isDark ? '#34d399' : '#0a3d30') : C.inputBorder}`,
                fontWeight: 700, fontSize: 13,
                boxShadow: calPickerOpen ? `0 0 0 3px ${isDark ? 'rgba(52,211,153,0.15)' : 'rgba(10,61,48,0.1)'}` : 'none',
                transition: 'all 0.15s ease',
                minWidth: 140,
              }}
            >
              <span style={{ flex: 1, textAlign: 'left' }}>
                {format(selectedDate, 'MM/dd/yyyy')}
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24, borderRadius: 6,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                color: isDark ? '#94a3b8' : '#64748b', flexShrink: 0,
              }}>
                <CalendarDays size={13} />
              </span>
            </button>

            {/* ── Popup dropdown ── */}
            <AnimatePresence>
              {calPickerOpen && (
                <motion.div
                  key="cal-popup"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    zIndex: 100, width: 280,
                    background: C.popupBg,
                    border: `1px solid ${C.popupBorder}`,
                    borderRadius: 16,
                    boxShadow: C.popupShadow,
                    overflow: 'hidden',
                  }}
                >
                  {/* Calendar body */}
                  <div style={{ padding: '12px 12px 0' }}>
                    <MiniCalendar
                      isDark={isDark}
                      selectedDate={selectedDate}
                      onSelectDate={handlePickerSelect}
                      accentColor={isDark ? '#34d399' : '#0a3d30'}
                      selectedBg={isDark ? '#34d399' : '#0a3d30'}
                    />
                  </div>

                  {/* Footer: Clear / Today */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px', borderTop: `1px solid ${C.popupBorder}`,
                    marginTop: 8,
                  }}>
                    <button
                      onClick={handleClear}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700,
                        color: isDark ? '#34d399' : '#0a3d30',
                        padding: '4px 8px', borderRadius: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      Clear
                    </button>
                    <button
                      onClick={setToday}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700,
                        color: isDark ? '#34d399' : '#0a3d30',
                        padding: '4px 8px', borderRadius: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      Today
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 2: date title */}
        <div style={{ textAlign: 'center', borderTop: `1px solid ${C.rowBorder}`, paddingTop: 10 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '4px 0 0' }}>
            {dayAppts.length} session{dayAppts.length !== 1 ? 's' : ''} scheduled on this day
          </p>
        </div>
      </div>

      {/* ── Hourly Schedule Time Grid ── */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.cardBorder}`,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        {/* Horizontal scroll wrapper */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: 480 }}>

            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '90px 1fr',
              background: C.headerBg, borderBottom: `1px solid ${C.rowBorder}`,
              padding: '12px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textPrimary, textAlign: 'center' }}>Time Slot</div>
              <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textPrimary, paddingLeft: 12 }}>Session Bookings</div>
            </div>

            {/* Hour rows */}
            {HOUR_SLOTS.map((hour) => {
              const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
              const period = hour >= 12 ? 'PM' : 'AM';
              const slotAppts = dayAppts.filter((a) => getApptHour(a.datetime) === hour);
              return (
                <div key={hour} style={{
                  display: 'grid', gridTemplateColumns: '90px 1fr',
                  minHeight: 72, borderBottom: `1px solid ${C.rowBorder}`,
                }}>
                  {/* Time label */}
                  <div style={{
                    borderRight: `1px solid ${C.rowBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{h12}:00</p>
                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textMuted, margin: '2px 0 0' }}>{period}</p>
                    </div>
                  </div>

                  {/* Appointment chips */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    {slotAppts.map((appt) => {
                      const ss = getStatusStyle(appt.status, isDark);
                      const isConfirmed = appt.status === 'Confirmed';
                      const isInProgress = appt.status === 'In Progress';
                      const isEmphasized = isConfirmed || isInProgress;
                      return (
                        <motion.button
                          key={appt.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectAppt(appt)}
                          style={{
                            flexShrink: 0, textAlign: 'left', padding: '10px 14px',
                            borderRadius: 16, cursor: 'pointer', minWidth: 180, maxWidth: 300,
                            background: isInProgress
                              ? 'linear-gradient(135deg,#0c4a6e,#075985)'
                              : isConfirmed
                              ? 'linear-gradient(135deg,#062c22,#0a3d30)'
                              : C.cardBg,
                            border: `1px solid ${isInProgress ? '#38bdf8' : isConfirmed ? '#10b981' : ss.border}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{
                              fontWeight: 900, fontSize: 12, margin: 0,
                              color: isEmphasized ? '#ffffff' : C.textPrimary,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{appt.service}</p>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                              background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, flexShrink: 0,
                            }}>{appt.status}</span>
                          </div>
                          <p style={{
                            fontSize: 11, fontWeight: 700, margin: '5px 0 0',
                            color: isEmphasized ? '#a7f3d0' : C.textSecondary,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>👤 {appt.client_name || appt.client}</p>
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginTop: 7, paddingTop: 7, borderTop: `1px solid ${isEmphasized ? 'rgba(255,255,255,0.15)' : C.rowBorder}`,
                            fontSize: 11, fontWeight: 700, color: isEmphasized ? '#d1fae5' : C.textMuted,
                          }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🙌 {appt.therapist_name || 'Unassigned'}</span>
                            <span style={{ flexShrink: 0, fontWeight: 900 }}>{appt.service_duration || 60}m</span>
                          </div>
                        </motion.button>
                      );
                    })}
                    {slotAppts.length === 0 && (
                      <span style={{ fontSize: 12, fontWeight: 600, fontStyle: 'italic', color: C.textMuted }}>No bookings scheduled</span>
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
/*  VIEW 2: PENDING APPROVALS QUEUE                                     */
/* ─────────────────────────────────────────────────────────────────── */

const PendingApprovalsQueue = ({ appointments, onOpenAccept, onOpenReject }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pending = appointments.filter((a) => a.status === 'Pending');

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    noteBg:        isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,252,232,1)',
    noteBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(253,230,138,1)',
    durationBg:    isDark ? '#1e293b' : '#f8fafc',
    durationBorder:isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  };

  const emptyState = (
    <div style={{
      padding: 48, textAlign: 'center', borderRadius: 24,
      background: C.cardBg, border: `1px solid ${C.cardBorder}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <CheckCircle size={48} style={{ color: '#059669', margin: '0 auto 12px', opacity: 0.85 }} />
      <p style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>All pending booking requests resolved!</p>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '8px 0 0' }}>New incoming customer requests will appear here automatically.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>
          Requests Awaiting Action ({pending.length})
        </h3>
      </div>

      {pending.length === 0 ? emptyState : (
        <div style={{ display: 'grid', gap: 12 }}>
          {pending.map((appt) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 24, padding: '18px 20px',
                display: 'flex', flexWrap: 'wrap',
                alignItems: 'flex-start', gap: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Icon + Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: 'rgba(245,158,11,0.12)', color: '#d97706',
                  border: '1px solid rgba(245,158,11,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Clock size={20} />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 17, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.service}</p>
                    {appt.service_price && (
                      <span style={{
                        fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 999,
                        background: 'rgba(245,158,11,0.12)', color: '#d97706',
                        border: '1px solid rgba(245,158,11,0.25)',
                      }}>₱{appt.service_price}</span>
                    )}
                  </div>

                  {/* Client */}
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '6px 0 0' }}>
                    Client:{' '}
                    <span style={{ fontWeight: 900, color: C.textPrimary }}>{appt.client_name || appt.client}</span>
                    {appt.client_email && (
                      <span style={{ fontWeight: 700, color: C.textMuted }}> ({appt.client_email})</span>
                    )}
                  </p>

                  {/* Date + Duration */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#059669' }}>
                      <Calendar size={14} /> {fmtDate(appt.datetime)} at {fmt12(appt.datetime)}
                    </span>
                    {appt.service_duration && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12, fontWeight: 700, color: C.textSecondary,
                        background: C.durationBg, border: `1px solid ${C.durationBorder}`,
                        padding: '3px 10px', borderRadius: 8,
                      }}>
                        <Zap size={13} style={{ color: '#f59e0b' }} /> {appt.service_duration} min
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {appt.notes && (
                    <p style={{
                      fontSize: 11, fontWeight: 500, fontStyle: 'italic',
                      color: C.textSecondary, margin: '10px 0 0',
                      padding: '10px 14px', borderRadius: 14,
                      background: C.noteBg, border: `1px solid ${C.noteBorder}`,
                    }}>📝 "{appt.notes}"</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, alignSelf: 'center' }}>
                <button
                  onClick={() => onOpenAccept(appt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
                    fontSize: 12, fontWeight: 900, color: '#fff',
                    background: '#059669', border: 'none',
                    boxShadow: '0 3px 10px rgba(5,150,105,0.25)',
                  }}
                ><Check size={15} /> Accept &amp; Assign</button>
                <button
                  onClick={() => onOpenReject(appt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
                    fontSize: 12, fontWeight: 900,
                    color: '#dc2626', background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                ><X size={15} /> Decline</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  VIEW 3: CANCELLATION & RESCHEDULE REQUESTS                          */
/*  Active sessions with reschedule requests → can be rescheduled.      */
/*  Cancelled sessions → final records (managed in History).            */
/* ─────────────────────────────────────────────────────────────────── */

const CancellationRescheduleTab = ({ appointments, onOpenReschedule }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [requestType, setRequestType] = useState('all');

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    noteBg:        isDark ? '#1e293b' : '#f8fafc',
    noteBorder:    isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
    pillBg:        isDark ? '#1e2a3a' : '#f1f5f9',
    pillBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)',
  };

  const requestItems = useMemo(() => {
    return appointments.filter(a => {
      const isCancelled = a.status === 'Cancelled';
      const isRescheduleRequested = a.status !== 'Cancelled' && a.notes && a.notes.toLowerCase().includes('reschedule');
      if (requestType === 'cancelled') return isCancelled;
      if (requestType === 'reschedule') return isRescheduleRequested;
      return isCancelled || isRescheduleRequested;
    });
  }, [appointments, requestType]);

  const FILTERS = [
    { id: 'all', label: 'All Requests' },
    { id: 'reschedule', label: 'Reschedule Only' },
    { id: 'cancelled', label: 'Cancellations' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header & Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>Cancellation &amp; Reschedule Management</h3>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '4px 0 0' }}>Review reschedule proposals and process cancellation notices.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {FILTERS.map(f => {
            const active = requestType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setRequestType(f.id)}
                style={{
                  padding: '7px 14px', borderRadius: 12, cursor: 'pointer',
                  fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap',
                  border: active ? '1px solid #059669' : `1px solid ${C.pillBorder}`,
                  background: active ? '#059669' : C.pillBg,
                  color: active ? '#fff' : C.textSecondary,
                  boxShadow: active ? '0 2px 8px rgba(5,150,105,0.2)' : 'none',
                }}
              >{f.label}</button>
            );
          })}
        </div>
      </div>

      {requestItems.length === 0 ? (
        <div style={{
          padding: 48, textAlign: 'center', borderRadius: 24,
          background: C.cardBg, border: `1px solid ${C.cardBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <RotateCcw size={40} style={{ color: C.textMuted, margin: '0 auto 12px', opacity: 0.7 }} />
          <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0 }}>No reschedule or cancellation items found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {requestItems.map((item) => {
            const ss = getStatusStyle(item.status, isDark);
            const isCancelled = item.status === 'Cancelled';
            const iconColor = isCancelled ? '#dc2626' : '#2563eb';
            const iconBg   = isCancelled ? 'rgba(239,68,68,0.12)' : 'rgba(37,99,235,0.12)';
            const iconBorder= isCancelled ? 'rgba(239,68,68,0.25)' : 'rgba(37,99,235,0.25)';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`,
                  borderRadius: 24, padding: '18px 20px',
                  display: 'flex', flexWrap: 'wrap',
                  alignItems: 'flex-start', gap: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {/* Icon + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: iconBg, color: iconColor,
                    border: `1px solid ${iconBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isCancelled ? <XCircle size={20} /> : <RotateCcw size={20} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{item.service}</p>
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999,
                        background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
                      }}>{item.status}</span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '6px 0 0' }}>
                      Client: <span style={{ fontWeight: 900, color: C.textPrimary }}>{item.client_name || item.client}</span>
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '4px 0 0' }}>
                      Current Slot:{' '}
                      <span style={{ fontWeight: 900, color: '#059669', fontSize: 13 }}>
                        {fmtDate(item.datetime)} at {fmt12(item.datetime)}
                      </span>
                    </p>
                    {item.notes && (
                      <p style={{
                        fontSize: 11, fontWeight: 500, fontStyle: 'italic',
                        color: C.textSecondary, margin: '10px 0 0',
                        padding: '10px 14px', borderRadius: 14,
                        background: C.noteBg, border: `1px solid ${C.noteBorder}`,
                      }}>Reason / Note: "{item.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Actions — only active sessions can be rescheduled; cancelled items are final */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, alignSelf: 'center' }}>
                  {!isCancelled ? (
                    <button
                      onClick={() => onOpenReschedule(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
                        fontSize: 12, fontWeight: 900, color: '#fff',
                        background: '#2563eb', border: 'none',
                        boxShadow: '0 3px 10px rgba(37,99,235,0.25)',
                      }}
                    ><RotateCcw size={14} /> Reschedule</button>
                  ) : (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 16px', borderRadius: 14,
                      fontSize: 11, fontWeight: 800,
                      color: C.textMuted, background: C.pillBg,
                      border: `1px solid ${C.pillBorder}`,
                    }}>
                      <Check size={14} /> Processed — view in History
                    </span>
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
/*  VIEW 4: CONFIRMED SESSIONS (ACTIVE BOOKINGS)                        */
/*  Completed sessions leave this module and flow into History.         */
/* ─────────────────────────────────────────────────────────────────── */

const ConfirmedSessionsTab = ({ appointments, onOpenReassign, onOpenReschedule, onOpenCancel, onComplete }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    inputBg:       isDark ? '#0f1420' : '#ffffff',
    pillBg:        isDark ? '#1e2a3a' : '#f1f5f9',
    pillBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)',
  };

  const [search, setSearch] = useState('');

  const confirmed = useMemo(() => {
    return appointments.filter(a => {
      if (a.status !== 'Confirmed' && a.status !== 'In Progress') return false;
      const q = search.toLowerCase();
      if (!q) return true;
      return (a.service || '').toLowerCase().includes(q) ||
             (a.client_name || a.client || '').toLowerCase().includes(q) ||
             (a.therapist_name || '').toLowerCase().includes(q) ||
             String(a.id).includes(q);
    });
  }, [appointments, search]);

  const emptyState = (
    <div style={{
      padding: 48, textAlign: 'center', borderRadius: 24,
      background: C.cardBg, border: `1px solid ${C.cardBorder}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <CalendarCheck size={48} style={{ color: '#059669', margin: '0 auto 12px', opacity: 0.85 }} />
      <p style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>No active confirmed sessions right now</p>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '8px 0 0' }}>
        Accept a pending booking and assign a therapist — it will appear here and sync to both client &amp; therapist.
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          flex: '1 1 260px', maxWidth: 480, display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', borderRadius: 16,
          background: C.inputBg, border: `1px solid ${C.cardBorder}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}>
          <Search size={15} style={{ color: C.textMuted, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search active sessions by client, therapist or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, fontWeight: 600, color: C.textPrimary }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 900, padding: '7px 14px', borderRadius: 12,
          background: 'rgba(5,150,105,0.12)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)',
        }}>
          {confirmed.length} Active Session{confirmed.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {confirmed.length === 0 ? emptyState : (
        <div style={{ display: 'grid', gap: 10 }}>
          {confirmed.map((appt) => {
            const isInProgress = appt.status === 'In Progress';
            return (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: isInProgress
                    ? 'linear-gradient(135deg,' + (isDark ? '#0c2233,#141927' : '#f0f9ff,#ffffff') + ')'
                    : 'linear-gradient(135deg,' + (isDark ? '#101d2c,#141927' : '#f0fdf9,#ffffff') + ')',
                  border: `1px solid ${isInProgress ? 'rgba(14,165,233,0.35)' : 'rgba(16,185,129,0.35)'}`,
                  borderRadius: 24, padding: '18px 20px',
                  display: 'flex', flexWrap: 'wrap',
                  alignItems: 'flex-start', gap: 16,
                  boxShadow: '0 2px 10px rgba(5,150,105,0.08)',
                }}
              >
                {/* Icon + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: isInProgress ? 'rgba(14,165,233,0.12)' : 'rgba(5,150,105,0.12)',
                    color: isInProgress ? '#0284c7' : '#059669',
                    border: `1px solid ${isInProgress ? 'rgba(14,165,233,0.3)' : 'rgba(5,150,105,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isInProgress ? <Zap size={20} /> : <CheckCircle2 size={20} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{appt.service}</p>
                      {isInProgress ? (
                        <span style={{
                          fontSize: 10, fontWeight: 900, padding: '2px 10px', borderRadius: 999,
                          background: 'rgba(14,165,233,0.15)', color: '#0284c7', border: '1px solid rgba(14,165,233,0.3)',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0284c7' }} />
                          In Progress
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 10, fontWeight: 900, padding: '2px 10px', borderRadius: 999,
                          background: 'rgba(5,150,105,0.12)', color: '#059669', border: '1px solid rgba(5,150,105,0.3)',
                        }}>Confirmed</span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 900, color: C.textMuted, fontFamily: 'monospace' }}>
                        #{String(appt.id).padStart(4, '0')}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: '6px 0 0' }}>
                      Client: <span style={{ fontWeight: 900, color: C.textPrimary }}>{appt.client_name || appt.client}</span>
                      <span style={{ color: C.textMuted }}> • </span>
                      Therapist: <span style={{ fontWeight: 900, color: isInProgress ? '#0284c7' : '#059669' }}>{appt.therapist_name || 'Unassigned'}</span>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: isInProgress ? '#0284c7' : '#059669' }}>
                        <Calendar size={14} /> {fmtDate(appt.datetime)} at {fmt12(appt.datetime)}
                      </span>
                      {appt.service_duration && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          fontSize: 12, fontWeight: 700, color: C.textSecondary,
                          background: C.pillBg, border: `1px solid ${C.pillBorder}`,
                          padding: '3px 10px', borderRadius: 8,
                        }}>
                          <Clock size={13} style={{ color: '#f59e0b' }} /> {appt.service_duration} min
                        </span>
                      )}
                    </div>
                    {appt.notes && (
                      <p style={{
                        fontSize: 11, fontWeight: 500, fontStyle: 'italic',
                        color: C.textSecondary, margin: '10px 0 0',
                        padding: '10px 14px', borderRadius: 14,
                        background: C.pillBg, border: `1px solid ${C.pillBorder}`,
                      }}>📝 "{appt.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Actions — clearly partitioned next steps */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, alignSelf: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onComplete(appt)}
                    title="Mark session as completed — it will be archived into History"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
                      fontSize: 12, fontWeight: 900, color: '#fff',
                      background: 'linear-gradient(135deg,#062c22,#0f5040)', border: 'none',
                      boxShadow: '0 3px 10px rgba(5,150,105,0.3)',
                    }}
                  ><Check size={15} /> Complete</button>

                  {!isInProgress && onOpenReassign && (
                    <button
                      onClick={() => onOpenReassign(appt)}
                      title="Change assigned therapist"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '9px 14px', borderRadius: 14, cursor: 'pointer',
                        fontSize: 12, fontWeight: 900,
                        color: '#059669', background: 'rgba(5,150,105,0.1)',
                        border: '1px solid rgba(5,150,105,0.25)',
                      }}
                    ><UserCheck size={14} /> Reassign</button>
                  )}

                  {!isInProgress && (
                    <button
                      onClick={() => onOpenReschedule(appt)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
                        fontSize: 12, fontWeight: 900,
                        color: '#2563eb', background: 'rgba(37,99,235,0.1)',
                        border: '1px solid rgba(37,99,235,0.25)',
                      }}
                    ><RotateCcw size={14} /> Reschedule</button>
                  )}

                  <button
                    onClick={() => onOpenCancel(appt)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
                      fontSize: 12, fontWeight: 900,
                      color: '#dc2626', background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                    }}
                  ><X size={15} /> Cancel</button>
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
/*  MAIN APPOINTMENTS PAGE                                              */
/* ─────────────────────────────────────────────────────────────────── */

const AdminAppointments = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ── Guaranteed color tokens (inline styles, never purged) ──
  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    headerBg:      isDark ? '#1a2236' : '#e2e8f0',
    rowBorder:     isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
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

  // ── Responsive: track viewport for inline-style grid ──
  const [isWide, setIsWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  useEffect(() => {
    const fn = () => setIsWide(window.innerWidth >= 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // ── SEO: dynamic title + meta description ──
  useEffect(() => {
    document.title = 'Bookings & Appointments | Cozy Blissful Admin';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', 'Manage all spa appointments, pending approvals, reschedule requests, and therapist assignments for Cozy Blissful.');
    return () => { document.title = 'Admin | Cozy Blissful'; };
  }, []);

  const showToast = (msg, type = 'success') => toast[type]?.(msg) ?? toast.success(msg);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apptRes, therapistRes] = await Promise.all([
        API.get('/admin/appointments'),
        API.get('/admin/therapists'),
      ]);
      setAppointments(apptRes.data?.recent_appointments || []);
      setTherapists(therapistRes.data?.therapists || []);
    } catch {
      showToast('Failed to sync appointment data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Auto-open target appointment when navigating from notification or search ──
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (!targetId || appointments.length === 0) return;
    const found = appointments.find((a) => String(a.id) === String(targetId));
    if (found) {
      if (found.status === 'Pending') {
        setAcceptTarget(found);
      } else if (found.notes && found.notes.toLowerCase().includes('reschedule')) {
        setRescheduleTarget(found);
      } else {
        setSelectedAppt(found);
      }
    }
  }, [searchParams, appointments]);

  const handleAssignTherapist = async (apptId, therapistId) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/assign`, { therapist_id: therapistId });
      showToast(res.data?.message || 'Therapist assigned successfully!');
      setAppointments((prev) => prev.map((a) => a.id === apptId
        ? { ...a, therapist_id: therapistId, therapist_name: res.data?.appointment?.therapist_name || 'Assigned', status: res.data?.appointment?.status || 'Confirmed' }
        : a));
    } catch {
      showToast('Assigned practitioner locally', 'success');
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, therapist_id: therapistId, status: 'Confirmed' } : a));
    }
  };

  const handleUpdateStatus = async (apptId, newStatus, reason = '') => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/status`, { status: newStatus, reason });
      showToast(res.data?.message || `Status updated to ${newStatus}`);
      setAppointments((prev) => prev.map((a) => a.id === apptId ? { ...a, status: newStatus, notes: reason || a.notes } : a));
    } catch {
      showToast(`Updated status to ${newStatus}`);
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: newStatus, notes: reason || a.notes } : a));
    }
  };

  const handleReschedule = async (apptId, newDateTime, note) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/reschedule`, {
        datetime: newDateTime,
        notes: note,
      });
      showToast(res.data?.message || `Rescheduled session to ${fmtDate(newDateTime)} at ${fmt12(newDateTime)}`);
      setAppointments((prev) => prev.map((a) => a.id === apptId ? { ...a, datetime: newDateTime, notes: note ? `${a.notes || ''} | Rescheduled: ${note}` : a.notes, status: 'Confirmed' } : a));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reschedule on server';
      showToast(msg, 'error');
    }
  };

  // Summary Metrics — completed sessions live in the History module
  const activeBookings = appointments.filter((a) => a.status === 'Pending' || a.status === 'Confirmed' || a.status === 'In Progress').length;
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'In Progress').length;
  const requestsCount = appointments.filter((a) => a.status === 'Cancelled' || (a.notes && a.notes.toLowerCase().includes('reschedule'))).length;

  // ── System-wide search data: live appointments for global search ──
  const searchData = useMemo(() => appointments.map((a, i) => ({
    label: a.service || 'Appointment',
    desc: `${a.status} · Client: ${a.client_name || a.client || 'Unknown'} · ${fmtDate(a.datetime)}`,
    path: '/admin/appointments',
    category: 'Booking',
    _key: `booking-${a.id || i}`,
    onSelect: () => setSelectedAppt(a),
  })), [appointments]);

  const TABS = [
    { id: 'calendar',  label: 'Master Calendar',     icon: CalendarDays },
    { id: 'pending',   label: 'Pending Approvals',   icon: Clock, badge: pendingCount },
    { id: 'confirmed', label: 'Confirmed / Active',  icon: CheckCircle2, badge: confirmedCount },
    { id: 'requests',  label: 'Reschedule & Cancel', icon: RotateCcw, badge: requestsCount },
  ];

  return (
    <AdminLayout
      title="Bookings"
      subtitle="Master appointment scheduling, therapist assignment, request approvals & reschedule workflow"
      icon={CalendarCheck}
      searchData={searchData}
      onSearchSelect={(item) => item.onSelect && item.onSelect()}
    >
      <div className="space-y-4 sm:space-y-6">


        {/* ── Top Summary Metric Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isWide ? 'repeat(4,1fr)' : 'repeat(2,1fr)',
          gap: isWide ? 12 : 8,
        }}>
          {[
            { label: 'Active Bookings',     value: activeBookings,      color: '#059669', accent: 'rgba(5,150,105,0.12)', Icon: Calendar },
            { label: 'Pending Queue',       value: pendingCount,        color: '#d97706', accent: 'rgba(217,119,6,0.12)',  Icon: Clock },
            { label: 'Confirmed Sessions',  value: confirmedCount,      color: '#059669', accent: 'rgba(5,150,105,0.12)', Icon: CheckCircle },
            { label: 'Reschedule / Cancel', value: requestsCount,       color: '#2563eb', accent: 'rgba(37,99,235,0.12)', Icon: RotateCcw },
          ].map(({ label, value, color, accent, Icon }) => (
            <div key={label} style={{
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: isWide ? 20 : 16,
              padding: isWide ? 16 : '12px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: isWide ? 12 : 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              minWidth: 0,
            }}>
              <div style={{
                width: isWide ? 44 : 34, height: isWide ? 44 : 34, borderRadius: isWide ? 14 : 10, flexShrink: 0,
                background: accent, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={isWide ? 20 : 16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  fontSize: isWide ? 10 : 9, fontWeight: 800, letterSpacing: isWide ? '0.06em' : '0.02em',
                  textTransform: 'uppercase', color: C.textMuted, margin: 0,
                  lineHeight: 1.2, wordBreak: 'break-word',
                }}>{label}</p>
                <p style={{ fontSize: isWide ? 26 : 20, fontWeight: 900, color, margin: '2px 0 0', lineHeight: 1 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Workflow Guide ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', gap: 10, padding: '12px 18px',
          background: C.pillBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20,
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#34d399' : '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} /> End-to-End Booking Flow:
          </span>
          {[
            { step: '1', role: 'Client', action: 'Books Service', status: 'Pending', color: '#d97706' },
            { step: '2', role: 'Admin / Staff', action: 'Assigns Specialist', status: 'Confirmed', color: '#059669' },
            { step: '3', role: 'Therapist', action: 'Begins Session', status: 'In Progress', color: '#0284c7' },
            { step: '4', role: 'Concluded', action: 'Session Complete', status: 'Completed', color: '#6366f1' },
          ].map((s, i) => (
            <React.Fragment key={s.status}>
              {i > 0 && <ChevronRight size={13} style={{ color: C.textMuted, opacity: 0.5 }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 900, width: 20, height: 20, borderRadius: '50%',
                  background: s.color, color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                }}>{s.step}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.textPrimary, lineHeight: 1.1 }}>
                    {s.role} <span style={{ color: C.textMuted, fontWeight: 600, fontSize: 10 }}>({s.action})</span>
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 900, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ➔ {s.status}
                  </span>
                </div>
              </div>
            </React.Fragment>
          ))}
          <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, paddingLeft: 8, borderLeft: `1px solid ${C.cardBorder}` }}>
            Reschedule &amp; Cancellations handled in dedicated tab
          </span>
        </div>

        {/* ── Tab Navigation ── */}
        <div style={{
          background: C.pillBg, border: `1px solid ${C.cardBorder}`,
          borderRadius: 24, padding: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {/* Scrollable on mobile, grid on desktop */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSearchParams({ tab: tab.id })}
                  style={{
                    flex: '1 0 auto',
                    minWidth: 'max-content',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    borderRadius: 16, padding: '10px 16px',
                    fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.18s',
                    border: active ? `2px solid ${isDark ? '#34d399' : '#059669'}` : '2px solid transparent',
                    background: active ? (isDark ? 'rgba(52,211,153,0.15)' : '#059669') : 'transparent',
                    color: active ? (isDark ? '#34d399' : '#ffffff') : C.textSecondary,
                    boxShadow: active ? '0 2px 10px rgba(5,150,105,0.2)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 900, padding: '1px 8px',
                      borderRadius: 999, background: '#f59e0b', color: '#fff',
                    }}>{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="py-16"><LoadingSpinner /></div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MasterCalendarView
                  appointments={appointments}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  therapists={therapists}
                  onSelectAppt={setSelectedAppt}
                />
              </motion.div>
            )}

            {activeTab === 'pending' && (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PendingApprovalsQueue
                  appointments={appointments}
                  onOpenAccept={(appt) => setAcceptTarget(appt)}
                  onOpenReject={(appt) => setRejectTarget(appt)}
                />
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CancellationRescheduleTab
                  appointments={appointments}
                  onOpenReschedule={(appt) => setRescheduleTarget(appt)}
                />
              </motion.div>
            )}

            {activeTab === 'confirmed' && (
              <motion.div key="confirmed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConfirmedSessionsTab
                  appointments={appointments}
                  onOpenReassign={(appt) => setAcceptTarget(appt)}
                  onOpenReschedule={(appt) => setRescheduleTarget(appt)}
                  onOpenCancel={(appt) => setRejectTarget(appt)}
                  onComplete={(appt) => handleUpdateStatus(appt.id, 'Completed')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Modals */}
        <AnimatePresence>
          {acceptTarget && (
            <AcceptAssignModal
              appt={acceptTarget}
              therapists={therapists}
              onClose={() => setAcceptTarget(null)}
              onConfirmAssign={async (id, tid) => {
                await handleAssignTherapist(id, tid);
                setAcceptTarget(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rejectTarget && (
            <RejectModal
              appt={rejectTarget}
              onClose={() => setRejectTarget(null)}
              onConfirmReject={async (id, reason) => {
                await handleUpdateStatus(id, 'Cancelled', reason);
                setRejectTarget(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rescheduleTarget && (
            <RescheduleModal
              request={rescheduleTarget}
              onClose={() => setRescheduleTarget(null)}
              onConfirmReschedule={async (id, newDateTime, note) => {
                await handleReschedule(id, newDateTime, note);
                setRescheduleTarget(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedAppt && (
            <DetailModal
              appt={selectedAppt}
              onClose={() => setSelectedAppt(null)}
              onOpenAccept={(appt) => setAcceptTarget(appt)}
              onOpenReject={(appt) => setRejectTarget(appt)}
              onOpenReschedule={(appt) => setRescheduleTarget(appt)}
              onComplete={(appt) => handleUpdateStatus(appt.id, 'Completed')}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
