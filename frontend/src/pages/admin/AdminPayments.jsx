import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { DollarSign, CheckCircle, Clock, Plus, Landmark, FileText, ArrowUpRight } from 'lucide-react';

const AdminPayments = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'sales';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expense tracker state
  const [expenses, setExpenses] = useState([
    { id: 101, description: 'Electricity Utility Bill', category: 'Utilities', amount: 4850, date: '2026-07-01', status: 'Paid' },
    { id: 102, description: 'Monthly Rent (Main Branch)', category: 'Rent', amount: 25000, date: '2026-07-02', status: 'Paid' },
    { id: 103, description: 'Eco Essential Oil Restock', category: 'Supplies', amount: 3500, date: '2026-07-05', status: 'Paid' }
  ]);

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((r) => setPayments(r.data.payments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'payroll': return 'Payroll & Commissions';
      case 'expenses': return 'Expense Tracker';
      case 'sales':
      default: return 'Daily Sales Logs';
    }
  };

  // Mock payroll logs
  const mockPayroll = [
    { id: 201, name: 'Maria Santos', completed: 15, base: 7500, commission: 3930, total: 11430, status: 'Awaiting Release' },
    { id: 202, name: 'John Doe', completed: 8, base: 4000, commission: 2370, total: 6370, status: 'Released' },
    { id: 203, name: 'Anna Reyes', completed: 12, base: 6000, commission: 3120, total: 9120, status: 'Awaiting Release' }
  ];

  return (
    <AdminLayout title="Financials &amp; Reports" subtitle={getPageTitle()}>
      <div className="space-y-6">
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 bg-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toast}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-900" />
          </div>
        ) : (
          <div>
            
            {/* ── Tab Content: Daily Sales Logs ── */}
            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase">Transactions Summary</h2>
                  <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 shadow-sm">
                    Sales Revenue: ₱{totalRevenue.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                          <th className="px-6 py-4">Receipt ID</th>
                          <th className="px-6 py-4">Client Name</th>
                          <th className="px-6 py-4">Payment Method</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {payments.map((p, i) => (
                          <motion.tr
                            key={p.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-slate-50/50 transition duration-150"
                          >
                            <td className="px-6 py-4 text-slate-500 font-mono">#INV-{p.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{p.client_name}</td>
                            <td className="px-6 py-4 text-slate-400">GCash Transfer</td>
                            <td className="px-6 py-4 font-black text-slate-800">
                              ₱{p.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{p.date}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border
                                ${p.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-100'}`}>
                                {p.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab Content: Payroll & Commissions ── */}
            {activeTab === 'payroll' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Automated Commission Payouts</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base rate: ₱500/session + 35% commission</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                          <th className="px-6 py-4">Therapist</th>
                          <th className="px-6 py-4 text-center">Sessions</th>
                          <th className="px-6 py-4">Base Payout</th>
                          <th className="px-6 py-4">Commissions</th>
                          <th className="px-6 py-4">Net Total</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {mockPayroll.map(pr => (
                          <tr key={pr.id} className="hover:bg-slate-50/30 transition">
                            <td className="px-6 py-4 font-bold text-slate-850">{pr.name}</td>
                            <td className="px-6 py-4 text-center font-bold text-slate-600">{pr.completed}</td>
                            <td className="px-6 py-4 text-slate-500">₱{pr.base.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-500">₱{pr.commission.toLocaleString()}</td>
                            <td className="px-6 py-4 font-black text-emerald-800">₱{pr.total.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              {pr.status === 'Released' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-xl">
                                  Released
                                </span>
                              ) : (
                                <button
                                  onClick={() => showToast(`Released payout to ${pr.name}`)}
                                  className="px-3 py-1 bg-emerald-950 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-900 transition"
                                >
                                  Release Pay
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab Content: Expense Tracker ── */}
            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Operation Expenses</h3>
                  <button
                    onClick={() => showToast('Mock Add Expense Clicked')}
                    className="flex items-center gap-1 px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Expense
                  </button>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                        <th className="px-6 py-4">Expense Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Log Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {expenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-slate-50/30 transition">
                          <td className="px-6 py-4 font-bold text-slate-805">{exp.description}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold text-[10px]">
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{exp.date}</td>
                          <td className="px-6 py-4 font-black text-red-500">₱{exp.amount.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                              {exp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
