import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShoppingBag, Check, Clock, Sparkles, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

/* ─────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS & TYPOGRAPHY
   Primary: Forest #1A3A2A · Cream: #FAF7F2 · Gold: #C9A96E · Navy: #0F1C14 · Muted: #6B7C72
───────────────────────────────────────────────────────────────────────── */
const C = {
  forest: '#1A3A2A',
  forestDark: '#0e261b',
  cream: '#FAF7F2',
  creamSoft: '#F4EFE6',
  gold: '#C9A96E',
  goldBright: '#d4b87a',
  navy: '#0F1C14',
  muted: '#5A6E63',
  border: 'rgba(26,58,42,0.12)',
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'DM Sans', 'Inter', system-ui, sans-serif";

/* ─────────────────────────────────────────────────────────────────────────
   SERVICE DATA (Filipino Luxury Spa Services)
───────────────────────────────────────────────────────────────────────── */
const UNS = (id, w = 900, h = 700) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const CATEGORIES = [
  {
    id: 'massage',
    label: 'Massage Therapy',
    services: [
      {
        id: 'swedish',
        name: 'Swedish Massage',
        description: 'Classic full-body relaxation with long, gliding strokes that melt away muscle tension and restore circulation.',
        price: 749,
        duration: '1 hr',
        photo: UNS('1544161515-4be31d52b622'),
        featured: true,
      },
      {
        id: 'deep-tissue',
        name: 'Deep Tissue Massage',
        description: 'Firm, targeted pressure reaching deep muscle layers to release chronic knots and stiffness.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1507652313519-f8cfdeeafa93'),
      },
      {
        id: 'hilot',
        name: 'Hilot Massage',
        description: 'Traditional Filipino healing massage using warm virgin coconut oil and banana leaves to balance energy flow.',
        price: 749,
        duration: '1 hr',
        photo: UNS('1559599101-f09722fb4948'),
      },
      {
        id: 'traditional',
        name: 'Traditional Massage',
        description: 'Standard restoration utilizing moderate, balanced pressure across major tension points.',
        price: 749,
        duration: '1 hr',
        photo: UNS('1515377905703-c4788e51af15'),
      },
      {
        id: 'thai',
        name: 'Thai Massage',
        description: 'Dynamic assisted yoga stretching combined with rhythmic acupressure for flexibility.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1506126613408-eca07ce68773'),
      },
      {
        id: 'post-natal',
        name: 'Post Natal Massage',
        description: 'Restorative gentle therapy crafted specifically to support mothers in their healing and recovery.',
        price: 899,
        duration: '1 hr',
        photo: UNS('1519014816548-bf5fe059798b'),
      },
      {
        id: 'hot-stone',
        name: 'Hot Stone Massage',
        description: 'Smooth volcanic basalt stones gently heated to melt deep-seated tension and soothe the nervous system.',
        price: 949,
        duration: '1 hr',
        photo: UNS('1540555700478-4be290a8d6a0'),
      },
      {
        id: 'aromatherapy',
        name: 'Aromatherapy Massage',
        description: 'Custom botanical essential oil blends combined with soothing strokes for deep stress relief.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1544161515-4be31d52b622'),
      },
      {
        id: 'shiatsu',
        name: 'Shiatsu Massage',
        description: 'Japanese pressure point therapy stimulating meridian pathways to restore vital bodily harmony.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1507652313519-f8cfdeeafa93'),
      },
      {
        id: 'reflexology',
        name: 'Reflexology',
        description: 'Focused foot pressure zone stimulation mapping directly to internal organ rejuvenation.',
        price: 649,
        duration: '45 min',
        photo: UNS('1540555700478-4be290a8d6a0'),
      },
      {
        id: 'head-shoulder',
        name: 'Head & Shoulder Massage',
        description: 'Targeted relief concentrated on neck, crown, and shoulder tension — the perfect power reset.',
        price: 549,
        duration: '30 min',
        photo: UNS('1515377905703-c4788e51af15'),
      },
      {
        id: 'couples',
        name: 'Couples Massage',
        description: 'Synchronized luxury massage side-by-side in our private couples suite for special moments.',
        price: 1499,
        duration: '1 hr',
        photo: UNS('1519014816548-bf5fe059798b'),
      },
      {
        id: 'four-hands',
        name: 'Four Hands Massage',
        description: 'Two certified therapists working in choreographed synchrony for an indulgent full-body journey.',
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
        description: 'Precision nail shaping, gentle cuticle refining, exfoliating hand scrub, and glossy premium polish.',
        price: 399,
        duration: '45 min',
        photo: UNS('1604654894610-df63bc536371'),
        featured: true,
      },
      {
        id: 'classic-pedi',
        name: 'Classic Pedicure',
        description: 'Warm herbal foot bath, mineral salt scrub, nail shaping, and long-wearing polish finish.',
        price: 449,
        duration: '1 hr',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
      {
        id: 'gel-mani',
        name: 'Gel Manicure',
        description: 'High-gloss UV-cured gel polish providing up to three weeks of chip-free shine.',
        price: 549,
        duration: '1 hr',
        photo: UNS('1604654894610-df63bc536371'),
      },
      {
        id: 'gel-pedi',
        name: 'Gel Pedicure',
        description: 'Durable gel pedicure designed to withstand active wear with a mirror-like finish.',
        price: 599,
        duration: '1 hr',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
      {
        id: 'spa-mani',
        name: 'Spa Manicure',
        description: 'Elevated hand treatment with warm paraffin wax infusion, collagen serum, and polish.',
        price: 649,
        duration: '1.5 hr',
        photo: UNS('1604654894610-df63bc536371'),
      },
      {
        id: 'spa-pedi',
        name: 'Spa Pedicure',
        description: 'Deeply rejuvenating pedicure with callus softening, botanical clay mask, and massage.',
        price: 699,
        duration: '1.5 hr',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
      {
        id: 'nail-art',
        name: 'Nail Art Design',
        description: 'Bespoke hand-painted accents, French chrome, gems, and minimalist aesthetic details.',
        price: 50,
        duration: 'Varies',
        photo: UNS('1604654894610-df63bc536371'),
        priceLabel: '₱50/nail',
      },
      {
        id: 'acrylic',
        name: 'Acrylic Full Set',
        description: 'Durable full set extension sculpted with premium monomers for a natural, elegant arch.',
        price: 999,
        duration: '2 hr',
        photo: UNS('1604002396506-ab0238c11eeb'),
      },
      {
        id: 'french-tips',
        name: 'French Tips Finish',
        description: 'Timeless crisp French lines applied with precision on classic or gel manicures.',
        price: 499,
        duration: '1 hr',
        photo: UNS('1604654894610-df63bc536371'),
      },
      {
        id: 'paraffin',
        name: 'Paraffin Wax Infusion',
        description: 'Warm peach-infused paraffin wax bath deeply conditioning dry hands or tired feet.',
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
        name: 'Back Clarifying Facial',
        description: 'Complete deep pore-cleansing and purifying mask therapy designed specifically for the back.',
        price: 849,
        duration: '1 hr',
        photo: UNS('1570172619644-dfd03ed5d881'),
        featured: true,
      },
      {
        id: 'body-scrub',
        name: 'Full Body Scrub',
        description: 'Invigorating organic apricot and sea salt scrub leaving your skin luminous and baby-smooth.',
        price: 749,
        duration: '1 hr',
        photo: UNS('1545205597-3d9d02c29597'),
      },
      {
        id: 'body-wrap',
        name: 'Detoxifying Body Wrap',
        description: 'Nourishing herbal botanical cocoon wrap that draws out toxins and restores skin elasticity.',
        price: 999,
        duration: '1.5 hr',
        photo: UNS('1570172619644-dfd03ed5d881'),
      },
      {
        id: 'eyebrow-threading',
        name: 'Eyebrow Threading',
        description: 'Meticulous cotton thread sculpting to groom and shape clean, symmetrical brow lines.',
        price: 199,
        duration: '15 min',
        photo: UNS('1545205597-3d9d02c29597'),
      },
      {
        id: 'lash-tinting',
        name: 'Eyelash Tinting',
        description: 'Semi-permanent vegetable dye treatment making natural lashes look darker and fuller.',
        price: 299,
        duration: '30 min',
        photo: UNS('1570172619644-dfd03ed5d881'),
      },
      {
        id: 'leg-wax',
        name: 'Full Leg Waxing',
        description: 'Clean hair removal with soothing chamomile hard wax, finishing with tea tree oil.',
        price: 799,
        duration: '1 hr',
        photo: UNS('1545205597-3d9d02c29597'),
      },
      {
        id: 'steam-sauna',
        name: 'Steam & Sauna Suite',
        description: 'Private eucalyptus aromatherapy steam session to open pores and loosen tense muscles.',
        price: 499,
        duration: '45 min',
        photo: UNS('1570172619644-dfd03ed5d881'),
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   FEATURED CARD (Col-span-2 on Desktop, Horizontal layout, Add to Cart)
───────────────────────────────────────────────────────────────────────── */
const FeaturedCard = ({ service }) => {
  const { addToCart, items } = useCart();
  const [imgFailed, setImgFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = items.find((i) => i.id === service.id);
  const cartQty = inCart ? inCart.quantity : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(service);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const priceLabel = service.priceLabel || (service.price ? `₱${service.price.toLocaleString()}` : 'Inquire');

  return (
    <div
      className="salon-featured-card group col-span-1 sm:col-span-2 flex flex-col md:flex-row rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-[rgba(26,58,42,0.12)] hover:border-[rgba(191,161,95,0.45)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(15,28,20,0.14)] hover:-translate-y-1"
    >
      {/* Left Image Area (52% on desktop) */}
      <div className="relative w-full md:w-[52%] h-56 sm:h-64 md:h-auto min-h-[220px] md:min-h-[300px] overflow-hidden bg-gradient-to-br from-[#1A3A2A] to-[#0F1C14] flex-shrink-0">
        {/* Gradient fallback */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A3A2A] to-[#0F1C14] z-0" />
        
        {!imgFailed && (
          <img
            src={service.photo}
            alt={service.name}
            loading="lazy"
            width={900}
            height={700}
            onError={(e) => {
              e.currentTarget.style.opacity = '0';
              setImgFailed(true);
            }}
            className="absolute inset-0 w-full h-full object-cover z-1 group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-black/20 z-2" />

        {/* Duration badge */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-[#d4b87a]" />
          <span>{service.duration}</span>
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#bfa15f] to-[#e8cc8a] text-[#041e16] text-xs sm:text-sm font-extrabold shadow-lg">
          {priceLabel}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-5 sm:p-7 md:p-8 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#bfa15f]">
              Featured Specialist Treatment
            </span>
            <Sparkles className="w-3 h-3 text-[#bfa15f]" />
          </div>

          <h3
            className="text-2xl sm:text-3xl font-black text-[#0F1C14] leading-tight mb-2.5"
            style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic' }}
          >
            {service.name}
          </h3>

          <p
            className="text-xs sm:text-sm text-[#5A6E63] leading-relaxed line-clamp-3"
            style={{ fontFamily: FONT_BODY }}
          >
            {service.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Price</span>
            <span className="text-lg sm:text-xl font-black text-[#1A3A2A]">{priceLabel}</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${service.name} to cart`}
            className={`inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer shadow-md active:scale-95 touch-manipulation ${
              justAdded
                ? 'bg-[#0a4d3c] text-white'
                : 'bg-gradient-to-r from-[#1A3A2A] to-[#0e261b] text-white hover:brightness-110'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-[#34d399]" />
                <span>Added {cartQty > 0 ? `(${cartQty})` : '✓'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-[#d4b87a]" />
                <span>{cartQty > 0 ? `Add Another (${cartQty})` : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   STANDARD CARD (Vertical layout, Add to Cart with feedback)
───────────────────────────────────────────────────────────────────────── */
const StandardCard = ({ service }) => {
  const { addToCart, items } = useCart();
  const [imgFailed, setImgFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = items.find((i) => i.id === service.id);
  const cartQty = inCart ? inCart.quantity : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(service);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const priceLabel = service.priceLabel || (service.price ? `₱${service.price.toLocaleString()}` : 'Inquire');

  return (
    <div
      className="salon-std-card group col-span-1 flex flex-col rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-[rgba(26,58,42,0.1)] hover:border-[rgba(191,161,95,0.45)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(15,28,20,0.14)] hover:-translate-y-1"
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#1A3A2A] to-[#0F1C14] flex-shrink-0">
        {/* Gradient fallback */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A3A2A] to-[#0F1C14] z-0" />
        
        {!imgFailed && (
          <img
            src={service.photo}
            alt={service.name}
            loading="lazy"
            width={900}
            height={700}
            onError={(e) => {
              e.currentTarget.style.opacity = '0';
              setImgFailed(true);
            }}
            className="absolute inset-0 w-full h-full object-cover z-1 group-hover:scale-105 transition-transform duration-500"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-2" />

        {/* Duration badge */}
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold">
          <Clock className="w-3 h-3 text-[#d4b87a]" />
          <span>{service.duration}</span>
        </div>

        {/* Price badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#bfa15f] to-[#e8cc8a] text-[#041e16] text-xs font-extrabold shadow-md">
          {priceLabel}
        </div>

        {/* Desktop Slide-up Add to Cart overlay */}
        <div className="hidden sm:flex absolute bottom-0 inset-x-0 z-4 p-3 bg-[#0a2318]/95 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 items-center justify-between gap-2">
          <span className="text-xs font-bold text-white pl-1">{priceLabel}</span>
          <button
            type="button"
            onClick={handleAdd}
            className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-[#bfa15f] to-[#d4b87a] text-[#041e16] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{justAdded ? 'Added ✓' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div>
          <h4
            className="text-base sm:text-lg font-bold text-[#0F1C14] group-hover:text-[#1A3A2A] transition-colors leading-snug line-clamp-1 mb-1.5"
            style={{ fontFamily: FONT_BODY }}
          >
            {service.name}
          </h4>

          <p
            className="text-xs text-[#5A6E63] leading-relaxed line-clamp-2"
            style={{ fontFamily: FONT_BODY }}
          >
            {service.description}
          </p>
        </div>

        {/* Mobile & Bottom Add to Cart Bar */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col leading-none">
            <span className="text-[9px] uppercase font-bold text-slate-400">Price</span>
            <span className="text-sm sm:text-base font-black text-[#1A3A2A] mt-0.5">{priceLabel}</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${service.name} to cart`}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95 touch-manipulation ${
              justAdded
                ? 'bg-[#0a4d3c] text-white'
                : 'bg-emerald-50 text-[#1A3A2A] border border-[#1A3A2A]/20 hover:bg-[#1A3A2A] hover:text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#34d399]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{cartQty > 0 ? `Add (${cartQty})` : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   SERVICE GRID (Responsive Asymmetric CSS Grid)
───────────────────────────────────────────────────────────────────────── */
const ServiceGrid = ({ category }) => {
  const [featured, ...rest] = category.services;
  return (
    <div
      key={category.services[0].id}
      className="animate-fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
    >
      {/* Featured Card */}
      {featured && <FeaturedCard service={featured} />}

      {/* Remaining Cards */}
      {rest.map((service) => (
        <StandardCard key={service.id} service={service} />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   TAB BAR (Animated Gold Sliding Indicator)
───────────────────────────────────────────────────────────────────────── */
const TabBar = ({ categories, activeId, onChange }) => {
  const barRef = useRef(null);
  const btnRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const activeBtn = btnRefs.current[activeId];
    const bar = barRef.current;
    if (!activeBtn || !bar) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - barRect.left,
      width: btnRect.width,
    });
  }, [activeId]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const activeCat = categories.find((c) => c.id === activeId);
  const minPrice = activeCat
    ? Math.min(...activeCat.services.filter((s) => s.price).map((s) => s.price))
    : null;

  return (
    <div className="mb-8">
      {/* Tab bar container */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div
          ref={barRef}
          className="relative inline-flex min-w-full sm:min-w-0 sm:flex border-b border-[rgba(15,28,20,0.12)] gap-1 sm:gap-4"
        >
          {categories.map((cat) => {
            const active = cat.id === activeId;
            return (
              <button
                key={cat.id}
                ref={(el) => {
                  btnRefs.current[cat.id] = el;
                }}
                onClick={() => onChange(cat.id)}
                type="button"
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap touch-manipulation ${
                  active ? 'text-[#0F1C14]' : 'text-[#5A6E63] hover:text-[#0F1C14]'
                }`}
                style={{ fontFamily: FONT_BODY }}
              >
                <span>{cat.label}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-extrabold transition-colors ${
                    active
                      ? 'bg-[#0F1C14] text-white'
                      : 'bg-black/5 text-[#5A6E63]'
                  }`}
                >
                  {cat.services.length}
                </span>
              </button>
            );
          })}

          {/* Animated Gold Sliding Underline */}
          <div
            className="absolute bottom-[-1px] h-[2.5px] bg-gradient-to-r from-[#bfa15f] to-[#d4b87a] rounded-full pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              left: indicator.left,
              width: indicator.width,
            }}
          />
        </div>
      </div>

      {/* Pricing & Service Count Summary */}
      <div className="mt-3 flex items-center justify-between text-xs text-[#5A6E63] px-1">
        <div>
          {minPrice && (
            <span>
              Prices start from <strong className="text-[#0F1C14] font-bold">₱{minPrice.toLocaleString()}</strong>
            </span>
          )}
          <span className="mx-1.5 opacity-50">·</span>
          <span>{activeCat?.services.length} luxury treatments available</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
          <Sparkles className="w-3 h-3 text-[#bfa15f]" />
          <span>Walk-in or Add to Cart to Book</span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────────────── */
const SectionHeader = () => (
  <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
    {/* Small-caps Gold Pill Badge */}
    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[rgba(201,169,110,0.5)] bg-[rgba(201,169,110,0.1)] text-[#bfa15f] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] mb-4 shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-[#bfa15f]" />
      <span>Specialist Treatments</span>
    </div>

    {/* Main Headline */}
    <h2
      className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0F1C14] leading-[1.08] mb-4"
      style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic' }}
    >
      Our Salon Menu
    </h2>

    {/* Subtitle */}
    <p
      className="text-xs sm:text-base text-[#5A6E63] leading-relaxed max-w-lg mx-auto"
      style={{ fontFamily: FONT_BODY }}
    >
      Curated in-salon treatments for complete mind and body care — inside our private luxury suites.
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   MAIN EXPORT COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function SalonMenu() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const activeCategory = CATEGORIES.find((c) => c.id === activeTab) || CATEGORIES[0];

  return (
    <section
      id="services"
      className="py-16 sm:py-24 md:py-28 px-4 sm:px-6 lg:px-10 relative overflow-hidden"
      style={{
        backgroundColor: C.cream,
      }}
    >
      {/* Subtle Dot-grid Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0F1C14 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader />

        <TabBar
          categories={CATEGORIES}
          activeId={activeTab}
          onChange={setActiveTab}
        />

        <ServiceGrid category={activeCategory} />
      </div>
    </section>
  );
}
