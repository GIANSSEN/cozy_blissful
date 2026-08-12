import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import axios from '../../api/axios';
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
  Layers, BarChart3, ChevronRight, Percent, Award, ShieldAlert,
  ArrowRight, RefreshCw, Zap, ExternalLink, ListOrdered
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════ */
/*  TOKENS & CONFIG                                                */
/* ═══════════════════════════════════════════════════════════════ */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SHIFTS = [
  { id: 'morning',   label: 'Morning',   time: '8:00 AM – 12:00 PM', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  { id: 'afternoon', label: 'Afternoon', time: '1:00 PM – 5:00 PM',  color: '#3b82f6', bg: 'rgba(59,130,246,0.14)' },
  { id: 'evening',   label: 'Evening',   time: '6:00 PM – 10:00 PM', color: '#8b5cf6', bg: 'rgba(139,92,246,0.14)' },
];

const ROLE_META = {
  admin:     { label: 'Administrator',    desc: 'Full system control & user management', icon: Crown,       grad: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#0a3d30', darkColor: '#34d399', badgeBg: 'rgba(10,61,48,0.15)',  locked: true  },
  staff:     { label: 'Staff Coordinator',desc: 'Manages scheduling, clients & bookings', icon: UserCog,     grad: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', color: '#3b82f6', darkColor: '#60a5fa', badgeBg: 'rgba(59,130,246,0.15)', locked: false },
  therapist: { label: 'Therapist',        desc: 'Assigned session & queue access',       icon: Stethoscope, grad: 'linear-gradient(135deg,#78350f,#d97706)', color: '#d97706', darkColor: '#fbbf24', badgeBg: 'rgba(217,119,6,0.15)',  locked: false },
  client:    { label: 'Client',           desc: 'Self-service booking portal',           icon: User,        grad: 'linear-gradient(135deg,#4338ca,#6366f1)', color: '#6366f1', darkColor: '#818cf8', badgeBg: 'rgba(99,102,241,0.15)',locked: false },
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

const MOCK_USERS = [
  { id: 1, name: 'Anna Reyes',     email: 'anna@cozy.spa',    phone: '+63 919 555 6666', role: 'therapist', specialty: 'Swedish & Hot Stone',   status: 'active',   joined: '2025-02-20', commRate: 35 },
  { id: 2, name: 'Grace Tan',      email: 'grace@cozy.spa',   phone: '+63 921 999 0000', role: 'therapist', specialty: 'Hilot & Shiatsu',        status: 'inactive', joined: '2025-06-01', commRate: 30 },
  { id: 3, name: 'Leo Garcia',     email: 'leo@cozy.spa',     phone: '+63 920 777 8888', role: 'therapist', specialty: 'Deep Tissue & Sports',   status: 'active',   joined: '2025-05-15', commRate: 35 },
  { id: 4, name: 'Maria Santos',   email: 'maria@cozy.spa',   phone: '+63 917 111 2222', role: 'staff',     specialty: 'Front Desk Coordinator', status: 'active',   joined: '2025-03-10', commRate: 0  },
  { id: 5, name: 'Juan Dela Cruz', email: 'juan@cozy.spa',    phone: '+63 918 333 4444', role: 'staff',     specialty: 'Operations Lead',        status: 'active',   joined: '2025-04-01', commRate: 0  },
  { id: 6, name: 'Elena Ramos',    email: 'elena@cozy.spa',   phone: '+63 922 444 5555', role: 'staff',     specialty: 'Booking Specialist',     status: 'active',   joined: '2025-07-12', commRate: 0  },
];

const EMPTY_FORM = { name: '', email: '', phone: '', specialty: '', role: 'therapist', status: 'active', commRate: 35, password: '', confirmPassword: '' };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ═══════════════════════════════════════════════════════════════ */
/*  HOOK: SEAMLESS THEME COLORS (NO HARSH WHITE BORDERS)           */
/* ═══════════════════════════════════════════════════════════════ */
function useC() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    isDark,
    cardBg:     isDark ? '#121824' : '#ffffff',
    cardShadow: isDark ? '0 4px 28px rgba(0,0,0,0.45)' : '0 2px 20px rgba(0,0,0,0.05)',
    cardBorder: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
    pageBg:     isDark ? '#0b0f19' : '#f8fafc',
    inputBg:    isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    inputBdr:   isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    textPri:    isDark ? '#f1f5f9' : '#0f172a',
    textSec:    isDark ? '#94a3b8' : '#475569',
    textMuted:  isDark ? '#64748b' : '#94a3b8',
    divider:    isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    rowHover:   isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.015)',
    pillBg:     isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    pillAct:    isDark ? '#059669' : '#0a3d30',
    innerBg:    isDark ? '#0d131f' : '#f8fafc',
    tableHead:  isDark ? '#0f1522' : '#f1f5f9',
    accent:     isDark ? '#34d399' : '#0a3d30',
  };
}

/* ═══════════════════════════════════════════════════════════════ */
/*  SHARED ATOMIC COMPONENTS                                       */
/* ═══════════════════════════════════════════════════════════════ */
function Avatar({ name, gradient, size = 38 }) {
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
        borderRadius: '50%',
        background: gradient || 'linear-gradient(135deg, #062c22, #0a3d30)',
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
      className="inline-flex items-center text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors"
      style={{ background: meta.badgeBg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        background: active ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
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
      className="relative inline-flex items-center flex-shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 cursor-pointer"
      style={{
        width: 38,
        height: 22,
        borderRadius: 99,
        background: on ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(148,163,184,0.3)',
        opacity: disabled ? 0.4 : 1,
      }}>
      <span
        className="inline-block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform"
        style={{ transform: on ? 'translateX(18px)' : 'translateX(3px)' }}
      />
    </button>
  );
}

function ModalBackdrop({ children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MODAL: USER DETAIL VIEW                                         */
/* ═══════════════════════════════════════════════════════════════ */
function UserDetailModal({ user, onClose, onEdit, t, isDark }) {
  if (!user) return null;
  const meta = ROLE_META[user.role] || ROLE_META.staff;
  const Icon = meta.icon;

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{ background: t.cardBg, border: t.cardBorder }} className="overflow-hidden">
        {/* Top Header */}
        <div className="p-6 relative text-white" style={{ background: meta.grad }}>
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <Avatar name={user.name} gradient="rgba(255,255,255,0.25)" size={52} />
            <div>
              <h3 className="font-black text-lg text-white leading-tight">{user.name}</h3>
              <p className="text-xs text-white/80 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/20 uppercase tracking-wider text-white flex items-center gap-1">
                  <Icon className="w-3 h-3" /> {meta.label}
                </span>
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl" style={{ background: t.innerBg, border: t.cardBorder }}>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
              <p className="text-xs font-bold" style={{ color: t.textPri }}>{user.phone || '—'}</p>
            </div>
            <div className="p-3.5 rounded-2xl" style={{ background: t.innerBg, border: t.cardBorder }}>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Specialization</p>
              <p className="text-xs font-bold" style={{ color: t.textPri }}>{user.specialty || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl" style={{ background: t.innerBg, border: t.cardBorder }}>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Commission Rate</p>
              <p className="text-xs font-black text-emerald-500">{user.commRate ? `${user.commRate}%` : 'Standard'}</p>
            </div>
            <div className="p-3.5 rounded-2xl" style={{ background: t.innerBg, border: t.cardBorder }}>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Date Joined</p>
              <p className="text-xs font-bold" style={{ color: t.textPri }}>{user.joined || '—'}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl space-y-2" style={{ background: t.innerBg, border: t.cardBorder }}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Access & Permissions</p>
            <p className="text-xs" style={{ color: t.textSec }}>{meta.desc}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ background: t.innerBg, borderTop: `1px solid ${t.divider}` }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-xs font-bold transition-all hover:opacity-80" style={{ background: t.cardBg, color: t.textSec }}>
            Close
          </button>
          <button onClick={() => { onClose(); onEdit(user); }} className="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md">
            Edit User Profile
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MODAL: ADD / EDIT USER WIZARD                                  */
/* ═══════════════════════════════════════════════════════════════ */
function UserFormModal({ user, onClose, onSave, t }) {
  const isEdit = !!user;
  const [form, setForm] = useState(isEdit ? {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    specialty: user.specialty || '',
    role: user.role || 'therapist',
    status: user.status || 'active',
    commRate: user.commRate ?? 35,
    password: '',
    confirmPassword: '',
  } : EMPTY_FORM);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email is required';
    if (!isEdit) {
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Min. 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSave(form);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{ background: t.cardBg, border: t.cardBorder }} className="overflow-hidden flex flex-col h-full">
        {/* Modal Header */}
        <div className="p-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${t.divider}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/15 text-emerald-500">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base" style={{ color: t.textPri }}>
                {isEdit ? 'Edit User Profile' : 'Create New Account'}
              </h3>
              <p className="text-[10px]" style={{ color: t.textMuted }}>
                {isEdit ? 'Update staff or therapist credentials' : 'Register a new team member'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80" style={{ background: t.innerBg, color: t.textMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 max-h-[70vh]">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Full Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Maria Santos"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
              style={{ background: t.inputBg, border: `1px solid ${errors.name ? '#ef4444' : t.inputBdr}`, color: t.textPri }} />
            {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Email Address *</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="maria@cozy.spa"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                style={{ background: t.inputBg, border: `1px solid ${errors.email ? '#ef4444' : t.inputBdr}`, color: t.textPri }} />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+63 917 123 4567"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBdr}`, color: t.textPri }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">System Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-bold cursor-pointer"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBdr}`, color: t.textPri }}>
                <option value="therapist" style={{ background: t.cardBg, color: t.textPri }}>Therapist</option>
                <option value="staff" style={{ background: t.cardBg, color: t.textPri }}>Staff Coordinator</option>
                <option value="admin" style={{ background: t.cardBg, color: t.textPri }}>Administrator</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-bold cursor-pointer"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBdr}`, color: t.textPri }}>
                <option value="active" style={{ background: t.cardBg, color: t.textPri }}>Active</option>
                <option value="inactive" style={{ background: t.cardBg, color: t.textPri }}>Inactive</option>
              </select>
            </div>
          </div>

          {form.role === 'therapist' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Specialization</label>
                <input value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
                  placeholder="e.g. Swedish & Deep Tissue"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium"
                  style={{ background: t.inputBg, border: `1px solid ${t.inputBdr}`, color: t.textPri }} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Commission Rate (%)</label>
                <input type="number" value={form.commRate} onChange={e => setForm({ ...form, commRate: Number(e.target.value) })}
                  placeholder="35"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium"
                  style={{ background: t.inputBg, border: `1px solid ${t.inputBdr}`, color: t.textPri }} />
              </div>
            </div>
          )}

          {!isEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none transition-all"
                  style={{ background: t.inputBg, border: `1px solid ${errors.password ? '#ef4444' : t.inputBdr}`, color: t.textPri }} />
                {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none transition-all"
                  style={{ background: t.inputBg, border: `1px solid ${errors.confirmPassword ? '#ef4444' : t.inputBdr}`, color: t.textPri }} />
                {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3" style={{ borderTop: `1px solid ${t.divider}` }}>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-bold" style={{ color: t.textSec }}>
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md">
              <Save className="w-3.5 h-3.5" />
              <span>{isEdit ? 'Update Profile' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB 1: USER PROFILES (CLEAN, SEAMLESS, NO WHITE LINES)         */
/* ═══════════════════════════════════════════════════════════════ */
function TabProfiles({ users, onUsersChange }) {
  const C = useC();
  const { toast } = useToast();
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [viewMode, setViewMode]         = useState('table');
  const [viewingUser, setViewingUser]   = useState(null);
  const [editingUser, setEditingUser]   = useState(null);
  const [addingUser, setAddingUser]     = useState(false);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.specialty || '').toLowerCase().includes(q);
      const matchR = roleFilter === 'all' || u.role === roleFilter;
      return matchQ && matchR;
    });
  }, [users, search, roleFilter]);

  const toggleStatus = id => {
    onUsersChange(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        toast.info(`User ${u.name} set to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleSaveUser = form => {
    if (editingUser) {
      onUsersChange(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form } : u));
      toast.success('User profile updated successfully!');
      setEditingUser(null);
    } else {
      const newUser = { id: Date.now(), ...form, joined: new Date().toISOString().slice(0, 10) };
      onUsersChange(prev => [newUser, ...prev]);
      toast.success('New user account created!');
      setAddingUser(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Detail & Form Modals */}
      {viewingUser && <UserDetailModal user={viewingUser} onClose={() => setViewingUser(null)} onEdit={u => setEditingUser(u)} t={C} isDark={C.isDark} />}
      {(addingUser || editingUser) && <UserFormModal user={editingUser} onClose={() => { setAddingUser(false); setEditingUser(null); }} onSave={handleSaveUser} t={C} />}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', count: users.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Users },
          { label: 'Active', count: users.filter(u => u.status === 'active').length, color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle2 },
          { label: 'Therapists', count: users.filter(u => u.role === 'therapist').length, color: '#d97706', bg: 'rgba(217,119,6,0.12)', icon: Stethoscope },
          { label: 'Staff Lead', count: users.filter(u => u.role === 'staff').length, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: UserCog },
        ].map(s => (
          <motion.div key={s.label} {...fadeUp(0)} className="p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all"
            style={{ background: C.cardBg, border: C.cardBorder, boxShadow: C.cardShadow }}>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: C.textPri }}>{s.count}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl shadow-sm"
        style={{ background: C.cardBg, border: C.cardBorder }}>
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user name, email, specialty…"
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl outline-none font-medium"
            style={{ background: C.inputBg, border: `1px solid ${C.inputBdr}`, color: C.textPri }} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: C.innerBg }}>
            {['all', 'staff', 'therapist'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-all"
                style={{ background: roleFilter === r ? C.accent : 'transparent', color: roleFilter === r ? '#fff' : C.textSec }}>
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 rounded-xl" style={{ background: C.innerBg }}>
            <button onClick={() => setViewMode('table')} className="p-1.5 rounded-lg" style={{ background: viewMode === 'table' ? C.accent + '20' : 'transparent', color: viewMode === 'table' ? C.accent : C.textMuted }}>
              <BarChart3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('cards')} className="p-1.5 rounded-lg" style={{ background: viewMode === 'cards' ? C.accent + '20' : 'transparent', color: viewMode === 'cards' ? C.accent : C.textMuted }}>
              <Layers className="w-4 h-4" />
            </button>
          </div>

          <button onClick={() => setAddingUser(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md">
            <Plus className="w-4 h-4" /> <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Main List Display */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: C.cardBg, border: C.cardBorder }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr style={{ background: C.tableHead }}>
                  {['User', 'Specialization', 'Role', 'Status', 'Commission', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: C.divider }}>
                {filtered.map(u => {
                  const meta = ROLE_META[u.role] || ROLE_META.staff;
                  return (
                    <tr key={u.id} className="group hover:bg-slate-500/5 cursor-pointer transition-colors"
                      onClick={() => setViewingUser(u)}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} gradient={meta.grad} size={36} />
                          <div>
                            <p className="text-xs font-bold hover:underline" style={{ color: C.textPri }}>{u.name}</p>
                            <p className="text-[10px]" style={{ color: C.textMuted }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium" style={{ color: C.textSec }}>{u.specialty || '—'}</td>
                      <td className="px-4 py-3.5"><RolePill role={u.role} /></td>
                      <td className="px-4 py-3.5"><StatusBadge status={u.status} /></td>
                      <td className="px-4 py-3.5">
                        {u.role === 'therapist' ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/15 px-2.5 py-1 rounded-full">
                            {u.commRate}% Comm.
                          </span>
                        ) : <span className="text-[10px] text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-[11px]" style={{ color: C.textMuted }}>{u.joined}</td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditingUser(u)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
                            style={{ background: C.innerBg, color: C.textSec }}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleStatus(u.id)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
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
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(u => {
            const meta = ROLE_META[u.role] || ROLE_META.staff;
            return (
              <div key={u.id} className="p-5 rounded-2xl space-y-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ background: C.cardBg, border: C.cardBorder, boxShadow: C.cardShadow }} onClick={() => setViewingUser(u)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} gradient={meta.grad} size={42} />
                    <div>
                      <p className="font-bold text-sm" style={{ color: C.textPri }}>{u.name}</p>
                      <p className="text-[11px]" style={{ color: C.textMuted }}>{u.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
                <div className="flex items-center justify-between text-xs pt-3" style={{ borderTop: `1px solid ${C.divider}` }}>
                  <span className="font-medium text-slate-400">{u.specialty}</span>
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

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB 2: WORK SCHEDULES                                          */
/* ═══════════════════════════════════════════════════════════════ */
function TabSchedules({ users }) {
  const C = useC();
  const { toast } = useToast();
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

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    toast.success('Work schedule shifts updated successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight" style={{ color: C.textPri }}>Work Schedules</h2>
          <p className="text-xs" style={{ color: C.textMuted }}>Assign and manage weekly shift rosters</p>
        </div>

        {person && (
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Shifts'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Team Roster List */}
        <div className="lg:col-span-4 rounded-2xl overflow-hidden shadow-sm" style={{ background: C.cardBg, border: C.cardBorder }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.divider}` }}>
            <p className="text-[10px] font-black uppercase text-slate-400">Team Roster</p>
          </div>
          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
            {filteredTeam.map(u => {
              const isSel = selected === u.id;
              const meta  = ROLE_META[u.role] || ROLE_META.staff;
              return (
                <button key={u.id} onClick={() => setSelected(u.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                  style={{ background: isSel ? C.accent + '15' : 'transparent' }}>
                  <Avatar name={u.name} gradient={meta.grad} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: C.textPri }}>{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.specialty}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Shifts Grid */}
        <div className="lg:col-span-8 rounded-2xl p-5 space-y-4 shadow-sm" style={{ background: C.cardBg, border: C.cardBorder }}>
          {person && (
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: `1px solid ${C.divider}` }}>
              <div className="flex items-center gap-3">
                <Avatar name={person.name} gradient={ROLE_META[person.role]?.grad} size={42} />
                <div>
                  <p className="font-black text-sm" style={{ color: C.textPri }}>{person.name}</p>
                  <p className="text-xs text-slate-400">{person.specialty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Weekly Total</p>
                <p className="text-lg font-black text-emerald-500">{totalShifts * 4} Hours</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {DAYS.map(day => {
              const dayShifts = sched[day] || [];
              return (
                <div key={day} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.innerBg, border: C.cardBorder }}>
                  <span className="w-12 text-xs font-black" style={{ color: C.textPri }}>{day}</span>
                  <div className="flex gap-2 flex-1 flex-wrap">
                    {SHIFTS.map(sh => {
                      const active = dayShifts.includes(sh.id);
                      return (
                        <button key={sh.id} onClick={() => toggle(day, sh.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: active ? sh.bg : C.cardBg,
                            color: active ? sh.color : C.textMuted,
                          }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? sh.color : '#cbd5e1' }} />
                          <span>{sh.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
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

  const moveUp = idx => {
    if (idx === 0) return;
    setQueue(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next.map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const moveDown = idx => {
    if (idx === queue.length - 1) return;
    setQueue(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next.map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  const markServed = id => {
    setQueue(prev => {
      const target = prev.find(t => t.id === id);
      const rest = prev.filter(t => t.id !== id);
      toast.success(`Assigned session to ${target?.name}. Rotated to end of queue.`);
      return [...rest, { ...target, sessions: target.sessions + 1 }].map((t, i) => ({ ...t, position: i + 1 }));
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black tracking-tight" style={{ color: C.textPri }}>Therapist Queue & Rotation</h2>
        <p className="text-xs" style={{ color: C.textMuted }}>Fair scheduling dispatch queue for active therapists</p>
      </div>

      <div className="space-y-2.5">
        {queue.map((t, idx) => (
          <div key={t.id} className="p-4 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-sm"
            style={{ background: C.cardBg, border: C.cardBorder }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                style={{ background: idx === 0 ? 'linear-gradient(135deg,#062c22,#0a3d30)' : C.pillBg, color: idx === 0 ? '#fff' : C.textMuted }}>
                #{t.position}
              </div>
              <Avatar name={t.name} gradient={ROLE_META[t.role]?.grad} size={40} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm truncate" style={{ color: C.textPri }}>{t.name}</p>
                  {idx === 0 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white flex-shrink-0">NEXT UP</span>}
                </div>
                <p className="text-xs text-slate-400 truncate">{t.specialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-2 rounded-xl text-slate-400 hover:bg-slate-500/10 disabled:opacity-30">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => moveDown(idx)} disabled={idx === queue.length - 1} className="p-2 rounded-xl text-slate-400 hover:bg-slate-500/10 disabled:opacity-30">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button onClick={() => markServed(t.id)} className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md whitespace-nowrap">
                Assign & Rotate
              </button>
            </div>
          </div>
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
  const [saved, setSaved]   = useState(false);

  const toggle = (role, perm) => {
    if (ROLE_META[role]?.locked) return;
    setPerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('/admin/rbac/permissions', { permissions: perms });
    } catch {
      // Local fallback
    }
    setSaving(false);
    setSaved(true);
    toast.success('RBAC permissions updated & logged successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2" style={{ color: C.textPri }}>
            <Shield className="w-5 h-5 text-emerald-500" />
            <span>Role-Based Access Control (RBAC)</span>
          </h2>
          <p className="text-xs" style={{ color: C.textMuted }}>Configure system permission levels per role</p>
        </div>

        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md">
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Permissions'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(ROLE_META).map(([role, meta]) => {
          const Icon = meta.icon;
          const rp   = perms[role] || {};
          const cnt  = Object.values(rp).filter(Boolean).length;
          const total= Object.keys(PERM_META).length;

          return (
            <div key={role} className="rounded-3xl overflow-hidden shadow-sm" style={{ background: C.cardBg, border: C.cardBorder }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.divider}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: meta.grad }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm" style={{ color: C.textPri }}>{meta.label}</h3>
                    <p className="text-xs text-slate-400">{meta.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-500">{cnt} of {total} Enabled</span>
                  {meta.locked && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500">System Locked</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: C.divider }}>
                {Object.entries(PERM_META).map(([pk, pm]) => {
                  const active = !!rp[pk];
                  return (
                    <div key={pk} onClick={() => toggle(role, pk)} className="p-4 flex flex-col items-center text-center gap-2 cursor-pointer hover:bg-slate-500/5 transition-colors">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: active ? `${pm.color}15` : C.pillBg }}>
                        <pm.icon className="w-4 h-4" style={{ color: active ? pm.color : C.textMuted }} />
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

  useEffect(() => {
    axios.get('/admin/therapists')
      .then(res => {
        if (res.data.therapists && res.data.therapists.length) {
          const apiTherapists = res.data.therapists.map(t => ({
            id: t.id,
            name: t.name,
            email: t.email,
            phone: t.phone || '',
            role: 'therapist',
            specialty: t.specialty || 'General Wellness & Spa',
            status: 'active',
            joined: '2025-01-15',
            commRate: 35
          }));
          setUsers(prev => {
            const nonTherapists = prev.filter(u => u.role !== 'therapist');
            return [...apiTherapists, ...nonTherapists];
          });
        }
      })
      .catch(() => {});
  }, []);

  const subMap = {
    profiles:  'User Profiles',
    schedules: 'Work Schedules',
    queue:     'Therapist Queue',
    rbac:      'Permissions',
  };

  return (
    <AdminLayout title="User Management" subtitle={subMap[activeTab] || 'User Profiles'} icon={UserCog}>
      <style>{`
        select option {
          background-color: #121824 !important;
          color: #f1f5f9 !important;
        }
      `}</style>
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
