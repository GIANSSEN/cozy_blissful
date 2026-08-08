import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import {
  Plus, Pencil, Trash2, X, Search, Clock, ShoppingBag,
  CheckCircle, AlertCircle, Tag, Gift, ToggleLeft, ToggleRight,
  Filter, ChevronDown, Save, Eye, Star, Percent,
  Calendar, Package, Info, Layers,
} from 'lucide-react';

/* ─── TOKENS ──────────────────────────────────────────────────────── */
const TOKENS = {
  light: {
    canvas: '#f5f3ee', card: 'rgba(255,255,255,0.97)',
    cardShadow: '0 2px 20px rgba(0,0,0,0.06)', cardBorder: '1px solid rgba(0,0,0,0.07)',
    inner: '#faf8f4', innerBorder: '1px solid rgba(0,0,0,0.06)',
    txt: '#14181f', txtMuted: '#8e97a4', txtSub: '#4a5568',
    divider: 'rgba(0,0,0,0.07)', hover: 'rgba(0,0,0,0.025)',
    accent: '#0a3d30', gold: '#bfa15f', danger: '#ef4444',
    success: '#10b981', warning: '#f59e0b', info: '#6366f1',
    inputBg: '#fff', inputBorder: 'rgba(0,0,0,0.12)',
    tag: 'rgba(0,0,0,0.05)', tagTxt: '#4a5568',
  },
  dark: {
    canvas: '#0e1320', card: '#161d2c',
    cardShadow: '0 4px 28px rgba(0,0,0,0.4)', cardBorder: '1px solid rgba(255,255,255,0.07)',
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
const SEED_SERVICES = [
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

const SEED_OFFERS = [
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── shared input ────────────────────────────────────────────────── */
const Field = ({ label, error, children, required }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
      style={{ color: '#8e97a4' }}>
      {label}{required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[10px] text-red-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const Input = ({ t, error, ...props }) => (
  <input
    className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all"
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

const Textarea = ({ t, error, ...props }) => (
  <textarea
    rows={3}
    className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all resize-none"
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

const Select = ({ t, error, children, ...props }) => (
  <select
    className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all appearance-none"
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
);

/* ─── modal bottom-sheet wrapper ──────────────────────────────────── */
const ModalSheet = ({ children, onClose, wide = false }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className={`w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl`}
        onClick={e => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ─── confirm delete modal ────────────────────────────────────────── */
const DeleteModal = ({ item, onConfirm, onClose, t }) => {
  if (!item) return null;
  return (
    <ModalSheet onClose={onClose}>
      <div style={{ background: t.card, border: t.cardBorder }} className="rounded-t-3xl sm:rounded-3xl p-5 sm:p-6">
        <div className="w-10 h-1 rounded-full opacity-20 mx-auto mb-4 sm:hidden" style={{ background: t.txtMuted }} />
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-black text-base" style={{ color: t.txt }}>Delete "{item.name}"?</h3>
            <p className="text-xs mt-1" style={{ color: t.txtMuted }}>This action cannot be undone. This record will be permanently removed.</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80 active:opacity-60"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-70"
            style={{ background: 'linear-gradient(135deg,#b91c1c,#ef4444)' }}>
            Yes, Delete
          </button>
        </div>
      </div>
    </ModalSheet>
  );
};

/* ─── toast ───────────────────────────────────────────────────────── */
const Toast = ({ msg, type = 'success' }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap"
    style={{ background: type === 'success' ? '#0a3d30' : '#b91c1c', color: '#fff' }}>
    {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
    {msg}
  </motion.div>
);

/* ════════════════════════════════════════════════════════════════════
   SERVICES TAB
════════════════════════════════════════════════════════════════════ */
const ServicesTab = ({ t, isDark }) => {
  const [services, setServices]     = useState(SEED_SERVICES);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]           = useState(null);
  const [viewItem, setViewItem]     = useState(null);

  const EMPTY = { name: '', category: 'Massage Therapy', price: '', duration: '', description: '', status: 'active' };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const accentColor = isDark ? '#34d399' : '#0a3d30';

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    return (filterCat === 'All' || s.category === filterCat)
      && (filterStatus === 'All' || s.status === filterStatus)
      && (!q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  });

  const openAdd = () => { setForm(EMPTY); setErrors({}); setEditing(null); setModalOpen(true); };
  const openEdit = (svc) => { setForm({ ...svc, price: String(svc.price), duration: String(svc.duration) }); setErrors({}); setEditing(svc.id); setModalOpen(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Service name is required.';
    else if (form.name.trim().length < 3) e.name = 'Name must be at least 3 characters.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price greater than 0.';
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0) e.duration = 'Enter a valid duration in minutes.';
    if (!form.description.trim()) e.description = 'Description is required.';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const payload = { ...form, price: Number(form.price), duration: Number(form.duration) };
    if (editing) {
      setServices(prev => prev.map(s => s.id === editing ? { ...payload, id: editing } : s));
      showToast('Service updated successfully.');
    } else {
      setServices(prev => [...prev, { ...payload, id: Date.now() }]);
      showToast('Service added successfully.');
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
  };

  const catStyle = (cat) => {
    const m = CAT_META[cat] || {};
    return { background: m.bg, color: isDark ? m.darkColor : m.color };
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>
      <DeleteModal item={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} t={t} />

      {/* Service Form Modal */}
      {modalOpen && (
        <ModalSheet onClose={() => setModalOpen(false)}>
          <div style={{ background: t.card }} className="rounded-t-3xl sm:rounded-3xl">
            <div className="w-10 h-1 rounded-full opacity-20 mx-auto mt-3 mb-1 sm:hidden" style={{ background: t.txtMuted }} />
            <div className="flex items-center justify-between px-5 sm:px-6 py-4"
              style={{ borderBottom: `1px solid ${t.divider}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
                  <ShoppingBag className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <h3 className="font-black text-sm" style={{ color: t.txt }}>
                  {editing ? 'Edit Service' : 'Add New Service'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70 active:opacity-50"
                style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <Field label="Service Name" required error={errors.name}>
                <Input t={t} error={errors.name} placeholder="e.g. Swedish Massage"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="Category" required error={errors.category}>
                <Select t={t} error={errors.category} value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['Massage Therapy', 'Nail Care', 'Other Services'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (₱)" required error={errors.price}>
                  <Input t={t} error={errors.price} type="number" min="1" placeholder="749"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </Field>
                <Field label="Duration (min)" required error={errors.duration}>
                  <Input t={t} error={errors.duration} type="number" min="1" placeholder="60"
                    value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </Field>
              </div>
              <Field label="Description" required error={errors.description}>
                <Textarea t={t} error={errors.description} placeholder="Brief description of the service…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>
              <Field label="Status">
                <div className="flex gap-2">
                  {['active', 'inactive'].map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all"
                      style={{
                        background: form.status === s ? (s === 'active' ? `${t.success}18` : `${t.danger}12`) : t.inner,
                        border: form.status === s ? `1px solid ${s === 'active' ? t.success : t.danger}40` : t.innerBorder,
                        color: form.status === s ? (s === 'active' ? t.success : t.danger) : t.txtSub,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="flex gap-2.5 pt-2">
                <button onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg,#062c22,${accentColor})` }}>
                  <Save className="w-4 h-4" />
                  {editing ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* View Modal */}
      {viewItem && (
        <ModalSheet onClose={() => setViewItem(null)}>
          <div style={{ background: t.card }} className="rounded-t-3xl sm:rounded-3xl">
            <div className="w-10 h-1 rounded-full opacity-20 mx-auto mt-3 mb-1 sm:hidden" style={{ background: t.txtMuted }} />
            <div className="flex items-center justify-between px-5 sm:px-6 py-4"
              style={{ borderBottom: `1px solid ${t.divider}` }}>
              <h3 className="font-black text-sm" style={{ color: t.txt }}>Service Details</h3>
              <button onClick={() => setViewItem(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="p-4 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
                <p className="font-black text-base" style={{ color: t.txt }}>{viewItem.name}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg mt-2 inline-block" style={catStyle(viewItem.category)}>
                  {viewItem.category}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Price', value: `₱${viewItem.price.toLocaleString()}`, icon: Tag },
                  { label: 'Duration', value: `${viewItem.duration} min`, icon: Clock },
                  { label: 'Status', value: viewItem.status, icon: CheckCircle },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: t.inner, border: t.innerBorder }}>
                    <item.icon className="w-4 h-4 mx-auto mb-1" style={{ color: t.txtMuted }} />
                    <p className="text-[9px] uppercase tracking-wide font-bold" style={{ color: t.txtMuted }}>{item.label}</p>
                    <p className="text-xs font-black capitalize mt-0.5" style={{ color: t.txt }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
                <p className="text-[9px] uppercase tracking-wider font-bold mb-1.5" style={{ color: t.txtMuted }}>Description</p>
                <p className="text-xs leading-relaxed" style={{ color: t.txtSub }}>{viewItem.description}</p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-80"
                  style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setViewItem(null)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90"
                  style={{ background: `linear-gradient(135deg,#062c22,${accentColor})` }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* Toolbar */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: t.txtMuted }} />
          <input type="text" placeholder="Search services…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border outline-none transition-all"
            style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.txt }}
            onFocus={e => { e.target.style.borderColor = accentColor; }}
            onBlur={e => { e.target.style.borderColor = t.inputBorder; }} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category filter */}
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold outline-none flex-shrink-0"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          {/* Status filter */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold outline-none flex-shrink-0"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            {['All', 'active', 'inactive'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white flex-shrink-0 hover:opacity-90 active:opacity-70"
            style={{ background: `linear-gradient(135deg,#062c22,${accentColor})` }}>
            <Plus className="w-3.5 h-3.5" /> Add Service
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total', value: services.length, color: accentColor },
          { label: 'Active', value: services.filter(s => s.status === 'active').length, color: t.success },
          { label: 'Inactive', value: services.filter(s => s.status === 'inactive').length, color: t.txtMuted },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-2xl text-center"
            style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[9px] uppercase tracking-wide font-bold mt-0.5" style={{ color: t.txtMuted }}>{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Results count */}
      <p className="text-[11px]" style={{ color: t.txtMuted }}>
        Showing <strong style={{ color: t.txt }}>{filtered.length}</strong> of {services.length} services
      </p>

      {/* Table — desktop */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-3xl" style={{ background: t.card, border: t.cardBorder }}>
          <ShoppingBag className="w-10 h-10 mx-auto mb-3" style={{ color: t.txtMuted }} />
          <p className="font-bold text-sm" style={{ color: t.txt }}>No services found</p>
          <p className="text-xs mt-1" style={{ color: t.txtMuted }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-2xl overflow-hidden" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.divider}` }}>
                    {['Service Name', 'Category', 'Price', 'Duration', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                        style={{ color: t.txtMuted, background: t.inner }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((svc, i) => (
                    <motion.tr key={svc.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="group transition-colors cursor-pointer"
                      style={{ borderBottom: `1px solid ${t.divider}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold" style={{ color: t.txt }}>{svc.name}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap" style={catStyle(svc.category)}>
                          {svc.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-black" style={{ color: t.gold }}>₱{svc.price.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] flex items-center gap-1" style={{ color: t.txtSub }}>
                          <Clock className="w-3 h-3" />{svc.duration} min
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => toggleStatus(svc.id)}
                          className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                          style={{
                            background: svc.status === 'active' ? `${t.success}18` : `${t.danger}12`,
                            color: svc.status === 'active' ? t.success : t.danger,
                          }}>
                          {svc.status === 'active'
                            ? <ToggleRight className="w-3.5 h-3.5" />
                            : <ToggleLeft className="w-3.5 h-3.5" />}
                          {svc.status}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewItem(svc)} title="View"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEdit(svc)} title="Edit"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(svc)} title="Delete"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: t.danger }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="block sm:hidden space-y-2">
            {filtered.map((svc, i) => (
              <motion.div key={svc.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: i * 0.03 }}
                className="p-4 rounded-2xl" style={{ background: t.card, border: t.cardBorder }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: t.txt }}>{svc.name}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-block" style={catStyle(svc.category)}>
                      {svc.category}
                    </span>
                  </div>
                  <button onClick={() => toggleStatus(svc.id)}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg flex-shrink-0 capitalize"
                    style={{
                      background: svc.status === 'active' ? `${t.success}18` : `${t.danger}12`,
                      color: svc.status === 'active' ? t.success : t.danger,
                    }}>{svc.status}</button>
                </div>
                <div className="flex items-center gap-3 text-[10px] mb-3" style={{ color: t.txtMuted }}>
                  <span className="font-black" style={{ color: t.gold }}>₱{svc.price.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{svc.duration} min</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewItem(svc)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                    style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => openEdit(svc)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                    style={{ background: `${accentColor}15`, color: accentColor }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(svc)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                    style={{ background: 'rgba(239,68,68,0.1)', color: t.danger }}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   OFFERS TAB
════════════════════════════════════════════════════════════════════ */
const OffersTab = ({ t, isDark }) => {
  const [offers, setOffers]       = useState(SEED_OFFERS);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]         = useState(null);
  const [viewItem, setViewItem]   = useState(null);

  const EMPTY_OFFER = { name: '', description: '', services: [], discount: '', price: '', validFrom: '', validTo: '', status: 'active', minBookings: '1' };
  const [form, setForm] = useState(EMPTY_OFFER);
  const [errors, setErrors] = useState({});

  const accentColor = isDark ? '#34d399' : '#0a3d30';

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const filtered = offers.filter(o => {
    const q = search.toLowerCase();
    return (filterStatus === 'All' || o.status === filterStatus)
      && (!q || o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
  });

  const openAdd = () => { setForm(EMPTY_OFFER); setErrors({}); setEditing(null); setModalOpen(true); };
  const openEdit = (offer) => {
    setForm({ ...offer, discount: String(offer.discount), price: String(offer.price), minBookings: String(offer.minBookings) });
    setErrors({}); setEditing(offer.id); setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Offer name is required.';
    else if (form.name.trim().length < 3) e.name = 'Name must be at least 3 characters.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.services || form.services.length < 2) e.services = 'Select at least 2 services for a bundle.';
    const disc = Number(form.discount);
    if (!form.discount || isNaN(disc) || disc < 1 || disc > 99) e.discount = 'Discount must be between 1% and 99%.';
    const price = Number(form.price);
    if (!form.price || isNaN(price) || price <= 0) e.price = 'Enter a valid offer price.';
    if (!form.validFrom) e.validFrom = 'Start date is required.';
    if (!form.validTo) e.validTo = 'End date is required.';
    if (form.validFrom && form.validTo && form.validFrom >= form.validTo) e.validTo = 'End date must be after start date.';
    const mb = Number(form.minBookings);
    if (!form.minBookings || isNaN(mb) || mb < 1) e.minBookings = 'Min. bookings must be at least 1.';
    return e;
  };

  const toggleService = (id) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(id) ? f.services.filter(s => s !== id) : [...f.services, id],
    }));
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const payload = { ...form, discount: Number(form.discount), price: Number(form.price), minBookings: Number(form.minBookings) };
    if (editing) {
      setOffers(prev => prev.map(o => o.id === editing ? { ...payload, id: editing } : o));
      showToast('Offer updated successfully.');
    } else {
      setOffers(prev => [...prev, { ...payload, id: Date.now() }]);
      showToast('Offer added successfully.');
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
  };

  const getServiceNames = (ids) => SEED_SERVICES.filter(s => ids.includes(s.id)).map(s => s.name).join(', ');

  return (
    <div className="space-y-4">
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>
      <DeleteModal item={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} t={t} />

      {/* Offer Form Modal */}
      {modalOpen && (
        <ModalSheet onClose={() => setModalOpen(false)} wide>
          <div style={{ background: t.card }} className="rounded-t-3xl sm:rounded-3xl">
            <div className="w-10 h-1 rounded-full opacity-20 mx-auto mt-3 mb-1 sm:hidden" style={{ background: t.txtMuted }} />
            <div className="flex items-center justify-between px-5 sm:px-6 py-4"
              style={{ borderBottom: `1px solid ${t.divider}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${t.gold}18`, border: `1px solid ${t.gold}30` }}>
                  <Gift className="w-4 h-4" style={{ color: t.gold }} />
                </div>
                <h3 className="font-black text-sm" style={{ color: t.txt }}>
                  {editing ? 'Edit Offer' : 'Create New Offer'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <Field label="Offer Name" required error={errors.name}>
                <Input t={t} error={errors.name} placeholder="e.g. Wellness Duo Bundle"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="Description" required error={errors.description}>
                <Textarea t={t} error={errors.description} placeholder="Describe what's included…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>

              {/* Service multi-select */}
              <Field label="Included Services (select 2+)" required error={errors.services}>
                <div className="p-3 rounded-xl space-y-1.5 max-h-44 overflow-y-auto"
                  style={{ background: t.inner, border: errors.services ? `1px solid ${t.danger}` : t.innerBorder }}>
                  {SEED_SERVICES.map(svc => {
                    const selected = form.services.includes(svc.id);
                    return (
                      <label key={svc.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all hover:opacity-80"
                        style={{ background: selected ? `${accentColor}12` : 'transparent' }}>
                        <input type="checkbox" checked={selected} onChange={() => toggleService(svc.id)}
                          className="accent-emerald-600 w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium flex-1 truncate" style={{ color: t.txt }}>{svc.name}</span>
                        <span className="text-[10px] font-bold" style={{ color: t.gold }}>₱{svc.price.toLocaleString()}</span>
                      </label>
                    );
                  })}
                </div>
                {form.services.length > 0 && (
                  <p className="text-[10px] mt-1" style={{ color: accentColor }}>
                    {form.services.length} service{form.services.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Discount (%)" required error={errors.discount}>
                  <Input t={t} error={errors.discount} type="number" min="1" max="99" placeholder="15"
                    value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
                </Field>
                <Field label="Offer Price (₱)" required error={errors.price}>
                  <Input t={t} error={errors.price} type="number" min="1" placeholder="1020"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Valid From" required error={errors.validFrom}>
                  <Input t={t} error={errors.validFrom} type="date"
                    value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} />
                </Field>
                <Field label="Valid Until" required error={errors.validTo}>
                  <Input t={t} error={errors.validTo} type="date"
                    value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Min. Bookings" required error={errors.minBookings}>
                  <Input t={t} error={errors.minBookings} type="number" min="1" placeholder="1"
                    value={form.minBookings} onChange={e => setForm(f => ({ ...f, minBookings: e.target.value }))} />
                </Field>
                <Field label="Status">
                  <div className="flex gap-2 h-full">
                    {['active', 'inactive'].map(s => (
                      <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                        className="flex-1 rounded-xl text-xs font-bold capitalize transition-all"
                        style={{
                          background: form.status === s ? (s === 'active' ? `${t.success}18` : `${t.danger}12`) : t.inner,
                          border: form.status === s ? `1px solid ${s === 'active' ? t.success : t.danger}40` : t.innerBorder,
                          color: form.status === s ? (s === 'active' ? t.success : t.danger) : t.txtSub,
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold hover:opacity-80"
                  style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>Cancel</button>
                <button onClick={handleSave}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg,#062c22,${accentColor})` }}>
                  <Save className="w-4 h-4" />{editing ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* View Modal */}
      {viewItem && (
        <ModalSheet onClose={() => setViewItem(null)} wide>
          <div style={{ background: t.card }} className="rounded-t-3xl sm:rounded-3xl">
            <div className="w-10 h-1 rounded-full opacity-20 mx-auto mt-3 mb-1 sm:hidden" style={{ background: t.txtMuted }} />
            <div className="flex items-center justify-between px-5 sm:px-6 py-4"
              style={{ borderBottom: `1px solid ${t.divider}` }}>
              <h3 className="font-black text-sm" style={{ color: t.txt }}>Offer Details</h3>
              <button onClick={() => setViewItem(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
                style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="p-4 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
                <p className="font-black text-base" style={{ color: t.txt }}>{viewItem.name}</p>
                <p className="text-xs mt-1" style={{ color: t.txtSub }}>{viewItem.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Price', value: `₱${viewItem.price.toLocaleString()}`, icon: Tag, color: t.gold },
                  { label: 'Discount', value: `${viewItem.discount}%`, icon: Percent, color: t.success },
                  { label: 'Min. Bookings', value: viewItem.minBookings, icon: Star, color: t.info },
                  { label: 'Status', value: viewItem.status, icon: CheckCircle, color: viewItem.status === 'active' ? t.success : t.danger },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: t.inner, border: t.innerBorder }}>
                    <item.icon className="w-4 h-4 mx-auto mb-1" style={{ color: item.color }} />
                    <p className="text-[9px] uppercase tracking-wide font-bold" style={{ color: t.txtMuted }}>{item.label}</p>
                    <p className="text-xs font-black capitalize mt-0.5" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl space-y-2" style={{ background: t.inner, border: t.innerBorder }}>
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: t.txtMuted }}>Included Services</p>
                {SEED_SERVICES.filter(s => viewItem.services.includes(s.id)).map(svc => (
                  <div key={svc.id} className="flex items-center justify-between text-xs"
                    style={{ color: t.txt }}>
                    <span>{svc.name}</span>
                    <span className="font-bold" style={{ color: t.gold }}>₱{svc.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl" style={{ background: t.inner, border: t.innerBorder }}>
                <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: t.txtMuted }}>Validity Period</p>
                <p className="text-xs font-semibold" style={{ color: t.txt }}>
                  {viewItem.validFrom} → {viewItem.validTo}
                </p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-80"
                  style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setViewItem(null)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90"
                  style={{ background: `linear-gradient(135deg,#062c22,${accentColor})` }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* Toolbar */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: t.txtMuted }} />
          <input type="text" placeholder="Search offers…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border outline-none transition-all"
            style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.txt }}
            onFocus={e => { e.target.style.borderColor = accentColor; }}
            onBlur={e => { e.target.style.borderColor = t.inputBorder; }} />
        </div>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold outline-none"
            style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
            {['All', 'active', 'inactive'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-90 active:opacity-70"
            style={{ background: `linear-gradient(135deg,#062c22,${accentColor})` }}>
            <Plus className="w-3.5 h-3.5" /> Create Offer
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total Offers', value: offers.length, color: t.gold },
          { label: 'Active', value: offers.filter(o => o.status === 'active').length, color: t.success },
          { label: 'Inactive', value: offers.filter(o => o.status === 'inactive').length, color: t.txtMuted },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-2xl text-center"
            style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[9px] uppercase tracking-wide font-bold mt-0.5" style={{ color: t.txtMuted }}>{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <p className="text-[11px]" style={{ color: t.txtMuted }}>
        Showing <strong style={{ color: t.txt }}>{filtered.length}</strong> of {offers.length} offers
      </p>

      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-3xl" style={{ background: t.card, border: t.cardBorder }}>
          <Gift className="w-10 h-10 mx-auto mb-3" style={{ color: t.txtMuted }} />
          <p className="font-bold text-sm" style={{ color: t.txt }}>No offers found</p>
          <p className="text-xs mt-1" style={{ color: t.txtMuted }}>Create your first bundle offer to attract more bookings.</p>
          <button onClick={openAdd}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-80"
            style={{ background: `linear-gradient(135deg,#062c22,${accentColor})` }}>
            Create Offer
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-2xl overflow-hidden"
            style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.divider}` }}>
                    {['Offer Name', 'Included Services', 'Discount', 'Price', 'Validity', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                        style={{ color: t.txtMuted, background: t.inner }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((offer, i) => (
                    <motion.tr key={offer.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="group transition-colors cursor-pointer"
                      style={{ borderBottom: `1px solid ${t.divider}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold" style={{ color: t.txt }}>{offer.name}</p>
                        <p className="text-[10px] mt-0.5 truncate max-w-[180px]" style={{ color: t.txtMuted }}>{offer.description}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px]" style={{ color: t.txtSub }}>
                          {offer.services.length} service{offer.services.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-black flex items-center gap-1" style={{ color: t.success }}>
                          <Percent className="w-3 h-3" />{offer.discount}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-black" style={{ color: t.gold }}>₱{offer.price.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[10px]" style={{ color: t.txtMuted }}>
                        {offer.validFrom} → {offer.validTo}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => toggleStatus(offer.id)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 hover:opacity-80 transition-opacity"
                          style={{
                            background: offer.status === 'active' ? `${t.success}18` : `${t.danger}12`,
                            color: offer.status === 'active' ? t.success : t.danger,
                          }}>
                          {offer.status === 'active' ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {offer.status}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewItem(offer)} title="View"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
                            style={{ background: t.inner, border: t.innerBorder, color: t.txtMuted }}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEdit(offer)} title="Edit"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
                            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(offer)} title="Delete"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: t.danger }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="block sm:hidden space-y-2">
            {filtered.map((offer, i) => (
              <motion.div key={offer.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: i * 0.03 }}
                className="p-4 rounded-2xl" style={{ background: t.card, border: t.cardBorder }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: t.txt }}>{offer.name}</p>
                    <p className="text-[10px] truncate mt-0.5" style={{ color: t.txtMuted }}>{offer.description}</p>
                  </div>
                  <button onClick={() => toggleStatus(offer.id)}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg flex-shrink-0 capitalize"
                    style={{
                      background: offer.status === 'active' ? `${t.success}18` : `${t.danger}12`,
                      color: offer.status === 'active' ? t.success : t.danger,
                    }}>{offer.status}</button>
                </div>
                <div className="flex items-center gap-3 text-[10px] mb-3" style={{ color: t.txtMuted }}>
                  <span className="font-black" style={{ color: t.gold }}>₱{offer.price.toLocaleString()}</span>
                  <span className="text-emerald-500 font-bold">{offer.discount}% off</span>
                  <span>{offer.services.length} services</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewItem(offer)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                    style={{ background: t.inner, border: t.innerBorder, color: t.txtSub }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => openEdit(offer)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                    style={{ background: `${accentColor}15`, color: accentColor }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(offer)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                    style={{ background: 'rgba(239,68,68,0.1)', color: t.danger }}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════ */
const AdminServices = () => {
  const { theme } = useTheme();
  const t = TOKENS[theme] || TOKENS.light;
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'services';

  const setTab = (t) => setSearchParams({ tab: t });

  const TABS = [
    { key: 'services', label: 'Services', icon: ShoppingBag, desc: 'Manage all bookable services' },
    { key: 'offers',   label: 'Offers',   icon: Gift,        desc: 'Bundle offers and promotions' },
  ];

  const accentColor = isDark ? '#34d399' : '#0a3d30';

  return (
    <AdminLayout title="Service Maintenance" subtitle="Manage services and promotional offers" icon={ShoppingBag}>
      <div className="space-y-5 pb-6">

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex gap-2 sm:gap-3 p-1.5 rounded-2xl w-full sm:w-auto sm:inline-flex"
          style={{ background: t.inner, border: t.innerBorder }}>
          {TABS.map(tb => {
            const active = tab === tb.key;
            return (
              <button key={tb.key} onClick={() => setTab(tb.key)}
                className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? (isDark ? '#1a2a3a' : '#fff') : 'transparent',
                  color: active ? accentColor : t.txtMuted,
                  boxShadow: active ? t.cardShadow : 'none',
                  border: active ? `1px solid ${accentColor}20` : '1px solid transparent',
                }}>
                <tb.icon className="w-4 h-4" />
                <span>{tb.label}</span>
                {active && <span className="hidden sm:inline text-[9px] opacity-60 font-normal">· {tb.desc}</span>}
              </button>
            );
          })}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}>
            {tab === 'services' && <ServicesTab t={t} isDark={isDark} />}
            {tab === 'offers'   && <OffersTab   t={t} isDark={isDark} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
