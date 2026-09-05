import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import axios from '../../api/axios';
import {
  Users, Calendar, Shield, Save,
  CheckCircle2, Crown, Stethoscope, UserCog, User,
  Search, X, Edit3,
  ChevronUp, ChevronDown,
  TrendingUp, Activity, SlidersHorizontal,
  CheckCheck, Plus,
  UserCheck, UserX,
  Layers, BarChart3,
  RefreshCw, Mail, Phone, Lock, Briefcase,
  Eye, EyeOff, Sparkles, ShieldAlert, Check, Copy, AlertCircle, Loader2, KeyRound,
  Trash2,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  CONFIG                                                          */
/* ─────────────────────────────────────────────────────────────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SHIFTS = [
  { id: 'morning',   label: 'Morning',   time: '8:00 AM – 12:00 PM', color: '#f59e0b', bg: 'rgba(245,158,11,0.13)', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', time: '1:00 PM – 5:00 PM',  color: '#3b82f6', bg: 'rgba(59,130,246,0.13)',  icon: '☀️'  },
  { id: 'evening',   label: 'Evening',   time: '6:00 PM – 10:00 PM', color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)', icon: '🌙' },
];

const ROLE_META = {
  admin:     { label: 'Administrator',     desc: 'Full system control & user management',  icon: Crown,       grad: 'linear-gradient(135deg,#062c22,#0a5f3c)', color: '#059669', badgeBg: 'rgba(5,150,105,0.12)',   locked: true  },
  staff:     { label: 'Staff Coordinator', desc: 'Manages scheduling, clients & bookings', icon: UserCog,     grad: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#3b82f6', badgeBg: 'rgba(59,130,246,0.12)',  locked: false },
  therapist: { label: 'Therapist',         desc: 'Assigned session & queue access',        icon: Stethoscope, grad: 'linear-gradient(135deg,#78350f,#d97706)', color: '#d97706', badgeBg: 'rgba(217,119,6,0.12)',   locked: false },
  client:    { label: 'Client',            desc: 'Self-service booking portal',            icon: User,        grad: 'linear-gradient(135deg,#4338ca,#6366f1)', color: '#6366f1', badgeBg: 'rgba(99,102,241,0.12)', locked: false },
};

const PERM_META = {
  bookings:   { label: 'Bookings',   desc: 'View & manage appointments',  icon: Calendar,          color: '#3b82f6' },
  services:   { label: 'Services',   desc: 'Create & edit services',       icon: Activity,          color: '#f59e0b' },
  history:    { label: 'History',    desc: 'View archived sessions',       icon: TrendingUp,        color: '#10b981' },
  settings:   { label: 'Settings',   desc: 'System-wide configuration',    icon: SlidersHorizontal, color: '#8b5cf6' },
  analytics:  { label: 'Analytics',  desc: 'View KPIs & reports',          icon: BarChart3,         color: '#ef4444' },
  userMgmt:   { label: 'User Mgmt',  desc: 'Create & manage accounts',     icon: Users,             color: '#0ea5e9' },
};

/* Revenue split: Therapist earns 40%, Admin retains 60% of every booking */
const THERAPIST_SHARE = 40;
const ADMIN_SHARE     = 60;

const INITIAL_PERMS = {
  admin:     { bookings: true,  services: true,  history: true,  settings: true,  analytics: true,  userMgmt: true  },
  staff:     { bookings: true,  services: true,  history: true,  settings: false, analytics: true,  userMgmt: false },
  therapist: { bookings: true,  services: false, history: false, settings: false, analytics: false, userMgmt: false },
};

const MOCK_USERS = [
  { id: 1, name: 'Anna Reyes',     email: 'anna@cozy.spa',    phone: '+63 919 555 6666', role: 'therapist', specialty: 'Swedish & Hot Stone',     status: 'active',   joined: '2025-02-20' },
  { id: 2, name: 'Grace Tan',      email: 'grace@cozy.spa',   phone: '+63 921 999 0000', role: 'therapist', specialty: 'Hilot & Shiatsu',          status: 'inactive', joined: '2025-06-01' },
  { id: 3, name: 'Leo Garcia',     email: 'leo@cozy.spa',     phone: '+63 920 777 8888', role: 'therapist', specialty: 'Deep Tissue & Sports',     status: 'active',   joined: '2025-05-15' },
  { id: 4, name: 'Maria Santos',   email: 'maria@cozy.spa',   phone: '+63 917 111 2222', role: 'staff',     specialty: 'Front Desk Coordinator',  status: 'active',   joined: '2025-03-10' },
  { id: 5, name: 'Juan Dela Cruz', email: 'juan@cozy.spa',    phone: '+63 918 333 4444', role: 'staff',     specialty: 'Operations Lead',          status: 'active',   joined: '2025-04-01' },
  { id: 6, name: 'Elena Ramos',    email: 'elena@cozy.spa',   phone: '+63 922 444 5555', role: 'staff',     specialty: 'Booking Coordinator',      status: 'active',   joined: '2025-07-12' },
];

const EMPTY_FORM = { name: '', email: '', phone: '', specialty: '', role: 'therapist', status: 'active', password: '', confirmPassword: '' };

/* ─────────────────────────────────────────────────────────────── */
/*  THEME HOOK                                                      */
/* ─────────────────────────────────────────────────────────────── */
function useC() {
  const { theme } = useTheme();
  const d = theme === 'dark';
  return {
    isDark: d,
    bg:         d ? '#0b0f1a' : '#f0f4f8',
    card:       d ? '#111827' : '#ffffff',
    cardBorder: d ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
    shadow:     d ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)',
    inner:      d ? '#0d1424' : '#f8fafc',
    inputBg:    d ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    inputBdr:   d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    txt:        d ? '#f0f6ff' : '#0f172a',
    txtSec:     d ? '#8fa3c0' : '#475569',
    txtMuted:   d ? '#4e6280' : '#94a3b8',
    divider:    d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    pillBg:     d ? 'rgba(255,255,255,0.06)' : '#eef2f7',
    tableHead:  d ? '#0e1726' : '#f1f5f9',
    accent:     d ? '#34d399' : '#059669',
  };
}

/* ─────────────────────────────────────────────────────────────── */
/*  ATOMS                                                           */
/* ─────────────────────────────────────────────────────────────── */
function Avatar({ name, gradient, size = 38 }) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <div aria-hidden className="flex items-center justify-center font-black text-white flex-shrink-0 select-none shadow-md"
      style={{ width: size, height: size, borderRadius: '50%', background: gradient || 'linear-gradient(135deg,#062c22,#059669)', fontSize: Math.max(9, size * 0.35), letterSpacing: '-0.02em' }}>
      {initials}
    </div>
  );
}

function RolePill({ role }) {
  const m = ROLE_META[role] || { label: role, color: '#64748b', badgeBg: 'rgba(100,116,139,0.12)' };
  return (
    <span className="inline-flex items-center text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider"
      style={{ background: m.badgeBg, color: m.color }}>{m.label}</span>
  );
}

function StatusDot({ status }) {
  const on = status === 'active';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
      style={{ background: on ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)', color: on ? '#059669' : '#64748b' }}>
      <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
      {on ? 'Active' : 'Inactive'}
    </span>
  );
}

function Toggle({ on, onChange, disabled, id }) {
  return (
    <button type="button" role="switch" aria-checked={on} id={id} disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className="relative inline-flex flex-shrink-0 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:outline-none"
      style={{ width: 38, height: 22, borderRadius: 99, background: on ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(148,163,184,0.3)', opacity: disabled ? 0.4 : 1 }}>
      <span className="inline-block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform"
        style={{ transform: on ? 'translateX(18px)' : 'translateX(3px)', marginTop: 3 }} />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MODAL SHELL                                                     */
/* ─────────────────────────────────────────────────────────────── */
function ModalShell({ children, onClose, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div className={`fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
        <motion.div className={`w-full ${maxWidth} rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-2xl`}
          initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 35 }}
          onClick={e => e.stopPropagation()}>
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-2.5 pb-0 sm:hidden" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MODAL: USER DETAIL                                              */
/* ─────────────────────────────────────────────────────────────── */
function UserDetailModal({ user, onClose, onEdit, C }) {
  if (!user) return null;
  const meta = ROLE_META[user.role] || ROLE_META.staff;
  const Icon = meta.icon;
  return (
    <ModalShell onClose={onClose}>
      <div style={{ background: C.card }}>
        {/* Gradient Hero */}
        <div className="p-6 pt-8 sm:pt-6 relative text-white" style={{ background: meta.grad }}>
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <Avatar name={user.name} gradient="rgba(255,255,255,0.2)" size={56} />
            <div>
              <h3 className="font-black text-xl text-white leading-tight">{user.name}</h3>
              <p className="text-xs text-white/75 mt-0.5">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white/20 uppercase tracking-wider text-white flex items-center gap-1">
                  <Icon className="w-3 h-3" /> {meta.label}
                </span>
                <StatusDot status={user.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Phone',         value: user.phone || '—',                      icon: Phone },
              { label: 'Specialization',value: user.specialty || '—',                  icon: Briefcase },
              { label: 'Revenue Share', value: user.role === 'therapist' ? '40% Earnings' : user.role === 'admin' ? '60% Revenue' : 'Salary-based', icon: TrendingUp },
              { label: 'Date Joined',   value: user.joined || '—',                     icon: Calendar },
            ].map(({ label, value, icon: Ic }) => (
              <div key={label} className="p-3.5 rounded-2xl space-y-1" style={{ background: C.inner }}>
                <div className="flex items-center gap-1.5">
                  <Ic className="w-3 h-3 text-slate-400" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                </div>
                <p className="text-xs font-bold" style={{ color: C.txt }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-2xl" style={{ background: C.inner }}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Access & Permissions</p>
            <p className="text-xs" style={{ color: C.txtSec }}>{meta.desc}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 sm:pb-5 pt-0 flex gap-3" style={{ borderTop: `1px solid ${C.divider}`, paddingTop: 14 }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-xs font-bold transition-all hover:opacity-80"
            style={{ background: C.inner, color: C.txtSec }}>Close</button>
          <button onClick={() => { onClose(); onEdit(user); }}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white shadow-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}>Edit Profile</button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  FORM FIELD ATOM                                                  */
/* ─────────────────────────────────────────────────────────────── */
function FormField({ label, required, error, icon: Ic, children, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
          {Ic && <Ic className="w-3.5 h-3.5 text-emerald-500" />}
          {label}{required && <span className="text-red-400 font-bold">*</span>}
        </label>
        {hint && <span className="text-[9px] font-medium text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1 animate-fadeIn">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MODAL: ADD / EDIT USER                                           */
/* ─────────────────────────────────────────────────────────────── */
function AddEditUserModal({ user, onClose, onSave }) {
  const C = useC();
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'therapist',
    status: user?.status || 'active',
    specialty: user?.specialty || (user?.role === 'staff' ? 'Front Desk Coordinator' : 'Swedish & Deep Tissue'),
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      // Real-time error clearance & password match sync
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[k];
        if (k === 'password' || k === 'confirmPassword') {
          if (next.password && next.confirmPassword && next.password === next.confirmPassword) {
            delete updated.confirmPassword;
            if (updated.password && (updated.password.toLowerCase().includes('confirm') || updated.password.toLowerCase().includes('match'))) {
              delete updated.password;
            }
          }
        }
        return updated;
      });
      return next;
    });
    if (serverError) setServerError('');
  };

  const handleRoleChange = newRole => {
    // Strictly prevent admin role assignment
    if (newRole === 'admin') return;
    setForm(p => ({
      ...p,
      role: newRole,
      specialty: newRole === 'therapist'
        ? (p.specialty && !STAFF_POSITION_PRESETS.includes(p.specialty) ? p.specialty : 'Swedish & Deep Tissue')
        : (p.specialty && !THERAPIST_SPECIALTY_PRESETS.includes(p.specialty) ? p.specialty : 'Front Desk Coordinator'),
    }));
  };

  const toggleSpecialtyTag = tag => {
    const current = form.specialty ? form.specialty.split(',').map(s => s.trim()).filter(Boolean) : [];
    let next;
    if (current.includes(tag)) {
      next = current.filter(t => t !== tag);
    } else {
      next = [...current, tag];
    }
    set('specialty', next.join(', '));
  };

  const generateSecurePassword = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let pw = 'Cozy@2026';
    for (let i = 0; i < 4; i++) {
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pw += '!';
    setForm(p => ({ ...p, password: pw, confirmPassword: pw }));
    setErrors(prev => {
      const updated = { ...prev };
      delete updated.password;
      delete updated.confirmPassword;
      return updated;
    });
    setShowPw(true);
    setShowConfirmPw(true);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pw);
      toast.success('Generated strong password & copied to clipboard!');
    } else {
      toast.info('Generated strong password!');
    }
  };

  const validate = () => {
    const e = {};
    const nameTrimmed = form.name.trim();
    if (!nameTrimmed) {
      e.name = 'Full name is required';
    } else if (nameTrimmed.length < 2) {
      e.name = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.\-']+$/.test(nameTrimmed)) {
      e.name = 'Full name can only contain letters, spaces, hyphens, and periods';
    }

    const emailTrimmed = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed) {
      e.email = 'Email address is required';
    } else if (!emailRegex.test(emailTrimmed)) {
      e.email = 'Please provide a valid email address (e.g. maria@cozy.spa)';
    }

    if (form.phone && form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[\s\-().+]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 16 || !/^\+?[0-9\s\-().]+$/.test(form.phone.trim())) {
        e.phone = 'Please enter a valid contact number (e.g. +63 917 123 4567)';
      }
    }

    // Role strict check: NO ADMIN ROLE ALLOWED
    if (form.role === 'admin') {
      e.role = 'Security Rule: Administrator accounts cannot be created through this module.';
    } else if (!['therapist', 'staff'].includes(form.role)) {
      e.role = 'Please select a valid operational role (Therapist or Staff Coordinator).';
    }

    if (form.role === 'therapist' && !form.specialty.trim()) {
      e.specialty = 'Specialization is required for therapist scheduling (e.g. Swedish, Deep Tissue)';
    }

    if (!isEdit) {
      if (!form.password) {
        e.password = 'Initial account password is required';
      } else if (form.password.length < 8) {
        e.password = 'Password must be at least 8 characters';
      }

      if (!form.confirmPassword) {
        e.confirmPassword = 'Confirmation password is required';
      } else if (form.password !== form.confirmPassword) {
        e.confirmPassword = 'Password confirmation does not match';
      }
    } else if (form.password) {
      if (form.password.length < 8) {
        e.password = 'Password must be at least 8 characters';
      }
      if (form.password !== form.confirmPassword) {
        e.confirmPassword = 'Password confirmation does not match';
      }
    }

    return e;
  };

  const submit = async e => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...form,
        password_confirmation: form.confirmPassword,
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          const msg = Array.isArray(v) ? v[0] : v;
          if (k === 'password' && (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('match'))) {
            fieldErrors.confirmPassword = msg;
          } else {
            fieldErrors[k] = msg;
          }
        });
        setErrors(fieldErrors);
      }
      setServerError(err.response?.data?.message || 'Could not save account details. Please verify the input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pwStrength = getPasswordStrength(form.password);
  const passwordsMatch = !!(form.password && form.confirmPassword && form.password === form.confirmPassword);
  const passwordsMismatch = !!(form.confirmPassword && form.password !== form.confirmPassword);

  const inputStyle = err => ({
    background: C.inputBg,
    border: `1.5px solid ${err ? '#f87171' : C.inputBdr}`,
    color: C.txt,
    boxShadow: err ? '0 0 0 3px rgba(248,113,113,0.12)' : 'none',
  });

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={submit} style={{ background: C.card }}
        className="flex flex-col max-h-[92vh] sm:max-h-[88vh] w-full rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-2xl border border-white/10">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-5 pb-4 flex-shrink-0 backdrop-blur-md"
          style={{ borderBottom: `1px solid ${C.divider}`, background: C.card }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
              style={{
                background: isEdit
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.3))'
                  : 'linear-gradient(135deg, rgba(5,150,105,0.2), rgba(16,185,129,0.3))',
                border: isEdit ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(5,150,105,0.3)',
              }}>
              {isEdit ? <Edit3 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-500" />
                : <Plus className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-500" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-base md:text-lg tracking-tight truncate" style={{ color: C.txt }}>
                  {isEdit ? 'Edit Team Member Profile' : 'Create New Account'}
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(5,150,105,0.12)', color: '#059669' }}>
                  Team Onboarding
                </span>
              </div>
              <p className="text-[11px] sm:text-xs truncate mt-0.5" style={{ color: C.txtMuted }}>
                {isEdit ? 'Update credentials, service specialization & role details' : 'Register a new team member to the system'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:rotate-90 hover:opacity-80 flex-shrink-0 cursor-pointer"
            style={{ background: C.inner, color: C.txtMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5"
          style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* Server Error Alert */}
          {serverError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3.5 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs font-semibold text-red-500 leading-snug">
                {serverError}
              </div>
            </motion.div>
          )}

          {/* Interactive Live Luxury Preview Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl relative overflow-hidden transition-all duration-300"
            style={{
              background: C.inner,
              border: `1.5px solid ${form.role === 'therapist' ? 'rgba(217,119,6,0.3)' : 'rgba(59,130,246,0.3)'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar name={form.name || '?'} gradient={ROLE_META[form.role]?.grad} size={44} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black truncate" style={{ color: C.txt }}>
                      {form.name || 'Preview Name'}
                    </p>
                    <RolePill role={form.role} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs truncate font-medium" style={{ color: C.txtMuted }}>
                      {form.email || 'preview@email.com'}
                    </p>
                    {form.phone && (
                      <span className="text-[10px] font-semibold text-slate-400">· {form.phone}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <StatusDot status={form.status} />
              </div>
            </div>

            {/* Specialization and compensation snippet in preview */}
            <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-2"
              style={{ borderTop: `1px solid ${C.divider}` }}>
              <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: C.txtSec }}>
                <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-bold">{form.role === 'therapist' ? 'Specialty:' : 'Position:'}</span>
                <span className="truncate max-w-[260px] sm:max-w-[340px]">{form.specialty || 'None assigned yet'}</span>
              </div>
              <div className="text-[10px] font-black px-2.5 py-1 rounded-lg"
                style={{
                  background: form.role === 'therapist' ? 'rgba(217,119,6,0.12)' : 'rgba(59,130,246,0.12)',
                  color: form.role === 'therapist' ? '#d97706' : '#2563eb',
                }}>
                {form.role === 'therapist' ? '40% Revenue Split' : 'Fixed Operations Salary'}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <FormField label="Full Name" required error={errors.name} icon={User}>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Maria Santos"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
              style={inputStyle(errors.name)} />
          </FormField>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Email Address" required error={errors.email} icon={Mail}>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="maria@cozy.spa"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                style={inputStyle(errors.email)} />
            </FormField>
            <FormField label="Phone Number" error={errors.phone} icon={Phone} hint="Optional (e.g. +63 9XX)">
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+63 917 123 4567"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                style={inputStyle(errors.phone)} />
            </FormField>
          </div>

          {/* System Role Selection (STRICTLY NO ADMIN ALLOWED) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> System Role <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                <Lock className="w-3 h-3" /> No Admin Roles
              </span>
            </div>

            {/* Dual Card Role Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Therapist */}
              <button type="button" onClick={() => handleRoleChange('therapist')}
                className="p-3.5 rounded-2xl text-left transition-all relative overflow-hidden flex items-start gap-3 border cursor-pointer"
                style={{
                  background: form.role === 'therapist' ? 'rgba(217,119,6,0.08)' : C.inner,
                  borderColor: form.role === 'therapist' ? '#d97706' : C.inputBdr,
                  boxShadow: form.role === 'therapist' ? '0 0 0 2px rgba(217,119,6,0.25)' : 'none',
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#78350f,#d97706)', color: '#fff' }}>
                  <Stethoscope className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black" style={{ color: C.txt }}>Therapist</p>
                    {form.role === 'therapist' && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] mt-0.5 leading-snug" style={{ color: C.txtMuted }}>
                    Service provider with appointment assignment & 40% revenue split
                  </p>
                </div>
              </button>

              {/* Option 2: Staff Coordinator */}
              <button type="button" onClick={() => handleRoleChange('staff')}
                className="p-3.5 rounded-2xl text-left transition-all relative overflow-hidden flex items-start gap-3 border cursor-pointer"
                style={{
                  background: form.role === 'staff' ? 'rgba(59,130,246,0.08)' : C.inner,
                  borderColor: form.role === 'staff' ? '#3b82f6' : C.inputBdr,
                  boxShadow: form.role === 'staff' ? '0 0 0 2px rgba(59,130,246,0.25)' : 'none',
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff' }}>
                  <UserCog className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black" style={{ color: C.txt }}>Staff Coordinator</p>
                    {form.role === 'staff' && (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] mt-0.5 leading-snug" style={{ color: C.txtMuted }}>
                    Front desk reception, booking queue & therapist schedule control
                  </p>
                </div>
              </button>
            </div>

            {/* Security Guard Notice */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-[10px]"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', color: C.txtSec }}>
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>
                <strong className="text-red-500 font-bold">Admin Role Restricted:</strong> Administrator accounts require root governance and cannot be provisioned via staff onboarding.
              </span>
            </div>
            {errors.role && <p className="text-[10px] font-bold text-red-400 flex items-center gap-1">⚠ {errors.role}</p>}
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => set('status', 'active')}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                style={{
                  background: form.status === 'active' ? 'rgba(16,185,129,0.12)' : C.inputBg,
                  borderColor: form.status === 'active' ? '#10b981' : C.inputBdr,
                  color: form.status === 'active' ? '#059669' : C.txtMuted,
                }}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </button>
              <button type="button" onClick={() => set('status', 'inactive')}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                style={{
                  background: form.status === 'inactive' ? 'rgba(148,163,184,0.15)' : C.inputBg,
                  borderColor: form.status === 'inactive' ? '#94a3b8' : C.inputBdr,
                  color: form.status === 'inactive' ? C.txt : C.txtMuted,
                }}>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Inactive
              </button>
            </div>
          </div>

          {/* Specialization / Role Position with Quick Select Chips */}
          {form.role === 'therapist' ? (
            <div className="space-y-2.5">
              <FormField label="Specialization" required error={errors.specialty} icon={Briefcase}>
                <input value={form.specialty} onChange={e => set('specialty', e.target.value)}
                  placeholder="e.g. Swedish & Deep Tissue"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                  style={inputStyle(errors.specialty)} />
              </FormField>
              {/* Preset Tags */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Quick-Add Treatments:</span>
                <div className="flex flex-wrap gap-1.5">
                  {THERAPIST_SPECIALTY_PRESETS.map(tag => {
                    const active = (form.specialty || '').includes(tag);
                    return (
                      <button key={tag} type="button" onClick={() => toggleSpecialtyTag(tag)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        style={{
                          background: active ? 'rgba(217,119,6,0.2)' : C.pillBg,
                          color: active ? '#d97706' : C.txtSec,
                          border: active ? '1px solid rgba(217,119,6,0.4)' : '1px solid transparent',
                        }}>
                        {active ? '✓ ' : '+ '} {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Revenue Policy Banner */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.22)' }}>
                <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#d97706' }} />
                <div>
                  <p className="text-[10px] font-black" style={{ color: '#d97706' }}>Revenue Split (Fixed Policy)</p>
                  <p className="text-[10px] mt-0.5" style={{ color: C.txtSec }}>
                    Therapist earns <strong>40%</strong> per booking · Admin retains <strong>60%</strong> · Weekly salary payout every Friday
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <FormField label="Position / Role Title" required error={errors.specialty} icon={Briefcase}>
                <input value={form.specialty} onChange={e => set('specialty', e.target.value)}
                  placeholder="e.g. Front Desk Coordinator"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                  style={inputStyle(errors.specialty)} />
              </FormField>
              {/* Preset Titles */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Preset Positions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {STAFF_POSITION_PRESETS.map(pos => {
                    const active = form.specialty === pos;
                    return (
                      <button key={pos} type="button" onClick={() => set('specialty', pos)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        style={{
                          background: active ? 'rgba(59,130,246,0.2)' : C.pillBg,
                          color: active ? '#2563eb' : C.txtSec,
                          border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                        }}>
                        {pos}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Staff Terms Banner */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.22)' }}>
                <TrendingUp className="w-4 h-4 flex-shrink-0 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black text-blue-500">Staff Coordinator</p>
                  <p className="text-[10px] mt-0.5" style={{ color: C.txtSec }}>
                    Fixed salary basis · Manages scheduling, clients & bookings across all shifts
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Password & Security Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                {isEdit ? 'Security Credentials (Optional)' : 'Security Credentials'}
              </span>
              <button type="button" onClick={generateSecurePassword}
                className="text-[10px] font-black flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all hover:opacity-85 shadow-sm cursor-pointer"
                style={{ background: 'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(16,185,129,0.25))', color: '#059669', border: '1px solid rgba(5,150,105,0.3)' }}>
                <Sparkles className="w-3 h-3 text-emerald-500" /> Auto-Generate Secure
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <FormField label="Password" required={!isEdit} error={errors.password} icon={Lock}>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 8 characters'}
                    className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                    style={inputStyle(errors.password)} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>

              {/* Confirm Password */}
              <FormField label="Confirm Password" required={!isEdit || !!form.password} error={errors.confirmPassword} icon={Lock}>
                <div className="relative">
                  <input type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                    style={inputStyle(errors.confirmPassword)} />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                    {showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>
            </div>

            {/* Live Password Strength & Match Meter */}
            {form.password && (
              <div className="p-3 rounded-xl space-y-2" style={{ background: C.inner }}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-400">Password Strength:</span>
                  <span className="font-black" style={{ color: pwStrength.color }}>
                    {pwStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-700/30 overflow-hidden">
                  <div className="h-full transition-all duration-300 rounded-full"
                    style={{ width: `${pwStrength.percent}%`, background: pwStrength.color }} />
                </div>
                {passwordsMatch && (
                  <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Passwords match perfectly
                  </p>
                )}
                {passwordsMismatch && (
                  <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Passwords do not match
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3.5 sm:py-4 flex-shrink-0 backdrop-blur-md"
          style={{ borderTop: `1px solid ${C.divider}`, background: C.card }}>
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ background: C.inner, color: C.txtSec }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer"
            style={{
              background: isSubmitting
                ? '#059669'
                : 'linear-gradient(135deg, #059669 0%, #0a5f3c 100%)',
              boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
            }}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Update Profile' : 'Create Account'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  TAB 1: USER PROFILES                                            */
/* ─────────────────────────────────────────────────────────────── */
function TabProfiles({ users, onUsersChange }) {
  const C = useC();
  const { toast } = useToast();
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [viewMode, setViewMode]       = useState('table');
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [addingUser, setAddingUser]   = useState(false);

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const mQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.specialty||'').toLowerCase().includes(q);
    return mQ && (roleFilter === 'all' || u.role === roleFilter);
  }), [users, search, roleFilter]);

  const toggleStatus = async id => {
    try {
      const res = await axios.post(`/admin/team-members/${id}/toggle-status`);
      const nextStatus = res.data?.status;
      onUsersChange(prev => prev.map(u => {
        if (u.id !== id) return u;
        const s = nextStatus || (u.status === 'active' ? 'inactive' : 'active');
        toast.info(`${u.name} set to ${s}`);
        return { ...u, status: s };
      }));
    } catch {
      onUsersChange(prev => prev.map(u => {
        if (u.id !== id) return u;
        const next = u.status === 'active' ? 'inactive' : 'active';
        toast.info(`${u.name} set to ${next}`);
        return { ...u, status: next };
      }));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove team member "${name}"? This will delete their account credentials.`)) {
      return;
    }
    try {
      await axios.delete(`/admin/team-members/${id}`);
      onUsersChange(prev => prev.filter(u => u.id !== id));
      toast.success(`${name} removed successfully.`);
    } catch {
      onUsersChange(prev => prev.filter(u => u.id !== id));
      toast.info(`${name} removed from list.`);
    }
  };

  const handleSave = async form => {
    const payload = {
      ...form,
      password_confirmation: form.confirmPassword,
    };
    if (editingUser) {
      try {
        const res = await axios.put(`/admin/team-members/${editingUser.id}`, payload);
        const updated = res.data?.user || { ...editingUser, ...payload };
        onUsersChange(prev => prev.map(u => u.id === editingUser.id ? updated : u));
        toast.success('Team member profile updated successfully!');
        setEditingUser(null);
      } catch (err) {
        if (err.response?.status === 422 || err.response?.status === 403) {
          throw err;
        }
        onUsersChange(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...payload } : u));
        toast.success('Profile updated!');
        setEditingUser(null);
      }
    } else {
      try {
        const res = await axios.post('/admin/team-members', payload);
        const created = res.data?.user || { id: Date.now(), ...payload, joined: new Date().toISOString().slice(0, 10) };
        onUsersChange(prev => [created, ...prev]);
        toast.success(`New ${form.role === 'therapist' ? 'Therapist' : 'Staff Coordinator'} registered!`);
        setAddingUser(false);
      } catch (err) {
        if (err.response?.status === 422 || err.response?.status === 403) {
          throw err;
        }
        onUsersChange(prev => [{ id: Date.now(), ...payload, joined: new Date().toISOString().slice(0, 10) }, ...prev]);
        toast.success('New user created!');
        setAddingUser(false);
      }
    }
  };

  const KPI_CARDS = [
    { label: 'Total Users', count: users.length,                               color: '#3b82f6', bg: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(59,130,246,0.04))', icon: Users        },
    { label: 'Active',      count: users.filter(u=>u.status==='active').length, color: '#10b981', bg: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.04))', icon: CheckCircle2  },
    { label: 'Therapists',  count: users.filter(u=>u.role==='therapist').length,color: '#f59e0b', bg: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04))', icon: Stethoscope  },
    { label: 'Staff',       count: users.filter(u=>u.role==='staff').length,    color: '#8b5cf6', bg: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(139,92,246,0.04))', icon: UserCog      },
  ];

  return (
    <div className="space-y-4">
      {viewingUser && <UserDetailModal user={viewingUser} onClose={() => setViewingUser(null)} onEdit={u => { setViewingUser(null); setEditingUser(u); }} C={C} />}
      {(addingUser || editingUser) && <UserFormModal user={editingUser} onClose={() => { setAddingUser(false); setEditingUser(null); }} onSave={handleSave} C={C} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KPI_CARDS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}
            className="p-4 sm:p-5 rounded-2xl flex items-center justify-between overflow-hidden relative"
            style={{ background: C.card, boxShadow: C.shadow }}>
            {/* Gradient accent background */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: s.bg }} />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: C.txtMuted }}>{s.label}</p>
              <p className="text-3xl font-black leading-none" style={{ color: C.txt }}>{s.count}</p>
            </div>
            <div className="relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ background: `${s.color}20` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3.5 rounded-2xl"
        style={{ background: C.card, boxShadow: C.shadow }}>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, specialty…"
            className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl outline-none font-medium"
            style={{ background: C.inner, border: `1.5px solid ${C.inputBdr}`, color: C.txt }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: C.inner }}>
            {['all','staff','therapist'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-black capitalize transition-all"
                style={{ background: roleFilter === r ? C.accent : 'transparent', color: roleFilter === r ? '#fff' : C.txtSec }}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center p-1 rounded-xl" style={{ background: C.inner }}>
            {[['table', BarChart3], ['cards', Layers]].map(([m, Ico]) => (
              <button key={m} onClick={() => setViewMode(m)} className="p-1.5 rounded-lg transition-all"
                style={{ background: viewMode === m ? `${C.accent}20` : 'transparent', color: viewMode === m ? C.accent : C.txtMuted }}>
                <Ico className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button onClick={() => setAddingUser(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}>
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Table / Cards */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.shadow }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr style={{ background: C.tableHead }}>
                  {['User','Specialization','Role','Status','Commission','Joined','Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const meta = ROLE_META[u.role] || ROLE_META.staff;
                  return (
                    <tr key={u.id} onClick={() => setViewingUser(u)}
                      className="cursor-pointer transition-colors group"
                      style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.divider}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.inner}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} gradient={meta.grad} size={36} />
                          <div>
                            <p className="text-xs font-bold" style={{ color: C.txt }}>{u.name}</p>
                            <p className="text-[10px]" style={{ color: C.txtMuted }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium" style={{ color: C.txtSec }}>{u.specialty || '—'}</td>
                      <td className="px-4 py-3.5"><RolePill role={u.role} /></td>
                      <td className="px-4 py-3.5"><StatusDot status={u.status} /></td>
                      <td className="px-4 py-3.5">
                        {u.role === 'therapist'
                          ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>{u.commRate}% Comm.</span>
                          : <span className="text-[10px]" style={{ color: C.txtMuted }}>—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-[11px]" style={{ color: C.txtMuted }}>{u.joined}</td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditingUser(u)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                            style={{ background: C.inner, color: C.txtSec }}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleStatus(u.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                            style={{
                              background: u.status === 'active' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                              color: u.status === 'active' ? '#ef4444' : '#059669',
                            }}>
                            {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: C.txtMuted }}>No users match your search or filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(u => {
            const meta = ROLE_META[u.role] || ROLE_META.staff;
            return (
              <div key={u.id} onClick={() => setViewingUser(u)}
                className="p-5 rounded-2xl space-y-3.5 cursor-pointer transition-all hover:-translate-y-1"
                style={{ background: C.card, boxShadow: C.shadow }}>
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} gradient={meta.grad} size={42} />
                    <div>
                      <p className="font-bold text-sm leading-tight" style={{ color: C.txt }}>{u.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.txtMuted }}>{u.email}</p>
                    </div>
                  </div>
                  <StatusDot status={u.status} />
                </div>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${C.divider}` }}>
                  <span className="text-xs" style={{ color: C.txtMuted }}>{u.specialty || '—'}</span>
                  <RolePill role={u.role} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  TAB 2: WORK SCHEDULES                                           */
/* ─────────────────────────────────────────────────────────────── */
function TabSchedules({ users }) {
  const C = useC();
  const { toast } = useToast();
  const buildDefault = () => Object.fromEntries(DAYS.map((d, i) => [d, i < 5 ? ['morning','afternoon'] : i === 5 ? ['morning'] : []]));
  const teamUsers = users.filter(u => u.role === 'staff' || u.role === 'therapist');

  const [selected, setSelected]     = useState(teamUsers[0]?.id || null);
  const [schedules, setSchedules]   = useState(() => Object.fromEntries(users.map(u => [u.id, buildDefault()])));
  const [roleFilter, setRoleFilter] = useState('all');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  const filteredTeam = teamUsers.filter(u => roleFilter === 'all' || u.role === roleFilter);
  const person       = filteredTeam.find(u => u.id === selected) || null;
  const sched        = selected ? (schedules[selected] || {}) : {};
  const totalShifts  = Object.values(sched).reduce((a, b) => a + b.length, 0);

  const toggle = (day, shiftId) => {
    setSchedules(prev => {
      const curr = prev[selected]?.[day] || [];
      const next = curr.includes(shiftId) ? curr.filter(s => s !== shiftId) : [...curr, shiftId];
      return { ...prev, [selected]: { ...(prev[selected]||{}), [day]: next } };
    });
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false); setSaved(true);
    toast.success('Shifts saved!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black" style={{ color: C.txt }}>Work Schedules</h2>
          <p className="text-xs mt-0.5" style={{ color: C.txtMuted }}>Assign and manage weekly shift rosters for your team</p>
        </div>
        {person && (
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}>
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Shifts'}
          </button>
        )}
      </div>

      {/* Shift legend */}
      <div className="flex flex-wrap gap-2 p-3.5 rounded-2xl" style={{ background: C.card, boxShadow: C.shadow }}>
        <span className="text-[10px] font-black uppercase tracking-widest mr-1 self-center" style={{ color: C.txtMuted }}>Shift Times:</span>
        {SHIFTS.map(sh => (
          <span key={sh.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: sh.bg, color: sh.color }}>
            <span>{sh.icon}</span>
            <span className="font-black">{sh.label}</span>
            <span className="font-medium opacity-80 hidden sm:inline">{sh.time}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Roster */}
        <div className="lg:col-span-4 rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.shadow }}>
          <div className="p-3.5" style={{ borderBottom: `1px solid ${C.divider}` }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.txtMuted }}>Team Roster</p>
            <div className="flex gap-1">
              {['all','staff','therapist'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-black capitalize transition-all"
                  style={{ background: roleFilter === r ? C.accent : C.inner, color: roleFilter === r ? '#fff' : C.txtSec }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 space-y-0.5 max-h-[62vh] overflow-y-auto">
            {filteredTeam.map(u => {
              const isSel = selected === u.id;
              const meta  = ROLE_META[u.role] || ROLE_META.staff;
              const hrs   = Object.values(schedules[u.id] || {}).reduce((a, b) => a + b.length, 0) * 4;
              return (
                <button key={u.id} onClick={() => setSelected(u.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                  style={{ background: isSel ? `${C.accent}12` : 'transparent', borderLeft: `3px solid ${isSel ? C.accent : 'transparent'}` }}>
                  <Avatar name={u.name} gradient={meta.grad} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: C.txt }}>{u.name}</p>
                    <p className="text-[10px] truncate" style={{ color: C.txtMuted }}>{u.specialty || u.role}</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: C.inner, color: C.accent }}>{hrs}h</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shift editor */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.shadow }}>
          {!person ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: C.inner }}>
                <Calendar className="w-6 h-6" style={{ color: C.txtMuted }} />
              </div>
              <p className="text-sm font-bold" style={{ color: C.txt }}>Select a team member</p>
              <p className="text-xs mt-1" style={{ color: C.txtMuted }}>Choose from the roster on the left</p>
            </div>
          ) : (
            <>
              {/* Person header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5" style={{ borderBottom: `1px solid ${C.divider}` }}>
                <div className="flex items-center gap-3">
                  <Avatar name={person.name} gradient={ROLE_META[person.role]?.grad} size={44} />
                  <div>
                    <p className="font-black text-sm" style={{ color: C.txt }}>{person.name}</p>
                    <p className="text-xs" style={{ color: C.txtMuted }}>{person.specialty || person.role}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Shifts</p>
                    <p className="text-base font-black" style={{ color: C.txt }}>{totalShifts}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Total Hrs</p>
                    <p className="text-base font-black" style={{ color: C.accent }}>{totalShifts * 4}h</p>
                  </div>
                </div>
              </div>

              {/* Column headers (desktop) */}
              <div className="hidden sm:grid px-4 pt-3 pb-0 gap-2 text-center"
                style={{ gridTemplateColumns: '3rem 1fr 1fr 1fr' }}>
                <div />
                {SHIFTS.map(sh => (
                  <div key={sh.id}>
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: sh.color }}>{sh.icon} {sh.label}</p>
                    <p className="text-[8px] font-medium" style={{ color: C.txtMuted }}>{sh.time}</p>
                  </div>
                ))}
              </div>

              {/* Day rows */}
              <div className="p-3 sm:p-4 space-y-2">
                {DAYS.map((day, di) => {
                  const dayShifts = sched[day] || [];
                  const isWE = di >= 5;
                  return (
                    <div key={day} className="rounded-xl overflow-hidden" style={{ background: C.inner }}>
                      {/* Mobile layout */}
                      <div className="sm:hidden p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black" style={{ color: isWE ? C.txtMuted : C.txt }}>{day}</span>
                          {isWE && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: C.card, color: C.txtMuted }}>Weekend</span>}
                        </div>
                        <div className="flex gap-1.5">
                          {SHIFTS.map(sh => {
                            const active = dayShifts.includes(sh.id);
                            return (
                              <button key={sh.id} onClick={() => toggle(day, sh.id)}
                                className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all text-[9px] font-bold"
                                style={{ background: active ? sh.bg : C.card, color: active ? sh.color : C.txtMuted, outline: active ? `1.5px solid ${sh.color}50` : 'none' }}>
                                <span>{sh.icon}</span>
                                <span>{sh.label}</span>
                                <span className="opacity-70 font-medium leading-tight hidden xs:block">{sh.time}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden sm:grid items-center gap-2 px-3 py-2" style={{ gridTemplateColumns: '3rem 1fr 1fr 1fr' }}>
                        <span className="text-xs font-black" style={{ color: isWE ? C.txtMuted : C.txt }}>{day}</span>
                        {SHIFTS.map(sh => {
                          const active = dayShifts.includes(sh.id);
                          return (
                            <button key={sh.id} onClick={() => toggle(day, sh.id)}
                              className="flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl text-center transition-all hover:scale-[1.04] active:scale-95"
                              style={{ background: active ? sh.bg : C.card, color: active ? sh.color : C.txtMuted, outline: active ? `1.5px solid ${sh.color}50` : 'none' }}>
                              <span className="text-sm leading-none">{sh.icon}</span>
                              <span className="text-[10px] font-black">{sh.label}</span>
                              <span className="text-[8px] opacity-70 font-medium">{active ? sh.time : '—'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary footer */}
              <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3" style={{ borderTop: `1px solid ${C.divider}`, background: C.inner }}>
                {SHIFTS.map(sh => {
                  const cnt = DAYS.filter(d => (sched[d]||[]).includes(sh.id)).length;
                  return (
                    <span key={sh.id} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ background: sh.color }} />
                      <span className="font-bold" style={{ color: sh.color }}>{sh.label}</span>
                      <span style={{ color: C.txtMuted }}>{cnt}d · {cnt*4}h</span>
                    </span>
                  );
                })}
                <span className="ml-auto text-xs font-black" style={{ color: C.accent }}>{totalShifts * 4} hrs / week</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  TAB 3: THERAPIST QUEUE                                          */
/* ─────────────────────────────────────────────────────────────── */
function TabQueue({ users }) {
  const C = useC();
  const { toast } = useToast();
  const therapists = users.filter(u => u.role === 'therapist' && u.status === 'active');
  const [queue, setQueue] = useState(therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0 })));

  const swap = (idx, dir) => {
    const ni = idx + dir;
    if (ni < 0 || ni >= queue.length) return;
    setQueue(prev => {
      const next = [...prev];
      [next[idx], next[ni]] = [next[ni], next[idx]];
      return next.map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const markServed = id => {
    setQueue(prev => {
      const target = prev.find(t => t.id === id);
      const rest   = prev.filter(t => t.id !== id);
      toast.success(`Session assigned to ${target?.name}. Moved to end.`);
      return [...rest, { ...target, sessions: target.sessions + 1 }].map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black" style={{ color: C.txt }}>Therapist Queue & Rotation</h2>
        <p className="text-xs mt-0.5" style={{ color: C.txtMuted }}>Fair dispatch scheduling for active therapists</p>
      </div>

      <div className="space-y-2.5">
        {queue.map((t, idx) => (
          <div key={t.id} className="flex items-center gap-3 p-4 rounded-2xl transition-all"
            style={{ background: C.card, boxShadow: C.shadow, outline: idx === 0 ? `2px solid ${C.accent}40` : 'none' }}>
            {/* Position badge */}
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs flex-shrink-0"
              style={{ background: idx === 0 ? `linear-gradient(135deg,#059669,#0a5f3c)` : C.inner, color: idx === 0 ? '#fff' : C.txtMuted }}>
              #{t.position}
            </div>
            <Avatar name={t.name} gradient={ROLE_META[t.role]?.grad} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <p className="text-sm font-bold truncate" style={{ color: C.txt }}>{t.name}</p>
                {idx === 0 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: C.accent }}>NEXT UP</span>}
                {t.sessions > 0 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>{t.sessions} served</span>}
              </div>
              <p className="text-xs truncate mt-0.5" style={{ color: C.txtMuted }}>{t.specialty}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => swap(idx, -1)} disabled={idx === 0}
                className="p-2 rounded-xl transition-all hover:opacity-80 disabled:opacity-25"
                style={{ background: C.inner, color: C.txtSec }}>
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => swap(idx, 1)} disabled={idx === queue.length - 1}
                className="p-2 rounded-xl transition-all hover:opacity-80 disabled:opacity-25"
                style={{ background: C.inner, color: C.txtSec }}>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button onClick={() => markServed(t.id)}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all hover:opacity-90 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}>
                Assign & Rotate
              </button>
            </div>
          </div>
        ))}
        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl" style={{ background: C.card }}>
            <p className="text-sm font-bold" style={{ color: C.txt }}>No active therapists</p>
            <p className="text-xs mt-1" style={{ color: C.txtMuted }}>All therapists are currently inactive</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  TAB 4: RBAC PERMISSIONS                                         */
/* ─────────────────────────────────────────────────────────────── */
function TabRBAC() {
  const C = useC();
  const { toast } = useToast();
  const [perms, setPerms]   = useState(INITIAL_PERMS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const toggle = (role, perm) => {
    if (ROLE_META[role]?.locked) return;
    setPerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try { await axios.post('/admin/rbac/permissions', { permissions: perms }); } catch {}
    setSaving(false); setSaved(true);
    toast.success('RBAC permissions updated!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2" style={{ color: C.txt }}>
            <Shield className="w-5 h-5" style={{ color: C.accent }} /> Role-Based Access Control
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.txtMuted }}>Configure permission levels per system role</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}>
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Permissions'}
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(ROLE_META).map(([role, meta]) => {
          const Icon  = meta.icon;
          const rp    = perms[role] || {};
          const cnt   = Object.values(rp).filter(Boolean).length;
          const total = Object.keys(PERM_META).length;

          return (
            <div key={role} className="rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.shadow }}>
              {/* Role header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4" style={{ borderBottom: `1px solid ${C.divider}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: meta.grad }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm" style={{ color: C.txt }}>{meta.label}</h3>
                    <p className="text-xs" style={{ color: C.txtMuted }}>{meta.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: total }).map((_, i) => (
                      <span key={i} className="w-3 h-1.5 rounded-full" style={{ background: i < cnt ? C.accent : C.inner }} />
                    ))}
                  </div>
                  <span className="text-xs font-bold" style={{ color: C.accent }}>{cnt}/{total}</span>
                  {meta.locked && <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ background: C.inner, color: C.txtMuted }}>LOCKED</span>}
                </div>
              </div>

              {/* Permission grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {Object.entries(PERM_META).map(([pk, pm], pi) => {
                  const active = !!rp[pk];
                  return (
                    <div key={pk} onClick={() => toggle(role, pk)}
                      className="flex flex-col items-center text-center gap-2 p-4 transition-all cursor-pointer select-none hover:opacity-80"
                      style={{ borderLeft: pi % 3 !== 0 ? `1px solid ${C.divider}` : 'none', borderTop: pi >= 3 ? `1px solid ${C.divider}` : 'none' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: active ? `${pm.color}15` : C.inner }}>
                        <pm.icon className="w-4 h-4 transition-all" style={{ color: active ? pm.color : C.txtMuted }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: C.txt }}>{pm.label}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: C.txtMuted }}>{pm.desc}</p>
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

/* ─────────────────────────────────────────────────────────────── */
/*  ROOT                                                            */
/* ─────────────────────────────────────────────────────────────── */
export default function AdminUserMaintenance() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profiles';
  const [users, setUsers] = useState(MOCK_USERS);

  useEffect(() => {
    axios.get('/admin/team-members')
      .then(res => {
        if (res.data?.team_members && res.data.team_members.length > 0) {
          setUsers(res.data.team_members);
        } else {
          // Fallback if no database team members yet
          axios.get('/admin/therapists').then(tRes => {
            if (tRes.data?.therapists?.length) {
              const apiTherapists = tRes.data.therapists.map(t => ({
                id: t.id, name: t.name, email: t.email, phone: t.phone || '',
                role: 'therapist', specialty: t.specialty || 'General Wellness & Spa',
                status: 'active', joined: '2025-01-15', commRate: 40,
              }));
              setUsers(prev => [...apiTherapists, ...prev.filter(u => u.role !== 'therapist')]);
            }
          }).catch(() => {});
        }
      })
      .catch(() => {
        axios.get('/admin/therapists')
          .then(res => {
            if (res.data?.therapists?.length) {
              const apiTherapists = res.data.therapists.map(t => ({
                id: t.id, name: t.name, email: t.email, phone: t.phone || '',
                role: 'therapist', specialty: t.specialty || 'General Wellness & Spa',
                status: 'active', joined: '2025-01-15', commRate: 40,
              }));
              setUsers(prev => [...apiTherapists, ...prev.filter(u => u.role !== 'therapist')]);
            }
          }).catch(() => {});
      });
  }, []);

  const subMap = { profiles: 'User Profiles', schedules: 'Work Schedules', queue: 'Therapist Queue', rbac: 'Permissions' };

  return (
    <AdminLayout title="User Management" subtitle={subMap[activeTab] || 'User Profiles'} icon={UserCog}>
      <style>{`
        select option { background: #111827 !important; color: #f0f6ff !important; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <AnimatePresence mode="wait">
        {activeTab === 'profiles' && (
          <motion.div key="profiles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <TabProfiles users={users} onUsersChange={setUsers} />
          </motion.div>
        )}
        {activeTab === 'schedules' && (
          <motion.div key="schedules" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <TabSchedules users={users} />
          </motion.div>
        )}
        {activeTab === 'queue' && (
          <motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <TabQueue users={users} />
          </motion.div>
        )}
        {activeTab === 'rbac' && (
          <motion.div key="rbac" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <TabRBAC />
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
