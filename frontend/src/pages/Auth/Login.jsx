import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle, Clock, Mail, Lock, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Brand palette ────────────────────────────────────────────────────────────
const BRAND = {
  deep: '#041e16',
  green: '#0a3d30',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
  ink: '#1d2a25',
  inkSoft: '#5b6b64',
  line: '#e4e2da',
  field: '#f6f5f1',
};

// ─── Social links (update hrefs when ready) ───────────────────────────────────
const SOCIALS = [
  { label: 'Facebook',  href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { label: 'Instagram', href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { label: 'TikTok',    href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  { label: 'YouTube',   href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { label: 'WhatsApp',  href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> },
];

const STATS = [
  { value: '2,500+', label: 'Clients' },
  { value: '4.9★',   label: 'Rating' },
  { value: '30+',    label: 'Therapists' },
  { value: '7 Days', label: 'Available' },
];

const SERVICES = [
  { icon: '💆', name: 'Massage Therapy', note: 'From ₱749' },
  { icon: '💅', name: 'Nail Care',       note: 'From ₱299' },
  { icon: '✨', name: 'Beauty & Wellness', note: 'Ask for price' },
];

// ─── Social sign-in (OAuth 2.0) ───────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

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
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const FacebookGlyph = () => (
  <svg viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SocialTile = ({ label, onClick, disabled, pending, children }) => (
  <motion.button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
    whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -1 }} whileTap={{ scale: disabled ? 1 : 0.95 }}
    className="w-[68px] h-11 rounded-lg flex items-center justify-center bg-white disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ border: `1px solid ${BRAND.line}`, boxShadow: '0 1px 3px rgba(4,30,22,0.06)' }}>
    {pending
      ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(4,30,22,0.15)', borderTopColor: BRAND.deep }} />
      : children}
  </motion.button>
);

const SocialSignIn = ({ onSuccess, onError, disabled }) => {
  const { socialLogin } = useAuth();
  const [pending, setPending] = useState(null); // 'google' | 'facebook' | null
  const [googleReady, setGoogleReady] = useState(false);
  const [fbReady, setFbReady] = useState(false);
  const googleBtnRef = useRef(null);
  const busy = useRef(false);

  const finish = useCallback(async (provider, providerToken) => {
    if (busy.current) return;
    busy.current = true;
    setPending(provider);
    const res = await socialLogin(provider, providerToken);
    busy.current = false;
    setPending(null);
    if (res.success) onSuccess(res.role);
    else onError(res.error);
  }, [socialLogin, onSuccess, onError]);

  // Google Identity Services — official script; the credential response
  // carries a JWT ID token that is only trusted after backend verification.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadScript('https://accounts.google.com/gsi/client', 'google-gsi')
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !googleBtnRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => { if (resp?.credential) finish('google', resp.credential); },
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'icon', theme: 'outline', size: 'large', shape: 'rectangular',
        });
        setGoogleReady(true);
      })
      .catch(() => onError('Could not load Google Sign-In. Check your connection and try again.'));
    return () => { cancelled = true; };
  }, [finish, onError]);

  // Meta JavaScript SDK — initialized with the app ID from env config only.
  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;
    let cancelled = false;
    loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk')
      .then(() => {
        if (cancelled || !window.FB) return;
        window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v21.0' });
        setFbReady(true);
      })
      .catch(() => onError('Could not load Facebook Login. Check your connection and try again.'));
    return () => { cancelled = true; };
  }, [onError]);

  const handleFacebook = () => {
    if (!fbReady || pending || disabled) return;
    window.FB.login((resp) => {
      const accessToken = resp?.authResponse?.accessToken;
      if (resp.status === 'connected' && accessToken) finish('facebook', accessToken);
    }, { scope: 'public_profile,email' });
  };

  if (!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID) return null;

  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: BRAND.line }} />
        <span className="text-[11px]" style={{ color: BRAND.inkSoft }}>or</span>
        <div className="flex-1 h-px" style={{ background: BRAND.line }} />
      </div>

      <div className="flex items-center justify-center gap-3"
        style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        {GOOGLE_CLIENT_ID && (
          <div className="relative w-[68px] h-11">
            {/* Official Google-rendered icon button (brand compliant), stretched over the tile */}
            <div className="absolute inset-0 rounded-lg bg-white flex items-center justify-center pointer-events-none"
              style={{ border: `1px solid ${BRAND.line}`, boxShadow: '0 1px 3px rgba(4,30,22,0.06)' }}>
              {pending === 'google'
                ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(4,30,22,0.15)', borderTopColor: BRAND.deep }} />
                : <GoogleGlyph />}
            </div>
            <div ref={googleBtnRef} aria-label="Sign in with Google" title="Sign in with Google"
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ opacity: googleReady && pending !== 'google' ? 0.011 : 0, colorScheme: 'light' }} />
          </div>
        )}

        {FACEBOOK_APP_ID && (
          <SocialTile label="Sign in with Facebook" onClick={handleFacebook}
            disabled={!fbReady || pending !== null} pending={pending === 'facebook'}>
            <FacebookGlyph />
          </SocialTile>
        )}
      </div>
    </div>
  );
};

// ─── Floating orb ─────────────────────────────────────────────────────────────
const FloatingOrb = ({ style, delay = 0, duration = 9 }) => (
  <motion.div className="absolute rounded-full pointer-events-none" style={style}
    animate={{ y: [0, -14, 0], x: [0, 6, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }} />
);

// ─── Dot grid (decorative) ────────────────────────────────────────────────────
const DotGrid = ({ rows = 4, cols = 9, className = '', style = {} }) => (
  <div className={`grid gap-2 pointer-events-none ${className}`}
    style={{ gridTemplateColumns: `repeat(${cols}, 4px)`, ...style }}>
    {Array.from({ length: rows * cols }).map((_, i) => (
      <span key={i} className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.35)' }} />
    ))}
  </div>
);

// ─── Rate limit banner ────────────────────────────────────────────────────────
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
      className="flex items-start gap-2 p-2.5 rounded-lg text-[11px]"
      style={{ background: 'rgba(191,161,95,0.1)', border: '1px solid rgba(191,161,95,0.35)' }}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#8a6d2f' }} />
      <span style={{ color: '#7a6128' }}>
        <strong>Too many attempts.</strong>{' '}
        {s > 0 ? `Retry in ${m > 0 ? `${m}m ` : ''}${sec}s.` : 'You may try again.'}
      </span>
    </motion.div>
  );
};

// ─── Labeled input with leading icon ──────────────────────────────────────────
const Input = ({ label, id, icon: Icon, error, rightEl, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5" style={{ color: BRAND.ink }}>{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: error ? '#dc2626' : BRAND.gold }} />
        <input id={id} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full text-sm rounded-lg outline-none transition-all duration-150 bg-white"
          style={{
            border: error ? '1px solid rgba(220,38,38,0.55)' : focused ? `1px solid ${BRAND.gold}` : `1px solid ${BRAND.line}`,
            color: BRAND.ink, padding: rightEl ? '0.65rem 2.6rem 0.65rem 2.5rem' : '0.65rem 0.9rem 0.65rem 2.5rem',
            boxShadow: focused && !error ? '0 0 0 3px rgba(191,161,95,0.12)' : '0 1px 2px rgba(4,30,22,0.04)',
            caretColor: BRAND.gold,
          }} {...props} />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-1 text-[11px] flex items-center gap-1" style={{ color: '#dc2626' }}>
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('remember_email') || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('remember_email'));
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const redirect = useCallback((role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'therapist') navigate('/therapist/dashboard');
    else if (role === 'staff') navigate('/staff/dashboard');
    else navigate('/booking/dashboard');
  }, [navigate]);

  const validate = () => {
    const e = {};
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email.trim()) e.email = 'Email is required.';
    else if (!re.test(email.trim())) e.email = 'Enter a valid email.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'At least 8 characters.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const persistRemember = () => {
    if (remember) localStorage.setItem('remember_email', email.trim());
    else localStorage.removeItem('remember_email');
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null); setNotice(null); setFieldErrors({}); setRateLimit(null);
    if (!validate()) return;
    setSubmitting(true);
    persistRemember();
    const res = await login(email.trim(), password);
    if (res.success) { redirect(res.role); return; }
    if (res.rateLimited) setRateLimit(res.retryAfter || 900);
    else if (res.errors) {
      const m = {}; Object.keys(res.errors).forEach(k => { m[k] = res.errors[k][0]; });
      setFieldErrors(m); setError('Please fix the errors below.');
    } else setError(res.error);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden select-none px-4 py-8"
      style={{ fontFamily: "'Inter', sans-serif", background: '#efeee9' }}>

      {/* ═══ Background brand shapes (like reference) ═══ */}
      <div className="absolute left-0 top-0 h-full w-[42%] hidden md:block"
        style={{ background: `linear-gradient(160deg, ${BRAND.deep} 0%, ${BRAND.green} 100%)` }} />
      <div className="absolute rounded-full" style={{ width: 340, height: 340, right: -120, top: -140, background: BRAND.green, opacity: 0.92 }} />
      <div className="absolute rounded-full" style={{ width: 300, height: 300, right: -60, bottom: -150, border: `26px solid ${BRAND.green}`, opacity: 0.9 }} />
      <div className="absolute rounded-full" style={{ width: 120, height: 120, right: '14%', bottom: '6%', background: BRAND.gold, opacity: 0.25 }} />

      {/* ═══ Card ═══ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[980px] rounded-2xl overflow-hidden flex"
        style={{ boxShadow: '0 24px 70px rgba(4,30,22,0.28)' }}>

        {/* ─── Left brand panel ─── */}
        <div className="hidden md:flex flex-col justify-center w-[46%] relative px-9 py-10"
          style={{ background: `linear-gradient(150deg, ${BRAND.green} 0%, ${BRAND.deep} 90%)` }}>

          {/* Decorative shapes */}
          <div className="absolute rounded-full" style={{ width: 130, height: 130, left: 36, top: -46, border: '5px solid rgba(255,255,255,0.9)' }} />
          <div className="absolute rounded-full bg-white" style={{ width: 94, height: 94, left: 54, top: -28 }} />
          <div className="absolute rounded-full" style={{ width: 190, height: 190, right: -60, bottom: -70, border: '6px solid rgba(255,255,255,0.9)' }} />
          <div className="absolute rounded-full bg-white" style={{ width: 130, height: 130, right: -30, bottom: -40 }} />
          <FloatingOrb style={{ width: 22, height: 22, left: 40, bottom: 130, background: `radial-gradient(circle at 30% 30%, ${BRAND.goldLight}, ${BRAND.gold})` }} duration={7} />
          <FloatingOrb style={{ width: 14, height: 14, right: 70, top: 110, background: `radial-gradient(circle at 30% 30%, ${BRAND.goldLight}, ${BRAND.gold})` }} delay={2} duration={9} />
          <DotGrid rows={4} cols={9} className="absolute left-9 top-14" />
          <DotGrid rows={3} cols={6} className="absolute left-9 bottom-10" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-4"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(191,161,95,0.35)', color: BRAND.goldLight }}>
              <Sparkles className="w-3 h-3" />
              <span>Premium Home Service Spa &amp; Wellness</span>
            </div>

            <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">
              Relax. Recharge.
            </h2>
            <h3 className="text-2xl font-bold tracking-tight mb-3"
              style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: `linear-gradient(135deg, ${BRAND.goldLight} 0%, ${BRAND.gold} 60%, #d4b87a 100%)`, backgroundClip: 'text' }}>
              Spa-Quality At Your Door.
            </h3>
            <p className="text-xs leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '20rem' }}>
              Massage therapy &amp; nail care delivered to your home. 7 days a week, 6 AM – 11 PM.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {STATS.map(s => (
                <div key={s.label} className="rounded-lg px-1.5 py-2 text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[13px] font-black leading-none mb-0.5" style={{ color: BRAND.goldLight }}>{s.value}</p>
                  <p className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Services */}
            <div className="flex flex-col gap-1.5 mb-6">
              {SERVICES.map(s => (
                <div key={s.name} className="flex items-center justify-between rounded-lg px-3 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>{s.name}</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(191,161,95,0.16)', color: BRAND.goldLight }}>{s.note}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                  <s.icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right form panel ─── */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10" style={{ background: '#fbfaf7' }}>
          <div className="w-full max-w-[340px]">

            {/* Logo + heading */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3"
                style={{ boxShadow: '0 6px 20px rgba(4,30,22,0.12)', border: `1px solid ${BRAND.line}` }}>
                <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-10 h-10 rounded-xl object-cover" />
              </div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: BRAND.ink }}>Welcome Back !</h1>
              <p className="text-[11px] mt-0.5" style={{ color: BRAND.inkSoft }}>Sign in to your Cozy Blissful account</p>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {rateLimit !== null && <motion.div key="rl" className="mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RateLimitBanner retryAfter={rateLimit} /></motion.div>}
            </AnimatePresence>
            <AnimatePresence>
              {error && !rateLimit && (
                <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2 p-2.5 rounded-lg text-[11px] mb-3"
                  style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.22)' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#dc2626' }} />
                  <span style={{ color: '#b91c1c' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {notice && (
                <motion.div key="note" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2 p-2.5 rounded-lg text-[11px] mb-3"
                  style={{ background: 'rgba(191,161,95,0.1)', border: '1px solid rgba(191,161,95,0.3)' }}>
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#8a6d2f' }} />
                  <span style={{ color: '#7a6128' }}>{notice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              <Input label="Email" id="login-email" type="email" autoComplete="email" required icon={Mail}
                value={email} placeholder="Enter your email address" error={fieldErrors.email}
                onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: '' })); }} />

              <Input label="Password" id="login-password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required icon={Lock}
                value={password} placeholder="••••••••" error={fieldErrors.password}
                onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' })); }}
                rightEl={
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="transition-colors" style={{ color: 'rgba(29,42,37,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(29,42,37,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(29,42,37,0.35)'}>
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                } />

              {/* Remember me + reset */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium" style={{ color: BRAND.ink }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded cursor-pointer" style={{ accentColor: BRAND.gold }} />
                  Remember me
                </label>
                <button type="button"
                  className="text-[11px] font-bold hover:underline underline-offset-2"
                  style={{ color: '#c0392b' }}
                  onClick={() => { setError(null); setNotice('Password reset is handled by our team for now — message us on Facebook or WhatsApp and we\'ll help you right away.'); }}>
                  Reset Password!
                </button>
              </div>

              <motion.button type="submit" id="login-submit" disabled={submitting || rateLimit > 0}
                whileHover={{ scale: submitting ? 1 : 1.015 }} whileTap={{ scale: submitting ? 1 : 0.975 }}
                className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#c9a851,#e8cc8a)', color: BRAND.deep, boxShadow: '0 6px 18px rgba(191,161,95,0.35)', letterSpacing: '0.015em' }}>
                {submitting
                  ? <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(4,30,22,0.2)', borderTopColor: BRAND.deep }} />
                  : <><LogIn className="w-3.5 h-3.5" /><span>Login</span></>}
              </motion.button>
            </form>

            {/* Social quick login */}
            <SocialSignIn
              disabled={submitting}
              onSuccess={redirect}
              onError={(msg) => { setRateLimit(null); setNotice(null); setError(msg); }}
            />

            <p className="text-center text-[11px] mt-5" style={{ color: BRAND.inkSoft }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-bold hover:underline underline-offset-2" style={{ color: '#c0392b' }}>
                Create Account
              </Link>
            </p>
            <div className="mt-2 text-center">
              <Link to="/" className="inline-flex items-center gap-1 text-[11px] transition-colors"
                style={{ color: 'rgba(29,42,37,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(29,42,37,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(29,42,37,0.35)'}>
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
