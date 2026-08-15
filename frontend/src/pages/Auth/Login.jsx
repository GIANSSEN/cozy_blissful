import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle, Clock, Mail, Lock, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Brand palette ─────────────────────────────────────────────────────────────
const B = {
  deep:      '#041e16',
  green:     '#0a3d30',
  mid:       '#0f5c47',
  gold:      '#bfa15f',
  goldLight: '#e8cc8a',
  ink:       '#1a2332',
  inkSoft:   '#64748b',
  line:      '#e2e8f0',
  white:     '#ffffff',
};

// ─── Social links ─────────────────────────────────────────────────────────────
const SOCIALS = [
  { label: 'Facebook',  href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { label: 'Instagram', href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { label: 'TikTok',    href: '#', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
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
  { icon: '💅', name: 'Nail Care', note: 'From ₱299' },
  { icon: '✨', name: 'Beauty & Wellness', note: 'Ask for price' },
];

// ─── OAuth config ─────────────────────────────────────────────────────────────
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
  <svg viewBox="0 0 48 48" className="w-4.5 h-4.5 shrink-0" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const Particle = ({ style, delay = 0, duration = 9 }) => (
  <motion.div className="absolute rounded-full pointer-events-none" style={style}
    animate={{ y: [0, -18, 0], x: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }} />
);

const DotGrid = ({ rows = 4, cols = 8, className = '' }) => (
  <div className={`grid gap-[7px] pointer-events-none ${className}`}
    style={{ gridTemplateColumns: `repeat(${cols}, 4px)` }}>
    {Array.from({ length: rows * cols }).map((_, i) => (
      <span key={i} className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.22)' }} />
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
      className="flex items-start gap-2 p-3 rounded-xl text-xs"
      style={{ background: 'rgba(191,161,95,0.08)', border: '1px solid rgba(191,161,95,0.3)' }}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#a89658' }} />
      <span style={{ color: '#8b7a45' }}>
        <strong>Too many attempts.</strong>{' '}
        {s > 0 ? `Retry in ${m > 0 ? `${m}m ` : ''}${sec}s.` : 'You may try again.'}
      </span>
    </motion.div>
  );
};

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
        <input id={id}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
          className="w-full rounded-xl outline-none transition-all duration-200 bg-white"
          style={{
            fontSize: '16px',
            background: '#ffffff',
            backgroundColor: '#ffffff',
            border: error ? '1.5px solid rgba(220,38,38,0.55)' : focused ? `1.5px solid ${B.gold}` : `1.5px solid ${B.line}`,
            color: B.ink,
            padding: rightEl ? '0.6rem 2.6rem 0.6rem 2.6rem' : '0.6rem 0.9rem 0.6rem 2.6rem',
            boxShadow: focused && !error ? `0 0 0 4px rgba(191,161,95,0.1)` : error ? `0 0 0 4px rgba(220,38,38,0.06)` : 'none',
            caretColor: B.gold,
            touchAction: 'manipulation',
          }} {...props} />
        {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center z-10">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-1 text-[11px] flex items-center gap-1 font-medium" style={{ color: '#dc2626' }}>
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

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
            text: 'continue_with', shape: 'rectangular', logo_alignment: 'left', width: 320,
          });
        }
        setGoogleReady(true);
      })
      .catch(() => onError('Could not load Google Sign-In SDK.'));
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
    } else {
      onError('Google Sign-In is initializing. Please try again.');
    }
  };

  const btnBase = "w-full h-10 sm:h-11 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs sm:text-[13px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border";

  return (
    <div className="w-full mt-0.5">
      <div className="flex items-center gap-2 sm:gap-3 my-2.5 sm:my-3">
        <div className="flex-1 h-px" style={{ background: B.line }} />
        <span className="text-[10px] font-bold tracking-widest uppercase shrink-0" style={{ color: B.inkSoft }}>or continue with</span>
        <div className="flex-1 h-px" style={{ background: B.line }} />
      </div>

      <div className="relative w-full">
        <motion.button type="button" onClick={handleGoogleClick} disabled={disabled || pending !== null}
          whileHover={{ scale: (disabled || pending) ? 1 : 1.01 }} whileTap={{ scale: (disabled || pending) ? 1 : 0.985 }}
          className={btnBase}
          style={{ background: B.white, borderColor: B.line, color: B.ink, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {pending === 'google'
            ? <><div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: B.gold }} /><span style={{ color: B.inkSoft }}>Connecting…</span></>
            : <><GoogleGlyph /><span className="truncate">Continue with Google</span></>}
        </motion.button>
        <div ref={googleBtnRef} aria-label="Continue with Google"
          className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ opacity: googleReady && pending !== 'google' ? 0.011 : 0, colorScheme: 'light', pointerEvents: pending !== null ? 'none' : 'auto' }} />
      </div>
    </div>
  );
};

const Login = () => {
  const location  = useLocation();
  const [email, setEmail]     = useState(() => location.state?.email || localStorage.getItem('remember_email') || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('remember_email'));
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState(null);
  const [notice, setNotice]   = useState(() => location.state?.notice || null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [rateLimit, setRateLimit]     = useState(null);

  const { login, token, user, role } = useAuth();
  const navigate = useNavigate();

  const redirect = useCallback((userRole) => {
    if (userRole === 'admin')          navigate('/admin/dashboard');
    else if (userRole === 'therapist') navigate('/therapist/dashboard');
    else if (userRole === 'staff')     navigate('/staff/dashboard');
    else if (userRole === 'client')    navigate('/client/dashboard');
    else navigate('/booking/dashboard');
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('error'), tkn = params.get('token'), r = params.get('role');
    if (err) { setError(decodeURIComponent(err)); }
    else if (tkn && r) { localStorage.setItem('token', tkn); localStorage.setItem('role', r); redirect(r); }
    else if (token && user && role) { redirect(role); }
  }, [location.search, token, user, role, redirect]);

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email address is required.';
    else if (!emailRegex.test(email.trim())) e.email = 'Please enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null); setNotice(null); setFieldErrors({}); setRateLimit(null);
    if (!validate()) return;
    setSubmitting(true);
    if (remember) localStorage.setItem('remember_email', email.trim());
    else localStorage.removeItem('remember_email');
    const res = await login(email.trim(), password);
    if (res.success) { redirect(res.role); return; }
    if (res.rateLimited) setRateLimit(res.retryAfter || 900);
    else if (res.errors) {
      const m = {};
      Object.keys(res.errors).forEach(k => { m[k] = res.errors[k][0]; });
      setFieldErrors(m); setError('Please fix the errors below.');
    } else setError(res.error);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-x-hidden px-3 sm:px-6 py-3 sm:py-6"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'linear-gradient(135deg,#f0f4f8 0%,#e8edf3 100%)' }}>

      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: '50vw', maxWidth: 600, height: '50vw', maxHeight: 600, left: '-15vw', top: '-15vw', background: `radial-gradient(circle, rgba(10,61,48,0.12) 0%, transparent 70%)` }} />
        <div className="absolute rounded-full" style={{ width: '45vw', maxWidth: 500, height: '45vw', maxHeight: 500, right: '-12vw', bottom: '-12vw', background: `radial-gradient(circle, rgba(191,161,95,0.1) 0%, transparent 70%)` }} />
      </div>

      {/* Main card */}
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[940px] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col md:flex-row my-auto shadow-2xl max-h-[96vh]"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 4px 20px rgba(0,0,0,0.06)' }}>

        {/* ─── Left brand panel (Desktop/Tablet landscape) ─── */}
        <div className="hidden md:flex flex-col justify-between w-[44%] relative px-7 py-7 overflow-y-auto no-scrollbar flex-shrink-0"
          style={{ background: `linear-gradient(155deg, ${B.mid} 0%, ${B.green} 45%, ${B.deep} 100%)` }}>

          {/* Decorative elements */}
          <div className="absolute rounded-full" style={{ width: 220, height: 220, right: -80, top: -80, border: '40px solid rgba(255,255,255,0.05)' }} />
          <div className="absolute rounded-full" style={{ width: 160, height: 160, left: -50, bottom: -50, background: 'rgba(191,161,95,0.12)', border: '1px solid rgba(191,161,95,0.2)' }} />
          <Particle style={{ width: 18, height: 18, left: 30, top: '35%', background: 'rgba(255,255,255,0.2)' }} delay={0} duration={7} />
          <Particle style={{ width: 10, height: 10, right: 50, top: '25%', background: 'rgba(191,161,95,0.5)' }} delay={2} duration={9} />
          <Particle style={{ width: 14, height: 14, right: 30, bottom: '30%', background: 'rgba(255,255,255,0.15)' }} delay={1.5} duration={8} />
          <DotGrid rows={5} cols={8} className="absolute right-8 top-16 opacity-60" />
          <DotGrid rows={3} cols={5} className="absolute left-8 bottom-16 opacity-40" />

          {/* Top section */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold mb-3"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>
              <Sparkles className="w-3 h-3" style={{ color: B.goldLight }} />
              <span>Premium Home Service Spa & Wellness</span>
            </div>
            <h2 className="text-[1.75rem] font-black text-white leading-tight tracking-tight mb-0.5">Relax. Recharge.</h2>
            <h3 className="text-lg font-bold mb-2" style={{ color: B.goldLight }}>Spa-Quality At Your Door.</h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '18rem' }}>
              Massage therapy & nail care delivered to your home — 7 days a week, 6 AM – 11 PM.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {STATS.map(s => (
                <div key={s.label} className="rounded-xl px-1 py-2 text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-xs font-black leading-none mb-0.5" style={{ color: B.goldLight }}>{s.value}</p>
                  <p className="text-[8.5px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Services */}
            <div className="flex flex-col gap-1.5 mb-4">
              {SERVICES.map(s => (
                <div key={s.name} className="flex items-center justify-between rounded-xl px-3 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>{s.name}</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(191,161,95,0.2)', color: B.goldLight }}>{s.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom section — social */}
          <div className="relative z-10 pt-2">
            <div className="flex gap-2">
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
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 md:px-10 py-5 sm:py-6 overflow-y-auto no-scrollbar" style={{ background: B.white }}>
          <div className="w-full max-w-[360px] sm:max-w-[380px] mx-auto">

            {/* Logo + heading */}
            <div className="flex flex-col items-center mb-3 sm:mb-4 text-center">
              <motion.div className="relative mb-2 sm:mb-3"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center"
                  style={{ boxShadow: `0 8px 24px rgba(191,161,95,0.2), 0 2px 8px rgba(0,0,0,0.08)`, background: B.white, border: `1.5px solid ${B.line}` }}>
                  <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl object-cover" />
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: '#22c55e' }} />
              </motion.div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight mb-0.5" style={{ color: B.ink }}>Welcome Back!</h1>
              <p className="text-xs" style={{ color: B.inkSoft }}>Sign in to your Cozy Blissful account</p>
            </div>

            {/* Alert banners */}
            <AnimatePresence mode="wait">
              {rateLimit !== null && (
                <motion.div key="rl" className="mb-3 sm:mb-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <RateLimitBanner retryAfter={rateLimit} />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {error && !rateLimit && (
                <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl text-xs mb-3 sm:mb-4"
                  style={{ background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.2)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" style={{ color: '#dc2626' }} />
                  <span style={{ color: '#b91c1c', fontWeight: 500 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {notice && (
                <motion.div key="note" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl text-xs mb-3 sm:mb-4"
                  style={{ background: 'rgba(191,161,95,0.08)', border: '1.5px solid rgba(191,161,95,0.28)' }}>
                  <Info className="w-4 h-4 flex-shrink-0 mt-px" style={{ color: '#a89658' }} />
                  <span style={{ color: '#8b7a45', fontWeight: 500 }}>{notice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3 sm:space-y-4">
              <Input label="Email Address" id="login-email" type="email" autoComplete="email" required icon={Mail}
                value={email} placeholder="you@example.com" error={fieldErrors.email}
                onBlur={() => {
                  if (!email.trim()) setFieldErrors(p => ({ ...p, email: 'Email address is required.' }));
                  else if (!emailRegex.test(email.trim())) setFieldErrors(p => ({ ...p, email: 'Please enter a valid email address.' }));
                }}
                onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: '' })); }} />

              <Input label="Password" id="login-password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required icon={Lock}
                value={password} placeholder="Enter your password" error={fieldErrors.password}
                onBlur={() => {
                  if (!password) setFieldErrors(p => ({ ...p, password: 'Password is required.' }));
                  else if (password.length < 8) setFieldErrors(p => ({ ...p, password: 'Password must be at least 8 characters.' }));
                }}
                onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' })); }}
                rightEl={
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="transition-colors p-1 rounded cursor-pointer"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => e.currentTarget.style.color = B.ink}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                } />

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-xs py-0.5">
                <label className="inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded cursor-pointer shrink-0" style={{ accentColor: B.gold }} />
                  <span className="font-medium text-[11px] sm:text-xs" style={{ color: B.inkSoft }}>Remember me</span>
                </label>
                <Link to="/forgot-password"
                  className="font-semibold text-[11px] sm:text-xs transition-colors hover:underline underline-offset-2 shrink-0"
                  style={{ color: B.gold }}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button type="submit" id="login-submit" disabled={submitting || rateLimit > 0}
                whileHover={{ scale: submitting ? 1 : 1.015, boxShadow: submitting ? undefined : `0 8px 24px rgba(191,161,95,0.4)` }}
                whileTap={{ scale: submitting ? 1 : 0.985 }}
                className="w-full h-12 sm:h-13 flex justify-center items-center gap-2 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer select-none"
                style={{ background: `linear-gradient(135deg, ${B.goldLight} 0%, ${B.gold} 100%)`, color: B.deep, boxShadow: `0 4px 16px rgba(191,161,95,0.3)`, letterSpacing: '0.02em', fontSize: '15px', touchAction: 'manipulation', minHeight: '48px' }}>
                {submitting
                  ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(4,30,22,0.2)', borderTopColor: B.deep }} />
                  : <><LogIn className="w-4 h-4" /><span>Sign In</span></>}
              </motion.button>
            </form>

            {/* Social login */}
            <SocialSignIn disabled={submitting} onSuccess={redirect}
              onError={(msg) => { setRateLimit(null); setNotice(null); setError(msg); }} />

            {/* Footer links */}
            <div className="mt-4 sm:mt-5 text-center space-y-2">
              <p className="text-xs" style={{ color: B.inkSoft }}>
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-bold hover:underline underline-offset-2 transition-colors" style={{ color: B.gold }}>
                  Create Account
                </Link>
              </p>
              <div>
                <Link to="/" className="inline-flex items-center gap-1 text-xs transition-colors"
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
    </div>
  );
};

export default Login;
