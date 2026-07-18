import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import {
  DollarSign, Calendar, Users, TrendingUp,
  Clock, CheckCircle2, AlertCircle, Activity,
  MapPin, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

/* ─── animation preset ─────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
});

/* ─── theme tokens ─────────────────────────────────────────────────── */
const TOKENS = {
  light: {
    card: 'rgba(255,255,255,0.95)',
    cardShadow: '0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
    cardBorder: '1px solid rgba(0,0,0,0.06)',
    inner: '#f8f9fc',
    innerBorder: '1px solid rgba(0,0,0,0.05)',
    txt: '#1a1d23',
    txtMuted: '#8a9199',
    txtSub: '#4a5260',
    bar: '#e9edf4',
    accent: '#0a3d30',
    gold: '#bfa15f',
    progressBg: '#e9edf4',
    tag: 'rgba(0,0,0,0.05)',
    tagTxt: '#4a5260',
    divider: 'rgba(0,0,0,0.06)',
  },
  dark: {
    card: '#1c2333',
    cardShadow: '0 4px 24px rgba(0,0,0,0.35)',
    cardBorder: '1px solid rgba(255,255,255,0.07)',
    inner: '#161d2b',
    innerBorder: '1px solid rgba(255,255,255,0.06)',
    txt: '#dde3ef',
    txtMuted: '#4e5a70',
    txtSub: '#8a9ab0',
    bar: 'rgba(255,255,255,0.06)',
    accent: '#34d399',
    gold: '#d4b87a',
    progressBg: 'rgba(255,255,255,0.07)',
    tag: 'rgba(255,255,255,0.07)',
    tagTxt: '#8a9ab0',
    divider: 'rgba(255,255,255,0.06)',
  },
};

/* ─── reusable card shell ──────────────────────────────────────────── */
const Card = ({ children, className = '', style = {}, t }) => (
  <div
    className={`rounded-2xl overflow-hidden ${className}`}
    style={{
      background: t.card,
      boxShadow: t.cardShadow,
      border: t.cardBorder,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ─── stat KPI card ────────────────────────────────────────────────── */
const KPI = ({ icon: Icon, label, value, sub, color, trend, trendUp, delay, t }) => (
  <motion.div {...fadeUp(delay)}>
    <Card t={t} className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-lg"
            style={{
              background: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: trendUp ? '#10b981' : '#ef4444',
            }}
          >
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>{label}</p>
        <p className="text-2xl font-black mt-0.5 leading-tight" style={{ color: t.txt }}>{value}</p>
        {sub && <p className="text-[11px] mt-1 font-medium" style={{ color: t.txtMuted }}>{sub}</p>}
      </div>
    </Card>
  </motion.div>
);

/* ─── section heading ──────────────────────────────────────────────── */
const SectionLabel = ({ children, t }) => (
  <p className="text-[9px] font-black tracking-[0.25em] uppercase mb-3" style={{ color: t.txtMuted }}>
    {children}
  </p>
);

/* ─── progress bar ─────────────────────────────────────────────────── */
const Bar = ({ pct, color, t }) => (
  <div className="h-1.5 rounded-full w-full overflow-hidden" style={{ background: t.progressBg }}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { theme } = useTheme();
  const t = TOKENS[theme] || TOKENS.light;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Overview">
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  /* ── data helpers ── */
  const stats = data?.stats || {};
  const therapistCount = stats.active_therapists || 0;
  const totalBookings = stats.total_bookings || 0;
  const clients = stats.registered_clients || 0;
  const revenue = stats.total_revenue || 0;

  /* ── mock sessions ── */
  const sessions = [
    { id: 1, client: 'Sarah Martinez', therapist: 'Maria Santos', service: 'Swedish Massage', duration: '60 min', start: '9:00 PM', end: '10:00 PM', pct: 75, location: 'Makati City', status: 'In Progress' },
    { id: 2, client: 'David Lim',      therapist: 'John Doe',     service: 'Swedish & Hilot', duration: '90 min', start: '9:15 PM', end: '10:45 PM', pct: 50, location: 'Quezon City', status: 'In Progress' },
    { id: 3, client: 'Patricia Go',    therapist: 'Anna Reyes',   service: 'Mani & Pedi',     duration: '60 min', start: '9:30 PM', end: '10:30 PM', pct: 20, location: 'BGC, Taguig', status: 'Starting' },
  ];

  /* ── week chart ── */
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

  /* ── funnel ── */
  const funnelSteps = [
    { step: 'Page Visits',          count: '10,240', pct: 100 },
    { step: 'Service Clicks',       count: '4,850',  pct: 47  },
    { step: 'Bookings Requested',   count: '1,240',  pct: 25  },
    { step: 'Bookings Confirmed',   count: '1,120',  pct: 22  },
    { step: 'Completed Treatment',  count: '1,032',  pct: 20  },
  ];

  /* ── status dots ── */
  const therapistStatus = [
    { label: 'On Duty & Available',      count: 18, color: '#10b981' },
    { label: 'Currently in Treatment',   count: 4,  color: '#f59e0b' },
    { label: 'On Break / Offline',       count: 8,  color: t.txtMuted },
  ];

  /* ── booking breakdown ── */
  const bookingBreakdown = [
    { label: 'Confirmed',  count: 940,  pct: 84, color: '#0a3d30' },
    { label: 'Pending',    count: 124,  pct: 11, color: '#f59e0b' },
    { label: 'Cancelled',  count: 56,   pct: 5,  color: '#ef4444' },
  ];

  /* ── service revenue ── */
  const serviceRev = [
    { label: 'Massage Therapy', value: '₱62,450', pct: 69, color: '#0a3d30' },
    { label: 'Nail Care',       value: '₱18,240', pct: 20, color: '#bfa15f' },
    { label: 'Other Services',  value: '₱9,800',  pct: 11, color: '#6366f1' },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Full operational overview">
      <div className="space-y-6 pb-6">

        {/* ── Row 1: KPI strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI icon={Users}      label="Active Therapists"  value={therapistCount} sub="On duty today"         color="#0a3d30" trend="+2 vs yesterday" trendUp delay={0.00} t={t} />
          <KPI icon={Activity}   label="Ongoing Sessions"   value="4 Live"         sub="In-home right now"     color="#f59e0b" trend="Live"             trendUp delay={0.06} t={t} />
          <KPI icon={Calendar}   label="Total Bookings"     value={totalBookings}  sub="All scheduled sessions" color="#6366f1" trend="+12 this week"   trendUp delay={0.12} t={t} />
          <KPI icon={DollarSign} label="Today's Revenue"    value={`₱${revenue.toLocaleString()}`} sub="All invoices today" color="#bfa15f" trend="+8.4%" trendUp delay={0.18} t={t} />
        </div>

        {/* ── Row 2: Live Sessions + Therapist Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Live sessions — spans 2 cols */}
          <motion.div {...fadeUp(0.22)} className="lg:col-span-2">
            <Card t={t} className="p-5">
              <div className="flex items-center justify-between mb-4"
                style={{ borderBottom: `1px solid ${t.divider}`, paddingBottom: '0.75rem' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold" style={{ color: t.txt }}>Active Sessions</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                  Live Tracking
                </span>
              </div>
              <div className="space-y-3">
                {sessions.map(s => (
                  <div key={s.id} className="p-3.5 rounded-xl space-y-2.5"
                    style={{ background: t.inner, border: t.innerBorder }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold truncate" style={{ color: t.txt }}>
                          {s.service} · {s.duration}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: t.txtMuted }}>
                          Client: <span style={{ color: t.txtSub, fontWeight: 600 }}>{s.client}</span>
                          {' '}·{' '}
                          Therapist: <span style={{ color: t.accent, fontWeight: 700 }}>{s.therapist}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: t.tag, color: t.tagTxt }}>
                          <MapPin className="w-2.5 h-2.5 inline mr-0.5" />{s.location}
                        </span>
                        <span className="text-[9px] font-bold" style={{ color: t.txtMuted }}>
                          {s.start} – {s.end}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bar pct={s.pct} color={s.pct > 60 ? '#0a3d30' : '#f59e0b'} t={t} />
                      <span className="text-[10px] font-black flex-shrink-0" style={{ color: t.txtMuted }}>
                        {s.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Therapist status */}
          <motion.div {...fadeUp(0.26)}>
            <Card t={t} className="p-5 h-full">
              <h3 className="text-sm font-bold mb-4" style={{ color: t.txt }}>Therapist Status Today</h3>
              <div className="space-y-3">
                {therapistStatus.map(s => (
                  <div key={s.label} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: t.inner, border: t.innerBorder }}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: s.color }} />
                      <span className="text-[11.5px] font-medium" style={{ color: t.txtSub }}>{s.label}</span>
                    </div>
                    <span className="text-sm font-black" style={{ color: t.txt }}>{s.count}</span>
                  </div>
                ))}
              </div>

              {/* Quick rate cards */}
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                <SectionLabel t={t}>Conversion Rates</SectionLabel>
                <div className="space-y-2.5">
                  {[
                    { label: 'Booking Conversion', value: '68.4%', color: '#6366f1' },
                    { label: 'Completion Rate',    value: '92.1%', color: '#10b981' },
                    { label: 'Cancellation Rate',  value: '4.8%',  color: '#ef4444' },
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

        {/* ── Row 3: Revenue Chart + Booking Status + Service Mix ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Bar chart */}
          <motion.div {...fadeUp(0.3)} className="md:col-span-2 xl:col-span-1">
            <Card t={t} className="p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold" style={{ color: t.txt }}>Revenue — Last 7 Days</h3>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: t.txtMuted }}>PHP</span>
              </div>
              <p className="text-[10px] mb-4" style={{ color: t.txtMuted }}>Hover a bar for value</p>

              <div className="flex items-end justify-between gap-1.5" style={{ height: 120 }}>
                {chartBars.map((b, i) => {
                  const heightPct = (b.val / maxVal) * 100;
                  const isMax = b.val === maxVal;
                  return (
                    <div key={b.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <span
                        className="absolute -top-6 text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-1.5 py-0.5 rounded-md"
                        style={{ background: t.inner, color: t.txt, border: t.innerBorder }}>
                        ₱{b.val.toLocaleString()}
                      </span>
                      <motion.div
                        className="w-full rounded-t-lg"
                        style={{
                          background: isMax
                            ? `linear-gradient(180deg,${t.accent},${t.accent}cc)`
                            : t.bar,
                          height: `${heightPct}%`,
                          minHeight: 8,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.07, ease: 'easeOut' }}
                        whileHover={{ background: t.accent }}
                      />
                      <span className="text-[9px] font-bold" style={{ color: t.txtMuted }}>{b.day}</span>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown */}
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
          <motion.div {...fadeUp(0.34)}>
            <Card t={t} className="p-5 h-full">
              <h3 className="text-sm font-bold mb-4" style={{ color: t.txt }}>Appointment Status</h3>

              {/* Stacked bar */}
              <div className="h-6 w-full rounded-xl flex overflow-hidden mb-5"
                style={{ border: t.innerBorder }}>
                {bookingBreakdown.map(b => (
                  <motion.div key={b.label}
                    className="h-full flex items-center justify-center"
                    style={{ width: `${b.pct}%`, background: b.color, minWidth: b.pct > 6 ? 0 : 0 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${b.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}>
                    {b.pct > 8 && (
                      <span className="text-[9px] font-black text-white">{b.pct}%</span>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2.5">
                {bookingBreakdown.map(b => (
                  <div key={b.label} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: t.inner, border: t.innerBorder }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                      <span className="text-[11.5px]" style={{ color: t.txtSub }}>{b.label}</span>
                    </div>
                    <span className="text-[12px] font-black" style={{ color: t.txt }}>
                      {b.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Additional stats */}
              <div className="mt-4 pt-4 grid grid-cols-2 gap-2" style={{ borderTop: `1px solid ${t.divider}` }}>
                {[
                  { label: 'Avg Ticket',     value: '₱850',  color: '#f59e0b' },
                  { label: 'Commissions',    value: '₱12,450', color: '#6366f1' },
                  { label: 'Registered Clients', value: clients, color: '#ec4899' },
                  { label: 'Total Sessions',  value: totalBookings, color: '#10b981' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center"
                    style={{ background: t.inner, border: t.innerBorder }}>
                    <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: t.txtMuted }}>{s.label}</p>
                    <p className="text-sm font-black mt-0.5" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Booking Funnel */}
          <motion.div {...fadeUp(0.38)}>
            <Card t={t} className="p-5 h-full">
              <h3 className="text-sm font-bold mb-4" style={{ color: t.txt }}>Customer Funnel</h3>
              <div className="space-y-3.5">
                {funnelSteps.map((f, i) => (
                  <div key={f.step}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium" style={{ color: t.txtSub }}>{f.step}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black" style={{ color: t.txt }}>{f.count}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{
                            background: i === 0 ? `${t.accent}18` : t.tag,
                            color: i === 0 ? t.accent : t.txtMuted,
                          }}>
                          {f.pct}%
                        </span>
                      </div>
                    </div>
                    <Bar
                      pct={f.pct}
                      color={i < 2 ? '#0a3d30' : i < 4 ? '#bfa15f' : '#10b981'}
                      t={t}
                    />
                  </div>
                ))}
              </div>

              {/* Top performing service */}
              <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                <SectionLabel t={t}>Top Performing</SectionLabel>
                {[
                  { name: 'Swedish Massage', pct: 38, bookings: 412 },
                  { name: 'Deep Tissue',     pct: 24, bookings: 260 },
                  { name: 'Manicure & Pedi', pct: 18, bookings: 195 },
                ].map(s => (
                  <div key={s.name} className="flex items-center gap-2 mb-2 last:mb-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium truncate" style={{ color: t.txtSub }}>{s.name}</span>
                        <span className="text-[10px] font-bold" style={{ color: t.txt }}>{s.bookings}</span>
                      </div>
                      <Bar pct={s.pct} color={t.accent} t={t} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── Row 4: Recent appointments table ── */}
        <motion.div {...fadeUp(0.42)}>
          <Card t={t} className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${t.divider}` }}>
              <h3 className="text-sm font-bold" style={{ color: t.txt }}>Recent Appointments</h3>
              <span className="text-[10px] font-semibold" style={{ color: t.txtMuted }}>Today's schedule</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.divider}` }}>
                    {['Client', 'Service', 'Therapist', 'Time', 'Location', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-wider"
                        style={{ color: t.txtMuted, whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { client: 'Sarah Martinez', service: 'Swedish Massage',   therapist: 'Maria Santos', time: '9:00–10:00 PM', loc: 'Makati',      status: 'In Progress', sc: '#10b981', sb: 'rgba(16,185,129,0.1)' },
                    { client: 'David Lim',      service: 'Swedish & Hilot',   therapist: 'John Doe',     time: '9:15–10:45 PM', loc: 'QC',           status: 'In Progress', sc: '#10b981', sb: 'rgba(16,185,129,0.1)' },
                    { client: 'Patricia Go',    service: 'Mani & Pedi',       therapist: 'Anna Reyes',   time: '9:30–10:30 PM', loc: 'BGC',          status: 'Starting',    sc: '#f59e0b', sb: 'rgba(245,158,11,0.1)' },
                    { client: 'Carlos Reyes',   service: 'Deep Tissue',       therapist: 'Maria Santos', time: '11:00–12:00 AM', loc: 'Pasig',       status: 'Confirmed',   sc: '#6366f1', sb: 'rgba(99,102,241,0.1)' },
                    { client: 'Alicia Santos',  service: 'Post Natal Massage', therapist: 'TBD',         time: '10:00–11:00 AM', loc: 'Mandaluyong', status: 'Pending',     sc: '#f59e0b', sb: 'rgba(245,158,11,0.1)' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${t.divider}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.inner; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
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
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap"
                          style={{ background: row.sb, color: row.sc }}>
                          {row.status}
                        </span>
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
