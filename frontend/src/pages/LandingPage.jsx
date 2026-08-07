import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  animate,
  useSpring,
} from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Star,
  Calendar,
  MapPin,
  Clock,
  Shield,
  Menu,
  X,
  Heart,
  Award,
  Smile,
  Check,
  ChevronDown,
  Quote,
  Leaf,
  Sparkle,
  UserCheck,
} from "lucide-react";
import Lenis from "lenis";
import gsap from "gsap";

/* ── Social Icons ─────────────────────────────────────────────────── */
const FacebookIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
const TikTokIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
const TwitterXIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const YouTubeIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
const WhatsAppIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>;

/* ── Service Data ─────────────────────────────────────────────────── */
const SVCS = {
  massage: {
    label: "Massage Therapy", icon: "💆", note: "Prices start at ₱749", color: { bg: "#0a3d30", glow: "rgba(10,61,48,0.38)", badge: "rgba(255,255,255,0.15)" }, list: [
      { name: "Swedish Massage", price: 749, dur: "1 hr", img: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80", desc: "Classic relaxing full-body massage with long, gliding strokes to relieve tension." },
      { name: "Deep Tissue Massage", price: 849, dur: "1 hr", img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80", desc: "Firm pressure targeting deep muscle layers and chronic muscle tightness." },
      { name: "Hilot Massage", price: 749, dur: "1 hr", img: "https://images.unsplash.com/photo-1519823551278-64ac928349d2?auto=format&fit=crop&w=800&q=80", desc: "Traditional Filipino healing massage using coconut oil and warm banana leaves." },
      { name: "Traditional Massage", price: 749, dur: "1 hr", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", desc: "Standard restoration and relaxation massage utilizing moderate pressure." },
      { name: "Thai Massage", price: 849, dur: "1 hr", img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80", desc: "Dynamic assisted stretching and targeted acupressure to restore flow and flexibility." },
      { name: "Post Natal Massage", price: 899, dur: "1 hr", img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80", desc: "Restorative full-body therapy to support mothers in their healing after childbirth." },
      { name: "Hard Massage", price: 849, dur: "1 hr", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80", desc: "Deep, intense localized pressure focused on severe stiffness and knots." },
      { name: "Combination Swedish & Hilot", price: 899, dur: "1 hr", img: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=800&q=80", desc: "A premium blend of Swedish relaxation strokes and traditional Hilot healing." },
      { name: "Ventosa w/ Massage", price: 999, dur: "1 hr", img: "https://images.unsplash.com/photo-1519824206182-41622907f7e3?auto=format&fit=crop&w=800&q=80", desc: "Cupping therapy combined with a standard relaxation massage to draw out body toxins." },
      { name: "Lymphatic Massage", price: 999, dur: "1 hr", img: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80", desc: "Gentle drainage to boost lymphatic circulation and reduce physical inflammation." },
      { name: "Pre-Natal Massage", price: 899, dur: "1 hr", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80", desc: "Gentle, specialized positioning to alleviate back tension for expecting mothers." },
      { name: "Body Scrub / Massage", price: 999, dur: "1.5 hrs", img: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80", desc: "Invigorating exfoliating scrub followed by a deep full-body relaxation massage." },
      { name: "Couple Massage", price: 999, dur: "1 hr", img: "https://images.unsplash.com/photo-1519823551278-64ac928349d2?auto=format&fit=crop&w=800&q=80", desc: "Synchronized relaxation therapy for two in the same home-spa setting." },
    ]
  },
  nails: {
    label: "Nail Care", icon: "💅", note: "Prices from ₱299", color: { bg: "#6b5a2e", glow: "rgba(107,90,46,0.38)", badge: "rgba(255,255,255,0.15)" }, list: [
      { name: "Manicure", price: 299, dur: "30 min", img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80", desc: "Professional manicure including shape refining, cuticle care, and choice polish." },
      { name: "Pedicure", price: 299, dur: "30 min", img: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80", desc: "Relaxing pedicure soak, salt scrub exfoliation, shaping, and polish." },
      { name: "Regular Nails (Mani & Pedi)", price: 399, dur: "1 hr", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80", desc: "Comprehensive classic manicure and pedicure service package." },
      { name: "Manigel", price: 699, dur: "1 hr", img: "https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&w=800&q=80", desc: "Long-lasting gel manicure cured with UV/LED light for a shiny finish." },
      { name: "Pedigel", price: 699, dur: "1 hr", img: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80", desc: "Extended-wear gel pedicure designed to look fresh for weeks." },
      { name: "Gel Nails (Mani & Pedi)", price: 1199, dur: "1.5 hrs", img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80", desc: "Premium full gel manicure and pedicure combination package." },
      { name: "ManePedi Foot Spa", price: 799, dur: "1 hr", img: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80", desc: "Manicure, pedicure, and deeply soothing therapeutic foot spa." },
      { name: "Nails Extension", price: 1499, dur: "2 hrs", img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80", desc: "Full set extension using durable tips or forms for a natural, elegant look." },
      { name: "Nails Extension with Design", price: 1699, dur: "2.5 hrs", img: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80", desc: "Nail extensions featuring custom hand-painted art or nail accents." },
      { name: "Nails Extension Package", price: 1999, dur: "3 hrs", img: "https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&w=800&q=80", desc: "All-inclusive package covering extensions, custom art, and cuticle hydration." },
    ]
  },
  other: {
    label: "Other Services", icon: "✨", note: "Ask for pricing", color: { bg: "#1e3a5f", glow: "rgba(30,58,95,0.38)", badge: "rgba(255,255,255,0.15)" }, list: [
      { name: "Ear Wax Candling", price: null, dur: "30 min", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", desc: "Relaxing ear wax candling to promote warmth and inner ear pressure balance." },
      { name: "Eyebrow Threading", price: null, dur: "15 min", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80", desc: "Precise hair threading to groom and define natural eyebrow arches." },
      { name: "Under Arm Waxing", price: null, dur: "20 min", img: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80", desc: "Smooth hair removal for underarms using premium honey wax." },
      { name: "Foot Spa", price: null, dur: "45 min", img: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80", desc: "Indulgent foot soak, scrub exfoliation, and moisturizing butter wrap." },
      { name: "Eyelash Extensions", price: null, dur: "1.5 hrs", img: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80", desc: "Lightweight individual extensions for long, voluminous, beautiful lashes." },
      { name: "Legs Waxing (Half or Full)", price: null, dur: "30 min", img: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80", desc: "Complete or half-leg hair removal leaving skin smooth and soft." },
      { name: "Paraffin Treatment (Hand & Foot)", price: null, dur: "45 min", img: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80", desc: "Warm soothing paraffin dip to deeply hydrate dry hands or tired feet." },
    ]
  },
};

const EASE = [0.22, 1, 0.36, 1];

/* ── Motion Reveal Helper ─────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, className = "", dir = "up" }) => {
  const ref = useRef(null);
  const iv = useInView(ref, { once: true, margin: "-50px" });
  const y = dir === "up" ? 44 : dir === "down" ? -44 : 0;
  const x = dir === "left" ? 44 : dir === "right" ? -44 : 0;
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y, x }}
      animate={iv ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.9, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
};

const ParImg = ({ src, alt, className }) => (
  <div className={`overflow-hidden ${className}`}>
    <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" />
  </div>
);

const Orb = ({ style, delay = 0, dur = 10 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none blur-2xl"
    style={{ willChange: "transform", transform: "translateZ(0)", ...style }}
    animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Counter = ({ target, suffix = "" }) => {
  const ref = useRef(null);
  const iv = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const [val, setVal] = useState("0");
  useEffect(() => {
    if (!iv) return;
    const c = animate(mv, target, { duration: 2, ease: "easeOut", onUpdate: v => setVal(Number.isInteger(target) ? Math.round(v).toLocaleString() : v.toFixed(1)) });
    return c.stop;
  }, [iv, target, mv]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── React Bits: Spotlight Card (Zero Re-render GPU Accelerated) ─── */
const SpotlightCard = ({ children, className = "", style = {}, spotlightColor = "rgba(191,161,95,0.12)" }) => {
  const divRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    divRef.current.style.setProperty("--x", `${e.clientX - rect.left}px`);
    divRef.current.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={divRef}
      className={`relative overflow-hidden group/spotlight ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-300 rounded-[inherit]"
        style={{
          background: `radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};

/* ── React Bits: Magnetic Button ─────────────────────────────────────
   Spring-physics magnetic attraction button on cursor hover (Desktops)
─────────────────────────────────────────────────────────────────── */
const MagneticBtn = ({ children, className = "", style = {}, strength = 0.25 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }, [x, y, strength]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, ...style }}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

/* ── Service Card with Spotlight ─────────────────────────────────── */
const Card = ({ s, i, cat }) => (
  <motion.div
    initial={{ opacity: 0, y: 36 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, delay: i * 0.055, ease: EASE }}
    whileHover={{ y: -14, transition: { duration: 0.3 } }}
    className="group flex flex-col rounded-[28px] overflow-hidden"
    style={{ background: "linear-gradient(145deg,#fdfdfc,#f7f2ea)", boxShadow: "16px 16px 40px #e4ddd3,-8px -8px 22px #fff,inset 2px 2px 4px rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.9)" }}
  >
    <SpotlightCard spotlightColor={`${cat.color.bg}22`} className="flex flex-col flex-1">
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <motion.img src={s.img} alt={s.name} className="w-full h-full object-cover" whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)" }}>
          <Clock className="w-3 h-3 text-amber-300" />{s.dur}
        </span>
        {s.price && <span className="absolute top-3 right-3 text-xs font-black text-white px-3 py-1 rounded-full" style={{ background: `${cat.color.bg}e0`, backdropFilter: "blur(8px)" }}>₱{s.price.toLocaleString()}</span>}
      </div>
      <div className="flex-1 flex flex-col p-5">
        <h4 className="font-bold text-slate-800 text-[15px] leading-snug tracking-tight group-hover:text-emerald-900 transition-colors mb-2">{s.name}</h4>
        <p className="text-xs text-slate-400 leading-relaxed flex-1">{s.desc}</p>
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <div>{s.price ? <span className="text-lg font-black text-emerald-900">₱{s.price.toLocaleString()}</span> : <span className="text-xs font-semibold text-slate-400 italic">Call for pricing</span>}</div>
          <Link to="/register" className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-[11px] font-bold text-white hover:scale-105 active:scale-95 transition-all duration-300" style={{ background: `linear-gradient(135deg,${cat.color.bg},${cat.color.bg}bb)`, boxShadow: `0 4px 14px ${cat.color.glow}` }}>Book <ArrowRight className="w-3 h-3" /></Link>
        </div>
      </div>
    </SpotlightCard>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [tab, setTab] = useState("massage");
  const [showAll, setShowAll] = useState(false);
  const mqRef = useRef(null);

  const lenisRef = useRef(null);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const onS = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };

    if (!isTouchDevice) {
      document.documentElement.classList.add("lenis");
      const lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        infinite: false,
      });
      lenisRef.current = lenis;

      let reqId;
      const raf = (time) => {
        lenis.raf(time);
        reqId = requestAnimationFrame(raf);
      };
      reqId = requestAnimationFrame(raf);

      window.addEventListener("scroll", onS, { passive: true });
      return () => {
        cancelAnimationFrame(reqId);
        lenis.destroy();
        document.documentElement.classList.remove("lenis");
        window.removeEventListener("scroll", onS);
      };
    } else {
      window.addEventListener("scroll", onS, { passive: true });
      return () => window.removeEventListener("scroll", onS);
    }
  }, []);

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setMobile(false);
      const targetEl = document.querySelector(href);
      if (targetEl) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(targetEl, { offset: -72, duration: 1.0, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        } else {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  useEffect(() => {
    const el = mqRef.current; if (!el) return;
    const items = el.querySelectorAll(".mq"); if (!items.length) return;
    const tl = gsap.to(items, { xPercent: -100, repeat: -1, duration: 30, ease: "none", modifiers: { xPercent: gsap.utils.wrap(-100, 0) } });
    el.addEventListener("mouseenter", () => tl.pause());
    el.addEventListener("mouseleave", () => tl.resume());
    return () => tl.kill();
  }, []);

  const cat = SVCS[tab];
  const vis = showAll ? cat.list : cat.list.slice(0, 6);
  const social = [
    { I: FacebookIcon, label: "Facebook", href: "#", hover: "#1877F2" },
    { I: InstagramIcon, label: "Instagram", href: "#", hover: "#E4405F" },
    { I: TikTokIcon, label: "TikTok", href: "#", hover: "#010101" },
    { I: TwitterXIcon, label: "X", href: "#", hover: "#14171A" },
    { I: YouTubeIcon, label: "YouTube", href: "#", hover: "#FF0000" },
    { I: WhatsAppIcon, label: "WhatsApp", href: "https://wa.me/639995435913", hover: "#25D366" },
  ];

  const NAV_LINKS = [["#story", "Our Story"], ["#services", "Services"], ["#how-it-works", "How It Works"], ["#testimonials", "Reviews"]];

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900" style={{ fontFamily: "'Inter',sans-serif", background: "#faf9f7" }}>

      {/* ── GLASSMORPHISM NAVBAR ── */}
      <motion.header
        initial={{ y: -88, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#04100a]/90 backdrop-blur-md border-[rgba(191,161,95,0.22)] shadow-lg shadow-black/40"
            : "bg-[#04100a]/50 backdrop-blur-sm border-white/5"
        }`}
      >

        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between py-3.5 lg:py-4">

            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0">
                <motion.div className="absolute inset-0 rounded-full" style={{ border: "1.5px solid rgba(191,161,95,0.55)" }} animate={{ scale: [1, 1.22, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2.8, repeat: Infinity }} />
                <img src="/cb-logo.jpg" alt="Cozy Blissful Salon Spa" className="w-10 h-10 lg:w-11 lg:h-11 rounded-full object-cover relative z-10" style={{ border: "2px solid rgba(191,161,95,0.55)", boxShadow: "0 0 0 1px rgba(191,161,95,0.15),0 4px 20px rgba(0,0,0,0.4)" }} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 z-20" style={{ background: "#34d399", borderColor: "#041e16" }} />
              </div>
              <div className="leading-none">
                <span className="text-sm font-black tracking-wide text-white block group-hover:text-amber-200 transition-colors duration-300" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful</span>
                <span className="text-[9px] font-bold tracking-[0.18em] uppercase block mt-0.5" style={{ color: "#bfa15f" }}>Salon & Spa</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(([href, label]) => (
                <a key={href} href={href} onClick={(e) => handleNavClick(e, href)}
                  className="relative px-4 py-2 text-xs font-bold tracking-wide text-white/75 hover:text-white transition-colors duration-300 group cursor-pointer rounded-lg hover:bg-white/[0.04]">
                  {label}
                  <span className="absolute bottom-1 left-4 right-4 h-[1.5px] rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-350" style={{ background: "linear-gradient(90deg,#bfa15f,#e8cc8a)" }} />
                </a>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="px-5 py-2 text-xs font-bold rounded-xl hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>Log In</Link>
              <MagneticBtn strength={0.25}>
                <Link to="/register" id="nav-book" className="px-5 py-2.5 text-xs font-black text-[#041e16] rounded-xl flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all duration-200" style={{ background: "linear-gradient(135deg,#bfa15f,#e8cc8a)", boxShadow: "0 4px 18px rgba(191,161,95,0.45)" }}>
                  <Sparkles className="w-3.5 h-3.5" />Book Now
                </Link>
              </MagneticBtn>
            </div>

            {/* Mobile Hamburger Toggle (Instant 0ms Tap Response) */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-white active:scale-90 transition-transform duration-150 touch-manipulation"
              onClick={() => setMobile(v => !v)}>
              {mobile ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer (GPU Hardware Accelerated — 0 Lag) */}
        <AnimatePresence>
          {mobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform, opacity" }}
              className="md:hidden w-full border-t border-[rgba(191,161,95,0.18)] bg-[#040c08]/98 backdrop-blur-md shadow-2xl">
              <div className="px-6 py-5 flex flex-col gap-1">
                {NAV_LINKS.map(([href, label]) => (
                  <a key={href} href={href} onClick={(e) => handleNavClick(e, href)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white cursor-pointer active:bg-[#bfa15f]/15 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#bfa15f]" />
                    <span className="text-sm font-semibold">{label}</span>
                  </a>
                ))}
                <div className="my-2 h-px mx-1 bg-[rgba(191,161,95,0.12)]" />
                <div className="flex gap-2.5 pt-1">
                  <Link to="/login" onClick={() => setMobile(false)} className="flex-1 text-center py-3 rounded-xl text-sm font-bold text-white/80 border border-white/10 bg-white/5 active:bg-white/10 transition-colors">Log In</Link>
                  <Link to="/register" onClick={() => setMobile(false)} className="flex-1 text-center py-3 rounded-xl text-sm font-bold text-[#041e16] flex items-center justify-center gap-2 bg-gradient-to-r from-[#bfa15f] to-[#d4b87a] active:scale-95 transition-transform" style={{ boxShadow: "0 4px 16px rgba(191,161,95,0.35)" }}>
                    <Sparkles className="w-3.5 h-3.5" />Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── HERO SECTION — SPA ATMOSPHERE ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg,#041e16 0%,#073328 55%,#0e4d38 100%)" }}>

        {/* Background Spa Atmosphere Image */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1920&q=65"
            alt="Luxury Spa Atmosphere"
            className="w-full h-full object-cover opacity-[0.18]"
          />
          {/* Gradient overlay to keep text readable */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(4,30,22,0.72) 0%,rgba(7,51,40,0.55) 60%,rgba(14,77,56,0.65) 100%)" }} />
        </div>

        <Orb style={{ width: 580, height: 580, right: "1%", top: "3%", background: "radial-gradient(circle,rgba(191,161,95,0.14) 0%,transparent 68%)" }} dur={12} />
        <Orb style={{ width: 360, height: 360, left: "0%", bottom: "4%", background: "radial-gradient(circle,rgba(52,201,158,0.09) 0%,transparent 70%)" }} delay={3} dur={15} />
        <Orb style={{ width: 220, height: 220, left: "30%", top: "20%", background: "radial-gradient(circle,rgba(191,161,95,0.06) 0%,transparent 70%)" }} delay={6} dur={18} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full pt-32 pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left Text Column */}
            <div className="flex-1 z-10 w-full lg:max-w-[580px] text-center lg:text-left">

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-amber-300 mb-6"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(191,161,95,0.28)", backdropFilter: "blur(10px)" }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cozy Blissful Salon & Spa · Premium Wellness Destination</span>
              </motion.div>

              {/* Animated Shimmer Gradient Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 52 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                className="text-4xl sm:text-5xl lg:text-[3.7rem] xl:text-[4.3rem] font-black text-white leading-[1.03] mb-6"
                style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.01em" }}>
                Step Into<br />
                <motion.span
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    backgroundImage: "linear-gradient(90deg,#e8cc8a,#bfa15f,#f5dfa0,#bfa15f,#e8cc8a)",
                    backgroundSize: "300% 100%",
                    fontStyle: "italic",
                  }}>
                  Your Sanctuary.
                </motion.span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }}
                className="text-emerald-100/70 text-sm sm:text-base lg:text-lg mb-9 leading-relaxed max-w-md mx-auto lg:mx-0">
                World-class massage therapy, nail care & beauty treatments — all inside our premium salon suites. Walk in or book ahead, open 7 days a week.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
                <MagneticBtn strength={0.2}>
                  <Link to="/register" id="hero-explore"
                    className="group inline-flex items-center justify-center gap-2.5 py-4 px-8 text-sm font-black rounded-2xl transition-all duration-300"
                    style={{ background: "linear-gradient(135deg,#c9a851,#e8cc8a)", color: "#041e16", boxShadow: "0 10px 34px rgba(191,161,95,0.44)" }}>
                    Explore Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticBtn>
                <MagneticBtn strength={0.15}>
                  <Link to="/register" id="hero-book"
                    className="inline-flex items-center justify-center py-4 px-8 text-sm font-bold text-white/85 rounded-2xl hover:bg-white/10 transition-all duration-300"
                    style={{ border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                    Book a Session
                  </Link>
                </MagneticBtn>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.85 }}
                className="flex items-center gap-5 mt-9 flex-wrap justify-center lg:justify-start">
                {["Private Suites", "Certified Therapists", "Sanitized Tools", "Walk-Ins Welcome"].map(b => (
                  <div key={b} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-200/65 font-semibold">{b}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Spa Image Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.3, delay: 0.25, ease: EASE }}
              className="hidden lg:flex flex-1 justify-center relative z-10">
              <div className="relative w-[440px] xl:w-[480px]">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle,#bfa15f 0%,transparent 65%)" }} />

                {/* Main Hero Card — Warm Spa Massage Suite */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
                  className="w-full h-[460px] xl:h-[500px] rounded-[36px] overflow-hidden relative shadow-2xl"
                  style={{ border: "2px solid rgba(191,161,95,0.35)", boxShadow: "0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(191,161,95,0.15)" }}>
                  <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80"
                    alt="Cozy Blissful Salon Spa Ambience"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(4,30,22,0.88) 0%, rgba(4,30,22,0.18) 50%, transparent 100%)" }} />

                  {/* Floating animated glow dot */}
                  <motion.div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }} />

                  <div className="absolute bottom-6 left-6 right-6 text-left">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 border border-amber-400/30 backdrop-blur-md mb-2">
                      Premium Salon & Spa
                    </span>
                    <h3 className="text-white text-xl font-black" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful Salon Spa</h3>
                    <p className="text-emerald-200/70 text-xs mt-1">Your premier urban wellness destination in the city.</p>
                  </div>
                </motion.div>

                {/* Floating Rating Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.7 }}
                  className="absolute -top-4 -left-6 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl"
                  style={{ background: "rgba(4,18,12,0.92)", border: "1px solid rgba(191,161,95,0.3)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-400/20 text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Rating</p>
                    <p className="text-xs text-white font-black">4.9 / 5.0 ★★★★★</p>
                  </div>
                </motion.div>

                {/* Floating Trust Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.7 }}
                  className="absolute -bottom-4 -right-6 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl"
                  style={{ background: "rgba(4,18,12,0.92)", border: "1px solid rgba(191,161,95,0.3)", boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-400/20 text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Clients Served</p>
                    <p className="text-xs text-white font-black">2,500+ Happy Guests</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById("stats-strip")?.scrollIntoView({ behavior: "smooth" })}>
          <span className="text-[9px] text-white/30 tracking-widest uppercase font-semibold">Scroll</span>
          <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS + MARQUEE ── */}
      <section id="stats-strip" style={{ background: "linear-gradient(135deg,#051f17,#0a3d30)" }}>
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ v: 2500, s: "+", l: "Happy Clients" }, { v: 4.9, s: "★", l: "Average Rating" }, { v: 30, s: "+", l: "Expert Therapists" }, { v: 7, s: " Days", l: "Always Available" }].map((st, i) => (
            <Reveal key={st.l} delay={i * 0.09} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white mb-1.5 tracking-tight"><Counter target={st.v} suffix={st.s} /></p>
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(191,161,95,0.85)" }}>{st.l}</p>
            </Reveal>
          ))}
        </div>
        <div ref={mqRef} className="overflow-hidden border-t py-4" style={{ borderColor: "rgba(191,161,95,0.1)" }}>
          <div className="flex items-center gap-12 whitespace-nowrap">
            {[...Array(4)].map((_, set) => (
              <div key={set} className="mq flex items-center gap-12 flex-shrink-0">
                {["Massage Therapy", "Nail Care", "Eyelash Extensions", "Foot Spa", "Waxing Services", "Hilot Healing", "Couple Massage", "Post-Natal Care"].map(item => (
                  <span key={item} className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-3" style={{ color: "rgba(191,161,95,0.45)" }}>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ background: "rgba(191,161,95,0.3)" }} />{item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section id="story" className="py-20 md:py-28 lg:py-32 px-4 sm:px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#faf9f7 0%,#f5f0e6 100%)" }}>
        <Orb style={{ width: 500, height: 500, right: "-6%", top: "8%", background: "radial-gradient(circle,rgba(191,161,95,0.12) 0%,transparent 70%)" }} dur={15} />
        <Orb style={{ width: 420, height: 420, left: "-5%", bottom: "5%", background: "radial-gradient(circle,rgba(10,61,48,0.08) 0%,transparent 70%)" }} delay={3} dur={13} />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section Header */}
          <Reveal className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 mb-4 shadow-sm">
              <Sparkle className="w-3.5 h-3.5 text-amber-600" />
              <span>Our Story & Craft</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 leading-tight" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.01em" }}>
              Where Luxury Meets<br />
              <span style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text", backgroundImage: "linear-gradient(135deg,#0a3d30,#1e5e4b)", fontStyle: "italic", backgroundClip: "text" }}>
                True Wellness
              </span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              Bringing authentic Hilot healing, salon luxury, and world-class treatments to our premium suites — right in the heart of the city.
            </p>
          </Reveal>

          {/* Main Grid: Image Left + Narrative Right */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start mb-16 md:mb-20">

            {/* LEFT — Image Composition */}
            <Reveal dir="left" className="w-full lg:w-[58%] flex-shrink-0">
              {/* Quote badge – visible on mobile ABOVE the image, hidden then shown as overlay on lg+ */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.65 }}
                className="flex lg:hidden items-start gap-3 mb-4 p-4 rounded-2xl"
                style={{ background: "rgba(4,30,22,0.92)", border: "1px solid rgba(191,161,95,0.35)" }}>
                <Quote className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-white/90 italic font-medium leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", lineHeight: "1.7" }}>
                    "We built a space where every visit feels like an escape — where luxury, healing, and serenity meet."
                  </p>
                  <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-2">
                    — Founder, Cozy Blissful Salon Spa
                  </p>
                </div>
              </motion.div>

              {/* Main image card */}
              <div className="relative">
                {/* Outer wrapper: position context for the desktop floating badge */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.4 }}
                  className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden"
                  style={{
                    border: "2px solid rgba(191,161,95,0.35)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 0 0 1px rgba(191,161,95,0.1)",
                  }}
                >
                  {/* Spa image — deep tissue massage hands */}
                  <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
                    alt="Cozy Blissful Spa — Massage Therapy"
                    className="w-full object-cover relative z-0"
                    style={{ height: "clamp(280px, 50vw, 500px)" }}
                  />
                  {/* Gradient overlay — sits ON TOP of the image */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(4,30,22,0.88) 0%, rgba(4,30,22,0.25) 55%, transparent 100%)" }}
                  />
                  {/* Caption overlay inside the card */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 border border-amber-400/30 backdrop-blur-md mb-2">
                      Authentic Filipino Healing
                    </span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>The Art of Salon Wellness</h3>
                    <p className="text-emerald-200/75 text-xs sm:text-sm mt-1">Combining traditional Hilot with modern salon pampering in our private suites.</p>
                  </div>

                  {/* Spotlight hover glow overlay */}
                  <SpotlightCard
                    spotlightColor="rgba(191,161,95,0.09)"
                    className="absolute inset-0 pointer-events-none"
                  />
                </motion.div>

                {/* Desktop-only floating quote badge — top-left of card */}
                <motion.div
                  initial={{ opacity: 0, x: -20, y: -10 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 0.7 }}
                  className="hidden lg:block absolute -top-5 -left-5 max-w-[280px] p-5 rounded-2xl backdrop-blur-xl shadow-2xl z-20"
                  style={{ background: "rgba(4,30,22,0.95)", border: "1px solid rgba(191,161,95,0.38)" }}
                >
                  <Quote className="w-5 h-5 text-amber-400 mb-2 opacity-90" />
                  <p className="text-white/90 italic font-medium leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", lineHeight: "1.7" }}>
                    "We built a space where every visit feels like an escape — where luxury, healing, and serenity meet."
                  </p>
                  <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-3">
                    — Founder, Cozy Blissful Salon Spa
                  </p>
                </motion.div>
              </div>
            </Reveal>

            {/* RIGHT — Story Narrative */}
            <Reveal dir="right" delay={0.15} className="w-full lg:flex-1">
              <div className="space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-black">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Est. 2019 · Laguna & Metro Manila</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Your Premier Urban Wellness Destination
                </h3>

                <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed">
                  <strong className="text-slate-800 font-bold">Cozy Blissful Salon Spa</strong> was built to offer a true sanctuary experience — a dedicated space where you can leave the noise of the world behind and surrender to expert care in luxurious, private suites.
                </p>

                <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed">
                  Rooted in traditional Filipino <strong className="text-slate-800 font-bold">Hilot</strong> techniques and elevated with modern salon nail care and aromatherapy, our certified specialists use only premium tools, fresh linens, and organic essential oils — every single visit.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1">
                  <SpotlightCard spotlightColor="rgba(10,61,48,0.08)" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                    <p className="text-2xl sm:text-3xl font-black text-emerald-900">2,500+</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Satisfied Guests</p>
                  </SpotlightCard>
                  <SpotlightCard spotlightColor="rgba(191,161,95,0.1)" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                    <p className="text-2xl sm:text-3xl font-black text-amber-700">30+</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Certified Therapists</p>
                  </SpotlightCard>
                </div>

                <div className="pt-1">
                  <MagneticBtn strength={0.2} className="inline-block">
                    <Link to="/register"
                      className="inline-flex items-center gap-2 py-3.5 px-7 rounded-xl font-black text-xs text-[#041e16] hover:brightness-110 transition-all duration-200"
                      style={{ background: "linear-gradient(135deg,#bfa15f,#e8cc8a)", boxShadow: "0 6px 20px rgba(191,161,95,0.4)" }}>
                      Experience Cozy Blissful <ArrowRight className="w-4 h-4" />
                    </Link>
                  </MagneticBtn>
                </div>
              </div>
            </Reveal>
          </div>

          {/* 4 Feature Pillars */}
          <Reveal delay={0.2}>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                { title: "Traditional Hilot", sub: "Warm banana leaf & coconut oil healing technique", icon: Leaf, color: "#0a3d30" },
                { title: "Certified Specialists", sub: "Rigorous background checks & clinical training", icon: Shield, color: "#6b5a2e" },
                { title: "Private Salon Suites", sub: "Exclusive rooms for complete privacy & comfort", icon: MapPin, color: "#1e3a5f" },
                { title: "Walk-In & Bookings", sub: "Open 7 days a week, 9 AM to 9 PM", icon: Clock, color: "#0a3d30" },
              ].map(({ title, sub, icon: Icon, color }) => (
                <SpotlightCard key={title} spotlightColor={`${color}18`}
                  className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-left cursor-default"
                  style={{ background: "linear-gradient(145deg,#ffffff,#f7f3ea)", border: "1px solid rgba(255,255,255,0.95)", boxShadow: "10px 10px 28px #e6dfd5,-6px -6px 16px #fff" }}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4" style={{ background: `${color}14`, border: `1px solid ${color}22` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{sub}</p>
                  </motion.div>
                </SpotlightCard>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#faf9f7 0%,#f2ebe0 100%)" }}>
        <ParImg src="https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=400&q=50" alt="" className="absolute right-[-4%] top-[6%] w-60 h-72 rounded-3xl opacity-[0.07] hidden md:block" strength={0.1} />
        <div className="max-w-6xl mx-auto relative">
          <Reveal className="text-center mb-10 md:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 mb-4">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>How It Works</h2>
            <p className="text-slate-400 max-w-xs mx-auto mt-3 text-sm leading-relaxed">Three simple steps to your perfect salon & spa experience.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
            {[
              { icon: Calendar, color: "#0a3d30", bg: "rgba(10,61,48,0.1)", title: "Book Your Visit", desc: "Choose your service online or by phone, pick a date & time — and we'll handle the rest." },
              { icon: UserCheck, color: "#6b5a2e", bg: "rgba(107,90,46,0.1)", title: "We Assign Your Specialist", desc: "Our admin team carefully matches you with a certified therapist suited for your chosen treatment." },
              { icon: Sparkles, color: "#1e3a5f", bg: "rgba(30,58,95,0.1)", title: "Arrive & Unwind", desc: "Walk into your private suite, breathe in the ambiance, and let our specialists work their magic." },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={idx * 0.14}>
                  <SpotlightCard spotlightColor={`${step.color}14`}
                    className="p-8 rounded-3xl text-left relative overflow-hidden group cursor-default h-full"
                    style={{ background: "linear-gradient(145deg,#fdfdfc,#faf8f5)", boxShadow: "20px 20px 44px #ede7de,-8px -8px 24px #fff,inset 2px 2px 4px rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)" }}>
                    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.28 }}>
                      <div className="flex items-start justify-between mb-7">
                        <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: step.bg, border: `1px solid ${step.color}22` }}>
                          <Icon className="w-6 h-6" style={{ color: step.color }} />
                        </motion.div>
                        <span className="text-6xl font-black select-none" style={{ color: "rgba(0,0,0,0.04)" }}>{String(idx + 1).padStart(2, "0")}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mb-3">{step.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                    </motion.div>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PARALLAX BANNER — SPA SANCTUARY ── */}
      <section className="relative h-[280px] sm:h-[340px] md:h-[420px] overflow-hidden flex items-center justify-center">
        {/* Updated parallax banner to warm aromatherapy spa image */}
        <ParImg
          src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1800&q=70"
          alt="Spa Sanctuary"
          className="absolute inset-0 w-full h-full"
          strength={0.18}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(4,30,22,0.88),rgba(10,61,48,0.80))" }} />
        <div className="relative z-10 text-center px-6">
          <Reveal>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(191,161,95,0.75)" }}>The Cozy Blissful Promise</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight max-w-2xl mx-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
              "Your Serenity is Our<br /><span style={{ color: "#d4b87a", fontStyle: "italic" }}>Greatest Craft."</span>
            </h2>
            <p className="text-emerald-200/50 text-sm mt-5 max-w-sm mx-auto leading-relaxed">Every therapist is handpicked, trained, and committed to delivering a five-star salon & spa experience inside our private suites.</p>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7, ease: EASE }} className="mt-6 inline-flex items-center gap-2">
              <div className="flex -space-x-2">
                {["#0a3d30", "#6b5a2e", "#1e3a5f"].map(c => <div key={c} className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-white font-black text-xs" style={{ background: c }}>✓</div>)}
              </div>
              <span className="text-white/60 text-xs font-semibold ml-1">2,500+ satisfied clients</span>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 md:py-28 px-4 sm:px-6" style={{ background: "#faf9f7" }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-4">Specialist Treatments</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Our Salon Menu</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">Curated in-salon treatments for complete mind and body care — inside our premium suites.</p>
          </Reveal>
          <Reveal delay={0.1} className="flex overflow-x-auto no-scrollbar py-2 px-1 justify-start sm:justify-center gap-2.5 sm:gap-3.5 mb-10 flex-nowrap sm:flex-wrap">
            {Object.entries(SVCS).map(([key, c]) => (
              <motion.button key={key} onClick={() => { setTab(key); setShowAll(false); }}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300"
                style={tab === key
                  ? { background: c.color.bg, color: "#fff", boxShadow: "0 8px 28px " + c.color.glow }
                  : { background: "linear-gradient(145deg,#fdfdfc,#f4ede1)", color: "#64748b", boxShadow: "4px 4px 10px #e6dfd5,-4px -4px 10px #fff", border: "1px solid rgba(0,0,0,0.04)" }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <span>{c.icon}</span><span>{c.label}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: tab === key ? c.color.badge : "rgba(0,0,0,0.07)", color: tab === key ? "#fff" : "#94a3b8" }}>{c.list.length}</span>
              </motion.button>
            ))}
          </Reveal>
          <AnimatePresence mode="wait">
            <motion.div key={tab + "-note"} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="text-center mb-8">
              <span className="text-xs font-bold px-4 py-2 rounded-xl" style={{ background: cat?.color.bg + "18", color: cat?.color.bg }}>{cat?.icon} {cat?.note}</span>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {vis.map((s, i) => <Card key={s.name} s={s} i={i} cat={cat} />)}
            </motion.div>
          </AnimatePresence>
          {cat.list.length > 6 && (
            <Reveal className="text-center mt-10">
              <motion.button onClick={() => setShowAll(v => !v)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm hover:scale-105 transition-all duration-300"
                style={{ background: "linear-gradient(145deg,#fdfdfc,#f4ede1)", color: cat.color.bg, border: "1.5px solid " + cat.color.bg + "30", boxShadow: "6px 6px 18px #e6dfd5,-4px -4px 12px #fff" }}
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <motion.span animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.3 }}><ChevronDown className="w-4 h-4" /></motion.span>
                {showAll ? "Show Less" : "View All " + cat.list.length + " " + cat.label + " Services"}
              </motion.button>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#ede4d6,#e4d9c8)" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 mb-4">Client Reviews</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>What Our Guests Say</h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
              <span className="ml-2 text-sm font-bold text-slate-600">4.9 / 5.0 average</span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            {[
              { name: "Sarah M.", role: "Regular Guest", stars: 5, text: "Absolutely incredible. The ambiance of the suite alone melted my stress away — and the Swedish massage was world-class. I'll be back weekly!" },
              { name: "James T.", role: "Corporate Client", stars: 5, text: "We book Cozy Blissful for our team mid-week unwinding. The private suites are spotless, therapists are always professional and on time." },
              { name: "Alicia R.", role: "First-time Guest", stars: 5, text: "From the moment I walked in, I knew this was special. Beautifully designed space, expertly assigned therapist, and the best Hilot I've ever had." },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.12}>
                <SpotlightCard spotlightColor="rgba(191,161,95,0.08)"
                  className="p-8 rounded-3xl flex flex-col justify-between h-full"
                  style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 8px 36px rgba(0,0,0,0.07)", border: "1px solid rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}>
                  <motion.div whileHover={{ y: -8, transition: { duration: 0.25 } }} className="flex flex-col h-full">
                    <div className="flex space-x-0.5 mb-5">{[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}</div>
                    <p className="text-slate-600 text-sm leading-relaxed italic flex-1">"{t.text}"</p>
                    <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-sm">{t.name.charAt(0)}</div>
                      <div><p className="font-bold text-slate-800 text-sm">{t.name}</p><p className="text-slate-400 text-[10px] font-semibold">{t.role}</p></div>
                    </div>
                  </motion.div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#041e16,#073328,#0e4d38)" }}>
        <Orb style={{ width: 500, height: 500, right: "-5%", top: "-10%", background: "radial-gradient(circle,rgba(191,161,95,0.11) 0%,transparent 70%)" }} dur={12} />
        <Orb style={{ width: 320, height: 320, left: "-3%", bottom: "-5%", background: "radial-gradient(circle,rgba(52,201,158,0.08) 0%,transparent 70%)" }} delay={2.5} dur={14} />
        <Reveal className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold mb-6" style={{ background: "rgba(191,161,95,0.15)", color: "#d4b87a", border: "1px solid rgba(191,161,95,0.22)" }}>Reserve Your Session</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Sanctuary Awaits.<br />
            <span style={{ color: "#d4b87a", fontStyle: "italic" }}>Book Today.</span>
          </h2>
          <p className="text-emerald-200/55 text-sm max-w-md mx-auto mb-10 leading-relaxed">Step into our premium salon suites and let our certified specialists restore your mind, body, and spirit. Book ahead or walk in — we're ready for you.</p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <MagneticBtn strength={0.2}>
              <Link to="/register" id="cta-book"
                className="group py-4 px-9 font-bold rounded-2xl flex items-center justify-center gap-3 text-sm hover:brightness-110 transition-all duration-200"
                style={{ background: "linear-gradient(135deg,#d4b87a,#bfa15f)", color: "#041e16", boxShadow: "0 10px 32px rgba(191,161,95,0.4)" }}>
                Book a Treatment<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticBtn>
            <MagneticBtn strength={0.15}>
              <Link to="/login" id="cta-signin"
                className="py-4 px-9 font-bold text-white/85 rounded-2xl flex items-center justify-center text-sm transition-all duration-300 hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
                Sign In
              </Link>
            </MagneticBtn>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#020d07" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img src="/cb-logo.jpg" alt="Cozy Blissful Salon Spa" className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid rgba(191,161,95,0.3)" }} />
              <div>
                <p className="font-black text-white text-sm tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Cozy Blissful Salon Spa</p>
                <p className="text-amber-500/65 text-[10px] font-bold tracking-widest uppercase">Salon & Spa</p>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">Premium in-salon massage therapy, nail care, and beauty treatments inside our private suites. Professional, certified, and always welcoming.</p>
            <p className="text-emerald-400/70 text-xs font-semibold">Open: 9:00 AM to 9:00 PM · 7 Days a Week</p>
          </div>
          <div>
            <p className="text-white/35 text-[10px] font-bold tracking-widest uppercase mb-5">Quick Links</p>
            <div className="flex flex-col gap-3.5">
              {[["#story", "Our Story"], ["#services", "Our Services"], ["#how-it-works", "How It Works"], ["#testimonials", "Client Reviews"]].map(([href, label]) => (
                <a key={href} href={href} className="text-white/45 text-xs font-semibold hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />{label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/35 text-[10px] font-bold tracking-widest uppercase mb-5">Client Portal</p>
            <div className="flex flex-col gap-3.5">
              {[["Sign In", "/login"], ["Create Account", "/register"], ["Book a Session", "/register"]].map(([label, to]) => (
                <Link key={label} to={to} className="text-white/45 text-xs font-semibold hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />{label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-7 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex flex-col items-center md:items-start gap-4">
              <p className="text-white/25 text-[9px] font-bold tracking-widest uppercase">Follow and Connect</p>
              <div className="flex items-center gap-2.5 flex-wrap">
                {social.map(s => {
                  const SI = s.I; return (
                    <motion.a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                      whileHover={{ scale: 1.15, backgroundColor: s.hover }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ duration: 0.2 }}>
                      <span className="text-white/40"><SI /></span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/20 text-xs">© {new Date().getFullYear()} Cozy Blissful Salon Spa. All Rights Reserved.</p>
              <p className="text-white/10 text-[10px] mt-1">Crafted with precision and luxury.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
