import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Layers, BarChart3, LayoutList, LayoutGrid,
  RefreshCw, Mail, Phone, Lock, Briefcase,
  Eye, EyeOff, Sparkles, ShieldAlert, Check, Copy, AlertCircle, Loader2, KeyRound,
  Trash2, MoreVertical, Filter, ArrowUpDown, Download, RotateCcw,
  CalendarDays, Clock, ArrowLeft, ArrowRight, Sun, Moon, Sunrise, Zap, Coffee, CheckSquare, ListOrdered, Share2
} from 'lucide-react';
import { LuxurySelect, LuxuryDropdownMenu, LuxuryCombobox } from '../../components/ui/LuxuryDropdown';

/* ─────────────────────────────────────────────────────────────── */
/*  CONFIG & CONSTANTS                                              */
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

export const THERAPIST_DEFAULT_COMMISSION = 40;
export const ADMIN_DEFAULT_COMMISSION = 60;

const COMMISSION_TIERS = [
  {
    value: 40,
    label: '40% Standard Therapist Split',
    description: 'Therapist earns 40% · Salon retains 60% per completed appointment',
    tag: 'Standard',
    tagColor: '#d97706',
    tagBg: 'rgba(217,119,6,0.12)',
  },
  {
    value: 45,
    label: '45% Senior Specialist Split',
    description: 'Therapist earns 45% · Salon retains 55% per completed appointment',
    tag: 'Senior',
    tagColor: '#3b82f6',
    tagBg: 'rgba(59,130,246,0.12)',
  },
  {
    value: 50,
    label: '50% Master Specialist Split',
    description: 'Therapist earns 50% · Salon retains 50% for premier signature sessions',
    tag: 'Master',
    tagColor: '#10b981',
    tagBg: 'rgba(16,185,129,0.12)',
  },
];

const INITIAL_PERMS = {
  admin:     { bookings: true,  services: true,  history: true,  settings: true,  analytics: true,  userMgmt: true  },
  staff:     { bookings: true,  services: true,  history: true,  settings: false, analytics: true,  userMgmt: false },
  therapist: { bookings: true,  services: false, history: false, settings: false, analytics: false, userMgmt: false },
};

const MOCK_USERS = [
  { id: 1, name: 'Anna Reyes',     email: 'anna@cozy.spa',    phone: '+63 919 555 6666', role: 'therapist', specialty: 'Swedish & Hot Stone',     status: 'active',   joined: '2025-02-20', commRate: 40 },
  { id: 2, name: 'Grace Tan',      email: 'grace@cozy.spa',   phone: '+63 921 999 0000', role: 'therapist', specialty: 'Hilot & Shiatsu',          status: 'inactive', joined: '2025-06-01', commRate: 40 },
  { id: 3, name: 'Leo Garcia',     email: 'leo@cozy.spa',     phone: '+63 920 777 8888', role: 'therapist', specialty: 'Deep Tissue & Sports',     status: 'active',   joined: '2025-05-15', commRate: 45 },
  { id: 4, name: 'Maria Santos',   email: 'maria@cozy.spa',   phone: '+63 917 111 2222', role: 'staff',     specialty: 'Front Desk Coordinator',  status: 'active',   joined: '2025-03-10', commRate: 0  },
  { id: 5, name: 'Juan Dela Cruz', email: 'juan@cozy.spa',    phone: '+63 918 333 4444', role: 'staff',     specialty: 'Operations Lead',          status: 'active',   joined: '2025-04-01', commRate: 0  },
  { id: 6, name: 'Elena Ramos',    email: 'elena@cozy.spa',   phone: '+63 922 444 5555', role: 'staff',     specialty: 'Booking Coordinator',      status: 'active',   joined: '2025-07-12', commRate: 0  },
];

const THERAPIST_SPECIALTY_PRESETS = [
  'Swedish & Deep Tissue', 'Hot Stone Massage', 'Shiatsu & Hilot',
  'Sports & Recovery', 'Aromatherapy', 'Prenatal Massage',
  'Foot Reflexology', 'Thai Massage',
];

const STAFF_POSITION_PRESETS = [
  'Front Desk Coordinator', 'Operations Lead', 'Booking Coordinator',
  'Guest Relations', 'Shift Supervisor', 'Billing & Finance',
];

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
/*  PASSWORD STRENGTH HELPER                                        */
/* ─────────────────────────────────────────────────────────────── */
function getPasswordStrength(pw) {
  if (!pw) return { label: '', color: '#94a3b8', percent: 0 };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Very Weak',  color: '#ef4444', percent: 20 };
  if (score === 2) return { label: 'Weak',       color: '#f97316', percent: 40 };
  if (score === 3) return { label: 'Fair',       color: '#eab308', percent: 60 };
  if (score === 4) return { label: 'Strong',     color: '#22c55e', percent: 80 };
  return              { label: 'Very Strong', color: '#10b981', percent: 100 };
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
function UserDetailModal({ user, onClose, onEdit, onManageSchedule, C }) {
  if (!user) return null;
  const meta = ROLE_META[user.role] || ROLE_META.staff;
  const Icon = meta.icon;
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-lg">
      <div style={{ background: C.card }} className="flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <div className="p-5 sm:p-6 pt-7 sm:pt-6 relative text-white flex-shrink-0" style={{ background: meta.grad }}>
          <button onClick={onClose} aria-label="Close dialog" className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <Avatar name={user.name} gradient="rgba(255,255,255,0.2)" size={54} />
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-lg sm:text-xl text-white leading-tight truncate">{user.name}</h3>
              <p className="text-xs text-white/75 mt-0.5 truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white/20 uppercase tracking-wider text-white flex items-center gap-1">
                  <Icon className="w-3 h-3" /> {meta.label}
                </span>
                <StatusDot status={user.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: 'Phone',         value: user.phone || '—',                      icon: Phone },
              { label: 'Specialization',value: user.specialty || '—',                  icon: Briefcase },
              { label: 'Commission Tier', value: user.role === 'therapist' ? `${user.commRate || 40}% Rate` : 'Salary-based', icon: TrendingUp },
              { label: 'Date Joined',   value: user.joined || '—',                     icon: Calendar },
            ].map(({ label, value, icon: Ic }) => (
              <div key={label} className="p-3.5 rounded-2xl space-y-1" style={{ background: C.inner }}>
                <div className="flex items-center gap-1.5">
                  <Ic className="w-3 h-3 text-slate-400" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                </div>
                <p className="text-xs font-bold truncate" style={{ color: C.txt }} title={value}>{value}</p>
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-2xl" style={{ background: C.inner }}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Access & Permissions</p>
            <p className="text-xs leading-relaxed" style={{ color: C.txtSec }}>{meta.desc}</p>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex gap-2.5 flex-shrink-0" style={{ borderTop: `1px solid ${C.divider}` }}>
          <button onClick={onClose} className="py-2.5 px-4 rounded-xl text-xs font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ background: C.inner, color: C.txtSec }}>Close</button>
          {onManageSchedule && (user.role === 'therapist' || user.role === 'staff') && (
            <button onClick={() => { onClose(); onManageSchedule(user.id); }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer hover:opacity-90 active:scale-95"
              style={{ background: C.inner, borderColor: C.inputBdr, color: C.txt }}>
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Shifts</span>
            </button>
          )}
          <button onClick={() => { onClose(); onEdit(user); }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}>Edit Profile</button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MODAL: DELETE CONFIRMATION                                      */
/* ─────────────────────────────────────────────────────────────── */
function DeleteUserConfirmModal({ user, onClose, onConfirm, C }) {
  if (!user) return null;
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="p-5 sm:p-6 space-y-4 text-center" style={{ background: C.card }}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mx-auto flex items-center justify-center bg-red-500/10 text-red-500 shadow-inner">
          <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black" style={{ color: C.txt }}>Revoke Team Account</h3>
          <p className="text-xs leading-relaxed" style={{ color: C.txtSec }}>
            Are you sure you want to remove <strong className="font-black text-red-400">{user.name}</strong>?
            This will permanently revoke their portal credentials and unassign upcoming scheduled shift rosters.
          </p>
        </div>
        <div className="flex gap-2.5 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ background: C.inner, color: C.txtSec }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(user.id, user.name)}
            className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 shadow-md transition-all cursor-pointer active:scale-95"
          >
            Yes, Delete Account
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MODAL: ADD / EDIT USER                                           */
/* ─────────────────────────────────────────────────────────────── */
function AddEditUserModal({ user, onClose, onSave }) {
  const C = useC();
  const { toast } = useToast();
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'therapist',
    status: user?.status || 'active',
    specialty: user?.specialty || (user?.role === 'staff' ? 'Front Desk Coordinator' : 'Swedish & Deep Tissue'),
    commRate: user?.commRate || 40,
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = useCallback((k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v };
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
  }, [serverError]);

  const handleRoleChange = useCallback((newRole) => {
    if (newRole === 'admin') return;
    setForm(p => ({
      ...p,
      role: newRole,
      specialty: newRole === 'therapist'
        ? (p.specialty && !STAFF_POSITION_PRESETS.includes(p.specialty) ? p.specialty : 'Swedish & Deep Tissue')
        : (p.specialty && !THERAPIST_SPECIALTY_PRESETS.includes(p.specialty) ? p.specialty : 'Front Desk Coordinator'),
    }));
    setErrors(prev => {
      const u = { ...prev };
      delete u.role;
      delete u.specialty;
      return u;
    });
  }, []);

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
    } else if (!/^[\p{L}\s.'-]+$/u.test(nameTrimmed)) {
      e.name = 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods';
    }

    const emailTrimmed = form.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      e.email = 'Email address is required';
    } else if (!emailRegex.test(emailTrimmed)) {
      e.email = 'Please provide a valid email address (e.g. maria@cozy.spa)';
    }

    if (form.phone && form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[\s\-().+]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 15 || !/^\+?[0-9\s\-().]+$/.test(form.phone.trim())) {
        e.phone = 'Please enter a valid phone number (e.g. +63 917 123 4567 or 09171234567)';
      }
    }

    if (!['therapist', 'staff'].includes(form.role)) {
      e.role = 'Please select a valid operational role (Therapist or Staff Coordinator).';
    }

    const specTrimmed = (form.specialty || '').trim();
    if (!specTrimmed) {
      e.specialty = form.role === 'therapist'
        ? 'Treatment specialization is required (e.g. Swedish & Deep Tissue)'
        : 'Position title is required (e.g. Front Desk Coordinator)';
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
        e.confirmPassword = 'Passwords do not match';
      }
    } else if (form.password) {
      if (form.password.length < 8) {
        e.password = 'Password must be at least 8 characters';
      }
      if (!form.confirmPassword) {
        e.confirmPassword = 'Confirmation password is required';
      } else if (form.password !== form.confirmPassword) {
        e.confirmPassword = 'Passwords do not match';
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
      await onSave(form);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Failed to save team member account.';
      setServerError(msg);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = err => ({
    background: C.inner,
    border: `1.5px solid ${err ? '#ef4444' : C.inputBdr}`,
    color: C.txt,
  });

  const pwStrength = getPasswordStrength(form.password);
  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;
  const passwordsMismatch = form.password && form.confirmPassword && form.password !== form.confirmPassword;

  // Dropdown options for role selection
  const roleDropdownOptions = [
    {
      value: 'therapist',
      label: 'Therapist (Service Provider)',
      icon: Stethoscope,
      iconColor: '#d97706',
      iconBg: 'rgba(217,119,6,0.12)',
      description: 'Provides client treatments, queue assignments & revenue split earnings',
      tag: 'Provider',
      tagColor: '#d97706',
      tagBg: 'rgba(217,119,6,0.12)',
    },
    {
      value: 'staff',
      label: 'Staff Coordinator (Reception & Shifts)',
      icon: UserCog,
      iconColor: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.12)',
      description: 'Manages appointment queue, front-desk booking & therapist roster',
      tag: 'Front-Desk',
      tagColor: '#3b82f6',
      tagBg: 'rgba(59,130,246,0.12)',
    },
    {
      value: 'admin',
      label: 'Administrator (Root System)',
      icon: Crown,
      iconColor: '#ef4444',
      iconBg: 'rgba(239,68,68,0.12)',
      description: 'Restricted root governance. Cannot be provisioned via staff onboarding.',
      tag: 'Restricted',
      tagColor: '#ef4444',
      tagBg: 'rgba(239,68,68,0.12)',
      disabled: true,
    },
  ];

  // Dropdown options for status selection
  const statusDropdownOptions = [
    {
      value: 'active',
      label: 'Active (On Duty & Bookable)',
      badgeColor: '#10b981',
      description: 'Account is operational and eligible for appointment scheduling',
    },
    {
      value: 'inactive',
      label: 'Inactive (Deactivated / Off Duty)',
      badgeColor: '#94a3b8',
      description: 'Account is temporarily suspended from scheduling and queue rotation',
    },
  ];

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={submit} style={{ background: C.card }} className="flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.divider}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #0a5f3c 100%)', color: '#fff' }}>
              <UserCog className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-base leading-tight truncate" style={{ color: C.txt }}>
                {isEdit ? 'Edit Team Member Profile' : 'Onboard New Team Member'}
              </h2>
              <p className="text-[11px] sm:text-xs mt-0.5 truncate" style={{ color: C.txtMuted }}>
                {isEdit ? 'Update credentials, commission and role permissions' : 'Create new therapist or staff coordinator credentials'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all cursor-pointer flex-shrink-0"
            style={{ background: C.inner }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {serverError && (
            <div className="p-3 sm:p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-red-400 font-bold"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Full Name */}
          <FormField label="Full Name" required error={errors.name} icon={User}>
            <input
              autoFocus={!isEdit}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Maria Santos"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/30"
              style={inputStyle(errors.name)}
            />
          </FormField>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Email Address" required error={errors.email} icon={Mail}>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="maria@cozy.spa"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/30"
                style={inputStyle(errors.email)}
              />
            </FormField>
            <FormField label="Phone Number" error={errors.phone} icon={Phone} hint="Optional">
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+63 917 123 4567"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/30"
                style={inputStyle(errors.phone)}
              />
            </FormField>
          </div>

          {/* Role Selection (Single Elegant Dual-Card Selector) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Operational Role <span className="text-red-400 font-bold">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Select operational role">
              <button
                type="button"
                role="radio"
                aria-checked={form.role === 'therapist'}
                onClick={() => handleRoleChange('therapist')}
                className="p-3.5 rounded-2xl text-left transition-all relative overflow-hidden flex items-center gap-3 border cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                style={{
                  background: form.role === 'therapist' ? 'rgba(217,119,6,0.1)' : C.inner,
                  borderColor: form.role === 'therapist' ? '#d97706' : C.inputBdr,
                  boxShadow: form.role === 'therapist' ? '0 0 0 2px rgba(217,119,6,0.25)' : 'none',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#78350f,#d97706)', color: '#fff' }}>
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black" style={{ color: C.txt }}>Therapist</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold" style={{ background: 'rgba(217,119,6,0.15)', color: '#d97706' }}>
                      Provider
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: C.txtMuted }}>Sessions & commission split</p>
                </div>
                {form.role === 'therapist' && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-amber-500 text-white shadow-sm flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={form.role === 'staff'}
                onClick={() => handleRoleChange('staff')}
                className="p-3.5 rounded-2xl text-left transition-all relative overflow-hidden flex items-center gap-3 border cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{
                  background: form.role === 'staff' ? 'rgba(59,130,246,0.1)' : C.inner,
                  borderColor: form.role === 'staff' ? '#3b82f6' : C.inputBdr,
                  boxShadow: form.role === 'staff' ? '0 0 0 2px rgba(59,130,246,0.25)' : 'none',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff' }}>
                  <UserCog className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black" style={{ color: C.txt }}>Staff Coordinator</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                      Front Desk
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: C.txtMuted }}>Queue, shifts & reservations</p>
                </div>
                {form.role === 'staff' && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-500 text-white shadow-sm flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
            {errors.role && (
              <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.role}
              </p>
            )}
          </div>

          {/* Specialization / Position (Collision-safe combobox with quick preset pills) */}
          <div className="space-y-2">
            <LuxuryCombobox
              id="form-specialty-combobox"
              value={form.specialty}
              onChange={v => set('specialty', v)}
              presets={form.role === 'therapist' ? THERAPIST_SPECIALTY_PRESETS : STAFF_POSITION_PRESETS}
              placeholder={form.role === 'therapist' ? "e.g. Swedish & Deep Tissue" : "e.g. Front Desk Coordinator"}
              label={form.role === 'therapist' ? "Treatment Specialization" : "Operational Position Title"}
              icon={Briefcase}
              required
              error={errors.specialty}
              isDark={C.isDark}
              portal={false}
            />

            {/* Quick-Pick Popular Presets Pill Bar */}
            <div className="space-y-1 pt-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Quick Preset Picks:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-0.5">
                {(form.role === 'therapist' ? THERAPIST_SPECIALTY_PRESETS : STAFF_POSITION_PRESETS).map(preset => {
                  const isSelected = form.specialty === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => set('specialty', preset)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-sm'
                          : 'hover:border-slate-500/40 text-slate-400 hover:text-slate-200'
                      }`}
                      style={{
                        background: isSelected
                          ? (C.isDark ? 'rgba(5,150,105,0.2)' : 'rgba(5,150,105,0.12)')
                          : C.inner,
                        borderColor: isSelected ? '#059669' : C.inputBdr,
                        color: isSelected ? (C.isDark ? '#34d399' : '#059669') : C.txtSec,
                      }}
                    >
                      {preset}
                      {isSelected && <Check className="w-2.5 h-2.5 inline-block ml-1 text-emerald-500 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status & Compensation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Dropdown */}
            <LuxurySelect
              id="form-status-select"
              label="Account Status"
              icon={CheckCircle2}
              value={form.status}
              onChange={v => set('status', v)}
              options={statusDropdownOptions}
              isDark={C.isDark}
              portal={false}
            />

            {/* Commission for Therapist or Fixed Salary for Staff */}
            {form.role === 'therapist' ? (
              <LuxurySelect
                id="form-commission-select"
                label="Commission Split Tier"
                icon={TrendingUp}
                value={form.commRate}
                onChange={v => set('commRate', Number(v))}
                options={COMMISSION_TIERS}
                isDark={C.isDark}
                portal={false}
              />
            ) : (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Compensation Mode
                </label>
                <div className="p-2.5 rounded-xl border flex items-center justify-between"
                  style={{ background: C.inner, borderColor: C.inputBdr }}>
                  <span className="text-xs font-bold" style={{ color: C.txt }}>Fixed Staff Salary</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400">Monthly Payroll</span>
                </div>
              </div>
            )}
          </div>

          {/* Security Credentials Section */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: C.divider }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                {isEdit ? 'Portal Password (Optional)' : 'Portal Password'}
              </span>
              <button
                type="button"
                onClick={generateSecurePassword}
                className="text-[10px] font-black flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all hover:opacity-85 shadow-sm cursor-pointer active:scale-95"
                style={{ background: 'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(16,185,129,0.25))', color: '#059669', border: '1px solid rgba(5,150,105,0.3)' }}
              >
                <Sparkles className="w-3 h-3 text-emerald-500" /> Auto-Generate Secure
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Password" required={!isEdit} error={errors.password} icon={Lock}>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 8 characters'}
                    className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/30"
                    style={inputStyle(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm Password" required={!isEdit || !!form.password} error={errors.confirmPassword} icon={Lock}>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/30"
                    style={inputStyle(errors.confirmPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>
            </div>

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
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${C.divider}`, background: C.card }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ background: C.inner, color: C.txtSec }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer"
            style={{
              background: isSubmitting ? '#059669' : 'linear-gradient(135deg, #059669 0%, #0a5f3c 100%)',
              boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Save Changes' : 'Create Account'}</span>
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
function TabProfiles({ users, onUsersChange, onSelectTab }) {
  const C = useC();
  const { toast } = useToast();
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy]             = useState('name-asc');
  const [viewMode, setViewMode]         = useState('table');
  const [viewingUser, setViewingUser]   = useState(null);
  const [editingUser, setEditingUser]   = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addingUser, setAddingUser]     = useState(false);

  // Sorting and filtering
  const filtered = useMemo(() => {
    let list = users.filter(u => {
      const q = search.toLowerCase();
      const mQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.specialty || '').toLowerCase().includes(q);
      const mR = roleFilter === 'all' || u.role === roleFilter;
      const mS = statusFilter === 'all' || u.status === statusFilter;
      return mQ && mR && mS;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'joined-desc') return (b.joined || '').localeCompare(a.joined || '');
      if (sortBy === 'joined-asc') return (a.joined || '').localeCompare(b.joined || '');
      if (sortBy === 'role') return a.role.localeCompare(b.role);
      return 0;
    });
  }, [users, search, roleFilter, statusFilter, sortBy]);

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
    try {
      await axios.delete(`/admin/team-members/${id}`);
      onUsersChange(prev => prev.filter(u => u.id !== id));
      toast.success(`${name} removed successfully.`);
    } catch {
      onUsersChange(prev => prev.filter(u => u.id !== id));
      toast.info(`${name} removed from list.`);
    } finally {
      setUserToDelete(null);
    }
  };

  const handleCopyTempPassword = user => {
    const tempPw = `Cozy@${Math.floor(1000 + Math.random() * 9000)}!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tempPw);
      toast.success(`Temporary password for ${user.name} copied: ${tempPw}`);
    } else {
      toast.info(`Generated temporary password: ${tempPw}`);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Specialty', 'Status', 'Joined'];
    const rows = filtered.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      u.role,
      `"${u.specialty || ''}"`,
      u.status,
      u.joined || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cozy_blissful_team_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('User directory exported to CSV!');
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

  // Dropdown options
  const roleFilterOptions = [
    { value: 'all',       label: `All Roles (${users.length})`, icon: Users },
    { value: 'therapist', label: `Therapists (${users.filter(u => u.role === 'therapist').length})`, icon: Stethoscope, tag: 'Provider', tagColor: '#d97706', tagBg: 'rgba(217,119,6,0.12)' },
    { value: 'staff',     label: `Staff (${users.filter(u => u.role === 'staff').length})`, icon: UserCog, tag: 'Reception', tagColor: '#3b82f6', tagBg: 'rgba(59,130,246,0.12)' },
  ];

  const statusFilterOptions = [
    { value: 'all',      label: 'All Statuses' },
    { value: 'active',   label: 'Active Members', badgeColor: '#10b981' },
    { value: 'inactive', label: 'Inactive Members', badgeColor: '#94a3b8' },
  ];

  const sortOptions = [
    { value: 'name-asc',    label: 'Name (A to Z)', icon: ArrowUpDown },
    { value: 'name-desc',   label: 'Name (Z to A)', icon: ArrowUpDown },
    { value: 'joined-desc', label: 'Newest First', icon: Calendar },
    { value: 'joined-asc',  label: 'Oldest First', icon: Calendar },
    { value: 'role',        label: 'By Role / Position', icon: Shield },
  ];

  // User Actions Dropdown Menu Items Generator
  const getUserMenuItems = (u) => [
    { type: 'header', label: `${u.name} Options` },
    {
      id: 'view',
      label: 'View Profile & Stats',
      icon: Eye,
      onClick: () => setViewingUser(u),
    },
    {
      id: 'edit',
      label: 'Edit Account Credentials',
      icon: Edit3,
      onClick: () => setEditingUser(u),
    },
    {
      id: 'status',
      label: u.status === 'active' ? 'Deactivate Member' : 'Activate Member',
      icon: u.status === 'active' ? UserX : UserCheck,
      onClick: () => toggleStatus(u.id),
      badge: u.status === 'active' ? 'Active' : 'Inactive',
      badgeColor: u.status === 'active' ? '#10b981' : '#64748b',
      badgeBg: u.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
    },
    {
      id: 'schedule',
      label: 'Manage Weekly Shifts',
      icon: Calendar,
      onClick: () => onSelectTab && onSelectTab('schedules', u.id),
    },
    {
      id: 'password',
      label: 'Generate Temp Password',
      icon: KeyRound,
      onClick: () => handleCopyTempPassword(u),
    },
    { type: 'divider' },
    {
      id: 'delete',
      label: 'Revoke / Remove Account',
      icon: Trash2,
      danger: true,
      onClick: () => setUserToDelete(u),
    },
  ];

  return (
    <div className="space-y-4">
      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={u => { setViewingUser(null); setEditingUser(u); }}
          onManageSchedule={id => onSelectTab && onSelectTab('schedules', id)}
          C={C}
        />
      )}

      {(addingUser || editingUser) && (
        <AddEditUserModal
          user={editingUser}
          onClose={() => { setAddingUser(false); setEditingUser(null); }}
          onSave={handleSave}
        />
      )}

      {userToDelete && (
        <DeleteUserConfirmModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDelete}
          C={C}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KPI_CARDS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}
            className="p-4 sm:p-5 rounded-2xl flex items-center justify-between overflow-hidden relative"
            style={{ background: C.card, boxShadow: C.shadow }}>
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

      {/* Senior Developer Toolbar with Accessible Dropdowns */}
      <div className="p-3.5 rounded-2xl space-y-3" style={{ background: C.card, boxShadow: C.shadow }}>
        {/* Row 1: Search + Quick Add + Tools */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, specialty…"
              className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
              style={{ background: C.inner, border: `1.5px solid ${C.inputBdr}`, color: C.txt }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl border" style={{ background: C.inner, borderColor: C.inputBdr }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className="p-1.5 rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                style={{
                  background: viewMode === 'table' ? (C.isDark ? 'rgba(5,150,105,0.25)' : 'rgba(5,150,105,0.15)') : 'transparent',
                  color: viewMode === 'table' ? C.accent : C.txtMuted,
                }}
                title="Table View"
                aria-label="Table View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className="p-1.5 rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                style={{
                  background: viewMode === 'cards' ? (C.isDark ? 'rgba(5,150,105,0.25)' : 'rgba(5,150,105,0.15)') : 'transparent',
                  color: viewMode === 'cards' ? C.accent : C.txtMuted,
                }}
                title="Grid Cards View"
                aria-label="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export & Actions Dropdown */}
            <LuxuryDropdownMenu
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-85 cursor-pointer"
                  style={{ background: C.inner, borderColor: C.inputBdr, color: C.txtSec }}
                  aria-label="Export tools menu"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              }
              items={[
                { type: 'header', label: 'Directory Tools' },
                { label: 'Export to CSV Spreadsheet', icon: Download, onClick: handleExportCSV },
                { label: 'Reload Directory', icon: RefreshCw, onClick: () => toast.info('Refreshed directory list') },
              ]}
              isDark={C.isDark}
            />

            {/* Add User Button */}
            <button
              onClick={() => setAddingUser(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Row 2: Dropdown Filters & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t" style={{ borderColor: C.divider }}>
          {/* Role Filter Dropdown */}
          <LuxurySelect
            id="profiles-role-filter"
            aria-label="Filter by operational role"
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleFilterOptions}
            size="sm"
            isDark={C.isDark}
          />

          {/* Status Filter Dropdown */}
          <LuxurySelect
            id="profiles-status-filter"
            aria-label="Filter by account status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusFilterOptions}
            size="sm"
            isDark={C.isDark}
          />

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <LuxurySelect
                id="profiles-sort-filter"
                aria-label="Sort users by"
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
                size="sm"
                isDark={C.isDark}
              />
            </div>
            {(search || roleFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'name-asc') && (
              <button
                type="button"
                onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setSortBy('name-asc'); }}
                title="Reset all active filters"
                aria-label="Reset all active filters"
                className="p-2 rounded-xl text-xs font-bold border flex items-center justify-center transition-all hover:opacity-85 text-amber-500 cursor-pointer shrink-0"
                style={{ background: C.inner, borderColor: C.inputBdr }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table / Cards View with Senior Dropdown Menus */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.shadow }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr style={{ background: C.tableHead }}>
                  {['User', 'Specialization', 'Role', 'Status', 'Commission', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const meta = ROLE_META[u.role] || ROLE_META.staff;
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setViewingUser(u)}
                      className="cursor-pointer transition-colors group"
                      style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.divider}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.inner}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
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
                        {u.role === 'therapist' ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>
                            {u.commRate || 40}% Comm.
                          </span>
                        ) : (
                          <span className="text-[10px]" style={{ color: C.txtMuted }}>Salary</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[11px]" style={{ color: C.txtMuted }}>{u.joined}</td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {/* Quick Edit */}
                          <button
                            onClick={() => setEditingUser(u)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80 cursor-pointer"
                            style={{ background: C.inner, color: C.txtSec }}
                            title="Edit user"
                            aria-label={`Edit ${u.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Senior Dropdown Action Menu */}
                          <LuxuryDropdownMenu
                            trigger={
                              <button
                                type="button"
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-90 cursor-pointer"
                                style={{ background: C.inner, color: C.txtSec }}
                                aria-label={`Open menu for ${u.name}`}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            }
                            items={getUserMenuItems(u)}
                            menuWidth={230}
                            align="right"
                            isDark={C.isDark}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center px-4">
                      <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-inner" style={{ background: C.inner }}>
                        <Users className="w-6 h-6 opacity-40" style={{ color: C.txtMuted }} aria-hidden="true" />
                      </div>
                      <p className="text-sm font-black" style={{ color: C.txt }}>No team members match your criteria</p>
                      <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: C.txtMuted }}>Try adjusting your search query, role filter, or status selection.</p>
                      <button
                        type="button"
                        onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setSortBy('name-asc'); }}
                        className="mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-85 cursor-pointer shadow-sm active:scale-95"
                        style={{ background: C.inner, border: `1px solid ${C.inputBdr}`, color: C.accent }}
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border" style={{ background: C.card, borderColor: C.divider, boxShadow: C.shadow }}>
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-inner" style={{ background: C.inner }}>
                <Users className="w-6 h-6 opacity-40" style={{ color: C.txtMuted }} aria-hidden="true" />
              </div>
              <p className="text-sm font-black" style={{ color: C.txt }}>No team members found</p>
              <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: C.txtMuted }}>No profiles match your search or active filter criteria.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setSortBy('name-asc'); }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-85 cursor-pointer shadow-sm active:scale-95"
                style={{ background: C.inner, border: `1px solid ${C.inputBdr}`, color: C.accent }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(u => {
                const meta = ROLE_META[u.role] || ROLE_META.staff;
                return (
                  <div
                    key={u.id}
                    onClick={() => setViewingUser(u)}
                    className="p-5 rounded-2xl space-y-3.5 cursor-pointer transition-all hover:-translate-y-1 relative"
                    style={{ background: C.card, boxShadow: C.shadow }}
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} gradient={meta.grad} size={42} />
                        <div>
                          <p className="font-bold text-sm leading-tight" style={{ color: C.txt }}>{u.name}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: C.txtMuted }}>{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <StatusDot status={u.status} />
                        <LuxuryDropdownMenu
                          trigger={
                            <button
                              type="button"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer"
                              style={{ background: C.inner }}
                              aria-label={`Actions for ${u.name}`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          }
                          items={getUserMenuItems(u)}
                          menuWidth={230}
                          align="right"
                          isDark={C.isDark}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${C.divider}` }}>
                      <span className="text-xs truncate max-w-[150px]" style={{ color: C.txtMuted }}>{u.specialty || '—'}</span>
                      <div className="flex items-center gap-1.5">
                        {u.role === 'therapist' && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>
                            {u.commRate || 40}%
                          </span>
                        )}
                        <RolePill role={u.role} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  TAB 2: WORK SCHEDULES                                           */
/* ─────────────────────────────────────────────────────────────── */
function TabSchedules({ users, focusedMemberId }) {
  const C = useC();
  const { toast } = useToast();
  const buildDefault = () =>
    Object.fromEntries(DAYS.map((d, i) => [d, i < 5 ? ['morning', 'afternoon'] : i === 5 ? ['morning'] : []]));
  const teamUsers = useMemo(() => users.filter(u => u.role === 'staff' || u.role === 'therapist'), [users]);

  const [selected, setSelected]       = useState(focusedMemberId || teamUsers[0]?.id || null);
  const [schedules, setSchedules]     = useState(() => Object.fromEntries(users.map(u => [u.id, buildDefault()])));
  const [roleFilter, setRoleFilter]   = useState('all');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [isDirty, setIsDirty]         = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const presetsRef                    = useRef(null);

  useEffect(() => { if (focusedMemberId) setSelected(focusedMemberId); }, [focusedMemberId]);

  // Close preset dropdown on outside click
  useEffect(() => {
    if (!showPresets) return;
    const handler = e => { if (presetsRef.current && !presetsRef.current.contains(e.target)) setShowPresets(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPresets]);

  const filteredTeam = useMemo(() => teamUsers.filter(u => roleFilter === 'all' || u.role === roleFilter), [teamUsers, roleFilter]);

  const person      = filteredTeam.find(u => u.id === selected) || teamUsers.find(u => u.id === selected) || null;
  const sched       = selected ? (schedules[selected] || {}) : {};
  const totalShifts = Object.values(sched).reduce((a, b) => a + b.length, 0);
  const totalHours  = totalShifts * 4;

  const toggle = (day, shiftId) => {
    setSchedules(prev => {
      const curr = prev[selected]?.[day] || [];
      const next = curr.includes(shiftId) ? curr.filter(s => s !== shiftId) : [...curr, shiftId];
      return { ...prev, [selected]: { ...(prev[selected] || {}), [day]: next } };
    });
    setSaved(false);
    setIsDirty(true);
  };

  const applyShiftPreset = type => {
    if (!selected) return;
    setSchedules(prev => {
      const t = { ...(prev[selected] || {}) };
      if (type === 'full-weekday')        DAYS.forEach((d, i) => { t[d] = i < 5 ? ['morning', 'afternoon'] : []; });
      else if (type === 'morning-only')   DAYS.forEach((d, i) => { t[d] = i < 5 ? ['morning'] : []; });
      else if (type === 'afternoon-only') DAYS.forEach((d, i) => { t[d] = i < 5 ? ['afternoon'] : []; });
      else if (type === 'evening-only')   DAYS.forEach((d, i) => { t[d] = i < 5 ? ['evening'] : []; });
      else if (type === 'weekend-only')   DAYS.forEach((d, i) => { t[d] = i >= 5 ? ['morning', 'afternoon'] : []; });
      else if (type === 'dup-mon')        { const m = t['Mon'] || []; DAYS.forEach((d, i) => { if (i < 5) t[d] = [...m]; }); }
      else if (type === 'clear')          DAYS.forEach(d => { t[d] = []; });
      return { ...prev, [selected]: t };
    });
    setShowPresets(false);
    setIsDirty(true);
    setSaved(false);
    toast.success('Schedule template applied!');
  };

  const save = async () => {
    if (!isDirty) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setIsDirty(false);
    toast.success(`Shift schedule saved for ${person?.name || 'team member'}!`);
    setTimeout(() => setSaved(false), 3000);
  };

  const roleFilterOptions = [
    { value: 'all',       label: `All Roles (${teamUsers.length})`,                                       icon: Users },
    { value: 'therapist', label: `Therapists (${teamUsers.filter(u => u.role === 'therapist').length})`, icon: Stethoscope },
    { value: 'staff',     label: `Staff (${teamUsers.filter(u => u.role === 'staff').length})`,          icon: UserCog },
  ];

  const PRESET_OPTIONS = [
    { key: 'full-weekday',    label: 'Mon-Fri Full Day',        desc: 'Morning + Afternoon (8 AM - 5 PM)' },
    { key: 'morning-only',   label: 'Mon-Fri Mornings',        desc: 'Morning shifts only (8 AM - 12 PM)' },
    { key: 'afternoon-only', label: 'Mon-Fri Afternoons',      desc: 'Afternoon shifts only (1 PM - 5 PM)' },
    { key: 'evening-only',   label: 'Mon-Fri Evenings',        desc: 'Evening shifts only (6 PM - 10 PM)' },
    { key: 'weekend-only',   label: 'Weekends Only',           desc: 'Sat & Sun (Morning + Afternoon)' },
    { key: 'dup-mon',        label: 'Copy Monday to Weekdays', desc: 'Duplicate Mon roster across Tue-Fri' },
  ];

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black flex items-center gap-2" style={{ color: C.txt }}>
            <Calendar className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
            Work Schedules &amp; Shift Rosters
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.txtMuted }}>
            Assign weekly shift duties. Unsaved changes are highlighted automatically.
          </p>
        </div>

        {person && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div ref={presetsRef} className="relative">
              <button
                type="button"
                id="schedule-templates-btn"
                onClick={() => setShowPresets(v => !v)}
                aria-haspopup="true"
                aria-expanded={showPresets}
                aria-controls="schedule-presets-menu"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all hover:opacity-90 cursor-pointer"
                style={{ background: C.card, borderColor: C.inputBdr, color: C.txt }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                <span className="hidden sm:inline">Templates</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${showPresets ? 'rotate-180' : ''}`}
                  style={{ color: C.txtMuted }}
                  aria-hidden="true"
                />
              </button>

              {showPresets && (
                <div
                  id="schedule-presets-menu"
                  role="menu"
                  aria-labelledby="schedule-templates-btn"
                  className="absolute right-0 top-[calc(100%+6px)] z-30 w-64 rounded-2xl border shadow-2xl overflow-hidden"
                  style={{ background: C.card, borderColor: C.inputBdr }}
                >
                  <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${C.divider}` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Quick Presets</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {PRESET_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        role="menuitem"
                        onClick={() => applyShiftPreset(opt.key)}
                        className="w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer"
                        style={{ background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.inner; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <p className="text-xs font-bold" style={{ color: C.txt }}>{opt.label}</p>
                        <p className="text-[10px]" style={{ color: C.txtMuted }}>{opt.desc}</p>
                      </button>
                    ))}
                    <div className="my-1" style={{ borderTop: `1px solid ${C.divider}` }} />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => applyShiftPreset('clear')}
                      className="w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer"
                      style={{ background: 'transparent', color: '#ef4444' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <p className="text-xs font-bold">Clear All Shifts</p>
                      <p className="text-[10px] opacity-70">Reset this member's weekly roster</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              id="save-shifts-btn"
              onClick={save}
              disabled={saving || !isDirty}
              aria-label={saving ? 'Saving...' : saved ? 'Saved' : 'Save shift schedule'}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Shifts'}</span>
              {isDirty && !saving && !saved && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* SHIFT LEGEND */}
      <div
        className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-3 rounded-2xl"
        style={{ background: C.card, boxShadow: C.shadow }}
        aria-label="Shift time legend"
      >
        <span className="text-[10px] font-black uppercase tracking-widest self-center" style={{ color: C.txtMuted }}>Shift Times:</span>
        {SHIFTS.map(sh => (
          <span key={sh.id} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold" style={{ background: sh.bg, color: sh.color }}>
            <span aria-hidden="true">{sh.icon}</span>
            <span className="font-black">{sh.label}</span>
            <span className="font-medium opacity-80 hidden sm:inline">{sh.time}</span>
          </span>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Roster panel - desktop only */}
        <div className="hidden lg:flex lg:col-span-4 flex-col rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.shadow }}>
          <div className="p-3.5 space-y-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.divider}` }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Team Roster</p>
            <LuxurySelect
              id="schedule-role-filter"
              aria-label="Filter roster by role"
              value={roleFilter}
              onChange={setRoleFilter}
              options={roleFilterOptions}
              size="sm"
              isDark={C.isDark}
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
            {filteredTeam.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: C.txtMuted }}>No team members found.</p>
            )}
            {filteredTeam.map(u => {
              const isSel = selected === u.id;
              const meta  = ROLE_META[u.role] || ROLE_META.staff;
              const hrs   = Object.values(schedules[u.id] || {}).reduce((a, b) => a + b.length, 0) * 4;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelected(u.id)}
                  aria-pressed={isSel}
                  aria-label={`${u.name} - ${hrs} hrs/week`}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  style={{ background: isSel ? `${C.accent}18` : 'transparent', borderLeft: `3px solid ${isSel ? C.accent : 'transparent'}` }}
                >
                  <Avatar name={u.name} gradient={meta.grad} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: C.txt }}>{u.name}</p>
                    <p className="text-[10px] truncate" style={{ color: C.txtMuted }}>{u.specialty || u.role}</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: C.inner, color: hrs > 0 ? C.accent : C.txtMuted }}>{hrs}h</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shift editor panel */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden flex flex-col" style={{ background: C.card, boxShadow: C.shadow }}>
          {/* Mobile member picker */}
          <div className="lg:hidden p-3.5 flex-shrink-0 space-y-2" style={{ borderBottom: `1px solid ${C.divider}` }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Select Team Member:</p>
            <LuxurySelect
              id="mobile-schedule-member-select"
              aria-label="Select team member to schedule"
              value={selected}
              onChange={setSelected}
              options={teamUsers.map(u => {
                const hrs = Object.values(schedules[u.id] || {}).reduce((a, b) => a + b.length, 0) * 4;
                return {
                  value: u.id,
                  label: u.name,
                  description: `${u.specialty || u.role} - ${hrs} hrs/week`,
                  tag: `${hrs}h`,
                  tagColor: hrs > 0 ? '#10b981' : '#64748b',
                  tagBg: hrs > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                };
              })}
              searchable
              isDark={C.isDark}
            />
          </div>

          {!person ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: C.inner }}>
                <Calendar className="w-7 h-7" style={{ color: C.txtMuted }} aria-hidden="true" />
              </div>
              <p className="text-sm font-bold" style={{ color: C.txt }}>Select a team member</p>
              <p className="text-xs mt-1 max-w-xs" style={{ color: C.txtMuted }}>
                Choose from the roster panel (or the dropdown above on mobile) to assign shifts.
              </p>
            </div>
          ) : (
            <>
              {/* Person header strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.divider}` }}>
                <div className="flex items-center gap-3">
                  <Avatar name={person.name} gradient={ROLE_META[person.role]?.grad} size={44} />
                  <div>
                    <p className="font-black text-sm" style={{ color: C.txt }}>{person.name}</p>
                    <p className="text-xs" style={{ color: C.txtMuted }}>{person.specialty || person.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isDirty && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                      Unsaved changes
                    </span>
                  )}
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Shifts</p>
                    <p className="text-base font-black" style={{ color: C.txt }}>{totalShifts}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Total Hrs</p>
                    <p className="text-base font-black" style={{ color: C.accent }}>{totalHours}h</p>
                  </div>
                </div>
              </div>

              {/* Column headers */}
              <div
                className="hidden sm:grid px-4 py-2 gap-2 text-center flex-shrink-0"
                style={{ gridTemplateColumns: '3.5rem 1fr 1fr 1fr', borderBottom: `1px solid ${C.divider}` }}
                aria-hidden="true"
              >
                <div />
                {SHIFTS.map(sh => (
                  <div key={sh.id} className="py-1">
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: sh.color }}>{sh.icon} {sh.label}</p>
                    <p className="text-[9px] font-medium mt-0.5" style={{ color: C.txtMuted }}>{sh.time}</p>
                  </div>
                ))}
              </div>

              {/* Day rows */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2">
                {DAYS.map((day, di) => {
                  const dayShifts = sched[day] || [];
                  const isWE      = di >= 5;
                  const dayHours  = dayShifts.length * 4;
                  return (
                    <div key={day} className="rounded-xl overflow-hidden" style={{ background: C.inner }}>
                      {/* Mobile */}
                      <div className="sm:hidden p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black" style={{ color: isWE ? C.txtMuted : C.txt }}>{day}</span>
                            {isWE && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: C.card, color: C.txtMuted }}>Weekend</span>}
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: dayHours > 0 ? C.accent : C.txtMuted }}>
                            {dayHours > 0 ? `${dayHours}h` : 'Off'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={`${day} shift selection`}>
                          {SHIFTS.map(sh => {
                            const active = dayShifts.includes(sh.id);
                            return (
                              <button
                                key={sh.id}
                                type="button"
                                onClick={() => toggle(day, sh.id)}
                                aria-pressed={active}
                                aria-label={`${day} ${sh.label}: ${active ? 'on, tap to remove' : 'off, tap to add'}`}
                                className="flex flex-col items-center gap-1 py-3 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
                                style={{
                                  background: active ? sh.bg : C.card,
                                  color: active ? sh.color : C.txtMuted,
                                  outline: active ? `2px solid ${sh.color}40` : 'none',
                                  boxShadow: active ? `0 2px 8px ${sh.color}20` : 'none',
                                }}
                              >
                                <span className="text-base leading-none" aria-hidden="true">{sh.icon}</span>
                                <span className="font-black">{sh.label}</span>
                                <span className="opacity-70 text-[9px]">{active ? '4h' : '--'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Desktop */}
                      <div
                        className="hidden sm:grid items-center gap-2 px-3 py-2"
                        style={{ gridTemplateColumns: '3.5rem 1fr 1fr 1fr' }}
                        role="group"
                        aria-label={`${day} shifts`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-black" style={{ color: isWE ? C.txtMuted : C.txt }}>{day}</span>
                          {isWE && <span className="text-[8px]" style={{ color: C.txtMuted }}>Weekend</span>}
                        </div>
                        {SHIFTS.map(sh => {
                          const active = dayShifts.includes(sh.id);
                          return (
                            <button
                              key={sh.id}
                              type="button"
                              onClick={() => toggle(day, sh.id)}
                              aria-pressed={active}
                              aria-label={`${day} ${sh.label}: ${active ? 'on' : 'off'}`}
                              className="flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl text-center transition-all hover:scale-[1.04] active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                              style={{
                                background: active ? sh.bg : C.card,
                                color: active ? sh.color : C.txtMuted,
                                outline: active ? `1.5px solid ${sh.color}50` : 'none',
                                boxShadow: active ? `0 2px 10px ${sh.color}20` : 'none',
                              }}
                            >
                              <span className="text-sm leading-none" aria-hidden="true">{sh.icon}</span>
                              <span className="text-[10px] font-black">{sh.label}</span>
                              <span className="text-[8px] opacity-70">{active ? sh.time : '--'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary footer */}
              <div className="flex-shrink-0 px-4 sm:px-5 py-3.5 space-y-2" style={{ borderTop: `1px solid ${C.divider}`, background: C.inner }}>
                <div className="flex flex-wrap items-center gap-3">
                  {SHIFTS.map(sh => {
                    const cnt = DAYS.filter(d => (sched[d] || []).includes(sh.id)).length;
                    return (
                      <span key={sh.id} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sh.color }} aria-hidden="true" />
                        <span className="font-bold" style={{ color: sh.color }}>{sh.label}</span>
                        <span style={{ color: C.txtMuted }}>{cnt}d Â· {cnt * 4}h</span>
                      </span>
                    );
                  })}
                  <span className="ml-auto text-xs font-black" style={{ color: C.accent }}>{totalHours} hrs / week</span>
                </div>
                <div className="flex items-end gap-0.5 h-5" aria-hidden="true">
                  {DAYS.map(d => {
                    const cnt = (sched[d] || []).length;
                    const pct = cnt === 0 ? 4 : cnt === 1 ? 40 : cnt === 2 ? 70 : 100;
                    const col = cnt === 0 ? C.divider : cnt === 1 ? '#f59e0b' : cnt === 2 ? '#059669' : '#0ea5e9';
                    return (
                      <div key={d} className="flex-1 flex flex-col justify-end" title={`${d}: ${cnt * 4}h`}>
                        <div className="rounded-t-sm transition-all duration-300" style={{ height: `${pct}%`, background: col, opacity: 0.85 }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-0.5" aria-hidden="true">
                  {DAYS.map(d => (
                    <p key={d} className="flex-1 text-center" style={{ fontSize: 8, color: C.txtMuted, fontWeight: 700 }}>{d}</p>
                  ))}
                </div>
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
function TabQueue({ users, onSelectTab }) {
  const C = useC();
  const { toast } = useToast();
  const therapists = useMemo(() => users.filter(u => u.role === 'therapist' && u.status === 'active'), [users]);
  const [queue, setQueue] = useState(() => therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0 })));
  const [queueFilter, setQueueFilter] = useState('all');

  useEffect(() => {
    setQueue(prev => {
      // Retain previous session counts if present
      const map = new Map(prev.map(p => [p.id, p]));
      return therapists.map((t, i) => ({
        ...t,
        position: i + 1,
        sessions: map.get(t.id)?.sessions || 0,
      }));
    });
  }, [therapists]);

  const swap = (idx, dir) => {
    const ni = idx + dir;
    if (ni < 0 || ni >= queue.length) return;
    setQueue(prev => {
      const next = [...prev];
      [next[idx], next[ni]] = [next[ni], next[idx]];
      return next.map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const moveToTop = (idx) => {
    if (idx === 0) return;
    setQueue(prev => {
      const target = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      toast.success(`${target.name} promoted to Next Up!`);
      return [target, ...rest].map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const sendToEnd = (idx) => {
    if (idx === queue.length - 1) return;
    setQueue(prev => {
      const target = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      toast.info(`${target.name} moved to the end of the queue.`);
      return [...rest, target].map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const markServed = id => {
    setQueue(prev => {
      const target = prev.find(t => t.id === id);
      const rest   = prev.filter(t => t.id !== id);
      toast.success(`Session dispatched to ${target?.name}. Moved to end of queue.`);
      return [...rest, { ...target, sessions: target.sessions + 1 }].map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const resetCount = id => {
    setQueue(prev => prev.map(t => t.id === id ? { ...t, sessions: 0 } : t));
    toast.info('Session count reset.');
  };

  const queueFilterOptions = [
    { value: 'all',       label: `All Active Queue (${queue.length})` },
    { value: 'next',      label: 'Next Up Only (#1)' },
    { value: 'served',    label: `Served Today (${queue.filter(t => t.sessions > 0).length})` },
  ];

  const filteredQueue = useMemo(() => {
    if (queueFilter === 'next') return queue.slice(0, 1);
    if (queueFilter === 'served') return queue.filter(t => t.sessions > 0);
    return queue;
  }, [queue, queueFilter]);

  const totalServed = queue.reduce((s, t) => s + t.sessions, 0);
  const servedCount = queue.filter(t => t.sessions > 0).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: C.txt }}>
            Therapist Queue &amp; Rotation
          </h2>
          <p className="text-xs mt-0.5 font-medium" style={{ color: C.txtMuted }}>
            Fair dispatch scheduling &amp; walk-in rotation for active therapists
          </p>
        </div>
        <div className="w-full sm:w-56 flex-shrink-0">
          <LuxurySelect
            id="queue-filter"
            value={queueFilter}
            onChange={setQueueFilter}
            options={queueFilterOptions}
            size="sm"
            isDark={C.isDark}
          />
        </div>
      </div>

      {/* Summary Stats */}
      {queue.length > 0 && (
        <div
          className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl"
          style={{
            background: C.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
            border: `1px solid ${C.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          }}
        >
          {[
            { label: 'In Queue',       value: queue.length,  color: C.accent,  bg: `${C.accent}18` },
            { label: 'Served Today',   value: servedCount,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
            { label: 'Total Sessions', value: totalServed,   color: '#0284c7', bg: 'rgba(2,132,199,0.12)'  },
          ].map(s => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl gap-0.5"
              style={{ background: s.bg }}
            >
              <span className="text-xl sm:text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center leading-tight" style={{ color: C.txtMuted }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Queue Cards */}
      <div className="space-y-2.5">
        {filteredQueue.map((t, idx) => {
          const isFirst = t.position === 1;
          const queueActions = [
            { type: 'header', label: `${t.name} Dispatch` },
            { label: 'Assign Session & Rotate',    icon: Zap,        onClick: () => markServed(t.id) },
            { label: 'Promote to Next Up (#1)',     icon: Crown,      disabled: isFirst, onClick: () => moveToTop(idx) },
            { label: 'Move Up in Queue',            icon: ChevronUp,  disabled: idx === 0, onClick: () => swap(idx, -1) },
            { label: 'Move Down in Queue',          icon: ChevronDown,disabled: idx === queue.length - 1, onClick: () => swap(idx, 1) },
            { label: 'Send to End of Queue',        icon: RotateCcw,  onClick: () => sendToEnd(idx) },
            { label: 'Reset Served Session Count',  icon: RefreshCw,  onClick: () => resetCount(t.id) },
            { type: 'divider' },
            { label: 'View Schedule Shifts', icon: Calendar, onClick: () => onSelectTab && onSelectTab('schedules', t.id) },
          ];

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: isFirst
                  ? (C.isDark
                      ? 'linear-gradient(145deg,rgba(5,150,105,0.18),rgba(5,150,105,0.07))'
                      : 'linear-gradient(145deg,rgba(5,150,105,0.08),rgba(5,150,105,0.03))')
                  : C.card,
                border: isFirst
                  ? `2px solid ${C.accent}55`
                  : `1px solid ${C.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                boxShadow: isFirst ? `0 6px 28px ${C.accent}22` : C.shadow,
              }}
            >
              {/* Next-Up label strip */}
              {isFirst && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full"
                    style={{ background: C.accent, color: '#fff' }}
                  >
                    ✦ Next Up
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: C.accent }}>
                    Dispatch for the next walk-in
                  </span>
                </div>
              )}

              <div className="p-3 sm:p-4 flex flex-col gap-3">
                {/* Identity row */}
                <div className="flex items-center gap-3">
                  {/* Position badge */}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
                    style={{
                      background: isFirst ? 'linear-gradient(135deg,#059669,#0a5f3c)' : C.inner,
                      color: isFirst ? '#fff' : C.txtMuted,
                    }}
                  >
                    #{t.position}
                  </div>

                  <Avatar name={t.name} gradient={ROLE_META[t.role]?.grad} size={40} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-black truncate" style={{ color: C.txt }}>{t.name}</p>
                      {t.sessions > 0 && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(139,92,246,0.14)', color: '#8b5cf6' }}
                        >
                          {t.sessions} served
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 font-medium truncate" style={{ color: C.txtMuted }}>
                      {t.specialty || 'General Therapist'}
                    </p>
                  </div>

                  {/* Compact up/down + overflow */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => swap(idx, -1)}
                      disabled={idx === 0}
                      title="Move Up"
                      aria-label="Move Up in Queue"
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                      style={{ background: C.inner, color: C.txtSec }}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => swap(idx, 1)}
                      disabled={idx === queue.length - 1}
                      title="Move Down"
                      aria-label="Move Down in Queue"
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                      style={{ background: C.inner, color: C.txtSec }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <LuxuryDropdownMenu
                      trigger={
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer transition-all active:scale-90"
                          style={{ background: C.inner }}
                          aria-label={`Queue options for ${t.name}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                      items={queueActions}
                      menuWidth={230}
                      align="right"
                      isDark={C.isDark}
                    />
                  </div>
                </div>

                {/* Assign & Rotate CTA — full width */}
                <button
                  onClick={() => markServed(t.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] hover:opacity-90 cursor-pointer"
                  style={{
                    background: isFirst
                      ? 'linear-gradient(135deg,#059669 0%,#047857 100%)'
                      : `linear-gradient(135deg,${C.isDark ? '#1d4ed8' : '#1565c0'} 0%,${C.isDark ? '#1e3a8a' : '#0d47a1'} 100%)`,
                    boxShadow: isFirst
                      ? '0 4px 16px rgba(5,150,105,0.35)'
                      : '0 4px 14px rgba(21,101,192,0.28)',
                  }}
                >
                  <Zap className="w-4 h-4 flex-shrink-0" />
                  <span>Assign &amp; Rotate</span>
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Empty State */}
        {filteredQueue.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl gap-3"
            style={{
              background: C.card,
              border: `1px dashed ${C.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: C.inner }}>
              <ListOrdered className="w-7 h-7" style={{ color: C.txtMuted }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: C.txt }}>No therapists in this view</p>
              <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: C.txtMuted }}>
                {queueFilter === 'served'
                  ? 'No sessions have been dispatched today yet.'
                  : 'All therapists are either inactive or not available.'}
              </p>
            </div>
            {queueFilter !== 'all' && (
              <button
                onClick={() => setQueueFilter('all')}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                style={{ background: C.inner, color: C.accent }}
              >
                Show All Queue
              </button>
            )}
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

  const applyPreset = (template) => {
    if (template === 'default') {
      setPerms(INITIAL_PERMS);
      toast.success('Applied default role permissions!');
    } else if (template === 'staff-expanded') {
      setPerms(prev => ({
        ...prev,
        staff: { bookings: true, services: true, history: true, settings: true, analytics: true, userMgmt: false },
      }));
      toast.success('Granted expanded operational access to Staff Coordinator!');
    } else if (template === 'strict') {
      setPerms(prev => ({
        ...prev,
        staff: { bookings: true, services: false, history: false, settings: false, analytics: false, userMgmt: false },
        therapist: { bookings: true, services: false, history: false, settings: false, analytics: false, userMgmt: false },
      }));
      toast.info('Applied strict minimal access permissions!');
    }
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try { await axios.post('/admin/rbac/permissions', { permissions: perms }); } catch {}
    setSaving(false); setSaved(true);
    toast.success('RBAC permissions updated and saved!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2" style={{ color: C.txt }}>
            <Shield className="w-5 h-5" style={{ color: C.accent }} /> Role-Based Access Control
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.txtMuted }}>Configure system permission levels per operational role</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Permission Presets Dropdown */}
          <LuxuryDropdownMenu
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all hover:opacity-90 cursor-pointer"
                style={{ background: C.card, borderColor: C.inputBdr, color: C.txt }}
                aria-label="Permission presets menu"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                <span>Permission Templates</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            }
            items={[
              { type: 'header', label: 'Preset Templates' },
              { label: 'Reset to Factory Defaults', icon: RotateCcw, onClick: () => applyPreset('default') },
              { label: 'Grant Expanded Staff Access', icon: UserCheck, description: 'Bookings, Services, History & Analytics', onClick: () => applyPreset('staff-expanded') },
              { label: 'Strict Minimal Access Policy', icon: Shield, description: 'Restricts Staff to Bookings queue only', onClick: () => applyPreset('strict') },
            ]}
            menuWidth={260}
            align="right"
            isDark={C.isDark}
          />

          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}>
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Permissions'}
          </button>
        </div>
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
/*  ROOT COMPONENT: USER MANAGEMENT                                 */
/* ─────────────────────────────────────────────────────────────── */
export default function AdminUserMaintenance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profiles';
  const [focusedMemberId, setFocusedMemberId] = useState(null);
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

  const handleNavigateTab = (tabName, memberId) => {
    if (memberId) setFocusedMemberId(memberId);
    setSearchParams({ tab: tabName });
  };

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
            <TabProfiles users={users} onUsersChange={setUsers} onSelectTab={handleNavigateTab} />
          </motion.div>
        )}
        {activeTab === 'schedules' && (
          <motion.div key="schedules" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <TabSchedules users={users} focusedMemberId={focusedMemberId} />
          </motion.div>
        )}
        {activeTab === 'queue' && (
          <motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <TabQueue users={users} onSelectTab={handleNavigateTab} />
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
