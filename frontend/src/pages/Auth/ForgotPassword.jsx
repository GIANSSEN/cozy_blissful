import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, ArrowLeft, CheckCircle, AlertCircle, Sparkles,
  Send, Clock, ShieldCheck, Inbox, RefreshCw, ChevronRight
} from 'lucide-react';
import API from '../../api/axios';

/* ── Brand Tokens ─────────────────────────────────── */
const B = {
  green:     '#0a3d30',
  deep:      '#041e16',
  gold:      '#bfa15f',
  goldLight: '#e8cc8a',
  ink:       '#1e293b',
  muted:     '#64748b',
  line:      '#e2e8f0',
};

/* ── Tiny helpers ─────────────────────────────────── */
const Dot = ({ color }) => (
  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
);

/* ════════════════════════════════════════════════════
   FORGOT PASSWORD PAGE
   ════════════════════════════════════════════════════ */
const ForgotPassword = () => {
  const [email, setEmail]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [focused, setFocused]       = useState(false);

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
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg,#f8f5f0 0%,#fdfcfa 60%,#f0ede8 100%)' }}
    >
      {/* ── Ambient bg blobs ── */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:-160, left:-120, width:500, height:500, borderRadius:'50%', background:`radial-gradient(circle, ${B.green}22 0%, transparent 70%)` }} />
        <div style={{ position:'absolute', bottom:-200, right:-100, width:460, height:460, borderRadius:'50%', background:`radial-gradient(circle, ${B.gold}18 0%, transparent 70%)` }} />
        <div style={{ position:'absolute', top:'30%', right:'8%', width:240, height:240, borderRadius:'50%', background:`radial-gradient(circle, ${B.green}10 0%, transparent 70%)` }} />
      </div>

      {/* ── Main Card ── */}
      <motion.div
        initial={{ opacity:0, y:24, scale:0.97 }}
        animate={{ opacity:1, y:0,  scale:1    }}
        transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
        style={{
          position:'relative', width:'100%', maxWidth:900,
          borderRadius:28, overflow:'hidden', display:'flex',
          background:'#fff',
          boxShadow:'0 32px 80px rgba(4,30,22,0.16), 0 8px 32px rgba(191,161,95,0.12)',
          border:'1px solid rgba(191,161,95,0.2)',
        }}
      >
        {/* ════ LEFT PANEL ════ */}
        <div
          className="hidden md:flex flex-col"
          style={{
            width:'42%', minWidth:300,
            background:`linear-gradient(155deg, ${B.deep} 0%, ${B.green} 55%, #0e4a37 100%)`,
            padding:'44px 36px', position:'relative', overflow:'hidden',
          }}
        >
          {/* decorative circles */}
          <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, borderRadius:'50%', border:`2px solid rgba(191,161,95,0.12)` }} />
          <div style={{ position:'absolute', bottom:-60, left:-60, width:200, height:200, borderRadius:'50%', background:'rgba(191,161,95,0.07)' }} />

          {/* Brand pill */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:100, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(191,161,95,0.3)', marginBottom:32, width:'fit-content' }}>
            <Sparkles style={{ width:13, height:13, color:B.goldLight }} />
            <span style={{ color:B.goldLight, fontSize:10, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase' }}>Cozy Blissful Salon &amp; Spa</span>
          </div>

          {/* Heading */}
          <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:30, fontWeight:900, color:'#fff', lineHeight:1.25, marginBottom:12 }}>
            Forgot Your<br />
            <span style={{ color:B.goldLight, fontStyle:'italic' }}>Password?</span>
          </h2>
          <p style={{ fontSize:13, color:'rgba(220,250,240,0.65)', lineHeight:1.75, marginBottom:36 }}>
            No worries — it happens to the best of us. Enter your registered email and we'll send a secure reset link straight to your inbox.
          </p>

          {/* Steps */}
          <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:36 }}>
            {[
              { icon:'1', label:'Enter your email below' },
              { icon:'2', label:'Check your inbox for the link' },
              { icon:'3', label:'Click the link to set new password' },
            ].map(step => (
              <div key={step.icon} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(191,161,95,0.18)', border:'1px solid rgba(191,161,95,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:B.goldLight }}>{step.icon}</span>
                </div>
                <span style={{ fontSize:12, color:'rgba(220,250,240,0.8)' }}>{step.label}</span>
              </div>
            ))}
          </div>

          {/* Gmail SMTP info box */}
          <div style={{ marginTop:'auto', background:'rgba(255,255,255,0.055)', border:'1px solid rgba(191,161,95,0.22)', borderRadius:16, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:30, height:30, borderRadius:10, background:'rgba(191,161,95,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Mail style={{ width:15, height:15, color:B.goldLight }} />
              </div>
              <span style={{ fontSize:11, fontWeight:800, color:B.goldLight, textTransform:'uppercase', letterSpacing:'0.08em' }}>Gmail SMTP Delivery</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {[
                { icon:<Clock style={{width:11,height:11}}/>, text:'Link valid for 60 minutes' },
                { icon:<ShieldCheck style={{width:11,height:11}}/>, text:'Sent via secure Gmail SMTP' },
                { icon:<Inbox style={{width:11,height:11}}/>, text:'Check Spam if not in inbox' },
              ].map((row, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ color:'rgba(232,204,138,0.7)' }}>{row.icon}</span>
                  <span style={{ fontSize:11, color:'rgba(220,250,240,0.6)' }}>{row.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'52px 40px' }}>
          <div style={{ width:'100%', maxWidth:360 }}>

            {/* Logo + header */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32, textAlign:'center' }}>
              <div style={{ position:'relative', marginBottom:16 }}>
                <div style={{ width:64, height:64, borderRadius:20, overflow:'hidden', border:`2.5px solid ${B.gold}`, boxShadow:'0 8px 24px rgba(191,161,95,0.25)' }}>
                  <img src="/cb-logo.jpg" alt="Cozy Blissful" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <div style={{ position:'absolute', bottom:-4, right:-4, width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#bfa15f,#e8cc8a)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>
                  <Mail style={{ width:11, height:11, color:B.deep }} />
                </div>
              </div>
              <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:24, fontWeight:900, color:B.ink, marginBottom:4 }}>Reset Password</h1>
              <p style={{ fontSize:13, color:B.muted, lineHeight:1.5 }}>Enter your email to receive a secure reset link</p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity:0, y:-6, height:0 }} animate={{ opacity:1, y:0, height:'auto' }} exit={{ opacity:0, height:0 }}
                  style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:14, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.25)', marginBottom:20, overflow:'hidden' }}
                >
                  <AlertCircle style={{ width:16, height:16, color:'#dc2626', flexShrink:0, marginTop:1 }} />
                  <span style={{ fontSize:12.5, color:'#b91c1c', lineHeight:1.5 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form or Success */}
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onSubmit={handleSubmit}>
                  {/* Email field */}
                  <div style={{ marginBottom:20 }}>
                    <label htmlFor="forgot-email" style={{ display:'block', fontSize:12, fontWeight:700, color:B.ink, marginBottom:7 }}>
                      Email Address
                    </label>
                    <div style={{ position:'relative' }}>
                      <Mail style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color: focused ? B.green : B.muted, transition:'color 0.2s' }} />
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="your@email.com"
                        style={{
                          width:'100%', padding:'13px 14px 13px 44px',
                          borderRadius:14, fontSize:13.5, color:B.ink,
                          border: `1.5px solid ${focused ? B.green : B.line}`,
                          background: focused ? '#fafffe' : '#faf9f7',
                          outline:'none', transition:'border-color 0.2s, background 0.2s',
                          boxSizing:'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.018 }}
                    whileTap={{ scale: submitting ? 1 : 0.972 }}
                    style={{
                      width:'100%', padding:'14px', borderRadius:14,
                      background: submitting ? '#c8b880' : 'linear-gradient(135deg,#bfa15f 0%,#e8cc8a 50%,#c8a455 100%)',
                      color:B.deep, fontSize:13.5, fontWeight:800,
                      border:'none', cursor: submitting ? 'not-allowed' : 'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      boxShadow: submitting ? 'none' : '0 6px 20px rgba(191,161,95,0.4)',
                      transition:'box-shadow 0.2s',
                      letterSpacing:'0.02em',
                    }}
                  >
                    {submitting ? (
                      <>
                        <span style={{ width:16, height:16, border:'2px solid rgba(4,30,22,0.25)', borderTopColor:B.deep, borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />
                        Sending Reset Link…
                      </>
                    ) : (
                      <>
                        <Send style={{ width:15, height:15 }} />
                        Send Reset Link
                      </>
                    )}
                  </motion.button>

                  {/* Mobile SMTP note */}
                  <div className="md:hidden" style={{ marginTop:18, padding:'12px 14px', borderRadius:12, background:'rgba(10,61,48,0.05)', border:'1px solid rgba(10,61,48,0.1)', display:'flex', gap:8 }}>
                    <ShieldCheck style={{ width:14, height:14, color:B.green, flexShrink:0, marginTop:1 }} />
                    <p style={{ fontSize:11.5, color:B.muted, lineHeight:1.6 }}>
                      A secure link will be emailed via Gmail SMTP, valid for <strong>60 minutes</strong>. Check your spam folder if you don't see it.
                    </p>
                  </div>
                </motion.form>
              ) : (
                /* ── SUCCESS STATE ── */
                <motion.div
                  key="success"
                  initial={{ opacity:0, scale:0.93 }} animate={{ opacity:1, scale:1 }}
                  transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
                  style={{ textAlign:'center' }}
                >
                  {/* Animated check */}
                  <motion.div
                    initial={{ scale:0 }} animate={{ scale:1 }}
                    transition={{ type:'spring', stiffness:260, damping:18, delay:0.1 }}
                    style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#d1fae5,#a7f3d0)', border:'2px solid #34d399', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}
                  >
                    <CheckCircle style={{ width:34, height:34, color:'#059669' }} />
                  </motion.div>

                  <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:20, fontWeight:900, color:B.ink, marginBottom:8 }}>
                    Check Your Inbox!
                  </h3>
                  <p style={{ fontSize:13, color:B.muted, lineHeight:1.7, marginBottom:20 }}>
                    {successMsg}
                  </p>

                  {/* Info cards */}
                  <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                    {[
                      { dot:'#34d399', text:`Sent to: ${email}` },
                      { dot:B.gold,    text:'Link expires in 60 minutes' },
                      { dot:'#94a3b8', text:'Check spam/junk if not visible' },
                    ].map((row, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background:'#f8f9fb', border:'1px solid #eef0f4', textAlign:'left' }}>
                        <Dot color={row.dot} />
                        <span style={{ fontSize:12, color:B.ink }}>{row.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Resend */}
                  <button
                    onClick={() => { setSubmitted(false); setEmail(''); setSuccessMsg(''); }}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12.5, color:B.green, fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:'6px 2px' }}
                  >
                    <RefreshCw style={{ width:13, height:13 }} />
                    Didn't get it? Send again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to login */}
            <div style={{ marginTop:28, paddingTop:20, borderTop:`1px solid ${B.line}`, textAlign:'center' }}>
              <Link
                to="/login"
                style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12.5, fontWeight:700, color:B.muted, textDecoration:'none', transition:'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = B.ink}
                onMouseLeave={e => e.currentTarget.style.color = B.muted}
              >
                <ArrowLeft style={{ width:14, height:14 }} />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};

export default ForgotPassword;
