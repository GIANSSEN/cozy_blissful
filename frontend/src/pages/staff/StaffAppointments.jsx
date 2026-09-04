import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import StaffLayout from './StaffLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Clock, UserCheck, Calendar, CheckCircle, AlertCircle,
  Search, RefreshCw, UserPlus, ChevronDown, ChevronUp,
  Tag, Zap, FileText, X, Check, CalendarCheck,
} from 'lucide-react';

// ─── ClayCard ─────────────────────────────────────────────────────────────────

const ClayCard = ({ children, className = '', style = {}, ...props }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`rounded-3xl ${className}`}
      style={{
        background: isDark ? 'linear-gradient(145deg, #182030 0%, #121824 100%)' : 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
        boxShadow: isDark ? '8px 8px 24px rgba(0,0,0,0.4), -4px -4px 16px rgba(255,255,255,0.02)' : '16px 16px 32px #eae6df, -16px -16px 32px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.8)',
        color: isDark ? '#e2e8f3' : '#1e293b',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Confirmed:     { bg: 'rgba(22,163,74,0.12)',  color: '#22c55e', border: 'rgba(22,163,74,0.25)'  },
  'In Progress': { bg: 'rgba(14,165,233,0.12)', color: '#0284c7', border: 'rgba(14,165,233,0.25)' },
  Pending:       { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  Cancelled:     { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
  Completed:     { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
};

const TABS = [
  { id: 'today',    label: "Today's Appointments", icon: Clock },
  { id: 'upcoming', label: 'Upcoming Sessions',     icon: UserCheck },
  { id: 'all',      label: 'All',                   icon: Calendar },
];

// ─── ACCEPT & ASSIGN THERAPIST MODAL ─────────────────────────────────────────

const AcceptAssignModal = ({ appt, therapists, onClose, onConfirmAssign }) => {
  const [selectedTherapistId, setSelectedTherapistId] = useState(appt.therapist_id || '');
  const [submitting, setSubmitting] = useState(false);

  const rawDt = appt.datetime || '';
  const apptDateStr = rawDt ? rawDt.split('T')[0].split(' ')[0] : '';

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
  }, [availableTherapists, selectedTherapistId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTherapistId) return;
    setSubmitting(true);
    await onConfirmAssign(appt.id, selectedTherapistId);
    setSubmitting(false);
    onClose();
  };

  const fmtFullDate = rawDt
    ? new Date(rawDt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const fmtTime = rawDt
    ? new Date(rawDt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col text-slate-800"
        style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', border: '1px solid rgba(255,255,255,0.8)' }}
      >
        <div className="p-6 pb-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/20 border border-emerald-400/20 text-emerald-300">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/70">Accept Booking &amp; Assign</span>
                <h3 className="text-white font-black text-lg leading-tight mt-0.5">{appt.service}</h3>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
          <div className="rounded-2xl p-4 space-y-2.5" style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.1)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested Session</span>
              <span className="text-[10px] font-mono text-slate-400">#{String(appt.id).padStart(5, '0')}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-black text-slate-800 text-sm">{appt.client_name || appt.client}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-bold text-slate-700">{fmtFullDate}</p>
                <p className="text-xs text-emerald-800 font-semibold">{fmtTime} ({appt.service_duration || 60} min)</p>
              </div>
            </div>
            {appt.notes && (
              <p className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded-xl border border-slate-100 mt-1">
                📋 Notes: {appt.notes}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-800" /> Select Therapist for this Session
              </label>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Matched for {apptDateStr}
              </span>
            </div>

            {availableTherapists.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Available on {apptDateStr} Schedule ({availableTherapists.length})
                </p>
                <div className="grid gap-2">
                  {availableTherapists.map((t) => {
                    const isSelected = String(selectedTherapistId) === String(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTherapistId(t.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-950/20 border-transparent scale-[1.01]'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs">{t.name}</p>
                            <p className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>{t.specialty || 'Spa Specialist'}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                          isSelected
                            ? 'bg-emerald-800/80 text-emerald-200 border-emerald-700'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          ✦ On Shift &amp; Available
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>No therapists have set their schedule availability for <strong>{apptDateStr}</strong> in their calendar. You can still select an off-shift therapist below.</span>
              </div>
            )}

            {unavailableTherapists.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-400" /> Other Therapists (Not Scheduled on Date)
                </p>
                <div className="grid gap-2 opacity-80">
                  {unavailableTherapists.map((t) => {
                    const isSelected = String(selectedTherapistId) === String(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTherapistId(t.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 text-white border-transparent'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs">{t.name}</p>
                            <p className="text-[10px] text-slate-400">{t.specialty || 'Therapist'}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                          Off Shift
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-black/5 bg-slate-50/50 flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-500 transition hover:bg-slate-200/60"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTherapistId || submitting}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-2xl text-xs font-black text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 6px 18px rgba(6,44,34,0.25)' }}
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming…</>
            ) : (
              <><CheckCircle className="w-4 h-4 text-emerald-300" /> Confirm &amp; Assign</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── REJECT MODAL ─────────────────────────────────────────────────────────────

const RejectModal = ({ appt, onClose, onConfirmReject }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const presets = [
    'Therapist fully booked for this slot',
    'Outside salon operating hours',
    'Client requested cancellation',
    'Specialist unavailable on requested date',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onConfirmReject(appt.id, reason);
    setSubmitting(false);
    onClose();
  };

  const rawDt = appt.datetime || '';
  const fmtFullDate = rawDt
    ? new Date(rawDt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const fmtTime = rawDt
    ? new Date(rawDt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-left text-slate-800"
        style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', border: '1px solid rgba(255,255,255,0.8)' }}
      >
        <div className="p-6 pb-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7f1d1d,#991b1b)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-red-500/20 border border-red-400/20 text-red-200">
                <X className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-200/70">Reject Booking Request</span>
                <h3 className="text-white font-black text-lg leading-tight mt-0.5">{appt.service}</h3>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-2xl p-4 space-y-1" style={{ background: 'rgba(127,29,29,0.04)', border: '1px solid rgba(127,29,29,0.1)' }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client &amp; Schedule</p>
            <p className="font-black text-slate-800 text-sm">{appt.client_name || appt.client}</p>
            <p className="text-xs text-slate-600">{fmtFullDate} at {fmtTime}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Reason for Rejection / Note
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for declining this appointment request..."
              rows={3}
              className="w-full p-3 rounded-2xl text-xs text-slate-700 outline-none resize-none"
              style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: 'inset 3px 3px 6px #e0dbd3, inset -3px -3px 6px #ffffff' }}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-xl transition-all"
                  style={{ background: reason === p ? '#7f1d1d' : 'rgba(0,0,0,0.05)', color: reason === p ? '#fff' : '#64748b' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-black/5 bg-slate-50/50 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-500 transition hover:bg-slate-200/60"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            Keep Pending
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-2xl text-xs font-black text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 6px 18px rgba(220,38,38,0.25)' }}
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Rejecting…</>
            ) : (
              <><CheckCircle className="w-4 h-4 text-red-200" /> Confirm Rejection</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Appointment Card ─────────────────────────────────────────────────────────

const AppointmentCard = ({ appt, onOpenAccept, onOpenReject, isDark, index }) => {
  const [expanded, setExpanded] = useState(false);
  const ss = STATUS_STYLES[appt.status] || STATUS_STYLES.Pending;

  const dt = new Date(appt.datetime);
  const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isPending = appt.status === 'Pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <ClayCard className="overflow-hidden">
        {/* Main row */}
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Client + service info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#bfa15f,#d4b87a)', boxShadow: '2px 2px 8px rgba(191,161,95,0.25)' }}>
                {appt.client?.charAt(0) || 'C'}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm truncate">{appt.service}</p>
                <p className="text-xs opacity-75 mt-0.5">
                  <span className="font-semibold">{appt.client}</span>
                  {appt.therapist && <span className="opacity-70"> · with {appt.therapist}</span>}
                </p>
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {appt.service_duration && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ background: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)', color: '#f59e0b' }}>
                      <Clock className="w-2.5 h-2.5" /> {appt.service_duration} min
                    </span>
                  )}
                  {appt.service_price && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: isDark ? 'rgba(6,44,34,0.3)' : 'rgba(6,44,34,0.06)', color: isDark ? '#34d399' : '#065f46' }}>
                      ₱{appt.service_price}
                    </span>
                  )}
                  {appt.notes && (
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}>
                      <FileText className="w-2.5 h-2.5" /> Has notes
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {isPending ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAccept(appt)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 4px 12px rgba(6,44,34,0.25)' }}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-300" /> Assign Specialist
                  </button>
                  <button
                    onClick={() => onOpenReject(appt)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 transition-all hover:scale-105 active:scale-95"
                    style={{ background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', border: isDark ? '1px solid rgba(239,68,68,0.25)' : '1px solid #fecaca' }}
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Status badge */}
                  <span
                    className="px-3 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5"
                    style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}
                  >
                    {appt.status === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />}
                    {appt.status}
                  </span>
                </div>
              )}

              {/* Time */}
              <div className="text-right pl-2 hidden sm:block">
                <p className="text-xs font-bold flex items-center gap-1.5 justify-end">
                  <Clock className="w-3.5 h-3.5 opacity-50" /> {timeStr}
                </p>
                <p className="text-[10px] opacity-60 mt-0.5">{dateStr}</p>
              </div>

              {/* Expand toggle */}
              <button
                onClick={() => setExpanded((e) => !e)}
                className="p-1.5 rounded-xl transition"
                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                title={expanded ? 'Collapse' : 'Expand details'}
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5 opacity-50" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded detail section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-5 pb-5 pt-1 border-t"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                <div className="grid sm:grid-cols-3 gap-4 mt-3">
                  {/* Service details */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Service Details</p>
                    <p className="text-xs font-black">{appt.service}</p>
                    <div className="flex items-center gap-2">
                      {appt.service_duration && (
                        <span className="text-[10px] font-semibold flex items-center gap-1 opacity-70">
                          <Clock className="w-3 h-3" /> {appt.service_duration} min
                        </span>
                      )}
                      {appt.service_price && (
                        <span className="text-[10px] font-bold" style={{ color: isDark ? '#34d399' : '#065f46' }}>₱{appt.service_price}</span>
                      )}
                    </div>
                  </div>

                  {/* Appointment timing */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Scheduled</p>
                    <p className="text-xs font-black">{dateStr}</p>
                    <p className="text-xs opacity-70">{timeStr}
                      {appt.service_duration && <span className="ml-1 text-[10px]">→ ~{
                        (() => {
                          const end = new Date(appt.datetime);
                          end.setMinutes(end.getMinutes() + appt.service_duration);
                          return end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        })()
                      }</span>}
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Client Notes</p>
                    {appt.notes
                      ? <p className="text-xs opacity-80 leading-relaxed italic">{appt.notes}</p>
                      : <p className="text-[10px] opacity-40 italic">No special requests</p>}
                  </div>
                </div>

                {/* Quick action row */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenAccept(appt)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-white transition hover:scale-105"
                        style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 2px 8px rgba(6,44,34,0.2)' }}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-300" /> Assign Specialist &amp; Confirm
                      </button>
                      <button
                        onClick={() => onOpenReject(appt)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-red-500 transition hover:scale-105"
                        style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', border: isDark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #fecaca' }}
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onOpenAccept(appt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 transition hover:scale-105"
                      >
                        <UserCheck className="w-3 h-3" /> Reassign Specialist
                      </button>
                      <button
                        onClick={() => onStatus(appt.id, 'In Progress')}
                        disabled={appt.status === 'In Progress' || appt.status === 'Completed' || appt.status === 'Cancelled'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'rgba(14,165,233,0.15)', color: '#0284c7', border: '1px solid rgba(14,165,233,0.25)' }}
                      >
                        <Zap className="w-3 h-3" /> Mark In Progress
                      </button>
                      <button
                        onClick={() => onStatus(appt.id, 'Completed')}
                        disabled={appt.status === 'Completed' || appt.status === 'Cancelled'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                      >
                        <CheckCircle className="w-3 h-3" /> Mark Completed
                      </button>
                      <button
                        onClick={() => onStatus(appt.id, 'Cancelled')}
                        disabled={appt.status === 'Cancelled' || appt.status === 'Completed'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ClayCard>
    </motion.div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const StaffAppointments = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'today';

  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [acceptTarget, setAcceptTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const loadAppointments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const filterMap = { today: 'today', upcoming: 'upcoming', all: 'all' };
      const filter = filterMap[activeTab] || 'today';
      const [apptsRes, thRes] = await Promise.all([
        API.get(`/staff/appointments?filter=${filter}`),
        API.get('/staff/therapists').catch(() => ({ data: { therapists: [] } })),
      ]);
      setAppointments(apptsRes.data.appointments || []);
      setTherapists(thRes.data.therapists || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleAssignTherapist = async (apptId, therapistId) => {
    try {
      const res = await API.post(`/staff/appointments/${apptId}/assign`, { therapist_id: therapistId || null });
      toast.success(res.data.message || 'Therapist assigned and booking confirmed.');
      loadAppointments(true);
    } catch {
      toast.error('Failed to assign therapist.');
    }
  };

  const handleStatusChange = async (apptId, status, reason = '') => {
    try {
      const res = await API.post(`/staff/appointments/${apptId}/status`, { status, reason });
      toast.success(res.data.message || 'Status updated.');
      loadAppointments(true);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.client?.toLowerCase().includes(q) || a.service?.toLowerCase().includes(q) || a.therapist?.toLowerCase().includes(q);
  });

  const countByStatus = (s) => appointments.filter((a) => a.status === s).length;

  return (
    <StaffLayout title="Bookings Overview" subtitle={TABS.find((t) => t.id === activeTab)?.label} icon={CalendarCheck}>
      <div className="space-y-6">



        {/* Tab switcher + Search */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 p-1 rounded-2xl"
            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'linear-gradient(145deg,#eae6df,#f5f0e8)', boxShadow: isDark ? 'none' : 'inset 3px 3px 8px #d5d0c9, inset -3px -3px 8px #ffffff' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id}
                  onClick={() => { setSearchParams({ tab: tab.id }); setSearch(''); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={active
                    ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '4px 4px 10px rgba(6,44,34,0.25)' }
                    : { background: 'transparent', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
            <button onClick={() => loadAppointments(true)} disabled={refreshing}
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'transparent', color: isDark ? '#64748b' : '#94a3b8' }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, service, therapist…"
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#faf9f6', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', color: isDark ? '#e2e8f3' : '#1e293b' }}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',     count: appointments.length,     color: isDark ? '#34d399' : '#062c22' },
            { label: 'Confirmed', count: countByStatus('Confirmed'), color: '#22c55e' },
            { label: 'Pending',   count: countByStatus('Pending'),   color: '#f59e0b' },
            { label: 'Cancelled', count: countByStatus('Cancelled'), color: '#ef4444' },
          ].map((s) => (
            <ClayCard key={s.label} className="p-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.label}</p>
              <span className="text-lg font-black" style={{ color: s.color }}>{s.count}</span>
            </ClayCard>
          ))}
        </div>

        {/* Appointment list */}
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <ClayCard className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-bold text-sm">No appointments found</p>
            <p className="text-xs opacity-60 mt-1">
              {search ? 'Try a different search term.' : activeTab === 'today' ? 'No sessions scheduled for today.' : 'No sessions found.'}
            </p>
          </ClayCard>
        ) : (
          <div className="grid gap-4">
            {filtered.map((appt, i) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                onOpenAccept={(a) => setAcceptTarget(a)}
                onOpenReject={(a) => setRejectTarget(a)}
                isDark={isDark}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Accept & Assign Modal */}
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

        {/* Reject Modal */}
        <AnimatePresence>
          {rejectTarget && (
            <RejectModal
              appt={rejectTarget}
              onClose={() => setRejectTarget(null)}
              onConfirmReject={async (id, reason) => {
                await handleStatusChange(id, 'Cancelled', reason);
                setRejectTarget(null);
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </StaffLayout>
  );
};

export default StaffAppointments;
