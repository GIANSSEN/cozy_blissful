import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  LogOut, Heart, Plus, ChevronRight,
} from 'lucide-react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [booking, setBooking] = useState({ service: '', therapist: '', datetime: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    API.get('/booking/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
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
      setBooking({ service: '', therapist: '', datetime: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <Heart className="w-6 h-6 text-indigo-500" />
          <span className="font-bold text-white tracking-wide">Cozy Blissful</span>
          <span className="text-xs bg-indigo-900/50 text-indigo-400 border border-indigo-800 px-2.5 py-1 rounded-full font-semibold ml-2">
            Client Portal
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 transition rounded-lg hover:bg-red-950/20"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-white">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-slate-400 mt-1">Manage your bookings and explore available services</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center space-x-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition duration-200 shadow-lg shadow-indigo-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </motion.div>

        {/* Success banner */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-900/40 border border-emerald-700 text-emerald-400 px-5 py-4 rounded-2xl flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* Booking Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
          >
            <h2 className="text-xl font-bold text-white">Book a Session</h2>
            <form onSubmit={handleBook} className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Service</label>
                <select
                  required
                  value={booking.service}
                  onChange={(e) => setBooking({ ...booking, service: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="" disabled className="text-slate-400">Choose service…</option>
                  {data?.available_services?.map((s) => (
                    <option key={s.id} value={s.name} className="bg-slate-900">
                      {s.name} – ${s.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Therapist</label>
                <select
                  required
                  value={booking.therapist}
                  onChange={(e) => setBooking({ ...booking, therapist: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="" disabled className="text-slate-400">Choose therapist…</option>
                  {data?.available_therapists?.map((t) => (
                    <option key={t.id} value={t.name} className="bg-slate-900">
                      {t.name} – {t.specialty}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={booking.datetime}
                  onChange={(e) => setBooking({ ...booking, datetime: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition duration-200 flex items-center space-x-2"
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span>Confirm Booking</span>}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* My Bookings */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">My Bookings</h2>
              {data?.bookings?.length === 0 ? (
                <p className="text-slate-500 text-sm">No bookings yet. Create your first session!</p>
              ) : (
                data?.bookings?.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-800 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{b.service}</p>
                        <p className="text-sm text-slate-400">with {b.therapist_name}</p>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{b.datetime}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                          : 'bg-amber-900/40 text-amber-400 border-amber-800'
                      }`}>
                        {b.status === 'Confirmed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {b.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Available Services */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Available Services</h2>
              {data?.available_services?.map((svc, i) => (
                <motion.div
                  key={svc.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4 hover:border-indigo-800 transition cursor-pointer group"
                  onClick={() => { setBooking({ ...booking, service: svc.name }); setShowForm(true); }}
                >
                  <div className="w-10 h-10 bg-indigo-900/40 text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{svc.name}</p>
                    <div className="flex items-center space-x-3 mt-0.5 text-xs text-slate-400">
                      <span className="text-indigo-400 font-semibold">${svc.price}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{svc.duration}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
