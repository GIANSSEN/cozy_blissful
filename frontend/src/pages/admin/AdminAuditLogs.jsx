import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import axios from '../../api/axios';
import { DatePickerInput } from '../../components/ui/date-picker';
import {
  History, Search, ShieldCheck, PlusCircle, Pencil,
  Trash2, LogIn, Settings as SettingsIcon, X, Eye,
  Download, Filter, Clock, User, Globe,
  AlertTriangle, RefreshCw, CheckCircle, Info, Copy,
  ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Edit3, Layers, BarChart3,
  ChevronDown, Save, Plus, AlertCircle,
} from 'lucide-react';

/* ════════════════ Design tokens (WCAG-AA tuned) ════════════════ */
const TOKENS = {
  light: {
    card: 'rgba(255,255,255,0.97)', cardShadow: '0 2px 24px rgba(0,0,0,0.07)',
    cardBorder: '1px solid rgba(15,23,42,0.09)', inner: '#f8f9fc',
    innerBorder: '1px solid rgba(15,23,42,0.08)', txt: '#0f172a',
    txtMuted: '#64748b', txtSub: '#334155', hover: 'rgba(10,61,48,0.045)',
    inputBg: '#ffffff', inputBorder: 'rgba(15,23,42,0.16)', tableHead: '#eef2f7',
  },
  dark: {
    card: '#161d2c', cardShadow: '0 4px 32px rgba(0,0,0,0.45)',
    cardBorder: '1px solid rgba(255,255,255,0.09)', inner: '#101827',
    innerBorder: '1px solid rgba(255,255,255,0.09)', txt: '#e8edf5',
    txtMuted: '#8b9bb0', txtSub: '#aebdcc', hover: 'rgba(255,255,255,0.045)',
    inputBg: 'rgba(255,255,255,0.05)', inputBorder: 'rgba(255,255,255,0.14)', tableHead: '#1c2940',
  },
};

const ACTION_META = {
  create: { label: 'Created', icon: PlusCircle,   color: '#047857', bg: 'rgba(16,185,129,0.12)',  darkColor: '#34d399', severity: 'info',    gradient: 'linear-gradient(135deg,#059669,#10b981)' },
  update: { label: 'Updated', icon: Pencil,       color: '#92400e', bg: 'rgba(217,119,6,0.13)',   darkColor: '#fbbf24', severity: 'warning', gradient: 'linear-gradient(135deg,#b45309,#d97706)' },
  delete: { label: 'Deleted', icon: Trash2,       color: '#b91c1c', bg: 'rgba(220,38,38,0.11)',   darkColor: '#f87171', severity: 'danger',  gradient: 'linear-gradient(135deg,#991b1b,#dc2626)' },
  login:  { label: 'Login',   icon: LogIn,        color: '#4338ca', bg: 'rgba(79,70,229,0.12)',   darkColor: '#818cf8', severity: 'info',    gradient: 'linear-gradient(135deg,#3730a3,#4f46e5)' },
  config: { label: 'Config',  icon: SettingsIcon, color: '#6d28d9', bg: 'rgba(124,58,237,0.12)', darkColor: '#a78bfa', severity: 'warning', gradient: 'linear-gradient(135deg,#5b21b6,#7c3aed)' },
  access: { label: 'Access',  icon: ShieldCheck,  color: '#047857', bg: 'rgba(16,185,129,0.13)',  darkColor: '#34d399', severity: 'info',    gradient: 'linear-gradient(135deg,#065f46,#059669)' },
};

const SEVERITY_META = {
  info:    { icon: Info,          color: '#4338ca', bg: 'rgba(79,70,229,0.11)',  label: 'Info',     darkColor: '#818cf8' },
  warning: { icon: AlertTriangle, color: '#92400e', bg: 'rgba(217,119,6,0.12)', label: 'Warning',  darkColor: '#fbbf24' },
  danger:  { icon: AlertCircle,   color: '#b91c1c', bg: 'rgba(220,38,38,0.11)', label: 'Critical', darkColor: '#f87171' },
};

const MOCK_LOGS = [
  { id:1,  actor:'System Admin',   actor_role:'admin',     action:'update', entity:'RBAC Permissions',  detail:"Updated permissions for role 'staff' — added manage-appointments, removed view-reports", module:'Access Control',  ip_address:'192.168.1.10',  session_id:'sess_a1b2c3', severity:'warning', created_at:'2026-07-25 14:32' },
  { id:2,  actor:'Maria Santos',   actor_role:'staff',     action:'login',  entity:'Authentication',    detail:'Signed in from 122.55.14.20 — Chrome 124 on Windows',                                  module:'Auth',            ip_address:'122.55.14.20',  session_id:'sess_d4e5f6', severity:'info',    created_at:'2026-07-25 09:10' },
  { id:3,  actor:'System Admin',   actor_role:'admin',     action:'create', entity:'Service Catalog',   detail:"Added new service 'Couple Massage' — PHP1,800 / 90 min",                               module:'Services',        ip_address:'192.168.1.10',  session_id:'sess_g7h8i9', severity:'info',    created_at:'2026-07-24 17:45' },
  { id:4,  actor:'John Therapist', actor_role:'therapist', action:'update', entity:'Availability',      detail:'Marked available for 2026-07-26 and 2026-07-27',                                        module:'Schedule',        ip_address:'203.87.45.31',  session_id:'sess_j1k2l3', severity:'warning', created_at:'2026-07-24 11:02' },
  { id:5,  actor:'System Admin',   actor_role:'admin',     action:'config', entity:'System Settings',   detail:'Changed booking lead-time from 1 hour to 2 hours',                                      module:'Settings',        ip_address:'192.168.1.10',  session_id:'sess_m4n5o6', severity:'warning', created_at:'2026-07-23 16:20' },
  { id:6,  actor:'Anna Reyes',     actor_role:'staff',     action:'login',  entity:'Authentication',    detail:'Signed in from 178.20.9.4 — Safari 17 on macOS',                                       module:'Auth',            ip_address:'178.20.9.4',    session_id:'sess_p7q8r9', severity:'info',    created_at:'2026-07-23 08:55' },
  { id:7,  actor:'System Admin',   actor_role:'admin',     action:'create', entity:'Marketing',         detail:"Issued gift card 'CB-GIFT-1000' — PHP1,000 value, expires 2026-12-31",                 module:'Marketing',       ip_address:'192.168.1.10',  session_id:'sess_s1t2u3', severity:'info',    created_at:'2026-07-22 13:12' },
  { id:8,  actor:'System Admin',   actor_role:'admin',     action:'delete', entity:'Product Inventory', detail:"Removed product 'Sample Trial Kit' — stock: 0, reason: discontinued",                  module:'Inventory',       ip_address:'192.168.1.10',  session_id:'sess_v4w5x6', severity:'danger',  created_at:'2026-07-22 10:05' },
  { id:9,  actor:'Jane Client',    actor_role:'client',    action:'create', entity:'Appointment',       detail:'Booked Swedish Massage — July 27, 2026 at 10:00 AM',                                   module:'Bookings',        ip_address:'54.201.8.77',   session_id:'sess_y7z8a9', severity:'info',    created_at:'2026-07-21 21:14' },
  { id:10, actor:'System Admin',   actor_role:'admin',     action:'access', entity:'Audit Logs',        detail:'Viewed audit log export — date range July 1-21, 2026',                                  module:'Security',        ip_address:'192.168.1.10',  session_id:'sess_b1c2d3', severity:'info',    created_at:'2026-07-21 15:30' },
  { id:11, actor:'Maria Santos',   actor_role:'staff',     action:'update', entity:'Appointment',       detail:"Assigned therapist 'John Therapist' to booking #209",                                   module:'Bookings',        ip_address:'122.55.14.20',  session_id:'sess_e4f5g6', severity:'warning', created_at:'2026-07-20 11:44' },
  { id:12, actor:'System Admin',   actor_role:'admin',     action:'delete', entity:'Staff Account',     detail:"Removed staff account 'temp.staff@example.com' — account deactivated",                  module:'User Management', ip_address:'192.168.1.10',  session_id:'sess_h7i8j9', severity:'danger',  created_at:'2026-07-19 09:00' },
];

const PAGE_SIZE_OPTIONS = [6, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

/* Validation rules — single source of truth */
const LIMITS = {
  actor:   { min: 2, max: 80 },
  entity:  { min: 2, max: 60 },
  detail:  { min: 10, max: 1000 },
  module:  { max: 60 },
  ip:      { max: 45 },
  session: { max: 64 },
};
const IP_RE = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}|localhost|(?:[A-Za-z0-9:]*:+[A-Za-z0-9:.]+))$/;
const SESSION_RE = /^[A-Za-z0-9_\-:.]*$/;

function validateLogField(name, raw) {
  const v = (raw ?? '').toString();
  const s = v.trim();
  switch (name) {
    case 'actor':
      if (!s) return 'Actor name is required.';
      if (s.length < LIMITS.actor.min) return `Actor must be at least ${LIMITS.actor.min} characters.`;
      if (s.length > LIMITS.actor.max) return `Actor must be ${LIMITS.actor.max} characters or fewer.`;
      return '';
    case 'entity':
      if (!s) return 'Entity / resource is required.';
      if (s.length < LIMITS.entity.min) return `Entity must be at least ${LIMITS.entity.min} characters.`;
      if (s.length > LIMITS.entity.max) return `Entity must be ${LIMITS.entity.max} characters or fewer.`;
      return '';
    case 'detail':
      if (!s) return 'Description is required.';
      if (s.length < LIMITS.detail.min) return `Description must be at least ${LIMITS.detail.min} characters — add what changed and why.`;
      if (s.length > LIMITS.detail.max) return `Description must be ${LIMITS.detail.max} characters or fewer.`;
      return '';
    case 'module':
      if (s.length > LIMITS.module.max) return `Module must be ${LIMITS.module.max} characters or fewer.`;
      return '';
    case 'ip_address':
      if (!s) return '';
      if (s.length > LIMITS.ip.max) return 'IP address looks too long.';
      if (!IP_RE.test(s)) return 'Enter a valid IPv4 / IPv6 address or “localhost”.';
      return '';
    case 'session_id':
      if (!s) return '';
      if (s.length > LIMITS.session.max) return `Session ID must be ${LIMITS.session.max} characters or fewer.`;
      if (!SESSION_RE.test(s)) return 'Session ID may only contain letters, numbers, _ - : .';
      return '';
    default:
      return '';
  }
}

function validateLogForm(form) {
  const errors = {};
  ['actor', 'entity', 'detail', 'module', 'ip_address', 'session_id'].forEach((k) => {
    const msg = validateLogField(k, form[k]);
    if (msg) errors[k] = msg;
  });
  if (!ACTION_META[form.action]) errors.action = 'Choose a valid action type.';
  if (!['info', 'warning', 'danger'].includes(form.severity)) errors.severity = 'Choose a valid severity.';
  if (!['admin', 'staff', 'therapist', 'client', 'system'].includes(form.actor_role)) errors.actor_role = 'Choose a valid role.';
  return errors;
}

const formatStamp = (value) => (value || '').slice(0, 16);
const logDay = (value) => (value || '').slice(0, 10);

function toCSVCell(v) {
  const s = (v ?? '').toString().replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

/* Debounce any fast-changing value (search input → API) */
function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] },
});
const slideIn = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.96, y: 10 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};

/* Copy helper with non-secure-context fallback */
const useCopyToast = () => {
  const [copied, setCopied] = useState('');
  const timer = useRef(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = useCallback(async (text, label) => {
    const done = () => {
      setCopied(label);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(''), 2000);
    };
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        done();
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      }
    } catch {
      /* clipboard unavailable — fail silently, caller still shows value */
    }
  }, []);
  return { copied, copy };
};

const Avatar = ({ name, color, size = 40 }) => {
  const initials = (name || '?').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `${color}22`, border: `2px solid ${color}45`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.32, fontWeight: 800, color, flexShrink: 0, letterSpacing: '-0.5px',
      }}
    >
      {initials}
    </div>
  );
};

const ProgressBar = ({ pct, color, label }) => {
  const safe = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  return (
    <div
      role="progressbar"
      aria-label={label || 'Share of total'}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safe)}
      style={{ height: 4, borderRadius: 99, background: `${color}22`, overflow: 'hidden', marginTop: 6 }}
    >
      <motion.div
        style={{ height: '100%', background: color, borderRadius: 99 }}
        initial={{ width: 0 }}
        animate={{ width: `${safe}%` }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
      />
    </div>
  );
};

/* Accessible modal shell: ESC to close, scroll-lock, labelled dialog */
const ModalOverlay = ({ children, onClose, maxWidth = 560, labelledBy }) => {
  const closeRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{ background: 'rgba(2,6,12,0.72)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ y: 48, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 48, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="w-full rounded-t-3xl sm:rounded-3xl overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
        style={{ maxWidth, maxHeight: '92vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {/* hidden focus anchor for return-focus behaviour */}
        <span ref={closeRef} tabIndex={-1} className="sr-only" aria-hidden="true" />
        {children}
      </motion.div>
    </div>
  );
};

/* ─── CONFIRM DELETE ─── */
const ConfirmDeleteModal = ({ log, onConfirm, onClose, t, isDark, deleting }) => {
  if (!log) return null;
  const danger = isDark ? '#f87171' : '#b91c1c';
  return (
    <ModalOverlay onClose={onClose} maxWidth={440} labelledBy="confirm-delete-title">
      <div style={{ background: t.card, border: t.cardBorder }} className="rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)' }}
          >
            <Trash2 className="w-6 h-6" style={{ color: danger }} aria-hidden="true" />
          </div>
          <div>
            <p id="confirm-delete-title" className="font-black text-base" style={{ color: t.txt }}>
              Delete log #{log.id}?
            </p>
            <p className="text-xs mt-0.5" style={{ color: t.txtMuted }}>
              This action cannot be undone. The record is removed permanently.
            </p>
          </div>
        </div>
        <div className="p-3.5 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
          <p className="text-xs font-semibold" style={{ color: t.txtSub }}>
            {log.actor} · {ACTION_META[log.action]?.label || log.action} · {log.entity}
          </p>
          <p className="text-[11px] mt-1 line-clamp-2" style={{ color: t.txtMuted }}>{log.detail}</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-4 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 min-h-[44px] px-4 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)' }}
          >
            {deleting ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
            {deleting ? 'Deleting…' : 'Delete entry'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

/* ─── LOG FORM (Create / Edit) — fully validated, labelled, keyboard-safe ─── */
const LogFormModal = ({ log, onSave, onClose, t, isDark, isLoading }) => {
  const isEdit = !!(log && log.id);
  const [form, setForm] = useState({
    actor:      log?.actor ?? '',
    actor_role: log?.actor_role ?? 'admin',
    action:     log?.action ?? 'create',
    entity:     log?.entity ?? '',
    module:     log?.module ?? '',
    detail:     log?.detail ?? '',
    ip_address: log?.ip_address ?? '',
    session_id: log?.session_id ?? '',
    severity:   log?.severity ?? 'info',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const fieldRefs = useRef({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setTouched((prev) => ({ ...prev, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validateLogField(k, v) || '' }));
  };
  const blur = (k) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validateLogField(k, form[k]) || '' }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const next = validateLogForm(form);
    setErrors(next);
    setTouched({ actor: true, entity: true, detail: true, module: true, ip_address: true, session_id: true, action: true, severity: true, actor_role: true });
    if (Object.keys(next).length > 0) {
      const order = ['actor', 'actor_role', 'action', 'severity', 'entity', 'module', 'detail', 'ip_address', 'session_id'];
      const first = order.find((k) => next[k]);
      if (first) fieldRefs.current[first]?.focus();
      return;
    }
    onSave({
      ...form,
      actor: form.actor.trim(),
      entity: form.entity.trim(),
      module: form.module.trim(),
      detail: form.detail.trim(),
      ip_address: form.ip_address.trim(),
      session_id: form.session_id.trim(),
    });
  };

  const Lbl = ({ htmlFor, children, required }) => (
    <label htmlFor={htmlFor} className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: t.txtMuted }}>
      {children} {required ? <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span> : null}
      {required ? <span className="sr-only">(required)</span> : null}
    </label>
  );

  const fieldClass = (k) =>
    `w-full px-3.5 py-3 min-h-[44px] rounded-xl text-xs border outline-none transition-shadow ${
      errors[k] && touched[k] ? 'ring-2 ring-red-500/30' : ''
    }`;

  const describedBy = (k) => {
    const ids = [];
    if (errors[k] && touched[k]) ids.push(`log-${k}-error`);
    if (k === 'detail') ids.push('log-detail-hint');
    return ids.length ? ids.join(' ') : undefined;
  };

  const selectWrap = (id, value, onChange, options, described) => (
    <div className="relative">
      <select
        id={id}
        ref={(el) => { fieldRefs.current[id.replace('log-', '')] = el; }}
        value={value}
        onChange={(e) => set(onChange, e.target.value)}
        onBlur={() => setTouched((p) => ({ ...p, [onChange]: true }))}
        aria-describedby={described}
        className="w-full pl-3.5 pr-10 py-3 min-h-[44px] rounded-xl text-xs border outline-none appearance-none cursor-pointer"
        style={{ background: t.inputBg, color: t.txt, borderColor: t.inputBorder }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: t.txtMuted }} aria-hidden="true" />
    </div>
  );

  const preview = ACTION_META[form.action];

  return (
    <ModalOverlay onClose={onClose} maxWidth={600} labelledBy="log-form-title">
      <div style={{ background: t.card, border: t.cardBorder }} className="rounded-t-3xl sm:rounded-3xl">
        <div className="pt-3 pb-1 flex justify-center sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full opacity-30" style={{ background: t.txtMuted }} />
        </div>
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between gap-3" style={{ borderBottom: t.innerBorder }}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isEdit ? 'rgba(217,119,6,0.12)' : 'rgba(16,185,129,0.12)' }}
            >
              {isEdit
                ? <Edit3 className="w-4 h-4" style={{ color: '#b45309' }} aria-hidden="true" />
                : <Plus className="w-4 h-4" style={{ color: '#047857' }} aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <p id="log-form-title" className="font-black text-sm truncate" style={{ color: t.txt }}>
                {isEdit ? `Edit log entry #${log.id}` : 'Create log entry'}
              </p>
              <p className="text-[11px] truncate" style={{ color: t.txtMuted }}>
                {isEdit ? 'Modify the audit record' : 'Manually add an audit record'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close log form"
            className="w-11 h-11 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '68vh' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Lbl htmlFor="log-actor" required>Actor name</Lbl>
                <input
                  id="log-actor"
                  ref={(el) => { fieldRefs.current.actor = el; }}
                  value={form.actor}
                  onChange={(e) => set('actor', e.target.value)}
                  onBlur={() => blur('actor')}
                  placeholder="e.g. System Admin"
                  autoComplete="off"
                  maxLength={LIMITS.actor.max}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.actor && touched.actor)}
                  aria-describedby={describedBy('actor')}
                  className={fieldClass('actor')}
                  style={{ background: t.inputBg, color: t.txt, borderColor: errors.actor && touched.actor ? '#ef4444' : t.inputBorder }}
                />
                {errors.actor && touched.actor && (
                  <p id="log-actor-error" role="alert" className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{errors.actor}
                  </p>
                )}
              </div>
              <div>
                <Lbl htmlFor="log-actor_role" required>Actor role</Lbl>
                {selectWrap('log-actor_role', form.actor_role, 'actor_role',
                  ['admin', 'staff', 'therapist', 'client', 'system'].map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Lbl htmlFor="log-action" required>Action type</Lbl>
                {selectWrap('log-action', form.action, 'action',
                  Object.entries(ACTION_META).map(([v, m]) => ({ value: v, label: m.label })))}
              </div>
              <div>
                <Lbl htmlFor="log-severity" required>Severity</Lbl>
                {selectWrap('log-severity', form.severity, 'severity',
                  [{ value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' }, { value: 'danger', label: 'Critical' }])}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Lbl htmlFor="log-entity" required>Entity / resource</Lbl>
                <input
                  id="log-entity"
                  ref={(el) => { fieldRefs.current.entity = el; }}
                  value={form.entity}
                  onChange={(e) => set('entity', e.target.value)}
                  onBlur={() => blur('entity')}
                  placeholder="e.g. Appointment"
                  autoComplete="off"
                  maxLength={LIMITS.entity.max}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.entity && touched.entity)}
                  aria-describedby={describedBy('entity')}
                  className={fieldClass('entity')}
                  style={{ background: t.inputBg, color: t.txt, borderColor: errors.entity && touched.entity ? '#ef4444' : t.inputBorder }}
                />
                {errors.entity && touched.entity && (
                  <p id="log-entity-error" role="alert" className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{errors.entity}
                  </p>
                )}
              </div>
              <div>
                <Lbl htmlFor="log-module">Module</Lbl>
                <input
                  id="log-module"
                  value={form.module}
                  onChange={(e) => set('module', e.target.value)}
                  onBlur={() => blur('module')}
                  placeholder="e.g. Bookings"
                  autoComplete="off"
                  maxLength={LIMITS.module.max}
                  aria-invalid={Boolean(errors.module && touched.module)}
                  aria-describedby={describedBy('module')}
                  className={fieldClass('module')}
                  style={{ background: t.inputBg, color: t.txt, borderColor: errors.module && touched.module ? '#ef4444' : t.inputBorder }}
                />
                {errors.module && touched.module && (
                  <p id="log-module-error" role="alert" className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{errors.module}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Lbl htmlFor="log-detail" required>Detail / description</Lbl>
              <textarea
                id="log-detail"
                ref={(el) => { fieldRefs.current.detail = el; }}
                value={form.detail}
                rows={4}
                onChange={(e) => set('detail', e.target.value)}
                onBlur={() => blur('detail')}
                placeholder="Describe what happened, what changed, and why (min. 10 characters)…"
                maxLength={LIMITS.detail.max}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.detail && touched.detail)}
                aria-describedby={describedBy('detail')}
                className={`${fieldClass('detail')} resize-y min-h-[96px] leading-relaxed`}
                style={{ background: t.inputBg, color: t.txt, borderColor: errors.detail && touched.detail ? '#ef4444' : t.inputBorder }}
              />
              <div className="flex items-center justify-between mt-1.5 gap-2">
                <div className="min-w-0">
                  {errors.detail && touched.detail ? (
                    <p id="log-detail-error" role="alert" className="text-[11px] flex items-center gap-1" style={{ color: '#dc2626' }}>
                      <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{errors.detail}
                    </p>
                  ) : (
                    <p id="log-detail-hint" className="text-[11px]" style={{ color: t.txtMuted }}>
                      Be specific — include before/after values when relevant.
                    </p>
                  )}
                </div>
                <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: t.txtMuted }} aria-live="off">
                  {form.detail.trim().length}/{LIMITS.detail.max}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Lbl htmlFor="log-ip_address">IP address</Lbl>
                <input
                  id="log-ip_address"
                  value={form.ip_address}
                  onChange={(e) => set('ip_address', e.target.value)}
                  onBlur={() => blur('ip_address')}
                  placeholder="e.g. 192.168.1.1"
                  inputMode="decimal"
                  autoComplete="off"
                  maxLength={LIMITS.ip.max}
                  aria-invalid={Boolean(errors.ip_address && touched.ip_address)}
                  aria-describedby={describedBy('ip_address')}
                  className={fieldClass('ip_address')}
                  style={{ background: t.inputBg, color: t.txt, borderColor: errors.ip_address && touched.ip_address ? '#ef4444' : t.inputBorder }}
                />
                {errors.ip_address && touched.ip_address && (
                  <p id="log-ip_address-error" role="alert" className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{errors.ip_address}
                  </p>
                )}
              </div>
              <div>
                <Lbl htmlFor="log-session_id">Session ID</Lbl>
                <input
                  id="log-session_id"
                  value={form.session_id}
                  onChange={(e) => set('session_id', e.target.value)}
                  onBlur={() => blur('session_id')}
                  placeholder="e.g. sess_abc123"
                  autoComplete="off"
                  maxLength={LIMITS.session.max}
                  aria-invalid={Boolean(errors.session_id && touched.session_id)}
                  aria-describedby={describedBy('session_id')}
                  className={fieldClass('session_id')}
                  style={{ background: t.inputBg, color: t.txt, borderColor: errors.session_id && touched.session_id ? '#ef4444' : t.inputBorder }}
                />
                {errors.session_id && touched.session_id && (
                  <p id="log-session_id-error" role="alert" className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />{errors.session_id}
                  </p>
                )}
              </div>
            </div>

            {preview && (
              <div
                className="p-3.5 rounded-2xl flex items-center gap-3"
                aria-live="polite"
                style={{ background: preview.bg, border: `1px solid ${preview.color}30` }}
              >
                {React.createElement(preview.icon, {
                  className: 'w-4 h-4 flex-shrink-0',
                  style: { color: isDark ? preview.darkColor : preview.color },
                })}
                <p className="text-[11px] font-semibold" style={{ color: isDark ? preview.darkColor : preview.color }}>
                  {preview.label} · {form.entity.trim() || 'Entity'} · {SEVERITY_META[form.severity]?.label ?? 'Info'}
                </p>
              </div>
            )}
          </div>

          <div className="px-5 sm:px-6 pb-6 pt-1 flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-80 focus-visible:outline-2"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 min-h-[48px] py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
              {isLoading ? 'Saving…' : isEdit ? 'Save changes' : 'Create entry'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

/* ─── DETAIL MODAL ─── */
const DetailModal = ({ log, onClose, onEdit, onDelete, t, isDark }) => {
  const { copied, copy } = useCopyToast();
  const closeBtnRef = useRef(null);
  useEffect(() => { closeBtnRef.current?.focus(); }, []);
  if (!log) return null;
  const meta     = ACTION_META[log.action]  || ACTION_META.create;
  const sev      = SEVERITY_META[log.severity] || SEVERITY_META.info;
  const Icon     = meta.icon;
  const SevIcon  = sev.icon;
  const color    = isDark ? meta.darkColor : meta.color;
  const sevColor = isDark ? (sev.darkColor || sev.color) : sev.color;

  return (
    <ModalOverlay onClose={onClose} maxWidth={540} labelledBy="log-detail-title">
      <div style={{ background: t.card }} className="rounded-t-3xl sm:rounded-3xl overflow-hidden">
        <div className="pt-3 pb-1 flex justify-center sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full opacity-30" style={{ background: t.txtMuted }} />
        </div>

        <div className="px-5 sm:px-6 py-5" style={{ background: `${color}0d`, borderBottom: `1px solid ${color}22` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: meta.gradient }}
              >
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p id="log-detail-title" className="font-black text-sm" style={{ color: t.txt }}>
                  Log entry #{log.id}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: t.txtMuted }}>
                  {log.module && <span className="font-semibold">{log.module} · </span>}{log.entity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => { onClose(); onEdit(log); }}
                aria-label={`Edit log entry ${log.id}`}
                title="Edit entry"
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)', color: '#b45309' }}
              >
                <Edit3 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onDelete(log); }}
                aria-label={`Delete log entry ${log.id}`}
                title="Delete entry"
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: isDark ? '#f87171' : '#b91c1c' }}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Close details"
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: meta.bg, color }}>
              <Icon className="w-3 h-3" aria-hidden="true" />{meta.label}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: sev.bg, color: sevColor }}>
              <SevIcon className="w-3 h-3" aria-hidden="true" />{sev.label}
            </span>
            <span className="text-[10px] font-semibold capitalize px-2.5 py-1 rounded-lg" style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
              {log.actor_role || '—'}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="p-4 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: t.txtMuted }}>Description</p>
            <p className="text-xs leading-relaxed break-words" style={{ color: t.txt }}>{log.detail}</p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: 'Actor',  value: log.actor,      icon: User },
              { label: 'Role',   value: log.actor_role, icon: ShieldCheck, capitalize: true },
              { label: 'Time',   value: formatStamp(log.created_at), icon: Clock },
              { label: 'Module', value: log.module || '—', icon: Layers },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
                <dt className="flex items-center gap-1.5 mb-1.5">
                  <item.icon className="w-3 h-3" style={{ color: t.txtMuted }} aria-hidden="true" />
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.txtMuted }}>{item.label}</span>
                </dt>
                <dd className={`text-[11px] font-semibold break-words ${item.capitalize ? 'capitalize' : ''}`} style={{ color: t.txt }}>
                  {item.label === 'Time' && log.created_at
                    ? <time dateTime={log.created_at}>{item.value}</time>
                    : item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="p-4 rounded-2xl space-y-3" style={{ background: t.inner, border: t.innerBorder }}>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Technical details</p>
            {[{ label: 'IP Address', value: log.ip_address }, { label: 'Session ID', value: log.session_id }].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px]" style={{ color: t.txtSub }}>{item.label}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <code className="font-mono text-[10px] px-2 py-1.5 rounded-lg break-all" style={{ background: t.card, border: t.innerBorder, color: t.txt }}>
                    {item.value || '—'}
                  </code>
                  {item.value && (
                    <button
                      type="button"
                      onClick={() => copy(item.value, item.label)}
                      aria-label={copied === item.label ? `${item.label} copied` : `Copy ${item.label}`}
                      title={`Copy ${item.label}`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
                      style={{ background: t.card, border: t.innerBorder, color: t.txtMuted }}
                    >
                      {copied === item.label
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                        : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
            <div className="p-4 rounded-2xl space-y-2.5" style={{ background: t.inner, border: t.innerBorder }}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Payload &amp; change metadata</p>
                <button
                  type="button"
                  onClick={() => copy(JSON.stringify(log.metadata, null, 2), 'metadata')}
                  className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 min-h-[36px] rounded-lg hover:opacity-80 transition-opacity"
                  style={{ background: t.card, border: t.innerBorder, color: t.txtSub }}
                >
                  {copied === 'metadata'
                    ? <CheckCircle className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                    : <Copy className="w-3 h-3" aria-hidden="true" />}
                  {copied === 'metadata' ? 'Copied JSON' : 'Copy JSON'}
                </button>
              </div>
              <div
                className="p-3 rounded-xl font-mono text-[11px] overflow-x-auto"
                style={{ background: isDark ? '#0b101c' : '#f1f5f9', border: t.innerBorder, color: isDark ? '#7ee787' : '#0f172a' }}
              >
                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(log.metadata, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 sm:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] py-3.5 rounded-2xl text-sm font-bold"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const LoadingSkeleton = ({ t }) => (
  <div className="space-y-2.5" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <div key={i} className="p-4 sm:p-5 rounded-2xl animate-pulse" style={{ background: t.card, border: t.cardBorder }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: t.inner }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded-full w-2/3" style={{ background: t.inner }} />
            <div className="h-2.5 rounded-full w-full" style={{ background: t.inner }} />
            <div className="h-2.5 rounded-full w-1/3" style={{ background: t.inner }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════ MAIN ═══════════════ */
const AdminAuditLogs = () => {
  const { theme } = useTheme();
  const t      = TOKENS[theme] || TOKENS.light;
  const isDark = theme === 'dark';
  const accent = isDark ? '#34d399' : '#0a3d30';

  const [logs, setLogs]             = useState(MOCK_LOGS);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  const [search, setSearch]             = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterRole, setFilterRole]     = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [dateError, setDateError]       = useState('');
  const [sortOrder, setSortOrder]       = useState('desc');
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters]   = useState(false);
  const [viewMode, setViewMode]         = useState('cards');

  const [detailLog, setDetailLog]   = useState(null);
  const [editLog, setEditLog]       = useState(null);
  const [deleteLog, setDeleteLog]   = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const [selected, setSelected] = useState(() => new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [toast, setToast]       = useState(null);

  const listTopRef = useRef(null);
  const selectAllRef = useRef(null);
  const toastTimer = useRef(null);
  const bulkTimer = useRef(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (bulkTimer.current) clearTimeout(bulkTimer.current);
  }, []);

  /* ── stat counts: API globals first, full local dataset as fallback ── */
  const mockStats = useMemo(
    () => Object.fromEntries(Object.keys(ACTION_META).map((k) => [k, MOCK_LOGS.filter((l) => l.action === k).length])),
    [],
  );
  const getActionCount = useCallback(
    (key) => (stats && typeof stats[key] !== 'undefined' ? Number(stats[key]) : (mockStats[key] || 0)),
    [stats, mockStats],
  );
  const maxStatCount = Math.max(...Object.keys(ACTION_META).map((k) => getActionCount(k)), 1);

  /* ── date-range sanity: from must not be after to ── */
  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateError('“From” date cannot be later than “To” date.');
    } else {
      setDateError('');
    }
  }, [dateFrom, dateTo]);

  /* ── filtering (client-side; idempotent over server-filtered data) ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = logs.filter((log) => {
      const matchesQuery = !q
        || (log.actor || '').toLowerCase().includes(q)
        || (log.entity || '').toLowerCase().includes(q)
        || (log.detail || '').toLowerCase().includes(q)
        || (log.module || '').toLowerCase().includes(q)
        || (log.ip_address || '').toLowerCase().includes(q)
        || (log.session_id || '').toLowerCase().includes(q);
      if (!matchesQuery) return false;
      if (filterAction !== 'All' && log.action !== filterAction) return false;
      if (filterRole !== 'All' && log.actor_role !== filterRole) return false;
      if (filterModule !== 'All' && log.module !== filterModule) return false;
      if (filterSeverity !== 'All' && log.severity !== filterSeverity) return false;
      const day = logDay(log.created_at);
      if (dateFrom && day && day < dateFrom) return false;
      if (dateTo && day && day > dateTo) return false;
      return true;
    });
    out.sort((a, b) => {
      const ta = a.created_at || '';
      const tb = b.created_at || '';
      return sortOrder === 'desc' ? tb.localeCompare(ta) : ta.localeCompare(tb);
    });
    return out;
  }, [logs, search, filterAction, filterRole, filterModule, filterSeverity, dateFrom, dateTo, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => { setPage(1); }, [search, filterAction, filterRole, filterModule, filterSeverity, dateFrom, dateTo, sortOrder, pageSize]);
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage]);

  const activeCount = [
    filterAction !== 'All', filterRole !== 'All', filterModule !== 'All',
    filterSeverity !== 'All', search.trim() !== '', Boolean(dateFrom), Boolean(dateTo),
  ].filter(Boolean).length;

  const sourceForOptions = apiAvailable && logs.length > 0 ? logs : MOCK_LOGS;
  const optionBase = useMemo(() => {
    const merged = [...MOCK_LOGS, ...sourceForOptions];
    const seen = new Map();
    merged.forEach((l) => { if (!seen.has(l.id)) seen.set(l.id, l); });
    return [...seen.values()];
  }, [sourceForOptions]);
  const allRoles   = useMemo(() => ['All', ...Array.from(new Set(optionBase.map((l) => l.actor_role).filter(Boolean)))], [optionBase]);
  const allModules = useMemo(() => ['All', ...Array.from(new Set(optionBase.map((l) => l.module).filter(Boolean)))], [optionBase]);

  /* ── API fetch: request a wide window once, paginate client-side ──
     (Fixes the old double-pagination bug where server paging + client
      slicing compounded and stat cards disagreed with the list.) */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch.trim() || undefined,
        action: filterAction !== 'All' ? filterAction : undefined,
        role: filterRole !== 'All' ? filterRole : undefined,
        module: filterModule !== 'All' ? filterModule : undefined,
        severity: filterSeverity !== 'All' ? filterSeverity : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort: sortOrder,
        page: 1,
        per_page: 200,
      };
      const res = await axios.get('/admin/audit-logs', { params });
      const data = res.data.logs?.data || res.data.logs || res.data.data || [];
      if (Array.isArray(data)) setLogs(data);
      if (res.data.stats && typeof res.data.stats === 'object') setStats(res.data.stats);
      setApiAvailable(true);
    } catch {
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterAction, filterRole, filterModule, filterSeverity, dateFrom, dateTo, sortOrder]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    let cancelled = false;
    axios.get('/admin/audit-logs', { params: { per_page: 1, page: 1 } })
      .then((res) => {
        if (!cancelled && res.data.stats && typeof res.data.stats === 'object') setStats(res.data.stats);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  /* ── CRUD ── */
  const handleCreate = async (form) => {
    setSaveLoading(true);
    try {
      const res = await axios.post('/admin/audit-logs', form);
      const created = res.data.log || res.data.data || { id: Date.now(), ...form, created_at: new Date().toISOString().slice(0, 16) };
      setLogs((prev) => [created, ...prev]);
      if (res.data.stats) setStats(res.data.stats);
      showToast('success', 'Log entry created.');
    } catch {
      setLogs((prev) => [{ id: Date.now(), ...form, created_at: new Date().toISOString().slice(0, 16) }, ...prev]);
      showToast('success', 'Created locally — server unavailable.');
    } finally {
      setSaveLoading(false);
      setShowCreate(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!editLog) return;
    setSaveLoading(true);
    const id = editLog.id;
    try {
      const res = await axios.put(`/admin/audit-logs/${id}`, form);
      const updated = res.data.log || res.data.data || { ...editLog, ...form };
      setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
      showToast('success', 'Log entry updated.');
    } catch {
      setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...form } : l)));
      showToast('success', 'Updated locally — server unavailable.');
    } finally {
      setSaveLoading(false);
      setEditLog(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteLog) return;
    setDeleteLoading(true);
    const id = deleteLog.id;
    try {
      await axios.delete(`/admin/audit-logs/${id}`);
      showToast('success', `Entry #${id} deleted.`);
    } catch {
      showToast('info', `Entry #${id} removed locally.`);
    } finally {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
      setDeleteLog(null);
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!confirmBulk) {
      setConfirmBulk(true);
      if (bulkTimer.current) clearTimeout(bulkTimer.current);
      bulkTimer.current = setTimeout(() => setConfirmBulk(false), 4000);
      return;
    }
    if (bulkTimer.current) clearTimeout(bulkTimer.current);
    setConfirmBulk(false);
    try {
      await axios.post('/admin/audit-logs/bulk-delete', { ids });
      showToast('success', `${ids.length} ${ids.length > 1 ? 'entries' : 'entry'} deleted.`);
    } catch {
      showToast('info', `${ids.length} ${ids.length > 1 ? 'entries' : 'entry'} removed locally.`);
    }
    setLogs((prev) => prev.filter((l) => !ids.includes(l.id)));
    setSelected(new Set());
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    const stamp = new Date().toISOString().slice(0, 10);
    const downloadBlob = (blob, name) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    };
    try {
      const res = await axios.get('/admin/audit-logs/export', {
        responseType: 'blob',
        params: {
          search: debouncedSearch.trim() || undefined,
          action: filterAction !== 'All' ? filterAction : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      });
      downloadBlob(new Blob([res.data], { type: 'text/csv' }), `audit_logs_${stamp}.csv`);
      showToast('success', 'Audit log exported.');
    } catch {
      try {
        const header = ['ID', 'Actor', 'Role', 'Action', 'Entity', 'Module', 'Detail', 'IP', 'Session', 'Severity', 'Created At'];
        const lines = [header.join(',')];
        filtered.forEach((l) => {
          lines.push([l.id, l.actor, l.actor_role, l.action, l.entity, l.module, l.detail, l.ip_address, l.session_id, l.severity, l.created_at]
            .map(toCSVCell).join(','));
        });
        downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }), `audit_logs_${stamp}.csv`);
        showToast('success', 'Audit log exported (local).');
      } catch {
        showToast('error', 'Export failed. Please try again.');
      }
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }, []);

  const allPaginatedSelected = paginated.length > 0 && paginated.every((l) => selected.has(l.id));
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = !allPaginatedSelected && paginated.some((l) => selected.has(l.id));
  }, [allPaginatedSelected, paginated, selected]);

  const toggleSelectAll = () => {
    if (allPaginatedSelected) setSelected(new Set());
    else setSelected(new Set(paginated.map((l) => l.id)));
  };

  const clearFilters = () => {
    setSearch('');
    setFilterAction('All');
    setFilterRole('All');
    setFilterModule('All');
    setFilterSeverity('All');
    setDateFrom('');
    setDateTo('');
    setDateError('');
  };

  const gotoPage = (p) => {
    setPage(Math.max(1, Math.min(totalPages, p)));
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* Pagination window: 1 … p-2 p-1 p p+1 p+2 … N */
  const pages = useMemo(() => {
    const list = Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1);
    return list.reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
      acc.push(p);
      return acc;
    }, []);
  }, [totalPages, safePage]);

  const viewButtons = [
    { id: 'cards', label: 'Card view', icon: Layers },
    { id: 'table', label: 'Table view', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline view', icon: Clock },
  ];

  return (
    <AdminLayout title="Audit Logs" subtitle="System-wide activity trail for accountability & security" icon={History}>
      <AnimatePresence>
        {detailLog && (
          <DetailModal log={detailLog} onClose={() => setDetailLog(null)} onEdit={(l) => setEditLog(l)} onDelete={(l) => setDeleteLog(l)} t={t} isDark={isDark} />
        )}
        {editLog && (
          <LogFormModal log={editLog} onClose={() => setEditLog(null)} onSave={handleUpdate} t={t} isDark={isDark} isLoading={saveLoading} />
        )}
        {showCreate && (
          <LogFormModal log={null} onClose={() => setShowCreate(false)} onSave={handleCreate} t={t} isDark={isDark} isLoading={saveLoading} />
        )}
        {deleteLog && (
          <ConfirmDeleteModal log={deleteLog} onClose={() => setDeleteLog(null)} onConfirm={handleDelete} t={t} isDark={isDark} deleting={deleteLoading} />
        )}
      </AnimatePresence>

      {/* Toast — polite live region */}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 sm:justify-end sm:pr-6">
        <AnimatePresence>
          {toast && (
            <motion.div
              {...slideIn}
              role="status"
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold max-w-full"
              style={{
                background: toast.type === 'success'
                  ? 'linear-gradient(135deg,#059669,#10b981)'
                  : toast.type === 'error' ? 'linear-gradient(135deg,#991b1b,#dc2626)' : 'linear-gradient(135deg,#062c22,#0a3d30)',
                color: '#fff',
              }}
            >
              {toast.type === 'success'
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                : toast.type === 'error'
                  ? <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  : <Info className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
              <span className="break-words">{toast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4 sm:space-y-5 pb-10" ref={listTopRef}>
        {/* ── STAT CARDS ── */}
        <motion.section {...fadeUp(0)} aria-labelledby="audit-stats-heading">
          <h2 id="audit-stats-heading" className="sr-only">Activity summary by action type</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3 list-none m-0 p-0">
            {Object.entries(ACTION_META).map(([key, meta]) => {
              const MIcon = meta.icon;
              const color = isDark ? meta.darkColor : meta.color;
              const count = getActionCount(key);
              const active = filterAction === key;
              return (
                <li key={key} className="h-full">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFilterAction(active ? 'All' : key)}
                    aria-pressed={active}
                    aria-label={`${active ? 'Clear' : 'Filter by'} ${meta.label}: ${count} ${count === 1 ? 'entry' : 'entries'}`}
                    className="w-full h-full flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all cursor-pointer min-h-[118px] focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background: active ? `${color}16` : t.card,
                      border: active ? `2px solid ${color}60` : t.cardBorder,
                      boxShadow: active ? `0 4px 20px ${color}25` : t.cardShadow,
                    }}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: active ? `${color}28` : `${color}14` }}
                    >
                      <MIcon className="w-4 h-4" style={{ color }} aria-hidden="true" />
                    </span>
                    <span className="text-center w-full">
                      <span className="text-xl sm:text-2xl font-black leading-none block tabular-nums" style={{ color: active ? color : t.txt }}>
                        {count}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest block mt-1" style={{ color: active ? color : t.txtMuted }}>
                        {meta.label}
                      </span>
                      <ProgressBar pct={(count / maxStatCount) * 100} color={color} label={`${meta.label} share of activity`} />
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </motion.section>

        {/* ── TOOLBAR ── */}
        <motion.section {...fadeUp(0.06)} aria-label="Audit log controls">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            <div className="relative flex-1 w-full lg:max-w-sm" role="search">
              <label htmlFor="audit-search" className="sr-only">Search audit logs by actor, entity, detail, module, IP, or session</label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: t.txtMuted }} aria-hidden="true" />
              <input
                id="audit-search"
                type="search"
                placeholder="Search actor, entity, IP, session…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-xs rounded-xl border outline-none transition-shadow"
                style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.txt }}
                onFocus={(e) => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22`; }}
                onBlur={(e) => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = 'none'; }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80"
                  style={{ background: t.txtMuted, color: '#fff' }}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:overflow-x-auto sm:pb-0.5" role="toolbar" aria-label="Log actions">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                aria-controls="audit-filter-panel"
                className="flex items-center gap-1.5 px-3.5 min-h-[44px] py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 flex-shrink-0"
                style={{
                  background: showFilters ? `${accent}18` : t.card,
                  border: showFilters ? `2px solid ${accent}55` : t.cardBorder,
                  color: showFilters ? accent : t.txtSub,
                }}
              >
                <Filter className="w-4 h-4" aria-hidden="true" />
                <span>Filters</span>
                {activeCount > 0 && (
                  <span
                    className="min-w-5 h-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                    style={{ background: accent }}
                    aria-label={`${activeCount} filters active`}
                  >
                    {activeCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSortOrder((v) => (v === 'desc' ? 'asc' : 'desc'))}
                aria-label={sortOrder === 'desc' ? 'Sorted newest first. Activate to sort oldest first.' : 'Sorted oldest first. Activate to sort newest first.'}
                title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
                className="flex items-center gap-1.5 px-3.5 min-h-[44px] py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 flex-shrink-0"
                style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}
              >
                <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
              </button>

              <div className="flex items-center p-1 rounded-xl flex-shrink-0" style={{ background: t.card, border: t.cardBorder }} role="group" aria-label="Change layout">
                {viewButtons.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setViewMode(v.id)}
                    title={v.label}
                    aria-label={v.label}
                    aria-pressed={viewMode === v.id}
                    className="p-2.5 min-w-[44px] min-h-[40px] rounded-lg transition-all flex items-center justify-center"
                    style={{ background: viewMode === v.id ? `${accent}22` : 'transparent', color: viewMode === v.id ? accent : t.txtMuted }}
                  >
                    <v.icon className="w-4 h-4" aria-hidden="true" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={fetchLogs}
                disabled={loading}
                aria-label={loading ? 'Refreshing audit logs…' : 'Refresh audit logs'}
                title="Refresh"
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:opacity-80 flex-shrink-0 disabled:opacity-50"
                style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}
              >
                <RefreshCw className={`w-4 h-4${loading ? ' animate-spin' : ''}`} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || filtered.length === 0}
                className="flex items-center gap-1.5 px-4 min-h-[44px] py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}
              >
                {exporting
                  ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                  : <Download className="w-4 h-4" aria-hidden="true" />}
                <span>{exporting ? 'Exporting…' : 'Export'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 min-h-[44px] py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>New log</span>
              </button>
            </div>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                id="audit-filter-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden mt-3"
              >
                <div className="p-4 sm:p-5 rounded-2xl space-y-5" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <fieldset className="min-w-0">
                      <legend className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Role</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {allRoles.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFilterRole(r)}
                            aria-pressed={filterRole === r}
                            className="px-3 py-2 min-h-[36px] rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer active:scale-95"
                            style={{
                              background: filterRole === r ? `${accent}18` : t.inner,
                              border: filterRole === r ? `2px solid ${accent}55` : t.innerBorder,
                              color: filterRole === r ? accent : t.txtSub,
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className="min-w-0">
                      <legend className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Module</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {allModules.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setFilterModule(m)}
                            aria-pressed={filterModule === m}
                            className="px-3 py-2 min-h-[36px] rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                            style={{
                              background: filterModule === m ? `${accent}18` : t.inner,
                              border: filterModule === m ? `2px solid ${accent}55` : t.innerBorder,
                              color: filterModule === m ? accent : t.txtSub,
                            }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className="min-w-0">
                      <legend className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Severity</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {['All', 'info', 'warning', 'danger'].map((s) => {
                          const sm = s !== 'All' ? SEVERITY_META[s] : null;
                          const clr = sm ? (isDark ? sm.darkColor : sm.color) : accent;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setFilterSeverity(s)}
                              aria-pressed={filterSeverity === s}
                              className="px-3 py-2 min-h-[36px] rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer active:scale-95"
                              style={{
                                background: filterSeverity === s ? `${clr}18` : t.inner,
                                border: filterSeverity === s ? `2px solid ${clr}55` : t.innerBorder,
                                color: filterSeverity === s ? clr : t.txtSub,
                              }}
                            >
                              {s === 'danger' ? 'Critical' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                    <fieldset className="min-w-0">
                      <legend className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Date range</legend>
                      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-1 min-[1100px]:grid-cols-2 gap-2">
                        <div>
                          <label htmlFor="audit-date-from" className="sr-only">From date</label>
                          <DatePickerInput value={dateFrom} onChange={setDateFrom} placeholder="From date" isDark={isDark} className="w-full" />
                        </div>
                        <div>
                          <label htmlFor="audit-date-to" className="sr-only">To date</label>
                          <DatePickerInput value={dateTo} onChange={setDateTo} placeholder="To date" isDark={isDark} className="w-full" />
                        </div>
                      </div>
                      {dateError && (
                        <p role="alert" className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: '#dc2626' }}>
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />{dateError}
                        </p>
                      )}
                    </fieldset>
                  </div>
                  {activeCount > 0 && (
                    <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                      <p className="text-[11px]" style={{ color: t.txtMuted }} aria-live="polite">
                        {activeCount} filter{activeCount > 1 ? 's' : ''} active
                      </p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-[11px] font-bold px-4 py-2.5 min-h-[40px] rounded-xl hover:opacity-80 transition-opacity"
                        style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', color: isDark ? '#f87171' : '#b91c1c' }}
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── BULK BAR (two-step confirm prevents accidents) ── */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              {...slideIn}
              role="status"
              aria-live="polite"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl"
              style={{ background: isDark ? 'rgba(248,113,113,0.08)' : 'rgba(220,38,38,0.05)', border: `2px solid ${(isDark ? '#f87171' : '#b91c1c')}35` }}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? '#f87171' : '#b91c1c' }} aria-hidden="true" />
                <p className="text-xs font-bold" style={{ color: isDark ? '#f87171' : '#b91c1c' }}>
                  {selected.size} {selected.size > 1 ? 'entries' : 'entry'} selected
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setSelected(new Set()); setConfirmBulk(false); }}
                  className="text-[11px] font-bold px-4 py-2.5 min-h-[40px] rounded-lg"
                  style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
                >
                  Deselect all
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2.5 min-h-[40px] rounded-lg text-white"
                  style={{ background: confirmBulk ? 'linear-gradient(135deg,#7f1d1d,#991b1b)' : 'linear-gradient(135deg,#991b1b,#dc2626)' }}
                  aria-live="polite"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  {confirmBulk ? `Confirm delete (${selected.size})` : 'Delete selected'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULTS META ── */}
        <div className="flex items-center justify-between flex-wrap gap-2" aria-live="polite">
          <p className="text-[11px]" style={{ color: t.txtMuted }}>
            Showing <strong style={{ color: t.txt }}>{paginated.length}</strong> of{' '}
            <strong style={{ color: t.txt }}>{filtered.length}</strong> {filtered.length === 1 ? 'entry' : 'entries'}
            {activeCount > 0 && <span> · {activeCount} filter{activeCount > 1 ? 's' : ''} active</span>}
            {!apiAvailable && <span> · offline preview</span>}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="audit-page-size" className="text-[11px]" style={{ color: t.txtMuted }}>Show</label>
            <div className="relative">
              <select
                id="audit-page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-[11px] font-bold pl-2.5 pr-8 py-2 min-h-[36px] rounded-lg border outline-none cursor-pointer appearance-none"
                style={{ background: t.inner, borderColor: t.inputBorder, color: t.txtSub }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: t.txtMuted }} aria-hidden="true" />
            </div>
            <p className="text-[11px] tabular-nums" style={{ color: t.txtMuted }} aria-label={`Page ${safePage} of ${totalPages}`}>
              Page {safePage}/{totalPages}
            </p>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div aria-busy={loading} aria-live="off">
          {loading ? (
            <>
              <p className="sr-only" role="status">Loading audit logs…</p>
              <LoadingSkeleton t={t} />
            </>
          ) : dateError ? (
            <motion.div {...fadeUp(0.1)} className="py-14 sm:py-16 text-center rounded-3xl px-6" style={{ background: t.card, border: t.cardBorder }} role="alert">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.1)' }}>
                <AlertTriangle className="w-7 h-7" style={{ color: '#dc2626' }} aria-hidden="true" />
              </div>
              <p className="font-black text-base" style={{ color: t.txt }}>Invalid date range</p>
              <p className="text-xs mt-1.5 mb-5" style={{ color: t.txtMuted }}>{dateError}</p>
              <button
                type="button"
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}
              >
                Clear dates
              </button>
            </motion.div>
          ) : paginated.length === 0 ? (
            <motion.div {...fadeUp(0.1)} className="py-14 sm:py-20 text-center rounded-3xl px-6" style={{ background: t.card, border: t.cardBorder }} role="status">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: t.inner }}>
                <History className="w-8 h-8" style={{ color: t.txtMuted }} aria-hidden="true" />
              </div>
              <p className="font-black text-base" style={{ color: t.txt }}>No matching log entries</p>
              <p className="text-xs mt-1.5 mb-5" style={{ color: t.txtMuted }}>
                {search ? `No results for “${search.trim()}”.` : 'Try adjusting your filters.'}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="px-5 py-3 min-h-[44px] rounded-xl text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}
              >
                Reset all filters
              </button>
            </motion.div>
          ) : viewMode === 'table' ? (
            <motion.div {...fadeUp(0.08)} className="rounded-2xl overflow-hidden" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <caption className="sr-only">Audit log entries. Activate a row to view full details.</caption>
                  <thead>
                    <tr style={{ background: t.tableHead }}>
                      <th scope="col" className="px-4 py-3 w-12">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={allPaginatedSelected}
                          onChange={toggleSelectAll}
                          aria-label={allPaginatedSelected ? 'Deselect all entries on this page' : 'Select all entries on this page'}
                          className="w-4 h-4 cursor-pointer rounded accent-emerald-700"
                        />
                      </th>
                      {['Actor', 'Action', 'Entity', 'Module', 'Severity', 'Time', 'Details'].map((h) => (
                        <th key={h} scope="col" className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: t.txtMuted }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {paginated.map((log) => {
                        const meta  = ACTION_META[log.action]  || ACTION_META.create;
                        const sev   = SEVERITY_META[log.severity] || SEVERITY_META.info;
                        const MIcon  = meta.icon;
                        const color = isDark ? meta.darkColor : meta.color;
                        const sevColor = isDark ? (sev.darkColor || sev.color) : sev.color;
                        const isSel = selected.has(log.id);
                        return (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group cursor-pointer transition-colors"
                            style={{ background: isSel ? `${accent}0d` : 'transparent', borderTop: t.innerBorder }}
                            onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = t.hover; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = isSel ? `${accent}0d` : 'transparent'; }}
                            onClick={() => setDetailLog(log)}
                            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); setDetailLog(log); } }}
                            tabIndex={0}
                            aria-label={`${log.actor}, ${meta.label} on ${log.entity}, ${formatStamp(log.created_at)}. Press Enter for details.`}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => toggleSelect(log.id)}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Select log entry ${log.id} by ${log.actor}`}
                                className="w-4 h-4 cursor-pointer rounded accent-emerald-700"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar name={log.actor} color={color} size={30} />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold whitespace-nowrap" style={{ color: t.txt }}>{log.actor}</p>
                                  <p className="text-[9px] capitalize" style={{ color: t.txtMuted }}>{log.actor_role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 whitespace-nowrap" style={{ background: meta.bg, color }}>
                                <MIcon className="w-3 h-3" aria-hidden="true" />{meta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-[11px] font-semibold whitespace-nowrap" style={{ color: t.txt }}>{log.entity}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap" style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                                {log.module || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 whitespace-nowrap" style={{ background: sev.bg, color: sevColor }}>
                                {React.createElement(sev.icon, { className: 'w-2.5 h-2.5' })}
                                {sev.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <time dateTime={log.created_at} className="text-[10px] whitespace-nowrap tabular-nums" style={{ color: t.txtMuted }}>
                                {formatStamp(log.created_at)}
                              </time>
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setDetailLog(log)}
                                  aria-label={`View details of log ${log.id}`}
                                  title="View details"
                                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-70"
                                  style={{ background: `${color}18`, color }}
                                >
                                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditLog(log)}
                                  aria-label={`Edit log ${log.id}`}
                                  title="Edit"
                                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-70"
                                  style={{ background: 'rgba(217,119,6,0.12)', color: '#b45309' }}
                                >
                                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteLog(log)}
                                  aria-label={`Delete log ${log.id}`}
                                  title="Delete"
                                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-70"
                                  style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', color: isDark ? '#f87171' : '#b91c1c' }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : viewMode === 'timeline' ? (
            <motion.div {...fadeUp(0.08)} className="p-4 sm:p-6 rounded-2xl relative" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
              <div className="absolute left-[31px] sm:left-[39px] top-10 bottom-10 w-0.5 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)' }} aria-hidden="true" />
              <ol className="space-y-4 sm:space-y-5 relative list-none m-0 p-0">
                <AnimatePresence mode="popLayout">
                  {paginated.map((log) => {
                    const meta  = ACTION_META[log.action]  || ACTION_META.create;
                    const MIcon  = meta.icon;
                    const color = isDark ? meta.darkColor : meta.color;
                    return (
                      <motion.li
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                      >
                        <div className="flex items-start gap-3 sm:gap-5">
                          <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 shadow-md"
                            style={{ background: meta.gradient }}
                          >
                            <MIcon className="w-4 h-4 text-white" aria-hidden="true" />
                          </div>
                          <div
                            className="flex-1 min-w-0 p-3.5 sm:p-4 rounded-2xl transition-colors cursor-pointer"
                            style={{ background: t.inner, border: t.innerBorder }}
                            onClick={() => setDetailLog(log)}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}45`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setDetailLog(log); }}
                                  className="font-bold text-xs text-left hover:underline underline-offset-2"
                                  style={{ color: t.txt }}
                                >
                                  {log.actor}
                                </button>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color }}>{meta.label}</span>
                                <span className="text-[10px] break-words" style={{ color: t.txtMuted }}>({log.entity})</span>
                              </div>
                              <time dateTime={log.created_at} className="text-[10px] font-mono tabular-nums flex-shrink-0" style={{ color: t.txtMuted }}>
                                {formatStamp(log.created_at)}
                              </time>
                            </div>
                            <p className="text-xs leading-relaxed break-words" style={{ color: t.txtSub }}>{log.detail}</p>
                            <div className="flex items-center gap-x-3 gap-y-1 mt-2 text-[10px] flex-wrap" style={{ color: t.txtMuted }}>
                              <span>Module: <strong style={{ color: t.txtSub }}>{log.module || '—'}</strong></span>
                              <span>IP: <strong style={{ color: t.txtSub }}>{log.ip_address || '—'}</strong></span>
                              <span className="capitalize">{log.actor_role}</span>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ol>
            </motion.div>
          ) : (
            <div className="space-y-2.5" role="list" aria-label="Audit log entries">
              <AnimatePresence mode="popLayout">
                {paginated.map((log) => {
                  const meta  = ACTION_META[log.action]  || ACTION_META.create;
                  const sev   = SEVERITY_META[log.severity] || SEVERITY_META.info;
                  const MIcon  = meta.icon;
                  const color = isDark ? meta.darkColor : meta.color;
                  const sevColor = isDark ? (sev.darkColor || sev.color) : sev.color;
                  const isSel = selected.has(log.id);
                  return (
                    <motion.article
                      key={log.id}
                      role="listitem"
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.24 }}
                      aria-labelledby={`audit-title-${log.id}`}
                    >
                      <div
                        className="group relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200"
                        style={{
                          background: isSel ? `${accent}0d` : t.card,
                          border: isSel ? `2px solid ${accent}50` : t.cardBorder,
                          boxShadow: t.cardShadow,
                        }}
                        onClick={() => setDetailLog(log)}
                        onMouseEnter={(e) => {
                          if (!isSel) e.currentTarget.style.borderColor = `${color}40`;
                          e.currentTarget.style.transform = 'translateX(3px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '';
                          e.currentTarget.style.transform = '';
                        }}
                      >
                        <div className="flex-shrink-0 pt-0.5">
                          <Avatar name={log.actor} color={color} size={42} />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                            <button
                              type="button"
                              id={`audit-title-${log.id}`}
                              onClick={(e) => { e.stopPropagation(); setDetailLog(log); }}
                              className="font-black text-xs sm:text-sm text-left hover:underline underline-offset-2"
                              style={{ color: t.txt }}
                            >
                              {log.actor}
                            </button>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: meta.bg, color }}>
                              <MIcon className="w-2.5 h-2.5" aria-hidden="true" />{meta.label}
                            </span>
                            <span className="text-[10px]" style={{ color: t.txtMuted }}>on</span>
                            <span className="text-[11px] font-semibold break-words" style={{ color: t.txtSub }}>{log.entity}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1" style={{ background: sev.bg, color: sevColor }}>
                              {React.createElement(sev.icon, { className: 'w-2.5 h-2.5' })}
                              {sev.label}
                            </span>
                          </div>

                          <p className="text-[11px] sm:text-xs line-clamp-2 leading-relaxed break-words" style={{ color: t.txtSub }}>{log.detail}</p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                            <span className="text-[10px] inline-flex items-center gap-1 tabular-nums" style={{ color: t.txtMuted }}>
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              <time dateTime={log.created_at}>{formatStamp(log.created_at)}</time>
                            </span>
                            {log.ip_address && (
                              <span className="text-[10px] items-center gap-1 hidden md:inline-flex" style={{ color: t.txtMuted }}>
                                <Globe className="w-3 h-3" aria-hidden="true" />{log.ip_address}
                              </span>
                            )}
                            {log.module && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                                {log.module}
                              </span>
                            )}
                            <span className="text-[10px] capitalize font-medium px-1.5 py-0.5 rounded-md" style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                              {log.actor_role}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleSelect(log.id)}
                            aria-pressed={isSel}
                            aria-label={isSel ? `Deselect log ${log.id}` : `Select log ${log.id}`}
                            title={isSel ? 'Deselect' : 'Select'}
                            className="sm:hidden w-11 h-11 rounded-xl flex items-center justify-center transition-opacity"
                            style={{ background: isSel ? `${accent}22` : t.inner, border: t.innerBorder, color: isSel ? accent : t.txtMuted }}
                          >
                            <CheckCircle className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <div className="hidden sm:flex items-center gap-1.5 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setEditLog(log)}
                              aria-label={`Edit log ${log.id}`}
                              title="Edit"
                              className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                              style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)', color: '#b45309' }}
                            >
                              <Edit3 className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteLog(log)}
                              aria-label={`Delete log ${log.id}`}
                              title="Delete"
                              className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                              style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: isDark ? '#f87171' : '#b91c1c' }}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDetailLog(log)}
                            aria-label={`View details of log ${log.id}`}
                            title="View details"
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity"
                            style={{ background: `${color}14`, border: `1px solid ${color}30`, color }}
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <motion.nav {...fadeUp(0.1)} aria-label="Audit log pages" className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => gotoPage(1)}
              disabled={safePage === 1}
              aria-label="Go to first page"
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}
            >
              <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => gotoPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Go to previous page"
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            {pages.map((p, idx) => (
              p === '…' ? (
                <span key={`gap-${idx}`} className="text-xs px-1 select-none" style={{ color: t.txtMuted }} aria-hidden="true">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => gotoPage(p)}
                  aria-label={`Go to page ${p}`}
                  aria-current={safePage === p ? 'page' : undefined}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl text-xs font-bold transition-all hover:opacity-80 active:scale-95"
                  style={{
                    background: safePage === p ? 'linear-gradient(135deg,#062c22,#0a3d30)' : t.card,
                    border: safePage === p ? 'none' : t.cardBorder,
                    color: safePage === p ? '#fff' : t.txtSub,
                    boxShadow: safePage === p ? '0 4px 12px rgba(10,61,48,0.3)' : 'none',
                  }}
                >
                  {p}
                </button>
              )
            ))}

            <button
              type="button"
              onClick={() => gotoPage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="Go to next page"
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => gotoPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Go to last page"
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}
            >
              <ChevronsRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.nav>
        )}

        {/* ── FOOTER ── */}
        <footer className="flex items-center gap-2 justify-center pt-2 flex-wrap px-2">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.txtMuted }} aria-hidden="true" />
          <p className="text-[10px] sm:text-[11px] text-center leading-relaxed" style={{ color: t.txtMuted }}>
            Records retained 12 months · Exported logs encrypted at rest · Last synced{' '}
            <time dateTime={new Date().toISOString()}>
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </time>
            {!apiAvailable && <span className="ml-1 font-bold" style={{ color: '#b45309' }}> · Local preview mode</span>}
          </p>
        </footer>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
