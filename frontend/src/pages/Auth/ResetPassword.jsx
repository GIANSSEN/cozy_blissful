import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles,
  ArrowRight, KeyRound, ShieldCheck, Check, X
} from 'lucide-react';
import API from '../../api/axios';

/* ── Brand Tokens ─────────────────────────────────── */
const B = {
  green: '#0a3d30',
  deep: '#041e16',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
  ink: '#1e293b',
  muted: '#64748b',
  line: '#e2e8f0',
};

/* ── Password strength checker ────────────────────── */
function usePasswordStrength(password) {
  return useMemo(() => {
    const rules = [
      { id: 'len', label: 'At least 8 characters', ok: password.length >= 8 },
      { id: 'upper', label: 'One uppercase letter (A–Z)', ok: /[A-Z]/.test(password) },
      { id: 'lower', label: 'One lowercase letter (a–z)', ok: /[a-z]/.test(password) },
      { id: 'num', label: 'One number (0–9)', ok: /\d/.test(password) },
      { id: 'sym', label: 'One special char (@$!%*?&)', ok: /[@$!%*?&]/.test(password) },
    ];
    const passed = rules.filter(r => r.ok).length;
    const score = passed; // 0–5
    const level = score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong';
    const color = score <= 1 ? '#ef4444' : score <= 3 ? '#f59e0b' : score === 4 ? '#22c55e' : '#10b981';
    return { rules, score, level, color };
  }, [password]);
}

/* ── Strength bar ─────────────────────────────────── */
const StrengthBar = ({ score, color }) => (
  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i <= score ? color : '#e2e8f0', transition: 'background 0.3s' }} />
    ))}
  </div>
);

/* ── Rule row ─────────────────────────────────────── */
const RuleRow = ({ ok, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{ width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ok ? '#d1fae5' : '#f1f5f9', flexShrink: 0, transition: 'background 0.25s' }}>
      {ok
        ? <Check style={{ width: 10, height: 10, color: '#059669' }} />
        : <X style={{ width: 10, height: 10, color: '#94a3b8' }} />
      }
    </div>
    <span style={{ fontSize: 11.5, color: ok ? '#059669' : B.muted, transition: 'color 0.25s' }}>{label}</span>
  </div>
);

/* ════════════════════════════════════════════════════
   RESET PASSWORD / CREATE NEW PASSWORD PAGE
   ════════════════════════════════════════════════════ */
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
      setCountdown(c => {
        if (c <= 1) { clearInterval(id); navigate('/login'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) { setError('Invalid or missing password reset token. Please request a new link.'); return; }
    if (!email) { setError('Please provide your email address.'); return; }
    if (!password) { setError('Please enter your new password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    if (password !== passwordConfirmation) { setError('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      await API.post('/reset-password', { token, email, password, password_confirmation: passwordConfirmation });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.password?.[0] ||
        'Password reset failed. Token may be expired.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pwMatch = passwordConfirmation.length > 0 && password === passwordConfirmation;
  const pwMismatch = passwordConfirmation.length > 0 && password !== passwordConfirmation;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg,#f8f5f0 0%,#fdfcfa 60%,#f0ede8 100%)' }}
    >
      {/* ── Ambient blobs ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -160, left: -120, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${B.green}20 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: -200, right: -100, width: 460, height: 460, borderRadius: '50%', background: `radial-gradient(circle, ${B.gold}16 0%, transparent 70%)` }} />
      </div>

      {/* ── Main Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative', width: '100%', maxWidth: 920,
          borderRadius: 28, overflow: 'hidden', display: 'flex',
          background: '#fff',
          boxShadow: '0 32px 80px rgba(4,30,22,0.16), 0 8px 32px rgba(191,161,95,0.12)',
          border: '1px solid rgba(191,161,95,0.2)',
        }}
      >
        {/* ════ LEFT PANEL ════ */}
        <div
          className="hidden md:flex flex-col"
          style={{
            width: '42%', minWidth: 300,
            background: `linear-gradient(155deg, ${B.deep} 0%, ${B.green} 55%, #0e4a37 100%)`,
            padding: '44px 36px', position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', border: '2px solid rgba(191,161,95,0.12)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(191,161,95,0.07)' }} />

          {/* Brand pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(191,161,95,0.3)', marginBottom: 32, width: 'fit-content' }}>
            <Sparkles style={{ width: 13, height: 13, color: B.goldLight }} />
            <span style={{ color: B.goldLight, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cozy Blissful Salon &amp; Spa</span>
          </div>

          {/* Heading */}
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 12 }}>
            Create Your<br />
            <span style={{ color: B.goldLight, fontStyle: 'italic' }}>New Password</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(220,250,240,0.65)', lineHeight: 1.75, marginBottom: 36 }}>
            Choose a strong password to protect your account and keep your bookings &amp; loyalty rewards secure.
          </p>

          {/* Security requirements */}
          <div style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(191,161,95,0.22)', borderRadius: 16, padding: '20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(191,161,95,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck style={{ width: 15, height: 15, color: B.goldLight }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: B.goldLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password Requirements</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                '8+ characters',
                'Uppercase letter (A–Z)',
                'Lowercase letter (a–z)',
                'Number (0–9)',
                'Special char (@$!%*?&)',
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(191,161,95,0.5)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, color: 'rgba(220,250,240,0.65)' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '52px 40px' }}>
          <div style={{ width: '100%', maxWidth: 370 }}>

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, textAlign: 'center' }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(245,158,11,0.22)' }}>
                  <KeyRound style={{ width: 28, height: 28, color: '#92400e' }} />
                </div>
                <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  <ShieldCheck style={{ width: 11, height: 11, color: B.deep }} />
                </div>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 900, color: B.ink, marginBottom: 4 }}>
                Set New Password
              </h1>
              <p style={{ fontSize: 13, color: B.muted, lineHeight: 1.5 }}>
                Create a strong password for your account
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 20, overflow: 'hidden' }}
                >
                  <AlertCircle style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12.5, color: '#b91c1c', lineHeight: 1.5 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Email (read-only, locked to the reset request) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                        <label htmlFor="reset-email" style={{ fontSize: 12, fontWeight: 700, color: B.ink }}>
                          Email Address
                        </label>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: B.muted, fontWeight: 600 }}>
                          <Lock style={{ width: 11, height: 11, color: B.gold }} /> Locked
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="reset-email"
                          type="email"
                          readOnly
                          tabIndex={-1}
                          value={email}
                          style={{
                            width: '100%', padding: '12px 38px 12px 14px',
                            borderRadius: 14, fontSize: 13, color: '#475569',
                            border: `1.5px solid ${B.line}`,
                            background: '#f1f5f9', outline: 'none', boxSizing: 'border-box',
                            cursor: 'not-allowed', userSelect: 'none',
                            fontWeight: 500,
                          }}
                        />
                        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                          <ShieldCheck style={{ width: 16, height: 16, color: B.gold }} />
                        </div>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label htmlFor="reset-password" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: B.ink, marginBottom: 7 }}>
                        New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: focusedField === 'pw' ? B.green : B.muted, transition: 'color 0.2s' }} />
                        <input
                          id="reset-password"
                          type={showPw ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('pw')}
                          onBlur={() => setFocusedField('')}
                          placeholder="••••••••"
                          style={{
                            width: '100%', padding: '13px 44px',
                            borderRadius: 14, fontSize: 13.5, color: B.ink,
                            border: `1.5px solid ${focusedField === 'pw' ? B.green : B.line}`,
                            background: focusedField === 'pw' ? '#fafffe' : '#faf9f7',
                            outline: 'none', transition: 'border-color 0.2s, background 0.2s', boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(v => !v)}
                          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: B.muted, display: 'flex', padding: 0 }}
                        >
                          {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                        </button>
                      </div>

                      {/* Strength meter */}
                      {password.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                          <StrengthBar score={strength.score} color={strength.color} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 11, color: B.muted }}>Strength</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.level}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {strength.rules.map(r => <RuleRow key={r.id} ok={r.ok} label={r.label} />)}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="reset-confirm" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: B.ink, marginBottom: 7 }}>
                        Confirm New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: focusedField === 'cpw' ? B.green : B.muted, transition: 'color 0.2s' }} />
                        <input
                          id="reset-confirm"
                          type={showConfirmPw ? 'text' : 'password'}
                          required
                          value={passwordConfirmation}
                          onChange={e => setPasswordConfirmation(e.target.value)}
                          onFocus={() => setFocusedField('cpw')}
                          onBlur={() => setFocusedField('')}
                          placeholder="••••••••"
                          style={{
                            width: '100%', padding: '13px 44px',
                            borderRadius: 14, fontSize: 13.5, color: B.ink,
                            border: `1.5px solid ${pwMismatch ? '#ef4444' : pwMatch ? '#22c55e' : focusedField === 'cpw' ? B.green : B.line}`,
                            background: focusedField === 'cpw' ? '#fafffe' : '#faf9f7',
                            outline: 'none', transition: 'border-color 0.2s, background 0.2s', boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(v => !v)}
                          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: B.muted, display: 'flex', padding: 0 }}
                        >
                          {showConfirmPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                        </button>
                      </div>
                      {/* match indicator */}
                      <AnimatePresence>
                        {pwMatch && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}
                          >
                            <CheckCircle style={{ width: 13, height: 13, color: '#22c55e' }} />
                            <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Passwords match!</span>
                          </motion.div>
                        )}
                        {pwMismatch && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}
                          >
                            <AlertCircle style={{ width: 13, height: 13, color: '#ef4444' }} />
                            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Passwords don't match</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.018 }}
                      whileTap={{ scale: submitting ? 1 : 0.972 }}
                      style={{
                        width: '100%', padding: '14px 20px',
                        borderRadius: 14, fontSize: 14, fontWeight: 800,
                        background: submitting ? '#c8b880' : 'linear-gradient(135deg,#bfa15f 0%,#e8cc8a 50%,#c8a455 100%)',
                        color: B.deep, border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: submitting ? 'none' : '0 6px 20px rgba(191,161,95,0.4)',
                        transition: 'box-shadow 0.2s', letterSpacing: '0.02em', marginTop: 4,
                      }}
                    >
                      {submitting ? (
                        <>
                          <span style={{ width: 16, height: 16, border: '2px solid rgba(4,30,22,0.25)', borderTopColor: B.deep, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                          Updating Password…
                        </>
                      ) : (
                        <>
                          <ShieldCheck style={{ width: 15, height: 15 }} />
                          Update Password
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                /* ── SUCCESS STATE ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ textAlign: 'center' }}
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
                  >
                    <CheckCircle style={{ width: 38, height: 38, color: '#059669' }} />
                  </motion.div>

                  <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 900, color: B.ink, marginBottom: 8 }}>
                    Password Updated!
                  </h3>
                  <p style={{ fontSize: 13, color: B.muted, lineHeight: 1.7, marginBottom: 24 }}>
                    Your password has been successfully reset. You can now log in with your new credentials.
                  </p>

                  {/* Countdown */}
                  <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(10,61,48,0.05)', border: '1px solid rgba(10,61,48,0.1)', marginBottom: 20, fontSize: 12.5, color: B.muted }}>
                    Redirecting to login in <strong style={{ color: B.green }}>{countdown}s</strong>…
                  </div>

                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: 14, fontSize: 13.5, fontWeight: 800,
                      background: `linear-gradient(135deg, ${B.deep}, ${B.green})`,
                      color: '#fff', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 6px 20px rgba(4,30,22,0.25)',
                    }}
                  >
                    Go to Login Now <ArrowRight style={{ width: 15, height: 15 }} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back link (only when not success) */}
            {!success && (
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${B.line}`, textAlign: 'center' }}>
                <Link
                  to="/forgot-password"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: B.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = B.ink}
                  onMouseLeave={e => e.currentTarget.style.color = B.muted}
                >
                  Request a new reset link
                  <ChevronRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};

/* inline import for ChevronRight */
function ChevronRight(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default ResetPassword;
