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
  BarChart3, LayoutList, LayoutGrid,
  RefreshCw, Mail, Phone, Lock, Briefcase,
  Eye, EyeOff, Check, Copy, AlertCircle, AlertTriangle, Info, Loader2, KeyRound,
  Trash2, MoreVertical, ArrowUpDown, Download, RotateCcw,
  CalendarDays, Clock, Sun, Moon, Sunrise, Zap, ListOrdered,
  Pause, Play, SkipForward, History, Undo2, Timer, BadgeCheck, ClipboardList
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
    <span className="inline-flex items-center whitespace-nowrap text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
      style={{ background: m.badgeBg, color: m.color }}>{m.label}</span>
  );
}

function StatusDot({ status }) {
  const on = status === 'active';
  return (
    <span className="inline-flex items-center whitespace-nowrap gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
      style={{ background: on ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)', color: on ? '#059669' : '#64748b' }}>
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
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

function FormField({ label, required, error, icon: Ic, children, hint, htmlFor, errorId }) {
  const errId = errorId || (htmlFor ? `${htmlFor}-error` : undefined);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
          {Ic && <Ic className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />}
          <span>{label}{required && <span aria-hidden="true" className="text-red-400 font-bold"> *</span>}</span>
          {required && <span className="sr-only">(required)</span>}
        </label>
        {hint && <span className="text-[9px] font-medium tabular-nums text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={errId} role="alert" className="text-[10px] font-bold text-red-400 flex items-start gap-1 mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-px" aria-hidden="true" /> <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function formatJoinedDate(value) {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
function ModalShell({ children, onClose, maxWidth = 'max-w-lg', labelledBy, describedBy, role = 'dialog' }) {
  const panelRef = useRef(null);
  const prevFocusRef = useRef(null);
  const prevOverflowRef = useRef('');

  useEffect(() => {
    prevFocusRef.current = document.activeElement;
    prevOverflowRef.current = document.body.style.overflow;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;

    const panel = panelRef.current;
    // Focus first focusable element, fall back to panel itself
    const t = setTimeout(() => {
      const focusable = panel?.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (focusable || panel)?.focus?.({ preventScroll: true });
    }, 60);

    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) { e.preventDefault(); panel.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflowRef.current;
      document.body.style.paddingRight = '';
      if (prevFocusRef.current?.focus) prevFocusRef.current.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 sm:py-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      onClick={onClose}>
      <motion.div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400`}
        initial={{ y: 48, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 48, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 35 }}
        onClick={e => e.stopPropagation()}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/25" />
        </div>
        {children}
      </motion.div>
    </motion.div>
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
    <ModalShell onClose={onClose} maxWidth="max-w-lg" labelledBy="user-detail-title" describedBy="user-detail-desc">
      <div style={{ background: C.card }} className="flex flex-col max-h-[90dvh] sm:max-h-[85dvh]">
        <div className="p-5 sm:p-6 pt-9 sm:pt-6 relative text-white flex-shrink-0" style={{ background: meta.grad }}>
          <button onClick={onClose} aria-label="Close user details" className="absolute right-4 top-4 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-4">
            <Avatar name={user.name} gradient="rgba(255,255,255,0.2)" size={54} />
            <div className="min-w-0 flex-1">
              <h3 id="user-detail-title" className="font-black text-lg sm:text-xl text-white leading-tight break-words">{user.name}</h3>
              <p id="user-detail-desc" className="text-xs text-white/80 mt-0.5 break-all">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white/20 uppercase tracking-wider text-white inline-flex items-center gap-1 whitespace-nowrap">
                  <Icon className="w-3 h-3" aria-hidden="true" /> {meta.label}
                </span>
                <StatusDot status={user.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 custom-scrollbar overscroll-contain">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: 'Phone',         value: user.phone || '—',                      icon: Phone },
              { label: 'Specialization',value: user.specialty || '—',                  icon: Briefcase },
              { label: 'Commission Tier', value: user.role === 'therapist' ? `${user.commRate || 40}% commission rate` : 'Salary-based (monthly payroll)', icon: TrendingUp },
              { label: 'Date Joined',   value: formatJoinedDate(user.joined),          icon: Calendar },
            ].map(({ label, value, icon: Ic }) => (
              <div key={label} className="p-3.5 rounded-2xl space-y-1" style={{ background: C.inner }}>
                <dt className="flex items-center gap-1.5">
                  <Ic className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                </dt>
                <dd className="text-xs font-bold break-words" style={{ color: C.txt }} title={value}>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="p-3.5 rounded-2xl" style={{ background: C.inner }}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Access & Permissions</p>
            <p className="text-xs leading-relaxed" style={{ color: C.txtSec }}>{meta.desc}</p>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex flex-col-reverse sm:flex-row gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${C.divider}`, paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))' }}>
          <button onClick={onClose} className="min-h-[44px] py-2.5 px-4 rounded-xl text-sm font-bold transition-all hover:opacity-80 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            style={{ background: C.inner, color: C.txtSec }}>Close</button>
          {onManageSchedule && (user.role === 'therapist' || user.role === 'staff') && (
            <button onClick={() => { onClose(); onManageSchedule(user.id); }}
              className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer hover:opacity-90 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              style={{ background: C.inner, borderColor: C.inputBdr, color: C.txt }}>
              <Calendar className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span>Shifts</span>
            </button>
          )}
          <button onClick={() => { onClose(); onEdit(user); }}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
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
  const cancelRef = useRef(null);
  useEffect(() => { const t = setTimeout(() => cancelRef.current?.focus({ preventScroll: true }), 80); return () => clearTimeout(t); }, []);
  if (!user) return null;
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md" role="alertdialog" labelledBy="delete-user-title" describedBy="delete-user-desc">
      <div className="p-5 sm:p-6 space-y-4 text-center" style={{ background: C.card }}>
        <div aria-hidden className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mx-auto flex items-center justify-center bg-red-500/10 text-red-500 shadow-inner">
          <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 id="delete-user-title" className="text-base sm:text-lg font-black" style={{ color: C.txt }}>Revoke Team Account</h3>
          <p id="delete-user-desc" className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: C.txtSec }}>
            Are you sure you want to remove <strong className="font-black text-red-400">{user.name}</strong> ({user.email})?
            This permanently revokes portal credentials and unassigns upcoming shift rosters. This cannot be undone.
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            style={{ background: C.inner, color: C.txtSec }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(user.id, user.name)}
            aria-describedby="delete-user-desc"
            className="flex-1 min-h-[44px] py-2.5 rounded-xl text-sm font-black text-white bg-red-600 hover:bg-red-700 shadow-md transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
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

  const firstErrorRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!isEdit) { const t = setTimeout(() => nameInputRef.current?.focus({ preventScroll: true }), 120); return () => clearTimeout(t); }
    return undefined;
  }, [isEdit]);

  const generateSecurePassword = useCallback(() => {
    // 14-char cryptographically random password: upper + lower + digit + symbol guaranteed
    const lower = 'abcdefghijkmnpqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const symbols = '!@#$%&*?';
    const all = lower + upper + digits + symbols;
    const rand = (n) => {
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const buf = new Uint32Array(n);
        crypto.getRandomValues(buf);
        return Array.from(buf, v => v % all.length);
      }
      return Array.from({ length: n }, () => Math.floor(Math.random() * all.length));
    };
    const pick = (set) => set[Math.floor((typeof crypto !== 'undefined' && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.random() * 100000) % set.length)];
    const chars = rand(10).map(i => all[i]);
    const pw = [pick(lower), pick(upper), pick(digits), pick(symbols), ...chars]
      .sort(() => 0.5 - (typeof crypto !== 'undefined' ? 0.5 : Math.random()))
      .join('').slice(0, 14);
    setForm(p => ({ ...p, password: pw, confirmPassword: pw }));
    setErrors(prev => { const u = { ...prev }; delete u.password; delete u.confirmPassword; return u; });
    setShowPw(true);
    setShowConfirmPw(true);
    setServerError('');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(pw).then(
        () => toast.success('Generated strong password & copied to clipboard!'),
        () => toast.info('Generated strong password — copy it before closing.')
      );
    } else {
      toast.info('Generated strong password!');
    }
  }, [toast]);

  const validate = useCallback(() => {
    const e = {};
    // Name: mirrors backend min:2 max:100 + sane charset
    const nameTrimmed = form.name.trim().replace(/\s+/g, ' ');
    if (!nameTrimmed) {
      e.name = 'Full name is required.';
    } else if (nameTrimmed.length < 2) {
      e.name = 'Full name must be at least 2 characters.';
    } else if (nameTrimmed.length > 100) {
      e.name = 'Full name must be 100 characters or fewer.';
    } else if (!/^[\p{L}\s.'-]+$/u.test(nameTrimmed)) {
      e.name = 'Use letters, spaces, hyphens, apostrophes, and periods only.';
    }

    // Email: mirrors backend email|max:150|unique
    const emailTrimmed = form.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      e.email = 'Email address is required.';
    } else if (emailTrimmed.length > 150) {
      e.email = 'Email must be 150 characters or fewer.';
    } else if (!emailRegex.test(emailTrimmed)) {
      e.email = 'Enter a valid email address (e.g. maria@cozy.spa).';
    }

    // Phone: MUST mirror backend regex /^[0-9+()\- ]{7,25}$/ (no dots/letters)
    const phoneTrimmed = (form.phone || '').trim();
    if (phoneTrimmed) {
      if (phoneTrimmed.length < 7 || phoneTrimmed.length > 25 || !/^[0-9+()\- ]{7,25}$/.test(phoneTrimmed)) {
        e.phone = 'Enter a valid phone (7–25 chars: digits, spaces, + ( ) - ). E.g. +63 917 123 4567.';
      }
    }

    if (!['therapist', 'staff'].includes(form.role)) {
      e.role = 'Select Therapist or Staff Coordinator. Admin accounts cannot be created here.';
    }

    const specTrimmed = (form.specialty || '').trim();
    if (!specTrimmed) {
      e.specialty = form.role === 'therapist'
        ? 'Treatment specialization is required (e.g. Swedish & Deep Tissue).'
        : 'Position title is required (e.g. Front Desk Coordinator).';
    } else if (specTrimmed.length > 150) {
      e.specialty = 'Specialization must be 150 characters or fewer.';
    }

    // Password: mirrors backend min:8|confirmed; add complexity guidance
    const needsPassword = !isEdit || !!form.password || !!form.confirmPassword;
    if (needsPassword) {
      if (!form.password) {
        e.password = isEdit ? 'Enter a new password, or leave both fields blank to keep the current one.' : 'Initial account password is required.';
      } else if (form.password.length < 8) {
        e.password = 'Password must be at least 8 characters.';
      } else if (form.password.length > 128) {
        e.password = 'Password must be 128 characters or fewer.';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        e.password = 'Use upper + lower case letters and at least one number for a stronger password.';
      }
      if (!form.confirmPassword) {
        e.confirmPassword = 'Please repeat the password to confirm.';
      } else if (form.password !== form.confirmPassword) {
        e.confirmPassword = 'Passwords do not match.';
      }
    }

    return e;
  }, [form, isEdit]);

  const normalizeServerErrors = (serverErrors) => {
    const mapped = {};
    Object.entries(serverErrors || {}).forEach(([k, v]) => {
      const key = k === 'password_confirmation' ? 'confirmPassword' : k;
      mapped[key] = Array.isArray(v) ? v[0] : String(v);
    });
    return mapped;
  };

  const focusFirstError = (errs) => {
    const order = ['name', 'email', 'phone', 'role', 'specialty', 'status', 'password', 'confirmPassword'];
    const first = order.find(k => errs[k]);
    if (!first) return;
    requestAnimationFrame(() => {
      document.getElementById(`member-${first}`)?.focus({ preventScroll: false });
    });
  };

  const submit = async e => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) { focusFirstError(errs); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim().replace(/\s+/g, ' '),
        email: form.email.trim().toLowerCase(),
        phone: (form.phone || '').trim(),
        specialty: (form.specialty || '').trim(),
        password_confirmation: form.confirmPassword,
      };
      if (isEdit && !payload.password) { delete payload.password; delete payload.password_confirmation; delete payload.confirmPassword; }
      await onSave(payload);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(prev => ({ ...prev, ...normalizeServerErrors(data.errors) }));
      const msg = data?.message || data?.errors?.email?.[0] || 'Failed to save team member account. Please review the highlighted fields.';
      setServerError(msg);
      if (data?.errors) focusFirstError(normalizeServerErrors(data.errors));
      else firstErrorRef.current?.focus();
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

  const errorCount = Object.keys(errors).length;
  const titleId = isEdit ? 'edit-member-title' : 'add-member-title';
  const descId = isEdit ? 'edit-member-desc' : 'add-member-desc';

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-xl" labelledBy={titleId} describedBy={descId}>
      <form onSubmit={submit} noValidate aria-describedby={descId} style={{ background: C.card }} className="flex flex-col max-h-[92dvh] sm:max-h-[88dvh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.divider}` }}>
          <div className="flex items-center gap-3 min-w-0">
            <div aria-hidden className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #0a5f3c 100%)', color: '#fff' }}>
              <UserCog className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="font-black text-sm sm:text-base leading-tight" style={{ color: C.txt }}>
                {isEdit ? 'Edit Team Member Profile' : 'Onboard New Team Member'}
              </h2>
              <p id={descId} className="text-[11px] sm:text-xs mt-0.5" style={{ color: C.txtMuted }}>
                {isEdit ? 'Update credentials, commission and role permissions.' : 'Create a new therapist or staff coordinator account. Admin roles are blocked here.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all cursor-pointer flex-shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            style={{ background: C.inner }}>
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 custom-scrollbar overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {(serverError || errorCount > 0) && (
            <div ref={firstErrorRef} tabIndex={-1} role="alert" aria-live="assertive"
              className="p-3 sm:p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-bold focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden="true" />
              <div className="min-w-0">
                <p>{serverError || `Please fix ${errorCount} highlighted field${errorCount > 1 ? 's' : ''} below.`}</p>
                {!serverError && (
                  <ul className="mt-1 space-y-0.5 font-medium list-disc pl-4">
                    {Object.entries(errors).slice(0, 4).map(([k, v]) => <li key={k}>{String(v)}</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Full Name */}
          <FormField label="Full Name" required error={errors.name} icon={User} htmlFor="member-name" hint={`${form.name.trim().length}/100`}>
            <input
              id="member-name"
              ref={nameInputRef}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              onBlur={e => set('name', e.target.value.trim().replace(/\s+/g, ' '))}
              placeholder="e.g. Maria Santos"
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'member-name-error' : undefined}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
              style={inputStyle(errors.name)}
            />
          </FormField>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField label="Email Address" required error={errors.email} icon={Mail} htmlFor="member-email">
              <input
                id="member-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={150}
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onBlur={e => set('email', e.target.value.trim().toLowerCase())}
                placeholder="maria@cozy.spa"
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'member-email-error' : 'member-email-hint'}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
                style={inputStyle(errors.email)}
              />
              <span id="member-email-hint" className="sr-only">Must be unique. Lowercase letters recommended.</span>
            </FormField>
            <FormField label="Phone Number" error={errors.phone} icon={Phone} htmlFor="member-phone" hint="Optional">
              <input
                id="member-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={25}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+63 917 123 4567"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'member-phone-error' : 'member-phone-hint'}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
                style={inputStyle(errors.phone)}
              />
              <span id="member-phone-hint" className="sr-only">Digits, spaces, plus, parentheses and dashes only, 7 to 25 characters.</span>
            </FormField>
          </div>

          {/* Role Selection (Single Elegant Dual-Card Selector) */}
          <fieldset className="space-y-1.5">
            <legend className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
              <span>Operational Role <span aria-hidden="true" className="text-red-400 font-bold">*</span><span className="sr-only">(required)</span></span>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Select operational role" aria-required="true" aria-invalid={!!errors.role} aria-describedby={errors.role ? 'member-role-error' : 'member-role-hint'}>
              <span id="member-role-hint" className="sr-only">Therapist earns commission. Staff is fixed salary. Admin cannot be created here.</span>
              <button
                type="button"
                role="radio"
                id="member-role-therapist"
                aria-checked={form.role === 'therapist'}
                onClick={() => handleRoleChange('therapist')}
                onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('member-role-staff')?.focus(); handleRoleChange('staff'); } }}
                className="p-3.5 rounded-2xl text-left transition-all relative overflow-hidden flex items-center gap-3 border cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[64px]"
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
                id="member-role-staff"
                aria-checked={form.role === 'staff'}
                onClick={() => handleRoleChange('staff')}
                onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('member-role-therapist')?.focus(); handleRoleChange('therapist'); } }}
                className="p-3.5 rounded-2xl text-left transition-all relative overflow-hidden flex items-center gap-3 border cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[64px]"
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
              <p id="member-role-error" role="alert" className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.role}
              </p>
            )}
          </fieldset>

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
                Quick Preset Picks:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-0.5">
                {(form.role === 'therapist' ? THERAPIST_SPECIALTY_PRESETS : STAFF_POSITION_PRESETS).map(preset => {
                  const isSelected = (form.specialty || '').trim() === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => set('specialty', isSelected ? '' : preset)}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? 'Remove' : 'Select'} preset ${preset}`}
                      className={`min-h-[32px] text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
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
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: C.divider }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                {isEdit ? 'Portal Password (Optional)' : 'Portal Password'}
              </span>
              <button
                type="button"
                onClick={generateSecurePassword}
                className="min-h-[36px] text-[11px] font-black inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:opacity-85 shadow-sm cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                style={{ background: 'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(16,185,129,0.25))', color: '#059669', border: '1px solid rgba(5,150,105,0.3)' }}
              >
                Auto-Generate Secure
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField label="Password" required={!isEdit} error={errors.password} icon={Lock} htmlFor="member-password" hint={form.password ? `${form.password.length} chars` : 'Min. 8'}>
                <div className="relative">
                  <input
                    id="member-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete={isEdit ? 'new-password' : 'new-password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 8 characters'}
                    required={!isEdit}
                    aria-required={!isEdit}
                    aria-invalid={!!errors.password}
                    aria-describedby={`member-password-strength${errors.password ? ' member-password-error' : ''}`}
                    className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 text-sm rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
                    style={inputStyle(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    aria-pressed={showPw}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm Password" required={!isEdit || !!form.password} error={errors.confirmPassword} icon={Lock} htmlFor="member-confirmPassword">
                <div className="relative">
                  <input
                    id="member-confirmPassword"
                    name="password_confirmation"
                    type={showConfirmPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    required={!isEdit || !!form.password}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'member-confirmPassword-error' : undefined}
                    className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 text-sm rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
                    style={inputStyle(errors.confirmPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'}
                    aria-pressed={showConfirmPw}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </FormField>
            </div>

            {(form.password || passwordsMismatch) && (
              <div id="member-password-strength" aria-live="polite" className="p-3 rounded-xl space-y-2" style={{ background: C.inner }}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-400">Password Strength:</span>
                  <span className="font-black" style={{ color: pwStrength.color }}>
                    {pwStrength.label || '—'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-700/30 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pwStrength.percent} aria-label="Password strength">
                  <div className="h-full transition-all duration-300 rounded-full"
                    style={{ width: `${pwStrength.percent}%`, background: pwStrength.color }} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Use 8+ characters with upper + lower case and a number. Symbols recommended.</p>
                {passwordsMatch && (
                  <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" /> Passwords match
                  </p>
                )}
                {passwordsMismatch && (
                  <p role="alert" className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" /> Passwords do not match
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${C.divider}`, background: C.card, paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            style={{ background: C.inner, color: C.txtSec }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white shadow-lg transition-all hover:opacity-95 active:scale-95 disabled:opacity-60 disabled:cursor-wait cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
            style={{
              background: isSubmitting ? '#059669' : 'linear-gradient(135deg, #059669 0%, #0a5f3c 100%)',
              boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
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
  const [viewMode, setViewMode]         = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'));
  const [viewingUser, setViewingUser]   = useState(null);
  const [editingUser, setEditingUser]   = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addingUser, setAddingUser]     = useState(false);

  // Sorting and filtering (null-safe, trimmed, debounced via memo)
  const filtered = useMemo(() => {
    let list = users.filter(u => {
      const q = search.trim().toLowerCase();
      const mQ = !q
        || (u.name || '').toLowerCase().includes(q)
        || (u.email || '').toLowerCase().includes(q)
        || (u.specialty || '').toLowerCase().includes(q)
        || (u.phone || '').toLowerCase().includes(q);
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

  const handleCopyTempPassword = useCallback(user => {
    const rand = typeof crypto !== 'undefined' && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint32Array(1))[0] % 9000 + 1000
      : Math.floor(1000 + Math.random() * 9000);
    const tempPw = `Cozy@${rand}!`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(tempPw).then(
        () => toast.success(`Temporary password for ${user.name} copied. Share it securely — it won't be shown again.`),
        () => toast.info(`Temporary password for ${user.name}: ${tempPw}`)
      );
    } else {
      toast.info(`Generated temporary password: ${tempPw}`);
    }
  }, [toast]);

  const handleExportCSV = useCallback(() => {
    if (filtered.length === 0) { toast.info('Nothing to export — no members match the current filters.'); return; }
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Specialty', 'Status', 'Joined'];
    const rows = filtered.map(u => [u.id, u.name, u.email, u.phone || '', u.role, u.specialty || '', u.status, u.joined || ''].map(esc).join(','));
    const csv = `﻿${headers.map(esc).join(',')}\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cozy_blissful_team_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Exported ${filtered.length} member${filtered.length === 1 ? '' : 's'} to CSV!`);
  }, [filtered, toast]);

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
    { label: 'Total Users', value: users.length,                                badge: 'Registered', badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', Icon: Users },
    { label: 'Active',      value: users.filter(u => u.status === 'active').length, badge: 'On Duty', badgeClass: 'text-teal-700 dark:text-teal-300 bg-teal-500/15', iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', Icon: UserCheck },
    { label: 'Therapists',  value: users.filter(u => u.role === 'therapist').length, badge: 'Providers', badgeClass: 'text-sky-700 dark:text-sky-300 bg-sky-500/15', iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', Icon: Stethoscope },
    { label: 'Staff',       value: users.filter(u => u.role === 'staff').length,     badge: 'Front Desk', badgeClass: 'text-purple-700 dark:text-purple-300 bg-purple-500/15', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', Icon: UserCog },
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

      {/* ── SUMMARY STRIP — gaya ng Customer Registry: 1-col sa ≤419px phones, 2-col sa larger phones, 4-col sa desktop ── */}
      <dl className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="Team directory summary">
        {KPI_CARDS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-2 min-w-0"
            style={{ background: C.card, border: C.cardBorder }}
          >
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight min-w-0">
                {s.label}
              </dt>
              <div className={`w-8 h-8 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`} aria-hidden="true">
                <s.Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1.5">
              <dd className="text-xl sm:text-lg lg:text-xl xl:text-2xl font-black leading-none text-slate-900 dark:text-white break-words tabular-nums min-w-0">
                {s.value}
              </dd>
              <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${s.badgeClass}`}>
                {s.badge}
              </span>
            </div>
          </motion.div>
        ))}
      </dl>

      {/* Toolbar — search + view toggle + export + add */}
      <div className="p-3 sm:p-3.5 rounded-2xl space-y-3" style={{ background: C.card, boxShadow: C.shadow }}>
        {/* Row 1: Search + Quick Add + Tools */}
        <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3 items-stretch lg:items-center">
          <div className="relative flex-1 min-w-0">
            <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <label htmlFor="member-search" className="sr-only">Search team by name, email, or specialty</label>
            <input
              id="member-search"
              type="search"
              autoComplete="off"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape' && search) setSearch(''); }}
              placeholder="Search by name, email, specialty…"
              aria-describedby="member-search-count"
              className="w-full min-h-[44px] pl-9 pr-10 py-2.5 text-sm rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
              style={{ background: C.inner, border: `1.5px solid ${C.inputBdr}`, color: C.txt }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div role="group" aria-label="Change directory layout" className="flex items-center p-1 rounded-xl border" style={{ background: C.inner, borderColor: C.inputBdr }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-pressed={viewMode === 'table'}
                className="min-w-[40px] min-h-[40px] p-2 rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                style={{
                  background: viewMode === 'table' ? (C.isDark ? 'rgba(5,150,105,0.25)' : 'rgba(5,150,105,0.15)') : 'transparent',
                  color: viewMode === 'table' ? C.accent : C.txtMuted,
                }}
                title="Table view (best on desktop)"
                aria-label="Table view"
              >
                <LayoutList className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                aria-pressed={viewMode === 'cards'}
                className="min-w-[40px] min-h-[40px] p-2 rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                style={{
                  background: viewMode === 'cards' ? (C.isDark ? 'rgba(5,150,105,0.25)' : 'rgba(5,150,105,0.15)') : 'transparent',
                  color: viewMode === 'cards' ? C.accent : C.txtMuted,
                }}
                title="Card grid view (best on mobile)"
                aria-label="Card grid view"
              >
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Export & Actions Dropdown */}
            <LuxuryDropdownMenu
              trigger={
                <button
                  type="button"
                  className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-85 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  style={{ background: C.inner, borderColor: C.inputBdr, color: C.txtSec }}
                  aria-label="Export tools menu"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
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
              className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-black text-white shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
              style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)', boxShadow: '0 4px 16px rgba(5,150,105,0.35)' }}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Member</span>
            </button>
          </div>
        </div>
        <p id="member-search-count" role="status" aria-live="polite" className="text-[11px] font-medium" style={{ color: C.txtMuted }}>
          Showing {filtered.length} of {users.length} member{users.length === 1 ? '' : 's'}
          {search ? ` for “${search}”` : ''}{roleFilter !== 'all' ? ` · ${roleFilter}` : ''}{statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
        </p>

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
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-xs font-bold border flex items-center justify-center transition-all hover:opacity-85 text-amber-500 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                style={{ background: C.inner, borderColor: C.inputBdr }}
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table / Cards View — table on ≥md, auto cards hint on small screens */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.shadow }}>
          <div className="overflow-x-auto custom-scrollbar" tabIndex={0} role="region" aria-label="Team members table, scroll horizontally on small screens">
            <table className="w-full min-w-[760px] border-collapse">
              <caption className="sr-only">Team members: name, specialization, role, status, compensation, join date and actions</caption>
              <thead>
                <tr style={{ background: C.tableHead }}>
                  {['User', 'Specialization', 'Role', 'Status', 'Compensation', 'Joined', 'Actions'].map(h => (
                    <th key={h} scope="col" className="px-4 py-3.5 text-left text-[9px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: C.txtMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const meta = ROLE_META[u.role] || ROLE_META.staff;
                  return (
                    <tr
                      key={u.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`View profile of ${u.name}, ${u.email}`}
                      onClick={() => setViewingUser(u)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewingUser(u); } }}
                      className="cursor-pointer transition-colors group outline-none focus-visible:bg-emerald-500/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                      style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.divider}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.inner}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={u.name} gradient={meta.grad} size={38} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold truncate max-w-[180px]" style={{ color: C.txt }} title={u.name}>{u.name}</p>
                            <p className="text-[11px] truncate max-w-[180px]" style={{ color: C.txtMuted }} title={u.email}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium max-w-[190px]" style={{ color: C.txtSec }}><span className="block truncate" title={u.specialty || '—'}>{u.specialty || '—'}</span></td>
                      <td className="px-4 py-3 whitespace-nowrap"><RolePill role={u.role} /></td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusDot status={u.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {u.role === 'therapist' ? (
                          <span className="inline-flex items-center whitespace-nowrap text-[10px] font-black px-2.5 py-1 rounded-full tabular-nums" style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }} title={`Commission rate ${u.commRate || 40} percent`}>
                            {u.commRate || 40}% · Comm.
                          </span>
                        ) : (
                          <span className="inline-flex items-center whitespace-nowrap text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: C.pillBg, color: C.txtMuted }}>Salary</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] whitespace-nowrap tabular-nums" style={{ color: C.txtMuted }} title={u.joined || ''}>{formatJoinedDate(u.joined)}</td>
                      <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {/* Quick Edit */}
                          <button
                            onClick={() => setEditingUser(u)}
                            className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                            style={{ background: C.inner, color: C.txtSec }}
                            title={`Edit ${u.name}`}
                            aria-label={`Edit ${u.name}`}
                          >
                            <Edit3 className="w-4 h-4" aria-hidden="true" />
                          </button>

                          {/* Senior Dropdown Action Menu */}
                          <LuxuryDropdownMenu
                            trigger={
                              <button
                                type="button"
                                className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                                style={{ background: C.inner, color: C.txtSec }}
                                aria-label={`Open menu for ${u.name}`}
                              >
                                <MoreVertical className="w-4 h-4" aria-hidden="true" />
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
                    <td colSpan={7} className="py-14 sm:py-16 text-center px-4">
                      <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-inner" style={{ background: C.inner }}>
                        <Users className="w-6 h-6 opacity-40" style={{ color: C.txtMuted }} aria-hidden="true" />
                      </div>
                      <p className="text-sm font-black" style={{ color: C.txt }}>No team members match your criteria</p>
                      <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: C.txtMuted }}>Try adjusting your search query, role filter, or status selection.</p>
                      <button
                        type="button"
                        onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setSortBy('name-asc'); }}
                        className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-85 cursor-pointer shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
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
            <div role="status" className="p-10 sm:p-12 text-center rounded-2xl border" style={{ background: C.card, borderColor: C.divider, boxShadow: C.shadow }}>
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-inner" style={{ background: C.inner }}>
                <Users className="w-6 h-6 opacity-40" style={{ color: C.txtMuted }} aria-hidden="true" />
              </div>
              <p className="text-sm font-black" style={{ color: C.txt }}>No team members found</p>
              <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: C.txtMuted }}>No profiles match your search or active filter criteria.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setSortBy('name-asc'); }}
                className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-85 cursor-pointer shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                style={{ background: C.inner, border: `1px solid ${C.inputBdr}`, color: C.accent }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div role="list" aria-label={`${filtered.length} team members`} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
              {filtered.map(u => {
                const meta = ROLE_META[u.role] || ROLE_META.staff;
                return (
                  <article
                    key={u.id}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${u.name}, ${meta.label}, ${u.status}`}
                    onClick={() => setViewingUser(u)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewingUser(u); } }}
                    className="p-4 sm:p-5 rounded-2xl space-y-3.5 cursor-pointer transition-all hover:-translate-y-0.5 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 relative"
                    style={{ background: C.card, boxShadow: C.shadow }}
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar name={u.name} gradient={meta.grad} size={44} />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm leading-tight truncate" style={{ color: C.txt }} title={u.name}>{u.name}</p>
                          <p className="text-[11px] mt-0.5 truncate" style={{ color: C.txtMuted }} title={u.email}>{u.email}</p>
                          {u.phone && <p className="text-[10px] mt-0.5 truncate tabular-nums" style={{ color: C.txtMuted }} title={u.phone}>{u.phone}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <StatusDot status={u.status} />
                        <LuxuryDropdownMenu
                          trigger={
                            <button
                              type="button"
                              className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                              style={{ background: C.inner }}
                              aria-label={`Actions for ${u.name}`}
                            >
                              <MoreVertical className="w-4 h-4" aria-hidden="true" />
                            </button>
                          }
                          items={getUserMenuItems(u)}
                          menuWidth={230}
                          align="right"
                          isDark={C.isDark}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3" style={{ borderTop: `1px solid ${C.divider}` }}>
                      <span className="text-xs truncate min-w-0 flex-1" style={{ color: C.txtMuted }} title={u.specialty || '—'}>{u.specialty || '—'}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {u.role === 'therapist' && (
                          <span className="whitespace-nowrap text-[9px] font-black px-2 py-1 rounded-full tabular-nums" style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }} title={`${u.commRate || 40}% commission`}>
                            {u.commRate || 40}%
                          </span>
                        )}
                        <RolePill role={u.role} />
                      </div>
                    </div>
                    <p className="text-[10px] tabular-nums" style={{ color: C.txtMuted }}>Joined {formatJoinedDate(u.joined)}</p>
                  </article>
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

  /* Schedule rules: 4h per shift · 40h regular week · 48h overtime line · 60h hard cap */
  const HOURS_PER_SHIFT = 4;
  const REGULAR_CAP = 40;
  const OVERTIME_AT = 48;
  const HARD_CAP = 60;
  const SHIFT_IDS = ['morning', 'afternoon', 'evening'];
  const SHIFT_ICON = { morning: Sunrise, afternoon: Sun, evening: Moon };
  const STORAGE_KEY = 'cb_work_schedules_v2';

  const buildDefault = useCallback(() =>
    Object.fromEntries(DAYS.map((d, i) => [d, i < 5 ? ['morning', 'afternoon'] : i === 5 ? ['morning'] : []])), []);
  const sanitizeWeek = useCallback((raw) => {
    const wk = {};
    DAYS.forEach(d => {
      const v = raw?.[d];
      wk[d] = Array.isArray(v) ? v.filter(s => SHIFT_IDS.includes(s)) : [];
    });
    return wk;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const teamUsers = useMemo(() => users.filter(u => u.role === 'staff' || u.role === 'therapist'), [users]);

  const [selected, setSelected] = useState(focusedMemberId || teamUsers[0]?.id || null);
  const [schedules, setSchedules] = useState(() => {
    const base = Object.fromEntries(users.map(u => [u.id, buildDefault()]));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        Object.keys(saved).forEach(k => { base[k] = Object.fromEntries(DAYS.map(d => [d, Array.isArray(saved[k]?.[d]) ? saved[k][d].filter(s => ['morning', 'afternoon', 'evening'].includes(s)) : []])); });
      }
    } catch { /* corrupt cache -> fall back to defaults */ }
    return base;
  });
  const [savedSnapshot, setSavedSnapshot] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      return saved && typeof saved === 'object' ? saved : null;
    } catch { return null; }
  });
  const [dirtyIds, setDirtyIds]     = useState(() => new Set());
  const [history, setHistory]       = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [rosterQuery, setRosterQuery] = useState('');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [touched, setTouched]       = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [pendingSelect, setPendingSelect] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const presetsRef                  = useRef(null);
  const presetsBtnRef               = useRef(null);
  const errorBoxRef                 = useRef(null);
  const modalCancelRef              = useRef(null);
  const searchRef                   = useRef(null);

  useEffect(() => { if (focusedMemberId) setSelected(focusedMemberId); }, [focusedMemberId]);

  // Close preset dropdown on outside click / Escape
  useEffect(() => {
    if (!showPresets) return;
    const onDown = e => { if (presetsRef.current && !presetsRef.current.contains(e.target)) setShowPresets(false); };
    const onKey = e => { if (e.key === 'Escape') { setShowPresets(false); presetsBtnRef.current?.focus(); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [showPresets]);

  // Focus the safe action when a guard dialog opens; Escape cancels it
  useEffect(() => {
    const open = (pendingSelect !== null && pendingSelect !== undefined) || confirmClear;
    if (!open) return undefined;
    const t = setTimeout(() => modalCancelRef.current?.focus(), 60);
    const onKey = e => {
      if (e.key === 'Escape') { setPendingSelect(null); setConfirmClear(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [pendingSelect, confirmClear]);

  // Current-week label (Mon–Sun) + per-day calendar dates
  const { weekLabel, weekDates } = useMemo(() => {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7;
    const mon = new Date(now);
    mon.setDate(now.getDate() - dow);
    const dates = DAYS.map((_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });
    const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { weekLabel: `${fmt(dates[0])} – ${fmt(dates[6])}`, weekDates: dates };
  }, []);

  const filteredTeam = useMemo(() => {
    const q = rosterQuery.trim().toLowerCase();
    return teamUsers.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (u.name || '').toLowerCase().includes(q) || (u.specialty || '').toLowerCase().includes(q);
    });
  }, [teamUsers, roleFilter, rosterQuery]);

  const person      = filteredTeam.find(u => u.id === selected) || teamUsers.find(u => u.id === selected) || null;
  const sched       = selected ? (schedules[selected] || {}) : {};
  const totalShifts = Object.values(sched).reduce((a, b) => a + (Array.isArray(b) ? b.length : 0), 0);
  const totalHours  = totalShifts * HOURS_PER_SHIFT;
  const isDirty     = selected != null && dirtyIds.has(selected);
  const canUndo     = history.length > 0 && history[history.length - 1]?.memberId === selected;

  /* ── Validation engine: errors block saving, warnings advise ── */
  const validation = useMemo(() => {
    const errors = [];
    const warnings = [];
    const dayCount = d => (sched[d] || []).length;
    const daysOff = DAYS.filter(d => dayCount(d) === 0);
    if (!person) return { errors, warnings, daysOff: 7, daysOn: 0 };
    if (totalShifts === 0) {
      errors.push({ code: 'empty', message: 'No shifts assigned. Give this member at least one shift before saving.' });
    }
    DAYS.forEach(d => {
      if (dayCount(d) > 3) errors.push({ code: `over-${d}`, message: `${d}: too many shifts. A day caps at 3 shifts (12h).` });
    });
    if (totalHours > HARD_CAP) {
      errors.push({ code: 'hard-cap', message: `Week totals ${totalHours}h — over the ${HARD_CAP}h weekly cap. Remove at least ${totalHours - HARD_CAP}h.` });
    }
    if (totalHours > OVERTIME_AT && totalHours <= HARD_CAP) {
      warnings.push({ code: 'overtime', message: `${totalHours}h exceeds the ${OVERTIME_AT}h overtime line. Confirm overtime is approved.` });
    } else if (totalHours > REGULAR_CAP && totalHours <= OVERTIME_AT) {
      warnings.push({ code: 'heavy', message: `${totalHours}h is a heavy week (regular target is ${REGULAR_CAP}h).` });
    }
    if (totalShifts > 0 && daysOff.length === 0) {
      warnings.push({ code: 'no-rest', message: 'No day off — 7 straight work days. Leave at least one rest day.' });
    }
    DAYS.forEach(d => {
      if (dayCount(d) === 3) warnings.push({ code: `long-${d}`, message: `${d}: triple shift is a 12-hour day. Confirm the member agreed.` });
    });
    // "Clopening": evening shift followed by a morning shift the next day
    DAYS.forEach((d, i) => {
      if (i >= 6) return;
      const eve = (sched[d] || []).includes('evening');
      const morn = (sched[DAYS[i + 1]] || []).includes('morning');
      if (eve && morn) warnings.push({ code: `clopen-${d}`, message: `${d} evening into ${DAYS[i + 1]} morning leaves a short overnight rest.` });
    });
    return { errors, warnings, daysOff: daysOff.length, daysOn: 7 - daysOff.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sched, totalShifts, totalHours, person?.id]);

  const showIssues = touched || isDirty;
  const statusTone = validation.errors.length > 0 ? 'error' : isDirty ? 'dirty' : saved ? 'saved' : 'ready';

  /* Central mutation: records undo history, marks member dirty, clears save flags */
  const mutateWeek = (memberId, updater, opts = {}) => {
    if (memberId == null) return;
    const before = sanitizeWeek(schedules[memberId]);
    const after = sanitizeWeek(updater(before));
    setHistory(h => [...h.slice(-19), { memberId, before }]);
    setSchedules(prev => ({ ...prev, [memberId]: after }));
    setDirtyIds(prev => new Set(prev).add(memberId));
    setTouched(true);
    setSaved(false);
    setSaveError('');
    if (opts.toast) toast.success(opts.toast);
  };

  const toggle = (day, shiftId) => {
    if (!selected) return;
    mutateWeek(selected, curr => {
      const list = curr[day] || [];
      return { ...curr, [day]: list.includes(shiftId) ? list.filter(s => s !== shiftId) : [...list, shiftId] };
    });
  };

  const clearDay = day => {
    if (!selected || (sched[day] || []).length === 0) return;
    mutateWeek(selected, curr => ({ ...curr, [day]: [] }), { toast: `${day} cleared.` });
  };

  const fillDay = day => {
    if (!selected) return;
    mutateWeek(selected, curr => ({ ...curr, [day]: ['morning', 'afternoon'] }), { toast: `${day} set to Morning + Afternoon.` });
  };

  const applyShiftPreset = type => {
    if (!selected) return;
    if (type === 'clear') { setShowPresets(false); setConfirmClear(true); return; }
    mutateWeek(selected, () => {
      const t = {};
      if (type === 'full-weekday')        DAYS.forEach((d, i) => { t[d] = i < 5 ? ['morning', 'afternoon'] : []; });
      else if (type === 'morning-only')   DAYS.forEach((d, i) => { t[d] = i < 5 ? ['morning'] : []; });
      else if (type === 'afternoon-only') DAYS.forEach((d, i) => { t[d] = i < 5 ? ['afternoon'] : []; });
      else if (type === 'evening-only')   DAYS.forEach((d, i) => { t[d] = i < 5 ? ['evening'] : []; });
      else if (type === 'weekend-only')   DAYS.forEach((d, i) => { t[d] = i >= 5 ? ['morning', 'afternoon'] : []; });
      else if (type === 'dup-mon')        { const m = sanitizeWeek(schedules[selected])['Mon'] || []; DAYS.forEach((d, i) => { t[d] = i < 5 ? [...m] : (sanitizeWeek(schedules[selected])[d] || []); }); }
      return t;
    }, { toast: 'Schedule template applied!' });
    setShowPresets(false);
  };

  const confirmClearAll = () => {
    if (!selected) return;
    const empty = Object.fromEntries(DAYS.map(d => [d, []]));
    mutateWeek(selected, () => empty, { toast: 'All shifts cleared. Saving is blocked until you add a shift.' });
    setConfirmClear(false);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last || last.memberId !== selected) { toast.info('Nothing to undo for this member.'); return; }
    setSchedules(prev => ({ ...prev, [last.memberId]: last.before }));
    setDirtyIds(prev => new Set(prev).add(last.memberId));
    setHistory(h => h.slice(0, -1));
    setSaved(false);
    setSaveError('');
    toast.info('Last change undone.');
  };

  const discardChanges = (memberId = selected) => {
    if (memberId == null) return;
    const fallback = savedSnapshot?.[memberId];
    setSchedules(prev => ({ ...prev, [memberId]: sanitizeWeek(fallback || buildDefault()) }));
    setDirtyIds(prev => { const n = new Set(prev); n.delete(memberId); return n; });
    setHistory(h => h.filter(e => e.memberId !== memberId));
    setSaved(false);
    setSaveError('');
    toast.info(`Unsaved changes discarded for ${teamUsers.find(u => u.id === memberId)?.name || 'member'}.`);
  };

  /* Guarded member switching: never silently drop unsaved work */
  const requestSelect = id => {
    if (id === selected) return;
    if (isDirty) { setPendingSelect(id); return; }
    setSelected(id);
    setSaveError('');
  };

  const cancelSwitch = () => setPendingSelect(null);

  const discardAndSwitch = () => {
    discardChanges(selected);
    setSelected(pendingSelect);
    setPendingSelect(null);
  };

  const saveAndSwitch = async () => {
    const ok = await save(true);
    if (ok) { setSelected(pendingSelect); setPendingSelect(null); }
  };

  const copyWeekToAll = () => {
    if (!selected || !person) return;
    const source = sanitizeWeek(schedules[selected]);
    teamUsers.forEach(u => { if (u.id !== selected) mutateWeek(u.id, () => ({ ...source })); });
    toast.success(`Copied ${person.name}'s week to ${teamUsers.length - 1} teammate(s). Review, then save each.`);
  };

  const save = async (silent = false) => {
    if (!selected || !person) return false;
    setTouched(true);
    if (validation.errors.length > 0) {
      const msg = validation.errors[0].message;
      setSaveError(msg);
      setSaved(false);
      if (!silent) {
        toast.error(msg);
        requestAnimationFrame(() => errorBoxRef.current?.focus());
      }
      return false;
    }
    setSaving(true);
    setSaveError('');
    try {
      await new Promise(r => setTimeout(r, 600));
      const snapshot = {};
      DAYS.forEach(d => { snapshot[d] = [...(schedules[selected]?.[d] || [])]; });
      const next = { ...(savedSnapshot || {}), [selected]: snapshot };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedSnapshot(next);
      setDirtyIds(prev => { const n = new Set(prev); n.delete(selected); return n; });
      setHistory(h => h.filter(e => e.memberId !== selected));
      setSaved(true);
      if (!silent) toast.success(`Shift schedule saved for ${person.name}! (${totalHours}h across ${totalShifts} shifts)`);
      setTimeout(() => setSaved(false), 3000);
      return true;
    } catch {
      const msg = 'Could not save right now (storage unavailable). Try again.';
      setSaveError(msg);
      if (!silent) toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /* Keyboard: arrows move through the template menu */
  const onPresetMenuKey = e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(presetsRef.current?.querySelectorAll('[role="menuitem"]') || []);
    if (items.length === 0) return;
    const i = items.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next]?.focus();
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
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-black flex items-center gap-2" style={{ color: C.txt }}>
            <Calendar className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
            Work Schedules &amp; Shift Rosters
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.txtMuted }}>
            Assign weekly shift duties. Tap a shift to toggle it — each shift is 4 hours, and changes stay unsaved until you press Save.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: C.pillBg, color: C.txtSec }}>
              <CalendarDays className="w-3 h-3" aria-hidden="true" />
              Week of {weekLabel}
            </span>
            {person && (
              <span
                role="status"
                className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{
                  background: statusTone === 'error' ? 'rgba(239,68,68,0.12)' : statusTone === 'dirty' ? 'rgba(245,158,11,0.12)' : statusTone === 'saved' ? 'rgba(16,185,129,0.12)' : C.pillBg,
                  color: statusTone === 'error' ? '#ef4444' : statusTone === 'dirty' ? '#f59e0b' : statusTone === 'saved' ? C.accent : C.txtSec,
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusTone === 'dirty' ? 'motion-safe:animate-pulse' : ''}`} style={{ background: 'currentColor' }} aria-hidden="true" />
                {statusTone === 'error' ? 'Needs attention' : statusTone === 'dirty' ? 'Unsaved changes' : statusTone === 'saved' ? 'All changes saved' : 'Up to date'}
              </span>
            )}
          </div>
        </div>

        {person && (
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0" role="toolbar" aria-label="Schedule actions">
            <div ref={presetsRef} className="relative">
              <button
                type="button"
                ref={presetsBtnRef}
                id="schedule-templates-btn"
                onClick={() => setShowPresets(v => !v)}
                aria-haspopup="menu"
                aria-expanded={showPresets}
                aria-controls="schedule-presets-menu"
                className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all hover:opacity-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                style={{ background: C.card, borderColor: C.inputBdr, color: C.txt }}
              >
                <span>Templates</span>
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
                  onKeyDown={onPresetMenuKey}
                  className="absolute right-0 top-[calc(100%+6px)] z-30 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl overflow-hidden"
                  style={{ background: C.card, borderColor: C.inputBdr }}
                >
                  <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${C.divider}` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Quick Presets</p>
                  </div>
                  <div className="p-1.5 space-y-0.5 max-h-72 overflow-y-auto custom-scrollbar">
                    {PRESET_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        role="menuitem"
                        onClick={() => applyShiftPreset(opt.key)}
                        className="w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
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
                      className="w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                      style={{ background: 'transparent', color: '#ef4444' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <p className="text-xs font-bold">Clear All Shifts</p>
                      <p className="text-[10px] opacity-70">Asks for confirmation first</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title={canUndo ? 'Undo last change' : 'Nothing to undo'}
              aria-label={canUndo ? 'Undo last change' : 'Nothing to undo'}
              className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              style={{ background: C.card, borderColor: C.inputBdr, color: C.txt }}
            >
              <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Undo</span>
            </button>

            <button
              type="button"
              onClick={() => discardChanges()}
              disabled={!isDirty}
              title={isDirty ? 'Discard unsaved changes' : 'No unsaved changes'}
              aria-label={isDirty ? 'Discard unsaved changes' : 'No unsaved changes to discard'}
              className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              style={{ background: C.card, borderColor: C.inputBdr, color: C.txt }}
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Discard</span>
            </button>

            <button
              type="button"
              id="save-shifts-btn"
              onClick={() => save()}
              disabled={saving || !isDirty}
              title={!isDirty && !saving ? 'No unsaved changes to save' : validation.errors.length > 0 ? 'Fix validation errors before saving' : 'Save shift schedule'}
              aria-label={saving ? 'Saving shift schedule' : saved ? 'Shift schedule saved' : `Save shift schedule for ${person.name}`}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-black text-white shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
              style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : saved ? <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{saving ? 'Saving…' : saved ? 'Saved!' : 'Save Shifts'}</span>
              {isDirty && !saving && (
                <span className="w-2 h-2 rounded-full bg-amber-400 motion-safe:animate-pulse" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* VALIDATION BANNERS */}
      {person && showIssues && validation.errors.length > 0 && (
        <div
          ref={errorBoxRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="sched-error-title"
          className="rounded-2xl border px-4 py-3 space-y-1.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.35)' }}
        >
          <p id="sched-error-title" className="text-xs font-black flex items-center gap-2" style={{ color: '#ef4444' }}>
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            Fix {validation.errors.length === 1 ? 'this issue' : `these ${validation.errors.length} issues`} before saving
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            {validation.errors.map(e => (
              <li key={e.code} className="text-xs font-medium" style={{ color: C.txt }}>{e.message}</li>
            ))}
          </ul>
          {saveError !== '' && <p className="text-xs font-bold" style={{ color: '#ef4444' }}>{saveError}</p>}
        </div>
      )}
      {person && showIssues && validation.warnings.length > 0 && (
        <div
          role="status"
          aria-label={`${validation.warnings.length} schedule warnings`}
          className="rounded-2xl border px-4 py-3 space-y-1.5"
          style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}
        >
          <p className="text-xs font-black flex items-center gap-2" style={{ color: '#d97706' }}>
            <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
            {validation.warnings.length === 1 ? 'Heads up' : `${validation.warnings.length} things to review`} — saving is still allowed
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            {validation.warnings.map(w => (
              <li key={w.code} className="text-xs font-medium" style={{ color: C.txtSec }}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SHIFT LEGEND */}
      <div
        className="flex gap-2 sm:gap-3 px-4 py-3 rounded-2xl overflow-x-auto"
        style={{ background: C.card, boxShadow: C.shadow }}
        role="list"
        aria-label="Shift time legend: three daily shifts, four hours each"
      >
        <span className="text-[10px] font-black uppercase tracking-widest self-center shrink-0" style={{ color: C.txtMuted }}>Shift Times:</span>
        {SHIFTS.map(sh => {
          const Icon = SHIFT_ICON[sh.id] || Clock;
          return (
            <span key={sh.id} role="listitem" className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0" style={{ background: sh.bg, color: sh.color }}>
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-black">{sh.label}</span>
              <span className="font-medium opacity-80 hidden md:inline">{sh.time}</span>
              <span className="font-medium opacity-80 md:hidden">4h</span>
            </span>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Roster panel - desktop / tablet */}
        <section aria-label="Team roster" className="hidden lg:flex lg:col-span-4 flex-col rounded-2xl overflow-hidden max-h-[720px]" style={{ background: C.card, boxShadow: C.shadow }}>
          <div className="p-3.5 space-y-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.divider}` }}>
            <div className="flex items-center justify-between">
              <p id="roster-heading" className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>
                Team Roster ({filteredTeam.length}/{teamUsers.length})
              </p>
              {dirtyIds.size > 0 && (
                <span className="text-[10px] font-black text-amber-500" role="status">{dirtyIds.size} unsaved</span>
              )}
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.txtMuted }} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={rosterQuery}
                onChange={e => setRosterQuery(e.target.value)}
                placeholder="Search name or specialty…"
                aria-label="Search team roster by name or specialty"
                className="w-full pl-9 pr-8 py-2.5 min-h-[44px] rounded-xl text-xs font-medium border focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                style={{ background: C.inputBg, borderColor: C.inputBdr, color: C.txt }}
              />
              {rosterQuery !== '' && (
                <button
                  type="button"
                  onClick={() => setRosterQuery('')}
                  aria-label="Clear roster search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  style={{ color: C.txtMuted }}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
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
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5" role="listbox" aria-labelledby="roster-heading">
            {filteredTeam.length === 0 && (
              <div className="text-center py-8 px-4">
                <p className="text-xs font-bold" style={{ color: C.txt }}>No team members found.</p>
                <p className="text-[11px] mt-1" style={{ color: C.txtMuted }}>Try a different search or role filter.</p>
                {(rosterQuery !== '' || roleFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => { setRosterQuery(''); setRoleFilter('all'); }}
                    className="mt-3 text-xs font-bold underline underline-offset-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                    style={{ color: C.accent }}
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
            {filteredTeam.map(u => {
              const isSel = selected === u.id;
              const meta  = ROLE_META[u.role] || ROLE_META.staff;
              const wk    = sanitizeWeek(schedules[u.id]);
              const hrs   = Object.values(wk).reduce((a, b) => a + b.length, 0) * HOURS_PER_SHIFT;
              const off   = DAYS.filter(d => (wk[d] || []).length === 0).length;
              const dirty = dirtyIds.has(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => requestSelect(u.id)}
                  aria-label={`${u.name}, ${u.specialty || u.role}, ${hrs} hours per week, ${off} days off${dirty ? ', has unsaved changes' : ''}`}
                  title={`${u.name} — ${hrs}h/week`}
                  className="w-full flex items-center gap-3 p-3 min-h-[60px] rounded-xl transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                  style={{ background: isSel ? `${C.accent}18` : 'transparent', borderLeft: `3px solid ${isSel ? C.accent : 'transparent'}` }}
                >
                  <Avatar name={u.name} gradient={meta.grad} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate flex items-center gap-1.5" style={{ color: C.txt }}>
                      <span className="truncate">{u.name}</span>
                      {dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 motion-safe:animate-pulse" aria-hidden="true" title="Unsaved changes" />}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: C.txtMuted }}>{u.specialty || u.role}</p>
                    <span className="flex items-center gap-1 mt-1" aria-hidden="true">
                      {DAYS.map(d => (
                        <span key={d} title={`${d}: ${(wk[d] || []).length * HOURS_PER_SHIFT}h`} className="w-2 h-2 rounded-full" style={{ background: (wk[d] || []).length > 0 ? C.accent : C.divider, opacity: (wk[d] || []).length > 0 ? 0.9 : 1 }} />
                      ))}
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: C.inner, color: hrs > OVERTIME_AT ? '#f59e0b' : hrs > 0 ? C.accent : C.txtMuted }}>{hrs}h</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Shift editor panel */}
        <section aria-label={person ? `Shift editor for ${person.name}` : 'Shift editor'} className="lg:col-span-8 rounded-2xl overflow-hidden flex flex-col" style={{ background: C.card, boxShadow: C.shadow }}>
          {/* Mobile / tablet member picker */}
          <div className="lg:hidden p-3.5 flex-shrink-0 space-y-2" style={{ borderBottom: `1px solid ${C.divider}` }}>
            <label htmlFor="mobile-schedule-member-select" className="text-[10px] font-black uppercase tracking-widest block" style={{ color: C.txtMuted }}>
              Select Team Member ({teamUsers.length})
            </label>
            <LuxurySelect
              id="mobile-schedule-member-select"
              aria-label="Select team member to schedule"
              value={selected}
              onChange={requestSelect}
              options={teamUsers.map(u => {
                const hrs = Object.values(sanitizeWeek(schedules[u.id])).reduce((a, b) => a + b.length, 0) * HOURS_PER_SHIFT;
                return {
                  value: u.id,
                  label: `${u.name}${dirtyIds.has(u.id) ? ' • unsaved' : ''}`,
                  description: `${u.specialty || u.role} - ${hrs} hrs/week`,
                  tag: `${hrs}h`,
                  tagColor: hrs > OVERTIME_AT ? '#f59e0b' : hrs > 0 ? '#10b981' : '#64748b',
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
              <div className="flex flex-col gap-3 p-4 sm:p-5 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between" style={{ borderBottom: `1px solid ${C.divider}` }}>
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={person.name} gradient={ROLE_META[person.role]?.grad} size={44} />
                  <div className="min-w-0">
                    <p className="font-black text-sm truncate" style={{ color: C.txt }}>{person.name}</p>
                    <p className="text-xs truncate" style={{ color: C.txtMuted }}>{person.specialty || person.role}</p>
                    <span className="mt-1 inline-block"><RolePill role={person.role} /></span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-5" role="status" aria-label={`${person.name}: ${totalShifts} shifts, ${totalHours} hours per week, ${validation.daysOff} days off`}>
                  {isDirty && (
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 motion-safe:animate-pulse" aria-hidden="true" />
                      Unsaved changes
                    </span>
                  )}
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Shifts</p>
                    <p className="text-base font-black" style={{ color: C.txt }}>{totalShifts}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Total Hrs</p>
                    <p className="text-base font-black" style={{ color: totalHours > OVERTIME_AT ? '#f59e0b' : C.accent }}>{totalHours}h</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.txtMuted }}>Days Off</p>
                    <p className="text-base font-black" style={{ color: validation.daysOff === 0 ? '#ef4444' : C.txt }}>{validation.daysOff}</p>
                  </div>
                </div>
              </div>

              {/* Day rows */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2">
                {DAYS.map((day, di) => {
                  const dayShifts = sched[day] || [];
                  const isWE      = di >= 5;
                  const dayHours  = dayShifts.length * HOURS_PER_SHIFT;
                  const dateNum   = weekDates[di]?.getDate();
                  const labelIdM  = `sched-day-m-${day}`;
                  const labelIdD  = `sched-day-d-${day}`;
                  return (
                    <div
                      key={day}
                      className="rounded-xl overflow-hidden border"
                      style={{
                        background: C.inner,
                        borderColor: dayShifts.length === 3 ? 'rgba(245,158,11,0.35)' : dayShifts.length === 0 ? C.divider : `${C.accent}30`,
                      }}
                    >
                      {/* Mobile card */}
                      <div className="sm:hidden p-3 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span id={labelIdM} className="text-sm font-black" style={{ color: isWE ? C.txtMuted : C.txt }}>
                              {day}{dateNum != null && <span className="font-medium opacity-70"> {dateNum}</span>}
                            </span>
                            {isWE && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ background: C.card, color: C.txtMuted }}>Weekend</span>}
                          </div>
                          <span className="text-[10px] font-bold shrink-0" style={{ color: dayHours > 0 ? C.accent : C.txtMuted }} aria-live="off">
                            {dayHours > 0 ? `${dayHours}h` : 'Day off'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5" role="group" aria-labelledby={labelIdM}>
                          {SHIFTS.map(sh => {
                            const active = dayShifts.includes(sh.id);
                            const Icon = SHIFT_ICON[sh.id] || Clock;
                            return (
                              <button
                                key={sh.id}
                                type="button"
                                onClick={() => toggle(day, sh.id)}
                                aria-pressed={active}
                                aria-label={`${day} ${sh.label}, ${sh.time}: ${active ? 'assigned, activate to remove' : 'not assigned, activate to add'}`}
                                className="relative flex flex-col items-center gap-1 py-3 px-1 min-h-[64px] rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                                style={{
                                  background: active ? sh.bg : C.card,
                                  color: active ? sh.color : C.txtMuted,
                                  outline: active ? `2px solid ${sh.color}55` : 'none',
                                  boxShadow: active ? `0 2px 8px ${sh.color}25` : 'none',
                                }}
                              >
                                {active && (
                                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: sh.color }} aria-hidden="true">
                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                                  </span>
                                )}
                                <Icon className="w-5 h-5" aria-hidden="true" />
                                <span className="font-black">{sh.label}</span>
                                <span className="opacity-70 text-[9px]">{active ? `${HOURS_PER_SHIFT}h` : 'Off'}</span>
                              </button>
                            );
                          })}
                        </div>
                        {dayHours > 0 ? (
                          <button
                            type="button"
                            onClick={() => clearDay(day)}
                            aria-label={`Clear all ${day} shifts (mark day off)`}
                            className="w-full text-[10px] font-bold py-2 min-h-[36px] rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                            style={{ color: C.txtMuted }}
                          >
                            Clear {day} — mark day off
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fillDay(day)}
                            aria-label={`Set ${day} to Morning plus Afternoon`}
                            className="w-full text-[10px] font-bold py-2 min-h-[36px] rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                            style={{ color: C.accent }}
                          >
                            Fill {day} — Morning + Afternoon
                          </button>
                        )}
                      </div>

                      {/* Desktop row */}
                      <div
                        className="hidden sm:grid items-center gap-2 px-3 py-2"
                        style={{ gridTemplateColumns: '4.5rem 1fr 1fr 1fr' }}
                        role="group"
                        aria-labelledby={labelIdD}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span id={labelIdD} className="text-xs font-black" style={{ color: isWE ? C.txtMuted : C.txt }}>
                            {day}{dateNum != null && <span className="font-medium opacity-60"> {dateNum}</span>}
                          </span>
                          <span className="text-[9px] font-bold" style={{ color: dayHours > 0 ? C.accent : C.txtMuted }}>
                            {dayHours > 0 ? `${dayHours}h` : 'Day off'}
                          </span>
                          {dayHours > 0 ? (
                            <button
                              type="button"
                              onClick={() => clearDay(day)}
                              aria-label={`Clear all ${day} shifts`}
                              title={`Clear ${day}`}
                              className="self-start text-[9px] font-bold underline underline-offset-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                              style={{ color: C.txtMuted }}
                            >
                              Clear
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fillDay(day)}
                              aria-label={`Set ${day} to Morning plus Afternoon`}
                              title={`Fill ${day} (Morning + Afternoon)`}
                              className="self-start text-[9px] font-bold underline underline-offset-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                              style={{ color: C.accent }}
                            >
                              Fill M+A
                            </button>
                          )}
                        </div>
                        {SHIFTS.map(sh => {
                          const active = dayShifts.includes(sh.id);
                          const Icon = SHIFT_ICON[sh.id] || Clock;
                          return (
                            <button
                              key={sh.id}
                              type="button"
                              onClick={() => toggle(day, sh.id)}
                              aria-pressed={active}
                              aria-label={`${day} ${sh.label}, ${sh.time}: ${active ? 'assigned' : 'not assigned'}`}
                              title={`${day} ${sh.label} (${sh.time})`}
                              className="relative flex flex-col items-center gap-0.5 px-2 py-2.5 min-h-[64px] rounded-xl text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                              style={{
                                background: active ? sh.bg : C.card,
                                color: active ? sh.color : C.txtMuted,
                                outline: active ? `1.5px solid ${sh.color}60` : 'none',
                                boxShadow: active ? `0 2px 10px ${sh.color}25` : 'none',
                              }}
                            >
                              {active && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: sh.color }} aria-hidden="true">
                                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                                </span>
                              )}
                              <Icon className="w-4 h-4" aria-hidden="true" />
                              <span className="text-[10px] font-black">{sh.label}</span>
                              <span className="text-[8px] opacity-70">{active ? `${sh.time} · ${HOURS_PER_SHIFT}h` : 'Off'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary footer */}
              <div className="flex-shrink-0 px-4 sm:px-5 py-3.5 space-y-2.5" style={{ borderTop: `1px solid ${C.divider}`, background: C.inner }}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {SHIFTS.map(sh => {
                    const cnt = DAYS.filter(d => (sched[d] || []).includes(sh.id)).length;
                    return (
                      <span key={sh.id} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sh.color }} aria-hidden="true" />
                        <span className="font-bold" style={{ color: sh.color }}>{sh.label}</span>
                        <span style={{ color: C.txtMuted }}>{cnt}d · {cnt * HOURS_PER_SHIFT}h</span>
                      </span>
                    );
                  })}
                  <span className="ml-auto text-xs font-black" style={{ color: totalHours > OVERTIME_AT ? '#f59e0b' : C.accent }}>
                    {totalHours} hrs / week{validation.daysOff > 0 && <span className="font-medium" style={{ color: C.txtMuted }}> · {validation.daysOff} off</span>}
                  </span>
                </div>
                {/* Weekly load vs 48h overtime line */}
                <div>
                  <div
                    role="progressbar"
                    aria-label={`Weekly load: ${totalHours} of ${OVERTIME_AT} regular hours`}
                    aria-valuemin={0}
                    aria-valuemax={OVERTIME_AT}
                    aria-valuenow={Math.min(totalHours, OVERTIME_AT)}
                    aria-valuetext={`${totalHours} hours out of a ${OVERTIME_AT}-hour overtime line`}
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: C.divider }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (totalHours / OVERTIME_AT) * 100)}%`,
                        background: totalHours > HARD_CAP ? '#ef4444' : totalHours > OVERTIME_AT ? '#f59e0b' : 'linear-gradient(90deg,#059669,#34d399)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-bold" style={{ color: C.txtMuted }}>0h</span>
                    <span className="text-[9px] font-bold" style={{ color: C.txtMuted }}>Regular ≤ {REGULAR_CAP}h · Overtime line {OVERTIME_AT}h · Cap {HARD_CAP}h</span>
                  </div>
                </div>
                {teamUsers.length > 1 && (
                  <button
                    type="button"
                    onClick={copyWeekToAll}
                    aria-label={`Copy ${person.name}'s week to all ${teamUsers.length - 1} other team members (you can undo)`}
                    title="Copy this week to the whole team"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl text-[11px] font-bold border cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                    style={{ background: C.card, borderColor: C.inputBdr, color: C.txtSec }}
                  >
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    Copy this week to all team ({teamUsers.length - 1})
                  </button>
                )}
              </div>
              {/* Screen-reader live summary */}
              <p className="sr-only" role="status" aria-live="polite">
                {person.name}: {totalShifts} shifts, {totalHours} hours per week, {validation.daysOff} days off.
                {validation.errors.length > 0 ? ` ${validation.errors.length} blocking issues.` : ' No blocking issues.'}
                {isDirty ? ' Unsaved changes.' : ' All changes saved.'}
              </p>
            </>
          )}
        </section>
      </div>

      {/* Sticky mobile action bar: save is never out of reach on small screens */}
      {person && isDirty && (
        <div
          className="lg:hidden sticky bottom-3 z-20 flex items-center gap-2 rounded-2xl border px-3 py-2.5 shadow-2xl"
          style={{ background: C.card, borderColor: C.inputBdr }}
          role="toolbar"
          aria-label="Unsaved schedule actions"
        >
          <p className="flex-1 min-w-0 text-[11px] font-bold truncate" style={{ color: C.txtSec }}>
            {totalHours}h · {validation.errors.length > 0 ? `${validation.errors.length} issue(s) to fix` : 'ready to save'}
          </p>
          <button
            type="button"
            onClick={() => discardChanges()}
            aria-label="Discard unsaved changes"
            className="px-3 py-2 min-h-[40px] rounded-xl text-[11px] font-bold border cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            style={{ background: 'transparent', borderColor: C.inputBdr, color: C.txtSec }}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            aria-label={saving ? 'Saving' : `Save ${person.name}'s schedule`}
            className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-[11px] font-black text-white cursor-pointer disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
            style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {/* Guard: switching member with unsaved changes */}
      {pendingSelect !== null && pendingSelect !== undefined && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sched-switch-title"
          aria-describedby="sched-switch-desc"
        >
          <div className="absolute inset-0 bg-black/60" onClick={cancelSwitch} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-2xl border p-5 space-y-3 shadow-2xl" style={{ background: C.card, borderColor: C.inputBdr }}>
            <p id="sched-switch-title" className="text-sm font-black" style={{ color: C.txt }}>Unsaved changes</p>
            <p id="sched-switch-desc" className="text-xs" style={{ color: C.txtSec }}>
              {person?.name} has unsaved shift changes. Save them, discard them, or stay and keep editing.
            </p>
            {validation.errors.length > 0 && (
              <p className="text-[11px] font-bold" style={{ color: '#ef4444' }}>
                Note: this week has {validation.errors.length} blocking issue(s), so “Save & switch” will be blocked until fixed.
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                ref={modalCancelRef}
                onClick={cancelSwitch}
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                style={{ background: C.inner, borderColor: C.inputBdr, color: C.txt }}
              >
                Keep editing {person?.name?.split(' ')[0]}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={discardAndSwitch}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                  style={{ background: 'transparent', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={saveAndSwitch}
                  disabled={saving}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-black text-white cursor-pointer disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
                  style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}
                >
                  {saving ? 'Saving…' : 'Save & switch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guard: clearing a whole week needs explicit confirmation */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sched-clear-title"
          aria-describedby="sched-clear-desc"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmClear(false)} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-2xl border p-5 space-y-3 shadow-2xl" style={{ background: C.card, borderColor: C.inputBdr }}>
            <p id="sched-clear-title" className="text-sm font-black flex items-center gap-2" style={{ color: '#ef4444' }}>
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              Clear all shifts?
            </p>
            <p id="sched-clear-desc" className="text-xs" style={{ color: C.txtSec }}>
              This removes every shift for {person?.name || 'this member'} ({totalHours}h). Saving stays blocked until you add at least one shift back. You can undo right after.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                ref={modalCancelRef}
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                style={{ background: C.inner, borderColor: C.inputBdr, color: C.txt }}
              >
                Keep shifts
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-black text-white cursor-pointer focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none"
                style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
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

  const QUEUE_KEY = 'cb_therapist_queue_v1';
  const [queue, setQueue] = useState(() => therapists.map((t, i) => ({ ...t, position: i + 1, sessions: 0, paused: false })));
  const [queueFilter, setQueueFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({ bookingType: 'walk-in', service: '', clientName: '', notes: '' });
  const [dispatchError, setDispatchError] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Hydrate persisted rotation once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved?.order) && saved.order.length) {
        setQueue(prev => {
          const base = therapists.length ? therapists : prev;
          const byId = new Map(base.map(t => [String(t.id), t]));
          const ordered = saved.order.map(o => {
            const t = byId.get(String(o.id));
            if (!t) return null;
            return { ...t, sessions: Number(o.sessions) || 0, paused: !!o.paused };
          }).filter(Boolean);
          // append any new therapists not in saved order
          base.forEach(t => { if (!ordered.find(q => String(q.id) === String(t.id))) ordered.push({ ...t, sessions: 0, paused: false }); });
          return ordered.map((t, i) => ({ ...t, position: i + 1 }));
        });
        if (Array.isArray(saved?.history)) setHistory(saved.history.slice(0, 8));
      }
    } catch { /* ignore corrupt cache */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merge new therapists, persist rotation
  useEffect(() => {
    setQueue(prev => {
      const map = new Map(prev.map(p => [String(p.id), p]));
      const merged = therapists.map((t, i) => ({
        ...t,
        position: i + 1,
        sessions: map.get(String(t.id))?.sessions || 0,
        paused: map.get(String(t.id))?.paused || false,
      }));
      // keep manual order when lengths match
      if (prev.length === therapists.length && prev.every(p => map.has(String(p.id)))) {
        const ordered = prev.map(p => {
          const fresh = therapists.find(x => String(x.id) === String(p.id));
          return fresh ? { ...fresh, sessions: p.sessions || 0, paused: !!p.paused } : null;
        }).filter(Boolean);
        return ordered.map((t, i) => ({ ...t, position: i + 1 }));
      }
      return merged;
    });
  }, [therapists]);

  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify({
        order: queue.map(q => ({ id: q.id, sessions: q.sessions, paused: !!q.paused })),
        history: history.slice(0, 8),
        updatedAt: new Date().toISOString(),
      }));
    } catch { /* storage unavailable */ }
  }, [queue, history]);

  const activeRotation = useMemo(() => queue.filter(t => !t.paused), [queue]);

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
    if (idx <= 0) { toast.info('Already at the top of the queue.'); return; }
    setQueue(prev => {
      if (idx < 0 || idx >= prev.length) return prev;
      const target = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      toast.success(`${target.name} promoted to Next Up!`);
      return [target, ...rest].map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const sendToEnd = (idx) => {
    if (idx === queue.length - 1) { toast.info('Already at the end of the queue.'); return; }
    setQueue(prev => {
      if (idx < 0 || idx >= prev.length) return prev;
      const target = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      toast.info(`${target.name} moved to the end of the queue.`);
      return [...rest, target].map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const skipTurn = (idx) => {
    if (queue.length < 2) { toast.info('Nothing to skip — only one therapist in queue.'); return; }
    setQueue(prev => {
      if (idx < 0 || idx >= prev.length) return prev;
      const target = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      const insertAt = Math.min(idx + 1, rest.length);
      const next = [...rest.slice(0, insertAt), target, ...rest.slice(insertAt)];
      toast.info(`${target.name}'s turn skipped — moved down one spot.`);
      return next.map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const togglePause = (id) => {
    setQueue(prev => prev.map(t => {
      if (String(t.id) !== String(id)) return t;
      const paused = !t.paused;
      toast.info(paused ? `${t.name} paused — skipped in auto rotation.` : `${t.name} resumed in rotation.`);
      return { ...t, paused };
    }));
  };

  const openDispatch = (t) => {
    if (!t) return;
    if (t.paused) { toast.info(`${t.name} is paused. Resume before dispatching.`); return; }
    if (activeRotation.length === 0) { toast.info('All therapists are paused. Resume at least one to dispatch.'); return; }
    setDispatchTarget(t);
    setDispatchForm({ bookingType: 'walk-in', service: '', clientName: '', notes: '' });
    setDispatchError('');
  };

  const closeDispatch = () => {
    if (dispatching) return;
    setDispatchTarget(null);
    setDispatchError('');
  };

  const confirmDispatch = () => {
    // ── validation ──
    if (!dispatchTarget) return;
    if (!dispatchForm.service.trim()) { setDispatchError('Please select a service before dispatching.'); return; }
    if (dispatchForm.bookingType === 'walk-in' && !dispatchForm.clientName.trim()) {
      setDispatchError('Please enter a walk-in guest name (or switch to booked appointment).');
      return;
    }
    if (dispatchForm.notes.trim().length > 240) { setDispatchError('Notes must be under 240 characters.'); return; }
    setDispatchError('');
    setDispatching(true);
    // simulate atomic dispatch + rotate
    setTimeout(() => {
      setQueue(prev => {
        const target = prev.find(t => String(t.id) === String(dispatchTarget.id));
        if (!target) return prev;
        const rest = prev.filter(t => String(t.id) !== String(dispatchTarget.id));
        return [...rest, { ...target, sessions: (target.sessions || 0) + 1 }].map((t, i) => ({ ...t, position: i + 1 }));
      });
      setHistory(prev => [{
        id: `${Date.now()}`,
        therapistId: dispatchTarget.id,
        therapistName: dispatchTarget.name,
        service: dispatchForm.service.trim(),
        bookingType: dispatchForm.bookingType,
        clientName: dispatchForm.clientName.trim() || '—',
        at: new Date().toISOString(),
      }, ...prev].slice(0, 8));
      setDispatching(false);
      setDispatchTarget(null);
      toast.success(`Session dispatched to ${dispatchTarget.name}. Rotated to end of queue.`);
    }, 450);
  };

  const undoLast = () => {
    const last = history[0];
    if (!last) { toast.info('No dispatch to undo.'); return; }
    setQueue(prev => {
      const target = prev.find(t => String(t.id) === String(last.therapistId));
      if (!target) return prev;
      const rest = prev.filter(t => String(t.id) !== String(last.therapistId));
      return [{ ...target, sessions: Math.max(0, (target.sessions || 1) - 1) }, ...rest]
        .map((t, i) => ({ ...t, position: i + 1 }));
    });
    setHistory(prev => prev.slice(1));
    toast.info(`Undid dispatch to ${last.therapistName} — restored to front.`);
  };

  const resetRotation = () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); return; }
    setQueue(prev => prev.map(t => ({ ...t, sessions: 0, paused: false })));
    setHistory([]);
    try { localStorage.removeItem(QUEUE_KEY); } catch {}
    setConfirmReset(false);
    toast.success('Queue rotation reset — counts cleared.');
  };

  const resetCount = id => {
    setQueue(prev => prev.map(t => String(t.id) === String(id) ? { ...t, sessions: 0 } : t));
    toast.info('Session count reset.');
  };

  const queueFilterOptions = [
    { value: 'all',       label: `All Active Queue (${queue.length})` },
    { value: 'available', label: `Available Only (${activeRotation.length})` },
    { value: 'next',      label: 'Next Up Only (#1)' },
    { value: 'served',    label: `Served Today (${queue.filter(t => t.sessions > 0).length})` },
    { value: 'paused',    label: `Paused (${queue.filter(t => t.paused).length})` },
  ];

  const filteredQueue = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = queue;
    if (queueFilter === 'next') base = activeRotation.slice(0, 1);
    else if (queueFilter === 'served') base = queue.filter(t => t.sessions > 0);
    else if (queueFilter === 'available') base = activeRotation;
    else if (queueFilter === 'paused') base = queue.filter(t => t.paused);
    if (!q) return base;
    return base.filter(t => (t.name || '').toLowerCase().includes(q) || (t.specialty || '').toLowerCase().includes(q));
  }, [queue, queueFilter, search, activeRotation]);

  const totalServed = queue.reduce((s, t) => s + (t.sessions || 0), 0);
  const servedCount = queue.filter(t => t.sessions > 0).length;
  const nextUp = activeRotation[0] || null;

  // Escape closes dispatch modal
  useEffect(() => {
    if (!dispatchTarget) return;
    const onKey = (e) => { if (e.key === 'Escape') closeDispatch(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatchTarget, dispatching]);

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full overflow-x-clip">

      {/* Header — stacks on mobile, inline on desktop */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2" style={{ color: C.txt }}>
              <span className="inline-flex w-8 h-8 rounded-xl items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#059669,#0a5f3c)' }}>
                <ListOrdered className="w-4 h-4 text-white" />
              </span>
              <span className="truncate">Therapist Queue &amp; Rotation</span>
            </h2>
            <p className="text-[11px] sm:text-xs mt-1 font-medium" style={{ color: C.txtMuted }}>
              Fair dispatch scheduling &amp; walk-in rotation for active therapists
              {nextUp ? <span> · <strong style={{ color: C.accent }}>Next: {nextUp.name}</strong></span> : null}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button" onClick={undoLast} disabled={history.length === 0}
              title="Undo last dispatch" aria-label="Undo last dispatch"
              className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl text-[11px] font-bold border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              style={{ background: C.card, borderColor: C.inputBdr, color: C.txt }}
            >
              <Undo2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              type="button" onClick={resetRotation}
              title="Reset rotation counts" aria-label="Reset rotation counts"
              className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl text-[11px] font-bold border transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              style={{
                background: confirmReset ? 'rgba(239,68,68,0.14)' : C.card,
                borderColor: confirmReset ? 'rgba(239,68,68,0.4)' : C.inputBdr,
                color: confirmReset ? '#ef4444' : C.txt,
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> {confirmReset ? 'Confirm reset?' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Toolbar: search + filter — full width on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: C.txtMuted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search therapist or specialty…"
              aria-label="Search therapist queue"
              className="w-full min-h-[44px] rounded-xl pl-9 pr-9 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-emerald-500"
              style={{ background: C.card, border: `1px solid ${C.inputBdr}`, color: C.txt }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                style={{ background: C.inner, color: C.txtMuted }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="w-full">
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
      </div>

      {/* Summary Stats — 1 col on tiny screens, 3 cols on sm+ */}
      {queue.length > 0 && (
        <div
          role="status" aria-label="Queue summary"
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl"
          style={{
            background: C.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
            border: `1px solid ${C.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          }}
        >
          {[
            { label: 'In Rotation',    value: activeRotation.length, icon: Users,      color: C.accent,  bg: `${C.accent}18`, hint: `${queue.filter(t => t.paused).length} paused` },
            { label: 'Served Today',   value: servedCount,           icon: BadgeCheck, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', hint: `${totalServed} sessions` },
            { label: 'Total Sessions', value: totalServed,           icon: Activity,   color: '#0284c7', bg: 'rgba(2,132,199,0.12)', hint: history[0] ? `Last: ${history[0].therapistName}` : 'No dispatches yet' },
          ].map(s => (
            <div key={s.label} className="flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-0.5 py-2.5 px-3 rounded-xl" style={{ background: s.bg }}>
              <s.icon className="w-4 h-4 sm:hidden flex-shrink-0" style={{ color: s.color }} />
              <span className="text-xl sm:text-2xl font-black tabular-nums leading-none" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight sm:text-center" style={{ color: C.txtMuted }}>
                {s.label} <span className="normal-case font-medium opacity-80 hidden sm:block">{s.hint}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Queue Cards — 1 col mobile, 2 col on wide screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 items-start" role="list" aria-label="Therapist rotation queue">
        {filteredQueue.map((t) => {
          const realIdx = queue.findIndex(q => String(q.id) === String(t.id));
          const isFirst = !t.paused && nextUp && String(nextUp.id) === String(t.id);
          const isPaused = !!t.paused;
          const queueActions = [
            { type: 'header', label: `${t.name} Dispatch` },
            { label: 'Assign Session & Rotate',    icon: Zap,        onClick: () => openDispatch(t), disabled: isPaused },
            { label: isPaused ? 'Resume in Rotation' : 'Pause Rotation', icon: isPaused ? Play : Pause, onClick: () => togglePause(t.id) },
            { label: 'Skip Turn (down 1)',        icon: SkipForward, disabled: queue.length < 2, onClick: () => skipTurn(realIdx) },
            { label: 'Promote to Next Up (#1)',     icon: Crown,      disabled: isFirst || realIdx <= 0, onClick: () => moveToTop(realIdx) },
            { label: 'Move Up in Queue',            icon: ChevronUp,  disabled: realIdx === 0, onClick: () => swap(realIdx, -1) },
            { label: 'Move Down in Queue',          icon: ChevronDown,disabled: realIdx === queue.length - 1, onClick: () => swap(realIdx, 1) },
            { label: 'Send to End of Queue',        icon: RotateCcw,  onClick: () => sendToEnd(realIdx) },
            { label: 'Reset Served Session Count',  icon: RefreshCw,  onClick: () => resetCount(t.id) },
            { type: 'divider' },
            { label: 'View Schedule Shifts', icon: Calendar, onClick: () => onSelectTab && onSelectTab('schedules', t.id) },
          ];

          return (
            <motion.article
              key={t.id}
              layout
              role="listitem"
              aria-label={`Queue position ${t.position}: ${t.name}${isPaused ? ' (paused)' : ''}${isFirst ? ' (next up)' : ''}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: isPaused ? 0.72 : 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-emerald-500"
              style={{
                background: isFirst
                  ? (C.isDark
                      ? 'linear-gradient(145deg,rgba(5,150,105,0.20),rgba(5,150,105,0.07))'
                      : 'linear-gradient(145deg,rgba(5,150,105,0.10),rgba(255,255,255,1))')
                  : C.card,
                border: isFirst
                  ? `2px solid ${C.accent}66`
                  : `1px solid ${C.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                boxShadow: isFirst ? `0 8px 32px ${C.accent}26` : C.shadow,
                outline: isPaused ? `1px dashed ${C.txtMuted}55` : 'none',
              }}
            >
              {/* Status strip */}
              <div className="flex items-center gap-2 px-3 sm:px-4 pt-3 pb-1 flex-wrap" aria-live="polite">
                {isFirst ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full" style={{ background: C.accent, color: '#fff' }}>
                      ✦ Next Up
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: C.accent }}>Dispatch for the next walk-in</span>
                  </>
                ) : isPaused ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full" style={{ background: 'rgba(148,163,184,0.18)', color: C.txtMuted }}>
                      <Pause className="w-3 h-3" /> Paused
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: C.txtMuted }}>Skipped in auto rotation</span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: C.txtMuted }}>
                    <Timer className="w-3 h-3" /> Position #{t.position} · waiting
                  </span>
                )}
              </div>

              <div className="p-3 sm:p-4 flex flex-col gap-3">
                {/* Identity row — wraps on small screens */}
                <div className="flex items-start sm:items-center gap-3">
                  {/* Position badge */}
                  <div
                    aria-hidden
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
                    style={{
                      background: isFirst ? 'linear-gradient(135deg,#059669,#0a5f3c)' : isPaused ? C.inner : 'linear-gradient(135deg,rgba(5,150,105,0.16),rgba(5,150,105,0.06))',
                      color: isFirst ? '#fff' : isPaused ? C.txtMuted : C.accent,
                      border: isFirst ? 'none' : `1px solid ${C.accent}33`,
                    }}
                  >
                    #{t.position}
                  </div>

                  <div className="relative flex-shrink-0">
                    <Avatar name={t.name} gradient={ROLE_META[t.role]?.grad} size={44} />
                    <span title={isPaused ? 'Paused' : 'Available'}
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isPaused ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}
                      style={{ borderColor: C.card }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-black truncate" style={{ color: C.txt }}>{t.name}</p>
                      {t.sessions > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(139,92,246,0.14)', color: '#8b5cf6' }}>
                          {t.sessions} served
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 font-medium truncate" style={{ color: C.txtMuted }}>
                      {t.specialty || 'General Therapist'}
                    </p>
                    <p className="text-[10px] mt-0.5 font-semibold" style={{ color: isPaused ? C.txtMuted : C.accent }}>
                      {isPaused ? 'Paused — will be skipped' : isFirst ? 'Ready for next guest' : `${realIdx} ahead in line`}
                    </p>
                  </div>
                </div>

                {/* Controls row — wraps, min 40px targets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1" role="group" aria-label={`Reorder ${t.name}`}>
                    <button
                      onClick={() => swap(realIdx, -1)}
                      disabled={realIdx === 0}
                      title="Move Up"
                      aria-label={`Move ${t.name} up in queue`}
                      className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      style={{ background: C.inner, color: C.txtSec }}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => swap(realIdx, 1)}
                      disabled={realIdx === queue.length - 1}
                      title="Move Down"
                      aria-label={`Move ${t.name} down in queue`}
                      className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      style={{ background: C.inner, color: C.txtSec }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => skipTurn(realIdx)}
                      disabled={queue.length < 2}
                      title="Skip turn (move down one)"
                      aria-label={`Skip ${t.name}'s turn`}
                      className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      style={{ background: C.inner, color: C.txtSec }}
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => togglePause(t.id)}
                      title={isPaused ? 'Resume' : 'Pause'}
                      aria-label={isPaused ? `Resume ${t.name}` : `Pause ${t.name}`}
                      aria-pressed={isPaused}
                      className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      style={{ background: isPaused ? 'rgba(5,150,105,0.14)' : C.inner, color: isPaused ? C.accent : C.txtSec }}
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="ms-auto">
                    <LuxuryDropdownMenu
                      trigger={
                        <button
                          type="button"
                          className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          style={{ background: C.inner }}
                          aria-label={`More queue options for ${t.name}`}
                          aria-haspopup="menu"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                      items={queueActions}
                      menuWidth={240}
                      align="right"
                      isDark={C.isDark}
                    />
                  </div>
                </div>

                {/* Assign & Rotate CTA — min 48px target, validated modal */}
                <button
                  onClick={() => openDispatch(t)}
                  disabled={isPaused}
                  aria-label={isPaused ? `${t.name} is paused` : `Assign session to ${t.name} and rotate queue`}
                  className="w-full flex items-center justify-center gap-2 min-h-[48px] py-3 px-4 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
                  style={{
                    background: isFirst
                      ? 'linear-gradient(135deg,#059669 0%,#047857 100%)'
                      : isPaused
                        ? 'linear-gradient(135deg,#64748b,#475569)'
                        : `linear-gradient(135deg,${C.isDark ? '#1d4ed8' : '#1565c0'} 0%,${C.isDark ? '#1e3a8a' : '#0d47a1'} 100%)`,
                    boxShadow: isFirst
                      ? '0 4px 16px rgba(5,150,105,0.35)'
                      : '0 4px 14px rgba(21,101,192,0.28)',
                  }}
                >
                  <Zap className="w-4 h-4 flex-shrink-0" aria-hidden />
                  <span>{isPaused ? 'Paused — Resume to Assign' : isFirst ? 'Assign & Rotate — Next Up' : 'Assign & Rotate'}</span>
                </button>
              </div>
            </motion.article>
          );
        })}

        {/* Empty State */}
        {filteredQueue.length === 0 && (
          <div
            className="col-span-full flex flex-col items-center justify-center py-14 sm:py-16 px-6 text-center rounded-2xl gap-3"
            style={{
              background: C.card,
              border: `1px dashed ${C.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
            }}
            role="status"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: C.inner }}>
              <ListOrdered className="w-7 h-7" style={{ color: C.txtMuted }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: C.txt }}>
                {search ? `No match for “${search}”` : 'No therapists in this view'}
              </p>
              <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: C.txtMuted }}>
                {search
                  ? 'Try a different name or specialty, or clear the search.'
                  : queueFilter === 'served'
                    ? 'No sessions have been dispatched today yet.'
                    : queueFilter === 'paused'
                      ? 'Nobody is paused. Paused therapists will appear here.'
                      : 'All therapists are either inactive or not available.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {search && (
                <button onClick={() => setSearch('')} className="text-xs font-bold px-4 min-h-[40px] rounded-xl transition-all active:scale-95 cursor-pointer" style={{ background: C.inner, color: C.accent }}>
                  Clear Search
                </button>
              )}
              {queueFilter !== 'all' && (
                <button
                  onClick={() => setQueueFilter('all')}
                  className="text-xs font-bold px-4 min-h-[40px] rounded-xl transition-all active:scale-95 cursor-pointer"
                  style={{ background: C.inner, color: C.accent }}
                >
                  Show All Queue
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent dispatch history */}
      {history.length > 0 && (
        <section aria-label="Recent dispatches" className="rounded-2xl p-3 sm:p-4" style={{ background: C.card, border: C.cardBorder, boxShadow: C.shadow }}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: C.txt }}>
              <History className="w-3.5 h-3.5" style={{ color: C.accent }} /> Recent Dispatches
            </h3>
            <button onClick={undoLast} className="text-[11px] font-bold inline-flex items-center gap-1 px-2.5 min-h-[36px] rounded-lg cursor-pointer" style={{ background: C.inner, color: C.accent }}>
              <Undo2 className="w-3 h-3" /> Undo last
            </button>
          </div>
          <ul className="divide-y" style={{ borderColor: C.divider }}>
            {history.slice(0, 5).map(h => (
              <li key={h.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 text-xs" style={{ borderColor: C.divider }}>
                <span className="font-bold truncate" style={{ color: C.txt }}>{h.therapistName}</span>
                <span className="inline-flex items-center gap-1 font-medium" style={{ color: C.txtMuted }}>
                  <ClipboardList className="w-3 h-3" /> {h.service} · {h.bookingType === 'walk-in' ? `Walk-in (${h.clientName})` : 'Booked'}
                </span>
                <span className="sm:ms-auto text-[10px] font-medium tabular-nums" style={{ color: C.txtMuted }}>
                  {new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Dispatch confirm modal — validated */}
      <AnimatePresence>
        {dispatchTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={closeDispatch}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              role="dialog" aria-modal="true" aria-labelledby="dispatch-title"
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-2xl p-4 sm:p-5"
              style={{ background: C.card, border: C.cardBorder, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            >
              <div className="flex items-start gap-3">
                <Avatar name={dispatchTarget.name} gradient={ROLE_META[dispatchTarget.role]?.grad} size={44} />
                <div className="min-w-0 flex-1">
                  <h3 id="dispatch-title" className="text-sm font-black" style={{ color: C.txt }}>
                    Dispatch to {dispatchTarget.name}?
                  </h3>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: C.txtMuted }}>
                    #{dispatchTarget.position} in queue · {dispatchTarget.specialty || 'General Therapist'} · {dispatchTarget.sessions || 0} served today
                  </p>
                </div>
                <button onClick={closeDispatch} disabled={dispatching} aria-label="Close dispatch dialog"
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer disabled:opacity-40" style={{ background: C.inner, color: C.txtSec }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-3 mt-4">
                <FormField label="Booking type" required>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Booking type">
                    {[{ v: 'walk-in', label: 'Walk-in' }, { v: 'booked', label: 'Booked appt' }].map(o => (
                      <button key={o.v} type="button" role="radio" aria-checked={dispatchForm.bookingType === o.v}
                        onClick={() => setDispatchForm(f => ({ ...f, bookingType: o.v }))}
                        className="min-h-[44px] rounded-xl text-xs font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        style={{
                          background: dispatchForm.bookingType === o.v ? `${C.accent}1a` : C.inner,
                          borderColor: dispatchForm.bookingType === o.v ? C.accent : C.inputBdr,
                          color: dispatchForm.bookingType === o.v ? C.accent : C.txtSec,
                        }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Service" required error={dispatchError && !dispatchForm.service.trim() ? dispatchError : undefined}>
                  <select
                    value={dispatchForm.service}
                    onChange={e => { setDispatchForm(f => ({ ...f, service: e.target.value })); setDispatchError(''); }}
                    aria-label="Service for dispatch" aria-required="true" aria-invalid={!dispatchForm.service}
                    className="w-full min-h-[44px] rounded-xl px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ background: C.inputBg, border: `1px solid ${!dispatchForm.service && dispatchError ? '#ef4444' : C.inputBdr}`, color: C.txt }}
                  >
                    <option value="">Select a service…</option>
                    {THERAPIST_SPECIALTY_PRESETS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>

                <FormField label={dispatchForm.bookingType === 'walk-in' ? 'Walk-in guest name' : 'Client name (optional)'}
                  required={dispatchForm.bookingType === 'walk-in'}
                  error={dispatchError && dispatchForm.bookingType === 'walk-in' && !dispatchForm.clientName.trim() ? dispatchError : undefined}>
                  <input
                    value={dispatchForm.clientName}
                    onChange={e => { setDispatchForm(f => ({ ...f, clientName: e.target.value })); setDispatchError(''); }}
                    placeholder={dispatchForm.bookingType === 'walk-in' ? 'e.g. Guest — Maria' : 'e.g. Anna Reyes'}
                    maxLength={80}
                    aria-required={dispatchForm.bookingType === 'walk-in'}
                    className="w-full min-h-[44px] rounded-xl px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ background: C.inputBg, border: `1px solid ${C.inputBdr}`, color: C.txt }}
                  />
                </FormField>

                <FormField label="Dispatch notes" hint={`${dispatchForm.notes.length}/240`}>
                  <textarea
                    value={dispatchForm.notes}
                    onChange={e => { setDispatchForm(f => ({ ...f, notes: e.target.value })); setDispatchError(''); }}
                    placeholder="Allergies, pressure preference, room… (optional)"
                    rows={2} maxLength={240}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                    style={{ background: C.inputBg, border: `1px solid ${C.inputBdr}`, color: C.txt }}
                  />
                </FormField>

                {dispatchError && dispatchForm.service.trim() && (
                  <p role="alert" className="text-[11px] font-bold flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {dispatchError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={closeDispatch} disabled={dispatching}
                  className="min-h-[48px] rounded-xl text-sm font-bold border transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                  style={{ background: C.inner, borderColor: C.inputBdr, color: C.txt }}>
                  Cancel
                </button>
                <button onClick={confirmDispatch} disabled={dispatching}
                  className="min-h-[48px] rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait inline-flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 16px rgba(5,150,105,0.35)' }}>
                  {dispatching ? <><Loader2 className="w-4 h-4 animate-spin" /> Dispatching…</> : <><Zap className="w-4 h-4" /> Confirm & Rotate</>}
                </button>
              </div>
              <p className="text-[10px] text-center mt-2.5 font-medium" style={{ color: C.txtMuted }}>
                Therapist moves to the end of the queue after dispatch. Fair rotation preserved.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
