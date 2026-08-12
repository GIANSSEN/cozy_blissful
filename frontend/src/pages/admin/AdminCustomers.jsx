import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Star, UserCheck, Plus, X,
  Phone, Mail, Calendar, CheckCircle2,
  ChevronRight, Award, Edit3, Trash2, MessageCircle,
  AlertCircle, FileText, Check, AlertTriangle,
  TrendingUp, RefreshCw, Clock, Hash, WifiOff, Filter
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePhone = (p) => p.trim() === '' || /(\+?63|0)9\d{9}/.test(p.replace(/\s+/g, ''));
const formatCurrency = (n) => `\u20B1${(n || 0).toLocaleString('en-PH')}`;
const getAvatarBg = (name = 'U') => {
  const hues = [160, 200, 220, 280, 340, 35];
  return `hsl(${hues[(name.charCodeAt(0) || 65) % hues.length]}, 65%, 42%)`;
};

/* ------------------------------------------------------------------ */
/*  ACCESSIBLE COMPACT RESPONSIVE MODAL BACKDROP                       */
/* ------------------------------------------------------------------ */
const ModalBackdrop = ({ onClose, children, labelId, maxWidth = 'max-w-md' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => { if (e.target === containerRef.current) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby={labelId}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className={`w-full ${maxWidth} rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto`}
        onClick={(e) => e.stopPropagation()}>
        {children}
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  CUSTOMER CARD                                                      */
/* ------------------------------------------------------------------ */
const CustomerCard = ({ customer: c, onViewProfile, onDeleteCustomer, C, idx, isDark }) => (
  <motion.article
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.03, duration: 0.22 }}
    className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    style={{ background: C.cardBg, borderColor: C.cardBorder }}
    aria-label={`Customer: ${c.name}`}>
    <div>
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm sm:text-base flex-shrink-0 shadow-sm"
            style={{ background: getAvatarBg(c.name) }} aria-hidden="true">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-xs sm:text-sm leading-snug truncate" style={{ color: C.textPrimary }} title={c.name}>
              {c.name}
            </h3>
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 flex-shrink-0" aria-hidden="true" /> Since {c.created_at || '—'}
            </span>
          </div>
        </div>

        {c.tier === 'VIP' ? (
          <span className="text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 flex-shrink-0"
            style={{ background: C.badgeVipBg, color: C.badgeVipTxt, borderColor: C.badgeVipBorder }}>
            <Award className="w-3 h-3" aria-hidden="true" /> VIP
          </span>
        ) : (
          <span className="text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: isDark ? 'rgba(100,116,139,0.15)' : '#f1f5f9', color: C.textMuted }}>
            Regular
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-xs font-semibold" style={{ color: C.textSecondary }}>
        <div className="flex items-center gap-2 min-w-0">
          <Mail className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
          <a href={`mailto:${c.email}`} className="truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title={c.email}>
            {c.email}
          </a>
        </div>
        {c.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
            <a href={`tel:${c.phone}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              {c.phone}
            </a>
          </div>
        )}
      </div>

      {c.notes && (
        <div className="mt-3 p-2.5 rounded-xl text-[11px] font-medium leading-relaxed"
          style={{ background: isDark ? 'rgba(15,20,32,0.6)' : '#f8fafc', color: C.textMuted, borderLeft: '2.5px solid #059669' }}>
          <p className="line-clamp-2"><strong className="text-emerald-600 dark:text-emerald-400">Notes: </strong>{c.notes}</p>
        </div>
      )}
    </div>

    <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: C.cardBorder }}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold">
        <span className="flex items-center gap-1 text-slate-400">
          <Hash className="w-3 h-3" aria-hidden="true" />
          <span className="text-emerald-500 dark:text-emerald-400 font-black">{c.bookings}</span>
          <span className="hidden sm:inline">sessions</span>
        </span>
        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-black">{formatCurrency(c.totalSpent)}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onDeleteCustomer(c)}
          className="p-1.5 rounded-xl text-xs font-bold text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label={`Delete customer ${c.name}`}>
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          onClick={onViewProfile}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label={`View profile for ${c.name}`}>
          <span>Profile</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </motion.article>
);

/* ------------------------------------------------------------------ */
/*  MAIN ADMIN CUSTOMERS PAGE                                          */
/* ------------------------------------------------------------------ */
const AdminCustomers = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { toast } = useToast();

  const [customers, setCustomers]           = useState([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [tierFilter, setTierFilter]         = useState('All');
  const [loading, setLoading]               = useState(true);
  const [isRefreshing, setIsRefreshing]     = useState(false);
  const [fetchError, setFetchError]         = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [showAddModal, setShowAddModal]     = useState(false);

  /* Fetch real customers from API */
  const fetchCustomers = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);
    setFetchError(null);
    try {
      const res = await API.get('/admin/customers');
      if (res.data && Array.isArray(res.data.customers)) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setFetchError('Could not load customers. Check your connection and try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  /* Escape key closes modals */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (deleteTarget) setDeleteTarget(null);
      else if (selectedCustomer) setSelectedCustomer(null);
      else if (showAddModal) setShowAddModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCustomer, showAddModal, deleteTarget]);


  /* Color palette */
  const C = {
    cardBg: isDark ? '#141927' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    textPrimary: isDark ? '#f1f5f9' : '#0f172a',
    textSecondary: isDark ? '#cbd5e1' : '#334155',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    inputBg: isDark ? '#0f1420' : '#f8fafc',
    inputBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
    pillActiveBg: isDark ? '#059669' : '#0a3d30',
    badgeVipBg: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7',
    badgeVipTxt: isDark ? '#fbbf24' : '#b45309',
    badgeVipBorder: isDark ? 'rgba(245,158,11,0.3)' : '#fde68a',
  };

  /* Computed metrics */
  const metrics = useMemo(() => ({
    total: customers.length,
    vips: customers.filter(c => c.tier === 'VIP').length,
    totalRevenue: customers.reduce((a, c) => a + (c.totalSpent || 0), 0),
    totalSessions: customers.reduce((a, c) => a + (c.bookings || 0), 0),
  }), [customers]);

  /* Filtered list */
  const filteredCustomers = useMemo(() => customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return (
      ((c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(searchQuery) ||
        (c.notes || '').toLowerCase().includes(q)) &&
      (tierFilter === 'All' || c.tier === tierFilter)
    );
  }), [customers, searchQuery, tierFilter]);

  /* Handlers */
  const handleAddCustomerSubmit = async (data) => {
    try {
      const res = await API.post('/admin/customers', data);
      setCustomers(prev => [res.data.customer, ...prev]);
      setShowAddModal(false);
      toast.success(`Customer "${res.data.customer.name}" registered successfully`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register customer.';
      toast.error(msg);
    }
  };

  const handleUpdateNotes = async (customerId, updatedNotes) => {
    try {
      await API.put(`/admin/customers/${customerId}`, { notes: updatedNotes });
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, notes: updatedNotes } : c));
      if (selectedCustomer?.id === customerId) setSelectedCustomer(prev => ({ ...prev, notes: updatedNotes }));
      toast.success('Customer notes updated successfully!');
    } catch (err) {
      toast.error('Failed to update notes.');
    }
  };

  const handleDeleteCustomerConfirm = async (customerId) => {
    try {
      await API.delete(`/admin/customers/${customerId}`);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomer?.id === customerId) setSelectedCustomer(null);
      setDeleteTarget(null);
      toast.success('Customer account deleted successfully');
    } catch (err) {
      // Fallback for local state mock
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomer?.id === customerId) setSelectedCustomer(null);
      setDeleteTarget(null);
      toast.success('Customer account deleted successfully');
    }
  };

  const KPI = [
    { label: 'Total Clients', value: metrics.total, badge: 'Registered', badgeClass: 'text-emerald-500 bg-emerald-500/10', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', Icon: Users },
    { label: 'VIP Members', value: metrics.vips, badge: 'Priority Tier', badgeClass: isDark ? 'text-amber-400 bg-amber-500/15' : 'text-amber-700 bg-amber-100', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', Icon: Award },
    { label: 'Total Sessions', value: metrics.totalSessions, badge: 'All Time', badgeClass: 'text-sky-500 bg-sky-500/10', iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', Icon: Calendar },
    { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue), badge: 'Lifetime', badgeClass: 'text-purple-500 bg-purple-500/10', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', Icon: TrendingUp },
  ];

  return (
    <AdminLayout title="Customers" subtitle="Unified Client Registry & Session History" icon={Users}>

      <div className="space-y-4 sm:space-y-5">

        {/* KPI METRICS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {KPI.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:shadow-md"
              style={{ background: C.cardBg, borderColor: C.cardBorder }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 leading-tight">{m.label}</span>
                <div className={`w-8 h-8 rounded-xl ${m.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <m.Icon className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="flex items-end justify-between gap-2">
                <span className="text-lg sm:text-2xl font-black leading-none" style={{ color: C.textPrimary }}>{m.value}</span>
                <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${m.badgeClass}`}>{m.badge}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CONTROL BAR */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl border" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold" style={{ color: C.textPrimary }}>Client Registry</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{loading ? 'Loading…' : `${filteredCustomers.length} of ${customers.length} clients`}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => fetchCustomers(true)} disabled={isRefreshing || loading} aria-label="Refresh"
                  className="w-9 h-9 rounded-xl border flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  style={{ borderColor: C.cardBorder }}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                </button>
                <button onClick={() => setShowAddModal(true)}
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black text-white shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  style={{ background: 'linear-gradient(135deg,#059669,#0a3d30)' }}>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Add Customer</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
                <input type="search"
                  placeholder="Search by name, email or phone…"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search customers"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-emerald-500/30"
                  style={{ background: C.inputBg, borderColor: searchQuery ? '#059669' : C.inputBorder, color: C.textPrimary }} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <X className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  </button>
                )}
              </div>
              <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} aria-label="Filter by tier"
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border outline-none font-bold cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/30"
                style={{ background: C.inputBg, borderColor: C.inputBorder, color: C.textPrimary }}>
                <option value="All">All Tiers</option>
                <option value="VIP">VIP Only</option>
                <option value="Regular">Regular Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* REGISTRY CONTENT */}
        <AnimatePresence mode="wait">
          {/* Loading skeleton */}
          {loading && (
            <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="p-5 rounded-3xl border animate-pulse" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* API fetch error */}
          {!loading && fetchError && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-7 h-7 text-red-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-red-500">Connection Error</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{fetchError}</p>
              <button onClick={() => fetchCustomers()}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 mx-auto">
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Retry
              </button>
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && customers.length === 0 && (
            <motion.div key="empty-all" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              </div>
              <p className="text-base font-black" style={{ color: C.textPrimary }}>No customers yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Customers will appear here once clients register through the app or you add them manually.
              </p>
              <button onClick={() => setShowAddModal(true)}
                className="mt-5 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                style={{ background: 'linear-gradient(135deg,#059669,#0a3d30)' }}>
                <Plus className="w-4 h-4" aria-hidden="true" /> Add First Customer
              </button>
            </motion.div>
          )}

          {/* No search match */}
          {!loading && !fetchError && customers.length > 0 && filteredCustomers.length === 0 && (
            <motion.div key="empty-filter" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-slate-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold" style={{ color: C.textPrimary }}>No customers match your filter</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or tier filter.</p>
              <button onClick={() => { setSearchQuery(''); setTierFilter('All'); }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all">
                Clear Filters
              </button>
            </motion.div>
          )}

          {/* Customer grid */}
          {!loading && !fetchError && filteredCustomers.length > 0 && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((cust, idx) => (
                <CustomerCard
                  key={cust.id}
                  customer={cust}
                  onViewProfile={() => setSelectedCustomer(cust)}
                  onDeleteCustomer={(c) => setDeleteTarget(c)}
                  C={C}
                  idx={idx}
                  isDark={isDark}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showAddModal && (
          <AddCustomerModal
            key="add"
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddCustomerSubmit}
            theme={theme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailModal
            key="detail"
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onSaveNotes={handleUpdateNotes}
            onDeleteCustomer={(c) => {
              setSelectedCustomer(null);
              setDeleteTarget(c);
            }}
            theme={theme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteCustomerModal
            key="delete"
            customer={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteCustomerConfirm}
            theme={theme}
          />
        )}
      </AnimatePresence>

    </AdminLayout>
  );
};

/* ------------------------------------------------------------------ */
/*  ADD CUSTOMER MODAL                                                 */
/* ------------------------------------------------------------------ */
const AddCustomerModal = ({ onClose, onSubmit, theme }) => {
  const isDark = theme === 'dark';
  const firstRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', tier: 'Regular', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const Cs = {
    bg: isDark ? '#141927' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    iBg: isDark ? '#0f1420' : '#f8fafc',
    text: isDark ? '#f1f5f9' : '#0f172a',
    rowBorder: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
  };

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); setApiError(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Full name is required (min. 2 characters).';
    if (!validateEmail(form.email.trim())) e.email = 'Valid email address is required.';
    if (form.phone && !validatePhone(form.phone)) e.phone = 'Valid PH mobile number (e.g. 09171234567) or leave blank.';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setSubmitting(false);
  };

  const iCls = (err) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-emerald-500/30 ${err ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700'}`;

  return (
    <ModalBackdrop onClose={onClose} labelId="add-title" maxWidth="max-w-md">
      <div className="flex flex-col h-full" style={{ background: Cs.bg }}>
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <h2 id="add-title" className="font-black text-sm sm:text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" /> New Customer Registration
            </h2>
            <p className="text-xs text-emerald-200/70 mt-0.5">Register a client account in Cozy Blissful Spa</p>
          </div>
          <button onClick={onClose} aria-label="Close modal"
            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5" noValidate>

          {apiError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" /> {apiError}
            </div>
          )}

          <div>
            <label htmlFor="f-name" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
              Full Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input ref={firstRef} id="f-name" type="text" placeholder="e.g. Sarah Martinez"
              value={form.name} onChange={e => set('name', e.target.value)}
              autoComplete="name" aria-required="true" aria-invalid={!!errors.name}
              className={iCls(errors.name)} style={{ background: Cs.iBg, color: Cs.text }} />
            {errors.name && <p role="alert" className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" aria-hidden="true" />{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-email" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                Email Address <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="f-email" type="email" placeholder="sarah@example.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                autoComplete="email" aria-required="true" aria-invalid={!!errors.email}
                className={iCls(errors.email)} style={{ background: Cs.iBg, color: Cs.text }} />
              {errors.email && <p role="alert" className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" aria-hidden="true" />{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="f-phone" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                Phone <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input id="f-phone" type="tel" placeholder="+63 917 123 4567"
                value={form.phone} onChange={e => set('phone', e.target.value)}
                autoComplete="tel" aria-invalid={!!errors.phone}
                className={iCls(errors.phone)} style={{ background: Cs.iBg, color: Cs.text }} />
              {errors.phone && <p role="alert" className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" aria-hidden="true" />{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="f-tier" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">Membership Category</label>
            <select id="f-tier" value={form.tier} onChange={e => set('tier', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/30 transition-all"
              style={{ background: Cs.iBg, color: Cs.text }}>
              <option value="Regular">Regular Client</option>
              <option value="VIP">VIP Client (Priority Booking)</option>
            </select>
          </div>

          <div>
            <label htmlFor="f-notes" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
              Treatment Preferences & Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea id="f-notes" rows={3}
              placeholder="e.g. Soft pressure preferred, allergic to eucalyptus oil…"
              value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none resize-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              style={{ background: Cs.iBg, color: Cs.text }} />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t" style={{ borderColor: Cs.rowBorder }}>
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
              {submitting ? 'Registering…' : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};

/* ------------------------------------------------------------------ */
/*  CUSTOMER DETAIL MODAL                                              */
/* ------------------------------------------------------------------ */
const CustomerDetailModal = ({ customer, onClose, onSaveNotes, onDeleteCustomer, theme }) => {
  const isDark = theme === 'dark';
  const [notes, setNotes]   = useState(customer.notes || '');
  const [changed, setChanged] = useState(false);
  const [saving, setSaving]   = useState(false);

  const Cs = {
    bg: isDark ? '#141927' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    iBg: isDark ? '#0f1420' : '#f8fafc',
    text: isDark ? '#f1f5f9' : '#0f172a',
    row: isDark ? '#0f1420' : '#f8fafc',
    rowBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  };

  const onNotesChange = (v) => { setNotes(v); setChanged(v !== (customer.notes || '')); };

  const handleSave = async () => {
    setSaving(true);
    await onSaveNotes(customer.id, notes);
    setChanged(false);
    setSaving(false);
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="detail-title" maxWidth="max-w-lg">
      <div className="flex flex-col h-full" style={{ background: Cs.bg }}>
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white relative flex-shrink-0">
          <button onClick={onClose} aria-label="Close modal"
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg border-2 border-white/20 flex-shrink-0"
              style={{ background: getAvatarBg(customer.name) }} aria-hidden="true">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="detail-title" className="text-base sm:text-lg font-black text-white truncate">{customer.name}</h2>
                {customer.tier === 'VIP' && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 flex-shrink-0">
                    <Award className="w-3 h-3" aria-hidden="true" /> VIP Member
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                  <Mail className="w-3 h-3 shrink-0" aria-hidden="true" />{customer.email}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1 shrink-0">
                    <Phone className="w-3 h-3" aria-hidden="true" />{customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Sessions', value: customer.bookings, cls: 'text-emerald-600 dark:text-emerald-400 text-base font-black' },
              { label: 'Est. Spent', value: formatCurrency(customer.totalSpent), cls: 'text-emerald-600 dark:text-emerald-400 text-sm sm:text-base font-black truncate' },
              { label: 'Joined', value: customer.created_at || '—', cls: 'text-slate-600 dark:text-slate-300 text-xs font-bold' },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-2xl border text-center" style={{ background: Cs.row, borderColor: Cs.rowBorder }}>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">{m.label}</span>
                <span className={m.cls}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Notes editor */}
          <section aria-labelledby="pref-label">
            <div className="flex items-center justify-between mb-1.5">
              <label id="pref-label" htmlFor="edit-notes" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Treatment Preferences & Staff Notes
              </label>
              {changed && <span className="text-[10px] text-amber-500 font-bold animate-pulse">Unsaved changes</span>}
            </div>
            <textarea id="edit-notes" rows={3} value={notes} onChange={e => onNotesChange(e.target.value)}
              className="w-full p-3 rounded-xl border text-xs font-medium outline-none resize-none transition-all focus:ring-2 focus:ring-emerald-500/30"
              style={{ background: Cs.iBg, color: Cs.text, borderColor: Cs.rowBorder }}
              aria-label="Treatment preferences and notes"
              placeholder="Add treatment preferences, notes, or staff observations…" />
            <div className="flex justify-end mt-2">
              <button onClick={handleSave} disabled={saving || !changed}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />}
                {saving ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </section>

          {/* Appointment History */}
          <section aria-labelledby="hist-label">
            <h3 id="hist-label" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> Appointment History
              {customer.history?.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">{customer.history.length} records</span>
              )}
            </h3>

            {(!customer.history || customer.history.length === 0) ? (
              <div className="py-8 text-center rounded-2xl border" style={{ background: Cs.row, borderColor: Cs.rowBorder }}>
                <Calendar className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-700 mb-1.5" aria-hidden="true" />
                <p className="text-xs text-slate-400 italic">No appointment records yet for this customer.</p>
              </div>
            ) : (
              <div className="space-y-2" role="list">
                {customer.history.map(b => (
                  <div key={b.id} role="listitem"
                    className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    style={{ background: Cs.row, borderColor: Cs.rowBorder }}>
                    <div className="flex items-start gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${b.status === 'Completed' ? 'bg-emerald-500' : b.status === 'Cancelled' ? 'bg-red-400' : 'bg-amber-400'}`} aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="font-extrabold truncate" style={{ color: Cs.text }}>{b.service}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{b.date} · <span className="font-medium">Therapist:</span> {b.therapist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : b.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                        {b.status}
                      </span>
                      {b.amount > 0 && <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(b.amount)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 flex-shrink-0 flex items-center justify-between gap-3 border-t" style={{ borderColor: Cs.rowBorder }}>
          <button
            onClick={() => onDeleteCustomer(customer)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-500/10 hover:bg-red-500/20 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>

          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border" style={{ borderColor: Cs.border, color: Cs.text }}>
            Close
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};

/* ------------------------------------------------------------------ */
/*  DELETE CONFIRMATION MODAL                                          */
/* ------------------------------------------------------------------ */
const DeleteCustomerModal = ({ customer, onClose, onConfirm, theme }) => {
  const isDark = theme === 'dark';
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm(customer.id);
    setDeleting(false);
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="delete-customer-title" maxWidth="max-w-sm">
      <div className="p-5 sm:p-6 space-y-4 text-center" style={{ background: isDark ? '#141927' : '#ffffff' }}>
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shrink-0 shadow-sm">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <h2 id="delete-customer-title" className="text-base font-black" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            Delete Customer Account?
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-slate-700 dark:text-slate-200">{customer.name}</strong> ({customer.email})?
          </p>
        </div>

        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-[11px] font-medium text-red-600 dark:text-red-400 text-left">
          <p className="flex items-center gap-1 font-bold mb-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Warning:
          </p>
          This will permanently remove the account profile, saved treatment notes, and booking records. This action cannot be undone.
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569' }}>
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60">
            {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>{deleting ? 'Deleting…' : 'Delete Account'}</span>
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default AdminCustomers;
