import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import {
  Plus, Pencil, Trash2, X, Save, Search,
  Clock, ShoppingBag, AlertCircle, CheckCircle2,
  ChevronDown, Image,
} from 'lucide-react';

// ─── Real Cozy Blissful default services with Image URLs ────────────────────

const DEFAULT_SERVICES = [
  // Massage Therapy
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

// ─── Claymorphism helpers ────────────────────────────────────────────────────

const ClayCard = ({ children, className = '', style = {} }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
      boxShadow: '20px 20px 40px #eae6df, -20px -20px 40px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
      border: '1px solid rgba(255,255,255,0.8)',
      ...style,
    }}
  >
    {children}
  </div>
);

const ClayInput = ({ label, id, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
    <input
      id={id}
      className="w-full px-4 py-3 rounded-2xl text-sm text-slate-700 outline-none transition"
      style={{
        background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)',
        boxShadow: 'inset 4px 4px 8px #e0dbd3, inset -4px -4px 8px #ffffff',
        border: error ? '1.5px solid #fca5a5' : '1.5px solid transparent',
      }}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const ClaySelect = ({ label, id, children, ...props }) => (
  <div className="space-y-1.5">
    {label && <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
    <div className="relative">
      <select
        id={id}
        className="w-full appearance-none px-4 py-3 rounded-2xl text-sm text-slate-700 outline-none cursor-pointer pr-9"
        style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: 'inset 4px 4px 8px #e0dbd3, inset -4px -4px 8px #ffffff', border: '1.5px solid transparent' }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const AdminServices = () => {
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);   // null = adding new
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [errors,    setErrors]    = useState({});
  const [deleteId,  setDeleteId]  = useState(null);

  const EMPTY_FORM = { name: '', category: 'Massage Therapy', price: '', duration: '', image: '', description: '' };
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Load from API, fallback to defaults ────────────────────────────────
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

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name     = 'Service name is required';
    if (!form.category)          e.category = 'Please select a category';
    if (form.price !== '' && form.price !== null && isNaN(Number(form.price))) e.price = 'Price must be a number';
    if (!form.duration || isNaN(Number(form.duration))) e.duration = 'Duration (minutes) is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save (add or edit) ──────────────────────────────────────────────────
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

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try { await API.delete(`/admin/services/${id}`); } catch {}
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
    showToast('Service removed');
  };

  // ── Form helpers ────────────────────────────────────────────────────────
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

  // ── Filtered list ───────────────────────────────────────────────────────
  const filtered = services.filter((s) => {
    const matchCat  = catFilter === 'All' || s.category === catFilter;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.category || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Stats summary ───────────────────────────────────────────────────────
  const statsByCategory = CATEGORIES.slice(1).map((cat) => ({
    cat,
    count: services.filter((s) => s.category === cat).length,
    min:   Math.min(...services.filter((s) => s.category === cat && s.price).map((s) => s.price)),
    max:   Math.max(...services.filter((s) => s.category === cat && s.price).map((s) => s.price)),
  }));

  return (
    <AdminLayout title="Services & Items">
      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl transition-all`}
          style={{
            background: toast.type === 'success' ? 'linear-gradient(135deg,#062c22,#0a3d30)' : '#991b1b',
            color: '#fff',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertCircle className="w-4 h-4 text-red-300" />}
          {toast.msg}
        </div>
      )}

      {/* ── Delete confirm modal ───────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <ClayCard className="p-8 max-w-sm w-full text-center space-y-5">
            <div className="w-14 h-14 bg-red-100 rounded-3xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Remove Service?</h3>
              <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-slate-600" style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: '4px 4px 10px #ddd8cf, -4px -4px 10px #ffffff' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition">Delete</button>
            </div>
          </ClayCard>
        </div>
      )}

      {/* ── Side Form Drawer ───────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={closeForm} />
          <div
            className="w-full max-w-sm flex flex-col h-full overflow-y-auto"
            style={{
              background: '#faf8f5',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.12)',
              borderLeft: '1px solid rgba(255,255,255,0.6)',
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <div>
                <h2 className="text-base font-bold text-slate-800">{editing ? 'Edit Service' : 'Add New Service'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{editing ? editing.name : 'Fill in the service details below'}</p>
              </div>
              <button onClick={closeForm} className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition" style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: '3px 3px 8px #ddd8cf, -3px -3px 8px #ffffff' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 px-6 py-6 space-y-5">
              <ClayInput
                label="Service Name *"
                id="svc-name"
                placeholder="e.g. Swedish Massage"
                value={form.name}
                onChange={f('name')}
                error={errors.name}
              />

              <ClaySelect label="Category *" id="svc-cat" value={form.category} onChange={f('category')}>
                <option value="Massage Therapy">Massage Therapy</option>
                <option value="Nail Care">Nail Care</option>
                <option value="Other Services">Other Services</option>
              </ClaySelect>

              <div className="grid grid-cols-2 gap-4">
                <ClayInput
                  label="Price (₱)"
                  id="svc-price"
                  type="number"
                  placeholder="e.g. 749"
                  value={form.price}
                  onChange={f('price')}
                  error={errors.price}
                  min="0"
                />
                <ClayInput
                  label="Duration (min) *"
                  id="svc-dur"
                  type="number"
                  placeholder="e.g. 60"
                  value={form.duration}
                  onChange={f('duration')}
                  error={errors.duration}
                  min="1"
                />
              </div>

              <ClayInput
                label="Service Image URL"
                id="svc-image"
                placeholder="e.g. https://images.unsplash.com/..."
                value={form.image}
                onChange={f('image')}
              />

              <div className="space-y-1.5">
                <label htmlFor="svc-desc" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  id="svc-desc"
                  rows={4}
                  placeholder="Short description of this service..."
                  value={form.description}
                  onChange={f('description')}
                  className="w-full px-4 py-3 rounded-2xl text-sm text-slate-700 outline-none resize-none transition"
                  style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: 'inset 4px 4px 8px #e0dbd3, inset -4px -4px 8px #ffffff', border: '1.5px solid transparent' }}
                />
              </div>

              {/* Quick-fill from defaults */}
              {!editing && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Fill From Menu</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {DEFAULT_SERVICES.filter((d) => !services.find((s) => s.name === d.name)).map((d) => (
                      <button
                        key={d.name}
                        onClick={() => setForm({ name: d.name, category: d.category, price: d.price !== null ? String(d.price) : '', duration: String(d.duration), image: d.image, description: d.description })}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-emerald-800 transition group"
                        style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.04)' }}
                      >
                        <span>{d.name}</span>
                        <span style={{ color: CATEGORY_STYLES[d.category]?.text.replace('text-', '') ?? '#888' }}>{d.price ? `₱${d.price}` : '—'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="px-6 py-5 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)', boxShadow: '6px 6px 16px rgba(6,44,34,0.3), -3px -3px 8px rgba(255,255,255,0.8)' }}
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Service')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #f0ece4', borderTopColor: '#062c22' }} />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Stats row */}
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
                    <span className="text-2xl font-black text-slate-800">{count}</span>
                  </div>
                  {min !== Infinity && (
                    <p className="text-xs text-slate-400">₱{min.toLocaleString()} – ₱{max.toLocaleString()}</p>
                  )}
                  {min === Infinity && <p className="text-xs text-slate-400 italic">Call for pricing</p>}
                </ClayCard>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* Search */}
            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl flex-1 min-w-48 max-w-sm"
              style={{ background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)', boxShadow: 'inset 4px 4px 8px #e0dbd3, inset -4px -4px 8px #ffffff' }}
            >
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services…"
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200"
                  style={
                    catFilter === cat
                      ? { background: 'linear-gradient(135deg,#062c22,#0a3d30)', color: '#fff', boxShadow: '4px 4px 12px rgba(6,44,34,0.3)' }
                      : { background: 'linear-gradient(145deg,#fdfcfa,#f0ece4)', color: '#64748b', boxShadow: '3px 3px 8px #ddd8cf, -3px -3px 8px #ffffff', border: '1px solid rgba(0,0,0,0.04)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Add button */}
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)', boxShadow: '6px 6px 16px rgba(6,44,34,0.3), -3px -3px 8px rgba(255,255,255,0.8)' }}
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          {/* Services grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-3 text-center py-20 text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No services found</p>
              </div>
            ) : (
              filtered.map((svc) => {
                const cs = CATEGORY_STYLES[svc.category] ?? {};
                return (
                  <div
                    key={svc.id}
                    className="group rounded-[24px] overflow-hidden flex flex-col transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(145deg,#fdfcfa,#f5f0e8)',
                      boxShadow: '12px 12px 28px #eae6df, -12px -12px 28px #ffffff, inset 3px 3px 6px rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.8)'
                    }}
                  >
                    {/* Thumbnail representation */}
                    {svc.image && (
                      <div className="w-full h-36 overflow-hidden relative">
                        <img src={svc.image} alt={svc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Header row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${cs.bg} ${cs.text} flex-shrink-0`}>
                            <span className={`w-1 h-1 rounded-full ${cs.dot}`} />
                            {svc.category}
                          </span>
                          {/* Action buttons */}
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(svc)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-700 transition" style={{ background: 'rgba(255,255,255,0.8)' }}>
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteId(svc.id)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition" style={{ background: 'rgba(255,255,255,0.8)' }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Name */}
                        <h3 className="font-bold text-slate-800 text-sm leading-snug">{svc.name}</h3>

                        {/* Description */}
                        {svc.description && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{svc.description}</p>
                        )}
                      </div>

                      {/* Price + Duration */}
                      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                        <div>
                          {svc.price
                            ? <span className="text-base font-black" style={{ color: '#062c22' }}>₱{Number(svc.price).toLocaleString()}</span>
                            : <span className="text-xs font-semibold text-slate-400 italic">Call for price</span>
                          }
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {svc.duration >= 60
                            ? `${Math.floor(svc.duration / 60)}${svc.duration % 60 > 0 ? `.5` : ''} hr${svc.duration > 60 ? 's' : ''}`
                            : `${svc.duration} min`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Count footer */}
          <p className="text-xs text-slate-400 text-center">
            Showing <strong>{filtered.length}</strong> of <strong>{services.length}</strong> services
          </p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServices;
