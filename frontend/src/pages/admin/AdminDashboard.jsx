import React, {
  useEffect, useState, useRef, useMemo, useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import {
  DollarSign, Calendar, Users, Activity,
  Clock, MapPin, ArrowUpRight, ArrowDownRight, Zap,
  ChevronRight, ChevronLeft, Target, X, RefreshCw, Eye,
  UserCheck, Award, Flame, TrendingUp, Star,
  CheckCircle2, AlertCircle, Wifi, LayoutDashboard,
  Search, Phone, Check, ShieldCheck, ExternalLink,
  LayoutGrid, Table as TableIcon, Play, Pause,
  AlertTriangle, WifiOff,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS & CONSTANTS
═══════════════════════════════════════════════════════════════════ */
const TOKENS = {
  light: {
    canvas:      '#f0f3f8',
    card:        'rgba(255,255,255,0.98)',
    cardShadow:  '0 1px 3px rgba(0,0,0,0.04), 0 6px 28px rgba(0,0,0,0.07)',
    cardBorder:  '1px solid rgba(0,0,0,0.07)',
    inner:       '#f8f9fb',
    innerBorder: '1px solid rgba(0,0,0,0.06)',
    txt:         '#0d1117',
    txtMuted:    '#94a3b8',
    txtSub:      '#4a5568',
    accent:      '#0a3d30',
    accentBright:'#0f5f4a',
    accentAlpha: 'rgba(10,61,48,0.1)',
    gold:        '#bfa15f',
    goldAlpha:   'rgba(191,161,95,0.12)',
    progressBg:  '#e9edf4',
    tag:         'rgba(0,0,0,0.05)',
    tagTxt:      '#4a5568',
    divider:     'rgba(0,0,0,0.06)',
    hover:       'rgba(0,0,0,0.025)',
    success:     '#10b981',
    warning:     '#f59e0b',
    danger:      '#ef4444',
    info:        '#6366f1',
    pink:        '#ec4899',
    tableStripe: 'rgba(0,0,0,0.015)',
    chartLine:   '#0a3d30',
    chartFill:   'rgba(10,61,48,0.06)',
  },
  dark: {
    canvas:      '#080d17',
    card:        '#111827',
    cardShadow:  '0 4px 32px rgba(0,0,0,0.5)',
    cardBorder:  '1px solid rgba(255,255,255,0.08)',
    inner:       '#0d1421',
    innerBorder: '1px solid rgba(255,255,255,0.07)',
    txt:         '#e2eaf4',
    txtMuted:    '#7e93a8',
    txtSub:      '#9cb2c8',
    accent:      '#34d399',
    accentBright:'#6ee7b7',
    accentAlpha: 'rgba(52,211,153,0.1)',
    gold:        '#d4b87a',
    goldAlpha:   'rgba(212,184,122,0.1)',
    progressBg:  'rgba(255,255,255,0.08)',
    tag:         'rgba(255,255,255,0.07)',
    tagTxt:      '#9cb2c8',
    divider:     'rgba(255,255,255,0.07)',
    hover:       'rgba(255,255,255,0.025)',
    success:     '#34d399',
    warning:     '#fbbf24',
    danger:      '#f87171',
    info:        '#818cf8',
    pink:        '#f472b6',
    tableStripe: 'rgba(255,255,255,0.018)',
    chartLine:   '#34d399',
    chartFill:   'rgba(52,211,153,0.06)',
  },
};

const STATUS_MAP = {
  'In Progress':            { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: '#10b981' },
  'Starting':               { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  'Confirmed':              { color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  dot: '#6366f1' },
  'Pending':                { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  'Completed by Therapist': { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   dot: '#06b6d4' },
  'Completed':              { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  dot: '#34d399' },
  'Cancelled':              { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
};

const SPARK = {
  therapists: [18, 20, 17, 22, 21, 20, 22],
  sessions:   [2,  3,  4,  3,  5,  4,  4 ],
  bookings:   [80, 95, 88, 102, 110, 98, 112],
  revenue:    [6200, 7400, 8100, 7600, 9200, 8400, 9800],
};

const FALLBACK_SESSIONS = [
  { id: 1, client: 'Sarah Martinez', therapist: 'Jacky Adlawan', service: 'Swedish Massage',    duration: '60 min', start: '09:00 PM', end: '10:00 PM', pct: 75, location: 'Suite 101', status: 'In Progress' },
  { id: 2, client: 'David Lim',      therapist: 'Quenay Samson', service: 'Swedish & Hilot',    duration: '90 min', start: '09:15 PM', end: '10:45 PM', pct: 50, location: 'Suite 104', status: 'In Progress' },
  { id: 3, client: 'Patricia Go',    therapist: 'Jade Ferrer',   service: 'Mani & Pedi Spa',    duration: '60 min', start: '09:30 PM', end: '10:30 PM', pct: 20, location: 'Nail Lounge', status: 'Starting'    },
];

const FALLBACK_APPOINTMENTS = [
  { id: 1, client: 'Sarah Martinez', service: 'Swedish Massage',    therapist: 'Jacky Adlawan', time: '09:00 PM', loc: 'Suite 101',  status: 'In Progress', payment_status: 'paid',   notes: 'Prefers lavender aromatherapy.' },
  { id: 2, client: 'David Lim',      service: 'Swedish & Hilot',    therapist: 'Quenay Samson', time: '09:15 PM', loc: 'Suite 104',  status: 'In Progress', payment_status: 'paid',   notes: 'Focus on lower back tension.' },
  { id: 3, client: 'Patricia Go',    service: 'Mani & Pedi Spa',    therapist: 'Jade Ferrer',   time: '09:30 PM', loc: 'Nail Lounge',status: 'Starting',    payment_status: 'paid',   notes: 'Organic gel polish preferred.' },
  { id: 4, client: 'Carlos Reyes',   service: 'Deep Tissue Ritual', therapist: 'Lily Hermosa',  time: '11:00 PM', loc: 'Suite 102',  status: 'Confirmed',   payment_status: 'paid',   notes: 'Post-workout recovery session.' },
  { id: 5, client: 'Alicia Santos',  service: 'Nail Gel Overlay',   therapist: 'Allysa Banlaoi',time: '10:00 AM', loc: 'Suite 105',  status: 'Pending',     payment_status: 'unpaid', notes: 'First-time client; soft pink gel.' },
  { id: 6, client: 'Elena Gomez',    service: 'Aromatherapy Bliss', therapist: 'Jacky Adlawan', time: '02:30 PM', loc: 'Suite 103',  status: 'Completed',   payment_status: 'paid',   notes: 'Settled via GCash.' },
];

/* ═══════════════════════════════════════════════════════════════════
   PRIMITIVE MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

/* ─── Animated Counter ────────────────────────────────────────────── */
const Counter = ({ value, duration = 1.0 }) => {
  const [count, setCount] = useState(0);
  const raw = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;

  useEffect(() => {
    let start = 0;
    if (raw === 0) { setCount(0); return; }
    const step = raw / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= raw) { setCount(raw); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [raw, duration]);

  const isNumericString = typeof value === 'string' && !isNaN(Number(value.replace(/[^0-9.]/g, '')));
  if (!isNumericString && typeof value === 'string') return <span>{value}</span>;
  return <span>{count.toLocaleString()}</span>;
};

/* ─── Status Badge ────────────────────────────────────────────────── */
const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { color: '#8e97a4', bg: 'rgba(142,151,164,0.1)', dot: '#8e97a4' };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap select-none"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: s.dot }} />
      {status}
    </span>
  );
};

/* ─── Sparkline SVG ───────────────────────────────────────────────── */
const Sparkline = ({ data, color, width = 84, height = 26 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPath = `M ${pts[0]} ${pts.join(' L ')} L ${width},${height} L 0,${height} Z`;
  const gId = `sg-${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width={width} height={height} className="overflow-visible block" aria-hidden="true">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gId})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="2.5" fill={color} />
    </svg>
  );
};

/* ─── Circular Ring Progress ──────────────────────────────────────── */
const Ring = ({ pct, color, size = 50, stroke = 5 }) => {
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} className="shrink-0" aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" className="text-slate-300/20 dark:text-white/10" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (pct / 100) * c }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
      />
    </svg>
  );
};

/* ─── Animated Progress Bar ───────────────────────────────────────── */
const Bar = ({ pct, color, t, height = 5 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ background: t.progressBg, height }}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      transition={{ duration: 0.85, ease: 'easeOut' }}
    />
  </div>
);

/* ─── Card Container ──────────────────────────────────────────────── */
const Card = ({ children, className = '', style = {}, t }) => (
  <div
    className={`rounded-2xl sm:rounded-3xl overflow-hidden ${className}`}
    style={{ background: t.card, boxShadow: t.cardShadow, border: t.cardBorder, ...style }}
  >
    {children}
  </div>
);

/* ─── Section Header ──────────────────────────────────────────────── */
const SectionHeader = ({ title, action, actionLabel = 'View all', t, icon: Icon }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2 min-w-0">
      {Icon && (
        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
          <Icon className="w-4 h-4" style={{ color: t.accent }} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-sm sm:text-base font-black tracking-tight truncate" style={{ color: t.txt }}>{title}</h3>
    </div>
    {action && (
      <button
        type="button"
        onClick={action}
        className="flex items-center gap-1 text-[11px] font-bold hover:opacity-75 transition-opacity cursor-pointer p-1 shrink-0"
        style={{ color: t.accent }}
      >
        {actionLabel} <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   INTERACTIVE CHARTS
═══════════════════════════════════════════════════════════════════ */

/* ─── Interactive Donut Chart ─────────────────────────────────────── */
const Donut = ({ segments, size = 134, stroke = 18, onHoverSegment, activeSegment }) => {
  const [hIdx, setHIdx] = useState(null);
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const gap = 0.018;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }} className="shrink-0" aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" className="text-slate-300/15 dark:text-white/5" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const isActive = hIdx === i || (activeSegment?.label === seg.label);
        const dashLen = Math.max(0, ((seg.pct / 100) * (1 - gap * segments.length)) * c);
        const cur = offset;
        offset += (seg.pct / 100) * c;
        return (
          <motion.circle
            key={seg.label || i}
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={seg.color}
            strokeWidth={isActive ? stroke + 4 : stroke}
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${c - dashLen}`}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - dashLen }}
            transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
            style={{
              transform: `rotate(${(cur / c) * 360}deg)`,
              transformOrigin: '50% 50%',
              cursor: 'pointer',
              filter: isActive ? `drop-shadow(0 0 8px ${seg.color})` : 'none',
              transition: 'stroke-width 0.2s, filter 0.2s',
            }}
            onMouseEnter={() => { setHIdx(i); onHoverSegment?.(seg); }}
            onMouseLeave={() => { setHIdx(null); onHoverSegment?.(null); }}
            onClick={() => { onHoverSegment?.(hIdx === i ? null : seg); setHIdx(hIdx === i ? null : i); }}
          />
        );
      })}
    </svg>
  );
};

/* ─── Touch-Scrubbing Area Chart ──────────────────────────────────── */
const AreaChart = ({ data, color, height = 100 }) => {
  const containerRef = useRef(null);
  const [w, setW] = useState(300);
  const [activeIdx, setActiveIdx] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => { if (containerRef.current) setW(containerRef.current.clientWidth || 300); };
    update();
    const ro = new ResizeObserver(([e]) => { if (e.contentRect.width > 0) setW(e.contentRect.width); });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const padX = 14, padY = 12;
  const max = Math.max(...data.map(d => d.val)) * 1.05 || 1;
  const range = max;

  const pts = useMemo(() => data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * (w - padX * 2) + padX,
    y: height - (d.val / range) * (height - padY * 2) - padY,
    ...d,
  })), [data, w, height, range]);

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = pts.length > 1
    ? `${pathD} L ${pts[pts.length-1].x.toFixed(1)},${height} L ${pts[0].x.toFixed(1)},${height} Z`
    : '';
  const gId = `ac-${color.replace(/[^a-z0-9]/gi, '')}`;

  const nearestIdx = (clientX, rect) => {
    const touchX = clientX - rect.left;
    let best = 0, bestDiff = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(p.x - touchX); if (d < bestDiff) { bestDiff = d; best = i; } });
    return best;
  };

  const handleTouch = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const idx = nearestIdx(e.touches[0].clientX, containerRef.current.getBoundingClientRect());
    setActiveIdx(idx);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none touch-pan-x"
      style={{ height }}
      role="img"
      aria-label="Interactive revenue trend chart. Touch or hover to see daily values."
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={() => setActiveIdx(null)}
    >
      <svg width={w} height={height} className="overflow-visible block" aria-hidden="true">
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={padX} y1={height * f} x2={w - padX} y2={height * f}
            stroke="currentColor" className="text-slate-400/15 dark:text-white/5"
            strokeDasharray="3 3" strokeWidth="1" />
        ))}
        {areaD && <path d={areaD} fill={`url(#${gId})`} />}
        <motion.path d={pathD} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }} />
        {pts.map((p, i) => {
          const isHov = activeIdx === i;
          return (
            <g key={p.day || i} className="cursor-pointer"
              onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}>
              {isHov && <circle cx={p.x} cy={p.y} r="9" fill={color} fillOpacity="0.2" className="animate-ping" />}
              <circle cx={p.x} cy={p.y} r={isHov ? 5.5 : 3.5}
                fill={isHov ? '#fff' : color} stroke={color}
                strokeWidth={isHov ? 2.5 : 1.5} className="transition-all duration-150" />
            </g>
          );
        })}
      </svg>
      {activeIdx !== null && pts[activeIdx] && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-xl shadow-2xl text-[11px] font-bold border backdrop-blur-md whitespace-nowrap"
          style={{
            left: Math.max(48, Math.min(w - 48, pts[activeIdx].x)),
            top: Math.max(2, pts[activeIdx].y - 8),
            background: 'rgba(6,24,18,0.95)', color: '#fdfcfa',
            borderColor: 'rgba(191,161,95,0.5)',
          }}
        >
          <span className="text-amber-300">{pts[activeIdx].day}: </span>
          <span className="text-emerald-400">₱{pts[activeIdx].val.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MODAL SYSTEM
═══════════════════════════════════════════════════════════════════ */

/* ─── Modal Overlay & Wrapper ─────────────────────────────────────── */
const ModalWrap = ({ children, onClose, titleId = 'modal-title' }) => {
  const modalRef = useRef(null);

  /* Focus trap */
  useEffect(() => {
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, []);

  useEffect(() => {
    const prev = document.activeElement;
    return () => prev?.focus();
  }, []);

  return (
    <motion.div
      role="dialog" aria-modal="true" aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{ background: 'rgba(4,12,20,0.8)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.96, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full sm:max-w-[540px] max-h-[92vh] sm:max-h-[85vh] flex flex-col min-h-0 rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/* ─── Modal Close Button ──────────────────────────────────────────── */
const ModalClose = ({ onClose, t }) => (
  <button
    type="button" onClick={onClose} aria-label="Close dialog"
    className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none shrink-0"
    style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}
  >
    <X className="w-4 h-4" aria-hidden="true" />
  </button>
);

/* ─── KPI Detail Modal ────────────────────────────────────────────── */
const KPIModal = ({ modal, onClose, t }) => {
  if (!modal) return null;
  return (
    <ModalWrap onClose={onClose} titleId="kpi-modal-title">
      <div style={{ background: t.card, border: t.cardBorder }} className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0" style={{ borderColor: t.divider }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${modal.color}18`, border: `1px solid ${modal.color}30` }}>
              <modal.icon className="w-5 h-5" style={{ color: modal.color }} aria-hidden="true" />
            </div>
            <div>
              <h2 id="kpi-modal-title" className="font-extrabold text-sm sm:text-base" style={{ color: t.txt }}>{modal.title}</h2>
              <p className="text-[11px] font-medium" style={{ color: t.txtMuted }}>{modal.subtitle}</p>
            </div>
          </div>
          <ModalClose onClose={onClose} t={t} />
        </div>

        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl text-center" style={{ background: t.inner, border: t.innerBorder }}>
            <div className="text-3xl sm:text-4xl font-black" style={{ color: modal.color }}>
              <Counter value={modal.value} />
            </div>
            <p className="text-xs mt-1.5 font-medium leading-relaxed max-w-xs mx-auto" style={{ color: t.txtSub }}>
              {modal.description}
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: t.txtMuted }}>Detailed Distribution</p>
            {modal.breakdown.map(b => (
              <div key={b.label} className="p-3 rounded-xl space-y-1.5" style={{ background: t.inner, border: t.innerBorder }}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span style={{ color: t.txtSub }}>{b.label}</span>
                  <span className="font-bold tabular-nums" style={{ color: t.txt }}>{b.value}</span>
                </div>
                <Bar pct={b.pct} color={modal.color} t={t} height={5} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t shrink-0 flex justify-end" style={{ borderColor: t.divider }}>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer hover:opacity-85 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            style={{ background: t.accent, color: '#fff' }}
          >Done</button>
        </div>
      </div>
    </ModalWrap>
  );
};

/* ─── Appointment Detail Modal ────────────────────────────────────── */
const AppointmentModal = ({ row, onClose, t, navigate }) => {
  if (!row) return null;

  const goToBookings = () => {
    onClose();
    const tab = row.status === 'Pending' ? 'pending' : 'confirmed';
    navigate(`/admin/appointments?tab=${tab}&id=${row.id ?? ''}`);
  };

  const detailItems = [
    { label: 'Therapist',   value: row.therapist,      icon: UserCheck  },
    { label: 'Schedule',    value: row.time,            icon: Clock      },
    { label: 'Suite',       value: row.loc,             icon: MapPin     },
    { label: 'Settlement',  value: (row.payment_status || 'on-site').toUpperCase(), icon: ShieldCheck },
  ];

  return (
    <ModalWrap onClose={onClose} titleId="appt-modal-title">
      <div style={{ background: t.card }} className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0" style={{ borderColor: t.divider }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
              <Calendar className="w-4 h-4" style={{ color: t.accent }} aria-hidden="true" />
            </div>
            <div>
              <h2 id="appt-modal-title" className="font-extrabold text-sm sm:text-base" style={{ color: t.txt }}>Appointment Details</h2>
              <p className="text-[10px] font-medium" style={{ color: t.txtMuted }}>
                {row.id ? `Booking #${row.id}` : 'Verified Reservation'}
              </p>
            </div>
          </div>
          <ModalClose onClose={onClose} t={t} />
        </div>

        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-3">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#062c22,#0f5f4a)' }}>
              {row.client?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm truncate" style={{ color: t.txt }}>{row.client}</p>
              <p className="text-xs truncate font-medium mt-0.5" style={{ color: t.txtSub }}>{row.service}</p>
            </div>
            <Badge status={row.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {detailItems.map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                  <item.icon className="w-4 h-4" style={{ color: t.accent }} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{item.label}</p>
                  <p className="text-xs font-bold truncate mt-0.5" style={{ color: t.txt }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {row.notes && (
            <div className="p-3.5 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: t.txtMuted }}>Notes & Preferences</p>
              <p className="text-xs font-medium leading-relaxed" style={{ color: t.txtSub }}>{row.notes}</p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t shrink-0 flex items-center justify-between gap-2 flex-wrap" style={{ borderColor: t.divider }}>
          <button type="button" onClick={goToBookings}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            style={{ background: t.inner, border: t.innerBorder, color: t.accent }}
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /> Open in Bookings
          </button>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer hover:opacity-85 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            style={{ background: t.accent, color: '#fff' }}
          >Done</button>
        </div>
      </div>
    </ModalWrap>
  );
};

/* ─── Session Detail Modal ────────────────────────────────────────── */
const SessionDetailModal = ({ session, onClose, t }) => {
  if (!session) return null;
  const pctColor = session.pct > 60 ? t.accent : session.pct > 30 ? t.warning : t.danger;

  return (
    <ModalWrap onClose={onClose} titleId="session-modal-title">
      <div style={{ background: t.card }} className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0" style={{ borderColor: t.divider }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <Wifi className="w-4 h-4 text-rose-500 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h2 id="session-modal-title" className="font-extrabold text-sm sm:text-base" style={{ color: t.txt }}>Live Session Telemetry</h2>
              <p className="text-[10px] font-medium" style={{ color: t.txtMuted }}>Real-time operational data</p>
            </div>
          </div>
          <ModalClose onClose={onClose} t={t} />
        </div>

        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-3">
          <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: t.inner, border: t.innerBorder }}>
            <div className="relative shrink-0">
              <Ring pct={session.pct} color={pctColor} size={64} stroke={6} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black" style={{ color: pctColor }}>{session.pct}%</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-extrabold text-sm truncate" style={{ color: t.txt }}>{session.service}</p>
                <Badge status={session.status} />
              </div>
              <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: t.accent }}>Specialist: {session.therapist}</p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: t.txtMuted }}>Client: {session.client} · {session.duration}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[{ label: 'Started', value: session.start }, { label: 'Est. End', value: session.end }].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{item.label}</p>
                <p className="text-xs font-black mt-0.5" style={{ color: t.txt }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: t.inner, border: t.innerBorder }}>
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>Location</p>
              <p className="text-xs font-bold truncate mt-0.5" style={{ color: t.txt }}>{session.location}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t shrink-0 flex items-center justify-between gap-2" style={{ borderColor: t.divider }}>
          <button type="button"
            onClick={() => alert(`Contacting coordinator for ${session.therapist}...`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" /> Call Therapist
          </button>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer hover:opacity-85 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            style={{ background: t.accent, color: '#fff' }}
          >Done</button>
        </div>
      </div>
    </ModalWrap>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════════════════════════════ */
const DashboardSkeleton = ({ isDark }) => {
  const base  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const high  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const bg    = isDark ? '#111827' : '#fff';
  const bdr   = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';
  const inner = isDark ? '#0d1421' : '#f8f9fb';
  const iBdr  = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)';
  const pulse = {
    animation: 'skPulse 1.5s ease-in-out infinite',
    background: `linear-gradient(90deg,${base} 25%,${high} 50%,${base} 75%)`,
    backgroundSize: '400% 100%',
  };
  const Bone = ({ w = '100%', h = 12, r = 8, style = {} }) => (
    <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...pulse, ...style }} />
  );
  const SkCard = ({ children, className = '' }) => (
    <div className={`rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-5 ${className}`}
      style={{ background: bg, border: bdr }}>{children}</div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 pb-12" aria-busy="true" aria-label="Loading dashboard">
      <style>{`@keyframes skPulse{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5"><Bone w={130} h={32} /><Bone w={200} h={16} style={{ display: window.innerWidth < 640 ? 'none' : 'block' }} /></div>
        <div className="flex gap-2"><Bone w={100} h={36} /><Bone w={90} h={36} /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[0,1,2,3].map(i => (
          <SkCard key={i}>
            <div className="flex justify-between mb-3"><Bone w={40} h={40} r={12} /><Bone w={54} h={22} r={8} /></div>
            <Bone w="50%" h={10} r={6} style={{ marginBottom: 8 }} />
            <Bone w="70%" h={26} r={8} style={{ marginBottom: 8 }} />
            <Bone w="40%" h={10} r={5} style={{ marginBottom: 12 }} />
            <Bone w="100%" h={24} r={6} />
          </SkCard>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {[0,1,2,3].map(i => (
          <SkCard key={i} className="!p-3.5 sm:!p-4">
            <div className="flex justify-between mb-2"><Bone w={32} h={32} r={10} /><Bone w={24} h={16} r={6} /></div>
            <Bone w="45%" h={8} r={4} style={{ marginBottom: 6 }} />
            <Bone w="65%" h={22} r={6} style={{ marginBottom: 6 }} />
            <Bone w="75%" h={8} r={4} />
          </SkCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <SkCard className="lg:col-span-2">
          <div className="flex justify-between mb-4"><Bone w={150} h={20} r={6} /><Bone w={60} h={22} r={8} /></div>
          <div className="space-y-3">
            {[0,1,2].map(i => (
              <div key={i} className="p-4 rounded-2xl flex gap-3 items-center" style={{ background: inner, border: iBdr }}>
                <Bone w={50} h={50} r={25} /><div className="flex-1 space-y-2"><Bone w="50%" h={12} /><Bone w="40%" h={10} /><Bone h={5} /></div>
              </div>
            ))}
          </div>
        </SkCard>
        <SkCard>
          <div className="flex justify-between mb-4"><Bone w={110} h={20} r={6} /><Bone w={50} h={18} r={6} /></div>
          <div className="space-y-3">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-2.5 items-center py-1">
                <Bone w={28} h={28} r={8} />
                <div className="flex-1 space-y-1.5"><Bone w="75%" h={11} r={4} /><Bone w="30%" h={8} r={4} /></div>
              </div>
            ))}
          </div>
        </SkCard>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   ERROR STATE
═══════════════════════════════════════════════════════════════════ */
const DashboardError = ({ message, onRetry, t }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-4">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
      <WifiOff className="w-8 h-8" style={{ color: t.danger }} aria-hidden="true" />
    </div>
    <div>
      <h2 className="text-base font-black" style={{ color: t.txt }}>Telemetry Service Unavailable</h2>
      <p className="text-sm mt-1 max-w-sm" style={{ color: t.txtMuted }}>{message || 'Unable to connect. Check network and try again.'}</p>
    </div>
    <button type="button" onClick={onRetry}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
      style={{ background: t.accent, color: '#fff' }}
    >
      <RefreshCw className="w-4 h-4" aria-hidden="true" /> Retry Connection
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   KPI CARD COMPONENT
═══════════════════════════════════════════════════════════════════ */
const KPI = ({ icon: Icon, label, value, displayValue, sub, color, trend, trendUp, delay, t, onClick, sparkData }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    tabIndex={0} role="button"
    aria-label={`${label}: ${displayValue || value}. Press Enter for details.`}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    onClick={onClick}
    className="group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl sm:rounded-3xl cursor-pointer"
  >
    <div
      className="rounded-2xl sm:rounded-3xl overflow-hidden relative p-4 sm:p-5 flex flex-col justify-between h-full min-h-[155px] sm:min-h-[165px] transition-all duration-200 hover:-translate-y-1 active:scale-[0.98]"
      style={{ background: t.card, boxShadow: t.cardShadow, border: t.cardBorder }}
    >
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 0 1.5px ${color}40, 0 8px 32px ${color}18` }} />
      <div className="absolute top-0 right-0 w-28 sm:w-32 h-28 sm:h-32 rounded-full pointer-events-none opacity-[0.05] group-hover:opacity-[0.14] transition-all duration-300"
        style={{ background: color, filter: 'blur(32px)', transform: 'translate(30%,-30%)' }} />

      <div className="flex items-start justify-between relative z-10 gap-2">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-sm"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} aria-hidden="true" />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-[10px] font-black px-2 py-1 rounded-lg shrink-0 whitespace-nowrap shadow-sm"
            style={{ background: trendUp ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)', color: trendUp ? '#10b981' : '#ef4444' }}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10 my-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: t.txtMuted }}>{label}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 leading-tight tabular-nums" style={{ color: t.txt }}>
          {displayValue ?? <Counter value={value} />}
        </p>
        {sub && <p className="text-[11px] mt-1 font-medium truncate" style={{ color: t.txtSub }}>{sub}</p>}
      </div>

      <div className="relative z-10 flex items-end justify-between pt-1 mt-auto">
        {sparkData ? <Sparkline data={sparkData} color={color} width={84} height={26} /> : <div />}
        <span className="text-[9px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-80 transition-opacity duration-200 text-slate-400">
          <Eye className="w-3 h-3" /> Details
        </span>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { theme }  = useTheme();
  const t          = TOKENS[theme] || TOKENS.light;
  const isDark     = theme === 'dark';
  const navigate   = useNavigate();

  /* ─── State ─────────────────────────────────────────────────────── */
  const [data,           setData]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [refreshing,     setRefreshing]     = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [autoRefresh,    setAutoRefresh]    = useState(false);
  const [countdown,      setCountdown]      = useState(30);
  const [now,            setNow]            = useState(new Date());

  const [kpiModal,     setKpiModal]     = useState(null);
  const [apptModal,    setApptModal]    = useState(null);
  const [sessionModal, setSessionModal] = useState(null);

  const [chartPeriod,    setChartPeriod]    = useState('7D');
  const [activeDonutSeg, setActiveDonutSeg] = useState(null);
  const [viewMode,       setViewMode]       = useState('table');
  const [apptFilter,     setApptFilter]     = useState('All');
  const [apptSearch,     setApptSearch]     = useState('');
  const [page,           setPage]           = useState(1);
  const pageSize = 6;

  /* ─── Live Clock ─────────────────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* ─── Escape key ─────────────────────────────────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        setKpiModal(null); setApptModal(null); setSessionModal(null);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* ─── Data Fetcher ───────────────────────────────────────────────── */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const r = await API.get('/admin/dashboard');
      setData(r.data);
      if (silent) {
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
      if (!silent) setError(e?.response?.data?.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(30);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ─── Auto-Refresh Countdown ─────────────────────────────────────── */
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { load(true); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  /* ─── Reset pagination on filter change ─────────────────────────── */
  useEffect(() => { setPage(1); }, [apptFilter, apptSearch]);

  /* ─── Derived Data ───────────────────────────────────────────────── */
  const stats         = data?.stats || {};
  const therapistCount = stats.active_therapists || 0;
  const totalBookings  = stats.total_bookings    || 0;
  const clientsCount   = stats.registered_clients|| 0;
  const revenue        = stats.total_revenue     || 0;

  const sessions = useMemo(() => {
    const live = (data?.active_sessions || []);
    return live.length > 0 ? live : FALLBACK_SESSIONS;
  }, [data]);

  const recentRows = useMemo(() => {
    if (data?.recent_appointments?.length) {
      return data.recent_appointments.map(a => {
        let timeStr = '—';
        if (a.datetime) {
          const d = new Date(a.datetime.includes('T') ? a.datetime : a.datetime.replace(' ', 'T'));
          timeStr = isNaN(d.getTime()) ? String(a.datetime).slice(11, 16) : d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
        }
        return {
          id:             a.id,
          client:         a.client_name    || 'Valued Client',
          service:        a.service        || 'Signature Treatment',
          therapist:      a.therapist_name || 'Unassigned',
          time:           timeStr,
          loc:            'Main Salon Suite',
          status:         a.status         || 'Pending',
          payment_status: a.payment_status || 'unpaid',
          notes:          a.notes          || '',
        };
      });
    }
    return FALLBACK_APPOINTMENTS;
  }, [data]);

  const filteredAppointments = useMemo(() => {
    const q = apptSearch.trim().toLowerCase();
    return recentRows.filter(row => {
      const matchFilter = apptFilter === 'All' || row.status.toLowerCase() === apptFilter.toLowerCase();
      if (!matchFilter) return false;
      if (!q) return true;
      return (
        row.client.toLowerCase().includes(q) ||
        row.service.toLowerCase().includes(q) ||
        row.therapist.toLowerCase().includes(q) ||
        row.loc.toLowerCase().includes(q) ||
        String(row.id).includes(q)
      );
    });
  }, [recentRows, apptFilter, apptSearch]);

  const paginatedAppointments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));

  /* ─── Real-time Booking Breakdown ────────────────────────────────── */
  const bookingBreakdown = useMemo(() => {
    if (data?.booking_breakdown) {
      const b = data.booking_breakdown;
      const confirmed = Number(b.confirmed || 0);
      const pending   = Number(b.pending || 0);
      const cancelled = Number(b.cancelled || 0);
      const sum = confirmed + pending + cancelled || 1;
      return [
        { label: 'Confirmed', count: confirmed, pct: Math.round((confirmed / sum) * 100), color: t.info },
        { label: 'Pending',   count: pending,   pct: Math.round((pending / sum) * 100),   color: t.warning },
        { label: 'Cancelled', count: cancelled, pct: Math.round((cancelled / sum) * 100), color: t.danger },
      ];
    }
    return [
      { label: 'Confirmed', count: 68, pct: 68, color: t.info },
      { label: 'Pending',   count: 24, pct: 24, color: t.warning },
      { label: 'Cancelled', count: 8,  pct: 8,  color: t.danger },
    ];
  }, [data, t]);

  /* ─── Real-time Category Breakdown ────────────────────────────────── */
  const categoryBreakdown = useMemo(() => {
    if (data?.revenue_chart?.categories?.length) {
      const colors = [t.accent, t.gold, t.info, t.pink, t.warning];
      return data.revenue_chart.categories.map((c, i) => ({
        ...c,
        color: colors[i % colors.length],
      }));
    }
    return [
      { label: 'Massage Therapy',    value: '₱62,450', pct: 69, color: t.accent },
      { label: 'Nail Care & Spa',    value: '₱18,240', pct: 20, color: t.gold   },
      { label: 'Specialty Rituals',  value: '₱9,800',  pct: 11, color: t.info   },
    ];
  }, [data, t]);

  /* ─── Real-time Revenue Chart Datasets ───────────────────────────── */
  const currentDataset = useMemo(() => {
    const real7D = data?.revenue_chart?.['7D'];
    const real7DTotal = real7D && real7D.length
      ? real7D.reduce((acc, curr) => acc + (Number(curr.val) || 0), 0)
      : 0;

    const chartDatasets = {
      '7D': {
        bars: (real7D && real7D.length > 0) ? real7D : [
          { day: 'Mon', val: 7490 },
          { day: 'Tue', val: 8500 },
          { day: 'Wed', val: 12450 },
          { day: 'Thu', val: 9200 },
          { day: 'Fri', val: 14800 },
          { day: 'Sat', val: 16800 },
          { day: 'Sun', val: 15400 },
        ],
        total: real7DTotal > 0 ? `₱${real7DTotal.toLocaleString()}` : (revenue > 0 ? `₱${revenue.toLocaleString()}` : '₱84,640'),
        growth: '+18.5%',
      },
      '14D': {
        bars: [
          { day: 'D1-2', val: 16200 },
          { day: 'D3-4', val: 19800 },
          { day: 'D5-6', val: 24500 },
          { day: 'D7-8', val: 21300 },
          { day: 'D9-10', val: 27900 },
          { day: 'D11-12', val: 31200 },
          { day: 'D13-14', val: 33500 },
        ],
        total: `₱${Math.round(real7DTotal > 0 ? real7DTotal * 1.85 : (revenue > 0 ? revenue * 1.8 : 174400)).toLocaleString()}`,
        growth: '+21.4%',
      },
      '30D': {
        bars: [
          { day: 'Week 1', val: 48500 },
          { day: 'Week 2', val: 56200 },
          { day: 'Week 3', val: 61400 },
          { day: 'Week 4', val: 72800 },
        ],
        total: `₱${Math.round(real7DTotal > 0 ? real7DTotal * 3.8 : (revenue > 0 ? revenue * 3.5 : 238900)).toLocaleString()}`,
        growth: '+24.1%',
      },
    };

    return chartDatasets[chartPeriod] || chartDatasets['7D'];
  }, [data, revenue, chartPeriod]);

  /* ─── Real-time Operational Insights ─────────────────────────────── */
  const quickInsights = useMemo(() => {
    const total = totalBookings || 1;
    const confirmed = stats.confirmed_bookings || 0;
    const completed = stats.completed_bookings || 0;
    const cancelled = stats.cancelled_bookings || 0;

    const convRate = totalBookings > 0 ? `${Math.min(100, Math.round((confirmed / total) * 100))}%` : '68.4%';
    const compRate = confirmed > 0 ? `${Math.min(100, Math.round((completed / confirmed) * 100))}%` : '92.1%';
    const cancRate = totalBookings > 0 ? `${Math.min(100, Math.round((cancelled / total) * 100))}%` : '4.8%';

    return [
      { icon: Flame,  label: 'Conversion',   value: convRate, color: t.danger,  sub: '+3.2% vs last wk', up: true  },
      { icon: Award,  label: 'Completion',   value: compRate, color: t.success, sub: 'Optimal fulfilment', up: true },
      { icon: Target, label: 'Cancellation', value: cancRate, color: t.warning, sub: '–0.5% this week',   up: false },
      { icon: Zap,    label: 'Avg Session',  value: '60 min', color: t.info,    sub: 'Across all rituals', up: true  },
    ];
  }, [stats, totalBookings, t]);

  /* ─── Real-time Therapist Status ──────────────────────────────────── */
  const therapistStatus = useMemo(() => {
    if (data?.therapist_status?.length) {
      return data.therapist_status;
    }
    return [
      { label: 'On Duty & Available', count: Math.max(0, (therapistCount || 18) - 4 - 8), color: t.success, pct: 60 },
      { label: 'In Active Treatment',  count: 4,  color: t.warning, pct: 13 },
      { label: 'Break / Offline',      count: 8,  color: t.txtMuted, pct: 27 },
    ];
  }, [data, therapistCount, t]);

  /* ─── Real-time Customer Funnel ───────────────────────────────────── */
  const funnelSteps = useMemo(() => {
    if (data?.customer_funnel?.steps?.length) {
      return data.customer_funnel.steps;
    }
    const req = totalBookings || 20;
    const clk = Math.round(req * 3.9);
    const vis = Math.round(clk * 2.15);
    const conf = stats.confirmed_bookings || Math.round(req * 0.85);
    const comp = stats.completed_bookings || Math.round(req * 0.70);
    return [
      { step: 'Page Visits',          count: vis.toLocaleString(),  pct: 100 },
      { step: 'Service Clicks',       count: clk.toLocaleString(),  pct: Math.round((clk / vis) * 100) },
      { step: 'Bookings Requested',   count: req.toLocaleString(),  pct: Math.round((req / vis) * 100) },
      { step: 'Bookings Confirmed',   count: conf.toLocaleString(), pct: Math.round((conf / vis) * 100) },
      { step: 'Completed Treatment',  count: comp.toLocaleString(), pct: Math.round((comp / vis) * 100) },
    ];
  }, [data, totalBookings, stats]);

  /* ─── Real-time Conversion Analytics ──────────────────────────────── */
  const conversionAnalytics = useMemo(() => {
    if (data?.customer_funnel?.analytics?.length) {
      return data.customer_funnel.analytics;
    }
    return [
      { label: 'Overall Conversion',    value: '10.1%', color: t.success },
      { label: 'Booking Request Rate',  value: '12.1%', color: t.accent  },
      { label: 'Treatment Fulfilment',  value: '92.1%', color: t.info    },
    ];
  }, [data, t]);

  /* ─── Real-time Operational KPIs ──────────────────────────────────── */
  const operationalKpis = useMemo(() => {
    if (data?.operational_kpis?.length) {
      return data.operational_kpis;
    }
    return [
      { label: 'Avg Ticket Size',  value: `₱${(stats.avg_ticket_size || 850).toLocaleString()}`, color: t.warning },
      { label: 'Staff Retention',  value: '96.2%', color: t.info    },
      { label: 'Client Retention', value: '88.4%', color: t.success },
    ];
  }, [data, stats, t]);

  /* ─── Real-time Activity Feed from Audit Log ──────────────────────── */
  const activityFeed = useMemo(() => {
    if (data?.activity_feed?.length) {
      return data.activity_feed.map(item => {
        let Icon = Activity;
        if (item.icon === 'user') Icon = Users;
        else if (item.icon === 'calendar') Icon = Calendar;
        else if (item.icon === 'dollar') Icon = DollarSign;
        else if (item.icon === 'alert') Icon = AlertCircle;
        return {
          icon: Icon,
          color: item.color || t.accent,
          text: item.text,
          time: item.time,
        };
      });
    }
    return [
      { icon: CheckCircle2, color: '#10b981', text: 'Sarah Martinez ritual completed',        time: '2m ago'  },
      { icon: Calendar,     color: '#6366f1', text: 'Carlos Reyes scheduled Deep Tissue—11PM', time: '8m ago'  },
      { icon: AlertCircle,  color: '#f59e0b', text: 'Alicia Santos session starting in 5 min', time: '12m ago' },
      { icon: DollarSign,   color: '#d4b87a', text: '₱850 settlement received · David Lim',   time: '25m ago' },
      { icon: Users,        color: '#ec4899', text: 'New client account: Maria Cruz',          time: '1h ago'  },
      { icon: Star,         color: '#f59e0b', text: '5★ review from Patricia Go',             time: '2h ago'  },
    ];
  }, [data, t]);

  /* ─── KPI Modals Configuration ───────────────────────────────────── */
  const KPI_MODALS = {
    therapists: {
      icon: Users, color: isDark ? '#34d399' : '#0a3d30',
      title: 'Therapist Overview', subtitle: "Today's workforce",
      value: therapistCount || 22,
      description: 'Total active therapists available across operational zones today.',
      breakdown: therapistStatus.map(s => ({ label: s.label, value: String(s.count), pct: s.pct })),
    },
    sessions: {
      icon: Activity, color: t.warning,
      title: 'Live Session Telemetry', subtitle: 'Active treatments',
      value: `${sessions.length} Live`,
      description: 'Real-time count of spa treatments actively in progress.',
      breakdown: sessions.map(s => ({ label: `${s.service} (${s.location})`, value: `${s.pct}% done`, pct: s.pct })),
    },
    bookings: {
      icon: Calendar, color: t.info,
      title: 'Booking Summary', subtitle: 'All appointments',
      value: totalBookings || 1120,
      description: 'All bookings distributed across online and walk-in channels.',
      breakdown: bookingBreakdown.map(b => ({ label: b.label, value: b.count.toLocaleString(), pct: b.pct })),
    },
    revenue: {
      icon: DollarSign, color: t.gold,
      title: 'Revenue Breakdown', subtitle: "Gross earnings",
      value: revenue || 90490,
      displayValue: revenue > 0 ? `₱${(revenue).toLocaleString()}` : undefined,
      description: 'Gross collected revenue from all completed and active bookings.',
      breakdown: categoryBreakdown.map(c => ({ label: c.label, value: c.value, pct: c.pct })),
    },
  };

  /* ─── Loading / Error States ─────────────────────────────────────── */
  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Full operational overview" icon={LayoutDashboard}>
        <DashboardSkeleton isDark={isDark} />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="Full operational overview" icon={LayoutDashboard}>
        <Card t={t}>
          <DashboardError message={error} onRetry={() => load()} t={t} />
        </Card>
      </AdminLayout>
    );
  }

  /* ─── Main Render ────────────────────────────────────────────────── */
  return (
    <AdminLayout title="Dashboard" subtitle="Full operational overview" icon={LayoutDashboard}>

      {/* ─── Modals ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {kpiModal && <KPIModal key="kpi" modal={kpiModal} onClose={() => setKpiModal(null)} t={t} />}
      </AnimatePresence>
      <AnimatePresence>
        {apptModal && <AppointmentModal key="appt" row={apptModal} onClose={() => setApptModal(null)} t={t} navigate={navigate} />}
      </AnimatePresence>
      <AnimatePresence>
        {sessionModal && <SessionDetailModal key="session" session={sessionModal} onClose={() => setSessionModal(null)} t={t} />}
      </AnimatePresence>

      <div className="space-y-4 sm:space-y-5 pb-12">

        {/* ══ STATUS BAR ══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}
          aria-label="Dashboard Control Bar"
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <div role="status" aria-live="polite" aria-label="System Status: Operational"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-sm"
              style={{ background: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(10,61,48,0.06)', border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : 'rgba(10,61,48,0.12)'}` }}>
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: t.success }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: t.success }} />
              </span>
              <span className="text-[11px] font-bold tracking-wide" style={{ color: t.success }}>Systems Live</span>
            </div>
            <span className="text-xs font-semibold hidden sm:block" style={{ color: t.txtMuted }}>
              {now.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Dashboard Actions">
            <button type="button" onClick={() => navigate('/admin/appointments')} aria-label="Go to Bookings Queue"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: t.accent }} aria-hidden="true" />
              <span>Bookings</span>
            </button>

            <button type="button" onClick={() => navigate('/admin/customers')} aria-label="Go to Customer Records"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
              <Users className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span>Clients</span>
            </button>

            {/* Auto-refresh toggle with countdown */}
            <button type="button" onClick={() => setAutoRefresh(!autoRefresh)}
              aria-pressed={autoRefresh}
              title={autoRefresh ? `Auto-sync ON — refreshes in ${countdown}s` : 'Enable auto-refresh every 30s'}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
              style={{ background: autoRefresh ? t.accentAlpha : t.inner, border: autoRefresh ? `1px solid ${t.accent}` : t.innerBorder, color: autoRefresh ? t.accent : t.txtMuted }}>
              {autoRefresh
                ? <><Pause className="w-3 h-3" aria-hidden="true" /><span className="tabular-nums font-mono text-[10px]">{countdown}s</span></>
                : <><Play className="w-3 h-3" aria-hidden="true" /><span className="hidden sm:inline text-[11px]">Auto</span></>}
            </button>

            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {refreshSuccess ? 'Dashboard data refreshed.' : ''}
            </div>
            {refreshSuccess && (
              <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 shrink-0" aria-hidden="true">
                <Check className="w-3.5 h-3.5" /> Synced
              </motion.span>
            )}

            <button type="button" onClick={() => load(true)} disabled={refreshing} aria-label="Refresh dashboard"
              className="flex items-center gap-2 text-xs font-bold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all hover:opacity-85 active:scale-95 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: t.accent }} aria-hidden="true" />
              <span className="hidden xs:inline">{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </motion.section>

        {/* ══ ROW 1: KPI METRICS GRID ═══════════════════════════════ */}
        <section aria-label="Key Performance Indicators"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <KPI icon={Users}      label="Active Therapists" value={therapistCount || 22}  displayValue={null}
            sub="On duty across operational suites" color={isDark ? '#34d399' : '#0a3d30'}
            trend="+2" trendUp sparkData={SPARK.therapists} delay={0.04} t={t}
            onClick={() => setKpiModal(KPI_MODALS.therapists)} />
          <KPI icon={Activity}   label="Live Treatments"   value={sessions.length}        displayValue={null}
            sub="Active in-home sessions right now" color={t.warning}
            trend="Live" trendUp sparkData={SPARK.sessions} delay={0.08} t={t}
            onClick={() => setKpiModal(KPI_MODALS.sessions)} />
          <KPI icon={Calendar}   label="Total Bookings"    value={totalBookings || 1120}  displayValue={null}
            sub="Confirmed & scheduled treatments" color={t.info}
            trend="+12%" trendUp sparkData={SPARK.bookings} delay={0.12} t={t}
            onClick={() => setKpiModal(KPI_MODALS.bookings)} />
          <KPI icon={DollarSign} label="Gross Revenue"     value={revenue || 90490}
            displayValue={revenue > 0 ? `₱${(revenue).toLocaleString()}` : null}
            sub="Total verified revenue collected" color={t.gold}
            trend="+8.4%" trendUp sparkData={SPARK.revenue} delay={0.16} t={t}
            onClick={() => setKpiModal(KPI_MODALS.revenue)} />
        </section>

        {/* ══ ROW 2: QUICK INSIGHT METRICS STRIP ════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.22,1,0.36,1] }}
          aria-label="Operational Efficiency Insights"
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3"
        >
          {quickInsights.map((ins, i) => (
            <motion.div key={ins.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.05, duration: 0.4 }}
              className="group p-3 sm:p-4 rounded-2xl hover:-translate-y-0.5 transition-all duration-200 cursor-default relative overflow-hidden flex flex-col justify-between"
              style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `0 0 0 1px ${ins.color}30, 0 6px 20px ${ins.color}14` }} />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm"
                  style={{ background: `${ins.color}18`, border: `1px solid ${ins.color}28` }}>
                  <ins.icon className="w-4 h-4" style={{ color: ins.color }} aria-hidden="true" />
                </div>
                <span className="text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg"
                  style={{ color: ins.up ? t.success : t.danger, background: ins.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                  {ins.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] uppercase font-black tracking-wider" style={{ color: t.txtMuted }}>{ins.label}</p>
                <p className="text-xl sm:text-2xl font-black mt-0.5" style={{ color: ins.color }}>{ins.value}</p>
                <p className="text-[10px] mt-0.5 font-medium truncate" style={{ color: t.txtMuted }}>{ins.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* ══ ROW 3: LIVE SESSIONS + AUDIT FEED ════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Live Sessions (2/3 width) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22, ease: [0.22,1,0.36,1] }}
            aria-label="Active Treatment Sessions"
            className="lg:col-span-2"
          >
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                    <Wifi className="w-4 h-4" style={{ color: t.accent }} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black" style={{ color: t.txt }}>Live Salon Treatments</h2>
                    <p className="text-[10px] font-medium" style={{ color: t.txtMuted }}>Tap session to inspect real-time telemetry</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#ef4444' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#ef4444' }} />
                  </span>
                  <span className="text-[9px] font-black tracking-wide" style={{ color: '#ef4444' }}>
                    {sessions.length} ACTIVE
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {sessions.map(s => {
                  const pctColor = s.pct > 60 ? t.accent : s.pct > 30 ? t.warning : t.danger;
                  return (
                    <div key={s.id}
                      tabIndex={0} role="button"
                      aria-label={`${s.service} for ${s.client} by ${s.therapist}. ${s.pct}% complete. Press Enter to inspect.`}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSessionModal(s); } }}
                      onClick={() => setSessionModal(s)}
                      className="group p-3.5 sm:p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer border relative outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      style={{ background: t.inner, borderColor: t.divider }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <Ring pct={s.pct} color={pctColor} size={50} stroke={5} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-black tabular-nums" style={{ color: pctColor }}>{s.pct}%</span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold truncate" style={{ color: t.txt }}>
                              {s.service}
                              <span className="font-normal text-[11px] ml-1.5" style={{ color: t.txtMuted }}>({s.duration})</span>
                            </p>
                            <p className="text-[11px] mt-0.5 truncate" style={{ color: t.txtSub }}>
                              Client: <strong style={{ color: t.txt }}>{s.client}</strong> · Specialist: <strong style={{ color: t.accent }}>{s.therapist}</strong>
                            </p>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                          <Badge status={s.status} />
                          <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: t.txtMuted }}>
                            <Clock className="w-3 h-3" aria-hidden="true" /> {s.start} – {s.end}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Bar pct={s.pct} color={pctColor} t={t} height={5} />
                        <div className="flex items-center justify-between text-[10px] font-medium" style={{ color: t.txtMuted }}>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-500" aria-hidden="true" /> {s.location}
                          </span>
                          <span className="group-hover:text-emerald-500 transition-colors font-semibold">Inspect →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.section>

          {/* Audit Feed (1/3 width) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.26, ease: [0.22,1,0.36,1] }}
            aria-label="Live Audit Stream"
          >
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                    <Activity className="w-4 h-4" style={{ color: t.accent }} aria-hidden="true" />
                  </div>
                  <h2 className="text-sm sm:text-base font-black" style={{ color: t.txt }}>Audit Stream</h2>
                </div>
                <button type="button" onClick={() => navigate('/admin/audit-logs')} aria-label="View all system audit logs"
                  className="flex items-center gap-1 text-[11px] font-bold hover:opacity-75 transition-opacity cursor-pointer p-1 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none rounded"
                  style={{ color: t.accent }}>
                  Logs <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 space-y-1 overflow-hidden" role="feed" aria-label="Recent system events">
                {activityFeed.map((item, i) => (
                  <motion.article key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.05 }}
                    className="group flex items-start gap-2.5 py-2 px-2.5 rounded-xl hover:scale-[1.01] transition-all duration-150 cursor-default"
                    style={{ background: i % 2 === 0 ? t.tableStripe : 'transparent' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-150 group-hover:scale-110 shadow-sm"
                      style={{ background: `${item.color}18`, border: `1px solid ${item.color}24` }}>
                      <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold leading-snug truncate" style={{ color: t.txtSub }}>{item.text}</p>
                      <p className="text-[9px] mt-0.5 font-bold" style={{ color: t.txtMuted }}>{item.time}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </Card>
          </motion.section>
        </div>

        {/* ══ ROW 4: REVENUE & ANALYTICS ═══════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Revenue Telemetry Area Chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.30, ease: [0.22,1,0.36,1] }}
            aria-label="Revenue Analytics"
            className="lg:col-span-2"
          >
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <SectionHeader title="Revenue Telemetry" icon={TrendingUp} t={t} />
                  <div role="tablist" aria-label="Revenue period selection"
                    className="flex items-center rounded-xl p-0.5 border"
                    style={{ background: t.inner, borderColor: t.innerBorder }}>
                    {['7D','14D','30D'].map(p => (
                      <button key={p} role="tab" aria-selected={chartPeriod === p} type="button"
                        onClick={() => setChartPeriod(p)}
                        className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                        style={{ background: chartPeriod === p ? t.accent : 'transparent', color: chartPeriod === p ? '#fff' : t.txtMuted }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: t.txt }}>{currentDataset.total}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgba(16,185,129,0.14)', color: t.success }}>
                      {currentDataset.growth} ↑
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: t.txtMuted }}>Touch or hover data points to inspect</p>
                </div>
                <div className="my-3">
                  <AreaChart data={currentDataset.bars} color={t.chartLine} height={95} />
                  <div className="flex justify-between mt-1 px-1">
                    {currentDataset.bars.map(b => (
                      <span key={b.day} className="text-[8px] font-bold" style={{ color: t.txtMuted }}>{b.day}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3.5 space-y-2.5 border-t" style={{ borderColor: t.divider }}>
                <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: t.txtMuted }}>Revenue by Category</p>
                {categoryBreakdown.map(s => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span style={{ color: t.txtSub }}>{s.label}</span>
                      <span className="font-bold tabular-nums" style={{ color: t.txt }}>{s.value}</span>
                    </div>
                    <Bar pct={s.pct} color={s.color} t={t} height={5} />
                  </div>
                ))}
              </div>
            </Card>
          </motion.section>

          {/* Booking Distribution Donut */}
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34, ease: [0.22,1,0.36,1] }}
            aria-label="Booking Status Distribution"
            className="lg:col-span-1"
          >
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col gap-4">
              <SectionHeader title="Booking Distribution" icon={Calendar} t={t} />

              {/* Donut */}
              <div className="flex items-center justify-center relative" style={{ height: 120 }}>
                <Donut segments={bookingBreakdown} size={120} stroke={16}
                  onHoverSegment={setActiveDonutSeg} activeSegment={activeDonutSeg} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {activeDonutSeg ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                      <span className="text-base font-black tabular-nums" style={{ color: activeDonutSeg.color }}>
                        {activeDonutSeg.count.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtSub }}>
                        {activeDonutSeg.label} ({activeDonutSeg.pct}%)
                      </span>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black tabular-nums" style={{ color: t.txt }}>
                        {(totalBookings || bookingBreakdown.reduce((s, b) => s + b.count, 0)).toLocaleString()}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>Total</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend rows */}
              <div className="space-y-1.5">
                {bookingBreakdown.map(b => {
                  const isActive = activeDonutSeg?.label === b.label;
                  return (
                    <button key={b.label} type="button"
                      onClick={() => setActiveDonutSeg(prev => prev?.label === b.label ? null : b)}
                      onMouseEnter={() => setActiveDonutSeg(b)}
                      onMouseLeave={() => setActiveDonutSeg(null)}
                      aria-pressed={isActive}
                      aria-label={`${b.label}: ${b.count} bookings (${b.pct}%)`}
                      className="w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                      style={{ background: isActive ? `${b.color}14` : t.inner, borderColor: isActive ? b.color : t.innerBorder, transform: isActive ? 'scale(1.01)' : 'scale(1)' }}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color }} />
                        <span className="text-xs font-semibold" style={{ color: isActive ? t.txt : t.txtSub }}>{b.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold" style={{ color: t.txtMuted }}>{b.pct}%</span>
                        <span className="text-xs font-black tabular-nums" style={{ color: t.txt }}>{b.count.toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t" style={{ borderColor: t.divider }}>
                {[
                  { label: 'Avg Ticket',  value: stats.avg_ticket_size ? `₱${stats.avg_ticket_size.toLocaleString()}` : '₱850', color: t.warning },
                  { label: 'Settlement', value: totalBookings > 0 ? `${Math.round(((stats.completed_bookings || 0) / totalBookings) * 100)}%` : '94.2%', color: t.info },
                  { label: 'Clients',    value: clientsCount || 3,   color: t.pink    },
                  { label: 'Total Vol.', value: totalBookings || bookingBreakdown.reduce((s, b) => s + b.count, 0), color: t.success },
                ].map(s => (
                  <div key={s.label} className="p-2 rounded-xl text-center border" style={{ background: t.inner, borderColor: t.innerBorder }}>
                    <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{s.label}</p>
                    <p className="text-xs font-black mt-0.5 tabular-nums" style={{ color: s.color }}>
                      {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.section>
        </div>

        {/* ══ ROW 5: CUSTOMER FUNNEL & THERAPIST STATUS (STAFF LEADERBOARD REMOVED) ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Customer Funnel */}
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.38, ease: [0.22,1,0.36,1] }}
            aria-label="Customer Conversion Funnel"
            className="col-span-1"
          >
            <Card t={t} className="p-4 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <SectionHeader title="Customer Funnel" icon={Target} t={t} />
                <div className="space-y-3.5 mt-2">
                  {funnelSteps.map((f, i) => {
                    const fColor = i === 0 ? t.accent : i < 2 ? t.gold : i < 4 ? t.info : t.success;
                    return (
                      <div key={f.step}>
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="font-medium truncate" style={{ color: t.txtSub }}>{f.step}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-black tabular-nums" style={{ color: t.txt }}>{f.count}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${fColor}18`, color: fColor }}>{f.pct}%</span>
                          </div>
                        </div>
                        <Bar pct={f.pct} color={fColor} t={t} height={6} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 pt-4 space-y-2 border-t" style={{ borderColor: t.divider }}>
                <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Conversion Analytics</p>
                {conversionAnalytics.map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-colors"
                    style={{ background: t.inner }}>
                    <span style={{ color: t.txtSub }}>{r.label}</span>
                    <span className="font-black tabular-nums" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.section>

          {/* Therapist Availability */}
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.42, ease: [0.22,1,0.36,1] }}
            aria-label="Therapist Availability Status"
            className="col-span-1"
          >
            <Card t={t} className="p-4 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <SectionHeader title="Therapist Status" icon={Users} t={t} action={() => navigate('/admin/users')} actionLabel="Manage staff" />
                <div className="space-y-3.5 mt-2">
                  {therapistStatus.map(s => (
                    <div key={s.label} className="p-3.5 rounded-2xl border transition-all duration-200 hover:shadow-sm"
                      style={{ background: t.inner, borderColor: t.innerBorder }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="relative shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full block" style={{ background: s.color }} />
                            {s.label.includes('Duty') && (
                              <span className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-40" style={{ background: s.color }} />
                            )}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: t.txtSub }}>{s.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${s.color}18`, color: s.color }}>
                            {s.pct}%
                          </span>
                          <span className="text-sm font-black tabular-nums" style={{ color: t.txt }}>{s.count}</span>
                        </div>
                      </div>
                      <Bar pct={s.pct} color={s.color} t={t} height={6} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-4 space-y-2 border-t" style={{ borderColor: t.divider }}>
                <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: t.txtMuted }}>Operational KPIs</p>
                {operationalKpis.map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-colors"
                    style={{ background: t.inner }}>
                    <span style={{ color: t.txtSub }}>{r.label}</span>
                    <span className="font-black tabular-nums" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.section>
        </div>

        {/* ══ ROW 6: SCHEDULED BOOKINGS MASTER TABLE ════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.48, ease: [0.22,1,0.36,1] }}
          aria-label="Scheduled Bookings Management"
        >
          <Card t={t} className="overflow-hidden">
            {/* Toolbar Header */}
            <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b"
              style={{ borderColor: t.divider }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                  <Calendar className="w-4 h-4" style={{ color: t.accent }} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-black" style={{ color: t.txt }}>Scheduled Bookings</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.accentAlpha, color: t.accent }}>
                      {filteredAppointments.length} Found
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: t.txtMuted }}>Reservations requiring active management</p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {/* Search input */}
                <div className="relative flex-1 sm:flex-initial min-w-[170px] sm:min-w-[210px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.txtMuted }} aria-hidden="true" />
                  <input
                    type="search"
                    value={apptSearch}
                    onChange={e => setApptSearch(e.target.value)}
                    placeholder="Search client, service, therapist..."
                    aria-label="Filter appointments by client, service, or therapist"
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs font-medium border outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    style={{ background: t.inner, borderColor: t.innerBorder, color: t.txt }}
                  />
                  {apptSearch && (
                    <button type="button" onClick={() => setApptSearch('')} aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-75 cursor-pointer">
                      <X className="w-3 h-3" style={{ color: t.txtMuted }} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Status filter tabs */}
                <div role="tablist" aria-label="Filter by booking status"
                  className="flex items-center rounded-xl p-0.5 border overflow-x-auto max-w-full"
                  style={{ background: t.inner, borderColor: t.innerBorder, scrollbarWidth: 'none' }}>
                  {['All', 'In Progress', 'Confirmed', 'Pending', 'Completed'].map(status => (
                    <button key={status} role="tab" aria-selected={apptFilter === status} type="button"
                      onClick={() => setApptFilter(status)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                      style={{ background: apptFilter === status ? t.accent : 'transparent', color: apptFilter === status ? '#fff' : t.txtMuted }}>
                      {status}
                    </button>
                  ))}
                </div>

                {/* View mode switcher */}
                <div role="group" aria-label="Select view mode"
                  className="flex items-center rounded-xl p-0.5 border"
                  style={{ background: t.inner, borderColor: t.innerBorder }}>
                  <button type="button" onClick={() => setViewMode('table')} aria-label="Compact table view" aria-pressed={viewMode === 'table'}
                    className="p-1.5 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                    style={{ background: viewMode === 'table' ? t.accent : 'transparent', color: viewMode === 'table' ? '#fff' : t.txtMuted }}>
                    <TableIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setViewMode('cards')} aria-label="Visual cards view" aria-pressed={viewMode === 'cards'}
                    className="p-1.5 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                    style={{ background: viewMode === 'cards' ? t.accent : 'transparent', color: viewMode === 'cards' ? '#fff' : t.txtMuted }}>
                    <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {filteredAppointments.length === 0 ? (
              <div className="py-16 text-center px-4">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-25" style={{ color: t.txtMuted }} aria-hidden="true" />
                <p className="text-sm font-black" style={{ color: t.txt }}>No appointments match your filters</p>
                <p className="text-xs mt-1" style={{ color: t.txtMuted }}>Adjust your search terms or clear the status filter</p>
                <button type="button" onClick={() => { setApptFilter('All'); setApptSearch(''); }}
                  className="mt-4 px-4 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                  style={{ background: t.inner, border: t.innerBorder, color: t.accent }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* Cards View */}
                {viewMode === 'cards' ? (
                  <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paginatedAppointments.map(row => (
                      <div key={row.id}
                        tabIndex={0} role="button"
                        aria-label={`Appointment for ${row.client}: ${row.service}. Status: ${row.status}. Press Enter to view details.`}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setApptModal(row); } }}
                        onClick={() => setApptModal(row)}
                        className="p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-all hover:-translate-y-0.5 hover:shadow-md border flex flex-col justify-between outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        style={{ background: t.inner, borderColor: t.innerBorder }}>
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                                style={{ background: 'linear-gradient(135deg,#062c22,#0f5f4a)' }}>
                                {row.client?.charAt(0) ?? '?'}
                              </div>
                              <span className="text-xs font-bold truncate" style={{ color: t.txt }}>{row.client}</span>
                            </div>
                            <Badge status={row.status} />
                          </div>
                          <p className="text-xs font-semibold truncate mb-1" style={{ color: t.txtSub }}>{row.service}</p>
                          <p className="text-[11px] truncate mb-2" style={{ color: t.accent }}>Specialist: {row.therapist}</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-2 border-t mt-2" style={{ borderColor: t.divider, color: t.txtMuted }}>
                          <span className="flex items-center gap-1 font-medium"><Clock className="w-3 h-3" aria-hidden="true" /> {row.time}</span>
                          <span className="flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-emerald-500" aria-hidden="true" /> {row.loc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left" role="grid" aria-label="Scheduled Appointments">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${t.divider}`, background: t.inner }}>
                          {['Client', 'Service', 'Therapist', 'Schedule', 'Location', 'Status', 'Action'].map(h => (
                            <th key={h} scope="col"
                              className="px-4 sm:px-5 py-3.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                              style={{ color: t.txtMuted }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAppointments.map((row, i) => {
                          const s = STATUS_MAP[row.status] || {};
                          return (
                            <tr key={row.id ?? i}
                              tabIndex={0} role="row"
                              aria-label={`Appointment for ${row.client}: ${row.service} — ${row.status}`}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setApptModal(row); } }}
                              className="cursor-pointer transition-colors outline-none focus-visible:bg-emerald-500/5"
                              style={{ borderBottom: `1px solid ${t.divider}`, background: i % 2 === 1 ? t.tableStripe : 'transparent', borderLeft: `3px solid ${s.dot || 'transparent'}` }}
                              onMouseEnter={e => { e.currentTarget.style.background = t.hover; }}
                              onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 1 ? t.tableStripe : 'transparent'; }}
                              onClick={() => setApptModal(row)}>
                              <td className="px-4 sm:px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#062c22,#0f5f4a)' }}>
                                    {row.client?.charAt(0) ?? '?'}
                                  </div>
                                  <span className="text-xs font-bold whitespace-nowrap" style={{ color: t.txt }}>{row.client}</span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: t.txtSub }}>{row.service}</td>
                              <td className="px-4 sm:px-5 py-3.5 text-xs font-semibold whitespace-nowrap" style={{ color: t.accent }}>{row.therapist}</td>
                              <td className="px-4 sm:px-5 py-3.5 text-xs whitespace-nowrap font-medium" style={{ color: t.txtMuted }}>{row.time}</td>
                              <td className="px-4 sm:px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: t.txtMuted }}>{row.loc}</td>
                              <td className="px-4 sm:px-5 py-3.5"><Badge status={row.status} /></td>
                              <td className="px-4 sm:px-5 py-3.5">
                                <button type="button"
                                  onClick={e => { e.stopPropagation(); setApptModal(row); }}
                                  aria-label={`View appointment details for ${row.client}`}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-75 transition-opacity cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                                  style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="p-3 sm:p-4 border-t flex items-center justify-between flex-wrap gap-2"
                  style={{ borderColor: t.divider }}>
                  <div aria-live="polite" aria-atomic="true">
                    <span className="text-[11px] font-semibold" style={{ color: t.txtMuted }}>
                      Showing <strong style={{ color: t.txt }}>{Math.min(filteredAppointments.length, (page - 1) * pageSize + 1)}</strong>–
                      <strong style={{ color: t.txt }}>{Math.min(filteredAppointments.length, page * pageSize)}</strong> of{' '}
                      <strong style={{ color: t.txt }}>{filteredAppointments.length}</strong> bookings
                    </span>
                  </div>
                  <nav aria-label="Pagination" className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="Previous page"
                      className="p-1.5 rounded-xl border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                      style={{ background: t.inner, borderColor: t.innerBorder, color: t.txt }}>
                      <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <span className="text-xs font-bold px-2 tabular-nums" style={{ color: t.txt }}>
                      {page} / {totalPages}
                    </span>
                    <button type="button"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      aria-label="Next page"
                      className="p-1.5 rounded-xl border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                      style={{ background: t.inner, borderColor: t.innerBorder, color: t.txt }}>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </>
            )}
          </Card>
        </motion.section>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
