import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Eye, EyeOff, CheckCircle, AlertCircle, X,
  ArrowLeft, ArrowRight, KeyRound, ShieldCheck, Check,
  Sparkles, Star, Clock, MapPin, MessageCircle, ChevronRight,
} from 'lucide-react';
import API from '../../api/axios';

/* ── Shared luxury motion ease (identical to LandingPage / AuthPortal) ─────── */
const EASE = [0.22, 1, 0.36, 1];

/* ── Brand Tokens (same as AuthPortal) ─────────────────────────────────────── */
const B = {
  deep: '#041e16',
  green: '#0a3d30',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
  goldDark: '#8c7033',
  ink: '#0f172a',
  muted: '#64748b',
  line: '#e2e8f0',
};

/* ── Ambient spa backdrop (same language as AuthPortal hero) ──────────────── */
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
  </div>
);

const YEAR = new Date().getFullYear();

/* ── Password strength (shared rules with register) ───────────────────────── */
function usePasswordStrength(password) {
  return useMemo(() => {
    const rules = [
      { id: 'len', label: 'At least 8 characters', ok: password.length >= 8 },
      { id: 'upper', label: 'One uppercase letter (A–Z)', ok: /[A-Z]/.test(password) },
      { id: 'lower', label: 'One lowercase letter (a–z)', ok: /[a-z]/.test(password) },
      { id: 'num', label: 'One number (0–9)', ok: /\d/.test(password) },
      { id: 'sym', label: 'One special char (@$!%*?&)', ok: /[@$!%*?&]/.test(password) },
    ];
    const score = rules.filter((r) => r.ok).length;
    const level = score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong';
    const color = score <= 1 ? '#ef4444' : score <= 3 ? '#f59e0b' : score === 4 ? '#0a3d30' : '#059669';
    return { rules, score, level, color };
  }, [password]);
}

const StrengthBar = ({ score, color }) => (
  <div className="flex gap-1 mt-2" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex-1 h-1 rounded-full transition-colors duration-300" style={{ background: i <= score ? color : '#e2e8f0' }} />
    ))}
  </div>
);

const inputStyle = (focused, hasError = false, isOk = false) => ({
  fontSize: '16px',
  minHeight: '50px',
  border: `1.5px solid ${hasError ? '#dc2626' : isOk ? '#059669' : focused ? B.gold : B.line}`,
  boxShadow: focused && !hasError
    ? '0 0 0 4px rgba(191,161,95,0.15)'
    : hasError
      ? '0 0 0 4px rgba(220,38,38,0.08)'
      : '0 1px 2px rgba(0,0,0,0.04)',
});

/* ════════════════════════════════════════════════════════════════════════════
   RESET PASSWORD — matches AuthPortal (dark spa, single-viewport card)
   ════════════════════════════════════════════════════════════════════════════ */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [focusedField, setFocusedField] = useState('');
  const [countdown, setCountdown] = useState(3);

  const strength = usePasswordStrength(password);

  useEffect(() => { if (emailParam) setEmail(emailParam); }, [emailParam]);

  /* Auto-redirect after success */
  useEffect(() => {
    if (!success) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); navigate('/login'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) { setError('This reset link is invalid or missing. Please request a new one below.'); return; }
    if (!email) { setError('Please provide your email address.'); return; }
    if (!password) { setError('Please enter your new password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    if (password !== passwordConfirmation) { setError('The two passwords don’t match yet.'); return; }

    setSubmitting(true);
    try {
      await API.post('/reset-password', { token, email, password, password_confirmation: passwordConfirmation });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.password?.[0] ||
        'Password reset failed. Your link may have expired — request a new one.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pwMatch = passwordConfirmation.length > 0 && password === passwordConfirmation;
  const pwMismatch = passwordConfirmation.length > 0 && password !== passwordConfirmation;

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#04100a', fontFamily: "'Inter', sans-serif" }}
    >
      <SpaBackdrop />

      {/* ── Full-viewport centered card ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.48, ease: EASE }}
          className="w-full max-w-[880px] flex flex-col md:flex-row rounded-2xl overflow-hidden border shadow-2xl"
          style={{
            borderColor: 'rgba(191,161,95,0.3)',
            boxShadow: '0 28px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(191,161,95,0.15), 0 8px 32px rgba(191,161,95,0.1)',
            maxHeight: 'calc(100dvh - 32px)',
          }}
        >

          {/* ══ LEFT PANEL (md+) ══ */}
          <div
            className="hidden md:flex flex-col justify-between shrink-0 relative overflow-hidden text-white"
            style={{
              width: '40%',
              background: 'linear-gradient(155deg, #0a3d30 0%, #062b22 55%, #041e16 100%)',
              padding: 'clamp(20px, 3.5vh, 32px) clamp(20px, 2.5vw, 28px)',
            }}
          >
            <div className="absolute rounded-full pointer-events-none" style={{ width: 260, height: 260, right: -70, top: -70, border: '1.5px solid rgba(191,161,95,0.15)' }} />
            <div className="absolute rounded-full pointer-events-none" style={{ width: 380, height: 380, right: -120, top: -120, border: '1px solid rgba(255,255,255,0.05)' }} />

            <div className="relative z-10 flex flex-col gap-4">
              <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ background: 'rgba(191,161,95,0.12)', border: '1px solid rgba(191,161,95,0.28)', color: '#e8cc8a' }}>
                <Sparkles className="w-2.5 h-2.5" /> Cozy Blissful Salon &amp; Spa
              </span>

              <div>
                <h2 className="font-black leading-[1.15] tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                  Create your<br /><em className="text-[#e8cc8a]">new password</em>
                </h2>
                <p className="text-[11.5px] text-emerald-100/65 leading-relaxed mt-2">
                  Pick a strong password to keep your account, bookings and rewards secure.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="flex" aria-label="Rated 4.9">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-3 h-3 fill-[#e8cc8a] text-[#e8cc8a]" />)}
                </span>
                <span className="text-[11px] font-bold text-[#e8cc8a]">4.9</span>
                <span className="text-[11px] text-white/45">· 15k+ guests</span>
              </div>

              {/* Requirements box */}
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(191,161,95,0.22)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0" style={{ background: 'rgba(191,161,95,0.15)' }}>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#e8cc8a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#e8cc8a]">Password must have</span>
                </div>
                <ul className="space-y-1.5">
                  {['8 or more characters', 'BIG letter (A–Z) + small letter (a–z)', 'A number (0–9)', 'A symbol (@$!%*?&)'].map((r) => (
                    <li key={r} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(191,161,95,0.55)' }} />
                      <span className="text-[11px] text-emerald-100/60">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative z-10 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-[10.5px] text-white/50">
                <Clock className="w-3 h-3 text-[#e8cc8a]" /> Open daily 9 AM – 9 PM
                <span aria-hidden className="text-white/20">·</span>
                <MapPin className="w-3 h-3 text-[#e8cc8a]" /> Home service
              </div>
              <p className="text-[10px] text-white/35 mt-1.5">© {YEAR} Cozy Blissful</p>
            </div>
          </div>

          {/* ══ RIGHT PANEL — form ══ */}
          <div className="flex-1 bg-white flex flex-col min-w-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="w-full max-w-[420px] mx-auto flex flex-col" style={{ padding: 'clamp(18px, 3.5vh, 30px) clamp(16px, 4vw, 32px)' }}>

              {/* Mobile brand row */}
              <div className="md:hidden flex items-center gap-2 mb-4">
                <img src="/cb-logo.jpg" alt="" className="w-7 h-7 rounded-full object-cover shrink-0" style={{ border: '2px solid rgba(191,161,95,0.55)' }} />
                <span className="text-sm font-black text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful</span>
                <span className="ml-auto text-[10px] font-bold tracking-wide uppercase" style={{ color: B.goldDark }}>New password</span>
              </div>

              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '2px solid #f59e0b', boxShadow: '0 8px 24px rgba(245,158,11,0.22)' }}>
                    <KeyRound className="w-6 h-6 text-amber-800" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)', border: '2px solid #fff' }}>
                    <ShieldCheck className="w-3 h-3" style={{ color: B.deep }} />
                  </div>
                </div>
                <h1 className="text-[20px] font-black tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Set a new password</h1>
                <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">Almost done — create your new password below.</p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl text-[12px] mb-3 bg-red-50 border border-red-200 text-red-700"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-px text-red-600" />
                    <span className="font-semibold flex-1 leading-relaxed">{error}</span>
                    <button type="button" onClick={() => setError('')} aria-label="Dismiss error" className="p-1 rounded-lg hover:bg-red-100 touch-manipulation shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                    {/* Email (locked to the reset request) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="reset-email" className="text-[12px] font-bold tracking-wide" style={{ color: B.ink }}>
                          Email address
                        </label>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Lock className="w-3 h-3" style={{ color: B.gold }} /> Locked
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          id="reset-email"
                          type="email"
                          readOnly
                          tabIndex={-1}
                          value={email}
                          aria-readonly="true"
                          className="w-full rounded-xl outline-none bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                          style={{ fontSize: '16px', minHeight: '50px', paddingLeft: '14px', paddingRight: '40px', paddingTop: '13px', paddingBottom: '13px', border: `1.5px solid ${B.line}` }}
                        />
                        <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: B.gold }} />
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label htmlFor="reset-password" className="block text-[12px] font-bold mb-1 tracking-wide" style={{ color: B.ink }}>
                        New password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] pointer-events-none transition-colors" style={{ color: focusedField === 'pw' ? B.goldDark : '#94a3b8' }} />
                        <input
                          id="reset-password"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('pw')}
                          onBlur={() => setFocusedField('')}
                          placeholder="Type your new password"
                          aria-describedby="reset-pw-strength"
                          className="w-full rounded-xl outline-none transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                          style={{ ...inputStyle(focusedField === 'pw'), paddingLeft: '46px', paddingRight: '48px', paddingTop: '13px', paddingBottom: '13px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                          aria-pressed={showPw}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer touch-manipulation transition-colors"
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {password.length > 0 && (
                        <motion.div id="reset-pw-strength" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden" aria-live="polite">
                          <StrengthBar score={strength.score} color={strength.color} />
                          <div className="flex justify-between items-center mt-1 mb-1">
                            <span className="text-[11px] text-slate-400">Strength</span>
                            <span className="text-[11px] font-bold" style={{ color: strength.color }}>{strength.level} ({strength.score}/5)</span>
                          </div>
                          <ul className="flex flex-col gap-1">
                            {strength.rules.map((r) => (
                              <li key={r.id} className="flex items-center gap-1.5">
                                <span className="flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-colors" style={{ background: r.ok ? '#d1fae5' : '#f1f5f9' }}>
                                  {r.ok ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <X className="w-2.5 h-2.5 text-slate-400" />}
                                </span>
                                <span className="text-[11px]" style={{ color: r.ok ? '#059669' : B.muted }}>{r.label}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label htmlFor="reset-confirm" className="block text-[12px] font-bold mb-1 tracking-wide" style={{ color: B.ink }}>
                        Type it again
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] pointer-events-none transition-colors" style={{ color: focusedField === 'cpw' ? B.goldDark : '#94a3b8' }} />
                        <input
                          id="reset-confirm"
                          type={showConfirmPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          onFocus={() => setFocusedField('cpw')}
                          onBlur={() => setFocusedField('')}
                          placeholder="Repeat the same password"
                          aria-invalid={pwMismatch}
                          className="w-full rounded-xl outline-none transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                          style={{ ...inputStyle(focusedField === 'cpw', pwMismatch, pwMatch), paddingLeft: '46px', paddingRight: '48px', paddingTop: '13px', paddingBottom: '13px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw((v) => !v)}
                          aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'}
                          aria-pressed={showConfirmPw}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer touch-manipulation transition-colors"
                        >
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {pwMatch && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 mt-1.5 text-[11.5px] font-semibold text-emerald-600" role="status">
                            <CheckCircle className="w-3.5 h-3.5" /> Passwords match — looking good!
                          </motion.p>
                        )}
                        {pwMismatch && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 mt-1.5 text-[11.5px] font-semibold text-red-600" role="alert">
                            <AlertCircle className="w-3.5 h-3.5" /> Passwords don’t match yet.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.013 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      className="w-full mt-1 min-h-[50px] flex justify-center items-center gap-2 rounded-xl font-black text-[14px] text-[#041e16] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#bfa15f]"
                      style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)', boxShadow: '0 5px 18px rgba(191,161,95,0.4)' }}
                    >
                      {submitting ? (
                        <><span className="w-4 h-4 border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" /><span>Updating…</span></>
                      ) : (
                        <><ShieldCheck className="w-4 h-4" /><span>Update Password</span></>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE }} className="text-center">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                      style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', border: '2px solid #34d399' }}
                    >
                      <CheckCircle className="w-9 h-9 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-[19px] font-black tracking-tight mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>Password updated!</h3>
                    <p className="text-[12.5px] text-slate-500 leading-relaxed mt-1.5">
                      All set! You can now sign in with your new password.
                    </p>
                    <div className="mt-4 p-3 rounded-xl text-[12.5px] text-slate-500" style={{ background: 'rgba(10,61,48,0.05)', border: '1px solid rgba(10,61,48,0.1)' }}>
                      Taking you to sign in in <strong style={{ color: B.green }}>{countdown}s</strong>…
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full mt-3 min-h-[50px] rounded-xl font-black text-[14px] text-[#041e16] cursor-pointer hover:brightness-105 active:scale-[0.99] touch-manipulation transition-all inline-flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)', boxShadow: '0 5px 18px rgba(191,161,95,0.4)' }}
                    >
                      Go to Sign In Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!success && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 text-center">
                  <Link to="/forgot-password" className="inline-flex items-center gap-1 min-h-[44px] px-3 text-[12.5px] font-bold text-slate-500 hover:text-slate-900 transition-colors touch-manipulation">
                    Link expired? Get a new one
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-slate-400">
                <MessageCircle className="w-3 h-3" style={{ color: B.goldDark }} />
                Need help?{' '}
                <a href="https://wa.me/639995435913" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline underline-offset-2" style={{ color: B.goldDark }}>
                  Chat with us
                </a>
              </div>

            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 shrink-0 py-3 px-4 text-center border-t border-white/5" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <p className="text-[11px] text-white/40">© {YEAR} Cozy Blissful Salon &amp; Spa · Your sanctuary of calm</p>
      </footer>
    </div>
  );
};

export default ResetPassword;
