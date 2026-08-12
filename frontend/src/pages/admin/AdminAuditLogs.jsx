import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import axios from '../../api/axios';
import {
  History, Search, ShieldCheck, PlusCircle, Pencil,
  Trash2, LogIn, Settings as SettingsIcon, X, Eye,
  Download, Filter, Clock, User, Globe,
  AlertTriangle, RefreshCw, CheckCircle, Info, Copy,
  ArrowUpDown, ChevronLeft, ChevronRight,
  Edit3, Layers, BarChart3,
  ChevronDown, Save, Plus, AlertCircle,
} from 'lucide-react';

const TOKENS = {
  light: {
    card: 'rgba(255,255,255,0.97)', cardShadow: '0 2px 24px rgba(0,0,0,0.07)',
    cardBorder: '1px solid rgba(0,0,0,0.07)', inner: '#f8f9fc',
    innerBorder: '1px solid rgba(0,0,0,0.06)', txt: '#0f172a',
    txtMuted: '#94a3b8', txtSub: '#475569', hover: 'rgba(0,0,0,0.025)',
    inputBg: '#fff', inputBorder: 'rgba(0,0,0,0.12)', tableHead: '#f1f5f9',
  },
  dark: {
    card: '#161d2c', cardShadow: '0 4px 32px rgba(0,0,0,0.45)',
    cardBorder: '1px solid rgba(255,255,255,0.07)', inner: '#111827',
    innerBorder: '1px solid rgba(255,255,255,0.06)', txt: '#e2e8f0',
    txtMuted: '#4e5e72', txtSub: '#7b8da4', hover: 'rgba(255,255,255,0.03)',
    inputBg: 'rgba(255,255,255,0.05)', inputBorder: 'rgba(255,255,255,0.1)', tableHead: '#1e2a3a',
  },
};

const ACTION_META = {
  create: { label: 'Created', icon: PlusCircle,   color: '#10b981', bg: 'rgba(16,185,129,0.12)',  darkColor: '#34d399', severity: 'info',    gradient: 'linear-gradient(135deg,#059669,#10b981)' },
  update: { label: 'Updated', icon: Pencil,       color: '#d97706', bg: 'rgba(217,119,6,0.12)',   darkColor: '#fbbf24', severity: 'warning', gradient: 'linear-gradient(135deg,#b45309,#d97706)' },
  delete: { label: 'Deleted', icon: Trash2,       color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   darkColor: '#f87171', severity: 'danger',  gradient: 'linear-gradient(135deg,#991b1b,#dc2626)' },
  login:  { label: 'Login',   icon: LogIn,        color: '#4f46e5', bg: 'rgba(79,70,229,0.12)',   darkColor: '#818cf8', severity: 'info',    gradient: 'linear-gradient(135deg,#3730a3,#4f46e5)' },
  config: { label: 'Config',  icon: SettingsIcon, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', darkColor: '#a78bfa', severity: 'warning', gradient: 'linear-gradient(135deg,#5b21b6,#7c3aed)' },
  access: { label: 'Access',  icon: ShieldCheck,  color: '#0a3d30', bg: 'rgba(10,61,48,0.12)',   darkColor: '#34d399', severity: 'info',    gradient: 'linear-gradient(135deg,#062c22,#0a3d30)' },
};

const SEVERITY_META = {
  info:    { icon: Info,          color: '#4f46e5', bg: 'rgba(79,70,229,0.1)',  label: 'Info',     darkColor: '#818cf8' },
  warning: { icon: AlertTriangle, color: '#d97706', bg: 'rgba(217,119,6,0.1)', label: 'Warning',  darkColor: '#fbbf24' },
  danger:  { icon: AlertCircle,   color: '#dc2626', bg: 'rgba(220,38,38,0.1)', label: 'Critical', darkColor: '#f87171' },
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

const useCopyToast = () => {
  const [copied, setCopied] = useState('');
  const copy = useCallback((text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  }, []);
  return { copied, copy };
};

const Avatar = ({ name, color, size = 36 }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '22', border: '2px solid ' + color + '40',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 800, color, flexShrink: 0, letterSpacing: '-0.5px',
    }}>{initials}</div>
  );
};

const ProgressBar = ({ pct, color }) => (
  <div style={{ height: 3, borderRadius: 99, background: color + '20', overflow: 'hidden', marginTop: 4 }}>
    <motion.div
      style={{ height: '100%', background: color, borderRadius: 99 }}
      initial={{ width: 0 }} animate={{ width: pct + '%' }}
      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} />
  </div>
);

const ModalOverlay = ({ children, onClose, maxWidth = 560 }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="w-full rounded-t-3xl sm:rounded-3xl overflow-y-auto"
        style={{ maxWidth, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ─── CONFIRM DELETE ────────────────────────────────────────────── */
const ConfirmDeleteModal = ({ log, onConfirm, onClose, t, isDark }) => {
  if (!log) return null;
  const dangerColor = isDark ? '#f87171' : '#dc2626';
  return (
    <ModalOverlay onClose={onClose} maxWidth={440}>
      <div style={{ background: t.card, border: t.cardBorder }} className="rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)' }}>
            <Trash2 className="w-6 h-6" style={{ color: dangerColor }} />
          </div>
          <div>
            <p className="font-black text-base" style={{ color: t.txt }}>Delete Log #{log.id}?</p>
            <p className="text-xs mt-0.5" style={{ color: t.txtMuted }}>This cannot be undone.</p>
          </div>
        </div>
        <div className="p-3.5 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
          <p className="text-xs font-semibold" style={{ color: t.txtSub }}>{log.actor} · {log.action} · {log.entity}</p>
          <p className="text-[11px] mt-1 line-clamp-2" style={{ color: t.txtMuted }}>{log.detail}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-80"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)' }}>Delete Entry</button>
        </div>
      </div>
    </ModalOverlay>
  );
};

/* ─── LOG FORM (Create / Edit) ──────────────────────────────────── */
const LogFormModal = ({ log, onSave, onClose, t, isDark, isLoading }) => {
  const isEdit = !!(log && log.id);
  const accent = isDark ? '#34d399' : '#0a3d30';
  const [form, setForm] = useState({
    actor:      (log && log.actor)      || '',
    actor_role: (log && log.actor_role) || 'admin',
    action:     (log && log.action)     || 'create',
    entity:     (log && log.entity)     || '',
    module:     (log && log.module)     || '',
    detail:     (log && log.detail)     || '',
    ip_address: (log && log.ip_address) || '',
    session_id: (log && log.session_id) || '',
    severity:   (log && log.severity)   || 'info',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };
  const validate = () => {
    const e = {};
    if (!form.actor.trim())  e.actor  = 'Actor is required';
    if (!form.entity.trim()) e.entity = 'Entity is required';
    if (!form.detail.trim()) e.detail = 'Detail is required';
    setErrors(e);
    return !Object.keys(e).length;
  };
  const handleSubmit = () => { if (validate()) onSave(form); };

  const Lbl = ({ txt }) => (
    <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: t.txtMuted }}>{txt}</p>
  );
  const inputStyle = (k) => ({
    background: t.inputBg, color: t.txt,
    borderColor: errors[k] ? '#ef4444' : t.inputBorder,
  });

  return (
    <ModalOverlay onClose={onClose} maxWidth={580}>
      <div style={{ background: t.card, border: t.cardBorder }} className="rounded-t-3xl sm:rounded-3xl">
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full opacity-30" style={{ background: t.txtMuted }} />
        </div>
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: t.innerBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: isEdit ? 'rgba(217,119,6,0.12)' : 'rgba(16,185,129,0.12)' }}>
              {isEdit ? <Edit3 className="w-4 h-4" style={{ color: '#d97706' }} />
                      : <Plus  className="w-4 h-4" style={{ color: '#10b981' }} />}
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: t.txt }}>
                {isEdit ? 'Edit Log Entry #' + log.id : 'Create Log Entry'}
              </p>
              <p className="text-[10px]" style={{ color: t.txtMuted }}>
                {isEdit ? 'Modify the audit record' : 'Manually add an audit record'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Lbl txt="Actor Name" />
              <input value={form.actor} onChange={e => set('actor', e.target.value)} placeholder="e.g. System Admin"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none" style={inputStyle('actor')} />
              {errors.actor && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.actor}</p>}
            </div>
            <div>
              <Lbl txt="Actor Role" />
              <div className="relative">
                <select value={form.actor_role} onChange={e => set('actor_role', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none appearance-none cursor-pointer"
                  style={{ background: t.inputBg, color: t.txt, borderColor: t.inputBorder }}>
                  {['admin','staff','therapist','client','system'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: t.txtMuted }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Lbl txt="Action Type" />
              <div className="relative">
                <select value={form.action} onChange={e => set('action', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none appearance-none cursor-pointer"
                  style={{ background: t.inputBg, color: t.txt, borderColor: t.inputBorder }}>
                  {Object.entries(ACTION_META).map(([v,m]) => <option key={v} value={v}>{m.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: t.txtMuted }} />
              </div>
            </div>
            <div>
              <Lbl txt="Severity" />
              <div className="relative">
                <select value={form.severity} onChange={e => set('severity', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none appearance-none cursor-pointer"
                  style={{ background: t.inputBg, color: t.txt, borderColor: t.inputBorder }}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Critical</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: t.txtMuted }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Lbl txt="Entity / Resource" />
              <input value={form.entity} onChange={e => set('entity', e.target.value)} placeholder="e.g. Appointment"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none" style={inputStyle('entity')} />
              {errors.entity && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.entity}</p>}
            </div>
            <div>
              <Lbl txt="Module" />
              <input value={form.module} onChange={e => set('module', e.target.value)} placeholder="e.g. Bookings"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                style={{ background: t.inputBg, color: t.txt, borderColor: t.inputBorder }} />
            </div>
          </div>

          <div>
            <Lbl txt="Detail / Description" />
            <textarea value={form.detail} rows={3} onChange={e => set('detail', e.target.value)}
              placeholder="Describe what happened..." style={inputStyle('detail')}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none resize-none" />
            {errors.detail && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.detail}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Lbl txt="IP Address" />
              <input value={form.ip_address} onChange={e => set('ip_address', e.target.value)} placeholder="e.g. 192.168.1.1"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                style={{ background: t.inputBg, color: t.txt, borderColor: t.inputBorder }} />
            </div>
            <div>
              <Lbl txt="Session ID" />
              <input value={form.session_id} onChange={e => set('session_id', e.target.value)} placeholder="e.g. sess_abc123"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                style={{ background: t.inputBg, color: t.txt, borderColor: t.inputBorder }} />
            </div>
          </div>

          {form.action && ACTION_META[form.action] && (
            <div className="p-3.5 rounded-2xl flex items-center gap-3"
              style={{ background: ACTION_META[form.action].bg, border: '1px solid ' + ACTION_META[form.action].color + '20' }}>
              {React.createElement(ACTION_META[form.action].icon, {
                className: 'w-4 h-4 flex-shrink-0',
                style: { color: isDark ? ACTION_META[form.action].darkColor : ACTION_META[form.action].color }
              })}
              <p className="text-[11px] font-semibold" style={{ color: isDark ? ACTION_META[form.action].darkColor : ACTION_META[form.action].color }}>
                {ACTION_META[form.action].label} · {form.entity || 'Entity'} · {SEVERITY_META[form.severity] ? SEVERITY_META[form.severity].label : 'Info'}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 pb-6 pt-2 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-80"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Entry'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

/* ─── DETAIL MODAL ──────────────────────────────────────────────── */
const DetailModal = ({ log, onClose, onEdit, onDelete, t, isDark }) => {
  const { copied, copy } = useCopyToast();
  if (!log) return null;
  const meta     = ACTION_META[log.action]  || ACTION_META.create;
  const sev      = SEVERITY_META[log.severity] || SEVERITY_META.info;
  const Icon     = meta.icon;
  const SevIcon  = sev.icon;
  const color    = isDark ? meta.darkColor : meta.color;
  const sevColor = isDark ? (sev.darkColor || sev.color) : sev.color;

  return (
    <ModalOverlay onClose={onClose} maxWidth={520}>
      <div style={{ background: t.card }} className="rounded-t-3xl sm:rounded-3xl overflow-hidden">
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full opacity-30" style={{ background: t.txtMuted }} />
        </div>

        <div className="px-5 sm:px-6 py-5" style={{ background: color + '0d', borderBottom: '1px solid ' + color + '20' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: meta.gradient }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm truncate" style={{ color: t.txt }}>Log Entry #{log.id}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: t.txtMuted }}>
                  {log.module && <span className="font-semibold">{log.module} · </span>}{log.entity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => { onClose(); onEdit(log); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.2)', color: '#d97706' }}>
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { onClose(); onDelete(log); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: isDark ? '#f87171' : '#dc2626' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: meta.bg, color }}>
              <Icon className="w-3 h-3" />{meta.label}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: sev.bg, color: sevColor }}>
              <SevIcon className="w-3 h-3" />{sev.label}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="p-4 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: t.txtMuted }}>Description</p>
            <p className="text-xs leading-relaxed" style={{ color: t.txt }}>{log.detail}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Actor',  value: log.actor,      icon: User },
              { label: 'Role',   value: log.actor_role, icon: ShieldCheck },
              { label: 'Time',   value: (log.created_at || '').slice(0,16), icon: Clock },
              { label: 'Module', value: log.module || '—', icon: Layers },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <item.icon className="w-3 h-3" style={{ color: t.txtMuted }} />
                  <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.txtMuted }}>{item.label}</p>
                </div>
                <p className="text-[11px] font-semibold capitalize" style={{ color: t.txt }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl space-y-3" style={{ background: t.inner, border: t.innerBorder }}>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Technical Details</p>
            {[{ label: 'IP Address', value: log.ip_address }, { label: 'Session ID', value: log.session_id }].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <span className="text-[10px]" style={{ color: t.txtSub }}>{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-1 rounded-lg" style={{ background: t.card, border: t.innerBorder, color: t.txt }}>
                    {item.value || '—'}
                  </span>
                  {item.value && (
                    <button onClick={() => copy(item.value, item.label)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
                      style={{ background: t.card, border: t.innerBorder, color: t.txtMuted }}>
                      {copied === item.label ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Metadata / Changed Data Payload Inspector */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="p-4 rounded-2xl space-y-2.5" style={{ background: t.inner, border: t.innerBorder }}>
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Payload & Change Metadata</p>
                <button onClick={() => copy(JSON.stringify(log.metadata, null, 2), 'metadata')}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ background: t.card, border: t.innerBorder, color: t.txtSub }}>
                  {copied === 'metadata' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied === 'metadata' ? 'Copied JSON' : 'Copy JSON'}
                </button>
              </div>
              <div className="p-3 rounded-xl font-mono text-[11px] overflow-x-auto"
                style={{ background: isDark ? '#0d1117' : '#f8fafc', border: t.innerBorder, color: isDark ? '#7ee787' : '#0969da' }}>
                <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 sm:hidden">
          <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-sm font-bold"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>Close</button>
        </div>
      </div>
    </ModalOverlay>
  );
};

/* ═══════════════════════════════════ MAIN ══════════════════════════ */
const AdminAuditLogs = () => {
  const { theme } = useTheme();
  const t      = TOKENS[theme] || TOKENS.light;
  const isDark = theme === 'dark';
  const accent = isDark ? '#34d399' : '#0a3d30';

  const [logs, setLogs]             = useState(MOCK_LOGS);
  const [stats, setStats]           = useState({}); // global action counts from API
  const [loading, setLoading]       = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  const [search, setSearch]             = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterRole, setFilterRole]     = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [sortOrder, setSortOrder]       = useState('desc');
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters]   = useState(false);
  const [viewMode, setViewMode]         = useState('cards');

  const [detailLog, setDetailLog]   = useState(null);
  const [editLog, setEditLog]       = useState(null);
  const [deleteLog, setDeleteLog]   = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const [selected, setSelected] = useState(new Set());
  const [toast, setToast]       = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  /* ── stat counts: prefer API global stats, fall back to full MOCK_LOGS counts ── */
  // IMPORTANT: always count from the *full* dataset, never from the paginated `logs` slice
  const mockStats = Object.fromEntries(Object.keys(ACTION_META).map(k => [k, MOCK_LOGS.filter(l => l.action === k).length]));
  const getActionCount = (key) => (stats && typeof stats[key] !== 'undefined') ? Number(stats[key]) : (mockStats[key] || 0);
  const maxStatCount = Math.max(...Object.keys(ACTION_META).map(k => getActionCount(k)), 1);

  /* ── filtering ── */
  const filtered = logs
    .filter(log => {
      const q = search.toLowerCase();
      const ms = !q ||
        (log.actor || '').toLowerCase().includes(q) ||
        (log.entity || '').toLowerCase().includes(q) ||
        (log.detail || '').toLowerCase().includes(q) ||
        (log.module || '').toLowerCase().includes(q) ||
        (log.ip_address || '').toLowerCase().includes(q);
      return ms
        && (filterAction   === 'All' || log.action     === filterAction)
        && (filterRole     === 'All' || log.actor_role === filterRole)
        && (filterModule   === 'All' || log.module     === filterModule)
        && (filterSeverity === 'All' || log.severity   === filterSeverity);
    })
    .sort((a, b) => {
      const ta = a.created_at || '', tb = b.created_at || '';
      return sortOrder === 'desc' ? tb.localeCompare(ta) : ta.localeCompare(tb);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, filterAction, filterRole, filterModule, filterSeverity, sortOrder, pageSize]);

  const activeCount = [filterAction !== 'All', filterRole !== 'All', filterModule !== 'All', filterSeverity !== 'All', !!search, !!dateFrom, !!dateTo].filter(Boolean).length;
  // Combine MOCK_LOGS + current API logs so filter options are always complete
  const allLogsForOptions = apiAvailable ? logs : MOCK_LOGS;
  const allRoles    = ['All', ...Array.from(new Set(allLogsForOptions.map(l => l.actor_role)))];
  const allModules  = ['All', ...Array.from(new Set(allLogsForOptions.map(l => l.module).filter(Boolean)))];

  /* ── API fetch ── */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        action: filterAction !== 'All' ? filterAction : undefined,
        role: filterRole !== 'All' ? filterRole : undefined,
        module: filterModule !== 'All' ? filterModule : undefined,
        severity: filterSeverity !== 'All' ? filterSeverity : undefined,
        sort: sortOrder, page, per_page: pageSize,
      };
      const res = await axios.get('/admin/audit-logs', { params });
      const data = res.data.logs?.data || res.data.logs || [];
      setLogs(data);
      // Save global action counts from database
      if (res.data.stats && typeof res.data.stats === 'object') {
        setStats(res.data.stats);
      }
      setApiAvailable(true);
    } catch {
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [search, filterAction, filterRole, filterModule, filterSeverity, sortOrder, page, pageSize]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // On mount: fetch stats-only to populate stat cards immediately from DB
  useEffect(() => {
    axios.get('/admin/audit-logs', { params: { per_page: 1, page: 1 } })
      .then(res => {
        if (res.data.stats && typeof res.data.stats === 'object') {
          setStats(res.data.stats);
        }
      })
      .catch(() => {/* ignore — MOCK_LOGS fallback is already in mockStats */});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── CRUD ── */
  const handleCreate = async (form) => {
    setSaveLoading(true);
    try {
      const res = await axios.post('/admin/audit-logs', form);
      setLogs(prev => [res.data.log, ...prev]);
      showToast('success', 'Log entry created');
    } catch {
      setLogs(prev => [{ id: Date.now(), ...form, created_at: new Date().toISOString() }, ...prev]);
      showToast('success', 'Created (local mode)');
    } finally { setSaveLoading(false); setShowCreate(false); }
  };

  const handleUpdate = async (form) => {
    setSaveLoading(true);
    const id = editLog.id;
    try {
      const res = await axios.put('/admin/audit-logs/' + id, form);
      setLogs(prev => prev.map(l => l.id === id ? res.data.log : l));
      showToast('success', 'Log entry updated');
    } catch {
      setLogs(prev => prev.map(l => l.id === id ? { ...l, ...form } : l));
      showToast('success', 'Updated (local mode)');
    } finally { setSaveLoading(false); setEditLog(null); }
  };

  const handleDelete = async () => {
    const id = deleteLog.id;
    try { await axios.delete('/admin/audit-logs/' + id); showToast('success', 'Entry deleted'); }
    catch { showToast('info', 'Deleted locally'); }
    setLogs(prev => prev.filter(l => l.id !== id));
    setDeleteLog(null);
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    try { await axios.delete('/admin/audit-logs/bulk-delete', { data: { ids } }); showToast('success', ids.length + ' entries deleted'); }
    catch { showToast('info', ids.length + ' deleted locally'); }
    setLogs(prev => prev.filter(l => !ids.includes(l.id)));
    setSelected(new Set());
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('/admin/audit-logs/export', { responseType: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([res.data]));
      a.download = 'audit_logs_' + new Date().toISOString().slice(0,10) + '.csv'; a.click();
    } catch {
      const rows = [['ID','Actor','Role','Action','Entity','Module','Detail','IP','Session','Severity','Created At'],
        ...filtered.map(l => [l.id,l.actor,l.actor_role,l.action,l.entity,l.module,'"'+(l.detail||'').replace(/"/g,'""')+'"',l.ip_address,l.session_id,l.severity,l.created_at])
      ].map(r => r.join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
      a.download = 'audit_logs_' + new Date().toISOString().slice(0,10) + '.csv'; a.click();
    }
    showToast('success', 'CSV exported');
  };

  const toggleSelect    = id => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleSelectAll = ()  => selected.size === paginated.length ? setSelected(new Set()) : setSelected(new Set(paginated.map(l => l.id)));
  const clearFilters    = ()  => { setSearch(''); setFilterAction('All'); setFilterRole('All'); setFilterModule('All'); setFilterSeverity('All'); setDateFrom(''); setDateTo(''); };

  /* ── Pagination pages helper ── */
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx-1] > 1) acc.push('…'); acc.push(p); return acc; }, []);

  /* ════════════════════════ RENDER ════════════════════════════════ */
  return (
    <AdminLayout title="Audit Logs" subtitle="System-wide activity trail for accountability & security" icon={History}>

      {/* Modals */}
      {detailLog && <DetailModal log={detailLog} onClose={() => setDetailLog(null)} onEdit={l => setEditLog(l)} onDelete={l => setDeleteLog(l)} t={t} isDark={isDark} />}
      {editLog   && <LogFormModal log={editLog}  onClose={() => setEditLog(null)}   onSave={handleUpdate} t={t} isDark={isDark} isLoading={saveLoading} />}
      {showCreate && <LogFormModal log={null}    onClose={() => setShowCreate(false)} onSave={handleCreate} t={t} isDark={isDark} isLoading={saveLoading} />}
      {deleteLog && <ConfirmDeleteModal log={deleteLog} onClose={() => setDeleteLog(null)} onConfirm={handleDelete} t={t} isDark={isDark} />}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div {...slideIn}
            className="fixed top-4 left-1/2 sm:left-auto sm:right-4 -translate-x-1/2 sm:translate-x-0 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold whitespace-nowrap"
            style={{ background: toast.type === 'success' ? 'linear-gradient(135deg,#059669,#10b981)' : toast.type === 'error' ? 'linear-gradient(135deg,#991b1b,#dc2626)' : 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff' }}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 sm:space-y-5 pb-8">

        {/* ── STAT CARDS ── */}
        <motion.div {...fadeUp(0)} className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {Object.entries(ACTION_META).map(([key, meta]) => {
            const Icon   = meta.icon;
            const color  = isDark ? meta.darkColor : meta.color;
            const count  = getActionCount(key);
            const maxCnt = maxStatCount;
            const active = filterAction === key;
            return (
              <motion.button key={key}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => setFilterAction(active ? 'All' : key)}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all cursor-pointer"
                style={{ background: active ? color + '15' : t.card, border: active ? '1.5px solid ' + color + '50' : t.cardBorder, boxShadow: active ? '0 4px 20px ' + color + '20' : t.cardShadow }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: active ? color + '25' : color + '12' }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="text-center w-full">
                  <span className="text-xl sm:text-2xl font-black leading-none block" style={{ color: active ? color : t.txt }}>{count}</span>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-0.5" style={{ color: active ? color : t.txtMuted }}>{meta.label}</span>
                  <ProgressBar pct={(count / maxCnt) * 100} color={color} />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── TOOLBAR ── */}
        <motion.div {...fadeUp(0.06)}>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: t.txtMuted }} />
              <input type="text" placeholder="Search actor, entity, IP…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border outline-none transition-all"
                style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.txt }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e  => e.target.style.borderColor = t.inputBorder} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: t.txtMuted, color: '#fff' }}>
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
              <button onClick={() => setShowFilters(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 flex-shrink-0"
                style={{ background: showFilters ? accent + '15' : t.card, border: showFilters ? '1.5px solid ' + accent + '40' : t.cardBorder, color: showFilters ? accent : t.txtSub }}>
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Filters</span>
                {activeCount > 0 && <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white" style={{ background: accent }}>{activeCount}</span>}
              </button>

              <button onClick={() => setSortOrder(v => v === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 flex-shrink-0"
                style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
              </button>

              {/* 3-way view mode toggle */}
              <div className="flex items-center p-1 rounded-xl" style={{ background: t.card, border: t.cardBorder }}>
                <button onClick={() => setViewMode('cards')} title="Card View"
                  className="p-1.5 rounded-lg transition-all"
                  style={{ background: viewMode === 'cards' ? accent + '20' : 'transparent', color: viewMode === 'cards' ? accent : t.txtMuted }}>
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setViewMode('table')} title="Table View"
                  className="p-1.5 rounded-lg transition-all"
                  style={{ background: viewMode === 'table' ? accent + '20' : 'transparent', color: viewMode === 'table' ? accent : t.txtMuted }}>
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setViewMode('timeline')} title="Timeline View"
                  className="p-1.5 rounded-lg transition-all"
                  style={{ background: viewMode === 'timeline' ? accent + '20' : 'transparent', color: viewMode === 'timeline' ? accent : t.txtMuted }}>
                  <Clock className="w-3.5 h-3.5" />
                </button>
              </div>

              <button onClick={fetchLogs} disabled={loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80 flex-shrink-0"
                style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>
                <RefreshCw className={'w-3.5 h-3.5' + (loading ? ' animate-spin' : '')} />
              </button>

              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Log</span>
              </button>
            </div>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden mt-3">
                <div className="p-4 rounded-2xl space-y-4" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Role</p>
                      <div className="flex flex-wrap gap-1.5">
                        {allRoles.map(r => (
                          <button key={r} onClick={() => setFilterRole(r)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer active:scale-95"
                            style={{ background: filterRole === r ? accent + '15' : t.inner, border: filterRole === r ? '1.5px solid ' + accent + '40' : t.innerBorder, color: filterRole === r ? accent : t.txtSub }}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Module</p>
                      <div className="flex flex-wrap gap-1.5">
                        {allModules.map(m => (
                          <button key={m} onClick={() => setFilterModule(m)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer active:scale-95"
                            style={{ background: filterModule === m ? accent + '15' : t.inner, border: filterModule === m ? '1.5px solid ' + accent + '40' : t.innerBorder, color: filterModule === m ? accent : t.txtSub }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Severity</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['All', 'info', 'warning', 'danger'].map(s => {
                          const sm = s !== 'All' ? SEVERITY_META[s] : null;
                          const clr = sm ? sm.color : accent;
                          return (
                            <button key={s} onClick={() => setFilterSeverity(s)}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer active:scale-95"
                              style={{ background: filterSeverity === s ? clr + '15' : t.inner, border: filterSeverity === s ? '1.5px solid ' + clr + '40' : t.innerBorder, color: filterSeverity === s ? clr : t.txtSub }}>
                              {s === 'danger' ? 'Critical' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Date Range</p>
                      <div className="space-y-1.5">
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg text-[10px] border outline-none"
                          style={{ background: t.inner, borderColor: t.inputBorder, color: t.txt }} />
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg text-[10px] border outline-none"
                          style={{ background: t.inner, borderColor: t.inputBorder, color: t.txt }} />
                      </div>
                    </div>
                  </div>
                  {activeCount > 0 && (
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[10px]" style={{ color: t.txtMuted }}>{activeCount} filter{activeCount > 1 ? 's' : ''} active</p>
                      <button onClick={clearFilters} className="text-[10px] font-bold px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity"
                        style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', color: isDark ? '#f87171' : '#dc2626' }}>
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── BULK BAR ── */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div {...slideIn}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
              style={{ background: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)', border: '1.5px solid ' + (isDark ? '#f87171' : '#dc2626') + '30' }}>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: isDark ? '#f87171' : '#dc2626' }} />
                <p className="text-xs font-bold" style={{ color: isDark ? '#f87171' : '#dc2626' }}>
                  {selected.size} entr{selected.size > 1 ? 'ies' : 'y'} selected
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(new Set())} className="text-[10px] font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: t.inner, color: t.txtSub }}>Deselect all</button>
                <button onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg text-white"
                  style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)' }}>
                  <Trash2 className="w-3 h-3" />Delete selected
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULTS META ── */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px]" style={{ color: t.txtMuted }}>
            Showing <strong style={{ color: t.txt }}>{paginated.length}</strong> of <strong style={{ color: t.txt }}>{filtered.length}</strong> entries
            {activeCount > 0 && <span> · {activeCount} filter{activeCount > 1 ? 's' : ''} active</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: t.txtMuted }}>Show</span>
            <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
              className="text-[10px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer"
              style={{ background: t.inner, borderColor: t.inputBorder, color: t.txtSub }}>
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <p className="text-[11px]" style={{ color: t.txtMuted }}>Page {page}/{totalPages}</p>
          </div>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin" style={{ color: accent }} />
          </div>
        ) : paginated.length === 0 ? (
          <motion.div {...fadeUp(0.1)} className="py-16 sm:py-20 text-center rounded-3xl" style={{ background: t.card, border: t.cardBorder }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: t.inner }}>
              <History className="w-8 h-8" style={{ color: t.txtMuted }} />
            </div>
            <p className="font-black text-base" style={{ color: t.txt }}>No matching log entries</p>
            <p className="text-xs mt-1.5 mb-5" style={{ color: t.txtMuted }}>
              {search ? 'No results for "' + search + '"' : 'Try adjusting your filters.'}
            </p>
            <button onClick={clearFilters} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>Reset all filters</button>
          </motion.div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <motion.div {...fadeUp(0.08)} className="rounded-2xl overflow-hidden" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr style={{ background: t.tableHead }}>
                    <th className="px-4 py-3">
                      <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="w-3.5 h-3.5 cursor-pointer rounded" />
                    </th>
                    {['Actor','Action','Entity','Module','Severity','Time',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: t.txtMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {paginated.map((log, i) => {
                      const meta  = ACTION_META[log.action]  || ACTION_META.create;
                      const sev   = SEVERITY_META[log.severity] || SEVERITY_META.info;
                      const Icon  = meta.icon;
                      const color = isDark ? meta.darkColor : meta.color;
                      const sevColor = isDark ? (sev.darkColor || sev.color) : sev.color;
                      const isSel = selected.has(log.id);
                      return (
                        <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.02 }}
                          className="group cursor-pointer transition-colors"
                          style={{ background: isSel ? accent + '08' : 'transparent', borderTop: t.innerBorder }}
                          onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = t.hover; }}
                          onMouseLeave={e => { e.currentTarget.style.background = isSel ? accent + '08' : 'transparent'; }}
                          onClick={() => setDetailLog(log)}>
                          <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(log.id); }}>
                            <input type="checkbox" checked={isSel} onChange={() => toggleSelect(log.id)} className="w-3.5 h-3.5 cursor-pointer rounded" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar name={log.actor} color={color} size={28} />
                              <div>
                                <p className="text-[11px] font-bold whitespace-nowrap" style={{ color: t.txt }}>{log.actor}</p>
                                <p className="text-[9px] capitalize" style={{ color: t.txtMuted }}>{log.actor_role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 w-fit" style={{ background: meta.bg, color }}>
                              <Icon className="w-3 h-3" />{meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[11px] font-semibold whitespace-nowrap" style={{ color: t.txt }}>{log.entity}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ background: t.inner, color: t.txtSub }}>{log.module || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 w-fit" style={{ background: sev.bg, color: sevColor }}>
                              {React.createElement(sev.icon, { className: 'w-2.5 h-2.5' })}
                              {sev.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[10px] whitespace-nowrap" style={{ color: t.txtMuted }}>{(log.created_at || '').slice(0, 16)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={e => { e.stopPropagation(); setDetailLog(log); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ background: color + '15', color }}>
                                <Eye className="w-3 h-3" />
                              </button>
                              <button onClick={e => { e.stopPropagation(); setEditLog(log); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ background: 'rgba(217,119,6,0.12)', color: '#d97706' }}>
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button onClick={e => { e.stopPropagation(); setDeleteLog(log); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', color: isDark ? '#f87171' : '#dc2626' }}>
                                <Trash2 className="w-3 h-3" />
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
          /* TIMELINE VIEW */
          <motion.div {...fadeUp(0.08)} className="p-5 sm:p-6 rounded-2xl relative" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <div className="absolute left-8 sm:left-10 top-8 bottom-8 w-0.5" style={{ background: t.innerBorder }} />
            <div className="space-y-6 relative">
              <AnimatePresence mode="popLayout">
                {paginated.map((log, i) => {
                  const meta  = ACTION_META[log.action]  || ACTION_META.create;
                  const sev   = SEVERITY_META[log.severity] || SEVERITY_META.info;
                  const Icon  = meta.icon;
                  const color = isDark ? meta.darkColor : meta.color;
                  return (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-4 sm:gap-6 group cursor-pointer" onClick={() => setDetailLog(log)}>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 shadow-md transition-transform group-hover:scale-110"
                        style={{ background: meta.gradient }}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 p-4 rounded-2xl transition-all" style={{ background: t.inner, border: t.innerBorder }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = color + '40'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs" style={{ color: t.txt }}>{log.actor}</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color }}>{meta.label}</span>
                            <span className="text-[10px] text-slate-400">({log.entity})</span>
                          </div>
                          <span className="text-[10px] font-mono" style={{ color: t.txtMuted }}>{(log.created_at || '').slice(0, 16)}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: t.txtSub }}>{log.detail}</p>
                        <div className="flex items-center gap-3 mt-2 text-[9px]" style={{ color: t.txtMuted }}>
                          <span>Module: <strong>{log.module || '—'}</strong></span>
                          <span>IP: <strong>{log.ip_address}</strong></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* CARD VIEW */
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {paginated.map((log, i) => {
                const meta  = ACTION_META[log.action]  || ACTION_META.create;
                const sev   = SEVERITY_META[log.severity] || SEVERITY_META.info;
                const Icon  = meta.icon;
                const color = isDark ? meta.darkColor : meta.color;
                const sevColor = isDark ? (sev.darkColor || sev.color) : sev.color;
                const isSel = selected.has(log.id);
                return (
                  <motion.div key={log.id} layout
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.24, delay: i * 0.03 }}>
                    <div className="group relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200"
                      style={{ background: isSel ? accent + '08' : t.card, border: isSel ? '1.5px solid ' + accent + '40' : t.cardBorder, boxShadow: t.cardShadow }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = color + '35'; e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = '0 6px 32px ' + color + '12'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = isSel ? accent + '40' : ''; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = t.cardShadow; }}
                      onClick={() => setDetailLog(log)}>

                      {/* Avatar */}
                      <div className="flex-shrink-0 transition-transform group-hover:scale-105">
                        <Avatar name={log.actor} color={color} size={40} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-black text-xs sm:text-sm" style={{ color: t.txt }}>{log.actor}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: meta.bg, color }}>
                            <Icon className="w-2.5 h-2.5" />{meta.label}
                          </span>
                          <span className="text-[10px]" style={{ color: t.txtMuted }}>on</span>
                          <span className="text-[10px] font-semibold" style={{ color: t.txtSub }}>{log.entity}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ background: sev.bg, color: sevColor }}>
                            {React.createElement(sev.icon, { className: 'w-2.5 h-2.5' })}
                            <span className="hidden sm:inline">{sev.label}</span>
                          </span>
                        </div>

                        <p className="text-[10px] sm:text-[11px] line-clamp-2 sm:line-clamp-1 leading-relaxed" style={{ color: t.txtSub }}>{log.detail}</p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5">
                          <span className="text-[9px] flex items-center gap-1" style={{ color: t.txtMuted }}>
                            <Clock className="w-2.5 h-2.5" />{(log.created_at || '').slice(0, 16)}
                          </span>
                          <span className="text-[9px] items-center gap-1 hidden sm:flex" style={{ color: t.txtMuted }}>
                            <Globe className="w-2.5 h-2.5" />{log.ip_address}
                          </span>
                          {log.module && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: t.inner, color: t.txtSub }}>{log.module}</span>
                          )}
                          <span className="text-[9px] capitalize font-medium px-1.5 py-0.5 rounded-md" style={{ background: t.inner, color: t.txtSub }}>{log.actor_role}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        {/* Checkbox mobile */}
                        <button className="sm:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-opacity"
                          style={{ background: isSel ? accent + '20' : t.inner, border: t.innerBorder, color: isSel ? accent : t.txtMuted }}
                          onClick={e => { e.stopPropagation(); toggleSelect(log.id); }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        {/* Desktop actions */}
                        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); setEditLog(log); }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                            style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.2)', color: '#d97706' }}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setDeleteLog(log); }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity"
                            style={{ background: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: isDark ? '#f87171' : '#dc2626' }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Eye */}
                        <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity"
                          style={{ background: color + '12', border: '1px solid ' + color + '25', color }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <motion.div {...fadeUp(0.1)} className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 disabled:opacity-30"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((p, idx) => (
              p === '…' ? (
                <span key={'e' + idx} className="text-xs px-1" style={{ color: t.txtMuted }}>…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className="w-10 h-10 rounded-xl text-xs font-bold transition-all hover:opacity-80 active:scale-95"
                  style={{ background: page === p ? 'linear-gradient(135deg,#062c22,#0a3d30)' : t.card, border: page === p ? 'none' : t.cardBorder, color: page === p ? '#fff' : t.txtSub, boxShadow: page === p ? '0 4px 12px rgba(10,61,48,0.3)' : 'none' }}>
                  {p}
                </button>
              )
            ))}

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 disabled:opacity-30"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>»</button>
          </motion.div>
        )}

        {/* ── FOOTER ── */}
        <div className="flex items-center gap-2 justify-center pt-2 flex-wrap">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.txtMuted }} />
          <span className="text-[10px] text-center" style={{ color: t.txtMuted }}>
            Records retained 12 months · Exported logs encrypted at rest · Last synced {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            {!apiAvailable && <span className="ml-1 text-amber-500"> · Local mode</span>}
          </span>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
