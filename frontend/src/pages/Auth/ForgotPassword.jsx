import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, ArrowLeft, CheckCircle2, AlertCircle, Sparkles,
  Send, Clock, ShieldCheck, Inbox, RefreshCw,
} from 'lucide-react';
import API from '../../api/axios';

// ─── Brand palette (matches Login / Register) ──────────────────────────────────
const B = {
  deep: '#041e16',
  green: '#0a3d30',
  mid: '#0f5c47',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
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

// ─── Decorative helpers (same as Login/Register) ──────────────────────────────
const Particle = ({ style, delay = 0, duration = 9 }) => (
  <motion.div className="absolute rounded-full pointer-events-none" style={style}
    animate={{ y: [0, -14, 0], x: [0, 6, 0], opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }} />
);

const DotGrid = ({ rows = 4, cols = 8, className = '' }) => (
  <div className={`grid gap-[6px] pointer-events-none ${className}`}
    style={{ gridTemplateColumns: `repeat(${cols}, 4px)` }}>
    {Array.from({ length: rows * cols }).map((_, i) => (
      <span key={i} className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.22)' }} />
    ))}
  </div>
);

// ─── Shared Input (same as Login/Register) ────────────────────────────────────
const Input = ({ label, id, icon: Icon, error, rightEl, ...props }) => {
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
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl outline-none transition-all duration-200 bg-white"
          style={{
            fontSize: '16px',
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

// ─── Main ForgotPassword component ────────────────────────────────────────────
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldError, setFieldError] = useState('');

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldError('');
    const trimmed = email.trim();
    if (!trimmed) { setFieldError('Please enter your email address.'); return; }
    if (!emailRegex.test(trimmed)) { setFieldError('Please enter a valid email address.'); return; }

    setSubmitting(true);
    try {
      const res = await API.post('/forgot-password', { email: trimmed });
      setSuccessMsg(res.data.message || 'If an account with that email exists, a reset link has been sent.');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail('');
    setSuccessMsg('');
    setError('');
    setFieldError('');
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: 'linear-gradient(135deg,#f0f4f8 0%,#e8edf3 100%)',
        padding: 'clamp(8px, 2vw, 24px)',
      }}>

      {/* Ambient background blobs */}
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
          maxWidth: 'min(900px, 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 18px rgba(0,0,0,0.06)',
          maxHeight: 'calc(100vh - clamp(16px, 4vw, 48px))',
        }}>

        {/* ─── Left brand panel (md+) ─── */}
        <div
          className="hidden md:flex flex-col justify-between relative overflow-y-auto no-scrollbar flex-shrink-0"
          style={{
            width: 'clamp(200px, 42%, 380px)',
            padding: 'clamp(16px, 3vw, 28px)',
            background: `linear-gradient(155deg, ${B.mid} 0%, ${B.green} 45%, ${B.deep} 100%)`,
          }}>

          {/* Decorative shapes */}
          <div className="absolute rounded-full" style={{ width: 200, height: 200, right: -70, top: -70, border: '36px solid rgba(255,255,255,0.05)' }} />
          <div className="absolute rounded-full" style={{ width: 140, height: 140, left: -45, bottom: -45, background: 'rgba(191,161,95,0.12)', border: '1px solid rgba(191,161,95,0.2)' }} />
          <Particle style={{ width: 14, height: 14, left: 24, top: '35%', background: 'rgba(255,255,255,0.2)' }} delay={0} duration={7} />
          <Particle style={{ width: 8, height: 8, right: 40, top: '25%', background: 'rgba(191,161,95,0.5)' }} delay={2} duration={9} />
          <Particle style={{ width: 12, height: 12, right: 24, bottom: '30%', background: 'rgba(255,255,255,0.15)' }} delay={1.5} duration={8} />
          <DotGrid rows={4} cols={7} className="absolute right-6 top-14 opacity-60" />
          <DotGrid rows={3} cols={5} className="absolute left-6 bottom-14 opacity-40" />

          {/* Top content */}
          <div className="relative z-10">
            {/* Brand pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold mb-4"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>
              <Sparkles className="w-2.5 h-2.5" style={{ color: B.goldLight }} />
              <span>Cozy Blissful Spa & Wellness</span>
            </div>

            {/* Heading */}
            <h2 className="font-black text-white leading-tight tracking-tight mb-1"
              style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)' }}>
              Forgot Your
            </h2>
            <h3 className="font-black mb-3 italic" style={{ color: B.goldLight, fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
              Password?
            </h3>
            <p className="text-[11px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '16rem' }}>
              No worries — it happens to the best of us. Enter your registered email and we'll send a secure reset link straight to your inbox.
            </p>

            {/* Steps */}
            <div className="flex flex-col gap-2.5 mb-5">
              {[
                { n: '1', text: 'Enter your email address below' },
                { n: '2', text: 'Check your inbox for the reset link' },
                { n: '3', text: 'Click the link and set a new password' },
              ].map(step => (
                <div key={step.n} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(191,161,95,0.18)', border: '1px solid rgba(191,161,95,0.4)' }}>
                    <span className="text-[10px] font-black" style={{ color: B.goldLight }}>{step.n}</span>
                  </div>
                  <span className="text-[11px]" style={{ color: 'rgba(220,250,240,0.8)' }}>{step.text}</span>
                </div>
              ))}
            </div>

            {/* Info card */}
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(191,161,95,0.22)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(191,161,95,0.15)' }}>
                  <Mail className="w-3 h-3" style={{ color: B.goldLight }} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: B.goldLight }}>
                  Gmail SMTP Delivery
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { icon: <Clock className="w-2.5 h-2.5" />, text: 'Link valid for 60 minutes' },
                  { icon: <ShieldCheck className="w-2.5 h-2.5" />, text: 'Sent via secure Gmail SMTP' },
                  { icon: <Inbox className="w-2.5 h-2.5" />, text: 'Check spam if not in inbox' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span style={{ color: 'rgba(232,204,138,0.7)' }}>{row.icon}</span>
                    <span className="text-[10px]" style={{ color: 'rgba(220,250,240,0.6)' }}>{row.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="relative z-10 pt-3">
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
            padding: 'clamp(16px, 3vw, 32px) clamp(16px, 5vw, 40px)',
          }}>
          <div className="w-full" style={{ maxWidth: 'clamp(280px, 90%, 360px)' }}>

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

            {/* Logo + heading */}
            <div className="flex flex-col items-center mb-4 text-center">
              <motion.div className="relative mb-2"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ boxShadow: `0 6px 20px rgba(191,161,95,0.2), 0 2px 6px rgba(0,0,0,0.08)`, background: B.white, border: `1.5px solid ${B.line}` }}>
                  <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-8 h-8 rounded-xl object-cover" />
                </div>
                {/* Mail badge overlay */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: `linear-gradient(135deg, ${B.gold}, ${B.goldLight})` }}>
                  <Mail className="w-2.5 h-2.5" style={{ color: B.deep }} />
                </div>
              </motion.div>
              <h1 className="text-base font-black tracking-tight mb-0.5" style={{ color: B.ink }}>Reset Password</h1>
              <p className="text-[11px]" style={{ color: B.inkSoft }}>
                {submitted ? 'Check your inbox for the reset link' : 'Enter your email to receive a secure reset link'}
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="err"
                  initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-2.5 rounded-xl text-xs mb-3 overflow-hidden"
                  style={{ background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.2)' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: '#dc2626' }} />
                  <span style={{ color: '#b91c1c', fontWeight: 500 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form / Success state */}
            <AnimatePresence mode="wait">
              {!submitted ? (
                /* ── FORM ── */
                <motion.div key="form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <form onSubmit={handleSubmit} noValidate className="space-y-3">
                    <Input
                      label="Email Address"
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      required
                      icon={Mail}
                      value={email}
                      placeholder="your@email.com"
                      error={fieldError}
                      onChange={e => { setEmail(e.target.value); if (fieldError) setFieldError(''); if (error) setError(''); }}
                    />

                    <motion.button
                      type="submit"
                      disabled={submitting}
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
                        : <><Send className="w-3.5 h-3.5" /><span>Send Reset Link</span></>}
                    </motion.button>
                  </form>

                  {/* Mobile info card */}
                  <div className="md:hidden mt-3 p-2.5 rounded-xl flex gap-2"
                    style={{ background: 'rgba(10,61,48,0.05)', border: '1px solid rgba(10,61,48,0.1)' }}>
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: B.green }} />
                    <p className="text-[10.5px] leading-relaxed" style={{ color: B.inkSoft }}>
                      A secure link will be emailed via Gmail SMTP, valid for <strong>60 minutes</strong>. Check your spam folder if you don't see it.
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* ── SUCCESS STATE ── */
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center">

                  {/* Animated checkmark */}
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', border: '2px solid #34d399' }}>
                    <CheckCircle2 className="w-7 h-7" style={{ color: '#059669' }} />
                  </motion.div>

                  <h3 className="text-base font-black tracking-tight mb-1" style={{ color: B.ink }}>
                    Check Your Inbox!
                  </h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: B.inkSoft }}>
                    {successMsg}
                  </p>

                  {/* Info pills */}
                  <div className="flex flex-col gap-2 mb-3 text-left">
                    {[
                      { dot: '#34d399', text: `Sent to: ${email}` },
                      { dot: B.gold, text: 'Link expires in 60 minutes' },
                      { dot: '#94a3b8', text: 'Check spam/junk if not visible' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs"
                        style={{ background: '#f8fafc', border: `1px solid ${B.line}` }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.dot }} />
                        <span style={{ color: B.ink }}>{row.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Resend button */}
                  <button onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer"
                    style={{ color: B.green, background: 'none', border: 'none', padding: '4px 2px' }}
                    onMouseEnter={e => e.currentTarget.style.color = B.gold}
                    onMouseLeave={e => e.currentTarget.style.color = B.green}>
                    <RefreshCw className="w-3 h-3" />
                    Didn&apos;t get it? Send again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to login */}
            <div className="mt-4 pt-3 text-center" style={{ borderTop: `1px solid ${B.line}` }}>
              <Link to="/login"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
                style={{ color: B.inkSoft, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = B.ink}
                onMouseLeave={e => e.currentTarget.style.color = B.inkSoft}>
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
