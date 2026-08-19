import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';

import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import {
  DollarSign, Calendar, Users, Activity,
  Clock, MapPin, ArrowUpRight, ArrowDownRight, Zap,
  ChevronRight, Target, X, RefreshCw, Eye,
  UserCheck, Award, Flame, TrendingUp, Star,
  CheckCircle2, AlertCircle, Wifi, LayoutDashboard,
} from 'lucide-react';

/* ─── animation presets ──────────────────────────────────────────── */
const fadeUp = (delay = 0, dur = 0.45) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: dur, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── theme tokens ────────────────────────────────────────────────── */
const TOKENS = {
  light: {
    canvas:       '#f2f4f7',
    card:         'rgba(255,255,255,0.98)',
    cardShadow:   '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)',
    cardBorder:   '1px solid rgba(0,0,0,0.07)',
    cardGlow:     '0 0 0 1px rgba(10,61,48,0.04)',
    inner:        '#f8f9fb',
    innerBorder:  '1px solid rgba(0,0,0,0.06)',
    txt:          '#0d1117',
    txtMuted:     '#94a3b8',
    txtSub:       '#4a5568',
    bar:          '#e8edf4',
    accent:       '#0a3d30',
    accentBright: '#0f5f4a',
    accentAlpha:  'rgba(10,61,48,0.1)',
    gold:         '#bfa15f',
    goldAlpha:    'rgba(191,161,95,0.12)',
    progressBg:   '#e9edf4',
    tag:          'rgba(0,0,0,0.05)',
    tagTxt:       '#4a5568',
    divider:      'rgba(0,0,0,0.06)',
    hover:        'rgba(0,0,0,0.02)',
    success:      '#10b981',
    warning:      '#f59e0b',
    danger:       '#ef4444',
    info:         '#6366f1',
    pink:         '#ec4899',
    tableStripe:  'rgba(0,0,0,0.015)',
    chartLine:    '#0a3d30',
    chartFill:    'rgba(10,61,48,0.06)',
  },
  dark: {
    canvas:       '#0b0f1a',
    card:         '#131b2a',
    cardShadow:   '0 4px 32px rgba(0,0,0,0.45)',
    cardBorder:   '1px solid rgba(255,255,255,0.07)',
    cardGlow:     '0 0 0 1px rgba(52,211,153,0.04)',
    inner:        '#0f1623',
    innerBorder:  '1px solid rgba(255,255,255,0.06)',
    txt:          '#dde6f0',
    txtMuted:     '#3d5166',
    txtSub:       '#6b7fa0',
    bar:          'rgba(255,255,255,0.07)',
    accent:       '#34d399',
    accentBright: '#6ee7b7',
    accentAlpha:  'rgba(52,211,153,0.1)',
    gold:         '#d4b87a',
    goldAlpha:    'rgba(212,184,122,0.1)',
    progressBg:   'rgba(255,255,255,0.07)',
    tag:          'rgba(255,255,255,0.07)',
    tagTxt:       '#6b7fa0',
    divider:      'rgba(255,255,255,0.06)',
    hover:        'rgba(255,255,255,0.02)',
    success:      '#34d399',
    warning:      '#fbbf24',
    danger:       '#f87171',
    info:         '#818cf8',
    pink:         '#f472b6',
    tableStripe:  'rgba(255,255,255,0.016)',
    chartLine:    '#34d399',
    chartFill:    'rgba(52,211,153,0.06)',
  },
};

/* ─── STATUS_MAP ──────────────────────────────────────────────────── */
const STATUS_MAP = {
  'In Progress': { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: '#10b981' },
  'Starting':    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  'Confirmed':   { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', dot: '#6366f1' },
  'Pending':     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  'Completed':   { color: '#34d399', bg: 'rgba(52,211,153,0.12)', dot: '#34d399' },
  'Cancelled':   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
};

/* ─── Badge ───────────────────────────────────────────────────────── */
const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { color: '#8e97a4', bg: 'rgba(142,151,164,0.1)', dot: '#8e97a4' };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  );
};

/* ─── Sparkline SVG ───────────────────────────────────────────────── */
const Sparkline = ({ data, color, width = 80, height = 32 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const areaPath = `M ${pts[0]} ${pts.join(' L ')} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="2.5" fill={color} />
    </svg>
  );
};

/* ─── Circular Progress Ring ──────────────────────────────────────── */
const Ring = ({ pct, color, size = 56, stroke = 5 }) => {
  const r  = (size - stroke * 2) / 2;
  const c  = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - dash }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  );
};

/* ─── Donut Chart ─────────────────────────────────────────────────── */
const Donut = ({ segments, size = 120, stroke = 16 }) => {
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const gap = 0.015;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const dashLen = ((seg.pct / 100) * (1 - gap * segments.length)) * c;
        const current = offset;
        offset += (seg.pct / 100) * c;
        return (
          <motion.circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={seg.color} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - dashLen }}
            transition={{ duration: 1, delay: i * 0.15 + 0.1, ease: 'easeOut' }}
            style={{ strokeDashoffset: c - dashLen, strokeDasharray: `${dashLen} ${c - dashLen}`, transform: `rotate(${(current / c) * 360}deg)`, transformOrigin: '50% 50%' }}
          />
        );
      })}
    </svg>
  );
};

/* ─── Area Chart (Revenue) ────────────────────────────────────────── */
const AreaChart = ({ data, color, fillColor, width = '100%', height = 100 }) => {
  const containerRef = useRef(null);
  const [w, setW] = useState(260);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const max = Math.max(...data.map(d => d.val));
  const min = 0;
  const range = max - min || 1;
  const pad = 4;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
    const y = height - ((d.val - min) / range) * (height - pad * 2) - pad;
    return { x, y, ...d };
  });
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x},${height} L ${pts[0].x},${height} Z`;
  const gradId = `ag-${Math.random().toString(36).slice(2,7)}`;

  return (
    <div ref={containerRef} style={{ width, position: 'relative', height }}>
      <svg width={w} height={height} style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0"    />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i}
            x1={pad} y1={height * f}
            x2={w - pad} y2={height * f}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        ))}
        <path d={areaD} fill={`url(#${gradId})`} />
        <motion.path
          d={pathD} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={color} opacity="0.85" />
          </g>
        ))}
      </svg>
    </div>
  );
};

/* ─── Animated Counter ────────────────────────────────────────────── */
const Counter = ({ value, prefix = '', suffix = '', duration = 1.2 }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    if (end === 0) return;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [numericValue, duration]);

  const display = typeof value === 'string' && isNaN(Number(value.replace(/[^0-9.]/g, '')))
    ? value
    : `${prefix}${count.toLocaleString()}${suffix}`;
  return <span>{display}</span>;
};

/* ─── Card ────────────────────────────────────────────────────────── */
const Card = ({ children, className = '', style = {}, t, onClick, hoverable = false }) => (
  <div
    className={`rounded-2xl overflow-hidden ${hoverable ? 'cursor-pointer transition-all duration-200 active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl' : ''} ${className}`}
    style={{ background: t.card, boxShadow: t.cardShadow, border: t.cardBorder, ...style }}
    onClick={onClick}
  >
    {children}
  </div>
);

/* ─── KPI Card with Sparkline ─────────────────────────────────────── */
const KPI = ({ icon: Icon, label, value, sub, color, trend, trendUp, delay, t, onClick, sparkData }) => (
  <motion.div {...fadeUp(delay)} className="cursor-pointer group" onClick={onClick}>
    <div
      className="rounded-2xl overflow-hidden relative p-4 sm:p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 active:scale-[0.97]"
      style={{
        background: t.card,
        boxShadow: t.cardShadow,
        border: t.cardBorder,
      }}
    >
      {/* Hover glow layer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 0 1.5px ${color}40, 0 8px 32px ${color}18` }}
      />

      {/* Background glow blob */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none transition-all duration-300 group-hover:opacity-10"
        style={{
          background: color,
          opacity: 0.04,
          filter: 'blur(32px)',
          transform: 'translate(40%,-40%)',
        }}
      />

      {/* Top row: icon + trend badge */}
      <div className="flex items-start justify-between relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-black px-2 py-1 rounded-lg"
            style={{
              background: trendUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: trendUp ? '#10b981' : '#ef4444',
            }}
          >
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="relative z-10">
        <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: t.txtMuted }}>{label}</p>
        <p className="text-2xl font-black mt-0.5 leading-none tabular-nums transition-colors duration-200" style={{ color: t.txt }}>
          <Counter value={value} />
        </p>
        {sub && <p className="text-[10px] mt-1 font-medium" style={{ color: t.txtMuted }}>{sub}</p>}
      </div>

      {/* Sparkline */}
      {sparkData && (
        <div className="pt-1 mt-auto relative z-10">
          <Sparkline data={sparkData} color={color} width={100} height={28} />
        </div>
      )}

      {/* Click hint */}
      <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200 z-10">
        <span className="text-[8px] font-bold flex items-center gap-0.5" style={{ color: t.txtMuted }}>
          <Eye className="w-2.5 h-2.5" /> details
        </span>
      </div>
    </div>
  </motion.div>
);

/* ─── Section Header ──────────────────────────────────────────────── */
const SectionHeader = ({ title, action, actionLabel = 'View all', t, icon: Icon }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {Icon && (
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: t.accentAlpha }}>
          <Icon className="w-3.5 h-3.5" style={{ color: t.accent }} />
        </div>
      )}
      <h3 className="text-sm font-black" style={{ color: t.txt }}>{title}</h3>
    </div>
    {action && (
      <button
        onClick={action}
        className="flex items-center gap-1 text-[10px] font-bold hover:opacity-70 transition-opacity"
        style={{ color: t.accent }}
      >
        {actionLabel} <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

/* ─── Progress Bar ────────────────────────────────────────────────── */
const Bar = ({ pct, color, t, height = 6 }) => (
  <div
    className="w-full rounded-full overflow-hidden"
    style={{ background: t.progressBg, height }}
  >
    <motion.div
      className="h-full rounded-full"
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    />
  </div>
);

/* ─── Modal Wrapper ───────────────────────────────────────────────── */
const ModalWrap = ({ children, onClose }) => (
  <motion.div
    className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}
    onClick={onClose}
    style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
  >
    <motion.div
      initial={{ scale: 0.94, opacity: 0, y: 16 }}
      animate={{ scale: 1,    opacity: 1, y: 0  }}
      exit={{ scale: 0.94,    opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="w-full max-w-sm sm:max-w-md max-h-[85vh] my-auto overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl border flex flex-col relative"
      onClick={e => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

/* ─── KPI Detail Modal ────────────────────────────────────────────── */
const KPIModal = ({ modal, onClose, t }) => {
  if (!modal) return null;
  return (
    <ModalWrap onClose={onClose}>
      <div style={{ background: t.card, borderColor: t.cardBorder }} className="p-4 sm:p-5 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${modal.color}18`, border: `1px solid ${modal.color}30` }}>
              <modal.icon className="w-4 h-4" style={{ color: modal.color }} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm" style={{ color: t.txt }}>{modal.title}</h3>
              <p className="text-[10px] font-medium" style={{ color: t.txtMuted }}>{modal.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Value */}
        <div className="pt-1">
          <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: modal.color }}>
            <Counter value={modal.value} />
          </div>
          <p className="text-xs mt-1 font-medium leading-relaxed" style={{ color: t.txtMuted }}>{modal.description}</p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 pt-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Breakdown</p>
          {modal.breakdown.map(b => (
            <div key={b.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span style={{ color: t.txtSub }}>{b.label}</span>
                <span className="font-bold" style={{ color: t.txt }}>{b.value}</span>
              </div>
              <Bar pct={b.pct} color={modal.color} t={t} height={5} />
            </div>
          ))}
        </div>

        {/* Footer action */}
        <div className="pt-2 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            Close
          </button>
        </div>
      </div>
    </ModalWrap>
  );
};

/* ─── Appointment Detail Modal ────────────────────────────────────── */
const AppointmentModal = ({ row, onClose, t }) => {
  if (!row) return null;
  return (
    <ModalWrap onClose={onClose}>
      <div style={{ background: t.card, borderColor: t.cardBorder }} className="p-4 sm:p-5 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm" style={{ color: t.txt }}>Appointment Details</h3>
          <button onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Client card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#041e16,#0f5040)' }}>
            {row.client.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-xs truncate" style={{ color: t.txt }}>{row.client}</p>
            <p className="text-[11px] truncate font-medium mt-0.5" style={{ color: t.txtMuted }}>{row.service}</p>
          </div>
          <div className="flex-shrink-0"><Badge status={row.status} /></div>
        </div>

        {/* Details list */}
        <div className="space-y-2">
          {[
            { label: 'Therapist', value: row.therapist, icon: UserCheck },
            { label: 'Time',      value: row.time,      icon: Clock     },
            { label: 'Location',  value: row.loc,        icon: MapPin   },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: t.inner, border: t.innerBorder }}>
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.accent }} />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{item.label}</p>
                <p className="text-[11px] font-bold truncate mt-0.5" style={{ color: t.txt }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-1 flex justify-end">
          <button onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            Close
          </button>
        </div>
      </div>
    </ModalWrap>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { theme } = useTheme();
  const t         = TOKENS[theme] || TOKENS.light;
  const isDark    = theme === 'dark';

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [kpiModal,   setKpiModal]   = useState(null);
  const [apptModal,  setApptModal]  = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileView, setMobileView] = useState('cards');
  const [now,        setNow]        = useState(new Date());

  /* live clock tick */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* escape key listener to close active modals */
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        setKpiModal(null);
        setApptModal(null);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try { const r = await API.get('/admin/dashboard'); setData(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  /* ─── Skeleton Loader ─────────────────────────────────────────── */
  if (loading) {
    const shimBase = isDark
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.07)';
    const shimHigh = isDark
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(0,0,0,0.13)';
    const shimCard = isDark ? '#131b2a' : 'rgba(255,255,255,0.98)';
    const shimBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';
    const shimShadow = isDark
      ? '0 4px 32px rgba(0,0,0,0.45)'
      : '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)';
    const shimInner = isDark ? '#0f1623' : '#f8f9fb';
    const shimInnerBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)';

    const pulse = {
      animation: 'skeletonPulse 1.6s ease-in-out infinite',
      background: `linear-gradient(90deg, ${shimBase} 25%, ${shimHigh} 50%, ${shimBase} 75%)`,
      backgroundSize: '400% 100%',
    };

    const Bone = ({ w = '100%', h = 12, radius = 8, style = {} }) => (
      <div style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...pulse, ...style }} />
    );

    const SkCard = ({ children, style = {}, className = '' }) => (
      <div
        className={`rounded-2xl overflow-hidden ${className}`}
        style={{ background: shimCard, border: shimBorder, boxShadow: shimShadow, padding: '20px', ...style }}
      >
        {children}
      </div>
    );

    /* KPI card skeleton */
    const KPISkel = () => (
      <SkCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <Bone w={40} h={40} radius={12} />
          <Bone w={52} h={22} radius={8} />
        </div>
        <Bone w='55%' h={10} radius={6} style={{ marginBottom: 8 }} />
        <Bone w='70%' h={28} radius={8} style={{ marginBottom: 10 }} />
        <Bone w='45%' h={8} radius={5} style={{ marginBottom: 14 }} />
        <Bone w='100%' h={28} radius={6} />
      </SkCard>
    );

    /* Insight mini-card skeleton */
    const InsightSkel = () => (
      <SkCard style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <Bone w={32} h={32} radius={10} />
          <Bone w={20} h={14} radius={5} />
        </div>
        <Bone w='50%' h={8} radius={5} style={{ marginBottom: 6 }} />
        <Bone w='65%' h={20} radius={6} style={{ marginBottom: 6 }} />
        <Bone w='80%' h={7} radius={4} />
      </SkCard>
    );

    /* Table row skeleton */
    const RowSkel = ({ i }) => (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 0',
          borderBottom: i < 4 ? shimInnerBorder : 'none',
        }}
      >
        <Bone w={32} h={32} radius={10} />
        <div style={{ flex: 1 }}>
          <Bone w='50%' h={10} radius={5} style={{ marginBottom: 5 }} />
          <Bone w='35%' h={8} radius={4} />
        </div>
        <Bone w={56} h={10} radius={5} />
        <Bone w={48} h={10} radius={5} />
        <Bone w={64} h={22} radius={8} />
      </div>
    );

    return (
      <AdminLayout title="Dashboard" subtitle="Full operational overview" icon={LayoutDashboard}>
        {/* inject keyframe once */}
        <style>{`
          @keyframes skeletonPulse {
            0%   { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>

          {/* Status bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Bone w={110} h={28} radius={12} />
              <Bone w={200} h={12} radius={6} />
            </div>
            <Bone w={90} h={32} radius={12} />
          </div>

          {/* Row 1 — 4 KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {[0,1,2,3].map(i => <KPISkel key={i} />)}
          </div>

          {/* Row 2 — 4 insight mini-cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {[0,1,2,3].map(i => <InsightSkel key={i} />)}
          </div>

          {/* Row 3 — Live Sessions (2/3) + Activity Feed (1/3) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>

            {/* Sessions card */}
            <SkCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Bone w={22} h={22} radius={6} />
                  <Bone w={120} h={14} radius={6} />
                </div>
              </div>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '14px', borderRadius: 16, marginBottom: 10,
                  background: shimInner, border: shimInnerBorder,
                }}>
                  <Bone w={52} h={52} radius={26} />
                  <div style={{ flex: 1 }}>
                    <Bone w='60%' h={12} radius={6} style={{ marginBottom: 7 }} />
                    <Bone w='40%' h={10} radius={5} style={{ marginBottom: 10 }} />
                    <Bone w='80%' h={8} radius={4} style={{ marginBottom: 10 }} />
                    <Bone w='100%' h={4} radius={4} />
                  </div>
                  <Bone w={64} h={22} radius={8} />
                </div>
              ))}
            </SkCard>

            {/* Activity feed card */}
            <SkCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Bone w={22} h={22} radius={6} />
                  <Bone w={100} h={14} radius={6} />
                </div>
              </div>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '8px 10px', borderRadius: 12, marginBottom: 4,
                  background: i % 2 === 0 ? shimInner : 'transparent',
                }}>
                  <Bone w={24} h={24} radius={8} />
                  <div style={{ flex: 1 }}>
                    <Bone w='75%' h={9} radius={4} style={{ marginBottom: 5 }} />
                    <Bone w='30%' h={8} radius={4} />
                  </div>
                </div>
              ))}
            </SkCard>
          </div>

          {/* Row 4 — Revenue / Donut / Funnel (stacked on mobile) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>

            {/* Revenue chart */}
            <SkCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Bone w={22} h={22} radius={6} />
                  <Bone w={130} h={14} radius={6} />
                </div>
              </div>
              <Bone w='45%' h={28} radius={8} style={{ marginBottom: 6 }} />
              <Bone w='30%' h={10} radius={5} style={{ marginBottom: 18 }} />
              <Bone w='100%' h={90} radius={12} style={{ marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[0,1,2,3,4,5,6].map(i => <Bone key={i} w={24} h={8} radius={4} />)}
              </div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${shimBase}` }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Bone w='40%' h={9} radius={5} />
                      <Bone w='20%' h={9} radius={5} />
                    </div>
                    <Bone w='100%' h={5} radius={4} />
                  </div>
                ))}
              </div>
            </SkCard>

            {/* Booking donut */}
            <SkCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Bone w={22} h={22} radius={6} />
                  <Bone w={140} h={14} radius={6} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 20px' }}>
                <div style={{ position: 'relative', width: 130, height: 130, borderRadius: '50%', ...pulse }} />
              </div>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 12, marginBottom: 8,
                  background: shimInner, border: shimInnerBorder,
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Bone w={10} h={10} radius={5} />
                    <Bone w={70} h={9} radius={4} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Bone w={28} h={9} radius={4} />
                    <Bone w={36} h={14} radius={6} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: `1px solid ${shimBase}` }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ padding: '12px', borderRadius: 12, background: shimInner, border: shimInnerBorder, textAlign: 'center' }}>
                    <Bone w='60%' h={8} radius={4} style={{ margin: '0 auto 6px' }} />
                    <Bone w='80%' h={14} radius={6} style={{ margin: '0 auto' }} />
                  </div>
                ))}
              </div>
            </SkCard>

            {/* Funnel + performers */}
            <SkCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Bone w={22} h={22} radius={6} />
                  <Bone w={120} h={14} radius={6} />
                </div>
              </div>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Bone w='45%' h={10} radius={5} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Bone w={32} h={10} radius={4} />
                      <Bone w={32} h={18} radius={6} />
                    </div>
                  </div>
                  <Bone w='100%' h={5} radius={4} />
                </div>
              ))}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${shimBase}` }}>
                <Bone w={100} h={8} radius={4} style={{ marginBottom: 12 }} />
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px',
                    borderRadius: 12, marginBottom: 8, background: shimInner, border: shimInnerBorder,
                  }}>
                    <Bone w={32} h={32} radius={10} />
                    <div style={{ flex: 1 }}>
                      <Bone w='55%' h={10} radius={5} style={{ marginBottom: 5 }} />
                      <Bone w='40%' h={8} radius={4} />
                    </div>
                    <Bone w={28} h={12} radius={5} />
                  </div>
                ))}
              </div>
            </SkCard>
          </div>

          {/* Row 5 — Therapist Status (1/3) + Staff Performance (2/3) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>

            {/* Therapist status */}
            <SkCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Bone w={22} h={22} radius={6} />
                  <Bone w={130} h={14} radius={6} />
                </div>
              </div>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  padding: '12px', borderRadius: 12, marginBottom: 10,
                  background: shimInner, border: shimInnerBorder,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Bone w={10} h={10} radius={5} />
                      <Bone w={100} h={10} radius={5} />
                    </div>
                    <Bone w={20} h={16} radius={5} />
                  </div>
                  <Bone w='100%' h={5} radius={4} />
                </div>
              ))}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${shimBase}` }}>
                <Bone w={80} h={8} radius={4} style={{ marginBottom: 12 }} />
                {[0,1,2].map(i => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <Bone w='40%' h={10} radius={5} />
                    <Bone w='25%' h={10} radius={5} />
                  </div>
                ))}
              </div>
            </SkCard>

            {/* Staff performance */}
            <SkCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Bone w={22} h={22} radius={6} />
                  <Bone w={130} h={14} radius={6} />
                </div>
              </div>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
                  <Bone w={36} h={36} radius={12} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Bone w={90} h={12} radius={5} />
                        <Bone w={70} h={10} radius={4} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Bone w={28} h={10} radius={4} />
                        <Bone w={40} h={10} radius={4} />
                        <Bone w={44} h={12} radius={5} />
                      </div>
                    </div>
                    <Bone w='100%' h={6} radius={4} />
                  </div>
                </div>
              ))}
            </SkCard>
          </div>

          {/* Row 6 — Recent Appointments table */}
          <SkCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Bone w={22} h={22} radius={6} />
                <Bone w={170} h={14} radius={6} />
              </div>
              <Bone w={60} h={12} radius={5} />
            </div>
            {/* Column headers */}
            <div style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: shimInnerBorder, marginBottom: 4 }}>
              {[100, 80, 90, 55, 60, 60].map((w, i) => <Bone key={i} w={w} h={9} radius={4} />)}
            </div>
            {[0,1,2,3,4].map(i => <RowSkel key={i} i={i} />)}
          </SkCard>

        </div>
      </AdminLayout>
    );
  }

  /* ── data ── */
  const stats          = data?.stats || {};
  const therapistCount = stats.active_therapists || 0;
  const totalBookings  = stats.total_bookings    || 0;
  const clients        = stats.registered_clients|| 0;
  const revenue        = stats.total_revenue     || 0;

  /* sparkline mock data */
  const SPARK = {
    therapists: [18, 20, 17, 22, 21, 20, 22],
    sessions:   [2,  3,  4,  3,  5,  4,  4],
    bookings:   [80, 95, 88, 102,110,98, 112],
    revenue:    [6200,7400,8100,7600,9200,8400,9800],
  };

  const sessions = [
    { id: 1, client: 'Sarah Martinez', therapist: 'Maria Santos', service: 'Swedish Massage', duration: '60 min', start: '9:00 PM',  end: '10:00 PM', pct: 75, location: 'Makati City',  status: 'In Progress' },
    { id: 2, client: 'David Lim',      therapist: 'John Doe',     service: 'Swedish & Hilot', duration: '90 min', start: '9:15 PM',  end: '10:45 PM', pct: 50, location: 'Quezon City', status: 'In Progress' },
    { id: 3, client: 'Patricia Go',    therapist: 'Anna Reyes',   service: 'Mani & Pedi',     duration: '60 min', start: '9:30 PM',  end: '10:30 PM', pct: 20, location: 'BGC, Taguig',  status: 'Starting'    },
  ];

  const chartBars = [
    { day: 'Mon', val: 7490  },
    { day: 'Tue', val: 8500  },
    { day: 'Wed', val: 12450 },
    { day: 'Thu', val: 9200  },
    { day: 'Fri', val: 15600 },
    { day: 'Sat', val: 14200 },
    { day: 'Sun', val: 16800 },
  ];
  const maxVal = Math.max(...chartBars.map(b => b.val));

  const therapistStatus = [
    { label: 'On Duty & Available', count: 18, color: t.success, pct: 60 },
    { label: 'In Treatment',        count: 4,  color: t.warning, pct: 13 },
    { label: 'Break / Offline',     count: 8,  color: t.txtMuted,pct: 27 },
  ];

  const bookingBreakdown = [
    { label: 'Confirmed', count: 940, pct: 84, color: isDark ? '#34d399' : '#0a3d30' },
    { label: 'Pending',   count: 124, pct: 11, color: t.warning },
    { label: 'Cancelled', count: 56,  pct: 5,  color: t.danger  },
  ];

  const serviceRev = [
    { label: 'Massage Therapy', value: '₱62,450', pct: 69, color: t.accent },
    { label: 'Nail Care',       value: '₱18,240', pct: 20, color: t.gold   },
    { label: 'Other Services',  value: '₱9,800',  pct: 11, color: t.info   },
  ];

  const funnelSteps = [
    { step: 'Page Visits',         count: '10,240', pct: 100 },
    { step: 'Service Clicks',      count: '4,850',  pct: 47  },
    { step: 'Bookings Requested',  count: '1,240',  pct: 25  },
    { step: 'Bookings Confirmed',  count: '1,120',  pct: 22  },
    { step: 'Completed Treatment', count: '1,032',  pct: 20  },
  ];

  const activityFeed = [
    { icon: CheckCircle2, color: '#10b981', text: 'Sarah Martinez session completed',          time: '2m ago'  },
    { icon: Calendar,     color: '#6366f1', text: 'Carlos Reyes booked Deep Tissue — 11 PM',  time: '8m ago'  },
    { icon: AlertCircle,  color: '#f59e0b', text: 'Alicia Santos session starting in 5 min',  time: '12m ago' },
    { icon: DollarSign,   color: '#d4b87a', text: '₱850 payment received from David Lim',    time: '25m ago' },
    { icon: Users,        color: '#ec4899', text: 'New client registered: Maria Cruz',         time: '1h ago'  },
    { icon: Star,         color: '#f59e0b', text: '5-star review from Patricia Go',            time: '2h ago'  },
  ];

  const topPerformers = [
    { name: 'Maria Santos', role: 'Lead Therapist', sessions: 12, revenue: '₱9,400', rating: 4.9, pct: 92 },
    { name: 'John Doe',     role: 'Senior Therapist',sessions: 9, revenue: '₱7,200', rating: 4.7, pct: 75 },
    { name: 'Anna Reyes',   role: 'Nail Specialist', sessions: 7, revenue: '₱4,800', rating: 4.8, pct: 58 },
  ];

  const recentRows = data?.recent_appointments?.length
    ? data.recent_appointments.map(a => ({
        client:    a.client_name    || 'Client',
        service:   a.service        || 'Service',
        therapist: a.therapist_name || 'Unassigned',
        time:      a.datetime
          ? new Date(a.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '—',
        loc:    'Manila',
        status: a.status || 'Pending',
      }))
    : [
        { client: 'Sarah Martinez', service: 'Swedish Massage',    therapist: 'Maria Santos', time: '9:00 PM',  loc: 'Makati',       status: 'In Progress' },
        { client: 'David Lim',      service: 'Swedish & Hilot',    therapist: 'John Doe',     time: '9:15 PM',  loc: 'QC',            status: 'In Progress' },
        { client: 'Patricia Go',    service: 'Mani & Pedi',        therapist: 'Anna Reyes',   time: '9:30 PM',  loc: 'BGC',           status: 'Starting'    },
        { client: 'Carlos Reyes',   service: 'Deep Tissue',        therapist: 'Maria Santos', time: '11:00 PM', loc: 'Pasig',         status: 'Confirmed'   },
        { client: 'Alicia Santos',  service: 'Post Natal Massage', therapist: 'TBD',          time: '10:00 AM', loc: 'Mandaluyong',   status: 'Pending'     },
      ];

  const KPI_MODALS = {
    therapists: {
      icon: Users, color: isDark ? '#34d399' : '#0a3d30', title: 'Therapist Overview', subtitle: "Today's workforce",
      value: therapistCount, description: 'Total registered therapists active today.',
      breakdown: therapistStatus.map(s => ({ label: s.label, value: s.count, pct: s.pct })),
    },
    sessions: {
      icon: Activity, color: t.warning, title: 'Live Sessions', subtitle: 'Active treatments',
      value: '4 Live', description: 'Real-time tracking of sessions in progress.',
      breakdown: [
        { label: 'Swedish Massage (Makati)', value: '75% done', pct: 75 },
        { label: 'Swedish & Hilot (QC)',     value: '50% done', pct: 50 },
        { label: 'Mani & Pedi (BGC)',        value: '20% done', pct: 20 },
      ],
    },
    bookings: {
      icon: Calendar, color: t.info, title: 'Booking Summary', subtitle: 'All appointments',
      value: totalBookings, description: 'Scheduled across all therapists.',
      breakdown: bookingBreakdown.map(b => ({ label: b.label, value: b.count.toLocaleString(), pct: b.pct })),
    },
    revenue: {
      icon: DollarSign, color: t.gold, title: 'Revenue Breakdown', subtitle: "Today's earnings",
      value: `₱${revenue.toLocaleString()}`, description: 'Gross revenue from all sessions.',
      breakdown: serviceRev.map(s => ({ label: s.label, value: s.value, pct: s.pct })),
    },
  };

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <AdminLayout title="Dashboard" subtitle="Full operational overview" icon={LayoutDashboard}>
      <AnimatePresence>
        {kpiModal && <KPIModal key="kpi-modal" modal={kpiModal} onClose={() => setKpiModal(null)} t={t} />}
      </AnimatePresence>
      <AnimatePresence>
        {apptModal && <AppointmentModal key="appt-modal" row={apptModal} onClose={() => setApptModal(null)} t={t} />}
      </AnimatePresence>

      <div className="space-y-5 pb-8">

        {/* ══ TOP STATUS BAR ════════════════════════════════════════ */}
        <motion.div {...fadeUp(0)} className="flex items-center justify-between flex-wrap gap-3">
          {/* Live status indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(10,61,48,0.06)', border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : 'rgba(10,61,48,0.12)'}` }}>
              <div className="relative">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.success, display: 'block' }} />
                <span className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ background: t.success, opacity: 0.4 }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: t.success }}>Systems Live</span>
            </div>
            <span className="hidden sm:block text-[10px] font-medium" style={{ color: t.txtMuted }}>
              {now.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-[11px] font-bold px-4 py-2 rounded-xl transition-all hover:opacity-80 active:scale-95 cursor-pointer"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: t.accent }} />
            Refresh
          </button>
        </motion.div>

        {/* ══ ROW 1: KPI CARDS ══════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPI icon={Users}      label="Active Therapists" value={therapistCount || 22}       sub="On duty today"         color={isDark ? '#34d399' : '#0a3d30'} trend="+2"    trendUp sparkData={SPARK.therapists} delay={0.04} t={t} onClick={() => setKpiModal(KPI_MODALS.therapists)} />
          <KPI icon={Activity}   label="Live Sessions"     value="4"                          sub="In-home right now"     color={t.warning}                       trend="Live"  trendUp sparkData={SPARK.sessions}   delay={0.08} t={t} onClick={() => setKpiModal(KPI_MODALS.sessions)}   />
          <KPI icon={Calendar}   label="Total Bookings"    value={totalBookings || 1120}      sub="All scheduled"         color={t.info}                          trend="+12"   trendUp sparkData={SPARK.bookings}   delay={0.12} t={t} onClick={() => setKpiModal(KPI_MODALS.bookings)}   />
          <KPI icon={DollarSign} label="Today's Revenue"   value={revenue || 90490}           sub="All invoices today"    color={t.gold}                          trend="+8.4%" trendUp sparkData={SPARK.revenue}    delay={0.16} t={t} onClick={() => setKpiModal(KPI_MODALS.revenue)}    />
        </div>

        {/* ══ ROW 2: INSIGHT STRIP ══════════════════════════════════ */}
        <motion.div {...fadeUp(0.2)} className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Flame,   label: 'Conversion',   value: '68.4%', color: t.danger,  sub: '+3.2% vs last week', up: true  },
            { icon: Award,   label: 'Completion',   value: '92.1%', color: t.success, sub: 'Excellent rate',      up: true  },
            { icon: Target,  label: 'Cancellation', value: '4.8%',  color: t.warning, sub: '-0.5% this week',    up: false },
            { icon: Zap,     label: 'Avg Session',  value: '72 min',color: t.info,    sub: 'Across all services', up: true  },
          ].map((ins, i) => (
            <motion.div
              key={ins.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
              className="group p-3 sm:p-4 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-default relative overflow-hidden"
              style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}
            >
              {/* hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `0 0 0 1px ${ins.color}30, 0 6px 20px ${ins.color}12` }} />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${ins.color}18`, border: `1px solid ${ins.color}28` }}>
                  <ins.icon className="w-4 h-4" style={{ color: ins.color }} />
                </div>
                <span className="text-[9px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg"
                  style={{ color: ins.up ? t.success : t.danger, background: ins.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                  {ins.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {ins.up ? '↑' : '↓'}
                </span>
              </div>
              <p className="text-[9px] uppercase font-black tracking-wider relative z-10" style={{ color: t.txtMuted }}>{ins.label}</p>
              <p className="text-lg sm:text-xl font-black relative z-10" style={{ color: ins.color }}>{ins.value}</p>
              <p className="text-[9px] mt-0.5 relative z-10" style={{ color: t.txtMuted }}>{ins.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ══ ROW 3: LIVE SESSIONS + THERAPIST STATUS + ACTIVITY ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Live Sessions — 2 cols */}
          <motion.div {...fadeUp(0.24)} className="lg:col-span-2">
            <Card t={t} className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: t.accentAlpha }}>
                    <Wifi className="w-3.5 h-3.5" style={{ color: t.accent }} />
                  </div>
                  <h3 className="text-sm font-black" style={{ color: t.txt }}>Active Sessions</h3>
                </div>
                {/* Live pulse indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#ef4444' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#ef4444' }} />
                  </span>
                  <span className="text-[9px] font-black" style={{ color: '#ef4444' }}>LIVE</span>
                </div>
              </div>
              <div className="space-y-3">
                {sessions.map(s => {
                  const pctColor = s.pct > 60 ? t.accent : s.pct > 30 ? t.warning : t.danger;
                  return (
                    <div key={s.id}
                      className="group p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                      style={{ background: t.inner, border: t.innerBorder }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative flex-shrink-0">
                          <Ring pct={s.pct} color={pctColor} size={52} stroke={5} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black" style={{ color: pctColor }}>{s.pct}%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[12px] font-bold" style={{ color: t.txt }}>
                                {s.service}
                                <span className="font-normal ml-1.5 text-[10px]" style={{ color: t.txtMuted }}>· {s.duration}</span>
                              </p>
                              <p className="text-[10px] mt-0.5" style={{ color: t.txtSub }}>
                                <span style={{ fontWeight: 600 }}>{s.client}</span>
                                <span style={{ color: t.txtMuted }}> · </span>
                                <span style={{ color: t.accent, fontWeight: 700 }}>{s.therapist}</span>
                              </p>
                            </div>
                            <Badge status={s.status} />
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: t.txtMuted }}>
                              <MapPin className="w-2.5 h-2.5" />{s.location}
                            </span>
                            <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: t.txtMuted }}>
                              <Clock className="w-2.5 h-2.5" />{s.start} – {s.end}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Bar pct={s.pct} color={pctColor} t={t} height={4} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div {...fadeUp(0.28)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: t.accentAlpha }}>
                    <Activity className="w-3.5 h-3.5" style={{ color: t.accent }} />
                  </div>
                  <h3 className="text-sm font-black" style={{ color: t.txt }}>Live Activity</h3>
                </div>
                <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: t.accentAlpha, color: t.accent }}>Real-time</span>
              </div>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {activityFeed.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="group flex items-start gap-3 py-2.5 px-2.5 rounded-xl hover:scale-[1.01] transition-all duration-150 cursor-default"
                    style={{ background: i % 2 === 0 ? t.tableStripe : 'transparent' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-150 group-hover:scale-110"
                      style={{ background: `${item.color}18`, border: `1px solid ${item.color}20` }}
                    >
                      <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold leading-snug" style={{ color: t.txtSub }}>{item.text}</p>
                      <p className="text-[9px] mt-0.5 font-bold" style={{ color: t.txtMuted }}>{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ══ ROW 4: REVENUE CHART + BOOKING DONUT + FUNNEL ════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">

          {/* Area Chart — Revenue */}
          <motion.div {...fadeUp(0.32)} className="sm:col-span-2 xl:col-span-1">
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <SectionHeader title="Revenue — 7 Days" icon={TrendingUp} t={t} />
              <div className="mb-1">
                <span className="text-2xl font-black" style={{ color: t.txt }}>₱84,240</span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.12)', color: t.success }}>+14.2% ↑</span>
              </div>
              <p className="text-[10px] mb-3" style={{ color: t.txtMuted }}>vs. last week</p>

              {/* Area Chart */}
              <div className="flex-1 mt-2">
                <AreaChart data={chartBars} color={t.chartLine} fillColor={t.chartFill} height={90} />
                {/* Day labels */}
                <div className="flex justify-between mt-1 px-1">
                  {chartBars.map(b => (
                    <span key={b.day} className="text-[8px] font-bold" style={{ color: t.txtMuted }}>{b.day}</span>
                  ))}
                </div>
              </div>

              {/* By category */}
              <div className="mt-4 pt-4 space-y-2.5" style={{ borderTop: `1px solid ${t.divider}` }}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>By Category</p>
                {serviceRev.map(s => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px]" style={{ color: t.txtSub }}>{s.label}</span>
                      <span className="text-[11px] font-bold" style={{ color: t.txt }}>{s.value}</span>
                    </div>
                    <Bar pct={s.pct} color={s.color} t={t} height={5} />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Donut Chart — Booking Status */}
          <motion.div {...fadeUp(0.36)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <SectionHeader title="Appointment Status" icon={Calendar} t={t} />

              {/* Donut */}
              <div className="flex items-center justify-center my-2 relative">
                <Donut segments={bookingBreakdown} size={130} stroke={18} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black" style={{ color: t.txt }}>
                    {(totalBookings || 1120).toLocaleString()}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: t.txtMuted }}>Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 mt-2 flex-1">
                {bookingBreakdown.map(b => (
                  <div key={b.label}
                    className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{ background: t.inner, border: t.innerBorder }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                      <span className="text-[11px]" style={{ color: t.txtSub }}>{b.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: t.txtMuted }}>{b.pct}%</span>
                      <span className="text-[12px] font-black" style={{ color: t.txt }}>{b.count.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div className="mt-4 pt-4 grid grid-cols-2 gap-2" style={{ borderTop: `1px solid ${t.divider}` }}>
                {[
                  { label: 'Avg Ticket',  value: '₱850',          color: t.warning },
                  { label: 'Commissions', value: '₱12,450',        color: t.info    },
                  { label: 'Clients',     value: clients || 320,    color: t.pink    },
                  { label: 'Total',       value: totalBookings || 1120, color: t.success },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: t.inner, border: t.innerBorder }}>
                    <p className="text-[8px] font-bold uppercase tracking-wide" style={{ color: t.txtMuted }}>{s.label}</p>
                    <p className="text-sm font-black mt-0.5" style={{ color: s.color }}>
                      {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Funnel + Top Performers */}
          <motion.div {...fadeUp(0.40)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <SectionHeader title="Customer Funnel" icon={Target} t={t} />
              <div className="space-y-3 flex-1">
                {funnelSteps.map((f, i) => {
                  const fColor = i === 0 ? t.accent : i < 2 ? t.gold : i < 4 ? t.info : t.success;
                  return (
                    <div key={f.step}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium" style={{ color: t.txtSub }}>{f.step}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black" style={{ color: t.txt }}>{f.count}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${fColor}18`, color: fColor }}>{f.pct}%</span>
                        </div>
                      </div>
                      <Bar pct={f.pct} color={fColor} t={t} height={5} />
                    </div>
                  );
                })}
              </div>

              {/* Top Performers */}
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: t.txtMuted }}>Top Performers</p>
                <div className="space-y-2">
                  {topPerformers.map((p, i) => (
                    <div key={p.name}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl"
                      style={{ background: t.inner, border: t.innerBorder }}
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white"
                          style={{ background: i === 0 ? 'linear-gradient(135deg,#bfa15f,#d4b87a)' : i === 1 ? 'linear-gradient(135deg,#8aa0b8,#a0b4c8)' : 'linear-gradient(135deg,#b87333,#d4925a)' }}
                        >
                          {p.name.charAt(0)}
                        </div>
                        {i === 0 && (
                          <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate" style={{ color: t.txt }}>{p.name}</p>
                        <p className="text-[9px]" style={{ color: t.txtMuted }}>{p.sessions} sessions · {p.revenue}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-black" style={{ color: t.gold }}>★{p.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ══ ROW 5: THERAPIST STATUS + QUICK METRICS ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Therapist status */}
          <motion.div {...fadeUp(0.42)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <SectionHeader title="Therapist Status" icon={Users} t={t} />
              <div className="space-y-3 flex-1">
                {therapistStatus.map(s => (
                  <div key={s.label}
                    className="group p-3 rounded-xl transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 cursor-default"
                    style={{ background: t.inner, border: t.innerBorder }}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="relative flex-shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full block" style={{ background: s.color }} />
                          {s.label.includes('Duty') && <span className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-40" style={{ background: s.color }} />}
                        </span>
                        <span className="text-[11px] font-semibold" style={{ color: t.txtSub }}>{s.label}</span>
                      </div>
                      <span className="text-base font-black transition-colors" style={{ color: t.txt }}>{s.count}</span>
                    </div>
                    <Bar pct={s.pct} color={s.color} t={t} height={5} />
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 space-y-2" style={{ borderTop: `1px solid ${t.divider}` }}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Quick Metrics</p>
                {[
                  { label: 'Avg Ticket',  value: '₱850',     color: t.warning },
                  { label: 'Commissions', value: '₱12,450',  color: t.info    },
                  { label: 'New Clients', value: clients || 42, color: t.pink  },
                ].map(r => (
                  <div key={r.label} className="group flex items-center justify-between py-1.5 px-2 rounded-lg hover:scale-[1.01] transition-all duration-150 cursor-default"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = t.tableStripe}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-[11px]" style={{ color: t.txtSub }}>{r.label}</span>
                    <span className="text-[13px] font-black" style={{ color: r.color }}>
                      {typeof r.value === 'number' ? r.value.toLocaleString() : r.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Staff Performance */}
          <motion.div {...fadeUp(0.44)} className="lg:col-span-2">
            <Card t={t} className="p-4 sm:p-5 h-full">
              <SectionHeader title="Staff Performance" icon={Award} t={t} />
              <div className="space-y-4">
                {[
                  { name: 'Maria Santos', role: 'Lead Therapist',   sessions: 12, revenue: 9400,  rating: 4.9, pct: 94, color: t.accent },
                  { name: 'John Doe',     role: 'Senior Therapist',  sessions: 9,  revenue: 7200,  rating: 4.7, pct: 76, color: t.info   },
                  { name: 'Anna Reyes',   role: 'Nail Specialist',   sessions: 7,  revenue: 4800,  rating: 4.8, pct: 58, color: t.gold   },
                  { name: 'Ben Torres',   role: 'Therapist',         sessions: 5,  revenue: 3500,  rating: 4.5, pct: 40, color: t.pink   },
                ].map((p, i) => (
                  <div key={p.name} className="group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-default"
                    style={{ borderRadius: 12 }}
                    onMouseEnter={e => e.currentTarget.style.background = t.tableStripe}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-black flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ background: `${p.color}18`, border: `1px solid ${p.color}30`, color: p.color }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[12px] font-bold truncate" style={{ color: t.txt }}>{p.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md hidden sm:inline" style={{ background: t.tag, color: t.tagTxt }}>{p.role}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-bold" style={{ color: t.gold }}>★{p.rating}</span>
                          <span className="text-[9px]" style={{ color: t.txtMuted }}>{p.sessions} ses.</span>
                          <span className="text-[11px] font-black" style={{ color: p.color }}>₱{p.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <Bar pct={p.pct} color={p.color} t={t} height={6} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ══ ROW 6: RECENT APPOINTMENTS TABLE ═════════════════════ */}
        <motion.div {...fadeUp(0.48)}>
          <Card t={t} className="overflow-hidden">
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-4"
              style={{ borderBottom: `1px solid ${t.divider}` }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: t.accentAlpha }}>
                  <Calendar className="w-4 h-4" style={{ color: t.accent }} />
                </div>
                <div>
                  <h3 className="text-sm font-black" style={{ color: t.txt }}>Recent Appointments</h3>
                  <p className="text-[10px]" style={{ color: t.txtMuted }}>Today's schedule</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile toggle */}
                <div className="flex sm:hidden items-center rounded-xl overflow-hidden" style={{ border: t.innerBorder }}>
                  {['cards', 'table'].map(v => (
                    <button key={v} onClick={() => setMobileView(v)}
                      className="px-3 py-1.5 text-[9px] font-bold capitalize transition-all"
                      style={{
                        background: mobileView === v ? t.accent : t.inner,
                        color: mobileView === v ? '#fff' : t.txtMuted,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <button
                  className="flex items-center gap-1 text-[10px] font-bold hover:opacity-70 transition-opacity"
                  style={{ color: t.accent }}
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Mobile card view */}
            <div className="block sm:hidden">
              {mobileView === 'cards' ? (
                <div className="p-3 space-y-2">
                  {recentRows.map((row, i) => (
                    <div key={i}
                      onClick={() => setApptModal(row)}
                      className="p-3.5 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
                      style={{ background: i % 2 === 0 ? t.inner : t.tableStripe, border: t.innerBorder }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#041e16,#0f5040)' }}>
                            {row.client.charAt(0)}
                          </div>
                          <span className="text-[12px] font-bold truncate" style={{ color: t.txt }}>{row.client}</span>
                        </div>
                        <Badge status={row.status} />
                      </div>
                      <p className="text-[10px] truncate mb-1" style={{ color: t.txtSub }}>{row.service}</p>
                      <div className="flex items-center gap-3 text-[9px]" style={{ color: t.txtMuted }}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{row.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{row.loc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[480px]">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${t.divider}`, background: t.inner }}>
                        {['Client', 'Service', 'Time', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-[9px] font-black uppercase tracking-wider"
                            style={{ color: t.txtMuted }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentRows.map((row, i) => (
                        <tr key={i}
                          className="cursor-pointer"
                          style={{
                            borderBottom: `1px solid ${t.divider}`,
                            background: i % 2 === 1 ? t.tableStripe : 'transparent',
                          }}
                          onClick={() => setApptModal(row)}
                        >
                          <td className="px-4 py-3 text-[11px] font-semibold" style={{ color: t.txt }}>{row.client}</td>
                          <td className="px-4 py-3 text-[10px]" style={{ color: t.txtSub }}>{row.service}</td>
                          <td className="px-4 py-3 text-[10px]" style={{ color: t.txtMuted }}>{row.time}</td>
                          <td className="px-4 py-3"><Badge status={row.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Desktop full table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.divider}`, background: t.inner }}>
                    {['Client', 'Service', 'Therapist', 'Time', 'Location', 'Status', ''].map(h => (
                      <th key={h}
                        className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider"
                        style={{ color: t.txtMuted, whiteSpace: 'nowrap' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRows.map((row, i) => {
                    const s = STATUS_MAP[row.status] || {};
                    return (
                      <tr key={i}
                        className="cursor-pointer transition-colors group"
                        style={{
                          borderBottom: `1px solid ${t.divider}`,
                          background: i % 2 === 1 ? t.tableStripe : 'transparent',
                          borderLeft: `3px solid ${s.dot || 'transparent'}`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = t.hover; }}
                        onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 1 ? t.tableStripe : 'transparent'; }}
                        onClick={() => setApptModal(row)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#041e16,#0f5040)' }}
                            >
                              {row.client.charAt(0)}
                            </div>
                            <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: t.txt }}>{row.client}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[12px] whitespace-nowrap" style={{ color: t.txtSub }}>{row.service}</td>
                        <td className="px-5 py-4 text-[12px] font-semibold whitespace-nowrap" style={{ color: t.accent }}>{row.therapist}</td>
                        <td className="px-5 py-4 text-[11px] whitespace-nowrap" style={{ color: t.txtMuted }}>{row.time}</td>
                        <td className="px-5 py-4 text-[11px] whitespace-nowrap" style={{ color: t.txtMuted }}>{row.loc}</td>
                        <td className="px-5 py-4"><Badge status={row.status} /></td>
                        <td className="px-5 py-4">
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
