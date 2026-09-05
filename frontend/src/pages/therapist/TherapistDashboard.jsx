import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../api/axios';
import {
  Briefcase, Star, Clock, MapPin, Calendar,
  CheckCircle, LogOut, TrendingUp, ChevronRight,
  UserCheck, Sparkles, Heart, AlertCircle, Bell, Plus, Check,
  Lock, Phone, User, Hash, Ban, Info, Zap, RefreshCw,
  Search, X, Shield, Award, Edit3, Key, CheckCircle2,
  ChevronDown, Copy, Eye, EyeOff, CheckCheck, Sparkle, Handshake,
} from 'lucide-react';

// ─── Brand & Theme Tokens ──────────────────────────────────────────────────
const B = {
  deep: '#062c22',
  green: '#0a3d30',
  mid: '#0f5c47',
  softGreen: '#ecfdf5',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
  goldDark: '#8c7033',
  ink: '#0f172a',
  inkMuted: '#64748b',
  cream: '#faf8f5',
  cardBg: '#ffffff',
  line: '#e2e8f0',
};

// ─── Reusable ClayCard Component ──────────────────────────────────────────
const ClayCard = ({ children, className = '', style = {}, hoverEffect = false, ...props }) => (
  <motion.div
    whileHover={hoverEffect ? { y: -2, boxShadow: '0 12px 28px rgba(6,44,34,0.09)' } : {}}
    transition={{ duration: 0.2 }}
    className={`rounded-3xl ${className}`}
    style={{
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.02)',
      border: '1px solid #f1ede6',
      ...style,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// ─── Date Formatter Helper ────────────────────────────────────────────────
const formatDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TherapistDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Core data states
  const [data, setData] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'today' | 'confirmed' | 'in_progress' | 'completed'

  // Modal controls
  const [modal, setModal] = useState({ type: null, data: null }); // 'start_session' | 'complete_session' | 'claim_job' | 'profile' | 'logout'
  const [submittingAction, setSubmittingAction] = useState(false);

  // Profile editing form state
  const [profileForm, setProfileForm] = useState({
    phone: '',
    specialty: '',
    notes: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  // Fetch all dashboard and availability data
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [dashRes, availRes] = await Promise.all([
        API.get('/therapist/dashboard'),
        API.get('/therapist/availability'),
      ]);
      setData(dashRes.data);
      setAvailabilities(availRes.data.availabilities || []);

      if (dashRes.data.therapist_profile) {
        setProfileForm((prev) => ({
          ...prev,
          phone: dashRes.data.therapist_profile.phone || '',
          specialty: dashRes.data.therapist_profile.specialty || '',
          notes: dashRes.data.therapist_profile.notes || '',
        }));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error('Could not sync therapist data. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Today's date string
  const todayStr = useMemo(() => formatDateString(new Date()), []);
  const isAvailableToday = useMemo(() => availabilities.includes(todayStr), [availabilities, todayStr]);

  // Generate next 14 days for availability roster
  const next14Days = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const day = new Date();
      day.setDate(today.getDate() + i);
      list.push(day);
    }
    return list;
  }, []);

  // Single date toggle
  const toggleAvailability = async (dateStr) => {
    try {
      const res = await API.post('/therapist/availability/toggle', { date: dateStr });
      if (res.data.available) {
        setAvailabilities((prev) => [...prev, dateStr]);
        toast.success(`Marked ON DUTY for ${dateStr}`);
      } else {
        setAvailabilities((prev) => prev.filter((d) => d !== dateStr));
        toast.info(`Marked OFF DUTY for ${dateStr}`);
      }
      // Silently refresh jobs list that depend on availability
      const r = await API.get('/therapist/dashboard');
      setData(r.data);
    } catch (e) {
      toast.error("Could not update availability schedule.");
    }
  };

  // Batch toggle next 7 days
  const handleBatchAvailability = async (makeAvailable = true) => {
    setSubmittingAction(true);
    try {
      const next7 = next14Days.slice(0, 7).map(d => formatDateString(d));
      for (const d of next7) {
        const hasIt = availabilities.includes(d);
        if (makeAvailable && !hasIt) {
          await API.post('/therapist/availability/toggle', { date: d });
        } else if (!makeAvailable && hasIt) {
          await API.post('/therapist/availability/toggle', { date: d });
        }
      }
      toast.success(makeAvailable ? 'Marked entire upcoming week ON DUTY!' : 'Cleared upcoming week availability.');
      await fetchDashboardData(true);
    } catch {
      toast.error('Batch availability update failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Status update handler (In Progress / Completed)
  const confirmStatusUpdate = async () => {
    if (!modal.data?.id || !modal.data?.newStatus) return;
    setSubmittingAction(true);
    try {
      const res = await API.post(`/therapist/appointments/${modal.data.id}/status`, {
        status: modal.data.newStatus,
      });
      if (modal.data.newStatus === 'Completed') {
        toast.sparkle(res.data?.message || 'Treatment completed! Session logged.');
      } else {
        toast.success(res.data?.message || 'Session started! Timer active.');
      }
      setModal({ type: null, data: null });
      fetchDashboardData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update session status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Claim job order
  const confirmClaimJob = async () => {
    if (!modal.data?.id) return;
    setSubmittingAction(true);
    try {
      const res = await API.post(`/therapist/appointments/${modal.data.id}/claim`);
      toast.sparkle(res.data?.message || 'Job claimed successfully! Added to your schedule.');
      setModal({ type: null, data: null });
      fetchDashboardData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'This job is no longer available.');
      setModal({ type: null, data: null });
      fetchDashboardData(true);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Update profile details & password
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});

    // Basic password confirmation check
    if (profileForm.new_password && profileForm.new_password.length < 8) {
      setProfileErrors({ new_password: 'New password must be at least 8 characters.' });
      return;
    }
    if (profileForm.new_password && profileForm.new_password !== profileForm.new_password_confirmation) {
      setProfileErrors({ new_password_confirmation: 'Password confirmation does not match.' });
      return;
    }

    setSubmittingAction(true);
    try {
      const payload = {
        phone: profileForm.phone,
        specialty: profileForm.specialty,
        notes: profileForm.notes,
      };
      if (profileForm.new_password) {
        payload.current_password = profileForm.current_password;
        payload.new_password = profileForm.new_password;
        payload.new_password_confirmation = profileForm.new_password_confirmation;
      }

      const res = await API.post('/therapist/profile', payload);
      toast.success(res.data?.message || 'Profile updated successfully!');
      setModal({ type: null, data: null });
      setProfileForm(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      }));
      fetchDashboardData(true);
    } catch (err) {
      if (err.response?.data?.errors) {
        const errs = {};
        Object.keys(err.response.data.errors).forEach(k => {
          errs[k] = err.response.data.errors[k][0];
        });
        setProfileErrors(errs);
      }
      toast.error(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Logout handler
  const confirmLogout = async () => {
    setSubmittingAction(true);
    try {
      await logout();
      toast.info('Signed out successfully.');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  // Copy phone helper
  const copyToClipboard = (text, label = 'Phone number') => {
    navigator.clipboard.writeText(text);
    toast.info(`${label} copied to clipboard!`);
  };

  // Filtered appointments computation
  const appointments = data?.appointments || [];
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // Tab filter
      const apptDate = appt.datetime ? appt.datetime.split(' ')[0] : '';
      if (activeTab === 'today' && apptDate !== todayStr) return false;
      if (activeTab === 'confirmed' && appt.status !== 'Confirmed') return false;
      if (activeTab === 'in_progress' && appt.status !== 'In Progress') return false;
      if (activeTab === 'completed' && appt.status !== 'Completed' && appt.status !== 'Completed by Therapist') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const clientMatch = appt.client_name?.toLowerCase().includes(q);
        const serviceMatch = appt.service?.toLowerCase().includes(q);
        const idMatch = String(appt.id).includes(q);
        return clientMatch || serviceMatch || idMatch;
      }
      return true;
    });
  }, [appointments, activeTab, searchQuery, todayStr]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: appointments.length,
      today: appointments.filter(a => (a.datetime || '').split(' ')[0] === todayStr).length,
      confirmed: appointments.filter(a => a.status === 'Confirmed').length,
      in_progress: appointments.filter(a => a.status === 'In Progress').length,
      completed: appointments.filter(a => a.status === 'Completed' || a.status === 'Completed by Therapist').length,
    };
  }, [appointments, todayStr]);

  const stats = data?.therapist_stats;
  const profile = data?.therapist_profile;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ LUXURY TOP NAVIGATION BAR ══════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(6, 44, 34, 0.08)',
        }}
      >
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <img
              src="/cb-logo.jpg"
              alt="Cozy Blissful Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-emerald-950/10"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                isAvailableToday ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 tracking-tight text-base leading-tight">
                Cozy Blissful
              </span>
              <span
                className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase"
                style={{ background: 'rgba(191,161,95,0.15)', color: B.goldDark, border: '1px solid rgba(191,161,95,0.3)' }}
              >
                Therapist Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Spa &amp; Salon Specialist Workstation</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2.5">
          {/* Real-time Duty status badge (Visible on all devices) */}
          <button
            onClick={() => toggleAvailability(todayStr)}
            title="Click to toggle today's availability"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer border"
            style={
              isAvailableToday
                ? { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#047857' }
                : { background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#b45309' }
            }
          >
            <span className={`w-2 h-2 rounded-full ${isAvailableToday ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isAvailableToday ? 'On Duty' : 'Off Duty'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing}
            aria-label="Refresh Dashboard Data"
            title="Sync latest sessions & jobs"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-800 transition-colors border border-slate-200 bg-white shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-800' : ''}`} />
          </button>

          {/* Profile & Settings Button */}
          <button
            onClick={() => setModal({ type: 'profile', data: null })}
            title="Therapist Profile & Password"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors border border-slate-200 bg-white shadow-xs cursor-pointer"
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-white"
              style={{ background: `linear-gradient(135deg, ${B.mid}, ${B.deep})` }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <span className="hidden sm:inline font-semibold">{user?.name?.split(' ')[0] || 'Profile'}</span>
            <Edit3 className="w-3 h-3 text-slate-400" />
          </button>

          {/* Logout Button */}
          <button
            onClick={() => setModal({ type: 'logout', data: null })}
            title="Sign Out"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors border border-slate-200 bg-white shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══ MAIN CONTENT WORKSPACE ═════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">

        {/* ── HERO BANNER ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 sm:p-8 relative overflow-hidden text-white"
          style={{
            background: `linear-gradient(135deg, ${B.deep} 0%, ${B.green} 60%, ${B.mid} 100%)`,
            boxShadow: '0 16px 36px rgba(6,44,34,0.18)',
          }}
        >
          {/* Subtle ambient decorative shapes */}
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
            <Sparkles className="w-72 h-72 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-emerald-200 border border-white/15">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Welcome back, {user?.name || 'Therapist'} 🌿
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Your dedicated specialist workstation. Review assigned clients, manage your real-time session progress, and claim open appointment job orders.
              </p>
            </div>

            {/* Quick Duty Control Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/70">Today&apos;s Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isAvailableToday ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span className="font-extrabold text-sm sm:text-base">
                    {isAvailableToday ? 'Ready for Bookings' : 'Marked Off Duty'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleAvailability(todayStr)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                style={
                  isAvailableToday
                    ? { background: 'rgba(255,255,255,0.95)', color: B.deep }
                    : { background: `linear-gradient(135deg, ${B.goldLight}, ${B.gold})`, color: B.deep }
                }
              >
                {isAvailableToday ? 'Mark Off Duty' : 'Go On Duty Today'}
              </button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="py-24">
            <LoadingSpinner fullPage={false} message="Loading your sessions and roster..." />
          </div>
        ) : (
          <>
            {/* ── 4 KEY METRICS CARDS ────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {[
                {
                  icon: Calendar,
                  label: 'Assigned Sessions',
                  value: stats?.my_appointments ?? 0,
                  sub: 'Active bookings in queue',
                  accent: B.deep,
                  bgGlow: 'rgba(6,44,34,0.06)',
                },
                {
                  icon: CheckCircle2,
                  label: 'Completed Sessions',
                  value: stats?.completed_sessions ?? 0,
                  sub: 'Treatments concluded',
                  accent: '#10b981',
                  bgGlow: 'rgba(16,185,129,0.08)',
                },
                {
                  icon: Star,
                  label: 'Client Satisfaction',
                  value: `${stats?.rating ?? '4.9'} ★`,
                  sub: 'Overall rating score',
                  accent: '#d97706',
                  bgGlow: 'rgba(217,119,6,0.08)',
                },
                {
                  icon: TrendingUp,
                  label: 'Service Hours',
                  value: `${stats?.hours_worked ?? 0} hrs`,
                  sub: 'Logged treatment time',
                  accent: B.goldDark,
                  bgGlow: 'rgba(191,161,95,0.1)',
                },
              ].map((m, idx) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.35 }}
                >
                  <ClayCard className="p-4 sm:p-5 flex flex-col justify-between h-full" hoverEffect>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {m.label}
                      </span>
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: m.bgGlow }}
                      >
                        <m.icon className="w-5 h-5" style={{ color: m.accent }} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{m.value}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.sub}</p>
                    </div>
                  </ClayCard>
                </motion.div>
              ))}
            </div>

            {/* ── TWO COLUMN WORKSPACE (SESSIONS vs SCHEDULER & JOBS) ───── */}
            <div className="grid lg:grid-cols-12 gap-7">

              {/* LEFT COLUMN: APPOINTMENTS QUEUE (7 of 12) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Header with Search and Filter Tabs */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,44,34,0.08)' }}>
                        <Calendar className="w-4 h-4 text-emerald-900" />
                      </div>
                      <h2 className="text-base font-black text-slate-800 tracking-tight">
                        My Treatment Sessions
                      </h2>
                    </div>

                    {/* Live Search input */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search client, service, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition shadow-xs"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'all', label: 'All', count: tabCounts.all },
                      { id: 'today', label: 'Today', count: tabCounts.today },
                      { id: 'in_progress', label: 'In Progress', count: tabCounts.in_progress },
                      { id: 'confirmed', label: 'Confirmed', count: tabCounts.confirmed },
                      { id: 'completed', label: 'Completed', count: tabCounts.completed },
                    ].map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-emerald-900 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* List of Sessions */}
                {filteredAppointments.length === 0 ? (
                  <ClayCard className="p-10 text-center space-y-3">
                    <div
                      className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
                      style={{ background: 'rgba(6,44,34,0.06)' }}
                    >
                      <UserCheck className="w-8 h-8 text-emerald-800" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">No Sessions Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {searchQuery
                        ? `No sessions matching "${searchQuery}". Try clearing your search.`
                        : activeTab === 'today'
                        ? "You have no sessions scheduled for today. Check your upcoming availability or look at Available Job Orders on the right."
                        : "No appointments found under this filter."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition"
                      >
                        Clear Search
                      </button>
                    )}
                  </ClayCard>
                ) : (
                  <div className="space-y-3.5">
                    {filteredAppointments.map((appt, i) => {
                      const isInProgress = appt.status === 'In Progress';
                      const isConfirmed = appt.status === 'Confirmed';
                      const isAwaitingAdmin = appt.status === 'Completed by Therapist';
                      const isCompleted = appt.status === 'Completed';

                      return (
                        <motion.div
                          key={appt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <ClayCard
                            className="p-5 space-y-4 border transition-all duration-200"
                            style={
                              isInProgress
                                ? { borderColor: 'rgba(2,132,199,0.4)', background: '#f0f9ff' }
                                : isAwaitingAdmin
                                ? { borderColor: 'rgba(245,158,11,0.4)', background: '#fffdfa' }
                                : {}
                            }
                          >
                            {/* Card Top: Service name, price, status badge */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                                    {appt.service}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                    #{String(appt.id).padStart(5, '0')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {appt.duration || 60} mins
                                  </span>
                                  {appt.price > 0 && (
                                    <span className="font-bold text-emerald-800">
                                      ₱{Number(appt.price).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span
                                className="text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 border whitespace-nowrap shrink-0"
                                style={
                                  isInProgress
                                    ? { background: 'rgba(2,132,199,0.12)', color: '#0369a1', borderColor: 'rgba(2,132,199,0.3)' }
                                    : isConfirmed
                                    ? { background: 'rgba(6,44,34,0.08)', color: B.deep, borderColor: 'rgba(6,44,34,0.2)' }
                                    : isAwaitingAdmin
                                    ? { background: 'rgba(245,158,11,0.14)', color: '#b45309', borderColor: 'rgba(245,158,11,0.35)' }
                                    : isCompleted
                                    ? { background: 'rgba(16,185,129,0.1)', color: '#047857', borderColor: 'rgba(16,185,129,0.25)' }
                                    : { background: 'rgba(191,161,95,0.12)', color: B.goldDark, borderColor: 'rgba(191,161,95,0.3)' }
                                }
                              >
                                {isInProgress ? (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                                    In Progress
                                  </>
                                ) : isConfirmed ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Confirmed
                                  </>
                                ) : isAwaitingAdmin ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                    Awaiting Admin Confirmation
                                  </>
                                ) : isCompleted ? (
                                  <>
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {appt.status}
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Client & Time Detail Box */}
                            <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/70 space-y-2.5 text-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-900 text-white font-bold text-xs">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Client</p>
                                    <p className="font-extrabold text-slate-800 text-sm leading-tight">
                                      {appt.client_name}
                                    </p>
                                  </div>
                                </div>

                                {/* Phone Link & Copy */}
                                {appt.client_phone && appt.client_phone !== 'Not provided' && (
                                  <div className="flex items-center gap-2 pl-10 sm:pl-0">
                                    <a
                                      href={`tel:${appt.client_phone}`}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-700 transition"
                                      title="Call Client"
                                    >
                                      <Phone className="w-3 h-3 text-emerald-700" />
                                      <span>{appt.client_phone}</span>
                                    </a>
                                    <button
                                      onClick={() => copyToClipboard(appt.client_phone, 'Client phone')}
                                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                                      title="Copy phone"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-[11px] sm:text-xs">
                                  {new Date(appt.datetime).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </span>
                              </div>

                              {appt.notes && (
                                <div className="rounded-xl px-3 py-2 text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/60 italic flex items-start gap-2">
                                  <span className="shrink-0 font-bold not-italic">📝 Client Note:</span>
                                  <span>{appt.notes}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Row */}
                            {isConfirmed && (
                              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Client has arrived / Ready for session?
                                </span>
                                <button
                                  onClick={() =>
                                    setModal({
                                      type: 'start_session',
                                      data: { id: appt.id, client_name: appt.client_name, service: appt.service, newStatus: 'In Progress' },
                                    })
                                  }
                                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
                                  style={{
                                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                                  }}
                                >
                                  <Zap className="w-3.5 h-3.5 text-sky-200" />
                                  <span>Start Session</span>
                                </button>
                              </div>
                            )}

                            {isInProgress && (
                              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-sky-50 border border-sky-200">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                                  <span className="text-xs font-black text-sky-900">
                                    Treatment in progress… Provide high quality care.
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    setModal({
                                      type: 'complete_session',
                                      data: { id: appt.id, client_name: appt.client_name, service: appt.service, newStatus: 'Completed by Therapist' },
                                    })
                                  }
                                  className="px-4 py-2 rounded-xl text-xs font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                                  style={{
                                    background: `linear-gradient(135deg, ${B.deep}, ${B.mid})`,
                                  }}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>Complete Treatment</span>
                                </button>
                              </div>
                            )}

                            {isAwaitingAdmin && (
                              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                                  <span className="text-xs font-bold text-amber-900">
                                    Treatment concluded. Sent to Admin Booking queue for final sign-off &amp; history archival.
                                  </span>
                                </div>
                                <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300/60 whitespace-nowrap self-start sm:self-auto">
                                  Pending Admin Sign-off
                                </span>
                              </div>
                            )}

                            {isCompleted && (
                              <div className="pt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                                <CheckCheck className="w-4 h-4 text-emerald-600" />
                                <span>Treatment confirmed by Admin &amp; archived in system history.</span>
                              </div>
                            )}

                            {/* Standard Policy notice */}
                            {!isCompleted && !isAwaitingAdmin && (
                              <div className="flex items-start gap-2 rounded-xl px-3 py-2 bg-red-50/60 border border-red-100 text-[10px] text-red-700/90 leading-relaxed">
                                <Lock className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Notice:</strong> Therapists cannot cancel or reschedule appointments directly. In case of an emergency, immediately inform your Front Desk / Administrator.
                                </span>
                              </div>
                            )}
                          </ClayCard>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: AVAILABILITY CALENDAR & OPEN JOB ORDERS (5 of 12) */}
              <div className="lg:col-span-5 space-y-6">

                {/* 1. AVAILABILITY ROSTER SCHEDULER */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(191,161,95,0.15)' }}>
                        <Calendar className="w-4 h-4" style={{ color: B.goldDark }} />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-800 tracking-tight">
                          14-Day Duty Calendar
                        </h2>
                        <p className="text-[11px] text-slate-400">Declare when you are open to take clients</p>
                      </div>
                    </div>
                  </div>

                  <ClayCard className="p-5 space-y-4">
                    {/* Batch Shortcuts */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500">Quick Shift Actions:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleBatchAvailability(true)}
                          disabled={submittingAction}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200 cursor-pointer disabled:opacity-50"
                        >
                          Mark Next 7 Days On
                        </button>
                        <button
                          onClick={() => handleBatchAvailability(false)}
                          disabled={submittingAction}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition border border-slate-200 cursor-pointer disabled:opacity-50"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* 14-Day Grid (7 cols x 2 rows) */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                      {next14Days.map((day) => {
                        const dateStr = formatDateString(day);
                        const isAvailable = availabilities.includes(dateStr);
                        const dayNum = day.getDate();
                        const weekday = day.toLocaleDateString('en-US', { weekday: 'narrow' });
                        const isToday = dateStr === todayStr;

                        return (
                          <button
                            key={dateStr}
                            onClick={() => toggleAvailability(dateStr)}
                            title={`${dateStr} - Click to toggle ${isAvailable ? 'Off Duty' : 'On Duty'}`}
                            className="p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer relative"
                            style={
                              isAvailable
                                ? {
                                    background: `linear-gradient(135deg, ${B.deep}, ${B.mid})`,
                                    color: '#ffffff',
                                    boxShadow: '0 4px 12px rgba(6,44,34,0.22)',
                                  }
                                : {
                                    background: '#f8fafc',
                                    color: '#64748b',
                                    border: '1px solid #e2e8f0',
                                  }
                            }
                          >
                            {isToday && (
                              <span
                                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white"
                                title="Today"
                              />
                            )}
                            <span className="text-[9px] font-black uppercase opacity-75">{weekday}</span>
                            <span className="text-xs sm:text-sm font-black mt-0.5">{dayNum}</span>
                            <div className="mt-1 h-3 flex items-center justify-center">
                              {isAvailable ? (
                                <Check className="w-3 h-3 text-emerald-300" />
                              ) : (
                                <span className="text-[8px] opacity-40 font-mono">-</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-md" style={{ background: B.deep }} />
                        <span>On Duty (Available)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-md bg-slate-200 border border-slate-300" />
                        <span>Off Duty (Rest Day)</span>
                      </span>
                    </div>
                  </ClayCard>
                </div>

                {/* 2. OPEN JOB ORDERS / UNASSIGNED APPOINTMENTS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-100 text-sky-800">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-800 tracking-tight">
                          Open Job Orders
                        </h2>
                        <p className="text-[11px] text-slate-400">Available client bookings matching your roster</p>
                      </div>
                    </div>
                    {data?.available_jobs?.length > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono">
                        {data.available_jobs.length} open
                      </span>
                    )}
                  </div>

                  {data?.available_jobs?.length === 0 ? (
                    <ClayCard className="p-6 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-600">No Open Job Orders Right Now</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                        When clients book without a specialist preference on dates you are on duty, orders appear here for you to claim!
                      </p>
                    </ClayCard>
                  ) : (
                    <div className="space-y-3">
                      {data?.available_jobs?.map((job) => (
                        <ClayCard key={job.id} className="p-4 space-y-3 border border-sky-100 hover:border-sky-300 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm leading-snug">{job.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Client: {job.client_name}</p>
                            </div>
                            <span
                              className="text-xs font-black px-2.5 py-1 rounded-full border shrink-0"
                              style={{
                                background: 'rgba(16,185,129,0.08)',
                                color: '#047857',
                                borderColor: 'rgba(16,185,129,0.2)',
                              }}
                            >
                              {job.compensation}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(job.datetime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {job.location}
                            </span>
                          </div>

                          {job.description && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                              &ldquo;{job.description}&rdquo;
                            </p>
                          )}

                          <button
                            onClick={() =>
                              setModal({
                                type: 'claim_job',
                                data: { id: job.id, title: job.title, compensation: job.compensation, datetime: job.datetime },
                              })
                            }
                            className="w-full py-2 rounded-xl text-xs font-extrabold text-white transition-all duration-200 hover:scale-[1.01] active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                            style={{
                              background: `linear-gradient(135deg, ${B.deep}, ${B.mid})`,
                            }}
                          >
                            <Handshake className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Claim This Job Order</span>
                          </button>
                        </ClayCard>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. THERAPIST SPECIALIST BADGE & TIPS */}
                <ClayCard
                  className="p-5 text-white relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${B.deep} 0%, ${B.green} 100%)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <Award className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                        Specialist Profile
                      </p>
                      <p className="font-extrabold text-sm text-white">
                        {profile?.specialty || 'Massage & Wellness Specialist'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-100/80 mt-3 leading-relaxed">
                    Always maintain 10-minute sanitation buffers between sessions. Need to modify your specialty focus or phone number?
                  </p>
                  <button
                    onClick={() => setModal({ type: 'profile', data: null })}
                    className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Specialist Details</span>
                  </button>
                </ClayCard>

              </div>
            </div>
          </>
        )}
      </main>

      {/* ═══ CONFIRMATION & PROFILE MODALS ══════════════════════════════════ */}
      <AnimatePresence>
        {modal.type && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92vh] flex flex-col"
            >
              {/* Close icon button */}
              <button
                onClick={() => !submittingAction && setModal({ type: null, data: null })}
                disabled={submittingAction}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ── MODAL: START SESSION ── */}
              {modal.type === 'start_session' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 mx-auto">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Start Treatment Session</h3>
                    <p className="text-xs text-slate-500">
                      You are about to begin treatment for <strong className="text-slate-800">{modal.data?.client_name}</strong> ({modal.data?.service}).
                    </p>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-2xl text-xs text-sky-900 space-y-1 border border-sky-100">
                    <p className="font-bold">Session timer will start:</p>
                    <p className="text-[11px] text-sky-800">
                      The booking status will change to <strong>In Progress</strong> and reception will be notified.
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setModal({ type: null, data: null })}
                      disabled={submittingAction}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmStatusUpdate}
                      disabled={submittingAction}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      {submittingAction ? 'Starting...' : 'Confirm & Start'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODAL: COMPLETE SESSION ── */}
              {modal.type === 'complete_session' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Conclude Treatment</h3>
                    <p className="text-xs text-slate-500">
                      Has the treatment for <strong className="text-slate-800">{modal.data?.client_name}</strong> completed?
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-900 border border-emerald-100">
                    <p className="font-bold">Next steps:</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      The session will be marked <strong>Completed by Therapist</strong> and automatically appear in Admin Bookings for final verification and archival to History.
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setModal({ type: null, data: null })}
                      disabled={submittingAction}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmStatusUpdate}
                      disabled={submittingAction}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      {submittingAction ? 'Completing...' : 'Yes, Complete Treatment'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODAL: CLAIM JOB ORDER ── */}
              {modal.type === 'claim_job' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 mx-auto">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Claim This Job Order</h3>
                    <p className="text-xs text-slate-500">
                      Accept assignment for <strong className="text-slate-800">{modal.data?.title}</strong>.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 border border-slate-200/70 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Compensation:</span>
                      <span className="font-bold text-emerald-800">{modal.data?.compensation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scheduled:</span>
                      <span className="font-medium text-slate-700">
                        {modal.data?.datetime && new Date(modal.data.datetime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setModal({ type: null, data: null })}
                      disabled={submittingAction}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmClaimJob}
                      disabled={submittingAction}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-950 transition cursor-pointer shadow-md"
                    >
                      {submittingAction ? 'Claiming...' : 'Confirm Acceptance'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODAL: LOGOUT CONFIRMATION ── */}
              {modal.type === 'logout' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Sign Out of Portal?</h3>
                    <p className="text-xs text-slate-500">
                      Are you sure you want to end your current therapist workstation session?
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setModal({ type: null, data: null })}
                      disabled={submittingAction}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmLogout}
                      disabled={submittingAction}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer shadow-md"
                    >
                      {submittingAction ? 'Signing out...' : 'Yes, Sign Out'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODAL: PROFILE & SETTINGS ── */}
              {modal.type === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-bold text-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Therapist Profile &amp; Security</h3>
                      <p className="text-[11px] text-slate-400">Update your contact details &amp; password</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs max-h-[65vh] overflow-y-auto pr-1">
                    {/* Phone input */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. 0917-123-4567"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      />
                      {profileErrors.phone && <p className="text-[11px] text-red-600 mt-0.5">{profileErrors.phone}</p>}
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Specialties &amp; Expertise</label>
                      <input
                        type="text"
                        placeholder="e.g. Swedish, Deep Tissue, Shiatsu, Ventosa"
                        value={profileForm.specialty}
                        onChange={(e) => setProfileForm(p => ({ ...p, specialty: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      />
                      {profileErrors.specialty && <p className="text-[11px] text-red-600 mt-0.5">{profileErrors.specialty}</p>}
                    </div>

                    {/* Bio / Notes */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bio / Notes to Reception</label>
                      <textarea
                        rows={2}
                        placeholder="Any personal certifications, preferences, or shift notes..."
                        value={profileForm.notes}
                        onChange={(e) => setProfileForm(p => ({ ...p, notes: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    {/* Password change divider */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>Change Password (Optional)</span>
                      </p>

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Current Password</label>
                          <div className="relative">
                            <input
                              type={showCurrentPw ? 'text' : 'password'}
                              placeholder="Enter current password"
                              value={profileForm.current_password}
                              onChange={(e) => setProfileForm(p => ({ ...p, current_password: e.target.value }))}
                              className="w-full px-3.5 py-2 pr-9 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          {profileErrors.current_password && (
                            <p className="text-[11px] text-red-600 mt-0.5">{profileErrors.current_password}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-0.5">New Password</label>
                          <div className="relative">
                            <input
                              type={showNewPw ? 'text' : 'password'}
                              placeholder="At least 8 characters"
                              value={profileForm.new_password}
                              onChange={(e) => setProfileForm(p => ({ ...p, new_password: e.target.value }))}
                              className="w-full px-3.5 py-2 pr-9 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          {profileErrors.new_password && (
                            <p className="text-[11px] text-red-600 mt-0.5">{profileErrors.new_password}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="Re-enter new password"
                            value={profileForm.new_password_confirmation}
                            onChange={(e) => setProfileForm(p => ({ ...p, new_password_confirmation: e.target.value }))}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-700"
                          />
                          {profileErrors.new_password_confirmation && (
                            <p className="text-[11px] text-red-600 mt-0.5">{profileErrors.new_password_confirmation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModal({ type: null, data: null })}
                      disabled={submittingAction}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAction}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-950 transition cursor-pointer shadow-md"
                    >
                      {submittingAction ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ LUXURY FOOTER ══════════════════════════════════════════════════ */}
      <footer className="py-6 px-4 text-center border-t border-slate-200/60 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Cozy Blissful Spa &amp; Salon Management System • Professional Specialist Portal</p>
      </footer>
    </div>
  );
};

export default TherapistDashboard;
