import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import {
  TrendingUp, Users, Calendar, DollarSign,
  CheckCircle, Clock, AlertCircle,
} from 'lucide-react';

const cardVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: (i) => ({
    y: 0, opacity: 1,
    transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' },
  }),
};

const StatCard = ({ icon: Icon, label, value, sub, color, index }) => (
  <motion.div
    custom={index}
    variants={cardVariant}
    initial="hidden"
    animate="visible"
    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start space-x-4 hover:border-slate-700 transition duration-200"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  </motion.div>
);

const statusBadge = (status) => {
  const map = {
    Confirmed: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
    Pending:   'bg-amber-900/40 text-amber-400 border-amber-800',
    Cancelled: 'bg-red-900/40 text-red-400 border-red-800',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] || map.Pending}`}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    { icon: Calendar,    label: 'Total Bookings',      value: data.stats.total_bookings,    sub: 'All time',          color: 'bg-amber-500/10 text-amber-400'   },
    { icon: DollarSign,  label: 'Total Revenue',       value: `$${data.stats.total_revenue.toLocaleString()}`, sub: 'This month', color: 'bg-emerald-500/10 text-emerald-400' },
    { icon: Users,       label: 'Active Therapists',   value: data.stats.active_therapists, sub: 'Currently active',  color: 'bg-indigo-500/10 text-indigo-400'  },
    { icon: TrendingUp,  label: 'Registered Clients',  value: data.stats.registered_clients,sub: 'Total accounts',   color: 'bg-rose-500/10 text-rose-400'      },
  ] : [];

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} index={i} />
            ))}
          </div>

          {/* Recent Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-white text-lg">Recent Appointments</h2>
              <span className="text-xs text-slate-500">Latest activity</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3">Client</th>
                    <th className="text-left px-6 py-3">Therapist</th>
                    <th className="text-left px-6 py-3">Service</th>
                    <th className="text-left px-6 py-3">Date & Time</th>
                    <th className="text-left px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data?.recent_appointments?.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-800/30 transition duration-150">
                      <td className="px-6 py-4 font-medium text-white">{appt.client_name}</td>
                      <td className="px-6 py-4 text-slate-400">{appt.therapist_name}</td>
                      <td className="px-6 py-4 text-slate-300">{appt.service}</td>
                      <td className="px-6 py-4 text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{appt.datetime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{statusBadge(appt.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
