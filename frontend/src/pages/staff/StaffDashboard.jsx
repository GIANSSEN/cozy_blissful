import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import StaffLayout from './StaffLayout';
import {
  ImageTextSkeletonGrid
} from '../../components/Skeleton';
import {
  Users, Calendar, Clock, CheckCircle, Activity,
  UserCheck, Check, RefreshCw, CalendarDays
} from 'lucide-react';

/* ── Design tokens ───────────────────────────────────────────────── */
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

const formatDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [therapistsWithAvail, setTherapistsWithAvail] = useState([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const indexRes = await API.get('/staff/dashboard');
      setData(indexRes.data);

      const therapistsRes = await API.get('/staff/therapists');
      const list = therapistsRes.data.therapists || [];
      setTherapistsWithAvail(list);
      if (list.length > 0 && !selectedTherapistId) setSelectedTherapistId(list[0].id);
    } catch (e) {
      console.error('Staff dashboard fetch error:', e);
      showToast('Error loading portal data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const toggleTherapistAvailability = async (therapistId, dateStr) => {
    try {
      const res = await API.post('/staff/availability/toggle', { therapist_id: therapistId, date: dateStr });
      setTherapistsWithAvail(prev => prev.map(t => {
        if (t.id === therapistId) {
          const updatedAvail = res.data.available
            ? [...t.availabilities, dateStr]
            : t.availabilities.filter(d => d !== dateStr);
          return { ...t, availabilities: updatedAvail };
        }
        return t;
      }));
      fetchDashboardData(true);
      showToast(res.data.message || 'Schedule updated successfully.');
    } catch {
      showToast('Failed to update therapist schedule.');
    }
  };

  const getNextDays = () => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(today.getDate() + i);
      list.push(day);
    }
    return list;
  };

  const nextDays = getNextDays();
  const selectedTherapist = therapistsWithAvail.find(t => t.id === Number(selectedTherapistId));
  const stats = data?.stats;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <StaffLayout title="Dashboard" subtitle="Coordinator Overview">
      <div className="space-y-8">
        {/* ── Portal Greeting ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {greeting}, {user?.name?.split(' ')[0] || 'Coordinator'} 🌿
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage therapist schedules, view daily stats, and track client appointments
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
              boxShadow: '4px 4px 10px #ddd8cf, -4px -4px 10px #ffffff',
              color: '#374151',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>

        {loading ? (
          <ImageTextSkeletonGrid cols="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users,       label: 'Total Therapists',   value: stats?.total_therapists,   accent: '#062c22' },
                { icon: Activity,    label: 'Available Today',    value: stats?.available_today,    accent: '#bfa15f' },
                { icon: Clock,       label: 'Pending Bookings',   value: stats?.pending_bookings,   accent: '#d97706' },
                { icon: CheckCircle, label: 'Confirmed Bookings', value: stats?.confirmed_bookings, accent: '#16a34a' },
              ].map(({ icon: Icon, label, value, accent }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}>
                  <ClayCard className="p-5 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${accent}12` }}>
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
                      <p className="text-2xl font-black text-slate-800">{value ?? '0'}</p>
                    </div>
                  </ClayCard>
                </motion.div>
              ))}
            </div>

            {/* ── Main panel ── */}
            <div className="grid lg:grid-cols-5 gap-6">

              {/* Schedule Coordinator + Daily Directory */}
              <div className="lg:col-span-3 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-emerald-800" /> Therapist Schedule Coordinator
                  </h3>
                  <ClayCard className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400">
                        Select Therapist to Edit Schedule
                      </label>
                      <select value={selectedTherapistId} onChange={e => setSelectedTherapistId(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        style={{ boxShadow: 'inset 2px 2px 5px #ece8e0, inset -2px -2px 5px #ffffff' }}>
                        {therapistsWithAvail.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                        ))}
                      </select>
                    </div>

                    {selectedTherapist && (
                      <motion.div key={selectedTherapist.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="space-y-4">
                        <p className="text-xs text-slate-500">
                          Coordinating schedule for <strong className="text-slate-800">{selectedTherapist.name}</strong>.
                          Tap dates to toggle availability.
                        </p>
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {nextDays.map((day) => {
                            const dateStr = formatDateString(day);
                            const isAvailable = selectedTherapist.availabilities?.includes(dateStr);
                            return (
                              <button key={dateStr}
                                onClick={() => toggleTherapistAvailability(selectedTherapist.id, dateStr)}
                                className="p-2.5 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                                style={isAvailable
                                  ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '4px 4px 10px rgba(6,44,34,0.25)' }
                                  : { background: 'linear-gradient(135deg,#fdfcfa,#ece8e0)', color: '#64748b', boxShadow: 'inset 2px 2px 5px #e0dbd3, inset -2px -2px 5px #ffffff' }
                                }>
                                <span className="text-[9px] font-semibold opacity-80 uppercase">
                                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-sm font-black mt-0.5">{day.getDate()}</span>
                                {isAvailable && <Check className="w-3.5 h-3.5 mt-1 text-emerald-300" />}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </ClayCard>
                </div>

                {/* Daily Workload Directory */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-800" /> Daily Workload Directory
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data?.therapists?.map(t => (
                      <ClayCard key={t.id} className="p-4 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{t.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.email}</p>
                        </div>
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 select-none flex-shrink-0"
                          style={t.available_today
                            ? { background: 'rgba(22,163,74,0.06)', color: '#16a34a', borderColor: 'rgba(22,163,74,0.15)' }
                            : { background: 'rgba(239,68,68,0.06)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.15)' }
                          }>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.available_today ? 'bg-green-500' : 'bg-red-500'}`} />
                          {t.available_today ? 'Available Today' : 'Off Duty'}
                        </span>
                      </ClayCard>
                    ))}
                  </div>
                </div>
              </div>

              {/* Today's Appointment Feed */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-800" /> Today's Session Feed
                </h3>
                {data?.appointments?.length === 0 ? (
                  <ClayCard className="p-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">No bookings today</p>
                    <p className="text-xs text-slate-400 mt-1">No client bookings are scheduled for today's shift.</p>
                  </ClayCard>
                ) : (
                  <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {data?.appointments?.map((appt, i) => (
                      <motion.div key={appt.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}>
                        <ClayCard className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-xs truncate">{appt.service}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Client: <span className="font-semibold text-slate-700">{appt.client}</span></p>
                              <p className="text-[10px] text-slate-500">Staff: <span className="font-semibold text-slate-700">{appt.therapist}</span></p>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
                              style={appt.status === 'Confirmed'
                                ? { background: 'rgba(22,163,74,0.06)', color: '#16a34a', borderColor: 'rgba(22,163,74,0.15)' }
                                : { background: 'rgba(245,158,11,0.06)', color: '#d97706', borderColor: 'rgba(245,158,11,0.15)' }
                              }>
                              {appt.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(appt.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {appt.notes && (
                            <p className="text-[9px] text-slate-400 italic bg-slate-50 rounded-lg p-2 mt-1 border border-slate-100">
                              📝 {appt.notes}
                            </p>
                          )}
                        </ClayCard>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-xl flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 8px 24px rgba(6,44,34,0.25)', whiteSpace: 'nowrap' }}>
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </StaffLayout>
  );
};

export default StaffDashboard;
