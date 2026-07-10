import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { Calendar, Clock, User, CheckCircle, AlertCircle, UserCheck, XCircle, ArrowRight } from 'lucide-react';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      const apptRes = await API.get('/admin/appointments');
      setAppointments(apptRes.data.recent_appointments || []);
      
      const therapistRes = await API.get('/admin/therapists');
      setTherapists(therapistRes.data.therapists || []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load appointments/therapists", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignTherapist = async (apptId, therapistId) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/assign`, { therapist_id: therapistId });
      showToast(res.data.message);
      // Update local state
      setAppointments(prev => prev.map(appt => appt.id === apptId ? { ...appt, therapist_id: therapistId, therapist_name: res.data.appointment.therapist_name, status: res.data.appointment.status } : appt));
    } catch (e) {
      showToast("Failed to assign therapist", "error");
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/status`, { status: newStatus });
      showToast(res.data.message);
      // Update local state
      setAppointments(prev => prev.map(appt => appt.id === apptId ? { ...appt, status: newStatus } : appt));
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  // Helper to extract YYYY-MM-DD from datetime string
  const getDateStr = (datetimeStr) => {
    if (!datetimeStr) return '';
    return datetimeStr.split(' ')[0];
  };

  return (
    <AdminLayout title="Appointments" subtitle="Manage bookings, assign therapists, and track session status">
      <div className="space-y-6">
        
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-800'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">All Service Bookings</h2>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#f0ece4', color: '#062c22' }}>
            {appointments.length} Total Records
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-900" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">No appointments found</p>
            <p className="text-xs text-slate-400 mt-1">Bookings made by clients will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appt, i) => {
              const apptDate = getDateStr(appt.datetime);
              
              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:shadow-md transition duration-200"
                >
                  {/* Left Side: Client & Service Details */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base">{appt.service}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> Client: <span className="font-bold text-slate-700">{appt.client_name}</span></span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Schedule: <span className="font-bold text-slate-700">{appt.datetime}</span></span>
                      </div>
                      {appt.notes && (
                        <p className="text-[11px] text-slate-400 italic bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 mt-2">
                          💡 Notes: {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Assign Therapist & Update Status actions */}
                  <div className="flex flex-wrap items-center gap-4 xl:gap-6 self-start xl:self-center w-full xl:w-auto border-t xl:border-t-0 pt-4 xl:pt-0">
                    
                    {/* Therapist Assignment Dropdown */}
                    <div className="space-y-1 w-full sm:w-auto">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assign Therapist</label>
                      <div className="relative">
                        <select
                          value={appt.therapist_id || ''}
                          onChange={(e) => handleAssignTherapist(appt.id, e.target.value || null)}
                          className="appearance-none outline-none text-xs font-semibold px-4 py-2.5 rounded-2xl pr-8 cursor-pointer w-full sm:w-[220px]"
                          style={{
                            background: 'linear-gradient(135deg,#fdfcfa,#f3ede4)',
                            boxShadow: 'inset 2px 2px 5px #e0dbd3, inset -2px -2px 5px #ffffff',
                            border: '1px solid rgba(191,161,95,0.15)',
                            color: appt.therapist_id ? '#062c22' : '#6b7280'
                          }}
                        >
                          <option value="">-- Choose Therapist --</option>
                          {therapists.map((therapist) => {
                            // Check if therapist is available on this date
                            const isAvailable = therapist.availabilities.includes(apptDate);
                            
                            return (
                              <option key={therapist.id} value={therapist.id}>
                                {therapist.name} ({isAvailable ? '🟢 Available' : '🔴 Unscheduled'})
                              </option>
                            );
                          })}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">▼</span>
                      </div>
                    </div>

                    {/* Status indicator and actions */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status</span>
                        <span
                          className={`text-xs font-black px-3 py-1.5 rounded-full mt-1 ${
                            appt.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : appt.status === 'Confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : appt.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      {/* Status action buttons */}
                      <div className="flex items-center gap-1.5 self-end">
                        {appt.status !== 'Confirmed' && appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                          <button
                            title="Confirm booking"
                            onClick={() => handleUpdateStatus(appt.id, 'Confirmed')}
                            className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition duration-150"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {appt.status === 'Confirmed' && (
                          <button
                            title="Mark as Completed"
                            onClick={() => handleUpdateStatus(appt.id, 'Completed')}
                            className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition duration-150"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                          <button
                            title="Cancel Session"
                            onClick={() => handleUpdateStatus(appt.id, 'Cancelled')}
                            className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition duration-150"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
