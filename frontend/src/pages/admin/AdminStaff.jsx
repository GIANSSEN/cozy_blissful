import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { Users, Calendar, Check, AlertCircle, Shield, Edit2, Info, Search } from 'lucide-react';

const AdminStaff = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profiles';

  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Customer search
  const [customerSearch, setCustomerSearch] = useState('');

  // RBAC Permission Grid State
  const [rbacPermissions, setRbacPermissions] = useState({
    admin: { bookings: true, services: true, financials: true, settings: true },
    therapist: { bookings: true, services: false, financials: false, settings: false },
    client: { bookings: false, services: false, financials: false, settings: false }
  });

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

  const formatDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'customers': return 'Customer Database';
      case 'rbac': return 'Role Access Control (RBAC)';
      case 'profiles':
      default: return 'Therapist & Staff Profiles';
    }
  };

  // Mock customers list for the customer database tab
  const mockCustomers = [
    { id: 1, name: 'Sarah Martinez', email: 'sarah@example.com', phone: '+63 917 123 4567', bookings: 12, notes: 'Prefers Swedish Massage with Lavender Oil, medium pressure.' },
    { id: 2, name: 'David Lim', email: 'david.lim@example.com', phone: '+63 918 987 6543', bookings: 5, notes: 'Requires Deep Tissue focus on lower back and neck.' },
    { id: 3, name: 'Patricia Go', email: 'patty.go@example.com', phone: '+63 919 444 5555', bookings: 8, notes: 'Regular gel nails client. Prefers Anna Reyes.' },
    { id: 4, name: 'John Vincent', email: 'vincent.j@example.com', phone: '+63 922 555 1234', bookings: 1, notes: 'First time. Prefers standard Hilot massage.' }
  ].filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase()));

  const toggleRbac = (role, permission) => {
    setRbacPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission]
      }
    }));
  };

  return (
    <AdminLayout title="User Management" subtitle={getPageTitle()}>
      <div className="space-y-6">

        {/* ── Tab Content: Therapist Profiles ── */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase">Active Staff &amp; Commissions</h2>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100">
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
              <div className="grid gap-4">
                {therapists.map((therapist, idx) => (
                  <motion.div
                    key={therapist.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:shadow-md transition duration-200"
                  >
                    {/* Left: Info & Specialty & Commission */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '2px 2px 6px rgba(6,44,34,0.15)' }}
                        >
                          {therapist.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm leading-tight">{therapist.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{therapist.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {therapist.specialty}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                          35% Comm. Rate
                        </span>
                      </div>
                    </div>

                    {/* Right: Availability grid */}
                    <div className="space-y-2 border-t xl:border-t-0 pt-4 xl:pt-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> 7-Day Attendance Schedule
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {nextDays.map((day) => {
                          const dateStr = formatDateString(day);
                          const isAvailable = therapist.availabilities.includes(dateStr);
                          const dayNum = day.getDate();
                          const weekday = day.toLocaleDateString('en-US', { weekday: 'short' });
                          
                          return (
                            <div
                              key={dateStr}
                              className="px-2 py-1 rounded-xl flex flex-col items-center justify-center w-[48px] transition-all"
                              style={
                                isAvailable
                                  ? {
                                      background: 'linear-gradient(135deg, #062c22, #0a3d30)',
                                      color: '#fff',
                                    }
                                  : {
                                      background: '#faf8f5',
                                      color: '#94a3b8',
                                      border: '1px solid rgba(0,0,0,0.04)',
                                    }
                              }
                            >
                              <span className="text-[8px] font-semibold uppercase opacity-75">{weekday}</span>
                              <span className="text-[11px] font-black mt-0.5">{dayNum}</span>
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
        )}

        {/* ── Tab Content: Customer Database ── */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Customer Registry</h2>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer name..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-800"
                  style={{ background: '#faf9f6' }}
                />
              </div>
            </div>

            <div className="grid gap-4">
              {mockCustomers.map(cust => (
                <div key={cust.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center font-bold text-sm">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-none">{cust.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{cust.email} · {cust.phone}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                      {cust.bookings} Bookings
                    </span>
                  </div>
                  
                  {cust.notes && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Treatment Notes:</strong> {cust.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab Content: Role Access Control (RBAC) ── */}
        {activeTab === 'rbac' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">RBAC Access Levels</h3>
            <p className="text-xs text-slate-400">Configure feature authorization checkboxes for administrative, therapist, and client user types.</p>
            
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                    <th className="py-4 px-6">User Role</th>
                    <th className="py-4 px-6 text-center">Manage Bookings</th>
                    <th className="py-4 px-6 text-center">Maintain Services</th>
                    <th className="py-4 px-6 text-center">Financial Reports</th>
                    <th className="py-4 px-6 text-center">System Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {[
                    { role: 'admin', label: 'Admin Access', desc: 'Full control of all modules' },
                    { role: 'therapist', label: 'Therapist Access', desc: 'Access assigned schedules' },
                    { role: 'client', label: 'Client Access', desc: 'Booking panel self-service' }
                  ].map(r => (
                    <tr key={r.role}>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{r.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                      </td>
                      {['bookings', 'services', 'financials', 'settings'].map(perm => (
                        <td key={perm} className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={rbacPermissions[r.role][perm]}
                            onChange={() => toggleRbac(r.role, perm)}
                            className="w-4 h-4 rounded text-emerald-900 border-slate-300 focus:ring-emerald-800 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
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

export default AdminStaff;
