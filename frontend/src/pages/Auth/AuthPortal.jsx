import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn, UserPlus, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, Clock, ShieldCheck, Check, X,
  CheckCircle2, Gift, Zap, Sparkles,
  Star, MapPin, MessageCircle, BadgeCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Ease ────────────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1];

// ─── Brand tokens ────────────────────────────────────────────────────────────
const B = {
  gold   : '#bfa15f',
  goldLt : '#e8cc8a',
  goldDk : '#8c7033',
  ink    : '#0f172a',
  inkSoft: '#64748b',
  line   : '#e2e8f0',
  white  : '#ffffff',
};

// ─── Validation ──────────────────────────────────────────────────────────────
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const NAME_RE  = /^[\p{L}\s'.-]+$/u;
const PASS_RE  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ─── OAuth env vars ──────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID  = import.meta.env.VITE_FACEBOOK_APP_ID;

// ─── Script loader (singleton) ───────────────────────────────────────────────
const loadScript = (src, id) => new Promise((resolve, reject) => {
  const ex = document.getElementById(id);
  if (ex) {
    if (ex.dataset.loaded === 'true') return resolve();
    ex.addEventListener('load', resolve);
    ex.addEventListener('error', reject);
    return;
  }
  const s = document.createElement('script');
  s.src = src; s.id = id; s.async = true; s.defer = true;
  s.addEventListener('load', () => { s.dataset.loaded = 'true'; resolve(); });
  s.addEventListener('error', reject);
  document.head.appendChild(s);
});

const cleanParam = (v) =>
  v && v !== 'null' && v !== 'undefined' && v.trim() !== '' ? v.trim() : '';

// ─── Social links (left panel footer) ────────────────────────────────────────
const SOCIALS = [
  {
    label: 'Facebook',
    href : 'https://facebook.com/cozyblissful',
    icon : () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href : 'https://instagram.com/cozyblissful',
    icon : () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href : 'https://wa.me/639995435913',
    icon : () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

// ─── Google glyph ─────────────────────────────────────────────────────────────
const GoogleGlyph = () => (
  <svg viewBox="0 0 48 48" className="w-[17px] h-[17px] shrink-0" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const FacebookGlyph = () => (
  <svg viewBox="0 0 24 24" fill="#1877F2" className="w-[17px] h-[17px] shrink-0" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ─── Ambient spa backdrop ─────────────────────────────────────────────────────
const SpaBackdrop = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <img
      src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1920&q=60"
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-[0.14]"
      loading="eager"
      decoding="async"
    />
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(135deg,rgba(4,30,22,0.82) 0%,rgba(7,51,40,0.65) 55%,rgba(14,77,56,0.75) 100%)' }}
    />
    <div className="absolute rounded-full blur-3xl opacity-25" style={{ width: 520, height: 520, right: '-6%', top: '-10%', background: 'radial-gradient(circle,rgba(191,161,95,0.25) 0%,transparent 68%)' }} />
    <div className="absolute rounded-full blur-3xl opacity-20" style={{ width: 380, height: 380, left: '-5%', bottom: '-8%', background: 'radial-gradient(circle,rgba(52,201,158,0.18) 0%,transparent 70%)' }} />
    <div className="absolute inset-0 hidden sm:block">
      {Array.from({ length: 8 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${(i * 13.7) % 100}%`,
            bottom: -16,
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            background: 'radial-gradient(circle, #e8cc8a 0%, rgba(191,161,95,0.3) 100%)',
          }}
          animate={{ y: [0, -900], x: [0, -20 + (i % 7) * 9], opacity: [0, 0.25, 0.25, 0] }}
          transition={{ duration: 12 + (i % 5) * 2, delay: (i * 1.1) % 10, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  </div>
);

// ─── Rate-limit countdown ─────────────────────────────────────────────────────
const RateLimitBanner = ({ retryAfter, onDone }) => {
  const [s, setS] = useState(retryAfter);
  useEffect(() => { setS(retryAfter); }, [retryAfter]);
  useEffect(() => {
    if (s <= 0) { if (onDone) onDone(); return; }
    const id = setInterval(() => setS(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [s, onDone]);
  const m = Math.floor(s / 60), sec = s % 60;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px]"
      style={{ background: 'rgba(191,161,95,0.1)', border: '1px solid rgba(191,161,95,0.3)' }}
      role="alert"
    >
      <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: '#8c7033' }} />
      <span style={{ color: '#6b5a2e' }}>
        <strong>Too many attempts.</strong>{' '}
        {s > 0 ? `Try again in ${m > 0 ? `${m}m ` : ''}${sec}s.` : 'You may try again now.'}
      </span>
    </motion.div>
  );
};

// ─── Form input — 48px targets, 16px text (no iOS zoom), plain hints ───────────
const Input = ({ label, id, icon: Icon, error, success, rightEl, hint, onBlur, ...props }) => {
  const [focused, setFocused] = useState(false);
  const errId = error ? `${id}-error` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-2 text-[13px] font-bold mb-1.5"
        style={{ color: B.ink }}
      >
        <span>{label} {props.required && <span aria-hidden="true" style={{ color: '#bfa15f' }}>*</span>}</span>
      </label>
      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] pointer-events-none transition-colors shrink-0 z-10"
          style={{ color: error ? '#dc2626' : focused ? B.goldDk : '#94a3b8' }}
          aria-hidden="true"
        />
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
          className="auth-input w-full rounded-2xl outline-none transition-all duration-150 text-slate-800 placeholder:text-slate-400 font-medium"
          style={{
            fontSize: '16px',
            minHeight: '50px',
            paddingLeft: '44px',
            paddingRight: rightEl ? '52px' : success ? '38px' : '14px',
            paddingTop: '10px',
            paddingBottom: '10px',
            background: focused ? '#ffffff' : '#f8fafc',
            border: `1.5px solid ${error ? '#dc2626' : focused ? B.gold : '#e2e8f0'}`,
            boxShadow: focused && !error
              ? '0 0 0 4px rgba(191,161,95,0.15)'
              : error
              ? '0 0 0 3px rgba(220,38,38,0.08)'
              : '0 1px 2px rgba(0,0,0,0.04)',
          }}
          {...props}
        />
        {success && !error && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(5,150,105,0.1)' }}>
            <Check className="w-2.5 h-2.5 text-emerald-600" aria-hidden="true" />
          </div>
        )}
        {rightEl && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-[12px] mt-1.5 leading-relaxed" style={{ color: '#64748b' }}>{hint}</p>
      )}
      {error && (
        <motion.p
          id={errId}
          initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }}
          className="text-[12px] mt-1.5 flex items-start gap-1.5 font-semibold leading-relaxed"
          style={{ color: '#dc2626' }}
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />{error}
        </motion.p>
      )}
    </div>
  );
};

// ─── Eye toggle — 40px touch target ───────────────────────────────────────────
const EyeBtn = ({ show, onToggle, label }) => (
  <button
    type="button" onClick={onToggle}
    aria-label={label} aria-pressed={show} title={label}
    className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer touch-manipulation transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa15f]/60"
  >
    {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
  </button>
);

// ─── Compact password strength ────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const [color, width, label] =
    score <= 2 ? ['#ef4444', '20%', 'Weak']
    : score === 3 ? ['#f59e0b', '52%', 'Fair']
    : score === 4 ? ['#0a3d30', '78%', 'Good']
    : ['#059669', '100%', 'Strong'];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold" style={{ color }}>{label}</span>
        <span className="text-[10px] text-slate-400">{score}/5</span>
      </div>
      <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
        <motion.div className="h-full rounded-full" animate={{ width, backgroundColor: color }} transition={{ duration: 0.3 }} />
      </div>
      <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px]" aria-live="polite">
        {['8+ characters', 'BIG letter (A–Z)', 'small letter (a–z)', 'number (0–9)', 'symbol (@$!…)'].map((r, i) => (
          <span key={r} className={`inline-flex items-center gap-1 font-semibold ${checks[i] ? 'text-emerald-600' : 'text-slate-400'}`}>
            {checks[i] ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}{r}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Stat pill (left panel) ───────────────────────────────────────────────────
const StatPill = ({ value, label }) => (
  <span className="text-center">
    <span className="block text-[17px] font-black" style={{ color: '#e8cc8a' }}>{value}</span>
    <span className="block text-[9.5px] text-white/50 font-semibold mt-px">{label}</span>
  </span>
);

// ─── Facebook sign-in button ──────────────────────────────────────────────────
const FacebookBtn = ({ disabled, pending, mode, onFinish, onError }) => {
  const sdkRef = useRef(false);

  useEffect(() => {
    if (!FACEBOOK_APP_ID || sdkRef.current) return;
    const init = () => {
      if (window.FB && !sdkRef.current) {
        sdkRef.current = true;
        window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v21.0' });
      }
    };
    if (window.FB) { init(); return; }
    const prev = window.fbAsyncInit;
    window.fbAsyncInit = () => { if (prev) prev(); init(); };
    loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk')
      .catch(() => onError('Facebook Sign-In unavailable. Use email instead.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (disabled || pending) return;
    if (!FACEBOOK_APP_ID) { onError('Facebook sign-in is not configured.'); return; }
    if (!window.FB) { onError('Facebook is still loading. Please wait.'); return; }
    window.FB.login(
      (r) => {
        if (r.status === 'connected' && r.authResponse?.accessToken) {
          onFinish('facebook', r.authResponse.accessToken);
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  const isLoading = pending === 'facebook';
  return (
    <motion.button
      type="button" onClick={handleClick}
      disabled={disabled || pending !== null}
      whileHover={{ scale: (disabled || pending) ? 1 : 1.013 }}
      whileTap={{ scale: (disabled || pending) ? 1 : 0.98 }}
      className="w-full px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-[13.5px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border hover:bg-slate-50 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa15f]/60"
      style={{ minHeight: '50px', background: B.white, borderColor: B.line, color: B.ink, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      aria-label={mode === 'register' ? 'Sign up with Facebook' : 'Continue with Facebook'}
    >
      {isLoading
        ? <><span className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#1877F2' }} /><span className="text-slate-500 font-semibold">Connecting…</span></>
        : <><FacebookGlyph /><span className="truncate">{mode === 'register' ? 'Sign up with Facebook' : 'Continue with Facebook'}</span></>}
    </motion.button>
  );
};

// ─── Social sign-in wrapper ───────────────────────────────────────────────────
const SocialSignIn = ({ disabled, mode = 'login', onSuccess, onError }) => {
  const { socialLogin } = useAuth();
  const [pending, setPending] = useState(null);
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();

  const finish = useCallback(async (provider, cred) => {
    setPending(provider);
    let res;
    try { res = await socialLogin(provider, cred); } catch {
      setPending(null);
      onError('Social sign-in failed. Please use email.');
      return;
    }
    setPending(null);
    if (res.success) { onSuccess(res.role); return; }
    if (res.needsRegistration) {
      const q = new URLSearchParams();
      const name  = cleanParam(res.suggestedName);
      const email = cleanParam(res.email);
      const prov  = cleanParam(res.provider);
      if (email) q.set('prefill_email', email);
      if (name)  q.set('prefill_name', name);
      if (prov)  q.set('provider', prov);
      navigate(`/register?${q.toString()}`);
    } else {
      onError(res.error || 'Social sign-in failed. Please use email.');
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
          callback: (resp) => resp?.credential
            ? finish('google', resp.credential)
            : onError('Google sign-in was cancelled.'),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard', theme: 'outline', size: 'large',
            text: mode === 'register' ? 'signup_with' : 'continue_with',
            shape: 'rectangular', logo_alignment: 'left', width: 240,
          });
        }
      })
      .catch(() => onError('Could not load Google Sign-In.'));
    return () => { cancelled = true; };
  }, [finish, onError, mode]);

  const handleGoogleClick = () => {
    if (disabled || pending) return;
    if (!GOOGLE_CLIENT_ID) { onError('Google sign-in is not configured.'); return; }
    if (window.google?.accounts?.id) {
      setPending('google');
      window.google.accounts.id.prompt((n) => {
        if (n.isNotDisplayed() || n.isSkippedMoment()) {
          const btn = googleBtnRef.current?.querySelector('iframe')
            || googleBtnRef.current?.querySelector('div[role="button"]');
          if (btn) btn.click(); else setPending(null);
        }
      });
    } else {
      onError('Google is still loading. Please wait.');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: B.line }} />
        <span className="text-[11px] font-bold tracking-widest uppercase shrink-0" style={{ color: B.inkSoft }}>
          or {mode === 'register' ? 'sign up with' : 'continue with'}
        </span>
        <div className="flex-1 h-px" style={{ background: B.line }} />
      </div>

      {/* Stacked full-width buttons — readable on 320px phones up to desktop */}
      <div className="flex flex-col gap-2.5">
        {/* Google */}
        <div className="relative w-full">
          <motion.button
            type="button" onClick={handleGoogleClick}
            disabled={disabled || pending !== null}
            whileHover={{ scale: (disabled || pending) ? 1 : 1.01 }}
            whileTap={{ scale: (disabled || pending) ? 1 : 0.985 }}
            className="w-full px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-[13.5px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border hover:bg-slate-50 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa15f]/60"
            style={{ minHeight: '50px', background: B.white, borderColor: B.line, color: B.ink, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            aria-label={mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}
          >
            {pending === 'google'
              ? <><span className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: B.gold }} /><span className="text-slate-500 font-semibold">Connecting…</span></>
              : <><GoogleGlyph /><span className="truncate">{mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}</span></>}
          </motion.button>
          <div
            ref={googleBtnRef}
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ opacity: 0.011, colorScheme: 'light', pointerEvents: pending !== null ? 'none' : 'auto' }}
          />
        </div>

        <FacebookBtn disabled={disabled} pending={pending} mode={mode} onFinish={finish} onError={onError} />
      </div>

      <p className="text-center text-[12px] text-slate-500 mt-3.5 leading-relaxed px-1">
        By continuing, you agree to our{' '}
        <Link to="/privacy-policy" className="font-bold hover:underline underline-offset-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa15f]/60" style={{ color: '#8c7033' }}>
          Privacy Policy
        </Link>
        . We only use your name and email for sign-in &amp; booking.
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN AUTH PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
const YEAR = new Date().getFullYear();

// Sign In ⇄ Create Account are separate routes, so this component remounts on
// every tab switch. First entry from the landing page gets the full rise;
// tab switches reuse a quick fade so switching feels instant, not replayed.
let authCardSeen = false;

export default function AuthPortal({ initialTab = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, logout } = useAuth();

  // Parse URL params or location state or pending booking on mount
  const initParams = useMemo(() => {
    const p = new URLSearchParams(location.search);
    let email = cleanParam(p.get('prefill_email')) || cleanParam(location.state?.prefill_email);
    let name  = cleanParam(p.get('prefill_name')) || cleanParam(location.state?.prefill_name);
    let phone = cleanParam(p.get('prefill_phone')) || cleanParam(location.state?.prefill_phone);
    const fromCart = Boolean(p.get('from_cart') || location.state?.from_cart);

    if (!email || !name) {
      try {
        const raw = localStorage.getItem('cb_pending_booking_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!email && parsed?.form?.email) email = cleanParam(parsed.form.email);
          if (!name && parsed?.form?.name) name = cleanParam(parsed.form.name);
          if (!phone && parsed?.form?.phone) phone = cleanParam(parsed.form.phone);
        }
      } catch {}
    }

    return {
      email,
      name,
      phone,
      provider: cleanParam(p.get('provider')),
      error   : cleanParam(p.get('error')),
      fromCart,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.state]);

  const deriveTab = useCallback(() => {
    if (location.pathname === '/register' || initParams.email || initParams.name || initParams.provider || initParams.fromCart) return 'register';
    if (location.pathname === '/login') return 'login';
    return initialTab;
  }, [location.pathname, initParams, initialTab]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab,  setActiveTab]  = useState(deriveTab);
  const [rateLimit,  setRateLimit]  = useState(null);
  const [error,      setError]      = useState(initParams.error || null);
  const [notice,     setNotice]     = useState(() => {
    if (initParams.fromCart || (initParams.email && (location.pathname === '/register' || location.state?.from_cart))) {
      return '✨ Booking details saved! Name and email pre-filled — create your password to finalize your appointment.';
    }
    if (initParams.provider) {
      const n = initParams.provider.charAt(0).toUpperCase() + initParams.provider.slice(1).toLowerCase();
      return initParams.email
        ? `Connected with ${n}! Name and email filled in — just create a password.`
        : `Connected with ${n}! Name filled in — add your email and create a password.`;
    }
    return null;
  });
  const [submitting, setSubmitting] = useState(false);

  // Remember Me state: only active if remember_me flag is explicitly enabled
  const isRemembered = Boolean(
    localStorage.getItem('remember_me') === 'true' &&
    localStorage.getItem('remember_email')
  );

  // Login fields: autofill credentials only if remember_me is enabled or prefill available
  const [rememberMe,  setRememberMe]  = useState(isRemembered);
  const [loginEmail,  setLoginEmail]  = useState(() => {
    if (location.state?.email) return location.state.email;
    if (location.state?.prefill_email) return location.state.prefill_email;
    if (initParams.email) return initParams.email;
    return isRemembered ? (localStorage.getItem('remember_email') || '') : '';
  });
  const [loginPw,     setLoginPw]     = useState(() => {
    return isRemembered ? (localStorage.getItem('remember_password') || '') : '';
  });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});

  // Register fields
  const [regName,          setRegName]          = useState(initParams.name || '');
  const [regEmail,         setRegEmail]         = useState(initParams.email || '');
  const [regPw,            setRegPw]            = useState('');
  const [regConfirmPw,     setRegConfirmPw]     = useState('');
  const [showRegPw,        setShowRegPw]        = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw] = useState(false);
  const [regErrors,        setRegErrors]        = useState({});
  const [successModal,     setSuccessModal]     = useState(false);
  const [registeredEmail,  setRegisteredEmail]  = useState('');

  // ── Sync tab with URL pathname ─────────────────────────────────────────────
  useEffect(() => {
    const t = location.pathname === '/register' ? 'register'
            : location.pathname === '/login'    ? 'login'
            : null;
    if (t) setActiveTab(t);
  }, [location.pathname]);

  // ── Sync prefill params from URL search ───────────────────────────────────
  useEffect(() => {
    const p    = new URLSearchParams(location.search);
    const e    = cleanParam(p.get('prefill_email'));
    const n    = cleanParam(p.get('prefill_name'));
    const prov = cleanParam(p.get('provider'));
    const err  = cleanParam(p.get('error'));
    if (e) setRegEmail(e);
    if (n) setRegName(n);
    if (err) setError(err.slice(0, 200));
    if (e || n || prov) {
      setActiveTab('register');
      setError(null);
      if (prov) {
        const nn = prov.charAt(0).toUpperCase() + prov.slice(1).toLowerCase();
        setNotice(e
          ? `Connected with ${nn}! Name and email filled in — just create a password.`
          : `Connected with ${nn}! Name filled in — add your email and password.`);
      }
    }
  }, [location.search]);

  // Note: No automatic redirect on mount so user/admin never get autologged into portals without submitting

  // ── Mark card seen (tab switches remount via route change) ─────────────────
  useEffect(() => { authCardSeen = true; }, []);

  const redirect = useCallback((userRole) => {
    const r = String(userRole || '').trim().toLowerCase();
    if (r === 'admin')     navigate('/admin/dashboard');
    else if (r === 'therapist') navigate('/therapist/dashboard');
    else if (r === 'staff')     navigate('/staff/dashboard');
    else navigate('/client/dashboard');
  }, [navigate]);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setError(null); setNotice(null); setRateLimit(null);
    setLoginErrors({}); setRegErrors({}); setSubmitting(false);
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register', { replace: true });
  };

  const dismiss = () => { setError(null); setNotice(null); };

  // ── Login submit ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); setNotice(null); setLoginErrors({}); setRateLimit(null);

    const errs = {};
    if (!loginEmail.trim())                     errs.email    = 'Email is required.';
    else if (!EMAIL_RE.test(loginEmail.trim())) errs.email    = 'Invalid email. e.g. maria@email.com';
    if (!loginPw)                               errs.password = 'Password is required.';
    else if (loginPw.length < 8)                errs.password = 'At least 8 characters.';
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }

    setSubmitting(true);
    if (rememberMe) {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('remember_email', loginEmail.trim());
      localStorage.setItem('remember_password', loginPw);
    } else {
      localStorage.removeItem('remember_me');
      localStorage.removeItem('remember_email');
      localStorage.removeItem('remember_password');
    }

    const res = await login(loginEmail.trim(), loginPw);
    if (res.success) {
      if (!rememberMe) setLoginPw('');
      redirect(res.role);
      return;
    }
    if (res.rateLimited) { setRateLimit(res.retryAfter || 3600); }
    else if (res.errors) {
      const m = {};
      Object.keys(res.errors).forEach(k => { m[k] = Array.isArray(res.errors[k]) ? res.errors[k][0] : String(res.errors[k]); });
      setLoginErrors(m);
      // Show the same specific message in the top banner so users
      // instantly see whether the email or the password was wrong.
      setError(res.error || Object.values(m)[0]);
    } else {
      const msg = res.error || 'Login failed. Please try again.';
      setError(msg);
      // Map generic server text to the correct field so the input
      // highlights even when the backend sends no `errors` object.
      const lower = msg.toLowerCase();
      if (lower.includes('password')) {
        setLoginErrors({ password: msg });
      } else if (lower.includes('email') || lower.includes('account') || lower.includes('not found')) {
        setLoginErrors({ email: msg });
      }
    }
    setSubmitting(false);
  };

  // ── Register submit ────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null); setNotice(null); setRegErrors({}); setRateLimit(null);

    const errs = {};
    if (!regName.trim())                      errs.name            = 'Full name is required.';
    else if (regName.trim().length < 2)       errs.name            = 'At least 2 characters.';
    else if (!NAME_RE.test(regName.trim()))   errs.name            = 'Letters, spaces, hyphens only.';
    if (!regEmail.trim())                     errs.email           = 'Email is required.';
    else if (!EMAIL_RE.test(regEmail.trim())) errs.email           = 'Invalid email. e.g. maria@email.com';
    if (!regPw)                               errs.password        = 'Password is required.';
    else if (!PASS_RE.test(regPw))            errs.password        = 'Must include upper, lower, number & symbol.';
    if (!regConfirmPw)                        errs.confirmPassword = 'Please confirm your password.';
    else if (regPw !== regConfirmPw)          errs.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errs).length) { setRegErrors(errs); return; }

    setSubmitting(true);
    const res = await register(regName.trim(), regEmail.trim(), regPw, regConfirmPw);
    setRegPw(''); setRegConfirmPw('');

    if (res.success) {
      setRegisteredEmail(regEmail.trim());
      setSuccessModal(true);
      setSubmitting(false);
      return;
    }
    if (res.rateLimited) setRateLimit(res.retryAfter || 3600);
    else if (res.errors) {
      const m = {};
      Object.keys(res.errors).forEach(k => { m[k] = res.errors[k][0]; });
      setRegErrors(m);
    } else { setError(res.error); }
    setSubmitting(false);
  };

  const isLogin = activeTab === 'login';

  // Trust bullets
  const loginTrust = [
    { icon: ShieldCheck, t: 'Encrypted & secure',      n: 'Your data stays safe.'       },
    { icon: BadgeCheck,  t: '30+ certified therapists', n: 'All vetted & rated.'          },
    { icon: Clock,       t: 'Open 9 AM – 9 PM',         n: 'Book anytime online.'         },
  ];
  const registerTrust = [
    { icon: Gift,         t: 'Welcome perks',       n: 'Special rates on day one.'           },
    { icon: Zap,          t: 'Priority scheduling', n: 'Best slots, first access.'            },
    { icon: CheckCircle2, t: 'Track every visit',   n: 'History & receipts in one place.'     },
  ];
  const trustPoints = isLogin ? loginTrust : registerTrust;

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#04100a', fontFamily: "'Inter', sans-serif" }}
    >
      <SpaBackdrop />

      {/* ── Full-viewport centered card ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-3 sm:px-5 py-3 overflow-hidden">
        <motion.div
          initial={authCardSeen ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: authCardSeen ? 0.18 : 0.45, ease: EASE }}
          className="w-full max-w-[900px] flex flex-col md:flex-row rounded-2xl overflow-hidden border shadow-2xl"
          style={{
            borderColor: 'rgba(191,161,95,0.28)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(191,161,95,0.12), 0 6px 24px rgba(191,161,95,0.08)',
            height: 'calc(100dvh - 24px)',
            maxHeight: '680px',
          }}
        >

          {/* ══ LEFT PANEL ══ */}
          <div
            className="hidden md:flex flex-col justify-between shrink-0 relative overflow-hidden text-white"
            style={{
              width: '38%',
              background: 'linear-gradient(155deg, #0a3d30 0%, #062b22 55%, #041e16 100%)',
              padding: 'clamp(20px, 2.8vh, 28px) clamp(18px, 2.2vw, 26px)',
            }}
          >
            {/* Decorative rings */}
            <div className="absolute rounded-full pointer-events-none" style={{ width: 260, height: 260, right: -70, top: -70, border: '1.5px solid rgba(191,161,95,0.15)' }} />
            <div className="absolute rounded-full pointer-events-none" style={{ width: 380, height: 380, right: -120, top: -120, border: '1px solid rgba(255,255,255,0.05)' }} />

            {/* Top content */}
            <div className="relative z-10 flex flex-col gap-3">
              <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ background: 'rgba(191,161,95,0.12)', border: '1px solid rgba(191,161,95,0.28)', color: '#e8cc8a' }}>
                <Sparkles className="w-2.5 h-2.5" /> Premium Spa &amp; Wellness
              </span>

              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: EASE }}>
                  <h2 className="font-black leading-[1.15] tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                    {isLogin
                      ? <>Welcome back<br />to your <em className="text-[#e8cc8a]">calm.</em></>
                      : <>Begin your<br /><em className="text-[#e8cc8a]">wellness</em> journey.</>}
                  </h2>
                  <p className="text-[11.5px] text-emerald-100/65 leading-relaxed mt-2">
                    {isLogin
                      ? 'Sign in to book, reschedule, and manage your sessions.'
                      : 'Create a free account — book certified therapists anytime.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <span className="flex" aria-label="Rated 4.9">
                  {[0, 1, 2, 3, 4].map(i => <Star key={i} className="w-3 h-3 fill-[#e8cc8a] text-[#e8cc8a]" />)}
                </span>
                <span className="text-[11px] font-bold text-[#e8cc8a]">4.9</span>
                <span className="text-[11px] text-white/45">· 15k+ guests</span>
              </div>

              {/* Trust bullets */}
              <AnimatePresence mode="wait">
                <motion.ul key={`tp-${activeTab}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-2.5">
                  {trustPoints.map(({ icon: Icon, t, n }) => (
                    <li key={t} className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Icon className="w-3.5 h-3.5 text-[#e8cc8a]" />
                      </span>
                      <span>
                        <span className="block text-[11.5px] font-bold text-white">{t}</span>
                        <span className="block text-[10.5px] text-emerald-100/55">{n}</span>
                      </span>
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <StatPill value="15k+" label="Happy guests" />
                <StatPill value="30+"  label="Therapists" />
                <StatPill value="4.9★" label="Avg. rating" />
              </div>
            </div>

            {/* Bottom footer */}
            <div className="relative z-10 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-[10.5px] text-white/50 mb-2">
                <Clock className="w-3 h-3 text-[#e8cc8a]" /> Open daily 9 AM – 9 PM
                <span aria-hidden className="text-white/20">·</span>
                <MapPin className="w-3 h-3 text-[#e8cc8a]" /> Home service
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/35">© {YEAR} Cozy Blissful</p>
                <div className="flex gap-1.5">
                  {SOCIALS.map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="flex items-center justify-center w-6 h-6 rounded-lg text-white/60 hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)' }}>
                      <s.icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT PANEL — form ══ */}
          <div className="flex-1 bg-white flex flex-col min-w-0 overflow-y-auto auth-scroll">
            <div
              className="w-full max-w-[390px] my-auto mx-auto flex flex-col justify-center"
              style={{ padding: '20px clamp(20px, 4vw, 34px)' }}
            >

              {/* ── Brand header ── */}
              <div className="flex flex-col items-center text-center mb-4">
                <div
                  className="rounded-xl mb-2 relative overflow-hidden"
                  style={{
                    width: 52, height: 52,
                    boxShadow: '0 6px 18px rgba(10,61,48,0.2), 0 0 0 1px rgba(191,161,95,0.3)',
                  }}
                >
                  <img src="/cb-logo.jpg" alt="Cozy Blissful logo" className="w-full h-full rounded-xl object-cover" />
                </div>

                <p className="text-[9.5px] font-extrabold tracking-[0.2em] uppercase" style={{ color: '#bfa15f' }}>
                  Cozy Blissful
                </p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EASE }}
                  >
                    <h1
                      className="text-[22px] font-black tracking-tight text-slate-900 leading-tight mt-0.5"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {isLogin ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      {isLogin ? 'Sign in to manage your bookings' : 'Free forever · no card needed'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Notice banner */}
              <AnimatePresence mode="wait">
                {notice && !error && (
                  <motion.div
                    key="note"
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11.5px] mb-3"
                    style={{ background: 'rgba(191,161,95,0.1)', border: '1px solid rgba(191,161,95,0.3)', color: '#6b5a2e' }}
                  >
                    <span className="flex-1 font-semibold leading-snug">{notice}</span>
                    <button type="button" onClick={dismiss} aria-label="Dismiss" className="p-1 rounded-lg hover:bg-black/5 touch-manipulation shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error banner */}
              <AnimatePresence mode="wait">
                {error && !rateLimit && (
                  <motion.div
                    key="err"
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11.5px] mb-3 bg-red-50 border border-red-200 text-red-700"
                    role="alert"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 font-semibold leading-snug">{error}</span>
                    <button type="button" onClick={dismiss} aria-label="Dismiss" className="p-1 rounded-lg hover:bg-red-100 touch-manipulation shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {rateLimit > 0 && (
                <div className="mb-3">
                  <RateLimitBanner retryAfter={rateLimit} onDone={() => setRateLimit(null)} />
                </div>
              )}

              {/* ── Login / Register forms ── */}
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22, ease: EASE }}>

                    <form onSubmit={handleLogin} noValidate className="flex flex-col gap-2.5">
                      <Input
                        label="Email" id="login-email" name="email" type="email" inputMode="email"
                        autoComplete="email" required maxLength={254} icon={Mail}
                        value={loginEmail} placeholder="maria@email.com"
                        error={loginErrors.email}
                        success={!!loginEmail && !loginErrors.email && EMAIL_RE.test(loginEmail.trim())}
                        onChange={(e) => { setLoginEmail(e.target.value); if (loginErrors.email) setLoginErrors(p => ({ ...p, email: '' })); }}
                      />

                      <Input
                        label="Password" id="login-password" name="password"
                        type={showLoginPw ? 'text' : 'password'} autoComplete="current-password"
                        required maxLength={128} icon={Lock} value={loginPw}
                        placeholder="Your password"
                        error={loginErrors.password}
                        onChange={(e) => { setLoginPw(e.target.value); if (loginErrors.password) setLoginErrors(p => ({ ...p, password: '' })); }}
                        rightEl={<EyeBtn show={showLoginPw} onToggle={() => setShowLoginPw(v => !v)} label={showLoginPw ? 'Hide password' : 'Show password'} />}
                      />

                      <div className="flex items-center justify-between mt-0.5">
                        <label htmlFor="remember-me" className="inline-flex items-center gap-1.5 cursor-pointer select-none touch-manipulation">
                          <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setRememberMe(checked);
                              if (!checked) {
                                localStorage.removeItem('remember_me');
                                localStorage.removeItem('remember_email');
                                localStorage.removeItem('remember_password');
                              }
                            }}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-[#bfa15f]"
                          />
                          <span className="text-[11.5px] font-medium text-slate-400">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-[11.5px] font-semibold hover:underline underline-offset-2" style={{ color: '#8c7033' }}>
                          Forgot password?
                        </Link>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={submitting || rateLimit > 0}
                        whileHover={{ scale: submitting ? 1 : 1.015 }}
                        whileTap={{ scale: submitting ? 1 : 0.975 }}
                        className="w-full h-[44px] flex justify-center items-center gap-2 rounded-xl font-bold text-[13.5px] text-[#041e16] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#bfa15f]"
                        style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 60%, #d4af70 100%)', boxShadow: '0 5px 16px rgba(191,161,95,0.35), 0 1px 4px rgba(0,0,0,0.07)' }}
                      >
                        {submitting
                          ? <><span className="w-3.5 h-3.5 border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" /><span>Signing in…</span></>
                          : <><LogIn className="w-3.5 h-3.5" /><span>Sign In</span></>}
                      </motion.button>
                    </form>

                    <SocialSignIn
                      disabled={submitting}
                      mode="login"
                      onSuccess={redirect}
                      onError={msg => { setRateLimit(null); setNotice(null); setError(msg); }}
                    />

                    <p className="text-center text-[11.5px] text-slate-400 mt-3">
                      No account?{' '}
                      <button type="button" onClick={() => switchTab('register')} className="font-semibold hover:underline underline-offset-2 cursor-pointer" style={{ color: '#8c7033' }}>
                        Create one free
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="register" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.22, ease: EASE }}>

                    <form onSubmit={handleRegister} noValidate className="flex flex-col gap-2.5">
                      <Input
                        label="Full Name" id="reg-name" name="name" type="text"
                        autoComplete="name" required maxLength={100} icon={User}
                        value={regName} placeholder="Maria Santos"
                        error={regErrors.name}
                        success={regName.trim().length >= 2 && !regErrors.name && NAME_RE.test(regName.trim())}
                        onChange={(e) => { setRegName(e.target.value); if (regErrors.name) setRegErrors(p => ({ ...p, name: '' })); }}
                      />

                      <Input
                        label="Email" id="reg-email" name="email" type="email"
                        inputMode="email" autoComplete="email" required maxLength={254} icon={Mail}
                        value={regEmail} placeholder="maria@email.com"
                        error={regErrors.email}
                        success={!!regEmail && !regErrors.email && EMAIL_RE.test(regEmail.trim())}
                        readOnly={!!initParams.provider && regEmail === initParams.email}
                        onChange={(e) => { setRegEmail(e.target.value); if (regErrors.email) setRegErrors(p => ({ ...p, email: '' })); }}
                      />

                      <div className="grid grid-cols-1 min-[440px]:grid-cols-2 gap-2.5">
                        <Input
                          label="Password" id="reg-password" name="password"
                          type={showRegPw ? 'text' : 'password'} autoComplete="new-password"
                          required maxLength={128} icon={Lock} value={regPw}
                          placeholder="Min. 8 chars"
                          error={regErrors.password}
                          onChange={(e) => { setRegPw(e.target.value); if (regErrors.password) setRegErrors(p => ({ ...p, password: '' })); }}
                          rightEl={<EyeBtn show={showRegPw} onToggle={() => setShowRegPw(v => !v)} label={showRegPw ? 'Hide password' : 'Show password'} />}
                        />
                        <Input
                          label="Confirm" id="reg-confirm-password" name="confirm_password"
                          type={showRegConfirmPw ? 'text' : 'password'} autoComplete="new-password"
                          required maxLength={128} icon={Lock} value={regConfirmPw}
                          placeholder="Repeat"
                          error={regErrors.confirmPassword}
                          success={!!regConfirmPw && regConfirmPw === regPw}
                          onChange={(e) => { setRegConfirmPw(e.target.value); if (regErrors.confirmPassword) setRegErrors(p => ({ ...p, confirmPassword: '' })); }}
                          rightEl={<EyeBtn show={showRegConfirmPw} onToggle={() => setShowRegConfirmPw(v => !v)} label={showRegConfirmPw ? 'Hide confirm password' : 'Show confirm password'} />}
                        />
                      </div>

                      {regPw && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                          <PasswordStrength password={regPw} />
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={submitting || rateLimit > 0}
                        whileHover={{ scale: submitting ? 1 : 1.015 }}
                        whileTap={{ scale: submitting ? 1 : 0.975 }}
                        className="w-full h-[44px] flex justify-center items-center gap-2 rounded-xl font-bold text-[13.5px] text-[#041e16] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#bfa15f]"
                        style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 60%, #d4af70 100%)', boxShadow: '0 5px 16px rgba(191,161,95,0.35), 0 1px 4px rgba(0,0,0,0.07)' }}
                      >
                        {submitting
                          ? <><span className="w-3.5 h-3.5 border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" /><span>Creating account…</span></>
                          : <><UserPlus className="w-3.5 h-3.5" /><span>Create Account</span></>}
                      </motion.button>
                    </form>

                    <SocialSignIn
                      disabled={submitting}
                      mode="register"
                      onSuccess={redirect}
                      onError={msg => { setRateLimit(null); setNotice(null); setError(msg); }}
                    />

                    <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                      <Link to="/privacy-policy" className="hover:underline underline-offset-2" style={{ color: '#94a3b8' }}>Privacy Policy</Link>
                      <button type="button" onClick={() => switchTab('login')} className="font-semibold hover:underline underline-offset-2 cursor-pointer" style={{ color: '#8c7033' }}>
                        Already have an account? Sign in
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Help row */}
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[10.5px] text-slate-400">
                <MessageCircle className="w-2.5 h-2.5" style={{ color: '#bfa15f' }} />
                <span>Need help?</span>
                <a href="https://wa.me/639995435913" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline underline-offset-2" style={{ color: '#8c7033' }}>
                  Chat with us
                </a>
              </div>

            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Registration Success Modal ── */}
      <AnimatePresence>
        {successModal && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
            role="dialog" aria-modal="true" aria-label="Account created"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 w-full max-w-[320px]"
              style={{ padding: 'clamp(20px, 4vw, 28px)' }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.08 }}
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', border: '2px solid #34d399' }}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </motion.div>

              <h3 className="text-[19px] font-black tracking-tight mt-4 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                Account created!
              </h3>
              <p className="text-[12.5px] text-slate-500 leading-relaxed mt-1.5 text-center">
                Welcome to Cozy Blissful! Logged in as <strong className="text-slate-800 break-all">{registeredEmail}</strong>.
              </p>

              <div className="flex items-start gap-2 mt-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <Gift className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-px" />
                <p className="text-[11.5px] text-emerald-800 leading-relaxed">
                  <strong>You're all set!</strong> Your saved treatments are waiting in your sanctuary lounge.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuccessModal(false);
                  redirect('client');
                }}
                className="w-full mt-4 py-3 min-h-[46px] rounded-xl font-black text-[14px] text-[#041e16] cursor-pointer hover:brightness-105 active:scale-[0.99] touch-manipulation transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)', boxShadow: '0 5px 18px rgba(191,161,95,0.4)' }}
              >
                <span>Proceed to Client Sanctuary</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
