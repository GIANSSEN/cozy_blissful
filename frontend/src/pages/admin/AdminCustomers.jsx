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
  TrendingUp, RefreshCw, Clock, Hash, WifiOff,
  Download, LayoutGrid, List, Crown,
  ArrowUpDown, User, Sparkles, Shield
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  HELPERS & FORMATTERS                                               */
/* ------------------------------------------------------------------ */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const cleanPhoneNumber = (p) => (p || '').replace(/[\s\-()]/g, '');

const validatePhone = (p) => {
  if (!p || p.trim() === '') return true; // Phone is optional
  const cleaned = cleanPhoneNumber(p);
  // Valid PH mobile: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX or 639XXXXXXXXX (12-13 digits)
  return /^(09|\+?639)\d{9}$/.test(cleaned);
};

const formatPhoneDisplay = (p) => {
  if (!p) return '';
  const cleaned = cleanPhoneNumber(p);
  if (/^09\d{9}$/.test(cleaned)) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (/^(\+?639)\d{9}$/.test(cleaned)) {
    const norm = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    return `${norm.slice(0, 4)} ${norm.slice(4, 7)} ${norm.slice(7, 10)} ${norm.slice(10)}`;
  }
  return p;
};

const formatDisplayName = (name = '') => {
  if (!name) return 'Valued Client';
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatCurrency = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getAvatarBg = (name = 'U') => {
  const hues = [160, 200, 220, 280, 340, 35];
  const charCode = (name && name.length > 0) ? name.charCodeAt(0) : 65;
  return `hsl(${hues[charCode % hues.length]}, 65%, 42%)`;
};

// Formats phone to WhatsApp link
const getWhatsAppUrl = (phone) => {
  if (!phone) return null;
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return null;
  const phNumber = cleaned.startsWith('09')
    ? '63' + cleaned.slice(1)
    : cleaned.replace(/^\+/, '');
  return `https://wa.me/${phNumber}`;
};

/* ------------------------------------------------------------------ */
/*  ACCESSIBLE ROCK-SOLID RESPONSIVE MODAL BACKDROP                    */
/* ------------------------------------------------------------------ */
const MODAL_SIZES = {
  sm: { width: '100%', maxWidth: '440px' },
  md: { width: '100%', maxWidth: '580px' },
  lg: { width: '100%', maxWidth: '740px' },
  xl: { width: '100%', maxWidth: '860px' },
};

const ModalBackdrop = ({ onClose, children, labelId, descId, size = 'md', isAlert = false }) => {
  const containerRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalContentRef.current) {
        const focusable = modalContentRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent background page from scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => { if (e.target === containerRef.current) onClose(); }}
      role={isAlert ? 'alertdialog' : 'dialog'}
      aria-modal="true"
      aria-labelledby={labelId}
      aria-describedby={descId}
    >
      <motion.div
        ref={modalContentRef}
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 14 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        style={MODAL_SIZES[size] || MODAL_SIZES.md}
        className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[86vh] sm:max-h-[85vh] my-auto bg-white dark:bg-[#0d131f] min-h-0"
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
const CustomerCard = ({ customer: c, onViewProfile, onDeleteCustomer, onToggleVip, isTogglingVip, C, idx }) => {
  const waUrl = getWhatsAppUrl(c.phone);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.02, 0.25), duration: 0.2 }}
      className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
      style={{ background: C.cardBg, borderColor: C.cardBorder }}
      aria-label={`Customer card for ${c.name}`}
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm sm:text-base shrink-0 shadow-sm relative select-none"
              style={{ background: getAvatarBg(c.name) }}
              aria-hidden="true"
            >
              {(c.name || 'C').charAt(0).toUpperCase()}
              {c.tier === 'VIP' && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs"
                  title="VIP Member"
                >
                  <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-black text-xs sm:text-sm leading-snug truncate text-slate-900 dark:text-white" title={c.name}>
                {formatDisplayName(c.name)}
              </h3>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>Joined {c.created_at || '—'}</span>
              </span>
            </div>
          </div>

          {/* VIP Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleVip(c)}
            disabled={isTogglingVip}
            aria-label={`Membership tier: ${c.tier}. Click to switch to ${c.tier === 'VIP' ? 'Regular' : 'VIP'}`}
            aria-pressed={c.tier === 'VIP'}
            title={`Click to switch to ${c.tier === 'VIP' ? 'Regular' : 'VIP'}`}
            className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 ${
              c.tier === 'VIP'
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400/60 shadow-xs ring-1 ring-amber-400/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400/60'
            }`}
          >
            {isTogglingVip ? (
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-500" />
            ) : c.tier === 'VIP' ? (
              <Crown className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Star className="w-2.5 h-2.5 text-slate-400" />
            )}
            <span>{c.tier === 'VIP' ? 'VIP' : 'Regular'}</span>
          </button>
        </div>

        {/* Contact Links */}
        <div className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1">
          {/* Email */}
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <a
              href={`mailto:${c.email}`}
              className="truncate hover:underline text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs"
              title={c.email}
            >
              {c.email}
            </a>
          </div>

          {/* Phone & WhatsApp */}
          {c.phone ? (
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${c.phone}`}
                  className="truncate hover:underline text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-medium"
                >
                  {formatPhoneDisplay(c.phone)}
                </a>
              </div>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition shrink-0"
                  aria-label={`Chat with ${c.name} on WhatsApp`}
                >
                  <MessageCircle className="w-3 h-3" aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Phone className="w-3.5 h-3.5 opacity-40 shrink-0" aria-hidden="true" />
              <span className="italic">No phone recorded</span>
            </div>
          )}
        </div>

        {/* Treatment Notes preview */}
        {c.notes && (
          <div className="p-2.5 rounded-xl text-[11px] font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/60 border-l-2 border-[#bfa15f] text-slate-600 dark:text-slate-400">
            <p className="line-clamp-2">
              <strong className="text-amber-800 dark:text-amber-300 font-bold">Notes: </strong>{c.notes}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer: Metrics & Actions (Protected against layout overlap) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Left Metrics */}
        <div className="flex items-center gap-2 text-[11px] font-bold min-w-0">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Hash className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="font-black text-slate-900 dark:text-white">{c.bookings || 0}</span>
            <span className="text-[10px] text-slate-400">{c.bookings === 1 ? 'session' : 'sessions'}</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 select-none">·</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-black whitespace-nowrap">
            {formatCurrency(c.totalSpent)}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => onDeleteCustomer(c)}
            className="p-1.5 sm:p-2 rounded-xl text-xs font-bold text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition cursor-pointer"
            aria-label={`Delete customer ${c.name}`}
            title={`Delete ${c.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onViewProfile}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black text-[#041e16] bg-gradient-to-r from-[#bfa15f] to-[#e8cc8a] hover:brightness-110 active:scale-95 transition flex items-center gap-1 shadow-xs cursor-pointer select-none"
            aria-label={`View profile and treatment logs for ${c.name}`}
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
const CustomerTableRow = ({ customer: c, onViewProfile, onDeleteCustomer, onToggleVip, isTogglingVip, formatCurrency }) => {
  const waUrl = getWhatsAppUrl(c.phone);

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
      {/* Name */}
      <td className="py-3 px-3 sm:px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs select-none"
            style={{ background: getAvatarBg(c.name) }}
            aria-hidden="true"
          >
            {(c.name || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 max-w-[140px] sm:max-w-[200px]">
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate" title={c.name}>
              {formatDisplayName(c.name)}
            </p>
            <p className="text-[10px] text-slate-400 truncate">Joined {c.created_at || '—'}</p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="py-3 px-3 sm:px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
        <a href={`mailto:${c.email}`} className="hover:underline truncate block max-w-[160px]" title={c.email}>
          {c.email}
        </a>
      </td>

      {/* Phone */}
      <td className="py-3 px-3 sm:px-4 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {c.phone ? (
          <div className="flex items-center gap-2">
            <a href={`tel:${c.phone}`} className="hover:underline">
              {formatPhoneDisplay(c.phone)}
            </a>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                aria-label={`WhatsApp ${c.name}`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : (
          <span className="text-slate-300 dark:text-slate-600">—</span>
        )}
      </td>

      {/* Tier */}
      <td className="py-3 px-3 sm:px-4">
        <button
          type="button"
          onClick={() => onToggleVip(c)}
          disabled={isTogglingVip}
          aria-label={`Toggle tier for ${c.name}`}
          className={`text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 cursor-pointer transition select-none disabled:opacity-50 ${
            c.tier === 'VIP'
              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400/60'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {c.tier === 'VIP' ? <Crown className="w-2.5 h-2.5 text-amber-500" /> : <Star className="w-2.5 h-2.5 text-slate-400" />}
          <span>{c.tier}</span>
        </button>
      </td>

      {/* Sessions */}
      <td className="py-3 px-3 sm:px-4 text-xs font-black text-slate-800 dark:text-slate-200 whitespace-nowrap">
        {c.bookings || 0} <span className="text-[10px] font-normal text-slate-400">{c.bookings === 1 ? 'session' : 'sessions'}</span>
      </td>

      {/* Spend */}
      <td className="py-3 px-3 sm:px-4 text-xs font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
        {formatCurrency(c.totalSpent)}
      </td>

      {/* Actions */}
      <td className="py-3 px-3 sm:px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onDeleteCustomer(c)}
            className="p-1.5 rounded-lg text-xs font-bold text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 transition cursor-pointer"
            aria-label={`Delete customer ${c.name}`}
            title={`Delete ${c.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onViewProfile}
            className="px-2.5 py-1 rounded-xl text-xs font-extrabold text-[#041e16] bg-gradient-to-r from-[#bfa15f] to-[#e8cc8a] hover:brightness-110 transition shadow-xs cursor-pointer select-none"
            aria-label={`View logs for ${c.name}`}
          >
            Logs
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ------------------------------------------------------------------ */
/*  MAIN PAGE: AdminCustomers                                          */
/* ------------------------------------------------------------------ */
const AdminCustomers = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { toast } = useToast();

  const [customers, setCustomers]               = useState([]);
  const [searchQuery, setSearchQuery]           = useState('');
  const [tierFilter, setTierFilter]             = useState('all'); // 'all' | 'vip' | 'regular' | 'frequent' | 'new'
  const [sortBy, setSortBy]                     = useState('recent'); // 'recent' | 'spent' | 'bookings' | 'name'
  const [viewMode, setViewMode]                 = useState('grid'); // 'grid' | 'table'
  const [loading, setLoading]                   = useState(true);
  const [isRefreshing, setIsRefreshing]         = useState(false);
  const [fetchError, setFetchError]             = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const [showAddModal, setShowAddModal]         = useState(false);
  const [togglingVipId, setTogglingVipId]       = useState(null);

  /* Fetch customers from API */
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
      setFetchError('Could not load customer registry. Check network connection and retry.');
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
    inputBg: isDark ? '#101726' : '#f8fafc',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
  };

  /* Computed metrics */
  const metrics = useMemo(() => ({
    total: customers.length,
    vips: customers.filter(c => c.tier === 'VIP').length,
    frequent: customers.filter(c => (c.bookings || 0) >= 3).length,
    totalRevenue: customers.reduce((a, c) => a + (Number(c.totalSpent) || 0), 0),
    totalSessions: customers.reduce((a, c) => a + (Number(c.bookings) || 0), 0),
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
      if (sortBy === 'spent') return (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0);
      if (sortBy === 'bookings') return (Number(b.bookings) || 0) - (Number(a.bookings) || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      // default: recent
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return list;
  }, [customers, searchQuery, tierFilter, sortBy]);

  /* 1-Click Toggle VIP status */
  const handleToggleVip = async (customer) => {
    if (togglingVipId === customer.id) return;
    const newTier = customer.tier === 'VIP' ? 'Regular' : 'VIP';
    setTogglingVipId(customer.id);
    try {
      await API.put(`/admin/customers/${customer.id}`, { tier: newTier });
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, tier: newTier } : c));
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(prev => ({ ...prev, tier: newTier }));
      }
      toast.success(`${formatDisplayName(customer.name)} is now a ${newTier} member`);
    } catch {
      toast.error('Failed to update membership tier.');
    } finally {
      setTogglingVipId(null);
    }
  };

  /* Add customer */
  const handleAddCustomerSubmit = async (data) => {
    const res = await API.post('/admin/customers', data);
    const newCustomer = res.data.customer;
    setCustomers(prev => [newCustomer, ...prev]);
    setShowAddModal(false);
    toast.success(`Client "${formatDisplayName(newCustomer.name)}" registered successfully`);
  };

  /* Update profile (name, phone, tier, notes) */
  const handleUpdateProfile = async (customerId, payload) => {
    await API.put(`/admin/customers/${customerId}`, payload);
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...payload } : c));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(prev => ({ ...prev, ...payload }));
    }
    toast.success('Customer details updated successfully!');
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
      const msg = err.response?.data?.message || 'Failed to delete customer account.';
      toast.error(msg);
    }
  };

  /* CSV Export with injection protection */
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
      (Number(c.totalSpent) || 0).toFixed(2),
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
    { label: 'Total Clients', value: metrics.total, badge: 'Registered', badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', Icon: Users },
    { label: 'VIP Members', value: metrics.vips, badge: 'Priority Tier', badgeClass: 'text-amber-800 dark:text-amber-300 bg-amber-500/15', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', Icon: Award },
    { label: 'Total Sessions', value: metrics.totalSessions, badge: 'Concluded', badgeClass: 'text-sky-700 dark:text-sky-300 bg-sky-500/15', iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', Icon: Calendar },
    { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue), badge: 'Lifetime', badgeClass: 'text-purple-700 dark:text-purple-300 bg-purple-500/15', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', Icon: TrendingUp },
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
      <div className="space-y-4 sm:space-y-5 pb-8">

        {/* ── KPI METRICS STRIP ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {KPI.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between"
              style={{ background: C.cardBg, borderColor: C.cardBorder }}
            >
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight truncate">
                  {m.label}
                </span>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${m.iconBg} flex items-center justify-center shrink-0`}>
                  <m.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-2">
                <span className="text-base sm:text-xl lg:text-2xl font-black leading-none text-slate-900 dark:text-white truncate">
                  {m.value}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap self-start sm:self-auto ${m.badgeClass}`}>
                  {m.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── CONTROL & FILTER TOOLBAR ── */}
        <div
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-3.5 shadow-xs"
          style={{ background: C.cardBg, borderColor: C.cardBorder }}
        >
          {/* Header row with actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#bfa15f] shrink-0" aria-hidden="true" />
                <span className="truncate">Client Directory &amp; Logs</span>
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {loading ? 'Refreshing directory…' : `Showing ${filteredCustomers.length} of ${customers.length} client accounts`}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 active:scale-95"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Export CSV</span>
              </button>

              {/* View Switcher (Grid vs Table) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700" role="group" aria-label="View format">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  aria-label="Grid View"
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
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  aria-label="Table View"
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
                title="Refresh customer list"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#bfa15f]' : ''}`} />
              </button>

              {/* Add Customer CTA */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black text-[#041e16] shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs (Smooth horizontal scrolling) */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 scroll-smooth -mx-1 px-1"
            role="tablist"
            aria-label="Filter customer accounts"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = tierFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTierFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#062c22] text-[#e8cc8a] dark:bg-[#0a3d30] dark:text-[#e8cc8a] shadow-xs ring-1 ring-[#bfa15f]/50'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
            <div className="md:col-span-8 relative w-full">
              <label htmlFor="customer-search-input" className="sr-only">Search client directory</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                id="customer-search-input"
                type="text"
                placeholder="Search by client name, email, phone, or treatment notes…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium transition focus:ring-2 focus:ring-[#bfa15f]/30 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="md:col-span-4 relative w-full">
              <label htmlFor="customer-sort-select" className="sr-only">Sort client list</label>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <select
                id="customer-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-bold cursor-pointer bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition focus:ring-2 focus:ring-[#bfa15f]/30"
              >
                <option value="recent">Sort: Most Recent</option>
                <option value="spent">Sort: Highest Total Spend (₱)</option>
                <option value="bookings">Sort: Most Bookings</option>
                <option value="name">Sort: Client Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── REGISTRY CONTENT (Cards or Table) ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </motion.div>
          )}

          {!loading && fetchError && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-7 h-7 text-red-500" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-red-600">Connection Error</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{fetchError}</p>
              <button
                type="button"
                onClick={() => fetchCustomers()}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </motion.div>
          )}

          {!loading && !fetchError && customers.length === 0 && (
            <motion.div key="empty-all" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" aria-hidden="true" />
              </div>
              <p className="text-base font-black text-slate-800 dark:text-white">No Client Records Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Clients will appear here once they book online or when you add them manually.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-5 px-5 py-2.5 rounded-xl text-xs font-black text-[#041e16] shadow-md transition flex items-center gap-1.5 mx-auto cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add First Customer
              </button>
            </motion.div>
          )}

          {!loading && !fetchError && customers.length > 0 && filteredCustomers.length === 0 && (
            <motion.div key="empty-filter" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center border rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-slate-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">No customers match your active filter</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search keyword or resetting tier filters.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setTierFilter('all'); }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition cursor-pointer"
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
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {filteredCustomers.map((cust, idx) => (
                <CustomerCard
                  key={cust.id}
                  customer={cust}
                  onViewProfile={() => setSelectedCustomer(cust)}
                  onDeleteCustomer={(c) => setDeleteTarget(c)}
                  onToggleVip={handleToggleVip}
                  isTogglingVip={togglingVipId === cust.id}
                  C={C}
                  idx={idx}
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
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-3 sm:px-4">Client Name</th>
                      <th className="py-3 px-3 sm:px-4">Email</th>
                      <th className="py-3 px-3 sm:px-4">Phone / WhatsApp</th>
                      <th className="py-3 px-3 sm:px-4">Tier</th>
                      <th className="py-3 px-3 sm:px-4">Sessions</th>
                      <th className="py-3 px-3 sm:px-4">Lifetime Spend</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
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
                        isTogglingVip={togglingVipId === c.id}
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
            isTogglingVip={togglingVipId === selectedCustomer.id}
            onDeleteCustomer={(c) => {
              setSelectedCustomer(null);
              setDeleteTarget(c);
            }}
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
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

/* ------------------------------------------------------------------ */
/*  ADD CUSTOMER MODAL (LUXURY SPA POLISHED & ACCESSIBLE)              */
/* ------------------------------------------------------------------ */
const AddCustomerModal = ({ onClose, onSubmit }) => {
  const firstRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', tier: 'Regular', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: null }));
    setApiError(null);
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    set('phone', raw);
  };

  const validate = () => {
    const e = {};
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      e.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      e.name = 'Full name must be at least 2 characters.';
    } else if (trimmedName.length > 100) {
      e.name = 'Full name cannot exceed 100 characters.';
    }

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      e.email = 'Email address is required.';
    } else if (!validateEmail(trimmedEmail)) {
      e.email = 'Please provide a valid email format (e.g. client@example.com).';
    }

    if (form.phone && form.phone.trim() !== '') {
      if (!validatePhone(form.phone)) {
        e.phone = 'Valid PH mobile required (e.g. 0917 123 4567 or +63 917 123 4567).';
      }
    }

    if (form.notes && form.notes.length > 1000) {
      e.notes = 'Notes cannot exceed 1,000 characters.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: cleanPhoneNumber(form.phone.trim()),
        tier: form.tier,
        notes: form.notes.trim() || null,
      });
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        const mapped = {};
        Object.keys(serverErrors).forEach(field => {
          mapped[field] = serverErrors[field][0];
        });
        setErrors(prev => ({ ...prev, ...mapped }));
      }
      setApiError(err.response?.data?.message || 'Registration failed. Please review inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const PRESET_NOTES = [
    'Soft pressure',
    'Deep tissue',
    'Lavender oil',
    'Sensitive skin',
    'No eucalyptus',
    'Quiet session',
  ];

  const appendNotePreset = (preset) => {
    const cur = form.notes ? form.notes.trim() : '';
    if (cur.includes(preset)) return;
    set('notes', cur ? `${cur}, ${preset}` : preset);
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="add-title" descId="add-desc" size="md">
      <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#0d131f] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#041e16] via-[#062c22] to-[#0a3d30] text-white flex items-center justify-between shrink-0 border-b border-[#bfa15f]/25 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#bfa15f] to-[#e8cc8a] flex items-center justify-center text-[#041e16] shadow-sm shrink-0">
              <UserCheck className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="add-title" className="font-black text-sm sm:text-base text-white flex items-center gap-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span>New Customer Registration</span>
              </h2>
              <p id="add-desc" className="text-[11px] text-emerald-200/80 mt-0.5">
                Register a verified client profile in Cozy Blissful
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration dialog"
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4" noValidate>
          {apiError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="f-name" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-[#bfa15f]" />
                <span>Full Name <span className="text-red-500">*</span></span>
              </label>
              {form.name && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatDisplayName(form.name)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                ref={firstRef}
                id="f-name"
                type="text"
                placeholder="e.g. Sarah Martinez"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'err-name' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                  errors.name
                    ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141d2e] text-slate-900 dark:text-white focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/25'
                }`}
              />
            </div>
            {errors.name && (
              <p id="err-name" className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Email Address */}
            <div>
              <label htmlFor="f-email" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <Mail className="w-3 h-3 text-[#bfa15f]" />
                <span>Email Address <span className="text-red-500">*</span></span>
              </label>
              <input
                id="f-email"
                type="email"
                placeholder="sarah@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'err-email' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                  errors.email
                    ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141d2e] text-slate-900 dark:text-white focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/25'
                }`}
              />
              {errors.email ? (
                <p id="err-email" className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">For appointment receipts &amp; updates</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="f-phone" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3 text-[#bfa15f]" />
                <span>Phone <span className="text-slate-400 font-normal">(Optional)</span></span>
              </label>
              <input
                id="f-phone"
                type="tel"
                placeholder="0917 123 4567"
                value={form.phone}
                onChange={handlePhoneChange}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'err-phone' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                  errors.phone
                    ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141d2e] text-slate-900 dark:text-white focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/25'
                }`}
              />
              {errors.phone ? (
                <p id="err-phone" className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">PH format: 09XX XXX XXXX</p>
              )}
            </div>
          </div>

          {/* Membership Tier Cards */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1.5">
              <Award className="w-3 h-3 text-[#bfa15f]" />
              <span>Membership Category</span>
            </span>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Membership tier">
              <button
                type="button"
                role="radio"
                aria-checked={form.tier === 'Regular'}
                onClick={() => set('tier', 'Regular')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.tier === 'Regular'
                    ? 'bg-slate-100 dark:bg-slate-800 border-[#0a3d30] dark:border-[#e8cc8a] shadow-xs'
                    : 'bg-slate-50 dark:bg-[#141d2e] border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-slate-400" /> Regular Client
                  </span>
                  {form.tier === 'Regular' && <Check className="w-3.5 h-3.5 text-[#0a3d30] dark:text-[#e8cc8a]" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Standard appointment access</p>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={form.tier === 'VIP'}
                onClick={() => set('tier', 'VIP')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.tier === 'VIP'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/30 shadow-xs'
                    : 'bg-slate-50 dark:bg-[#141d2e] border-slate-200 dark:border-slate-700/80 hover:border-amber-400/50'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-500" /> VIP Member
                  </span>
                  {form.tier === 'VIP' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80">Priority tier &amp; VIP perks</p>
              </button>
            </div>
          </div>

          {/* Preferences & Treatment Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="f-notes" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#bfa15f]" />
                <span>Treatment Preferences &amp; Care Notes <span className="text-slate-400 font-normal">(Optional)</span></span>
              </label>
              <span className="text-[10px] text-slate-400 font-bold">{form.notes.length} / 1000</span>
            </div>
            <textarea
              id="f-notes"
              rows={3}
              placeholder="e.g. Prefers soft to medium pressure, allergic to eucalyptus oil, likes lavender aromatherapy…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              maxLength={1000}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141d2e] text-slate-900 dark:text-white text-xs font-medium outline-none resize-none leading-relaxed focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/25"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Quick Add:</span>
              {PRESET_NOTES.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => appendNotePreset(preset)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-900 dark:hover:bg-amber-500/20 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="pt-3.5 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
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
const CustomerDetailModal = ({ customer, onClose, onSaveProfile, onToggleVip, isTogglingVip, onDeleteCustomer }) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'notes' | 'edit'

  // History filtering
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');

  // Editable fields
  const [editName, setEditName]       = useState(customer.name || '');
  const [editPhone, setEditPhone]     = useState(customer.phone || '');
  const [editTier, setEditTier]       = useState(customer.tier || 'Regular');
  const [editNotes, setEditNotes]     = useState(customer.notes || '');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError]       = useState(null);

  const waUrl = getWhatsAppUrl(customer.phone);

  const NOTE_PRESETS = [
    'Soft pressure preferred',
    'Deep tissue & firm pressure',
    'Focus on upper back / neck',
    'Sensitive skin',
    'Allergic to eucalyptus oil',
    'Prefers lavender aromatherapy',
    'Prefers female specialist',
    'Prefers quiet session',
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

  const validateEditForm = () => {
    const e = {};
    const trimmedName = editName.trim();
    if (!trimmedName) {
      e.name = 'Customer name cannot be blank.';
    } else if (trimmedName.length < 2) {
      e.name = 'Customer name must be at least 2 characters.';
    } else if (trimmedName.length > 100) {
      e.name = 'Customer name cannot exceed 100 characters.';
    }

    if (editPhone && editPhone.trim() !== '') {
      if (!validatePhone(editPhone)) {
        e.phone = 'Valid PH mobile required (e.g. 0917 123 4567 or +63 917 123 4567).';
      }
    }

    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    if (!validateEditForm()) return;
    setSaving(true);
    setApiError(null);
    try {
      await onSaveProfile(customer.id, {
        name: editName.trim(),
        phone: cleanPhoneNumber(editPhone.trim()),
        tier: editTier,
        notes: editNotes.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update customer.');
    } finally {
      setSaving(false);
    }
  };

  const handleAppendPreset = (preset) => {
    setEditNotes((prev) => {
      const current = prev ? prev.trim() : '';
      if (!current) return preset;
      if (current.includes(preset)) return current;
      return `${current}, ${preset}`;
    });
  };

  // Status badge style helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return {
          icon: CheckCircle2,
          cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
        };
      case 'Confirmed':
        return {
          icon: Calendar,
          cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30',
        };
      case 'In Progress':
        return {
          icon: Sparkles,
          cls: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
        };
      case 'Cancelled':
        return {
          icon: AlertTriangle,
          cls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30',
        };
      default: // Pending
        return {
          icon: Clock,
          cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
        };
    }
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="detail-title" descId="detail-desc" size="lg">
      <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#0d131f] overflow-hidden">
        {/* Header with Luxury Emerald Styling */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#041e16] via-[#062c22] to-[#0a3d30] text-white relative shrink-0 border-b border-[#bfa15f]/25">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close client profile modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md border-2 border-white/20 shrink-0 select-none"
              style={{ background: getAvatarBg(customer.name) }}
              aria-hidden="true"
            >
              {(customer.name || 'C').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="detail-title" className="text-base sm:text-lg font-black text-white truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {formatDisplayName(customer.name)}
                </h2>
                <button
                  type="button"
                  onClick={() => onToggleVip(customer)}
                  disabled={isTogglingVip}
                  className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 cursor-pointer transition select-none disabled:opacity-50 ${
                    customer.tier === 'VIP'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                      : 'bg-white/10 text-emerald-200 border-white/20 hover:bg-white/20'
                  }`}
                  title="Click to switch membership tier"
                >
                  <Crown className="w-2.5 h-2.5" />
                  <span>{customer.tier === 'VIP' ? 'VIP Member' : 'Regular'}</span>
                </button>
              </div>

              <div id="detail-desc" className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-emerald-100/85">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0 text-[#e8cc8a]" aria-hidden="true" />
                  <span className="truncate">{customer.email}</span>
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1 shrink-0">
                    <Phone className="w-3 h-3 shrink-0 text-[#e8cc8a]" aria-hidden="true" />
                    <span>{formatPhoneDisplay(customer.phone)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact & Quick Stats Bar */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/10 text-xs flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
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

            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-100/90 ml-auto">
              <span>{customer.bookings || 0} Sessions</span>
              <span>·</span>
              <span className="text-[#e8cc8a] font-black">{formatCurrency(customer.totalSpent)} Total</span>
            </div>
          </div>
        </div>

        {/* Modal Interior Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] px-4 sm:px-5 pt-2 shrink-0" role="tablist">
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
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 px-3 text-xs font-extrabold flex items-center gap-1.5 transition-all border-b-2 cursor-pointer select-none ${
                  isActive
                    ? 'border-[#0a3d30] text-[#0a3d30] dark:border-[#e8cc8a] dark:text-[#e8cc8a]'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive
                      ? 'bg-[#0a3d30] text-emerald-200 dark:bg-[#e8cc8a] dark:text-[#041e16]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body (Scrolls Independently) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* ── TAB 1: APPOINTMENT HISTORY LOGS ── */}
          {activeTab === 'history' && (
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700" role="group" aria-label="History status filter">
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
                          ? 'bg-white dark:bg-[#1f293d] text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search logs by service or therapist…"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#141d2e] text-slate-800 dark:text-white outline-none focus:border-[#bfa15f] focus:ring-1 focus:ring-[#bfa15f]/30"
                  />
                </div>
              </div>

              {(!customer.history || customer.history.length === 0) ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4">
                  <Calendar className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-600 mb-2" aria-hidden="true" />
                  <p className="text-xs text-slate-400 font-semibold">No treatment records logged yet for this client.</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-10 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400 p-4">
                  No appointments match the search query or status filter.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredHistory.map((b) => {
                    const badge = getStatusBadge(b.status);
                    const StatusIcon = badge.icon;
                    return (
                      <div
                        key={b.id}
                        className="p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/70 dark:bg-[#141d2e] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition hover:border-[#bfa15f]/40 hover:shadow-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-xl bg-[#0a3d30]/10 dark:bg-[#e8cc8a]/10 text-[#0a3d30] dark:text-[#e8cc8a] flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {b.service}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {b.date}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                Specialist: <strong className="font-semibold text-slate-700 dark:text-slate-300">{b.therapist}</strong>
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 sm:ml-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${badge.cls}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{b.status}</span>
                          </span>

                          {b.amount > 0 && (
                            <span className="font-black text-xs sm:text-sm text-[#0a3d30] dark:text-[#e8cc8a] tabular-nums">
                              {formatCurrency(b.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: PREFERENCES & TREATMENT NOTES ── */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="detail-notes-input" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#bfa15f]" />
                    <span>Client Sensitivities &amp; Staff Observations</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    {editNotes.length} / 1000
                  </span>
                </div>
                <textarea
                  id="detail-notes-input"
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  maxLength={1000}
                  placeholder="Record client sensitivities, favorite aromatherapy oils, pressure preferences, or front-desk notes…"
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#141d2e] text-slate-900 dark:text-white text-xs font-medium outline-none resize-none leading-relaxed focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/30"
                />
              </div>

              {/* Preset Chips */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Click to Add Common Spa Observation Presets:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {NOTE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAppendPreset(preset)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-900 dark:hover:bg-amber-500/20 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Notes saved successfully!
                  </span>
                ) : <span />}

                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-black text-[#041e16] transition hover:brightness-110 active:scale-95 shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving…' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 3: EDIT PROFILE ── */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveAll} className="space-y-4" noValidate>
              {apiError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{apiError}</span>
                </div>
              )}

              <div>
                <label htmlFor="edit-name" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                  <User className="w-3 h-3 text-[#bfa15f]" />
                  <span>Full Name <span className="text-red-500">*</span></span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setFieldErrors(p => ({ ...p, name: null }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                    fieldErrors.name
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141d2e] text-slate-900 dark:text-white focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/30'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="edit-phone" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                    <Phone className="w-3 h-3 text-[#bfa15f]" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => {
                      setEditPhone(e.target.value);
                      setFieldErrors(p => ({ ...p, phone: null }));
                    }}
                    placeholder="0917 123 4567"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                      fieldErrors.phone
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141d2e] text-slate-900 dark:text-white focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/30'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-tier" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                    <Crown className="w-3 h-3 text-[#bfa15f]" />
                    <span>Membership Category</span>
                  </label>
                  <select
                    id="edit-tier"
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141d2e] text-slate-900 dark:text-white text-xs font-bold outline-none cursor-pointer focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/30"
                  >
                    <option value="Regular">Regular Client</option>
                    <option value="VIP">VIP Client (Priority Tier)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="edit-email" className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#bfa15f]" />
                    <span>Primary Login Email</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Verified Client Credential</span>
                </div>
                <input
                  id="edit-email"
                  type="email"
                  value={customer.email}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/60 text-slate-400 text-xs font-medium cursor-not-allowed select-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
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

        {/* Sticky Pinned Modal Footer (Never cut off by taskbar) */}
        <div className="px-5 py-3.5 shrink-0 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/95 dark:bg-[#111827]/95 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => onDeleteCustomer(customer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-500/10 hover:bg-red-500/20 transition cursor-pointer active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Client Account</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
const DeleteCustomerModal = ({ customer, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm(customer.id);
    setDeleting(false);
  };

  return (
    <ModalBackdrop onClose={onClose} labelId="delete-customer-title" descId="delete-customer-desc" size="sm" isAlert={true}>
      <div className="p-5 sm:p-6 space-y-4 text-center bg-white dark:bg-[#0d131f] min-h-0">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shrink-0 shadow-xs">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <h2 id="delete-customer-title" className="text-base font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Delete Customer Profile?
          </h2>
          <p id="delete-customer-desc" className="text-xs text-slate-400 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-slate-800 dark:text-slate-200">{formatDisplayName(customer.name)}</strong> ({customer.email})?
          </p>
        </div>

        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-[11px] font-medium text-red-600 dark:text-red-400 text-left">
          <p className="flex items-center gap-1 font-bold mb-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Permanent Action:
          </p>
          This will permanently purge this client account, saved observations, and session logs from Cozy Blissful.
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
