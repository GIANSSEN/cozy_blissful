import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../api/axios';
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  LogOut, Heart, Plus, ChevronRight, ChevronLeft,
  Sparkles, Award, Gift, Send, UserCheck, Star, X,
  Tag, Zap, MessageSquare, Scissors, XCircle, RefreshCw,
  CalendarX, CalendarCheck, Ban, Info,
} from 'lucide-react';

// ─── Design system helpers ─────────────────────────────────────────────────

const ClayCard = ({ children, className = '', style = {}, ...props }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
      boxShadow: '20px 20px 40px #eae6df, -20px -20px 40px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
      border: '1px solid rgba(255,255,255,0.8)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const GoldBtn = ({ children, onClick, disabled, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 py-3 px-6 text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${className}`}
    style={{ background: 'linear-gradient(135deg,#062c22 0%,#0f5040 100%)', boxShadow: '0 6px 18px rgba(6,44,34,0.25)' }}
  >
    {children}
  </button>
);

const STEP_LABELS = ['Choose Service', 'Pick Date & Time', 'Review & Notes', 'Confirmation'];

// ─── STATUS COLORS ───────────────────────────────────────────────────────────

const statusStyle = (status) => {
  switch (status) {
    case 'Confirmed': case 'Completed':
      return { bg: 'rgba(6,44,34,0.06)', color: '#062c22', border: 'rgba(6,44,34,0.15)', icon: <CheckCircle className="w-3.5 h-3.5" /> };
    case 'Cancelled':
      return { bg: 'rgba(239,68,68,0.06)', color: '#b91c1c', border: 'rgba(239,68,68,0.15)', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    default:
      return { bg: 'rgba(191,161,95,0.1)', color: '#a08742', border: 'rgba(191,161,95,0.2)', icon: <Clock className="w-3.5 h-3.5" /> };
  }
};

// ─── STEP INDICATOR ─────────────────────────────────────────────────────────

const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center gap-1 mb-6">
    {STEP_LABELS.map((label, i) => {
      const isActive = i === step;
      const isDone = i < step;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
              style={{
                background: isDone ? 'linear-gradient(135deg,#bfa15f,#d4b87a)' : isActive ? 'linear-gradient(135deg,#062c22,#0f5040)' : 'rgba(0,0,0,0.06)',
                color: isDone || isActive ? '#fff' : '#94a3b8',
                boxShadow: isActive ? '0 4px 12px rgba(6,44,34,0.25)' : 'none',
              }}
            >
              {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-[9px] font-semibold hidden sm:block" style={{ color: isActive ? '#062c22' : '#94a3b8' }}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className="w-8 sm:w-14 h-0.5 mb-4 rounded-full transition-all duration-300"
              style={{ background: i < step ? 'linear-gradient(90deg,#bfa15f,#d4b87a)' : 'rgba(0,0,0,0.08)' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── STEP 1: SERVICE SELECTOR ────────────────────────────────────────────────

const ServiceCards = ({ services, selectedId, onSelect }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-base font-black text-slate-800">Choose Your Treatment</h3>
      <p className="text-xs text-slate-400 mt-0.5">Select the service you'd like to book today</p>
    </div>
    <div className="grid sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
      {services.map((s) => {
        const isSelected = s.id === selectedId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            className="text-left rounded-3xl p-4 transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: isSelected ? 'linear-gradient(135deg,#062c22,#0a3d30)' : 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
              boxShadow: isSelected ? '0 8px 24px rgba(6,44,34,0.25), inset 2px 2px 6px rgba(255,255,255,0.1)' : '8px 8px 20px #eae6df, -8px -8px 20px #ffffff',
              border: isSelected ? '1.5px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.8)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm leading-tight" style={{ color: isSelected ? '#fff' : '#1e293b' }}>{s.name}</p>
                {s.category && (
                  <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-wider" style={{ color: isSelected ? 'rgba(255,255,255,0.55)' : '#94a3b8' }}>{s.category}</p>
                )}
                {s.description && (
                  <p className="text-[11px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#64748b' }}>{s.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-xs font-black px-2.5 py-1 rounded-xl"
                  style={{ background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(6,44,34,0.08)', color: isSelected ? '#fff' : '#062c22' }}>
                  ₱{s.price ?? 'TBD'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1"
                  style={{ background: isSelected ? 'rgba(191,161,95,0.25)' : 'rgba(191,161,95,0.1)', color: isSelected ? '#f5d88a' : '#a08742' }}>
                  <Clock className="w-3 h-3" /> {s.duration} min
                </span>
              </div>
            </div>
            {isSelected && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-[10px] font-bold text-emerald-300">Selected</span>
              </div>
            )}
          </button>
        );
      })}
      {services.length === 0 && (
        <div className="col-span-2 text-center py-10 text-slate-400 text-sm">No services available.</div>
      )}
    </div>
  </div>
);

// ─── STEP 2: DATE & TIME PICKER ──────────────────────────────────────────────

const DateTimePicker = ({ selectedDate, onDateSelect, selectedTime, onTimeSelect, slots, loadingSlots, therapists, selectedTherapist, onTherapistSelect }) => {
  // Generate next 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const dayKey = (d) => d.toISOString().split('T')[0];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-black text-slate-800">Pick Your Date & Time</h3>
        <p className="text-xs text-slate-400 mt-0.5">We're open 9:00 AM – 9:00 PM</p>
      </div>

      {/* Date chips */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Date</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => {
            const key = dayKey(d);
            const isSelected = selectedDate === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onDateSelect(key)}
                className="flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-2xl transition-all duration-200 hover:scale-105"
                style={{
                  background: isSelected ? 'linear-gradient(135deg,#062c22,#0a3d30)' : 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
                  boxShadow: isSelected ? '0 4px 12px rgba(6,44,34,0.25)' : '4px 4px 10px #eae6df, -4px -4px 10px #ffffff',
                  border: isSelected ? '1.5px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
                  minWidth: 58,
                }}
              >
                <span className="text-[9px] font-bold uppercase" style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-base font-black" style={{ color: isSelected ? '#fff' : '#1e293b' }}>
                  {d.getDate()}
                </span>
                <span className="text-[9px] font-semibold" style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                  {d.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Available Time Slots
            {loadingSlots && <span className="ml-2 text-amber-500 animate-pulse">• Loading…</span>}
          </p>
          {loadingSlots ? (
            <div className="flex gap-2 flex-wrap">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-9 w-20 rounded-xl animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
              ))}
            </div>
          ) : slots.all_slots?.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {slots.all_slots.map((slot) => {
                const isBooked = slots.booked_slots?.includes(slot);
                const isSelected = selectedTime === slot;
                const [h, m] = slot.split(':');
                const hour = parseInt(h);
                const label = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => !isBooked && onTimeSelect(slot)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                    style={
                      isBooked
                        ? { background: 'rgba(0,0,0,0.04)', color: '#cbd5e1', border: '1px solid rgba(0,0,0,0.05)', cursor: 'not-allowed', textDecoration: 'line-through' }
                        : isSelected
                        ? { background: 'linear-gradient(135deg,#bfa15f,#d4b87a)', color: '#fff', boxShadow: '0 3px 10px rgba(191,161,95,0.3)', border: '1px solid rgba(255,255,255,0.2)' }
                        : { background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', color: '#1e293b', boxShadow: '3px 3px 6px #eae6df, -3px -3px 6px #fff', border: '1px solid rgba(255,255,255,0.8)' }
                    }
                  >
                    {label}
                    {isBooked && <span className="ml-1 text-[9px]">●</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No slots available for this date. Please pick another day.</p>
          )}
        </div>
      )}

      {/* Therapist assignment notice */}
      <div className="p-3 rounded-2xl flex items-start gap-2.5"
        style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.08)' }}>
        <UserCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-emerald-800">Therapist Assigned by Us.</span> Our admin team will carefully match you with the best available specialist for your chosen service. You'll be notified by email once confirmed.
        </p>
      </div>
    </div>
  );
};

// ─── STEP 3: REVIEW & NOTES ──────────────────────────────────────────────────

const ReviewStep = ({ service, date, time, notes, onNotesChange }) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const timeLabel = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-black text-slate-800">Review Your Booking</h3>
        <p className="text-xs text-slate-400 mt-0.5">Confirm your details below before submitting</p>
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl p-5 space-y-3"
        style={{ background: 'linear-gradient(135deg,#062c22 0%,#0a3d30 100%)', boxShadow: '0 8px 24px rgba(6,44,34,0.2)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white font-black text-lg leading-tight">{service.name}</p>
            <p className="text-emerald-300/70 text-xs font-semibold mt-0.5">{service.category}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-xl">₱{service.price ?? 'TBD'}</p>
            <p className="text-emerald-300/70 text-[10px] font-semibold">{service.duration} minutes</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-300/70 flex-shrink-0" />
            <span className="text-white font-semibold">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-300/70 flex-shrink-0" />
            <span className="text-white font-semibold">{timeLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-300/70 flex-shrink-0" />
            <span className="text-white font-semibold">Our team will assign your specialist</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-200/60 font-semibold uppercase tracking-wider">Status After Booking</span>
            <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/20">⏳ Pending Approval</span>
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Special Requests / Notes</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="e.g. Bring lavender oils, focus on lower back, need extra blanket…"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl text-sm text-slate-700 bg-transparent outline-none resize-none"
          style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: 'inset 3px 3px 6px #e0dbd3, inset -3px -3px 6px #ffffff' }}
        />
      </div>
    </div>
  );
};

// ─── STEP 4: CONFIRMATION ────────────────────────────────────────────────────

const ConfirmationStep = ({ booking, onDone }) => (
  <div className="text-center space-y-5 py-4">
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
      style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 8px 24px rgba(6,44,34,0.3)' }}
    >
      <CheckCircle className="w-10 h-10 text-emerald-300" />
    </motion.div>
    <div>
      <h3 className="text-xl font-black text-slate-800">Booking Submitted!</h3>
      <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
        Your appointment is pending approval. We'll notify you by email once confirmed.
      </p>
    </div>
    <div className="rounded-2xl p-4 text-left space-y-2 max-w-xs mx-auto"
      style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.1)' }}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Reference</p>
      <p className="text-lg font-black text-slate-800">#{String(booking?.id).padStart(4, '0')}</p>
      <p className="text-xs text-slate-600 font-semibold">{booking?.service}</p>
      <p className="text-xs text-slate-500">{booking?.datetime}</p>
    </div>
    <p className="text-xs text-slate-400">📧 A confirmation email has been sent to your inbox.</p>
    <button
      onClick={onDone}
      className="inline-flex items-center gap-2 py-3 px-8 text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:scale-105"
      style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 6px 18px rgba(6,44,34,0.25)' }}
    >
      <Sparkles className="w-4 h-4" /> Back to Dashboard
    </button>
  </div>
);

// ─── CANCEL MODAL ────────────────────────────────────────────────────────────

const CancelModal = ({ booking, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      await API.post(`/booking/${booking.id}/cancel`);
      onSuccess('Appointment cancelled successfully.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (dt) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };
  const fmtTime = (dt) => {
    const d = new Date(dt);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="w-full max-w-md rounded-[2rem] overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.8)' }}
      >
        {/* Red danger header */}
        <div className="px-7 pt-7 pb-5" style={{ background: 'linear-gradient(135deg,#7f1d1d,#991b1b)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <CalendarX className="w-6 h-6 text-red-200" />
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-red-200 hover:text-white transition" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-white font-black text-lg">Cancel Appointment</h2>
          <p className="text-red-200/70 text-xs mt-0.5">This action cannot be undone</p>
        </div>

        <div className="p-7 space-y-5">
          {/* Booking Summary */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(127,29,29,0.05)', border: '1px solid rgba(127,29,29,0.12)' }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointment to Cancel</p>
            <p className="font-black text-slate-800 text-sm">#{String(booking.id).padStart(5,'0')} — {booking.service}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span>{fmtDate(booking.datetime)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              <span>{fmtTime(booking.datetime)}</span>
            </div>
          </div>

          {/* Warning note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-amber-600">Note:</span> Once cancelled, your time slot will be released. To re-book, you'll need to schedule a new appointment.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-red-700" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-500 transition hover:bg-slate-100"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
              Keep Appointment
            </button>
            <button onClick={handleCancel} disabled={loading}
              className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 6px 18px rgba(220,38,38,0.3)' }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cancelling…</>
                : <><XCircle className="w-4 h-4" /> Yes, Cancel</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── RESCHEDULE MODAL ─────────────────────────────────────────────────────────

const RescheduleModal = ({ booking, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState({ available_slots: [], booked_slots: [], all_slots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedDate || !booking.service_id) return;
    setLoadingSlots(true);
    setSelectedTime('');
    API.get('/booking/available-slots', { params: { date: selectedDate, service_id: booking.service_id } })
      .then((r) => setSlots(r.data))
      .catch(() => setSlots({ available_slots: [], booked_slots: [], all_slots: [] }))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) { setError('Please select a date and time.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await API.post(`/booking/${booking.id}/reschedule`, {
        datetime: `${selectedDate}T${selectedTime}:00`,
      });
      onSuccess('Appointment rescheduled! You will receive a fresh reminder email.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Rescheduling failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSlot = (slot) => {
    const [h, m] = slot.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[2rem]"
        style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.8)' }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5" style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <CalendarCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-200 hover:text-white transition" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-white font-black text-lg">Reschedule Appointment</h2>
          <p className="text-emerald-200/70 text-xs mt-0.5">#{String(booking.id).padStart(5,'0')} — {booking.service}</p>
        </div>

        <div className="p-7 space-y-5">
          {/* Current booking info */}
          <div className="rounded-2xl p-4 space-y-1.5" style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.1)' }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Schedule</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-700">{new Date(booking.datetime).toLocaleString('en-US', { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true })}</span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Pick New Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm text-slate-700 outline-none"
              style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: 'inset 3px 3px 6px #e0dbd3, inset -3px -3px 6px #ffffff', border: 'none' }}
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" /> Choose New Time
              </label>
              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                  Loading available slots…
                </div>
              ) : slots.available_slots.length === 0 ? (
                <div className="py-4 rounded-2xl text-center text-xs text-slate-400" style={{ background: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.1)' }}>
                  No available slots on this date. Try a different day.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {slots.all_slots.map((slot) => {
                    const isAvailable = slots.available_slots.includes(slot);
                    const isSelected = selectedTime === slot;
                    return (
                      <button key={slot} disabled={!isAvailable} onClick={() => setSelectedTime(slot)}
                        className="py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg,#062c22,#0a3d30)'
                            : isAvailable
                              ? 'linear-gradient(145deg,#f5f0e8,#ece8e0)'
                              : 'rgba(0,0,0,0.03)',
                          color: isSelected ? '#fff' : isAvailable ? '#374151' : '#cbd5e1',
                          boxShadow: isSelected ? '0 4px 12px rgba(6,44,34,0.25)' : isAvailable ? '3px 3px 6px #e0dbd3,-3px -3px 6px #fff' : 'none',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          border: isSelected ? '1px solid transparent' : '1px solid rgba(0,0,0,0.04)',
                          textDecoration: !isAvailable ? 'line-through' : 'none',
                          scale: isSelected ? '1.04' : '1',
                        }}>
                        {formatSlot(slot)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reminder notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(6,44,34,0.04)', border: '1px solid rgba(6,44,34,0.1)' }}>
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-emerald-800">Reminder emails</span> will be automatically sent for your new schedule — 24 hours and 2 hours before your session.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-red-700" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-500 transition hover:bg-slate-100"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
              Cancel
            </button>
            <button onClick={handleReschedule} disabled={submitting || !selectedDate || !selectedTime}
              className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 6px 18px rgba(6,44,34,0.28)' }}>
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Rescheduling…</>
                : <><RefreshCw className="w-4 h-4" /> Confirm Reschedule</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── BOOKING MODAL ───────────────────────────────────────────────────────────

const BookingWizard = ({ data, onClose, onSuccess }) => {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState({ all_slots: [], booked_slots: [], available_slots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState('');

  // Fetch available slots whenever date + service both selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      setLoadingSlots(true);
      setSelectedTime('');
      API.get('/booking/available-slots', { params: { date: selectedDate, service_id: selectedService.id } })
        .then((r) => setSlots(r.data))
        .catch(() => setSlots({ all_slots: [], booked_slots: [], available_slots: [] }))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, selectedService]);

  const canNext = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!selectedDate && !!selectedTime;
    if (step === 2) return true;
    return false;
  };

  const handleNext = () => { setError(''); setStep((s) => s + 1); };
  const handleBack = () => { setError(''); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const datetime = `${selectedDate}T${selectedTime}:00`;
      const res = await API.post('/booking/store', {
        service_id:   selectedService.id,
        therapist_id: null,   // Admin/Staff assign the therapist
        datetime,
        notes,
      });
      setConfirmedBooking(res.data.booking);
      setStep(3);
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      setError(msg);
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
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && step < 3 && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem]"
        style={{
          background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.8)',
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-800">Book a Treatment</h2>
              <p className="text-[10px] text-slate-400 font-semibold">Step {step + 1} of {STEP_LABELS.length}</p>
            </div>
            {step < 3 && (
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                style={{ background: 'rgba(0,0,0,0.05)' }}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Step indicator */}
          <StepIndicator step={step} />

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <ServiceCards
                  services={data?.available_services || []}
                  selectedId={selectedService?.id}
                  onSelect={(s) => setSelectedService(s)}
                />
              )}
              {step === 1 && (
                <DateTimePicker
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                  therapists={data?.available_therapists || []}
                  selectedTherapist={selectedTherapist}
                  onTherapistSelect={setSelectedTherapist}
                  slots={slots}
                  loadingSlots={loadingSlots}
                />
              )}
              {step === 2 && (
                <ReviewStep
                  service={selectedService}
                  date={selectedDate}
                  time={selectedTime}
                  notes={notes}
                  onNotesChange={setNotes}
                />
              )}
              {step === 3 && (
                <ConfirmationStep booking={confirmedBooking} onDone={onClose} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2 text-xs text-red-700"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 transition-all hover:text-slate-700 disabled:opacity-30"
                style={{ background: 'rgba(0,0,0,0.04)' }}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>

              {step < 2 ? (
                <GoldBtn onClick={handleNext} disabled={!canNext()}>
                  Next <ChevronRight className="w-4 h-4" />
                </GoldBtn>
              ) : (
                <GoldBtn onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking…</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Confirm Booking</>
                  )}
                </GoldBtn>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── MAIN CLIENT DASHBOARD ───────────────────────────────────────────────────

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const showToast = (msg, type = 'success') => { setToastMsg({ text: msg, type }); setTimeout(() => setToastMsg({ text: '', type: 'success' }), 4500); };

  // Therapist chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'therapist', text: "Hello! I am preparing the massage table and oils. I will arrive at your home around 2:00 PM." },
    { sender: 'client',    text: "Thank you! Please bring the Lavender scent if available." },
    { sender: 'therapist', text: "Of course! I have pre-packed Lavender and Chamomile for your Swedish massage. See you shortly!" },
  ]);

  const fetchDashboardData = () => {
    API.get('/booking/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'client', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: 'therapist', text: "Understood! I am on my way now. See you soon!" }]);
    }, 1500);
  };

  const completedCount = data?.bookings?.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length || 0;
  const stamps = Math.min(completedCount + 3, 10);
  const latestConfirmedBooking = data?.bookings?.find(b => b.status === 'Confirmed' && b.therapist_name !== 'Awaiting Assignment');
  const assignedTherapistName = latestConfirmedBooking?.therapist_name || null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf8f5', fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(250,248,245,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center space-x-3">
          <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <span className="font-bold text-slate-800 tracking-wide block text-sm leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful</span>
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#bfa15f' }}>Salon & Spa</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-700">{user?.name || 'Client'}</p>
            <p className="text-[10px] text-slate-400">{user?.email || ''}</p>
          </div>
          <button onClick={handleLogout}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition duration-200"
            style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', boxShadow: '3px 3px 8px #ddd8cf, -3px -3px 8px #ffffff' }}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══ MAIN ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">

        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Guest'} ✨</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage your appointments, view loyalty rewards, and book your next in-salon treatment</p>
          </div>
          <GoldBtn onClick={() => setShowWizard(true)}>
            <Plus className="w-4 h-4" /> Book a Session
          </GoldBtn>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── LEFT/MAIN COLUMN ──────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Loyalty Card */}
              <ClayCard className="p-6 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 60%, #0f5040 100%)',
                boxShadow: '12px 12px 32px rgba(6,44,34,0.25), -6px -6px 16px rgba(255,255,255,0.08)'
              }}>
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
                  <Award className="w-48 h-48 text-emerald-200" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-bold text-base tracking-tight flex items-center gap-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <Award className="w-4 h-4 text-amber-400" /> Cozy Blissful Loyalty Club
                    </h2>
                    <p className="text-[10px] text-emerald-200/70 mt-0.5">Collect 10 stamps — redeem for a FREE in-salon Swedish Massage!</p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                    {stamps} / 10 Stamps
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 my-5">
                  {[...Array(10)].map((_, i) => {
                    const isStamped = i < stamps;
                    return (
                      <div key={i} className="aspect-square rounded-2xl flex items-center justify-center transition duration-300"
                        style={{
                          background: isStamped ? 'linear-gradient(135deg,#bfa15f,#d4b87a)' : 'rgba(255,255,255,0.06)',
                          boxShadow: isStamped ? '2px 2px 6px rgba(191,161,95,0.3)' : 'inset 2px 2px 4px rgba(0,0,0,0.15)',
                          border: isStamped ? '1.5px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        {isStamped ? <span className="text-white font-black text-xs">CB</span> : <span className="text-emerald-300/20 text-xs font-semibold">{i + 1}</span>}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-emerald-200/80 font-medium">
                  {stamps < 10
                    ? <span>💆 Book and complete <strong>{10 - stamps} more sessions</strong> at our salon to redeem your free massage!</span>
                    : <span className="text-amber-300 font-bold">🎉 Congratulations! You have a FREE in-salon treatment ready to claim!</span>}
                </p>
              </ClayCard>

              {/* Active Rewards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4" style={{ color: '#bfa15f' }} /> Active Rewards & Vouchers
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { code: 'CBWELCOME20', title: '20% Off First Treatment', desc: 'Valid for new client accounts', exp: 'Exp: Aug 30' },
                    { code: 'MIDWEEK150',  title: '₱150 Off Midweek Bliss',  desc: 'Bookings scheduled Wed or Thu', exp: 'Exp: Aug 15' },
                  ].map((voucher) => (
                    <div key={voucher.code} className="rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden transition hover:scale-[1.01]"
                      style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', boxShadow: '8px 8px 20px #eae6df, -8px -8px 20px #ffffff', border: '1px solid rgba(191,161,95,0.15)' }}>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#bfa15f' }}>Voucher Code</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{voucher.exp}</span>
                        </div>
                        <p className="text-xs font-black text-emerald-950 uppercase tracking-wide">{voucher.code}</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">{voucher.title}</p>
                        <p className="text-[10px] text-slate-400">{voucher.desc}</p>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(voucher.code); showToast(`Code "${voucher.code}" copied!`); }}
                        className="w-full mt-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-950 transition hover:bg-slate-200"
                        style={{ background: 'linear-gradient(135deg,#fdfcfa,#ece8e0)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        Copy Promo Code
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Bookings */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-800" /> My Appointments &amp; Cancellations
                </h3>
                {data?.bookings?.length === 0 ? (
                  <div className="rounded-3xl p-8 text-center"
                    style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', boxShadow: '8px 8px 20px #eae6df, -8px -8px 20px #ffffff' }}>
                    <Scissors className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700 text-sm">No bookings yet</p>
                    <p className="text-xs text-slate-400 mt-1">Tap "Book a Session" to get started!</p>
                    <button onClick={() => setShowWizard(true)}
                      className="mt-4 px-6 py-2.5 rounded-2xl text-white text-xs font-bold transition hover:scale-105"
                      style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 4px 12px rgba(6,44,34,0.2)' }}>
                      Book Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.bookings.map((b, i) => {
                      const ss = statusStyle(b.status);
                      const canManage = b.status === 'Pending' || b.status === 'Confirmed';
                      return (
                        <div key={b.id || i} className="rounded-3xl p-5 flex flex-col gap-4 transition hover:scale-[1.005]"
                          style={{ background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)', boxShadow: '10px 10px 24px #eae6df, -10px -10px 24px #ffffff', border: '1px solid rgba(255,255,255,0.8)' }}>
                          {/* Booking info row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: b.status === 'Confirmed' || b.status === 'Completed' ? '#062c2210' : b.status === 'Cancelled' ? 'rgba(239,68,68,0.07)' : '#bfa15f15' }}>
                                {b.status === 'Cancelled'
                                  ? <Ban className="w-5 h-5 text-red-400" />
                                  : <Calendar className="w-5 h-5" style={{ color: b.status === 'Confirmed' || b.status === 'Completed' ? '#062c22' : '#bfa15f' }} />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm leading-snug">{b.service}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                                  <span className="font-mono text-[10px] text-slate-400">#{String(b.id).padStart(5,'0')}</span>
                                  <span>·</span>
                                  <span>with <strong className="text-slate-600">{b.therapist_name}</strong></span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(b.datetime).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',hour12:true})}</span>
                                  {b.service_duration && <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> {b.service_duration} min</span>}
                                </div>
                                {b.notes && <p className="text-[10px] text-slate-400 italic mt-1">📋 {b.notes}</p>}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 self-start sm:self-auto border whitespace-nowrap"
                              style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
                              {ss.icon} {b.status}
                            </span>
                          </div>

                          {/* Action buttons — only for Pending or Confirmed */}
                          {canManage && (
                            <div className="flex gap-2 pt-1 border-t border-black/[0.04]">
                              <button
                                onClick={() => setRescheduleTarget(b)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-emerald-800 transition-all hover:scale-[1.03] active:scale-95"
                                style={{ background: 'linear-gradient(145deg,rgba(6,44,34,0.07),rgba(6,44,34,0.04))', border: '1px solid rgba(6,44,34,0.1)', boxShadow: '2px 2px 6px rgba(6,44,34,0.06)' }}>
                                <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                              </button>
                              <button
                                onClick={() => setCancelTarget(b)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-600 transition-all hover:scale-[1.03] active:scale-95"
                                style={{ background: 'linear-gradient(145deg,rgba(220,38,38,0.06),rgba(220,38,38,0.03))', border: '1px solid rgba(220,38,38,0.12)', boxShadow: '2px 2px 6px rgba(220,38,38,0.06)' }}>
                                <XCircle className="w-3.5 h-3.5" /> Cancel
                              </button>
                            </div>
                          )}

                          {/* Completed/Cancelled notice */}
                          {!canManage && b.status !== 'Completed' && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-black/[0.04]">
                              <Ban className="w-3 h-3" /> This appointment has been cancelled and cannot be modified.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN ──────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* Assigned Therapist */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-800" /> My Assigned Therapist
                </h3>
                {assignedTherapistName ? (
                  <ClayCard className="p-5 flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden" style={{ border: '2.5px solid #bfa15f', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
                        <img src="/therapist-hero.jpg" alt="Therapist" className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#faf8f5] rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{assignedTherapistName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Swedish & Hilot Expert</p>
                      <div className="flex justify-center items-center gap-1.5 mt-1.5">
                        <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}</div>
                        <span className="text-[10px] font-bold text-slate-500">4.9 (120+ trips)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">✦ Cozy Vetted Specialist</span>
                  </ClayCard>
                ) : (
                  <ClayCard className="p-5 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">No Active Assignment</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Once the Admin assigns your specialist for your confirmed in-salon session, they will appear here.</p>
                  </ClayCard>
                )}
              </div>

              {/* Connection Chat */}
              {assignedTherapistName && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-800" /> Connection Chat
                  </h3>
                  <ClayCard className="p-4 flex flex-col" style={{ height: '300px' }}>
                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 text-left">
                      {chatMessages.map((msg, i) => {
                        const isClient = msg.sender === 'client';
                        return (
                          <div key={i} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] ${isClient ? 'text-white' : 'text-slate-700'}`}
                              style={isClient
                                ? { background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '4px 4px 10px rgba(6,44,34,0.15)', borderRadius: '16px 16px 2px 16px' }
                                : { background: '#faf8f5', boxShadow: '2px 2px 8px #eae6df', borderRadius: '16px 16px 16px 2px', border: '1px solid rgba(0,0,0,0.03)' }}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <form onSubmit={sendChatMessage} className="mt-3.5 pt-3 border-t border-slate-100 flex gap-2">
                      <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Message ${assignedTherapistName.split(' ')[0]}...`}
                        className="flex-1 px-3 py-2 rounded-xl text-xs text-slate-700 placeholder-slate-400 outline-none"
                        style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: 'inset 2px 2px 5px #e0dbd3, inset -2px -2px 5px #ffffff' }} />
                      <button type="submit" className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)', boxShadow: '3px 3px 8px rgba(6,44,34,0.2)' }}>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </ClayCard>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* ═══ BOOKING WIZARD MODAL ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showWizard && (
          <BookingWizard
            data={data}
            onClose={() => setShowWizard(false)}
            onSuccess={() => {
              fetchDashboardData();
              showToast('🎉 Booking submitted! Check your email for confirmation.');
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ CANCEL MODAL ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            booking={cancelTarget}
            onClose={() => setCancelTarget(null)}
            onSuccess={(msg) => { fetchDashboardData(); showToast(msg, 'error'); }}
          />
        )}
      </AnimatePresence>

      {/* ═══ RESCHEDULE MODAL ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {rescheduleTarget && (
          <RescheduleModal
            booking={rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onSuccess={(msg) => { fetchDashboardData(); showToast(msg, 'success'); }}
          />
        )}
      </AnimatePresence>

      {/* ═══ TOAST ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {toastMsg.text && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-xl flex items-center gap-2"
            style={{
              background: toastMsg.type === 'error'
                ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
                : 'linear-gradient(135deg,#062c22,#0f5040)',
              boxShadow: toastMsg.type === 'error'
                ? '0 8px 24px rgba(220,38,38,0.25)'
                : '0 8px 24px rgba(6,44,34,0.25)',
              whiteSpace: 'nowrap'
            }}>
            {toastMsg.type === 'error'
              ? <XCircle className="w-4 h-4 text-red-200" />
              : <CheckCircle className="w-4 h-4 text-emerald-300" />}
            {toastMsg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;
