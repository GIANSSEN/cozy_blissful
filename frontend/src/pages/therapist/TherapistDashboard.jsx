import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  Briefcase, Star, Clock, MapPin, Calendar,
  CheckCircle, LogOut, Heart, TrendingUp,
} from 'lucide-react';

const TherapistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/therapist/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <Heart className="w-6 h-6 text-emerald-500" />
          <span className="font-bold text-white tracking-wide">Cozy Blissful</span>
          <span className="text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-semibold ml-2">
            Therapist Portal
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

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h1 className="text-3xl font-extrabold text-white">Therapist Job Portal</h1>
          <p className="text-slate-400 mt-1">Manage your schedule and explore new opportunities</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500" />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Calendar,    label: 'My Appointments',   value: data?.therapist_stats?.my_appointments,  color: 'bg-emerald-500/10 text-emerald-400' },
                { icon: CheckCircle, label: 'Completed Sessions', value: data?.therapist_stats?.completed_sessions, color: 'bg-amber-500/10 text-amber-400'   },
                { icon: Star,        label: 'Client Rating',      value: data?.therapist_stats?.rating,            color: 'bg-indigo-500/10 text-indigo-400'  },
                { icon: TrendingUp,  label: 'Hours Worked',       value: data?.therapist_stats?.hours_worked,      color: 'bg-rose-500/10 text-rose-400'     },
              ].map(({ icon: Icon, label, value, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.09, duration: 0.5 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4"
                >
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Two column layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* My Appointments */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Upcoming Appointments</h2>
                {data?.appointments?.map((appt, i) => (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-800 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{appt.service}</p>
                        <p className="text-sm text-slate-400">Client: {appt.client_name}</p>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{appt.datetime}</span>
                        </div>
                        {appt.notes && (
                          <p className="text-xs text-slate-500 italic mt-1">Note: {appt.notes}</p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        appt.status === 'Confirmed'
                          ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                          : 'bg-amber-900/40 text-amber-400 border-amber-800'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Available Jobs */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Available Jobs</h2>
                {data?.available_jobs?.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 hover:border-emerald-700 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-semibold text-white">{job.title}</p>
                        <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                          {job.compensation}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{job.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.datetime}</span>
                      </div>
                      <button className="mt-2 w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition duration-200">
                        Apply for this Job
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TherapistDashboard;
