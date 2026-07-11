import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import {
  DollarSign, Calendar, Users, TrendingUp, Sparkles, TrendingDown,
  Clock, ArrowUpRight, BarChart3, CheckCircle2, AlertCircle, RefreshCw, Activity
} from 'lucide-react';

const cardIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: 'easeOut' },
  }),
};

const ClayCard = ({ children, className = '', style = {}, ...props }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
      boxShadow: '16px 16px 36px #eae6df, -16px -16px 36px #ffffff, inset 3px 3px 6px rgba(255,255,255,0.7)',
      border: '1px solid rgba(255,255,255,0.8)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const MiniStat = ({ label, value, sub, icon: Icon, color, delay }) => (
  <motion.div
    custom={delay}
    variants={cardIn}
    initial="hidden"
    animate="visible"
    className="flex items-center gap-3.5 px-5 py-4 rounded-2xl"
    style={{
      background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
      boxShadow: '6px 6px 16px #eae6df, -6px -6px 16px #ffffff',
      border: '1px solid rgba(255,255,255,0.6)',
    }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}20`,
      }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-base font-black text-slate-800 leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{sub}</p>}
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'operational';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'sales': return 'Sales & Revenue Analytics';
      case 'funnel': return 'Booking Funnel Stats';
      case 'operational':
      default: return 'Operational Overview';
    }
  };

  return (
    <AdminLayout title="Dashboard" subtitle={getPageTitle()}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: '#f0ece4', borderTopColor: '#062c22' }} />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Tab Content 1: Operational Overview */}
          {activeTab === 'operational' && (
            <div className="space-y-6">
              {/* Quick stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MiniStat icon={Users} label="Active Therapists" value={data?.stats?.active_therapists || 0} sub="Currently on duty today" color="#062c22" delay={0} />
                <MiniStat icon={Activity} label="Ongoing Sessions" value="4 Active" sub="In-home treatments now" color="#bfa15f" delay={1} />
                <MiniStat icon={Calendar} label="Total Bookings" value={data?.stats?.total_bookings || 0} sub="Scheduled sessions" color="#2563eb" delay={2} />
                <MiniStat icon={TrendingUp} label="Registered Clients" value={data?.stats?.registered_clients || 0} sub="Registered users" color="#db2777" delay={3} />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Ongoing Sessions List */}
                <ClayCard className="p-6 md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-800" /> Active Ongoing Sessions
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Tracking
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: 1, client: 'Sarah Martinez', therapist: 'Maria Santos', service: 'Swedish Massage (60 min)', start: '09:00 PM', end: '10:00 PM', progress: 75, location: 'Makati City' },
                      { id: 2, client: 'David Lim', therapist: 'John Doe', service: 'Combination Swedish & Hilot (90 min)', start: '09:15 PM', end: '10:45 PM', progress: 50, location: 'Quezon City' },
                      { id: 3, client: 'Patricia Go', therapist: 'Anna Reyes', service: 'Regular Mani & Pedi (60 min)', start: '09:30 PM', end: '10:30 PM', progress: 20, location: 'BGC, Taguig' }
                    ].map(session => (
                      <div key={session.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{session.service}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Client: <span className="font-semibold text-slate-600">{session.client}</span> · Therapist: <span className="font-semibold text-emerald-800">{session.therapist}</span></p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-100">{session.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-800 rounded-full transition-all" style={{ width: `${session.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{session.start} - {session.end}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ClayCard>

                {/* Operations Overview Summary */}
                <ClayCard className="p-6 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Therapist Status Today</h3>
                  <div className="space-y-3.5">
                    {[
                      { status: 'On Duty & Available', count: 18, color: '#16a34a' },
                      { status: 'Currently in Treatment', count: 4, color: '#bfa15f' },
                      { status: 'On Break / Offline', count: 8, color: '#94a3b8' }
                    ].map(status => (
                      <div key={status.status} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
                          <span className="text-xs font-semibold text-slate-600">{status.status}</span>
                        </div>
                        <span className="text-xs font-black text-slate-800">{status.count}</span>
                      </div>
                    ))}
                  </div>
                </ClayCard>
              </div>
            </div>
          )}

          {/* Tab Content 2: Sales & Revenue Analytics */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Daily Sales breakdown quick card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MiniStat icon={DollarSign} label="Today's Revenue" value={`₱${(data?.stats?.total_revenue || 0).toLocaleString()}`} sub="All booking invoice total" color="#062c22" delay={0} />
                <MiniStat icon={TrendingUp} label="Daily Average Ticket" value="₱850" sub="Average customer invoice" color="#bfa15f" delay={1} />
                <MiniStat icon={DollarSign} label="Therapist Commissions Paid" value="₱12,450" sub="Calculated therapist pay" color="#2563eb" delay={2} />
              </div>

              {/* Sales Chart representation */}
              <ClayCard className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Sales Trend Overview (Last 7 Days)</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue (PHP)</span>
                </div>
                
                {/* Simulated vertical chart bars */}
                <div className="flex items-end justify-between gap-2 pt-6 h-48 border-b border-slate-100 pb-1">
                  {[
                    { day: 'Mon', value: 7490, height: '45%' },
                    { day: 'Tue', value: 8500, height: '55%' },
                    { day: 'Wed', value: 12450, height: '80%' },
                    { day: 'Thu', value: 9200, height: '60%' },
                    { day: 'Fri', value: 15600, height: '95%' },
                    { day: 'Sat', value: 14200, height: '90%' },
                    { day: 'Sun', value: 16800, height: '100%' }
                  ].map(bar => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full relative flex items-end justify-center rounded-t-lg bg-slate-100 hover:bg-emerald-950/10 transition-colors" style={{ height: '140px' }}>
                        <div className="w-10 rounded-t-md bg-emerald-950/80 group-hover:bg-emerald-950 transition-all duration-300" style={{ height: bar.height }} />
                        <span className="absolute -top-6 text-[9px] font-bold text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity">₱{bar.value.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{bar.day}</span>
                    </div>
                  ))}
                </div>

                {/* Legend & Breakdown */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Massage Revenue</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">₱62,450</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Nail Care Revenue</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">₱18,240</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Other Services</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">₱9,800</p>
                  </div>
                </div>
              </ClayCard>
            </div>
          )}

          {/* Tab Content 3: Booking Funnel Stats */}
          {activeTab === 'funnel' && (
            <div className="space-y-6">
              {/* Stats overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MiniStat icon={Calendar} label="Conversion Rate" value="68.4%" sub="Visits converted to bookings" color="#062c22" delay={0} />
                <MiniStat icon={CheckCircle2} label="Completion Rate" value="92.1%" sub="Completed service rate" color="#bfa15f" delay={1} />
                <MiniStat icon={AlertCircle} label="Cancellation Rate" value="4.8%" sub="Cancelled requests rate" color="#ef4444" delay={2} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Booking funnel visual card */}
                <ClayCard className="p-6 space-y-6">
                  <h3 className="font-bold text-slate-800 text-sm">Customer Conversion Funnel</h3>
                  
                  <div className="space-y-4">
                    {[
                      { step: 'Page Visits', count: '10,240', rate: '100%', color: 'bg-emerald-950' },
                      { step: 'Service Clicks', count: '4,850', rate: '47.3%', color: 'bg-emerald-900' },
                      { step: 'Bookings Requested', count: '1,240', rate: '25.5%', color: 'bg-emerald-800' },
                      { step: 'Bookings Confirmed', count: '1,120', rate: '90.3%', color: 'bg-amber-600' },
                      { step: 'Completed Treatment', count: '1,032', rate: '92.1%', color: 'bg-amber-500' }
                    ].map(f => (
                      <div key={f.step} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{f.step} ({f.count})</span>
                          <span className="text-slate-400">{f.rate}</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${f.color} rounded-full`} style={{ width: f.rate }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ClayCard>

                {/* Booking status rates stacked indicator */}
                <ClayCard className="p-6 space-y-6">
                  <h3 className="font-bold text-slate-800 text-sm">Overall Appointment Status Breakdown</h3>
                  
                  {/* Status Bar */}
                  <div className="h-6 w-full rounded-full flex overflow-hidden border border-white">
                    <div className="bg-emerald-950 h-full flex items-center justify-center text-[9px] font-black text-white" style={{ width: '84%' }}>84% Confirmed</div>
                    <div className="bg-amber-500 h-full flex items-center justify-center text-[9px] font-black text-emerald-950" style={{ width: '11%' }}>11% Pending</div>
                    <div className="bg-red-500 h-full flex items-center justify-center text-[9px] font-black text-white" style={{ width: '5%' }}>5% Cancelled</div>
                  </div>

                  <div className="space-y-3.5 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-950" />
                        <span className="font-semibold text-slate-600">Confirmed Bookings</span>
                      </div>
                      <span className="font-bold text-slate-800">940 Sessions</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="font-semibold text-slate-600">Pending Approvals</span>
                      </div>
                      <span className="font-bold text-slate-800">124 Requests</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="font-semibold text-slate-600">Cancellations</span>
                      </div>
                      <span className="font-bold text-slate-800">56 Sessions</span>
                    </div>
                  </div>
                </ClayCard>
              </div>
            </div>
          )}

        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
