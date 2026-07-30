import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import {
  History, Search, ShieldCheck, PlusCircle, Pencil,
  Trash2, LogIn, Settings as SettingsIcon, X, Eye,
  Download, Filter, Clock, User, Globe,
  AlertTriangle, RefreshCw, CheckCircle, Info, Copy,
  ArrowUpDown, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ─── theme tokens ────────────────────────────────────────────────── */
const TOKENS = {
  light: {
    card:        'rgba(255,255,255,0.96)',
    cardShadow:  '0 2px 20px rgba(0,0,0,0.06)',
    cardBorder:  '1px solid rgba(0,0,0,0.07)',
    inner:       '#faf8f4',
    innerBorder: '1px solid rgba(0,0,0,0.06)',
    txt:         '#14181f',
    txtMuted:    '#8e97a4',
    txtSub:      '#4a5568',
    divider:     'rgba(0,0,0,0.07)',
    hover:       'rgba(0,0,0,0.025)',
    accent:      '#0a3d30',
    gold:        '#bfa15f',
    inputBg:     '#fff',
    inputBorder: 'rgba(0,0,0,0.12)',
    danger:      '#ef4444',
  },
  dark: {
    card:        '#161d2c',
    cardShadow:  '0 4px 28px rgba(0,0,0,0.4)',
    cardBorder:  '1px solid rgba(255,255,255,0.07)',
    inner:       '#111827',
    innerBorder: '1px solid rgba(255,255,255,0.06)',
    txt:         '#dde6f0',
    txtMuted:    '#4e5e72',
    txtSub:      '#7b8da4',
    divider:     'rgba(255,255,255,0.07)',
    hover:       'rgba(255,255,255,0.03)',
    accent:      '#34d399',
    gold:        '#d4b87a',
    inputBg:     'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.1)',
    danger:      '#f87171',
  },
};

/* ─── action metadata ─────────────────────────────────────────────── */
const ACTION_META = {
  create: { label: 'Created', icon: PlusCircle,   color: '#10b981', bg: 'rgba(16,185,129,0.12)',  darkColor: '#34d399', severity: 'info' },
  update: { label: 'Updated', icon: Pencil,       color: '#d97706', bg: 'rgba(217,119,6,0.12)',   darkColor: '#fbbf24', severity: 'warning' },
  delete: { label: 'Deleted', icon: Trash2,       color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   darkColor: '#f87171', severity: 'danger' },
  login:  { label: 'Login',   icon: LogIn,        color: '#4f46e5', bg: 'rgba(79,70,229,0.12)',   darkColor: '#818cf8', severity: 'info' },
  config: { label: 'Config',  icon: SettingsIcon, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', darkColor: '#a78bfa', severity: 'warning' },
  access: { label: 'Access',  icon: ShieldCheck,  color: '#0a3d30', bg: 'rgba(10,61,48,0.12)',   darkColor: '#34d399', severity: 'info' },
};

const SEVERITY_MAP = {
  info:    { icon: Info,          color: '#4f46e5', label: 'Info' },
  warning: { icon: AlertTriangle, color: '#d97706', label: 'Warning' },
  danger:  { icon: AlertTriangle, color: '#dc2626', label: 'Critical' },
};

/* ─── mock data ───────────────────────────────────────────────────── */
const MOCK_LOGS = [
  { id:  1, actor: 'System Admin',   role: 'admin',     action: 'update', entity: 'RBAC Permissions',   detail: "Updated permissions for role 'staff' — added manage-appointments, removed view-reports", timestamp: '2026-07-25 14:32', ip: '192.168.1.10',  session: 'sess_a1b2c3', module: 'Access Control' },
  { id:  2, actor: 'Maria Santos',   role: 'staff',     action: 'login',  entity: 'Authentication',     detail: 'Signed in from 122.55.14.20 — Chrome 124 on Windows',                             timestamp: '2026-07-25 09:10', ip: '122.55.14.20', session: 'sess_d4e5f6', module: 'Auth' },
  { id:  3, actor: 'System Admin',   role: 'admin',     action: 'create', entity: 'Service Catalog',    detail: "Added new service 'Couple Massage' — ₱1,800 / 90 min",                            timestamp: '2026-07-24 17:45', ip: '192.168.1.10',  session: 'sess_g7h8i9', module: 'Services' },
  { id:  4, actor: 'John Therapist', role: 'therapist', action: 'update', entity: 'Availability',       detail: 'Marked available for 2026-07-26 and 2026-07-27',                                   timestamp: '2026-07-24 11:02', ip: '203.87.45.31', session: 'sess_j1k2l3', module: 'Schedule' },
  { id:  5, actor: 'System Admin',   role: 'admin',     action: 'config', entity: 'System Settings',    detail: 'Changed booking lead-time from 1 hour to 2 hours',                                  timestamp: '2026-07-23 16:20', ip: '192.168.1.10',  session: 'sess_m4n5o6', module: 'Settings' },
  { id:  6, actor: 'Anna Reyes',     role: 'staff',     action: 'login',  entity: 'Authentication',     detail: 'Signed in from 178.20.9.4 — Safari 17 on macOS',                                   timestamp: '2026-07-23 08:55', ip: '178.20.9.4',   session: 'sess_p7q8r9', module: 'Auth' },
  { id:  7, actor: 'System Admin',   role: 'admin',     action: 'create', entity: 'Marketing',          detail: "Issued gift card 'CB-GIFT-1000' — ₱1,000 value, expires 2026-12-31",               timestamp: '2026-07-22 13:12', ip: '192.168.1.10',  session: 'sess_s1t2u3', module: 'Marketing' },
  { id:  8, actor: 'System Admin',   role: 'admin',     action: 'delete', entity: 'Product Inventory',  detail: "Removed product 'Sample Trial Kit' — stock: 0, reason: discontinued",               timestamp: '2026-07-22 10:05', ip: '192.168.1.10',  session: 'sess_v4w5x6', module: 'Inventory' },
  { id:  9, actor: 'Jane Client',    role: 'client',    action: 'create', entity: 'Appointment',        detail: 'Booked Swedish Massage — July 27, 2026 at 10:00 AM',                                timestamp: '2026-07-21 21:14', ip: '54.201.8.77',  session: 'sess_y7z8a9', module: 'Bookings' },
  { id: 10, actor: 'System Admin',   role: 'admin',     action: 'access', entity: 'Audit Logs',         detail: 'Viewed audit log export — date range July 1–21, 2026',                              timestamp: '2026-07-21 15:30', ip: '192.168.1.10',  session: 'sess_b1c2d3', module: 'Security' },
  { id: 11, actor: 'Maria Santos',   role: 'staff',     action: 'update', entity: 'Appointment',        detail: "Assigned therapist 'John Therapist' to booking #209",                               timestamp: '2026-07-20 11:44', ip: '122.55.14.20', session: 'sess_e4f5g6', module: 'Bookings' },
  { id: 12, actor: 'System Admin',   role: 'admin',     action: 'delete', entity: 'Staff Account',      detail: "Removed staff account 'temp.staff@example.com' — account deactivated",              timestamp: '2026-07-19 09:00', ip: '192.168.1.10',  session: 'sess_h7i8j9', module: 'User Management' },
];

const PAGE_SIZE = 6;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── copy toast hook ─────────────────────────────────────────────── */
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

/* ─── progress bar ────────────────────────────────────────────────── */
const Bar = ({ pct, color, t }) => (
  <div className="h-1.5 rounded-full w-full overflow-hidden" style={{ background: t.innerBorder }}>
    <motion.div className="h-full rounded-full" style={{ background: color }}
      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: 'easeOut' }} />
  </div>
);

/* ─── modal bottom-sheet wrapper ──────────────────────────────────── */
const ModalSheet = ({ children, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ─── Log Detail Modal ────────────────────────────────────────────── */
const LogDetailModal = ({ log, onClose, t, isDark }) => {
  const { copied, copy } = useCopyToast();
  if (!log) return null;
  const meta  = ACTION_META[log.action] || ACTION_META.create;
  const Icon  = meta.icon;
  const color = isDark ? meta.darkColor : meta.color;
  const sev   = SEVERITY_MAP[meta.severity];

  return (
    <ModalSheet onClose={onClose}>
      <div style={{ background: t.card, border: t.cardBorder }} className="rounded-t-3xl sm:rounded-3xl">
        {/* Handle bar */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full opacity-30" style={{ background: t.txtMuted }} />
        </div>

        {/* Header band */}
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between"
          style={{ background: `${color}0d`, borderBottom: `1px solid ${color}20` }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: meta.bg, border: `1px solid ${color}30` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm truncate" style={{ color: t.txt }}>Log Entry #{log.id}</p>
              <p className="text-[10px] truncate" style={{ color: t.txtMuted }}>{log.module} · {log.entity}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 active:opacity-50 hover:opacity-70 transition-opacity ml-2"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: meta.bg, color }}>{meta.label}</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
              style={{ background: `${sev.color}12`, color: sev.color }}>
              <sev.icon className="w-3 h-3" />{sev.label}
            </span>
          </div>

          {/* Detail text */}
          <div className="p-4 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
            <p className="text-xs leading-relaxed" style={{ color: t.txt }}>{log.detail}</p>
          </div>

          {/* Meta grid — 1 col on mobile, 2 on sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: 'Actor',     value: log.actor,     icon: User },
              { label: 'Role',      value: log.role,      icon: ShieldCheck },
              { label: 'Timestamp', value: log.timestamp, icon: Clock },
              { label: 'Module',    value: log.module,    icon: Globe },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3 h-3" style={{ color: t.txtMuted }} />
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{item.label}</p>
                </div>
                <p className="text-[11px] font-semibold" style={{ color: t.txt }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Technical details with copy */}
          <div className="p-4 rounded-2xl space-y-3" style={{ background: t.inner, border: t.innerBorder }}>
            <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.txtMuted }}>Technical Details</p>
            {[
              { label: 'IP Address', value: log.ip },
              { label: 'Session ID', value: log.session },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px]" style={{ color: t.txtSub }}>{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md break-all"
                    style={{ background: t.card, border: t.innerBorder, color: t.txt }}>
                    {item.value}
                  </span>
                  <button
                    onClick={() => copy(item.value, item.label)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center active:opacity-50 hover:opacity-70 transition-opacity flex-shrink-0"
                    style={{ background: t.card, border: t.innerBorder, color: t.txtMuted }}>
                    {copied === item.label
                      ? <CheckCircle className="w-3 h-3 text-emerald-500" />
                      : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile close button */}
          <button onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-sm font-bold sm:hidden active:opacity-70 transition-opacity"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            Close
          </button>
        </div>
      </div>
    </ModalSheet>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
const AdminAuditLogs = () => {
  const { theme } = useTheme();
  const t = TOKENS[theme] || TOKENS.light;
  const isDark = theme === 'dark';

  const [search, setSearch]             = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterRole, setFilterRole]     = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [sortOrder, setSortOrder]       = useState('desc');
  const [page, setPage]                 = useState(1);
  const [selectedLog, setSelectedLog]   = useState(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [exportToast, setExportToast]   = useState(false);
  const [showFilters, setShowFilters]   = useState(false);

  const accentColor = isDark ? '#34d399' : '#0a3d30';

  const roles   = ['All', ...Array.from(new Set(MOCK_LOGS.map(l => l.role)))];
  const modules = ['All', ...Array.from(new Set(MOCK_LOGS.map(l => l.module)))];

  const filtered = MOCK_LOGS
    .filter(log => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        log.actor.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        log.ip.toLowerCase().includes(q);
      return matchSearch
        && (filterAction === 'All' || log.action === filterAction)
        && (filterRole   === 'All' || log.role   === filterRole)
        && (filterModule === 'All' || log.module === filterModule);
    })
    .sort((a, b) => sortOrder === 'desc'
      ? b.timestamp.localeCompare(a.timestamp)
      : a.timestamp.localeCompare(b.timestamp));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search, filterAction, filterRole, filterModule, sortOrder]);

  const activeFiltersCount = [filterAction !== 'All', filterRole !== 'All', filterModule !== 'All', !!search].filter(Boolean).length;

  const handleExport = () => {
    const csv = [
      ['ID','Actor','Role','Action','Entity','Module','Detail','IP','Session','Timestamp'],
      ...filtered.map(l => [l.id,l.actor,l.role,l.action,l.entity,l.module,`"${l.detail}"`,l.ip,l.session,l.timestamp])
    ].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    setExportToast(true);
    setTimeout(() => setExportToast(false), 2500);
  };

  const stats = Object.entries(ACTION_META).map(([key, meta]) => ({
    key, ...meta, count: MOCK_LOGS.filter(l => l.action === key).length,
  }));

  return (
    <AdminLayout title="Audit Logs" subtitle="System-wide activity trail for accountability & security">
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} t={t} isDark={isDark} />

      {/* Export toast */}
      <AnimatePresence>
        {exportToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap"
            style={{ background: '#0a3d30', color: '#fff' }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            CSV exported successfully
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 sm:space-y-5 pb-6">

        {/* ── Summary stat pills — 3 cols mobile, 6 on sm ── */}
        <motion.div {...fadeUp(0)} className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {stats.map(s => {
            const Icon  = s.icon;
            const color = isDark ? s.darkColor : s.color;
            const active = filterAction === s.key;
            return (
              <button key={s.key}
                onClick={() => setFilterAction(active ? 'All' : s.key)}
                className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-2xl transition-all hover:scale-[1.04] active:scale-[0.97] cursor-pointer"
                style={{
                  background: active ? `${color}18` : t.inner,
                  border: active ? `1px solid ${color}40` : t.innerBorder,
                }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-base sm:text-lg font-black leading-none" style={{ color: active ? color : t.txt }}>{s.count}</span>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide" style={{ color: active ? color : t.txtMuted }}>{s.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* ── Search + Toolbar — full width, wraps on mobile ── */}
        <motion.div {...fadeUp(0.06)} className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          {/* Search — full width on mobile */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: t.txtMuted }} />
            <input
              type="text"
              placeholder="Search actor, entity, IP…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border outline-none transition-all"
              style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.txt }}
              onFocus={e => { e.target.style.borderColor = accentColor; }}
              onBlur={e => { e.target.style.borderColor = t.inputBorder; }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: t.txtMuted, color: '#fff' }}>
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Action row — scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0 sm:flex-wrap">
            {/* Filter */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 active:opacity-60 cursor-pointer flex-shrink-0 min-h-[38px]"
              style={{
                background: showFilters ? `${accentColor}18` : t.inner,
                border: showFilters ? `1px solid ${accentColor}40` : t.innerBorder,
                color: showFilters ? accentColor : t.txtSub,
              }}>
              <Filter className="w-3.5 h-3.5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                  style={{ background: accentColor }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <button
              onClick={() => setSortOrder(v => v === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 active:opacity-60 cursor-pointer flex-shrink-0 min-h-[38px]"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
              disabled={refreshing}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80 active:opacity-60 cursor-pointer flex-shrink-0"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 active:opacity-60 cursor-pointer text-white flex-shrink-0 min-h-[38px]"
              style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Export CSV</span>
            </button>
          </div>
        </motion.div>

        {/* ── Advanced Filters panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden">
              <div className="p-4 rounded-2xl space-y-4" style={{ background: t.inner, border: t.innerBorder }}>

                {/* Role filter */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Role</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map(r => (
                      <button key={r} onClick={() => setFilterRole(r)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer active:scale-95 min-h-[32px]"
                        style={{
                          background: filterRole === r ? `${accentColor}18` : t.card,
                          border: filterRole === r ? `1px solid ${accentColor}50` : t.cardBorder,
                          color: filterRole === r ? accentColor : t.txtSub,
                        }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Module filter */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Module</p>
                  <div className="flex flex-wrap gap-1.5">
                    {modules.map(m => (
                      <button key={m} onClick={() => setFilterModule(m)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer active:scale-95 min-h-[32px]"
                        style={{
                          background: filterModule === m ? `${accentColor}18` : t.card,
                          border: filterModule === m ? `1px solid ${accentColor}50` : t.cardBorder,
                          color: filterModule === m ? accentColor : t.txtSub,
                        }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { setFilterAction('All'); setFilterRole('All'); setFilterModule('All'); setSearch(''); }}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ background: t.card, border: t.cardBorder, color: t.danger }}>
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px]" style={{ color: t.txtMuted }}>
            Showing <strong style={{ color: t.txt }}>{filtered.length}</strong> of {MOCK_LOGS.length} entries
            {activeFiltersCount > 0 && <span> · {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</span>}
          </p>
          <p className="text-[11px]" style={{ color: t.txtMuted }}>Page {page} of {totalPages}</p>
        </div>

        {/* ── Log list ── */}
        {paginated.length === 0 ? (
          <motion.div {...fadeUp(0.1)}
            className="p-12 sm:p-16 text-center rounded-3xl"
            style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: t.inner }}>
              <History className="w-7 h-7" style={{ color: t.txtMuted }} />
            </div>
            <p className="font-bold text-sm" style={{ color: t.txt }}>No matching log entries</p>
            <p className="text-xs mt-1" style={{ color: t.txtMuted }}>
              {search ? `No results for "${search}"` : 'Try adjusting your filters.'}
            </p>
            <button
              onClick={() => { setSearch(''); setFilterAction('All'); setFilterRole('All'); setFilterModule('All'); }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-80 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
              Reset all filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {paginated.map((log, i) => {
                const meta  = ACTION_META[log.action] || ACTION_META.create;
                const Icon  = meta.icon;
                const color = isDark ? meta.darkColor : meta.color;
                const sev   = SEVERITY_MAP[meta.severity];

                return (
                  <motion.div key={log.id} layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.24, delay: i * 0.03 }}>
                    <div
                      className="group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.99]"
                      style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${color}30`;
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '';
                        e.currentTarget.style.transform = '';
                      }}
                      onClick={() => setSelectedLog(log)}>

                      {/* Action icon */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ background: meta.bg, border: `1px solid ${color}25` }}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Top row */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-black text-xs" style={{ color: t.txt }}>{log.actor}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: meta.bg, color }}>{meta.label}</span>
                          <span className="text-[10px]" style={{ color: t.txtMuted }}>on</span>
                          <span className="text-[10px] font-semibold" style={{ color: t.txtSub }}>{log.entity}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1"
                            style={{ background: `${sev.color}12`, color: sev.color }}>
                            <sev.icon className="w-2.5 h-2.5" />
                            <span className="hidden sm:inline">{sev.label}</span>
                          </span>
                        </div>

                        {/* Detail */}
                        <p className="text-[10px] sm:text-[11px] line-clamp-2 sm:truncate" style={{ color: t.txtSub }}>{log.detail}</p>

                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5">
                          <span className="text-[9px] flex items-center gap-1" style={{ color: t.txtMuted }}>
                            <Clock className="w-2.5 h-2.5" />{log.timestamp}
                          </span>
                          <span className="text-[9px] items-center gap-1 hidden sm:flex" style={{ color: t.txtMuted }}>
                            <Globe className="w-2.5 h-2.5" />{log.ip}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ background: t.inner, color: t.txtSub }}>{log.module}</span>
                          <span className="text-[9px] capitalize font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: t.inner, color: t.txtSub }}>{log.role}</span>
                        </div>
                      </div>

                      {/* Eye button — visible on hover desktop, always on mobile */}
                      <div className="flex-shrink-0">
                        <button
                          className="w-8 h-8 rounded-xl flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity"
                          style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
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

        {/* ── Pagination — touch friendly ── */}
        {totalPages > 1 && (
          <motion.div {...fadeUp(0.1)} className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80 active:scale-95 disabled:opacity-30 cursor-pointer"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p}
                onClick={() => setPage(p)}
                className="w-10 h-10 rounded-xl text-xs font-bold transition-all hover:opacity-80 active:scale-95 cursor-pointer"
                style={{
                  background: page === p ? 'linear-gradient(135deg,#062c22,#0a3d30)' : t.card,
                  border: page === p ? 'none' : t.cardBorder,
                  color: page === p ? '#fff' : t.txtSub,
                }}>
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80 active:scale-95 disabled:opacity-30 cursor-pointer"
              style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── Compliance footer ── */}
        <div className="flex items-center gap-2 justify-center pt-1 flex-wrap">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.txtMuted }} />
          <span className="text-[10px] text-center" style={{ color: t.txtMuted }}>
            Records retained 12 months · Exported logs encrypted at rest · Last synced {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
