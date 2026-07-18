import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../api/axios';
import {
  Users, Calendar, AlertCircle,
  Shield, Lock, Save, CheckCircle2,
  Crown, Stethoscope, UserCheck, UserCog, User, ListOrdered,
} from 'lucide-react';

/* ── RBAC initial state including staff role ────────────────────── */
const INITIAL_PERMISSIONS = {
  admin: { bookings: true, services: true, financials: true, settings: true },
  staff: { bookings: true, services: false, financials: false, settings: false },
  therapist: { bookings: true, services: false, financials: false, settings: false },
  client: { bookings: false, services: false, financials: false, settings: false },
};

const PERMISSION_META = {
  bookings:   { label: 'Manage Bookings',   desc: 'View and manage appointment bookings' },
  services:   { label: 'Maintain Services', desc: 'Create and edit service catalog entries' },
  financials: { label: 'Financial Reports', desc: 'Access revenue and payment reports' },
  settings:   { label: 'System Settings',   desc: 'Configure system-wide settings' },
};

const ROLE_META = {
  admin:     { label: 'Administrator', desc: 'Full control of all modules', icon: Crown,       color: '#0a3d30', bg: 'rgba(10,61,48,0.08)',  locked: true },
  staff:     { label: 'Staff Coordinator', desc: 'Manages scheduling & bookings', icon: UserCog,   color: '#3b55e6', bg: 'rgba(59,85,230,0.08)', locked: false },
  therapist: { label: 'Therapist',     desc: 'Access assigned schedules',   icon: Stethoscope, color: '#bfa15f', bg: 'rgba(191,161,95,0.08)', locked: false },
  client:    { label: 'Client',        desc: 'Booking self-service panel',   icon: User,        color: '#6366f1', bg: 'rgba(99,102,241,0.08)', locked: false },
};

/* ── Animated Toggle Switch ─────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className="relative inline-flex items-center transition-all duration-200"
    style={{
      width: 40,
      height: 22,
      borderRadius: 11,
      background: disabled
        ? checked ? 'rgba(10,61,48,0.3)' : 'rgba(0,0,0,0.12)'
        : checked ? 'linear-gradient(135deg,#0a3d30,#062c22)' : '#d1d5db',
      boxShadow: checked && !disabled ? '0 2px 8px rgba(10,61,48,0.25)' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: 'none',
      padding: 0,
    }}
    title={disabled ? 'Admin permissions are locked' : checked ? 'Click to disable' : 'Click to enable'}
  >
    <motion.span
      animate={{ x: checked ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {disabled && <Lock className="w-2.5 h-2.5" style={{ color: '#9ca3af' }} />}
    </motion.span>
  </button>
);

const AdminStaff = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profiles';

  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [rbacPermissions, setRbacPermissions] = useState(INITIAL_PERMISSIONS);
  const [rbacSaved, setRbacSaved] = useState(false);
  const [savingRbac, setSavingRbac] = useState(false);

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

  useEffect(() => { loadTherapists(); }, []);

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
      case 'queue': return 'Therapist Queue';
      case 'rbac': return 'System Permissions';
      case 'profiles':
      default: return 'Attendance & Profiles';
    }
  };

  /* Mock therapist queue — next-in-line order for walk-in / unassigned bookings */
  const mockQueue = therapists.map((t, idx) => ({
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    position: idx + 1,
    status: idx === 0 ? 'Next Up' : 'Waiting',
  }));

  const toggleRbac = (role, permission) => {
    const meta = ROLE_META[role];
    if (meta?.locked) return; // admin permissions are locked
    setRbacPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [permission]: !prev[role][permission] },
    }));
    setRbacSaved(false);
  };

  const handleSaveRbac = async () => {
    setSavingRbac(true);
    // Simulate API save — replace with actual API.post('/admin/rbac', rbacPermissions) when backend is ready
    await new Promise(resolve => setTimeout(resolve, 700));
    setSavingRbac(false);
    setRbacSaved(true);
    setTimeout(() => setRbacSaved(false), 3000);
  };

  return (
    <AdminLayout title="Staff & Schedule" subtitle={getPageTitle()}>
      <div className="space-y-6">

        {/* ── Therapist Profiles Tab ── */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase">Active Staff & Commissions</h2>
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
              <LoadingSpinner />
            ) : therapists.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700">No therapists registered</p>
                <p className="text-xs text-slate-400 mt-1">Therapists registered in the system will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {therapists.map((therapist, idx) => (
                  <motion.div key={therapist.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:shadow-md transition duration-200">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '2px 2px 6px rgba(6,44,34,0.15)' }}>
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

                    <div className="space-y-2 border-t xl:border-t-0 pt-4 xl:pt-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> 7-Day Attendance Schedule
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {nextDays.map((day) => {
                          const dateStr = formatDateString(day);
                          const isAvailable = therapist.availabilities?.includes(dateStr);
                          return (
                            <div key={dateStr}
                              className="px-2 py-1 rounded-xl flex flex-col items-center justify-center w-[48px] transition-all"
                              style={isAvailable
                                ? { background: 'linear-gradient(135deg, #062c22, #0a3d30)', color: '#fff' }
                                : { background: '#faf8f5', color: '#94a3b8', border: '1px solid rgba(0,0,0,0.04)' }
                              }>
                              <span className="text-[8px] font-semibold uppercase opacity-75">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                              <span className="text-[11px] font-black mt-0.5">{day.getDate()}</span>
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

        {/* ── Therapist Queue Tab ── */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Next-In-Line Queue</h2>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100">
                {mockQueue.length} In Queue
              </span>
            </div>

            {mockQueue.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
                <ListOrdered className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700">No therapists in queue</p>
                <p className="text-xs text-slate-400 mt-1">Therapists awaiting walk-in assignment will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {mockQueue.map(q => (
                  <div key={q.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
                        #{q.position}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{q.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{q.specialty}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      q.status === 'Next Up' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RBAC Tab ─ Enhanced ── */}
        {activeTab === 'rbac' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-800" /> Role-Based Access Control
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure feature permissions for each user role. Admin permissions are system-locked.
                </p>
              </div>
              <button
                onClick={handleSaveRbac}
                disabled={savingRbac}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: rbacSaved
                    ? 'linear-gradient(135deg,#16a34a,#15803d)'
                    : 'linear-gradient(135deg,#0a3d30,#062c22)',
                  boxShadow: '0 4px 14px rgba(6,44,34,0.25)',
                  minWidth: 130,
                }}
              >
                {savingRbac ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : rbacSaved ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {savingRbac ? 'Saving…' : rbacSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 rounded-full" style={{ background: 'linear-gradient(135deg,#0a3d30,#062c22)' }} />
                <span>Permission granted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 rounded-full bg-gray-200" />
                <span>Permission denied</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Locked (system-required)</span>
              </div>
            </div>

            {/* Permission cards grid */}
            <div className="grid gap-4">
              {Object.entries(ROLE_META).map(([role, meta]) => {
                const Icon = meta.icon;
                const perms = rbacPermissions[role];

                return (
                  <motion.div key={role}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    {/* Role header bar */}
                    <div className="flex items-center justify-between px-5 py-4"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: meta.bg }}>
                          <Icon className="w-4 h-4" style={{ color: meta.color }} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{meta.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{meta.desc}</p>
                        </div>
                      </div>
                      {meta.locked && (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(0,0,0,0.04)', color: '#6b7280' }}>
                          <Lock className="w-2.5 h-2.5" /> System Locked
                        </span>
                      )}
                    </div>

                    {/* Permissions grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-slate-50">
                      {Object.entries(PERMISSION_META).map(([permKey, permMeta]) => {
                        const enabled = perms[permKey];
                        return (
                          <div key={permKey}
                            className="flex flex-col items-center justify-center gap-2.5 px-4 py-4 text-center transition-all"
                            style={{
                              background: enabled
                                ? (meta.locked ? 'rgba(10,61,48,0.02)' : 'rgba(10,61,48,0.03)')
                                : 'transparent',
                            }}>
                            <p className="text-[11px] font-bold text-slate-700 leading-snug">{permMeta.label}</p>
                            <p className="text-[9px] text-slate-400 leading-snug hidden lg:block">{permMeta.desc}</p>
                            <ToggleSwitch
                              checked={enabled}
                              onChange={() => toggleRbac(role, permKey)}
                              disabled={meta.locked}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Save toast */}
            <AnimatePresence>
              {rbacSaved && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-xl flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', whiteSpace: 'nowrap' }}>
                  <CheckCircle2 className="w-4 h-4" />
                  Permissions saved successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminStaff;
