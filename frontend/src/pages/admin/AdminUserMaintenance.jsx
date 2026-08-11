import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import {
  Users, Calendar, Shield, Lock, Save,
  CheckCircle2, Crown, Stethoscope, UserCog, User,
  ListOrdered, Search, X, Edit3,
  CalendarDays, Star, Clock,
  ChevronUp, ChevronDown,
  BadgeCheck, TrendingUp, Activity, SlidersHorizontal,
  RotateCcw, CheckCheck, Plus, Eye, EyeOff, AlertCircle,
  Phone, Mail, Briefcase, ArrowUpDown, Filter,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════ */
/*  CONFIG                                                          */
/* ═══════════════════════════════════════════════════════════════ */
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHIFTS = [
  { id: 'morning',   label: 'Morning',   time: '08:00–12:00', color: '#f59e0b' },
  { id: 'afternoon', label: 'Afternoon', time: '13:00–17:00', color: '#3b82f6' },
  { id: 'evening',   label: 'Evening',   time: '18:00–22:00', color: '#8b5cf6' },
];

const ROLE_META = {
  admin:     { label: 'Administrator',    desc: 'Full system control',          icon: Crown,       grad: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#0a3d30', locked: true  },
  staff:     { label: 'Staff Coordinator',desc: 'Manages scheduling & bookings', icon: UserCog,     grad: 'linear-gradient(135deg,#1e3a8a,#3b55e6)', color: '#3b55e6', locked: false },
  therapist: { label: 'Therapist',        desc: 'Assigned session access',       icon: Stethoscope, grad: 'linear-gradient(135deg,#78350f,#b45309)', color: '#b45309', locked: false },
  client:    { label: 'Client',           desc: 'Self-service booking portal',   icon: User,        grad: 'linear-gradient(135deg,#4338ca,#6366f1)', color: '#6366f1', locked: false },
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

let nextId = 6;
const MOCK_USERS = [
  { id: 1, name: 'Anna Reyes',     email: 'anna@cozy.spa',    phone: '+63 919 555 6666', role: 'therapist', specialty: 'Swedish & Hot Stone',   status: 'active',   joined: '2025-02-20', commRate: 35 },
  { id: 2, name: 'Leo Garcia',     email: 'leo@cozy.spa',     phone: '+63 920 777 8888', role: 'therapist', specialty: 'Deep Tissue & Sports',   status: 'active',   joined: '2025-05-15', commRate: 35 },
  { id: 3, name: 'Grace Tan',      email: 'grace@cozy.spa',   phone: '+63 921 999 0000', role: 'therapist', specialty: 'Hilot & Shiatsu',        status: 'inactive', joined: '2025-06-01', commRate: 30 },
  { id: 4, name: 'Maria Santos',   email: 'maria@cozy.spa',   phone: '+63 917 111 2222', role: 'staff',     specialty: 'Front Desk Coordinator', status: 'active',   joined: '2025-03-10', commRate: 0  },
  { id: 5, name: 'Juan Dela Cruz', email: 'juan@cozy.spa',    phone: '+63 918 333 4444', role: 'staff',     specialty: 'Operations Lead',        status: 'active',   joined: '2025-04-01', commRate: 0  },
];

const EMPTY_FORM = { name: '', email: '', phone: '', specialty: '', role: 'staff', status: 'active', commRate: 0, password: '', confirmPassword: '' };

/* ═══════════════════════════════════════════════════════════════ */
/*  SHARED ATOMS                                                    */
/* ═══════════════════════════════════════════════════════════════ */
function useC() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    isDark,
    cardBg:    isDark ? '#141927' : '#ffffff',
    cardBorder:isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    pageBg:    isDark ? '#0c1020' : '#f8fafc',
    inputBg:   isDark ? '#0f1420' : '#f8fafc',
    inputBdr:  isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0',
    textPri:   isDark ? '#f1f5f9' : '#0f172a',
    textSec:   isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#475569' : '#94a3b8',
    divider:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    rowHover:  isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    pillBg:    isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
    pillAct:   isDark ? '#059669' : '#0a3d30',
  };
}

function Avatar({ name, gradient, size = 36 }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center font-black text-white flex-shrink-0 select-none"
      style={{ width: size, height: size, borderRadius: size * 0.3, background: gradient || 'linear-gradient(135deg,#062c22,#0a3d30)', fontSize: size * 0.38 }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function RolePill({ role }) {
  const MAP = {
    admin:     { bg: 'rgba(10,61,48,0.12)',  color: '#0a3d30', label: 'Admin'     },
    staff:     { bg: 'rgba(59,85,230,0.12)', color: '#3b55e6', label: 'Staff'     },
    therapist: { bg: 'rgba(180,83,9,0.12)',  color: '#b45309', label: 'Therapist' },
    client:    { bg: 'rgba(99,102,241,0.12)',color: '#6366f1', label: 'Client'    },
  };
  const c = MAP[role] || { bg: '#f3f4f6', color: '#6b7280', label: role };
  return (
    <span className="inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const on = status === 'active';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />
      <span className={`text-[10px] font-semibold ${on ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{on ? 'Active' : 'Inactive'}</span>
    </span>
  );
}

function Toggle({ on, onChange, disabled, id }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} id={id}
      disabled={disabled} onClick={() => !disabled && onChange(!on)}
      className="relative inline-flex items-center flex-shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      style={{ width: 40, height: 22, borderRadius: 11, border: 'none', padding: 0,
        background: disabled ? (on ? 'rgba(10,61,48,0.25)' : '#d1d5db') : (on ? 'linear-gradient(135deg,#0a3d30,#062c22)' : '#d1d5db'),
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: on && !disabled ? '0 2px 8px rgba(10,61,48,0.3)' : 'none',
      }}>
      <motion.span
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {disabled && <Lock className="w-2.5 h-2.5 text-slate-400" aria-hidden="true" />}
      </motion.span>
    </button>
  );
}

function ToastMsg({ msg, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 28, scale: 0.94 }} transition={{ duration: 0.22 }}
      role="alert" aria-live="assertive"
      className="fixed bottom-6 left-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-2xl"
      style={{ transform: 'translateX(-50%)', background: color || 'linear-gradient(135deg,#0a3d30,#062c22)', whiteSpace: 'nowrap' }}>
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {msg}
    </motion.div>
  );
}

function ModalBackdrop({ onClose, children, labelId }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div ref={ref}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby={labelId}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  VALIDATION                                                      */
/* ═══════════════════════════════════════════════════════════════ */
function validateUserForm(form, isNew = false, allUsers = []) {
  const e = {};
  if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Full name is required (min. 2 characters)';
  if (!form.email.trim()) e.email = 'Email address is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email (e.g. user@cozy.spa)';
  else if (isNew && allUsers.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase())) e.email = 'This email is already registered';
  if (!form.phone.trim()) e.phone = 'Phone number is required';
  else if (!/^[+\d\s\-()]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
  if (!form.specialty.trim()) e.specialty = 'Specialization / position is required';
  if (form.role === 'therapist') {
    const cr = Number(form.commRate);
    if (isNaN(cr) || cr < 0) e.commRate = 'Commission must be 0 or more';
    if (cr > 100) e.commRate = 'Commission cannot exceed 100%';
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

/* ═══════════════════════════════════════════════════════════════ */
/*  SHARED FORM FIELD                                              */
/* ═══════════════════════════════════════════════════════════════ */
function FormField({ label, id, error, children, hint }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  ADD USER MODAL                                                  */
/* ═══════════════════════════════════════════════════════════════ */
function AddUserModal({ onClose, onAdd, allUsers }) {
  const C = useC();
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [step,   setStep]   = useState(1);
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  const set = (key, val) => { setForm(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: '' })); };

  const iCls = (err) => [
    'w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all',
    'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
    err ? 'border-red-500 ring-2 ring-red-500/20' : '',
  ].join(' ');
  const iStyle = (err) => ({ background: C.inputBg, border: `1.5px solid ${err ? '#ef4444' : C.inputBdr}`, color: C.textPri });

  const handleNext = () => {
    const e = {};
    ['name','email','phone','specialty'].forEach(f => { if (!form[f].trim()) e[f] = `${f.charAt(0).toUpperCase() + f.slice(1)} is required`; });
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    if (form.email.trim() && allUsers.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase())) e.email = 'Email already registered';
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(2);
  };

  const handleSubmit = () => {
    const e = validateUserForm(form, true, allUsers);
    if (Object.keys(e).length) { setErrors(e); return; }
    onAdd({ id: nextId++, name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), specialty: form.specialty.trim(), role: form.role, status: form.status, commRate: Number(form.commRate), joined: new Date().toISOString().slice(0, 10) });
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="add-user-title">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col"
        style={{ background: C.cardBg, borderColor: C.cardBorder, maxHeight: '95dvh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Plus className="w-4 h-4" aria-hidden="true" /></div>
            <div>
              <h2 id="add-user-title" className="font-black text-white text-sm">Add New User</h2>
              <p className="text-[10px] text-emerald-200/80 mt-0.5">Step {step} of 2 — {step === 1 ? 'Basic Information' : 'Account Setup'}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 sm:px-6 pt-3 pb-3 flex-shrink-0 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.divider}` }}>
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
                  style={{ background: s <= step ? 'linear-gradient(135deg,#059669,#0a3d30)' : C.pillBg, color: s <= step ? '#fff' : C.textMuted }}>
                  {s < step ? <CheckCheck className="w-3 h-3" aria-hidden="true" /> : s}
                </div>
                <span className="text-[10px] font-bold hidden sm:block" style={{ color: s <= step ? '#059669' : C.textMuted }}>
                  {s === 1 ? 'Basic Info' : 'Account Setup'}
                </span>
              </div>
              {s < 2 && <div className="flex-1 h-px" style={{ background: C.divider }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.15 }} className="space-y-4">
                <FormField label="Full Name *" id="fn-name" error={errors.name}>
                  <input ref={firstRef} id="fn-name" type="text" placeholder="e.g. Maria Santos" value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" aria-required="true" className={iCls(errors.name)} style={iStyle(errors.name)} />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Email Address *" id="fn-email" error={errors.email}>
                    <input id="fn-email" type="email" placeholder="maria@cozy.spa" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" aria-required="true" className={iCls(errors.email)} style={iStyle(errors.email)} />
                  </FormField>
                  <FormField label="Phone Number *" id="fn-phone" error={errors.phone}>
                    <input id="fn-phone" type="tel" placeholder="+63 917 123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" aria-required="true" className={iCls(errors.phone)} style={iStyle(errors.phone)} />
                  </FormField>
                </div>
                <FormField label="Specialization / Position *" id="fn-spec" error={errors.specialty}>
                  <input id="fn-spec" type="text" placeholder="e.g. Deep Tissue Therapist" value={form.specialty} onChange={e => set('specialty', e.target.value)} aria-required="true" className={iCls(errors.specialty)} style={iStyle(errors.specialty)} />
                </FormField>

                {/* Role */}
                <div className="space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Role *</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(ROLE_META).filter(([k]) => k !== 'admin').map(([k, v]) => {
                      const Ic = v.icon; const isSelected = form.role === k;
                      return (
                        <button key={k} type="button" onClick={() => set('role', k)} aria-pressed={isSelected}
                          className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          style={{ background: isSelected ? `${v.color}15` : C.inputBg, borderColor: isSelected ? v.color : C.inputBdr }}>
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isSelected ? v.grad : C.pillBg }}>
                            <Ic className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                          </div>
                          <span className="text-[10px] font-bold text-center leading-tight" style={{ color: isSelected ? v.color : C.textMuted }}>{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Commission */}
                {form.role === 'therapist' && (
                  <FormField label="Commission Rate (%) *" id="fn-comm" error={errors.commRate}>
                    <input id="fn-comm" type="number" min="0" max="100" value={form.commRate} onChange={e => set('commRate', e.target.value)} className={iCls(errors.commRate)} style={iStyle(errors.commRate)} />
                  </FormField>
                )}
              </motion.div>
            ) : (
              <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }} className="space-y-4">
                {/* Summary card */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: C.inputBg, borderColor: C.cardBorder }}>
                  <Avatar name={form.name} gradient={ROLE_META[form.role]?.grad} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-sm truncate" style={{ color: C.textPri }}>{form.name || 'New User'}</p>
                    <p className="text-[11px] truncate" style={{ color: C.textSec }}>{form.email}</p>
                    <div className="mt-1"><RolePill role={form.role} /></div>
                  </div>
                </div>

                {/* Password */}
                <FormField label="Password *" id="fn-pw" error={errors.password}>
                  <div className="relative">
                    <input id="fn-pw" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} aria-required="true" className={`${iCls(errors.password)} pr-10`} style={iStyle(errors.password)} />
                    <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </FormField>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-700 dark:text-blue-300">
                  Requirements: 8+ characters, 1 uppercase letter, 1 number.
                </div>

                {/* Confirm Password */}
                <FormField label="Confirm Password *" id="fn-cpw" error={errors.confirmPassword}>
                  <div className="relative">
                    <input id="fn-cpw" type={showCf ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} aria-required="true" className={`${iCls(errors.confirmPassword)} pr-10`} style={iStyle(errors.confirmPassword)} />
                    <button type="button" onClick={() => setShowCf(p => !p)} aria-label={showCf ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showCf ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </FormField>

                {/* Status */}
                <div className="space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Account Status</p>
                  <div className="flex gap-2">
                    {['active', 'inactive'].map(s => (
                      <button key={s} type="button" onClick={() => set('status', s)} aria-pressed={form.status === s}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        style={{ background: form.status === s ? (s === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)') : C.inputBg, borderColor: form.status === s ? (s === 'active' ? '#10b981' : '#ef4444') : C.inputBdr, color: form.status === s ? (s === 'active' ? '#059669' : '#dc2626') : C.textMuted }}>
                        {s === 'active' ? '✓ Active Account' : '✕ Inactive'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.divider}`, background: C.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(248,250,252,0.8)' }}>
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors" style={{ borderColor: C.cardBorder, color: C.textSec }}>Cancel</button>
              <button onClick={handleNext} className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 active:scale-95 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Next →</button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors" style={{ borderColor: C.cardBorder, color: C.textSec }}>← Back</button>
              <button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 active:scale-95 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Add User</button>
            </>
          )}
        </div>
      </motion.div>
    </ModalBackdrop>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  EDIT USER MODAL                                                 */
/* ═══════════════════════════════════════════════════════════════ */
function EditUserModal({ user, onClose, onSave, allUsers }) {
  const C = useC();
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);
  const [form,   setForm]   = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '', specialty: user.specialty || '', role: user.role || 'staff', status: user.status || 'active', commRate: user.commRate ?? 0 });
  const [errors, setErrors] = useState({});

  const set = (key, val) => { setForm(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: '' })); };
  const iCls = (err) => `w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 ${err ? 'border-red-500 ring-2 ring-red-500/20' : ''}`;
  const iStyle = (err) => ({ background: C.inputBg, border: `1.5px solid ${err ? '#ef4444' : C.inputBdr}`, color: C.textPri });

  const handleSave = () => {
    const others = allUsers.filter(u => u.id !== user.id);
    const e = validateUserForm(form, false, others);
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...user, ...form, commRate: Number(form.commRate) });
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="edit-user-title">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col"
        style={{ background: C.cardBg, borderColor: C.cardBorder, maxHeight: '95dvh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 flex-shrink-0 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={form.name} gradient={ROLE_META[form.role]?.grad} size={38} />
            <div className="min-w-0">
              <h2 id="edit-user-title" className="font-black text-white text-sm">Edit User Profile</h2>
              <p className="text-[10px] text-emerald-200/80 mt-0.5 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
          <FormField label="Full Name *" id="eu-name" error={errors.name}>
            <input ref={firstRef} id="eu-name" type="text" value={form.name} onChange={e => set('name', e.target.value)} className={iCls(errors.name)} style={iStyle(errors.name)} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email Address *" id="eu-email" error={errors.email}>
              <input id="eu-email" type="email" value={form.email} onChange={e => set('email', e.target.value)} className={iCls(errors.email)} style={iStyle(errors.email)} />
            </FormField>
            <FormField label="Phone Number *" id="eu-phone" error={errors.phone}>
              <input id="eu-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={iCls(errors.phone)} style={iStyle(errors.phone)} />
            </FormField>
          </div>
          <FormField label="Specialization / Position *" id="eu-spec" error={errors.specialty}>
            <input id="eu-spec" type="text" value={form.specialty} onChange={e => set('specialty', e.target.value)} className={iCls(errors.specialty)} style={iStyle(errors.specialty)} />
          </FormField>

          {/* Role */}
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Role</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_META).map(([k, v]) => {
                const Ic = v.icon; const isSelected = form.role === k;
                return (
                  <button key={k} type="button" onClick={() => set('role', k)} aria-pressed={isSelected}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    style={{ background: isSelected ? `${v.color}15` : C.inputBg, borderColor: isSelected ? v.color : C.inputBdr }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isSelected ? v.grad : C.pillBg }}>
                      <Ic className="w-3 h-3 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold truncate" style={{ color: isSelected ? v.color : C.textSec }}>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commission */}
          {form.role === 'therapist' && (
            <FormField label="Commission Rate (%)" id="eu-comm" error={errors.commRate}>
              <input id="eu-comm" type="number" min="0" max="100" value={form.commRate} onChange={e => set('commRate', e.target.value)} className={iCls(errors.commRate)} style={iStyle(errors.commRate)} />
            </FormField>
          )}

          {/* Status */}
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Account Status</p>
            <div className="flex gap-2">
              {['active', 'inactive'].map(s => (
                <button key={s} type="button" onClick={() => set('status', s)} aria-pressed={form.status === s}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  style={{ background: form.status === s ? (s === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)') : C.inputBg, borderColor: form.status === s ? (s === 'active' ? '#10b981' : '#ef4444') : C.inputBdr, color: form.status === s ? (s === 'active' ? '#059669' : '#dc2626') : C.textMuted }}>
                  {s === 'active' ? '✓ Active Account' : '✕ Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-5 sm:px-6 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.divider}` }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors" style={{ borderColor: C.cardBorder, color: C.textSec }}>Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-xs font-black text-white active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" style={{ background: 'linear-gradient(135deg,#0a3d30,#062c22)', boxShadow: '0 4px 12px rgba(10,61,48,0.25)' }}>Save Changes</button>
        </div>
      </motion.div>
    </ModalBackdrop>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: USER PROFILES                                              */
/* ═══════════════════════════════════════════════════════════════ */
function TabProfiles({ users, onUsersChange }) {
  const C = useC();
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editing,    setEditing]    = useState(null);
  const [adding,     setAdding]     = useState(false);
  const [sortField,  setSortField]  = useState('name');
  const [sortDir,    setSortDir]    = useState('asc');
  const [toast,      setToast]      = useState(null);

  const flash = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = users.filter(u => (roleFilter === 'all' || u.role === roleFilter) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.specialty.toLowerCase().includes(q)));
    return [...list].sort((a, b) => sortDir === 'asc' ? String(a[sortField]||'').localeCompare(String(b[sortField]||'')) : String(b[sortField]||'').localeCompare(String(a[sortField]||'')));
  }, [users, search, roleFilter, sortField, sortDir]);

  const toggleSort = (f) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('asc'); } };
  const toggleStatus = (id) => { onUsersChange(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)); flash('Status updated', 'linear-gradient(135deg,#16a34a,#15803d)'); };

  const SH = ({ field, label }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors focus-visible:outline-none">
      {label}
      {sortField === field ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-600" /> : <ChevronDown className="w-3 h-3 text-emerald-600" />) : <ArrowUpDown className="w-3 h-3 opacity-25" />}
    </button>
  );

  /* KPI row */
  const stats = [
    { label: 'Total', value: users.length, cl: 'bg-slate-100/60 dark:bg-white/5', t: C.textPri },
    { label: 'Active', value: users.filter(u => u.status==='active').length, cl: 'bg-emerald-500/10', t: '#059669' },
    { label: 'Therapists', value: users.filter(u => u.role==='therapist').length, cl: 'bg-amber-500/10', t: '#b45309' },
    { label: 'Staff', value: users.filter(u => u.role==='staff').length, cl: 'bg-blue-500/10', t: '#3b55e6' },
  ];

  return (
    <div className="space-y-5">
      {/* Page header + KPIs */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black" style={{ color: C.textPri }}>User Profiles</h2>
          <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>All staff, therapist & team accounts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {stats.map(s => (
            <div key={s.label} className={`px-3 py-1.5 rounded-xl text-center min-w-[56px] ${s.cl}`}>
              <p className="text-sm font-black" style={{ color: s.t }}>{s.value}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl border flex flex-col sm:flex-row gap-3" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email or specialization…"
            aria-label="Search users" className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/30"
            style={{ background: C.inputBg, borderColor: search ? '#059669' : C.inputBdr, color: C.textPri }} />
          {search && <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"><X className="w-3 h-3 text-slate-500" /></button>}
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3" />Role:</span>
          {['all', 'staff', 'therapist'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="text-[10px] font-bold px-3 py-2 rounded-xl border transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              style={{ background: roleFilter === r ? C.pillAct : C.inputBg, color: roleFilter === r ? '#fff' : C.textSec, borderColor: roleFilter === r ? 'transparent' : C.inputBdr }}>
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black text-white transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            style={{ background: 'linear-gradient(135deg,#059669,#0a3d30)', boxShadow: '0 4px 14px rgba(10,61,48,0.3)' }}>
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /><span className="whitespace-nowrap">Add User</span>
          </button>
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden lg:block rounded-3xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
        <div className="grid grid-cols-12 px-6 py-3 border-b" style={{ background: C.isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderColor: C.divider }}>
          <div className="col-span-3"><SH field="name"      label="User" /></div>
          <div className="col-span-3"><SH field="specialty" label="Specialization" /></div>
          <div className="col-span-1"><SH field="role"      label="Role" /></div>
          <div className="col-span-1"><SH field="status"    label="Status" /></div>
          <div className="col-span-2"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Commission</span></div>
          <div className="col-span-1"><SH field="joined"    label="Joined" /></div>
          <div className="col-span-1 text-right"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</span></div>
        </div>
        <div className="divide-y" style={{ borderColor: C.divider }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((u, i) => {
              const meta = ROLE_META[u.role] || ROLE_META.staff;
              return (
                <motion.div key={u.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.02, duration: 0.2 }}
                  className="grid grid-cols-12 gap-2 px-6 py-3.5 items-center transition-colors" style={{ ':hover': { background: C.rowHover } }}
                  onMouseEnter={e => e.currentTarget.style.background = C.rowHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <Avatar name={u.name} gradient={meta.grad} size={36} />
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color: C.textPri }}>{u.name}</p>
                      <p className="text-[10px] truncate" style={{ color: C.textMuted }}>{u.email}</p>
                    </div>
                  </div>
                  <div className="col-span-3 min-w-0"><p className="text-[11px] font-medium truncate" style={{ color: C.textSec }}>{u.specialty}</p></div>
                  <div className="col-span-1"><RolePill role={u.role} /></div>
                  <div className="col-span-1"><StatusBadge status={u.status} /></div>
                  <div className="col-span-2">
                    {u.role === 'therapist' ? <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-500/25">{u.commRate}% Comm.</span> : <span className="text-[10px]" style={{ color: C.textMuted }}>—</span>}
                  </div>
                  <div className="col-span-1"><p className="text-[10px]" style={{ color: C.textMuted }}>{u.joined}</p></div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" style={{ background: C.pillBg, color: C.textSec }}>
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button onClick={() => toggleStatus(u.id)} aria-label={u.status === 'active' ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      style={{ background: C.pillBg, color: u.status === 'active' ? '#ef4444' : '#059669' }}>
                      <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 mx-auto mb-3" style={{ color: C.textMuted }} aria-hidden="true" />
              <p className="text-sm font-bold" style={{ color: C.textSec }}>No users found</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>Try adjusting your filters or add a new user.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cards — mobile/tablet */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((u, i) => {
            const meta = ROLE_META[u.role] || ROLE_META.staff;
            return (
              <motion.article key={u.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04, duration: 0.2 }}
                className="rounded-2xl border p-4 space-y-3" style={{ background: C.cardBg, borderColor: C.cardBorder }}
                aria-label={`User: ${u.name}`}>
                <div className="flex items-start gap-3">
                  <Avatar name={u.name} gradient={meta.grad} size={42} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate" style={{ color: C.textPri }}>{u.name}</p>
                    <p className="text-[10px] truncate flex items-center gap-1" style={{ color: C.textMuted }}><Mail className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{u.email}</p>
                    {u.phone && <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: C.textMuted }}><Phone className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{u.phone}</p>}
                    <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: C.textSec }}><Briefcase className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{u.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap"><RolePill role={u.role} /><StatusBadge status={u.status} /></div>
                  {u.role === 'therapist' && <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-500/25">{u.commRate}% Comm.</span>}
                  <span className="text-[9px] font-medium ml-auto" style={{ color: C.textMuted }}>Joined {u.joined}</span>
                </div>
                <div className="flex gap-2 pt-1 border-t" style={{ borderColor: C.divider }}>
                  <button onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    style={{ background: C.pillBg, color: C.textSec }}>
                    <Edit3 className="w-3 h-3" aria-hidden="true" /> Edit
                  </button>
                  <button onClick={() => toggleStatus(u.id)} aria-label={u.status === 'active' ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    style={{ background: u.status === 'active' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', color: u.status === 'active' ? '#dc2626' : '#059669' }}>
                    <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                    {u.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-full py-14 text-center rounded-2xl border border-dashed" style={{ borderColor: C.cardBorder }}>
            <Users className="w-10 h-10 mx-auto mb-3" style={{ color: C.textMuted }} aria-hidden="true" />
            <p className="text-sm font-bold" style={{ color: C.textSec }}>No users found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {adding && <AddUserModal allUsers={users} onClose={() => setAdding(false)} onAdd={u => { onUsersChange(prev => [u, ...prev]); setAdding(false); flash('New user added successfully!', 'linear-gradient(135deg,#0a3d30,#062c22)'); }} />}
        {editing && <EditUserModal user={editing} allUsers={users} onClose={() => setEditing(null)} onSave={updated => { onUsersChange(prev => prev.map(u => u.id === updated.id ? updated : u)); setEditing(null); flash('Profile saved successfully', 'linear-gradient(135deg,#16a34a,#15803d)'); }} />}
      </AnimatePresence>
      <AnimatePresence>{toast && <ToastMsg msg={toast.msg} color={toast.color} />}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: WORK SCHEDULES                                             */
/* ═══════════════════════════════════════════════════════════════ */
function TabSchedules({ users }) {
  const C = useC();
  const buildDefault = () => Object.fromEntries(DAYS.map((d, i) => [d, i < 5 ? ['morning', 'afternoon'] : (i === 5 ? ['morning'] : [])]));
  const initAll = () => Object.fromEntries(users.map(u => [u.id, buildDefault()]));
  const teamUsers = users.filter(u => u.role === 'staff' || u.role === 'therapist');
  const [selected,   setSelected]   = useState(teamUsers[0]?.id || null);
  const [schedules,  setSchedules]  = useState(initAll);
  const [roleFilter, setRoleFilter] = useState('all');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const filteredTeam = teamUsers.filter(u => roleFilter === 'all' || u.role === roleFilter);
  const person = filteredTeam.find(u => u.id === selected) || null;
  const sched  = selected ? (schedules[selected] || {}) : {};
  const totalShifts = Object.values(sched).reduce((a, b) => a + b.length, 0);

  const toggle = (day, shiftId) => {
    setSchedules(prev => { const curr = prev[selected]?.[day] || []; const next = curr.includes(shiftId) ? curr.filter(s => s !== shiftId) : [...curr, shiftId]; return { ...prev, [selected]: { ...(prev[selected] || {}), [day]: next } }; });
    setSaved(false);
  };
  const clearDay = (day) => { setSchedules(prev => ({ ...prev, [selected]: { ...(prev[selected] || {}), [day]: [] } })); setSaved(false); };
  const setFullWeek = () => { if (!selected) return; setSchedules(prev => ({ ...prev, [selected]: Object.fromEntries(DAYS.map(d => [d, ['morning', 'afternoon']])) })); setSaved(false); };
  const handleSave = async () => { setSaving(true); await new Promise(r => setTimeout(r, 700)); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3500); };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black" style={{ color: C.textPri }}>Work Schedules</h2>
          <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>Assign and manage shifts for each team member</p>
        </div>
        {person && (
          <div className="flex items-center gap-2">
            <button onClick={setFullWeek} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" style={{ borderColor: C.cardBorder, color: C.textSec, background: C.cardBg }}>
              <RotateCcw className="w-3 h-3" aria-hidden="true" /><span className="hidden sm:inline">Set Full Week</span>
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              style={{ background: saved ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#0a3d30,#062c22)', boxShadow: '0 4px 12px rgba(10,61,48,0.22)', minWidth: 100 }}>
              {saving ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Member list */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl sm:rounded-3xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: C.divider, background: C.isDark ? 'rgba(0,0,0,0.15)' : '#f8fafc' }}>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Member</p>
              <div className="flex gap-1">
                {['all', 'staff', 'therapist'].map(r => (
                  <button key={r} onClick={() => setRoleFilter(r)}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg transition-all focus-visible:outline-none"
                    style={{ background: roleFilter === r ? C.pillAct : 'transparent', color: roleFilter === r ? '#fff' : C.textMuted }}>
                    {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 p-2" style={{ scrollbarWidth: 'none' }}>
              {filteredTeam.map(u => {
                const m = ROLE_META[u.role] || ROLE_META.staff;
                const isSel = selected === u.id;
                const total = Object.values(schedules[u.id] || {}).reduce((a, b) => a + b.length, 0);
                return (
                  <button key={u.id} onClick={() => setSelected(u.id)} aria-pressed={isSel} aria-label={`Select ${u.name}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left flex-shrink-0 lg:flex-shrink w-[190px] lg:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    style={{ background: isSel ? (C.isDark ? 'rgba(5,150,105,0.12)' : 'rgba(10,61,48,0.07)') : 'transparent', border: `1px solid ${isSel ? 'rgba(10,61,48,0.2)' : 'transparent'}` }}>
                    <Avatar name={u.name} gradient={isSel ? m.grad : undefined} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold truncate" style={{ color: C.textPri }}>{u.name}</p>
                      <p className="text-[9px] truncate" style={{ color: C.textMuted }}>{u.specialty}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-black" style={{ color: isSel ? '#059669' : C.textMuted }}>{total}</p>
                      <p className="text-[8px]" style={{ color: C.textMuted }}>shifts</p>
                    </div>
                  </button>
                );
              })}
              {filteredTeam.length === 0 && <p className="text-center text-xs py-8 w-full" style={{ color: C.textMuted }}>No members found</p>}
            </div>
          </div>
        </div>

        {/* Schedule grid */}
        <div className="lg:col-span-8">
          {!person ? (
            <div className="h-48 sm:h-64 rounded-2xl sm:rounded-3xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ borderColor: C.cardBorder }}>
              <CalendarDays className="w-10 h-10" style={{ color: C.textMuted }} aria-hidden="true" />
              <p className="font-bold text-sm" style={{ color: C.textSec }}>Select a team member to view their schedule</p>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
              {/* Person header */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b" style={{ borderColor: C.divider, background: C.isDark ? 'rgba(5,150,105,0.06)' : 'rgba(10,61,48,0.02)' }}>
                <Avatar name={person.name} gradient={ROLE_META[person.role]?.grad} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate" style={{ color: C.textPri }}>{person.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap"><RolePill role={person.role} /><p className="text-[10px] truncate" style={{ color: C.textMuted }}>{person.specialty}</p></div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shifts/wk</p>
                  <p className="text-xl font-black" style={{ color: C.textPri }}>{totalShifts}</p>
                </div>
              </div>

              {/* Shift legend */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b flex-wrap" style={{ borderColor: C.divider, background: C.isDark ? 'rgba(0,0,0,0.1)' : '#f8fafc' }}>
                {SHIFTS.map(sh => (
                  <span key={sh.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sh.color }} aria-hidden="true" />
                    <span className="text-[9px] font-semibold" style={{ color: C.textSec }}>{sh.label}</span>
                    <span className="text-[8px] hidden sm:inline" style={{ color: C.textMuted }}>{sh.time}</span>
                  </span>
                ))}
              </div>

              {/* Grid */}
              <div className="p-3 sm:p-5 space-y-2.5">
                {DAYS.map(day => {
                  const dayShifts = sched[day] || [];
                  return (
                    <div key={day} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 sm:w-11 flex-shrink-0">
                        <p className="text-[10px] font-black uppercase" style={{ color: C.textSec }}>{day}</p>
                        {dayShifts.length > 0 && <button onClick={() => clearDay(day)} className="text-[8px] text-red-400 hover:text-red-600 font-medium transition-colors mt-0.5" aria-label={`Clear ${day}`}>clear</button>}
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 flex-1 flex-wrap">
                        {SHIFTS.map(sh => {
                          const on = dayShifts.includes(sh.id);
                          return (
                            <button key={sh.id} onClick={() => toggle(day, sh.id)} aria-pressed={on} aria-label={`${sh.label} shift on ${day}`}
                              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2"
                              style={{ background: on ? `${sh.color}18` : C.inputBg, border: `1.5px solid ${on ? sh.color : C.inputBdr}`, color: on ? sh.color : C.textMuted }}>
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: on ? sh.color : C.isDark ? '#334155' : '#d1d5db' }} aria-hidden="true" />
                              <span className="hidden sm:inline">{sh.label}</span>
                              <span className="sm:hidden">{sh.label.slice(0, 3)}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="w-10 sm:w-14 text-right flex-shrink-0">
                        <span className="text-[10px] font-black" style={{ color: dayShifts.length > 0 ? '#059669' : C.textMuted }}>{dayShifts.length > 0 ? `${dayShifts.length * 4}h` : 'Off'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="px-4 sm:px-5 py-3 border-t flex items-center justify-between flex-wrap gap-2" style={{ borderColor: C.divider, background: C.isDark ? 'rgba(0,0,0,0.1)' : '#f8fafc' }}>
                <p className="text-[10px] font-black" style={{ color: C.textSec }}>Total: {totalShifts * 4}h / week</p>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map(d => { const n = (sched[d] || []).length; return (
                    <div key={d} className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black" style={{ background: n > 0 ? 'rgba(10,61,48,0.1)' : C.pillBg, color: n > 0 ? '#059669' : C.textMuted }} aria-label={`${d}: ${n > 0 ? n*4+'h' : 'Off'}`}>{n > 0 ? `${n * 4}` : '—'}</div>
                  ); })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: THERAPIST QUEUE                                            */
/* ═══════════════════════════════════════════════════════════════ */
function TabQueue({ users }) {
  const C = useC();
  const therapists = users.filter(u => u.role === 'therapist' && u.status === 'active');
  const [queue,  setQueue]  = useState(therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0 })));
  const [toast,  setToast]  = useState(null);
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const moveUp   = (idx) => { if (idx === 0) return; const q = [...queue]; [q[idx-1], q[idx]] = [q[idx], q[idx-1]]; setQueue(q.map((it,i) => ({...it, position: i+1}))); flash('Queue position updated'); };
  const moveDown = (idx) => { if (idx === queue.length-1) return; const q = [...queue]; [q[idx], q[idx+1]] = [q[idx+1], q[idx]]; setQueue(q.map((it,i) => ({...it, position: i+1}))); flash('Queue position updated'); };
  const markServed = (id) => { setQueue(prev => { const idx = prev.findIndex(t => t.id === id); if (idx < 0) return prev; const served = {...prev[idx], sessions: prev[idx].sessions+1}; const rest = prev.filter((_,i) => i !== idx); return [...rest, served].map((it,i) => ({...it, position: i+1})); }); flash('Marked as served — moved to end'); };
  const getStatus = (pos) => pos === 1 ? { label: 'Next Up', bg: 'rgba(16,185,129,0.12)', color: '#059669', border: '#a7f3d0' } : pos === 2 ? { label: 'On Deck', bg: 'rgba(245,158,11,0.12)', color: '#b45309', border: '#fde68a' } : { label: 'Waiting', bg: C.pillBg, color: C.textMuted, border: C.cardBorder };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black" style={{ color: C.textPri }}>Therapist Queue</h2>
          <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>Rotation order for walk-in and unassigned client sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border" style={{ background: 'rgba(8,145,178,0.08)', color: '#0891b2', borderColor: 'rgba(8,145,178,0.15)' }}>{queue.length} In Queue</span>
          <button onClick={() => setQueue(therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0 })))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            style={{ borderColor: C.cardBorder, color: C.textSec, background: C.cardBg }}>
            <RotateCcw className="w-3 h-3" aria-hidden="true" /> Reset
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border p-12 text-center" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
          <ListOrdered className="w-10 h-10 mx-auto mb-3" style={{ color: C.textMuted }} aria-hidden="true" />
          <p className="font-bold text-sm" style={{ color: C.textSec }}>No therapists in queue</p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>Active therapists awaiting assignment will appear here.</p>
        </div>
      ) : (
        <ol className="space-y-2.5 sm:space-y-3" aria-label="Therapist queue">
          {queue.map((t, idx) => {
            const status = getStatus(t.position);
            return (
              <motion.li key={t.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05, duration: 0.25 }}
                className="rounded-2xl sm:rounded-3xl border flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 transition-all"
                style={{ background: C.cardBg, borderColor: idx === 0 ? 'rgba(5,150,105,0.3)' : C.cardBorder, boxShadow: idx === 0 ? '0 0 0 1px rgba(5,150,105,0.15), 0 4px 16px rgba(5,150,105,0.08)' : 'none' }}>
                {/* Position badge */}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: idx === 0 ? 'linear-gradient(135deg,#062c22,#0a3d30)' : C.pillBg, color: idx === 0 ? '#fff' : C.textMuted }}
                  aria-label={`Position ${t.position}`}>
                  #{t.position}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-sm" style={{ color: C.textPri }}>{t.name}</p>
                    {t.sessions > 0 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/25">{t.sessions} served</span>}
                  </div>
                  <p className="text-[10px] truncate" style={{ color: C.textMuted }}>{t.specialty}</p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} aria-label={`Move ${t.name} up`}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                      style={{ background: idx === 0 ? C.pillBg : C.inputBg, color: idx === 0 ? C.textMuted : C.textSec }}>
                      <ChevronUp className="w-3 h-3" aria-hidden="true" />
                    </button>
                    <button onClick={() => moveDown(idx)} disabled={idx === queue.length - 1} aria-label={`Move ${t.name} down`}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                      style={{ background: idx === queue.length-1 ? C.pillBg : C.inputBg, color: idx === queue.length-1 ? C.textMuted : C.textSec }}>
                      <ChevronDown className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                  <span className="hidden sm:inline text-[10px] font-bold px-2.5 py-1.5 rounded-full border" style={{ background: status.bg, color: status.color, borderColor: status.border }}>{status.label}</span>
                  <button onClick={() => markServed(t.id)} aria-label={`Mark ${t.name} as served`}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)', boxShadow: '0 2px 8px rgba(8,145,178,0.25)' }}>
                    <CheckCheck className="w-3 h-3" aria-hidden="true" /><span className="hidden sm:inline">Served</span>
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
      <AnimatePresence>{toast && <ToastMsg msg={toast} color="linear-gradient(135deg,#0891b2,#0e7490)" />}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: PERMISSIONS (RBAC)                                         */
/* ═══════════════════════════════════════════════════════════════ */
function TabRBAC() {
  const C = useC();
  const [perms,  setPerms]  = useState(INITIAL_PERMS);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const toggle = (role, perm) => { if (ROLE_META[role]?.locked) return; setPerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } })); setSaved(false); };
  const handleSave = async () => { setSaving(true); await new Promise(r => setTimeout(r, 700)); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3500); };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black flex items-center gap-2" style={{ color: C.textPri }}>
            <Shield className="w-5 h-5 text-emerald-600" aria-hidden="true" /> Permissions — RBAC
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>Configure access level for each role. Admin permissions are system-locked.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          style={{ background: saved ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#0a3d30,#062c22)', boxShadow: '0 4px 14px rgba(6,44,34,0.22)', minWidth: 130 }}>
          {saving ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(ROLE_META).map(([role, meta], ri) => {
          const Icon = meta.icon; const rp = perms[role];
          const cnt = Object.values(rp).filter(Boolean).length;
          const total = Object.keys(rp).length;
          return (
            <motion.section key={role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.07, duration: 0.3 }}
              className="rounded-2xl sm:rounded-3xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.cardBorder }}
              aria-label={`${meta.label} permissions`}>
              {/* Role header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b" style={{ borderColor: C.divider }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: meta.grad, boxShadow: `0 4px 12px ${meta.color}30` }}>
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-black text-sm" style={{ color: C.textPri }}>{meta.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{meta.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <p className="text-xs font-black" style={{ color: meta.color }}>{cnt}/{total}</p>
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: C.pillBg }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(cnt / total) * 100}%` }} transition={{ delay: 0.3 + ri * 0.07, duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: meta.grad }} aria-label={`${cnt} of ${total} permissions enabled`} />
                    </div>
                  </div>
                  {meta.locked && (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 rounded-full" style={{ background: C.pillBg, color: C.textMuted }}>
                      <Lock className="w-2.5 h-2.5" aria-hidden="true" /> Locked
                    </span>
                  )}
                </div>
              </div>
              {/* Permissions grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x" style={{ borderColor: C.divider }}>
                {Object.entries(PERM_META).map(([pk, pm]) => {
                  const PIc = pm.icon; const on = rp[pk];
                  return (
                    <div key={pk} className="flex flex-col items-center gap-2.5 px-3 py-4 text-center transition-all"
                      style={{ background: on ? `${pm.color}06` : 'transparent', cursor: meta.locked ? 'not-allowed' : 'pointer' }}
                      onClick={() => toggle(role, pk)} role={meta.locked ? 'presentation' : 'button'}
                      aria-label={meta.locked ? undefined : `${on ? 'Disable' : 'Enable'} ${pm.label} for ${meta.label}`}
                      aria-pressed={!meta.locked ? on : undefined}
                      tabIndex={meta.locked ? -1 : 0}
                      onKeyDown={e => { if (!meta.locked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(role, pk); } }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: on ? `${pm.color}18` : C.pillBg }}>
                        <PIc className="w-4 h-4 transition-colors" style={{ color: on ? pm.color : C.textMuted }} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold leading-snug" style={{ color: C.textSec }}>{pm.label}</p>
                        <p className="text-[8px] mt-0.5 hidden sm:block leading-tight" style={{ color: C.textMuted }}>{pm.desc}</p>
                      </div>
                      <Toggle on={on} onChange={() => toggle(role, pk)} disabled={meta.locked} id={`${role}-${pk}`} />
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>
      <AnimatePresence>{saved && <ToastMsg msg="Permissions saved successfully!" color="linear-gradient(135deg,#16a34a,#15803d)" />}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  ROOT                                                            */
/* ═══════════════════════════════════════════════════════════════ */
export default function AdminUserMaintenance() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profiles';
  const [users, setUsers] = useState(MOCK_USERS);
  const subMap = { profiles: 'User Profiles', schedules: 'Work Schedules', queue: 'Therapist Queue', rbac: 'Permissions' };
  return (
    <AdminLayout title="User Management" subtitle={subMap[activeTab] || 'User Management'} icon={UserCog}>
      <AnimatePresence mode="wait">
        {activeTab === 'profiles' && (<motion.div key="profiles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><TabProfiles users={users} onUsersChange={setUsers} /></motion.div>)}
        {activeTab === 'schedules' && (<motion.div key="schedules" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><TabSchedules users={users} /></motion.div>)}
        {activeTab === 'queue' && (<motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><TabQueue users={users} /></motion.div>)}
        {activeTab === 'rbac' && (<motion.div key="rbac" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><TabRBAC /></motion.div>)}
      </AnimatePresence>
    </AdminLayout>
  );
}