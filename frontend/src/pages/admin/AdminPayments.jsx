import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((r) => setPayments(r.data.payments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Payment Log</h2>
          <div className="bg-emerald-500/10 border border-emerald-800 text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold">
            Confirmed Total: ${totalRevenue.toFixed(2)}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500" />
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="text-left px-6 py-3">#</th>
                    <th className="text-left px-6 py-3">Client</th>
                    <th className="text-left px-6 py-3">Amount</th>
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {payments.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="hover:bg-slate-800/30 transition duration-150"
                    >
                      <td className="px-6 py-4 text-slate-500 font-mono">#{p.id}</td>
                      <td className="px-6 py-4 font-medium text-white">{p.client_name}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{p.amount.toFixed(2)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{p.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border
                          ${p.status === 'Completed'
                            ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                            : 'bg-amber-900/40 text-amber-400 border-amber-800'}`}>
                          {p.status === 'Completed'
                            ? <CheckCircle className="w-3 h-3" />
                            : <Clock className="w-3 h-3" />}
                          {p.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
