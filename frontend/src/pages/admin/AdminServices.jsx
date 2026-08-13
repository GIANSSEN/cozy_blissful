import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { DatePickerInput } from '../../components/ui/date-picker';
import {
  Plus, Pencil, Trash2, X, Search, Clock, ShoppingBag,
  CheckCircle, AlertCircle, Tag, Gift, ToggleLeft, ToggleRight,
  Filter, ChevronDown, Save, Eye, Star, Percent,
  Calendar, Package, Info, Layers, Sparkles, TrendingUp,
  LayoutGrid, List, RefreshCw, Check, ArrowRight, ShieldCheck,
  DollarSign, Sparkle, BarChart2, Zap, FileText, CheckSquare,
  ChevronRight, ExternalLink, HelpCircle
} from 'lucide-react';

/* ─── TOKENS ──────────────────────────────────────────────────────── */
const TOKENS = {
  light: {
    canvas: '#f5f3ee', card: 'rgba(255,255,255,0.98)',
    cardShadow: '0 4px 24px rgba(0,0,0,0.06)', cardBorder: '1px solid rgba(0,0,0,0.07)',
    inner: '#faf8f4', innerBorder: '1px solid rgba(0,0,0,0.06)',
    txt: '#14181f', txtMuted: '#8e97a4', txtSub: '#4a5568',
    divider: 'rgba(0,0,0,0.07)', hover: 'rgba(0,0,0,0.025)',
    accent: '#0a3d30', gold: '#bfa15f', danger: '#ef4444',
    success: '#10b981', warning: '#f59e0b', info: '#6366f1',
    inputBg: '#ffffff', inputBorder: 'rgba(0,0,0,0.12)',
    tag: 'rgba(0,0,0,0.05)', tagTxt: '#4a5568',
  },
  dark: {
    canvas: '#0e1320', card: '#161d2c',
    cardShadow: '0 4px 32px rgba(0,0,0,0.45)', cardBorder: '1px solid rgba(255,255,255,0.07)',
    inner: '#111827', innerBorder: '1px solid rgba(255,255,255,0.06)',
    txt: '#dde6f0', txtMuted: '#4e5e72', txtSub: '#7b8da4',
    divider: 'rgba(255,255,255,0.07)', hover: 'rgba(255,255,255,0.03)',
    accent: '#34d399', gold: '#d4b87a', danger: '#f87171',
    success: '#34d399', warning: '#fbbf24', info: '#818cf8',
    inputBg: 'rgba(255,255,255,0.05)', inputBorder: 'rgba(255,255,255,0.1)',
    tag: 'rgba(255,255,255,0.07)', tagTxt: '#7b8da4',
  },
};

/* ─── SEED DATA ───────────────────────────────────────────────────── */
const INITIAL_SERVICES = [
  { id: 1,  name: 'Swedish Massage',            category: 'Massage Therapy', price: 749,  duration: 60,  status: 'active',   description: 'Classic relaxing full-body massage with long, gliding strokes.' },
  { id: 2,  name: 'Deep Tissue Massage',        category: 'Massage Therapy', price: 849,  duration: 60,  status: 'active',   description: 'Firm pressure targeting deep muscle layers and chronic tension.' },
  { id: 3,  name: 'Hilot Massage',              category: 'Massage Therapy', price: 749,  duration: 60,  status: 'active',   description: 'Traditional Filipino healing massage using coconut oil.' },
  { id: 4,  name: 'Thai Massage',               category: 'Massage Therapy', price: 849,  duration: 60,  status: 'active',   description: 'Assisted stretching and acupressure for flexibility.' },
  { id: 5,  name: 'Post Natal Massage',         category: 'Massage Therapy', price: 899,  duration: 60,  status: 'active',   description: 'Gentle restorative massage for mothers after childbirth.' },
  { id: 6,  name: 'Couple Massage',             category: 'Massage Therapy', price: 999,  duration: 60,  status: 'active',   description: 'Simultaneous massage for two — perfect for partners or friends.' },
  { id: 7,  name: 'Ventosa w/ Massage',         category: 'Massage Therapy', price: 999,  duration: 60,  status: 'inactive', description: 'Cupping therapy combined with full-body relaxation massage.' },
  { id: 8,  name: 'Lymphatic Massage',          category: 'Massage Therapy', price: 999,  duration: 60,  status: 'active',   description: 'Gentle drainage technique to boost lymph flow.' },
  { id: 9,  name: 'Manicure',                   category: 'Nail Care',       price: 299,  duration: 30,  status: 'active',   description: 'Professional manicure including shaping, cuticle care, and polish.' },
  { id: 10, name: 'Pedicure',                   category: 'Nail Care',       price: 299,  duration: 30,  status: 'active',   description: 'Professional pedicure with soak, scrub, shaping, and polish.' },
  { id: 11, name: 'Gel Nails (Mani & Pedi)',    category: 'Nail Care',       price: 1199, duration: 90,  status: 'active',   description: 'Full gel manicure and pedicure combo package.' },
  { id: 12, name: 'Nails Extension',            category: 'Nail Care',       price: 1499, duration: 120, status: 'inactive', description: 'Professional nail extensions for added length and strength.' },
  { id: 13, name: 'Ear Wax Candling',           category: 'Other Services',  price: 350,  duration: 30,  status: 'active',   description: 'Ear candling therapy to gently remove excess earwax.' },
  { id: 14, name: 'Eyebrow Threading',          category: 'Other Services',  price: 150,  duration: 15,  status: 'active',   description: 'Precise eyebrow shaping using traditional threading.' },
  { id: 15, name: 'Foot Spa',                   category: 'Other Services',  price: 450,  duration: 45,  status: 'active',   description: 'Relaxing foot soak, scrub, and moisturizing treatment.' },
];

const INITIAL_OFFERS = [
  { id: 1, name: 'Wellness Duo Bundle',    description: 'Swedish Massage + Foot Spa combo at a special price.', services: [1, 15], discount: 15, price: 1020, validFrom: '2026-07-01', validTo: '2026-08-31', status: 'active',   minBookings: 1 },
  { id: 2, name: 'Nail Care Package',      description: 'Full nail care experience — Mani, Pedi, and Foot Spa.', services: [9, 10, 15], discount: 10, price: 940, validFrom: '2026-07-01', validTo: '2026-09-30', status: 'active',   minBookings: 1 },
  { id: 3, name: 'Couple Retreat',         description: 'Couple Massage + Ventosa for two.', services: [6, 7], discount: 12, price: 1758, validFrom: '2026-07-15', validTo: '2026-07-31', status: 'inactive', minBookings: 2 },
  { id: 4, name: 'Deep Recovery Bundle',   description: 'Deep Tissue + Lymphatic Massage for full-body recovery.', services: [2, 8], discount: 10, price: 1663, validFrom: '2026-08-01', validTo: '2026-10-31', status: 'active',   minBookings: 1 },
];

const CATEGORIES = ['All', 'Massage Therapy', 'Nail Care', 'Other Services'];
const CAT_META = {
  'Massage Therapy': { color: '#10b981', bg: 'rgba(16,185,129,0.12)', darkColor: '#34d399' },
  'Nail Care':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', darkColor: '#fbbf24' },
  'Other Services':  { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', darkColor: '#818cf8' },
};

/* ─── SHARED FORM COMPONENTS ─────────────────────────────────────── */
const Field = ({ label, error, children, required, hint, icon: Icon }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
        style={{ color: '#8e97a4' }}>
        {Icon && <Icon className="w-3 h-3" />}
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      {hint && <span className="text-[10px]" style={{ color: '#94a3b8' }}>{hint}</span>}
    </div>
    {children}
    {error && (
      <motion.p initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }}
        className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
      </motion.p>
    )}
  </div>
);

const Input = ({ t, error, icon: Icon, ...props }) => (
  <div className="relative flex items-center">
    {Icon && <Icon className="w-3.5 h-3.5 absolute left-3 pointer-events-none" style={{ color: t.txtMuted }} />}
    <input
      className={`w-full ${Icon ? 'pl-9' : 'px-3.5'} py-2.5 rounded-xl text-xs outline-none transition-all duration-200`}
      style={{
        background: t.inputBg,
        border: `1px solid ${error ? t.danger : t.inputBorder}`,
        color: t.txt,
      }}
      onFocus={e => { e.target.style.borderColor = error ? t.danger : t.accent; }}
      onBlur={e => { e.target.style.borderColor = error ? t.danger : t.inputBorder; }}
      {...props}
    />
  </div>
);

const Textarea = ({ t, error, ...props }) => (
  <textarea
    rows={3}
    className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all duration-200 resize-none"
    style={{
      background: t.inputBg,
      border: `1px solid ${error ? t.danger : t.inputBorder}`,
      color: t.txt,
    }}
    onFocus={e => { e.target.style.borderColor = error ? t.danger : t.accent; }}
    onBlur={e => { e.target.style.borderColor = error ? t.danger : t.inputBorder; }}
    {...props}
  />
);

const Select = ({ t, error, icon: Icon, children, ...props }) => (
  <div className="relative flex items-center">
    {Icon && <Icon className="w-3.5 h-3.5 absolute left-3 pointer-events-none" style={{ color: t.txtMuted }} />}
    <select
      className={`w-full ${Icon ? 'pl-9' : 'px-3.5'} pr-8 py-2.5 rounded-xl text-xs outline-none transition-all duration-200 appearance-none bg-no-repeat bg-right cursor-pointer font-bold`}
      style={{
        background: t.inputBg,
        border: `1px solid ${error ? t.danger : t.inputBorder}`,
        color: t.txt,
      }}
      onFocus={e => { e.target.style.borderColor = error ? t.danger : t.accent; }}
      onBlur={e => { e.target.style.borderColor = error ? t.danger : t.inputBorder; }}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="w-3.5 h-3.5 absolute right-3 pointer-events-none" style={{ color: t.txtMuted }} />
  </div>
);

/* ─── MODAL SHEET (100% RESPONSIVE BACKDROP & BOTTOM SHEET DRAWER) ──── */
const ModalSheet = ({ children, onClose, wide = false }) => {
  useEffect(() => {
    // Prevent background scrolling when modal is active
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.98 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className={`w-full ${wide ? 'max-w-full sm:max-w-2xl' : 'max-w-full sm:max-w-lg'} rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl my-0 sm:my-auto overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile touch drag indicator handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-400/30 mx-auto my-2.5 block sm:hidden flex-shrink-0" />
        {children}
      </motion.div>
    </div>
  );
};

/* ─── CONFIRM DELETE MODAL ────────────────────────────────────────── */
const DeleteModal = ({ item, type = 'service', onConfirm, onClose, t }) => {
  if (!item) return null;
  return (
    <ModalSheet onClose={onClose}>
      <div style={{ background: t.card, border: t.cardBorder }} className="p-6 rounded-t-3xl sm:rounded-3xl space-y-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <Trash2 className="w-8 h-8 text-red-500" />
            <span className="absolute inset-0 rounded-2xl animate-ping opacity-25" style={{ background: 'rgba(239,68,68,0.3)' }} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md text-red-500 bg-red-500/10">
              Confirm Permanent Deletion
            </span>
            <h3 className="font-black text-lg mt-2 leading-snug" style={{ color: t.txt }}>
              Delete "{item.name}"?
            </h3>
            <p className="text-xs mt-1.5 max-w-sm mx-auto leading-relaxed" style={{ color: t.txtMuted }}>
              Are you sure you want to remove this {type}? This record will be erased from the system catalog.
            </p>
          </div>
        </div>

        {/* Item preview chip */}
        <div className="p-3.5 rounded-2xl flex items-center justify-between text-xs" style={{ background: t.inner, border: t.innerBorder }}>
          <div className="min-w-0 pr-2">
            <p className="font-bold truncate" style={{ color: t.txt }}>{item.name}</p>
            <p className="text-[10px] truncate" style={{ color: t.txtMuted }}>{item.category || `${item.services?.length} Included Services`}</p>
          </div>
          <span className="font-black text-sm" style={{ color: t.gold }}>₱{item.price?.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-xs font-bold transition-all hover:opacity-80 active:scale-95"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
            <Trash2 className="w-3.5 h-3.5" />
            <span>Yes, Delete</span>
          </button>
        </div>
      </div>
    </ModalSheet>
  );
};

/* ─── TOAST NOTIFICATION ──────────────────────────────────────────── */
const Toast = ({ msg, type = 'success' }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold whitespace-nowrap"
    style={{
      background: type === 'success' ? '#0a3d30' : '#b91c1c',
      color: '#fff',
      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    }}
  >
    {type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-300" />}
    {msg}
  </motion.div>
);

/* ════════════════════════════════════════════════════════════════════
   SERVICES SUBMENU TAB MODULE
════════════════════════════════════════════════════════════════════ */
const ServicesTab = ({ t, isDark }) => {
  const [services, setServices]         = useState(INITIAL_SERVICES);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode]         = useState('grid');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);
  const [viewItem, setViewItem]         = useState(null);

  const EMPTY = { name: '', category: 'Massage Therapy', price: '', duration: '', description: '', status: 'active' };
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const accentColor = isDark ? '#34d399' : '#0a3d30';

  const filtered = useMemo(() => {
    return services.filter(s => {
      const q = search.toLowerCase().trim();
      return (filterCat === 'All' || s.category === filterCat)
        && (filterStatus === 'All' || s.status === filterStatus)
        && (!q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    });
  }, [services, search, filterCat, filterStatus]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter(s => s.status === 'active').length;
    const avgPrice = total ? Math.round(services.reduce((acc, curr) => acc + curr.price, 0) / total) : 0;
    const avgDuration = total ? Math.round(services.reduce((acc, curr) => acc + curr.duration, 0) / total) : 0;
    return { total, active, avgPrice, avgDuration };
  }, [services]);

  const openAdd = () => { setForm(EMPTY); setErrors({}); setEditing(null); setModalOpen(true); };
  const openEdit = (svc) => {
    setForm({ ...svc, price: String(svc.price), duration: String(svc.duration) });
    setErrors({}); setEditing(svc.id); setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Service name is required.';
    else if (form.name.trim().length < 3) e.name = 'Name must be at least 3 characters.';

    if (!form.category) e.category = 'Please select a category.';

    const numPrice = Number(form.price);
    if (!form.price || isNaN(numPrice) || numPrice <= 0) e.price = 'Price must be a valid amount greater than 0.';

    const numDuration = Number(form.duration);
    if (!form.duration || isNaN(numDuration) || numDuration <= 0) e.duration = 'Duration must be in minutes.';

    if (!form.description.trim()) e.description = 'Service description is required.';

    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const payload = { ...form, price: Number(form.price), duration: Number(form.duration) };
    if (editing) {
      setServices(prev => prev.map(s => s.id === editing ? { ...payload, id: editing } : s));
      showToast('Service updated successfully.');
    } else {
      setServices(prev => [{ ...payload, id: Date.now() }, ...prev]);
      showToast('New service created.');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
    showToast('Service deleted.', 'success');
    setDeleteTarget(null);
  };

  const toggleStatus = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
    showToast('Service status updated.');
  };

  const catStyle = (cat) => {
    const m = CAT_META[cat] || { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', darkColor: '#818cf8' };
    return { background: m.bg, color: isDark ? m.darkColor : m.color };
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>
      <DeleteModal item={deleteTarget} type="service" onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} t={t} />

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Services', value: stats.total, sub: 'In catalog', icon: ShoppingBag, color: accentColor },
          { label: 'Active Offerings', value: stats.active, sub: `${Math.round((stats.active/stats.total)*100 || 0)}% active`, icon: CheckCircle, color: t.success },
          { label: 'Avg Price', value: `₱${stats.avgPrice.toLocaleString()}`, sub: 'Per treatment', icon: Tag, color: t.gold },
          { label: 'Avg Duration', value: `${stats.avgDuration} min`, sub: 'Session length', icon: Clock, color: t.info },
        ].map((kpi, idx) => (
          <div key={idx} className="p-3.5 sm:p-4 rounded-2xl flex items-center justify-between"
            style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.txtMuted }}>{kpi.label}</p>
              <p className="text-base sm:text-lg font-black mt-0.5" style={{ color: t.txt }}>{kpi.value}</p>
              <p className="text-[9px] mt-0.5 font-medium" style={{ color: t.txtMuted }}>{kpi.sub}</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${kpi.color}15` }}>
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: t.card, border: t.cardBorder }}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: t.txtMuted }} />
            <input
              type="text"
              placeholder="Search services by name or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs outline-none transition-all"
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.txt }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5" style={{ color: t.txtMuted }} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl" style={{ background: t.inner, border: t.innerBorder }}>
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'shadow-sm' : ''}`}
                style={{ background: viewMode === 'grid' ? (isDark ? '#1a2a3a' : '#fff') : 'transparent', color: viewMode === 'grid' ? accentColor : t.txtMuted }}
                title="Grid View">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'shadow-sm' : ''}`}
                style={{ background: viewMode === 'table' ? (isDark ? '#1a2a3a' : '#fff') : 'transparent', color: viewMode === 'table' ? accentColor : t.txtMuted }}
                title="Table View">
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
              style={{ background: 'linear-gradient(135deg,#0a3d30,#0f5f4a)' }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2" style={{ borderTop: `1px solid ${t.divider}` }}>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => {
              const active = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap"
                  style={{
                    background: active ? `${accentColor}18` : t.inner,
                    color: active ? accentColor : t.txtSub,
                    border: `1px solid ${active ? accentColor : 'transparent'}`,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.txtMuted }}>Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 rounded-lg text-xs outline-none cursor-pointer font-bold"
              style={{ background: t.inner, border: t.innerBorder, color: t.txt }}
            >
              <option value="All" style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>All Status</option>
              <option value="active" style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>Active</option>
              <option value="inactive" style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: SERVICE CREATE / EDIT FORM MODAL ── */}
      {modalOpen && (
        <ModalSheet onClose={() => setModalOpen(false)}>
          <div style={{ background: t.card }} className="flex flex-col h-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${t.divider}` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${accentColor}18` }}>
                  <ShoppingBag className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base leading-tight" style={{ color: t.txt }}>
                    {editing ? 'Edit Service Details' : 'Create New Spa Service'}
                  </h3>
                  <p className="text-[10px]" style={{ color: t.txtMuted }}>
                    {editing ? 'Update catalog service information' : 'Add a new bookable treatment to catalog'}
                  </p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
                style={{ background: t.inner, color: t.txtMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 max-h-[70vh]">
              
              {/* Real-time Live Card Preview Box */}
              <div className="p-3.5 rounded-2xl border border-dashed relative overflow-hidden"
                style={{ background: t.inner, borderColor: `${accentColor}40` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" style={catStyle(form.category || 'Massage Therapy')}>
                    {form.category || 'Massage Therapy'}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md capitalize"
                    style={{
                      background: form.status === 'active' ? `${t.success}18` : `${t.danger}15`,
                      color: form.status === 'active' ? t.success : t.danger,
                    }}>
                    {form.status || 'active'}
                  </span>
                </div>
                <h5 className="font-black text-xs truncate" style={{ color: t.txt }}>{form.name || 'Service Name Preview'}</h5>
                <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: t.txtMuted }}>{form.description || 'Description preview will appear here as you type...'}</p>
                <div className="flex items-center justify-between mt-2.5 pt-2" style={{ borderTop: `1px solid ${t.divider}` }}>
                  <span className="text-[10px] font-bold" style={{ color: t.txtMuted }}>🕒 {form.duration || 60} mins</span>
                  <span className="text-xs font-black" style={{ color: t.gold }}>₱{form.price ? Number(form.price).toLocaleString() : '0'}</span>
                </div>
              </div>

              {/* Form Input Fields */}
              <Field label="Service Title" required error={errors.name} icon={Tag}>
                <Input t={t} icon={Tag} error={errors.name} placeholder="e.g. Aromatherapy Hot Stone Massage"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Category" required error={errors.category} icon={Layers}>
                  <Select t={t} icon={Layers} error={errors.category}
                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>{c}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Availability Status" required icon={CheckSquare}>
                  <Select t={t} icon={CheckSquare}
                    value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active" style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>Active (Bookable)</option>
                    <option value="inactive" style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>Inactive (Hidden)</option>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Price (₱ PHP)" required error={errors.price} icon={DollarSign} hint="Standard rate">
                  <Input t={t} icon={DollarSign} type="number" error={errors.price} placeholder="750"
                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </Field>

                <Field label="Duration (Minutes)" required error={errors.duration} icon={Clock} hint="Session length">
                  <Input t={t} icon={Clock} type="number" error={errors.duration} placeholder="60"
                    value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </Field>
              </div>

              <Field label="Full Treatment Description" required error={errors.description} icon={FileText}>
                <Textarea t={t} error={errors.description} placeholder="Describe the therapeutic benefits, techniques, and client expectations..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </Field>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 flex-shrink-0"
              style={{ borderTop: `1px solid ${t.divider}`, background: t.inner }}>
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                style={{ color: t.txtSub }}>
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-md"
                style={{ background: 'linear-gradient(135deg,#0a3d30,#0f5f4a)' }}>
                <Save className="w-3.5 h-3.5" />
                <span>{editing ? 'Update Service' : 'Create Service'}</span>
              </button>
            </div>

          </div>
        </ModalSheet>
      )}

      {/* ── MODAL 2: SERVICE DETAIL INSPECTOR VIEW MODAL ── */}
      {viewItem && (
        <ModalSheet onClose={() => setViewItem(null)}>
          <div style={{ background: t.card }} className="flex flex-col h-full overflow-hidden">
            
            {/* Header Hero Banner */}
            <div className="p-5 sm:p-6 pb-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${accentColor}15, rgba(191,161,95,0.1))` }}>
              
              <div className="flex items-start justify-between relative z-10">
                <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm"
                  style={catStyle(viewItem.category)}>
                  {viewItem.category}
                </span>

                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(viewItem.id)}
                    className="text-[9px] font-bold px-2.5 py-1 rounded-full capitalize shadow-sm transition-all"
                    style={{
                      background: viewItem.status === 'active' ? `${t.success}20` : `${t.danger}18`,
                      color: viewItem.status === 'active' ? t.success : t.danger,
                      border: `1px solid ${viewItem.status === 'active' ? t.success : t.danger}30`,
                    }}>
                    ● {viewItem.status}
                  </button>
                  <button onClick={() => setViewItem(null)} className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-900/10 text-slate-500 hover:opacity-80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-black text-lg sm:text-xl mt-3 leading-snug" style={{ color: t.txt }}>
                {viewItem.name}
              </h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90 line-clamp-2" style={{ color: t.txtSub }}>
                {viewItem.description}
              </p>

              {/* Price & Duration Badge Card */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl backdrop-blur-md" style={{ background: t.card, border: t.cardBorder }}>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Standard Price</p>
                  <p className="text-lg font-black mt-0.5" style={{ color: t.gold }}>₱{viewItem.price.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-2xl backdrop-blur-md" style={{ background: t.card, border: t.cardBorder }}>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Treatment Time</p>
                  <p className="text-lg font-black mt-0.5" style={{ color: t.txt }}>{viewItem.duration} Mins</p>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 max-h-[50vh]">
              <div className="p-4 rounded-2xl space-y-2" style={{ background: t.inner, border: t.innerBorder }}>
                <h5 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: t.txtMuted }}>
                  <Info className="w-3.5 h-3.5" style={{ color: accentColor }} /> Service Highlights & Guidance
                </h5>
                <p className="text-xs leading-relaxed" style={{ color: t.txtSub }}>
                  {viewItem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ background: t.inner, border: t.innerBorder }}>
                  <Sparkles className="w-4 h-4" style={{ color: t.gold }} />
                  <div>
                    <p className="text-[9px] font-bold uppercase" style={{ color: t.txtMuted }}>Popularity</p>
                    <p className="font-extrabold" style={{ color: t.txt }}>High Demand</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ background: t.inner, border: t.innerBorder }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: t.success }} />
                  <div>
                    <p className="text-[9px] font-bold uppercase" style={{ color: t.txtMuted }}>Staff Certified</p>
                    <p className="font-extrabold" style={{ color: t.txt }}>Licensed Therapists</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="flex items-center gap-2 px-5 sm:px-6 py-3.5 flex-shrink-0"
              style={{ borderTop: `1px solid ${t.divider}`, background: t.inner }}>
              <button onClick={() => { const target = viewItem; setViewItem(null); openEdit(target); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>
                <Pencil className="w-3.5 h-3.5" /> Edit Service
              </button>
              <button onClick={() => setViewItem(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>
                Close
              </button>
            </div>

          </div>
        </ModalSheet>
      )}

      {/* CONTENT LISTING */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl space-y-3" style={{ background: t.card, border: t.cardBorder }}>
          <ShoppingBag className="w-10 h-10 mx-auto opacity-30" style={{ color: t.txtMuted }} />
          <p className="text-sm font-bold" style={{ color: t.txt }}>No services found</p>
          <button onClick={() => { setSearch(''); setFilterCat('All'); setFilterStatus('All'); }}
            className="px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: `${accentColor}15`, color: accentColor }}>
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((svc, idx) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              className="p-4 rounded-2xl flex flex-col justify-between group transition-all duration-200 hover:-translate-y-1"
              style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={catStyle(svc.category)}>
                    {svc.category}
                  </span>

                  <button
                    onClick={() => toggleStatus(svc.id)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md capitalize transition-all"
                    style={{
                      background: svc.status === 'active' ? `${t.success}18` : `${t.danger}15`,
                      color: svc.status === 'active' ? t.success : t.danger,
                    }}
                  >
                    {svc.status}
                  </button>
                </div>

                <h4 className="font-extrabold text-sm group-hover:text-emerald-500 transition-colors"
                  style={{ color: t.txt }}>
                  {svc.name}
                </h4>

                <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: t.txtMuted }}>
                  {svc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 space-y-3" style={{ borderTop: `1px solid ${t.divider}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs" style={{ color: t.txtMuted }}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{svc.duration} mins</span>
                  </div>
                  <span className="text-base font-black" style={{ color: t.gold }}>
                    ₱{svc.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button onClick={() => setViewItem(svc)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all hover:opacity-80 active:scale-95"
                    style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => openEdit(svc)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all hover:opacity-80 active:scale-95"
                    style={{ background: `${accentColor}15`, color: accentColor }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(svc)}
                    className="p-2 rounded-xl text-red-500 transition-all hover:bg-red-500/10 active:scale-95"
                    title="Delete Service">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: t.card, border: t.cardBorder }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: t.divider, background: t.inner }}>
                  <th className="px-4 py-3 font-black uppercase text-[9px] tracking-wider" style={{ color: t.txtMuted }}>Service</th>
                  <th className="px-4 py-3 font-black uppercase text-[9px] tracking-wider" style={{ color: t.txtMuted }}>Category</th>
                  <th className="px-4 py-3 font-black uppercase text-[9px] tracking-wider" style={{ color: t.txtMuted }}>Duration</th>
                  <th className="px-4 py-3 font-black uppercase text-[9px] tracking-wider" style={{ color: t.txtMuted }}>Price</th>
                  <th className="px-4 py-3 font-black uppercase text-[9px] tracking-wider" style={{ color: t.txtMuted }}>Status</th>
                  <th className="px-4 py-3 font-black uppercase text-[9px] tracking-wider text-right" style={{ color: t.txtMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: t.divider }}>
                {filtered.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-xs" style={{ color: t.txt }}>{svc.name}</p>
                      <p className="text-[10px] truncate max-w-xs" style={{ color: t.txtMuted }}>{svc.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase" style={catStyle(svc.category)}>
                        {svc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: t.txtSub }}>{svc.duration} mins</td>
                    <td className="px-4 py-3 font-black" style={{ color: t.gold }}>₱{svc.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(svc.id)}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md capitalize"
                        style={{
                          background: svc.status === 'active' ? `${t.success}18` : `${t.danger}15`,
                          color: svc.status === 'active' ? t.success : t.danger,
                        }}>
                        {svc.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setViewItem(svc)} className="p-1.5 rounded-lg hover:opacity-80"
                          style={{ background: t.inner, color: t.txtSub }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(svc)} className="p-1.5 rounded-lg hover:opacity-80"
                          style={{ background: `${accentColor}18`, color: accentColor }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(svc)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   OFFERS SUBMENU TAB MODULE
════════════════════════════════════════════════════════════════════ */
const OffersTab = ({ t, isDark }) => {
  const [offers, setOffers]             = useState(INITIAL_OFFERS);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);
  const [viewItem, setViewItem]         = useState(null);

  const EMPTY_OFFER = {
    name: '', description: '', services: [], discount: '', price: '',
    validFrom: '', validTo: '', status: 'active', minBookings: '1'
  };
  const [form, setForm]     = useState(EMPTY_OFFER);
  const [errors, setErrors] = useState({});

  const accentColor = isDark ? '#34d399' : '#0a3d30';

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const filtered = useMemo(() => {
    return offers.filter(o => {
      const q = search.toLowerCase().trim();
      return (filterStatus === 'All' || o.status === filterStatus)
        && (!q || o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
    });
  }, [offers, search, filterStatus]);

  const stats = useMemo(() => {
    const total = offers.length;
    const active = offers.filter(o => o.status === 'active').length;
    const avgDiscount = total ? Math.round(offers.reduce((acc, c) => acc + c.discount, 0) / total) : 0;
    return { total, active, avgDiscount };
  }, [offers]);

  const originalTotalPrice = useMemo(() => {
    return form.services.reduce((sum, sId) => {
      const found = INITIAL_SERVICES.find(s => s.id === sId);
      return sum + (found ? found.price : 0);
    }, 0);
  }, [form.services]);

  const handleDiscountChange = (val) => {
    const disc = Number(val);
    const updatedForm = { ...form, discount: val };
    if (!isNaN(disc) && disc > 0 && disc < 100 && originalTotalPrice > 0) {
      updatedForm.price = String(Math.round(originalTotalPrice * (1 - disc / 100)));
    }
    setForm(updatedForm);
  };

  const openAdd = () => { setForm(EMPTY_OFFER); setErrors({}); setEditing(null); setModalOpen(true); };
  const openEdit = (offer) => {
    setForm({
      ...offer,
      discount: String(offer.discount),
      price: String(offer.price),
      minBookings: String(offer.minBookings)
    });
    setErrors({}); setEditing(offer.id); setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Offer bundle name is required.';
    else if (form.name.trim().length < 3) e.name = 'Name must be at least 3 characters.';

    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.services || form.services.length < 2) e.services = 'Select at least 2 services for a promo bundle.';

    const disc = Number(form.discount);
    if (!form.discount || isNaN(disc) || disc < 1 || disc > 99) e.discount = 'Discount percentage must be between 1% and 99%.';

    const price = Number(form.price);
    if (!form.price || isNaN(price) || price <= 0) e.price = 'Enter a valid offer price.';

    if (!form.validFrom) e.validFrom = 'Start validity date is required.';
    if (!form.validTo) e.validTo = 'Expiration date is required.';
    if (form.validFrom && form.validTo && form.validFrom >= form.validTo) e.validTo = 'Expiration date must be after start date.';

    return e;
  };

  const toggleService = (id) => {
    const newServices = form.services.includes(id)
      ? form.services.filter(s => s !== id)
      : [...form.services, id];

    const updatedForm = { ...form, services: newServices };
    const disc = Number(form.discount);
    const newOrigPrice = newServices.reduce((sum, sId) => {
      const found = INITIAL_SERVICES.find(s => s.id === sId);
      return sum + (found ? found.price : 0);
    }, 0);

    if (!isNaN(disc) && disc > 0 && disc < 100 && newOrigPrice > 0) {
      updatedForm.price = String(Math.round(newOrigPrice * (1 - disc / 100)));
    }
    setForm(updatedForm);
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const payload = {
      ...form,
      discount: Number(form.discount),
      price: Number(form.price),
      minBookings: Number(form.minBookings || 1)
    };

    if (editing) {
      setOffers(prev => prev.map(o => o.id === editing ? { ...payload, id: editing } : o));
      showToast('Offer bundle updated successfully.');
    } else {
      setOffers(prev => [{ ...payload, id: Date.now() }, ...prev]);
      showToast('New promotional offer created.');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    setOffers(prev => prev.filter(o => o.id !== deleteTarget.id));
    showToast('Offer deleted.');
    setDeleteTarget(null);
  };

  const toggleStatus = (id) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o));
    showToast('Offer status updated.');
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>
      <DeleteModal item={deleteTarget} type="offer" onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} t={t} />

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Active Offers', value: stats.active, sub: `Out of ${stats.total} total bundles`, icon: Gift, color: accentColor },
          { label: 'Avg Discount Rate', value: `${stats.avgDiscount}% OFF`, sub: 'Customer savings', icon: Percent, color: t.gold },
          { label: 'Bundles Online', value: `${stats.active} Deals`, sub: 'Ready for booking', icon: Sparkles, color: t.info },
        ].map((kpi, idx) => (
          <div key={idx} className="p-3.5 sm:p-4 rounded-2xl flex items-center justify-between"
            style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.txtMuted }}>{kpi.label}</p>
              <p className="text-base sm:text-lg font-black mt-0.5" style={{ color: t.txt }}>{kpi.value}</p>
              <p className="text-[9px] mt-0.5 font-medium" style={{ color: t.txtMuted }}>{kpi.sub}</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${kpi.color}15` }}>
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
        style={{ background: t.card, border: t.cardBorder }}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: t.txtMuted }} />
          <input
            type="text"
            placeholder="Search promotional bundles & offers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs outline-none transition-all"
            style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.txt }}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs outline-none cursor-pointer font-bold"
            style={{ background: t.inner, border: t.innerBorder, color: t.txt }}
          >
            <option value="All" style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>All Offers</option>
            <option value="active" style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>Active Only</option>
            <option value="inactive" style={{ background: isDark ? '#161d2c' : '#ffffff', color: isDark ? '#dde6f0' : '#14181f' }}>Inactive Only</option>
          </select>

          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#0a3d30,#0f5f4a)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer</span>
          </button>
        </div>
      </div>

      {/* ── MODAL 3: OFFER CREATE / EDIT FORM MODAL ── */}
      {modalOpen && (
        <ModalSheet onClose={() => setModalOpen(false)} wide>
          <div style={{ background: t.card }} className="flex flex-col h-full overflow-hidden">
            
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${t.divider}` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${accentColor}18` }}>
                  <Gift className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base leading-tight" style={{ color: t.txt }}>
                    {editing ? 'Edit Promotional Offer' : 'Create New Offer Bundle'}
                  </h3>
                  <p className="text-[10px]" style={{ color: t.txtMuted }}>
                    Bundle multiple services with custom discount rates
                  </p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
                style={{ background: t.inner, color: t.txtMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 max-h-[72vh]">
              <Field label="Offer Name" required error={errors.name} icon={Tag}>
                <Input t={t} icon={Tag} error={errors.name} placeholder="e.g. Total Body & Foot Pamper Bundle"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </Field>

              <Field label="Offer Summary" required error={errors.description} icon={FileText}>
                <Textarea t={t} error={errors.description} placeholder="Describe what makes this offer special for clients..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </Field>

              <Field label="Select Included Services" required error={errors.services} icon={Layers} hint="Min. 2 services required">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 rounded-2xl"
                  style={{ background: t.inner, border: t.innerBorder }}>
                  {INITIAL_SERVICES.map(s => {
                    const checked = form.services.includes(s.id);
                    return (
                      <label key={s.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${checked ? 'shadow-sm' : ''}`}
                        style={{
                          background: checked ? (isDark ? '#1a2a3a' : '#ffffff') : 'transparent',
                          border: `1px solid ${checked ? accentColor : 'transparent'}`,
                        }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(s.id)}
                          className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate" style={{ color: t.txt }}>{s.name}</p>
                          <p className="text-[9px]" style={{ color: t.txtMuted }}>₱{s.price} · {s.duration} mins</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Field>

              {form.services.length > 0 && (
                <div className="p-3 rounded-2xl flex items-center justify-between text-xs font-bold"
                  style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25` }}>
                  <span style={{ color: t.txtSub }}>Sum of Original Prices:</span>
                  <span className="line-through text-slate-400">₱{originalTotalPrice.toLocaleString()}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Discount Percentage (%)" required error={errors.discount} icon={Percent}>
                  <Input t={t} icon={Percent} type="number" error={errors.discount} placeholder="15"
                    value={form.discount} onChange={e => handleDiscountChange(e.target.value)} />
                </Field>

                <Field label="Calculated Bundle Price (₱)" required error={errors.price} icon={DollarSign}>
                  <Input t={t} icon={DollarSign} type="number" error={errors.price} placeholder="999"
                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Start Validity Date" required error={errors.validFrom} icon={Calendar}>
                  <DatePickerInput value={form.validFrom} onChange={d => setForm({ ...form, validFrom: d })} placeholder="mm/dd/yyyy" isDark={isDark} className="w-full" />
                </Field>

                <Field label="Expiration Date" required error={errors.validTo} icon={Calendar}>
                  <DatePickerInput value={form.validTo} onChange={d => setForm({ ...form, validTo: d })} placeholder="mm/dd/yyyy" isDark={isDark} className="w-full" />
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 flex-shrink-0"
              style={{ borderTop: `1px solid ${t.divider}`, background: t.inner }}>
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                style={{ color: t.txtSub }}>
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-md"
                style={{ background: 'linear-gradient(135deg,#0a3d30,#0f5f4a)' }}>
                <Save className="w-3.5 h-3.5" />
                <span>{editing ? 'Update Offer' : 'Create Offer'}</span>
              </button>
            </div>

          </div>
        </ModalSheet>
      )}

      {/* ── MODAL 4: OFFER DETAIL INSPECTOR VIEW MODAL ── */}
      {viewItem && (
        <ModalSheet onClose={() => setViewItem(null)}>
          <div style={{ background: t.card }} className="flex flex-col h-full overflow-hidden">
            
            <div className="p-5 sm:p-6 pb-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${accentColor}15, rgba(212,184,122,0.15))` }}>
              
              <div className="flex items-start justify-between relative z-10">
                <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm bg-emerald-500/15 text-emerald-500">
                  {viewItem.discount}% SPECIAL DISCOUNT BUNDLE
                </span>

                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(viewItem.id)}
                    className="text-[9px] font-bold px-2.5 py-1 rounded-full capitalize shadow-sm transition-all"
                    style={{
                      background: viewItem.status === 'active' ? `${t.success}20` : `${t.danger}18`,
                      color: viewItem.status === 'active' ? t.success : t.danger,
                    }}>
                    ● {viewItem.status}
                  </button>
                  <button onClick={() => setViewItem(null)} className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-900/10 text-slate-500 hover:opacity-80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-black text-lg sm:text-xl mt-3 leading-snug" style={{ color: t.txt }}>
                {viewItem.name}
              </h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90" style={{ color: t.txtSub }}>
                {viewItem.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl backdrop-blur-md" style={{ background: t.card, border: t.cardBorder }}>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Bundle Price</p>
                  <p className="text-lg font-black mt-0.5" style={{ color: t.gold }}>₱{viewItem.price.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-2xl backdrop-blur-md" style={{ background: t.card, border: t.cardBorder }}>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.txtMuted }}>Validity Period</p>
                  <p className="text-[10px] font-bold mt-1" style={{ color: t.txt }}>{viewItem.validFrom} to {viewItem.validTo}</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3 overflow-y-auto flex-1 max-h-[48vh]">
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: t.txtMuted }}>Included Services Package:</p>
              <div className="space-y-2">
                {viewItem.services.map(sId => {
                  const found = INITIAL_SERVICES.find(s => s.id === sId);
                  if (!found) return null;
                  return (
                    <div key={sId} className="flex items-center justify-between p-3 rounded-2xl text-xs shadow-sm"
                      style={{ background: t.inner, border: t.innerBorder }}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
                        <div className="min-w-0">
                          <p className="font-extrabold truncate" style={{ color: t.txt }}>{found.name}</p>
                          <p className="text-[10px]" style={{ color: t.txtMuted }}>{found.category} · {found.duration} mins</p>
                        </div>
                      </div>
                      <span className="font-black text-sm" style={{ color: t.gold }}>₱{found.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 px-5 sm:px-6 py-3.5 flex-shrink-0"
              style={{ borderTop: `1px solid ${t.divider}`, background: t.inner }}>
              <button onClick={() => { const target = viewItem; setViewItem(null); openEdit(target); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>
                <Pencil className="w-3.5 h-3.5" /> Edit Offer
              </button>
              <button onClick={() => setViewItem(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: t.card, border: t.cardBorder, color: t.txtSub }}>
                Close
              </button>
            </div>

          </div>
        </ModalSheet>
      )}

      {/* OFFERS CARDS LIST */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl space-y-3" style={{ background: t.card, border: t.cardBorder }}>
          <Gift className="w-10 h-10 mx-auto opacity-30" style={{ color: t.txtMuted }} />
          <p className="text-sm font-bold" style={{ color: t.txt }}>No promotional offers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((offer, idx) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="p-5 rounded-2xl flex flex-col justify-between group transition-all duration-200 hover:-translate-y-1"
              style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
                    style={{ background: `${accentColor}15`, color: accentColor }}>
                    {offer.discount}% DISCOUNT
                  </span>
                  <button
                    onClick={() => toggleStatus(offer.id)}
                    className="text-[9px] font-bold px-2.5 py-1 rounded-lg capitalize transition-all"
                    style={{
                      background: offer.status === 'active' ? `${t.success}18` : `${t.danger}15`,
                      color: offer.status === 'active' ? t.success : t.danger,
                    }}
                  >
                    {offer.status}
                  </button>
                </div>

                <h4 className="font-black text-base group-hover:text-emerald-500 transition-colors" style={{ color: t.txt }}>
                  {offer.name}
                </h4>
                <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: t.txtMuted }}>
                  {offer.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {offer.services.map(sId => {
                    const found = INITIAL_SERVICES.find(s => s.id === sId);
                    if (!found) return null;
                    return (
                      <span key={sId} className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                        style={{ background: t.inner, color: t.txtSub, border: t.innerBorder }}>
                        {found.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-3 space-y-3" style={{ borderTop: `1px solid ${t.divider}` }}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-medium" style={{ color: t.txtMuted }}>
                    Valid: <span className="font-bold">{offer.validFrom} → {offer.validTo}</span>
                  </div>
                  <span className="text-lg font-black" style={{ color: t.gold }}>
                    ₱{offer.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button onClick={() => setViewItem(offer)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all hover:opacity-80 active:scale-95"
                    style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => openEdit(offer)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all hover:opacity-80 active:scale-95"
                    style={{ background: `${accentColor}15`, color: accentColor }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(offer)}
                    className="p-2 rounded-xl text-red-500 transition-all hover:bg-red-500/10 active:scale-95">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   MAIN SERVICE MAINTENANCE MODULE PAGE
════════════════════════════════════════════════════════════════════ */
const AdminServices = () => {
  const { theme } = useTheme();
  const t = TOKENS[theme] || TOKENS.light;
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'services';

  const setTab = (key) => setSearchParams({ tab: key });

  const TABS = [
    { key: 'services', label: 'Services', icon: ShoppingBag, count: INITIAL_SERVICES.length, desc: 'Manage all spa offerings & pricing' },
    { key: 'offers',   label: 'Offers',   icon: Gift,        count: INITIAL_OFFERS.length,   desc: 'Promotions, packages & bundles' },
  ];

  const accentColor = isDark ? '#34d399' : '#0a3d30';

  return (
    <AdminLayout title="Service Maintenance" subtitle="Manage services, spa offerings, and bundle promotions" icon={ShoppingBag}>
      <style>{`
        select option {
          background-color: ${isDark ? '#161d2c' : '#ffffff'} !important;
          color: ${isDark ? '#dde6f0' : '#14181f'} !important;
        }
      `}</style>
      <div className="space-y-5 pb-8">

        {/* ── PRO SUBMENU SEGMENTED PILL BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-1.5 rounded-2xl flex items-center gap-1.5 w-full sm:w-auto sm:inline-flex shadow-sm"
          style={{ background: t.card, border: t.cardBorder }}
        >
          {TABS.map(tb => {
            const active = activeTab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className="relative flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                style={{
                  color: active ? (isDark ? '#34d399' : '#0a3d30') : t.txtMuted,
                }}
              >
                {active && (
                  <motion.div
                    layoutId="activeSubmenuBackdrop"
                    className="absolute inset-0 rounded-xl shadow-sm"
                    style={{
                      background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(10,61,48,0.08)',
                      border: `1px solid ${isDark ? 'rgba(52,211,153,0.25)' : 'rgba(10,61,48,0.15)'}`,
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}

                <tb.icon className={`w-4 h-4 relative z-10 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className="relative z-10">{tb.label}</span>
                <span className="relative z-10 px-2 py-0.5 rounded-full text-[10px] font-black"
                  style={{
                    background: active ? (isDark ? '#34d399' : '#0a3d30') : t.inner,
                    color: active ? '#ffffff' : t.txtMuted,
                  }}>
                  {tb.count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* ── TAB CONTENT WITH SMOOTH TRANSITION ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === 'services' && <ServicesTab t={t} isDark={isDark} />}
            {activeTab === 'offers'   && <OffersTab   t={t} isDark={isDark} />}
          </motion.div>
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
};

export default AdminServices;
