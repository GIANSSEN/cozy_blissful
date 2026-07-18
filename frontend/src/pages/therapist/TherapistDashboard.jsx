import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../api/axios';
import {
  Briefcase, Star, Clock, MapPin, Calendar,
  CheckCircle, LogOut, TrendingUp, ChevronRight,
  UserCheck, Sparkles, Heart, AlertCircle, Bell, Plus, Check
} from 'lucide-react';

// ─── Design system helpers ──────────────────────────────────────────────────

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

// Helper to format date string to YYYY-MM-DD
const formatDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TherapistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchDashboardData = () => {
    API.get('/therapist/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => console.error("Dashboard error:", e));

    API.get('/therapist/availability')
      .then((r) => setAvailabilities(r.data.availabilities || []))
      .catch((e) => console.error("Availability error:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleApply = (jobId, jobTitle) => {
    if (appliedJobs.includes(jobId)) return;
    setAppliedJobs((prev) => [...prev, jobId]);
    showToast(`Applied for "${jobTitle}"!`);
  };

  const toggleAvailability = async (dateStr) => {
    try {
      const res = await API.post('/therapist/availability/toggle', { date: dateStr });
      if (res.data.available) {
        setAvailabilities((prev) => [...prev, dateStr]);
        showToast(`Available marked on ${dateStr}`);
      } else {
        setAvailabilities((prev) => prev.filter((d) => d !== dateStr));
        showToast(`Availability removed for ${dateStr}`);
      }
      
      // Refresh available jobs based on newly toggled availability
      const r = await API.get('/therapist/dashboard');
      setData(r.data);
    } catch (e) {
      showToast("Could not update availability.");
    }
  };

  // Generate next 7 days for the schedule toggler
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
  const stats = data?.therapist_stats;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      {/* ═══ HEADER ═════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(250,248,245,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center space-x-3">
          <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <span className="font-bold text-slate-800 tracking-wide block text-sm leading-tight">Cozy Blissful</span>
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#bfa15f' }}>Therapist Portal</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-700">{user?.name || 'Therapist'}</p>
            <p className="text-[10px] text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition duration-200"
            style={{
              background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
              boxShadow: '3px 3px 8px #ddd8cf, -3px -3px 8px #ffffff',
            }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══ MAIN ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">

        {/* Page intro */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Therapist'} 🌿
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Declare your availability calendar, check assigned sessions, and accept matching job orders</p>
        </motion.div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* ── STATS ROW ─────────────────────────── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Calendar,    label: 'My Appointments',    value: stats?.my_appointments,   accent: '#062c22' },
                { icon: CheckCircle, label: 'Completed Sessions',  value: stats?.completed_sessions, accent: '#bfa15f' },
                { icon: Star,        label: 'Client Rating',       value: stats?.rating,             accent: '#d97706' },
                { icon: TrendingUp,  label: 'Hours Worked',        value: stats?.hours_worked,       accent: '#0a3d30' },
              ].map(({ icon: Icon, label, value, accent }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <ClayCard className="p-5 flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${accent}12` }}
                    >
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

            {/* ── TWO COLUMN LAYOUT ─────────────────── */}
            <div className="grid lg:grid-cols-5 gap-6">

              {/* LEFT: Upcoming Appointments (3/5 width) */}
              <div className="lg:col-span-3 space-y-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-800" /> Upcoming Sessions
                </h2>

                {data?.appointments?.length === 0 ? (
                  <ClayCard className="p-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">No sessions scheduled</p>
                    <p className="text-xs text-slate-400 mt-1">Make yourself available on the calendar to get assigned to clients!</p>
                  </ClayCard>
                ) : (
                  <div className="space-y-3">
                    {data?.appointments?.map((appt, i) => (
                      <motion.div
                        key={appt.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 + 0.2 }}
                      >
                        <ClayCard className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: appt.status === 'Confirmed' ? '#062c2210' : '#bfa15f15' }}
                              >
                                <UserCheck className="w-5 h-5" style={{ color: appt.status === 'Confirmed' ? '#062c22' : '#bfa15f' }} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800 text-sm leading-snug">{appt.service}</p>
                                <p className="text-xs text-slate-400">Client: <span className="font-semibold text-slate-600">{appt.client_name}</span></p>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{appt.datetime}</span>
                                </div>
                                {appt.notes && (
                                  <p className="text-[10px] text-slate-400 italic bg-slate-50 rounded-lg px-2.5 py-1 mt-1 border border-slate-100">📝 {appt.notes}</p>
                                )}
                              </div>
                            </div>

                            <span
                              className="text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border whitespace-nowrap flex-shrink-0"
                              style={
                                appt.status === 'Confirmed'
                                  ? { background: 'rgba(6,44,34,0.06)', color: '#062c22', borderColor: 'rgba(6,44,34,0.15)' }
                                  : { background: 'rgba(191,161,95,0.1)', color: '#a08742', borderColor: 'rgba(191,161,95,0.2)' }
                              }
                            >
                              {appt.status === 'Confirmed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {appt.status}
                            </span>
                          </div>
                        </ClayCard>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Calendar Availability + Available Jobs (2/5 width) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Availability Calendar */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-800" /> My Availability Calendar
                  </h2>
                  
                  <ClayCard className="p-5 space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tap dates to toggle your availability. Clients and Administrator can see when you are available to work.
                    </p>
                    
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {nextDays.map((day) => {
                        const dateStr = formatDateString(day);
                        const isAvailable = availabilities.includes(dateStr);
                        const dayNum = day.getDate();
                        const weekday = day.toLocaleDateString('en-US', { weekday: 'short' });
                        
                        return (
                          <button
                            key={dateStr}
                            onClick={() => toggleAvailability(dateStr)}
                            className="p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                            style={
                              isAvailable
                                ? {
                                    background: 'linear-gradient(135deg, #062c22, #0a3d30)',
                                    color: '#fff',
                                    boxShadow: '4px 4px 10px rgba(6,44,34,0.25)',
                                  }
                                : {
                                    background: 'linear-gradient(135deg, #fdfcfa, #ece8e0)',
                                    color: '#64748b',
                                    boxShadow: 'inset 2px 2px 5px #e0dbd3, inset -2px -2px 5px #ffffff',
                                  }
                            }
                          >
                            <span className="text-[9px] font-semibold opacity-80 uppercase">{weekday}</span>
                            <span className="text-sm font-black mt-0.5">{dayNum}</span>
                            {isAvailable && <Check className="w-3 h-3 mt-1 text-emerald-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </ClayCard>
                </div>

                {/* 2. Available Jobs */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-800" /> Available Job Orders
                  </h2>

                  {data?.available_jobs?.length === 0 ? (
                    <ClayCard className="p-6 text-center">
                      <p className="text-slate-400 text-xs">No pending orders matching your availability dates.</p>
                    </ClayCard>
                  ) : (
                    <div className="space-y-3">
                      {data?.available_jobs?.map((job, i) => {
                        const applied = appliedJobs.includes(job.id);
                        return (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 + 0.2 }}
                          >
                            <ClayCard className="p-5 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-bold text-slate-800 text-sm leading-snug">{job.title}</p>
                                <span
                                  className="text-[11px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap flex-shrink-0"
                                  style={{ background: 'rgba(6,44,34,0.06)', color: '#062c22', borderColor: 'rgba(6,44,34,0.15)' }}
                                >
                                  {job.compensation}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{job.description}</p>
                              <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.datetime}</span>
                              </div>
                              <button
                                onClick={() => handleApply(job.id, job.title)}
                                disabled={applied}
                                className="w-full py-2.5 text-xs font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={
                                  applied
                                    ? { background: 'linear-gradient(135deg,#bfa15f,#d4b87a)', color: '#fff', boxShadow: '0 4px 12px rgba(191,161,95,0.2)' }
                                    : { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '0 4px 12px rgba(6,44,34,0.18)' }
                                }
                              >
                                {applied ? '✓ Applied!' : 'Apply for this Job'}
                              </button>
                            </ClayCard>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── PERFORMANCE BANNER ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ClayCard
                className="p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg,#062c22 0%,#0a3d30 55%,#0f5040 100%)',
                  boxShadow: '12px 12px 32px rgba(6,44,34,0.22), -6px -6px 16px rgba(255,255,255,0.06)',
                }}
              >
                <div className="absolute right-0 top-0 opacity-[0.07] pointer-events-none translate-x-8 -translate-y-8">
                  <Sparkles className="w-48 h-48 text-white" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-emerald-300/70 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-current" /> Top Performer
                    </p>
                    <h3 className="text-white font-black text-lg">You are among our top-rated therapists! 🎉</h3>
                    <p className="text-emerald-200/70 text-xs mt-1">Keep it up and earn a <span className="text-amber-300 font-bold">Gold Specialist Badge</span> next month.</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <p className="text-2xl font-black text-white">{stats?.rating}</p>
                      <p className="text-[9px] text-emerald-300/70 font-semibold uppercase tracking-widest">Rating</p>
                    </div>
                    <div className="text-center px-5 py-3 rounded-2xl" style={{ background: 'rgba(191,161,95,0.15)', border: '1px solid rgba(191,161,95,0.2)' }}>
                      <p className="text-2xl font-black" style={{ color: '#bfa15f' }}>{stats?.completed_sessions}</p>
                      <p className="text-[9px] text-emerald-300/70 font-semibold uppercase tracking-widest">Sessions</p>
                    </div>
                  </div>
                </div>
              </ClayCard>
            </motion.div>
          </>
        )}
      </main>

      {/* ═══ TOAST NOTIFICATION ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg,#062c22,#0f5040)',
              boxShadow: '0 8px 24px rgba(6,44,34,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TherapistDashboard;
