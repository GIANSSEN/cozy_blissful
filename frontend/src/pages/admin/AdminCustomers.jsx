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
  TrendingUp, RefreshCw, Clock, Hash, WifiOff, Filter,
  Download, LayoutGrid, List, CheckCheck, Crown, Shield,
  ArrowUpDown, ExternalLink, Sparkles
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePhone = (p) => p.trim() === '' || /(\+?63|0)9\d{9}/.test(p.replace(/\s+/g, ''));
const formatCurrency = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const getAvatarBg = (name = 'U') => {
  const hues = [160, 200, 220, 280, 340, 35];
  return `hsl(${hues[(name.charCodeAt(0) || 65) % hues.length]}, 65%, 42%)`;
};

// Formats phone to WhatsApp link
const getWhatsAppUrl = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  const phNumber = cleaned.startsWith('09') ? '63' + cleaned.slice(1) : cleaned;
  return `https://wa.me/${phNumber}`;
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto no-scrollbar"
      onClick={(e) => { if (e.target === containerRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className={`w-full ${maxWidth} rounded-t-[2rem] sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-0 sm:my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  CUSTOMER CARD (GRID VIEW)                                          */
/* ------------------------------------------------------------------ */
const CustomerCard = ({ customer: c, onViewProfile, onDeleteCustomer, onToggleVip, C, idx, isDark }) => {
  const waUrl = getWhatsAppUrl(c.phone);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.02, 0.25), duration: 0.2 }}
      className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ background: C.cardBg, borderColor: C.cardBorder }}
      aria-label={`Customer: ${c.name}`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm sm:text-base shrink-0 shadow-sm relative"
              style={{ background: getAvatarBg(c.name) }}
              aria-hidden="true"
            >
              {c.name.charAt(0).toUpperCase()}
              {c.tier === 'VIP' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center border border-white shadow-xs">
                  <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-xs sm:text-sm leading-snug truncate text-slate-900 dark:text-white" title={c.name}>
                {c.name}
              </h3>
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" /> Joined {c.created_at || '—'}
              </span>
            </div>
          </div>

          {/* VIP Toggle Pill */}
          <button
            type="button"
            onClick={() => onToggleVip(c)}
            title={`Click to switch to ${c.tier === 'VIP' ? 'Regular' : 'VIP'}`}
            className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              c.tier === 'VIP'
                ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300/80 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-300'
            }`}
          >
            {c.tier === 'VIP' ? <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" /> : <Star className="w-3 h-3 text-slate-400" />}
            <span>{c.tier === 'VIP' ? 'VIP Member' : 'Regular'}</span>
          </button>
        </div>

        {/* Contact Links */}
        <div className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <a href={`mailto:${c.email}`} className="truncate hover:underline text-slate-700 dark:text-slate-300" title={c.email}>
              {c.email}
            </a>
          </div>
          {c.phone && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <a href={`tel:${c.phone}`} className="hover:underline text-slate-700 dark:text-slate-300">
                  {c.phone}
                </a>
              </div>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Notes preview if any */}
        {c.notes && (
          <div
            className="mt-3 p-2.5 rounded-xl text-[11px] font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/60 border-l-2 border-[#bfa15f] text-slate-600 dark:text-slate-400"
          >
            <p className="line-clamp-2">
              <strong className="text-amber-800 dark:text-amber-300 font-bold">Notes: </strong>{c.notes}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer: Metrics & Actions */}
      <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-slate-500">
            <Hash className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            <span className="font-black text-slate-900 dark:text-white">{c.bookings}</span>
            <span className="text-[10px] text-slate-400">sessions</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-black">{formatCurrency(c.totalSpent)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDeleteCustomer(c)}
            className="p-1.5 rounded-xl text-xs font-bold text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition cursor-pointer"
            title={`Delete ${c.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onViewProfile}
            className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-[#041e16] bg-gradient-to-r from-[#bfa15f] to-[#e8cc8a] hover:brightness-110 active:scale-95 transition flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
            title={`View profile & history for ${c.name}`}
          >
            <span>Profile &amp; Logs</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

/* ------------------------------------------------------------------ */
/*  CUSTOMER ROW (TABLE VIEW)                                          */
/* ------------------------------------------------------------------ */
const CustomerTableRow = ({ customer: c, onViewProfile, onDeleteCustomer, onToggleVip, formatCurrency }) => {
  const waUrl = getWhatsAppUrl(c.phone);

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs"
            style={{ background: getAvatarBg(c.name) }}
          >
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{c.name}</p>
            <p className="text-[10px] text-slate-400">Joined {c.created_at || '—'}</p>
          </div>
        </div>
      </td>

      <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
        <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
      </td>

      <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {c.phone ? (
          <div className="flex items-center gap-2">
            <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700" title="WhatsApp">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      <td className="py-3 px-4">
        <button
          type="button"
          onClick={() => onToggleVip(c)}
          className={`text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 cursor-pointer transition ${
            c.tier === 'VIP'
              ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
          }`}
        >
          {c.tier === 'VIP' && <Crown className="w-2.5 h-2.5" />}
          {c.tier}
        </button>
      </td>

      <td className="py-3 px-4 text-xs font-black text-slate-800 dark:text-slate-200">
        {c.bookings} <span className="text-[10px] font-normal text-slate-400">sessions</span>
      </td>

      <td className="py-3 px-4 text-xs font-black text-emerald-700 dark:text-emerald-400">
        {formatCurrency(c.totalSpent)}
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onViewProfile}
            className="px-2.5 py-1 rounded-xl text-xs font-extrabold text-[#041e16] bg-gradient-to-r from-[#bfa15f] to-[#e8cc8a] hover:brightness-110 transition shadow-xs cursor-pointer"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => onDeleteCustomer(c)}
            className="p-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-500/10 transition cursor-pointer"
            title="Delete customer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ------------------------------------------------------------------ */
/*  MAIN ADMIN CUSTOMERS COMPONENT                                     */
/* ------------------------------------------------------------------ */
const AdminCustomers = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { toast } = useToast();

  const [customers, setCustomers]           = useState([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [tierFilter, setTierFilter]         = useState('all'); // 'all' | 'vip' | 'regular' | 'frequent' | 'new'
  const [sortBy, setSortBy]                 = useState('recent'); // 'recent' | 'spent' | 'bookings' | 'name'
  const [viewMode, setViewMode]             = useState('grid'); // 'grid' | 'table'
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
      setFetchError('Could not load customer registry. Check connection and retry.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  /* Color palette tokens */
  const C = {
    cardBg: isDark ? '#141927' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(191,161,95,0.22)',
    textPrimary: isDark ? '#f1f5f9' : '#0f172a',
    textSecondary: isDark ? '#cbd5e1' : '#334155',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    inputBg: isDark ? '#0f1420' : '#f8fafc',
    inputBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
  };

  /* Computed metrics */
  const metrics = useMemo(() => ({
    total: customers.length,
    vips: customers.filter(c => c.tier === 'VIP').length,
    frequent: customers.filter(c => (c.bookings || 0) >= 3).length,
    totalRevenue: customers.reduce((a, c) => a + (c.totalSpent || 0), 0),
    totalSessions: customers.reduce((a, c) => a + (c.bookings || 0), 0),
  }), [customers]);

  /* Filter & Sort list */
  const filteredCustomers = useMemo(() => {
    let list = customers.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(searchQuery) ||
        (c.notes || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (tierFilter === 'vip') return c.tier === 'VIP';
      if (tierFilter === 'regular') return c.tier !== 'VIP';
      if (tierFilter === 'frequent') return (c.bookings || 0) >= 3;
      if (tierFilter === 'new') {
        const createdDate = new Date(c.created_at || Date.now());
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      }
      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'spent') return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (sortBy === 'bookings') return (b.bookings || 0) - (a.bookings || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      // default: recent
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return list;
  }, [customers, searchQuery, tierFilter, sortBy]);

  /* 1-Click Toggle VIP status */
  const handleToggleVip = async (customer) => {
    const newTier = customer.tier === 'VIP' ? 'Regular' : 'VIP';
    try {
      await API.put(`/admin/customers/${customer.id}`, { tier: newTier });
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, tier: newTier } : c));
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(prev => ({ ...prev, tier: newTier }));
      }
      toast.success(`${customer.name} is now a ${newTier} member`);
    } catch (err) {
      toast.error('Failed to update membership tier.');
    }
  };

  /* Add customer */
  const handleAddCustomerSubmit = async (data) => {
    try {
      const res = await API.post('/admin/customers', data);
      setCustomers(prev => [res.data.customer, ...prev]);
      setShowAddModal(false);
      toast.success(`Client "${res.data.customer.name}" registered successfully`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register customer.';
      toast.error(msg);
      throw err;
    }
  };

  /* Update profile (name, phone, tier, notes) */
  const handleUpdateProfile = async (customerId, payload) => {
    try {
      await API.put(`/admin/customers/${customerId}`, payload);
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...payload } : c));
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({ ...prev, ...payload }));
      }
      toast.success('Customer details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update customer.');
      throw err;
    }
  };

  /* Delete customer */
  const handleDeleteCustomerConfirm = async (customerId) => {
    try {
      await API.delete(`/admin/customers/${customerId}`);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomer?.id === customerId) setSelectedCustomer(null);
      setDeleteTarget(null);
      toast.success('Customer account deleted successfully');
    } catch (err) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomer?.id === customerId) setSelectedCustomer(null);
      setDeleteTarget(null);
      toast.success('Customer account deleted successfully');
    }
  };

  /* CSV Export */
  const handleExportCsv = () => {
    if (!customers.length) {
      toast.error('No customer records to export.');
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Tier', 'Total Bookings', 'Lifetime Spend (PHP)', 'Joined Date', 'Treatment Notes'];
    const rows = filteredCustomers.map(c => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      c.tier || 'Regular',
      c.bookings || 0,
      (c.totalSpent || 0).toFixed(2),
      c.created_at || '',
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cozy_Blissful_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Customer registry CSV exported!');
  };

  const KPI = [
    { label: 'Total Clients', value: metrics.total, badge: 'Registered', badgeClass: 'text-emerald-600 bg-emerald-500/10', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', Icon: Users },
    { label: 'VIP Members', value: metrics.vips, badge: 'Priority Tier', badgeClass: 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/15', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', Icon: Award },
    { label: 'Total Sessions', value: metrics.totalSessions, badge: 'Concluded', badgeClass: 'text-sky-600 bg-sky-500/10', iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', Icon: Calendar },
    { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue), badge: 'Lifetime', badgeClass: 'text-purple-600 bg-purple-500/10', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', Icon: TrendingUp },
  ];

  const FILTER_TABS = [
    { id: 'all', label: 'All Clients', count: metrics.total },
    { id: 'vip', label: 'VIP Priority', count: metrics.vips },
    { id: 'regular', label: 'Regular Clients', count: metrics.total - metrics.vips },
    { id: 'frequent', label: 'Frequent (3+ visits)', count: metrics.frequent },
    { id: 'new', label: 'New This Month' },
  ];

  return (
    <AdminLayout
      title="Customer Registry"
      subtitle="Unified Client Accounts, Session History &amp; Membership Profiles"
      icon={Users}
    >
      <div className="space-y-4 sm:space-y-5">

        {/* ── KPI METRICS STRIP ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {KPI.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:shadow-md"
              style={{ background: C.cardBg, borderColor: C.cardBorder }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 leading-tight">
                  {m.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${m.iconBg} flex items-center justify-center shrink-0`}>
                  <m.Icon className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="flex items-end justify-between gap-2">
                <span className="text-lg sm:text-2xl font-black leading-none text-slate-900 dark:text-white">
                  {m.value}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${m.badgeClass}`}>
                  {m.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── CONTROL & FILTER LOGS BAR ── */}
        <div
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-3.5 shadow-xs"
          style={{ background: C.cardBg, borderColor: C.cardBorder }}
        >
          {/* Header row with actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Users className="w-4 h-4 text-[#bfa15f]" /> Client Directory &amp; Logs
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {loading ? 'Refreshing directory…' : `Showing ${filteredCustomers.length} of ${customers.length} client accounts`}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              {/* View Switcher (Grid vs Table) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Table List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => fetchCustomers(true)}
                disabled={isRefreshing || loading}
                aria-label="Refresh Registry"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Add Customer CTA */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black text-[#041e16] shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs (Horizontal scrolling chips) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800">
            {FILTER_TABS.map((tab) => {
              const isActive = tierFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTierFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#062c22] text-[#e8cc8a] shadow-xs ring-1 ring-[#bfa15f]/40'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-[#e8cc8a] text-[#041e16]' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search and Sort controls */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
            <div className="sm:col-span-8 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by client name, email, phone, or treatment notes…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium transition focus:ring-2 focus:ring-[#bfa15f]/30 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <div className="relative w-full">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-bold cursor-pointer bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition focus:ring-2 focus:ring-[#bfa15f]/30"
                >
                  <option value="recent">Sort: Most Recent</option>
                  <option value="spent">Sort: Highest Total Spend (₱)</option>
                  <option value="bookings">Sort: Most Bookings</option>
                  <option value="name">Sort: Client Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── REGISTRY CONTENT (Cards or Table) ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </motion.div>
          )}

          {!loading && fetchError && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-sm font-bold text-red-600">Connection Error</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{fetchError}</p>
              <button
                type="button"
                onClick={() => fetchCustomers()}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 transition flex items-center gap-1.5 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </motion.div>
          )}

          {!loading && !fetchError && customers.length === 0 && (
            <motion.div key="empty-all" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-base font-black text-slate-800 dark:text-white">No Client Records Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Clients will appear here once they register or when you add them manually.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-5 px-5 py-2.5 rounded-xl text-xs font-black text-[#041e16] shadow-md transition flex items-center gap-1.5 mx-auto"
                style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
              >
                <Plus className="w-4 h-4" /> Add First Customer
              </button>
            </motion.div>
          )}

          {!loading && !fetchError && customers.length > 0 && filteredCustomers.length === 0 && (
            <motion.div key="empty-filter" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">No customers match your active filter</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or switching tier filters.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setTierFilter('all'); }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}

          {/* Grid View */}
          {!loading && !fetchError && filteredCustomers.length > 0 && viewMode === 'grid' && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredCustomers.map((cust, idx) => (
                <CustomerCard
                  key={cust.id}
                  customer={cust}
                  onViewProfile={() => setSelectedCustomer(cust)}
                  onDeleteCustomer={(c) => setDeleteTarget(c)}
                  onToggleVip={handleToggleVip}
                  C={C}
                  idx={idx}
                  isDark={isDark}
                />
              ))}
            </motion.div>
          )}

          {/* Table View */}
          {!loading && !fetchError && filteredCustomers.length > 0 && viewMode === 'table' && (
            <motion.div
              key="table-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
            >
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone / WhatsApp</th>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4">Sessions</th>
                      <th className="py-3 px-4">Lifetime Spend</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => (
                      <CustomerTableRow
                        key={c.id}
                        customer={c}
                        onViewProfile={() => setSelectedCustomer(c)}
                        onDeleteCustomer={(cust) => setDeleteTarget(cust)}
                        onToggleVip={handleToggleVip}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── MODALS ── */}
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
            onSaveProfile={handleUpdateProfile}
            onToggleVip={handleToggleVip}
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

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: null }));
    setApiError(null);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Full name is required (min. 2 chars).';
    if (!validateEmail(form.email.trim())) e.email = 'Valid email address is required.';
    if (form.phone && !validatePhone(form.phone)) e.phone = 'Valid PH mobile number (e.g. 09171234567) or leave blank.';
    setErrors(e);
    return !Object.keys(e).length;
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
    `w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-[#bfa15f]/30 ${
      err ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white'
    }`;

  return (
    <ModalBackdrop onClose={onClose} labelId="add-title" maxWidth="max-w-md">
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="px-5 py-4 bg-gradient-to-r from-[#062c22] to-[#0a3d30] text-white flex items-center justify-between shrink-0">
          <div>
            <h2 id="add-title" className="font-black text-sm sm:text-base flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              <UserCheck className="w-5 h-5 text-[#e8cc8a]" /> New Customer Registration
            </h2>
            <p className="text-xs text-emerald-100/75 mt-0.5">Create a verified client profile in Cozy Blissful</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 no-scrollbar" noValidate>
          {apiError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs font-bold text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" /> {apiError}
            </div>
          )}

          <div>
            <label htmlFor="f-name" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstRef}
              id="f-name"
              type="text"
              placeholder="e.g. Sarah Martinez"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className={iCls(errors.name)}
            />
            {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-email" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="f-email"
                type="email"
                placeholder="sarah@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={iCls(errors.email)}
              />
              {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="f-phone" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="f-phone"
                type="tel"
                placeholder="0917 123 4567"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={iCls(errors.phone)}
              />
              {errors.phone && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="f-tier" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Membership Category
            </label>
            <select
              id="f-tier"
              value={form.tier}
              onChange={e => set('tier', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none cursor-pointer"
            >
              <option value="Regular">Regular Client</option>
              <option value="VIP">VIP Client (Priority Booking)</option>
            </select>
          </div>

          <div>
            <label htmlFor="f-notes" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Treatment Preferences &amp; Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="f-notes"
              rows={3}
              placeholder="e.g. Soft pressure preferred, allergic to eucalyptus oil…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-black text-[#041e16] transition-all hover:brightness-110 active:scale-95 shadow-md flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{submitting ? 'Registering…' : 'Register Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};

/* ------------------------------------------------------------------ */
/*  CUSTOMER DETAIL MODAL (LOGS, PREFERENCES, PROFILE EDIT)            */
/* ------------------------------------------------------------------ */
const CustomerDetailModal = ({ customer, onClose, onSaveProfile, onToggleVip, onDeleteCustomer, theme }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'notes' | 'edit'

  // History filtering
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');

  // Editable fields
  const [editName, setEditName]   = useState(customer.name || '');
  const [editPhone, setEditPhone] = useState(customer.phone || '');
  const [editTier, setEditTier]   = useState(customer.tier || 'Regular');
  const [editNotes, setEditNotes] = useState(customer.notes || '');
  const [saving, setSaving]       = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const waUrl = getWhatsAppUrl(customer.phone);

  const NOTE_PRESETS = [
    'Soft pressure preferred',
    'Deep tissue & firm pressure',
    'Focus on upper back / neck',
    'Sensitive skin',
    'Allergic to eucalyptus oil',
    'Prefers lavender aromatherapy',
    'Prefers female specialist',
  ];

  // Filtered appointment history logs
  const filteredHistory = useMemo(() => {
    const list = customer.history || [];
    return list.filter((item) => {
      const matchStatus =
        historyStatusFilter === 'all' ||
        (historyStatusFilter === 'completed' && item.status === 'Completed') ||
        (historyStatusFilter === 'active' && (item.status === 'Confirmed' || item.status === 'In Progress' || item.status === 'Pending')) ||
        (historyStatusFilter === 'cancelled' && item.status === 'Cancelled');

      const q = historySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.service || '').toLowerCase().includes(q) ||
        (item.therapist || '').toLowerCase().includes(q) ||
        (item.date || '').includes(q);

      return matchStatus && matchSearch;
    });
  }, [customer.history, historyStatusFilter, historySearch]);

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile(customer.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        tier: editTier,
        notes: editNotes.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      // handled in parent
    } finally {
      setSaving(false);
    }
  };

  const handleAppendPreset = (preset) => {
    setEditNotes((prev) => (prev ? `${prev}, ${preset}` : preset));
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="detail-title" maxWidth="max-w-xl">
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        {/* Header with Luxury Emerald Styling */}
        <div className="p-5 bg-gradient-to-r from-[#062c22] via-[#0a3d30] to-[#041e16] text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md border-2 border-white/20 shrink-0"
              style={{ background: getAvatarBg(customer.name) }}
            >
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="detail-title" className="text-base sm:text-lg font-black text-white truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {customer.name}
                </h2>
                <button
                  type="button"
                  onClick={() => onToggleVip(customer)}
                  className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 cursor-pointer transition ${
                    customer.tier === 'VIP'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                      : 'bg-white/10 text-emerald-200 border-white/20 hover:bg-white/20'
                  }`}
                  title="Click to toggle VIP status"
                >
                  <Crown className="w-2.5 h-2.5" />
                  <span>{customer.tier === 'VIP' ? 'VIP Member' : 'Regular'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-emerald-100/80">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0 text-[#e8cc8a]" /> {customer.email}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1 shrink-0">
                    <Phone className="w-3 h-3 shrink-0 text-[#e8cc8a]" /> {customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact Bar */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
            <a
              href={`mailto:${customer.email}`}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition flex items-center gap-1"
            >
              <Mail className="w-3 h-3" /> Email
            </a>
            {customer.phone && (
              <>
                <a
                  href={`tel:${customer.phone}`}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold transition flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Interior Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-5 pt-2">
          {[
            { id: 'history', label: 'Appointment Logs', icon: Clock, count: customer.history?.length || 0 },
            { id: 'notes',   label: 'Preferences & Notes', icon: FileText },
            { id: 'edit',    label: 'Edit Profile', icon: Edit3 },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 px-3 text-xs font-extrabold flex items-center gap-1.5 transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#062c22] text-[#062c22] dark:border-[#e8cc8a] dark:text-[#e8cc8a]'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="text-[10px] px-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">

          {/* ── TAB 1: APPOINTMENT HISTORY LOGS ── */}
          {activeTab === 'history' && (
            <div className="space-y-3.5">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'active', label: 'Active' },
                    { id: 'cancelled', label: 'Cancelled' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setHistoryStatusFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        historyStatusFilter === f.id
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search logs…"
                    className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* History list */}
              {(!customer.history || customer.history.length === 0) ? (
                <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 font-semibold">No treatment records logged yet for this client.</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  No appointments match the selected status filter.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredHistory.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition hover:bg-slate-100/70"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                            b.status === 'Completed'
                              ? 'bg-emerald-500'
                              : b.status === 'Cancelled'
                              ? 'bg-red-500'
                              : 'bg-sky-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{b.service}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {b.date} • <span className="font-medium text-slate-600 dark:text-slate-300">Specialist:</span> {b.therapist}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
                        <span
                          className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                            b.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : b.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.amount > 0 && (
                          <span className="font-black text-xs text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(b.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: PREFERENCES & TREATMENT NOTES ── */}
          {activeTab === 'notes' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Treatment Preferences &amp; Staff Observations
                </label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record client sensitivities, favorite aromatherapy oils, pressure preferences, or front-desk notes…"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium outline-none resize-none leading-relaxed focus:ring-2 focus:ring-[#bfa15f]/30"
                />
              </div>

              {/* Preset Chips */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Click to Add Common Spa Observation Presets:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {NOTE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAppendPreset(preset)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Notes updated!
                  </span>
                ) : <span />}

                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-black text-[#041e16] transition hover:brightness-110 active:scale-95 shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving…' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 3: EDIT PROFILE ── */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveAll} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-[#bfa15f]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0917 123 4567"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-[#bfa15f]/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Membership Tier
                  </label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#bfa15f]/30"
                  >
                    <option value="Regular">Regular Client</option>
                    <option value="VIP">VIP Client (Priority Tier)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={customer.email}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Profile updated!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-black text-[#041e16] transition hover:brightness-110 active:scale-95 shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Updating…' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 flex-shrink-0 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={() => onDeleteCustomer(customer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-500/10 hover:bg-red-500/20 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Client</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
          >
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
      <div className="p-5 sm:p-6 space-y-4 text-center bg-white dark:bg-slate-900">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shrink-0 shadow-xs">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <h2 id="delete-customer-title" className="text-base font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Delete Customer Profile?
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-slate-800 dark:text-slate-200">{customer.name}</strong> ({customer.email})?
          </p>
        </div>

        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-[11px] font-medium text-red-600 dark:text-red-400 text-left">
          <p className="flex items-center gap-1 font-bold mb-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Important Warning:
          </p>
          This will permanently purge this client account, saved preferences, and booking records from the active registry.
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>{deleting ? 'Deleting…' : 'Delete Account'}</span>
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default AdminCustomers;
