import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import {
  Plus, Pencil, Trash2, X, Save, Search,
  Clock, ShoppingBag, AlertCircle, CheckCircle2,
  ChevronDown, Hourglass
} from 'lucide-react';

const DEFAULT_SERVICES = [
  { name: 'Swedish Massage',               category: 'Massage Therapy', price: 749,  duration: 60,  image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=500&q=80', description: 'Classic relaxing full-body massage with long, gliding strokes.' },
  { name: 'Deep Tissue Massage',           category: 'Massage Therapy', price: 849,  duration: 60,  image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80', description: 'Firm pressure targeting deep muscle layers and chronic tension.' },
  { name: 'Hilot Massage',                 category: 'Massage Therapy', price: 749,  duration: 60,  image: 'https://images.unsplash.com/photo-1519823551278-64ac928349d2?auto=format&fit=crop&w=500&q=80', description: 'Traditional Filipino healing massage using coconut oil.' },
  { name: 'Traditional Massage',           category: 'Massage Therapy', price: 749,  duration: 60,  image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=80', description: 'Standard relaxation massage using medium pressure.' },
  { name: 'Thai Massage',                  category: 'Massage Therapy', price: 849,  duration: 60,  image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=500&q=80', description: 'Assisted stretching and acupressure for flexibility and relief.' },
  { name: 'Post Natal Massage',            category: 'Massage Therapy', price: 899,  duration: 60,  image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=500&q=80', description: 'Gentle restorative massage for mothers after childbirth.' },
  { name: 'Hard Massage',                  category: 'Massage Therapy', price: 849,  duration: 60,  image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=80', description: 'Deep, intense pressure for serious muscle tension relief.' },
  { name: 'Combination Swedish & Hilot',   category: 'Massage Therapy', price: 899,  duration: 60,  image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=500&q=80', description: 'Best of both worlds — Swedish relaxation meets Hilot healing.' },
  { name: 'Ventosa w/ Massage',            category: 'Massage Therapy', price: 999,  duration: 60,  image: 'https://images.unsplash.com/photo-1519824206182-41622907f7e3?auto=format&fit=crop&w=500&q=80', description: 'Cupping therapy combined with full-body relaxation massage.' },
  { name: 'Lymphatic Massage',             category: 'Massage Therapy', price: 999,  duration: 60,  image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=500&q=80', description: 'Gentle drainage technique to boost lymph flow and reduce swelling.' },
  { name: 'Pre-Natal Massage',             category: 'Massage Therapy', price: 899,  duration: 60,  image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80', description: 'Safe, adapted massage for pregnant clients to ease discomfort.' },
  { name: 'Body Scrub / Massage',          category: 'Massage Therapy', price: 999,  duration: 90,  image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=500&q=80', description: 'Exfoliating body scrub followed by full relaxation massage.' },
  { name: 'Couple Massage',                category: 'Massage Therapy', price: 999,  duration: 60,  image: 'https://images.unsplash.com/photo-1519823551278-64ac928349d2?auto=format&fit=crop&w=500&q=80', description: 'Simultaneous massage for two — perfect for partners or friends.' },
  // Nail Care
  { name: 'Manicure',                      category: 'Nail Care',       price: 299,  duration: 30,  image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=500&q=80', description: 'Professional manicure including shaping, cuticle care, and polish.' },
  { name: 'Pedicure',                      category: 'Nail Care',       price: 299,  duration: 30,  image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=500&q=80', description: 'Professional pedicure with soak, scrub, shaping, and polish.' },
  { name: 'Regular Nails (Mani & Pedi)',   category: 'Nail Care',       price: 399,  duration: 60,  image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80', description: 'Combined manicure and pedicure package at a special rate.' },
  { name: 'Manigel',                       category: 'Nail Care',       price: 699,  duration: 60,  image: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&w=500&q=80', description: 'Gel manicure for a long-lasting, chip-free glossy finish.' },
  { name: 'Pedigel',                       category: 'Nail Care',       price: 699,  duration: 60,  image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=500&q=80', description: 'Gel pedicure for extended-wear beautiful feet.' },
  { name: 'Gel Nails (Mani & Pedi)',       category: 'Nail Care',       price: 1199, duration: 90,  image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=500&q=80', description: 'Full gel manicure and pedicure combo package.' },
  { name: 'ManePedi Foot Spa',             category: 'Nail Care',       price: 799,  duration: 60,  image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=500&q=80', description: 'Manicure, pedicure, and relaxing foot spa treatment.' },
  { name: 'Nails Extension',               category: 'Nail Care',       price: 1499, duration: 120, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=500&q=80', description: 'Professional nail extensions for added length and strength.' },
  { name: 'Nails Extension with Design',   category: 'Nail Care',       price: 1699, duration: 150, image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=500&q=80', description: 'Nail extensions with custom nail art designs.' },
  { name: 'Nails Extension Package',       category: 'Nail Care',       price: 1999, duration: 180, image: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&w=500&q=80', description: 'Full nail extension package — extensions, design, and finishing treatment.' },
  // Other Services
  { name: 'Ear Wax Candling',              category: 'Other Services',  price: null, duration: 30,  image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=80', description: 'Ear candling therapy to gently remove excess earwax.' },
  { name: 'Eyebrow Threading',             category: 'Other Services',  price: null, duration: 15,  image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80', description: 'Precise eyebrow shaping using traditional threading technique.' },
  { name: 'Under Arm Waxing',              category: 'Other Services',  price: null, duration: 20,  image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=500&q=80', description: 'Smooth underarm hair removal using professional wax.' },
  { name: 'Foot Spa',                      category: 'Other Services',  price: null, duration: 45,  image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=500&q=80', description: 'Relaxing foot soak, scrub, and moisturizing treatment.' },
  { name: 'Eyelash Extensions',            category: 'Other Services',  price: null, duration: 90,  image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=500&q=80', description: 'Professional lash extension application for fuller, longer lashes.' },
  { name: 'Legs Waxing (Half or Full)',    category: 'Other Services',  price: null, duration: 30,  image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=500&q=80', description: 'Smooth leg hair removal — choose half or full leg.' },
  { name: 'Paraffin Treatment (Hand & Foot)', category: 'Other Services', price: null, duration: 45, image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=500&q=80', description: 'Warm paraffin wax dip for ultra-soft hands and feet.' },
];

const CATEGORIES = ['All', 'Massage Therapy', 'Nail Care', 'Other Services'];

const CATEGORY_STYLES = {
  'Massage Therapy': { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  'Nail Care':       { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500'   },
  'Other Services':  { bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500'    },
};

const ClayCard = ({ children, className = '', style = {} }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: 'var(--panel)',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
      ...style,
    }}
  >
    {children}
  </div>
);

const ClayInput = ({ label, id, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label htmlFor={id} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-400">{label}</label>}
    <input
      id={id}
      className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-900 outline-none border border-slate-200 focus:border-emerald-700 transition dark:text-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:focus:border-emerald-400"
      style={{ background: 'var(--input)' }}
      {...props}
    />
    {error && <p className="text-[11px] text-red-500">{error}</p>}
  </div>
);

const ClaySelect = ({ label, id, children, ...props }) => (
  <div className="space-y-1.5">
    {label && <label htmlFor={id} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-400">{label}</label>}
    <div className="relative">
      <select
        id={id}
        className="w-full appearance-none px-4 py-2.5 rounded-xl text-sm text-slate-900 outline-none cursor-pointer pr-9 border border-slate-200 dark:text-slate-100 dark:bg-slate-900 dark:border-slate-700"
        style={{ background: 'var(--input)' }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const AdminServices = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const EMPTY_FORM = { name: '', category: 'Massage Therapy', price: '', duration: '', image: '', description: '' };
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    API.get('/admin/services')
      .then((r) => {
        const data = r.data?.services ?? r.data ?? [];
        setServices(Array.isArray(data) && data.length > 0 ? data : buildDefaults());
      })
      .catch(() => setServices(buildDefaults()))
      .finally(() => setLoading(false));
  }, []);

  const buildDefaults = () =>
    DEFAULT_SERVICES.map((s, i) => ({ ...s, id: i + 1, status: 'active' }));

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name     = 'Service name is required';
    if (!form.category)          e.category = 'Please select a category';
    if (form.price !== '' && form.price !== null && isNaN(Number(form.price))) e.price = 'Price must be a number';
    if (!form.duration || isNaN(Number(form.duration))) e.duration = 'Duration (minutes) is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      price:    form.price === '' || form.price === null ? null : Number(form.price),
      duration: Number(form.duration),
    };
    try {
      if (editing) {
        try {
          const r = await API.put(`/admin/services/${editing.id}`, payload);
          setServices((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...r.data?.service ?? payload } : s));
        } catch {
          setServices((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...payload } : s));
        }
        showToast('Service updated successfully');
      } else {
        try {
          const r = await API.post('/admin/services', payload);
          setServices((prev) => [...prev, r.data?.service ?? { ...payload, id: Date.now(), status: 'active' }]);
        } catch {
          setServices((prev) => [...prev, { ...payload, id: Date.now(), status: 'active' }]);
        }
        showToast('Service added successfully');
      }
      closeForm();
    } catch {
      showToast('Something went wrong.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await API.delete(`/admin/services/${id}`); } catch {}
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
    showToast('Service removed');
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (svc) => {
    setEditing(svc);
    setForm({
      name:        svc.name,
      category:    svc.category,
      price:       svc.price !== null ? String(svc.price) : '',
      duration:    String(svc.duration),
      image:       svc.image || '',
      description: svc.description || '',
    });
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const f = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setErrors((p) => ({ ...p, [k]: undefined })); };

  const filtered = services.filter((s) => {
    const matchCat  = catFilter === 'All' || s.category === catFilter;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.category || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const statsByCategory = CATEGORIES.slice(1).map((cat) => ({
    cat,
    count: services.filter((s) => s.category === cat).length,
    min:   Math.min(...services.filter((s) => s.category === cat && s.price).map((s) => s.price)),
    max:   Math.max(...services.filter((s) => s.category === cat && s.price).map((s) => s.price)),
  }));

  const getPageTitle = () => {
    switch (activeTab) {
      case 'categories': return 'Categories';
      case 'all':
      default: return 'All Services';
    }
  };

  return (
    <AdminLayout title="Services & Offers" subtitle={getPageTitle()}>
      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-bold text-white shadow-2xl transition-all"
          style={{
            background: toast.type === 'success' ? 'linear-gradient(135deg,#062c22,#0a3d30)' : '#991b1b',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertCircle className="w-4 h-4 text-red-300" />}
          {toast.msg}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4">
          <ClayCard className="p-8 max-w-sm w-full text-center space-y-5">
            <div className="w-14 h-14 bg-red-100 rounded-3xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Remove Service?</h3>
              <p className="text-xs text-slate-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-xs font-bold text-slate-600 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 text-white hover:bg-red-750 rounded-xl text-xs font-bold transition">Delete</button>
            </div>
          </ClayCard>
        </div>
      )}

      {/* ── Side Form Drawer ── */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={closeForm} />
          <div
            className="w-full max-w-sm flex flex-col h-full overflow-y-auto"
            style={{
              background: theme === 'dark' ? '#0f1720' : '#faf8f5',
              boxShadow: theme === 'dark' ? '-20px 0 60px rgba(0,0,0,0.35)' : '-20px 0 60px rgba(0,0,0,0.12)',
              borderLeft: theme === 'dark' ? '1px solid rgba(148,163,184,0.14)' : '1px solid rgba(255,255,255,0.6)',
            }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: theme === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(0,0,0,0.06)' }}>
              <div>
                <h2 className={`text-base font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{editing ? 'Edit Service' : 'Add New Service'}</h2>
                <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>{editing ? editing.name : 'Fill in the service details below'}</p>
              </div>
              <button onClick={closeForm} className={`w-9 h-9 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'text-slate-300 hover:text-white border border-slate-700 bg-slate-900/90' : 'text-slate-400 hover:text-slate-700 border border-slate-200 bg-[#faf9f6]' } transition`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-5">
              <ClayInput label="Service Name *" id="svc-name" placeholder="e.g. Swedish Massage" value={form.name} onChange={f('name')} error={errors.name} />
              <ClaySelect label="Category *" id="svc-cat" value={form.category} onChange={f('category')}>
                <option value="Massage Therapy">Massage Therapy</option>
                <option value="Nail Care">Nail Care</option>
                <option value="Other Services">Other Services</option>
              </ClaySelect>

              <div className="grid grid-cols-2 gap-4">
                <ClayInput label="Price (₱)" id="svc-price" type="number" placeholder="e.g. 749" value={form.price} onChange={f('price')} error={errors.price} min="0" />
                <ClayInput label="Duration (min) *" id="svc-dur" type="number" placeholder="e.g. 60" value={form.duration} onChange={f('duration')} error={errors.duration} min="1" />
              </div>

              <ClayInput label="Service Image URL" id="svc-image" placeholder="e.g. https://images.unsplash.com/..." value={form.image} onChange={f('image')} />

              <div className="space-y-1.5">
                <label htmlFor="svc-desc" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea id="svc-desc" rows={4} placeholder="Short description of this service..." value={form.description} onChange={f('description')} className="w-full px-4 py-2.5 text-xs text-slate-700 rounded-xl outline-none resize-none transition border border-slate-200" style={{ background: '#faf9f6' }} />
              </div>
            </div>

            <div className="px-6 py-5 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white transition-all bg-emerald-950 hover:bg-emerald-900"
              >
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Service')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">

          {/* ── Tab Content: All Services ── */}
          {activeTab === 'all' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {statsByCategory.map(({ cat, count, min, max }) => {
                  const cs = CATEGORY_STYLES[cat] ?? {};
                  return (
                    <ClayCard key={cat} className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cs.bg} ${cs.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                          {cat}
                        </span>
                        <span className="text-xl font-black text-slate-800">{count}</span>
                      </div>
                      {min !== Infinity && <p className="text-xs text-slate-400">₱{min.toLocaleString()} – ₱{max.toLocaleString()}</p>}
                      {min === Infinity && <p className="text-xs text-slate-400 italic">Call for pricing</p>}
                    </ClayCard>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl flex-1 max-w-sm border border-slate-200 bg-white shadow-sm">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services…" className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none w-full" />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCatFilter(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        catFilter === cat ? 'bg-emerald-950 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                
                <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition">
                  <Plus className="w-3.5 h-3.5" /> Add Service
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map(svc => (
                  <ClayCard key={svc.id} className="overflow-hidden flex flex-col h-full bg-white hover:shadow-md transition">
                    <div className="h-40 w-full overflow-hidden relative bg-slate-100">
                      {svc.image ? (
                        <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag className="w-12 h-12" /></div>
                      )}
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        svc.category === 'Massage Therapy' ? 'bg-emerald-950 text-white' : svc.category === 'Nail Care' ? 'bg-amber-500 text-emerald-950' : 'bg-blue-900 text-white'
                      }`}>{svc.category}</span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{svc.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{svc.description || 'No description available.'}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 flex-shrink-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-800">{svc.price ? `₱${svc.price}` : 'Call'}</span>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5"><Clock className="w-3.5 h-3.5" /> {svc.duration}m</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(svc)} className="p-1.5 bg-slate-50 border rounded-lg text-slate-500 hover:text-emerald-800 transition"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteId(svc.id)} className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-500 hover:text-red-700 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </ClayCard>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab Content: Categories & Durations ── */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 text-sm">Configure Time Slots &amp; Room Allocations</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Durations */}
                <ClayCard className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Service Durations</h4>
                    <Hourglass className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { mins: '30 Minutes', count: '4 services' },
                      { mins: '60 Minutes', count: '18 services' },
                      { mins: '90 Minutes', count: '3 services' },
                      { mins: '120 Minutes', count: '2 services' }
                    ].map(dur => (
                      <div key={dur.mins} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-700">{dur.mins}</span>
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded-full font-semibold text-slate-400">{dur.count}</span>
                      </div>
                    ))}
                  </div>
                </ClayCard>

                {/* Rooms allocation summary */}
                <ClayCard className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Default Room Allocations</h4>
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { room: 'Massage Room A (Couples)', alloc: 'Swedish Massage, combination' },
                      { room: 'Massage Room B (Single)', alloc: 'Deep Tissue, Hilot' },
                      { room: 'Nail Lounge Station', alloc: 'Manicure, Pedicure, gel nails' }
                    ].map(r => (
                      <div key={r.room} className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <p className="text-xs font-bold text-slate-700">{r.room}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">Assigned Services: {r.alloc}</p>
                      </div>
                    ))}
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

export default AdminServices;
