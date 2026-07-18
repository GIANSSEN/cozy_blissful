import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import StaffLayout from './StaffLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Clock, UserCheck, Calendar, CheckCircle, AlertCircle, Search, RefreshCw } from 'lucide-react';

const ClayCard = ({ children, className = '', style = {}, ...props }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
      boxShadow: '16px 16px 32px #eae6df, -16px -16px 32px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
      border: '1px solid rgba(255,255,255,0.8)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const STATUS_STYLES = {
  Confirmed: { bg: 'rgba(22,163,74,0.06)', color: '#16a34a', border: 'rgba(22,163,74,0.15)' },
  Pending:   { bg: 'rgba(245,158,11,0.06)', color: '#d97706', border: 'rgba(245,158,11,0.15)' },
  Cancelled: { bg: 'rgba(239,68,68,0.06)', color: '#ef4444', border: 'rgba(239,68,68,0.15)' },
  Completed: { bg: 'rgba(99,102,241,0.06)', color: '#6366f1', border: 'rgba(99,102,241,0.15)' },
};

const TABS = [
  { id: 'today',    label: "Today's Appointments", icon: Clock },
  { id: 'upcoming', label: 'Upcoming Sessions',     icon: UserCheck },
];

const StaffAppointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'today';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const endpoint = activeTab === 'today' ? '/staff/appointments?filter=today' : '/staff/appointments?filter=upcoming';
      const res = await API.get(endpoint);
      setAppointments(res.data.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAppointments(); }, [activeTab]);

  const filtered = appointments.filter(a => {
    const q = search.toLowerCase();
    return !q ||
      a.client?.toLowerCase().includes(q) ||
      a.service?.toLowerCase().includes(q) ||
      a.therapist?.toLowerCase().includes(q);
  });

  const getStatusStyle = (status) =>
    STATUS_STYLES[status] || STATUS_STYLES['Pending'];

  return (
    <StaffLayout
      title="Bookings Overview"
      subtitle={TABS.find(t => t.id === activeTab)?.label}
    >
      <div className="space-y-6">
        {/* Tab switcher + Search */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 p-1 rounded-2xl"
            style={{ background: 'linear-gradient(145deg,#eae6df,#f5f0e8)', boxShadow: 'inset 3px 3px 8px #d5d0c9, inset -3px -3px 8px #ffffff' }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id}
                  onClick={() => { setSearchParams({ tab: tab.id }); setSearch(''); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={active
                    ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '4px 4px 10px rgba(6,44,34,0.25)' }
                    : { background: 'transparent', color: '#64748b' }
                  }>
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
            <button onClick={() => loadAppointments(true)} disabled={refreshing}
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'transparent', color: '#94a3b8' }}
              title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search client, service..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              style={{ background: '#faf9f6', boxShadow: 'inset 2px 2px 5px #ece8e0, inset -2px -2px 5px #ffffff' }}
            />
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', count: appointments.length,                                  color: '#062c22', bg: 'rgba(6,44,34,0.06)' },
            { label: 'Confirmed', count: appointments.filter(a => a.status === 'Confirmed').length, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
            { label: 'Pending', count: appointments.filter(a => a.status === 'Pending').length,   color: '#d97706', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Cancelled', count: appointments.filter(a => a.status === 'Cancelled').length, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          ].map(s => (
            <ClayCard key={s.label} className="p-4 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <span className="text-lg font-black" style={{ color: s.color }}>{s.count}</span>
            </ClayCard>
          ))}
        </div>

        {/* Appointment List */}
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <ClayCard className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-emerald-700" />
            </div>
            <p className="font-bold text-slate-700 text-sm">No appointments found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? 'Try a different search term.' : activeTab === 'today' ? 'No sessions scheduled for today.' : 'No upcoming sessions found.'}
            </p>
          </ClayCard>
        ) : (
          <div className="grid gap-4">
            {filtered.map((appt, i) => {
              const statusStyle = getStatusStyle(appt.status);
              return (
                <motion.div key={appt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <ClayCard className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Client & service info */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#bfa15f,#d4b87a)', boxShadow: '2px 2px 8px rgba(191,161,95,0.25)' }}>
                          {appt.client?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{appt.service}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">{appt.client}</span>
                            {appt.therapist && <span className="text-slate-400"> · with {appt.therapist}</span>}
                          </p>
                          {appt.notes && (
                            <p className="text-[10px] text-slate-400 italic mt-1 max-w-sm truncate">📝 {appt.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Time + Status */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 justify-end">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(appt.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(appt.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap"
                          style={{ background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}>
                          {appt.status === 'Confirmed' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                          {appt.status === 'Cancelled' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  </ClayCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffAppointments;
