import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn, UserPlus, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, Clock, ShieldCheck, Check, X,
  ArrowLeft, CheckCircle2, Gift, Zap, Gem, Info,
  Star, Sparkles, CalendarCheck, Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Shared motion ease with landing page ─────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1];

// ─── Brand Tokens (mirrors LandingPage + tailwind gold/emerald) ──────────────
const B = {
  canvas: '#faf9f7',
  deep: '#041e16',
  green: '#0a3d30',
  greenSoft: '#edfdf7',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
  goldDark: '#8c7033',
  ink: '#0f172a',
  inkSoft: '#64748b',
  line: '#e7e0d4',
  white: '#ffffff',
};

const NAV_LINKS = [
  { href: '/#story', label: 'Our Story' },
  { href: '/#services', label: 'Services' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#testimonials', label: 'Reviews' },
];

const SOCIALS = [
  { label: 'Facebook', href: 'https://facebook.com/cozyblissful', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
  { label: 'Instagram', href: 'https://instagram.com/cozyblissful', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
  { label: 'WhatsApp', href: 'https://wa.me/639995435913', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg> },
];

const TRUST_LOGIN = [
  { icon: ShieldCheck, title: 'Safe & private', note: 'Your details are encrypted and never shared.' },
  { icon: Clock, title: 'Open every day', note: 'Book or reschedule anytime, 9:00 AM – 9:00 PM.' },
  { icon: CalendarCheck, title: 'Manage in seconds', note: 'View, reschedule or cancel upcoming visits.' },
];

const TRUST_REGISTER = [
  { icon: Gift, title: 'Free to join', note: 'Create an account in under a minute — no fees.' },
  { icon: Zap, title: 'Book faster', note: 'Saved details mean checkout in just a few taps.' },
  { icon: Gem, title: 'Member-only rates', note: 'Unlock special packages and priority slots.' },
];

// ─── Validation ──────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const NAME_REGEX = /^[\p{L}\s'.-]+$/u;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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

const cleanParam = (val) =>
  val && val !== 'null' && val !== 'undefined' && val.trim() !== '' ? val.trim() : '';

const GoogleGlyph = () => (
  <svg viewBox="0 0 48 48" className="w-[18px] h-[18px] shrink-0" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const FacebookGlyph = () => (
  <svg viewBox="0 0 24 24" fill="#1877F2" className="w-[18px] h-[18px] shrink-0" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ─── Rate Limit Banner ───────────────────────────────────────────────────────
const RateLimitBanner = ({ retryAfter, onDismiss }) => {
  const [s, setS] = useState(retryAfter);
  useEffect(() => { setS(retryAfter); }, [retryAfter]);
  useEffect(() => {
    if (s <= 0) return;
    const id = setInterval(() => setS((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [s]);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl text-[13px] leading-relaxed"
      style={{ background: 'rgba(191,161,95,0.12)', border: '1px solid rgba(191,161,95,0.4)' }}
      role="alert"
    >
      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: B.goldDark }} />
      <div className="flex-1" style={{ color: '#6b5a2e' }}>
        <strong className="font-extrabold">Too many attempts.</strong>{' '}
        {s > 0 ? `Please wait ${m > 0 ? `${m} min ` : ''}${sec} sec, then try again.` : 'You may try again now.'}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="p-1 rounded-lg hover:bg-black/5 cursor-pointer shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
};

// ─── Accessible large-touch Input ────────────────────────────────────────────
const Field = ({ label, hint, id, icon: Icon, error, rightEl, ...props }) => {
  const [focused, setFocused] = useState(false);
  const errId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-[13px] font-bold mb-1.5" style={{ color: B.ink }}>
        {label} {props.required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      <div className="relative w-full">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-150 shrink-0 z-10"
          style={{ color: error ? '#dc2626' : focused ? B.green : '#94a3b8' }}
          aria-hidden="true"
        />
        <input
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); if (props.onBlurProp) props.onBlurProp(e); }}
          aria-invalid={!!error}
          aria-describedby={[errId, hintId].filter(Boolean).join(' ') || undefined}
          className="w-full rounded-2xl outline-none transition-all duration-200 bg-white"
          style={{
            fontSize: '16px',
            minHeight: '50px',
            paddingLeft: '46px',
            paddingRight: rightEl ? '48px' : '14px',
            paddingTop: '12px',
            paddingBottom: '12px',
            border: `1.5px solid ${error ? '#dc2626' : focused ? B.green : '#e2e8f0'}`,
            boxShadow: focused && !error
              ? '0 0 0 4px rgba(10,61,48,0.10), 0 1px 2px rgba(0,0,0,0.04)'
              : error ? '0 0 0 4px rgba(220,38,38,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
            color: B.ink,
          }}
          {...props}
        />
        {rightEl && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-[12px] mt-1.5 leading-relaxed" style={{ color: B.inkSoft }}>{hint}</p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
          id={errId}
          className="text-[12.5px] mt-1.5 flex items-start gap-1.5 font-semibold leading-snug"
          style={{ color: '#dc2626' }} role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
};

// ─── Password strength (plain language + visual bar) ─────────────────────────
const PasswordStrength = ({ password }) => {
  const rules = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One BIG letter (A–Z)', ok: /[A-Z]/.test(password) },
    { label: 'One small letter (a–z)', ok: /[a-z]/.test(password) },
    { label: 'One number (0–9)', ok: /\d/.test(password) },
    { label: 'One symbol (@ $ ! % *)', ok: /[@$!%*?&]/.test(password) },
  ];
  const score = rules.filter((r) => r.ok).length;
  if (!password) return null;
  const barColor = score <= 2 ? '#f87171' : score <= 4 ? '#fbbf24' : '#34d399';
  const barLabel = score <= 2 ? 'Weak — keep going' : score <= 4 ? 'Good — almost there' : 'Strong password!';
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-1">
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={5} aria-label={`Password strength: ${barLabel}`}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor }}
              initial={false}
              animate={{ width: `${(score / 5) * 100}%` }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </div>
          <span className="text-[11px] font-extrabold whitespace-nowrap" style={{ color: score <= 2 ? '#b91c1c' : score <= 4 ? '#92400e' : '#047857' }}>
            {barLabel}
          </span>
        </div>
        <ul className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
          {rules.map((r) => (
            <li key={r.label} className={`inline-flex items-center gap-1.5 font-medium transition-colors ${r.ok ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 ${r.ok ? 'bg-emerald-100' : 'bg-slate-200/70'}`}>
                {r.ok ? <Check className="w-2.5 h-2.5 stroke-[3.5]" /> : <X className="w-2.5 h-2.5 stroke-[2.5]" />}
              </span>
              <span>{r.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// ─── Facebook Sign-In ────────────────────────────────────────────────────────
const FacebookSignInButton = ({ disabled, pending, mode, onFinish, onError }) => {
  const sdkInitRef = useRef(false);
  useEffect(() => {
    if (!FACEBOOK_APP_ID || sdkInitRef.current) return;
    const initFB = () => {
      if (window.FB && !sdkInitRef.current) {
        sdkInitRef.current = true;
        window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v21.0' });
      }
    };
    if (window.FB) { initFB(); return; }
    const prevInit = window.fbAsyncInit;
    window.fbAsyncInit = () => { if (prevInit) prevInit(); initFB(); };
    loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk')
      .catch(() => onError('Could not load Facebook Sign-In. Check your connection and try again.'));
  }, [onError]);

  const handleClick = () => {
    if (disabled || pending) return;
    if (!FACEBOOK_APP_ID) { onError('Facebook sign-in is not set up yet. Please use email instead.'); return; }
    if (!window.FB) { onError('Facebook is still loading. Please wait a moment and try again.'); return; }
    window.FB.login(
      (response) => {
        if (response.status === 'connected' && response.authResponse?.accessToken) {
          onFinish('facebook', response.authResponse.accessToken);
        }
      },
      { scope: 'email,public_profile' },
    );
  };
  const isLoading = pending === 'facebook';
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending !== null}
      whileHover={{ y: (disabled || pending) ? 0 : -1 }}
      whileTap={{ scale: (disabled || pending) ? 1 : 0.98 }}
      className="w-full px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-[14px] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
      style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: '50px' }}
      aria-label={mode === 'register' ? 'Sign up with Facebook' : 'Continue with Facebook'}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.12)', borderTopColor: '#1877F2' }} />
          <span style={{ color: '#64748b' }}>Connecting…</span>
        </>
      ) : (
        <>
          <FacebookGlyph />
          <span className="truncate">{mode === 'register' ? 'Sign up with Facebook' : 'Continue with Facebook'}</span>
        </>
      )}
    </motion.button>
  );
};

// ─── Social Sign-In ──────────────────────────────────────────────────────────
const SocialSignIn = ({ disabled, mode = 'login', onSuccess, onError }) => {
  const { socialLogin } = useAuth();
  const [pending, setPending] = useState(null);
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();

  const finish = useCallback(async (provider, cred) => {
    setPending(provider);
    let res;
    try {
      res = await socialLogin(provider, cred);
    } catch {
      setPending(null);
      onError('Sign-in had a problem. Please try again.');
      return;
    }
    setPending(null);
    if (res.success) {
      onSuccess(res.role);
    } else if (res.needsRegistration) {
      const q = new URLSearchParams();
      const name = cleanParam(res.suggestedName);
      const email = cleanParam(res.email);
      const prov = cleanParam(res.provider);
      if (email) q.set('prefill_email', email);
      if (name) q.set('prefill_name', name);
      if (prov) q.set('provider', prov);
      navigate(`/register?${q.toString()}`);
    } else {
      onError(res.error || 'Sign-in failed. Please try again.');
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
          callback: (resp) => resp?.credential ? finish('google', resp.credential) : onError('Google sign-in was cancelled.'),
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
      .catch(() => onError('Could not load Google Sign-In. Check your connection.'));
    return () => { cancelled = true; };
  }, [finish, onError, mode]);

  const handleGoogleClick = () => {
    if (disabled || pending) return;
    if (!GOOGLE_CLIENT_ID) { onError('Google sign-in is not set up yet. Please use email instead.'); return; }
    if (window.google?.accounts?.id) {
      setPending('google');
      window.google.accounts.id.prompt((n) => {
        if (n.isNotDisplayed() || n.isSkippedMoment()) {
          const btn = googleBtnRef.current?.querySelector('iframe') || googleBtnRef.current?.querySelector('div[role="button"]');
          if (btn) btn.click(); else setPending(null);
        }
      });
    } else {
      onError('Google is still loading. Please wait a moment and try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 my-4 sm:my-5">
        <div className="flex-1 h-px" style={{ background: B.line }} />
        <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase shrink-0" style={{ color: B.inkSoft }}>
          or {mode === 'register' ? 'sign up with' : 'continue with'}
        </span>
        <div className="flex-1 h-px" style={{ background: B.line }} />
      </div>
      <div className="flex flex-col gap-2.5 w-full">
        <div className="relative w-full">
          <motion.button
            type="button"
            onClick={handleGoogleClick}
            disabled={disabled || pending !== null}
            whileHover={{ y: (disabled || pending) ? 0 : -1 }}
            whileTap={{ scale: (disabled || pending) ? 1 : 0.98 }}
            className="w-full px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-[14px] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
            style={{ background: B.white, borderColor: '#e2e8f0', color: B.ink, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minHeight: '50px' }}
            aria-label={mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}
          >
            {pending === 'google' ? (
              <>
                <div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.12)', borderTopColor: B.gold }} />
                <span style={{ color: B.inkSoft }}>Connecting…</span>
              </>
            ) : (
              <>
                <GoogleGlyph />
                <span className="truncate">{mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}</span>
              </>
            )}
          </motion.button>
          <div ref={googleBtnRef} aria-hidden="true" className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ opacity: 0.011, colorScheme: 'light', pointerEvents: pending !== null ? 'none' : 'auto' }} />
        </div>
        <FacebookSignInButton disabled={disabled} pending={pending} mode={mode} onFinish={finish} onError={onError} />
      </div>
      <p className="text-center text-[12px] text-slate-500 mt-3.5 leading-relaxed px-1">
        By continuing, you agree to our{' '}
        <Link to="/privacy-policy" className="font-bold hover:underline underline-offset-2" style={{ color: B.goldDark }}>
          Privacy Policy
        </Link>
        . We only receive your name and email.
      </p>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN AUTH PORTAL — landing-matched, responsive, plain-language
// ══════════════════════════════════════════════════════════════════════════════
const YEAR = new Date().getFullYear();

export default function AuthPortal({ initialTab = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, logout, token, user, role } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  // Smooth: always start at top like landing page loads
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock scroll when mobile drawer open
  useEffect(() => {
    if (!mobileNav) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileNav]);

  const initParams = useMemo(() => {
    const p = new URLSearchParams(location.search);
    return {
      email: cleanParam(p.get('prefill_email')),
      name: cleanParam(p.get('prefill_name')),
      provider: cleanParam(p.get('provider')),
      error: cleanParam(p.get('error')),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deriveTab = useCallback(() => {
    if (location.pathname === '/register' || initParams.email || initParams.name || initParams.provider) return 'register';
    if (location.pathname === '/login') return 'login';
    return initialTab;
  }, [location.pathname, initParams, initialTab]);

  const [activeTab, setActiveTab] = useState(deriveTab);
  const [rateLimit, setRateLimit] = useState(null);
  const [error, setError] = useState(initParams.error || null);
  const [notice, setNotice] = useState(() => {
    if (initParams.provider) {
      const pName = initParams.provider.charAt(0).toUpperCase() + initParams.provider.slice(1).toLowerCase();
      return initParams.email
        ? `Connected with ${pName}! Your name and email are filled in — just create a password.`
        : `Connected with ${pName}! Your name is filled in — add your email and create a password.`;
    }
    return null;
  });
  const [submitting, setSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState(() => location.state?.email || localStorage.getItem('remember_email') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remember_email'));
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginFieldErrors, setLoginFieldErrors] = useState({});

  const [regName, setRegName] = useState(initParams.name);
  const [regEmail, setRegEmail] = useState(initParams.email);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPw, setRegConfirmPw] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw] = useState(false);
  const [regFieldErrors, setRegFieldErrors] = useState({});
  const [regSuccessModal, setRegSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    const newTab = location.pathname === '/register' ? 'register' : location.pathname === '/login' ? 'login' : null;
    if (newTab) setActiveTab(newTab);
  }, [location.pathname]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const email = cleanParam(p.get('prefill_email'));
    const name = cleanParam(p.get('prefill_name'));
    const provider = cleanParam(p.get('provider'));
    const err = cleanParam(p.get('error'));
    if (email) setRegEmail(email);
    if (name) setRegName(name);
    if (err) setError(err.slice(0, 200));
    if (email || name || provider) {
      setActiveTab('register');
      setError(null);
      if (provider) {
        const pName = provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
        setNotice(email
          ? `Connected with ${pName}! Name and email are filled in — just create a password.`
          : `Connected with ${pName}! Your name is filled in — add your email and create a password.`);
      }
    }
  }, [location.search]);

  const redirect = useCallback((userRole) => {
    const r = String(userRole || '').trim().toLowerCase();
    if (r === 'admin') navigate('/admin/dashboard');
    else if (r === 'therapist') navigate('/therapist/dashboard');
    else if (r === 'staff') navigate('/staff/dashboard');
    else navigate('/client/dashboard');
  }, [navigate]);

  useEffect(() => {
    if (token && user && role) redirect(role);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, role]);

  const handleTabSwitch = (tab) => {
    setError(null);
    setNotice(null);
    setRateLimit(null);
    setLoginFieldErrors({});
    setRegFieldErrors({});
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/register', { replace: true });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null); setNotice(null); setLoginFieldErrors({}); setRateLimit(null);
    const errs = {};
    if (!loginEmail.trim()) errs.email = 'Please enter your email address.';
    else if (!EMAIL_REGEX.test(loginEmail.trim())) errs.email = 'That email doesn’t look right. Example: name@email.com';
    if (!loginPassword) errs.password = 'Please enter your password.';
    else if (loginPassword.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (Object.keys(errs).length > 0) { setLoginFieldErrors(errs); return; }
    setSubmitting(true);
    if (rememberMe) localStorage.setItem('remember_email', loginEmail.trim());
    else localStorage.removeItem('remember_email');
    const res = await login(loginEmail.trim(), loginPassword);
    if (res.success) { setLoginPassword(''); redirect(res.role); return; }
    if (res.rateLimited) { setRateLimit(res.retryAfter || 3600); }
    else if (res.errors) {
      const m = {};
      Object.keys(res.errors).forEach((k) => { m[k] = res.errors[k][0]; });
      setLoginFieldErrors(m);
      setError('Please check the highlighted fields below.');
    } else { setError(res.error || 'Sign-in failed. Please check your email and password.'); }
    setSubmitting(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null); setNotice(null); setRegFieldErrors({}); setRateLimit(null);
    const errs = {};
    if (!regName.trim()) errs.name = 'Please enter your full name.';
    else if (regName.trim().length < 2) errs.name = 'Name must be at least 2 letters.';
    else if (!NAME_REGEX.test(regName.trim())) errs.name = 'Use letters, spaces, hyphens, periods or apostrophes only.';
    if (!regEmail.trim()) errs.email = 'Please enter your email address.';
    else if (!EMAIL_REGEX.test(regEmail.trim())) errs.email = 'That email doesn’t look right. Example: name@email.com';
    if (!regPassword) errs.password = 'Please create a password.';
    else if (!PASS_REGEX.test(regPassword)) errs.password = 'Add uppercase, lowercase, number & symbol (see checklist below).';
    if (!regConfirmPw) errs.confirmPassword = 'Please type your password again.';
    else if (regPassword !== regConfirmPw) errs.confirmPassword = 'Passwords don’t match. Try typing both again.';
    if (Object.keys(errs).length > 0) { setRegFieldErrors(errs); return; }
    setSubmitting(true);
    const res = await register(regName.trim(), regEmail.trim(), regPassword, regConfirmPw);
    setRegPassword(''); setRegConfirmPw('');
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
      Object.keys(res.errors).forEach((k) => { m[k] = res.errors[k][0]; });
      setRegFieldErrors(m);
      setError('Please check the highlighted fields below.');
    } else { setError(res.error); }
    setSubmitting(false);
  };

  const isLogin = activeTab === 'login';
  const trustPoints = isLogin ? TRUST_LOGIN : TRUST_REGISTER;

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900"
      style={{ fontFamily: "'Inter',sans-serif", background: B.canvas }}
    >
      {/* ── Ambient background (same family as landing) ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute rounded-full blur-3xl opacity-60" style={{ width: 520, height: 520, left: '-160px', top: '-160px', background: 'radial-gradient(circle, rgba(10,61,48,0.10) 0%, transparent 70%)' }} />
        <div className="absolute rounded-full blur-3xl opacity-60" style={{ width: 520, height: 520, right: '-160px', bottom: '-120px', background: 'radial-gradient(circle, rgba(191,161,95,0.14) 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar — identical system to landing page ── */}
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
          ? 'bg-[#04100a]/95 backdrop-blur-xl border-[rgba(191,161,95,0.22)] shadow-lg shadow-black/40'
          : 'bg-[#04100a]/70 backdrop-blur-md border-white/5'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'py-2.5' : 'py-3.5'}`}>
            <Link to="/" aria-label="Cozy Blissful Salon & Spa — home" className="flex items-center gap-3 group flex-shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa15f]/60">
              <div className="relative flex-shrink-0">
                <motion.div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid rgba(191,161,95,0.55)' }} animate={{ scale: [1, 1.22, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2.8, repeat: Infinity }} />
                <img src="/cb-logo.jpg" alt="Cozy Blissful Salon Spa" className="w-10 h-10 lg:w-11 lg:h-11 rounded-full object-cover relative z-10" style={{ border: '2px solid rgba(191,161,95,0.55)', boxShadow: '0 0 0 1px rgba(191,161,95,0.15),0 4px 20px rgba(0,0,0,0.4)' }} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 z-20" style={{ background: '#34d399', borderColor: '#041e16' }} />
              </div>
              <div className="leading-none">
                <span className="text-sm font-black tracking-wide text-white block group-hover:text-amber-200 transition-colors duration-300" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful</span>
                <span className="text-[9px] font-bold tracking-[0.18em] uppercase block mt-0.5" style={{ color: '#bfa15f' }}>Salon & Spa</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href} href={href}
                  onClick={(ev) => {
                    if (window.location.pathname === '/') {
                      ev.preventDefault();
                      const id = href.split('#')[1];
                      const el = document.getElementById(id);
                      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
                    } else {
                      ev.preventDefault();
                      navigate(`/${href.slice(1)}`);
                    }
                  }}
                  className="px-4 py-2 text-[13px] font-semibold tracking-wide text-white/70 hover:text-white transition-all duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa15f]/60"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2.5">
              <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                <ArrowLeft className="w-3.5 h-3.5 text-[#e8cc8a]" /> Back to Home
              </Link>
              <Link
                to={isLogin ? '/register' : '/login'}
                className="px-5 py-2.5 text-xs font-black text-[#041e16] rounded-xl hover:brightness-110 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)', boxShadow: '0 4px 18px rgba(191,161,95,0.45)' }}
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </Link>
            </div>

            <button
              type="button"
              aria-label={mobileNav ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileNav}
              onClick={() => setMobileNav((v) => !v)}
              className="lg:hidden relative flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-white active:scale-90 transition-all touch-manipulation"
            >
              {mobileNav ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div key="auth-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} aria-hidden className="lg:hidden fixed inset-0 z-[54] bg-black/60 backdrop-blur-sm" />
            <motion.aside
              key="auth-drawer" role="dialog" aria-modal="true" aria-label="Site navigation"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: EASE }}
              style={{ background: 'linear-gradient(180deg,#04100a 0%,#06251a 100%)' }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-[55] w-[86%] max-w-sm flex flex-col border-l border-[rgba(191,161,95,0.22)]"
            >
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <img src="/cb-logo.jpg" alt="" className="w-9 h-9 rounded-full object-cover" style={{ border: '2px solid rgba(191,161,95,0.55)' }} />
                  <span className="text-sm font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful</span>
                </div>
                <button type="button" aria-label="Close menu" onClick={() => setMobileNav(false)} className="flex items-center justify-center w-11 h-11 rounded-xl text-white/70 hover:bg-white/10 touch-manipulation">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-5 flex flex-col gap-1.5" aria-label="Mobile">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link key={href} to={`/${href}`} onClick={() => setMobileNav(false)} className="px-3.5 py-3 rounded-2xl text-white/80 text-[15px] font-semibold active:bg-white/10">
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-white/[0.06] bg-black/20 flex gap-2.5">
                <Link to="/" onClick={() => setMobileNav(false)} className="flex-1 text-center py-3 rounded-xl text-sm font-bold text-white/80 border border-white/10 bg-white/5">Home</Link>
                <Link to={isLogin ? '/register' : '/login'} onClick={() => setMobileNav(false)} className="flex-1 text-center py-3 rounded-xl text-sm font-bold text-[#041e16]" style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)' }}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-3 sm:px-6 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 w-full">
        {/* Breadcrumb — helps every user know where they are */}
        <motion.nav
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
          aria-label="Breadcrumb"
          className="w-full max-w-[980px] mb-3 sm:mb-4 flex items-center gap-1.5 text-[12.5px] font-medium px-1"
          style={{ color: B.inkSoft }}
        >
          <Link to="/" className="hover:underline underline-offset-2 hover:text-slate-800 transition-colors">Home</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span aria-current="page" className="font-bold text-slate-800">{isLogin ? 'Sign In' : 'Create Account'}</span>
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative w-full max-w-[980px] rounded-[22px] sm:rounded-[28px] overflow-hidden flex flex-col lg:flex-row border bg-white"
          style={{ borderColor: 'rgba(191,161,95,0.28)', boxShadow: '0 32px 80px rgba(4,30,22,0.16), 0 8px 32px rgba(191,161,95,0.12)' }}
        >
          {/* ─── Left Brand Panel ─── */}
          <div
            className="relative flex-col justify-between w-full lg:w-[42%] shrink-0 text-white overflow-hidden hidden md:flex p-7 lg:p-9"
            style={{ background: 'linear-gradient(160deg, #0a3d30 0%, #062b22 52%, #041e16 100%)' }}
          >
            <img
              src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=900&q=60"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-[0.16] pointer-events-none"
              loading="lazy"
            />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(4,30,22,0.15) 0%, rgba(4,30,22,0.55) 100%)' }} />
            <div className="absolute rounded-full pointer-events-none" style={{ width: 280, height: 280, right: -70, top: -70, border: '1.5px solid rgba(191,161,95,0.20)' }} />
            <div className="absolute rounded-full pointer-events-none" style={{ width: 180, height: 180, left: -50, bottom: 60, border: '1.5px solid rgba(191,161,95,0.14)' }} />

            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ background: 'rgba(191,161,95,0.14)', border: '1px solid rgba(191,161,95,0.35)', color: '#e8cc8a' }}>
                <Sparkles className="w-3 h-3" /> Premium Spa & Wellness
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28, ease: EASE }}>
                  <h2 className="text-[26px] lg:text-[30px] font-black leading-[1.15] tracking-tight mb-2.5 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {isLogin ? (<>Welcome back to<br /><em className="not-italic" style={{ color: B.goldLight }}>your calm.</em></>) : (<>Begin your<br /><em className="not-italic" style={{ color: B.goldLight }}>wellness journey.</em></>)}
                  </h2>
                  <p className="text-[13px] text-emerald-100/80 leading-relaxed max-w-[300px]">
                    {isLogin
                      ? 'Sign in with your email and password to book treatments and manage visits.'
                      : 'Create a free account — just your name, email and a secure password.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Rating */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <div className="flex gap-0.5" aria-label="Rated 4.9 out of 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#e8cc8a' }} aria-hidden="true" />
                  ))}
                </div>
                <p className="text-[11.5px] text-emerald-50/85 leading-snug"><strong className="text-white">4.9/5</strong> from 2,400+ happy guests</p>
              </div>

              <ul className="space-y-3.5 pt-1">
                {trustPoints.map((t) => (
                  <li key={t.title} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-2xl shrink-0" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <t.icon className="w-4 h-4" style={{ color: '#e8cc8a' }} />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-[13px] font-bold text-white mb-0.5">{t.title}</span>
                      <span className="block text-[12px] text-emerald-100/65 leading-relaxed">{t.note}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* How it works — plain language steps */}
              <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(191,161,95,0.10)', border: '1px solid rgba(191,161,95,0.25)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] mb-2.5" style={{ color: '#e8cc8a' }}>
                  {isLogin ? 'How signing in works' : 'How joining works'}
                </p>
                <ol className="space-y-2 text-[12px] text-emerald-50/85">
                  {(isLogin
                    ? ['Enter your email & password', 'Tap “Sign In” — we verify securely', 'Book or manage your visits']
                    : ['Fill in name, email & password', 'Tap “Create Account” — takes seconds', 'Sign in and book your first visit']
                  ).map((s, i) => (
                    <li key={s} className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black shrink-0" style={{ background: 'rgba(232,204,138,0.2)', color: '#e8cc8a', border: '1px solid rgba(232,204,138,0.4)' }}>{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="relative z-10 pt-5 mt-6 flex items-center justify-between border-t border-white/10 text-[11px] text-white/50">
              <p>© {YEAR} Cozy Blissful</p>
              <div className="flex gap-1.5">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:bg-white/20 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <s.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right Form Panel ─── */}
          <div className="flex-1 flex flex-col justify-center px-4 xs:px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 bg-white text-slate-800 min-w-0">
            <div className="w-full max-w-[460px] mx-auto">

              {/* Mobile brand strip — visible below md where panel hides */}
              <div className="md:hidden flex items-center gap-3 mb-5 p-3.5 rounded-2xl" style={{ background: 'linear-gradient(135deg,#041e16,#0a3d30)', border: '1px solid rgba(191,161,95,0.3)' }}>
                <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-11 h-11 rounded-2xl object-cover shrink-0" style={{ border: '2px solid rgba(191,161,95,0.6)' }} />
                <div className="min-w-0">
                  <p className="text-white text-[14px] font-black leading-tight truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {isLogin ? 'Welcome back to your calm.' : 'Begin your wellness journey.'}
                  </p>
                  <p className="text-[11.5px] text-emerald-100/70 leading-snug mt-0.5">
                    {isLogin ? 'Sign in to book & manage visits.' : 'Free account • Ready in under a minute.'}
                  </p>
                </div>
              </div>

              {/* Tab Switcher — 48px+ touch targets */}
              <div className="relative p-1.5 rounded-2xl mb-4 sm:mb-5 flex items-center bg-slate-100 border border-slate-200" role="tablist" aria-label="Choose sign in or create account">
                {[
                  { id: 'login', label: 'Sign In', sub: 'Welcome back', icon: LogIn },
                  { id: 'register', label: 'Create Account', sub: 'New here', icon: UserPlus },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === id}
                    aria-controls={id === 'login' ? 'panel-login' : 'panel-register'}
                    onClick={() => handleTabSwitch(id)}
                    className={`flex-1 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-sm font-extrabold transition-all relative flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3d30]/40 ${activeTab === id ? 'text-slate-950' : 'text-slate-500 hover:text-slate-800'}`}
                    style={{ minHeight: '48px' }}
                  >
                    {activeTab === id && (
                      <motion.div layoutId="active-auth-tab" className="absolute inset-0 bg-white rounded-xl border border-slate-200/90" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5 px-1">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: activeTab === id ? B.goldDark : '#94a3b8' }} />
                      <span className="truncate">{label}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* Helper line under tabs — plain language */}
              <p className="text-center text-[12.5px] leading-relaxed mb-4" style={{ color: B.inkSoft }}>
                {isLogin ? (<>New to Cozy Blissful? <button type="button" onClick={() => handleTabSwitch('register')} className="font-extrabold hover:underline underline-offset-2 cursor-pointer" style={{ color: B.goldDark }}>Create a free account</button> — it takes less than a minute.</>) : (<>Already have an account? <button type="button" onClick={() => handleTabSwitch('login')} className="font-extrabold hover:underline underline-offset-2 cursor-pointer" style={{ color: B.goldDark }}>Sign in instead</button>.</>)}
              </p>

              {/* Banners */}
              <div className="space-y-2.5 mb-4">
                <AnimatePresence mode="wait">
                  {notice && !error && (
                    <motion.div key="note" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl text-[13px] leading-relaxed"
                      style={{ background: 'rgba(191,161,95,0.10)', border: '1px solid rgba(191,161,95,0.38)', color: '#6b5a2e' }}>
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: B.gold }} />
                      <span className="font-semibold flex-1">{notice}</span>
                      <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="p-1 rounded-lg hover:bg-black/5 cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  {error && !rateLimit && (
                    <motion.div key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert"
                      className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl text-[13px] leading-relaxed bg-red-50 border border-red-200 text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                      <span className="font-semibold flex-1">{error}</span>
                      <button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="p-1 rounded-lg hover:bg-red-100 cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {rateLimit > 0 && <RateLimitBanner retryAfter={rateLimit} onDismiss={() => setRateLimit(null)} />}
              </div>

              {/* ── Forms ── */}
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="form-login" id="panel-login" role="tabpanel" aria-label="Sign in form"
                    initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <div className="mb-4 sm:mb-5">
                      <h1 className="text-[22px] sm:text-2xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to your account</h1>
                      <p className="text-[13px] sm:text-sm mt-1 leading-relaxed" style={{ color: B.inkSoft }}>Enter the email and password you registered with.</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5 sm:space-y-4">
                      <Field
                        label="Email address" id="login-email" name="email" type="email" inputMode="email"
                        autoComplete="email" required maxLength={254} icon={Mail}
                        value={loginEmail} placeholder="Example: maria@email.com" error={loginFieldErrors.email}
                        hint="Use the email you signed up with."
                        onChange={(e) => { setLoginEmail(e.target.value); if (loginFieldErrors.email) setLoginFieldErrors((p) => ({ ...p, email: '' })); }}
                      />
                      <Field
                        label="Password" id="login-password" name="password"
                        type={showLoginPw ? 'text' : 'password'} autoComplete="current-password"
                        required maxLength={128} icon={Lock} value={loginPassword}
                        placeholder="Enter your password" error={loginFieldErrors.password}
                        hint="Passwords are case-sensitive. Tap the eye to check."
                        onChange={(e) => { setLoginPassword(e.target.value); if (loginFieldErrors.password) setLoginFieldErrors((p) => ({ ...p, password: '' })); }}
                        rightEl={
                          <button
                            type="button" onClick={() => setShowLoginPw((v) => !v)}
                            aria-label={showLoginPw ? 'Hide password' : 'Show password'}
                            aria-pressed={showLoginPw}
                            className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 cursor-pointer touch-manipulation transition-all"
                          >
                            {showLoginPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                          </button>
                        }
                      />

                      <div className="flex items-center justify-between gap-3 text-[13px] pt-0.5">
                        <label htmlFor="remember-me" className="inline-flex items-center gap-2 cursor-pointer select-none py-2 pr-2 touch-manipulation">
                          <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-[18px] h-[18px] rounded cursor-pointer accent-[#0a3d30]" />
                          <span className="font-semibold text-slate-600">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="font-extrabold hover:underline underline-offset-2 transition-colors py-2 pl-2 whitespace-nowrap" style={{ color: B.goldDark }}>
                          Forgot password?
                        </Link>
                      </div>

                      <motion.button
                        type="submit" disabled={submitting || rateLimit > 0}
                        whileHover={{ y: submitting ? 0 : -1 }} whileTap={{ scale: submitting ? 1 : 0.98 }}
                        className="w-full flex justify-center items-center gap-2 rounded-2xl font-black text-[15px] text-[#041e16] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer touch-manipulation"
                        style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 50%, #cfa856 100%)', boxShadow: '0 6px 20px rgba(191,161,95,0.42)', minHeight: '52px' }}
                      >
                        {submitting
                          ? (<><div className="w-[18px] h-[18px] border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" /><span>Signing you in…</span></>)
                          : (<><LogIn className="w-[18px] h-[18px]" /><span>Sign In Securely</span></>)}
                      </motion.button>
                      <p className="flex items-center justify-center gap-1.5 text-[12px] font-medium" style={{ color: B.inkSoft }}>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Protected with encrypted sign-in
                      </p>
                    </form>

                    <SocialSignIn disabled={submitting} mode="login" onSuccess={redirect} onError={(msg) => { setRateLimit(null); setNotice(null); setError(msg); }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="form-register" id="panel-register" role="tabpanel" aria-label="Create account form"
                    initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <div className="mb-4 sm:mb-5">
                      <h1 className="text-[22px] sm:text-2xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Create your free account</h1>
                      <p className="text-[13px] sm:text-sm mt-1 leading-relaxed" style={{ color: B.inkSoft }}>Just 3 fields — name, email and a secure password.</p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5 sm:space-y-4">
                      <Field
                        label="Full name" id="reg-name" name="name" type="text"
                        autoComplete="name" required maxLength={100} icon={User}
                        value={regName} placeholder="Example: Maria Santos" error={regFieldErrors.name}
                        hint="Enter your real name so our therapists can greet you."
                        onChange={(e) => { setRegName(e.target.value); if (regFieldErrors.name) setRegFieldErrors((p) => ({ ...p, name: '' })); }}
                      />
                      <Field
                        label="Email address" id="reg-email" name="email" type="email"
                        inputMode="email" autoComplete="email" required maxLength={254} icon={Mail}
                        value={regEmail} placeholder="Example: maria@email.com" error={regFieldErrors.email}
                        hint="We’ll send booking confirmations here. Double-check spelling."
                        readOnly={!!initParams.email && regEmail === initParams.email}
                        onChange={(e) => { setRegEmail(e.target.value); if (regFieldErrors.email) setRegFieldErrors((p) => ({ ...p, email: '' })); }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-3">
                        <Field
                          label="Password" id="reg-password" name="password"
                          type={showRegPw ? 'text' : 'password'} autoComplete="new-password"
                          required maxLength={128} icon={Lock} value={regPassword}
                          placeholder="Min. 8 characters" error={regFieldErrors.password}
                          onChange={(e) => { setRegPassword(e.target.value); if (regFieldErrors.password) setRegFieldErrors((p) => ({ ...p, password: '' })); }}
                          rightEl={
                            <button type="button" onClick={() => setShowRegPw((v) => !v)} aria-label={showRegPw ? 'Hide password' : 'Show password'}
                              className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 cursor-pointer touch-manipulation transition-all">
                              {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                        <Field
                          label="Repeat password" id="reg-confirm-password" name="confirm_password"
                          type={showRegConfirmPw ? 'text' : 'password'} autoComplete="new-password"
                          required maxLength={128} icon={Lock} value={regConfirmPw}
                          placeholder="Type it again" error={regFieldErrors.confirmPassword}
                          onChange={(e) => { setRegConfirmPw(e.target.value); if (regFieldErrors.confirmPassword) setRegFieldErrors((p) => ({ ...p, confirmPassword: '' })); }}
                          rightEl={
                            <button type="button" onClick={() => setShowRegConfirmPw((v) => !v)} aria-label={showRegConfirmPw ? 'Hide password' : 'Show password'}
                              className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 cursor-pointer touch-manipulation transition-all">
                              {showRegConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                      </div>

                      <PasswordStrength password={regPassword} />

                      <motion.button
                        type="submit" disabled={submitting || rateLimit > 0}
                        whileHover={{ y: submitting ? 0 : -1 }} whileTap={{ scale: submitting ? 1 : 0.98 }}
                        className="w-full flex justify-center items-center gap-2 rounded-2xl font-black text-[15px] text-[#041e16] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer touch-manipulation"
                        style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 50%, #cfa856 100%)', boxShadow: '0 6px 20px rgba(191,161,95,0.42)', minHeight: '52px' }}
                      >
                        {submitting
                          ? (<><div className="w-[18px] h-[18px] border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" /><span>Creating account…</span></>)
                          : (<><UserPlus className="w-[18px] h-[18px]" /><span>Create Free Account</span></>)}
                      </motion.button>
                      <p className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-center leading-relaxed px-2" style={{ color: B.inkSoft }}>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> No spam, no fees — just easier bookings.
                      </p>
                    </form>

                    <SocialSignIn disabled={submitting} mode="register" onSuccess={redirect} onError={(msg) => { setRateLimit(null); setNotice(null); setError(msg); }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust strip — same language for everyone */}
              <div className="grid grid-cols-3 gap-2 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100">
                {[
                  { icon: ShieldCheck, text: 'Encrypted & secure' },
                  { icon: Clock, text: 'Open 9 AM – 9 PM' },
                  { icon: Star, text: '4.9★ loved by guests' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center">
                    <Icon className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-500 leading-tight">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Help line */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-4 sm:mt-5 text-[12.5px] sm:text-[13px] text-center px-4 leading-relaxed"
          style={{ color: B.inkSoft }}
        >
          Need help signing in?{' '}
          <a href="https://wa.me/639995435913" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline underline-offset-2" style={{ color: B.goldDark }}>
            Chat with us on WhatsApp
          </a>{' '}
          — we reply within minutes.
        </motion.p>
      </main>

      {/* ── Footer — matches landing tone ── */}
      <footer className="relative z-10 shrink-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center border-t" style={{ borderColor: 'rgba(191,161,95,0.2)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
        <p className="text-[11.5px] sm:text-xs" style={{ color: B.inkSoft }}>© {YEAR} Cozy Blissful Salon & Spa • Luxury Specialist Sanctuary</p>
        <p className="mt-1">
          <Link to="/privacy-policy" className="text-[11.5px] sm:text-xs font-bold hover:underline underline-offset-2" style={{ color: B.goldDark }}>
            Privacy Policy
          </Link>
        </p>
      </footer>

      {/* ── Registration Success Modal — large touch, responsive ── */}
      <AnimatePresence>
        {regSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm"
            role="dialog" aria-modal="true" aria-labelledby="reg-success-title"
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="bg-white text-slate-900 rounded-t-[24px] sm:rounded-[28px] p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-100 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', border: '2px solid #34d399' }}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <div>
                <h3 id="reg-success-title" className="text-[22px] font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Account created!</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mt-1.5">
                  Welcome to Cozy Blissful! Your account for <strong className="text-slate-800 break-all">{registeredEmail}</strong> is ready. Sign in to book your first visit.
                </p>
              </div>
              <ol className="text-left text-[12.5px] text-slate-500 space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" /> Step 1 done — account created</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" /> Next — sign in below</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" /> Then — pick a service & book</li>
              </ol>
              <button
                type="button"
                onClick={() => { setRegSuccessModal(false); handleTabSwitch('login'); setNotice('Account ready! Please sign in with your new password.'); setLoginEmail(registeredEmail); }}
                className="w-full rounded-2xl font-black text-[15px] text-[#041e16] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] touch-manipulation"
                style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)', minHeight: '52px', boxShadow: '0 6px 20px rgba(191,161,95,0.4)' }}
              >
                Sign In Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
