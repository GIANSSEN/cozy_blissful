import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Eye, EyeOff, AlertCircle, Clock, Check, X, ArrowRight, Sparkles, Shield, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Social links ─────────────────────────────────────────────────────────────
const SOCIALS = [
  { label: 'Facebook',  href: '#', color: '#1877F2', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { label: 'Instagram', href: '#', color: '#E4405F', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { label: 'TikTok',    href: '#', color: '#ffffff', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  { label: 'YouTube',   href: '#', color: '#FF0000', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { label: 'WhatsApp',  href: '#', color: '#25D366', icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> },
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

const AppleGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true" style={{ color: '#000' }}>
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.08 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.48-2.53 3.23l-.07-.04c-.98.95-2.05.8-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.08 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.48-2.53 3.23l-.07-.04zM12.03 7.25c-.15-2.23-2.04-4.05-4.2-3.95-2.05 1.51-2.08 3.72-.04 5.25.44-.35.88-.64 1.37-.79.49-.15 1.02-.2 1.56-.1.35.07.69.18 1.02.32.41-.44.74-.91.99-1.4.15-.28.27-.57.3-.33z"/>
  </svg>
);

const SocialTile = ({ label, onClick, disabled, pending, children }) => (
  <motion.button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
    whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -1 }} whileTap={{ scale: disabled ? 1 : 0.95 }}
    className="w-[68px] h-11 rounded-lg flex items-center justify-center bg-white disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ border: '1px solid #ecf0f1', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    {pending
      ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.15)', borderTopColor: '#bfa15f' }} />
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
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.1)' }} />
        <span className="text-[11px]" style={{ color: 'rgba(0,0,0,0.5)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.1)' }} />
      </div>

      <div className="flex items-center justify-center gap-3"
        style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        {GOOGLE_CLIENT_ID && (
          <div className="relative w-[68px] h-11">
            {/* Official Google-rendered icon button (brand compliant), stretched over the tile */}
            <div className="absolute inset-0 rounded-lg bg-white flex items-center justify-center pointer-events-none"
              style={{ border: '1px solid #ecf0f1', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {pending === 'google'
                ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.15)', borderTopColor: '#041e16' }} />
                : <GoogleGlyph />}
            </div>
            <div ref={googleBtnRef} aria-label="Sign up with Google" title="Sign up with Google"
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ opacity: googleReady && pending !== 'google' ? 0.011 : 0, colorScheme: 'light' }} />
          </div>
        )}

        {FACEBOOK_APP_ID && (
          <SocialTile label="Sign up with Facebook" onClick={handleFacebook}
            disabled={!fbReady || pending !== null} pending={pending === 'facebook'}>
            <FacebookGlyph />
          </SocialTile>
        )}

        {/* Apple Sign-In Button */}
        <SocialTile label="Sign up with Apple" onClick={() => { /* Apple OAuth coming soon */ }}
          disabled={true} pending={false}>
          <AppleGlyph />
        </SocialTile>
      </div>
    </div>
  );
};

const StrengthChecks = [
  { key: 'len', label: '8+ chars',     test: p => p.length >= 8 },
  { key: 'up',  label: 'Uppercase',    test: p => /[A-Z]/.test(p) },
  { key: 'lo',  label: 'Lowercase',    test: p => /[a-z]/.test(p) },
  { key: 'num', label: 'Number',       test: p => /\d/.test(p) },
  { key: 'sp',  label: 'Special char', test: p => /[@$!%*?&]/.test(p) },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FloatingOrb = ({ style, delay = 0, duration = 9 }) => (
  <motion.div className="absolute rounded-full pointer-events-none blur-3xl" style={style}
    animate={{ y: [0, -20, 0], x: [0, 8, 0], opacity: [0.18, 0.38, 0.18] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }} />
);

const PasswordStrength = ({ password }) => {
  const results = StrengthChecks.map(c => ({ ...c, ok: c.test(password) }));
  const passed = results.filter(r => r.ok).length;
  const barColor = ['#ef4444','#f97316','#eab308','#22c55e','#16a34a'][passed - 1] ?? 'rgba(255,255,255,0.08)';
  const label = ['Very weak','Weak','Fair','Strong','Very strong'][passed - 1] ?? '';
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
      className="overflow-hidden mt-1.5 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 flex-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-200"
              style={{ background: i < passed ? barColor : 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
        {label && <span className="text-[9px] font-semibold" style={{ color: barColor, minWidth: '4rem', textAlign: 'right' }}>{label}</span>}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {results.map(r => (
          <div key={r.key} className="flex items-center gap-1">
            {r.ok ? <Check className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" /> : <X className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }} />}
            <span className="text-[9px]" style={{ color: r.ok ? 'rgba(52,201,158,0.8)' : 'rgba(255,255,255,0.28)' }}>{r.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

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
      style={{ background: 'rgba(191,161,95,0.07)', border: '1px solid rgba(191,161,95,0.18)' }}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#bfa15f' }} />
      <span style={{ color: 'rgba(167,146,97,0.85)' }}>
        <strong>Too many attempts.</strong>{' '}
        {s > 0 ? `Retry in ${m > 0 ? `${m}m ` : ''}${sec}s.` : 'You may try again.'}
      </span>
    </motion.div>
  );
};

const Input = ({ label, id, error, rightEl, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-bold tracking-widest uppercase mb-1"
        style={{ color: 'rgba(255,255,255,0.68)' }}>{label}</label>
      <div className="relative">
        <input id={id} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full text-sm rounded-lg outline-none transition-all duration-150"
          style={{
            background: focused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
            border: error ? '1px solid rgba(191,161,95,0.6)' : focused ? '1px solid rgba(191,161,95,0.6)' : '1px solid rgba(255,255,255,0.1)',
            color: '#fff', padding: rightEl ? '0.5rem 2.5rem 0.5rem 0.75rem' : '0.5rem 0.75rem',
            boxShadow: focused && !error ? '0 0 0 3px rgba(191,161,95,0.1)' : 'none',
            caretColor: '#bfa15f',
          }} {...props} />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-0.5 text-[11px] flex items-center gap-1" style={{ color: '#ff6b6b' }}>
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const emailRe = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const passRe  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required.';
    else if (name.trim().length < 2) e.name = 'At least 2 characters.';
    else if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) e.name = 'Letters, spaces, hyphens only.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!emailRe.test(email.trim())) e.email = 'Enter a valid email.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'At least 8 characters.';
    else if (!passRe.test(password)) e.password = 'Must include upper, lower, number & special.';
    if (!confirmPw) e.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPw) e.confirmPassword = 'Passwords do not match.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const clear = key => setFieldErrors(p => ({ ...p, [key]: '' }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null); setFieldErrors({}); setRateLimit(null);
    if (!validate()) return;
    setSubmitting(true);
    const res = await register(name.trim(), email.trim(), password, confirmPw);
    if (res.success) {
      if (res.role === 'admin') navigate('/admin/dashboard');
      else if (res.role === 'therapist') navigate('/therapist/dashboard');
      else if (res.role === 'staff') navigate('/staff/dashboard');
      else navigate('/booking/dashboard');
      return;
    }
    if (res.rateLimited) setRateLimit(res.retryAfter || 3600);
    else if (res.errors) {
      const m = {}; Object.keys(res.errors).forEach(k => { m[k === 'password_confirmation' ? 'confirmPassword' : k] = res.errors[k][0]; });
      setFieldErrors(m); setError('Please fix the errors below.');
    } else setError(res.error);
    setSubmitting(false);
  };

  const eyeBtn = (show, toggle, label) => (
    <button type="button" tabIndex={-1} onClick={toggle} aria-label={label}
      className="transition-opacity" style={{ color: 'rgba(255,255,255,0.3)' }}
      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
      {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
    </button>
  );

  return (
    <div className="h-screen flex overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg,#041e16 0%,#073328 55%,#0e4d38 100%)' }}>

      {/* ═══════════ LEFT BRANDING PANEL ═══════════ */}
      <div className="hidden lg:flex flex-col h-full w-[52%] xl:w-[54%] relative overflow-hidden px-10 xl:px-14 py-8">

        <FloatingOrb style={{ width: 400, height: 400, right: '-10%', top: '8%', background: 'radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)' }} duration={13} />
        <FloatingOrb style={{ width: 260, height: 260, left: '-4%', bottom: '12%', background: 'radial-gradient(circle,rgba(255,255,255,0.09) 0%,transparent 70%)' }} delay={4} duration={15} />

        <svg className="absolute right-0 bottom-0 pointer-events-none" width="420" height="420" viewBox="0 0 420 420" style={{ opacity: 0.045 }}>
          <circle cx="360" cy="360" r="210" stroke="#ffffff" strokeWidth="1" fill="none"/>
          <circle cx="360" cy="360" r="150" stroke="#fff" strokeWidth="0.6" fill="none"/>
          <circle cx="360" cy="360" r="90"  stroke="#ffffff" strokeWidth="0.4" fill="none"/>
        </svg>

        {/* Logo */}
        <div className="flex items-center gap-2.5 z-10 mb-6 flex-shrink-0">
          <div className="relative">
            <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-10 h-10 rounded-full object-cover"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)', border: '2px solid rgba(255,255,255,0.5)' }} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2" style={{ borderColor: '#041e16' }} />
          </div>
          <div>
            <p className="text-sm font-black tracking-wide text-white leading-none">Cozy Blissful</p>
            <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.95)' }}>Home Service Spa</p>
          </div>
        </div>

        {/* Badge + Headline */}
        <div className="z-10 mb-5 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white mb-3"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Sparkles className="w-3 h-3" />
            <span>Join 2,500+ Happy Clients Today</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight mb-2">
            Start Your<br />
            <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(135deg,rgba(255,255,255,0.95) 0%,rgba(255,255,255,0.8) 55%,rgba(255,255,255,0.9) 100%)', backgroundClip: 'text' }}>
              Wellness Journey.
            </span>
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)', maxWidth: '24rem' }}>
            Massage therapy &amp; nail care delivered to your home. 7 days a week, 6 AM – 11 PM.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4 z-10 flex-shrink-0">
          {STATS.map(s => (
            <div key={s.label} className="rounded-lg px-2 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm font-black leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.95)' }}>{s.value}</p>
              <p className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Services */}
        <div className="mb-4 z-10 flex-shrink-0">
          <p className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Our Services</p>
          <div className="flex flex-col gap-1.5">
            {SERVICES.map(s => (
              <div key={s.name} className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{s.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>{s.name}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.95)' }}>{s.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social links */}
        <div className="z-10 flex-shrink-0">
          <p className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>Follow &amp; Connect</p>
          <div className="flex gap-2">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.42)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = s.color; e.currentTarget.style.borderColor = s.color + '66'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <s.icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT FORM PANEL ═══════════ */}
      <div className="flex flex-1 h-full items-center justify-center px-5 sm:px-8 relative overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.95)', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>

        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <img src="/cb-logo.jpg" alt="" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid rgba(220,53,69,0.3)' }} />
          <div>
            <p className="text-xs font-black text-gray-800 leading-none">Cozy Blissful</p>
            <p className="text-[8px] font-bold tracking-widest uppercase mt-px" style={{ color: '#DC3545' }}>Home Service Spa</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[320px] lg:max-w-[300px] xl:max-w-[320px] mt-16 lg:mt-0">

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-[1.4rem] font-black text-gray-800 tracking-tight leading-none">Create account</h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.55)' }}>Join Cozy Blissful — it's free</p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {rateLimit !== null && <motion.div key="rl" className="mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RateLimitBanner retryAfter={rateLimit} /></motion.div>}
          </AnimatePresence>
          <AnimatePresence>
            {error && !rateLimit && (
              <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-2.5 rounded-lg text-[11px] mb-3"
                style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.22)' }}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#dc2626' }} />
                <span style={{ color: '#b91c1c' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
            <Input label="Full name" id="register-name" type="text" autoComplete="name" required
              value={name} placeholder="Jane Smith" error={fieldErrors.name}
              onChange={e => { setName(e.target.value); clear('name'); }} />

            <Input label="Email address" id="register-email" type="email" autoComplete="email" required
              value={email} placeholder="you@example.com" error={fieldErrors.email}
              onChange={e => { setEmail(e.target.value); clear('email'); }} />

            <div>
              <Input label="Password" id="register-password" type={showPw ? 'text' : 'password'} autoComplete="new-password" required
                value={password} placeholder="••••••••" error={fieldErrors.password}
                onChange={e => { setPassword(e.target.value); clear('password'); }}
                rightEl={eyeBtn(showPw, () => setShowPw(v => !v), showPw ? 'Hide' : 'Show')} />
              <AnimatePresence>
                {password && !fieldErrors.password && <PasswordStrength password={password} />}
              </AnimatePresence>
            </div>

            <Input label="Confirm password" id="register-confirm" type={showCPw ? 'text' : 'password'} autoComplete="new-password" required
              value={confirmPw} placeholder="••••••••" error={fieldErrors.confirmPassword}
              onChange={e => { setConfirmPw(e.target.value); clear('confirmPassword'); }}
              rightEl={eyeBtn(showCPw, () => setShowCPw(v => !v), showCPw ? 'Hide' : 'Show')} />

            <motion.button type="submit" id="register-submit" disabled={submitting || rateLimit > 0}
              whileHover={{ scale: submitting ? 1 : 1.015 }} whileTap={{ scale: submitting ? 1 : 0.975 }}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#a89658,#bfa15f)', color: '#041e16', boxShadow: '0 5px 20px rgba(191,161,95,0.25)', letterSpacing: '0.015em' }}>
              {submitting
                ? <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#041e16' }} />
                : <><UserPlus className="w-3.5 h-3.5" /><span>Create account</span></>}
            </motion.button>
          </form>

          {/* Social quick signup */}
          <SocialSignIn
            disabled={submitting}
            onSuccess={redirect}
            onError={(msg) => { setRateLimit(null); setError(msg); }}
          />

          <p className="text-center text-[11px] mt-5" style={{ color: 'rgba(0,0,0,0.65)' }}>
            Have an account?{' '}
            <Link to="/login" className="font-bold hover:underline underline-offset-2" style={{ color: '#bfa15f' }}>
              Sign in
            </Link>
          </p>
          <div className="mt-2.5 text-center">
            <Link to="/" className="inline-flex items-center gap-1 text-[11px] transition-colors"
              style={{ color: 'rgba(0,0,0,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.35)'}>
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
