import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle, Clock, Check, ArrowRight, Sparkles, Shield, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Social links (update hrefs when ready) ───────────────────────────────────
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

// ─── Floating orb ─────────────────────────────────────────────────────────────
const FloatingOrb = ({ style, delay = 0, duration = 9 }) => (
  <motion.div className="absolute rounded-full pointer-events-none blur-3xl" style={style}
    animate={{ y: [0, -20, 0], x: [0, 8, 0], opacity: [0.18, 0.38, 0.18] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }} />
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
      style={{ background: 'rgba(253,230,138,0.07)', border: '1px solid rgba(253,230,138,0.18)' }}>
      <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-px" />
      <span style={{ color: 'rgba(253,230,138,0.85)' }}>
        <strong>Too many attempts.</strong>{' '}
        {s > 0 ? `Retry in ${m > 0 ? `${m}m ` : ''}${sec}s.` : 'You may try again.'}
      </span>
    </motion.div>
  );
};

// ─── Glass input ──────────────────────────────────────────────────────────────
const Input = ({ label, id, error, rightEl, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-bold tracking-widest uppercase mb-1"
        style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</label>
      <div className="relative">
        <input id={id} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full text-sm rounded-lg outline-none transition-all duration-150"
          style={{
            background: focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
            border: error ? '1px solid rgba(248,113,113,0.5)' : focused ? '1px solid rgba(191,161,95,0.55)' : '1px solid rgba(255,255,255,0.09)',
            color: '#fff', padding: rightEl ? '0.55rem 2.5rem 0.55rem 0.8rem' : '0.55rem 0.8rem',
            boxShadow: focused && !error ? '0 0 0 3px rgba(191,161,95,0.07)' : 'none',
            caretColor: '#e8cc8a',
          }} {...props} />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-0.5 text-[11px] flex items-center gap-1" style={{ color: '#f87171' }}>
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
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

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null); setFieldErrors({}); setRateLimit(null);
    if (!validate()) return;
    setSubmitting(true);
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
    <div className="h-screen flex overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg,#041e16 0%,#062c22 55%,#0a3d30 100%)' }}>

      {/* ═══════════ LEFT BRANDING PANEL ═══════════ */}
      <div className="hidden lg:flex flex-col h-full w-[52%] xl:w-[54%] relative overflow-hidden px-10 xl:px-14 py-8">

        {/* Orbs */}
        <FloatingOrb style={{ width: 400, height: 400, right: '-10%', top: '8%', background: 'radial-gradient(circle,rgba(191,161,95,0.15) 0%,transparent 70%)' }} duration={13} />
        <FloatingOrb style={{ width: 260, height: 260, left: '-4%', bottom: '12%', background: 'radial-gradient(circle,rgba(52,201,158,0.09) 0%,transparent 70%)' }} delay={4} duration={15} />

        {/* SVG rings */}
        <svg className="absolute right-0 bottom-0 pointer-events-none" width="420" height="420" viewBox="0 0 420 420" style={{ opacity: 0.045 }}>
          <circle cx="360" cy="360" r="210" stroke="#bfa15f" strokeWidth="1" fill="none"/>
          <circle cx="360" cy="360" r="150" stroke="#fff" strokeWidth="0.6" fill="none"/>
          <circle cx="360" cy="360" r="90"  stroke="#bfa15f" strokeWidth="0.4" fill="none"/>
        </svg>

        {/* Logo */}
        <div className="flex items-center gap-2.5 z-10 mb-6 flex-shrink-0">
          <div className="relative">
            <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-10 h-10 rounded-full object-cover"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)', border: '2px solid rgba(191,161,95,0.45)' }} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2" style={{ borderColor: '#041e16' }} />
          </div>
          <div>
            <p className="text-sm font-black tracking-wide text-white leading-none">Cozy Blissful</p>
            <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ color: '#e8cc8a' }}>Home Service Spa</p>
          </div>
        </div>

        {/* Badge + Headline */}
        <div className="z-10 mb-5 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 mb-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(191,161,95,0.22)' }}>
            <Sparkles className="w-3 h-3" />
            <span>Premium Home Service Spa &amp; Wellness</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight mb-2">
            Spa-Quality<br />
            <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(135deg,#e8cc8a 0%,#bfa15f 55%,#d4b87a 100%)', backgroundClip: 'text' }}>
              At Your Door.
            </span>
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)', maxWidth: '24rem' }}>
            Massage therapy &amp; nail care delivered to your home. 7 days a week, 6 AM – 11 PM.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4 z-10 flex-shrink-0">
          {STATS.map(s => (
            <div key={s.label} className="rounded-lg px-2 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm font-black leading-none mb-0.5" style={{ color: '#e8cc8a' }}>{s.value}</p>
              <p className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Services */}
        <div className="mb-4 z-10 flex-shrink-0">
          <p className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>Our Services</p>
          <div className="flex flex-col gap-1.5">
            {SERVICES.map(s => (
              <div key={s.name} className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{s.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>{s.name}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(191,161,95,0.14)', color: '#e8cc8a' }}>{s.note}</span>
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
        style={{ background: 'rgba(2,8,5,0.58)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <img src="/cb-logo.jpg" alt="" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid rgba(191,161,95,0.4)' }} />
          <div>
            <p className="text-xs font-black text-white leading-none">Cozy Blissful</p>
            <p className="text-[8px] font-bold tracking-widest uppercase mt-px" style={{ color: '#e8cc8a' }}>Home Service Spa</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[320px] lg:max-w-[300px] xl:max-w-[320px]">

          {/* Header */}
          <div className="mb-5">
            <h1 className="text-[1.5rem] font-black text-white tracking-tight leading-none">Welcome back</h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign in to your Cozy Blissful account</p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {rateLimit !== null && <motion.div key="rl" className="mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RateLimitBanner retryAfter={rateLimit} /></motion.div>}
          </AnimatePresence>
          <AnimatePresence>
            {error && !rateLimit && (
              <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-2.5 rounded-lg text-[11px] mb-3"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)' }}>
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-px" />
                <span style={{ color: '#fca5a5' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <Input label="Email address" id="login-email" type="email" autoComplete="email" required
              value={email} placeholder="you@example.com" error={fieldErrors.email}
              onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: '' })); }} />

            <Input label="Password" id="login-password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required
              value={password} placeholder="••••••••" error={fieldErrors.password}
              onChange={e => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' })); }}
              rightEl={
                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="transition-opacity" style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              } />

            <motion.button type="submit" id="login-submit" disabled={submitting || rateLimit > 0}
              whileHover={{ scale: submitting ? 1 : 1.015 }} whileTap={{ scale: submitting ? 1 : 0.975 }}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#c9a851,#e8cc8a)', color: '#041e16', boxShadow: '0 5px 20px rgba(191,161,95,0.25)', letterSpacing: '0.015em' }}>
              {submitting
                ? <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(4,30,22,0.2)', borderTopColor: '#041e16' }} />
                : <><LogIn className="w-3.5 h-3.5" /><span>Sign in</span></>}
            </motion.button>
          </form>

          {/* Divider + links */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.36)' }}>
            No account?{' '}
            <Link to="/register" className="font-bold hover:underline underline-offset-2" style={{ color: '#e8cc8a' }}>
              Create one free
            </Link>
          </p>
          <div className="mt-3 text-center">
            <Link to="/" className="inline-flex items-center gap-1 text-[11px] transition-colors"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
