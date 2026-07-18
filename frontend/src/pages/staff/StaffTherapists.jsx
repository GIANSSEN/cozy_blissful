import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import StaffLayout from './StaffLayout';
import {
  ImageTextSkeletonGrid
} from '../../components/Skeleton';
import {
  Users, CalendarDays, Activity, Check, AlertCircle,
  UserCheck, Clock, RefreshCw
} from 'lucide-react';

const ClayCard = ({ children, className = '', style = {}, ...props }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
      boxShadow: '16px 16px 32px #eae6df, -16px -16px 32px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
      border: '1px solid rgba(255,255,255,0.8)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const formatDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TABS = [
  { id: 'schedule',     label: 'Schedule Coordinator', icon: CalendarDays },
  { id: 'availability', label: 'Availability Calendar',  icon: Activity },
];

const StaffTherapists = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'schedule';

  const [therapists, setTherapists] = useState([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const loadTherapists = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await API.get('/staff/therapists');
      const list = res.data.therapists || [];
      setTherapists(list);
      if (list.length > 0 && !selectedTherapistId) setSelectedTherapistId(list[0].id);
    } catch {
      showToast('Failed to load therapists.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadTherapists(); }, []);

  const toggleAvailability = async (therapistId, dateStr) => {
    try {
      const res = await API.post('/staff/availability/toggle', { therapist_id: therapistId, date: dateStr });
      setTherapists(prev => prev.map(t => {
        if (t.id === therapistId) {
          const updated = res.data.available
            ? [...t.availabilities, dateStr]
            : t.availabilities.filter(d => d !== dateStr);
          return { ...t, availabilities: updated };
        }
        return t;
      }));
      showToast(res.data.message || 'Schedule updated.');
    } catch {
      showToast('Failed to update schedule.');
    }
  };

  const getNextDays = (count = 7) => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const day = new Date();
      day.setDate(today.getDate() + i);
      list.push(day);
    }
    return list;
  };

  const nextDays = getNextDays(7);
  const nextTwoWeeks = getNextDays(14);
  const selectedTherapist = therapists.find(t => t.id === Number(selectedTherapistId));

  return (
    <StaffLayout
      title="Therapist Management"
      subtitle={TABS.find(t => t.id === activeTab)?.label}
    >
      <div className="space-y-6">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl w-fit"
          style={{ background: 'linear-gradient(145deg,#eae6df,#f5f0e8)', boxShadow: 'inset 3px 3px 8px #d5d0c9, inset -3px -3px 8px #ffffff' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                style={active
                  ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '4px 4px 10px rgba(6,44,34,0.25)' }
                  : { background: 'transparent', color: '#64748b' }
                }>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
          <button onClick={() => loadTherapists(true)} disabled={refreshing}
            className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'transparent', color: '#94a3b8' }}
            title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <ImageTextSkeletonGrid cols="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        ) : (
          <>
            {/* ── Schedule Coordinator Tab ── */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <ClayCard className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400">
                      Select Therapist to Edit Schedule
                    </label>
                    <select value={selectedTherapistId} onChange={e => setSelectedTherapistId(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                      style={{ boxShadow: 'inset 2px 2px 5px #ece8e0, inset -2px -2px 5px #ffffff' }}>
                      {therapists.map(t => (
                        <option key={t.id} value={t.id}>{t.name} — {t.specialty}</option>
                      ))}
                    </select>
                  </div>

                  {selectedTherapist && (
                    <motion.div key={selectedTherapist.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-2xl"
                        style={{ background: 'linear-gradient(135deg,rgba(6,44,34,0.04),rgba(6,44,34,0.02))', border: '1px solid rgba(6,44,34,0.08)' }}>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
                          {selectedTherapist.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{selectedTherapist.name}</p>
                          <p className="text-[10px] text-slate-400">{selectedTherapist.specialty} · {selectedTherapist.email}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500">
                        Tap any date below to <strong className="text-emerald-800">toggle availability</strong> for this therapist.
                        Green = available, grey = unavailable.
                      </p>

                      <div className="grid grid-cols-7 gap-2 text-center">
                        {nextDays.map((day) => {
                          const dateStr = formatDateString(day);
                          const isAvailable = selectedTherapist.availabilities?.includes(dateStr);
                          return (
                            <button key={dateStr}
                              onClick={() => toggleAvailability(selectedTherapist.id, dateStr)}
                              className="p-2.5 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                              style={isAvailable
                                ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '4px 4px 10px rgba(6,44,34,0.25)' }
                                : { background: 'linear-gradient(135deg,#fdfcfa,#ece8e0)', color: '#64748b', boxShadow: 'inset 2px 2px 5px #e0dbd3, inset -2px -2px 5px #ffffff' }
                              }>
                              <span className="text-[9px] font-semibold opacity-80 uppercase">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                              <span className="text-sm font-black mt-0.5">{day.getDate()}</span>
                              {isAvailable && <Check className="w-3.5 h-3.5 mt-1 text-emerald-300" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </ClayCard>

                {/* All Therapists Quick View */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-800" /> All Therapists Overview
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {therapists.map((t, i) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}>
                        <ClayCard className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
                              {t.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-sm truncate">{t.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{t.specialty}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {nextDays.slice(0, 7).map(day => {
                              const dateStr = formatDateString(day);
                              const isAvail = t.availabilities?.includes(dateStr);
                              return (
                                <div key={dateStr}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                                  style={isAvail
                                    ? { background: 'rgba(6,44,34,0.9)', color: '#fff' }
                                    : { background: '#f1ede6', color: '#94a3b8' }
                                  }>
                                  {day.getDate()}
                                </div>
                              );
                            })}
                          </div>
                        </ClayCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Availability Calendar Tab ── */}
            {activeTab === 'availability' && (
              <div className="space-y-4">
                <ClayCard className="p-6 overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Header row: dates */}
                    <div className="flex gap-2 mb-4">
                      <div className="w-40 flex-shrink-0" />
                      {nextTwoWeeks.map(day => (
                        <div key={formatDateString(day)}
                          className="flex-1 min-w-[36px] text-center">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                          <p className="text-[11px] font-black text-slate-700">{day.getDate()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Therapist rows */}
                    {therapists.map((t, i) => (
                      <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 mb-2">
                        <div className="w-40 flex-shrink-0 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
                            {t.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-700 truncate">{t.name}</p>
                            <p className="text-[9px] text-slate-400 truncate">{t.specialty}</p>
                          </div>
                        </div>
                        {nextTwoWeeks.map(day => {
                          const dateStr = formatDateString(day);
                          const isAvail = t.availabilities?.includes(dateStr);
                          return (
                            <button key={dateStr}
                              onClick={() => toggleAvailability(t.id, dateStr)}
                              className="flex-1 min-w-[36px] h-9 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                              style={isAvail
                                ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', boxShadow: '2px 2px 6px rgba(6,44,34,0.2)' }
                                : { background: '#f1ede6', border: '1px solid rgba(0,0,0,0.04)' }
                              }
                              title={`${t.name} – ${dateStr}`}>
                              {isAvail && <Check className="w-3 h-3 text-emerald-300" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    ))}
                  </div>
                </ClayCard>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }} />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ background: '#f1ede6', border: '1px solid rgba(0,0,0,0.06)' }} />
                    <span>Unavailable</span>
                  </div>
                  <span className="text-[10px] text-slate-400 italic">Click any cell to toggle</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-xl flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', whiteSpace: 'nowrap' }}>
          <Check className="w-4 h-4 text-emerald-300" />
          {toastMsg}
        </div>
      )}
    </StaffLayout>
  );
};

export default StaffTherapists;
