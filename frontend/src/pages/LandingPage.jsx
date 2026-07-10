import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Heart, Star, Calendar,
  MapPin, Clock, CheckCircle, Leaf, Flower2, Shield,
  Menu, X, Phone, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Real Cozy Blissful Services Data ────────────────────────────────────────

const SERVICE_CATEGORIES = [
  {
    id: 'massage',
    label: 'Massage Therapy',
    icon: '💆',
    color: { bg: '#0a3d30', text: '#fff', badge: 'rgba(255,255,255,0.15)', pill: '#34c99e' },
    note: 'Prices start at ₱749',
    services: [
      { name: 'Swedish Massage',               price: 749,  duration: '1 hr'    },
      { name: 'Deep Tissue Massage',           price: 849,  duration: '1 hr'    },
      { name: 'Hilot Massage',                 price: 749,  duration: '1 hr'    },
      { name: 'Traditional Massage',           price: 749,  duration: '1 hr'    },
      { name: 'Thai Massage',                  price: 849,  duration: '1 hr'    },
      { name: 'Post Natal Massage',            price: 899,  duration: '1 hr'    },
      { name: 'Hard Massage',                  price: 849,  duration: '1 hr'    },
      { name: 'Combination Swedish & Hilot',   price: 899,  duration: '1 hr'    },
      { name: 'Ventosa w/ Massage',            price: 999,  duration: '1 hr'    },
      { name: 'Lymphatic Massage',             price: 999,  duration: '1 hr'    },
      { name: 'Pre-Natal Massage',             price: 899,  duration: '1 hr'    },
      { name: 'Body Scrub / Massage',          price: 999,  duration: '1.5 hrs' },
      { name: 'Couple Massage',                price: 999,  duration: '1 hr'    },
    ],
  },
  {
    id: 'nails',
    label: 'Nail Care',
    icon: '💅',
    color: { bg: '#6b5a2e', text: '#fff', badge: 'rgba(255,255,255,0.15)', pill: '#e3cc97' },
    note: 'Prices from ₱299',
    services: [
      { name: 'Manicure',                      price: 299,  duration: '30 min'  },
      { name: 'Pedicure',                      price: 299,  duration: '30 min'  },
      { name: 'Regular Nails (Mani & Pedi)',   price: 399,  duration: '1 hr'    },
      { name: 'Manigel',                       price: 699,  duration: '1 hr'    },
      { name: 'Pedigel',                       price: 699,  duration: '1 hr'    },
      { name: 'Gel Nails (Mani & Pedi)',       price: 1199, duration: '1.5 hrs' },
      { name: 'ManePedi Foot Spa',             price: 799,  duration: '1 hr'    },
      { name: 'Nails Extension',               price: 1499, duration: '2 hrs'   },
      { name: 'Nails Extension with Design',   price: 1699, duration: '2.5 hrs' },
      { name: 'Nails Extension Package',       price: 1999, duration: '3 hrs'   },
    ],
  },
  {
    id: 'other',
    label: 'Other Services',
    icon: '✨',
    color: { bg: '#1e3a5f', text: '#fff', badge: 'rgba(255,255,255,0.15)', pill: '#93c5fd' },
    note: 'Ask for pricing',
    services: [
      { name: 'Ear Wax Candling',              price: null, duration: '30 min'  },
      { name: 'Eyebrow Threading',             price: null, duration: '15 min'  },
      { name: 'Under Arm Waxing',              price: null, duration: '20 min'  },
      { name: 'Foot Spa',                      price: null, duration: '45 min'  },
      { name: 'Eyelash Extensions',            price: null, duration: '1.5 hrs' },
      { name: 'Legs Waxing (Half or Full)',    price: null, duration: '30 min'  },
      { name: 'Paraffin Treatment (Hand & Foot)', price: null, duration: '45 min' },
    ],
  },
];

// ─── Animation Variants ──────────────────────────────────────────────────────

const pageFade      = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } };
const navSlide      = { hidden: { y: -50, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } };
const heroStagger   = { hidden: {}, visible: { transition: { staggerChildren: 0.16, delayChildren: 0.25 } } };
const heroItem      = { hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.65, ease: 'easeOut' } } };
const scaleIn       = { hidden: { scale: 0.92, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } } };
const sectionUp     = { hidden: { y: 24, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } } };
const cardStagger   = { hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const cardItem      = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ClayBadge = ({ children, color = 'emerald' }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
    ${color === 'emerald' ? 'bg-emerald-100 text-emerald-800' : color === 'gold' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}
    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset' }}
  >
    {children}
  </span>
);

const formatPrice = (p) => p ? `₱${p.toLocaleString()}` : 'Call for price';

// ─── Main Component ──────────────────────────────────────────────────────────

const LandingPage = () => {
  const { token, role } = useAuth();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileMenu,  setMobileMenu]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('massage');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashPath =
    role === 'admin'     ? '/admin/dashboard'     :
    role === 'therapist' ? '/therapist/dashboard' :
    '/booking/dashboard';

  const howItWorks = [
    { icon: Flower2, color: 'bg-emerald-100', iconColor: 'text-emerald-600', title: 'Pick A Treatment',      desc: 'Choose from 30+ professional wellness treatments — massage, nails, beauty & more.' },
    { icon: Shield,  color: 'bg-violet-100',  iconColor: 'text-violet-600',  title: 'Choose Your Therapist', desc: 'Browse vetted, insured and highly trained professionals ready to serve you.' },
    { icon: MapPin,  color: 'bg-amber-100',   iconColor: 'text-amber-600',   title: 'Set A Time And Place',  desc: 'Available 7 days a week. We come to you — home, office, or hotel.' },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Regular Client',    stars: 5, text: 'Absolutely incredible service. My therapist arrived on time and the treatment was world class!' },
    { name: 'James T.', role: 'Corporate Client',  stars: 5, text: 'We use Cozy Blissful for team wellness days. The booking system is seamless and therapists are always professional.' },
    { name: 'Alicia R.', role: 'First-time Client', stars: 5, text: 'The experience was perfect. The therapist was kind, professional, and incredibly skilled.' },
  ];

  const activeCategory = SERVICE_CATEGORIES.find((c) => c.id === activeTab);

  return (
    <motion.div
      variants={pageFade}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#f5f0e8] text-slate-800 flex flex-col selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >

      {/* ═══ STICKY NAVIGATION ══════════════════════════════════════════════ */}
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
            <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-12 h-12 rounded-full object-cover" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.22)', border: '2px solid rgba(212,175,55,0.4)' }} />
            <span className="text-base font-bold text-emerald-900 tracking-wide hidden sm:block leading-tight">
              Cozy Blissful
              <span className="block text-xs font-normal text-slate-500 tracking-widest uppercase">Home Service Spa</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
            {['Services', 'About Us', 'Contact Us'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-emerald-800 transition-colors duration-200">{item}</a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {token ? (
              <Link to={dashPath} className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition text-sm" style={{ boxShadow: '0 4px 14px rgba(6,78,59,0.35)' }}>My Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="py-2.5 px-5 bg-white hover:bg-slate-50 text-emerald-800 font-semibold rounded-2xl transition text-sm border border-emerald-200" style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>Log In</Link>
                <Link to="/register" className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition text-sm flex items-center space-x-1.5" style={{ boxShadow: '0 4px 14px rgba(6,78,59,0.35)' }}>
                  <span>Book Now</span>
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden text-slate-600 hover:text-emerald-800" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="md:hidden bg-white/95 border-t border-emerald-100 px-6 py-4 space-y-3">
              {['Services', 'About Us', 'Contact Us'].map((item) => (
                <a key={item} href="#" className="block text-sm font-medium text-slate-700 hover:text-emerald-800 py-2">{item}</a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 text-center py-2.5 bg-slate-100 text-emerald-800 rounded-xl text-sm font-semibold">Log In</Link>
                <Link to="/register" className="flex-1 text-center py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold">Book Now</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══ HERO SECTION ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f3d2e 0%,#145a40 40%,#1a6b4a 100%)', minHeight: '520px' }}>
        {/* Decorative floral SVG */}
        <svg className="absolute right-0 bottom-0 opacity-10 w-96" viewBox="0 0 400 400" fill="none">
          <circle cx="350" cy="350" r="200" stroke="#a7f3d0" strokeWidth="1.5" />
          <circle cx="350" cy="350" r="140" stroke="#a7f3d0" strokeWidth="1" />
          <path d="M200 350 Q280 200 350 350 Q280 500 200 350Z" stroke="#d1fae5" strokeWidth="1.2" fill="none" />
        </svg>
        <div className="absolute top-6 left-6 opacity-30"><Leaf className="w-8 h-8 text-emerald-300" /></div>

        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
          {/* Left — staggered text */}
          <motion.div variants={heroStagger} initial="hidden" animate="visible" className="flex-1 z-10 max-w-xl">
            <motion.div variants={heroItem} className="flex items-center space-x-2 mb-5">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </motion.div>
            <motion.h1 variants={heroItem} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
              In Home Massage,{' '}<span className="text-amber-300">Beauty And</span>{' '}Wellness
            </motion.h1>
            <motion.p variants={heroItem} className="text-emerald-100/80 text-base md:text-lg mb-8 leading-relaxed max-w-md">
              Self-care, your way. Book same day or in advance. Available 7 days a week, 6am–11pm.
            </motion.p>
            <motion.div variants={heroItem} className="mb-8">
              <Link to="/register" className="inline-flex items-center space-x-3 py-4 px-7 text-white font-bold rounded-2xl text-base transition-all duration-200 hover:scale-105" style={{ background: 'linear-gradient(135deg,#34a870 0%,#2d8a5e 100%)', boxShadow: '0 6px 24px rgba(0,0,0,0.25)' }}>
                <span>Book Now</span>
              </Link>
            </motion.div>
            {/* Trustpilot badge removed */}
          </motion.div>

          {/* Right — floating image */}
          <div className="flex-1 hidden lg:flex justify-center lg:justify-end items-center relative z-10">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" className="relative">
              <div className="absolute -inset-4 rounded-full opacity-20" style={{ border: '2px solid #a7f3d0' }} />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}>
                <div className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.4)', border: '3px solid rgba(255,255,255,0.15)' }}>
                  <img src="/therapist-hero.jpg" alt="Cozy Blissful Therapist" className="w-full h-full object-cover object-top" />
                </div>
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }} className="absolute -left-8 top-8 py-2 px-4 rounded-2xl text-xs font-semibold text-emerald-800" style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
                  <div className="flex items-center space-x-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /><span>Available Today</span></div>
                </motion.div>
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }} className="absolute -right-4 bottom-16 py-2 px-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
                  <div className="flex items-center space-x-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="text-sm font-bold text-slate-800">4.9</span><span className="text-xs text-slate-400">/ 5.0</span></div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════════════════ */}
      <section className="py-20 px-6 relative" style={{ background: 'linear-gradient(180deg,#f5f0e8 0%,#ece7dc 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={sectionUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-14">
            <div className="flex justify-center mb-4"><svg width="24" height="24" viewBox="0 0 24 24" className="fill-emerald-800"><polygon points="12,2 22,12 12,22 2,12" /></svg></div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">Here's The Scoop On <span className="text-emerald-800">How It Works!</span></h2>
            <p className="text-slate-500 max-w-md mx-auto">Forget about travel, waiting around, arranging phone calls – just enjoy your spa treatment.</p>
          </motion.div>
          <motion.div variants={cardStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.title} variants={cardItem} whileHover={{ scale: 1.03, y: -6, boxShadow: '0 20px 60px rgba(6,78,59,0.18), 0 2px 0 rgba(255,255,255,0.9) inset' }} transition={{ type: 'spring', stiffness: 280, damping: 22 }} className="p-8 space-y-4 cursor-default" style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 0 0 rgba(255,255,255,0.9) inset', border: '1.5px solid rgba(255,255,255,0.7)' }}>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
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

      {/* ═══ REAL SERVICES & PRICING ════════════════════════════════════════ */}
      <section id="services" className="py-24 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div variants={sectionUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-12">
            <ClayBadge color="emerald">Our Services & Pricing</ClayBadge>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
              Treatments Made For <span className="text-emerald-800">You</span>
            </h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto text-base">
              All services are performed by our certified professionals, delivered right to your doorstep.
            </p>
            {/* Contact */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Phone className="w-4 h-4 text-emerald-700" />
              <a href="tel:+639995435913" className="text-emerald-800 font-bold text-lg hover:text-emerald-600 transition">0995-435-9113</a>
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div variants={sectionUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="flex flex-wrap justify-center gap-3 mb-10">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300"
                style={
                  activeTab === cat.id
                    ? { background: `linear-gradient(135deg,${cat.color.bg},${cat.color.bg}dd)`, color: cat.color.text, boxShadow: `0 8px 24px ${cat.color.bg}40, 0 1px 0 rgba(255,255,255,0.1) inset` }
                    : { background: 'rgba(255,255,255,0.8)', color: '#64748b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }
                }
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: activeTab === cat.id ? cat.color.badge : '#f1f5f9', color: activeTab === cat.id ? cat.color.text : '#94a3b8' }}>
                  {cat.services.length}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Services Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Category note */}
              <div className="text-center mb-6">
                <span className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: activeCategory?.color.bg + '15', color: activeCategory?.color.bg }}>
                  {activeCategory?.icon} {activeCategory?.note}
                </span>
              </div>

              <motion.div
                variants={cardStagger}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {activeCategory?.services.map((svc, i) => (
                  <motion.div
                    key={svc.name}
                    variants={cardItem}
                    whileHover={{ scale: 1.025, y: -4 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="p-5 rounded-3xl flex items-center gap-4 group cursor-default"
                    style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 6px 24px rgba(0,0,0,0.08), 0 2px 0 rgba(255,255,255,0.9) inset', border: '1.5px solid rgba(255,255,255,0.8)' }}
                  >
                    {/* Index bubble */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: activeCategory.color.bg + '12', color: activeCategory.color.bg, boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm leading-snug">{svc.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {svc.price ? (
                          <span className="text-base font-black" style={{ color: activeCategory.color.bg }}>₱{svc.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 italic">Call for price</span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />{svc.duration}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/register"
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: activeCategory.color.bg, color: '#fff', boxShadow: `0 4px 12px ${activeCategory.color.bg}40` }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Book CTA */}
          <motion.div variants={sectionUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mt-12">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 py-4 px-10 font-bold text-white rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#0f3d2e,#145a40)', boxShadow: '0 8px 28px rgba(6,44,34,0.35)' }}
            >
              Book a Service Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg,#f5f0e8 0%,#eae5da 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={sectionUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center mb-14">
            <ClayBadge color="emerald">Testimonials</ClayBadge>
            <h2 className="mt-4 text-4xl font-extrabold text-slate-800 tracking-tight">What Our Clients Say</h2>
          </motion.div>
          <motion.div variants={cardStagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={cardItem} whileHover={{ scale: 1.02, y: -4 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="p-7 space-y-4" style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 0 rgba(255,255,255,0.9) inset', border: '1.5px solid rgba(255,255,255,0.7)' }}>
                <div className="flex space-x-0.5">{[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>{t.name.charAt(0)}</div>
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

      {/* ═══ CTA BANNER ════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg,#0f3d2e 0%,#145a40 100%)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="max-w-3xl mx-auto text-center space-y-7 relative">
          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-0 top-0 text-amber-300"><Sparkles className="w-7 h-7" /></motion.span>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-0 bottom-0 text-amber-300"><Sparkles className="w-7 h-7" /></motion.span>
          <ClayBadge color="gold">Start Today</ClayBadge>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Book Your First Session <span className="text-amber-300">in Minutes.</span>
          </h2>
          <p className="text-emerald-200/80 text-lg max-w-lg mx-auto">Join thousands of satisfied clients experiencing spa-quality wellness from the comfort of home.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="py-4 px-9 font-bold text-white rounded-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2 group" style={{ background: 'linear-gradient(135deg,#34a870,#2d8a5e)', boxShadow: '0 6px 24px rgba(0,0,0,0.3)' }}>
              <span>Book a Session</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="py-4 px-9 font-semibold text-white rounded-2xl flex items-center justify-center transition-all hover:scale-105" style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }}>Sign In</Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            {[{ icon: Shield, text: 'Insured & Vetted Therapists' }, { icon: Clock, text: 'Available 6am–11pm' }, { icon: MapPin, text: 'We Come To You' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center space-x-2 text-emerald-300/70 text-sm"><Icon className="w-4 h-4" /><span>{text}</span></div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="bg-emerald-950 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2.5">
              <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-10 h-10 rounded-full object-cover" style={{ border: '1.5px solid rgba(212,175,55,0.4)' }} />
              <div className="leading-tight">
                <span className="font-bold text-white tracking-wide block text-sm">Cozy Blissful</span>
                <span className="text-emerald-500 text-xs tracking-wider uppercase">Home Service Spa</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Phone className="w-4 h-4" />
              <a href="tel:+639995435913" className="font-bold hover:text-white transition">0995-435-9113</a>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-emerald-400">
              <a href="#services" className="hover:text-white transition">Services</a>
              <a href="#about-us" className="hover:text-white transition">About</a>
              <a href="#contact-us" className="hover:text-white transition">Contact</a>
            </nav>
            <p className="text-emerald-600 text-sm">&copy; 2026 Cozy Blissful Wellness.</p>
          </div>
        </div>
      </footer>

    </motion.div>
  );
};

export default LandingPage;
