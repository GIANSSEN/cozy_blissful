import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { Sparkles, ArrowRight, Star, Calendar, MapPin, Clock, Shield, Menu, X, Phone, Heart, Award, Smile, Check } from 'lucide-react';
import Lenis from 'lenis';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
);
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
);
const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
);

const SERVICE_CATEGORIES = [
  { id: 'massage', label: 'Massage Therapy', icon: '💆', color: { bg: '#0a3d30', text: '#fff', badge: 'rgba(255,255,255,0.15)' }, note: 'Prices start at ₱749', services: [
    { name: 'Swedish Massage', price: 749, duration: '1 hr', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', desc: 'Classic relaxing full-body massage with long, gliding strokes to relieve tension.' },
    { name: 'Deep Tissue Massage', price: 849, duration: '1 hr', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', desc: 'Firm pressure targeting deep muscle layers and chronic muscle tightness.' },
    { name: 'Hilot Massage', price: 749, duration: '1 hr', image: 'https://images.unsplash.com/photo-1519823551278-64ac928349d2?auto=format&fit=crop&w=800&q=80', desc: 'Traditional Filipino healing massage using coconut oil and warm banana leaves.' },
    { name: 'Traditional Massage', price: 749, duration: '1 hr', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', desc: 'Standard restoration and relaxation massage utilizing moderate pressure.' },
    { name: 'Thai Massage', price: 849, duration: '1 hr', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', desc: 'Dynamic assisted stretching and targeted acupressure to restore flow and flexibility.' },
    { name: 'Post Natal Massage', price: 899, duration: '1 hr', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80', desc: 'Restorative full-body therapy to support mothers in their healing after childbirth.' },
    { name: 'Hard Massage', price: 849, duration: '1 hr', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80', desc: 'Deep, intense localized pressure focused on severe stiffness and knots.' },
    { name: 'Combination Swedish & Hilot', price: 899, duration: '1 hr', image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=800&q=80', desc: 'A premium blend of Swedish relaxation strokes and traditional Hilot healing.' },
    { name: 'Ventosa w/ Massage', price: 999, duration: '1 hr', image: 'https://images.unsplash.com/photo-1519824206182-41622907f7e3?auto=format&fit=crop&w=800&q=80', desc: 'Cupping therapy combined with a standard relaxation massage to draw out body toxins.' },
    { name: 'Lymphatic Massage', price: 999, duration: '1 hr', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80', desc: 'Gentle drainage to boost lymphatic circulation and reduce physical inflammation.' },
    { name: 'Pre-Natal Massage', price: 899, duration: '1 hr', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80', desc: 'Gentle, specialized positioning to alleviate back tension for expecting mothers.' },
    { name: 'Body Scrub / Massage', price: 999, duration: '1.5 hrs', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80', desc: 'Invigorating exfoliating scrub followed by a deep full-body relaxation massage.' },
    { name: 'Couple Massage', price: 999, duration: '1 hr', image: 'https://images.unsplash.com/photo-1519823551278-64ac928349d2?auto=format&fit=crop&w=800&q=80', desc: 'Synchronized relaxation therapy for two in the same home-spa setting.' },
  ]},
  { id: 'nails', label: 'Nail Care', icon: '💅', color: { bg: '#6b5a2e', text: '#fff', badge: 'rgba(255,255,255,0.15)' }, note: 'Prices from ₱299', services: [
    { name: 'Manicure', price: 299, duration: '30 min', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', desc: 'Professional manicure including shape refining, cuticle care, and choice polish.' },
    { name: 'Pedicure', price: 299, duration: '30 min', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80', desc: 'Relaxing pedicure soak, salt scrub exfoliation, shaping, and polish.' },
    { name: 'Regular Nails (Mani & Pedi)', price: 399, duration: '1 hr', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', desc: 'Comprehensive classic manicure and pedicure service package.' },
    { name: 'Manigel', price: 699, duration: '1 hr', image: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&w=800&q=80', desc: 'Long-lasting gel manicure cured with UV/LED light for a shiny finish.' },
    { name: 'Pedigel', price: 699, duration: '1 hr', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80', desc: 'Extended-wear gel pedicure designed to look fresh for weeks.' },
    { name: 'Gel Nails (Mani & Pedi)', price: 1199, duration: '1.5 hrs', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', desc: 'Premium full gel manicure and pedicure combination package.' },
    { name: 'ManePedi Foot Spa', price: 799, duration: '1 hr', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80', desc: 'Manicure, pedicure, and deeply soothing therapeutic foot spa.' },
    { name: 'Nails Extension', price: 1499, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', desc: 'Full set extension using durable tips or forms for a natural, elegant look.' },
    { name: 'Nails Extension with Design', price: 1699, duration: '2.5 hrs', image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80', desc: 'Nail extensions featuring custom hand-painted art or nail accents.' },
    { name: 'Nails Extension Package', price: 1999, duration: '3 hrs', image: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&w=800&q=80', desc: 'All-inclusive package covering extensions, custom art, and cuticle hydration.' },
  ]},
  { id: 'other', label: 'Other Services', icon: '✨', color: { bg: '#1e3a5f', text: '#fff', badge: 'rgba(255,255,255,0.15)' }, note: 'Ask for pricing', services: [
    { name: 'Ear Wax Candling', price: null, duration: '30 min', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', desc: 'Relaxing ear wax candling to promote warmth and inner ear pressure balance.' },
    { name: 'Eyebrow Threading', price: null, duration: '15 min', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', desc: 'Precise hair threading to groom and define natural eyebrow arches.' },
    { name: 'Under Arm Waxing', price: null, duration: '20 min', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80', desc: 'Smooth hair removal for underarms using premium honey wax.' },
    { name: 'Foot Spa', price: null, duration: '45 min', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80', desc: 'Indulgent foot soak, scrub exfoliation, and moisturizing butter wrap.' },
    { name: 'Eyelash Extensions', price: null, duration: '1.5 hrs', image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80', desc: 'Lightweight individual extensions for long, voluminous, beautiful lashes.' },
    { name: 'Legs Waxing (Half or Full)', price: null, duration: '30 min', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80', desc: 'Complete or half-leg hair removal leaving skin smooth and soft.' },
    { name: 'Paraffin Treatment (Hand & Foot)', price: null, duration: '45 min', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80', desc: 'Warm soothing paraffin dip to deeply hydrate dry hands or tired feet.' },
  ]},
];

const stats = [
  { value: '2,500+', label: 'Happy Clients' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '30+', label: 'Expert Therapists' },
  { value: '7 Days', label: 'Always Available' },
];

const RevealOnScroll = ({ children, delay = 0, className = '', direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const variants = {
    hidden: { opacity: 0, y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0, x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0 },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay } },
  };
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
};

const ParallaxSection = ({ src, alt, className, strength = 0.12 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-strength * 100}%`, `${strength * 100}%`]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img src={src} alt={alt} style={{ y, scale: 1 + strength * 2 }} className="w-full h-full object-cover" loading="lazy" />
    </div>
  );
};

const FloatingOrb = ({ style, delay = 0, duration = 9 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none blur-3xl"
    style={style}
    animate={{ y: [0, -28, 0], x: [0, 12, 0], opacity: [0.25, 0.5, 0.25] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('massage');
  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollY } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroTextY = useTransform(heroScrollY, [0, 1], ['0%', '35%']);
  const heroImageY = useTransform(heroScrollY, [0, 1], ['0%', '18%']);
  const heroBgY = useTransform(heroScrollY, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(heroScrollY, [0, 0.8], [1, 0]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { lenis.destroy(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const howItWorks = [
    { icon: Calendar, color: '#0a3d30', iconBg: 'rgba(10,61,48,0.08)', num: '01', title: 'Book a Session', desc: 'Select your preferred service, pick a date & time — it takes under two minutes.' },
    { icon: Shield, color: '#6b5a2e', iconBg: 'rgba(107,90,46,0.08)', num: '02', title: 'Professional Vetting', desc: 'We match you with expert, certified therapists who specialize in your chosen therapy.' },
    { icon: MapPin, color: '#1e3a5f', iconBg: 'rgba(30,58,95,0.08)', num: '03', title: 'Complete Relaxation', desc: 'Our specialist arrives at your door with all tools — tables, oils, and music included.' },
  ];

  const premiumFeatures = [
    { icon: Heart, title: 'Tailored Treatments', desc: 'Each service is custom-fitted to your body and pressure preference.' },
    { icon: Award, title: 'Certified Therapists', desc: 'Every specialist passes rigorous background checks and clinical training.' },
    { icon: Clock, title: 'Flexible Schedule', desc: 'Available 7 days a week, 6:00 AM to 11:00 PM to fit your busiest days.' },
    { icon: MapPin, title: 'Ultimate Convenience', desc: 'Enjoy luxury spa therapy right in your bedroom, living room, or hotel.' },
    { icon: Shield, title: 'Safe & Secure', desc: 'Sanitized equipment, verified staff, and live customer support on standby.' },
    { icon: Smile, title: 'Loyalty Rewards', desc: 'Earn digital stamps per session and redeem them for free treatments.' },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Regular Client', stars: 5, text: 'Absolutely incredible service. My therapist arrived on time and the Swedish treatment was world class!' },
    { name: 'James T.', role: 'Corporate Client', stars: 5, text: 'We use Cozy Blissful for mid-week relaxation. The scheduling is seamless and therapists are always professional.' },
    { name: 'Alicia R.', role: 'First-time Client', stars: 5, text: 'The experience was perfect. The therapist was kind, professional, brought her own table and lavender oils.' },
  ];

  const socialLinks = [
    { icon: FacebookIcon, label: 'Facebook', href: '#', hoverColor: '#1877F2' },
    { icon: InstagramIcon, label: 'Instagram', href: '#', hoverColor: '#E4405F' },
    { icon: TikTokIcon, label: 'TikTok', href: '#', hoverColor: '#010101' },
    { icon: TwitterXIcon, label: 'X (Twitter)', href: '#', hoverColor: '#14171A' },
    { icon: YouTubeIcon, label: 'YouTube', href: '#', hoverColor: '#FF0000' },
    { icon: WhatsAppIcon, label: 'WhatsApp', href: 'https://wa.me/639995435913', hoverColor: '#25D366' },
  ];

  const activeCategory = SERVICE_CATEGORIES.find((c) => c.id === activeTab);

  return (
    <div className="min-h-screen text-slate-800 overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900" style={{ fontFamily: "'Inter', sans-serif", background: '#faf9f7' }}>
      {/* NAVIGATION */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-50"
        style={{
          background: scrolled
            ? 'rgba(6,28,20,0.92)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(1.8)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.8)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(191,161,95,0.12)' : '1px solid transparent',
          boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(191,161,95,0.08)' : 'none',
          transition: 'background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease',
        }}
      >
        {/* Top accent line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] origin-left"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #bfa15f 30%, #e8cc8a 60%, #bfa15f 80%, transparent 100%)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: scrolled ? 1 : 0, opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between py-3.5 lg:py-4">

            {/* LOGO */}
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <div className="relative flex-shrink-0">
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1.5px solid rgba(191,161,95,0.5)' }}
                  animate={{ scale: [1, 1.22, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <img
                  src="/cb-logo.jpg"
                  alt="Cozy Blissful Logo"
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-full object-cover relative z-10"
                  style={{
                    border: '2px solid rgba(191,161,95,0.55)',
                    boxShadow: '0 0 0 1px rgba(191,161,95,0.15), 0 4px 20px rgba(0,0,0,0.4)'
                  }}
                />
                {/* Online indicator */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 z-20"
                  style={{ background: '#34d399', borderColor: scrolled ? '#061c14' : '#073328' }}
                />
              </div>
              <div className="leading-none">
                <span className="text-sm font-black tracking-wide text-white block">Cozy Blissful</span>
                <span
                  className="text-[9px] font-bold tracking-[0.18em] uppercase block mt-0.5"
                  style={{ color: '#bfa15f' }}
                >
                  Home Service Spa
                </span>
              </div>
            </motion.div>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-1">
              {[['#services', 'Services'], ['#how-it-works', 'How It Works'], ['#why-us', 'Why Us'], ['#testimonials', 'Reviews']].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="relative px-4 py-2 text-[11px] font-semibold tracking-wide text-white/70 hover:text-white transition-colors duration-200 rounded-lg group"
                  style={{ letterSpacing: '0.04em' }}
                >
                  {label}
                  <span
                    className="absolute bottom-1 left-4 right-4 h-px rounded-full transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100"
                    style={{ background: 'linear-gradient(90deg, #bfa15f, #e8cc8a)' }}
                  />
                </a>
              ))}
            </nav>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Contact pill */}
              <a
                href="https://wa.me/639995435913"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                <Phone className="w-3 h-3" style={{ color: '#bfa15f' }} />
                <span>+63 999 543 5913</span>
              </a>

              <Link
                to="/login"
                className="px-5 py-2 text-[11px] font-bold rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-95"
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  letterSpacing: '0.04em',
                }}
              >
                Log In
              </Link>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="px-5 py-2 text-[11px] font-bold text-white rounded-xl flex items-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #bfa15f 0%, #d4b87a 50%, #c8a455 100%)',
                    boxShadow: '0 4px 16px rgba(191,161,95,0.4), 0 1px 0 rgba(255,255,255,0.15) inset',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Book Now
                </Link>
              </motion.div>
            </div>

            {/* MOBILE HAMBURGER */}
            <motion.button
              className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
              onClick={() => setMobileMenu(!mobileMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenu ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-4.5 h-4.5" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-4.5 h-4.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden"
              style={{
                background: 'rgba(4,20,14,0.97)',
                backdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(191,161,95,0.12)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-5 py-6 flex flex-col gap-1">
                {/* Nav links */}
                {[['#services', 'Services'], ['#how-it-works', 'How It Works'], ['#why-us', 'Why Us'], ['#testimonials', 'Reviews']].map(([href, label], i) => (
                  <motion.a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/70 hover:text-white group"
                    style={{ background: 'transparent' }}
                    whileHover={{ backgroundColor: 'rgba(191,161,95,0.08)', x: 4 }}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <span className="w-1 h-1 rounded-full flex-shrink-0 transition-colors duration-200" style={{ background: '#bfa15f' }} />
                    <span className="text-sm font-semibold tracking-wide">{label}</span>
                  </motion.a>
                ))}

                {/* Divider */}
                <div className="my-3 h-px mx-1" style={{ background: 'rgba(191,161,95,0.12)' }} />

                {/* Contact */}
                <a
                  href="https://wa.me/639995435913"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/55 text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#bfa15f' }} />
                  <span>+63 999 543 5913</span>
                </a>

                {/* CTA Buttons */}
                <div className="flex gap-2.5 mt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenu(false)}
                    className="flex-1 text-center py-3 rounded-xl text-sm font-bold transition-all duration-200"
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenu(false)}
                    className="flex-1 text-center py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #bfa15f 0%, #d4b87a 100%)',
                      boxShadow: '0 4px 16px rgba(191,161,95,0.35)',
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Book Now
                  </Link>
                </div>

                {/* Brand footer in drawer */}
                <p className="text-center text-[10px] font-medium mt-4" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em' }}>
                  COZY BLISSFUL · HOME SERVICE SPA
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* HERO PARALLAX */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg,#041e16 0%,#073328 50%,#0e4d38 100%)' }}>
        <motion.div style={{ y: heroBgY }} className="absolute inset-0 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1800&q=60" alt="" className="w-full h-full object-cover opacity-[0.08]" />
        </motion.div>
        <FloatingOrb style={{ width: 500, height: 500, right: '5%', top: '10%', background: 'radial-gradient(circle, rgba(191,161,95,0.16) 0%, transparent 70%)' }} duration={11} />
        <FloatingOrb style={{ width: 320, height: 320, left: '2%', bottom: '5%', background: 'radial-gradient(circle, rgba(52,201,158,0.10) 0%, transparent 70%)' }} delay={3} duration={13} />
        <svg className="absolute right-0 bottom-0 opacity-[0.04] pointer-events-none" width="640" height="640" viewBox="0 0 640 640">
          <circle cx="540" cy="540" r="320" stroke="#bfa15f" strokeWidth="1.5" fill="none"/>
          <circle cx="540" cy="540" r="240" stroke="#fff" strokeWidth="0.8" fill="none"/>
          <circle cx="540" cy="540" r="160" stroke="#bfa15f" strokeWidth="0.5" fill="none"/>
        </svg>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full pt-24 pb-16">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-20">
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="flex-1 z-10 w-full md:max-w-lg lg:max-w-xl text-center md:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold text-amber-300 mb-6" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(191,161,95,0.25)', backdropFilter: 'blur(10px)' }}>
                <Sparkles className="w-3 h-3" />
                <span>Premium Home Service Spa & Wellness</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.04] mb-5 tracking-tight">
                Spa-Quality<br/>
                <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(135deg,#e8cc8a 0%,#bfa15f 60%,#d4b87a 100%)', backgroundClip: 'text' }}>At Your Door.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }} className="text-emerald-100/65 text-sm sm:text-base md:text-base lg:text-lg mb-8 leading-relaxed max-w-md mx-auto md:mx-0">
                Professional massage therapy and nail care — delivered to your sanctuary. Available 7 days a week, 6:00 AM – 11:00 PM.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/register" className="group inline-flex items-center justify-center gap-2.5 py-3.5 px-7 text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]" style={{ background: 'linear-gradient(135deg,#c9a851,#e8cc8a)', color: '#041e16', boxShadow: '0 8px 30px rgba(191,161,95,0.38)' }}>
                  <span>Book a Session</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 py-3.5 px-7 text-sm font-bold text-white/85 rounded-2xl transition-all duration-300 hover:scale-[1.04] hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>Sign In</Link>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.85 }} className="flex items-center gap-5 mt-8 flex-wrap justify-center md:justify-start">
                {['Fully Vetted', 'Certified Pros', 'Sanitized Gear'].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-200/65 font-semibold">{badge}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} style={{ y: heroImageY }} className="hidden md:flex flex-1 justify-center relative z-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #bfa15f 0%, transparent 65%)' }} />
                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.25, 0.12, 0.25] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -inset-6 rounded-full border" style={{ borderColor: 'rgba(191,161,95,0.28)' }} />
                <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 6.5, ease: 'easeInOut', repeat: Infinity }}>
                  <div className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px] rounded-full overflow-hidden" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.45), 0 0 0 3px rgba(191,161,95,0.22)', border: '3px solid rgba(255,255,255,0.1)' }}>
                    <img src="/therapist-hero.jpg" alt="Professional Therapist" className="w-full h-full object-cover object-top" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[9px] text-white/35 tracking-widest uppercase font-semibold">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <section style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}>
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <RevealOnScroll key={stat.label} delay={i * 0.08}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-black text-white mb-1.5 tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(191,161,95,0.85)' }}>{stat.label}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#faf9f7 0%,#f2ebe0 100%)' }}>
        <ParallaxSection src="https://images.unsplash.com/photo-1519823551278-64ac928349d2?auto=format&fit=crop&w=400&q=50" alt="" className="absolute right-[-5%] top-[8%] w-64 h-80 rounded-3xl opacity-[0.06] hidden md:block" strength={0.09} />
        <div className="max-w-6xl mx-auto relative">
          <RevealOnScroll className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 mb-4">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">How It Works</h2>
            <p className="text-slate-400 max-w-xs mx-auto mt-3 text-sm leading-relaxed">Three simple steps to your perfect home spa experience.</p>
          </RevealOnScroll>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(191,161,95,0.25), transparent)' }} />
            {howItWorks.map((step, idx) => {
              const Icon = step.icon;
              return (
                <RevealOnScroll key={step.title} delay={idx * 0.14}>
                  <motion.div whileHover={{ y: -10, transition: { duration: 0.28, ease: 'easeOut' } }} className="p-8 rounded-3xl text-left" style={{ background: 'linear-gradient(145deg,#fdfdfc,#faf8f5)', boxShadow: '20px 20px 40px #ede7de, -8px -8px 24px #fff, inset 2px 2px 4px rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.9)' }}>
                    <div className="flex items-start justify-between mb-7">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: step.iconBg, border: `1px solid ${step.color}20` }}>
                        <Icon className="w-6 h-6" style={{ color: step.color }} />
                      </div>
                      <span className="text-5xl font-black select-none" style={{ color: 'rgba(0,0,0,0.045)' }}>{step.num}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-3">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* PARALLAX QUOTE BANNER */}
      <section className="relative h-[260px] sm:h-[320px] md:h-[400px] overflow-hidden flex items-center justify-center">
        <ParallaxSection src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1800&q=70" alt="Spa ambience" className="absolute inset-0 w-full h-full" strength={0.16} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(4,30,22,0.84),rgba(10,61,48,0.76))' }} />
        <div className="relative z-10 text-center px-6">
          <RevealOnScroll>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(191,161,95,0.75)' }}>The Cozy Blissful Promise</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight max-w-2xl mx-auto tracking-tight">
              "Your Comfort is Our<br/>
              <span style={{ color: '#d4b87a' }}>Greatest Craft."</span>
            </h2>
            <p className="text-emerald-200/55 text-sm mt-5 max-w-sm mx-auto leading-relaxed">Every therapist is handpicked, trained, and committed to delivering an unmatched home spa experience.</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16 md:py-24 px-4 sm:px-6" style={{ background: '#faf9f7' }}>
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll className="text-center mb-10 md:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-4">Specialist Treatments</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">Our Spa Menu</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">Curated services for complete mind and body care — delivered to your door.</p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <a href="tel:+639995435913" className="text-emerald-800 font-bold hover:text-emerald-600 transition text-sm">Call / SMS: 0995-435-9113</a>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1} className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 md:mb-12">
            {SERVICE_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setActiveTab(cat.id)} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300" style={activeTab === cat.id ? { background: cat.color.bg, color: '#fff', boxShadow: `0 8px 24px ${cat.color.bg}40` } : { background: 'linear-gradient(145deg,#fdfdfc,#f4ede1)', color: '#64748b', boxShadow: '4px 4px 10px #e6dfd5, -4px -4px 10px #fff', border: '1px solid rgba(0,0,0,0.04)' }}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: activeTab === cat.id ? cat.color.badge : 'rgba(0,0,0,0.07)', color: activeTab === cat.id ? '#fff' : '#94a3b8' }}>{cat.services.length}</span>
              </button>
            ))}
          </RevealOnScroll>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <div className="text-center mb-10">
                <span className="text-xs font-bold px-4 py-2 rounded-xl" style={{ background: activeCategory?.color.bg + '15', color: activeCategory?.color.bg }}>{activeCategory?.icon} {activeCategory?.note}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
                {activeCategory?.services.map((svc, i) => (
                  <motion.div key={svc.name} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -12, transition: { duration: 0.28 } }} className="group flex flex-col rounded-[28px] overflow-hidden" style={{ background: 'linear-gradient(145deg,#fdfdfc,#f7f2ea)', boxShadow: '16px 16px 36px #e6dfd5, -8px -8px 20px #fff, inset 2px 2px 4px rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.88)' }}>
                    <div className="w-full h-60 overflow-hidden relative flex-shrink-0">
                      <motion.img src={svc.image} alt={svc.name} className="w-full h-full object-cover" whileHover={{ scale: 1.08 }} transition={{ duration: 0.55 }} loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span className="text-[10px] font-bold text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                          <Clock className="w-3 h-3 text-amber-300" />{svc.duration}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between p-6">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base leading-snug tracking-tight group-hover:text-emerald-900 transition-colors">{svc.name}</h4>
                        {svc.desc && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{svc.desc}</p>}
                      </div>
                      <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100/80">
                        <div>{svc.price ? <span className="text-xl font-black text-emerald-900">₱{svc.price.toLocaleString()}</span> : <span className="text-xs font-semibold text-slate-400 italic">Call for pricing</span>}</div>
                        <Link to="/register" className="group/btn flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95" style={{ background: `linear-gradient(135deg,${activeCategory.color.bg},${activeCategory.color.bg}cc)`, boxShadow: `0 4px 14px ${activeCategory.color.bg}28` }}>
                          Book Now <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-us" className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#f2ebe0,#faf9f7)' }}>
        <ParallaxSection src="https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=400&q=50" alt="" className="absolute left-[-4%] top-[8%] w-64 h-80 rounded-3xl opacity-[0.06] hidden md:block" strength={0.1} />
        <div className="max-w-6xl mx-auto relative">
          <RevealOnScroll className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-4">Vetted Excellence</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">Why Cozy Blissful?</h2>
            <p className="text-slate-400 max-w-sm mx-auto mt-3 text-sm leading-relaxed">The highest standards of safety, quality, and luxury in home wellness.</p>
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {premiumFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <RevealOnScroll key={f.title} delay={i * 0.08}>
                  <motion.div whileHover={{ y: -8, transition: { duration: 0.25 } }} className="p-7 rounded-3xl group" style={{ background: 'linear-gradient(145deg,#fdfdfc,#faf8f5)', boxShadow: '12px 12px 28px #e6dfd5, -6px -6px 16px #fff', border: '1px solid rgba(255,255,255,0.9)' }}>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 border border-emerald-100/60 group-hover:bg-emerald-100 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-emerald-800" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </motion.div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#ede4d6,#e4d9c8)' }}>
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 mb-4">Client Reviews</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight">What They Say</h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
              <span className="ml-2 text-sm font-bold text-slate-600">4.9 / 5.0 average</span>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            {testimonials.map((t, i) => (
              <RevealOnScroll key={t.name} delay={i * 0.12}>
                <motion.div whileHover={{ y: -8, transition: { duration: 0.25 } }} className="p-8 rounded-3xl flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.68)', backdropFilter: 'blur(10px)' }}>
                  <div>
                    <div className="flex space-x-0.5 mb-5">{[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}</div>
                    <p className="text-slate-600 text-sm leading-relaxed italic">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-sm">{t.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-slate-400 text-[10px] font-semibold">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#041e16,#073328,#0e4d38)' }}>
        <FloatingOrb style={{ width: 480, height: 480, right: '-5%', top: '-10%', background: 'radial-gradient(circle, rgba(191,161,95,0.1) 0%, transparent 70%)' }} duration={11} />
        <FloatingOrb style={{ width: 320, height: 320, left: '-3%', bottom: '-5%', background: 'radial-gradient(circle, rgba(52,201,158,0.07) 0%, transparent 70%)' }} delay={2.5} duration={13} />
        <RevealOnScroll className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold mb-6" style={{ background: 'rgba(191,161,95,0.14)', color: '#d4b87a', border: '1px solid rgba(191,161,95,0.2)' }}>Reserve Your Session</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5">Indulge In True Wellness<br/><span style={{ color: '#d4b87a' }}>At Home.</span></h2>
          <p className="text-emerald-200/55 text-sm max-w-md mx-auto mb-10 leading-relaxed">Skip the travel, skip the waiting. Book a professional session and transform your space into a private luxury retreat.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="group py-3.5 px-8 font-bold rounded-2xl transition-all hover:scale-105 flex items-center justify-center gap-3 text-sm" style={{ background: 'linear-gradient(135deg,#d4b87a,#bfa15f)', color: '#041e16', boxShadow: '0 8px 28px rgba(191,161,95,0.38)' }}>
              Book a Treatment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="py-3.5 px-8 font-bold text-white/85 rounded-2xl flex items-center justify-center transition-all hover:scale-105 text-sm" style={{ border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>Sign In</Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#020d07' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 md:pt-16 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img src="/cb-logo.jpg" alt="Cozy Blissful" className="w-12 h-12 rounded-full object-cover" style={{ border: '2px solid rgba(191,161,95,0.3)' }} />
              <div>
                <p className="font-black text-white text-sm tracking-wide">Cozy Blissful</p>
                <p className="text-amber-500/65 text-[10px] font-bold tracking-widest uppercase">Home Service Spa</p>
              </div>
            </div>
            <p className="text-emerald-900 text-sm leading-relaxed max-w-xs mb-6">Premium massage and wellness therapy delivered to your sanctuary. Professional, certified, and always available.</p>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <a href="tel:+639995435913" className="text-emerald-600 text-sm font-bold hover:text-emerald-300 transition-colors">0995-435-9113</a>
            </div>
            <p className="text-emerald-900/60 text-xs">Open: 6:00 AM – 11:00 PM · 7 Days a Week</p>
          </div>
          <div>
            <p className="text-white/35 text-[10px] font-bold tracking-widest uppercase mb-5">Quick Links</p>
            <div className="flex flex-col gap-3.5">
              {[['#services', 'Our Services'], ['#how-it-works', 'How It Works'], ['#why-us', 'Why Choose Us'], ['#testimonials', 'Client Reviews']].map(([href, label]) => (
                <a key={href} href={href} className="text-emerald-800 text-xs font-semibold hover:text-emerald-400 transition-colors duration-200 group flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-800 group-hover:bg-emerald-400 transition-colors flex-shrink-0" />{label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/35 text-[10px] font-bold tracking-widest uppercase mb-5">Client Portal</p>
            <div className="flex flex-col gap-3.5">
              {[['Sign In', '/login'], ['Create Account', '/register'], ['Book a Session', '/register']].map(([label, to]) => (
                <Link key={label} to={to} className="text-emerald-800 text-xs font-semibold hover:text-emerald-400 transition-colors duration-200 group flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-800 group-hover:bg-emerald-400 transition-colors flex-shrink-0" />{label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-7 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex flex-col items-center md:items-start gap-4">
              <p className="text-white/25 text-[9px] font-bold tracking-widest uppercase">Follow & Connect</p>
              <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
                {socialLinks.map((social) => {
                  const SocialIcon = social.icon;
                  return (
                    <motion.a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} title={social.label}
                      className="group relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                      whileHover={{ scale: 1.14, backgroundColor: social.hoverColor }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ duration: 0.22 }}
                    >
                      <span className="text-white/40 group-hover:text-white transition-colors duration-200"><SocialIcon /></span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/18 text-xs">© {new Date().getFullYear()} Cozy Blissful Spa. All Rights Reserved.</p>
              <p className="text-white/10 text-[10px] mt-1">Crafted with precision & luxury.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
