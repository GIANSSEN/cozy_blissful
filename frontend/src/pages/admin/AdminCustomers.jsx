import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Star, HeartPulse, MessageSquare,
  ShieldAlert, AlertTriangle, UserCheck, Plus, X,
  Phone, Mail, Calendar, CheckCircle2, Info, Filter,
  ChevronRight, Award, Edit3, MessageCircle, Clock,
  Sparkles, RefreshCw, AlertCircle, Shield, FileText, Check
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────── */
/*  INITIAL REPOSITORY FALLBACK DATA                                   */
/* ─────────────────────────────────────────────────────────────────── */
const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: 'Sarah Martinez',
    email: 'sarah.m@example.com',
    phone: '+63 917 123 4567',
    tier: 'VIP',
    bookings: 14,
    totalSpent: 24500,
    created_at: '2025-11-12',
    notes: 'Prefers Swedish Massage with Lavender Oil. Soft to medium pressure on shoulders.',
    condition: 'Sensitive skin & mild asthma',
    allergy: 'Eucalyptus Oil',
    flagged: true,
    history: [
      { id: 'b1', service: 'Swedish Signature Massage', date: '2026-07-28', therapist: 'Anna Reyes', status: 'Completed', amount: 1800 },
      { id: 'b2', service: 'Deep Tissue Relief', date: '2026-07-10', therapist: 'Maria Santos', status: 'Completed', amount: 2200 },
      { id: 'b3', service: 'Aromatherapy Foot Spa', date: '2026-06-15', therapist: 'Anna Reyes', status: 'Completed', amount: 1400 },
    ]
  },
  {
    id: 2,
    name: 'David Lim',
    email: 'david.lim@example.com',
    phone: '+63 918 987 6543',
    tier: 'Regular',
    bookings: 6,
    totalSpent: 9800,
    created_at: '2026-01-20',
    notes: 'Requires Deep Tissue focus on lower back strain and neck tightness.',
    condition: 'Lumbar L4-L5 disc stiffness',
    allergy: 'None reported',
    flagged: false,
    history: [
      { id: 'b4', service: 'Deep Tissue Relief', date: '2026-07-22', therapist: 'John Cruz', status: 'Completed', amount: 2200 },
      { id: 'b5', service: 'Traditional Hilot Therapy', date: '2026-06-30', therapist: 'John Cruz', status: 'Completed', amount: 1600 },
    ]
  },
  {
    id: 3,
    name: 'Patricia Go',
    email: 'patty.go@example.com',
    phone: '+63 919 444 5555',
    tier: 'VIP',
    bookings: 9,
    totalSpent: 16200,
    created_at: '2025-12-05',
    notes: 'Regular manicures & foot spa client. Highly appreciates quiet room environment.',
    condition: 'Pregnant (2nd Trimester)',
    allergy: 'Acetone sensitivity',
    flagged: true,
    history: [
      { id: 'b6', service: 'Prenatal Relaxing Massage', date: '2026-07-15', therapist: 'Elena Torres', status: 'Completed', amount: 2000 },
      { id: 'b7', service: 'Luxury Foot Spa & Pedicure', date: '2026-07-01', therapist: 'Elena Torres', status: 'Completed', amount: 1500 },
    ]
  },
  {
    id: 4,
    name: 'John Vincent',
    email: 'vincent.j@example.com',
    phone: '+63 922 555 1234',
    tier: 'Regular',
    bookings: 2,
    totalSpent: 3200,
    created_at: '2026-05-18',
    notes: 'First time client. Enjoys medium pressure Hilot massage.',
    condition: 'None reported',
    allergy: 'None reported',
    flagged: false,
    history: [
      { id: 'b8', service: 'Traditional Hilot Therapy', date: '2026-05-18', therapist: 'Maria Santos', status: 'Completed', amount: 1600 },
    ]
  },
  {
    id: 5,
    name: 'Camilla Roxas',
    email: 'camilla.r@example.com',
    phone: '+63 928 333 8899',
    tier: 'VIP',
    bookings: 18,
    totalSpent: 31000,
    created_at: '2025-08-30',
    notes: 'Prefers Chamomile essential oil. Sensitive upper back traps.',
    condition: 'Hypertension (Controlled)',
    allergy: 'Nut oil / Almond oil',
    flagged: true,
    history: [
      { id: 'b9', service: 'Hot Stone Therapy', date: '2026-07-31', therapist: 'Anna Reyes', status: 'Completed', amount: 2500 },
      { id: 'b10', service: 'Swedish Signature Massage', date: '2026-07-18', therapist: 'Anna Reyes', status: 'Completed', amount: 1800 },
    ]
  }
];

const INITIAL_REVIEWS = [
  {
    id: 1,
    customer_name: 'Sarah Martinez',
    rating: 5,
    service: 'Swedish Signature Massage',
    comment: 'Exceptional home service! Anna was so punctual, polite, and skilled. Left feeling completely rejuvenated.',
    date: '2026-07-28',
    reply: 'Thank you Sarah! We are thrilled Anna made your session so relaxing. See you again soon!',
    replied_at: '2026-07-29'
  },
  {
    id: 2,
    customer_name: 'David Lim',
    rating: 4,
    service: 'Deep Tissue Relief',
    comment: 'Great pressure on my lower back stiffness. Would appreciate a 90-minute option on weekend slots.',
    date: '2026-07-22',
    reply: null
  },
  {
    id: 3,
    customer_name: 'Patricia Go',
    rating: 5,
    service: 'Prenatal Relaxing Massage',
    comment: 'Super careful and knowledgeable therapist for prenatal massage. Very soothing ambient music background.',
    date: '2026-07-15',
    reply: 'Dear Patricia, your safety and comfort are our top priority! Looking forward to your next visit.',
    replied_at: '2026-07-16'
  },
  {
    id: 4,
    customer_name: 'Camilla Roxas',
    rating: 5,
    service: 'Hot Stone Therapy',
    comment: 'The hot stones were perfectly warmed. Anna respected my nut oil allergy without any issue. 10/10 service!',
    date: '2026-07-31',
    reply: null
  }
];

/* ─────────────────────────────────────────────────────────────────── */
/*  HELPER VALIDATORS                                                   */
/* ─────────────────────────────────────────────────────────────────── */
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^(\+?63|0)9\d{9}$/.test(phone.replace(/\s+/g, ''));

const getAvatarBg = (name) => {
  const charCode = name.charCodeAt(0) || 65;
  const hues = [160, 200, 220, 280, 340, 35];
  const hue = hues[charCode % hues.length];
  return `hsl(${hue}, 65%, 45%)`;
};

/* ─────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                      */
/* ─────────────────────────────────────────────────────────────────── */
const AdminCustomers = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /* State Management */
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'reviews' | 'medical'
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All'); // 'All' | 'VIP' | 'Regular'
  const [loading, setLoading] = useState(false);

  /* Modal States */
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Drawer / Detail Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState(null);

  /* Form & Toast Notification States */
  const [toast, setToast] = useState(null);

  /* Fetch live customers from Backend API if available */
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/customers');
      if (res.data && Array.isArray(res.data.customers) && res.data.customers.length > 0) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.log('Using initial client registry fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Color Palette System */
  const C = {
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    textPrimary:   isDark ? '#f1f5f9' : '#0f172a',
    textSecondary: isDark ? '#cbd5e1' : '#334155',
    textMuted:     isDark ? '#64748b' : '#94a3b8',
    inputBg:       isDark ? '#0f1420' : '#f8fafc',
    pillActiveBg:  isDark ? '#059669' : '#0a3d30',
    pillActiveTxt: '#ffffff',
    badgeVipBg:    isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7',
    badgeVipTxt:   isDark ? '#fbbf24' : '#b45309',
    badgeVipBorder:isDark ? 'rgba(245,158,11,0.3)' : '#fde68a',
  };

  /* Calculated Metrics */
  const metrics = useMemo(() => {
    const total = customers.length;
    const vips = customers.filter(c => c.tier === 'VIP').length;
    const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);
    const healthFlags = customers.filter(c => c.flagged).length;
    return { total, vips, avgRating, healthFlags };
  }, [customers, reviews]);

  /* Filtered Customer List */
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch =
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone || '').includes(searchQuery) ||
        (c.condition || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.allergy || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchTier = tierFilter === 'All' || c.tier === tierFilter;
      return matchSearch && matchTier;
    });
  }, [customers, searchQuery, tierFilter]);

  /* ───────────────────────────────────────────────────────────────── */
  /*  HANDLERS                                                         */
  /* ───────────────────────────────────────────────────────────────── */
  const handleAddCustomerSubmit = (newCustomerData) => {
    const created = {
      id: Date.now(),
      ...newCustomerData,
      bookings: 0,
      totalSpent: 0,
      created_at: new Date().toISOString().split('T')[0],
      history: []
    };
    setCustomers(prev => [created, ...prev]);
    setShowAddModal(false);
    showToastMsg(`Successfully registered customer "${created.name}"`);
  };

  const handleToggleHealthFlag = (customerId) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const updatedFlag = !c.flagged;
        showToastMsg(`Health flag ${updatedFlag ? 'enabled' : 'disabled'} for ${c.name}`, updatedFlag ? 'warning' : 'info');
        return { ...c, flagged: updatedFlag };
      }
      return c;
    }));
  };

  const handleSaveReplyReview = (reviewId, replyText) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          reply: replyText,
          replied_at: new Date().toISOString().split('T')[0]
        };
      }
      return r;
    }));
    setSelectedReviewForReply(null);
    showToastMsg('Official reply submitted to customer feedback!');
  };

  const handleUpdateNotes = (customerId, updatedNotes) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, notes: updatedNotes } : c));
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(prev => ({ ...prev, notes: updatedNotes }));
    }
    showToastMsg('Customer preferences updated!');
  };

  return (
    <AdminLayout title="Customers" subtitle="Unified Client Registry, Feedback & Health Safety Records">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold"
            style={{
              background: toast.type === 'warning' ? '#7c2d12' : toast.type === 'info' ? '#1e3a8a' : '#064e3b',
              color: '#ffffff',
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">

        {/* ── TOP KPI METRICS BAR ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-4 sm:p-5 rounded-3xl border transition-all duration-200"
            style={{ background: C.cardBg, borderColor: C.cardBorder }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Customers</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black" style={{ color: C.textPrimary }}>{metrics.total}</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> +12% MoM
              </span>
            </div>
          </div>

          <div
            className="p-4 sm:p-5 rounded-3xl border transition-all duration-200"
            style={{ background: C.cardBg, borderColor: C.cardBorder }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">VIP Clients</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black" style={{ color: C.textPrimary }}>{metrics.vips}</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full" style={{ background: C.badgeVipBg, color: C.badgeVipTxt }}>
                Frequent Tier
              </span>
            </div>
          </div>

          <div
            className="p-4 sm:p-5 rounded-3xl border transition-all duration-200"
            style={{ background: C.cardBg, borderColor: C.cardBorder }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Avg Rating</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                <Star className="w-4 h-4 fill-yellow-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black" style={{ color: C.textPrimary }}>{metrics.avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span></span>
              <span className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {reviews.length} Reviews
              </span>
            </div>
          </div>

          <div
            className="p-4 sm:p-5 rounded-3xl border transition-all duration-200"
            style={{ background: C.cardBg, borderColor: C.cardBorder }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Health Safety Flags</span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-red-500">{metrics.healthFlags}</span>
              <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Confidential
              </span>
            </div>
          </div>
        </div>

        {/* ── PAGE CONTROL BAR (Tabs + Search + Primary Action) ─────────────── */}
        <div
          className="p-3 sm:p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: C.cardBg, borderColor: C.cardBorder }}
        >
          {/* Sub-navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('registry')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'registry' ? 'shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              style={activeTab === 'registry' ? { background: C.pillActiveBg, color: C.pillActiveTxt } : {}}
            >
              <Users className="w-3.5 h-3.5" /> Client Registry
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'reviews' ? 'shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              style={activeTab === 'reviews' ? { background: C.pillActiveBg, color: C.pillActiveTxt } : {}}
            >
              <Star className="w-3.5 h-3.5" /> Reviews & Feedback
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'medical' ? 'shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              style={activeTab === 'medical' ? { background: C.pillActiveBg, color: C.pillActiveTxt } : {}}
            >
              <HeartPulse className="w-3.5 h-3.5" /> Health & Allergy Records
            </button>
          </div>

          {/* Controls: Search, Filter & New Customer button */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap justify-end">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, allergy..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none font-medium transition-all"
                style={{ background: C.inputBg, borderColor: C.cardBorder, color: C.textPrimary }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {activeTab === 'registry' && (
              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border outline-none font-bold cursor-pointer"
                style={{ background: C.inputBg, borderColor: C.cardBorder, color: C.textPrimary }}
              >
                <option value="All">All Tiers</option>
                <option value="VIP">VIP Only</option>
                <option value="Regular">Regular Only</option>
              </select>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#059669,#0a3d30)' }}
            >
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>
        </div>

        {/* ── TAB 1: CLIENT REGISTRY ────────────────────────────────────── */}
        {activeTab === 'registry' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full py-16 text-center border rounded-3xl" style={{ background: C.cardBg, borderColor: C.cardBorder }}>
                <Users className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                <p className="text-sm font-bold" style={{ color: C.textPrimary }}>No customers found matching your filter</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search keywords or tier filter.</p>
              </div>
            ) : (
              filteredCustomers.map(cust => (
                <motion.div
                  key={cust.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-lg group relative"
                  style={{ background: C.cardBg, borderColor: C.cardBorder }}
                >
                  <div>
                    {/* Header: Avatar + Tier + Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-sm text-base flex-shrink-0"
                          style={{ background: getAvatarBg(cust.name) }}
                        >
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm leading-snug truncate max-w-[150px]" style={{ color: C.textPrimary }}>
                            {cust.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> Member since {cust.created_at}
                          </span>
                        </div>
                      </div>

                      {cust.tier === 'VIP' ? (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1"
                          style={{ background: C.badgeVipBg, color: C.badgeVipTxt, borderColor: C.badgeVipBorder }}>
                          <Award className="w-3 h-3" /> VIP
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Regular
                        </span>
                      )}
                    </div>

                    {/* Contact details */}
                    <div className="mt-4 space-y-1.5 text-xs font-semibold" style={{ color: C.textSecondary }}>
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{cust.phone}</span>
                      </div>
                    </div>

                    {/* Medical / Allergy Warning Badge */}
                    {cust.flagged && (
                      <div className="mt-3 p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold flex items-start gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">Allergy Alert: {cust.allergy || cust.condition}</span>
                      </div>
                    )}

                    {/* Treatment Notes Snippet */}
                    {cust.notes && (
                      <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <p className="line-clamp-2"><strong>Notes:</strong> {cust.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer stats & Open Drawer Trigger */}
                  <div className="mt-5 pt-3 border-t flex items-center justify-between" style={{ borderColor: C.cardBorder }}>
                    <div className="text-[11px] font-extrabold text-slate-400">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">{cust.bookings}</span> Sessions Completed
                    </div>

                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 2: REVIEWS & RATINGS ────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(rv => (
                <div
                  key={rv.id}
                  className="p-5 rounded-3xl border flex flex-col justify-between gap-3 transition-all hover:shadow-md"
                  style={{ background: C.cardBg, borderColor: C.cardBorder }}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                          {rv.customer_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm" style={{ color: C.textPrimary }}>{rv.customer_name}</h4>
                          <p className="text-[11px] text-slate-400 font-medium">{rv.service} · {rv.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 bg-yellow-500/10 px-2 py-1 rounded-xl">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rv.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="mt-3 text-xs leading-relaxed font-medium" style={{ color: C.textSecondary }}>
                      "{rv.comment}"
                    </p>

                    {/* Official Response Box */}
                    {rv.reply ? (
                      <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Spa Response</span>
                          <span>{rv.replied_at}</span>
                        </div>
                        <p className="text-emerald-900 dark:text-emerald-200 text-xs italic">{rv.reply}</p>
                      </div>
                    ) : (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => setSelectedReviewForReply(rv)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Reply to Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: HEALTH & ALLERGY RECORDS ───────────────────────────── */}
        {activeTab === 'medical' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">Confidential Client Medical Registry</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Therapists must review these flags before assigning essential oils or deep muscle pressure.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map(cust => (
                <div
                  key={cust.id}
                  className="p-5 rounded-3xl border flex items-start justify-between gap-4 transition-all hover:shadow-md"
                  style={{ background: C.cardBg, borderColor: C.cardBorder }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${
                      cust.flagged ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      <HeartPulse className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm" style={{ color: C.textPrimary }}>{cust.name}</h4>
                        {cust.flagged && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                            Flagged Warning
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <strong>Known Condition:</strong> {cust.condition || 'None reported'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <strong>Allergies:</strong> {cust.allergy || 'None reported'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleHealthFlag(cust.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 ${
                      cust.flagged
                        ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cust.flagged ? 'Clear Flag' : '+ Flag Health Note'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      /*  MODAL 1: ADD NEW CUSTOMER REGISTRATION WITH VALIDATION           */
      /* ───────────────────────────────────────────────────────────────── */
      <AnimatePresence>
        {showAddModal && (
          <AddCustomerModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddCustomerSubmit}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────── */}
      /*  MODAL 2: CUSTOMER PROFILE DETAIL DRAWER / OVERVIEW               */
      /* ───────────────────────────────────────────────────────────────── */
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onSaveNotes={handleUpdateNotes}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────── */}
      /*  MODAL 3: REPLY TO REVIEW MODAL                                   */
      /* ───────────────────────────────────────────────────────────────── */
      <AnimatePresence>
        {selectedReviewForReply && (
          <ReplyReviewModal
            review={selectedReviewForReply}
            onClose={() => setSelectedReviewForReply(null)}
            onSubmit={handleSaveReplyReview}
            theme={theme}
          />
        )}
      </AnimatePresence>

    </AdminLayout>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  ADD CUSTOMER MODAL COMPONENT (WITH FORM VALIDATION)                 */
/* ─────────────────────────────────────────────────────────────────── */
const AddCustomerModal = ({ onClose, onSubmit, theme }) => {
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'Regular',
    notes: '',
    condition: '',
    allergy: '',
    flagged: false,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Full name is required (min 2 characters).';
    }
    if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
      errs.email = 'Valid email address is required (e.g. user@example.com).';
    }
    if (!formData.phone.trim() || !validatePhone(formData.phone.trim())) {
      errs.phone = 'Valid PH mobile number is required (e.g. +639171234567 or 09171234567).';
    }
    if (formData.flagged && (!formData.allergy.trim() && !formData.condition.trim())) {
      errs.allergy = 'Please describe the health condition or allergy if flagged.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: isDark ? '#141927' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" /> New Customer Registration
            </h3>
            <p className="text-xs text-emerald-200/80">Add a client profile to Cozy Blissful Spa registry</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Martinez"
              value={formData.name}
              onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: null }); }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                errors.name ? 'border-red-500 bg-red-500/5' : ''
              }`}
              style={{ background: isDark ? '#0f1420' : '#f8fafc', color: isDark ? '#f1f5f9' : '#0f172a' }}
            />
            {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
          </div>

          {/* Email & Phone grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: null }); }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                  errors.email ? 'border-red-500 bg-red-500/5' : ''
                }`}
                style={{ background: isDark ? '#0f1420' : '#f8fafc', color: isDark ? '#f1f5f9' : '#0f172a' }}
              />
              {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="+63 917 123 4567"
                value={formData.phone}
                onChange={e => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: null }); }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                  errors.phone ? 'border-red-500 bg-red-500/5' : ''
                }`}
                style={{ background: isDark ? '#0f1420' : '#f8fafc', color: isDark ? '#f1f5f9' : '#0f172a' }}
              />
              {errors.phone && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
            </div>
          </div>

          {/* Membership Tier */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Membership Category
            </label>
            <select
              value={formData.tier}
              onChange={e => setFormData({ ...formData, tier: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer"
              style={{ background: isDark ? '#0f1420' : '#f8fafc', color: isDark ? '#f1f5f9' : '#0f172a' }}
            >
              <option value="Regular">Regular Client</option>
              <option value="VIP">VIP Client (Priority Booking)</option>
            </select>
          </div>

          {/* Treatment Notes */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Treatment Preferences & Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Soft pressure preferred, loves Swedish massage with lavender..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none resize-none"
              style={{ background: isDark ? '#0f1420' : '#f8fafc', color: isDark ? '#f1f5f9' : '#0f172a' }}
            />
          </div>

          {/* Health & Allergy Flag Toggle */}
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.flagged}
                onChange={e => setFormData({ ...formData, flagged: e.target.checked })}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-xs font-extrabold text-red-600 dark:text-red-400">
                Flag Confidential Health Condition / Allergy Alert
              </span>
            </label>

            {formData.flagged && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  placeholder="Allergy (e.g. Lavender oil, Nut oil...)"
                  value={formData.allergy}
                  onChange={e => setFormData({ ...formData, allergy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none"
                  style={{ background: isDark ? '#141927' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' }}
                />
                <input
                  type="text"
                  placeholder="Medical Condition (e.g. Sensitive skin, Hypertension...)"
                  value={formData.condition}
                  onChange={e => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none"
                  style={{ background: isDark ? '#141927' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a' }}
                />
                {errors.allergy && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.allergy}</p>}
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Register Customer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  CUSTOMER DETAIL DRAWER / PROFILE OVERVIEW MODAL                    */
/* ─────────────────────────────────────────────────────────────────── */
const CustomerDetailModal = ({ customer, onClose, onSaveNotes, theme }) => {
  const isDark = theme === 'dark';
  const [editingNotes, setEditingNotes] = useState(customer.notes || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          background: isDark ? '#141927' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}
      >
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 to-slate-900 text-white relative">
          <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-white/20"
              style={{ background: getAvatarBg(customer.name) }}
            >
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{customer.name}</h3>
                {customer.tier === 'VIP' && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1">
                    <Award className="w-3 h-3" /> VIP Member
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 flex items-center gap-3">
                <span>{customer.email}</span> · <span>{customer.phone}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Sessions</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{customer.bookings}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Est. Spent</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₱{(customer.totalSpent || 0).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Joined Date</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{customer.created_at || '2026-01-01'}</span>
            </div>
          </div>

          {/* Health & Allergy Card */}
          {customer.flagged && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" /> Confidential Health Warning
              </div>
              <p className="text-xs font-semibold">Allergy: {customer.allergy || 'None'}</p>
              <p className="text-xs font-semibold">Condition: {customer.condition || 'None'}</p>
            </div>
          )}

          {/* Editable Treatment Preferences */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Treatment Preferences & Staff Notes
            </label>
            <textarea
              rows="3"
              value={editingNotes}
              onChange={e => setEditingNotes(e.target.value)}
              className="w-full p-3 rounded-2xl border text-xs font-medium outline-none resize-none"
              style={{ background: isDark ? '#0f1420' : '#f8fafc', color: isDark ? '#f1f5f9' : '#0f172a', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            />
            <div className="flex justify-end">
              <button
                onClick={() => onSaveNotes(customer.id, editingNotes)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Save Preferences
              </button>
            </div>
          </div>

          {/* History Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Appointment History</h4>
            {(!customer.history || customer.history.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No past booking records available for this customer.</p>
            ) : (
              <div className="space-y-2">
                {customer.history.map(b => (
                  <div key={b.id} className="p-3 rounded-2xl border flex items-center justify-between text-xs" style={{ background: isDark ? '#0f1420' : '#f8fafc', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                    <div>
                      <h5 className="font-extrabold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{b.service}</h5>
                      <p className="text-[11px] text-slate-400">{b.date} · Therapist: {b.therapist}</p>
                    </div>
                    <span className="font-black text-emerald-600">₱{b.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  REPLY REVIEW MODAL                                                 */
/* ─────────────────────────────────────────────────────────────────── */
const ReplyReviewModal = ({ review, onClose, onSubmit, theme }) => {
  const isDark = theme === 'dark';
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || replyText.trim().length < 5) {
      setError('Please enter a response of at least 5 characters.');
      return;
    }
    onSubmit(review.id, replyText.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4"
        style={{ background: isDark ? '#141927' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            <MessageCircle className="w-5 h-5 text-amber-500" /> Reply to Review
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Review Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-xs space-y-1">
          <span className="font-extrabold block text-slate-800 dark:text-slate-200">{review.customer_name}</span>
          <p className="text-slate-500 italic">"{review.comment}"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-extrabold uppercase text-slate-400 block mb-1">Official Spa Response</label>
            <textarea
              rows="3"
              placeholder="Write a polite & professional reply to the customer..."
              value={replyText}
              onChange={e => { setReplyText(e.target.value); setError(null); }}
              className="w-full p-3 rounded-2xl border text-xs font-medium outline-none resize-none"
              style={{ background: isDark ? '#0f1420' : '#f8fafc', color: isDark ? '#f1f5f9' : '#0f172a' }}
            />
            {error && <p className="text-[10px] font-bold text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md">
              Send Response
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminCustomers;
