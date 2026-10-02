import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Shield, Eye, Database, Share2, Clock, Lock, UserCheck,
  Baby, RefreshCw, Mail, ChevronRight, Menu, X, ExternalLink,
} from 'lucide-react';

const UPDATED      = 'October 2, 2026';
const CONTACT_EMAIL = 'cozyblissfulspa@gmail.com';
const APP_NAME      = 'Cozy Blissful Salon & Spa';
const FACEBOOK_URL  = 'https://facebook.com/cozyblissful';
const YEAR          = new Date().getFullYear();
const EASE          = [0.22, 1, 0.36, 1];

// ─── Table of Contents ──────────────────────────────────────────────────────
const TOC = [
  { id: 'who-we-are',   icon: UserCheck, title: 'Who We Are'               },
  { id: 'fb-data',      icon: Share2,    title: 'Facebook Login Data'       },
  { id: 'how-we-use',   icon: Eye,       title: 'How We Use Your Info'      },
  { id: 'other-data',   icon: Database,  title: 'Other Data We Collect'     },
  { id: 'sharing',      icon: Share2,    title: 'Sharing & Third Parties'   },
  { id: 'retention',    icon: Clock,     title: 'Data Retention'            },
  { id: 'security',     icon: Lock,      title: 'Security'                  },
  { id: 'rights',       icon: Shield,    title: 'Your Rights'               },
  { id: 'children',     icon: Baby,      title: 'Children'                  },
  { id: 'changes',      icon: RefreshCw, title: 'Policy Changes'            },
  { id: 'contact',      icon: Mail,      title: 'Contact Us'                },
];

// ─── Scroll helper ──────────────────────────────────────────────────────────
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({ id, icon: Icon, num, title, children }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.4, ease: EASE }}
    className="scroll-mt-6"
  >
    <div className="flex items-center gap-3 mb-4">
      <span
        className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        style={{ background: 'linear-gradient(135deg,#0a3d30,#062b22)', border: '1px solid rgba(191,161,95,0.3)' }}
      >
        <Icon className="w-4 h-4" style={{ color: '#e8cc8a' }} />
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] font-black tracking-wider uppercase" style={{ color: '#bfa15f' }}>{num}.</span>
        <h2 className="text-[17px] font-black tracking-tight text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      </div>
    </div>
    <div className="pl-12 text-[13.5px] leading-relaxed text-slate-600 space-y-3">
      {children}
    </div>
    <div className="mt-6 h-px bg-slate-100" />
  </motion.section>
);

// ─── Code pill ───────────────────────────────────────────────────────────────
const Code = ({ children }) => (
  <code className="inline-block bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md text-[11.5px] font-mono">
    {children}
  </code>
);

// ─── Gold link ───────────────────────────────────────────────────────────────
const GLink = ({ href, children, external }) => (
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    className="font-bold hover:underline underline-offset-2 inline-flex items-center gap-0.5"
    style={{ color: '#8c7033' }}
  >
    {children}
    {external && <ExternalLink className="w-3 h-3 opacity-60" />}
  </a>
);

export default function PrivacyPolicy() {
  const navigate  = useNavigate();
  const [tocOpen, setTocOpen] = useState(false);
  const [active,  setActive]  = useState('');

  // Track active section on scroll
  useEffect(() => {
    const ids = TOC.map(t => t.id);
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#f8f7f5', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sticky mini header ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(4,16,10,0.97)', backdropFilter: 'blur(16px)', borderColor: 'rgba(191,161,95,0.2)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-8 h-8 rounded-full object-cover shrink-0" style={{ border: '2px solid rgba(191,161,95,0.55)' }} />
            <span className="hidden sm:block leading-tight">
              <span className="text-[13px] font-black text-white block" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful</span>
              <span className="text-[8.5px] font-bold tracking-[0.18em] uppercase block" style={{ color: '#bfa15f' }}>Salon &amp; Spa</span>
            </span>
          </Link>

          {/* Center breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11.5px] text-white/50 min-w-0">
            <Shield className="w-3 h-3 text-[#bfa15f] shrink-0" />
            <span className="truncate font-semibold text-white/70">Privacy Policy</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTocOpen(v => !v)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold text-white/80 hover:text-white border border-white/15 hover:bg-white/10 transition-all touch-manipulation"
            >
              {tocOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">Contents</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold text-white/80 hover:text-white border border-white/15 hover:bg-white/10 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>

        {/* Mobile TOC drawer */}
        <AnimatePresence>
          {tocOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t"
              style={{ borderColor: 'rgba(191,161,95,0.15)', background: '#041e16' }}
            >
              <nav className="px-4 py-3 grid grid-cols-2 gap-1">
                {TOC.map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { scrollTo(id); setTocOpen(false); }}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11.5px] font-semibold text-left transition-all touch-manipulation"
                    style={{ color: active === id ? '#e8cc8a' : 'rgba(255,255,255,0.65)', background: active === id ? 'rgba(191,161,95,0.12)' : 'transparent' }}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{title}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex gap-8">

        {/* ── Desktop sidebar TOC ── */}
        <aside className="hidden lg:block shrink-0 w-56 xl:w-64 self-start sticky top-24">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10.5px] font-black uppercase tracking-[0.16em]" style={{ color: '#8c7033' }}>Contents</p>
            </div>
            <nav className="p-2">
              {TOC.map(({ id, title, icon: Icon }, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-semibold text-left transition-all touch-manipulation"
                  style={{
                    color: active === id ? '#0a3d30' : '#64748b',
                    background: active === id ? 'rgba(10,61,48,0.07)' : 'transparent',
                    fontWeight: active === id ? 800 : 600,
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active === id ? '#bfa15f' : '#94a3b8' }} />
                  <span className="truncate">{i + 1}. {title}</span>
                  {active === id && <ChevronRight className="w-3 h-3 ml-auto shrink-0" style={{ color: '#bfa15f' }} />}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick contact */}
          <div className="mt-4 rounded-2xl border border-[rgba(191,161,95,0.3)] p-4" style={{ background: 'linear-gradient(135deg,rgba(10,61,48,0.06),rgba(191,161,95,0.06))' }}>
            <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: '#8c7033' }}>Data Request?</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 text-[12px] font-bold hover:underline underline-offset-2" style={{ color: '#0a3d30' }}>
              <Mail className="w-3.5 h-3.5 text-[#bfa15f]" />
              Email us
            </a>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">
          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}
            className="rounded-2xl overflow-hidden mb-8 border border-[rgba(191,161,95,0.25)]"
            style={{ background: 'linear-gradient(135deg,#0a3d30 0%,#062b22 60%,#041e16 100%)' }}
          >
            <div className="px-6 sm:px-8 py-8 sm:py-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase tracking-[0.14em]"
                  style={{ background: 'rgba(191,161,95,0.15)', border: '1px solid rgba(191,161,95,0.35)', color: '#e8cc8a' }}>
                  <Shield className="w-2.5 h-2.5" /> Privacy Policy
                </span>
              </div>
              <h1 className="text-[26px] sm:text-[32px] font-black leading-[1.15] tracking-tight text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {APP_NAME}<br />
                <em className="text-[#e8cc8a] not-italic">Privacy Policy</em>
              </h1>
              <p className="text-[12.5px] text-emerald-100/65 leading-relaxed max-w-xl">
                This policy explains what personal data we collect, why we collect it, and how we protect it —
                including data received through Facebook and Google sign-in.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-[11.5px] text-white/45">
                <span>Effective: <strong className="text-white/70">{UPDATED}</strong></span>
                <span aria-hidden>·</span>
                <span>Last updated: <strong className="text-white/70">{UPDATED}</strong></span>
              </div>
            </div>
          </motion.div>

          {/* Intro notice */}
          <div className="mb-8 p-4 rounded-2xl border text-[13px] leading-relaxed text-slate-600"
            style={{ background: 'rgba(10,61,48,0.05)', borderColor: 'rgba(10,61,48,0.15)' }}>
            <strong className="text-slate-800">{APP_NAME}</strong> ("we", "us", "our") is a luxury spa &amp; salon appointment booking platform.
            This Privacy Policy is published at <strong className="text-slate-800">/privacy-policy</strong> so it can be linked directly from our
            Meta App Dashboard Login dialog.
          </div>

          {/* Sections */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-8">

              <Section id="who-we-are" icon={UserCheck} num="1" title="Who We Are &amp; Contact">
                <p><strong className="text-slate-800">{APP_NAME}</strong> — premium massage, facial, nail-care, and hair-treatment booking platform.</p>
                <ul className="space-y-1.5 list-none">
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span>Privacy enquiries &amp; data requests: <GLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</GLink></span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span>Facebook Page: <GLink href={FACEBOOK_URL} external>{FACEBOOK_URL}</GLink></span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span>App purposes: client self-service booking, staff/therapist operations, admin management, booking emails &amp; notifications, PayMongo payments.</span></li>
                </ul>
              </Section>

              <Section id="fb-data" icon={Share2} num="2" title="Facebook Login — Data We Receive">
                <p>When you choose <strong className="text-slate-800">"Continue with Facebook"</strong>, Meta shares limited profile data through the Facebook SDK / OAuth dialog. We request only:</p>
                <ul className="space-y-1.5 list-none">
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span><strong className="text-slate-800">public_profile</strong> — name, first name, last name, Facebook user ID.</span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span><strong className="text-slate-800">email</strong> — your Facebook email address (used as your account identifier and for booking confirmations).</span></li>
                </ul>
                <p>We verify every Facebook token against the Meta Graph API (<Code>debug_token</Code> + <Code>/me?fields=id,name,email</Code>) using our App Secret before any profile is fetched.</p>
                <p>We <strong className="text-slate-800">do not</strong> request friends lists, photos, birthday, gender, likes, posts, or any other data. If your Facebook profile has no shareable email, we ask you to enter one on registration.</p>
              </Section>

              <Section id="how-we-use" icon={Eye} num="3" title="How We Use Your Information">
                <ul className="space-y-2 list-none">
                  {[
                    ['Authentication', 'Match your Facebook/Google email to an existing account or pre-fill registration so you can finish signup with a password.'],
                    ['Booking services', 'Create and manage appointments (pending → confirmed → in-progress → completed), therapist assignment, rescheduling, cancellations, and reminders.'],
                    ['Communications', 'Send booking confirmation, approval, reminder, and welcome emails.'],
                    ['Security & operations', 'Rate-limit logins, log audit events, prevent fraud/abuse, and improve reliability.'],
                    ['Payments', 'Process in-person or PayMongo checkout metadata. We never store full card numbers.'],
                  ].map(([title, desc]) => (
                    <li key={title} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} />
                      <span><strong className="text-slate-800">{title}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-3 rounded-xl text-[12.5px] font-semibold" style={{ background: 'rgba(10,61,48,0.07)', color: '#062b22' }}>
                  We never sell your personal data and never use Facebook data for third-party advertising.
                </div>
              </Section>

              <Section id="other-data" icon={Database} num="4" title="Other Data We Collect">
                <ul className="space-y-2 list-none">
                  {[
                    ['Account data you provide', 'Full name, email, password (hashed with bcrypt), phone if supplied, service preferences, appointment history.'],
                    ['Google Sign-In (optional)', 'If you use Google, we verify your ID token and receive name/email the same way.'],
                    ['Automatic data', 'IP address, device/browser type, login timestamps, and audit logs for security.'],
                    ['Cookies / local storage', 'Session token (Sanctum, 7-day expiry), remembered email if you tick "Remember me", theme/cart preferences. No third-party ad trackers.'],
                  ].map(([title, desc]) => (
                    <li key={title} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} />
                      <span><strong className="text-slate-800">{title}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section id="sharing" icon={Share2} num="5" title="Sharing &amp; Third-Party Processors">
                <p>We share data only as needed to run the service:</p>
                <ul className="space-y-1.5 list-none">
                  {[
                    ['Meta Platforms, Inc.', 'Facebook Login SDK / Graph API token verification and OAuth.'],
                    ['Google LLC', 'Google Identity Services verification (if you use Google sign-in).'],
                    ['PayMongo', 'Payment processing (subject to PayMongo\'s privacy policy).'],
                    ['Email provider (SMTP/Gmail)', 'Transactional booking emails.'],
                    ['Hosting provider', 'Secure app/database hosting.'],
                  ].map(([name, desc]) => (
                    <li key={name} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} />
                      <span><strong className="text-slate-800">{name}</strong> — {desc}</span>
                    </li>
                  ))}
                </ul>
                <p>We do not share Facebook-derived data with data brokers, advertisers, or unrelated third parties.</p>
              </Section>

              <Section id="retention" icon={Clock} num="6" title="Data Retention">
                <p>We keep account and booking records while your account is active and as required for business, tax, and audit purposes (typically up to 5 years for transaction logs). Session tokens expire after 7 days of inactivity. You may request earlier deletion at any time — see Section 8.</p>
              </Section>

              <Section id="security" icon={Lock} num="7" title="Security">
                <ul className="space-y-1.5 list-none">
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span>Passwords hashed with bcrypt (12 rounds); social tokens verified server-side, never trusted from the client alone.</span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span>HTTPS in transit, role-based access (admin / staff / therapist / client), Sanctum Bearer tokens, login rate-limiting.</span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span>Database transactions, audit logging, and least-privilege staff access.</span></li>
                </ul>
                <p>No method is 100% secure, but we apply industry-standard safeguards and promptly address incidents.</p>
              </Section>

              <Section id="rights" icon={Shield} num="8" title="Your Rights — Access, Correction &amp; Deletion">
                <p>You control your data:</p>
                <ul className="space-y-2 list-none">
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span><strong className="text-slate-800">Access / correct:</strong> view and update your profile from your dashboard, or email us.</span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} />
                    <span><strong className="text-slate-800">Delete your account &amp; Facebook data:</strong> email <GLink href={`mailto:${CONTACT_EMAIL}?subject=Data%20deletion%20request%20%E2%80%94%20Cozy%20Blissful`}>{CONTACT_EMAIL}</GLink> with subject "Data deletion request" from your account email. Include your full name and email. We verify ownership, delete your account, bookings' personal identifiers, and Facebook-derived fields within 30 days, and confirm by email.</span>
                  </li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span><strong className="text-slate-800">Disconnect Facebook:</strong> remove "Cozy Blissful" in Facebook → Settings → Apps and Websites. This revokes future sharing; stored data is deleted on request above.</span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#bfa15f' }} /><span><strong className="text-slate-800">Withdraw consent / object:</strong> stop using social login and use email/password, or request restriction of processing.</span></li>
                </ul>
              </Section>

              <Section id="children" icon={Baby} num="9" title="Children">
                <p>Our services are not directed to children under 13 (or the minimum age in your jurisdiction). We do not knowingly collect children's data. If you believe a child provided data, contact us and we will delete it promptly.</p>
              </Section>

              <Section id="changes" icon={RefreshCw} num="10" title="Changes to This Policy">
                <p>We may update this policy as features or Meta requirements change. Material changes will be posted on this page with a new "Last updated" date, and where appropriate notified by email or in-app notice. Continued use after changes means you accept the update.</p>
              </Section>

              <Section id="contact" icon={Mail} num="11" title="Contact Us">
                <p>Questions about this Privacy Policy, Facebook Login data use, or deletion requests:</p>
                <div className="p-4 rounded-xl border" style={{ background: 'rgba(10,61,48,0.05)', borderColor: 'rgba(10,61,48,0.14)' }}>
                  <p className="mb-1">Email: <GLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</GLink></p>
                  <p>App: <strong className="text-slate-800">{APP_NAME}</strong> — <GLink href={FACEBOOK_URL} external>{FACEBOOK_URL}</GLink></p>
                </div>
              </Section>

            </div>

            {/* Footer of card */}
            <div className="px-6 sm:px-8 py-5 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-500">
              <p>© {YEAR} {APP_NAME} · Luxury Specialist Sanctuary</p>
              <div className="flex items-center gap-4">
                <Link to="/login"    className="font-bold hover:underline underline-offset-2" style={{ color: '#8c7033' }}>Login</Link>
                <Link to="/register" className="font-bold hover:underline underline-offset-2" style={{ color: '#8c7033' }}>Register</Link>
                <Link to="/"         className="font-bold hover:underline underline-offset-2" style={{ color: '#8c7033' }}>Home</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
