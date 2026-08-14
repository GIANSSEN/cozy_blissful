import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
   Forest #1A3A2A · Cream #FAF7F2 · Gold #C9A96E · Navy #0F1C14 · Muted #6B7C72
───────────────────────────────────────────────────────────────────────── */
const C = {
  forest: '#1A3A2A',
  cream: '#FAF7F2',
  gold: '#C9A96E',
  navy: '#0F1C14',
  muted: '#6B7C72',
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'DM Sans', system-ui, sans-serif";

/* ─────────────────────────────────────────────────────────────────────────
   SERVICE DATA
───────────────────────────────────────────────────────────────────────── */
const UNS = (id, w = 900, h = 700) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const CATEGORIES = [
  {
    id: 'massage',
    label: 'Massage Therapy',
    services: [
      {
        id: 'swedish',
        name: 'Swedish Massage',
        description: 'Classic full-body relaxation with long, gliding strokes that melt away tension and restore calm circulation.',
        price: 749,
        duration: '1 hr',
        photo: UNS('1544161515-4be31d52b622'),
        featured: true,
      },
      {
        id: 'deep-tissue',
        name: 'Deep Tissue Massage',
        description: 'Firm pressure targeting deep muscle layers and chronic tightness for lasting relief.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1507652313519-f8cfdeeafa93'),
      },
      {
        id: 'hilot',
        name: 'Hilot Massage',
        description: 'Traditional Filipino healing massage using warm coconut oil and banana leaves to restore balance.',
        price: 749,
        duration: '1 hr',
        photo: UNS('1559599101-f09722fb4948'),
      },
      {
        id: 'traditional',
        name: 'Traditional Massage',
        description: 'Standard restoration and relaxation utilizing moderate, balanced pressure across the whole body.',
        price: 749,
        duration: '1 hr',
        photo: UNS('1515377905703-c4788e51af15'),
      },
      {
        id: 'thai',
        name: 'Thai Massage',
        description: 'Dynamic assisted stretching and targeted acupressure to restore flow and flexibility.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1506126613408-eca07ce68773'),
      },
      {
        id: 'post-natal',
        name: 'Post Natal Massage',
        description: 'Restorative full-body therapy crafted to support mothers through their healing journey.',
        price: 899,
        duration: '1 hr',
        photo: UNS('1519014816548-bf5fe059798b'),
      },
      {
        id: 'hot-stone',
        name: 'Hot Stone Massage',
        description: 'Warm basalt stones placed along the body to melt deep-seated tension and promote deep relaxation.',
        price: 949,
        duration: '1 hr',
        photo: UNS('1540555700478-4be290a8d6a0'),
      },
      {
        id: 'aromatherapy',
        name: 'Aromatherapy Massage',
        description: 'Pure essential oils blended with gentle therapeutic strokes for total calm and sensory restoration.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1544161515-4be31d52b622'),
      },
      {
        id: 'shiatsu',
        name: 'Shiatsu Massage',
        description: 'Japanese finger-pressure technique targeting meridian points to restore vital energy flow.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1507652313519-f8cfdeeafa93'),
      },
      {
        id: 'reflexology',
        name: 'Reflexology',
        description: 'Focused pressure on reflex zones of the feet that correspond to organs and body systems.',
        price: 649,
        duration: '45 min',
        photo: UNS('1540555700478-4be290a8d6a0'),
      },
      {
        id: 'head-shoulder',
        name: 'Head & Shoulder Massage',
        description: 'Targeted relief massage for neck, scalp, and shoulder tension — perfect mid-day reset.',
        price: 549,
        duration: '30 min',
        photo: UNS('1515377905703-c4788e51af15'),
      },
      {
        id: 'couples',
        name: 'Couples Massage',
        description: 'Synchronized relaxation therapy for two in a shared private suite — perfect for bonding.',
        price: 1499,
        duration: '1 hr',
        photo: UNS('1519014816548-bf5fe059798b'),
      },
      {
        id: 'four-hands',
        name: 'Four Hands Massage',
        description: 'Two therapists working in perfect harmony for a deeply immersive full-body experience.',
        price: 1299,
        duration: '1 hr',
        photo: UNS('1544161515-4be31d52b622'),
      },
    ],
  },
  {
    id: 'nails',
    label: 'Nail Care',
    services: [
      {
        id: 'classic-mani',
        name: 'Classic Manicure',
        description: 'Professional nail shaping, cuticle care, gentle hand massage, and your choice of premium polish.',
        price: 399,
        duration: '45 min',
        photo: UNS('1604654894610-df63bc536371'),
        featured: true,
      },
      {
        id: 'classic-pedi',
        name: 'Classic Pedicure',
        description: 'Relaxing foot soak, exfoliating salt scrub, nail shaping, and glossy polish finish.',
        price: 449,
        duration: '1 hr',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
      {
        id: 'gel-mani',
        name: 'Gel Manicure',
        description: 'Long-lasting UV-cured gel polish for a flawlessly shiny, chip-resistant manicure.',
        price: 549,
        duration: '1 hr',
        photo: UNS('1604654894610-df63bc536371'),
      },
      {
        id: 'gel-pedi',
        name: 'Gel Pedicure',
        description: 'Extended-wear gel pedicure designed to look freshly polished for weeks.',
        price: 599,
        duration: '1 hr',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
      {
        id: 'spa-mani',
        name: 'Spa Manicure',
        description: 'Elevated manicure with warm paraffin dip, serum treatment, and premium polish.',
        price: 649,
        duration: '1.5 hr',
        photo: UNS('1604654894610-df63bc536371'),
      },
      {
        id: 'spa-pedi',
        name: 'Spa Pedicure',
        description: 'Luxurious pedicure with herbal soak, callus removal, mask treatment, and polish.',
        price: 699,
        duration: '1.5 hr',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
      {
        id: 'nail-art',
        name: 'Nail Art',
        description: 'Custom hand-painted designs, gems, and accent art — from minimal to intricate.',
        price: 50,
        duration: 'Varies',
        photo: UNS('1604654894610-df63bc536371'),
        priceLabel: '₱50/nail',
      },
      {
        id: 'acrylic',
        name: 'Acrylic Full Set',
        description: 'Durable full-set acrylic extension using tips or forms for elegant, natural-looking nails.',
        price: 999,
        duration: '2 hr',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
      {
        id: 'french-tips',
        name: 'French Tips',
        description: 'Timeless French manicure with crisp white tips and a soft pink base — always elegant.',
        price: 499,
        duration: '1 hr',
        photo: UNS('1604654894610-df63bc536371'),
      },
      {
        id: 'paraffin',
        name: 'Paraffin Wax Treatment',
        description: 'Warm soothing paraffin dip to deeply hydrate and soften dry, tired hands.',
        price: 599,
        duration: '45 min',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
    ],
  },
  {
    id: 'other',
    label: 'Other Services',
    services: [
      {
        id: 'back-facial',
        name: 'Back Facial',
        description: 'A complete deep-cleansing facial treatment applied to the back for clear, radiant skin.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1570172619644-dfd03ed5d881'),
        featured: true,
      },
      {
        id: 'body-scrub',
        name: 'Body Scrub',
        description: 'Invigorating full-body exfoliation using natural scrubs to reveal smooth, luminous skin.',
        price: 749,
        duration: '1 hr',
        photo: UNS('1545205597-3d9d02c29597'),
      },
      {
        id: 'body-wrap',
        name: 'Body Wrap',
        description: 'Nourishing botanical wrap to detox, hydrate, and revitalize every inch of your skin.',
        price: 999,
        duration: '1.5 hr',
        photo: UNS('1570172619644-dfd03ed5d881'),
      },
      {
        id: 'eyebrow-threading',
        name: 'Eyebrow Threading',
        description: 'Precise hair threading to groom and define your natural brow arches beautifully.',
        price: 199,
        duration: '15 min',
        photo: UNS('1545205597-3d9d02c29597'),
      },
      {
        id: 'lash-tinting',
        name: 'Eyelash Tinting',
        description: 'Semi-permanent lash tint for rich, defined lashes — no mascara needed.',
        price: 299,
        duration: '30 min',
        photo: UNS('1570172619644-dfd03ed5d881'),
      },
      {
        id: 'leg-wax',
        name: 'Full Leg Wax',
        description: 'Smooth hair removal from ankle to thigh using premium wax leaving skin silky-soft.',
        price: 799,
        duration: '1 hr',
        photo: UNS('1545205597-3d9d02c29597'),
      },
      {
        id: 'steam-sauna',
        name: 'Steam & Sauna',
        description: 'Private steam and sauna session to open pores, cleanse deeply, and deeply relax muscles.',
        price: 499,
        duration: '45 min',
        photo: UNS('1570172619644-dfd03ed5d881'),
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────────────────────────────────── */
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────
   SERVICE CARD — Featured (horizontal, col-span-2)
───────────────────────────────────────────────────────────────────────── */
const FeaturedCard = ({ service }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const priceLabel = service.priceLabel || (service.price ? `\u20b1${service.price.toLocaleString()}` : 'Inquire');

  return (
    <div className="sm-salon-featured" style={{
      gridColumn: 'span 2',
      display: 'flex',
      flexDirection: 'row',
      borderRadius: 20,
      overflow: 'hidden',
      background: '#fff',
      border: '1px solid rgba(26,58,42,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      minHeight: 300,
    }}>
      {/* Image — 55% */}
      <div style={{
        position: 'relative',
        width: '55%',
        flexShrink: 0,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${C.forest}, ${C.navy})`,
      }}>
        {/* Gradient fallback */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.forest}, ${C.navy})`, zIndex: 0 }} />
        {!imgFailed && (
          <img
            src={service.photo}
            alt={service.name}
            loading="lazy"
            width={900}
            height={700}
            onError={(e) => { e.currentTarget.style.opacity = '0'; setImgFailed(true); }}
            className="salon-feat-img"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', zIndex: 1,
              transition: 'transform 0.5s ease',
            }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 55%, rgba(15,28,20,0.45))', zIndex: 2 }} />
        {/* Duration badge */}
        <div style={{
          position: 'absolute', bottom: 14, left: 14, zIndex: 3,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 11px', borderRadius: 999,
          background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(6px)',
          color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: FONT_BODY,
        }}>
          <ClockIcon /> {service.duration}
        </div>
        {/* Price badge */}
        <div style={{
          position: 'absolute', top: 14, right: 14, zIndex: 3,
          padding: '5px 13px', borderRadius: 999,
          background: C.gold, color: C.forest,
          fontSize: 13, fontWeight: 700, fontFamily: FONT_BODY,
        }}>
          {priceLabel}
        </div>
      </div>

      {/* Content — 45% */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 36px', gap: 14 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.18em', color: C.muted, fontFamily: FONT_BODY,
        }}>
          Featured Treatment
        </span>
        <h3 style={{
          fontFamily: FONT_DISPLAY, fontStyle: 'italic',
          fontSize: 'clamp(22px, 2.8vw, 32px)',
          color: C.navy, lineHeight: 1.2, margin: 0,
        }}>
          {service.name}
        </h3>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.muted, lineHeight: 1.68, margin: 0 }}>
          {service.description}
        </p>
        <div style={{ marginTop: 4 }}>
          <Link
            to="/register"
            className="salon-outline-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 999,
              border: `1.5px solid ${C.forest}`,
              color: C.forest, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.25s ease, color 0.25s ease',
            }}
          >
            Book Appointment <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   SERVICE CARD — Standard (vertical)
───────────────────────────────────────────────────────────────────────── */
const StandardCard = ({ service }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const priceLabel = service.priceLabel || (service.price ? `\u20b1${service.price.toLocaleString()}` : 'Inquire');

  return (
    <div className="salon-std-card" style={{
      borderRadius: 20,
      overflow: 'hidden',
      background: '#fff',
      border: '1px solid rgba(26,58,42,0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Image area */}
      <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden', background: `linear-gradient(135deg, ${C.forest}, ${C.navy})` }}>
        {/* Gradient fallback */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.forest}, ${C.navy})`, zIndex: 0 }} />
        {!imgFailed && (
          <img
            src={service.photo}
            alt={service.name}
            loading="lazy"
            width={900}
            height={700}
            onError={(e) => { e.currentTarget.style.opacity = '0'; setImgFailed(true); }}
            className="salon-std-img"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', zIndex: 1,
              transition: 'transform 0.5s ease',
            }}
          />
        )}
        {/* Dark gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,28,20,0.55) 0%, rgba(15,28,20,0.1) 50%, transparent 100%)', zIndex: 2 }} />
        {/* Duration badge */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 3,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: FONT_BODY,
        }}>
          <ClockIcon /> {service.duration}
        </div>
        {/* Price badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 3,
          padding: '4px 11px', borderRadius: 999,
          background: C.gold, color: C.forest,
          fontSize: 12, fontWeight: 700, fontFamily: FONT_BODY,
        }}>
          {priceLabel}
        </div>
        {/* Hover book panel — slides up from bottom */}
        <div className="salon-book-panel" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
          padding: '14px 16px',
          background: 'rgba(26,58,42,0.95)',
          backdropFilter: 'blur(8px)',
          transform: 'translateY(101%)',
          transition: 'transform 0.3s ease',
        }}>
          <Link
            to="/register"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '9px 0', borderRadius: 10,
              border: '1px solid rgba(201,169,110,0.7)',
              color: C.cream, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
              textDecoration: 'none', width: '100%',
            }}
          >
            Book Appointment <ArrowRightIcon />
          </Link>
        </div>
      </div>

      {/* Text */}
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
        <h4 style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15, color: C.navy, margin: 0, lineHeight: 1.3 }}>
          {service.name}
        </h4>
        <p style={{
          fontFamily: FONT_BODY, fontSize: 13, color: C.muted,
          lineHeight: 1.65, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {service.description}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   SERVICE GRID — asymmetric
───────────────────────────────────────────────────────────────────────── */
const ServiceGrid = ({ category }) => {
  const [featured, ...rest] = category.services;
  return (
    <div
      key={category.services[0].id}
      className="salon-grid animate-salon-fade"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
    >
      <FeaturedCard service={featured} />
      {rest.map(svc => (
        <StandardCard key={svc.id} service={svc} />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   TAB BAR — animated gold underline indicator
───────────────────────────────────────────────────────────────────────── */
const TabBar = ({ categories, activeId, onChange }) => {
  const barRef = useRef(null);
  const btnRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const btn = btnRefs.current[activeId];
    const bar = barRef.current;
    if (!btn || !bar) return;
    const barR = bar.getBoundingClientRect();
    const btnR = btn.getBoundingClientRect();
    setIndicator({ left: btnR.left - barR.left, width: btnR.width });
  }, [activeId]);

  const activeCat = categories.find(c => c.id === activeId);
  const minPrice = activeCat
    ? Math.min(...activeCat.services.filter(s => s.price).map(s => s.price))
    : null;

  return (
    <div>
      {/* Tab row */}
      <div ref={barRef} style={{
        position: 'relative', display: 'flex', gap: 0,
        borderBottom: '1px solid rgba(15,28,20,0.1)',
      }}>
        {categories.map(cat => {
          const active = cat.id === activeId;
          return (
            <button
              key={cat.id}
              ref={el => { btnRefs.current[cat.id] = el; }}
              onClick={() => onChange(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
                color: active ? C.navy : C.muted,
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 22, height: 20, padding: '0 6px', borderRadius: 999,
                background: active ? C.navy : 'rgba(107,124,114,0.12)',
                color: active ? '#fff' : C.muted,
                fontSize: 11, fontWeight: 700,
                transition: 'background 0.2s, color 0.2s',
              }}>
                {cat.services.length}
              </span>
            </button>
          );
        })}

        {/* Gold sliding underline */}
        <div style={{
          position: 'absolute', bottom: -1,
          left: indicator.left, width: indicator.width,
          height: 2, background: C.gold, borderRadius: 999,
          transition: 'left 0.35s cubic-bezier(0.22,1,0.36,1), width 0.35s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>

      {/* Inline summary */}
      <div style={{ marginTop: 10, fontFamily: FONT_BODY, fontSize: 12, color: C.muted }}>
        {minPrice && (
          <span>from <strong style={{ color: C.navy, fontWeight: 700 }}>\u20b1{minPrice.toLocaleString()}</strong></span>
        )}
        {' \u00b7 '}
        <span>{activeCat?.services.length} services available</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────────────── */
const SectionHeader = () => (
  <div style={{ textAlign: 'center', marginBottom: 48 }}>
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '5px 18px', borderRadius: 999,
      border: '1px solid rgba(201,169,110,0.5)',
      background: 'rgba(201,169,110,0.08)',
      color: C.gold,
      fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      marginBottom: 18,
    }}>
      Specialist Treatments
    </span>
    <h2 style={{
      fontFamily: FONT_DISPLAY, fontStyle: 'italic',
      fontSize: 'clamp(42px, 7vw, 60px)',
      color: C.navy, lineHeight: 1.1, margin: '0 0 16px',
    }}>
      Our Salon Menu
    </h2>
    <p style={{
      fontFamily: FONT_BODY, fontSize: 16, color: C.muted,
      maxWidth: 480, margin: '0 auto', lineHeight: 1.65,
    }}>
      Curated in-salon treatments for complete mind and body care — inside our premium suites.
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────── */
export default function SalonMenu() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const activeCategory = CATEGORIES.find(c => c.id === activeTab);

  return (
    <>
      {/* Scoped hover / animation styles */}
      <style>{`
        /* Card lift + shadow on hover */
        .salon-std-card:hover,
        .sm-salon-featured:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 50px rgba(15,28,20,0.16) !important;
        }
        /* Image scale on card hover */
        .salon-std-card:hover .salon-std-img,
        .sm-salon-featured:hover .salon-feat-img {
          transform: scale(1.05) !important;
        }
        /* Book panel slide-up on standard card hover */
        .salon-std-card:hover .salon-book-panel {
          transform: translateY(0) !important;
        }
        /* Outline button hover */
        .salon-outline-btn:hover {
          background: ${C.forest} !important;
          color: ${C.cream} !important;
        }
        /* Fade-in animation for grid on tab switch */
        @keyframes salonFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-salon-fade {
          animation: salonFadeIn 0.4s ease forwards;
        }
        /* RESPONSIVE */
        @media (max-width: 639px) {
          .salon-grid {
            grid-template-columns: 1fr !important;
          }
          .sm-salon-featured {
            grid-column: span 1 !important;
            flex-direction: column !important;
            min-height: auto !important;
          }
          .sm-salon-featured > div:first-child {
            width: 100% !important;
            height: 240px;
            position: relative;
            padding-bottom: 0 !important;
            flex-shrink: 0;
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .salon-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .sm-salon-featured {
            grid-column: span 2 !important;
          }
        }
      `}</style>

      <section
        id="services"
        style={{
          padding: '80px 16px 100px',
          background: C.cream,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dot-grid texture */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(26,58,42,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionHeader />
          <TabBar
            categories={CATEGORIES}
            activeId={activeTab}
            onChange={setActiveTab}
          />
          <div style={{ marginTop: 32 }}>
            <ServiceGrid category={activeCategory} />
          </div>
        </div>
      </section>
    </>
  );
}
