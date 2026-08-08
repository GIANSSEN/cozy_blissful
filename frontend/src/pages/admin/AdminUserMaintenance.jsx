import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  Users, Calendar, Shield, Lock, Save,
  CheckCircle2, Crown, Stethoscope, UserCog, User,
  ListOrdered, Search, X, Edit3,
  CalendarDays, Star, Clock,
  ChevronUp, ChevronDown,
  BadgeCheck, TrendingUp, Activity, SlidersHorizontal,
  RotateCcw, CheckCheck, Plus, Eye, EyeOff,
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
  admin: {
    label: 'Administrator', desc: 'Full system control',
    icon: Crown,
    grad: 'linear-gradient(135deg,#062c22,#0a3d30)',
    color: '#0a3d30', locked: true,
  },
  staff: {
    label: 'Staff Coordinator', desc: 'Manages scheduling & bookings',
    icon: UserCog,
    grad: 'linear-gradient(135deg,#1e3a8a,#3b55e6)',
    color: '#3b55e6', locked: false,
  },
  therapist: {
    label: 'Therapist', desc: 'Assigned session access',
    icon: Stethoscope,
    grad: 'linear-gradient(135deg,#78350f,#b45309)',
    color: '#b45309', locked: false,
  },
  client: {
    label: 'Client', desc: 'Self-service booking portal',
    icon: User,
    grad: 'linear-gradient(135deg,#4338ca,#6366f1)',
    color: '#6366f1', locked: false,
  },
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
  { id: 1, name: 'Anna Reyes',     email: 'anna@cozy.spa',    phone: '+63 919 555 6666', role: 'therapist', specialty: 'Swedish & Hot Stone',  status: 'active',   joined: '2025-02-20', commRate: 35 },
  { id: 2, name: 'Leo Garcia',     email: 'leo@cozy.spa',     phone: '+63 920 777 8888', role: 'therapist', specialty: 'Deep Tissue & Sports',  status: 'active',   joined: '2025-05-15', commRate: 35 },
  { id: 3, name: 'Grace Tan',      email: 'grace@cozy.spa',   phone: '+63 921 999 0000', role: 'therapist', specialty: 'Hilot & Shiatsu',       status: 'inactive', joined: '2025-06-01', commRate: 30 },
  { id: 4, name: 'Maria Santos',   email: 'maria@cozy.spa',   phone: '+63 917 111 2222', role: 'staff',     specialty: 'Front Desk Coordinator',status: 'active',   joined: '2025-03-10', commRate: 0  },
  { id: 5, name: 'Juan Dela Cruz', email: 'juan@cozy.spa',    phone: '+63 918 333 4444', role: 'staff',     specialty: 'Operations Lead',       status: 'active',   joined: '2025-04-01', commRate: 0  },
];

const EMPTY_FORM = {
  name: '', email: '', phone: '', specialty: '',
  role: 'staff', status: 'active', commRate: 0, password: '', confirmPassword: '',
};

/* ═══════════════════════════════════════════════════════════════ */
/*  SHARED ATOMS                                                    */
/* ═══════════════════════════════════════════════════════════════ */
function Avatar({ name, gradient, size = 36 }) {
  return (
    <div
      className="flex items-center justify-center font-black text-white flex-shrink-0 select-none"
      style={{
        width: size, height: size, borderRadius: size * 0.3,
        background: gradient || 'linear-gradient(135deg,#062c22,#0a3d30)',
        fontSize: size * 0.38,
      }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function RolePill({ role }) {
  const MAP = {
    admin:     { bg: 'rgba(10,61,48,0.1)',   color: '#0a3d30', label: 'Admin'     },
    staff:     { bg: 'rgba(59,85,230,0.1)',  color: '#3b55e6', label: 'Staff'     },
    therapist: { bg: 'rgba(180,83,9,0.1)',   color: '#b45309', label: 'Therapist' },
    client:    { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', label: 'Client'    },
  };
  const c = MAP[role] || { bg: '#f3f4f6', color: '#6b7280', label: role };
  return (
    <span className="inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function StatusDot({ status }) {
  const on = status === 'active';
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-emerald-500' : 'bg-slate-300'}`} />
      <span className={`text-[10px] font-semibold ${on ? 'text-emerald-600' : 'text-slate-400'}`}>
        {on ? 'Active' : 'Inactive'}
      </span>
    </span>
  );
}

function Toggle({ on, onChange, disabled }) {
  return (
    <button type="button" disabled={disabled} onClick={() => !disabled && onChange(!on)}
      className="relative inline-flex items-center flex-shrink-0 transition-all"
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', padding: 0,
        background: disabled
          ? (on ? 'rgba(10,61,48,0.25)' : '#d1d5db')
          : (on ? 'linear-gradient(135deg,#0a3d30,#062c22)' : '#d1d5db'),
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: on && !disabled ? '0 2px 8px rgba(10,61,48,0.3)' : 'none',
      }}>
      <motion.span
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {disabled && <Lock className="w-2.5 h-2.5 text-slate-400" />}
      </motion.span>
    </button>
  );
}

function Toast({ msg, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 28, scale: 0.94 }}
      transition={{ duration: 0.22 }}
      className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-2xl"
      style={{ transform: 'translateX(-50%)', background: color || 'linear-gradient(135deg,#0a3d30,#062c22)', whiteSpace: 'nowrap' }}>
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      {msg}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  VALIDATION HELPER                                               */
/* ═══════════════════════════════════════════════════════════════ */
function validateUserForm(form, isNew = false, allUsers = []) {
  const e = {};
  if (!form.name.trim())  e.name = 'Full name is required';
  else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

  if (!form.email.trim()) e.email = 'Email address is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email (e.g. user@cozy.spa)';
  else if (isNew && allUsers.find(u => u.email.toLowerCase() === form.email.toLowerCase())) {
    e.email = 'This email is already registered';
  }

  if (!form.phone.trim()) e.phone = 'Phone number is required';
  else if (!/^[+\d\s\-()]{7,}$/.test(form.phone)) e.phone = 'Enter a valid phone number';

  if (!form.specialty.trim()) e.specialty = 'Specialization / position is required';

  if (form.role === 'therapist') {
    const cr = Number(form.commRate);
    if (isNaN(cr) || cr < 0)  e.commRate = 'Commission must be 0 or more';
    if (cr > 100)              e.commRate = 'Commission cannot exceed 100%';
  }

  if (isNew) {
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must include at least one uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Must include at least one number';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password && form.confirmPassword !== form.password) {
      e.confirmPassword = 'Passwords do not match';
    }
  }

  return e;
}

/* ═══════════════════════════════════════════════════════════════ */
/*  ADD USER MODAL                                                  */
/* ═══════════════════════════════════════════════════════════════ */
function AddUserModal({ onClose, onAdd, allUsers }) {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [step,   setStep]   = useState(1); // 1 = basic info, 2 = account setup

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleNext = () => {
    const stepFields = ['name', 'email', 'phone', 'specialty'];
    const partial = {};
    stepFields.forEach(f => {
      if (!form[f].trim()) partial[f] = `${f.charAt(0).toUpperCase() + f.slice(1)} is required`;
    });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) partial.email = 'Enter a valid email';
    if (allUsers.find(u => u.email.toLowerCase() === form.email.toLowerCase())) partial.email = 'Email already registered';
    if (Object.keys(partial).length) { setErrors(partial); return; }
    setStep(2);
  };

  const handleSubmit = () => {
    const e = validateUserForm(form, true, allUsers);
    if (Object.keys(e).length) { setErrors(e); return; }
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

  const Field = ({ label, fkey, type = 'text', placeholder = '', hint = '' }) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        value={form[fkey]}
        onChange={e => set(fkey, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium outline-none transition-all"
        style={{
          background: '#f8fafc',
          border: `1.5px solid ${errors[fkey] ? '#ef4444' : '#e2e8f0'}`,
          color: '#1a1d23',
        }}
      />
      {hint && !errors[fkey] && <p className="text-[9px] text-slate-400">{hint}</p>}
      {errors[fkey] && <p className="text-[10px] text-red-500 font-medium">{errors[fkey]}</p>}
    </div>
  );

  const PasswordField = ({ label, fkey, show, toggleShow }) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={form[fkey]}
          onChange={e => set(fkey, e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-[12.5px] font-medium outline-none transition-all"
          style={{
            background: '#f8fafc',
            border: `1.5px solid ${errors[fkey] ? '#ef4444' : '#e2e8f0'}`,
            color: '#1a1d23',
          }}
        />
        <button type="button" onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      {errors[fkey] && <p className="text-[10px] text-red-500 font-medium">{errors[fkey]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0a3d30,#062c22)' }}>
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">Add New User</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Step {step} of 2 — {step === 1 ? 'Basic Information' : 'Account Setup'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-4 flex-shrink-0">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
                  style={{
                    background: s <= step ? 'linear-gradient(135deg,#0a3d30,#062c22)' : '#f1f5f9',
                    color: s <= step ? '#fff' : '#94a3b8',
                  }}>
                  {s < step ? <CheckCheck className="w-3 h-3" /> : s}
                </div>
                <span className="text-[10px] font-bold hidden sm:block"
                  style={{ color: s <= step ? '#0a3d30' : '#94a3b8' }}>
                  {s === 1 ? 'Basic Info' : 'Account Setup'}
                </span>
              </div>
              {s < 2 && <div className="flex-1 h-px bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }} className="space-y-4">
                <Field label="Full Name *" fkey="name" placeholder="e.g. Maria Santos" />
                <Field label="Email Address *" fkey="email" type="email" placeholder="e.g. maria@cozy.spa" />
                <Field label="Phone Number *" fkey="phone" type="tel" placeholder="e.g. +63 917 123 4567" />
                <Field label="Specialization / Position *" fkey="specialty" placeholder="e.g. Deep Tissue Therapist" />
                {/* Role */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Role *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ROLE_META).filter(([k]) => k !== 'admin').map(([k, v]) => {
                      const Ic = v.icon;
                      return (
                        <button key={k} type="button" onClick={() => set('role', k)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all"
                          style={{
                            background: form.role === k ? `${v.color}08` : '#f8fafc',
                            borderColor: form.role === k ? v.color : '#e2e8f0',
                          }}>
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: form.role === k ? v.grad : '#f1f5f9' }}>
                            <Ic className="w-3.5 h-3.5" style={{ color: form.role === k ? '#fff' : '#94a3b8' }} />
                          </div>
                          <span className="text-[11px] font-bold" style={{ color: form.role === k ? v.color : '#64748b' }}>
                            {v.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Commission — therapist only */}
                {form.role === 'therapist' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Commission Rate (%) *
                    </label>
                    <input type="number" min="0" max="100"
                      value={form.commRate}
                      onChange={e => set('commRate', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium outline-none"
                      style={{
                        background: '#f8fafc',
                        border: `1.5px solid ${errors.commRate ? '#ef4444' : '#e2e8f0'}`,
                        color: '#1a1d23',
                      }}
                    />
                    {errors.commRate && <p className="text-[10px] text-red-500 font-medium">{errors.commRate}</p>}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
                {/* Summary card */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <Avatar name={form.name} gradient={ROLE_META[form.role]?.grad} size={42} />
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{form.name || 'New User'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{form.email}</p>
                    <RolePill role={form.role} />
                  </div>
                </div>

                <PasswordField label="Password *" fkey="password"
                  show={showPw} toggleShow={() => setShowPw(p => !p)} />
                <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[10px] text-blue-700 font-medium">
                    Password requirements: 8+ characters, 1 uppercase letter, 1 number.
                  </p>
                </div>
                <PasswordField label="Confirm Password *" fkey="confirmPassword"
                  show={showCf} toggleShow={() => setShowCf(p => !p)} />

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Account Status
                  </label>
                  <div className="flex gap-2">
                    {['active', 'inactive'].map(s => (
                      <button key={s} type="button" onClick={() => set('status', s)}
                        className="flex-1 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all"
                        style={{
                          background: form.status === s
                            ? (s === 'active' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)')
                            : '#f8fafc',
                          borderColor: form.status === s
                            ? (s === 'active' ? '#10b981' : '#ef4444')
                            : '#e2e8f0',
                          color: form.status === s
                            ? (s === 'active' ? '#065f46' : '#dc2626')
                            : '#94a3b8',
                        }}>
                        {s === 'active' ? '✓ Active' : '✕ Inactive'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-5 sm:px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {step === 1 ? (
            <>
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#0a3d30,#062c22)', boxShadow: '0 4px 12px rgba(10,61,48,0.25)' }}>
                Next →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                ← Back
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#0a3d30,#062c22)', boxShadow: '0 4px 12px rgba(10,61,48,0.25)' }}>
                Add User
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  EDIT USER MODAL                                                 */
/* ═══════════════════════════════════════════════════════════════ */
function EditUserModal({ user, onClose, onSave, allUsers }) {
  const [form, setForm] = useState({
    name: user.name || '', email: user.email || '', phone: user.phone || '',
    specialty: user.specialty || '', role: user.role || 'staff',
    status: user.status || 'active', commRate: user.commRate ?? 0,
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const handleSave = () => {
    const others = allUsers.filter(u => u.id !== user.id);
    const e = validateUserForm(form, false, others);
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...user, ...form, commRate: Number(form.commRate) });
  };

  const Field = ({ label, fkey, type = 'text', placeholder = '' }) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <input type={type} value={form[fkey]}
        onChange={e => set(fkey, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium outline-none transition-all"
        style={{ background: '#f8fafc', border: `1.5px solid ${errors[fkey] ? '#ef4444' : '#e2e8f0'}`, color: '#1a1d23' }}
      />
      {errors[fkey] && <p className="text-[10px] text-red-500 font-medium">{errors[fkey]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            <Avatar name={form.name} gradient={ROLE_META[form.role]?.grad} size={38} />
            <div>
              <p className="font-black text-slate-800 text-sm">Edit Profile</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          <Field label="Full Name *" fkey="name" />
          <Field label="Email Address *" fkey="email" type="email" />
          <Field label="Phone Number *" fkey="phone" type="tel" />
          <Field label="Specialization / Position *" fkey="specialty" />

          {/* Role */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_META).map(([k, v]) => {
                const Ic = v.icon;
                return (
                  <button key={k} type="button" onClick={() => set('role', k)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all"
                    style={{
                      background: form.role === k ? `${v.color}08` : '#f8fafc',
                      borderColor: form.role === k ? v.color : '#e2e8f0',
                    }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: form.role === k ? v.grad : '#f1f5f9' }}>
                      <Ic className="w-3 h-3" style={{ color: form.role === k ? '#fff' : '#94a3b8' }} />
                    </div>
                    <span className="text-[11px] font-bold truncate" style={{ color: form.role === k ? v.color : '#64748b' }}>
                      {v.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {form.role === 'therapist' && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Commission Rate (%)</label>
              <input type="number" min="0" max="100" value={form.commRate}
                onChange={e => set('commRate', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium outline-none"
                style={{ background: '#f8fafc', border: `1.5px solid ${errors.commRate ? '#ef4444' : '#e2e8f0'}`, color: '#1a1d23' }}
              />
              {errors.commRate && <p className="text-[10px] text-red-500 font-medium">{errors.commRate}</p>}
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Status</label>
            <div className="flex gap-2">
              {['active', 'inactive'].map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className="flex-1 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all"
                  style={{
                    background: form.status === s ? (s === 'active' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)') : '#f8fafc',
                    borderColor: form.status === s ? (s === 'active' ? '#10b981' : '#ef4444') : '#e2e8f0',
                    color: form.status === s ? (s === 'active' ? '#065f46' : '#dc2626') : '#94a3b8',
                  }}>
                  {s === 'active' ? '✓ Active' : '✕ Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-5 sm:px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#0a3d30,#062c22)', boxShadow: '0 4px 12px rgba(10,61,48,0.25)' }}>
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: USER PROFILES                                              */
/* ═══════════════════════════════════════════════════════════════ */
function TabProfiles({ users, onUsersChange }) {
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editing,    setEditing]    = useState(null);
  const [adding,     setAdding]     = useState(false);
  const [sortField,  setSortField]  = useState('name');
  const [sortDir,    setSortDir]    = useState('asc');
  const [toast,      setToast]      = useState(null);

  const flash = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = users.filter(u => {
      const mr = roleFilter === 'all' || u.role === roleFilter;
      const ms = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.specialty.toLowerCase().includes(q);
      return mr && ms;
    });
    return [...list].sort((a, b) => {
      const va = String(a[sortField] || '');
      const vb = String(b[sortField] || '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [users, search, roleFilter, sortField, sortDir]);

  const toggleSort = (f) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
  };

  const SortBtn = ({ field, label }) => (
    <button onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
      {label}
      {sortField === field
        ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-700" /> : <ChevronDown className="w-3 h-3 text-emerald-700" />)
        : <ChevronDown className="w-3 h-3 opacity-25" />}
    </button>
  );

  const toggleStatus = (id) => {
    onUsersChange(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    flash('Status updated', 'linear-gradient(135deg,#16a34a,#15803d)');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-800">User Profiles</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Impormasyon at accounts ng lahat ng staff at therapist
          </p>
        </div>
        {/* Stats row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(10,61,48,0.06)', color: '#0a3d30', borderColor: 'rgba(10,61,48,0.12)' }}>
            {users.filter(u => u.status === 'active').length} Active
          </span>
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 bg-slate-50">
            {users.length} Total
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 flex-1"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email or specialization…"
            className="flex-1 bg-transparent text-[12px] outline-none text-slate-700 placeholder-slate-400 min-w-0"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'staff', 'therapist'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="text-[10px] font-bold px-3 py-2 rounded-xl border transition-all whitespace-nowrap"
              style={{
                background: roleFilter === r ? 'linear-gradient(135deg,#0a3d30,#062c22)' : '#fff',
                color: roleFilter === r ? '#fff' : '#64748b',
                borderColor: roleFilter === r ? 'transparent' : '#e2e8f0',
              }}>
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}

          {/* ADD USER BUTTON */}
          <motion.button
            onClick={() => setAdding(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black text-white transition-all relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#0a3d30,#062c22)', boxShadow: '0 4px 14px rgba(10,61,48,0.3)' }}>
            {/* shimmer */}
            <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <Plus className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10 whitespace-nowrap">Add User</span>
          </motion.button>
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
        {/* Head */}
        <div className="grid grid-cols-12 px-6 py-3 bg-slate-50/60 border-b border-slate-100">
          <div className="col-span-3"><SortBtn field="name"      label="User" /></div>
          <div className="col-span-2"><SortBtn field="specialty" label="Specialization" /></div>
          <div className="col-span-1"><SortBtn field="role"      label="Role" /></div>
          <div className="col-span-1"><SortBtn field="status"    label="Status" /></div>
          <div className="col-span-2"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Commission</span></div>
          <div className="col-span-2"><SortBtn field="joined"    label="Joined" /></div>
          <div className="col-span-1 text-right"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</span></div>
        </div>

        <div className="divide-y divide-slate-50">
          <AnimatePresence mode="popLayout">
            {filtered.map((u, i) => {
              const meta = ROLE_META[u.role] || ROLE_META.staff;
              return (
                <motion.div key={u.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.025, duration: 0.22 }}
                  className="grid grid-cols-12 gap-2 px-6 py-3.5 items-center hover:bg-slate-50/60 transition-colors">
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <Avatar name={u.name} gradient={meta.grad} size={36} />
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-800 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-[11px] text-slate-600 font-medium truncate">{u.specialty}</p>
                  </div>
                  <div className="col-span-1"><RolePill role={u.role} /></div>
                  <div className="col-span-1"><StatusDot status={u.status} /></div>
                  <div className="col-span-2">
                    {u.role === 'therapist'
                      ? <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{u.commRate}% Comm.</span>
                      : <span className="text-[10px] text-slate-300">—</span>}
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500">{u.joined}</p>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button onClick={() => setEditing(u)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all hover:scale-110"
                      title="Edit">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleStatus(u.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
                        u.status === 'active' ? 'bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500' : 'bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'}`}
                      title={u.status === 'active' ? 'Deactivate' : 'Activate'}>
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">No users found</p>
              <p className="text-xs text-slate-300 mt-1">Try adjusting your filters or add a new user.</p>
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
              <motion.div key={u.id} layout
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04, duration: 0.22 }}
                className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start gap-3">
                  <Avatar name={u.name} gradient={meta.grad} size={42} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{u.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <RolePill role={u.role} />
                    <StatusDot status={u.status} />
                  </div>
                  {u.role === 'therapist' && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      {u.commRate}% Comm.
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button onClick={() => setEditing(u)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => toggleStatus(u.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all ${
                      u.status === 'active' ? 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500' : 'bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'}`}>
                    <BadgeCheck className="w-3 h-3" />
                    {u.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No users found</p>
          </div>
        )}
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
              flash('New user added successfully!', 'linear-gradient(135deg,#0a3d30,#062c22)');
            }}
          />
        )}
        {editing && (
          <EditUserModal
            user={editing}
            allUsers={users}
            onClose={() => setEditing(null)}
            onSave={updated => {
              onUsersChange(prev => prev.map(u => u.id === updated.id ? updated : u));
              setEditing(null);
              flash('Profile saved successfully', 'linear-gradient(135deg,#16a34a,#15803d)');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} color={toast.color} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: WORK SCHEDULES                                             */
/* ═══════════════════════════════════════════════════════════════ */
function TabSchedules({ users }) {
  const buildDefault = () => {
    const s = {};
    DAYS.forEach((d, i) => { s[d] = i < 5 ? ['morning', 'afternoon'] : (i === 5 ? ['morning'] : []); });
    return s;
  };
  const initAll = () => {
    const s = {};
    users.forEach(u => { s[u.id] = buildDefault(); });
    return s;
  };

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
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-800">Work Schedules</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Talaan at pag-edit ng oras ng pasok at shift ng bawat miyembro</p>
        </div>
        {person && (
          <div className="flex items-center gap-2">
            <button onClick={setFullWeek}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Set Full Week</span>
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: saved ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#0a3d30,#062c22)',
                boxShadow: '0 4px 12px rgba(10,61,48,0.22)', minWidth: 110,
              }}>
              {saving
                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Person list */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Member</p>
              <div className="flex gap-1">
                {['all', 'staff', 'therapist'].map(r => (
                  <button key={r} onClick={() => setRoleFilter(r)}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg transition-all"
                    style={{ background: roleFilter === r ? '#0a3d30' : 'transparent', color: roleFilter === r ? '#fff' : '#94a3b8' }}>
                    {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {/* horizontal scroll on mobile */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 p-2" style={{ scrollbarWidth: 'none' }}>
              {filteredTeam.map(u => {
                const m = ROLE_META[u.role] || ROLE_META.staff;
                const isSel = selected === u.id;
                const total = Object.values(schedules[u.id] || {}).reduce((a, b) => a + b.length, 0);
                return (
                  <button key={u.id} onClick={() => setSelected(u.id)}
                    className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left flex-shrink-0 lg:flex-shrink w-[200px] lg:w-auto"
                    style={{
                      background: isSel ? 'rgba(10,61,48,0.07)' : 'transparent',
                      border: isSel ? '1px solid rgba(10,61,48,0.15)' : '1px solid transparent',
                    }}>
                    <Avatar name={u.name} gradient={isSel ? m.grad : undefined} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{u.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{u.specialty}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-black" style={{ color: isSel ? '#0a3d30' : '#94a3b8' }}>{total}</p>
                      <p className="text-[8px] text-slate-400">shifts</p>
                    </div>
                  </button>
                );
              })}
              {filteredTeam.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-8 w-full">No members found</p>
              )}
            </div>
          </div>
        </div>

        {/* Schedule grid */}
        <div className="lg:col-span-8">
          {!person ? (
            <div className="h-48 sm:h-64 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
              <CalendarDays className="w-10 h-10 text-slate-200 mb-3" />
              <p className="font-bold text-slate-400 text-sm">Select a team member</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              {/* Person header */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-slate-100"
                style={{ background: 'rgba(10,61,48,0.02)' }}>
                <Avatar name={person.name} gradient={ROLE_META[person.role]?.grad} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate">{person.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{person.specialty}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shifts/wk</p>
                  <p className="text-xl font-black text-slate-800">{totalShifts}</p>
                </div>
              </div>

              {/* Shift legend */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/40 flex-wrap">
                {SHIFTS.map(sh => (
                  <span key={sh.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sh.color }} />
                    <span className="text-[9px] font-semibold text-slate-600">{sh.label}</span>
                    <span className="text-[8px] text-slate-400 hidden sm:inline">{sh.time}</span>
                  </span>
                ))}
              </div>

              {/* Grid */}
              <div className="p-3 sm:p-5 space-y-2.5">
                {DAYS.map(day => {
                  const dayShifts = sched[day] || [];
                  return (
                    <div key={day} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 sm:w-10 flex-shrink-0">
                        <p className="text-[10px] font-black text-slate-600 uppercase">{day}</p>
                        {dayShifts.length > 0 && (
                          <button onClick={() => clearDay(day)} className="text-[8px] text-red-400 hover:text-red-600 font-medium transition-colors mt-0.5">
                            clear
                          </button>
                        )}
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 flex-1 flex-wrap">
                        {SHIFTS.map(sh => {
                          const on = dayShifts.includes(sh.id);
                          return (
                            <button key={sh.id} onClick={() => toggle(day, sh.id)}
                              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
                              style={{
                                background: on ? `${sh.color}15` : '#f8fafc',
                                border: `1.5px solid ${on ? sh.color : '#e2e8f0'}`,
                                color: on ? sh.color : '#94a3b8',
                              }}>
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: on ? sh.color : '#d1d5db' }} />
                              <span className="hidden sm:inline">{sh.label}</span>
                              <span className="sm:hidden">{sh.label.slice(0, 3)}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="w-10 sm:w-14 text-right flex-shrink-0">
                        <span className="text-[10px] font-black" style={{ color: dayShifts.length > 0 ? '#0a3d30' : '#cbd5e1' }}>
                          {dayShifts.length > 0 ? `${dayShifts.length * 4}h` : 'Off'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-700">
                  Total: {totalShifts * 4}h / week
                </p>
                <div className="flex gap-1.5">
                  {DAYS.map(d => {
                    const n = (sched[d] || []).length;
                    return (
                      <div key={d} className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black"
                        style={{ background: n > 0 ? 'rgba(10,61,48,0.1)' : '#f1f5f9', color: n > 0 ? '#0a3d30' : '#cbd5e1' }}>
                        {n > 0 ? `${n * 4}` : '—'}
                      </div>
                    );
                  })}
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
  const therapists = users.filter(u => u.role === 'therapist' && u.status === 'active');
  const [queue,  setQueue]  = useState(therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0 })));
  const [toast,  setToast]  = useState(null);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const q = [...queue];
    [q[idx - 1], q[idx]] = [q[idx], q[idx - 1]];
    setQueue(q.map((it, i) => ({ ...it, position: i + 1 })));
    flash('Queue position updated');
  };

  const moveDown = (idx) => {
    if (idx === queue.length - 1) return;
    const q = [...queue];
    [q[idx], q[idx + 1]] = [q[idx + 1], q[idx]];
    setQueue(q.map((it, i) => ({ ...it, position: i + 1 })));
    flash('Queue position updated');
  };

  const markServed = (id) => {
    setQueue(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx < 0) return prev;
      const served = { ...prev[idx], sessions: prev[idx].sessions + 1 };
      const rest = prev.filter((_, i) => i !== idx);
      return [...rest, served].map((it, i) => ({ ...it, position: i + 1 }));
    });
    flash('Marked as served — moved to end');
  };

  const getStatus = (pos) => {
    if (pos === 1) return { label: 'Next Up', bg: 'rgba(16,185,129,0.1)', color: '#065f46', border: '#a7f3d0' };
    if (pos === 2) return { label: 'On Deck',  bg: 'rgba(245,158,11,0.1)', color: '#78350f', border: '#fde68a' };
    return             { label: 'Waiting',  bg: '#f8fafc',                color: '#64748b', border: '#e2e8f0' };
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-800">Therapist Queue</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Pila at rotation para sa walk-in at unassigned na kliyente</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(8,145,178,0.08)', color: '#0891b2', borderColor: 'rgba(8,145,178,0.15)' }}>
            {queue.length} In Queue
          </span>
          <button onClick={() => setQueue(therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0 })))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-12 text-center"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <ListOrdered className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="font-bold text-slate-400 text-sm">No therapists in queue</p>
          <p className="text-xs text-slate-300 mt-1">Active therapists awaiting assignment will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {queue.map((t, idx) => {
            const status = getStatus(t.position);
            return (
              <motion.div key={t.id} layout
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
                className="bg-white rounded-2xl sm:rounded-3xl border flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 transition-all"
                style={{
                  borderColor: idx === 0 ? 'rgba(16,185,129,0.25)' : '#f1f5f9',
                  boxShadow: idx === 0 ? '0 0 0 1px rgba(16,185,129,0.15), 0 4px 16px rgba(16,185,129,0.06)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                {/* Position */}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: idx === 0 ? 'linear-gradient(135deg,#062c22,#0a3d30)' : '#f1f5f9', color: idx === 0 ? '#fff' : '#64748b' }}>
                  #{t.position}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-slate-800 text-sm">{t.name}</p>
                    {t.sessions > 0 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {t.sessions} served
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{t.specialty}</p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: idx === 0 ? '#f8fafc' : '#f1f5f9', color: idx === 0 ? '#e2e8f0' : '#64748b' }}>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveDown(idx)} disabled={idx === queue.length - 1}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: idx === queue.length - 1 ? '#f8fafc' : '#f1f5f9', color: idx === queue.length - 1 ? '#e2e8f0' : '#64748b' }}>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="hidden sm:inline text-[10px] font-bold px-2.5 py-1.5 rounded-full border"
                    style={{ background: status.bg, color: status.color, borderColor: status.border }}>
                    {status.label}
                  </span>
                  <button onClick={() => markServed(t.id)}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)', boxShadow: '0 2px 8px rgba(8,145,178,0.25)' }}>
                    <CheckCheck className="w-3 h-3" />
                    <span className="hidden sm:inline">Served</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {toast && <Toast msg={toast} color="linear-gradient(135deg,#0891b2,#0e7490)" />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: PERMISSIONS (RBAC)                                         */
/* ═══════════════════════════════════════════════════════════════ */
function TabRBAC() {
  const [perms,  setPerms]  = useState(INITIAL_PERMS);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const toggle = (role, perm) => {
    if (ROLE_META[role]?.locked) return;
    setPerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-800" />
            Permissions — RBAC
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            I-configure ang access ng bawat role. Admin permissions ay system-locked.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: saved ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#0a3d30,#062c22)',
            boxShadow: '0 4px 14px rgba(6,44,34,0.22)', minWidth: 130,
          }}>
          {saving
            ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Role cards */}
      <div className="space-y-4">
        {Object.entries(ROLE_META).map(([role, meta], ri) => {
          const Icon   = meta.icon;
          const rp     = perms[role];
          const cnt    = Object.values(rp).filter(Boolean).length;
          const total  = Object.keys(rp).length;
          return (
            <motion.div key={role}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ri * 0.07, duration: 0.3 }}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

              {/* Role header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.grad, boxShadow: `0 4px 12px ${meta.color}30` }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{meta.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{meta.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress */}
                  <div className="hidden sm:flex items-center gap-2">
                    <p className="text-xs font-black" style={{ color: meta.color }}>{cnt}/{total}</p>
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(cnt / total) * 100}%` }}
                        transition={{ delay: 0.3 + ri * 0.07, duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: meta.grad }} />
                    </div>
                  </div>
                  {meta.locked && (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.05)', color: '#6b7280' }}>
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </div>
              </div>

              {/* Permissions grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-slate-50">
                {Object.entries(PERM_META).map(([pk, pm]) => {
                  const PIc = pm.icon;
                  const on  = rp[pk];
                  return (
                    <div key={pk}
                      onClick={() => toggle(role, pk)}
                      className="flex flex-col items-center gap-2.5 px-3 py-4 text-center transition-all"
                      style={{ background: on ? `${pm.color}06` : 'transparent', cursor: meta.locked ? 'not-allowed' : 'pointer' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: on ? `${pm.color}18` : 'rgba(0,0,0,0.04)' }}>
                        <PIc className="w-4 h-4 transition-colors" style={{ color: on ? pm.color : '#cbd5e1' }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-700 leading-snug">{pm.label}</p>
                        <p className="text-[8px] text-slate-400 mt-0.5 hidden sm:block leading-tight">{pm.desc}</p>
                      </div>
                      <Toggle on={on} onChange={() => toggle(role, pk)} disabled={meta.locked} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {saved && <Toast msg="Permissions saved successfully!" color="linear-gradient(135deg,#16a34a,#15803d)" />}
      </AnimatePresence>
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

  const subMap = {
    profiles: 'User Profiles', schedules: 'Work Schedules',
    queue: 'Therapist Queue',  rbac: 'Permissions',
  };

  return (
    <AdminLayout title="User Management" subtitle={subMap[activeTab] || 'User Management'} icon={UserCog}>
      <AnimatePresence mode="wait">
        {activeTab === 'profiles' && (
          <motion.div key="profiles"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <TabProfiles users={users} onUsersChange={setUsers} />
          </motion.div>
        )}
        {activeTab === 'schedules' && (
          <motion.div key="schedules"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <TabSchedules users={users} />
          </motion.div>
        )}
        {activeTab === 'queue' && (
          <motion.div key="queue"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <TabQueue users={users} />
          </motion.div>
        )}
        {activeTab === 'rbac' && (
          <motion.div key="rbac"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <TabRBAC />
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
