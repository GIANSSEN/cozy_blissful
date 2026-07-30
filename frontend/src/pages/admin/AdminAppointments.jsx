import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../api/axios';
import {
  Calendar as CalendarIcon, Clock, User, CheckCircle, AlertCircle,
  XCircle, Check, X, RefreshCw, ChevronLeft, ChevronRight, UserCheck,
  Tag, Zap, Mail, FileText, Eye, ChevronDown,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Confirmed: { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: 'rgba(22,163,74,0.2)',   dot: '#16a34a' },
  Pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', border: 'rgba(245,158,11,0.2)',  dot: '#f59e0b' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', border: 'rgba(239,68,68,0.2)',   dot: '#ef4444' },
  Completed: { bg: 'rgba(99,102,241,0.1)',  color: '#6366f1', border: 'rgba(99,102,241,0.2)',  dot: '#818cf8' },
};

const fmt12 = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Appointment Detail Modal ─────────────────────────────────────────────────

const DetailModal = ({ appt, therapists, onClose, onAssign, onStatus }) => {
  const ss = STATUS_STYLES[appt.status] || STATUS_STYLES.Pending;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300/60 text-[10px] font-bold uppercase tracking-widest">Booking #{String(appt.id).padStart(4, '0')}</p>
              <h3 className="text-white font-black text-lg mt-0.5 leading-tight">{appt.service}</h3>
              <p className="text-emerald-200/70 text-xs mt-0.5">{fmtDate(appt.datetime)} · {fmt12(appt.datetime)}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
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
        <div className="p-6 space-y-4">
          {/* Client info */}
          <div className="p-3.5 rounded-2xl space-y-1" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client</p>
            <p className="font-black text-slate-800 text-sm">{appt.client_name}</p>
            {appt.client_email && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {appt.client_email}</p>
            )}
          </div>

          {/* Therapist assign */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assign Therapist</p>
            <select
              defaultValue={appt.therapist_id || ''}
              onChange={(e) => onAssign(appt.id, e.target.value || null)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
            >
              <option value="">Unassigned</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Status change */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Update Status</p>
            <div className="grid grid-cols-4 gap-2">
              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => {
                const st = STATUS_STYLES[s];
                return (
                  <button key={s} onClick={() => onStatus(appt.id, s)}
                    className="py-2 rounded-xl text-[10px] font-black transition hover:scale-105 border"
                    style={appt.status === s
                      ? { background: st.bg, color: st.color, borderColor: st.border }
                      : { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {appt.notes && (
            <div className="p-3.5 rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Special Requests</p>
              <p className="text-xs text-amber-900 leading-relaxed">{appt.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── CALENDAR TIME GRID ───────────────────────────────────────────────────────

const HOUR_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // 9 AM – 8 PM

const CalendarView = ({ appointments, selectedDate, onDateChange, therapists, onSelectAppt, onAssign, onStatus }) => {
  const dateKey = selectedDate.toISOString().split('T')[0];

  // Filter appointments for selected date
  const dayAppts = appointments.filter((a) => {
    const d = new Date(a.datetime);
    return d.toISOString().split('T')[0] === dateKey;
  });

  const getApptHour = (dt) => new Date(dt).getHours();

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onDateChange(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onDateChange(d); };

  return (
    <div className="space-y-4">
      {/* Date nav */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
        <button onClick={prevDay} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
        <div className="text-center">
          <p className="text-sm font-black text-slate-800">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''} scheduled</p>
        </div>
        <button onClick={nextDay} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
      </div>

      {/* Time Grid */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[72px_1fr] border-b border-slate-100 bg-slate-50/60 py-2.5">
          <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</div>
          <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointments</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {HOUR_SLOTS.map((hour) => {
            const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            const period = hour >= 12 ? 'PM' : 'AM';
            const slotAppts = dayAppts.filter((a) => getApptHour(a.datetime) === hour);

            return (
              <div key={hour} className="grid grid-cols-[72px_1fr] min-h-[68px] hover:bg-slate-50/30 transition">
                {/* Time label */}
                <div className="border-r border-slate-50 flex items-center justify-center py-3">
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-500">{h12}:00</p>
                    <p className="text-[9px] font-semibold text-slate-400">{period}</p>
                  </div>
                </div>

                {/* Appointment chips */}
                <div className="p-2.5 flex flex-wrap gap-2 items-start">
                  {slotAppts.map((appt) => {
                    const ss = STATUS_STYLES[appt.status] || STATUS_STYLES.Pending;
                    return (
                      <button
                        key={appt.id}
                        onClick={() => onSelectAppt(appt)}
                        className="flex-shrink-0 text-left px-3 py-2.5 rounded-2xl border transition hover:scale-[1.02] hover:shadow-md cursor-pointer max-w-[220px]"
                        style={{ background: appt.status === 'Confirmed' ? 'linear-gradient(135deg,#062c22,#0a3d30)' : '#fdfcfa', borderColor: ss.border, boxShadow: appt.status === 'Confirmed' ? '0 4px 10px rgba(6,44,34,0.15)' : '3px 3px 6px #e5decb,-3px -3px 6px #fff' }}
                      >
                        <p className="font-bold text-[11px] leading-tight" style={{ color: appt.status === 'Confirmed' ? '#fff' : '#1e293b' }}>{appt.service}</p>
                        <p className="text-[9px] mt-1 font-semibold" style={{ color: appt.status === 'Confirmed' ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
                          {appt.client_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ss.dot }} />
                          <p className="text-[9px] font-bold" style={{ color: appt.status === 'Confirmed' ? 'rgba(255,255,255,0.55)' : ss.color }}>{appt.status}</p>
                          {appt.service_duration && <span className="text-[9px]" style={{ color: appt.status === 'Confirmed' ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>· {appt.service_duration}min</span>}
                        </div>
                      </button>
                    );
                  })}
                  {slotAppts.length === 0 && (
                    <span className="text-[10px] text-slate-300 italic self-center">No bookings</span>
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

// ─── ACCEPT & ASSIGN THERAPIST MODAL ─────────────────────────────────────────

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

  const fmtFullDate = appt.datetime
    ? new Date(appt.datetime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const fmtTime = appt.datetime
    ? new Date(appt.datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
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
                {appt.client_email && <p className="text-xs text-slate-500">{appt.client_email}</p>}
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

  const fmtFullDate = appt.datetime
    ? new Date(appt.datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const fmtTime = appt.datetime
    ? new Date(appt.datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-left"
        style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', border: '1px solid rgba(255,255,255,0.8)' }}
      >
        <div className="p-6 pb-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7f1d1d,#991b1b)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-red-500/20 border border-red-400/20 text-red-200">
                <XCircle className="w-6 h-6" />
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
              <><XCircle className="w-4 h-4" /> Confirm Rejection</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── PENDING APPROVALS ────────────────────────────────────────────────────────

const PendingTab = ({ appointments, therapists, onOpenAccept, onOpenReject, onSelectAppt }) => {
  const pending = appointments.filter((a) => a.status === 'Pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-800 text-sm">Awaiting Confirmation ({pending.length})</h3>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
          <CheckCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-bold text-slate-700">All caught up!</p>
          <p className="text-xs text-slate-400 mt-1">No pending booking approval requests.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pending.map((appt) => (
            <div key={appt.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Left: Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm">{appt.service}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-bold text-slate-700">{appt.client_name}</span>
                      {appt.client_email && <span className="text-slate-400"> · {appt.client_email}</span>}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {fmtDate(appt.datetime)} at {fmt12(appt.datetime)}
                      </span>
                      {appt.service_price && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">₱{appt.service_price}</span>
                      )}
                      {appt.service_duration && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" /> {appt.service_duration} min
                        </span>
                      )}
                    </div>
                    {appt.notes && (
                      <p className="text-[10px] text-slate-400 italic mt-1.5 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {appt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Clean Accept / Reject actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onOpenAccept(appt)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => onOpenReject(appt)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 transition-all hover:scale-105 active:scale-95"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => onSelectAppt(appt)}
                    className="p-2.5 rounded-2xl text-slate-500 transition hover:scale-105"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ALL APPOINTMENTS LIST ────────────────────────────────────────────────────

const AllTab = ({ appointments, therapists, onSelectAppt, onAssign, onStatus }) => (
  <div className="space-y-4">
    <h3 className="font-black text-slate-800 text-sm">All Appointments ({appointments.length})</h3>
    {appointments.length === 0 ? (
      <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
        <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="font-bold text-slate-700">No appointments found.</p>
      </div>
    ) : (
      <div className="grid gap-3">
        {appointments.map((appt) => {
          const ss = STATUS_STYLES[appt.status] || STATUS_STYLES.Pending;
          return (
            <div key={appt.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition cursor-pointer"
              onClick={() => onSelectAppt(appt)}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: ss.dot }} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{appt.service}</p>
                  <p className="text-xs text-slate-500 truncate">{appt.client_name} · {appt.therapist_name || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-700">{fmt12(appt.datetime)}</p>
                  <p className="text-[10px] text-slate-400">{fmtDate(appt.datetime)}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
                  {appt.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'pending',  label: 'Pending Approvals' },
  { id: 'all',      label: 'All Appointments' },
];

const AdminAppointments = () => {
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

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const loadData = async () => {
    try {
      const [apptRes, therapistRes] = await Promise.all([
        API.get('/admin/appointments'),
        API.get('/admin/therapists'),
      ]);
      setAppointments(apptRes.data.recent_appointments || []);
      setTherapists(therapistRes.data.therapists || []);
    } catch (e) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAssignTherapist = async (apptId, therapistId) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/assign`, { therapist_id: therapistId });
      showToast(res.data.message);
      setAppointments((prev) => prev.map((a) => a.id === apptId
        ? { ...a, therapist_id: therapistId, therapist_name: res.data.appointment.therapist_name, status: res.data.appointment.status }
        : a));
      if (selectedAppt?.id === apptId) setSelectedAppt((prev) => ({ ...prev, therapist_id: therapistId, therapist_name: res.data.appointment.therapist_name, status: res.data.appointment.status }));
    } catch {
      showToast('Failed to assign therapist', 'error');
    }
  };

  const handleUpdateStatus = async (apptId, newStatus, reason = '') => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/status`, { status: newStatus, reason });
      showToast(res.data.message);
      setAppointments((prev) => prev.map((a) => a.id === apptId ? { ...a, status: newStatus, notes: res.data.appointment.notes } : a));
      if (selectedAppt?.id === apptId) setSelectedAppt((prev) => ({ ...prev, status: newStatus, notes: res.data.appointment.notes }));
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;

  return (
    <AdminLayout title="Bookings & Appointments" subtitle={TABS.find((t) => t.id === activeTab)?.label}>
      <div className="space-y-6">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-800'}`}
            >
              <CheckCircle className="w-4 h-4" /> {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={activeTab === tab.id
                ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '0 4px 12px rgba(6,44,34,0.2)' }
                : { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }}
            >
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#fbbf24', color: activeTab === tab.id ? '#fff' : '#78350f' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
          <button onClick={loadData} className="ml-auto p-2.5 rounded-xl border text-slate-500 hover:text-slate-700 transition" style={{ borderColor: '#e2e8f0', background: '#fff' }} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === 'calendar' && (
              <CalendarView
                appointments={appointments}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                therapists={therapists}
                onSelectAppt={setSelectedAppt}
                onAssign={handleAssignTherapist}
                onStatus={handleUpdateStatus}
              />
            )}
            {activeTab === 'pending' && (
              <PendingTab
                appointments={appointments}
                therapists={therapists}
                onOpenAccept={(appt) => setAcceptTarget(appt)}
                onOpenReject={(appt) => setRejectTarget(appt)}
                onSelectAppt={setSelectedAppt}
              />
            )}
            {activeTab === 'all' && (
              <AllTab
                appointments={appointments}
                therapists={therapists}
                onSelectAppt={setSelectedAppt}
                onAssign={handleAssignTherapist}
                onStatus={handleUpdateStatus}
              />
            )}
          </>
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
                await handleUpdateStatus(id, 'Cancelled', reason);
                setRejectTarget(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Detail Modal */}
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
