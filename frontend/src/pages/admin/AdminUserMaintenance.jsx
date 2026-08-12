import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  Users, Calendar, Shield, Lock, Save,
  CheckCircle2, Crown, Stethoscope, UserCog, User,
  Search, X, Edit3, Trash2,
  CalendarDays, Star, Clock,
  ChevronUp, ChevronDown,
  BadgeCheck, TrendingUp, Activity, SlidersHorizontal,
  RotateCcw, CheckCheck, Plus, Eye, EyeOff, AlertCircle,
  Phone, Mail, Briefcase, ArrowUpDown, Filter, Sparkles,
  Info, Check, Key, UserCheck, UserX, Copy, MoreHorizontal,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════ */
/*  CONFIG & METADATA                                              */
/* ═══════════════════════════════════════════════════════════════ */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SHIFTS = [
  { id: 'morning',   label: 'Morning',   time: '08:00–12:00', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { id: 'afternoon', label: 'Afternoon', time: '13:00–17:00', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { id: 'evening',   label: 'Evening',   time: '18:00–22:00', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
];

const ROLE_META = {
  admin:     { label: 'Administrator',    desc: 'Full system control & user management', icon: Crown,       grad: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#0a3d30', badgeBg: 'rgba(10,61,48,0.12)',  locked: true  },
  staff:     { label: 'Staff Coordinator',desc: 'Manages scheduling, clients & bookings', icon: UserCog,     grad: 'linear-gradient(135deg,#1e3a8a,#3b55e6)', color: '#3b55e6', badgeBg: 'rgba(59,85,230,0.12)', locked: false },
  therapist: { label: 'Therapist',        desc: 'Assigned session & queue access',       icon: Stethoscope, grad: 'linear-gradient(135deg,#78350f,#b45309)', color: '#b45309', badgeBg: 'rgba(180,83,9,0.12)',  locked: false },
  client:    { label: 'Client',           desc: 'Self-service booking portal',           icon: User,        grad: 'linear-gradient(135deg,#4338ca,#6366f1)', color: '#6366f1', badgeBg: 'rgba(99,102,241,0.12)',locked: false },
};

const PERM_META = {
  bookings:   { label: 'Bookings',   desc: 'View & manage appointments',  icon: Calendar,          color: '#3b82f6' },
  services:   { label: 'Services',   desc: 'Create & edit services',       icon: Star,              color: '#f59e0b' },
  financials: { label: 'Financials', desc: 'Revenue & payment access',     icon: TrendingUp,        color: '#10b981' },
  settings:   { label: 'Settings',   desc: 'System-wide configuration',    icon: SlidersHorizontal, color: '#8b5cf6' },
  analytics:  { label: 'Analytics',  desc: 'View KPIs & reports',          icon: Activity,          color: '#ef4444' },
  userMgmt:   { label: 'User Mgmt',  desc: 'Create & manage accounts',     icon: Users,             color: '#0ea5e9' },
};

const INITIAL_PERMS = {
  admin:     { bookings: true,  services: true,  financials: true,  settings: true,  analytics: true,  userMgmt: true  },
  staff:     { bookings: true,  services: false, financials: false, settings: false, analytics: false, userMgmt: false },
  therapist: { bookings: true,  services: false, financials: false, settings: false, analytics: false, userMgmt: false },
  client:    { bookings: false, services: false, financials: false, settings: false, analytics: false, userMgmt: false },
};

let nextId = 7;
const MOCK_USERS = [
  { id: 1, name: 'Anna Reyes',     email: 'anna@cozy.spa',    phone: '+63 919 555 6666', role: 'therapist', specialty: 'Swedish & Hot Stone',   status: 'active',   joined: '2025-02-20', commRate: 35 },
  { id: 2, name: 'Grace Tan',      email: 'grace@cozy.spa',   phone: '+63 921 999 0000', role: 'therapist', specialty: 'Hilot & Shiatsu',        status: 'inactive', joined: '2025-06-01', commRate: 30 },
  { id: 3, name: 'Leo Garcia',     email: 'leo@cozy.spa',     phone: '+63 920 777 8888', role: 'therapist', specialty: 'Deep Tissue & Sports',   status: 'active',   joined: '2025-05-15', commRate: 35 },
  { id: 4, name: 'Maria Santos',   email: 'maria@cozy.spa',   phone: '+63 917 111 2222', role: 'staff',     specialty: 'Front Desk Coordinator', status: 'active',   joined: '2025-03-10', commRate: 0  },
  { id: 5, name: 'Juan Dela Cruz', email: 'juan@cozy.spa',    phone: '+63 918 333 4444', role: 'staff',     specialty: 'Operations Lead',        status: 'active',   joined: '2025-04-01', commRate: 0  },
  { id: 6, name: 'Elena Ramos',    email: 'elena@cozy.spa',   phone: '+63 922 444 5555', role: 'staff',     specialty: 'Booking Specialist',     status: 'active',   joined: '2025-07-12', commRate: 0  },
];

const EMPTY_FORM = { name: '', email: '', phone: '', specialty: '', role: 'therapist', status: 'active', commRate: 35, password: '', confirmPassword: '' };

/* ═══════════════════════════════════════════════════════════════ */
/*  HOOK: THEME COLORS                                             */
/* ═══════════════════════════════════════════════════════════════ */
function useC() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    isDark,
    cardBg:     isDark ? '#141927' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    pageBg:     isDark ? '#0c1020' : '#f8fafc',
    inputBg:    isDark ? '#0f1420' : '#f8fafc',
    inputBdr:   isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
    textPri:    isDark ? '#f1f5f9' : '#0f172a',
    textSec:    isDark ? '#94a3b8' : '#475569',
    textMuted:  isDark ? '#64748b' : '#94a3b8',
    divider:    isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    rowHover:   isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    pillBg:     isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
    pillAct:    isDark ? '#059669' : '#0a3d30',
  };
}

/* ═══════════════════════════════════════════════════════════════ */
/*  SHARED ATOMIC COMPONENTS                                       */
/* ═══════════════════════════════════════════════════════════════ */
function Avatar({ name, gradient, size = 36 }) {
  const initials = (name || '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center font-black text-white flex-shrink-0 select-none shadow-sm transition-transform hover:scale-105"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: gradient || 'linear-gradient(135deg, #78350f, #b45309)',
        fontSize: Math.max(10, size * 0.36),
        letterSpacing: '-0.02em',
      }}>
      {initials}
    </div>
  );
}

function RolePill({ role }) {
  const meta = ROLE_META[role] || { label: role, color: '#64748b', badgeBg: 'rgba(100,116,139,0.12)' };
  return (
    <span
      className="inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors"
      style={{ background: meta.badgeBg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        background: active ? 'rgba(16,185,129,0.10)' : 'rgba(148,163,184,0.12)',
        color: active ? '#059669' : '#64748b',
      }}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} aria-hidden="true" />
      <span>{active ? 'Active' : 'Inactive'}</span>
    </span>
  );
}

function Toggle({ on, onChange, disabled, id }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      id={id}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className="relative inline-flex items-center flex-shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
      style={{
        width: 38,
        height: 22,
        borderRadius: 11,
        border: 'none',
        padding: 0,
        background: disabled ? (on ? 'rgba(10,61,48,0.3)' : '#cbd5e1') : (on ? 'linear-gradient(135deg,#0a3d30,#062c22)' : '#cbd5e1'),
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: on && !disabled ? '0 2px 8px rgba(10,61,48,0.25)' : 'none',
      }}>
      <motion.span
        animate={{ x: on ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {disabled && <Lock className="w-2.5 h-2.5 text-slate-400" aria-hidden="true" />}
      </motion.span>
    </button>
  );
}


/* ═══════════════════════════════════════════════════════════════ */
/*  ACCESSIBLE COMPACT RESPONSIVE MODAL WRAPPER                    */
/* ═══════════════════════════════════════════════════════════════ */
function ModalBackdrop({ onClose, children, labelId, maxWidth = 'max-w-md' }) {
  const containerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === containerRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className={`w-full ${maxWidth} rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto`}
        onClick={(e) => e.stopPropagation()}>
        {children}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  VALIDATION HELPER                                               */
/* ═══════════════════════════════════════════════════════════════ */
function validateUserForm(form, isNew = false, allUsers = []) {
  const e = {};
  if (!form.name.trim() || form.name.trim().length < 2) {
    e.name = 'Full name is required (min. 2 characters)';
  }
  if (!form.email.trim()) {
    e.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    e.email = 'Enter a valid email address';
  } else if (isNew && allUsers.some(u => u.email.toLowerCase() === form.email.trim().toLowerCase())) {
    e.email = 'This email is already registered';
  }
  if (!form.phone.trim()) {
    e.phone = 'Phone number is required';
  } else if (!/^[+\d\s\-()]{7,}$/.test(form.phone.trim())) {
    e.phone = 'Enter a valid phone number';
  }
  if (!form.specialty.trim()) {
    e.specialty = 'Specialization / position is required';
  }
  if (form.role === 'therapist') {
    const cr = Number(form.commRate);
    if (isNaN(cr) || cr < 0) e.commRate = 'Commission must be 0 or more';
    else if (cr > 100) e.commRate = 'Commission cannot exceed 100%';
  }
  if (isNew) {
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min. 8 characters required';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must include at least one uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Must include at least one number';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password && form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
  }
  return e;
}

function FormField({ label, id, error, children, hint }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MODAL 1: ADD USER                                              */
/* ═══════════════════════════════════════════════════════════════ */
function AddUserModal({ onClose, onAdd, allUsers }) {
  const C = useC();
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [step, setStep]     = useState(1);
  const nameRef             = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const iCls = (err) => `w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 ${err ? 'border-red-500 ring-2 ring-red-500/20' : ''}`;
  const iStyle = (err) => ({ background: C.inputBg, border: `1.5px solid ${err ? '#ef4444' : C.inputBdr}`, color: C.textPri });

  const handleNext = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    else if (allUsers.some(u => u.email.toLowerCase() === form.email.trim().toLowerCase())) e.email = 'Email already registered';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.specialty.trim()) e.specialty = 'Specialization is required';

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    const e = validateUserForm(form, true, allUsers);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onAdd({
      id: nextId++,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      specialty: form.specialty.trim(),
      role: form.role,
      status: form.status,
      commRate: Number(form.commRate),
      joined: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="add-user-title" maxWidth="max-w-md">
      <div className="flex flex-col h-full" style={{ background: C.cardBg }}>
        {/* Header */}
        <div className="px-5 py-4 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Plus className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="add-user-title" className="font-black text-white text-sm">Add New Team Member</h2>
              <p className="text-[10px] text-emerald-200/80 mt-0.5">Step {step} of 2 — {step === 1 ? 'Personal Details' : 'Account & Security'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Step Bar */}
        <div className="px-5 py-2.5 flex-shrink-0 flex items-center gap-3 border-b" style={{ borderColor: C.divider }}>
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
                  style={{
                    background: s <= step ? 'linear-gradient(135deg,#059669,#0a3d30)' : C.pillBg,
                    color: s <= step ? '#ffffff' : C.textMuted,
                  }}>
                  {s < step ? <CheckCheck className="w-3 h-3" aria-hidden="true" /> : s}
                </div>
                <span className="text-[10px] font-bold" style={{ color: s <= step ? '#059669' : C.textMuted }}>
                  {s === 1 ? 'Details' : 'Account'}
                </span>
              </div>
              {s < 2 && <div className="flex-1 h-px" style={{ background: C.divider }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {step === 1 ? (
            <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
              <FormField label="Full Name *" id="add-name" error={errors.name}>
                <input
                  ref={nameRef}
                  id="add-name"
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className={iCls(errors.name)}
                  style={iStyle(errors.name)}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Email Address *" id="add-email" error={errors.email}>
                  <input
                    id="add-email"
                    type="email"
                    placeholder="maria@cozy.spa"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className={iCls(errors.email)}
                    style={iStyle(errors.email)}
                  />
                </FormField>
                <FormField label="Phone Number *" id="add-phone" error={errors.phone}>
                  <input
                    id="add-phone"
                    type="tel"
                    placeholder="+63 917 123 4567"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className={iCls(errors.phone)}
                    style={iStyle(errors.phone)}
                  />
                </FormField>
              </div>

              <FormField label="Specialization / Position *" id="add-spec" error={errors.specialty}>
                <input
                  id="add-spec"
                  type="text"
                  placeholder="e.g. Swedish & Hot Stone Massage"
                  value={form.specialty}
                  onChange={e => set('specialty', e.target.value)}
                  className={iCls(errors.specialty)}
                  style={iStyle(errors.specialty)}
                />
              </FormField>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">System Role *</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ROLE_META).filter(([k]) => k !== 'admin').map(([k, v]) => {
                    const Ic = v.icon;
                    const isSel = form.role === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => set('role', k)}
                        aria-pressed={isSel}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        style={{
                          background: isSel ? `${v.color}12` : C.inputBg,
                          borderColor: isSel ? v.color : C.inputBdr,
                        }}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: isSel ? v.grad : C.pillBg }}>
                          <Ic className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: isSel ? v.color : C.textMuted }}>{v.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Commission */}
              {form.role === 'therapist' && (
                <FormField label="Commission Rate (%) *" id="add-comm" error={errors.commRate}>
                  <input
                    id="add-comm"
                    type="number"
                    min="0"
                    max="100"
                    value={form.commRate}
                    onChange={e => set('commRate', e.target.value)}
                    className={iCls(errors.commRate)}
                    style={iStyle(errors.commRate)}
                  />
                </FormField>
              )}
            </motion.div>
          ) : (
            <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
              {/* Summary Card */}
              <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: C.inputBg, borderColor: C.cardBorder }}>
                <Avatar name={form.name} gradient={ROLE_META[form.role]?.grad} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-xs truncate" style={{ color: C.textPri }}>{form.name || 'New User'}</p>
                  <p className="text-[10px] truncate" style={{ color: C.textSec }}>{form.email}</p>
                  <div className="mt-1"><RolePill role={form.role} /></div>
                </div>
              </div>

              <FormField label="Password *" id="add-pw" error={errors.password}>
                <div className="relative">
                  <input
                    id="add-pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className={`${iCls(errors.password)} pr-9`}
                    style={iStyle(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm Password *" id="add-cpw" error={errors.confirmPassword}>
                <div className="relative">
                  <input
                    id="add-cpw"
                    type={showCf ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    className={`${iCls(errors.confirmPassword)} pr-9`}
                    style={iStyle(errors.confirmPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCf ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>

              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Status</p>
                <div className="flex gap-2">
                  {['active', 'inactive'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('status', s)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all"
                      style={{
                        background: form.status === s ? (s === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)') : C.inputBg,
                        borderColor: form.status === s ? (s === 'active' ? '#10b981' : '#ef4444') : C.inputBdr,
                        color: form.status === s ? (s === 'active' ? '#059669' : '#dc2626') : C.textMuted,
                      }}>
                      {s === 'active' ? '✓ Active' : '✕ Inactive'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 flex-shrink-0 flex items-center justify-between gap-3 border-t" style={{ borderColor: C.divider }}>
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors" style={{ borderColor: C.cardBorder, color: C.textSec }}>
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 transition-all shadow-md">
                Next →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors" style={{ borderColor: C.cardBorder, color: C.textSec }}>
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 transition-all shadow-md">
                Add User
              </button>
            </>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MODAL 2: EDIT USER                                             */
/* ═══════════════════════════════════════════════════════════════ */
function EditUserModal({ user, onClose, onSave, allUsers }) {
  const C = useC();
  const [form, setForm]     = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    specialty: user.specialty || '',
    role: user.role || 'staff',
    status: user.status || 'active',
    commRate: user.commRate ?? 0,
  });
  const [errors, setErrors] = useState({});
  const nameRef             = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const iCls = (err) => `w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 ${err ? 'border-red-500 ring-2 ring-red-500/20' : ''}`;
  const iStyle = (err) => ({ background: C.inputBg, border: `1.5px solid ${err ? '#ef4444' : C.inputBdr}`, color: C.textPri });

  const handleSave = () => {
    const others = allUsers.filter(u => u.id !== user.id);
    const e = validateUserForm(form, false, others);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave({ ...user, ...form, commRate: Number(form.commRate) });
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="edit-user-title" maxWidth="max-w-md">
      <div className="flex flex-col h-full" style={{ background: C.cardBg }}>
        {/* Header */}
        <div className="px-5 py-4 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={form.name} gradient={ROLE_META[form.role]?.grad} size={36} />
            <div className="min-w-0">
              <h2 id="edit-user-title" className="font-black text-white text-sm">Edit User Profile</h2>
              <p className="text-[10px] text-emerald-200/80 mt-0.5 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          <FormField label="Full Name *" id="edit-name" error={errors.name}>
            <input
              ref={nameRef}
              id="edit-name"
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className={iCls(errors.name)}
              style={iStyle(errors.name)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Email Address *" id="edit-email" error={errors.email}>
              <input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={iCls(errors.email)}
                style={iStyle(errors.email)}
              />
            </FormField>
            <FormField label="Phone Number *" id="edit-phone" error={errors.phone}>
              <input
                id="edit-phone"
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={iCls(errors.phone)}
                style={iStyle(errors.phone)}
              />
            </FormField>
          </div>

          <FormField label="Specialization / Position *" id="edit-spec" error={errors.specialty}>
            <input
              id="edit-spec"
              type="text"
              value={form.specialty}
              onChange={e => set('specialty', e.target.value)}
              className={iCls(errors.specialty)}
              style={iStyle(errors.specialty)}
            />
          </FormField>

          {/* Role */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Role</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_META).map(([k, v]) => {
                const Ic = v.icon;
                const isSel = form.role === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => set('role', k)}
                    className="flex items-center gap-2 p-2 rounded-xl border-2 text-left transition-all"
                    style={{
                      background: isSel ? `${v.color}12` : C.inputBg,
                      borderColor: isSel ? v.color : C.inputBdr,
                    }}>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{ background: isSel ? v.grad : C.pillBg }}>
                      <Ic className="w-3 h-3 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold truncate" style={{ color: isSel ? v.color : C.textSec }}>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commission */}
          {form.role === 'therapist' && (
            <FormField label="Commission Rate (%)" id="edit-comm" error={errors.commRate}>
              <input
                id="edit-comm"
                type="number"
                min="0"
                max="100"
                value={form.commRate}
                onChange={e => set('commRate', e.target.value)}
                className={iCls(errors.commRate)}
                style={iStyle(errors.commRate)}
              />
            </FormField>
          )}

          {/* Status */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Status</p>
            <div className="flex gap-2">
              {['active', 'inactive'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all"
                  style={{
                    background: form.status === s ? (s === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)') : C.inputBg,
                    borderColor: form.status === s ? (s === 'active' ? '#10b981' : '#ef4444') : C.inputBdr,
                    color: form.status === s ? (s === 'active' ? '#059669' : '#dc2626') : C.textMuted,
                  }}>
                  {s === 'active' ? '✓ Active Account' : '✕ Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 flex-shrink-0 flex items-center justify-between gap-3 border-t" style={{ borderColor: C.divider }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors" style={{ borderColor: C.cardBorder, color: C.textSec }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 transition-all shadow-md">
            Save Changes
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MODAL 3: VIEW USER DETAILS                                     */
/* ═══════════════════════════════════════════════════════════════ */
function ViewUserModal({ user, onClose, onEdit }) {
  const C = useC();
  const meta = ROLE_META[user.role] || ROLE_META.staff;

  return (
    <ModalBackdrop onClose={onClose} labelId="view-user-title" maxWidth="max-w-sm">
      <div className="flex flex-col h-full" style={{ background: C.cardBg }}>
        {/* Top Header Card */}
        <div className="px-5 py-5 text-center relative overflow-hidden" style={{ background: meta.grad }}>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>

          <div className="mx-auto mb-2.5 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 shadow-xl flex items-center justify-center">
            <Avatar name={user.name} gradient={meta.grad} size={54} />
          </div>
          <h2 id="view-user-title" className="font-black text-white text-base tracking-tight">{user.name}</h2>
          <p className="text-xs text-white/80 font-medium mt-0.5">{user.specialty}</p>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <RolePill role={user.role} />
            <StatusBadge status={user.status} />
          </div>
        </div>

        {/* Info Rows */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: C.inputBg, borderColor: C.cardBorder }}>
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
              <p className="font-semibold truncate" style={{ color: C.textPri }}>{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: C.inputBg, borderColor: C.cardBorder }}>
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
              <p className="font-semibold" style={{ color: C.textPri }}>{user.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl border text-center" style={{ background: C.inputBg, borderColor: C.cardBorder }}>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Commission</p>
              <p className="font-black text-sm text-amber-600 mt-0.5">{user.role === 'therapist' ? `${user.commRate}%` : 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl border text-center" style={{ background: C.inputBg, borderColor: C.cardBorder }}>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Joined Date</p>
              <p className="font-semibold text-xs mt-0.5" style={{ color: C.textPri }}>{user.joined}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 flex-shrink-0 flex items-center justify-between gap-3 border-t" style={{ borderColor: C.divider }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border" style={{ borderColor: C.cardBorder, color: C.textSec }}>
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(user); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB 1: USER PROFILES                                           */
/* ═══════════════════════════════════════════════════════════════ */
function TabProfiles({ users, onUsersChange }) {
  const C = useC();
  const { toast } = useToast();
  const [search, setMinimalSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editing, setEditing]        = useState(null);
  const [viewing, setViewing]        = useState(null);
  const [adding, setAdding]          = useState(false);
  const [sortField, setSortField]    = useState('name');
  const [sortDir, setSortDir]        = useState('asc');

  const flash = (msg, type = 'success') => toast[type]?.(msg) ?? toast.success(msg);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = users.filter(u =>
      (roleFilter === 'all' || u.role === roleFilter) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.specialty.toLowerCase().includes(q))
    );
    return [...list].sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [users, search, roleFilter, sortField, sortDir]);

  const toggleSort = (f) => {
    if (sortField === f) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(f);
      setSortDir('asc');
    }
  };

  const toggleStatus = (id) => {
    onUsersChange(prev => prev.map(u => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)));
    flash('User status updated successfully', 'linear-gradient(135deg,#059669,#0a3d30)');
  };

  const SH = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors focus-visible:outline-none">
      <span>{label}</span>
      {sortField === field ? (
        sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-600" /> : <ChevronDown className="w-3 h-3 text-emerald-600" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-25" />
      )}
    </button>
  );

  const stats = [
    { label: 'TOTAL',      value: users.length,                                bg: 'bg-slate-100 dark:bg-white/5', textCls: 'text-slate-700 dark:text-slate-200' },
    { label: 'ACTIVE',     value: users.filter(u => u.status==='active').length, bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', textCls: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'THERAPISTS', value: users.filter(u => u.role==='therapist').length,bg: 'bg-amber-500/10 dark:bg-amber-500/20',   textCls: 'text-amber-700 dark:text-amber-400' },
    { label: 'STAFF',      value: users.filter(u => u.role==='staff').length,    bg: 'bg-blue-500/10 dark:bg-blue-500/20',     textCls: 'text-blue-700 dark:text-blue-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Header Stat Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight" style={{ color: C.textPri }}>User Profiles</h2>
          <p className="text-xs" style={{ color: C.textMuted }}>All staff, therapist & team accounts</p>
        </div>

        <div className="flex items-center gap-2">
          {stats.map(s => (
            <div key={s.label} className={`px-3 py-1.5 rounded-2xl text-center min-w-[62px] ${s.bg}`}>
              <p className={`text-base font-black leading-none mb-0.5 ${s.textCls}`}>{s.value}</p>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar Bar */}
      <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl border flex flex-col sm:flex-row gap-3 items-center" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            value={search}
            onChange={e => setMinimalSearch(e.target.value)}
            placeholder="Search name, email or specialization..."
            className="w-full pl-10 pr-8 py-2.5 text-xs rounded-2xl border outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/20"
            style={{ background: C.inputBg, borderColor: search ? '#059669' : C.inputBdr, color: C.textPri }}
          />
          {search && (
            <button
              onClick={() => setMinimalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <X className="w-3 h-3 text-slate-500" />
            </button>
          )}
        </div>

        {/* Filter Pills + Add User */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3" />Role:</span>
            {['all', 'staff', 'therapist'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all"
                style={{
                  background: roleFilter === r ? (r === 'therapist' ? '#0a3d30' : C.pillAct) : C.inputBg,
                  color: roleFilter === r ? '#ffffff' : C.textSec,
                  borderColor: roleFilter === r ? 'transparent' : C.inputBdr,
                }}>
                {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* User Table — Desktop */}
      <div className="hidden lg:block rounded-3xl border overflow-hidden shadow-sm" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
        <div className="grid grid-cols-12 px-6 py-3 border-b text-slate-400 font-extrabold text-[10px] uppercase tracking-wider" style={{ background: C.isDark ? 'rgba(0,0,0,0.15)' : '#f8fafc', borderColor: C.divider }}>
          <div className="col-span-3"><SH field="name" label="USER" /></div>
          <div className="col-span-3"><SH field="specialty" label="SPECIALIZATION" /></div>
          <div className="col-span-1"><SH field="role" label="ROLE" /></div>
          <div className="col-span-1"><SH field="status" label="STATUS" /></div>
          <div className="col-span-2">COMMISSION</div>
          <div className="col-span-1"><SH field="joined" label="JOINED" /></div>
          <div className="col-span-1 text-right">ACTIONS</div>
        </div>

        <div className="divide-y" style={{ borderColor: C.divider }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((u, i) => {
              const meta = ROLE_META[u.role] || ROLE_META.staff;
              return (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  className="grid grid-cols-12 gap-2 px-6 py-3.5 items-center transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                  {/* User */}
                  <div
                    className="col-span-3 flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => setViewing(u)}>
                    <Avatar name={u.name} gradient={meta.grad} size={38} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate hover:underline" style={{ color: C.textPri }}>{u.name}</p>
                      <p className="text-[10px] truncate" style={{ color: C.textMuted }}>{u.email}</p>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: C.textSec }}>{u.specialty}</p>
                  </div>

                  {/* Role */}
                  <div className="col-span-1">
                    <RolePill role={u.role} />
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <StatusBadge status={u.status} />
                  </div>

                  {/* Commission */}
                  <div className="col-span-2">
                    {u.role === 'therapist' ? (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/30">
                        {u.commRate}% Comm.
                      </span>
                    ) : (
                      <span className="text-[10px]" style={{ color: C.textMuted }}>—</span>
                    )}
                  </div>

                  {/* Joined */}
                  <div className="col-span-1">
                    <p className="text-[11px]" style={{ color: C.textMuted }}>{u.joined}</p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end gap-1.5">
                    <button
                      onClick={() => setEditing(u)}
                      aria-label={`Edit ${u.name}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110 border"
                      style={{ background: C.inputBg, borderColor: C.inputBdr, color: C.textSec }}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleStatus(u.id)}
                      aria-label={u.status === 'active' ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110 border"
                      style={{
                        background: u.status === 'active' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                        borderColor: u.status === 'active' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                        color: u.status === 'active' ? '#ef4444' : '#059669',
                      }}>
                      {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold" style={{ color: C.textSec }}>No users matched your query</p>
              <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>Try adjusting your search terms or filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Cards — Mobile & Tablet */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((u, i) => {
            const meta = ROLE_META[u.role] || ROLE_META.staff;
            return (
              <motion.article
                key={u.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="rounded-2xl border p-4 space-y-3"
                style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <div className="flex items-start gap-3">
                  <Avatar name={u.name} gradient={meta.grad} size={42} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate" style={{ color: C.textPri }}>{u.name}</p>
                    <p className="text-[11px] truncate flex items-center gap-1" style={{ color: C.textMuted }}>
                      <Mail className="w-3 h-3 shrink-0" />
                      {u.email}
                    </p>
                    <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: C.textSec }}>
                      <Briefcase className="w-3 h-3 shrink-0" />
                      {u.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t flex-wrap" style={{ borderColor: C.divider }}>
                  <div className="flex items-center gap-2">
                    <RolePill role={u.role} />
                    <StatusBadge status={u.status} />
                  </div>
                  {u.role === 'therapist' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {u.commRate}% Comm.
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setViewing(u)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border text-center"
                    style={{ background: C.inputBg, borderColor: C.inputBdr, color: C.textSec }}>
                    View Details
                  </button>
                  <button
                    onClick={() => setEditing(u)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white text-center bg-gradient-to-r from-emerald-600 to-emerald-800">
                    Edit
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {adding && (
          <AddUserModal
            allUsers={users}
            onClose={() => setAdding(false)}
            onAdd={u => {
              onUsersChange(prev => [u, ...prev]);
              setAdding(false);
              flash('New user profile added successfully!', 'linear-gradient(135deg,#0a3d30,#062c22)');
            }}
          />
        )}
        {editing && (
          <EditUserModal
            user={editing}
            allUsers={users}
            onClose={() => setEditing(null)}
            onSave={updated => {
              onUsersChange(prev => prev.map(u => (u.id === updated.id ? updated : u)));
              setEditing(null);
              flash('User profile saved successfully', 'linear-gradient(135deg,#16a34a,#15803d)');
            }}
          />
        )}
        {viewing && (
          <ViewUserModal
            user={viewing}
            onClose={() => setViewing(null)}
            onEdit={u => {
              setViewing(null);
              setEditing(u);
            }}
          />
        )}
      </AnimatePresence>


    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB 2: WORK SCHEDULES                                          */
/* ═══════════════════════════════════════════════════════════════ */
function TabSchedules({ users }) {
  const C = useC();
  const buildDefault = () => Object.fromEntries(DAYS.map((d, i) => [d, i < 5 ? ['morning', 'afternoon'] : (i === 5 ? ['morning'] : [])]));
  const initAll = () => Object.fromEntries(users.map(u => [u.id, buildDefault()]));
  const teamUsers = users.filter(u => u.role === 'staff' || u.role === 'therapist');

  const [selected, setSelected]   = useState(teamUsers[0]?.id || null);
  const [schedules, setSchedules] = useState(initAll);
  const [roleFilter, setRoleFilter] = useState('all');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const filteredTeam = teamUsers.filter(u => roleFilter === 'all' || u.role === roleFilter);
  const person = filteredTeam.find(u => u.id === selected) || null;
  const sched  = selected ? (schedules[selected] || {}) : {};
  const totalShifts = Object.values(sched).reduce((a, b) => a + b.length, 0);

  const toggle = (day, shiftId) => {
    setSchedules(prev => {
      const curr = prev[selected]?.[day] || [];
      const next = curr.includes(shiftId) ? curr.filter(s => s !== shiftId) : [...curr, shiftId];
      return { ...prev, [selected]: { ...(prev[selected] || {}), [day]: next } };
    });
    setSaved(false);
  };

  const clearDay = (day) => {
    setSchedules(prev => ({ ...prev, [selected]: { ...(prev[selected] || {}), [day]: [] } }));
    setSaved(false);
  };

  const setFullWeek = () => {
    if (!selected) return;
    setSchedules(prev => ({ ...prev, [selected]: Object.fromEntries(DAYS.map(d => [d, ['morning', 'afternoon']])) }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight" style={{ color: C.textPri }}>Work Schedules</h2>
          <p className="text-xs" style={{ color: C.textMuted }}>Assign and manage weekly shifts for team members</p>
        </div>

        {person && (
          <div className="flex items-center gap-2">
            <button
              onClick={setFullWeek}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors"
              style={{ borderColor: C.cardBorder, color: C.textSec, background: C.cardBg }}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Full Week</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md">
              {saving ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Shifts'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Team List */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl sm:rounded-3xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: C.divider }}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Team Member</p>
              <div className="flex gap-1">
                {['all', 'staff', 'therapist'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-lg transition-all"
                    style={{ background: roleFilter === r ? C.pillAct : 'transparent', color: roleFilter === r ? '#fff' : C.textMuted }}>
                    {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 p-2">
              {filteredTeam.map(u => {
                const isSel = selected === u.id;
                const m = ROLE_META[u.role] || ROLE_META.staff;
                const total = Object.values(schedules[u.id] || {}).reduce((a, b) => a + b.length, 0);

                return (
                  <button
                    key={u.id}
                    onClick={() => setSelected(u.id)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left shrink-0 lg:shrink w-[180px] lg:w-auto transition-all"
                    style={{
                      background: isSel ? (C.isDark ? 'rgba(5,150,105,0.12)' : 'rgba(10,61,48,0.06)') : 'transparent',
                      border: `1.5px solid ${isSel ? '#059669' : 'transparent'}`,
                    }}>
                    <Avatar name={u.name} gradient={m.grad} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate" style={{ color: C.textPri }}>{u.name}</p>
                      <p className="text-[10px] truncate" style={{ color: C.textMuted }}>{u.specialty}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-black text-emerald-600">{total * 4}h</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Schedule Builder Grid */}
        <div className="lg:col-span-8">
          {!person ? (
            <div className="h-64 rounded-2xl sm:rounded-3xl border border-dashed flex flex-col items-center justify-center gap-2" style={{ borderColor: C.cardBorder }}>
              <CalendarDays className="w-8 h-8 text-slate-300" />
              <p className="font-bold text-xs text-slate-400">Select a team member to view & set shifts</p>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.divider }}>
                <Avatar name={person.name} gradient={ROLE_META[person.role]?.grad} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate" style={{ color: C.textPri }}>{person.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{person.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Weekly Total</p>
                  <p className="text-base font-black text-emerald-600">{totalShifts * 4} Hours</p>
                </div>
              </div>

              {/* Shift Types Legend */}
              <div className="flex items-center gap-3 px-5 py-2.5 border-b flex-wrap" style={{ borderColor: C.divider, background: C.inputBg }}>
                {SHIFTS.map(sh => (
                  <div key={sh.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: sh.color }} />
                    <span className="text-xs font-semibold" style={{ color: C.textSec }}>{sh.label}</span>
                    <span className="text-[10px] text-slate-400">({sh.time})</span>
                  </div>
                ))}
              </div>

              {/* Day Rows */}
              <div className="p-4 space-y-2.5">
                {DAYS.map(day => {
                  const dayShifts = sched[day] || [];
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-10 shrink-0">
                        <p className="text-xs font-black" style={{ color: C.textPri }}>{day}</p>
                        {dayShifts.length > 0 && (
                          <button onClick={() => clearDay(day)} className="text-[9px] text-red-500 font-bold hover:underline">
                            clear
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2 flex-1 flex-wrap">
                        {SHIFTS.map(sh => {
                          const active = dayShifts.includes(sh.id);
                          return (
                            <button
                              key={sh.id}
                              onClick={() => toggle(day, sh.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                              style={{
                                background: active ? sh.bg : C.inputBg,
                                borderColor: active ? sh.color : C.inputBdr,
                                color: active ? sh.color : C.textMuted,
                              }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? sh.color : '#cbd5e1' }} />
                              <span>{sh.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="w-12 text-right shrink-0">
                        <span className="text-xs font-bold" style={{ color: dayShifts.length > 0 ? '#059669' : C.textMuted }}>
                          {dayShifts.length > 0 ? `${dayShifts.length * 4}h` : 'Off'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB 3: THERAPIST QUEUE                                         */
/* ═══════════════════════════════════════════════════════════════ */
function TabQueue({ users }) {
  const C = useC();
  const { toast } = useToast();
  const therapists = users.filter(u => u.role === 'therapist' && u.status === 'active');
  const [queue, setQueue] = useState(therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0 })));

  const flash = (msg) => toast.success(msg);

  const moveUp = (idx) => {
    if (idx === 0) return;
    const q = [...queue];
    [q[idx - 1], q[idx]] = [q[idx], q[idx - 1]];
    setQueue(q.map((it, i) => ({ ...it, position: i + 1 })));
    flash('Queue order updated');
  };

  const moveDown = (idx) => {
    if (idx === queue.length - 1) return;
    const q = [...queue];
    [q[idx], q[idx + 1]] = [q[idx + 1], q[idx]];
    setQueue(q.map((it, i) => ({ ...it, position: i + 1 })));
    flash('Queue order updated');
  };

  const markServed = (id) => {
    setQueue(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx < 0) return prev;
      const served = { ...prev[idx], sessions: prev[idx].sessions + 1 };
      const rest   = prev.filter((_, i) => i !== idx);
      return [...rest, served].map((it, i) => ({ ...it, position: i + 1 }));
    });
    flash('Therapist served session — rotated to back of queue');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight" style={{ color: C.textPri }}>Therapist Queue</h2>
          <p className="text-xs" style={{ color: C.textMuted }}>Rotation order for walk-in and unassigned client sessions</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {queue.length} Therapists On-Duty
          </span>
          <button
            onClick={() => setQueue(therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0 })))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border"
            style={{ borderColor: C.cardBorder, color: C.textSec, background: C.cardBg }}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Rotation</span>
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {queue.map((t, idx) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-4 flex items-center gap-4 transition-all"
            style={{
              background: C.cardBg,
              borderColor: idx === 0 ? '#059669' : C.cardBorder,
              boxShadow: idx === 0 ? '0 4px 20px rgba(5,150,105,0.12)' : 'none',
            }}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0"
              style={{
                background: idx === 0 ? 'linear-gradient(135deg,#062c22,#0a3d30)' : C.pillBg,
                color: idx === 0 ? '#ffffff' : C.textMuted,
              }}>
              #{t.position}
            </div>

            <Avatar name={t.name} gradient={ROLE_META[t.role]?.grad} size={40} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-sm truncate" style={{ color: C.textPri }}>{t.name}</p>
                {idx === 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">NEXT UP</span>
                )}
              </div>
              <p className="text-xs truncate" style={{ color: C.textMuted }}>{t.specialty}</p>
            </div>

            <div className="text-right hidden sm:block shrink-0">
              <p className="text-xs font-bold" style={{ color: C.textSec }}>{t.sessions} Sessions Today</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-30">
                <ChevronUp className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={idx === queue.length - 1}
                className="w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-30">
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => markServed(t.id)}
                className="ml-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-800">
                Assign & Rotate
              </button>
            </div>
          </motion.div>
        ))}
      </div>


    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB 4: PERMISSIONS (RBAC)                                      */
/* ═══════════════════════════════════════════════════════════════ */
function TabRBAC() {
  const C = useC();
  const { toast } = useToast();
  const [perms, setPerms]   = useState(INITIAL_PERMS);
  const [saving, setSaving] = useState(false);

  const toggle = (role, perm) => {
    if (ROLE_META[role]?.locked) return;
    setPerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success('Permissions updated successfully!');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2" style={{ color: C.textPri }}>
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>Role-Based Access Control (RBAC)</span>
          </h2>
          <p className="text-xs" style={{ color: C.textMuted }}>Configure permission levels per system role</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md">
          {saving ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Permissions'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(ROLE_META).map(([role, meta]) => {
          const Icon = meta.icon;
          const rp   = perms[role];
          const cnt  = Object.values(rp).filter(Boolean).length;
          const total= Object.keys(rp).length;

          return (
            <div key={role} className="rounded-3xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.divider }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: meta.grad }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm" style={{ color: C.textPri }}>{meta.label}</h3>
                    <p className="text-xs text-slate-400">{meta.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600">{cnt} of {total} Enabled</span>
                  {meta.locked && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                      System Locked
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x" style={{ borderColor: C.divider }}>
                {Object.entries(PERM_META).map(([pk, pm]) => {
                  const PIc = pm.icon;
                  const active = rp[pk];

                  return (
                    <div
                      key={pk}
                      onClick={() => toggle(role, pk)}
                      className="p-4 flex flex-col items-center text-center gap-2 transition-colors cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: active ? `${pm.color}15` : C.pillBg }}>
                        <PIc className="w-4 h-4" style={{ color: active ? pm.color : C.textMuted }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: C.textPri }}>{pm.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pm.desc}</p>
                      </div>
                      <Toggle on={active} onChange={() => toggle(role, pk)} disabled={meta.locked} id={`${role}-${pk}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT ROOT                                             */
/* ═══════════════════════════════════════════════════════════════ */
export default function AdminUserMaintenance() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profiles';
  const [users, setUsers] = useState(MOCK_USERS);

  const subMap = {
    profiles:  'User Profiles',
    schedules: 'Work Schedules',
    queue:     'Therapist Queue',
    rbac:      'Permissions',
  };

  return (
    <AdminLayout title="User Management" subtitle={subMap[activeTab] || 'User Profiles'} icon={UserCog}>
      <AnimatePresence mode="wait">
        {activeTab === 'profiles' && (
          <motion.div key="profiles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <TabProfiles users={users} onUsersChange={setUsers} />
          </motion.div>
        )}
        {activeTab === 'schedules' && (
          <motion.div key="schedules" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <TabSchedules users={users} />
          </motion.div>
        )}
        {activeTab === 'queue' && (
          <motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <TabQueue users={users} />
          </motion.div>
        )}
        {activeTab === 'rbac' && (
          <motion.div key="rbac" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <TabRBAC />
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}