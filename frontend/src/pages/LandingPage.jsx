import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Heart, Star, Calendar,
  MapPin, Clock, CheckCircle, ChevronDown, Leaf,
  Flower2, Shield, Briefcase, Phone, Mail, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Design Tokens ─────────────────────────────────────────────────────────
// Claymorphism: puffy, soft shadows, rounded, saturated-but-muted fills,
// subtle inner highlight on top edge.

const clay = {
  card: {
    background: 'rgba(255,255,255,0.85)',
    borderRadius: '24px',
    boxShadow:
      '0 8px 32px rgba(0,0,0,0.10), 0 2px 0 0 rgba(255,255,255,0.9) inset',
    border: '1.5px solid rgba(255,255,255,0.7)',
  },
  cardGreen: {
    background: 'rgba(18,78,60,0.92)',
    borderRadius: '24px',
    boxShadow:
      '0 8px 32px rgba(0,0,0,0.18), 0 2px 0 0 rgba(255,255,255,0.08) inset',
    border: '1.5px solid rgba(255,255,255,0.08)',
  },
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const pageFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const navSlide = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.25 } },
};

const heroItem = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.65, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { scale: 0.92, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } },
};

const sectionUp = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const cardItem = {
  hidden: { y: 28, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const ClayBadge = ({ children, color = 'emerald' }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
    ${color === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset' }}
  >
    {children}
  </span>
);

// ─── Main Component ─────────────────────────────────────────────────────────

const LandingPage = () => {
  const { token, role } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashPath =
    role === 'admin' ? '/admin/dashboard' :
    role === 'therapist' ? '/therapist/dashboard' :
    '/booking/dashboard';

  const howItWorks = [
    {
      icon: Flower2,
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: 'Pick A Treatment',
      desc: '10+ styles of massage, plus facials, body scrubs, and wellness packages tailored for you.',
    },
    {
      icon: Shield,
      color: 'bg-violet-100',
      iconColor: 'text-violet-600',
      title: 'Choose Your Therapist',
      desc: 'Browse profiles of qualified, insured and highly trained, background-checked, pre-vetted therapists.',
    },
    {
      icon: MapPin,
      color: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'Set A Time And Place',
      desc: 'Available 7 days, 6am–11pm, anywhere in the city, in the comfort of your own home.',
    },
  ];

  const services = [
    { name: 'Swedish Massage', price: '$80', duration: '60 min', icon: '🌿' },
    { name: 'Deep Tissue', price: '$120', duration: '90 min', icon: '💆' },
    { name: 'Aromatherapy', price: '$95', duration: '60 min', icon: '🌸' },
    { name: 'Hot Stone Therapy', price: '$110', duration: '75 min', icon: '🪨' },
    { name: 'Facial Treatment', price: '$75', duration: '45 min', icon: '✨' },
    { name: 'Body Scrub', price: '$90', duration: '60 min', icon: '🧖' },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Regular Client', stars: 5, text: 'Absolutely incredible service. My therapist arrived on time and the treatment was world class. Booked again the very next day!' },
    { name: 'James T.', role: 'Corporate Client', stars: 5, text: 'We use Cozy Blissful for our team wellness days. The booking system is seamless and therapists are always professional.' },
    { name: 'Alicia R.', role: 'First-time Client', stars: 5, text: 'I was nervous about in-home massage, but the experience was perfect. The therapist was kind, professional, and skilled.' },
  ];

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#f5f0e8] text-slate-800 flex flex-col selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >

      {/* ═══════════════════════════════════════════════════
          STICKY NAVIGATION
      ════════════════════════════════════════════════════ */}
      <motion.header
        variants={navSlide}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(255,251,244,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
              src="/cb-logo.jpg"
              alt="Cozy Blissful Home Service Spa"
              className="w-12 h-12 rounded-full object-cover"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.2) inset', border: '2px solid rgba(212,175,55,0.4)' }}
            />
            <span className="text-base font-bold text-emerald-900 tracking-wide hidden sm:block leading-tight">
              Cozy Blissful
              <span className="block text-xs font-normal text-slate-500 tracking-widest uppercase">Home Service Spa</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            {['Services', 'Products', 'About Us', 'Contact Us'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="hover:text-emerald-800 transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {token ? (
              <Link
                to={dashPath}
                className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition duration-200 text-sm"
                style={{ boxShadow: '0 4px 14px rgba(6,78,59,0.35), 0 1px 0 rgba(255,255,255,0.1) inset' }}
              >
                My Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-2.5 px-5 bg-white hover:bg-slate-50 text-emerald-800 font-semibold rounded-2xl transition duration-200 text-sm border border-emerald-200"
                  style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset' }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition duration-200 text-sm flex items-center space-x-1.5"
                  style={{ boxShadow: '0 4px 14px rgba(6,78,59,0.35), 0 1px 0 rgba(255,255,255,0.1) inset' }}
                >
                  <span>Book Now</span>
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">0</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu btn */}
          <button
            className="md:hidden text-slate-600 hover:text-emerald-800"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 border-t border-emerald-100 px-6 py-4 space-y-3"
            >
              {['Services', 'About Us', 'Contact'].map((item) => (
                <a key={item} href="#" className="block text-sm font-medium text-slate-700 hover:text-emerald-800 py-2">
                  {item}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 text-center py-2.5 bg-slate-100 text-emerald-800 rounded-xl text-sm font-semibold">Log In</Link>
                <Link to="/register" className="flex-1 text-center py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold">Book Now</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION — Dark Emerald Clay
      ════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f3d2e 0%, #145a40 40%, #1a6b4a 100%)',
          minHeight: '520px',
        }}
      >
        {/* Decorative floral SVG background */}
        <svg className="absolute right-0 bottom-0 opacity-10 w-96" viewBox="0 0 400 400" fill="none">
          <circle cx="350" cy="350" r="200" stroke="#a7f3d0" strokeWidth="1.5" />
          <circle cx="350" cy="350" r="140" stroke="#a7f3d0" strokeWidth="1" />
          <circle cx="350" cy="350" r="80" stroke="#a7f3d0" strokeWidth="0.8" />
          <path d="M200 350 Q280 200 350 350 Q280 500 200 350Z" stroke="#d1fae5" strokeWidth="1.2" fill="none" />
          <path d="M350 200 Q500 280 350 350 Q200 280 350 200Z" stroke="#d1fae5" strokeWidth="1.2" fill="none" />
        </svg>

        {/* Leaf accent top-left */}
        <div className="absolute top-6 left-6 opacity-30">
          <Leaf className="w-8 h-8 text-emerald-300" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

          {/* LEFT — Staggered text */}
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="flex-1 z-10 max-w-xl"
          >
            {/* Leaf badge */}
            <motion.div variants={heroItem} className="flex items-center space-x-2 mb-5">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={heroItem}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight"
            >
              In Home Massage,{' '}
              <span className="text-amber-300">Beauty And</span>{' '}
              Wellness
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={heroItem}
              className="text-emerald-100/80 text-base md:text-lg mb-8 leading-relaxed max-w-md"
            >
              Self-care, your way. Book same day or in advance. Available 7 days a week, 6am–11pm.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={heroItem} className="mb-8">
              <Link
                to="/register"
                className="inline-flex items-center space-x-3 py-4 px-7 text-white font-bold rounded-2xl text-base transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #34a870 0%, #2d8a5e 100%)',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.15) inset',
                }}
              >
                <span>Book Now</span>
                <span
                  className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold"
                >0</span>
              </Link>
            </motion.div>

            {/* Trustpilot Badge */}
            <motion.div
              variants={heroItem}
              className="inline-flex flex-col p-4 rounded-2xl space-y-1"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="text-white font-semibold text-sm">Trustpilot</span>
              </div>
              <div className="flex space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                ))}
              </div>
              <p className="text-emerald-200/70 text-xs">
                <strong>Excellent</strong> | Based on{' '}
                <a href="#" className="underline hover:text-emerald-200 transition">1,000+ reviews</a>
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT — Floating circular therapist image */}
          <div className="flex-1 flex justify-center lg:justify-end items-center relative z-10">
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Outer decorative ring */}
              <div
                className="absolute -inset-4 rounded-full opacity-20"
                style={{
                  border: '2px solid #a7f3d0',
                  animation: 'spin 20s linear infinite',
                }}
              />
              {/* Floating container */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
                className="relative"
              >
                {/* Circular image frame */}
                <div
                  className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden"
                  style={{
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 2px 0 rgba(255,255,255,0.06) inset',
                    border: '3px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <img
                    src="/therapist-hero.jpg"
                    alt="Cozy Blissful Therapist"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Decorative floral accent bottom-right */}
                <svg
                  className="absolute -bottom-6 -right-6 w-28 h-28 opacity-50"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <circle cx="50" cy="50" r="45" stroke="#a7f3d0" strokeWidth="1.5" />
                  <path d="M50 5 Q80 30 50 50 Q20 30 50 5Z" stroke="#6ee7b7" strokeWidth="1" fill="none" />
                  <path d="M95 50 Q70 80 50 50 Q70 20 95 50Z" stroke="#6ee7b7" strokeWidth="1" fill="none" />
                  <path d="M50 95 Q20 70 50 50 Q80 70 50 95Z" stroke="#6ee7b7" strokeWidth="1" fill="none" />
                  <path d="M5 50 Q30 20 50 50 Q30 80 5 50Z" stroke="#6ee7b7" strokeWidth="1" fill="none" />
                </svg>

                {/* Floating availability badge */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute -left-8 top-8 py-2 px-4 rounded-2xl text-xs font-semibold text-emerald-800"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,1) inset',
                  }}
                >
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Available Today</span>
                  </div>
                </motion.div>

                {/* Rating pill */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="absolute -right-4 bottom-16 py-2 px-4 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,1) inset',
                  }}
                >
                  <div className="flex items-center space-x-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-slate-800">4.9</span>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS — Claymorphism Cards on Marble BG
      ════════════════════════════════════════════════════ */}
      <section
        id="services"
        className="py-20 px-6 relative"
        style={{
          background: 'linear-gradient(180deg, #f5f0e8 0%, #ece7dc 100%)',
        }}
      >
        {/* Marble texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px',
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section header */}
          <motion.div
            variants={sectionUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-14"
          >
            {/* Diamond accent (from reference image) */}
            <div className="flex justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-emerald-800 fill-emerald-800">
                <polygon points="12,2 22,12 12,22 2,12" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight tracking-tight mb-4">
              Here's The Scoop On{' '}
              <span className="text-emerald-800">How It Works!</span>
            </h2>
            <p className="text-slate-500 max-w-md mx-auto text-base">
              Forget about travel, waiting around arranging phone calls – just enjoy your spa treatment.
            </p>
          </motion.div>

          {/* Cards grid */}
          <motion.div
            variants={cardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {howItWorks.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={cardItem}
                  whileHover={{
                    scale: 1.03,
                    y: -6,
                    boxShadow: '0 20px 60px rgba(6,78,59,0.18), 0 2px 0 rgba(255,255,255,0.9) inset',
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="p-8 space-y-4 cursor-default"
                  style={clay.card}
                >
                  {/* Step number & icon */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center`}
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset' }}
                    >
                      <Icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <span className="text-4xl font-black text-slate-100">0{idx + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SERVICES GRID
      ════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white/60">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={sectionUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-14"
          >
            <ClayBadge color="emerald">Our Services</ClayBadge>
            <h2 className="mt-4 text-4xl font-extrabold text-slate-800 tracking-tight">
              Enjoy Your Favorite Treatments{' '}
              <span className="text-emerald-800">At Home.</span>
            </h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">
              Professional spa-grade treatments delivered to your door, on your schedule.
            </p>
          </motion.div>

          <motion.div
            variants={cardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {services.map((svc) => (
              <motion.div
                key={svc.name}
                variants={cardItem}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="p-6 flex items-center space-x-5"
                style={clay.card}
              >
                <span className="text-4xl">{svc.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{svc.name}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-emerald-700 font-semibold text-sm">{svc.price}</span>
                    <span className="text-slate-400 text-xs flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{svc.duration}</span>
                    </span>
                  </div>
                </div>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-600 transition whitespace-nowrap"
                >
                  Book →
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #eae5da 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={sectionUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-14"
          >
            <ClayBadge color="emerald">Testimonials</ClayBadge>
            <h2 className="mt-4 text-4xl font-extrabold text-slate-800 tracking-tight">
              What Our Clients Say
            </h2>
          </motion.div>

          <motion.div
            variants={cardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={cardItem}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="p-7 space-y-4"
                style={clay.card}
              >
                <div className="flex space-x-0.5">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
                  <div
                    className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA BANNER — with pulsing sparkles
      ════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #0f3d2e 0%, #145a40 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center space-y-7 relative"
        >
          {/* Left pulsing sparkle */}
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 top-0 text-amber-300"
          >
            <Sparkles className="w-7 h-7" />
          </motion.span>

          {/* Right pulsing sparkle (offset phase) */}
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-0 bottom-0 text-amber-300"
          >
            <Sparkles className="w-7 h-7" />
          </motion.span>

          <ClayBadge color="amber">Start Today</ClayBadge>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Book Your First Session{' '}
            <span className="text-amber-300">in Minutes.</span>
          </h2>
          <p className="text-emerald-200/80 text-lg max-w-lg mx-auto">
            Join thousands of satisfied clients experiencing spa-quality wellness from the comfort of home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="py-4 px-9 font-bold text-white rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 group"
              style={{
                background: 'linear-gradient(135deg, #34a870 0%, #2d8a5e 100%)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.12) inset',
              }}
            >
              <span>Book a Session</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="py-4 px-9 font-semibold text-white rounded-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.15)',
              }}
            >
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            {[
              { icon: Shield, text: 'Insured & Vetted Therapists' },
              { icon: Clock, text: 'Available 6am – 11pm' },
              { icon: MapPin, text: 'We Come To You' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center space-x-2 text-emerald-300/70 text-sm">
                <Icon className="w-4 h-4" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <footer className="bg-emerald-950 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2.5">
              <img
                src="/cb-logo.jpg"
                alt="Cozy Blissful"
                className="w-10 h-10 rounded-full object-cover"
                style={{ border: '1.5px solid rgba(212,175,55,0.4)' }}
              />
              <div className="leading-tight">
                <span className="font-bold text-white tracking-wide block text-sm">Cozy Blissful</span>
                <span className="text-emerald-500 text-xs tracking-wider uppercase">Home Service Spa</span>
              </div>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-emerald-400">
              <a href="#" className="hover:text-white transition">Services</a>
              <a href="#" className="hover:text-white transition">About</a>
              <a href="#" className="hover:text-white transition">Contact</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
            </nav>
            <p className="text-emerald-600 text-sm">&copy; 2026 Cozy Blissful Wellness.</p>
          </div>
        </div>
      </footer>

    </motion.div>
  );
};

export default LandingPage;
