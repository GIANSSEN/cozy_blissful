import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import {
  Sliders, Globe, Bell, Save, CheckCircle2, AlertCircle, UserPlus,
  Shield, Search, X, Edit3, Eye, EyeOff, Percent,
  CalendarClock, Wallet, Database, Download, Upload,
  RotateCcw, Trash2, Phone, Lock, Info,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   Cozy Blissful · System Settings (Senior rebuild)
   - Accessible tab system (roving tabindex + arrow-key nav)
   - Per-section validation with inline errors + aria wiring
   - Draft/dirty tracking, localStorage persistence, export/import
   - Fully responsive: scroll-snap tabs, stacking grids, sheet modals
   ═══════════════════════════════════════════════════════════════════ */

/* ── constants & defaults ─────────────────────────────────────────── */

const SETTINGS_KEY = 'cozyblissful.settings.v1';
const STAFF_KEY = 'cozyblissful.staff.v1';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PH_MOBILE_RE = /^(09|\+639)\d{9}$/;
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BUSINESS_DEFAULTS = {
  name: 'Cozy Blissful Spa Salon',
  phone: '+63 999 543 5913',
  openTime: '06:00',
  closeTime: '23:00',
  address: 'Metropolitan Manila, Philippines',
  coverageRadiusKm: '25',
  cancellationWindowHrs: '2',
};

const BOOKING_DEFAULTS = {
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

const CMS_DEFAULTS = {
  heroTitle: 'Spa & Salon Quality at Your Service.',
  heroSubtitle: 'Premium Spa Salon & Wellness',
  heroDescription: 'Professional massage therapy, hair and nail care — delivered to your sanctuary. Available 7 days a week, 6:00 AM – 11:00 PM.',
  facebookUrl: 'https://facebook.com/cozyblissful',
  instagramUrl: 'https://instagram.com/cozyblissful',
  promoEnabled: true,
  promoBannerText: 'Special Offer: Get 15% off on Weekend Combination Massages!',
};

const NOTIF_DEFAULTS = {
  smsBookingCreated: true,
  smsBookingApproved: true,
  emailBookingCreated: true,
  therapistDispatchAlert: true,
  emailPromoUpdates: false,
  reminderLeadTimeHrs: '24',
  quietStart: '21:00',
  quietEnd: '07:00',
};

const SYSTEM_DEFAULTS = {
  currency: 'PHP',
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

const INITIAL_STAFF = [
  { id: 1, name: 'Maria Santos', email: 'maria.santos@cozy.spa', phone: '+63 917 111 2222', role: 'staff', specialty: 'Front Desk & Scheduling', shift: 'Morning', commRate: 0, status: 'active', joined: '2025-01-15', emergency: 'Juan Santos (+63 917 000 1111)' },
  { id: 2, name: 'Anna Reyes', email: 'anna.reyes@cozy.spa', phone: '+63 919 555 6666', role: 'therapist', specialty: 'Swedish & Hot Stone Massage', shift: 'Afternoon', commRate: 35, status: 'active', joined: '2025-02-20', emergency: 'Pedro Reyes (+63 919 000 2222)' },
  { id: 3, name: 'Juan Dela Cruz', email: 'juan.delacruz@cozy.spa', phone: '+63 918 333 4444', role: 'manager', specialty: 'Operations & Inventory Lead', shift: 'Full Day', commRate: 0, status: 'active', joined: '2025-01-05', emergency: 'Elena Dela Cruz (+63 918 000 3333)' },
  { id: 4, name: 'Grace Tan', email: 'grace.tan@cozy.spa', phone: '+63 921 999 0000', role: 'therapist', specialty: 'Hilot & Shiatsu Therapy', shift: 'Evening', commRate: 30, status: 'inactive', joined: '2025-03-01', emergency: 'Kevin Tan (+63 921 000 4444)' },
];

const ROLE_DETAILS = {
  manager: { label: 'Spa Manager', desc: 'Full operational override & financials access', color: '#34d399', bg: 'rgba(52,211,153,0.12)', grad: 'linear-gradient(135deg,#062c22,#0a3d30)' },
  staff: { label: 'Staff Coordinator', desc: 'Appointment booking, customer queue & scheduling', color: '#93a4ff', bg: 'rgba(59,85,230,0.14)', grad: 'linear-gradient(135deg,#1e3a8a,#3b55e6)' },
  therapist: { label: 'Therapist Practitioner', desc: 'Assigned home-service sessions & commission tracking', color: '#fbbf24', bg: 'rgba(180,83,9,0.16)', grad: 'linear-gradient(135deg,#78350f,#b45309)' },
  receptionist: { label: 'Front Desk Reception', desc: 'Inquiries, walk-ins & customer registration', color: '#22d3ee', bg: 'rgba(8,145,178,0.14)', grad: 'linear-gradient(135deg,#164e63,#0891b2)' },
};

const SHIFTS = ['Morning (06:00 AM - 02:00 PM)', 'Afternoon (01:00 PM - 09:00 PM)', 'Evening (03:00 PM - 11:00 PM)', 'Full Day / Flexible'];

/* ── tiny helpers ─────────────────────────────────────────────────── */

function loadJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return { ...fallback, ...parsed };
    return fallback;
  } catch {
    return fallback;
  }
}

function to12h(hhmm) {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return hhmm || '—';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function digitsOnly(v) {
  return String(v ?? '').replace(/[\s-]/g, '');
}

/* ── validators (pure, testable) ──────────────────────────────────── */

function validateBusiness(d) {
  const e = {};
  const name = d.name.trim();
  if (!name) e.name = 'Brand name is required.';
  else if (name.length < 3) e.name = 'Brand name must be at least 3 characters.';
  else if (name.length > 80) e.name = 'Keep the brand name under 80 characters.';

  if (!d.phone.trim()) e.phone = 'Hotline number is required.';
  else if (!PH_MOBILE_RE.test(digitsOnly(d.phone))) e.phone = 'Enter a valid PH mobile (e.g. +63 917 123 4567 or 09171234567).';

  if (!d.openTime) e.openTime = 'Opening time is required.';
  if (!d.closeTime) e.closeTime = 'Closing time is required.';
  if (d.openTime && d.closeTime && d.openTime === d.closeTime) {
    e.closeTime = 'Closing time must differ from opening time (overnight allowed).';
  }

  if (!d.address.trim()) e.address = 'Coverage area is required.';
  else if (d.address.trim().length < 5) e.address = 'Coverage area looks too short.';

  const km = Number(d.coverageRadiusKm);
  if (d.coverageRadiusKm === '' || Number.isNaN(km)) e.coverageRadiusKm = 'Enter the dispatch radius in km.';
  else if (km < 1 || km > 200) e.coverageRadiusKm = 'Radius must be between 1 and 200 km.';

  const cw = Number(d.cancellationWindowHrs);
  if (d.cancellationWindowHrs === '' || Number.isNaN(cw)) e.cancellationWindowHrs = 'Enter the cancellation window in hours.';
  else if (cw < 0.5 || cw > 72) e.cancellationWindowHrs = 'Window must be between 0.5 and 72 hours.';
  return e;
}

function validateBooking(d) {
  const e = {};
  if (!d.operatingDays.length) e.operatingDays = 'Select at least one operating day.';
  const num = (v, min, max, label) => {
    if (v === '' || Number.isNaN(Number(v))) return `${label} is required.`;
    const n = Number(v);
    if (n < min || n > max) return `${label} must be between ${min} and ${max}.`;
    return '';
  };
  const checks = [
    ['slotIntervalMin', 5, 120, 'Slot interval'],
    ['bufferMin', 0, 60, 'Buffer time'],
    ['minLeadTimeHrs', 0.5, 72, 'Minimum lead time'],
    ['maxAdvanceDays', 1, 180, 'Advance booking limit'],
    ['autoCancelNoShowMin', 5, 180, 'Auto-cancel window'],
    ['maxPerTherapistPerDay', 1, 30, 'Daily cap per therapist'],
  ];
  checks.forEach(([k, min, max, label]) => {
    const msg = num(d[k], min, max, label);
    if (msg) e[k] = msg;
  });
  if (!['15', '20', '30', '45', '60'].includes(String(d.slotIntervalMin))) {
    e.slotIntervalMin = 'Use a standard interval (15, 20, 30, 45 or 60 min).';
  }
  return e;
}

function validateCMS(d) {
  const e = {};
  if (d.heroTitle.trim().length < 10) e.heroTitle = 'Headline needs at least 10 characters.';
  else if (d.heroTitle.trim().length > 80) e.heroTitle = 'Headline must be under 80 characters.';
  if (!d.heroSubtitle.trim()) e.heroSubtitle = 'Badge subtitle is required.';
  else if (d.heroSubtitle.length > 60) e.heroSubtitle = 'Subtitle must be under 60 characters.';
  if (d.heroDescription.trim().length < 20) e.heroDescription = 'Description needs at least 20 characters.';
  else if (d.heroDescription.length > 300) e.heroDescription = 'Description must be under 300 characters.';
  if (d.facebookUrl.trim() && !URL_RE.test(d.facebookUrl.trim())) e.facebookUrl = 'Enter a valid URL starting with https://';
  if (d.instagramUrl.trim() && !URL_RE.test(d.instagramUrl.trim())) e.instagramUrl = 'Enter a valid URL starting with https://';
  if (d.promoEnabled) {
    if (!d.promoBannerText.trim()) e.promoBannerText = 'Promo text is required while the banner is enabled.';
    else if (d.promoBannerText.length > 120) e.promoBannerText = 'Promo text must be under 120 characters.';
  }
  return e;
}

function validateAlerts(d) {
  const e = {};
  if (!d.smsBookingCreated && !d.smsBookingApproved && !d.emailBookingCreated && !d.therapistDispatchAlert) {
    e._form = 'Keep at least one transactional notification enabled so bookings never go silent.';
  }
  if (!d.quietStart) e.quietStart = 'Quiet-hours start is required.';
  if (!d.quietEnd) e.quietEnd = 'Quiet-hours end is required.';
  return e;
}

function validateSystem(d) {
  const e = {};
  const pct = (v, max, label) => {
    if (v === '' || Number.isNaN(Number(v))) return `${label} is required.`;
    const n = Number(v);
    if (n < 0 || n > max) return `${label} must be between 0 and ${max}%.`;
    return '';
  };
  const v1 = pct(d.vatPercent, 28, 'VAT');
  if (v1) e.vatPercent = v1;
  const v2 = pct(d.serviceChargePercent, 20, 'Service charge');
  if (v2) e.serviceChargePercent = v2;
  const v3 = pct(d.downpaymentPercent, 100, 'Downpayment');
  if (v3) e.downpaymentPercent = v3;
  if (!d.payCash && !d.payGcash && !d.payMaya && !d.payCard) {
    e._form = 'Enable at least one payment method.';
  }
  if (d.payGcash) {
    if (!d.gcashNumber.trim()) e.gcashNumber = 'GCash number is required when GCash is enabled.';
    else if (!PH_MOBILE_RE.test(digitsOnly(d.gcashNumber))) e.gcashNumber = 'Enter a valid PH mobile number.';
  }
  if (d.refundPolicy.trim() && d.refundPolicy.trim().length < 10) {
    e.refundPolicy = 'Refund policy needs at least 10 characters (or leave it empty).';
  }
  const st = Number(d.sessionTimeoutMin);
  if (d.sessionTimeoutMin === '' || Number.isNaN(st)) e.sessionTimeoutMin = 'Session timeout is required.';
  else if (st < 5 || st > 180) e.sessionTimeoutMin = 'Timeout must be 5–180 minutes.';
  const at = Number(d.maxLoginAttempts);
  if (d.maxLoginAttempts === '' || Number.isNaN(at)) e.maxLoginAttempts = 'Max attempts is required.';
  else if (at < 3 || at > 10) e.maxLoginAttempts = 'Attempts must be 3–10.';
  return e;
}

function validateStaffForm(form, existingStaff = [], isEdit = false, currentId = null) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required.';
  else if (form.name.trim().length < 3) errors.name = 'Name must be at least 3 characters.';

  if (!form.email.trim()) errors.email = 'Work email is required.';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email (e.g. name@cozy.spa).';
  else {
    const dup = existingStaff.find(
      (s) => s.email.toLowerCase() === form.email.trim().toLowerCase() && (!isEdit || s.id !== currentId),
    );
    if (dup) errors.email = 'This email is already assigned to another staff member.';
  }

  if (!form.phone.trim()) errors.phone = 'Mobile number is required.';
  else if (!PH_MOBILE_RE.test(digitsOnly(form.phone))) errors.phone = 'Enter a valid PH mobile (e.g. +63 917 123 4567).';

  if (!form.specialty.trim()) errors.specialty = 'Specialization / position title is required.';

  if (form.role === 'therapist') {
    const comm = Number(form.commRate);
    if (Number.isNaN(comm) || comm < 0 || comm > 100) errors.commRate = 'Commission must be 0–100%.';
  }

  if (!isEdit) {
    if (!form.password) errors.password = 'Initial password is required.';
    else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password)) errors.password = 'Include at least one uppercase letter (A-Z).';
    else if (!/[0-9]/.test(form.password)) errors.password = 'Include at least one number (0-9).';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

/* ── reusable primitives ──────────────────────────────────────────── */

function Field({ id, label, hint, error, required, children, counter }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label} {required && <span aria-hidden="true" className="text-emerald-500">*</span>}
        </label>
        {counter && <span className="text-[10px] tabular-nums text-slate-500">{counter}</span>}
      </div>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-[11px] leading-relaxed text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1 text-[11px] font-medium text-red-500">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

function fieldClasses(isDark, error) {
  return `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-60 ${
    error
      ? 'border-red-500/70 bg-red-500/[0.06] focus:border-red-500 focus-visible:ring-red-500/30'
      : isDark
        ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus-visible:ring-emerald-500/25'
        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600 focus-visible:ring-emerald-500/25'
  }`;
}

function Toggle({ checked, onChange, label, desc, id }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-xs font-bold">{label}</p>
        {desc && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{desc}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
          checked ? 'bg-emerald-500' : 'bg-slate-600 dark:bg-slate-700'
        }`}
      >
        <motion.span
          className="block h-5 w-5 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 550, damping: 32 }}
        />
      </button>
    </div>
  );
}

function SectionCard({ isDark, eyebrow, title, desc, dirty, onSave, onReset, saving, children, saveLabel = 'Save changes' }) {
  return (
    <section
      aria-label={title}
      className={`rounded-3xl border p-5 shadow-sm sm:p-7 ${
        isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">
            {eyebrow}
            {dirty && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" /> Unsaved
              </span>
            )}
          </p>
          <h2 className="mt-1 text-base font-bold tracking-tight sm:text-lg">{title}</h2>
          {desc && <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-slate-400">{desc}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onReset}
            disabled={!dirty || saving}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
      <div className="space-y-5 pt-6">{children}</div>
    </section>
  );
}

function FormErrorSummary({ errors }) {
  const keys = Object.keys(errors).filter((k) => k !== '_form');
  if (!errors._form && keys.length === 0) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-4 text-xs">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
      <div>
        <p className="font-bold text-red-500">Please fix the following:</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-red-400">
          {errors._form && <li>{errors._form}</li>}
          {keys.slice(0, 4).map((k) => <li key={k}>{errors[k]}</li>)}
          {keys.length > 4 && <li>…and {keys.length - 4} more field(s) below.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ── toast stack ──────────────────────────────────────────────────── */

function Toasts({ toasts }) {
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-stretch gap-2 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-xs font-semibold shadow-2xl backdrop-blur ${
              t.type === 'error'
                ? 'border-red-500/30 bg-[#1c0f14]/95 text-red-200'
                : t.type === 'info'
                  ? 'border-sky-500/30 bg-[#0b1620]/95 text-sky-100'
                  : 'border-emerald-500/30 bg-[#06231b]/95 text-emerald-100'
            }`}
          >
            {t.type === 'error'
              ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
              : t.type === 'info'
                ? <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
                : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />}
            <span className="leading-relaxed">{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── staff modals ─────────────────────────────────────────────────── */

function useModalBehavior(isOpen, onClose, initialFocusRef) {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => initialFocusRef.current?.focus(), 60);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [isOpen, onClose, initialFocusRef]);
}

function AddStaffModal({ isOpen, onClose, onAddStaff, existingStaff, isDark }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'therapist', specialty: '',
    shift: SHIFTS[0], commRate: 35, status: 'active', emergency: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const firstFieldRef = useRef(null);
  useModalBehavior(isOpen, onClose, firstFieldRef);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      setShowPassword(false);
      setForm({
        name: '', email: '', phone: '', role: 'therapist', specialty: '',
        shift: SHIFTS[0], commRate: 35, status: 'active', emergency: '',
        password: '', confirmPassword: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const patch = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pwd = 'CB@';
    for (let i = 0; i < 7; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    pwd += Math.floor(Math.random() * 90 + 10);
    patch('password', pwd);
    patch('confirmPassword', pwd);
  };

  const handleNext = () => {
    const s = {};
    if (!form.name.trim()) s.name = 'Full name is required.';
    if (!form.email.trim()) s.email = 'Work email is required.';
    else if (!EMAIL_RE.test(form.email.trim())) s.email = 'Enter a valid email address.';
    else if (existingStaff.some((x) => x.email.toLowerCase() === form.email.trim().toLowerCase())) s.email = 'Email already registered.';
    if (!form.phone.trim()) s.phone = 'Mobile contact is required.';
    else if (!PH_MOBILE_RE.test(digitsOnly(form.phone))) s.phone = 'Enter a valid PH mobile number.';
    if (!form.specialty.trim()) s.specialty = 'Specialization is required.';
    if (Object.keys(s).length) { setErrors(s); return; }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateStaffForm(form, existingStaff, false);
    if (Object.keys(errs).length) {
      setErrors(errs);
      if (errs.name || errs.email || errs.phone || errs.specialty) setStep(1);
      return;
    }
    onAddStaff({
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role,
      specialty: form.specialty.trim(),
      shift: form.shift.split(' ')[0],
      commRate: form.role === 'therapist' ? Number(form.commRate) : 0,
      status: form.status,
      joined: new Date().toISOString().split('T')[0],
      emergency: form.emergency.trim() || 'N/A',
    });
    onClose();
  };

  const selectedRole = ROLE_DETAILS[form.role] || ROLE_DETAILS.therapist;
  const inputCls = (k) => `w-full rounded-2xl border px-3.5 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${
    errors[k] ? 'border-red-500/70' : isDark ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600'
  }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:max-w-2xl sm:rounded-3xl ${
          isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: selectedRole.grad }}>
              <UserPlus className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 id="add-staff-title" className="truncate text-sm font-bold tracking-tight sm:text-base">Onboard new staff member</h3>
              <p className="text-[11px] text-slate-400">Step {step} of 2 — {step === 1 ? 'Personal & professional details' : 'Account access & security'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition hover:bg-slate-500/15">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="h-1.5 w-full bg-slate-500/15" aria-hidden="true">
          <motion.div className="h-full bg-emerald-500" animate={{ width: step === 1 ? '50%' : '100%' }} transition={{ duration: 0.3 }} />
        </div>

        <form onSubmit={handleSubmit} className="max-h-[62dvh] space-y-5 overflow-y-auto p-5 sm:p-6" noValidate>
          {step === 1 ? (
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <fieldset>
                <legend className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">System role *</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Staff system role">
                  {Object.entries(ROLE_DETAILS).map(([rKey, rMeta]) => {
                    const selected = form.role === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => patch('role', rKey)}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          selected
                            ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                            : isDark ? 'border-slate-800 bg-slate-950/40 hover:border-slate-600' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: rMeta.grad }}>
                          <Shield className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-xs font-bold">{rMeta.label}</span>
                          <span className="mt-0.5 line-clamp-2 block text-[10px] text-slate-400">{rMeta.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="ns-name" label="Full name" required error={errors.name}>
                  <input id="ns-name" ref={firstFieldRef} type="text" autoComplete="name" placeholder="e.g. Teresa Mendoza" value={form.name} onChange={(e) => patch('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'ns-name-error' : undefined} className={inputCls('name')} />
                </Field>
                <Field id="ns-email" label="Work email" required error={errors.email}>
                  <input id="ns-email" type="email" autoComplete="email" placeholder="teresa@cozy.spa" value={form.email} onChange={(e) => patch('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'ns-email-error' : undefined} className={inputCls('email')} />
                </Field>
                <Field id="ns-phone" label="Mobile number" required error={errors.phone} hint="PH format: +63 9XX XXX XXXX">
                  <input id="ns-phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+63 917 888 9999" value={form.phone} onChange={(e) => patch('phone', e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'ns-phone-error' : 'ns-phone-hint'} className={inputCls('phone')} />
                </Field>
                <Field id="ns-specialty" label="Specialization / title" required error={errors.specialty}>
                  <input id="ns-specialty" type="text" placeholder="e.g. Deep Tissue & Reflexology" value={form.specialty} onChange={(e) => patch('specialty', e.target.value)} aria-invalid={!!errors.specialty} aria-describedby={errors.specialty ? 'ns-specialty-error' : undefined} className={inputCls('specialty')} />
                </Field>
                <Field id="ns-shift" label="Default shift">
                  <select id="ns-shift" value={form.shift} onChange={(e) => patch('shift', e.target.value)} className={inputCls('')}>
                    {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                {form.role === 'therapist' && (
                  <Field id="ns-comm" label="Commission rate (%)" required error={errors.commRate}>
                    <div className="relative">
                      <input id="ns-comm" type="number" min="0" max="100" value={form.commRate} onChange={(e) => patch('commRate', e.target.value)} aria-invalid={!!errors.commRate} aria-describedby={errors.commRate ? 'ns-comm-error' : undefined} className={`${inputCls('commRate')} pr-9`} />
                      <Percent className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    </div>
                  </Field>
                )}
              </div>

              <Field id="ns-emg" label="Emergency contact (optional)">
                <input id="ns-emg" type="text" placeholder="e.g. Roberto Mendoza (+63 918 777 6666)" value={form.emergency} onChange={(e) => patch('emergency', e.target.value)} className={inputCls('')} />
              </Field>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold text-white" style={{ background: selectedRole.grad }} aria-hidden="true">
                    {form.name ? form.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold">{form.name || 'Unnamed staff member'}</h4>
                    <p className="truncate text-[11px] text-slate-400">{form.email || 'no email'} • {form.specialty || selectedRole.label}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: selectedRole.bg, color: selectedRole.color }}>
                  {selectedRole.label}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="ns-pass" className="block text-xs font-semibold text-slate-400">Login initial password *</label>
                  <button type="button" onClick={generateStrongPassword} className="min-h-[36px] rounded-lg px-2 text-[11px] font-bold text-emerald-500 transition hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                    Auto-generate secure password
                  </button>
                </div>
                <div>
                  <div className="relative">
                    <input id="ns-pass" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 chars, uppercase & number" value={form.password} onChange={(e) => patch('password', e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'ns-pass-error' : undefined} className={`${inputCls('password')} pr-11`} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-200">
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {errors.password && <p id="ns-pass-error" role="alert" className="mt-1 text-[11px] font-medium text-red-500">{errors.password}</p>}
                </div>
                <Field id="ns-pass2" label="Confirm password" required error={errors.confirmPassword}>
                  <input id="ns-pass2" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter initial password" value={form.confirmPassword} onChange={(e) => patch('confirmPassword', e.target.value)} aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'ns-pass2-error' : undefined} className={inputCls('confirmPassword')} />
                </Field>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <p className="text-xs font-semibold">Immediate activation</p>
                    <p className="text-[11px] text-slate-400">Active accounts can log in right away.</p>
                  </div>
                  <button type="button" role="switch" aria-checked={form.status === 'active'} aria-label="Account active" onClick={() => patch('status', form.status === 'active' ? 'inactive' : 'active')} className={`min-h-[36px] rounded-full border px-4 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${form.status === 'active' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-slate-600 text-slate-400'}`}>
                    {form.status === 'active' ? '✓ Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </form>

        <div className={`flex items-center justify-between gap-3 border-t px-5 py-4 sm:px-6 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'}`}>
          {step === 2 ? (
            <button type="button" onClick={() => setStep(1)} className="min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold transition hover:bg-slate-500/10 dark:border-slate-700 dark:text-slate-300">
              ← Back to details
            </button>
          ) : (
            <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold transition hover:bg-slate-500/10 dark:border-slate-700 dark:text-slate-300">
              Cancel
            </button>
          )}
          {step === 1 ? (
            <button type="button" onClick={handleNext} className="min-h-[44px] rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
              Continue to security →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
              <UserPlus className="h-4 w-4" aria-hidden="true" /> Create account
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function EditStaffModal({ isOpen, onClose, staffMember, onSaveStaff, existingStaff, isDark }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'therapist', specialty: '', shift: 'Morning', commRate: 35, status: 'active', emergency: '' });
  const [errors, setErrors] = useState({});
  const firstFieldRef = useRef(null);
  useModalBehavior(isOpen, onClose, firstFieldRef);

  useEffect(() => {
    if (staffMember) {
      setForm({
        name: staffMember.name || '', email: staffMember.email || '', phone: staffMember.phone || '',
        role: staffMember.role || 'therapist', specialty: staffMember.specialty || '',
        shift: staffMember.shift || 'Morning', commRate: staffMember.commRate ?? 35,
        status: staffMember.status || 'active', emergency: staffMember.emergency || '',
      });
      setErrors({});
    }
  }, [staffMember]);

  if (!isOpen || !staffMember) return null;

  const patch = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validateStaffForm(form, existingStaff, true, staffMember.id);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSaveStaff({ ...staffMember, ...form, commRate: form.role === 'therapist' ? Number(form.commRate) : 0 });
    onClose();
  };

  const inputCls = (k) => `w-full rounded-2xl border px-3.5 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${
    errors[k] ? 'border-red-500/70' : isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'
  }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="edit-staff-title"
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:max-w-xl sm:rounded-3xl ${isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 font-bold text-white">
              <Edit3 className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 id="edit-staff-title" className="text-sm font-bold">Edit staff profile</h3>
              <p className="text-[11px] text-slate-400">{staffMember.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-500/15">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto p-5 sm:p-6" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="es-name" label="Full name" required error={errors.name}>
              <input id="es-name" ref={firstFieldRef} type="text" value={form.name} onChange={(e) => patch('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'es-name-error' : undefined} className={inputCls('name')} />
            </Field>
            <Field id="es-email" label="Email" required error={errors.email}>
              <input id="es-email" type="email" value={form.email} onChange={(e) => patch('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'es-email-error' : undefined} className={inputCls('email')} />
            </Field>
            <Field id="es-phone" label="Phone" required error={errors.phone}>
              <input id="es-phone" type="tel" value={form.phone} onChange={(e) => patch('phone', e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'es-phone-error' : undefined} className={inputCls('phone')} />
            </Field>
            <Field id="es-spec" label="Specialty / title" required error={errors.specialty}>
              <input id="es-spec" type="text" value={form.specialty} onChange={(e) => patch('specialty', e.target.value)} aria-invalid={!!errors.specialty} aria-describedby={errors.specialty ? 'es-spec-error' : undefined} className={inputCls('specialty')} />
            </Field>
            <Field id="es-role" label="Assigned role">
              <select id="es-role" value={form.role} onChange={(e) => patch('role', e.target.value)} className={inputCls('')}>
                {Object.entries(ROLE_DETAILS).map(([rk, rm]) => <option key={rk} value={rk}>{rm.label}</option>)}
              </select>
            </Field>
            {form.role === 'therapist' && (
              <Field id="es-comm" label="Commission rate (%)" error={errors.commRate}>
                <input id="es-comm" type="number" min="0" max="100" value={form.commRate} onChange={(e) => patch('commRate', e.target.value)} aria-invalid={!!errors.commRate} aria-describedby={errors.commRate ? 'es-comm-error' : undefined} className={inputCls('commRate')} />
              </Field>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400">Status</span>
            <button type="button" role="switch" aria-checked={form.status === 'active'} aria-label="Account active" onClick={() => patch('status', form.status === 'active' ? 'inactive' : 'active')} className={`min-h-[36px] rounded-full border px-4 py-1.5 text-xs font-bold ${form.status === 'active' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-slate-600 text-slate-400'}`}>
              {form.status === 'active' ? '✓ Active' : 'Inactive'}
            </button>
          </div>
          <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
            <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold dark:border-slate-700">Cancel</button>
            <button type="submit" className="min-h-[44px] rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500">Save changes</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, body, confirmLabel = 'Delete', isDark }) {
  const confirmRef = useRef(null);
  useModalBehavior(isOpen, onClose, confirmRef);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <motion.div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-body"
        initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-t-3xl border p-6 shadow-2xl sm:rounded-3xl ${isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
      >
        <h3 id="confirm-title" className="text-sm font-bold">{title}</h3>
        <p id="confirm-body" className="mt-1 text-xs leading-relaxed text-slate-400">{body}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold dark:border-slate-700">Cancel</button>
          <button type="button" ref={confirmRef} onClick={onConfirm} className="min-h-[44px] rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">{confirmLabel}</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── main page ────────────────────────────────────────────────────── */

const TABS = [
  { id: 'config', label: 'Business', full: 'Spa & Business Config', icon: Sliders },
  { id: 'booking', label: 'Booking Rules', full: 'Booking & Operations', icon: CalendarClock },
  { id: 'staff', label: 'Staff', full: 'Staff Provisioning', icon: UserPlus },
  { id: 'cms', label: 'Content', full: 'Content Management', icon: Globe },
  { id: 'notifications', label: 'Alerts', full: 'Alert Triggers', icon: Bell },
  { id: 'system', label: 'Payments & System', full: 'Payments, Security & Data', icon: Wallet },
];

const AdminSettings = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'config');
  const [toasts, setToasts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(() => window.localStorage.getItem('cozyblissful.settings.savedAt') || '');
  const tabRefs = useRef({});

  /* persisted settings (draft + saved snapshot for dirty tracking) */
  const [saved, setSaved] = useState(() => loadJSON(SETTINGS_KEY, {
    business: BUSINESS_DEFAULTS, booking: BOOKING_DEFAULTS, cms: CMS_DEFAULTS,
    notifs: NOTIF_DEFAULTS, system: SYSTEM_DEFAULTS,
  }));
  const [business, setBusiness] = useState(saved.business);
  const [booking, setBooking] = useState(saved.booking);
  const [cms, setCms] = useState(saved.cms);
  const [notifs, setNotifs] = useState(saved.notifs);
  const [system, setSystem] = useState(saved.system);

  const [bizErrors, setBizErrors] = useState({});
  const [bookErrors, setBookErrors] = useState({});
  const [cmsErrors, setCmsErrors] = useState({});
  const [notifErrors, setNotifErrors] = useState({});
  const [sysErrors, setSysErrors] = useState({});

  /* staff */
  const [staffList, setStaffList] = useState(() => loadJSON(STAFF_KEY, { list: INITIAL_STAFF }).list || INITIAL_STAFF);
  const [searchStaff, setSearchStaff] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try { window.localStorage.setItem(STAFF_KEY, JSON.stringify({ list: staffList })); } catch { /* storage full — non-fatal */ }
  }, [staffList]);

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab && TABS.some((t) => t.id === tabFromUrl)) setActiveTab(tabFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  const pushToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const onTabKeyDown = (e) => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    let next = null;
    if (e.key === 'ArrowRight') next = TABS[(idx + 1) % TABS.length].id;
    else if (e.key === 'ArrowLeft') next = TABS[(idx - 1 + TABS.length) % TABS.length].id;
    else if (e.key === 'Home') next = TABS[0].id;
    else if (e.key === 'End') next = TABS[TABS.length - 1].id;
    if (next) { e.preventDefault(); handleTabChange(next); requestAnimationFrame(() => tabRefs.current[next]?.focus()); }
  };

  const persistAll = (next) => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      const stamp = new Date().toISOString();
      window.localStorage.setItem('cozyblissful.settings.savedAt', stamp);
      setLastSavedAt(stamp);
    } catch {
      pushToast('Storage is full — changes kept for this session only.', 'error');
    }
  };

  const fakeLatency = () => new Promise((r) => setTimeout(r, 550));

  const saveSection = async (section) => {
    const map = {
      business: [business, validateBusiness, setBizErrors],
      booking: [booking, validateBooking, setBookErrors],
      cms: [cms, validateCMS, setCmsErrors],
      notifs: [notifs, validateAlerts, setNotifErrors],
      system: [system, validateSystem, setSysErrors],
    };
    const [draft, validator, setErr] = map[section];
    const errs = validator(draft);
    setErr(errs);
    if (Object.keys(errs).length) {
      pushToast('Please fix the highlighted fields before saving.', 'error');
      return;
    }
    setSaving(true);
    await fakeLatency();
    setSaving(false);
    const next = { ...saved, [section]: draft };
    setSaved(next);
    persistAll(next);
    pushToast('Settings saved successfully.');
  };

  const resetSection = (section) => {
    const restore = { business: setBusiness, booking: setBooking, cms: setCms, notifs: setNotifs, system: setSystem };
    const clearErr = { business: setBizErrors, booking: setBookErrors, cms: setCmsErrors, notifs: setNotifErrors, system: setSysErrors };
    restore[section](saved[section]);
    clearErr[section]({});
  };

  const isDirty = (section, draft) => JSON.stringify(draft) !== JSON.stringify(saved[section]);

  /* staff actions */
  const handleAddStaff = (s) => {
    setStaffList((prev) => [s, ...prev]);
    pushToast(`Added ${s.name} as ${ROLE_DETAILS[s.role]?.label || s.role}.`);
  };
  const handleSaveStaff = (u) => {
    setStaffList((prev) => prev.map((s) => (s.id === u.id ? u : s)));
    pushToast(`Profile for ${u.name} updated.`);
  };
  const toggleStaffStatus = (id) => {
    setStaffList((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const nextStatus = s.status === 'active' ? 'inactive' : 'active';
      pushToast(`${s.name} is now ${nextStatus}.`, 'info');
      return { ...s, status: nextStatus };
    }));
  };
  const confirmDeleteStaff = () => {
    if (!deletingStaff) return;
    setStaffList((prev) => prev.filter((s) => s.id !== deletingStaff.id));
    pushToast(`Removed ${deletingStaff.name} from the directory.`, 'info');
    setDeletingStaff(null);
  };

  const exportStaffCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Role', 'Specialty', 'Shift', 'Commission %', 'Status', 'Joined']];
    staffList.forEach((s) => rows.push([s.name, s.email, s.phone, ROLE_DETAILS[s.role]?.label || s.role, s.specialty, s.shift, s.commRate, s.status, s.joined]));
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cozy-blissful-staff.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    pushToast('Staff directory exported as CSV.');
  };

  const exportSettingsJSON = () => {
    const blob = new Blob([JSON.stringify({ app: 'cozy-blissful', version: 1, exportedAt: new Date().toISOString(), settings: saved }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cozy-blissful-settings.json';
    a.click();
    URL.revokeObjectURL(a.href);
    pushToast('Settings bundle downloaded.');
  };

  const importSettingsJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const incoming = parsed.settings || parsed;
        const next = {
          business: { ...BUSINESS_DEFAULTS, ...(incoming.business || {}) },
          booking: { ...BOOKING_DEFAULTS, ...(incoming.booking || {}) },
          cms: { ...CMS_DEFAULTS, ...(incoming.cms || {}) },
          notifs: { ...NOTIF_DEFAULTS, ...(incoming.notifs || {}) },
          system: { ...SYSTEM_DEFAULTS, ...(incoming.system || {}) },
        };
        setSaved(next);
        setBusiness(next.business); setBooking(next.booking); setCms(next.cms);
        setNotifs(next.notifs); setSystem(next.system);
        persistAll(next);
        pushToast('Settings imported and applied.');
      } catch {
        pushToast('Import failed — not a valid settings JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const factoryReset = () => {
    const fresh = { business: BUSINESS_DEFAULTS, booking: BOOKING_DEFAULTS, cms: CMS_DEFAULTS, notifs: NOTIF_DEFAULTS, system: SYSTEM_DEFAULTS };
    setSaved(fresh);
    setBusiness(fresh.business); setBooking(fresh.booking); setCms(fresh.cms);
    setNotifs(fresh.notifs); setSystem(fresh.system);
    setBizErrors({}); setBookErrors({}); setCmsErrors({}); setNotifErrors({}); setSysErrors({});
    persistAll(fresh);
    setShowResetConfirm(false);
    pushToast('Settings restored to factory defaults.', 'info');
  };

  const filteredStaff = useMemo(() => {
    const q = searchStaff.trim().toLowerCase();
    const list = staffList.filter((s) => {
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q);
      const matchRole = filterRole === 'all' || s.role === filterRole;
      return matchSearch && matchRole;
    });
    const sorted = [...list];
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'role') sorted.sort((a, b) => a.role.localeCompare(b.role));
    return sorted;
  }, [staffList, searchStaff, filterRole, sortBy]);

  const activeCount = staffList.filter((s) => s.status === 'active').length;
  const storageBytes = useMemo(() => {
    try {
      return (JSON.stringify(saved) || '').length + (JSON.stringify(staffList) || '').length;
    } catch { return 0; }
  }, [saved, staffList]);

  const fieldCls = (err) => fieldClasses(isDark, err);
  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <AdminLayout title="System Settings" subtitle="Operating profile, booking rules, staff access, landing content, alerts, payments & security" icon={Sliders}>
      <MotionConfig reducedMotion="user">
        <div className="space-y-5 pb-10">
          <Toasts toasts={toasts} />

          {/* last-saved strip */}
          {lastSavedAt && (
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500" role="status">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
              Last saved {new Date(lastSavedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              <span aria-hidden="true">•</span> stored locally on this device
            </p>
          )}

          {/* ── accessible tab bar: scroll-snap on mobile, grid on desktop ── */}
          <div className={`rounded-3xl border p-1.5 shadow-sm ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50/90'}`}>
            <div
              role="tablist"
              aria-label="Settings sections"
              onKeyDown={onTabKeyDown}
              className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-6 lg:overflow-visible"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                const dirtyDot = (tab.id === 'config' && isDirty('business', business))
                  || (tab.id === 'booking' && isDirty('booking', booking))
                  || (tab.id === 'cms' && isDirty('cms', cms))
                  || (tab.id === 'notifications' && isDirty('notifs', notifs))
                  || (tab.id === 'system' && isDirty('system', system));
                return (
                  <button
                    key={tab.id}
                    ref={(el) => { tabRefs.current[tab.id] = el; }}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={selected ? 0 : -1}
                    title={tab.full}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex min-h-[44px] min-w-[132px] snap-start items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 lg:min-w-0 ${
                      selected
                        ? isDark
                          ? 'border border-emerald-500/40 bg-slate-900 text-emerald-400 shadow-md'
                          : 'border border-emerald-500/30 bg-emerald-100/90 text-emerald-950 shadow-sm'
                        : isDark
                          ? 'border border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          : 'border border-transparent text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{tab.label}</span>
                    {tab.id === 'staff' && (
                      <span aria-label={`${staffList.length} staff members`} className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${selected ? 'bg-emerald-500 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                        {staffList.length}
                      </span>
                    )}
                    {dirtyDot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" title="Unsaved changes" aria-label="Unsaved changes" />}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {/* ═══ TAB 1 · BUSINESS ═══ */}
              {activeTab === 'config' && (
                <SectionCard isDark={isDark} eyebrow="Business profile" title="Spa details & operational hours"
                  desc="This drives booking availability, receipts and the client-facing footer. Times are checked against booking rules on save."
                  dirty={isDirty('business', business)} saving={saving}
                  onSave={() => saveSection('business')} onReset={() => resetSection('business')}>
                  <FormErrorSummary errors={bizErrors} />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field id="biz-name" label="Official spa brand name" required error={bizErrors.name} counter={`${business.name.length}/80`}>
                      <input id="biz-name" type="text" maxLength={80} value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} aria-invalid={!!bizErrors.name} aria-describedby={bizErrors.name ? 'biz-name-error' : undefined} className={fieldCls(bizErrors.name)} autoComplete="organization" />
                    </Field>
                    <Field id="biz-phone" label="Hotline contact number" required error={bizErrors.phone} hint="PH mobile — used for SMS sender display.">
                      <input id="biz-phone" type="tel" inputMode="tel" value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} aria-invalid={!!bizErrors.phone} aria-describedby={bizErrors.phone ? 'biz-phone-error' : 'biz-phone-hint'} className={fieldCls(bizErrors.phone)} autoComplete="tel" />
                    </Field>
                    <Field id="biz-open" label="Daily opening time" required error={bizErrors.openTime} hint={`Opens ${to12h(business.openTime)}`}>
                      <input id="biz-open" type="time" value={business.openTime} onChange={(e) => setBusiness({ ...business, openTime: e.target.value })} aria-invalid={!!bizErrors.openTime} aria-describedby={bizErrors.openTime ? 'biz-open-error' : 'biz-open-hint'} className={fieldCls(bizErrors.openTime)} />
                    </Field>
                    <Field id="biz-close" label="Daily closing time" required error={bizErrors.closeTime} hint={`Last session must end by ${to12h(business.closeTime)}`}>
                      <input id="biz-close" type="time" value={business.closeTime} onChange={(e) => setBusiness({ ...business, closeTime: e.target.value })} aria-invalid={!!bizErrors.closeTime} aria-describedby={bizErrors.closeTime ? 'biz-close-error' : 'biz-close-hint'} className={fieldCls(bizErrors.closeTime)} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field id="biz-addr" label="Primary service coverage area" required error={bizErrors.address}>
                        <input id="biz-addr" type="text" value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} aria-invalid={!!bizErrors.address} aria-describedby={bizErrors.address ? 'biz-addr-error' : undefined} className={fieldCls(bizErrors.address)} autoComplete="address-level2" />
                      </Field>
                    </div>
                    <Field id="biz-radius" label="Dispatch radius (km)" required error={bizErrors.coverageRadiusKm} hint="Home-service limit from the branch.">
                      <input id="biz-radius" type="number" min="1" max="200" value={business.coverageRadiusKm} onChange={(e) => setBusiness({ ...business, coverageRadiusKm: e.target.value })} aria-invalid={!!bizErrors.coverageRadiusKm} aria-describedby={bizErrors.coverageRadiusKm ? 'biz-radius-error' : 'biz-radius-hint'} className={fieldCls(bizErrors.coverageRadiusKm)} />
                    </Field>
                    <Field id="biz-cancel" label="Auto-cancellation window (hrs)" required error={bizErrors.cancellationWindowHrs} hint="Free cancellation allowed before this cutoff.">
                      <input id="biz-cancel" type="number" min="0.5" max="72" step="0.5" value={business.cancellationWindowHrs} onChange={(e) => setBusiness({ ...business, cancellationWindowHrs: e.target.value })} aria-invalid={!!bizErrors.cancellationWindowHrs} aria-describedby={bizErrors.cancellationWindowHrs ? 'biz-cancel-error' : 'biz-cancel-hint'} className={fieldCls(bizErrors.cancellationWindowHrs)} />
                    </Field>
                  </div>
                  {/* live summary */}
                  <div className={`flex flex-col gap-2 rounded-2xl border p-4 text-xs sm:flex-row sm:items-center ${isDark ? 'border-emerald-500/20 bg-emerald-500/[0.05]' : 'border-emerald-600/20 bg-emerald-50'}`}>
                    <Phone className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    <p className="leading-relaxed text-slate-400">
                      <strong className="text-slate-200 dark:text-slate-100">{business.name || 'Your spa'}</strong>
                      {' '}· {to12h(business.openTime)} – {to12h(business.closeTime)} · {business.phone || 'no hotline'} · within {business.coverageRadiusKm || '—'} km of {business.address || '—'}
                    </p>
                  </div>
                </SectionCard>
              )}

              {/* ═══ TAB 2 · BOOKING RULES (NEW) ═══ */}
              {activeTab === 'booking' && (
                <SectionCard isDark={isDark} eyebrow="Operations" title="Booking rules & capacity"
                  desc="Slot math, lead times and concurrency. These guard the client slot picker against overbooking."
                  dirty={isDirty('booking', booking)} saving={saving}
                  onSave={() => saveSection('booking')} onReset={() => resetSection('booking')}>
                  <FormErrorSummary errors={bookErrors} />
                  <fieldset>
                    <legend className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">Operating days *</legend>
                    <div className="flex flex-wrap gap-2" role="group" aria-describedby={bookErrors.operatingDays ? 'op-days-error' : 'op-days-hint'}>
                      {WEEKDAYS.map((d) => {
                        const on = booking.operatingDays.includes(d);
                        return (
                          <button key={d} type="button" aria-pressed={on}
                            onClick={() => setBooking({ ...booking, operatingDays: on ? booking.operatingDays.filter((x) => x !== d) : [...booking.operatingDays, d] })}
                            className={`min-h-[44px] min-w-[56px] rounded-2xl border px-4 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${on ? 'border-emerald-500 bg-emerald-600 text-white shadow-md' : isDark ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200' : 'border-slate-200 bg-white text-slate-600'}`}>
                            {d}
                          </button>
                        );
                      })}
                    </div>
                    <p id="op-days-hint" className="mt-1.5 text-[11px] text-slate-500">
                      {booking.operatingDays.length} day(s) open
                      {business.openTime && business.closeTime ? ` · ${to12h(business.openTime)} – ${to12h(business.closeTime)}` : ''}
                      {business.openTime && business.closeTime ? ` · ~${Math.max(0, Math.floor((toMinutes(business.closeTime) - toMinutes(business.openTime) + (toMinutes(business.closeTime) <= toMinutes(business.openTime) ? 1440 : 0)) / Number(booking.slotIntervalMin || 30)))} slots/day` : ''}.
                    </p>
                    {bookErrors.operatingDays && <p id="op-days-error" role="alert" className="mt-1 text-[11px] font-medium text-red-500">{bookErrors.operatingDays}</p>}
                  </fieldset>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field id="bk-slot" label="Slot interval (min)" required error={bookErrors.slotIntervalMin}>
                      <select id="bk-slot" value={booking.slotIntervalMin} onChange={(e) => setBooking({ ...booking, slotIntervalMin: e.target.value })} className={fieldCls(bookErrors.slotIntervalMin)} aria-invalid={!!bookErrors.slotIntervalMin} aria-describedby={bookErrors.slotIntervalMin ? 'bk-slot-error' : undefined}>
                        {['15', '20', '30', '45', '60'].map((v) => <option key={v} value={v}>Every {v} minutes</option>)}
                      </select>
                    </Field>
                    <Field id="bk-buffer" label="Buffer between sessions (min)" required error={bookErrors.bufferMin} hint="Room reset + travel padding.">
                      <input id="bk-buffer" type="number" min="0" max="60" value={booking.bufferMin} onChange={(e) => setBooking({ ...booking, bufferMin: e.target.value })} className={fieldCls(bookErrors.bufferMin)} aria-invalid={!!bookErrors.bufferMin} aria-describedby={bookErrors.bufferMin ? 'bk-buffer-error' : 'bk-buffer-hint'} />
                    </Field>
                    <Field id="bk-lead" label="Min. lead time (hrs)" required error={bookErrors.minLeadTimeHrs} hint="Blocks same-hour rush bookings.">
                      <input id="bk-lead" type="number" min="0.5" max="72" step="0.5" value={booking.minLeadTimeHrs} onChange={(e) => setBooking({ ...booking, minLeadTimeHrs: e.target.value })} className={fieldCls(bookErrors.minLeadTimeHrs)} aria-invalid={!!bookErrors.minLeadTimeHrs} aria-describedby={bookErrors.minLeadTimeHrs ? 'bk-lead-error' : 'bk-lead-hint'} />
                    </Field>
                    <Field id="bk-adv" label="Max advance booking (days)" required error={bookErrors.maxAdvanceDays}>
                      <input id="bk-adv" type="number" min="1" max="180" value={booking.maxAdvanceDays} onChange={(e) => setBooking({ ...booking, maxAdvanceDays: e.target.value })} className={fieldCls(bookErrors.maxAdvanceDays)} aria-invalid={!!bookErrors.maxAdvanceDays} aria-describedby={bookErrors.maxAdvanceDays ? 'bk-adv-error' : undefined} />
                    </Field>
                    <Field id="bk-noshow" label="No-show auto-cancel (min)" required error={bookErrors.autoCancelNoShowMin} hint="Frees the therapist slot.">
                      <input id="bk-noshow" type="number" min="5" max="180" value={booking.autoCancelNoShowMin} onChange={(e) => setBooking({ ...booking, autoCancelNoShowMin: e.target.value })} className={fieldCls(bookErrors.autoCancelNoShowMin)} aria-invalid={!!bookErrors.autoCancelNoShowMin} aria-describedby={bookErrors.autoCancelNoShowMin ? 'bk-noshow-error' : 'bk-noshow-hint'} />
                    </Field>
                    <Field id="bk-cap" label="Max bookings / therapist / day" required error={bookErrors.maxPerTherapistPerDay}>
                      <input id="bk-cap" type="number" min="1" max="30" value={booking.maxPerTherapistPerDay} onChange={(e) => setBooking({ ...booking, maxPerTherapistPerDay: e.target.value })} className={fieldCls(bookErrors.maxPerTherapistPerDay)} aria-invalid={!!bookErrors.maxPerTherapistPerDay} aria-describedby={bookErrors.maxPerTherapistPerDay ? 'bk-cap-error' : undefined} />
                    </Field>
                  </div>

                  <div className={`grid grid-cols-1 gap-4 rounded-2xl border p-4 sm:grid-cols-3 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/70'}`}>
                    <Toggle id="bk-walk" checked={booking.allowWalkIns} onChange={(v) => setBooking({ ...booking, allowWalkIns: v })} label="Allow walk-ins" desc="Front desk can create same-day sessions." />
                    <Toggle id="bk-conc" checked={booking.allowConcurrentOverlap} onChange={(v) => setBooking({ ...booking, allowConcurrentOverlap: v })} label="Multi-therapist concurrency" desc="Overlapping slots allowed across therapists." />
                    <Toggle id="bk-dep" checked={booking.requireDownpayment} onChange={(v) => setBooking({ ...booking, requireDownpayment: v })} label="Require downpayment" desc="Uses the % set in Payments & System." />
                  </div>
                </SectionCard>
              )}

              {/* ═══ TAB 3 · STAFF ═══ */}
              {activeTab === 'staff' && (
                <div className="space-y-5">
                  <section aria-label="Staff provisioning" className={`rounded-3xl border p-5 sm:p-7 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500">
                          Access control & staffing
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">{activeCount} active</span>
                        </p>
                        <h2 className="mt-1 text-base font-bold tracking-tight sm:text-lg">Staff provisioning & system access</h2>
                        <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-slate-400">Onboard therapists and coordinators with role permissions. Directory persists on this device.</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button type="button" onClick={exportStaffCSV} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-xs font-bold transition hover:bg-slate-500/10 dark:border-slate-700 dark:text-slate-300">
                          <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
                        </button>
                        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setIsAddOpen(true)}
                          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-600/25 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                          <UserPlus className="h-4 w-4" aria-hidden="true" /> Add new staff member
                        </motion.button>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 lg:flex-row">
                      <div className={`flex flex-1 items-center gap-2.5 rounded-2xl border px-4 py-1 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
                        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <label htmlFor="staff-search" className="sr-only">Search staff</label>
                        <input id="staff-search" type="search" placeholder="Search name, email, or specialty…" value={searchStaff} onChange={(e) => setSearchStaff(e.target.value)}
                          className="min-h-[44px] w-full bg-transparent text-sm outline-none placeholder:text-slate-500" />
                        {searchStaff && (
                          <button type="button" onClick={() => setSearchStaff('')} aria-label="Clear search" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200">
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by role">
                        {['all', 'manager', 'staff', 'therapist', 'receptionist'].map((rk) => {
                          const on = filterRole === rk;
                          return (
                            <button key={rk} type="button" aria-pressed={on} onClick={() => setFilterRole(rk)}
                              className={`min-h-[44px] whitespace-nowrap rounded-2xl border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${on ? 'border-emerald-500 bg-emerald-600 text-white shadow-md' : isDark ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200' : 'border-slate-200 bg-white text-slate-600'}`}>
                              {rk === 'all' ? 'All roles' : ROLE_DETAILS[rk]?.label || rk}
                            </button>
                          );
                        })}
                      </div>
                      <label className="flex min-h-[44px] items-center gap-2 text-xs text-slate-400">
                        <span className="sr-only">Sort staff</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort staff"
                          className={`min-h-[44px] rounded-2xl border px-3 text-xs font-semibold outline-none ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                          <option value="recent">Recently added</option>
                          <option value="name">Name A–Z</option>
                          <option value="role">By role</option>
                        </select>
                      </label>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-500" role="status">
                      Showing {filteredStaff.length} of {staffList.length} account(s){searchStaff && <> for “{searchStaff}”</>}.
                    </p>
                  </section>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2" role="list" aria-label="Staff directory">
                    {filteredStaff.map((staff) => {
                      const meta = ROLE_DETAILS[staff.role] || ROLE_DETAILS.therapist;
                      const on = staff.status === 'active';
                      return (
                        <motion.article key={staff.id} role="listitem" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col justify-between gap-4 rounded-3xl border p-5 shadow-sm transition ${isDark ? 'border-slate-800 bg-slate-950/80 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-md" style={{ background: meta.grad }} aria-hidden="true">
                                {staff.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h3 className="flex items-center gap-2 truncate text-xs font-bold">
                                  {staff.name}
                                  <span className={`h-2 w-2 shrink-0 rounded-full ${on ? 'bg-emerald-500' : 'bg-slate-400'}`} title={on ? 'Active' : 'Inactive'} aria-label={on ? 'Active account' : 'Inactive account'} />
                                </h3>
                                <p className="truncate text-[11px] text-slate-400">{staff.email}</p>
                                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{staff.specialty}</p>
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                          </div>
                          <dl className={`space-y-1.5 rounded-2xl p-3 text-[11px] ${isDark ? 'bg-slate-900/60 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
                            <div className="flex items-center justify-between gap-2">
                              <dt className="sr-only">Phone</dt>
                              <dd className="flex min-w-0 items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" aria-hidden="true" /><span className="truncate">{staff.phone}</span></dd>
                              <dd className="shrink-0 font-semibold">{staff.shift} shift</dd>
                            </div>
                            {staff.role === 'therapist' && (
                              <div className="mt-1.5 flex items-center justify-between border-t border-slate-500/15 pt-1.5">
                                <dt>Commission share</dt>
                                <dd className="font-bold text-amber-500">{staff.commRate}%</dd>
                              </div>
                            )}
                          </dl>
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="text-[10px] font-medium text-slate-400">Joined {staff.joined}</span>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => toggleStaffStatus(staff.id)} aria-pressed={on} aria-label={`${on ? 'Deactivate' : 'Activate'} ${staff.name}`}
                                className={`min-h-[36px] rounded-xl border px-3 py-1 text-[10px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${on ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'border-slate-600 text-slate-400 hover:bg-slate-500/10'}`}>
                                {on ? '✓ Active' : 'Activate'}
                              </button>
                              <button type="button" onClick={() => setEditingStaff(staff)} aria-label={`Edit ${staff.name}`} title="Edit profile"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 text-slate-400 transition hover:bg-slate-500/10 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                              <button type="button" onClick={() => setDeletingStaff(staff)} aria-label={`Remove ${staff.name}`} title="Remove"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 text-red-400 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                    {filteredStaff.length === 0 && (
                      <div className={`col-span-full rounded-3xl border border-dashed p-12 text-center ${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-600'}`}>
                        <UserPlus className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden="true" />
                        <p className="text-sm font-bold">No staff match your filters</p>
                        <p className="mt-1 text-xs text-slate-400">Clear the search or onboard a new member.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ TAB 4 · CMS ═══ */}
              {activeTab === 'cms' && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <SectionCard isDark={isDark} eyebrow="Landing page copy" title="Hero banner messaging"
                      desc="Client-facing headline, badge and announcement ticker. Counters keep copy mobile-safe."
                      dirty={isDirty('cms', cms)} saving={saving}
                      onSave={() => saveSection('cms')} onReset={() => resetSection('cms')} saveLabel="Save copy">
                      <FormErrorSummary errors={cmsErrors} />
                      <Field id="cms-title" label="Main heading title" required error={cmsErrors.heroTitle} counter={`${cms.heroTitle.length}/80`}>
                        <input id="cms-title" type="text" maxLength={90} value={cms.heroTitle} onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })} aria-invalid={!!cmsErrors.heroTitle} aria-describedby={cmsErrors.heroTitle ? 'cms-title-error' : undefined} className={fieldCls(cmsErrors.heroTitle)} />
                      </Field>
                      <Field id="cms-sub" label="Pill badge subtitle" required error={cmsErrors.heroSubtitle} counter={`${cms.heroSubtitle.length}/60`}>
                        <input id="cms-sub" type="text" maxLength={70} value={cms.heroSubtitle} onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })} aria-invalid={!!cmsErrors.heroSubtitle} aria-describedby={cmsErrors.heroSubtitle ? 'cms-sub-error' : undefined} className={fieldCls(cmsErrors.heroSubtitle)} />
                      </Field>
                      <Field id="cms-desc" label="Hero sub-description" required error={cmsErrors.heroDescription} counter={`${cms.heroDescription.length}/300`}>
                        <textarea id="cms-desc" rows={4} maxLength={320} value={cms.heroDescription} onChange={(e) => setCms({ ...cms, heroDescription: e.target.value })} aria-invalid={!!cmsErrors.heroDescription} aria-describedby={cmsErrors.heroDescription ? 'cms-desc-error' : undefined} className={`${fieldCls(cmsErrors.heroDescription)} min-h-[100px] resize-y`} />
                      </Field>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field id="cms-fb" label="Facebook URL" error={cmsErrors.facebookUrl}>
                          <input id="cms-fb" type="url" inputMode="url" placeholder="https://facebook.com/…" value={cms.facebookUrl} onChange={(e) => setCms({ ...cms, facebookUrl: e.target.value })} aria-invalid={!!cmsErrors.facebookUrl} aria-describedby={cmsErrors.facebookUrl ? 'cms-fb-error' : undefined} className={fieldCls(cmsErrors.facebookUrl)} />
                        </Field>
                        <Field id="cms-ig" label="Instagram URL" error={cmsErrors.instagramUrl}>
                          <input id="cms-ig" type="url" inputMode="url" placeholder="https://instagram.com/…" value={cms.instagramUrl} onChange={(e) => setCms({ ...cms, instagramUrl: e.target.value })} aria-invalid={!!cmsErrors.instagramUrl} aria-describedby={cmsErrors.instagramUrl ? 'cms-ig-error' : undefined} className={fieldCls(cmsErrors.instagramUrl)} />
                        </Field>
                      </div>
                      <div className={`space-y-4 rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/70'}`}>
                        <Toggle id="cms-promo" checked={cms.promoEnabled} onChange={(v) => setCms({ ...cms, promoEnabled: v })} label="Announcement ticker banner" desc="Shows a promo strip above the booking page." />
                        {cms.promoEnabled && (
                          <Field id="cms-promo-text" label="Promo banner text" required error={cmsErrors.promoBannerText} counter={`${cms.promoBannerText.length}/120`}>
                            <input id="cms-promo-text" type="text" maxLength={140} value={cms.promoBannerText} onChange={(e) => setCms({ ...cms, promoBannerText: e.target.value })} aria-invalid={!!cmsErrors.promoBannerText} aria-describedby={cmsErrors.promoBannerText ? 'cms-promo-text-error' : undefined} className={fieldCls(cmsErrors.promoBannerText)} />
                          </Field>
                        )}
                      </div>
                    </SectionCard>
                  </div>
                  <div className="lg:col-span-5">
                    <div className={`rounded-3xl border p-5 sm:p-6 lg:sticky lg:top-4 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'}`}>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live client preview</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">Updates as you type — what guests see.</p>
                      {cms.promoEnabled && cms.promoBannerText.trim() && (
                        <p className="mt-3 truncate rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-500" role="status">
                          ✨ {cms.promoBannerText}
                        </p>
                      )}
                      <div className="mt-3 space-y-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 text-white shadow-2xl">
                        <span className="inline-block max-w-full truncate rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300">
                          {cms.heroSubtitle || 'Pill subtitle'}
                        </span>
                        <h2 className="text-xl font-black leading-tight text-emerald-100">{cms.heroTitle || 'Main hero title'}</h2>
                        <p className="text-xs leading-relaxed text-slate-300">{cms.heroDescription || 'Hero description…'}</p>
                        <div className="flex items-center justify-between gap-2 border-t border-emerald-500/20 pt-3 text-[10px] font-semibold text-emerald-400">
                          <span>⚡ {booking.operatingDays.length}/7 days · {to12h(business.openTime)} – {to12h(business.closeTime)}</span>
                          <span className="rounded-xl bg-emerald-500 px-3 py-1.5 font-bold text-white">Book now</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ TAB 5 · ALERTS ═══ */}
              {activeTab === 'notifications' && (
                <SectionCard isDark={isDark} eyebrow="Automated messaging" title="SMS & email notification triggers"
                  desc="Transactional messages always bypass quiet hours. Marketing respects them."
                  dirty={isDirty('notifs', notifs)} saving={saving}
                  onSave={() => saveSection('notifs')} onReset={() => resetSection('notifs')} saveLabel="Save rules">
                  <FormErrorSummary errors={notifErrors} />
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { key: 'smsBookingCreated', title: 'Instant SMS on booking creation', desc: 'Alert customer and staff the moment a request lands.' },
                      { key: 'smsBookingApproved', title: 'SMS on confirmation', desc: 'Notify the customer when their slot is approved.' },
                      { key: 'emailBookingCreated', title: 'Email receipt & prep guide', desc: 'Session confirmation, therapist and preparation notes.' },
                      { key: 'therapistDispatchAlert', title: 'Dispatch alert to therapist', desc: 'Push assignment with client location details.' },
                      { key: 'emailPromoUpdates', title: 'Promotional campaigns', desc: 'Include opt-in emails in monthly offers. Marketing only.' },
                    ].map((item) => (
                      <div key={item.key} className={`rounded-2xl border p-4 transition sm:p-5 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/70'}`}>
                        <Toggle id={`ntf-${item.key}`} checked={!!notifs[item.key]} onChange={(v) => setNotifs({ ...notifs, [item.key]: v })} label={item.title} desc={item.desc} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Field id="ntf-remind" label="Reminder lead time">
                      <select id="ntf-remind" value={notifs.reminderLeadTimeHrs} onChange={(e) => setNotifs({ ...notifs, reminderLeadTimeHrs: e.target.value })} className={fieldCls('')}>
                        <option value="2">2 hours before</option>
                        <option value="12">12 hours before</option>
                        <option value="24">24 hours before</option>
                        <option value="48">48 hours before</option>
                      </select>
                    </Field>
                    <Field id="ntf-qs" label="Quiet hours start" error={notifErrors.quietStart} hint="No marketing after this.">
                      <input id="ntf-qs" type="time" value={notifs.quietStart} onChange={(e) => setNotifs({ ...notifs, quietStart: e.target.value })} className={fieldCls(notifErrors.quietStart)} aria-invalid={!!notifErrors.quietStart} aria-describedby={notifErrors.quietStart ? 'ntf-qs-error' : 'ntf-qs-hint'} />
                    </Field>
                    <Field id="ntf-qe" label="Quiet hours end" error={notifErrors.quietEnd} hint="Marketing resumes here.">
                      <input id="ntf-qe" type="time" value={notifs.quietEnd} onChange={(e) => setNotifs({ ...notifs, quietEnd: e.target.value })} className={fieldCls(notifErrors.quietEnd)} aria-invalid={!!notifErrors.quietEnd} aria-describedby={notifErrors.quietEnd ? 'ntf-qe-error' : 'ntf-qe-hint'} />
                    </Field>
                  </div>
                </SectionCard>
              )}

              {/* ═══ TAB 6 · PAYMENTS + SECURITY + DATA (NEW) ═══ */}
              {activeTab === 'system' && (
                <div className="space-y-5">
                  <SectionCard isDark={isDark} eyebrow="Money in" title="Payments & pricing policy"
                    desc="Currency, surcharges and accepted channels. Downpayment enforcement is toggled under Booking Rules."
                    dirty={isDirty('system', system)} saving={saving}
                    onSave={() => saveSection('system')} onReset={() => resetSection('system')}>
                    <FormErrorSummary errors={sysErrors} />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <Field id="sys-cur" label="Currency">
                        <select id="sys-cur" value={system.currency} onChange={(e) => setSystem({ ...system, currency: e.target.value })} className={fieldCls('')}>
                          <option value="PHP">PHP (₱) — Philippine Peso</option>
                          <option value="USD">USD ($) — US Dollar</option>
                        </select>
                      </Field>
                      <Field id="sys-vat" label="VAT (%)" required error={sysErrors.vatPercent}>
                        <input id="sys-vat" type="number" min="0" max="28" step="0.5" value={system.vatPercent} onChange={(e) => setSystem({ ...system, vatPercent: e.target.value })} className={fieldCls(sysErrors.vatPercent)} aria-invalid={!!sysErrors.vatPercent} aria-describedby={sysErrors.vatPercent ? 'sys-vat-error' : undefined} />
                      </Field>
                      <Field id="sys-sc" label="Service charge (%)" required error={sysErrors.serviceChargePercent}>
                        <input id="sys-sc" type="number" min="0" max="20" step="0.5" value={system.serviceChargePercent} onChange={(e) => setSystem({ ...system, serviceChargePercent: e.target.value })} className={fieldCls(sysErrors.serviceChargePercent)} aria-invalid={!!sysErrors.serviceChargePercent} aria-describedby={sysErrors.serviceChargePercent ? 'sys-sc-error' : undefined} />
                      </Field>
                      <Field id="sys-dp" label="Downpayment (%)" required error={sysErrors.downpaymentPercent} hint={booking.requireDownpayment ? 'Enforced at checkout.' : 'Collected only if enforcement is on.'}>
                        <input id="sys-dp" type="number" min="0" max="100" value={system.downpaymentPercent} onChange={(e) => setSystem({ ...system, downpaymentPercent: e.target.value })} className={fieldCls(sysErrors.downpaymentPercent)} aria-invalid={!!sysErrors.downpaymentPercent} aria-describedby={sysErrors.downpaymentPercent ? 'sys-dp-error' : 'sys-dp-hint'} />
                      </Field>
                    </div>
                    <fieldset>
                      <legend className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">Accepted payment methods *</legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Payment methods">
                        {[
                          ['payCash', 'Cash'],
                          ['payGcash', 'GCash'],
                          ['payMaya', 'Maya'],
                          ['payCard', 'Card'],
                        ].map(([k, label]) => {
                          const on = !!system[k];
                          return (
                            <button key={k} type="button" aria-pressed={on} onClick={() => setSystem({ ...system, [k]: !on })}
                              className={`min-h-[44px] rounded-2xl border px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${on ? 'border-emerald-500 bg-emerald-600 text-white' : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'}`}>
                              {on ? '✓ ' : ''}{label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                    {system.payGcash && (
                      <div className="max-w-sm">
                        <Field id="sys-gcash" label="GCash merchant number" required error={sysErrors.gcashNumber}>
                          <input id="sys-gcash" type="tel" inputMode="tel" value={system.gcashNumber} onChange={(e) => setSystem({ ...system, gcashNumber: e.target.value })} className={fieldCls(sysErrors.gcashNumber)} aria-invalid={!!sysErrors.gcashNumber} aria-describedby={sysErrors.gcashNumber ? 'sys-gcash-error' : undefined} />
                        </Field>
                      </div>
                    )}
                    <Field id="sys-refund" label="Refund & cancellation policy" error={sysErrors.refundPolicy} counter={`${system.refundPolicy.length} chars`} hint="Shown at checkout and in confirmation emails.">
                      <textarea id="sys-refund" rows={3} value={system.refundPolicy} onChange={(e) => setSystem({ ...system, refundPolicy: e.target.value })} className={`${fieldCls(sysErrors.refundPolicy)} resize-y`} aria-invalid={!!sysErrors.refundPolicy} aria-describedby={sysErrors.refundPolicy ? 'sys-refund-error' : 'sys-refund-hint'} />
                    </Field>
                    <div className={`rounded-2xl border p-4 text-xs ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/70'}`}>
                      <p className="flex items-center gap-2 font-bold"><Wallet className="h-4 w-4 text-emerald-500" aria-hidden="true" /> Checkout preview</p>
                      <p className="mt-1 leading-relaxed text-slate-400">
                        ₱1,000 service → VAT {system.vatPercent || 0}% + charge {system.serviceChargePercent || 0}% = <strong className="text-slate-200 dark:text-slate-100">₱{(1000 * (1 + Number(system.vatPercent || 0) / 100 + Number(system.serviceChargePercent || 0) / 100)).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</strong>
                        {booking.requireDownpayment && <> · downpayment <strong className="text-emerald-400">₱{(1000 * (1 + Number(system.vatPercent || 0) / 100 + Number(system.serviceChargePercent || 0) / 100) * Number(system.downpaymentPercent || 0) / 100).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</strong> due now</>}.
                      </p>
                    </div>
                  </SectionCard>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <section aria-label="Security" className={`rounded-3xl border p-5 sm:p-7 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'}`}>
                      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500"><Lock className="h-3.5 w-3.5" aria-hidden="true" /> Access security</p>
                      <h2 className="mt-1 text-base font-bold">Sessions & login guard</h2>
                      <div className="mt-5 space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <Field id="sec-timeout" label="Session timeout (min)" required error={sysErrors.sessionTimeoutMin}>
                            <input id="sec-timeout" type="number" min="5" max="180" value={system.sessionTimeoutMin} onChange={(e) => setSystem({ ...system, sessionTimeoutMin: e.target.value })} className={fieldCls(sysErrors.sessionTimeoutMin)} aria-invalid={!!sysErrors.sessionTimeoutMin} aria-describedby={sysErrors.sessionTimeoutMin ? 'sec-timeout-error' : undefined} />
                          </Field>
                          <Field id="sec-attempts" label="Max login attempts" required error={sysErrors.maxLoginAttempts}>
                            <input id="sec-attempts" type="number" min="3" max="10" value={system.maxLoginAttempts} onChange={(e) => setSystem({ ...system, maxLoginAttempts: e.target.value })} className={fieldCls(sysErrors.maxLoginAttempts)} aria-invalid={!!sysErrors.maxLoginAttempts} aria-describedby={sysErrors.maxLoginAttempts ? 'sec-attempts-error' : undefined} />
                          </Field>
                        </div>
                        <div className={`space-y-4 rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/70'}`}>
                          <Toggle id="sec-strong" checked={system.requireStrongPassword} onChange={(v) => setSystem({ ...system, requireStrongPassword: v })} label="Enforce strong passwords" desc="8+ chars, uppercase + number for new staff accounts." />
                          <Toggle id="sec-maint" checked={system.maintenanceMode} onChange={(v) => setSystem({ ...system, maintenanceMode: v })} label="Maintenance mode" desc="Pauses client booking; staff panel stays online." />
                        </div>
                        {system.maintenanceMode && (
                          <p role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] font-semibold text-amber-500">
                            ⚠ Maintenance is ON — clients see a “temporarily paused” notice. Remember to save.
                          </p>
                        )}
                      </div>
                    </section>

                    <section aria-label="Data and danger zone" className={`rounded-3xl border p-5 sm:p-7 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'}`}>
                      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500"><Database className="h-3.5 w-3.5" aria-hidden="true" /> Data & portability</p>
                      <h2 className="mt-1 text-base font-bold">Backup, transfer & reset</h2>
                      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                        {[
                          ['Staff', String(staffList.length)],
                          ['Local KB', `${(storageBytes / 1024).toFixed(1)}`],
                          ['Sections', '5'],
                        ].map(([k, v]) => (
                          <div key={k} className={`rounded-2xl border p-3 ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</dt>
                            <dd className="mt-0.5 text-lg font-black tabular-nums">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button type="button" onClick={exportSettingsJSON} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-xs font-bold transition hover:bg-slate-500/10 dark:border-slate-700 dark:text-slate-200">
                          <Download className="h-4 w-4" aria-hidden="true" /> Export JSON
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-xs font-bold transition hover:bg-slate-500/10 dark:border-slate-700 dark:text-slate-200">
                          <Upload className="h-4 w-4" aria-hidden="true" /> Import JSON
                        </button>
                        <input ref={fileInputRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Import settings JSON file"
                          onChange={(e) => { importSettingsJSON(e.target.files?.[0]); e.target.value = ''; }} />
                      </div>
                      <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-4">
                        <p className="text-xs font-bold text-red-400">Danger zone</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Restores all five sections to factory defaults. Staff directory is kept.</p>
                        <button type="button" onClick={() => setShowResetConfirm(true)} className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-red-500/40 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Restore defaults…
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="sr-only" aria-live="polite">Current section: {activeTabMeta?.full}</p>
        </div>
      </MotionConfig>

      {/* modals */}
      <AnimatePresence>
        {isAddOpen && (
          <AddStaffModal key="add" isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAddStaff={handleAddStaff} existingStaff={staffList} isDark={isDark} />
        )}
        {!!editingStaff && (
          <EditStaffModal key="edit" isOpen={!!editingStaff} onClose={() => setEditingStaff(null)} staffMember={editingStaff} onSaveStaff={handleSaveStaff} existingStaff={staffList} isDark={isDark} />
        )}
        {!!deletingStaff && (
          <ConfirmDialog key="del" isOpen={!!deletingStaff} onClose={() => setDeletingStaff(null)} onConfirm={confirmDeleteStaff}
            title={`Remove ${deletingStaff.name}?`} body="They lose portal access immediately. Past audit history is preserved. This cannot be undone." confirmLabel="Remove account" isDark={isDark} />
        )}
        {showResetConfirm && (
          <ConfirmDialog key="reset" isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={factoryReset}
            title="Restore factory defaults?" body="All five settings sections return to out-of-the-box values. Staff accounts are untouched." confirmLabel="Restore defaults" isDark={isDark} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminSettings;
