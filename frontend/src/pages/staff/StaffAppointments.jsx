import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import StaffLayout from './StaffLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import {
  Clock, UserCheck, Calendar, CheckCircle, AlertCircle,
  Search, RefreshCw, UserPlus, ChevronDown, ChevronUp,
  Tag, Zap, FileText, X, Check,
} from 'lucide-react';

// ─── ClayCard ─────────────────────────────────────────────────────────────────

const ClayCard = ({ children, className = '', style = {}, ...props }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`rounded-3xl ${className}`}
      style={{
        background: isDark ? 'linear-gradient(145deg, #182030 0%, #121824 100%)' : 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
        boxShadow: isDark ? '8px 8px 24px rgba(0,0,0,0.4), -4px -4px 16px rgba(255,255,255,0.02)' : '16px 16px 32px #eae6df, -16px -16px 32px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.8)',
        color: isDark ? '#e2e8f3' : '#1e293b',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Confirmed: { bg: 'rgba(22,163,74,0.12)',  color: '#22c55e', border: 'rgba(22,163,74,0.25)'  },
  Pending:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  Cancelled: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
  Completed: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
};

const TABS = [
  { id: 'today',    label: "Today's Appointments", icon: Clock },
  { id: 'upcoming', label: 'Upcoming Sessions',     icon: UserCheck },
  { id: 'all',      label: 'All',                   icon: Calendar },
];

// ─── Appointment Card ─────────────────────────────────────────────────────────

const AppointmentCard = ({ appt, therapists, onAssign, onStatus, isDark, index }) => {
  const [expanded, setExpanded] = useState(false);
  const ss = STATUS_STYLES[appt.status] || STATUS_STYLES.Pending;

  const dt = new Date(appt.datetime);
  const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <ClayCard className="overflow-hidden">
        {/* Main row */}
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Client + service info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#bfa15f,#d4b87a)', boxShadow: '2px 2px 8px rgba(191,161,95,0.25)' }}>
                {appt.client?.charAt(0) || 'C'}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm truncate">{appt.service}</p>
                <p className="text-xs opacity-75 mt-0.5">
                  <span className="font-semibold">{appt.client}</span>
                  {appt.therapist && <span className="opacity-70"> · with {appt.therapist}</span>}
                </p>
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {appt.service_duration && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ background: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)', color: '#f59e0b' }}>
                      <Clock className="w-2.5 h-2.5" /> {appt.service_duration} min
                    </span>
                  )}
                  {appt.service_price && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: isDark ? 'rgba(6,44,34,0.3)' : 'rgba(6,44,34,0.06)', color: isDark ? '#34d399' : '#065f46' }}>
                      ₱{appt.service_price}
                    </span>
                  )}
                  {appt.notes && (
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}>
                      <FileText className="w-2.5 h-2.5" /> Has notes
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Therapist selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <UserPlus className="w-3.5 h-3.5 opacity-50" />
                <select
                  value={appt.therapist_id || ''}
                  onChange={(e) => onAssign(appt.id, e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border text-xs outline-none cursor-pointer"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                    color: isDark ? '#e2e8f3' : '#1e293b',
                  }}
                >
                  <option value="" style={{ color: '#000' }}>Unassigned</option>
                  {therapists.map((th) => (
                    <option key={th.id} value={th.id} style={{ color: '#000' }}>{th.name}</option>
                  ))}
                </select>
              </div>

              {/* Status selector */}
              <select
                value={appt.status}
                onChange={(e) => onStatus(appt.id, e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold border outline-none cursor-pointer"
                style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}
              >
                <option value="Pending"   style={{ color: '#000' }}>Pending</option>
                <option value="Confirmed" style={{ color: '#000' }}>Confirmed</option>
                <option value="Completed" style={{ color: '#000' }}>Completed</option>
                <option value="Cancelled" style={{ color: '#000' }}>Cancelled</option>
              </select>

              {/* Time */}
              <div className="text-right pl-2 hidden sm:block">
                <p className="text-xs font-bold flex items-center gap-1.5 justify-end">
                  <Clock className="w-3.5 h-3.5 opacity-50" /> {timeStr}
                </p>
                <p className="text-[10px] opacity-60 mt-0.5">{dateStr}</p>
              </div>

              {/* Expand toggle */}
              <button
                onClick={() => setExpanded((e) => !e)}
                className="p-1.5 rounded-xl transition"
                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                title={expanded ? 'Collapse' : 'Expand details'}
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5 opacity-50" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded detail section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-5 pb-5 pt-1 border-t"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                <div className="grid sm:grid-cols-3 gap-4 mt-3">
                  {/* Service details */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Service Details</p>
                    <p className="text-xs font-black">{appt.service}</p>
                    <div className="flex items-center gap-2">
                      {appt.service_duration && (
                        <span className="text-[10px] font-semibold flex items-center gap-1 opacity-70">
                          <Clock className="w-3 h-3" /> {appt.service_duration} min
                        </span>
                      )}
                      {appt.service_price && (
                        <span className="text-[10px] font-bold" style={{ color: isDark ? '#34d399' : '#065f46' }}>₱{appt.service_price}</span>
                      )}
                    </div>
                  </div>

                  {/* Appointment timing */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Scheduled</p>
                    <p className="text-xs font-black">{dateStr}</p>
                    <p className="text-xs opacity-70">{timeStr}
                      {appt.service_duration && <span className="ml-1 text-[10px]">→ ~{
                        (() => {
                          const end = new Date(appt.datetime);
                          end.setMinutes(end.getMinutes() + appt.service_duration);
                          return end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        })()
                      }</span>}
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Client Notes</p>
                    {appt.notes
                      ? <p className="text-xs opacity-80 leading-relaxed italic">{appt.notes}</p>
                      : <p className="text-[10px] opacity-40 italic">No special requests</p>}
                  </div>
                </div>

                {/* Quick action row */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                  <button
                    onClick={() => onStatus(appt.id, 'Confirmed')}
                    disabled={appt.status === 'Confirmed'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}
                  >
                    <Check className="w-3 h-3" /> Mark Confirmed
                  </button>
                  <button
                    onClick={() => onStatus(appt.id, 'Completed')}
                    disabled={appt.status === 'Completed'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    <CheckCircle className="w-3 h-3" /> Mark Completed
                  </button>
                  <button
                    onClick={() => onStatus(appt.id, 'Cancelled')}
                    disabled={appt.status === 'Cancelled'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ClayCard>
    </motion.div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const StaffAppointments = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'today';

  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const loadAppointments = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const filterMap = { today: 'today', upcoming: 'upcoming', all: 'all' };
      const filter = filterMap[activeTab] || 'today';
      const [apptsRes, thRes] = await Promise.all([
        API.get(`/staff/appointments?filter=${filter}`),
        API.get('/staff/therapists').catch(() => ({ data: { therapists: [] } })),
      ]);
      setAppointments(apptsRes.data.appointments || []);
      setTherapists(thRes.data.therapists || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAppointments(); }, [activeTab]);

  const handleAssignTherapist = async (apptId, therapistId) => {
    try {
      const res = await API.post(`/staff/appointments/${apptId}/assign`, { therapist_id: therapistId || null });
      showToast(res.data.message || 'Therapist updated.');
      loadAppointments(true);
    } catch {
      showToast('Failed to assign therapist.');
    }
  };

  const handleStatusChange = async (apptId, status) => {
    try {
      const res = await API.post(`/staff/appointments/${apptId}/status`, { status });
      showToast(res.data.message || 'Status updated.');
      loadAppointments(true);
    } catch {
      showToast('Failed to update status.');
    }
  };

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.client?.toLowerCase().includes(q) || a.service?.toLowerCase().includes(q) || a.therapist?.toLowerCase().includes(q);
  });

  const countByStatus = (s) => appointments.filter((a) => a.status === s).length;

  return (
    <StaffLayout title="Bookings Overview" subtitle={TABS.find((t) => t.id === activeTab)?.label}>
      <div className="space-y-6">

        {/* Toast */}
        {toastMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
            {toastMsg}
          </div>
        )}

        {/* Tab switcher + Search */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 p-1 rounded-2xl"
            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'linear-gradient(145deg,#eae6df,#f5f0e8)', boxShadow: isDark ? 'none' : 'inset 3px 3px 8px #d5d0c9, inset -3px -3px 8px #ffffff' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id}
                  onClick={() => { setSearchParams({ tab: tab.id }); setSearch(''); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={active
                    ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '4px 4px 10px rgba(6,44,34,0.25)' }
                    : { background: 'transparent', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
            <button onClick={() => loadAppointments(true)} disabled={refreshing}
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'transparent', color: isDark ? '#64748b' : '#94a3b8' }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, service, therapist…"
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#faf9f6', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', color: isDark ? '#e2e8f3' : '#1e293b' }}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',     count: appointments.length,     color: isDark ? '#34d399' : '#062c22' },
            { label: 'Confirmed', count: countByStatus('Confirmed'), color: '#22c55e' },
            { label: 'Pending',   count: countByStatus('Pending'),   color: '#f59e0b' },
            { label: 'Cancelled', count: countByStatus('Cancelled'), color: '#ef4444' },
          ].map((s) => (
            <ClayCard key={s.label} className="p-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.label}</p>
              <span className="text-lg font-black" style={{ color: s.color }}>{s.count}</span>
            </ClayCard>
          ))}
        </div>

        {/* Appointment list */}
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <ClayCard className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-bold text-sm">No appointments found</p>
            <p className="text-xs opacity-60 mt-1">
              {search ? 'Try a different search term.' : activeTab === 'today' ? 'No sessions scheduled for today.' : 'No sessions found.'}
            </p>
          </ClayCard>
        ) : (
          <div className="grid gap-4">
            {filtered.map((appt, i) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                therapists={therapists}
                onAssign={handleAssignTherapist}
                onStatus={handleStatusChange}
                isDark={isDark}
                index={i}
              />
            ))}
          </div>
        )}

      </div>
    </StaffLayout>
  );
};

export default StaffAppointments;
