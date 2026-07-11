import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import {
  Calendar as CalendarIcon, Clock, User, CheckCircle, AlertCircle,
  XCircle, Check, X, RefreshCw, ChevronLeft, ChevronRight, UserCheck
} from 'lucide-react';

const AdminAppointments = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'calendar';

  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Calendar View Specific state
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      setAppointments(prev => prev.map(appt => appt.id === apptId ? { ...appt, therapist_id: therapistId, therapist_name: res.data.appointment.therapist_name, status: res.data.appointment.status } : appt));
    } catch (e) {
      showToast("Failed to assign therapist", "error");
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      const res = await API.post(`/admin/appointments/${apptId}/status`, { status: newStatus });
      showToast(res.data.message);
      setAppointments(prev => prev.map(appt => appt.id === apptId ? { ...appt, status: newStatus } : appt));
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const getDateStr = (datetimeStr) => {
    if (!datetimeStr) return '';
    return datetimeStr.split(' ')[0];
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'pending': return 'Pending Approvals';
      case 'requests': return 'Cancellation & Reschedule Requests';
      case 'calendar':
      default: return 'Master Calendar View';
    }
  };

  // Filter appointments for specific tabs
  const pendingAppointments = appointments.filter(a => a.status === 'Pending');
  
  // Custom mock reschedule requests for the requests tab
  const mockRequests = [
    { id: 101, client: 'Alice Vance', service: 'Deep Tissue Massage (60 min)', current: 'Tomorrow, 07:00 PM', requested: 'Tomorrow, 09:00 PM', reason: 'Work meeting extended', type: 'Reschedule' },
    { id: 102, client: 'Ryan Co', service: 'Manigel & Pedigel (90 min)', current: 'July 15, 02:00 PM', requested: 'None (Cancel)', reason: 'Out of town trip', type: 'Cancellation' }
  ];

  return (
    <AdminLayout title="Bookings &amp; Appointments" subtitle={getPageTitle()}>
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

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-900" />
          </div>
        ) : (
          <div>
            
            {/* ── Tab Content: Master Calendar View ── */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                {/* Calendar Date selector header */}
                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() - 1);
                        setSelectedDate(d);
                      }}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-800">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() + 1);
                        setSelectedDate(d);
                      }}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-100 font-bold px-3 py-1.5 rounded-full">
                    ✦ Drag and Drop Scheduler Ready
                  </span>
                </div>

                {/* Calendar Schedule Grid Layout */}
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-8 divide-x divide-slate-100 border-b border-slate-100 text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 py-3">
                    <div>Time</div>
                    <div className="col-span-7">Scheduled Bookings / Therapist Slots</div>
                  </div>
                  
                  <div className="divide-y divide-slate-50 text-xs">
                    {['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM', '09:00 PM'].map((slot, index) => {
                      // Find any booking matching this approximate slot hour
                      const matchBookings = appointments.filter((_, idx) => idx % 7 === index);
                      
                      return (
                        <div key={slot} className="grid grid-cols-8 divide-x divide-slate-50 hover:bg-slate-50/20 transition min-h-[72px]">
                          <div className="py-4 text-center font-black text-slate-400 border-r border-slate-50 bg-slate-50/30 flex items-center justify-center">
                            {slot}
                          </div>
                          <div className="col-span-7 p-3 flex flex-wrap gap-3 items-center">
                            {matchBookings.map(appt => (
                              <div
                                key={appt.id}
                                className="px-4 py-2.5 rounded-2xl border text-left cursor-grab active:cursor-grabbing hover:scale-[1.02] transition duration-200"
                                style={{
                                  background: appt.status === 'Confirmed' ? 'linear-gradient(135deg, #062c22, #0a3d30)' : '#fdfcfa',
                                  color: appt.status === 'Confirmed' ? '#fff' : '#475569',
                                  borderColor: appt.status === 'Confirmed' ? 'transparent' : 'rgba(191,161,95,0.2)',
                                  boxShadow: appt.status === 'Confirmed' ? '0 4px 10px rgba(6,44,34,0.15)' : '3px 3px 6px #e5decb, -3px -3px 6px #ffffff',
                                }}
                              >
                                <p className="font-bold text-xs leading-none">{appt.service}</p>
                                <p className="text-[9px] mt-1 opacity-80 font-medium">
                                  {appt.client_name} · <span className="font-bold">{appt.therapist_name || 'No Therapist Assigned'}</span>
                                </p>
                              </div>
                            ))}
                            {matchBookings.length === 0 && (
                              <span className="text-[10px] text-slate-300 italic">No bookings scheduled in this time slot</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab Content: Pending Approvals ── */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Awaiting Confirmation ({pendingAppointments.length})</h3>
                </div>

                {pendingAppointments.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
                    <CheckCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="font-bold text-slate-700">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-1">There are no pending booking approval requests.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingAppointments.map(appt => (
                      <div key={appt.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{appt.service}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Client: <span className="font-bold text-slate-700">{appt.client_name}</span> · Requested Slot: <span className="font-bold text-slate-700">{appt.datetime}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'Confirmed')}
                            className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
                            title="Confirm Booking"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'Cancelled')}
                            className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition"
                            title="Reject Booking"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab Content: Cancellation & Reschedule Requests ── */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Reschedule &amp; Cancellation Requests</h3>
                </div>

                <div className="grid gap-4">
                  {mockRequests.map(req => (
                    <div key={req.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                            req.type === 'Reschedule' ? 'bg-blue-50 text-blue-800' : 'bg-red-50 text-red-800'
                          }`}>
                            {req.type}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">Request #{req.id}</span>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">{req.service}</p>
                        <p className="text-xs text-slate-500">
                          Client: <span className="font-bold text-slate-700">{req.client}</span> · Current: <span className="font-bold text-slate-700 line-through">{req.current}</span>
                        </p>
                        {req.type === 'Reschedule' ? (
                          <p className="text-xs text-slate-800 font-bold">
                            Requested Time: <span className="text-emerald-800">{req.requested}</span>
                          </p>
                        ) : null}
                        <p className="text-[10px] text-slate-400 italic">Reason: "{req.reason}"</p>
                      </div>

                      <div className="flex items-center gap-2.5 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                        <button
                          onClick={() => showToast(`Request #${req.id} approved`)}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => showToast(`Request #${req.id} declined`)}
                          className="flex items-center gap-1 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
