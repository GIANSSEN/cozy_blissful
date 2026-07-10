import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { Users, Calendar, Check, AlertCircle } from 'lucide-react';

const AdminStaff = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadTherapists = async () => {
    try {
      const res = await API.get('/admin/therapists');
      setTherapists(res.data.therapists || []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load staff directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTherapists();
  }, []);

  // Generate next 7 days for displaying availability grid
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

  // Helper to format date string to YYYY-MM-DD
  const formatDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <AdminLayout title="Staff Directory" subtitle="Manage therapists, view upcoming schedules and track availability status">
      <div className="space-y-6">
        
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Therapist Team</h2>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#f0ece4', color: '#062c22' }}>
            {therapists.length} Active Staff
          </span>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs p-4 rounded-2xl flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-900" />
          </div>
        ) : therapists.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">No therapists registered</p>
            <p className="text-xs text-slate-400 mt-1">Therapists registered in the system will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {therapists.map((therapist, idx) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition duration-200"
              >
                {/* Left Side: Therapist Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '2px 2px 6px rgba(6,44,34,0.3)' }}
                    >
                      {therapist.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{therapist.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{therapist.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {therapist.specialty}
                    </span>
                  </div>
                </div>

                {/* Right Side: Next 7 Days Availability Calendar Grid */}
                <div className="space-y-2 border-t md:border-t-0 pt-4 md:pt-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> 7-Day Availability Schedule
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {nextDays.map((day) => {
                      const dateStr = formatDateString(day);
                      const isAvailable = therapist.availabilities.includes(dateStr);
                      const dayNum = day.getDate();
                      const weekday = day.toLocaleDateString('en-US', { weekday: 'short' });
                      
                      return (
                        <div
                          key={dateStr}
                          className="px-2.5 py-1.5 rounded-2xl flex flex-col items-center justify-center w-[54px] transition-all"
                          title={`${weekday} ${dateStr}: ${isAvailable ? 'Available' : 'Not available'}`}
                          style={
                            isAvailable
                              ? {
                                  background: 'linear-gradient(135deg, #062c22, #0a3d30)',
                                  color: '#fff',
                                  boxShadow: '2px 2px 6px rgba(6,44,34,0.2)',
                                }
                              : {
                                  background: '#faf8f5',
                                  color: '#94a3b8',
                                  border: '1px solid rgba(0,0,0,0.04)',
                                }
                          }
                        >
                          <span className="text-[8px] font-semibold uppercase opacity-75">{weekday}</span>
                          <span className="text-xs font-black mt-0.5">{dayNum}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStaff;
