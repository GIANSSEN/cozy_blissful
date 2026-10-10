import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import {
  Sliders, Bell, Save, CheckCircle2, AlertCircle,
  CalendarClock, Wallet, Database,
  RotateCcw, Lock, Info,
} from 'lucide-react';

/* =============================================================
   Cozy Blissful · System Settings
   4 tabs: Business | Booking Rules | Notifications | Payments & Security
   ============================================================= */

const SETTINGS_KEY = 'cozyblissful.settings.v2';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ── defaults ─────────────────────────────────── */
const BIZ_DEF = {
  name: 'Cozy Blissful Spa Salon',
  phone: '+63 999 543 5913',
  openTime: '09:00',
  closeTime: '21:00',
  address: 'Metropolitan Manila, Philippines',
  cancellationWindowHrs: '2',
};
const BOOK_DEF = {
  operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  slotIntervalMin: '30',
  bufferMin: '10',
  minLeadTimeHrs: '2',
  maxAdvanceDays: '30',
  autoCancelNoShowMin: '15',
  maxPerTherapistPerDay: '8',
  allowWalkIns: true,
  allowConcurrentOverlap: true,
  requireDownpayment: false,
};
const NOTIF_DEF = {
  smsBookingCreated: true,
  smsBookingApproved: true,
  emailBookingCreated: true,
  therapistDispatchAlert: true,
  emailPromoUpdates: false,
  reminderLeadTimeHrs: '24',
  quietStart: '21:00',
  quietEnd: '07:00',
};
const SYS_DEF = {
  vatPercent: '12',
  serviceChargePercent: '5',
  downpaymentPercent: '20',
  payCash: true,
  payGcash: true,
  payMaya: false,
  payCard: false,
  gcashNumber: '+63 999 543 5913',
  refundPolicy: 'Downpayments are refundable up to 24 hours before the session. No-shows forfeit the reservation fee.',
  maintenanceMode: false,
  sessionTimeoutMin: '30',
  maxLoginAttempts: '5',
  requireStrongPassword: true,
};

/* ── helpers ──────────────────────────────────── */
function loadJSON(key, fallback) {
  try {
    const r = window.localStorage.getItem(key);
    return r ? { ...fallback, ...JSON.parse(r) } : fallback;
  } catch { return fallback; }
}

function to12h(hhmm) {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return hhmm || '';
  const [h, m] = hhmm.split(':').map(Number);
  const s = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${s}`;
}

function digitsOnly(v) { return String(v ?? '').replace(/[\s-]/g, ''); }

const PH_RE = /^(09|\+639)\d{9}$/;

/* ── validators ───────────────────────────────── */
function validateBiz(d) {
  const e = {};
  if (!d.name.trim()) e.name = 'Brand name is required.';
  else if (d.name.trim().length < 3) e.name = 'At least 3 characters.';
  if (!d.phone.trim()) e.phone = 'Hotline number is required.';
  else if (!PH_RE.test(digitsOnly(d.phone))) e.phone = 'Enter a valid PH mobile.';
  if (!d.openTime) e.openTime = 'Opening time is required.';
  if (!d.closeTime) e.closeTime = 'Closing time is required.';
  if (d.openTime && d.closeTime && d.openTime === d.closeTime) e.closeTime = 'Must differ from opening time.';
  if (!d.address.trim()) e.address = 'Coverage area is required.';
  const cw = Number(d.cancellationWindowHrs);
  if (d.cancellationWindowHrs === '' || isNaN(cw)) e.cancellationWindowHrs = 'Enter window in hours.';
  else if (cw < 0.5 || cw > 72) e.cancellationWindowHrs = '0.5–72 hrs.';
  return e;
}

function validateBook(d) {
  const e = {};
  if (!d.operatingDays.length) e.operatingDays = 'Select at least one operating day.';
  [
    ['slotIntervalMin', 5, 120, 'Slot interval'],
    ['bufferMin', 0, 60, 'Buffer'],
    ['minLeadTimeHrs', 0.5, 72, 'Min lead time'],
    ['maxAdvanceDays', 1, 180, 'Advance limit'],
    ['autoCancelNoShowMin', 5, 180, 'Auto-cancel'],
    ['maxPerTherapistPerDay', 1, 30, 'Daily cap'],
  ].forEach(([k, min, max, label]) => {
    const n = Number(d[k]);
    if (d[k] === '' || isNaN(n)) e[k] = `${label} is required.`;
    else if (n < min || n > max) e[k] = `${label} must be ${min}–${max}.`;
  });
  if (!['15', '20', '30', '45', '60'].includes(String(d.slotIntervalMin))) {
    e.slotIntervalMin = 'Use 15, 20, 30, 45 or 60 min.';
  }
  return e;
}

function validateNotif(d) {
  const e = {};
  if (!d.smsBookingCreated && !d.smsBookingApproved && !d.emailBookingCreated && !d.therapistDispatchAlert) {
    e._form = 'Keep at least one transactional notification enabled.';
  }
  if (!d.quietStart) e.quietStart = 'Required.';
  if (!d.quietEnd) e.quietEnd = 'Required.';
  return e;
}

function validateSys(d) {
  const e = {};
  const pct = (v, max, l) => {
    if (v === '' || isNaN(Number(v))) return `${l} is required.`;
    const n = Number(v);
    if (n < 0 || n > max) return `${l}: 0–${max}%.`;
    return '';
  };
  const v1 = pct(d.vatPercent, 28, 'VAT');                      if (v1) e.vatPercent = v1;
  const v2 = pct(d.serviceChargePercent, 20, 'Service charge'); if (v2) e.serviceChargePercent = v2;
  const v3 = pct(d.downpaymentPercent, 100, 'Downpayment');     if (v3) e.downpaymentPercent = v3;
  if (!d.payCash && !d.payGcash && !d.payMaya && !d.payCard) e._form = 'Enable at least one payment method.';
  if (d.payGcash) {
    if (!d.gcashNumber.trim()) e.gcashNumber = 'GCash number is required.';
    else if (!PH_RE.test(digitsOnly(d.gcashNumber))) e.gcashNumber = 'Enter a valid PH mobile.';
  }
  if (d.refundPolicy.trim() && d.refundPolicy.trim().length < 10) e.refundPolicy = 'At least 10 characters (or leave blank).';
  const st = Number(d.sessionTimeoutMin);
  if (d.sessionTimeoutMin === '' || isNaN(st)) e.sessionTimeoutMin = 'Required.';
  else if (st < 5 || st > 180) e.sessionTimeoutMin = '5–180 min.';
  const at = Number(d.maxLoginAttempts);
  if (d.maxLoginAttempts === '' || isNaN(at)) e.maxLoginAttempts = 'Required.';
  else if (at < 3 || at > 10) e.maxLoginAttempts = '3–10.';
  return e;
}

/* ── UI primitives ────────────────────────────── */
function Field({ id, label, hint, error, required, children, counter }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}{required && <span aria-hidden className="text-emerald-500 ml-1">*</span>}
        </label>
        {counter && <span className="text-[10px] tabular-nums text-slate-500">{counter}</span>}
      </div>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-[11px] leading-relaxed text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1 text-[11px] font-medium text-red-500">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

function inputCls(isDark, err) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-500 focus-visible:ring-2 ${
    err
      ? 'border-red-500/70 bg-red-500/[0.06] focus:border-red-500 focus-visible:ring-red-500/30'
      : isDark
        ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus-visible:ring-emerald-500/25'
        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600 focus-visible:ring-emerald-500/25'
  }`;
}

function Toggle({ checked, onChange, label, desc, id }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div className="min-w-0">
        <p id={`${id}-lbl`} className="text-xs font-semibold">{label}</p>
        {desc && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{desc}</p>}
      </div>
      <button
        id={id} type="button" role="switch"
        aria-checked={checked} aria-labelledby={`${id}-lbl`}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${checked ? 'bg-emerald-500' : 'bg-slate-600'}`}
      >
        <motion.span
          className="block h-5 w-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        />
      </button>
    </div>
  );
}

function InlineCard({ isDark, children, className = '' }) {
  return (
    <div className={`rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} ${className}`}>
      {children}
    </div>
  );
}

function SectionCard({ isDark, eyebrow, title, desc, dirty, onSave, onReset, saving, children, saveLabel = 'Save changes' }) {
  return (
    <section aria-label={title} className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'}`}>
      <div className={`flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            {eyebrow}
            {dirty && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden /> Unsaved
              </span>
            )}
          </p>
          <h2 className="mt-1 text-base font-bold tracking-tight">{title}</h2>
          {desc && <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-slate-400">{desc}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button" onClick={onReset} disabled={!dirty || saving}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold text-slate-500 transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
          </button>
          <button
            type="button" onClick={onSave} disabled={saving}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow shadow-emerald-600/25 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-70 disabled:cursor-wait"
          >
            {saving
              ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
              : <Save className="h-3.5 w-3.5" aria-hidden />}
            {saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
      <div className="space-y-5 pt-5">{children}</div>
    </section>
  );
}

function FormError({ errors }) {
  const keys = Object.keys(errors).filter(k => k !== '_form');
  if (!errors._form && !keys.length) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.07] p-4 text-xs">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
      <div>
        <p className="font-bold text-red-500">Please fix the following:</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-red-400">
          {errors._form && <li>{errors._form}</li>}
          {keys.slice(0, 4).map(k => <li key={k}>{errors[k]}</li>)}
          {keys.length > 4 && <li>…and {keys.length - 4} more.</li>}
        </ul>
      </div>
    </div>
  );
}

function Toasts({ toasts }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-stretch gap-2 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} layout
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur ${
              t.type === 'error' ? 'border-red-500/30 bg-[#1c0f14]/95 text-red-200'
              : t.type === 'info' ? 'border-sky-500/30 bg-[#0b1620]/95 text-sky-100'
              : 'border-emerald-500/30 bg-[#06231b]/95 text-emerald-100'
            }`}
          >
            {t.type === 'error'
              ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden />
              : t.type === 'info'
                ? <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden />
                : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />}
            <span className="leading-relaxed">{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Tab list ─────────────────────────────────── */
const TABS = [
  { id: 'business',      label: 'Business',      icon: Sliders },
  { id: 'booking',       label: 'Booking Rules',  icon: CalendarClock },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'payments',      label: 'Payments',       icon: Wallet },
];

/* ── Main Page ────────────────────────────────── */
export default function AdminSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(TABS.some(t => t.id === tabFromUrl) ? tabFromUrl : 'business');
  const [toasts, setToasts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(() => window.localStorage.getItem('cozyblissful.settings.savedAt') || '');
  const tabRefs = useRef({});

  /* settings state */
  const [saved, setSaved] = useState(() => loadJSON(SETTINGS_KEY, {
    business: BIZ_DEF, booking: BOOK_DEF, notifs: NOTIF_DEF, system: SYS_DEF,
  }));
  const [business, setBusiness] = useState(saved.business);
  const [booking,  setBooking]  = useState(saved.booking);
  const [notifs,   setNotifs]   = useState(saved.notifs);
  const [system,   setSystem]   = useState(saved.system);
  const [bizErr,   setBizErr]   = useState({});
  const [bookErr,  setBookErr]  = useState({});
  const [notErr,   setNotErr]   = useState({});
  const [sysErr,   setSysErr]   = useState({});

  /* sync tab from URL */
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab && TABS.some(t => t.id === tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]); // eslint-disable-line

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p.slice(-2), { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  const handleTabChange = (id) => { setActiveTab(id); setSearchParams({ tab: id }, { replace: true }); };

  const onTabKey = (e) => {
    const idx = TABS.findIndex(t => t.id === activeTab);
    let next = null;
    if (e.key === 'ArrowRight') next = TABS[(idx + 1) % TABS.length].id;
    else if (e.key === 'ArrowLeft') next = TABS[(idx - 1 + TABS.length) % TABS.length].id;
    else if (e.key === 'Home') next = TABS[0].id;
    else if (e.key === 'End') next = TABS[TABS.length - 1].id;
    if (next) { e.preventDefault(); handleTabChange(next); requestAnimationFrame(() => tabRefs.current[next]?.focus()); }
  };

  const persist = (next) => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      const stamp = new Date().toISOString();
      window.localStorage.setItem('cozyblissful.settings.savedAt', stamp);
      setLastSavedAt(stamp);
    } catch { toast('Storage full — saved for this session only.', 'error'); }
  };

  const saveSection = async (section) => {
    const map = {
      business: [business, validateBiz,   setBizErr],
      booking:  [booking,  validateBook,  setBookErr],
      notifs:   [notifs,   validateNotif, setNotErr],
      system:   [system,   validateSys,   setSysErr],
    };
    const [draft, validator, setErr] = map[section];
    const errs = validator(draft);
    setErr(errs);
    if (Object.keys(errs).length) { toast('Fix the highlighted fields before saving.', 'error'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    const next = { ...saved, [section]: draft };
    setSaved(next);
    persist(next);
    toast('Settings saved.');
  };

  const resetSection = (section) => {
    ({ business: setBusiness, booking: setBooking, notifs: setNotifs, system: setSystem })[section](saved[section]);
    ({ business: setBizErr, booking: setBookErr, notifs: setNotErr, system: setSysErr })[section]({});
  };

  const isDirty = (section, draft) => JSON.stringify(draft) !== JSON.stringify(saved[section]);

  const factoryReset = () => {
    const fresh = { business: BIZ_DEF, booking: BOOK_DEF, notifs: NOTIF_DEF, system: SYS_DEF };
    setSaved(fresh);
    setBusiness(fresh.business); setBooking(fresh.booking);
    setNotifs(fresh.notifs);     setSystem(fresh.system);
    setBizErr({}); setBookErr({}); setNotErr({}); setSysErr({});
    persist(fresh);
    toast('Settings restored to defaults.', 'info');
  };

  const F = (err) => inputCls(isDark, err);

  return (
    <AdminLayout title="System Settings" subtitle="Business profile, booking rules, notifications, payments & security" icon={Sliders}>
      <MotionConfig reducedMotion="user">
        <div className="space-y-5 pb-10">
          <Toasts toasts={toasts} />

          {lastSavedAt && (
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500" role="status">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden />
              Last saved {new Date(lastSavedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              <span aria-hidden>·</span> stored locally
            </p>
          )}

          {/* ── Tab bar ── */}
          <div className={`rounded-2xl border p-1.5 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50/90'}`}>
            <div
              role="tablist" aria-label="Settings sections" onKeyDown={onTabKey}
              className="grid grid-cols-4 gap-1.5"
            >
              {TABS.map(tab => {
                const Icon = tab.icon;
                const sel  = activeTab === tab.id;
                const dot  = (tab.id === 'business'      && isDirty('business', business))
                          || (tab.id === 'booking'        && isDirty('booking',  booking))
                          || (tab.id === 'notifications'  && isDirty('notifs',   notifs))
                          || (tab.id === 'payments'       && isDirty('system',   system));
                return (
                  <button
                    key={tab.id}
                    ref={el => { tabRefs.current[tab.id] = el; }}
                    type="button" role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={sel}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={sel ? 0 : -1}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      sel
                        ? isDark ? 'border border-emerald-500/40 bg-slate-900 text-emerald-400 shadow' : 'border border-emerald-500/30 bg-white text-emerald-700 shadow-sm'
                        : isDark ? 'border border-transparent text-slate-400' : 'border border-transparent text-slate-600'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="hidden sm:inline truncate">{tab.label}</span>
                    {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" title="Unsaved changes" aria-label="Unsaved changes" />}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >

              {/* ═══ BUSINESS ═══ */}
              {activeTab === 'business' && (
                <SectionCard
                  isDark={isDark} eyebrow="Business profile" title="Spa details & operational hours"
                  desc="Drives booking availability, receipts, and client-facing information."
                  dirty={isDirty('business', business)} saving={saving}
                  onSave={() => saveSection('business')} onReset={() => resetSection('business')}
                >
                  <FormError errors={bizErr} />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field id="biz-name" label="Brand name" required error={bizErr.name} counter={`${business.name.length}/80`}>
                      <input id="biz-name" type="text" maxLength={80} value={business.name} onChange={e => setBusiness({ ...business, name: e.target.value })} className={F(bizErr.name)} autoComplete="organization" />
                    </Field>
                    <Field id="biz-phone" label="Hotline number" required error={bizErr.phone} hint="PH mobile — used for SMS sender display.">
                      <input id="biz-phone" type="tel" value={business.phone} onChange={e => setBusiness({ ...business, phone: e.target.value })} className={F(bizErr.phone)} />
                    </Field>
                    <Field id="biz-open" label="Daily opening time" required error={bizErr.openTime} hint={business.openTime ? `Opens ${to12h(business.openTime)}` : ''}>
                      <input id="biz-open" type="time" value={business.openTime} onChange={e => setBusiness({ ...business, openTime: e.target.value })} className={F(bizErr.openTime)} />
                    </Field>
                    <Field id="biz-close" label="Daily closing time" required error={bizErr.closeTime} hint={business.closeTime ? `Last session by ${to12h(business.closeTime)}` : ''}>
                      <input id="biz-close" type="time" value={business.closeTime} onChange={e => setBusiness({ ...business, closeTime: e.target.value })} className={F(bizErr.closeTime)} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field id="biz-addr" label="Primary service coverage area" required error={bizErr.address}>
                        <input id="biz-addr" type="text" value={business.address} onChange={e => setBusiness({ ...business, address: e.target.value })} className={F(bizErr.address)} autoComplete="address-level2" />
                      </Field>
                    </div>
                    <Field id="biz-cancel" label="Free cancellation window (hrs)" required error={bizErr.cancellationWindowHrs} hint="Clients can cancel without penalty before this cutoff.">
                      <input id="biz-cancel" type="number" min="0.5" max="72" step="0.5" value={business.cancellationWindowHrs} onChange={e => setBusiness({ ...business, cancellationWindowHrs: e.target.value })} className={F(bizErr.cancellationWindowHrs)} />
                    </Field>
                  </div>
                </SectionCard>
              )}

              {/* ═══ BOOKING RULES ═══ */}
              {activeTab === 'booking' && (
                <SectionCard
                  isDark={isDark} eyebrow="Operations" title="Booking rules & capacity"
                  desc="Slot math, lead times, and concurrency. Guards the client slot picker against overbooking."
                  dirty={isDirty('booking', booking)} saving={saving}
                  onSave={() => saveSection('booking')} onReset={() => resetSection('booking')}
                >
                  <FormError errors={bookErr} />

                  <fieldset>
                    <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Operating days *</legend>
                    <div className="flex flex-wrap gap-2" role="group">
                      {WEEKDAYS.map(d => {
                        const on = booking.operatingDays.includes(d);
                        return (
                          <button key={d} type="button" aria-pressed={on}
                            onClick={() => setBooking({ ...booking, operatingDays: on ? booking.operatingDays.filter(x => x !== d) : [...booking.operatingDays, d] })}
                            className={`min-h-[40px] min-w-[52px] rounded-xl border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                              on ? 'border-emerald-500 bg-emerald-600 text-white shadow'
                                 : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >{d}</button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {booking.operatingDays.length} day(s) open{business.openTime && business.closeTime ? ` · ${to12h(business.openTime)} – ${to12h(business.closeTime)}` : ''}.
                    </p>
                    {bookErr.operatingDays && <p role="alert" className="mt-1 text-[11px] font-medium text-red-500">{bookErr.operatingDays}</p>}
                  </fieldset>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field id="bk-slot" label="Slot interval" required error={bookErr.slotIntervalMin}>
                      <select id="bk-slot" value={booking.slotIntervalMin} onChange={e => setBooking({ ...booking, slotIntervalMin: e.target.value })} className={F(bookErr.slotIntervalMin)}>
                        {['15', '20', '30', '45', '60'].map(v => <option key={v} value={v}>Every {v} min</option>)}
                      </select>
                    </Field>
                    <Field id="bk-buf" label="Buffer between sessions (min)" required error={bookErr.bufferMin} hint="Room reset + travel time.">
                      <input id="bk-buf" type="number" min="0" max="60" value={booking.bufferMin} onChange={e => setBooking({ ...booking, bufferMin: e.target.value })} className={F(bookErr.bufferMin)} />
                    </Field>
                    <Field id="bk-lead" label="Min lead time (hrs)" required error={bookErr.minLeadTimeHrs} hint="Blocks last-minute bookings.">
                      <input id="bk-lead" type="number" min="0.5" max="72" step="0.5" value={booking.minLeadTimeHrs} onChange={e => setBooking({ ...booking, minLeadTimeHrs: e.target.value })} className={F(bookErr.minLeadTimeHrs)} />
                    </Field>
                    <Field id="bk-adv" label="Max advance booking (days)" required error={bookErr.maxAdvanceDays}>
                      <input id="bk-adv" type="number" min="1" max="180" value={booking.maxAdvanceDays} onChange={e => setBooking({ ...booking, maxAdvanceDays: e.target.value })} className={F(bookErr.maxAdvanceDays)} />
                    </Field>
                    <Field id="bk-noshow" label="No-show auto-cancel (min)" required error={bookErr.autoCancelNoShowMin} hint="Frees the therapist slot.">
                      <input id="bk-noshow" type="number" min="5" max="180" value={booking.autoCancelNoShowMin} onChange={e => setBooking({ ...booking, autoCancelNoShowMin: e.target.value })} className={F(bookErr.autoCancelNoShowMin)} />
                    </Field>
                    <Field id="bk-cap" label="Max bookings / therapist / day" required error={bookErr.maxPerTherapistPerDay}>
                      <input id="bk-cap" type="number" min="1" max="30" value={booking.maxPerTherapistPerDay} onChange={e => setBooking({ ...booking, maxPerTherapistPerDay: e.target.value })} className={F(bookErr.maxPerTherapistPerDay)} />
                    </Field>
                  </div>

                  <InlineCard isDark={isDark} className="overflow-hidden">
                    {[
                      { id: 'bk-walk', key: 'allowWalkIns',           label: 'Allow walk-ins',              desc: 'Front desk can create same-day sessions.' },
                      { id: 'bk-conc', key: 'allowConcurrentOverlap', label: 'Multi-therapist concurrency', desc: 'Overlapping slots allowed across therapists.' },
                      { id: 'bk-dep',  key: 'requireDownpayment',     label: 'Require downpayment',         desc: 'Uses the % configured in the Payments tab.' },
                    ].map((t, i, arr) => (
                      <div key={t.id} className={`px-4 py-3.5 ${i < arr.length - 1 ? isDark ? 'border-b border-slate-800' : 'border-b border-slate-200' : ''}`}>
                        <Toggle id={t.id} checked={booking[t.key]} onChange={v => setBooking({ ...booking, [t.key]: v })} label={t.label} desc={t.desc} />
                      </div>
                    ))}
                  </InlineCard>
                </SectionCard>
              )}

              {/* ═══ NOTIFICATIONS ═══ */}
              {activeTab === 'notifications' && (
                <SectionCard
                  isDark={isDark} eyebrow="Automated messaging" title="Notification triggers"
                  desc="Transactional messages always send regardless of quiet hours. Promotional messages respect them."
                  dirty={isDirty('notifs', notifs)} saving={saving}
                  onSave={() => saveSection('notifs')} onReset={() => resetSection('notifs')}
                >
                  <FormError errors={notErr} />

                  <InlineCard isDark={isDark} className="overflow-hidden">
                    {[
                      { key: 'smsBookingCreated',     label: 'SMS on booking created',       desc: 'Alert customer and staff the moment a request lands.' },
                      { key: 'smsBookingApproved',    label: 'SMS on booking confirmed',     desc: 'Notify the customer when their slot is approved.' },
                      { key: 'emailBookingCreated',   label: 'Email receipt on booking',     desc: 'Session confirmation with preparation guide.' },
                      { key: 'therapistDispatchAlert',label: 'Dispatch alert to therapist',  desc: 'Push assignment with client details.' },
                      { key: 'emailPromoUpdates',     label: 'Promotional email campaigns',  desc: 'Marketing only — respects quiet hours.' },
                    ].map((item, i, arr) => (
                      <div key={item.key} className={`px-4 py-3.5 ${i < arr.length - 1 ? isDark ? 'border-b border-slate-800' : 'border-b border-slate-200' : ''}`}>
                        <Toggle id={`ntf-${item.key}`} checked={notifs[item.key]} onChange={v => setNotifs({ ...notifs, [item.key]: v })} label={item.label} desc={item.desc} />
                      </div>
                    ))}
                  </InlineCard>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Field id="ntf-rl" label="Reminder lead time" hint="How early to send the pre-session reminder.">
                      <select id="ntf-rl" value={notifs.reminderLeadTimeHrs} onChange={e => setNotifs({ ...notifs, reminderLeadTimeHrs: e.target.value })} className={F()}>
                        <option value="2">2 hours before</option>
                        <option value="12">12 hours before</option>
                        <option value="24">24 hours before</option>
                        <option value="48">48 hours before</option>
                      </select>
                    </Field>
                    <Field id="ntf-qs" label="Quiet hours start" error={notErr.quietStart} hint="No marketing after this time.">
                      <input id="ntf-qs" type="time" value={notifs.quietStart} onChange={e => setNotifs({ ...notifs, quietStart: e.target.value })} className={F(notErr.quietStart)} />
                    </Field>
                    <Field id="ntf-qe" label="Quiet hours end" error={notErr.quietEnd} hint="Marketing resumes at this time.">
                      <input id="ntf-qe" type="time" value={notifs.quietEnd} onChange={e => setNotifs({ ...notifs, quietEnd: e.target.value })} className={F(notErr.quietEnd)} />
                    </Field>
                  </div>
                </SectionCard>
              )}

              {/* ═══ PAYMENTS & SECURITY ═══ */}
              {activeTab === 'payments' && (
                <div className="space-y-5">
                  <SectionCard
                    isDark={isDark} eyebrow="Money in" title="Payments & pricing"
                    desc="Surcharges, accepted channels, and the GCash merchant number shown at checkout."
                    dirty={isDirty('system', system)} saving={saving}
                    onSave={() => saveSection('system')} onReset={() => resetSection('system')}
                  >
                    <FormError errors={sysErr} />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <Field id="sys-vat" label="VAT (%)" required error={sysErr.vatPercent}>
                        <input id="sys-vat" type="number" min="0" max="28" step="0.5" value={system.vatPercent} onChange={e => setSystem({ ...system, vatPercent: e.target.value })} className={F(sysErr.vatPercent)} />
                      </Field>
                      <Field id="sys-sc" label="Service charge (%)" required error={sysErr.serviceChargePercent}>
                        <input id="sys-sc" type="number" min="0" max="20" step="0.5" value={system.serviceChargePercent} onChange={e => setSystem({ ...system, serviceChargePercent: e.target.value })} className={F(sysErr.serviceChargePercent)} />
                      </Field>
                      <Field id="sys-dp" label="Downpayment (%)" required error={sysErr.downpaymentPercent} hint={booking.requireDownpayment ? 'Enforced at checkout.' : 'Active only if Booking Rules enforce it.'}>
                        <input id="sys-dp" type="number" min="0" max="100" value={system.downpaymentPercent} onChange={e => setSystem({ ...system, downpaymentPercent: e.target.value })} className={F(sysErr.downpaymentPercent)} />
                      </Field>
                    </div>

                    <fieldset>
                      <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Accepted payment methods *</legend>
                      {sysErr._form && <p role="alert" className="mb-2 text-[11px] font-medium text-red-500">{sysErr._form}</p>}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[['payCash', 'Cash'], ['payGcash', 'GCash'], ['payMaya', 'Maya'], ['payCard', 'Card']].map(([k, label]) => {
                          const on = !!system[k];
                          return (
                            <button key={k} type="button" aria-pressed={on} onClick={() => setSystem({ ...system, [k]: !on })}
                              className={`min-h-[44px] rounded-xl border px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                on ? 'border-emerald-500 bg-emerald-600 text-white' : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >{on ? '✓ ' : ''}{label}</button>
                          );
                        })}
                      </div>
                    </fieldset>

                    {system.payGcash && (
                      <div className="max-w-sm">
                        <Field id="sys-gcash" label="GCash merchant number" required error={sysErr.gcashNumber}>
                          <input id="sys-gcash" type="tel" value={system.gcashNumber} onChange={e => setSystem({ ...system, gcashNumber: e.target.value })} className={F(sysErr.gcashNumber)} />
                        </Field>
                      </div>
                    )}

                    <Field id="sys-refund" label="Refund & cancellation policy" error={sysErr.refundPolicy} counter={`${system.refundPolicy.length} chars`} hint="Displayed at checkout and in confirmation emails.">
                      <textarea id="sys-refund" rows={3} value={system.refundPolicy} onChange={e => setSystem({ ...system, refundPolicy: e.target.value })} className={`${F(sysErr.refundPolicy)} resize-y`} />
                    </Field>

                    {/* Checkout calculator */}
                    <InlineCard isDark={isDark} className="p-4">
                      <p className="flex items-center gap-2 text-xs font-bold">
                        <Wallet className="h-4 w-4 text-emerald-500" aria-hidden /> Checkout preview
                      </p>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                        ₱1,000 service → VAT {system.vatPercent || 0}% + charge {system.serviceChargePercent || 0}% ={' '}
                        <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                          ₱{(1000 * (1 + Number(system.vatPercent || 0) / 100 + Number(system.serviceChargePercent || 0) / 100)).toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                        </strong>
                        {booking.requireDownpayment && <>
                          {' · downpayment '}
                          <strong className="text-emerald-500">
                            ₱{(1000 * (1 + Number(system.vatPercent || 0) / 100 + Number(system.serviceChargePercent || 0) / 100) * Number(system.downpaymentPercent || 0) / 100).toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                          </strong>
                          {' due now'}
                        </>}.
                      </p>
                    </InlineCard>
                  </SectionCard>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Security */}
                    <section aria-label="Security" className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'}`}>
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                        <Lock className="h-3.5 w-3.5" aria-hidden /> Access security
                      </p>
                      <h2 className="mt-1 text-sm font-bold">Sessions & login guard</h2>
                      <div className="mt-5 space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field id="sec-to" label="Session timeout (min)" required error={sysErr.sessionTimeoutMin}>
                            <input id="sec-to" type="number" min="5" max="180" value={system.sessionTimeoutMin} onChange={e => setSystem({ ...system, sessionTimeoutMin: e.target.value })} className={F(sysErr.sessionTimeoutMin)} />
                          </Field>
                          <Field id="sec-at" label="Max login attempts" required error={sysErr.maxLoginAttempts}>
                            <input id="sec-at" type="number" min="3" max="10" value={system.maxLoginAttempts} onChange={e => setSystem({ ...system, maxLoginAttempts: e.target.value })} className={F(sysErr.maxLoginAttempts)} />
                          </Field>
                        </div>
                        <InlineCard isDark={isDark} className="overflow-hidden">
                          <div className={`px-4 py-3.5 ${isDark ? 'border-b border-slate-800' : 'border-b border-slate-200'}`}>
                            <Toggle id="sec-strong" checked={system.requireStrongPassword} onChange={v => setSystem({ ...system, requireStrongPassword: v })} label="Enforce strong passwords" desc="8+ chars, uppercase & number for new accounts." />
                          </div>
                          <div className="px-4 py-3.5">
                            <Toggle id="sec-maint" checked={system.maintenanceMode} onChange={v => setSystem({ ...system, maintenanceMode: v })} label="Maintenance mode" desc="Pauses client booking. Staff panel stays online." />
                          </div>
                        </InlineCard>
                        {system.maintenanceMode && (
                          <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] font-semibold text-amber-500">
                            ⚠ Maintenance is ON — clients see a &ldquo;temporarily paused&rdquo; notice. Save to apply.
                          </p>
                        )}
                        <div className="flex justify-end">
                          <button type="button" onClick={() => saveSection('system')} disabled={saving || !isDirty('system', system)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                            {saving ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden /> : <Save className="h-3.5 w-3.5" aria-hidden />}
                            {saving ? 'Saving…' : 'Save security settings'}
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Danger zone */}
                    <section aria-label="Danger zone" className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'}`}>
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                        <Database className="h-3.5 w-3.5" aria-hidden /> Data & reset
                      </p>
                      <h2 className="mt-1 text-sm font-bold">Factory defaults</h2>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Restores all settings to out-of-the-box values.</p>
                      <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/[0.05] p-4">
                        <p className="text-xs font-bold text-red-400">Danger zone</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Business, Booking, Notifications, and Payments settings will revert to defaults.</p>
                        <button type="button" onClick={factoryReset}
                          className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/40 px-4 text-xs font-bold text-red-400 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Restore defaults…
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </MotionConfig>
    </AdminLayout>
  );
}
