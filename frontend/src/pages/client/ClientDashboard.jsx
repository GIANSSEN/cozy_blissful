import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  LogOut, Heart, Plus, ChevronRight, MessageSquare,
  Sparkles, Award, Gift, Send, UserCheck, Star, X
} from 'lucide-react';

// ─── Design system helper ──────────────────────────────────────────────────

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

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [booking, setBooking] = useState({ service: '', therapist: '', datetime: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Simple toast helper
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Therapist chat simulation state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'therapist', text: "Hello! I am preparing the massage table and oils. I will arrive at your home around 2:00 PM." },
    { sender: 'client', text: "Thank you! Please bring the Lavender scent if available." },
    { sender: 'therapist', text: "Of course! I have pre-packed Lavender and Chamomile for your Swedish massage. See you shortly!" }
  ]);

  const fetchDashboardData = () => {
    API.get('/booking/dashboard')
      .then((r) => {
        setData(r.data);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/booking/store', booking);
      setSuccessMsg(res.data.message);
      setShowForm(false);
      
      // Re-fetch dashboard data to sync state with database
      fetchDashboardData();
      
      setBooking({ service: '', therapist: '', datetime: '', notes: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      showToast('Could not save booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'client', text: chatInput }]);
    setChatInput('');
    // Auto simulated response
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: 'therapist', text: "Understood! I am on my way now. See you soon!" }]);
    }, 1500);
  };

  // Determine Loyalty stamps based on number of confirmed bookings
  const completedCount = data?.bookings?.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length || 0;
  const stamps = Math.min(completedCount + 3, 10); // Start with 3 default loyalty stamps to make it look active

  // Get active assigned therapist from latest confirmed booking
  const latestConfirmedBooking = data?.bookings?.find(b => b.status === 'Confirmed' && b.therapist_name !== 'Awaiting Assignment');
  const assignedTherapistName = latestConfirmedBooking ? latestConfirmedBooking.therapist_name : null;

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
            <span className="text-[10px] text-gold-700 font-semibold tracking-widest uppercase" style={{ color: '#bfa15f' }}>Client Portal</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-700">{user?.name || 'Client'}</p>
            <p className="text-[10px] text-slate-400">{user?.email || 'client@example.com'}</p>
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

      {/* ═══ MAIN CONTAINER ════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Guest'} ✨</h1>
            <p className="text-xs text-slate-400 mt-0.5">Track your therapist, manage loyalty rewards, and book a new massage</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 py-3 px-6 text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#062c22 0%,#0f5040 100%)',
              boxShadow: '0 6px 18px rgba(6,44,34,0.25)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Book a Session</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl flex items-center space-x-3 text-sm text-emerald-900"
            style={{
              background: 'rgba(6,44,34,0.06)',
              border: '1px solid rgba(6,44,34,0.15)'
            }}
          >
            <CheckCircle className="w-5 h-5 text-emerald-800 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </motion.div>
        )}

        {/* Dynamic Booking Form overlay */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-6"
            >
              <ClayCard className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-800">Book A Treatment</h2>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleBook} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Treatment</label>
                      <select
                        required
                        value={booking.service}
                        onChange={(e) => setBooking({ ...booking, service: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl text-sm text-slate-700 bg-transparent outline-none border border-transparent"
                        style={{
                          background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)',
                          boxShadow: 'inset 3px 3px 6px #e0dbd3, inset -3px -3px 6px #ffffff',
                        }}
                      >
                        <option value="">Choose service…</option>
                        {data?.available_services?.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} – ₱{s.price || 'Call for price'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Therapist (Optional)</label>
                      <select
                        value={booking.therapist}
                        onChange={(e) => setBooking({ ...booking, therapist: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl text-sm text-slate-700 bg-transparent outline-none border border-transparent"
                        style={{
                          background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)',
                          boxShadow: 'inset 3px 3px 6px #e0dbd3, inset -3px -3px 6px #ffffff',
                        }}
                      >
                        <option value="">No preference (Admin will choose)</option>
                        {data?.available_therapists?.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={booking.datetime}
                        onChange={(e) => setBooking({ ...booking, datetime: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl text-sm text-slate-700 bg-transparent outline-none border border-transparent"
                        style={{
                          background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)',
                          boxShadow: 'inset 3px 3px 6px #e0dbd3, inset -3px -3px 6px #ffffff',
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Special Requests / Preferences</label>
                    <textarea
                      placeholder="e.g. Bring lavender scent oils, target lower back tension, preferred massage pressure..."
                      value={booking.notes}
                      onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl text-sm text-slate-700 bg-transparent outline-none border border-transparent h-20 resize-none"
                      style={{
                        background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)',
                        boxShadow: 'inset 3px 3px 6px #e0dbd3, inset -3px -3px 6px #ffffff',
                      }}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition">Cancel</button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-white font-bold rounded-2xl text-xs transition duration-200"
                      style={{
                        background: 'linear-gradient(135deg,#062c22 0%,#0a3d30 100%)',
                        boxShadow: '4px 4px 10px rgba(6,44,34,0.2)'
                      }}
                    >
                      {submitting ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                  </div>
                </form>
              </ClayCard>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #f0ece4', borderTopColor: '#062c22' }} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ══════════════════════════════════════════════════════
                COLUMN 1 & 2: LOYALTY, REWARDS & BOOKINGS
            ═══════════════════════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-6">

              {/* ── LOYALTY CARD ─────────────────────────── */}
              <ClayCard className="p-6 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 60%, #0f5040 100%)',
                boxShadow: '12px 12px 32px rgba(6,44,34,0.25), -6px -6px 16px rgba(255,255,255,0.08)'
              }}>
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
                  <Award className="w-48 h-48 text-emerald-200" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-bold text-base tracking-tight flex items-center gap-1.5">
                      <Award className="w-4.5 h-4.5 text-gold-500 fill-gold-500" /> Cozy Loyalty Club
                    </h2>
                    <p className="text-[10px] text-emerald-200/70 mt-0.5">Collect 10 stamps, get your next 60-min Swedish Massage FREE!</p>
                  </div>
                  <span className="text-[11px] font-bold text-gold-400 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                    {stamps} / 10 Stamps
                  </span>
                </div>

                {/* Stamp visual matrix */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 my-5">
                  {[...Array(10)].map((_, i) => {
                    const isStamped = i < stamps;
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-2xl flex items-center justify-center relative transition duration-300"
                        style={{
                          background: isStamped ? 'linear-gradient(135deg,#bfa15f,#d4b87a)' : 'rgba(255,255,255,0.06)',
                          boxShadow: isStamped ? '2px 2px 6px rgba(191,161,95,0.3), inset 1px 1px 3px rgba(255,255,255,0.4)' : 'inset 2px 2px 4px rgba(0,0,0,0.15)',
                          border: isStamped ? '1.5px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {isStamped ? (
                          <span className="text-white font-black text-xs">CB</span>
                        ) : (
                          <span className="text-emerald-300/20 text-xs font-semibold">{i + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-emerald-200/80 font-medium">
                  {stamps < 10 ? (
                    <span>💆 Book and complete <strong>{10 - stamps} more sessions</strong> to redeem your free massage!</span>
                  ) : (
                    <span className="text-amber-300 font-bold flex items-center gap-1">🎉 Congratulations! You have a FREE treatment ready to claim!</span>
                  )}
                </p>
              </ClayCard>

              {/* ── DYNAMIC DISCOUNTS / REWARDS ──────────── */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-gold-700" /> Active Rewards & Vouchers
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { code: 'CBWELCOME20', title: '20% Off First Treatment', desc: 'Valid for new client accounts', exp: 'Exp: Aug 30' },
                    { code: 'MIDWEEK150', title: '₱150 Off Midweek Bliss', desc: 'Bookings scheduled Wed or Thu', exp: 'Exp: Aug 15' },
                  ].map((voucher) => (
                    <div
                      key={voucher.code}
                      className="rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden transition hover:scale-[1.01]"
                      style={{
                        background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
                        boxShadow: '8px 8px 20px #eae6df, -8px -8px 20px #ffffff',
                        border: '1px solid rgba(191,161,95,0.15)',
                      }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">Voucher Code</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{voucher.exp}</span>
                        </div>
                        <p className="text-xs font-black text-emerald-950 uppercase tracking-wide">{voucher.code}</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">{voucher.title}</p>
                        <p className="text-[10px] text-slate-400">{voucher.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(voucher.code);
                          showToast(`Code "${voucher.code}" copied to clipboard!`);
                        }}
                        className="w-full mt-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-950 transition hover:bg-slate-200"
                        style={{
                          background: 'linear-gradient(135deg,#fdfcfa,#ece8e0)',
                          boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.5)',
                          border: '1px solid rgba(0,0,0,0.05)',
                        }}
                      >
                        Copy Promo Code
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── MY BOOKINGS ──────────────────────────── */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-800" /> My Booking History
                </h3>
                {data?.bookings?.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No bookings recorded yet. Select 'Book a Session' above!</p>
                ) : (
                  <div className="space-y-3">
                    {data?.bookings?.map((b, i) => (
                      <div
                        key={b.id || i}
                        className="rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:scale-[1.01]"
                        style={{
                          background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
                          boxShadow: '10px 10px 24px #eae6df, -10px -10px 24px #ffffff',
                          border: '1px solid rgba(255,255,255,0.8)'
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: b.status === 'Confirmed' ? '#062c2210' : '#bfa15f15',
                            }}
                          >
                            <Calendar className="w-5 h-5" style={{ color: b.status === 'Confirmed' ? '#062c22' : '#bfa15f' }} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-snug">{b.service}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                              <span>with <strong className="text-slate-600">{b.therapist_name}</strong></span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {b.datetime}</span>
                            </div>
                            {b.notes && (
                              <p className="text-[10px] text-slate-400 italic mt-1 font-medium">📋 Requests: {b.notes}</p>
                            )}
                          </div>
                        </div>

                        <span
                          className="text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 align-self-start sm:align-self-center border"
                          style={
                            b.status === 'Confirmed' || b.status === 'Completed'
                              ? { background: 'rgba(6,44,34,0.06)', color: '#062c22', borderColor: 'rgba(6,44,34,0.15)' }
                              : b.status === 'Cancelled'
                              ? { background: 'rgba(239,68,68,0.06)', color: '#b91c1c', borderColor: 'rgba(239,68,68,0.15)' }
                              : { background: 'rgba(191,161,95,0.1)', color: '#a08742', borderColor: 'rgba(191,161,95,0.2)' }
                          }
                        >
                          {(b.status === 'Confirmed' || b.status === 'Completed') ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════
                COLUMN 3: THERAPIST CONNECTION HUB
            ═══════════════════════════════════════════════════════ */}
            <div className="space-y-6">
              
              {/* ── Therapist Profiling Card ───────────────── */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-800" /> My Assigned Therapist
                </h3>
                
                {assignedTherapistName ? (
                  <ClayCard className="p-5 flex flex-col items-center text-center space-y-4">
                    {/* Therapist Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden" style={{ border: '2.5px solid #bfa15f', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
                        <img src="/therapist-hero.jpg" alt="Therapist" className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#faf8f5] rounded-full" />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{assignedTherapistName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Swedish & Hilot Expert</p>
                      {/* Star Rating */}
                      <div className="flex justify-center items-center gap-1.5 mt-1.5">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">4.9 (120+ trips)</span>
                      </div>
                    </div>

                    {/* Vetted badge */}
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                      ✦ Cozy Vetted Specialist
                    </span>
                  </ClayCard>
                ) : (
                  <ClayCard className="p-5 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">No Active Assignment</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Once the Admin assigns your specialist for your confirmed session, they will appear here.
                    </p>
                  </ClayCard>
                )}
              </div>

              {/* ── Connection Chat Box ───────────────────── */}
              {assignedTherapistName && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-800" /> Connection Chat
                  </h3>

                  <ClayCard className="p-4 flex flex-col" style={{ height: '300px' }}>
                    {/* Chat messages box */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin text-left">
                      {chatMessages.map((msg, i) => {
                        const isClient = msg.sender === 'client';
                        return (
                          <div key={i} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] ${
                                isClient
                                  ? 'text-white'
                                  : 'text-slate-700'
                              }`}
                              style={
                                isClient
                                  ? {
                                      background: 'linear-gradient(135deg,#062c22,#0f5040)',
                                      boxShadow: '4px 4px 10px rgba(6,44,34,0.15)',
                                      borderRadius: '16px 16px 2px 16px',
                                    }
                                  : {
                                      background: '#faf8f5',
                                      boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.8), 2px 2px 8px #eae6df',
                                      borderRadius: '16px 16px 16px 2px',
                                      border: '1px solid rgba(0,0,0,0.03)',
                                    }
                              }
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Send Input */}
                    <form onSubmit={sendChatMessage} className="mt-3.5 pt-3 border-t border-slate-100 flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Message ${assignedTherapistName.split(' ')[0]}...`}
                        className="flex-1 px-3 py-2 rounded-xl text-xs text-slate-700 placeholder-slate-400 outline-none"
                        style={{
                          background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)',
                          boxShadow: 'inset 2px 2px 5px #e0dbd3, inset -2px -2px 5px #ffffff',
                        }}
                      />
                      <button
                        type="submit"
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg,#062c22,#0a3d30)',
                          boxShadow: '3px 3px 8px rgba(6,44,34,0.2)'
                        }}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </ClayCard>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* ═══ TOAST NOTIFICATION ══════════════════════════════════════════ */}
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

export default ClientDashboard;
