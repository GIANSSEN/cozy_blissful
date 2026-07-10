import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import {
  CheckCircle2, Circle, ArrowUpRight, TrendingUp,
  TrendingDown, ChevronRight, X, CreditCard,
  Calendar, DollarSign, Users, Sparkles,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

const cardIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: 'easeOut' },
  }),
};

/** Puffy claymorphic card wrapper */
const ClayCard = ({ children, className = '', style = {}, ...props }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
      boxShadow: '20px 20px 40px #eae6df, -20px -20px 40px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
      border: '1px solid rgba(255,255,255,0.8)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

/** Clay toggle pill for filters */
const ClayPill = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
    style={
      active
        ? {
            background: 'linear-gradient(135deg,#062c22,#0f5040)',
            color: '#fff',
            boxShadow: '4px 4px 10px rgba(6,44,34,0.3), -2px -2px 6px rgba(255,255,255,0.8)',
          }
        : {
            background: 'linear-gradient(135deg,#fdfcfa,#f0ece4)',
            color: '#6b7280',
            boxShadow: '3px 3px 8px #ddd8cf, -3px -3px 8px #ffffff',
            border: '1px solid rgba(0,0,0,0.04)',
          }
    }
  >
    {children}
  </button>
);

/** Inline mini stat */
const MiniStat = ({ label, value, sub, icon: Icon, color, delay }) => (
  <motion.div
    custom={delay}
    variants={cardIn}
    initial="hidden"
    animate="visible"
    className="flex items-center gap-3 px-5 py-4 rounded-2xl"
    style={{
      background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
      boxShadow: '8px 8px 20px #eae6df, -8px -8px 20px #ffffff',
    }}
  >
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{
        background: `${color}15`,
        boxShadow: `inset 3px 3px 6px rgba(0,0,0,0.05), inset -3px -3px 6px rgba(255,255,255,0.8)`,
      }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
      <p className="text-base font-bold text-slate-800 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

// ── Component ──────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeFilter, setActiveFilter] = useState('today');
  const [showPanel, setShowPanel]     = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const setupSteps = [
    { label: 'Get approved to accept payments', badge: 'Required', done: false,
      desc: 'Verify your identity to start taking payments with Cozy Blissful.' },
    { label: 'Set up Appointments', badge: null, done: true, desc: null },
  ];

  const filters = [
    { key: 'today',   label: 'Sep 23'     },
    { key: 'prior',   label: 'vs Prior day' },
    { key: 'closed',  label: 'Checks Closed' },
  ];

  const quickStats = data
    ? [
        { icon: DollarSign, label: 'Net Sales',        value: `₱${data.stats.total_revenue.toLocaleString()}`,     color: '#062c22', delay: 0 },
        { icon: Calendar,   label: 'Total Bookings',   value: data.stats.total_bookings,                            color: '#bfa15f', delay: 1 },
        { icon: Users,      label: 'Active Therapists',value: data.stats.active_therapists,                         color: '#7c3aed', delay: 2 },
        { icon: TrendingUp, label: 'Registered Clients',value: data.stats.registered_clients,                       color: '#db2777', delay: 3 },
      ]
    : [];

  return (
    <AdminLayout title="Home">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{ border: '3px solid #f0ece4', borderTopColor: '#062c22' }}
          />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ══════════════════════════════════════════════════════
              SETUP BANNER — Deep Emerald Clay
          ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="overflow-hidden"
            style={{
              borderRadius: '28px',
              background: 'linear-gradient(135deg,#062c22 0%,#0a3d30 60%,#0f5040 100%)',
              boxShadow: '12px 12px 32px rgba(6,44,34,0.3), -6px -6px 16px rgba(255,255,255,0.08), inset 2px 2px 6px rgba(255,255,255,0.06)',
            }}
          >
            {/* Banner header */}
            <div className="px-8 pt-7 pb-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Get set up to check out clients
              </h2>
            </div>

            {/* Steps */}
            {setupSteps.map((step, i) => (
              <div
                key={step.label}
                className="px-8 py-4 flex items-center justify-between gap-6"
                style={{
                  borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                  opacity: step.done ? 0.5 : 1,
                }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {step.done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    : <Circle className="w-5 h-5 text-emerald-300/50 flex-shrink-0 mt-0.5" />
                  }
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{step.label}</span>
                      {step.badge && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(191,161,95,0.25)', color: '#e3cc97', border: '1px solid rgba(191,161,95,0.3)' }}
                        >
                          {step.badge}
                        </span>
                      )}
                    </div>
                    {step.desc && (
                      <p className="text-xs text-emerald-200/60 mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
                {!step.done && (
                  <button
                    className="flex-shrink-0 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg,#4f97ff,#1e6bff)',
                      color: '#fff',
                      boxShadow: '6px 6px 14px rgba(30,107,255,0.35), -3px -3px 8px rgba(255,255,255,0.08), inset 1px 1px 3px rgba(255,255,255,0.2)',
                    }}
                  >
                    Start
                  </button>
                )}
                {step.done && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </motion.div>

          {/* ══════════════════════════════════════════════════════
              QUICK STATS ROW
          ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((s) => (
              <MiniStat key={s.label} {...s} />
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════
              PERFORMANCE + RIGHT PANEL
          ═══════════════════════════════════════════════════════ */}
          <div className="flex gap-5 items-start">

            {/* ── Performance Card ─────────────────────────── */}
            <ClayCard className="flex-1 p-7">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Performance</h3>
                <Link
                  to="/admin/reports"
                  className="text-xs font-semibold flex items-center gap-1 transition hover:gap-2"
                  style={{ color: '#062c22' }}
                >
                  View Reports <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 mb-7">
                {filters.map((f) => (
                  <ClayPill
                    key={f.key}
                    active={activeFilter === f.key}
                    onClick={() => setActiveFilter(f.key)}
                  >
                    {f.key === 'today' && <span className="text-[10px] text-slate-400 font-medium mr-0.5">Date</span>}
                    {f.label}
                  </ClayPill>
                ))}
              </div>

              {/* Net Sales */}
              <div className="mb-6">
                <p className="text-xs text-slate-400 font-medium mb-1">Net sales</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-slate-800 tracking-tight">₱0.00</span>
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: '#f3ede4', color: '#9ca3af', boxShadow: 'inset 2px 2px 5px #e5e0d8, inset -2px -2px 5px #ffffff' }}
                  >
                    <TrendingDown className="w-3 h-3" /> N/A
                  </span>
                </div>
              </div>

              {/* Empty chart area */}
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  height: '140px',
                  background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)',
                  boxShadow: 'inset 4px 4px 10px #e0dbd3, inset -4px -4px 10px #ffffff',
                }}
              >
                {/* Faint grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between px-4 py-3 pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }} />
                  ))}
                </div>
                {/* No data message */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-slate-400 font-medium">No data available for selected timeframe</p>
                </div>
                {/* Bottom time bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-2"
                  style={{ fontSize: '10px', color: '#9ca3af' }}
                >
                  {['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full" style={{ background: '#062c22' }} />
                  <span className="text-[11px] text-slate-500">Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full" style={{ background: '#bfa15f' }} />
                  <span className="text-[11px] text-slate-500">Prior period</span>
                </div>
              </div>

              {/* Recent Appointments */}
              {data?.recent_appointments?.length > 0 && (
                <div className="mt-7 pt-6 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Appointments</p>
                  <div className="space-y-2">
                    {data.recent_appointments.slice(0, 5).map((appt) => (
                      <div
                        key={appt.id}
                        className="flex items-center justify-between px-4 py-3 rounded-2xl transition hover:scale-[1.01]"
                        style={{
                          background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
                          boxShadow: '4px 4px 10px #e5e0d8, -4px -4px 10px #ffffff',
                        }}
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{appt.service}</p>
                          <p className="text-[11px] text-slate-400">{appt.client_name} · {appt.datetime}</p>
                        </div>
                        <span
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={
                            appt.status === 'Confirmed'
                              ? { background: 'rgba(6,44,34,0.08)', color: '#062c22' }
                              : { background: 'rgba(191,161,95,0.12)', color: '#a08742' }
                          }
                        >
                          {appt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ClayCard>

            {/* ── Right Quick Panel ─────────────────────────── */}
            {showPanel && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  width: '220px',
                  flexShrink: 0,
                  borderRadius: '28px',
                  background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
                  boxShadow: '20px 20px 40px #eae6df, -20px -20px 40px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  overflow: 'hidden',
                }}
              >
                {/* Panel header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-3">
                  <p className="text-sm font-bold text-slate-700 leading-snug">
                    Get paid right from your calendar.
                  </p>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-slate-300 hover:text-slate-500 transition ml-2 flex-shrink-0 mt-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body copy */}
                <div className="px-5 pb-4">
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    Use your mobile device or the Cozy Blissful app to accept all kinds of cards and contactless payments.
                  </p>
                </div>

                {/* CTA button */}
                <div className="px-5 pb-4">
                  <button
                    className="w-full py-2.5 px-4 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg,#fdfcfa,#ece8e0)',
                      color: '#062c22',
                      boxShadow: '6px 6px 12px #d1cac0, -6px -6px 12px #ffffff, inset 2px 2px 4px rgba(255,255,255,0.5)',
                      border: '1px solid rgba(191,161,95,0.2)',
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" style={{ color: '#bfa15f' }} />
                      Take a payment
                    </span>
                  </button>
                </div>

                {/* Image placeholder */}
                <div
                  className="mx-5 mb-5 rounded-2xl overflow-hidden relative"
                  style={{
                    height: '130px',
                    background: 'linear-gradient(135deg,#0a3d30,#166f57)',
                    boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Spa checkout illustration */}
                  <img
                    src="/therapist-hero.jpg"
                    alt="Spa checkout"
                    className="w-full h-full object-cover object-top opacity-70"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top,rgba(6,44,34,0.6) 0%,transparent 60%)' }}
                  />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-[10px] font-bold text-white">Cozy Blissful</p>
                    <p className="text-[9px] text-emerald-300">Home Service Spa</p>
                  </div>
                </div>

                {/* Extra quick links */}
                <div
                  className="border-t px-5 py-4 space-y-2"
                  style={{ borderColor: 'rgba(0,0,0,0.05)' }}
                >
                  {[
                    { icon: Calendar,  label: 'View Appointments', path: '/admin/appointments' },
                    { icon: Sparkles,  label: 'Manage Services',   path: '/admin/services'     },
                    { icon: DollarSign,label: 'Payment Log',       path: '/admin/payments'     },
                  ].map(({ icon: Icon, label, path }) => (
                    <Link
                      key={label}
                      to={path}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: '#bfa15f' }} />
                        <span className="text-[12px] font-medium text-slate-600 group-hover:text-emerald-900 transition">{label}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-700 transition" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
