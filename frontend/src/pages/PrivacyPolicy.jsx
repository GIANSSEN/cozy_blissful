import React from 'react';
import { Link } from 'react-router-dom';

const UPDATED = 'October 2, 2026';
const CONTACT_EMAIL = 'cozyblissfulspa@gmail.com';
const APP_NAME = 'Cozy Blissful Salon & Spa';
const FACEBOOK_URL = 'https://facebook.com/cozyblissful';

const Section = ({ id, title, children }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="mb-8 scroll-mt-24">
    <h2 id={`${id}-title`} className="text-lg sm:text-xl font-black tracking-tight text-slate-900 mb-2.5" style={{ fontFamily: "'Playfair Display', serif" }}>
      {title}
    </h2>
    <div className="text-sm leading-relaxed text-slate-600 space-y-2.5">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: '#faf9f7', fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <header className="w-full border-b sticky top-0 z-40" style={{ background: 'rgba(4,16,10,0.96)', backdropFilter: 'blur(16px)', borderColor: 'rgba(191,161,95,0.22)' }}>
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/cb-logo.jpg" alt="Cozy Blissful Logo" className="w-9 h-9 rounded-full object-cover" style={{ border: '2px solid rgba(191,161,95,0.55)' }} />
            <div className="leading-tight">
              <span className="text-sm font-black text-white block" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful</span>
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase block" style={{ color: '#bfa15f' }}>Salon &amp; Spa Sanctuary</span>
            </div>
          </Link>
          <Link to="/login" className="px-4 py-2 text-xs font-bold rounded-xl text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            Back to Login
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: '#8c7033' }}>Privacy Policy for Login Dialog and App Details</p>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mt-2 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Privacy Policy — {APP_NAME}
          </h1>
          <p className="text-xs text-slate-500 mb-6">Effective date: {UPDATED} &nbsp;•&nbsp; Last updated: {UPDATED}</p>

          <div className="text-sm leading-relaxed text-slate-600 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-8">
            <p>
              <strong className="text-slate-800">{APP_NAME}</strong> (“we”, “us”, “our”) operates a luxury spa &amp; salon
              appointment booking platform. This Privacy Policy explains what data we collect when you use our website
              and sign in — including with <strong className="text-slate-800">Facebook Login (Meta)</strong> — how we use it,
              and the choices you have. It is published at <strong className="text-slate-800">/privacy-policy</strong> so it can
              be linked directly from our Meta App Dashboard Login dialog and app details page.
            </p>
          </div>

          <Section id="app-identity" title="1. Who we are & contact">
            <p>
              <strong className="text-slate-800">{APP_NAME}</strong> — premium massage, facial, nail-care, and hair-treatment
              booking and management system.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact email (privacy &amp; data requests): <a className="font-bold text-[#8c7033] hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              <li>Facebook Page: <a className="font-bold text-[#8c7033] hover:underline" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">{FACEBOOK_URL}</a></li>
              <li>App purposes: client self-service booking, staff/therapist operations, admin management, booking emails &amp; notifications, PayMongo payments.</li>
            </ul>
          </Section>

          <Section id="fb-data" title="2. Facebook Login — data we receive and why">
            <p>
              When you choose <strong className="text-slate-800">“Continue with Facebook”</strong> on our Login or Register page,
              Meta shares limited profile information with us through the Facebook SDK / OAuth dialog. We request only these permissions:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-slate-800">public_profile</strong> — name, first name, last name, Facebook user ID (used to identify your account and personalize bookings).</li>
              <li><strong className="text-slate-800">email</strong> — your Facebook email address (used as your account identifier, for login matching, booking confirmations, and password recovery).</li>
            </ul>
            <p>
              On our servers we verify every Facebook access token against the Meta Graph API (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">debug_token</code> + <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/me?fields=id,name,first_name,last_name,email</code>)
              using our App ID / App Secret to confirm the token is valid and was issued for this app before any profile is fetched.
            </p>
            <p>
              We <strong className="text-slate-800">do not</strong> request friends lists, photos, birthday, gender, likes, posts, or any other Facebook data.
              If your Facebook profile has no shareable email, we ask you to enter an email on the Register page so we can create your booking account.
            </p>
          </Section>

          <Section id="how-we-use" title="3. How we use your information">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-slate-800">Authentication:</strong> match your Facebook email to an existing account or pre-fill registration (name/email) so you can finish signup with a password.</li>
              <li><strong className="text-slate-800">Booking services:</strong> create and manage appointments (pending → confirmed → in-progress → completed), therapist assignment, rescheduling, cancellations, and reminders.</li>
              <li><strong className="text-slate-800">Communications:</strong> send booking confirmation, approval, reminder, and welcome emails.</li>
              <li><strong className="text-slate-800">Security &amp; operations:</strong> rate-limit logins, log audit events, prevent fraud/abuse, and improve reliability.</li>
              <li><strong className="text-slate-800">Payments:</strong> process in-person or PayMongo checkout metadata (we never store full card numbers).</li>
            </ul>
            <p>We never sell your personal data and never use Facebook data for advertising to third parties.</p>
          </Section>

          <Section id="other-data" title="4. Other data we collect">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-slate-800">Account data you provide:</strong> full name, email, password (hashed with bcrypt), phone if supplied, service preferences, appointment history.</li>
              <li><strong className="text-slate-800">Google Sign-In (optional):</strong> if you use Google, we verify your ID token and receive name/email the same way.</li>
              <li><strong className="text-slate-800">Automatic data:</strong> IP address, device/browser type, login timestamps, and audit logs for security.</li>
              <li><strong className="text-slate-800">Cookies/local storage:</strong> session token (Sanctum, 7-day expiry), remembered email if you tick “Remember me”, and theme/cart preferences. No third-party ad trackers.</li>
            </ul>
          </Section>

          <Section id="sharing" title="5. Sharing & third-party processors">
            <p>We share data only as needed to run the service:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-slate-800">Meta Platforms, Inc.</strong> — Facebook Login SDK / Graph API token verification and OAuth.</li>
              <li><strong className="text-slate-800">Google LLC</strong> — Google Identity Services verification (if you use Google sign-in).</li>
              <li><strong className="text-slate-800">PayMongo</strong> — payment processing (subject to PayMongo’s privacy policy).</li>
              <li><strong className="text-slate-800">Email provider (SMTP/Gmail)</strong> — transactional booking emails.</li>
              <li><strong className="text-slate-800">Hosting provider</strong> — secure app/database hosting.</li>
            </ul>
            <p>We do not share Facebook-derived data with data brokers, advertisers, or unrelated third parties.</p>
          </Section>

          <Section id="retention" title="6. Data retention">
            <p>
              We keep account and booking records while your account is active and as required for business, tax, and audit purposes
              (typically up to 5 years for transaction logs). Session tokens expire after 7 days of inactivity. You may request earlier
              deletion at any time — see Section 8.
            </p>
          </Section>

          <Section id="security" title="7. Security">
            <ul className="list-disc pl-5 space-y-1">
              <li>Passwords hashed with bcrypt (12 rounds); social tokens verified server-side, never trusted from the client alone.</li>
              <li>HTTPS in transit, role-based access (admin / staff / therapist / client), Sanctum Bearer tokens, login rate-limiting.</li>
              <li>Database transactions, audit logging, and least-privilege staff access.</li>
            </ul>
            <p>No method is 100% secure, but we apply industry-standard safeguards and promptly address incidents.</p>
          </Section>

          <Section id="rights" title="8. Your rights — access, correction & deletion">
            <p>You control your data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-slate-800">Access / correct:</strong> view and update your profile from your dashboard, or email us.</li>
              <li><strong className="text-slate-800">Delete your account &amp; Facebook data:</strong> email <a className="font-bold text-[#8c7033] hover:underline" href={`mailto:${CONTACT_EMAIL}?subject=Data%20deletion%20request%20—%20Cozy%20Blissful`}>{CONTACT_EMAIL}</a> with subject “Data deletion request” from your account email. Include your full name and account email. We verify ownership, delete your account, bookings’ personal identifiers, and any Facebook-derived fields within 30 days (sooner where possible), and confirm by email.</li>
              <li><strong className="text-slate-800">Disconnect Facebook:</strong> remove “Cozy Blissful” anytime in Facebook → Settings → Apps and Websites. This revokes future sharing; already-stored account data is deleted on request above.</li>
              <li><strong className="text-slate-800">Withdraw consent / object:</strong> stop using social login and use email/password, or request restriction of processing.</li>
            </ul>
          </Section>

          <Section id="children" title="9. Children">
            <p>
              Our services are not directed to children under 13 (or the minimum age in your jurisdiction). We do not knowingly collect
              children’s data; if you believe a child provided data, contact us and we will delete it promptly.
            </p>
          </Section>

          <Section id="changes" title="10. Changes to this policy">
            <p>
              We may update this policy as features or Meta requirements change. Material changes will be posted on this page with a new
              “Last updated” date, and where appropriate notified by email or in-app notice. Continued use after changes means you accept the update.
            </p>
          </Section>

          <Section id="contact" title="11. Contact us">
            <p>
              Questions about this Privacy Policy, Facebook Login data use, or deletion requests:
            </p>
            <p>
              Email: <a className="font-bold text-[#8c7033] hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
              App: <strong className="text-slate-800">{APP_NAME}</strong> — {FACEBOOK_URL}
            </p>
          </Section>

          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {APP_NAME} • Luxury Specialist Sanctuary</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-bold text-[#8c7033] hover:underline">Login</Link>
              <Link to="/register" className="font-bold text-[#8c7033] hover:underline">Register</Link>
              <Link to="/" className="font-bold text-[#8c7033] hover:underline">Home</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
