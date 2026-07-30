import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import {
  DollarSign, Calendar, Users, Activity,
  Clock, MapPin, ArrowUpRight, ArrowDownRight, Zap,
  ChevronRight, Target, X, RefreshCw, Eye,
  UserCheck, Award, Flame,
} from 'lucide-react';

/* ─── animation presets ──────────────────────────────────────────── */
const fadeUp = (delay = 0, dur = 0.45) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: dur, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── theme tokens ────────────────────────────────────────────────── */
const TOKENS = {
  light: {
    canvas:      '#f5f3ee',
    card:        'rgba(255,255,255,0.96)',
    cardShadow:  '0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
    cardBorder:  '1px solid rgba(0,0,0,0.07)',
    inner:       '#faf8f4',
    innerBorder: '1px solid rgba(0,0,0,0.06)',
    txt:         '#14181f',
    txtMuted:    '#8e97a4',
    txtSub:      '#4a5568',
    bar:         '#e5e8ef',
    accent:      '#0a3d30',
    accentBright:'#0f5f4a',
    gold:        '#bfa15f',
    progressBg:  '#e9edf4',
    tag:         'rgba(0,0,0,0.05)',
    tagTxt:      '#4a5568',
    divider:     'rgba(0,0,0,0.07)',
    hover:       'rgba(0,0,0,0.03)',
    success:     '#10b981',
    warning:     '#f59e0b',
    danger:      '#ef4444',
    info:        '#6366f1',
    pink:        '#ec4899',
  },
  dark: {
    canvas:      '#0e1320',
    card:        '#161d2c',
    cardShadow:  '0 4px 28px rgba(0,0,0,0.4)',
    cardBorder:  '1px solid rgba(255,255,255,0.07)',
    inner:       '#111827',
    innerBorder: '1px solid rgba(255,255,255,0.06)',
    txt:         '#dde6f0',
    txtMuted:    '#4e5e72',
    txtSub:      '#7b8da4',
    bar:         'rgba(255,255,255,0.07)',
    accent:      '#34d399',
    accentBright:'#6ee7b7',
    gold:        '#d4b87a',
    progressBg:  'rgba(255,255,255,0.07)',
    tag:         'rgba(255,255,255,0.08)',
    tagTxt:      '#7b8da4',
    divider:     'rgba(255,255,255,0.07)',
    hover:       'rgba(255,255,255,0.03)',
    success:     '#34d399',
    warning:     '#fbbf24',
    danger:      '#f87171',
    info:        '#818cf8',
    pink:        '#f472b6',
  },
};

/* ─── reusable card ───────────────────────────────────────────────── */
const Card = ({ children, className = '', style = {}, t, onClick, hoverable = false }) => (
  <div
    className={`rounded-2xl overflow-hidden ${hoverable ? 'cursor-pointer transition-transform duration-200 active:scale-[0.99] hover:-translate-y-0.5' : ''} ${className}`}
    style={{ background: t.card, boxShadow: t.cardShadow, border: t.cardBorder, ...style }}
    onClick={onClick}
  >
    {children}
  </div>
);

/* ─── KPI card ────────────────────────────────────────────────────── */
const KPI = ({ icon: Icon, label, value, sub, color, trend, trendUp, delay, t, onClick }) => (
  <motion.div {...fadeUp(delay)} className="cursor-pointer group" onClick={onClick}>
    <Card t={t} hoverable className="p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl pointer-events-none"
        style={{ background: color, transform: 'translate(30%,-30%)' }} />
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${color}1a`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-1 rounded-lg"
            style={{ background: trendUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: trendUp ? t.success : t.danger }}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span className="hidden xs:inline">{trend}</span>
          </span>
        )}
      </div>
      <div>
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{label}</p>
        <p className="text-xl sm:text-2xl font-black mt-0.5 leading-tight" style={{ color: t.txt }}>{value}</p>
        {sub && <p className="text-[10px] sm:text-[11px] mt-1 font-medium" style={{ color: t.txtMuted }}>{sub}</p>}
      </div>
    </Card>
  </motion.div>
);

/* ─── section label ───────────────────────────────────────────────── */
const SectionLabel = ({ children, t, action }) => (
  <div className="flex items-center justify-between mb-3">
    <p className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: t.txtMuted }}>{children}</p>
    {action && (
      <button className="text-[10px] font-bold flex items-center gap-1 hover:opacity-70 transition-opacity"
        style={{ color: t.accent }}>
        {action} <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

/* ─── progress bar ────────────────────────────────────────────────── */
const Bar = ({ pct, color, t }) => (
  <div className="h-1.5 rounded-full w-full overflow-hidden" style={{ background: t.progressBg }}>
    <motion.div className="h-full rounded-full" style={{ background: color }}
      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: 'easeOut' }} />
  </div>
);

/* ─── status badge ────────────────────────────────────────────────── */
const STATUS_MAP = {
  'In Progress': { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'Starting':    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Confirmed':   { color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  'Pending':     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Completed':   { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  'Cancelled':   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || { color: '#8e97a4', bg: 'rgba(142,151,164,0.1)' };
  return (
    <span className="text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-lg whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

/* ─── modal wrapper — scrollable, safe on all screen sizes ───────── */
const ModalWrap = ({ children, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ─── KPI detail modal ────────────────────────────────────────────── */
const KPIModal = ({ modal, onClose, t }) => {
  if (!modal) return null;
  return (
    <ModalWrap onClose={onClose}>
      <div style={{ background: t.card, border: t.cardBorder }} className="rounded-t-3xl sm:rounded-3xl p-5 sm:p-6">
        {/* Handle bar for mobile */}
        <div className="w-10 h-1 bg-current opacity-20 rounded-full mx-auto mb-4 sm:hidden" style={{ color: t.txtMuted }} />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${modal.color}18`, border: `1px solid ${modal.color}30` }}>
              <modal.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: modal.color }} />
            </div>
            <div>
              <h3 className="font-black text-sm" style={{ color: t.txt }}>{modal.title}</h3>
              <p className="text-[10px]" style={{ color: t.txtMuted }}>{modal.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:opacity-50 hover:opacity-70 transition-opacity"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-3xl sm:text-4xl font-black mb-1" style={{ color: modal.color }}>{modal.value}</div>
        <p className="text-xs mb-5" style={{ color: t.txtMuted }}>{modal.description}</p>

        <div className="space-y-3">
          {modal.breakdown.map(b => (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px]" style={{ color: t.txtSub }}>{b.label}</span>
                <span className="text-[11px] font-bold" style={{ color: t.txt }}>{b.value}</span>
              </div>
              <Bar pct={b.pct} color={modal.color} t={t} />
            </div>
          ))}
        </div>
      </div>
    </ModalWrap>
  );
};

/* ─── Appointment detail modal ────────────────────────────────────── */
const AppointmentModal = ({ row, onClose, t }) => {
  if (!row) return null;
  return (
    <ModalWrap onClose={onClose}>
      <div style={{ background: t.card, border: t.cardBorder }} className="rounded-t-3xl sm:rounded-3xl p-5 sm:p-6">
        {/* Handle bar for mobile */}
        <div className="w-10 h-1 bg-current opacity-20 rounded-full mx-auto mb-4 sm:hidden" style={{ color: t.txtMuted }} />

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-sm" style={{ color: t.txt }}>Appointment Detail</h3>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:opacity-50 hover:opacity-70 transition-opacity"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Client avatar row */}
        <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-base sm:text-lg font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
            {row.client.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm truncate" style={{ color: t.txt }}>{row.client}</p>
            <p className="text-[10px] truncate" style={{ color: t.txtMuted }}>{row.service}</p>
          </div>
          <div className="flex-shrink-0"><Badge status={row.status} /></div>
        </div>

        <div className="space-y-2.5">
          {[
            { label: 'Therapist', value: row.therapist, icon: UserCheck },
            { label: 'Time',      value: row.time,      icon: Clock },
            { label: 'Location',  value: row.loc,       icon: MapPin },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl"
              style={{ background: t.inner, border: t.innerBorder }}>
              <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: t.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{item.label}</p>
                <p className="text-[12px] font-semibold truncate" style={{ color: t.txt }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Close button on mobile bottom */}
        <button onClick={onClose}
          className="w-full mt-5 py-3 rounded-2xl text-sm font-bold sm:hidden active:opacity-70"
          style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
          Close
        </button>
      </div>
    </ModalWrap>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { theme } = useTheme();
  const t = TOKENS[theme] || TOKENS.light;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpiModal, setKpiModal]   = useState(null);
  const [apptModal, setApptModal] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileView, setMobileView] = useState('cards'); // 'cards' | 'table' for recent appointments

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const r = await API.get('/admin/dashboard');
      setData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Full operational overview">
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  /* ── data helpers ── */
  const stats        = data?.stats || {};
  const therapistCount = stats.active_therapists  || 0;
  const totalBookings  = stats.total_bookings      || 0;
  const clients        = stats.registered_clients  || 0;
  const revenue        = stats.total_revenue       || 0;

  const sessions = [
    { id: 1, client: 'Sarah Martinez', therapist: 'Maria Santos', service: 'Swedish Massage',  duration: '60 min', start: '9:00 PM',  end: '10:00 PM', pct: 75, location: 'Makati City', status: 'In Progress' },
    { id: 2, client: 'David Lim',      therapist: 'John Doe',     service: 'Swedish & Hilot',  duration: '90 min', start: '9:15 PM',  end: '10:45 PM', pct: 50, location: 'Quezon City', status: 'In Progress' },
    { id: 3, client: 'Patricia Go',    therapist: 'Anna Reyes',   service: 'Mani & Pedi',      duration: '60 min', start: '9:30 PM',  end: '10:30 PM', pct: 20, location: 'BGC, Taguig', status: 'Starting' },
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

  const funnelSteps = [
    { step: 'Page Visits',         count: '10,240', pct: 100 },
    { step: 'Service Clicks',      count: '4,850',  pct: 47  },
    { step: 'Bookings Requested',  count: '1,240',  pct: 25  },
    { step: 'Bookings Confirmed',  count: '1,120',  pct: 22  },
    { step: 'Completed Treatment', count: '1,032',  pct: 20  },
  ];

  const therapistStatus = [
    { label: 'On Duty & Available',   count: 18, color: t.success, pct: 60 },
    { label: 'In Treatment',          count: 4,  color: t.warning, pct: 13 },
    { label: 'Break / Offline',       count: 8,  color: t.txtMuted, pct: 27 },
  ];

  const bookingBreakdown = [
    { label: 'Confirmed', count: 940, pct: 84, color: '#0a3d30' },
    { label: 'Pending',   count: 124, pct: 11, color: t.warning  },
    { label: 'Cancelled', count: 56,  pct: 5,  color: t.danger   },
  ];

  const serviceRev = [
    { label: 'Massage Therapy', value: '₱62,450', pct: 69, color: t.accent },
    { label: 'Nail Care',       value: '₱18,240', pct: 20, color: t.gold   },
    { label: 'Other Services',  value: '₱9,800',  pct: 11, color: t.info   },
  ];

  const recentRows = data?.recent_appointments?.length
    ? data.recent_appointments.map(a => ({
        client:    a.client_name    || 'Client',
        service:   a.service        || 'Service',
        therapist: a.therapist_name || 'Unassigned',
        time:      a.datetime ? new Date(a.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
        loc:       'Manila',
        status:    a.status || 'Pending',
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
      icon: Users, color: '#0a3d30', title: 'Therapist Overview', subtitle: "Today's workforce breakdown",
      value: therapistCount, description: 'Total registered therapists active and available today.',
      breakdown: therapistStatus.map(s => ({ label: s.label, value: s.count, pct: s.pct })),
    },
    sessions: {
      icon: Activity, color: t.warning, title: 'Live Sessions', subtitle: 'Current ongoing treatments',
      value: '4 Live', description: 'Real-time tracking of sessions currently in progress.',
      breakdown: [
        { label: 'Swedish Massage (Makati)', value: '75% done', pct: 75 },
        { label: 'Swedish & Hilot (QC)',     value: '50% done', pct: 50 },
        { label: 'Mani & Pedi (BGC)',        value: '20% done', pct: 20 },
      ],
    },
    bookings: {
      icon: Calendar, color: t.info, title: 'Booking Summary', subtitle: 'Total bookings breakdown',
      value: totalBookings, description: 'All appointments scheduled across all therapists.',
      breakdown: bookingBreakdown.map(b => ({ label: b.label, value: b.count.toLocaleString(), pct: b.pct })),
    },
    revenue: {
      icon: DollarSign, color: t.gold, title: 'Revenue Breakdown', subtitle: "Today's earnings by service",
      value: `₱${revenue.toLocaleString()}`, description: 'Gross revenue from all completed and confirmed sessions.',
      breakdown: serviceRev.map(s => ({ label: s.label, value: s.value, pct: s.pct })),
    },
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Full operational overview">
      <KPIModal modal={kpiModal} onClose={() => setKpiModal(null)} t={t} />
      <AppointmentModal row={apptModal} onClose={() => setApptModal(null)} t={t} />

      <div className="space-y-4 sm:space-y-6 pb-6">

        {/* ── Refresh bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-semibold" style={{ color: t.txtMuted }}>Live data — updates every 30s</span>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition-all hover:opacity-80 active:opacity-60 cursor-pointer min-h-[36px]"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Row 1: KPI strip — 2 cols on mobile, 4 on lg ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPI icon={Users}      label="Active Therapists" value={therapistCount}               sub="On duty today"          color="#0a3d30" trend="+2"       trendUp delay={0.00} t={t} onClick={() => setKpiModal(KPI_MODALS.therapists)} />
          <KPI icon={Activity}   label="Live Sessions"     value="4 Active"                     sub="In-home right now"      color={t.warning} trend="Live"   trendUp delay={0.06} t={t} onClick={() => setKpiModal(KPI_MODALS.sessions)} />
          <KPI icon={Calendar}   label="Total Bookings"    value={totalBookings}                sub="All scheduled sessions" color={t.info}  trend="+12"      trendUp delay={0.12} t={t} onClick={() => setKpiModal(KPI_MODALS.bookings)} />
          <KPI icon={DollarSign} label="Today's Revenue"   value={`₱${revenue.toLocaleString()}`} sub="All invoices today"  color={t.gold}  trend="+8.4%"    trendUp delay={0.18} t={t} onClick={() => setKpiModal(KPI_MODALS.revenue)} />
        </div>

        {/* ── Insight strip — 2 cols mobile, 4 on md ── */}
        <motion.div {...fadeUp(0.2)} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: Flame,  label: 'Conversion',      value: '68.4%', color: t.danger,  sub: '+3.2% vs last week' },
            { icon: Award,  label: 'Completion',      value: '92.1%', color: t.success, sub: 'Excellent' },
            { icon: Target, label: 'Cancellation',    value: '4.8%',  color: t.warning, sub: '-0.5% this week' },
            { icon: Zap,    label: 'Avg Session Time', value: '72 min', color: t.info,  sub: 'All services' },
          ].map(ins => (
            <div key={ins.label}
              className="p-3 rounded-2xl flex items-center gap-2 sm:gap-3 hover:scale-[1.02] transition-transform cursor-default"
              style={{ background: t.inner, border: t.innerBorder }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${ins.color}18`, border: `1px solid ${ins.color}28` }}>
                <ins.icon className="w-4 h-4" style={{ color: ins.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate" style={{ color: t.txtMuted }}>{ins.label}</p>
                <p className="text-sm font-black" style={{ color: ins.color }}>{ins.value}</p>
                <p className="text-[8px] sm:text-[9px] hidden sm:block" style={{ color: t.txtMuted }}>{ins.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Row 2: Live Sessions + Therapist Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Live sessions */}
          <motion.div {...fadeUp(0.24)} className="lg:col-span-2">
            <Card t={t} className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4"
                style={{ borderBottom: `1px solid ${t.divider}`, paddingBottom: '0.75rem' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold" style={{ color: t.txt }}>Active Sessions</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.12)', color: t.success }}>
                  Live Tracking
                </span>
              </div>
              <div className="space-y-3">
                {sessions.map(s => {
                  const pctColor = s.pct > 60 ? t.accent : t.warning;
                  return (
                    <div key={s.id} className="p-3 sm:p-4 rounded-2xl space-y-2.5 hover:shadow-sm transition-all"
                      style={{ background: t.inner, border: t.innerBorder }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
                              {s.client.charAt(0)}
                            </div>
                            <p className="text-[11px] sm:text-[12px] font-bold truncate" style={{ color: t.txt }}>
                              {s.service} <span className="font-normal opacity-60">· {s.duration}</span>
                            </p>
                          </div>
                          <p className="text-[10px] mt-1 ml-8" style={{ color: t.txtMuted }}>
                            <span style={{ color: t.txtSub, fontWeight: 600 }}>{s.client}</span>
                            {' · '}
                            <span style={{ color: t.accent, fontWeight: 700 }}>{s.therapist}</span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                            style={{ background: t.tag, color: t.tagTxt }}>
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="hidden xs:inline">{s.location}</span>
                          </span>
                          <span className="text-[9px] font-semibold" style={{ color: t.txtMuted }}>
                            {s.start}–{s.end}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: t.progressBg }}>
                          <motion.div className="h-full rounded-full" style={{ background: pctColor }}
                            initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }} />
                        </div>
                        <span className="text-[10px] font-black flex-shrink-0" style={{ color: pctColor }}>{s.pct}%</span>
                        <Badge status={s.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Therapist status */}
          <motion.div {...fadeUp(0.28)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <SectionLabel t={t} action="View all">Therapist Status</SectionLabel>
              <div className="space-y-2.5 flex-1">
                {therapistStatus.map(s => (
                  <div key={s.label} className="p-3 rounded-xl hover:scale-[1.01] transition-transform"
                    style={{ background: t.inner, border: t.innerBorder }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-[11px] font-medium" style={{ color: t.txtSub }}>{s.label}</span>
                      </div>
                      <span className="text-sm font-black" style={{ color: t.txt }}>{s.count}</span>
                    </div>
                    <Bar pct={s.pct} color={s.color} t={t} />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                <SectionLabel t={t}>Quick Metrics</SectionLabel>
                <div className="space-y-2.5">
                  {[
                    { label: 'Avg Ticket',  value: '₱850',     color: t.warning },
                    { label: 'Commissions', value: '₱12,450',  color: t.info },
                    { label: 'New Clients', value: `${clients}`, color: t.pink },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: t.txtSub }}>{r.label}</span>
                      <span className="text-[12px] font-black" style={{ color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── Row 3: Revenue Chart + Booking Status + Funnel — stack on mobile ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">

          {/* Bar chart */}
          <motion.div {...fadeUp(0.32)} className="sm:col-span-2 xl:col-span-1">
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold" style={{ color: t.txt }}>Revenue — Last 7 Days</h3>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: t.txtMuted }}>PHP</span>
              </div>
              <p className="text-[10px] mb-4" style={{ color: t.txtMuted }}>Tap / hover a bar to see value</p>

              <div className="flex items-end justify-between gap-1 sm:gap-1.5 flex-1" style={{ minHeight: 90 }}>
                {chartBars.map((b, i) => {
                  const heightPct = (b.val / maxVal) * 100;
                  const isMax = b.val === maxVal;
                  const isHov = hoveredBar === b.day;
                  return (
                    <div key={b.day} className="flex-1 flex flex-col items-center gap-1 relative"
                      onMouseEnter={() => setHoveredBar(b.day)}
                      onMouseLeave={() => setHoveredBar(null)}
                      onTouchStart={() => setHoveredBar(b.day)}
                      onTouchEnd={() => setTimeout(() => setHoveredBar(null), 800)}>
                      <AnimatePresence>
                        {isHov && (
                          <motion.span
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute -top-7 text-[9px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded-lg z-10"
                            style={{ background: t.accent, color: '#fff' }}>
                            ₱{b.val.toLocaleString()}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <motion.div
                        className="w-full rounded-t-md cursor-pointer"
                        style={{
                          background: isMax
                            ? `linear-gradient(180deg,${t.accentBright},${t.accent})`
                            : isHov ? t.accent : t.bar,
                          height: `${heightPct}%`,
                          minHeight: 6,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.07, ease: 'easeOut' }}
                      />
                      <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: isHov ? t.accent : t.txtMuted }}>{b.day}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 space-y-2.5" style={{ borderTop: `1px solid ${t.divider}` }}>
                <SectionLabel t={t}>By Category</SectionLabel>
                {serviceRev.map(s => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px]" style={{ color: t.txtSub }}>{s.label}</span>
                      <span className="text-[11px] font-bold" style={{ color: t.txt }}>{s.value}</span>
                    </div>
                    <Bar pct={s.pct} color={s.color} t={t} />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Booking status */}
          <motion.div {...fadeUp(0.36)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <h3 className="text-sm font-bold mb-4" style={{ color: t.txt }}>Appointment Status</h3>
              <div className="h-6 w-full rounded-xl flex overflow-hidden mb-2" style={{ border: t.innerBorder }}>
                {bookingBreakdown.map(b => (
                  <motion.div key={b.label}
                    className="h-full flex items-center justify-center"
                    title={`${b.label}: ${b.count}`}
                    style={{ width: `${b.pct}%`, background: b.color }}
                    initial={{ width: 0 }} animate={{ width: `${b.pct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}>
                    {b.pct > 10 && <span className="text-[9px] font-black text-white">{b.pct}%</span>}
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {bookingBreakdown.map(b => (
                  <div key={b.label} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                    <span className="text-[9px]" style={{ color: t.txtMuted }}>{b.label}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 flex-1">
                {bookingBreakdown.map(b => (
                  <div key={b.label} className="flex items-center justify-between p-3 rounded-xl hover:scale-[1.01] transition-transform"
                    style={{ background: t.inner, border: t.innerBorder }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                      <span className="text-[11px]" style={{ color: t.txtSub }}>{b.label}</span>
                    </div>
                    <span className="text-[12px] font-black" style={{ color: t.txt }}>{b.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 grid grid-cols-2 gap-2" style={{ borderTop: `1px solid ${t.divider}` }}>
                {[
                  { label: 'Avg Ticket',  value: '₱850',       color: t.warning },
                  { label: 'Commissions', value: '₱12,450',    color: t.info },
                  { label: 'Clients',     value: clients,       color: t.pink },
                  { label: 'Total',       value: totalBookings, color: t.success },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: t.inner, border: t.innerBorder }}>
                    <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: t.txtMuted }}>{s.label}</p>
                    <p className="text-sm font-black mt-0.5" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Funnel */}
          <motion.div {...fadeUp(0.40)}>
            <Card t={t} className="p-4 sm:p-5 h-full flex flex-col">
              <h3 className="text-sm font-bold mb-4" style={{ color: t.txt }}>Customer Funnel</h3>
              <div className="space-y-3 flex-1">
                {funnelSteps.map((f, i) => {
                  const fColor = i === 0 ? t.accent : i < 2 ? t.gold : i < 4 ? t.info : t.success;
                  return (
                    <div key={f.step}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium" style={{ color: t.txtSub }}>{f.step}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black" style={{ color: t.txt }}>{f.count}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ background: `${fColor}18`, color: fColor }}>
                            {f.pct}%
                          </span>
                        </div>
                      </div>
                      <Bar pct={f.pct} color={fColor} t={t} />
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                <SectionLabel t={t}>Top Services</SectionLabel>
                {[
                  { name: 'Swedish Massage', pct: 38, bookings: 412 },
                  { name: 'Deep Tissue',     pct: 24, bookings: 260 },
                  { name: 'Mani & Pedi',     pct: 18, bookings: 195 },
                ].map((s, i) => {
                  const sColor = i === 0 ? t.accent : i === 1 ? t.gold : t.info;
                  return (
                    <div key={s.name} className="flex items-center gap-2 mb-2.5 last:mb-0">
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                        style={{ background: sColor }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium truncate" style={{ color: t.txtSub }}>{s.name}</span>
                          <span className="text-[10px] font-bold" style={{ color: t.txt }}>{s.bookings}</span>
                        </div>
                        <Bar pct={s.pct} color={sColor} t={t} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── Row 4: Recent Appointments ── */}
        <motion.div {...fadeUp(0.44)}>
          <Card t={t} className="overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-4"
              style={{ borderBottom: `1px solid ${t.divider}` }}>
              <h3 className="text-sm font-bold" style={{ color: t.txt }}>Recent Appointments</h3>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile view toggle */}
                <div className="flex sm:hidden items-center rounded-lg overflow-hidden" style={{ border: t.innerBorder }}>
                  {['cards', 'table'].map(v => (
                    <button key={v} onClick={() => setMobileView(v)}
                      className="px-2.5 py-1.5 text-[9px] font-bold capitalize"
                      style={{
                        background: mobileView === v ? t.accent : t.inner,
                        color: mobileView === v ? '#fff' : t.txtMuted,
                      }}>
                      {v}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-semibold hidden sm:inline" style={{ color: t.txtMuted }}>Today's schedule</span>
                <button className="flex items-center gap-1 text-[10px] font-bold hover:opacity-70 transition-opacity"
                  style={{ color: t.accent }}>
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
                      style={{ background: t.inner, border: t.innerBorder }}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
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
                      <tr style={{ borderBottom: `1px solid ${t.divider}` }}>
                        {['Client', 'Service', 'Time', 'Status'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider"
                            style={{ color: t.txtMuted, background: t.inner }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentRows.map((row, i) => (
                        <tr key={i} className="cursor-pointer" style={{ borderBottom: `1px solid ${t.divider}` }}
                          onClick={() => setApptModal(row)}>
                          <td className="px-3 py-3 text-[11px] font-semibold" style={{ color: t.txt }}>{row.client}</td>
                          <td className="px-3 py-3 text-[10px]" style={{ color: t.txtSub }}>{row.service}</td>
                          <td className="px-3 py-3 text-[10px]" style={{ color: t.txtMuted }}>{row.time}</td>
                          <td className="px-3 py-3"><Badge status={row.status} /></td>
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
                  <tr style={{ borderBottom: `1px solid ${t.divider}` }}>
                    {['Client', 'Service', 'Therapist', 'Time', 'Location', 'Status', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-wider"
                        style={{ color: t.txtMuted, whiteSpace: 'nowrap', background: t.inner }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRows.map((row, i) => (
                    <tr key={i}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: `1px solid ${t.divider}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      onClick={() => setApptModal(row)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
                            {row.client.charAt(0)}
                          </div>
                          <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: t.txt }}>{row.client}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: t.txtSub }}>{row.service}</td>
                      <td className="px-5 py-3.5 text-[12px] font-semibold whitespace-nowrap" style={{ color: t.accent }}>{row.therapist}</td>
                      <td className="px-5 py-3.5 text-[11px] whitespace-nowrap" style={{ color: t.txtMuted }}>{row.time}</td>
                      <td className="px-5 py-3.5 text-[11px] whitespace-nowrap" style={{ color: t.txtMuted }}>{row.loc}</td>
                      <td className="px-5 py-3.5"><Badge status={row.status} /></td>
                      <td className="px-5 py-3.5">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                          style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
