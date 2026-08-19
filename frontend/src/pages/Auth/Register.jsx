import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Lock, ShieldCheck, UserPlus, Eye, EyeOff,
  AlertCircle, Clock, Check, X, Sparkles, CheckCircle2, ArrowRight, Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Brand palette ─────────────────────────────────────────────────────────────
const B = {
  deep: '#041e16',
  green: '#0a3d30',
  mid: '#0f5c47',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
  emerald: '#34d399',
  ink: '#1a2332',
  inkSoft: '#64748b',
  line: '#e2e8f0',
  white: '#ffffff',
};

// ─── Static data ───────────────────────────────────────────────────────────────
const SOCIALS = [
  { label: 'Facebook', href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
  { label: 'Instagram', href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
  { label: 'TikTok', href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg> },
  { label: 'WhatsApp', href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg> },
];

const STATS = [
  { value: '2,500+', label: 'Clients' },
  { value: '4.9★', label: 'Rating' },
  { value: '30+', label: 'Therapists' },
  { value: '7 Days', label: 'Available' },
];

const SERVICES = [
  { icon: '💆', name: 'Massage Therapy', note: 'From ₱749' },
  { icon: '💅', name: 'Nail Care', note: 'From ₱299' },
  { icon: '✨', name: 'Beauty & Wellness', note: 'Ask for price' },
];

const PERKS = [
  { icon: '🎁', text: 'Welcome bonus on first booking' },
  { icon: '⚡', text: 'Priority same-day appointments' },
  { icon: '💎', text: 'Exclusive member-only deals' },
];

// ─── OAuth ────────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const loadScript = (src, id) => new Promise((resolve, reject) => {
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.dataset.loaded === 'true') return resolve();
    existing.addEventListener('load', resolve);
    existing.addEventListener('error', reject);
    return;
  }
  const s = document.createElement('script');
  s.src = src; s.id = id; s.async = true; s.defer = true;
  s.addEventListener('load', () => { s.dataset.loaded = 'true'; resolve(); });
  s.addEventListener('error', reject);
  document.head.appendChild(s);
});

// ─── Sub-components ───────────────────────────────────────────────────────────
const GoogleGlyph = () => (
  <svg viewBox="0 0 48 48" className="w-4 h-4 shrink-0" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const Particle = ({ style, delay = 0, duration = 9 }) => (
  <motion.div className="absolute rounded-full pointer-events-none" style={style}
    animate={{ y: [0, -14, 0], x: [0, 6, 0], opacity: [0.35, 0.75, 0.35] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }} />
);

const DotGrid = ({ rows = 4, cols = 8, className = '' }) => (
  <div className={`grid gap-[6px] pointer-events-none ${className}`}
    style={{ gridTemplateColumns: `repeat(${cols}, 4px)` }}>
    {Array.from({ length: rows * cols }).map((_, i) => (
      <span key={i} className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
    ))}
  </div>
);

const RateLimitBanner = ({ retryAfter }) => {
  const [s, setS] = useState(retryAfter);
  useEffect(() => { setS(retryAfter); }, [retryAfter]);
  useEffect(() => {
    if (s <= 0) return;
    const id = setInterval(() => setS(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [s]);
  const m = Math.floor(s / 60), sec = s % 60;
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 p-2.5 rounded-xl text-xs"
      style={{ background: 'rgba(191,161,95,0.08)', border: '1px solid rgba(191,161,95,0.3)' }}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#a89658' }} />
      <span style={{ color: '#8b7a45' }}>
        <strong>Too many attempts.</strong>{' '}
        {s > 0 ? `Retry in ${m > 0 ? `${m}m ` : ''}${sec}s.` : 'You may try again.'}
      </span>
    </motion.div>
  );
};

// ─── Compact Input ────────────────────────────────────────────────────────────
const Input = ({ label, id, icon: Icon, error, rightEl, onBlur, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-[11px] font-semibold mb-1" style={{ color: B.ink }}>
        {label}
      </label>
      <div className="relative w-full">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors duration-150 shrink-0 z-10"
          style={{ color: error ? '#dc2626' : focused ? B.gold : '#94a3b8' }} />
        <input id={id}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
          className="w-full rounded-xl outline-none transition-all duration-200 bg-white"
          style={{
            fontSize: '16px', /* Must be ≥16px to prevent iOS Safari auto-zoom */
            background: '#ffffff',
            backgroundColor: '#ffffff',
            border: error ? '1.5px solid rgba(220,38,38,0.55)' : focused ? `1.5px solid ${B.gold}` : `1.5px solid ${B.line}`,
            color: B.ink,
            padding: rightEl ? '0.5rem 2.4rem 0.5rem 2.3rem' : '0.5rem 0.75rem 0.5rem 2.3rem',
            boxShadow: focused && !error ? `0 0 0 3px rgba(191,161,95,0.1)` : error ? `0 0 0 3px rgba(220,38,38,0.06)` : 'none',
            caretColor: B.gold,
            touchAction: 'manipulation',
          }} {...props} />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-0.5 text-[11px] flex items-center gap-1 font-medium" style={{ color: '#dc2626' }}>
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Password Strength Meter ──────────────────────────────────────────────────
const CHECKS = [
  { key: 'len', label: '8+ characters', test: p => p.length >= 8 },
  { key: 'up', label: 'Uppercase letter', test: p => /[A-Z]/.test(p) },
  { key: 'lo', label: 'Lowercase letter', test: p => /[a-z]/.test(p) },
  { key: 'num', label: 'Number (0–9)', test: p => /\d/.test(p) },
  { key: 'sp', label: 'Special char (@$!%*?&)', test: p => /[@$!%*?&]/.test(p) },
];

const PasswordStrength = ({ password }) => {
  const results = CHECKS.map(c => ({ ...c, ok: c.test(password) }));
  const passed = results.filter(r => r.ok).length;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const barColor = colors[passed - 1] ?? '#e2e8f0';
  const label = labels[passed - 1] ?? '';

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
      className="mt-1.5 overflow-hidden">
      <div className="p-2 rounded-xl space-y-1.5" style={{ background: '#f8fafc', border: `1px solid ${B.line}` }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div key={i} className="h-1 flex-1 rounded-full"
                animate={{ background: i < passed ? barColor : '#e2e8f0' }}
                transition={{ duration: 0.25 }} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            {label && (
              <motion.span key={label} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="text-[9px] font-bold whitespace-nowrap" style={{ color: barColor }}>
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {results.map(r => (
            <motion.div key={r.key} className="flex items-center gap-1"
              animate={{ opacity: r.ok ? 1 : 0.5 }}>
              {r.ok
                ? <Check className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                : <X className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#94a3b8' }} />}
              <span className="text-[9.5px] font-medium truncate" style={{ color: r.ok ? '#15803d' : '#94a3b8' }}>
                {r.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Social Sign-up ───────────────────────────────────────────────────────────
const SocialSignIn = ({ onSuccess, onError, disabled }) => {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);
  const busy = useRef(false);

  const finish = useCallback(async (provider, providerToken) => {
    if (busy.current) return;
    busy.current = true;
    setPending(provider);
    const res = await socialLogin(provider, providerToken);
    busy.current = false;
    setPending(null);
    if (res.success) {
      onSuccess(res.role);
    } else if (res.needsRegistration) {
      navigate(`/register?prefill_email=${encodeURIComponent(res.email)}&prefill_name=${encodeURIComponent(res.suggestedName || '')}&provider=${encodeURIComponent(res.provider || '')}`);
    } else {
      onError(res.error || 'Google sign-in failed.');
    }
  }, [socialLogin, onSuccess, onError, navigate]);

  useEffect(() => {
    const clientId = GOOGLE_CLIENT_ID || '922784943812-1ub65gtvbr600in6t8qja4h9lkpdhuat.apps.googleusercontent.com';
    let cancelled = false;
    loadScript('https://accounts.google.com/gsi/client', 'google-gsi')
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => resp?.credential ? finish('google', resp.credential) : onError('Google auth was cancelled.'),
          auto_select: false, cancel_on_tap_outside: true,
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard', theme: 'outline', size: 'large',
            text: 'signup_with', shape: 'rectangular', logo_alignment: 'left', width: 320,
          });
        }
        setGoogleReady(true);
      })
      .catch(() => onError('Could not load Google SDK.'));
    return () => { cancelled = true; };
  }, [finish, onError]);

  const handleGoogleClick = () => {
    if (disabled || pending) return;
    if (window.google?.accounts?.id) {
      setPending('google');
      window.google.accounts.id.prompt((n) => {
        if (n.isNotDisplayed() || n.isSkippedMoment()) {
          const btn = googleBtnRef.current?.querySelector('iframe') || googleBtnRef.current?.querySelector('div[role="button"]');
          if (btn) btn.click(); else setPending(null);
        }
      });
    } else { onError('Google Sign-In is initializing. Please try again.'); }
  };

  const btnBase = "w-full h-9 px-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border";

  return (
    <div className="w-full mt-0.5">
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 h-px" style={{ background: B.line }} />
        <span className="text-[9px] font-bold tracking-widest uppercase shrink-0" style={{ color: B.inkSoft }}>or sign up with</span>
        <div className="flex-1 h-px" style={{ background: B.line }} />
      </div>
      <div className="relative w-full">
        <motion.button type="button" onClick={handleGoogleClick} disabled={disabled || pending !== null}
          whileHover={{ scale: (disabled || pending) ? 1 : 1.01 }} whileTap={{ scale: (disabled || pending) ? 1 : 0.985 }}
          className={btnBase}
          style={{ background: B.white, borderColor: B.line, color: B.ink, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {pending === 'google'
            ? <><div className="w-3.5 h-3.5 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: B.gold }} /><span style={{ color: B.inkSoft }}>Connecting…</span></>
            : <><GoogleGlyph /><span className="truncate">Sign up with Google</span></>}
        </motion.button>
        <div ref={googleBtnRef} aria-label="Sign up with Google"
          className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ opacity: googleReady && pending !== 'google' ? 0.011 : 0, colorScheme: 'light', pointerEvents: pending !== null ? 'none' : 'auto' }} />
      </div>
    </div>
  );
};

// ─── Main Register component ──────────────────────────────────────────────────
const Register = () => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [error, setError] = useState(null);
  const [socialNotice, setSocialNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredInfo, setRegisteredInfo] = useState({ name: '', email: '' });

  const { register, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preEmail = params.get('prefill_email');
    const preName = params.get('prefill_name');
    const provider = params.get('provider');
    if (preEmail) setEmail(preEmail);
    if (preName) setName(preName);
    if (preEmail || provider) {
      setSocialNotice(`We verified your ${provider ? provider.toUpperCase() : 'email'} address (${preEmail || ''}). Please confirm your Full Name and create a Password to complete registration.`);
    }
  }, [location.search]);

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateField = useCallback((field, value, allValues = {}) => {
    let err = '';
    const currentPass = allValues.password !== undefined ? allValues.password : password;
    if (field === 'name') {
      if (!value.trim()) err = 'Full name is required.';
      else if (value.trim().length < 2) err = 'Name must be at least 2 characters.';
      else if (!nameRegex.test(value.trim())) err = 'Letters, spaces, hyphens, and apostrophes only.';
    } else if (field === 'email') {
      if (!value.trim()) err = 'Email address is required.';
      else if (!emailRegex.test(value.trim())) err = 'Please enter a valid email address.';
    } else if (field === 'password') {
      if (!value) err = 'Password is required.';
      else if (value.length < 8) err = 'Password must be at least 8 characters.';
      else if (!passRegex.test(value)) err = 'Must include upper & lower letters, number & special char (@$!%*?&).';
    } else if (field === 'confirmPassword') {
      if (!value) err = 'Please confirm your password.';
      else if (value !== currentPass) err = 'Passwords do not match.';
    }
    setFieldErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  }, [nameRegex, emailRegex, passRegex, password]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required.';
    else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    else if (!nameRegex.test(name.trim())) e.name = 'Letters, spaces, hyphens, and apostrophes only.';
    if (!email.trim()) e.email = 'Email address is required.';
    else if (!emailRegex.test(email.trim())) e.email = 'Please enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    else if (!passRegex.test(password)) e.password = 'Must include upper & lower letters, number & special char (@$!%*?&).';
    if (!confirmPw) e.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPw) e.confirmPassword = 'Passwords do not match.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearFieldError = (key) => {
    setFieldErrors(prev => ({ ...prev, [key]: '' }));
    if (error) setError(null);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null); setFieldErrors({}); setRateLimit(null);
    if (!validate()) return;
    setSubmitting(true);
    const res = await register(name.trim(), email.trim(), password, confirmPw);
    if (res.success) {
      await logout();
      setRegisteredInfo({ name: name.trim(), email: email.trim() });
      setShowSuccessModal(true);
      localStorage.setItem('remember_email', email.trim());
      setSubmitting(false);
      return;
    }
    if (res.rateLimited) setRateLimit(res.retryAfter || 3600);
    else if (res.errors) {
      const m = {};
      Object.keys(res.errors).forEach(k => {
        const mk = k === 'password_confirmation' ? 'confirmPassword' : k;
        m[mk] = res.errors[k][0];
      });
      setFieldErrors(m);
      setError('Please fix the errors highlighted below.');
    } else {
      setError(res.error);
    }
    setSubmitting(false);
  };

  const handleProceedToLogin = () => {
    navigate('/login', {
      state: {
        email: registeredInfo.email,
        notice: 'Registration successful! Please sign in with your password.',
      },
    });
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: 'linear-gradient(135deg,#f0f4f8 0%,#e8edf3 100%)',
        padding: 'clamp(8px, 2vw, 24px)',
      }}>

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: '50vw', maxWidth: 500, height: '50vw', maxHeight: 500, left: '-15vw', top: '-15vw', background: `radial-gradient(circle, rgba(10,61,48,0.12) 0%, transparent 70%)` }} />
        <div className="absolute rounded-full" style={{ width: '45vw', maxWidth: 450, height: '45vw', maxHeight: 450, right: '-12vw', bottom: '-12vw', background: `radial-gradient(circle, rgba(191,161,95,0.1) 0%, transparent 70%)` }} />
      </div>

      {/* ─── Main card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full rounded-2xl overflow-hidden flex flex-col md:flex-row my-auto"
        style={{
          maxWidth: 'min(940px, 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 18px rgba(0,0,0,0.06)',
          maxHeight: 'calc(100vh - clamp(16px, 4vw, 48px))',
        }}>

        {/* ─── Left brand panel (md+ only) ─── */}
        <div
          className="hidden md:flex flex-col justify-between relative overflow-y-auto no-scrollbar flex-shrink-0"
          style={{
            width: 'clamp(200px, 42%, 380px)',
            padding: 'clamp(16px, 3vw, 24px)',
            background: `linear-gradient(155deg, ${B.mid} 0%, ${B.green} 45%, ${B.deep} 100%)`,
          }}>

          <div className="absolute rounded-full" style={{ width: 200, height: 200, right: -70, top: -70, border: '36px solid rgba(255,255,255,0.05)' }} />
          <div className="absolute rounded-full" style={{ width: 140, height: 140, left: -45, bottom: -45, background: 'rgba(191,161,95,0.12)', border: '1px solid rgba(191,161,95,0.2)' }} />
          <Particle style={{ width: 14, height: 14, left: 24, top: '35%', background: 'rgba(255,255,255,0.2)' }} delay={0} duration={7} />
          <Particle style={{ width: 8, height: 8, right: 40, top: '22%', background: 'rgba(191,161,95,0.55)' }} delay={2} duration={9} />
          <Particle style={{ width: 12, height: 12, right: 22, bottom: '32%', background: 'rgba(255,255,255,0.15)' }} delay={1.5} duration={8} />
          <DotGrid rows={4} cols={7} className="absolute right-6 top-14 opacity-60" />
          <DotGrid rows={3} cols={5} className="absolute left-6 bottom-14 opacity-40" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold mb-2.5"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>
              <Sparkles className="w-2.5 h-2.5" style={{ color: B.goldLight }} />
              <span>Join 2,500+ Happy Clients Today</span>
            </div>

            <h2 className="font-black text-white leading-tight tracking-tight mb-0.5"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)' }}>Start Your</h2>
            <h3 className="font-bold mb-2" style={{ color: B.goldLight, fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>Wellness Journey.</h3>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '16rem' }}>
              Massage therapy & nail care delivered to your home — 7 days a week, 6 AM – 11 PM.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-1 mb-3">
              {STATS.map(s => (
                <div key={s.label} className="rounded-xl px-1 py-1.5 text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-[11px] font-black leading-none mb-0.5" style={{ color: B.goldLight }}>{s.value}</p>
                  <p className="text-[8px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Services */}
            <div className="flex flex-col gap-1 mb-2.5">
              {SERVICES.map(s => (
                <div key={s.name} className="flex items-center justify-between rounded-xl px-2.5 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>{s.name}</span>
                  </div>
                  <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(191,161,95,0.2)', color: B.goldLight }}>{s.note}</span>
                </div>
              ))}
            </div>

            {/* Member perks */}
            <div className="space-y-1">
              {PERKS.map(p => (
                <div key={p.text} className="flex items-center gap-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <span>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-2">
            <div className="flex gap-1.5">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
                  <s.icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right form panel ─── */}
        <div
          className="flex-1 flex items-center justify-center overflow-y-auto no-scrollbar"
          style={{
            background: B.white,
            padding: 'clamp(14px, 3vw, 28px) clamp(16px, 5vw, 40px)',
          }}>
          <div className="w-full" style={{ maxWidth: 'clamp(280px, 90%, 370px)' }}>

            {/* Mobile brand strip */}
            <div className="md:hidden flex items-center gap-2 mb-3 pb-2.5"
              style={{ borderBottom: `1px solid ${B.line}` }}>
              <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black leading-none" style={{ color: B.green }}>Cozy Blissful</p>
                <p className="text-[9px]" style={{ color: B.inkSoft }}>Premium Spa & Wellness</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(10,61,48,0.08)', color: B.green }}>
                <ShieldCheck className="w-2.5 h-2.5" /> Secure
              </span>
            </div>

            {/* Header with logo — desktop */}
            <div className="flex flex-col items-center mb-3 text-center">
              <motion.div className="relative mb-2"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ boxShadow: `0 6px 20px rgba(191,161,95,0.2), 0 2px 6px rgba(0,0,0,0.08)`, background: B.white, border: `1.5px solid ${B.line}` }}>
                  <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-8 h-8 rounded-xl object-cover" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: '#22c55e' }} />
              </motion.div>
              <h1 className="text-base font-black tracking-tight mb-0.5" style={{ color: B.ink }}>Create Account</h1>
              <p className="text-[11px]" style={{ color: B.inkSoft }}>Join Cozy Blissful — it&apos;s free</p>
            </div>

            {/* Social prefill notice */}
            <AnimatePresence mode="wait">
              {socialNotice && (
                <motion.div key="sn" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2 p-2.5 rounded-xl text-xs mb-2.5"
                  style={{ background: 'rgba(191,161,95,0.08)', border: '1.5px solid rgba(191,161,95,0.3)' }}>
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#a89658' }} />
                  <span style={{ color: '#8b7a45', fontWeight: 500 }}>{socialNotice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Alert banners */}
            <AnimatePresence mode="wait">
              {rateLimit !== null && (
                <motion.div key="rl" className="mb-2.5" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <RateLimitBanner retryAfter={rateLimit} />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {error && !rateLimit && (
                <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2 p-2.5 rounded-xl text-xs mb-2.5"
                  style={{ background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.2)' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#dc2626' }} />
                  <span style={{ color: '#b91c1c', fontWeight: 500 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-2">
              <Input label="Full Name" id="register-name" type="text" autoComplete="name" required icon={User}
                value={name} placeholder="e.g. Maria Santos" error={fieldErrors.name}
                onBlur={() => validateField('name', name)}
                onChange={e => { setName(e.target.value); clearFieldError('name'); }} />

              <Input label="Email Address" id="register-email" type="email" autoComplete="email" required icon={Mail}
                value={email} placeholder="you@example.com" error={fieldErrors.email}
                onBlur={() => validateField('email', email)}
                onChange={e => { setEmail(e.target.value); clearFieldError('email'); }} />

              {/* Password + strength meter */}
              <div>
                <Input label="Password" id="register-password" type={showPw ? 'text' : 'password'} autoComplete="new-password" required icon={Lock}
                  value={password} placeholder="Create a strong password" error={fieldErrors.password}
                  onBlur={() => validateField('password', password)}
                  onChange={e => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                    if (confirmPw) validateField('confirmPassword', confirmPw, { password: e.target.value });
                  }}
                  rightEl={
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      className="transition-colors p-1 rounded cursor-pointer"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={e => e.currentTarget.style.color = B.ink}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  } />
                <AnimatePresence>
                  {password && <PasswordStrength password={password} />}
                </AnimatePresence>
              </div>

              <Input label="Confirm Password" id="register-confirm" type={showCPw ? 'text' : 'password'} autoComplete="new-password" required icon={ShieldCheck}
                value={confirmPw} placeholder="Repeat your password" error={fieldErrors.confirmPassword}
                onBlur={() => validateField('confirmPassword', confirmPw)}
                onChange={e => { setConfirmPw(e.target.value); clearFieldError('confirmPassword'); }}
                rightEl={
                  <button type="button" tabIndex={-1} onClick={() => setShowCPw(v => !v)}
                    aria-label={showCPw ? 'Hide password' : 'Show password'}
                    className="transition-colors p-1 rounded cursor-pointer"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => e.currentTarget.style.color = B.ink}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    {showCPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                } />

              {/* Password match indicator */}
              <AnimatePresence>
                {confirmPw && password && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[11px] font-medium"
                    style={{ color: confirmPw === password ? '#16a34a' : '#dc2626' }}>
                    {confirmPw === password
                      ? <><Check className="w-3 h-3" />Passwords match</>
                      : <><X className="w-3 h-3" />Passwords do not match</>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button type="submit" id="register-submit" disabled={submitting || rateLimit > 0}
                whileHover={{ scale: submitting ? 1 : 1.015, boxShadow: submitting ? undefined : `0 6px 20px rgba(191,161,95,0.4)` }}
                whileTap={{ scale: submitting ? 1 : 0.985 }}
                className="w-full flex justify-center items-center gap-2 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer select-none"
                style={{
                  background: `linear-gradient(135deg, ${B.goldLight} 0%, ${B.gold} 100%)`,
                  color: B.deep,
                  boxShadow: `0 3px 12px rgba(191,161,95,0.3)`,
                  letterSpacing: '0.02em',
                  fontSize: '14px',
                  touchAction: 'manipulation',
                  minHeight: '42px',
                  height: '42px',
                }}>
                {submitting
                  ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(4,30,22,0.2)', borderTopColor: B.deep }} />
                  : <><UserPlus className="w-4 h-4" /><span>Create My Account</span></>}
              </motion.button>
            </form>

            {/* Social signup */}
            <SocialSignIn disabled={submitting} onSuccess={() => { }}
              onError={(msg) => { setRateLimit(null); setError(msg); }} />

            {/* Footer */}
            <div className="mt-3 text-center space-y-1.5">
              <p className="text-[11px]" style={{ color: B.inkSoft }}>
                Already have an account?{' '}
                <Link to="/login" className="font-bold hover:underline underline-offset-2" style={{ color: B.gold }}>
                  Sign in
                </Link>
              </p>
              <div>
                <Link to="/" className="inline-flex items-center gap-1 text-[11px] transition-colors"
                  style={{ color: '#cbd5e1' }}
                  onMouseEnter={e => e.currentTarget.style.color = B.inkSoft}
                  onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ Success Modal ═══ */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(4,30,22,0.75)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative w-full rounded-2xl bg-white overflow-hidden text-center"
              style={{ maxWidth: 'min(380px, 94vw)', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', border: `1px solid ${B.line}` }}>

              {/* Header gradient */}
              <div className="relative h-20 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${B.deep} 0%, ${B.mid} 100%)` }}>
                <div className="absolute rounded-full" style={{ width: 100, height: 100, right: -20, top: -30, background: B.gold, opacity: 0.15 }} />
                <div className="absolute rounded-full" style={{ width: 60, height: 60, left: -10, bottom: -10, border: `10px solid ${B.goldLight}`, opacity: 0.12 }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <motion.div className="w-14 h-14 rounded-full bg-white flex items-center justify-center"
                    style={{ boxShadow: '0 8px 28px rgba(52,211,153,0.3)', border: `3px solid #34d399` }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', damping: 16, stiffness: 260 }}>
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)' }}>
                      <CheckCircle2 className="w-7 h-7" style={{ color: '#059669' }} />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 pt-10 pb-5 space-y-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest"
                    style={{ background: 'rgba(191,161,95,0.12)', color: B.gold }}>
                    <Sparkles className="w-3 h-3" /> Account Created
                  </span>
                  <h3 className="text-lg font-black tracking-tight" style={{ color: B.ink }}>
                    Registration Successful!
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: B.inkSoft }}>
                    Your account has been created. Please sign in with your credentials to access your account.
                  </p>
                </div>

                {/* Info card */}
                <div className="p-3 rounded-xl text-left text-xs space-y-1.5" style={{ background: '#f8fafc', border: `1px solid ${B.line}` }}>
                  {[['Name', registeredInfo.name, B.ink], ['Email', registeredInfo.email, B.gold]].map(([k, v, c]) => (
                    <div key={k} className="flex items-center justify-between gap-2">
                      <span className="font-medium shrink-0" style={{ color: B.inkSoft }}>{k}:</span>
                      <span className="font-bold truncate max-w-[200px]" style={{ color: c }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Proceed button */}
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToLogin}
                  className="w-full h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${B.goldLight}, ${B.gold})`, color: B.deep, boxShadow: `0 6px 20px rgba(191,161,95,0.35)`, letterSpacing: '0.015em' }}>
                  Proceed to Login
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
