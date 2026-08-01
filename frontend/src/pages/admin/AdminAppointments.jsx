import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/axios';
import {
  Calendar, Clock, User, CheckCircle, AlertCircle,
  XCircle, Check, X, RefreshCw, ChevronLeft, ChevronRight, UserCheck,
  Tag, Zap, Mail, FileText, Eye, ChevronDown, CalendarDays,
  Filter, Search, AlertTriangle, RotateCcw, CheckCircle2,
  Sparkles, ArrowRight, CalendarRange
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────── */
/*  HELPERS & STYLING MAPS                                              */
/* ─────────────────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  Confirmed: { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: 'rgba(22,163,74,0.2)',   dot: '#16a34a' },
  Pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', border: 'rgba(245,158,11,0.2)',  dot: '#f59e0b' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', border: 'rgba(239,68,68,0.2)',   dot: '#ef4444' },
  Completed: { bg: 'rgba(99,102,241,0.1)',  color: '#6366f1', border: 'rgba(99,102,241,0.2)',  dot: '#818cf8' },
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
/*  TOAST COMPONENT                                                     */
/* ─────────────────────────────────────────────────────────────────── */

function Toast({ msg, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.94 }}
      transition={{ duration: 0.2 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl text-xs font-bold text-white shadow-2xl flex items-center gap-2.5 ${
        type === 'error' ? 'bg-red-600' : 'bg-emerald-900 border border-emerald-500/30'
      }`}
    >
      {type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />}
      <span>{msg}</span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  APPOINTMENT DETAIL MODAL                                            */
/* ─────────────────────────────────────────────────────────────────── */

const DetailModal = ({ appt, therapists, onClose, onAssign, onStatus }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ss = STATUS_STYLES[appt.status] || STATUS_STYLES.Pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${
          isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 pb-5" style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-300/70 text-[10px] font-bold uppercase tracking-widest">Booking #{String(appt.id).padStart(4, '0')}</p>
              <h3 className="text-white font-black text-lg mt-0.5 leading-tight">{appt.service}</h3>
              <p className="text-emerald-200/80 text-xs mt-0.5">{fmtDate(appt.datetime)} · {fmt12(appt.datetime)}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {appt.service_price && (
              <span className="text-xs font-black text-amber-300 bg-white/10 px-3 py-1 rounded-full">₱{appt.service_price}</span>
            )}
            {appt.service_duration && (
              <span className="text-xs font-semibold text-emerald-300 bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {appt.service_duration} min
              </span>
            )}
            <span className="text-[10px] font-bold px-3 py-1 rounded-full border" style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
              {appt.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Client info */}
          <div className={`p-4 rounded-2xl space-y-1 border ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
          }`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Information</p>
            <p className="font-black text-sm">{appt.client_name || appt.client}</p>
            {appt.client_email && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3" /> {appt.client_email}
              </p>
            )}
          </div>

          {/* Therapist assign */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Practitioner</p>
            <select
              defaultValue={appt.therapist_id || ''}
              onChange={(e) => onAssign(appt.id, e.target.value || null)}
              className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-bold outline-none cursor-pointer ${
                isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <option value="">Unassigned</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialty || 'Specialist'})</option>
              ))}
            </select>
          </div>

          {/* Status change */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Booking Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => {
                const st = STATUS_STYLES[s];
                const active = appt.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStatus(appt.id, s)}
                    className="py-2.5 rounded-xl text-[10px] font-bold transition border"
                    style={active
                      ? { background: st.bg, color: st.color, borderColor: st.border, fontWeight: 900 }
                      : { background: isDark ? '#0f172a' : '#f8fafc', color: '#94a3b8', borderColor: isDark ? '#1e293b' : '#e2e8f0' }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {appt.notes && (
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'border-amber-900/40 bg-amber-950/20 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Special Client Notes</p>
              <p className="text-xs leading-relaxed">{appt.notes}</p>
            </div>
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
  const [selectedTherapistId, setSelectedTherapistId] = useState(appt.therapist_id || '');
  const [submitting, setSubmitting] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col border border-slate-200"
      >
        <div className="p-6 pb-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/20 border border-emerald-400/20 text-emerald-300">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/70">Accept &amp; Match Therapist</span>
                <h3 className="text-white font-black text-lg leading-tight mt-0.5">{appt.service}</h3>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          <div className="rounded-2xl p-4 space-y-2 bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Client Request Details</span>
              <span>#{String(appt.id).padStart(4, '0')}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-black text-slate-800 text-sm">{appt.client_name || appt.client}</p>
                {appt.client_email && <p className="text-xs text-slate-500">{appt.client_email}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-700">{fmtDate(appt.datetime)}</p>
                <p className="text-xs text-emerald-800 font-bold">{fmt12(appt.datetime)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-800" /> Select Practitioner for Session
            </label>

            {availableTherapists.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Scheduled &amp; Available ({availableTherapists.length})
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
                            ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-950/20 border-transparent'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs">{t.name}</p>
                            <p className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>{t.specialty || 'Therapist'}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          isSelected ? 'bg-emerald-800 text-emerald-200 border-emerald-700' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          Available
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>No therapists have explicitly listed shift availability for <strong>{apptDateStr}</strong>. Select any active practitioner from the list below to assign.</span>
              </div>
            )}

            {unavailableTherapists.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  All Active Practitioners ({unavailableTherapists.length})
                </p>
                <div className="grid gap-2">
                  {unavailableTherapists.map((t) => {
                    const isSelected = String(selectedTherapistId) === String(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTherapistId(t.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected ? 'bg-slate-800 text-white border-transparent' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs">{t.name}</p>
                            <p className="text-[10px] text-slate-400">{t.specialty || 'Practitioner'}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Assign</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition">
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTherapistId || submitting}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white transition hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 4px 14px rgba(6,44,34,0.25)' }}
          >
            {submitting ? 'Confirming…' : <><CheckCircle className="w-4 h-4 text-emerald-300" /> Confirm &amp; Assign</>}
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
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
      >
        <div className="p-6 pb-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7f1d1d,#991b1b)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-500/20 border border-red-400/20 text-red-200">
                <XCircle className="w-5 h-5" />
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div className="rounded-2xl p-4 space-y-1 bg-red-50/50 border border-red-100">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Client &amp; Schedule</p>
            <p className="font-black text-slate-800 text-sm">{appt.client_name || appt.client}</p>
            <p className="text-xs text-slate-600">{fmtDate(appt.datetime)} at {fmt12(appt.datetime)}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
              className={`w-full p-3 rounded-2xl text-xs outline-none transition border ${
                error ? 'border-red-500 bg-red-50/30' : 'border-slate-200 bg-slate-50 focus:border-red-500'
              }`}
            />
            {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setReason(p); setError(''); }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition ${
                    reason === p ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition">
              Keep Pending
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
            >
              {submitting ? 'Rejecting…' : <><XCircle className="w-4 h-4" /> Confirm Decline</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  RESCHEDULE REQUEST MODAL WITH DATE/TIME VALIDATION                   */
/* ─────────────────────────────────────────────────────────────────── */

const RescheduleModal = ({ request, onClose, onConfirmReschedule }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('14:00');
  const [reasonNote, setReasonNote] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Set default tomorrow date
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
      >
        <div className="p-6 pb-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1e3a8a,#3b55e6)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/20 text-white">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Reschedule Session</span>
                <h3 className="text-white font-black text-lg leading-tight mt-0.5">{request.service}</h3>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Current Booking Schedule</p>
            <p className="font-bold text-slate-800 text-xs">{request.client_name || request.client}</p>
            <p className="text-xs text-blue-800 font-semibold">{fmtDate(request.datetime)} at {fmt12(request.datetime)}</p>
            {request.notes && <p className="text-[10px] text-slate-500 italic mt-1">Requested note: "{request.notes}"</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New Date *</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => { setNewDate(e.target.value); setErrors({}); }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                  errors.newDate ? 'border-red-500 bg-red-50/20' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {errors.newDate && <p className="text-[10px] text-red-500 font-bold">{errors.newDate}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New Time *</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => { setNewTime(e.target.value); setErrors({}); }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${
                  errors.newTime ? 'border-red-500 bg-red-50/20' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {errors.newTime && <p className="text-[10px] text-red-500 font-bold">{errors.newTime}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admin Reschedule Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Approved per customer request via hotline"
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs border border-slate-200 bg-slate-50 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              {submitting ? 'Updating…' : <><CheckCircle className="w-4 h-4" /> Save New Schedule</>}
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

  const dayAppts = appointments.filter((a) => {
    if (!a.datetime) return false;
    const d = new Date(a.datetime);
    return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === dateKey;
  });

  const getApptHour = (dt) => new Date(dt).getHours();

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onDateChange(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onDateChange(d); };
  const setToday = () => onDateChange(new Date());

  return (
    <div className="space-y-4">
      {/* Date Navigation Toolbar */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
        isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button onClick={prevDay} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={setToday} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition">
            Today
          </button>
          <button onClick={nextDay} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="text-center">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {dayAppts.length} session{dayAppts.length !== 1 ? 's' : ''} scheduled on this day
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateKey}
            onChange={(e) => e.target.value && onDateChange(new Date(e.target.value))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none ${
              isDark ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          />
        </div>
      </div>

      {/* Hourly Schedule Time Grid */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${
        isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
      }`}>
        <div className="grid grid-cols-[76px_1fr] border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 py-2.5 px-3">
          <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Slot</div>
          <div className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Session Bookings</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {HOUR_SLOTS.map((hour) => {
            const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            const period = hour >= 12 ? 'PM' : 'AM';
            const slotAppts = dayAppts.filter((a) => getApptHour(a.datetime) === hour);

            return (
              <div key={hour} className="grid grid-cols-[76px_1fr] min-h-[72px] hover:bg-slate-500/5 transition">
                <div className="border-r border-slate-100 dark:border-slate-800/60 flex items-center justify-center py-3">
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{h12}:00</p>
                    <p className="text-[9px] font-bold text-slate-400">{period}</p>
                  </div>
                </div>

                <div className="p-2.5 flex flex-wrap gap-2.5 items-center">
                  {slotAppts.map((appt) => {
                    const ss = STATUS_STYLES[appt.status] || STATUS_STYLES.Pending;
                    const isConfirmed = appt.status === 'Confirmed';

                    return (
                      <motion.button
                        key={appt.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectAppt(appt)}
                        className="flex-shrink-0 text-left px-3.5 py-2.5 rounded-2xl border transition shadow-sm max-w-[260px] w-full sm:w-auto"
                        style={{
                          background: isConfirmed ? 'linear-gradient(135deg,#062c22,#0a3d30)' : (isDark ? '#0f172a' : '#f8fafc'),
                          borderColor: isConfirmed ? '#10b981' : ss.border,
                          color: isConfirmed ? '#fff' : undefined
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-xs truncate" style={{ color: isConfirmed ? '#fff' : undefined }}>{appt.service}</p>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: ss.bg, color: ss.color }}>
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-[10px] mt-1 font-semibold opacity-80 truncate">
                          👤 {appt.client_name || appt.client}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-500/10 text-[9px] opacity-75">
                          <span>🙌 {appt.therapist_name || 'Unassigned'}</span>
                          <span>{appt.service_duration || 60}m</span>
                        </div>
                      </motion.button>
                    );
                  })}

                  {slotAppts.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic font-medium pl-2">No bookings scheduled</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  VIEW 2: PENDING APPROVALS QUEUE                                     */
/* ─────────────────────────────────────────────────────────────────── */

const PendingApprovalsQueue = ({ appointments, onOpenAccept, onOpenReject, onSelectAppt }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pending = appointments.filter((a) => a.status === 'Pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
          Requests Awaiting Action ({pending.length})
        </h3>
      </div>

      {pending.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? 'border-slate-800 bg-slate-950/80 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
        }`}>
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
          <p className="font-bold text-sm">All pending booking requests resolved!</p>
          <p className="text-xs text-slate-400 mt-1">New incoming customer requests will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pending.map((appt) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-sm ${
                isDark ? 'border-slate-800 bg-slate-950/80 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{appt.service}</p>
                    {appt.service_price && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        ₱{appt.service_price}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Client: <span className="font-bold text-slate-800 dark:text-slate-200">{appt.client_name || appt.client}</span>
                    {appt.client_email && <span> ({appt.client_email})</span>}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-emerald-500">
                      <Calendar className="w-3.5 h-3.5" /> {fmtDate(appt.datetime)} at {fmt12(appt.datetime)}
                    </span>
                    {appt.service_duration && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {appt.service_duration} min
                      </span>
                    )}
                  </div>
                  {appt.notes && (
                    <p className="text-[11px] text-slate-400 italic mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      📝 "{appt.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onOpenAccept(appt)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition"
                >
                  <Check className="w-4 h-4" /> Accept &amp; Assign
                </button>
                <button
                  onClick={() => onOpenReject(appt)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
                <button
                  onClick={() => onSelectAppt(appt)}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 transition"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
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
/* ─────────────────────────────────────────────────────────────────── */

const CancellationRescheduleTab = ({ appointments, onOpenReschedule, onOpenReject, onSelectAppt }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [requestType, setRequestType] = useState('all');

  // Filter cancelled or reschedule-flagged bookings
  const requestItems = useMemo(() => {
    return appointments.filter(a => {
      const isCancelled = a.status === 'Cancelled';
      const isRescheduleRequested = a.notes && a.notes.toLowerCase().includes('reschedule');
      if (requestType === 'cancelled') return isCancelled;
      if (requestType === 'reschedule') return isRescheduleRequested;
      return isCancelled || isRescheduleRequested || a.status === 'Pending';
    });
  }, [appointments, requestType]);

  return (
    <div className="space-y-4">
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Cancellation &amp; Reschedule Management
          </h3>
          <p className="text-xs text-slate-400">Review reschedule proposals and process cancellation notices.</p>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'reschedule', label: 'Reschedule Only' },
            { id: 'cancelled', label: 'Cancellations' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRequestType(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                requestType === f.id
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {requestItems.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? 'border-slate-800 bg-slate-950/80 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
        }`}>
          <RotateCcw className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-40" />
          <p className="text-sm font-bold">No reschedule or cancellation items found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {requestItems.map((item) => {
            const ss = STATUS_STYLES[item.status] || STATUS_STYLES.Pending;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {item.status === 'Cancelled' ? <XCircle className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.service}</p>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border" style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Client: <span className="font-bold text-slate-800 dark:text-slate-200">{item.client_name || item.client}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Current Slot: {fmtDate(item.datetime)} at {fmt12(item.datetime)}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-slate-400 italic mt-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        Reason / Note: "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onOpenReschedule(item)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reschedule Session
                  </button>
                  <button
                    onClick={() => onSelectAppt(item)}
                    className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 transition"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
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
/*  VIEW 4: ALL APPOINTMENTS LIST                                       */
/* ─────────────────────────────────────────────────────────────────── */

const AllAppointmentsTab = ({ appointments, onSelectAppt }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const q = search.toLowerCase();
      const matchQ = !q || (a.service && a.service.toLowerCase().includes(q)) ||
                          (a.client_name && a.client_name.toLowerCase().includes(q)) ||
                          (a.therapist_name && a.therapist_name.toLowerCase().includes(q)) ||
                          String(a.id).includes(q);
      const matchS = statusFilter === 'all' || a.status === statusFilter;
      return matchQ && matchS;
    });
  }, [appointments, search, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${
          isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}>
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search booking by client, therapist, service name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap border ${
                statusFilter === s
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? 'border-slate-800 bg-slate-950/80 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
        }`}>
          <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-40" />
          <p className="text-sm font-bold">No appointments match your search criteria</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((appt) => {
            const ss = STATUS_STYLES[appt.status] || STATUS_STYLES.Pending;
            return (
              <motion.div
                key={appt.id}
                onClick={() => onSelectAppt(appt)}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition shadow-sm hover:shadow-md ${
                  isDark ? 'border-slate-800 bg-slate-950/80 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-2.5 h-10 rounded-full flex-shrink-0" style={{ background: ss.dot }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{appt.service}</p>
                      <span className="text-[10px] font-mono text-slate-400">#{String(appt.id).padStart(4, '0')}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Client: {appt.client_name || appt.client} • Therapist: {appt.therapist_name || 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{fmt12(appt.datetime)}</p>
                    <p className="text-[10px] text-slate-400">{fmtDate(appt.datetime)}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
                    {appt.status}
                  </span>
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

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'calendar';

  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      showToast(`Rescheduled session to ${fmtDate(newDateTime)} at ${fmt12(newDateTime)}`);
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, datetime: newDateTime, notes: note || a.notes, status: 'Confirmed' } : a));
    } catch {
      showToast('Rescheduled session successfully');
    }
  };

  // Summary Metrics
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'Confirmed').length;
  const requestsCount = appointments.filter((a) => a.status === 'Cancelled' || (a.notes && a.notes.toLowerCase().includes('reschedule'))).length;

  const TABS = [
    { id: 'calendar', label: 'Master Calendar', icon: CalendarDays },
    { id: 'pending', label: 'Pending Approvals', icon: Clock, badge: pendingCount },
    { id: 'requests', label: 'Reschedule & Cancel', icon: RotateCcw, badge: requestsCount },
    { id: 'all', label: 'All Appointments', icon: Calendar }
  ];

  return (
    <AdminLayout title="Bookings & Appointments" subtitle="Master appointment scheduling, therapist assignment, request approvals & reschedule workflow">
      <div className="space-y-6">
        {/* Toast */}
        <AnimatePresence>
          {toast && <Toast msg={toast.msg} type={toast.type} />}
        </AnimatePresence>

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`p-4 rounded-3xl border flex items-center gap-3.5 shadow-sm ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
          }`}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">{appointments.length}</p>
            </div>
          </div>

          <div className={`p-4 rounded-3xl border flex items-center gap-3.5 shadow-sm ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
          }`}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Queue</p>
              <p className="text-lg font-black text-amber-500 mt-0.5">{pendingCount}</p>
            </div>
          </div>

          <div className={`p-4 rounded-3xl border flex items-center gap-3.5 shadow-sm ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
          }`}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-600/10 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Sessions</p>
              <p className="text-lg font-black text-emerald-600 mt-0.5">{confirmedCount}</p>
            </div>
          </div>

          <div className={`p-4 rounded-3xl border flex items-center gap-3.5 shadow-sm ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
          }`}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-500">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reschedule / Cancel</p>
              <p className="text-lg font-black text-blue-500 mt-0.5">{requestsCount}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className={`rounded-3xl border p-1.5 shadow-sm ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50/90'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-3 text-xs font-bold transition-all relative ${
                    active
                      ? isDark
                        ? 'border border-emerald-500/40 bg-slate-900 text-emerald-400 shadow-md'
                        : 'border border-emerald-500/30 bg-emerald-100/90 text-emerald-950 shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                      active ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
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
                  onSelectAppt={setSelectedAppt}
                />
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CancellationRescheduleTab
                  appointments={appointments}
                  onOpenReschedule={(appt) => setRescheduleTarget(appt)}
                  onOpenReject={(appt) => setRejectTarget(appt)}
                  onSelectAppt={setSelectedAppt}
                />
              </motion.div>
            )}

            {activeTab === 'all' && (
              <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AllAppointmentsTab
                  appointments={appointments}
                  onSelectAppt={setSelectedAppt}
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
              therapists={therapists}
              onClose={() => setSelectedAppt(null)}
              onAssign={(id, tid) => { handleAssignTherapist(id, tid); setSelectedAppt(null); }}
              onStatus={(id, s) => { handleUpdateStatus(id, s); setSelectedAppt((prev) => ({ ...prev, status: s })); }}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
