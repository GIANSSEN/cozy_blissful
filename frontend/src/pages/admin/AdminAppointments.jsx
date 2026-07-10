import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((r) => setAppointments(r.data.recent_appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusIcon = (status) => {
    if (status === 'Confirmed') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    return <AlertCircle className="w-4 h-4 text-amber-400" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">All Appointments</h2>
          <span className="text-sm text-slate-500">{appointments.length} records</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500" />
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{appt.service}</p>
                    <div className="flex flex-wrap gap-x-4 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{appt.client_name}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.datetime}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Therapist: {appt.therapist_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-center">
                  {statusIcon(appt.status)}
                  <span className={`text-sm font-medium ${appt.status === 'Confirmed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {appt.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
