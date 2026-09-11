import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn, UserPlus, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, Clock, ShieldCheck, Sparkles, Check, X,
  ArrowLeft, CheckCircle2, Gift, Zap, Gem, Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Luxury Brand Tokens (Matching Landing Page) ──────────────────────────────
const B = {
  canvas: '#03140e',
  deep: '#041e16',
  green: '#0a3d30',
  mid: '#0f5c47',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
  goldDark: '#8c7033',
  ink: '#0f172a',
  inkSoft: '#64748b',
  line: '#e2e8f0',
  white: '#ffffff',
  glowEmerald: 'rgba(10,61,48,0.35)',
  glowGold: 'rgba(191,161,95,0.15)',
};

const SOCIALS = [
  { label: 'Facebook', href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
  { label: 'Instagram', href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
  { label: 'WhatsApp', href: 'https://wa.me/639995435913', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg> },
];

const TRUST_POINTS_LOGIN = [
  { icon: ShieldCheck, title: 'Encrypted & Secure', note: 'Your credentials never leave our protected servers in plain text.' },
  { icon: Clock, title: 'Open 7 Days a Week', note: 'Book and manage your sessions anytime from 6 AM to 11 PM.' },
  { icon: Sparkles, title: 'Certified Therapists', note: '30+ vetted professionals dedicated to your relaxation.' },
];

const TRUST_POINTS_REGISTER = [
  { icon: Gift, title: 'Welcome Member Perks', note: 'Instant booking privileges and special opening service rates.' },
  { icon: Zap, title: 'Priority Scheduling', note: 'Secure candidate therapist slots before general availability.' },
  { icon: Gem, title: 'Exclusive Home Spa Rates', note: 'Access member-only packages for massages and nail treatments.' },
];

// Validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Google OAuth configuration
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

const GoogleGlyph = () => (
  <svg viewBox="0 0 48 48" className="w-4 h-4 shrink-0" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

// Floating Golden Petals (Adopted from Landing Page)
const FloatingPetals = ({ count = 12 }) => {
  const petals = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 12,
      dur: 10 + Math.random() * 10,
      drift: -30 + Math.random() * 60,
      op: 0.12 + Math.random() * 0.2,
    })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block" aria-hidden="true">
      {petals.map(p => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: -20,
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, #e8cc8a 0%, rgba(191,161,95,0.35) 100%)',
          }}
          animate={{
            y: [0, -900],
            x: [0, p.drift],
            opacity: [0, p.op, p.op, 0],
            rotate: [0, 200],
          }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

// Rate Limit countdown banner
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
      style={{ background: 'rgba(191,161,95,0.12)', border: '1px solid rgba(191,161,95,0.35)' }}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#bfa15f' }} />
      <span style={{ color: '#e8cc8a' }}>
        <strong>Too many attempts.</strong>{' '}
        {s > 0 ? `Retry in ${m > 0 ? `${m}m ` : ''}${sec}s.` : 'You may try again.'}
      </span>
    </motion.div>
  );
};

// Sleek Input Component with Focus Ring & Error Handling
const Input = ({ label, id, icon: Icon, error, rightEl, onBlur, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-semibold mb-1" style={{ color: B.ink }}>
        {label}
      </label>
      <div className="relative w-full">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-150 shrink-0 z-10"
          style={{ color: error ? '#dc2626' : focused ? B.gold : '#94a3b8' }} />
        <input
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
          className="w-full rounded-xl outline-none transition-all duration-200 bg-white"
          style={{
            fontSize: '14px',
            minHeight: '40px',
            paddingLeft: '38px',
            paddingRight: rightEl ? '38px' : '12px',
            border: `1.5px solid ${error ? '#dc2626' : focused ? B.gold : B.line}`,
            boxShadow: focused ? `0 0 0 3px rgba(191,161,95,0.18)` : '0 1px 2px rgba(0,0,0,0.03)',
            color: B.ink,
          }}
          {...props}
        />
        {rightEl && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10">
            {rightEl}
          </div>
        )}
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }}
          className="text-[11px] mt-0.5 flex items-center gap-1 font-medium" style={{ color: '#dc2626' }} role="alert">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
};

// Compact password requirements checklist
const PasswordStrength = ({ password }) => {
  const rules = [
    { label: '8+ chars', ok: password.length >= 8 },
    { label: 'Upper (A-Z)', ok: /[A-Z]/.test(password) },
    { label: 'Lower (a-z)', ok: /[a-z]/.test(password) },
    { label: 'Number (0-9)', ok: /\d/.test(password) },
    { label: 'Special (@$!%)', ok: /[@$!%*?&]/.test(password) },
  ];
  if (!password) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-1">
      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[10px]">
          {rules.map(r => (
            <span key={r.label} className={`inline-flex items-center gap-1 font-medium transition-colors ${r.ok ? 'text-emerald-700' : 'text-slate-400'}`}>
              {r.ok ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5 stroke-[2]" />}
              <span>{r.label}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Social Sign In button
const SocialSignIn = ({ disabled, mode = 'login', onSuccess, onError }) => {
  const { socialLogin } = useAuth();
  const [pending, setPending] = useState(null);
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();

  const finish = useCallback(async (provider, cred) => {
    setPending(provider);
    const res = await socialLogin(provider, cred);
    setPending(null);

    if (res.success) {
      onSuccess(res.role);
    } else if (res.requiresRegistration) {
      navigate(`/register?prefill_email=${encodeURIComponent(res.email)}&prefill_name=${encodeURIComponent(res.suggestedName || '')}&provider=${encodeURIComponent(res.provider || '')}`);
    } else {
      onError(res.error || 'Google sign-in failed.');
    }
  }, [socialLogin, onSuccess, onError, navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadScript('https://accounts.google.com/gsi/client', 'google-gsi')
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => resp?.credential ? finish('google', resp.credential) : onError('Google auth was cancelled.'),
          auto_select: false, cancel_on_tap_outside: true,
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard', theme: 'outline', size: 'large',
            text: mode === 'register' ? 'signup_with' : 'continue_with',
            shape: 'rectangular', logo_alignment: 'left', width: 320,
          });
        }
      })
      .catch(() => onError('Could not load Google Sign-In SDK.'));
    return () => { cancelled = true; };
  }, [finish, onError, mode]);

  const handleGoogleClick = () => {
    if (disabled || pending) return;
    if (!GOOGLE_CLIENT_ID) { onError('Google sign-in is not configured.'); return; }
    if (window.google?.accounts?.id) {
      setPending('google');
      window.google.accounts.id.prompt((n) => {
        if (n.isNotDisplayed() || n.isSkippedMoment()) {
          const btn = googleBtnRef.current?.querySelector('iframe') || googleBtnRef.current?.querySelector('div[role="button"]');
          if (btn) btn.click(); else setPending(null);
        }
      });
    } else {
      onError('Google Sign-In is initializing. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2.5 my-2.5">
        <div className="flex-1 h-px" style={{ background: B.line }} />
        <span className="text-[10px] font-bold tracking-widest uppercase shrink-0" style={{ color: B.inkSoft }}>
          or {mode === 'register' ? 'sign up with' : 'continue with'}
        </span>
        <div className="flex-1 h-px" style={{ background: B.line }} />
      </div>

      <div className="relative w-full">
        <motion.button
          type="button"
          onClick={handleGoogleClick}
          disabled={disabled || pending !== null}
          whileHover={{ scale: (disabled || pending) ? 1 : 1.01 }}
          whileTap={{ scale: (disabled || pending) ? 1 : 0.985 }}
          className="w-full min-h-[40px] px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border hover:bg-slate-50"
          style={{ background: B.white, borderColor: B.line, color: B.ink, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          {pending === 'google' ? (
            <>
              <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: B.gold }} />
              <span style={{ color: B.inkSoft }}>Connecting…</span>
            </>
          ) : (
            <>
              <GoogleGlyph />
              <span className="truncate">{mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}</span>
            </>
          )}
        </motion.button>
        <div
          ref={googleBtnRef}
          aria-label="Google authentication container"
          className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ opacity: pending !== 'google' ? 0.011 : 0, colorScheme: 'light', pointerEvents: pending !== null ? 'none' : 'auto' }}
        />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN UNIFIED AUTH PORTAL COMPONENT
// Fits directly on desktop screens with zero scrolling & complete landing theme continuity
// ══════════════════════════════════════════════════════════════════════════════
export default function AuthPortal({ initialTab = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, logout, token, user, role } = useAuth();

  // Active tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Common Notification & Rate limit states
  const [rateLimit, setRateLimit] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(() => location.state?.notice || null);
  const [submitting, setSubmitting] = useState(false);

  // ── Login specific states
  const [loginEmail, setLoginEmail] = useState(() => location.state?.email || localStorage.getItem('remember_email') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remember_email'));
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginFieldErrors, setLoginFieldErrors] = useState({});

  // ── Register specific states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPw, setRegConfirmPw] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw] = useState(false);
  const [regFieldErrors, setRegFieldErrors] = useState({});
  const [regSuccessModal, setRegSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Handle URL changes to keep active tab in sync
  useEffect(() => {
    if (location.pathname === '/register') setActiveTab('register');
    else if (location.pathname === '/login') setActiveTab('login');
  }, [location.pathname]);

  // Handle prefilled params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prefillEmail = params.get('prefill_email');
    const prefillName = params.get('prefill_name');
    const provider = params.get('provider');

    if (prefillEmail) {
      setRegEmail(prefillEmail);
      setActiveTab('register');
    }
    if (prefillName) setRegName(prefillName);
    if (provider) {
      setNotice(`We verified your ${provider.toUpperCase()} account. Please choose a password to complete registration.`);
    }

    const err = params.get('error');
    if (err) setError(String(err).slice(0, 200));
  }, [location.search]);

  // Redirect helper
  const redirect = useCallback((userRole) => {
    const r = String(userRole || '').trim().toLowerCase();
    if (r === 'admin') navigate('/admin/dashboard');
    else if (r === 'therapist') navigate('/therapist/dashboard');
    else if (r === 'staff') navigate('/staff/dashboard');
    else if (r === 'client') navigate('/client/dashboard');
    else navigate('/booking/dashboard');
  }, [navigate]);

  // Redirect if already logged in
  useEffect(() => {
    if (token && user && role) redirect(role);
  }, [token, user, role, redirect]);

  // Tab switcher helper
  const handleTabSwitch = (tab) => {
    setError(null);
    setNotice(null);
    setRateLimit(null);
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register', { replace: true });
  };

  // ── Login Submit Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoginFieldErrors({});
    setRateLimit(null);

    const errs = {};
    if (!loginEmail.trim()) errs.email = 'Email address is required.';
    else if (!EMAIL_REGEX.test(loginEmail.trim())) errs.email = 'Please enter a valid email address.';
    if (!loginPassword) errs.password = 'Password is required.';
    else if (loginPassword.length < 8) errs.password = 'Password must be at least 8 characters.';

    if (Object.keys(errs).length > 0) {
      setLoginFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    if (rememberMe) localStorage.setItem('remember_email', loginEmail.trim());
    else localStorage.removeItem('remember_email');

    const res = await login(loginEmail.trim(), loginPassword);
    if (res.success) {
      setLoginPassword('');
      redirect(res.role);
      return;
    }

    setLoginPassword('');
    if (res.rateLimited) setRateLimit(res.retryAfter || 900);
    else if (res.errors) {
      const m = {};
      Object.keys(res.errors).forEach(k => { m[k] = res.errors[k][0]; });
      setLoginFieldErrors(m);
      setError('Please fix the errors below.');
    } else {
      setError(res.error);
    }
    setSubmitting(false);
  };

  // ── Register Submit Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setRegFieldErrors({});
    setRateLimit(null);

    const errs = {};
    if (!regName.trim()) errs.name = 'Full name is required.';
    else if (regName.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    else if (!NAME_REGEX.test(regName.trim())) errs.name = 'Letters, spaces, hyphens, and apostrophes only.';

    if (!regEmail.trim()) errs.email = 'Email address is required.';
    else if (!EMAIL_REGEX.test(regEmail.trim())) errs.email = 'Please enter a valid email address.';

    if (!regPassword) errs.password = 'Password is required.';
    else if (!PASS_REGEX.test(regPassword)) errs.password = 'Must include uppercase, lowercase, number & special character.';

    if (!regConfirmPw) errs.confirmPassword = 'Please confirm your password.';
    else if (regPassword !== regConfirmPw) errs.confirmPassword = 'Passwords do not match.';

    if (Object.keys(errs).length > 0) {
      setRegFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    const res = await register(regName.trim(), regEmail.trim(), regPassword, regConfirmPw);
    setRegPassword('');
    setRegConfirmPw('');

    if (res.success) {
      await logout();
      setRegisteredEmail(regEmail.trim());
      localStorage.setItem('remember_email', regEmail.trim());
      setRegSuccessModal(true);
      setSubmitting(false);
      return;
    }

    if (res.rateLimited) setRateLimit(res.retryAfter || 3600);
    else if (res.errors) {
      const m = {};
      Object.keys(res.errors).forEach(k => { m[k] = res.errors[k][0]; });
      setRegFieldErrors(m);
      setError('Please resolve the errors highlighted below.');
    } else {
      setError(res.error);
    }
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between selection:bg-amber-200 selection:text-amber-900 relative overflow-x-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, #072a1e 0%, ${B.canvas} 75%)`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── AMBIENT LANDING BACKGROUND MOTIFS ── */}
      <FloatingPetals count={14} />

      {/* Decorative radial glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw',
            maxWidth: 600,
            height: '50vw',
            maxHeight: 600,
            left: '-10vw',
            top: '-15vw',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw',
            maxWidth: 600,
            height: '50vw',
            maxHeight: 600,
            right: '-10vw',
            bottom: '-15vw',
            background: 'radial-gradient(circle, rgba(191,161,95,0.1) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── GLASSMORPHIC LANDING-STYLE TOP NAVBAR ── */}
      <header
        className="shrink-0 w-full border-b z-40"
        style={{
          background: 'rgba(4, 16, 10, 0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(191,161,95,0.22)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        }}
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo brand with pulsing gold ring */}
          <Link
            to="/"
            className="flex items-center gap-3 group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa15f]/60"
            title="Return to Cozy Blissful Sanctuary"
          >
            <div className="relative shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1.5px solid rgba(191,161,95,0.55)' }}
                animate={{ scale: [1, 1.22, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.8, repeat: Infinity }}
              />
              <img
                src="/cb-logo.jpg"
                alt="Cozy Blissful Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover relative z-10"
                style={{ border: '2px solid rgba(191,161,95,0.55)', boxShadow: '0 0 0 1px rgba(191,161,95,0.15),0 4px 20px rgba(0,0,0,0.4)' }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#041e16] bg-emerald-400 z-20" />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-black text-white block group-hover:text-amber-200 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                Cozy Blissful
              </span>
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase block" style={{ color: B.gold }}>
                Salon &amp; Spa Sanctuary
              </span>
            </div>
          </Link>

          {/* Back to Home Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer hover:border-[#bfa15f]/40"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#e8cc8a]" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN AUTH CONTAINER (Fits Directly on Computer Without Scrolling) ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 lg:py-2 min-h-0 overflow-y-auto lg:overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[920px] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border my-auto"
          style={{
            background: '#ffffff',
            borderColor: 'rgba(191,161,95,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(191,161,95,0.15)',
          }}
        >
          {/* ─── LEFT BRAND PANEL (Adopted from Landing Page & Image 2) ─── */}
          <div
            className="hidden md:flex flex-col justify-between w-[40%] relative p-6 lg:p-7 xl:p-8 shrink-0 text-white overflow-hidden"
            style={{
              background: `linear-gradient(160deg, ${B.green} 0%, #062b22 50%, ${B.deep} 100%)`,
            }}
          >
            {/* Concentric ripple watermark circles (Image 2 aesthetic) */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 280, height: 280, right: -70, top: -70, border: '1.5px solid rgba(191,161,95,0.18)' }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 380, height: 380, right: -120, top: -120, border: '1px solid rgba(255,255,255,0.06)' }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 180, height: 180, left: -50, bottom: -50, border: '1.5px solid rgba(191,161,95,0.14)' }}
            />

            <div className="relative z-10 space-y-4 lg:space-y-5">
              {/* Badge: Premium Spa & Wellness (as in Image 2) */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(191,161,95,0.12)',
                  border: '1px solid rgba(191,161,95,0.32)',
                  color: '#e8cc8a',
                }}
              >
                <Sparkles className="w-3 h-3 text-[#fde68a]" />
                <span>PREMIUM SPA &amp; WELLNESS</span>
              </div>

              {/* Dynamic headline based on active tab */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl lg:text-[28px] font-black leading-tight tracking-tight mb-2 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {activeTab === 'login' ? 'Welcome back to your calm.' : 'Begin your wellness journey.'}
                  </h2>
                  <p className="text-xs text-emerald-100/75 leading-relaxed">
                    {activeTab === 'login'
                      ? 'Sign in to access your appointment roster, book luxury therapies, and manage reservations.'
                      : 'Create your free guest account in seconds to schedule licensed therapist treatments and track visits.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Trust Points (Image 2) */}
              <ul className="space-y-3 pt-1">
                {(activeTab === 'login' ? TRUST_POINTS_LOGIN : TRUST_POINTS_REGISTER).map((t) => (
                  <li key={t.title} className="flex items-start gap-2.5">
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-xl shrink-0 mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      <t.icon className="w-3.5 h-3.5 text-[#e8cc8a]" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-white mb-0.5">{t.title}</span>
                      <span className="block text-[11px] text-emerald-100/65 leading-relaxed">{t.note}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Panel footer */}
            <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/10 text-[10px] text-white/50">
              <p>© {new Date().getFullYear()} Cozy Blissful</p>
              <div className="flex gap-1.5">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex items-center justify-center w-5 h-5 rounded-md transition-colors hover:bg-white/20 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <s.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT FORM PANEL (Seamless Tabbed Portal - Direct View) ─── */}
          <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 lg:px-9 py-4 sm:py-5 lg:py-6 bg-white text-slate-800">
            <div className="w-full max-w-[420px] mx-auto">

              {/* ── SLIDING TAB SWITCHER (Zero Page Jump!) ── */}
              <div
                className="relative p-1 rounded-2xl mb-3 sm:mb-4 flex items-center bg-slate-100 border border-slate-200"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'login'}
                  onClick={() => handleTabSwitch('login')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all relative flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px] ${
                    activeTab === 'login' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="active-auth-tab"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5 text-[#8c7033]" /> Sign In
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'register'}
                  onClick={() => handleTabSwitch('register')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all relative flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px] ${
                    activeTab === 'register' ? 'text-slate-950' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {activeTab === 'register' && (
                    <motion.div
                      layoutId="active-auth-tab"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-[#8c7033]" /> Create Account
                  </span>
                </button>
              </div>

              {/* Notice & Rate Limit alerts */}
              <AnimatePresence mode="wait">
                {rateLimit !== null && (
                  <motion.div key="rl" className="mb-2.5" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <RateLimitBanner retryAfter={rateLimit} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {notice && !error && (
                  <motion.div
                    key="note"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 p-2.5 rounded-xl text-xs mb-2.5"
                    style={{ background: 'rgba(191,161,95,0.1)', border: '1px solid rgba(191,161,95,0.35)', color: '#8c7033' }}
                  >
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#bfa15f]" />
                    <span className="font-semibold">{notice}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {error && !rateLimit && (
                  <motion.div
                    key="err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="flex items-start gap-2 p-2.5 rounded-xl text-xs mb-2.5 bg-red-50 border border-red-200 text-red-700"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-600" />
                    <span className="font-semibold">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── FORMS (Fluid Tab Content) ── */}
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  /* ── TAB 1: LOGIN FORM ── */
                  <motion.div
                    key="form-login"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="mb-3">
                      <h1 className="text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Sign In to Your Account
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">Enter your email and password to proceed</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} noValidate className="space-y-3">
                      <Input
                        label="Email Address"
                        id="login-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        icon={Mail}
                        value={loginEmail}
                        placeholder="admin@example.com"
                        error={loginFieldErrors.email}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (loginFieldErrors.email) setLoginFieldErrors(p => ({ ...p, email: '' }));
                        }}
                      />

                      <Input
                        label="Password"
                        id="login-password"
                        name="password"
                        type={showLoginPw ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        maxLength={128}
                        icon={Lock}
                        value={loginPassword}
                        placeholder="Enter your password"
                        error={loginFieldErrors.password}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (loginFieldErrors.password) setLoginFieldErrors(p => ({ ...p, password: '' }));
                        }}
                        rightEl={
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowLoginPw(v => !v)}
                            aria-label={showLoginPw ? 'Hide password' : 'Show password'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />

                      {/* Remember & Forgot */}
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <label htmlFor="remember-me" className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-[#bfa15f]"
                          />
                          <span className="font-medium text-slate-600">Remember me</span>
                        </label>
                        <Link
                          to="/forgot-password"
                          className="font-bold hover:underline underline-offset-2 transition-colors text-[#bfa15f] hover:text-[#8c7033]"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      {/* Submit Button: Label is 'Sign In' (as requested) + Gold Glow Hover */}
                      <motion.button
                        type="submit"
                        disabled={submitting || rateLimit > 0}
                        whileHover={{ scale: submitting ? 1 : 1.01 }}
                        whileTap={{ scale: submitting ? 1 : 0.985 }}
                        className="w-full min-h-[42px] flex justify-center items-center gap-2 rounded-xl font-black text-sm text-[#041e16] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-md hover:brightness-110 hover:shadow-[0_6px_22px_rgba(191,161,95,0.55)] active:scale-[0.985]"
                        style={{
                          background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)',
                          boxShadow: '0 4px 16px rgba(191,161,95,0.4)',
                        }}
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" />
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            <span>Sign In</span>
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Social OAuth */}
                    <SocialSignIn
                      disabled={submitting}
                      mode="login"
                      onSuccess={redirect}
                      onError={(msg) => { setRateLimit(null); setNotice(null); setError(msg); }}
                    />
                  </motion.div>
                ) : (
                  /* ── TAB 2: REGISTER FORM (Compact & Fits on Screen) ── */
                  <motion.div
                    key="form-register"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="mb-2.5">
                      <h1 className="text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Create Your Sanctuary Account
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">Experience personalized bookings &amp; exclusive treatments</p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} noValidate className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          label="Full Name"
                          id="reg-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          maxLength={100}
                          icon={User}
                          value={regName}
                          placeholder="e.g. Maria Santos"
                          error={regFieldErrors.name}
                          onChange={(e) => {
                            setRegName(e.target.value);
                            if (regFieldErrors.name) setRegFieldErrors(p => ({ ...p, name: '' }));
                          }}
                        />

                        <Input
                          label="Email Address"
                          id="reg-email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          icon={Mail}
                          value={regEmail}
                          placeholder="you@example.com"
                          error={regFieldErrors.email}
                          onChange={(e) => {
                            setRegEmail(e.target.value);
                            if (regFieldErrors.email) setRegFieldErrors(p => ({ ...p, email: '' }));
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          label="Password"
                          id="reg-password"
                          name="password"
                          type={showRegPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          maxLength={128}
                          icon={Lock}
                          value={regPassword}
                          placeholder="8+ characters"
                          error={regFieldErrors.password}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (regFieldErrors.password) setRegFieldErrors(p => ({ ...p, password: '' }));
                          }}
                          rightEl={
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowRegPw(v => !v)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              {showRegPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          }
                        />

                        <Input
                          label="Confirm Password"
                          id="reg-confirm-password"
                          name="confirm_password"
                          type={showRegConfirmPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          maxLength={128}
                          icon={Lock}
                          value={regConfirmPw}
                          placeholder="Re-enter password"
                          error={regFieldErrors.confirmPassword}
                          onChange={(e) => {
                            setRegConfirmPw(e.target.value);
                            if (regFieldErrors.confirmPassword) setRegFieldErrors(p => ({ ...p, confirmPassword: '' }));
                          }}
                          rightEl={
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowRegConfirmPw(v => !v)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              {showRegConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          }
                        />
                      </div>

                      <PasswordStrength password={regPassword} />

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={submitting || rateLimit > 0}
                        whileHover={{ scale: submitting ? 1 : 1.01 }}
                        whileTap={{ scale: submitting ? 1 : 0.985 }}
                        className="w-full min-h-[42px] flex justify-center items-center gap-2 rounded-xl font-black text-sm text-[#041e16] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-md hover:brightness-110 hover:shadow-[0_6px_22px_rgba(191,161,95,0.55)] active:scale-[0.985]"
                        style={{
                          background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)',
                          boxShadow: '0 4px 16px rgba(191,161,95,0.4)',
                        }}
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Create Account</span>
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Social OAuth */}
                    <SocialSignIn
                      disabled={submitting}
                      mode="register"
                      onSuccess={redirect}
                      onError={(msg) => { setRateLimit(null); setNotice(null); setError(msg); }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </motion.div>
      </main>

      {/* ── FOOTER BAR (Sleek & Unobtrusive) ── */}
      <footer className="shrink-0 py-2.5 px-4 text-center text-[11px] text-white/40 border-t border-white/5 z-10">
        <p>© {new Date().getFullYear()} Cozy Blissful Salon &amp; Spa • Luxury Specialist Sanctuary</p>
      </footer>

      {/* ── SUCCESS REGISTRATION MODAL ── */}
      <AnimatePresence>
        {regSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Account Created!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Welcome to Cozy Blissful! Your account for <strong className="text-slate-800">{registeredEmail}</strong> is ready.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRegSuccessModal(false);
                  handleTabSwitch('login');
                  setNotice('Account ready! Please sign in with your password.');
                  setLoginEmail(registeredEmail);
                }}
                className="w-full py-3 rounded-xl font-black text-sm text-[#041e16] shadow-md cursor-pointer transition-transform hover:scale-[1.02] hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
              >
                Sign In Now
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
