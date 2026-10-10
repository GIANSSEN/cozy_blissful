import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, ArrowLeft, CheckCircle, AlertCircle, X,
  Send, Clock, ShieldCheck, Inbox, RefreshCw,
  Sparkles, Star, MapPin, MessageCircle,
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

/* ════════════════════════════════════════════════════════════════════════════
   FORGOT PASSWORD — matches AuthPortal (dark spa, single-viewport card)
   ════════════════════════════════════════════════════════════════════════════ */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }

    setSubmitting(true);
    try {
      const res = await API.post('/forgot-password', { email: email.trim() });
      setSuccessMsg(res.data.message || 'Password reset link sent!');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          className="w-full max-w-[860px] flex flex-col md:flex-row rounded-2xl overflow-hidden border shadow-2xl"
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
                  Forgot your<br /><em className="text-[#e8cc8a]">password?</em>
                </h2>
                <p className="text-[11.5px] text-emerald-100/65 leading-relaxed mt-2">
                  No worries — enter your email and we’ll send a secure reset link straight to your inbox.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="flex" aria-label="Rated 4.9">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-3 h-3 fill-[#e8cc8a] text-[#e8cc8a]" />)}
                </span>
                <span className="text-[11px] font-bold text-[#e8cc8a]">4.9</span>
                <span className="text-[11px] text-white/45">· 15k+ guests</span>
              </div>

              {/* 3 steps — plain language */}
              <ul className="space-y-2.5">
                {['Enter your email on the right', 'Check your inbox for the link', 'Click it to set a new password'].map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black shrink-0" style={{ background: 'rgba(191,161,95,0.18)', border: '1px solid rgba(191,161,95,0.4)', color: '#e8cc8a' }}>
                      {i + 1}
                    </span>
                    <span className="text-[11.5px] text-emerald-100/70">{s}</span>
                  </li>
                ))}
              </ul>

              {/* Delivery info */}
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(191,161,95,0.22)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0" style={{ background: 'rgba(191,161,95,0.15)' }}>
                    <Mail className="w-3.5 h-3.5 text-[#e8cc8a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#e8cc8a]">Secure email delivery</span>
                </div>
                {[
                  { icon: Clock, text: 'Link is valid for 60 minutes' },
                  { icon: ShieldCheck, text: 'Sent via secure encrypted mail' },
                  { icon: Inbox, text: 'Not in inbox? Check spam / junk' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 py-0.5">
                    <Icon className="w-3 h-3 shrink-0 text-[#e8cc8a]/70" />
                    <span className="text-[11px] text-emerald-100/60">{text}</span>
                  </div>
                ))}
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
                <span className="ml-auto text-[10px] font-bold tracking-wide uppercase" style={{ color: B.goldDark }}>Reset password</span>
              </div>

              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden" style={{ border: `2.5px solid ${B.gold}`, boxShadow: '0 8px 24px rgba(191,161,95,0.25)' }}>
                    <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)', border: '2px solid #fff' }}>
                    <Mail className="w-3 h-3" style={{ color: B.deep }} />
                  </div>
                </div>
                <h1 className="text-[20px] font-black tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Reset your password</h1>
                <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">Type your account email below — we’ll send you a secure link.</p>
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
                {!submitted ? (
                  <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} noValidate>
                    <label htmlFor="forgot-email" className="block text-[12px] font-bold mb-1 tracking-wide" style={{ color: B.ink }}>
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] pointer-events-none transition-colors" style={{ color: focused ? B.goldDark : '#94a3b8' }} />
                      <input
                        id="forgot-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Example: maria@email.com"
                        className="w-full rounded-xl outline-none transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                        style={{
                          fontSize: '16px',
                          minHeight: '50px',
                          paddingLeft: '46px',
                          paddingRight: '14px',
                          paddingTop: '13px',
                          paddingBottom: '13px',
                          border: `1.5px solid ${focused ? B.gold : B.line}`,
                          boxShadow: focused ? '0 0 0 4px rgba(191,161,95,0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Use the email you signed up with.</p>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.013 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      className="w-full mt-3 min-h-[50px] flex justify-center items-center gap-2 rounded-xl font-black text-[14px] text-[#041e16] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#bfa15f]"
                      style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)', boxShadow: '0 5px 18px rgba(191,161,95,0.4)' }}
                    >
                      {submitting ? (
                        <><span className="w-4 h-4 border-2 border-[#041e16]/30 border-t-[#041e16] rounded-full animate-spin" /><span>Sending link…</span></>
                      ) : (
                        <><Send className="w-4 h-4" /><span>Send Reset Link</span></>
                      )}
                    </motion.button>

                    {/* Mobile delivery note (left panel is hidden on small screens) */}
                    <div className="md:hidden mt-3 p-3 rounded-xl flex gap-2" style={{ background: 'rgba(10,61,48,0.05)', border: '1px solid rgba(10,61,48,0.1)' }}>
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-px" style={{ color: B.green }} />
                      <p className="text-[11.5px] text-slate-500 leading-relaxed">
                        The link is valid for <strong>60 minutes</strong>. Can’t find it? Check your spam or junk folder.
                      </p>
                    </div>
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
                    <h3 className="text-[19px] font-black tracking-tight mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>Check your inbox!</h3>
                    <p className="text-[12.5px] text-slate-500 leading-relaxed mt-1.5">{successMsg}</p>

                    <div className="flex flex-col gap-2 mt-4 text-left">
                      {[
                        { dot: '#34d399', text: `Sent to: ${email}` },
                        { dot: B.gold, text: 'Link expires in 60 minutes' },
                        { dot: '#94a3b8', text: 'Not visible? Check spam / junk' },
                      ].map((row) => (
                        <div key={row.text} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: row.dot }} />
                          <span className="text-[12px] text-slate-700 break-all">{row.text}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => { setSubmitted(false); setEmail(''); setSuccessMsg(''); }}
                      className="inline-flex items-center gap-1.5 mt-4 min-h-[44px] px-3 text-[12.5px] font-bold cursor-pointer touch-manipulation"
                      style={{ color: B.green }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Didn’t get it? Send again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 pt-4 border-t border-slate-200/80 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 min-h-[44px] px-3 text-[12.5px] font-bold text-slate-500 hover:text-slate-900 transition-colors touch-manipulation">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>

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

export default ForgotPassword;
