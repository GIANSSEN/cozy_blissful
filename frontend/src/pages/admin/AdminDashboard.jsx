import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
  Search, Phone, Check, ShieldCheck, Sparkles,
  ExternalLink, Layers, LayoutGrid, Table as TableIcon
} from 'lucide-react';

/* ─── animation presets ──────────────────────────────────────────── */
const fadeUp = (delay = 0, dur = 0.45) => ({
  initial:    { opacity: 0, y: 20 },
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
    txtMuted:     '#7e93a8',
    txtSub:       '#9cb2c8',
    bar:          'rgba(255,255,255,0.07)',
    accent:       '#34d399',
    accentBright: '#6ee7b7',
    accentAlpha:  'rgba(52,211,153,0.1)',
    gold:         '#d4b87a',
    goldAlpha:    'rgba(212,184,122,0.1)',
    progressBg:   'rgba(255,255,255,0.07)',
    tag:          'rgba(255,255,255,0.07)',
    tagTxt:       '#9cb2c8',
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
  'In Progress':             { color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  'Starting':                { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
  'Confirmed':               { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', dot: '#6366f1' },
  'Pending':                 { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
  'Completed by Therapist':  { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', dot: '#06b6d4' },
  'Completed':               { color: '#34d399', bg: 'rgba(52,211,153,0.12)', dot: '#34d399' },
  'Cancelled':               { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  dot: '#ef4444' },
};

/* ─── Badge ───────────────────────────────────────────────────────── */
const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { color: '#8e97a4', bg: 'rgba(142,151,164,0.1)', dot: '#8e97a4' };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-sm select-none"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: s.dot }} />
      {status}
    </span>
  );
};

/* ─── Sparkline SVG ───────────────────────────────────────────────── */
const Sparkline = ({ data, color, width = 80, height = 30 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = pts.join(' ');
  const areaPath = `M ${pts[0]} ${pts.join(' L ')} L ${width},${height} L 0,${height} Z`;
  const gradId = `sg-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible block">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="2.5" fill={color} />
    </svg>
  );
};

/* ─── Circular Progress Ring ──────────────────────────────────────── */
const Ring = ({ pct, color, size = 54, stroke = 5 }) => {
  const r  = (size - stroke * 2) / 2;
  const c  = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-slate-500/10 dark:text-white/10" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - dash }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
      />
    </svg>
  );
};

/* ─── Interactive Donut Chart ─────────────────────────────────────── */
const Donut = ({ segments, size = 130, stroke = 18, onHoverSegment, activeSegment }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const gap = 0.018;

  const handleSelect = (seg, idx) => {
    if (hoveredIdx === idx) {
      setHoveredIdx(null);
      if (onHoverSegment) onHoverSegment(null);
    } else {
      setHoveredIdx(idx);
      if (onHoverSegment) onHoverSegment(seg);
    }
  };

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-slate-500/10 dark:text-white/5" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const isHovered = hoveredIdx === i || (activeSegment && activeSegment.label === seg.label);
        const dashLen = Math.max(0, ((seg.pct / 100) * (1 - gap * segments.length)) * c);
        const current = offset;
        offset += (seg.pct / 100) * c;
        return (
          <motion.circle
            key={seg.label || i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={seg.color}
            strokeWidth={isHovered ? stroke + 4 : stroke}
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${c - dashLen}`}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - dashLen }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
            style={{
              transform: `rotate(${(current / c) * 360}deg)`,
              transformOrigin: '50% 50%',
              cursor: 'pointer',
              filter: isHovered ? `drop-shadow(0 0 8px ${seg.color})` : 'none',
              transition: 'stroke-width 0.2s, filter 0.2s',
            }}
            onMouseEnter={() => {
              setHoveredIdx(i);
              if (onHoverSegment) onHoverSegment(seg);
            }}
            onMouseLeave={() => {
              setHoveredIdx(null);
              if (onHoverSegment) onHoverSegment(null);
            }}
            onClick={() => handleSelect(seg, i)}
          />
        );
      })}
    </svg>
  );
};

/* ─── Area Chart (Revenue) with Touch & Mouse Interactive Tooltip ── */
const AreaChart = ({ data, color, height = 110, onHoverPoint }) => {
  const containerRef = useRef(null);
  const [w, setW] = useState(300);
  const [activeIdx, setActiveIdx] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setW(containerRef.current.clientWidth || 300);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        if (e.contentRect.width > 0) setW(e.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const max = Math.max(...data.map(d => d.val)) * 1.05 || 1;
  const min = 0;
  const range = max - min || 1;
  const padX = 14;
  const padY = 12;

  const pts = useMemo(() => {
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * (w - padX * 2) + padX;
      const y = height - ((d.val - min) / range) * (height - padY * 2) - padY;
      return { x, y, ...d };
    });
  }, [data, w, height, max, min, range]);

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)},${height} L ${pts[0].x.toFixed(1)},${height} Z`;
  const gradId = `area-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  /* Touch Scrubbing handler for responsive touch devices */
  const handleTouch = (e) => {
    if (!containerRef.current || !e.touches || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    let closestIdx = 0;
    let minDiff = Infinity;
    pts.forEach((p, idx) => {
      const diff = Math.abs(p.x - touchX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setActiveIdx(closestIdx);
    if (onHoverPoint) onHoverPoint(pts[closestIdx]);
  };

  const handleTouchEnd = () => {
    setActiveIdx(null);
    if (onHoverPoint) onHoverPoint(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none touch-pan-x"
      style={{ height }}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouchEnd}
    >
      <svg width={w} height={height} className="overflow-visible block">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line
            key={i}
            x1={padX}
            y1={height * f}
            x2={w - padX}
            y2={height * f}
            stroke="currentColor"
            className="text-slate-500/10 dark:text-white/5"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        ))}

        {/* Area */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Path line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />

        {/* Interactive points */}
        {pts.map((p, i) => {
          const isHovered = activeIdx === i;
          return (
            <g
              key={p.day || i}
              className="cursor-pointer"
              onMouseEnter={() => {
                setActiveIdx(i);
                if (onHoverPoint) onHoverPoint(p);
              }}
              onMouseLeave={() => {
                setActiveIdx(null);
                if (onHoverPoint) onHoverPoint(null);
              }}
            >
              {isHovered && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  fill={color}
                  fillOpacity="0.25"
                  className="animate-ping"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5.5 : 3.5}
                fill={isHovered ? '#fff' : color}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {activeIdx !== null && pts[activeIdx] && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-xl shadow-xl text-[11px] font-bold border transition-all duration-150 backdrop-blur-md"
          style={{
            left: Math.max(50, Math.min(w - 50, pts[activeIdx].x)),
            top: Math.max(4, pts[activeIdx].y - 8),
            background: 'rgba(10, 25, 20, 0.94)',
            color: '#fdfcfa',
            borderColor: 'rgba(191,161,95,0.4)',
          }}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-amber-300 font-semibold">{pts[activeIdx].day}:</span>
            <span className="font-extrabold text-emerald-400">₱{pts[activeIdx].val.toLocaleString()}</span>
          </div>
        </div>
      )}
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
    className={`rounded-2xl sm:rounded-3xl overflow-hidden ${hoverable ? 'cursor-pointer transition-all duration-200 active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl' : ''} ${className}`}
    style={{ background: t.card, boxShadow: t.cardShadow, border: t.cardBorder, ...style }}
    onClick={onClick}
  >
    {children}
  </div>
);

/* ─── KPI Card with Sparkline ─────────────────────────────────────── */
const KPI = ({ icon: Icon, label, value, sub, color, trend, trendUp, delay, t, onClick, sparkData }) => (
  <motion.div
    {...fadeUp(delay)}
    tabIndex={0}
    role="button"
    aria-label={`${label}: ${value}. Click for detailed telemetry breakdown.`}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    className="cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-[#0a3d30] dark:focus-visible:ring-[#34d399] rounded-2xl sm:rounded-3xl"
    onClick={onClick}
  >
    <div
      className="rounded-2xl sm:rounded-3xl overflow-hidden relative p-3.5 sm:p-5 flex flex-col justify-between h-full min-h-[155px] sm:min-h-[165px] transition-all duration-200 hover:-translate-y-1 active:scale-[0.98]"
      style={{
        background: t.card,
        boxShadow: t.cardShadow,
        border: t.cardBorder,
      }}
    >
      {/* Hover glow layer */}
      <div
        className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 0 1.5px ${color}40, 0 8px 32px ${color}18` }}
      />

      {/* Background glow blob */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none transition-all duration-300 group-hover:opacity-15"
        style={{
          background: color,
          opacity: 0.05,
          filter: 'blur(32px)',
          transform: 'translate(40%,-40%)',
        }}
      />

      {/* Top row: icon + trend badge */}
      <div className="flex items-start justify-between relative z-10 gap-2">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-sm"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-black px-2 py-1 rounded-lg shrink-0 whitespace-nowrap shadow-sm"
            style={{
              background: trendUp ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)',
              color: trendUp ? '#10b981' : '#ef4444',
            }}
          >
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="relative z-10 my-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: t.txtMuted }}>{label}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 leading-tight tabular-nums transition-colors duration-200" style={{ color: t.txt }}>
          <Counter value={value} />
        </p>
        {sub && <p className="text-[11px] mt-1 font-medium truncate" style={{ color: t.txtSub }}>{sub}</p>}
      </div>

      {/* Sparkline & Hint */}
      <div className="relative z-10 flex items-end justify-between pt-1 mt-auto">
        {sparkData ? (
          <Sparkline data={sparkData} color={color} width={84} height={26} />
        ) : <div />}
        <span className="text-[9px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-80 transition-opacity duration-200 text-slate-400">
          <Eye className="w-3 h-3" /> Details
        </span>
      </div>
    </div>
  </motion.div>
);

/* ─── Section Header ──────────────────────────────────────────────── */
const SectionHeader = ({ title, action, actionLabel = 'View all', t, icon: Icon }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2 min-w-0">
      {Icon && (
        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
          <Icon className="w-4 h-4" style={{ color: t.accent }} />
        </div>
      )}
      <h3 className="text-sm sm:text-base font-black tracking-tight truncate" style={{ color: t.txt }}>{title}</h3>
    </div>
    {action && (
      <button
        onClick={action}
        className="flex items-center gap-1 text-[11px] font-bold hover:opacity-75 transition-opacity cursor-pointer p-1 shrink-0"
        style={{ color: t.accent }}
      >
        {actionLabel} <ChevronRight className="w-3.5 h-3.5" />
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
      animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    />
  </div>
);

/* ─── Modal Wrapper ───────────────────────────────────────────────── */
const ModalWrap = ({ children, onClose, maxWidthStyle = { maxWidth: 540 }, titleId = 'modal-title' }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{ background: 'rgba(6,16,24,0.78)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{ scale: 0.95,    opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        style={{ ...maxWidthStyle }}
        className="w-full max-h-[90vh] flex flex-col min-h-0 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/* ─── KPI Detail Modal ────────────────────────────────────────────── */
const KPIModal = ({ modal, onClose, t }) => {
  if (!modal) return null;
  return (
    <ModalWrap onClose={onClose} titleId="kpi-modal-title">
      <div style={{ background: t.card, borderColor: t.cardBorder }} className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0" style={{ borderColor: t.divider }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${modal.color}18`, border: `1px solid ${modal.color}30` }}>
              <modal.icon className="w-5 h-5" style={{ color: modal.color }} />
            </div>
            <div>
              <h3 id="kpi-modal-title" className="font-extrabold text-sm sm:text-base" style={{ color: t.txt }}>{modal.title}</h3>
              <p className="text-[11px] font-medium" style={{ color: t.txtMuted }}>{modal.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Main Stat Highlight */}
          <div className="p-4 rounded-2xl text-center" style={{ background: t.inner, border: t.innerBorder }}>
            <div className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: modal.color }}>
              <Counter value={modal.value} />
            </div>
            <p className="text-xs mt-1.5 font-medium leading-relaxed max-w-sm mx-auto" style={{ color: t.txtSub }}>
              {modal.description}
            </p>
          </div>

          {/* Breakdown Section */}
          <div className="space-y-3 pt-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Detailed Distribution</p>
            {modal.breakdown.map(b => (
              <div key={b.label} className="p-3 rounded-xl space-y-1.5" style={{ background: t.inner, border: t.innerBorder }}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span style={{ color: t.txtSub }}>{b.label}</span>
                  <span className="font-bold tabular-nums" style={{ color: t.txt }}>{b.value}</span>
                </div>
                <Bar pct={b.pct} color={modal.color} t={t} height={6} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t shrink-0 flex justify-end" style={{ borderColor: t.divider }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm hover:opacity-85"
            style={{ background: t.accent, color: '#ffffff' }}
          >
            Done
          </button>
        </div>
      </div>
    </ModalWrap>
  );
};

/* ─── Appointment Detail & Quick Action Modal ─────────────────────── */
const AppointmentModal = ({ row, onClose, t, navigate }) => {
  if (!row) return null;

  const handleNavigateToBookings = () => {
    onClose();
    if (navigate) {
      if (row.status === 'Pending') {
        navigate(`/admin/appointments?tab=pending&id=${row.id || ''}`);
      } else {
        navigate(`/admin/appointments?tab=confirmed&id=${row.id || ''}`);
      }
    }
  };

  return (
    <ModalWrap onClose={onClose} titleId="appt-modal-title">
      <div style={{ background: t.card, borderColor: t.cardBorder }} className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0" style={{ borderColor: t.divider }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
              <Calendar className="w-4 h-4" style={{ color: t.accent }} />
            </div>
            <div>
              <h3 id="appt-modal-title" className="font-extrabold text-sm sm:text-base" style={{ color: t.txt }}>Appointment Details</h3>
              <p className="text-[10px] font-medium" style={{ color: t.txtMuted }}>{row.id ? `Booking Reference #${row.id}` : 'Verified Reservation'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Client card */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg,#062c22,#0f5f4a)' }}
            >
              {row.client.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm truncate" style={{ color: t.txt }}>{row.client}</p>
              <p className="text-xs truncate font-medium mt-0.5" style={{ color: t.txtSub }}>{row.service}</p>
            </div>
            <div className="flex-shrink-0"><Badge status={row.status} /></div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: 'Therapist', value: row.therapist, icon: UserCheck },
              { label: 'Schedule',  value: row.time,      icon: Clock     },
              { label: 'Location',  value: row.loc,       icon: MapPin    },
              { label: 'Settlement',value: row.payment_status ? `${row.payment_status.toUpperCase()}` : 'Settled on Site', icon: ShieldCheck },
            ].map(item => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: t.inner, border: t.innerBorder }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                  <item.icon className="w-4 h-4" style={{ color: t.accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{item.label}</p>
                  <p className="text-xs font-bold truncate mt-0.5" style={{ color: t.txt }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Special instructions / notes */}
          <div className="p-3.5 rounded-xl space-y-1" style={{ background: t.inner, border: t.innerBorder }}>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>Service Specifications & Notes</p>
            <p className="text-xs font-medium leading-relaxed" style={{ color: t.txtSub }}>
              {row.notes || 'In-home spa appointment. Organic soothing aromatics requested. Please arrive 10 minutes before treatment start.'}
            </p>
          </div>
        </div>

        {/* Footer with Quick Action Buttons */}
        <div className="p-4 sm:p-5 border-t shrink-0 flex items-center justify-between gap-2 flex-wrap" style={{ borderColor: t.divider }}>
          <button
            onClick={handleNavigateToBookings}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            style={{ background: t.inner, border: t.innerBorder, color: t.accent }}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Manage in Bookings
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm hover:opacity-85"
            style={{ background: t.accent, color: '#ffffff' }}
          >
            Done
          </button>
        </div>
      </div>
    </ModalWrap>
  );
};

/* ─── Active Session Detail Modal ─────────────────────────────────── */
const SessionDetailModal = ({ session, onClose, t }) => {
  if (!session) return null;
  const pctColor = session.pct > 60 ? t.accent : session.pct > 30 ? t.warning : t.danger;

  return (
    <ModalWrap onClose={onClose} titleId="session-modal-title">
      <div style={{ background: t.card, borderColor: t.cardBorder }} className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0" style={{ borderColor: t.divider }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <Wifi className="w-4 h-4 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 id="session-modal-title" className="font-extrabold text-sm sm:text-base" style={{ color: t.txt }}>Live Session Tracking</h3>
              <p className="text-[10px] font-medium" style={{ color: t.txtMuted }}>Real-time telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Progress ring card */}
          <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: t.inner, border: t.innerBorder }}>
            <div className="relative flex-shrink-0">
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
              <p className="text-xs font-semibold mt-0.5" style={{ color: t.accent }}>Therapist: {session.therapist}</p>
              <p className="text-[11px] mt-1" style={{ color: t.txtMuted }}>Client: {session.client} · {session.duration}</p>
            </div>
          </div>

          {/* Timeline details */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
              <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>Started</p>
              <p className="text-xs font-black mt-0.5" style={{ color: t.txt }}>{session.start}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
              <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>Estimated End</p>
              <p className="text-xs font-black mt-0.5" style={{ color: t.txt }}>{session.end}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: t.inner, border: t.innerBorder }}>
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>Destination</p>
              <p className="text-xs font-bold truncate mt-0.5" style={{ color: t.txt }}>{session.location}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t shrink-0 flex items-center justify-between gap-2" style={{ borderColor: t.divider }}>
          <button
            onClick={() => alert(`Initiating direct coordinator call to ${session.therapist}...`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
          >
            <Phone className="w-3.5 h-3.5" /> Call Therapist
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm hover:opacity-85"
            style={{ background: t.accent, color: '#ffffff' }}
          >
            Done
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
  const navigate  = useNavigate();

  const [data,           setData]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [kpiModal,       setKpiModal]       = useState(null);
  const [apptModal,      setApptModal]      = useState(null);
  const [sessionModal,   setSessionModal]   = useState(null);
  const [refreshing,     setRefreshing]     = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [viewMode,       setViewMode]       = useState('table'); // 'cards' | 'table'
  const [now,            setNow]            = useState(new Date());

  /* Chart interactive period & state */
  const [chartPeriod, setChartPeriod] = useState('7D');
  /* Donut interactive active segment */
  const [activeDonutSeg, setActiveDonutSeg] = useState(null);

  /* Staff Leaderboard sorting */
  const [staffSort, setStaffSort] = useState('rating'); // 'rating' | 'sessions' | 'revenue'

  /* Appointments table filter, search, and pagination */
  const [apptFilter, setApptFilter] = useState('All');
  const [apptSearch, setApptSearch] = useState('');
  const [page,       setPage]       = useState(1);
  const pageSize = 6;

  /* Live clock tick */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* Escape key listener */
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        setKpiModal(null);
        setApptModal(null);
        setSessionModal(null);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const r = await API.get('/admin/dashboard');
      setData(r.data);
      if (silent) {
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Reset pagination when search or status filter changes */
  useEffect(() => {
    setPage(1);
  }, [apptFilter, apptSearch]);

  const recentRows = useMemo(() => {
    return data?.recent_appointments?.length
      ? data.recent_appointments.map(a => ({
          id:        a.id,
          client:    a.client_name    || 'Client',
          service:   a.service        || 'Service',
          therapist: a.therapist_name || 'Unassigned',
          time:      a.datetime
            ? new Date(a.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : '—',
          loc:            'Manila',
          status:         a.status || 'Pending',
          payment_status: a.payment_status || 'unpaid',
          amount_paid:    a.amount_paid,
        }))
      : [
          { id: 1, client: 'Sarah Martinez', service: 'Swedish Massage',    therapist: 'Maria Santos', time: '9:00 PM',  loc: 'Makati',       status: 'In Progress', payment_status: 'paid' },
          { id: 2, client: 'David Lim',      service: 'Swedish & Hilot',    therapist: 'John Doe',     time: '9:15 PM',  loc: 'QC',           status: 'In Progress', payment_status: 'paid' },
          { id: 3, client: 'Patricia Go',    service: 'Mani & Pedi',        therapist: 'Anna Reyes',   time: '9:30 PM',  loc: 'BGC',          status: 'Starting',    payment_status: 'paid' },
          { id: 4, client: 'Carlos Reyes',   service: 'Deep Tissue',        therapist: 'Maria Santos', time: '11:00 PM', loc: 'Pasig',        status: 'Confirmed',   payment_status: 'paid' },
          { id: 5, client: 'Alicia Santos',  service: 'Post Natal Massage', therapist: 'TBD',          time: '10:00 AM', loc: 'Mandaluyong',  status: 'Pending',     payment_status: 'unpaid' },
          { id: 6, client: 'Elena Gomez',    service: 'Aromatherapy',       therapist: 'Ben Torres',   time: '2:30 PM',  loc: 'San Juan',     status: 'Completed',   payment_status: 'paid' },
        ];
  }, [data]);

  /* Filtered recent appointments */
  const filteredAppointments = useMemo(() => {
    return recentRows.filter(row => {
      const matchFilter = apptFilter === 'All' ? true : row.status.toLowerCase() === apptFilter.toLowerCase();
      const matchSearch = apptSearch.trim() === ''
        ? true
        : row.client.toLowerCase().includes(apptSearch.toLowerCase()) ||
          row.service.toLowerCase().includes(apptSearch.toLowerCase()) ||
          row.therapist.toLowerCase().includes(apptSearch.toLowerCase()) ||
          row.loc.toLowerCase().includes(apptSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [recentRows, apptFilter, apptSearch]);

  /* Paginated Appointments */
  const paginatedAppointments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, page, pageSize]);

  const totalPages = Math.ceil(filteredAppointments.length / pageSize) || 1;

  /* ─── Skeleton Loader ─────────────────────────────────────────── */
  if (loading) {
    const shimBase = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
    const shimHigh = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.13)';
    const shimCard = isDark ? '#131b2a' : 'rgba(255,255,255,0.98)';
    const shimBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';
    const shimInner = isDark ? '#0f1623' : '#f8f9fb';
    const shimInnerBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)';

    const pulse = {
      animation: 'skeletonPulse 1.6s ease-in-out infinite',
      background: `linear-gradient(90deg, ${shimBase} 25%, ${shimHigh} 50%, ${shimBase} 75%)`,
      backgroundSize: '400% 100%',
    };

    const Bone = ({ w = '100%', h = 12, radius = 8, style = {}, className = '' }) => (
      <div className={className} style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...pulse, ...style }} />
    );

    const SkCard = ({ children, style = {}, className = '' }) => (
      <div
        className={`rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-5 ${className}`}
        style={{ background: shimCard, border: shimBorder, ...style }}
      >
        {children}
      </div>
    );

    return (
      <AdminLayout title="Dashboard" subtitle="Full operational overview" icon={LayoutDashboard}>
        <style>{`
          @keyframes skeletonPulse {
            0%   { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `}</style>

        <div className="space-y-5 pb-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Bone w={120} h={32} radius={12} />
              <Bone w={180} h={16} radius={6} className="hidden sm:block" />
            </div>
            <Bone w={100} h={36} radius={12} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {[0, 1, 2, 3].map(i => (
              <SkCard key={i}>
                <div className="flex justify-between items-center mb-3">
                  <Bone w={40} h={40} radius={12} />
                  <Bone w={54} h={22} radius={8} />
                </div>
                <Bone w="50%" h={10} radius={6} className="mb-2" />
                <Bone w="70%" h={28} radius={8} className="mb-2" />
                <Bone w="40%" h={10} radius={5} className="mb-3" />
                <Bone w="100%" h={26} radius={6} />
              </SkCard>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[0, 1, 2, 3].map(i => (
              <SkCard key={i} className="p-3.5">
                <div className="flex justify-between items-center mb-2">
                  <Bone w={32} h={32} radius={10} />
                  <Bone w={24} h={16} radius={6} />
                </div>
                <Bone w="45%" h={8} radius={4} className="mb-1.5" />
                <Bone w="65%" h={22} radius={6} className="mb-1" />
                <Bone w="75%" h={8} radius={4} />
              </SkCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <SkCard className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <Bone w={140} h={18} radius={6} />
                <Bone w={60} h={22} radius={8} />
              </div>
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="p-4 rounded-2xl flex gap-3 items-start" style={{ background: shimInner, border: shimInnerBorder }}>
                    <Bone w={52} h={52} radius={26} />
                    <div className="flex-1 space-y-2">
                      <Bone w="55%" h={12} radius={6} />
                      <Bone w="35%" h={10} radius={5} />
                      <Bone w="100%" h={6} radius={4} />
                    </div>
                  </div>
                ))}
              </div>
            </SkCard>

            <SkCard>
              <div className="flex justify-between items-center mb-4">
                <Bone w={110} h={18} radius={6} />
                <Bone w={50} h={18} radius={6} />
              </div>
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-2.5 items-center py-1">
                    <Bone w={28} h={28} radius={8} />
                    <div className="flex-1 space-y-1">
                      <Bone w="80%" h={10} radius={4} />
                      <Bone w="30%" h={8} radius={4} />
                    </div>
                  </div>
                ))}
              </div>
            </SkCard>
          </div>
        </div>
      </AdminLayout>
    );
  }

  /* ── Data Resolution ── */
  const stats          = data?.stats || {};
  const therapistCount = stats.active_therapists || 0;
  const totalBookings  = stats.total_bookings    || 0;
  const clients        = stats.registered_clients|| 0;
  const revenue        = stats.total_revenue     || 0;

  /* Sparkline Data */
  const SPARK = {
    therapists: [18, 20, 17, 22, 21, 20, 22],
    sessions:   [2,  3,  4,  3,  5,  4,  4],
    bookings:   [80, 95, 88, 102,110,98, 112],
    revenue:    [6200,7400,8100,7600,9200,8400,9800],
  };

  /* Active Live Sessions (Merged from real data or realistic fallback) */
  const activeApptsFromData = (data?.recent_appointments || [])
    .filter(a => a.status === 'In Progress' || a.status === 'Starting')
    .map((a, idx) => ({
      id: a.id || idx + 10,
      client: a.client_name || 'Client',
      therapist: a.therapist_name || 'Assigned Specialist',
      service: a.service || 'Spa Ritual',
      duration: '60 min',
      start: '9:00 PM',
      end: '10:00 PM',
      pct: a.status === 'In Progress' ? 65 : 20,
      location: 'Metro Manila',
      status: a.status,
    }));

  const sessions = activeApptsFromData.length > 0 ? activeApptsFromData : [
    { id: 1, client: 'Sarah Martinez', therapist: 'Maria Santos', service: 'Swedish Massage', duration: '60 min', start: '9:00 PM',  end: '10:00 PM', pct: 75, location: 'Makati City',  status: 'In Progress' },
    { id: 2, client: 'David Lim',      therapist: 'John Doe',     service: 'Swedish & Hilot', duration: '90 min', start: '9:15 PM',  end: '10:45 PM', pct: 50, location: 'Quezon City', status: 'In Progress' },
    { id: 3, client: 'Patricia Go',    therapist: 'Anna Reyes',   service: 'Mani & Pedi',     duration: '60 min', start: '9:30 PM',  end: '10:30 PM', pct: 20, location: 'BGC, Taguig',  status: 'Starting'    },
  ];

  /* Chart bars with interactive period data */
  const chartDatasets = {
    '7D': {
      bars: [
        { day: 'Mon', val: 7490  },
        { day: 'Tue', val: 8500  },
        { day: 'Wed', val: 12450 },
        { day: 'Thu', val: 9200  },
        { day: 'Fri', val: 15600 },
        { day: 'Sat', val: 14200 },
        { day: 'Sun', val: 16800 },
      ],
      total: '₱84,240',
      growth: '+14.2%',
    },
    '14D': {
      bars: [
        { day: 'W1-M', val: 6800 },
        { day: 'W1-W', val: 11200 },
        { day: 'W1-F', val: 14500 },
        { day: 'W1-S', val: 15100 },
        { day: 'W2-M', val: 7490 },
        { day: 'W2-W', val: 12450 },
        { day: 'W2-F', val: 15600 },
        { day: 'W2-S', val: 16800 },
      ],
      total: '₱99,940',
      growth: '+18.5%',
    },
    '30D': {
      bars: [
        { day: 'Week 1', val: 48500 },
        { day: 'Week 2', val: 56200 },
        { day: 'Week 3', val: 61400 },
        { day: 'Week 4', val: 72800 },
      ],
      total: '₱238,900',
      growth: '+22.1%',
    },
  };

  const currentDataset = chartDatasets[chartPeriod] || chartDatasets['7D'];

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
    { icon: CheckCircle2, color: '#10b981', text: 'Sarah Martinez session completed',         time: '2m ago'  },
    { icon: Calendar,     color: '#6366f1', text: 'Carlos Reyes booked Deep Tissue — 11 PM', time: '8m ago'  },
    { icon: AlertCircle,  color: '#f59e0b', text: 'Alicia Santos session starting in 5 min', time: '12m ago' },
    { icon: DollarSign,   color: '#d4b87a', text: '₱850 payment received from David Lim',   time: '25m ago' },
    { icon: Users,        color: '#ec4899', text: 'New client registered: Maria Cruz',        time: '1h ago'  },
    { icon: Star,         color: '#f59e0b', text: '5-star review from Patricia Go',           time: '2h ago'  },
  ];

  /* Staff Performance array with reactive sorting */
  const rawPerformers = [
    { name: 'Maria Santos', role: 'Lead Therapist',   sessions: 12, revenue: 9400,  rating: 4.9, pct: 94, color: t.accent },
    { name: 'John Doe',     role: 'Senior Therapist',  sessions: 9,  revenue: 7200,  rating: 4.7, pct: 76, color: t.info   },
    { name: 'Anna Reyes',   role: 'Nail Specialist',   sessions: 7,  revenue: 4800,  rating: 4.8, pct: 58, color: t.gold   },
    { name: 'Ben Torres',   role: 'Therapist',         sessions: 5,  revenue: 3500,  rating: 4.5, pct: 40, color: t.pink   },
  ];

  const sortedPerformers = useMemo(() => {
    return [...rawPerformers].sort((a, b) => {
      if (staffSort === 'rating') return b.rating - a.rating;
      if (staffSort === 'sessions') return b.sessions - a.sessions;
      if (staffSort === 'revenue') return b.revenue - a.revenue;
      return 0;
    });
  }, [rawPerformers, staffSort]);

  const KPI_MODALS = {
    therapists: {
      icon: Users, color: isDark ? '#34d399' : '#0a3d30', title: 'Therapist Overview', subtitle: "Today's workforce",
      value: therapistCount || 22, description: 'Total registered therapists active today across operational zones.',
      breakdown: therapistStatus.map(s => ({ label: s.label, value: s.count, pct: s.pct })),
    },
    sessions: {
      icon: Activity, color: t.warning, title: 'Live Sessions', subtitle: 'Active treatments',
      value: `${sessions.length} Live`, description: 'Real-time telemetry of in-home spa therapies currently underway.',
      breakdown: sessions.map(s => ({ label: `${s.service} (${s.location.split(',')[0]})`, value: `${s.pct}% done`, pct: s.pct })),
    },
    bookings: {
      icon: Calendar, color: t.info, title: 'Booking Summary', subtitle: 'All appointments',
      value: totalBookings || 1120, description: 'Scheduled bookings distributed across online and phone reservations.',
      breakdown: bookingBreakdown.map(b => ({ label: b.label, value: b.count.toLocaleString(), pct: b.pct })),
    },
    revenue: {
      icon: DollarSign, color: t.gold, title: 'Revenue Breakdown', subtitle: "Today's earnings",
      value: `₱${(revenue || 90490).toLocaleString()}`, description: 'Gross collected revenue from all completed and active bookings.',
      breakdown: serviceRev.map(s => ({ label: s.label, value: s.value, pct: s.pct })),
    },
  };

  /* Quick Actions Navigation Handler */
  const handleQuickNav = (path) => {
    navigate(path);
  };

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <AdminLayout title="Dashboard" subtitle="Full operational overview" icon={LayoutDashboard}>
      {/* Modals */}
      <AnimatePresence>
        {kpiModal && <KPIModal key="kpi-modal" modal={kpiModal} onClose={() => setKpiModal(null)} t={t} />}
      </AnimatePresence>
      <AnimatePresence>
        {apptModal && <AppointmentModal key="appt-modal" row={apptModal} onClose={() => setApptModal(null)} t={t} navigate={navigate} />}
      </AnimatePresence>
      <AnimatePresence>
        {sessionModal && <SessionDetailModal key="session-modal" session={sessionModal} onClose={() => setSessionModal(null)} t={t} />}
      </AnimatePresence>

      <div className="space-y-5 sm:space-y-6 pb-12">

        {/* ══ TOP STATUS BAR & QUICK ACTIONS ════════════════════════ */}
        <motion.div {...fadeUp(0)} className="flex items-center justify-between flex-wrap gap-3">
          {/* Live system status pill + Date */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-sm"
              style={{
                background: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(10,61,48,0.06)',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : 'rgba(10,61,48,0.12)'}`,
              }}
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: t.success }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: t.success }} />
              </div>
              <span className="text-[11px] font-bold tracking-wide" style={{ color: t.success }}>Systems Live</span>
            </div>

            <span className="hidden sm:inline-block text-xs font-semibold" style={{ color: t.txtMuted }}>
              {now.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Quick Action Navigation Chips & Refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleQuickNav('/admin/appointments')}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-sm"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: t.accent }} />
              <span>Bookings Queue</span>
            </button>

            <button
              onClick={() => handleQuickNav('/admin/customers')}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-sm"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Clients</span>
            </button>

            {refreshSuccess && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-bold text-emerald-500 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Synced
              </motion.span>
            )}

            <button
              onClick={() => load(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard telemetry"
              className="flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 sm:py-2 rounded-xl transition-all hover:opacity-85 active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
              style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: t.accent }} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </motion.div>

        {/* ══ ROW 1: KPI CARDS (Responsive: 1 col on mobile, 2 on tablet, 4 on desktop) ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <KPI
            icon={Users}
            label="Active Therapists"
            value={therapistCount || 22}
            sub="On duty across operational zones"
            color={isDark ? '#34d399' : '#0a3d30'}
            trend="+2"
            trendUp
            sparkData={SPARK.therapists}
            delay={0.04}
            t={t}
            onClick={() => setKpiModal(KPI_MODALS.therapists)}
          />
          <KPI
            icon={Activity}
            label="Live Treatments"
            value={sessions.length}
            sub="Active sessions right now"
            color={t.warning}
            trend="Live"
            trendUp
            sparkData={SPARK.sessions}
            delay={0.08}
            t={t}
            onClick={() => setKpiModal(KPI_MODALS.sessions)}
          />
          <KPI
            icon={Calendar}
            label="Total Bookings"
            value={totalBookings || 1120}
            sub="Confirmed & scheduled sessions"
            color={t.info}
            trend="+12%"
            trendUp
            sparkData={SPARK.bookings}
            delay={0.12}
            t={t}
            onClick={() => setKpiModal(KPI_MODALS.bookings)}
          />
          <KPI
            icon={DollarSign}
            label="Gross Revenue"
            value={revenue || 90490}
            sub="Total verified revenue collected"
            color={t.gold}
            trend="+8.4%"
            trendUp
            sparkData={SPARK.revenue}
            delay={0.16}
            t={t}
            onClick={() => setKpiModal(KPI_MODALS.revenue)}
          />
        </div>

        {/* ══ ROW 2: QUICK INSIGHT METRICS STRIP ════════════════════ */}
        <motion.div {...fadeUp(0.18)} className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { icon: Flame,   label: 'Conversion',   value: '68.4%', color: t.danger,  sub: '+3.2% vs last week', up: true  },
            { icon: Award,   label: 'Completion',   value: '92.1%', color: t.success, sub: 'Optimal fulfillment',up: true  },
            { icon: Target,  label: 'Cancellation', value: '4.8%',  color: t.warning, sub: '-0.5% this week',    up: false },
            { icon: Zap,     label: 'Avg Session',  value: '72 min',color: t.info,    sub: 'Across all rituals', up: true  },
          ].map((ins, i) => (
            <motion.div
              key={ins.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.05, duration: 0.4 }}
              className="group p-3 sm:p-4 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-default relative overflow-hidden flex flex-col justify-between"
              style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `0 0 0 1px ${ins.color}30, 0 6px 20px ${ins.color}14` }}
              />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm"
                  style={{ background: `${ins.color}18`, border: `1px solid ${ins.color}28` }}
                >
                  <ins.icon className="w-4 h-4" style={{ color: ins.color }} />
                </div>
                <span
                  className="text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg"
                  style={{ color: ins.up ? t.success : t.danger, background: ins.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}
                >
                  {ins.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {ins.up ? '↑' : '↓'}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] uppercase font-black tracking-wider" style={{ color: t.txtMuted }}>{ins.label}</p>
                <p className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight" style={{ color: ins.color }}>{ins.value}</p>
                <p className="text-[10px] mt-0.5 font-medium truncate" style={{ color: t.txtMuted }}>{ins.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ══ ROW 3: ACTIVE SESSIONS + LIVE ACTIVITY ═════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Active Sessions (2 Columns on Desktop) */}
          <motion.div {...fadeUp(0.22)} className="lg:col-span-2">
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                    <Wifi className="w-4 h-4" style={{ color: t.accent }} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black" style={{ color: t.txt }}>Live In-Home Sessions</h3>
                    <p className="text-[10px] font-medium" style={{ color: t.txtMuted }}>Tap session to inspect real-time progress</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#ef4444' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#ef4444' }} />
                  </span>
                  <span className="text-[9px] font-black tracking-wide" style={{ color: '#ef4444' }}>LIVE</span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {sessions.map(s => {
                  const pctColor = s.pct > 60 ? t.accent : s.pct > 30 ? t.warning : t.danger;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSessionModal(s)}
                      className="group p-3.5 sm:p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer border relative"
                      style={{ background: t.inner, borderColor: t.divider }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <Ring pct={s.pct} color={pctColor} size={50} stroke={5} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-black tabular-nums" style={{ color: pctColor }}>{s.pct}%</span>
                            </div>
                          </div>
                          <div className="min-w-0">
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
                            <Clock className="w-3 h-3" /> {s.start} – {s.end}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Bar pct={s.pct} color={pctColor} t={t} height={5} />
                        <div className="flex items-center justify-between text-[10px] font-medium" style={{ color: t.txtMuted }}>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> {s.location}</span>
                          <span className="group-hover:text-emerald-500 transition-colors font-semibold">Inspect Telemetry →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div {...fadeUp(0.26)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                    <Activity className="w-4 h-4" style={{ color: t.accent }} />
                  </div>
                  <h3 className="text-sm sm:text-base font-black" style={{ color: t.txt }}>Audit Stream</h3>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.accentAlpha, color: t.accent }}>Live Feed</span>
              </div>

              <div className="flex-1 space-y-1 overflow-hidden">
                {activityFeed.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.05 }}
                    className="group flex items-start gap-2.5 py-2 px-2.5 rounded-xl hover:scale-[1.01] transition-all duration-150 cursor-default"
                    style={{ background: i % 2 === 0 ? t.tableStripe : 'transparent' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-150 group-hover:scale-110 shadow-sm"
                      style={{ background: `${item.color}18`, border: `1px solid ${item.color}24` }}
                    >
                      <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold leading-snug truncate" style={{ color: t.txtSub }}>{item.text}</p>
                      <p className="text-[9px] mt-0.5 font-bold" style={{ color: t.txtMuted }}>{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ══ ROW 4: REVENUE TELEMETRY + STATUS DONUT + CUSTOMER FUNNEL ═ */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">

          {/* Area Chart — Revenue Trend with Touch Scrubbing */}
          <motion.div {...fadeUp(0.30)} className="md:col-span-2 xl:col-span-1">
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <SectionHeader title="Revenue Telemetry" icon={TrendingUp} t={t} />
                  {/* Period switcher */}
                  <div className="flex items-center rounded-xl p-0.5 border" style={{ background: t.inner, borderColor: t.innerBorder }}>
                    {['7D', '14D', '30D'].map(period => (
                      <button
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer"
                        style={{
                          background: chartPeriod === period ? t.accent : 'transparent',
                          color: chartPeriod === period ? '#ffffff' : t.txtMuted,
                        }}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: t.txt }}>
                      {currentDataset.total}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm" style={{ background: 'rgba(16,185,129,0.14)', color: t.success }}>
                      {currentDataset.growth} ↑
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: t.txtMuted }}>Touch or scrub points to inspect details</p>
                </div>

                {/* Area Chart Component with Touch Scrubbing */}
                <div className="my-3">
                  <AreaChart data={currentDataset.bars} color={t.chartLine} height={95} />
                  <div className="flex justify-between mt-1 px-1">
                    {currentDataset.bars.map(b => (
                      <span key={b.day} className="text-[8px] font-bold" style={{ color: t.txtMuted }}>{b.day}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service categories share */}
              <div className="mt-4 pt-3.5 space-y-2.5 border-t" style={{ borderColor: t.divider }}>
                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.txtMuted }}>Revenue by Category</p>
                {serviceRev.map(s => (
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
          </motion.div>

          {/* Donut Chart — Booking Distribution with Interactive Center */}
          <motion.div {...fadeUp(0.34)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <SectionHeader title="Booking Distribution" icon={Calendar} t={t} />

                {/* Donut Graphic with Reactive Center */}
                <div className="flex items-center justify-center my-3 relative">
                  <Donut
                    segments={bookingBreakdown}
                    size={134}
                    stroke={18}
                    onHoverSegment={setActiveDonutSeg}
                    activeSegment={activeDonutSeg}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
                    {activeDonutSeg ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                        <span className="text-lg sm:text-xl font-black tabular-nums" style={{ color: activeDonutSeg.color }}>
                          {activeDonutSeg.count.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[85px]" style={{ color: t.txtSub }}>
                          {activeDonutSeg.label} ({activeDonutSeg.pct}%)
                        </span>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-black tabular-nums" style={{ color: t.txt }}>
                          {(totalBookings || 1120).toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>Bookings</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Legend items with Sync Hover */}
                <div className="space-y-2 mt-2">
                  {bookingBreakdown.map(b => {
                    const isSelected = activeDonutSeg && activeDonutSeg.label === b.label;
                    return (
                      <div
                        key={b.label}
                        onClick={() => setActiveDonutSeg(prev => prev?.label === b.label ? null : b)}
                        onMouseEnter={() => setActiveDonutSeg(b)}
                        onMouseLeave={() => setActiveDonutSeg(null)}
                        className="flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer"
                        style={{
                          background: isSelected ? `${b.color}14` : t.inner,
                          borderColor: isSelected ? b.color : t.innerBorder,
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                          <span className="text-xs font-semibold" style={{ color: isSelected ? t.txt : t.txtSub }}>{b.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold" style={{ color: t.txtMuted }}>{b.pct}%</span>
                          <span className="text-xs font-black tabular-nums" style={{ color: t.txt }}>{b.count.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick stats footer */}
              <div className="mt-4 pt-3.5 grid grid-cols-2 gap-2 border-t" style={{ borderColor: t.divider }}>
                {[
                  { label: 'Avg Ticket',  value: '₱850',                 color: t.warning },
                  { label: 'Commissions', value: '₱12,450',               color: t.info    },
                  { label: 'Clients',     value: clients || 320,          color: t.pink    },
                  { label: 'Total',       value: totalBookings || 1120,   color: t.success },
                ].map(s => (
                  <div key={s.label} className="p-2.5 rounded-xl text-center border" style={{ background: t.inner, borderColor: t.innerBorder }}>
                    <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{s.label}</p>
                    <p className="text-xs sm:text-sm font-black mt-0.5 tabular-nums" style={{ color: s.color }}>
                      {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Customer Funnel & Star Performers */}
          <motion.div {...fadeUp(0.38)} className="md:col-span-2 xl:col-span-1">
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <SectionHeader title="Customer Funnel" icon={Target} t={t} />
                <div className="space-y-3">
                  {funnelSteps.map((f, i) => {
                    const fColor = i === 0 ? t.accent : i < 2 ? t.gold : i < 4 ? t.info : t.success;
                    return (
                      <div key={f.step}>
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <span className="font-medium" style={{ color: t.txtSub }}>{f.step}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black tabular-nums" style={{ color: t.txt }}>{f.count}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${fColor}18`, color: fColor }}>
                              {f.pct}%
                            </span>
                          </div>
                        </div>
                        <Bar pct={f.pct} color={fColor} t={t} height={5} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Star Performers mini list */}
              <div className="mt-4 pt-3.5 border-t" style={{ borderColor: t.divider }}>
                <p className="text-[9px] font-black uppercase tracking-wider mb-2.5" style={{ color: t.txtMuted }}>Top Rated Specialists</p>
                <div className="space-y-2">
                  {sortedPerformers.slice(0, 3).map((p, i) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-2.5 p-2 rounded-xl border transition-transform hover:scale-[1.01]"
                      style={{ background: t.inner, borderColor: t.innerBorder }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
                        style={{
                          background: i === 0
                            ? 'linear-gradient(135deg,#062c22,#bfa15f)'
                            : i === 1
                            ? 'linear-gradient(135deg,#1e293b,#64748b)'
                            : 'linear-gradient(135deg,#451a03,#b45309)'
                        }}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: t.txt }}>{p.name}</p>
                        <p className="text-[10px]" style={{ color: t.txtMuted }}>{p.sessions} sessions · ₱{p.revenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-black flex items-center gap-0.5" style={{ color: t.gold }}>
                          ★ {p.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ══ ROW 5: THERAPIST STATUS + STAFF PERFORMANCE LEADERBOARD ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Therapist Availability */}
          <motion.div {...fadeUp(0.42)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <SectionHeader title="Therapist Status" icon={Users} t={t} />
                <div className="space-y-3">
                  {therapistStatus.map(s => (
                    <div
                      key={s.label}
                      className="p-3 rounded-xl border transition-all duration-200 hover:shadow-sm"
                      style={{ background: t.inner, borderColor: t.innerBorder }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="relative flex-shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full block" style={{ background: s.color }} />
                            {s.label.includes('Duty') && (
                              <span className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-40" style={{ background: s.color }} />
                            )}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: t.txtSub }}>{s.label}</span>
                        </div>
                        <span className="text-sm font-black tabular-nums" style={{ color: t.txt }}>{s.count}</span>
                      </div>
                      <Bar pct={s.pct} color={s.color} t={t} height={5} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3.5 space-y-2 border-t" style={{ borderColor: t.divider }}>
                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.txtMuted }}>Operational KPIs</p>
                {[
                  { label: 'Avg Ticket Size',   value: '₱850',   color: t.warning },
                  { label: 'Staff Retention',   value: '96.2%',  color: t.info    },
                  { label: 'Client Retention',  value: '88.4%',  color: t.success },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1 px-1.5 text-xs">
                    <span style={{ color: t.txtSub }}>{r.label}</span>
                    <span className="font-black tabular-nums" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Staff Performance & Ratings Leaderboard with Interactive Sorting */}
          <motion.div {...fadeUp(0.44)} className="lg:col-span-2">
            <Card t={t} className="p-4 sm:p-5 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                    <Award className="w-4 h-4" style={{ color: t.accent }} />
                  </div>
                  <h3 className="text-sm sm:text-base font-black" style={{ color: t.txt }}>Staff Performance & Ratings</h3>
                </div>

                {/* Sorting Controls */}
                <div className="flex items-center rounded-xl p-0.5 border self-start sm:self-auto" style={{ background: t.inner, borderColor: t.innerBorder }}>
                  {[
                    { id: 'rating',   label: 'Rating'   },
                    { id: 'sessions', label: 'Sessions' },
                    { id: 'revenue',  label: 'Revenue'  },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setStaffSort(tab.id)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                      style={{
                        background: staffSort === tab.id ? t.accent : 'transparent',
                        color: staffSort === tab.id ? '#ffffff' : t.txtMuted,
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {sortedPerformers.map((p, idx) => (
                  <motion.div
                    key={p.name}
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="p-3.5 rounded-2xl border transition-all duration-200 hover:shadow-sm"
                    style={{ background: t.inner, borderColor: t.innerBorder }}
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-sm"
                            style={{ background: `${p.color}18`, border: `1px solid ${p.color}30`, color: p.color }}
                          >
                            {p.name.charAt(0)}
                          </div>
                          <span
                            className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                            style={{
                              background: idx === 0 ? '#bfa15f' : idx === 1 ? '#64748b' : idx === 2 ? '#b45309' : '#475569'
                            }}
                          >
                            {idx + 1}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold" style={{ color: t.txt }}>{p.name}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-md font-bold" style={{ background: t.tag, color: t.tagTxt }}>
                              {p.role}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold" style={{ color: t.gold }}>★ {p.rating} star rating</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-medium" style={{ color: t.txtMuted }}>{p.sessions} sessions</span>
                        <span className="text-xs sm:text-sm font-black tabular-nums" style={{ color: p.color }}>
                          ₱{p.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Bar pct={p.pct} color={p.color} t={t} height={6} />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ══ ROW 6: SCHEDULED APPOINTMENTS MASTER SECTION ═══════════ */}
        <motion.div {...fadeUp(0.48)}>
          <Card t={t} className="overflow-hidden">
            {/* Header & Controls Toolbar */}
            <div
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b"
              style={{ borderColor: t.divider }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accentAlpha }}>
                  <Calendar className="w-4 h-4" style={{ color: t.accent }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black" style={{ color: t.txt }}>Scheduled Bookings</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.accentAlpha, color: t.accent }}>
                      {filteredAppointments.length} Found
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: t.txtMuted }}>Reservations requiring active management</p>
                </div>
              </div>

              {/* Filter Pills, Search Bar, and Dual-View Mode Switcher */}
              <div className="flex items-center flex-wrap gap-2.5">
                {/* Search */}
                <div className="relative flex-1 sm:flex-initial min-w-[170px] sm:min-w-[210px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.txtMuted }} />
                  <input
                    type="text"
                    value={apptSearch}
                    onChange={e => setApptSearch(e.target.value)}
                    placeholder="Search client, service, therapist..."
                    aria-label="Filter appointments"
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs font-medium border outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    style={{ background: t.inner, borderColor: t.innerBorder, color: t.txt }}
                  />
                  {apptSearch && (
                    <button
                      onClick={() => setApptSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Status Tabs */}
                <div className="flex items-center rounded-xl p-0.5 border overflow-x-auto max-w-full" style={{ background: t.inner, borderColor: t.innerBorder }}>
                  {['All', 'In Progress', 'Confirmed', 'Pending', 'Completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setApptFilter(status)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                      style={{
                        background: apptFilter === status ? t.accent : 'transparent',
                        color: apptFilter === status ? '#ffffff' : t.txtMuted,
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Dual View Mode Switcher (Visual Cards vs Compact Table) */}
                <div className="flex items-center rounded-xl p-0.5 border" style={{ background: t.inner, borderColor: t.innerBorder }}>
                  <button
                    onClick={() => setViewMode('table')}
                    title="Compact Table View"
                    className="p-1.5 rounded-lg transition-all cursor-pointer"
                    style={{
                      background: viewMode === 'table' ? t.accent : 'transparent',
                      color: viewMode === 'table' ? '#ffffff' : t.txtMuted,
                    }}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    title="Visual Cards Deck"
                    className="p-1.5 rounded-lg transition-all cursor-pointer"
                    style={{
                      background: viewMode === 'cards' ? t.accent : 'transparent',
                      color: viewMode === 'cards' ? '#ffffff' : t.txtMuted,
                    }}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty state when filters return 0 results */}
            {filteredAppointments.length === 0 ? (
              <div className="py-14 text-center px-4">
                <Calendar className="w-9 h-9 mx-auto mb-2 opacity-30" style={{ color: t.txtMuted }} />
                <p className="text-sm font-bold" style={{ color: t.txt }}>No appointments match your filters</p>
                <p className="text-xs mt-0.5" style={{ color: t.txtMuted }}>Try adjusting your search keywords or status tab</p>
                <button
                  onClick={() => { setApptFilter('All'); setApptSearch(''); }}
                  className="mt-3.5 px-4 py-1.5 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all active:scale-95"
                  style={{ background: t.inner, border: t.innerBorder, color: t.accent }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* ── CARD GRID VIEW ── */}
                {viewMode === 'cards' ? (
                  <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paginatedAppointments.map((row) => (
                      <div
                        key={row.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`View appointment for ${row.client}`}
                        onKeyDown={e => { if (e.key === 'Enter') setApptModal(row); }}
                        onClick={() => setApptModal(row)}
                        className="p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-all hover:-translate-y-0.5 hover:shadow-md border flex flex-col justify-between"
                        style={{ background: t.inner, borderColor: t.innerBorder }}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-sm"
                                style={{ background: 'linear-gradient(135deg,#062c22,#0f5f4a)' }}
                              >
                                {row.client.charAt(0)}
                              </div>
                              <span className="text-xs font-bold truncate" style={{ color: t.txt }}>{row.client}</span>
                            </div>
                            <Badge status={row.status} />
                          </div>

                          <p className="text-xs font-semibold truncate mb-1" style={{ color: t.txtSub }}>{row.service}</p>
                          <p className="text-[11px] truncate mb-2" style={{ color: t.accent }}>Specialist: {row.therapist}</p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-2 border-t mt-2" style={{ borderColor: t.divider, color: t.txtMuted }}>
                          <span className="flex items-center gap-1 font-medium"><Clock className="w-3 h-3" /> {row.time}</span>
                          <span className="flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-emerald-500" /> {row.loc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── DENSE TABLE VIEW ── */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${t.divider}`, background: t.inner }}>
                          {['Client', 'Service', 'Therapist', 'Schedule', 'Location', 'Status', 'Action'].map(h => (
                            <th
                              key={h}
                              className="px-4 sm:px-5 py-3.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                              style={{ color: t.txtMuted }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAppointments.map((row, i) => {
                          const s = STATUS_MAP[row.status] || {};
                          return (
                            <tr
                              key={row.id || i}
                              tabIndex={0}
                              role="button"
                              aria-label={`Inspect appointment for ${row.client}`}
                              onKeyDown={e => { if (e.key === 'Enter') setApptModal(row); }}
                              className="cursor-pointer transition-colors group outline-none focus-visible:bg-emerald-500/5"
                              style={{
                                borderBottom: `1px solid ${t.divider}`,
                                background: i % 2 === 1 ? t.tableStripe : 'transparent',
                                borderLeft: `3px solid ${s.dot || 'transparent'}`,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = t.hover; }}
                              onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 1 ? t.tableStripe : 'transparent'; }}
                              onClick={() => setApptModal(row)}
                            >
                              <td className="px-4 sm:px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-sm"
                                    style={{ background: 'linear-gradient(135deg,#062c22,#0f5f4a)' }}
                                  >
                                    {row.client.charAt(0)}
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
                                <button
                                  aria-label="Inspect appointment"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-75 transition-opacity cursor-pointer"
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
                )}

                {/* ── PAGINATION CONTROLS ── */}
                <div
                  className="p-3 sm:p-4 border-t flex items-center justify-between flex-wrap gap-2 text-xs"
                  style={{ borderColor: t.divider }}
                >
                  <span className="text-[11px] font-semibold" style={{ color: t.txtMuted }}>
                    Showing <strong style={{ color: t.txt }}>{Math.min(filteredAppointments.length, (page - 1) * pageSize + 1)}</strong> to{' '}
                    <strong style={{ color: t.txt }}>{Math.min(filteredAppointments.length, page * pageSize)}</strong> of{' '}
                    <strong style={{ color: t.txt }}>{filteredAppointments.length}</strong> bookings
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-xl border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: t.inner, borderColor: t.innerBorder, color: t.txt }}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold px-2 tabular-nums" style={{ color: t.txt }}>
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-xl border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: t.inner, borderColor: t.innerBorder, color: t.txt }}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </motion.div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
