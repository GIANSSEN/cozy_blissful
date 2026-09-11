import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaymentModal from '../../components/payment/PaymentModal';
import API from '../../api/axios';
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  LogOut, Plus, ChevronRight, ChevronLeft,
  Sparkles, Award, Gift, Send, UserCheck, Star, X,
  Zap, MessageSquare, Scissors, XCircle, RefreshCw,
  CalendarX, CalendarCheck, Ban, Info, ShieldCheck,
  CheckCircle2, Compass, Heart, PhoneCall, MapPin,
  Banknote, Wallet, CreditCard, Receipt, User, Mail, Check,
  ArrowLeft, Search, CheckCheck, Smile, HelpCircle, ExternalLink
} from 'lucide-react';

// ─── LUXURY DESIGN SYSTEM TOKENS ─────────────────────────────────────────────
const B = {
  canvas: '#faf8f5',
  cardBg: '#ffffff',
  deep: '#062c22',
  green: '#0a3d30',
  mid: '#0f5040',
  gold: '#bfa15f',
  goldLight: '#e8cc8a',
  goldDark: '#8c7033',
  ink: '#0f172a',
  inkSoft: '#64748b',
  line: '#e2e8f0',
  goldBorder: 'rgba(191,161,95,0.22)',
  glowEmerald: 'rgba(10,61,48,0.3)',
};

// Luxury Card Container
const LuxuryCard = ({ children, className = '', style = {}, ...props }) => (
  <div
    className={`rounded-3xl bg-white border border-[rgba(191,161,95,0.22)] shadow-[0_8px_30px_rgba(6,44,34,0.05)] transition-all duration-200 ${className}`}
    style={{ ...style }}
    {...props}
  >
    {children}
  </div>
);

// Luxury Primary Action Button
const LuxuryBtn = ({ children, onClick, disabled, className = '', type = 'button', variant = 'gold' }) => {
  const isGold = variant === 'gold';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 py-3 px-6 font-extrabold rounded-2xl text-xs sm:text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer shadow-md ${className}`}
      style={
        isGold
          ? {
              background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)',
              color: '#041e16',
              boxShadow: '0 4px 16px rgba(191,161,95,0.35)',
            }
          : {
              background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(6,44,34,0.3)',
            }
      }
    >
      {children}
    </button>
  );
};

const STEP_LABELS = ['Choose Treatment', 'Date & Time', 'Client Details & Billing', 'Confirmation'];

// Status styling
const statusStyle = (status) => {
  switch (status) {
    case 'In Progress':
      return { bg: 'rgba(2,132,199,0.08)', color: '#0284c7', border: 'rgba(2,132,199,0.25)', icon: <Sparkles className="w-3.5 h-3.5 animate-pulse" /> };
    case 'Confirmed':
      return { bg: 'rgba(6,44,34,0.06)', color: '#062c22', border: 'rgba(6,44,34,0.2)', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> };
    case 'Completed':
      return { bg: 'rgba(16,185,129,0.08)', color: '#047857', border: 'rgba(16,185,129,0.25)', icon: <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> };
    case 'Cancelled':
      return { bg: 'rgba(239,68,68,0.06)', color: '#b91c1c', border: 'rgba(239,68,68,0.2)', icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" /> };
    default:
      return { bg: 'rgba(191,161,95,0.12)', color: '#8c7033', border: 'rgba(191,161,95,0.28)', icon: <Clock className="w-3.5 h-3.5 text-amber-600" /> };
  }
};

// ─── STEP INDICATOR ─────────────────────────────────────────────────────────
const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center gap-1.5 mb-6">
    {STEP_LABELS.map((label, i) => {
      const isActive = i === step;
      const isDone = i < step;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
              style={{
                background: isDone
                  ? 'linear-gradient(135deg,#bfa15f,#e8cc8a)'
                  : isActive
                  ? 'linear-gradient(135deg,#062c22,#0a3d30)'
                  : 'rgba(0,0,0,0.05)',
                color: isDone ? '#041e16' : isActive ? '#fff' : '#94a3b8',
                boxShadow: isActive ? '0 4px 12px rgba(6,44,34,0.25)' : 'none',
              }}
            >
              {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
            </div>
            <span className="text-[9px] font-bold hidden sm:block tracking-tight" style={{ color: isActive ? '#062c22' : '#94a3b8' }}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className="w-8 sm:w-14 h-0.5 mb-4 rounded-full transition-all duration-300"
              style={{ background: i < step ? 'linear-gradient(90deg,#bfa15f,#e8cc8a)' : 'rgba(0,0,0,0.08)' }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── STEP 1: SERVICE SELECTOR ────────────────────────────────────────────────
const ServiceCards = ({ services, selectedId, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const getCategoryIcon = (cat) => {
    const c = String(cat).toLowerCase();
    if (c.includes('massage')) return '💆';
    if (c.includes('nail')) return '💅';
    if (c.includes('wax') || c.includes('body')) return '🌿';
    if (c.includes('facial')) return '✨';
    return '✦';
  };

  const filtered = services.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch =
      !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(search.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Sparkles className="w-4 h-4 text-[#bfa15f]" /> Select Your Wellness Therapy
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Explore our signature salon treatments and holistic therapies</p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search therapies, nails..."
            className="w-full pl-8 pr-7 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:border-[#bfa15f] focus:ring-2 focus:ring-[#bfa15f]/20 focus:outline-none transition shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#062c22] text-[#e8cc8a] shadow-sm ring-1 ring-[#bfa15f]/40'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>{getCategoryIcon(cat)}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {filtered.map((s) => {
          const isSelected = s.id === selectedId;
          const price = Number(s.price ?? 0);
          const formattedPrice = `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              className={`text-left rounded-2xl p-4 transition-all duration-200 hover:scale-[1.015] active:scale-[0.99] cursor-pointer flex flex-col justify-between border relative ${
                isSelected
                  ? 'border-[#bfa15f] text-white shadow-lg ring-2 ring-[#bfa15f]/40'
                  : 'border-slate-200/80 hover:border-[#bfa15f]/50 bg-white hover:bg-slate-50/50 shadow-xs'
              }`}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #062c22 0%, #0a3d30 100%)'
                  : '#ffffff',
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm leading-snug ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {s.name}
                    </p>
                    {s.category && (
                      <span
                        className={`inline-block text-[9px] mt-1 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/15 text-[#e8cc8a]' : 'bg-amber-50 text-amber-900 border border-amber-200/50'
                        }`}
                      >
                        {s.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-sm ${isSelected ? 'text-[#e8cc8a]' : 'text-emerald-900'}`}>
                      {formattedPrice}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5 ${
                        isSelected ? 'text-emerald-200/80' : 'text-slate-400'
                      }`}
                    >
                      <Clock className="w-3 h-3" /> {s.duration} mins
                    </span>
                  </div>
                </div>

                {s.description && (
                  <p
                    className={`text-[11px] mt-2 leading-relaxed line-clamp-2 ${
                      isSelected ? 'text-emerald-100/80' : 'text-slate-500'
                    }`}
                  >
                    {s.description}
                  </p>
                )}
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] font-bold ${
                  isSelected ? 'border-white/10 text-[#e8cc8a]' : 'border-slate-100 text-slate-400'
                }`}
              >
                <span>{isSelected ? '✓ Selected Treatment' : 'Click to select'}</span>
                {isSelected && <CheckCircle className="w-4 h-4 text-[#e8cc8a]" />}
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No therapies found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── STEP 2: DATE & TIME PICKER ──────────────────────────────────────────────
const DateTimePicker = ({ selectedDate, onDateSelect, selectedTime, onTimeSelect, slots, loadingSlots }) => {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const dayKey = (d) => d.toISOString().split('T')[0];

  const categorizeSlot = (slot) => {
    const [h] = slot.split(':');
    const hr = parseInt(h, 10);
    if (hr < 12) return 'morning';
    if (hr < 17) return 'afternoon';
    return 'evening';
  };

  const morningSlots = (slots.all_slots || []).filter((s) => categorizeSlot(s) === 'morning');
  const afternoonSlots = (slots.all_slots || []).filter((s) => categorizeSlot(s) === 'afternoon');
  const eveningSlots = (slots.all_slots || []).filter((s) => categorizeSlot(s) === 'evening');

  const renderSlotGroup = (title, icon, groupSlots) => {
    if (!groupSlots || groupSlots.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          {icon} {title}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {groupSlots.map((slot) => {
            const isBooked = slots.booked_slots?.includes(slot);
            const isSelected = selectedTime === slot;
            const [h, m] = slot.split(':');
            const hour = parseInt(h, 10);
            const label = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
            return (
              <button
                key={slot}
                type="button"
                disabled={isBooked}
                onClick={() => !isBooked && onTimeSelect(slot)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                  isBooked
                    ? 'bg-slate-100 text-slate-300 line-through cursor-not-allowed border border-slate-200/50'
                    : isSelected
                    ? 'bg-[#062c22] text-[#e8cc8a] shadow-md ring-1 ring-[#bfa15f]/50'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-[#bfa15f] hover:bg-amber-50/20 shadow-xs'
                }`}
              >
                {label}
                {isBooked && <span className="text-[8px] opacity-40 ml-0.5">●</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-black text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Select Date &amp; Appointment Time
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Salon Hours: 9:00 AM – 9:00 PM Daily</p>
      </div>

      {/* Concierge Matching Notice */}
      <div
        className="p-3.5 rounded-2xl flex items-start gap-3 bg-emerald-50/60 border border-emerald-200/70"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[#e8cc8a] bg-[#062c22]"
        >
          <UserCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-black text-emerald-950">Concierge Specialist Matching</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            Our front desk assigns an experienced, certified specialist tailored to your chosen treatment window upon booking verification.
          </p>
        </div>
      </div>

      {/* Date chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Choose Date</p>
          <span className="text-[10px] font-bold text-emerald-800">Next 14 Days Available</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {days.map((d) => {
            const key = dayKey(d);
            const isSelected = selectedDate === key;
            const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.getDate();
            const month = d.toLocaleDateString('en-US', { month: 'short' });

            return (
              <button
                key={key}
                type="button"
                onClick={() => onDateSelect(key)}
                className={`flex-shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center gap-0.5 transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'border-[#bfa15f] text-white shadow-md shadow-emerald-950/20 ring-1 ring-[#bfa15f]'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #062c22 0%, #0a3d30 100%)'
                    : '#ffffff',
                }}
              >
                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {weekday}
                </span>
                <span className={`text-lg font-black leading-tight ${isSelected ? 'text-[#e8cc8a]' : 'text-slate-800'}`}>
                  {dayNum}
                </span>
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="space-y-4 pt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. Choose Available Time Slot</p>

          {loadingSlots ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
              Checking real-time slot availability…
            </div>
          ) : slots.all_slots.length === 0 ? (
            <div className="py-6 rounded-2xl text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200">
              No slots configured for this date. Please select another day.
            </div>
          ) : (
            <div className="space-y-4">
              {renderSlotGroup('Morning Calm (9:00 AM – 12:00 PM)', <Clock className="w-3.5 h-3.5 text-amber-500" />, morningSlots)}
              {renderSlotGroup('Afternoon Refresh (12:00 PM – 5:00 PM)', <Sparkles className="w-3.5 h-3.5 text-emerald-600" />, afternoonSlots)}
              {renderSlotGroup('Evening Glow (5:00 PM – 9:00 PM)', <Heart className="w-3.5 h-3.5 text-indigo-500" />, eveningSlots)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── STEP 3: CLIENT DETAILS & BILLING ──────────────────────────────────────────
const PAYMENT_OPTIONS = [
  {
    id: 'cash',
    name: 'Cash on Visit',
    tag: 'Recommended',
    description: 'Pay cash over the counter after your session is completed',
    icon: Banknote,
  },
  {
    id: 'gcash',
    name: 'GCash / Maya QR',
    tag: 'Instant e-Wallet',
    description: 'Instant scan upon arrival or directly online at checkout',
    icon: Wallet,
  },
  {
    id: 'card',
    name: 'Card at Terminal',
    tag: 'POS Terminal',
    description: 'Tap or swipe debit / credit card at the front desk',
    icon: CreditCard,
  },
];

const ReviewStep = ({
  service,
  date,
  time,
  notes,
  onNotesChange,
  clientName,
  onClientNameChange,
  clientEmail,
  clientPhone,
  onClientPhoneChange,
  clientAddress,
  onClientAddressChange,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  const [h, m] = (time || '12:00').split(':');
  const hour = parseInt(h, 10);
  const timeLabel = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  const dateLabel = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date not selected';
  const price = Number(service?.price ?? 0);
  const formattedPrice = `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Receipt className="w-5 h-5 text-emerald-800" />
            Billing Details &amp; Summary
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Review contact information, salon treatment details, and payment preference
          </p>
        </div>
        <span className="self-start sm:self-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1 shadow-xs">
          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Salon Checkout
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Client, Address, Payment & Notes (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Client Information */}
          <div className="rounded-2xl p-4 sm:p-5 space-y-3.5 bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-900/10 text-emerald-800 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Client Contact Info</h4>
                  <p className="text-[10px] text-slate-400">For SMS reminders &amp; appointment confirmation</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => onClientNameChange(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:border-[#bfa15f] focus:bg-white focus:outline-none transition shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-slate-500 pointer-events-none">
                    <span>🇵🇭</span>
                  </div>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => onClientPhoneChange(e.target.value)}
                    placeholder="0917 123 4567"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:border-[#bfa15f] focus:bg-white focus:outline-none transition shadow-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={clientEmail}
                  readOnly
                  disabled
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-slate-500 bg-slate-100 border border-slate-200/80 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Billing & Residence Address */}
          <div className="rounded-2xl p-4 sm:p-5 space-y-3 bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-900/10 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Address &amp; Location Details</h4>
                <p className="text-[10px] text-slate-400">Used for client profile verification &amp; salon records</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Complete Street / Barangay / City Address
              </label>
              <textarea
                value={clientAddress}
                onChange={(e) => onClientAddressChange(e.target.value)}
                placeholder="e.g. Unit 402, Greenwoods Exec. Homes, Brgy. San Antonio, Pasig City"
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-800 bg-slate-50 border border-slate-200 focus:border-[#bfa15f] focus:bg-white focus:outline-none transition leading-relaxed resize-none shadow-xs"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-2xl p-4 sm:p-5 space-y-3 bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-900/10 text-emerald-800 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Payment Method</h4>
                  <p className="text-[10px] text-slate-400">Choose how you prefer to settle your session</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Safe &amp; Flexible
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = paymentMethod === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onPaymentMethodChange(opt.id)}
                    className={`p-3 rounded-xl text-left transition-all relative border cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#bfa15f] bg-amber-50/25 shadow-xs ring-1 ring-[#bfa15f]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#062c22] text-[#e8cc8a]' : 'bg-slate-100 text-slate-600'}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${isSelected ? 'bg-[#062c22] text-[#e8cc8a]' : 'bg-slate-100 text-slate-500'}`}>
                          {opt.tag}
                        </span>
                      </div>
                      <p className={`text-xs font-black ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                        {opt.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {opt.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400">Selected</span>
                      <span className={`text-[9px] font-black flex items-center gap-1 ${isSelected ? 'text-emerald-700' : 'text-slate-300'}`}>
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Treatment Preferences */}
          <div className="rounded-2xl p-4 sm:p-5 space-y-2 bg-white border border-slate-200/80 shadow-xs">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#bfa15f]" />
              Treatment Preferences &amp; Special Requests (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="e.g. Desired pressure (light/medium/firm), focus on neck/shoulders, preferred scent (lavender/eucalyptus)..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl text-xs text-slate-700 bg-slate-50 border border-slate-200 outline-none resize-none leading-relaxed focus:border-[#bfa15f] focus:bg-white transition shadow-xs"
            />
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols, sticky) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-0">
          <div
            className="rounded-3xl p-5 space-y-4 text-white shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 100%)',
              border: '1px solid rgba(191,161,95,0.3)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#e8cc8a]">
                <Receipt className="w-3.5 h-3.5" /> Order Summary
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-white/15">
                {service.category || 'Treatment'}
              </span>
            </div>

            <div>
              <p className="text-white font-black text-lg leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                {service.name}
              </p>
              <p className="text-emerald-200/80 text-xs mt-0.5">{service.duration} minutes dedicated session</p>
            </div>

            {/* Schedule Info Box */}
            <div className="bg-black/25 rounded-2xl p-3 space-y-2 border border-white/10">
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#e8cc8a] flex-shrink-0" />
                <span className="text-white font-medium text-[11px]">{dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-[#e8cc8a] flex-shrink-0" />
                <span className="text-white font-semibold text-[11px]">{timeLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#e8cc8a] flex-shrink-0" />
                <span className="text-emerald-100 text-[11px]">
                  Specialist: <strong className="text-amber-200">Concierge Matching</strong>
                </span>
              </div>
            </div>

            {/* Itemized Price Breakdown */}
            <div className="space-y-2 pt-1 text-xs border-t border-white/10">
              <div className="flex items-center justify-between text-emerald-100/80">
                <span>Treatment Subtotal</span>
                <span className="font-semibold text-white">{formattedPrice}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-100/80">
                <span>Salon Reservation Fee</span>
                <span className="font-bold text-[#e8cc8a]">₱0.00 (Complimentary)</span>
              </div>
              <div className="flex items-center justify-between text-emerald-100/80">
                <span>Value Added Tax (VAT)</span>
                <span className="text-emerald-200 text-[10px]">Included</span>
              </div>

              <div className="pt-2.5 border-t border-white/15 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">Total Due</span>
                  <p className="text-[10px] text-emerald-300/70 font-medium">To settle upon visit or online</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#e8cc8a] tracking-tight">{formattedPrice}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-emerald-200/70 font-medium">Payment Mode:</span>
              <span className="bg-white/15 text-[#e8cc8a] font-bold px-2.5 py-0.5 rounded-full border border-white/20 text-[10px]">
                {PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.name || 'Cash on Visit'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl text-xs text-slate-600 bg-amber-50/50 border border-amber-200/60 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800 text-[11px]">Peace of Mind Guarantee</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Pay safely via QR / Card or at the salon reception. Free schedule changes up to 2 hours before your appointment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STEP 4: CONFIRMATION ────────────────────────────────────────────────────
const ConfirmationStep = ({ booking, onDone, onPayOnline }) => {
  const price = Number(booking?.service_price ?? 0);
  const formattedPrice = price > 0 ? `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : null;

  return (
    <div className="text-center space-y-5 py-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg"
        style={{ background: 'linear-gradient(135deg,#062c22,#0a3d30)' }}
      >
        <CheckCircle2 className="w-8 h-8 text-[#e8cc8a]" />
      </motion.div>
      <div>
        <h3 className="text-xl font-black text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Booking Request Confirmed!
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Your appointment has been registered in our system. You may settle online via GCash, Maya, or directly at the salon counter.
        </p>
      </div>

      <div
        className="rounded-2xl p-4 sm:p-5 text-left space-y-2.5 max-w-sm mx-auto shadow-xs bg-white border border-slate-200/80"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Reference</p>
          <p className="text-sm font-black text-emerald-900 font-mono">#{String(booking?.id || 1).padStart(5, '0')}</p>
        </div>

        <div>
          <p className="text-sm font-black text-slate-800">{booking?.service}</p>
          <p className="text-xs text-slate-500 mt-0.5">{booking?.datetime}</p>
        </div>

        {formattedPrice && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-semibold">Total Amount:</span>
            <span className="font-black text-emerald-900 text-sm">{formattedPrice}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-semibold">Payment Mode:</span>
          <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 capitalize">
            {booking?.payment_method === 'cash' ? 'Cash on Visit' : booking?.payment_method === 'gcash' ? 'GCash / Maya QR' : booking?.payment_method === 'card' ? 'Card at Counter' : (booking?.payment_method || 'Pay at Counter')}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800">
          <UserCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
          <span>Specialist assigned upon salon arrival</span>
        </div>
      </div>

      <p className="text-xs text-slate-400">📧 A confirmation email has been dispatched to your account.</p>

      {/* Action Buttons */}
      <div className="space-y-2.5 max-w-sm mx-auto w-full pt-1">
        <motion.button
          type="button"
          onClick={() => onPayOnline?.(booking)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-6 text-[#041e16] font-extrabold rounded-2xl text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)',
            boxShadow: '0 4px 16px rgba(191,161,95,0.35)',
          }}
        >
          <CreditCard className="w-4 h-4 text-[#041e16]" />
          <span>Pay Online (GCash, Maya, Card)</span>
          <ChevronRight className="w-4 h-4 text-[#041e16]/80" />
        </motion.button>

        <motion.button
          type="button"
          onClick={onDone}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-6 text-slate-700 font-bold rounded-2xl text-xs transition-all duration-200 cursor-pointer border border-slate-200 bg-white hover:bg-slate-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-800" /> Pay Later at Counter &amp; Return to Dashboard
        </motion.button>
      </div>
    </div>
  );
};

// ─── CANCEL MODAL ────────────────────────────────────────────────────────────
const CancelModal = ({ booking, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      await API.post(`/booking/${booking.id}/cancel`);
      onSuccess('Appointment cancelled successfully.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (dt) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };
  const fmtTime = (dt) => {
    const d = new Date(dt);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-[2rem] overflow-hidden shadow-2xl bg-white border border-slate-200"
      >
        <div className="px-6 py-5 flex-shrink-0 bg-gradient-to-r from-red-900 to-red-800 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/15">
              <CalendarX className="w-5 h-5 text-red-200" />
            </div>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-red-200 hover:text-white bg-white/10 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Cancel Appointment</h2>
          <p className="text-red-200/80 text-xs mt-0.5">This action will release your scheduled treatment slot</p>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto no-scrollbar">
          <div className="rounded-2xl p-4 space-y-2 bg-red-50/60 border border-red-200/60">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Session Details</p>
            <p className="font-black text-slate-800 text-sm">#{String(booking.id).padStart(5,'0')} — {booking.service}</p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-red-600" />
              <span>{fmtDate(booking.datetime)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>{fmtTime(booking.datetime)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-amber-800">Notice:</span> You can also reschedule for another date instead of cancelling your reservation.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-red-700 bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-slate-600 transition hover:bg-slate-200 cursor-pointer border border-slate-200 bg-white">
            Keep Booking
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-2xl text-xs font-black text-white bg-red-700 hover:bg-red-800 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {loading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
            Confirm Cancellation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── RESCHEDULE MODAL ────────────────────────────────────────────────────────
const RescheduleModal = ({ booking, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState({ available_slots: [], booked_slots: [], all_slots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedDate || !booking.service_id) return;
    setLoadingSlots(true);
    setSelectedTime('');
    API.get('/booking/available-slots', { params: { date: selectedDate, service_id: booking.service_id } })
      .then((r) => setSlots(r.data))
      .catch(() => setSlots({ available_slots: [], booked_slots: [], all_slots: [] }))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, booking.service_id]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) { setError('Please select a new date and time.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await API.post(`/booking/${booking.id}/reschedule`, {
        datetime: `${selectedDate}T${selectedTime}:00`,
      });
      onSuccess('Appointment rescheduled! Fresh reminder emails will be dispatched.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Rescheduling failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSlot = (slot) => {
    const [h, m] = slot.split(':');
    const hr = parseInt(h, 10);
    return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-[2rem] overflow-hidden shadow-2xl bg-white border border-slate-200"
      >
        <div className="px-6 py-5 flex-shrink-0 bg-gradient-to-r from-[#062c22] to-[#0a3d30] text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/15">
              <CalendarCheck className="w-5 h-5 text-[#e8cc8a]" />
            </div>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-200 hover:text-white bg-white/10 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Reschedule Appointment</h2>
          <p className="text-emerald-200/80 text-xs mt-0.5">#{String(booking.id).padStart(5,'0')} — {booking.service}</p>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto no-scrollbar">
          <div className="rounded-2xl p-3.5 space-y-1.5 bg-slate-50 border border-slate-200/80">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Schedule</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-800" />
              <span>{new Date(booking.datetime).toLocaleString('en-US', { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true })}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-800" /> Pick New Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-800 bg-white border border-slate-200 focus:border-[#bfa15f] focus:outline-none shadow-xs"
            />
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-800" /> Choose New Time
              </label>
              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
                  Loading available slots…
                </div>
              ) : slots.available_slots.length === 0 ? (
                <div className="py-4 rounded-2xl text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200">
                  No available slots on this date. Try a different day.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {slots.all_slots.map((slot) => {
                    const isAvailable = slots.available_slots.includes(slot);
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#062c22] text-[#e8cc8a] shadow-md ring-1 ring-[#bfa15f]'
                            : isAvailable
                            ? 'bg-white text-slate-700 border border-slate-200 hover:border-[#bfa15f] hover:bg-slate-50'
                            : 'bg-slate-100 text-slate-300 line-through cursor-not-allowed border border-slate-200/50'
                        }`}
                      >
                        {formatSlot(slot)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-red-700 bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-slate-600 transition hover:bg-slate-200 cursor-pointer border border-slate-200 bg-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReschedule}
            disabled={submitting || !selectedDate || !selectedTime}
            className="flex-1 py-2.5 rounded-2xl text-xs font-black text-white bg-[#062c22] hover:bg-[#0a3d30] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {submitting ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-[#e8cc8a]" />}
            Confirm Reschedule
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── BOOKING WIZARD MODAL ───────────────────────────────────────────────────
const BookingWizard = ({ data, onClose, onSuccess, onOpenPayment }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  // Billing & Client Details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [slots, setSlots] = useState({ all_slots: [], booked_slots: [], available_slots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.name) setClientName((prev) => prev || user.name);
      if (user.email) setClientEmail((prev) => prev || user.email);
      if (user.phone) setClientPhone((prev) => prev || user.phone);
    }
    if (data) {
      if (data.client_name) setClientName((prev) => prev || data.client_name);
      if (data.client_email) setClientEmail((prev) => prev || data.client_email);
      if (data.client_phone) setClientPhone((prev) => prev || data.client_phone);
    }
  }, [user, data]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      setLoadingSlots(true);
      setSelectedTime('');
      API.get('/booking/available-slots', {
        params: {
          date: selectedDate,
          service_id: selectedService.id,
        },
      })
        .then((r) => setSlots(r.data))
        .catch(() => setSlots({ all_slots: [], booked_slots: [], available_slots: [] }))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, selectedService]);

  const canNext = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!selectedDate && !!selectedTime;
    if (step === 2) return !!clientName.trim() && !!clientPhone.trim();
    return false;
  };

  const handleNext = () => { setError(''); setStep((s) => s + 1); };
  const handleBack = () => { setError(''); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    if (!clientName.trim()) { setError('Please provide your full name.'); return; }
    if (!clientPhone.trim()) { setError('Please provide your mobile number.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const datetime = `${selectedDate}T${selectedTime}:00`;
      const res = await API.post('/booking/store', {
        service_id: selectedService.id,
        datetime,
        notes,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        client_address: clientAddress.trim(),
        payment_method: paymentMethod,
      });
      setConfirmedBooking(res.data.booking);
      setStep(3);
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Please check availability and try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && step < 3 && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`w-full ${
          step === 2 ? 'max-w-4xl' : 'max-w-2xl'
        } max-h-[90vh] sm:max-h-[88vh] flex flex-col rounded-[2.2rem] overflow-hidden transition-all duration-300 shadow-2xl bg-white border border-[rgba(191,161,95,0.3)]`}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-5 sm:px-7 pt-5 pb-3 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#062c22] text-[#e8cc8a] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Book a Sanctuary Session
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                  Step {step + 1} of {STEP_LABELS.length} • <span className="text-emerald-900 font-bold">{STEP_LABELS[step]}</span>
                </p>
              </div>
            </div>
            {step < 3 && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <StepIndicator step={step} />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {step === 0 && (
                <ServiceCards
                  services={data?.available_services || []}
                  selectedId={selectedService?.id}
                  onSelect={(s) => setSelectedService(s)}
                />
              )}
              {step === 1 && (
                <DateTimePicker
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                  slots={slots}
                  loadingSlots={loadingSlots}
                />
              )}
              {step === 2 && (
                <ReviewStep
                  service={selectedService}
                  date={selectedDate}
                  time={selectedTime}
                  notes={notes}
                  onNotesChange={setNotes}
                  clientName={clientName}
                  onClientNameChange={setClientName}
                  clientEmail={clientEmail}
                  clientPhone={clientPhone}
                  onClientPhoneChange={setClientPhone}
                  clientAddress={clientAddress}
                  onClientAddressChange={setClientAddress}
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />
              )}
              {step === 3 && (
                <ConfirmationStep
                  booking={confirmedBooking}
                  onDone={onClose}
                  onPayOnline={(b) => {
                    onClose();
                    onOpenPayment?.(b);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fixed Footer */}
        {step < 3 && (
          <div className="flex-shrink-0 px-5 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm">
            {error && (
              <div className="mb-3 p-2.5 rounded-xl flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 transition-all hover:text-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed border border-slate-200 bg-white"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>

              {step < 2 ? (
                <LuxuryBtn onClick={handleNext} disabled={!canNext()}>
                  Next Step <ChevronRight className="w-4 h-4" />
                </LuxuryBtn>
              ) : (
                <LuxuryBtn onClick={handleSubmit} disabled={submitting || !canNext()}>
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      Confirming Session…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#041e16]" />
                      Confirm &amp; Book Appointment • ₱{Number(selectedService?.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </>
                  )}
                </LuxuryBtn>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN CLIENT DASHBOARD PORTAL
// ══════════════════════════════════════════════════════════════════════════════
const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'active' | 'completed' | 'cancelled'

  const showToast = (msg, type = 'success') => toast[type]?.(msg) ?? toast.success(msg);

  // Therapist chat messages
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'therapist', text: 'Hello! I am preparing the treatment suite and essential aromatherapy oils for your session.' },
    { sender: 'client',    text: 'Thank you! Please prepare the Lavender & Eucalyptus oils if available.' },
    { sender: 'therapist', text: 'With pleasure! Organic Lavender oils are prepared. Looking forward to welcoming you!' },
  ]);

  const fetchDashboardData = () => {
    API.get('/booking/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'client', text: msg }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: 'therapist', text: 'Noted with pleasure! Everything is prepared for your calm. See you soon!' }]);
    }, 1200);
  };

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const completedCount = data?.bookings?.filter(b => b.status === 'Completed').length || 0;
  const activeCount = data?.bookings?.filter(b => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'In Progress').length || 0;
  const cancelledCount = data?.bookings?.filter(b => b.status === 'Cancelled').length || 0;
  const stamps = Math.min(completedCount + 3, 10);

  // Next upcoming active session
  const nextSession = useMemo(() => {
    if (!data?.bookings) return null;
    const activeOnes = data.bookings.filter(b => b.status === 'Confirmed' || b.status === 'In Progress' || b.status === 'Pending');
    return activeOnes[0] || null;
  }, [data]);

  const latestConfirmedBooking = data?.bookings?.find(b => (b.status === 'Confirmed' || b.status === 'In Progress') && b.therapist_name && b.therapist_name !== 'Awaiting Assignment');
  const assignedTherapistName = latestConfirmedBooking?.therapist_name || null;

  // Filtered bookings
  const filteredBookings = (data?.bookings || []).filter((b) => {
    if (bookingFilter === 'active') return b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'In Progress';
    if (bookingFilter === 'completed') return b.status === 'Completed';
    if (bookingFilter === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-200 selection:text-amber-900" style={{ background: B.canvas, fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ LUXURY STICKY NAVBAR ══════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3 border-b border-black/[0.05]"
        style={{ background: 'rgba(250,248,245,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group cursor-pointer focus-visible:outline-none" title="Visit Cozy Blissful Home">
            <div className="relative">
              <img
                src="/cb-logo.jpg"
                alt="Cozy Blissful Logo"
                className="w-10 h-10 rounded-2xl object-cover shadow-sm ring-1 ring-[#bfa15f]/40 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-wide block text-sm leading-tight group-hover:text-amber-700 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                Cozy Blissful
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase block" style={{ color: '#bfa15f' }}>
                Client Wellness Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Quick Book CTA in Navbar */}
          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-[#041e16] shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Book Session
          </button>

          {/* User Profile Pill */}
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-800">{user?.name || 'Valued Guest'}</p>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
              ✦ CB Club Member
            </span>
          </div>

          <Link
            to="/"
            title="Return to Home Landing"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition cursor-pointer hidden sm:flex items-center gap-1 text-xs font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition duration-200 cursor-pointer border border-slate-200/80 bg-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ══════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ── Welcome Banner with Next Upcoming Spotlight ────────────────── */}
        <div
          className="rounded-[2.2rem] p-6 sm:p-8 relative overflow-hidden text-white shadow-xl"
          style={{
            background: 'linear-gradient(140deg, #062c22 0%, #0a3d30 55%, #041e16 100%)',
            border: '1px solid rgba(191,161,95,0.3)',
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-[#e8cc8a] border border-white/15">
                <Sparkles className="w-3 h-3 text-[#fde68a]" /> Client Sanctuary Lounge
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {greeting}, {user?.name?.split(' ')[0] || 'Valued Guest'} ✨
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Welcome to your calm. Review your appointment roster, message your licensed specialist, and enjoy member-exclusive wellness rates.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setShowWizard(true)}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#041e16] flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95 shadow-xl cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #bfa15f 0%, #e8cc8a 100%)' }}
              >
                <Plus className="w-4 h-4" /> Book a Treatment
              </button>
            </div>
          </div>

          {/* Ambient Glow */}
          <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#bfa15f' }} />
        </div>

        {/* ── Spotlight: Next Upcoming Appointment (if active) ──────────── */}
        {nextSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-3xl bg-white border border-[rgba(191,161,95,0.3)] shadow-[0_4px_20px_rgba(6,44,34,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#062c22] text-[#e8cc8a]">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Next Upcoming Session
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{String(nextSession.id).padStart(5, '0')}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-800 mt-0.5">
                  {nextSession.service}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                    {new Date(nextSession.datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-800" />
                    {new Date(nextSession.datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-800 font-bold">
                    Specialist: {nextSession.therapist_name || 'Reception Matching'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              {nextSession.payment_status !== 'paid' && (
                <button
                  type="button"
                  onClick={() => setPaymentTarget(nextSession)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Pay Online
                </button>
              )}
              <button
                type="button"
                onClick={() => setRescheduleTarget(nextSession)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer border border-slate-200 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Reschedule
              </button>
            </div>
          </motion.div>
        )}

        {/* ── 4-Stat Metric Strip (Interactive Filters) ────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setBookingFilter('active')}
            className={`p-4 rounded-3xl text-left transition-all cursor-pointer border flex items-center gap-3.5 ${
              bookingFilter === 'active'
                ? 'bg-emerald-950 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600/50'
                : 'bg-white text-slate-800 border-slate-200 hover:border-[#bfa15f] shadow-xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                bookingFilter === 'active' ? 'bg-white/15 text-[#e8cc8a]' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${bookingFilter === 'active' ? 'text-emerald-200' : 'text-slate-400'}`}>
                Active Bookings
              </p>
              <p className="text-lg font-black truncate">{activeCount} Sessions</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setBookingFilter('completed')}
            className={`p-4 rounded-3xl text-left transition-all cursor-pointer border flex items-center gap-3.5 ${
              bookingFilter === 'completed'
                ? 'bg-emerald-950 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600/50'
                : 'bg-white text-slate-800 border-slate-200 hover:border-[#bfa15f] shadow-xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                bookingFilter === 'completed' ? 'bg-white/15 text-[#e8cc8a]' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${bookingFilter === 'completed' ? 'text-emerald-200' : 'text-slate-400'}`}>
                Completed
              </p>
              <p className="text-lg font-black truncate">{completedCount} Treatments</p>
            </div>
          </button>

          <LuxuryCard className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-700">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loyalty Club</p>
              <p className="text-lg font-black text-amber-800">{stamps} / 10 Stamps</p>
            </div>
          </LuxuryCard>

          <LuxuryCard className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VIP Tier</p>
              <p className="text-lg font-black text-slate-800">Gold Sanctuary</p>
            </div>
          </LuxuryCard>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">

            {/* ── LEFT/MAIN COLUMN (2 Cols) ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* ── Loyalty Passport Card ───────────────────────────────── */}
              <div
                className="p-6 sm:p-7 rounded-3xl relative overflow-hidden text-white shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #062c22 0%, #0a3d30 60%, #0f5040 100%)',
                  border: '1px solid rgba(191,161,95,0.3)',
                }}
              >
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
                  <Award className="w-48 h-48 text-emerald-200" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-bold text-base tracking-tight flex items-center gap-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <Award className="w-4 h-4 text-[#e8cc8a]" /> Cozy Blissful Loyalty Passport
                    </h2>
                    <p className="text-[11px] text-emerald-100/75 mt-0.5">Collect 10 wellness stamps to redeem a complimentary 60-min Swedish Massage!</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#e8cc8a] bg-white/10 px-3 py-1 rounded-full border border-white/15 shadow-xs">
                    {stamps} / 10 Stamps
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 my-4">
                  {[...Array(10)].map((_, i) => {
                    const isStamped = i < stamps;
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-2xl flex items-center justify-center transition-all duration-300"
                        style={{
                          background: isStamped ? 'linear-gradient(135deg,#bfa15f,#e8cc8a)' : 'rgba(255,255,255,0.06)',
                          boxShadow: isStamped ? '0 4px 12px rgba(191,161,95,0.35)' : 'none',
                          border: isStamped ? '1.5px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {isStamped ? <span className="text-[#041e16] font-black text-xs">CB</span> : <span className="text-emerald-300/30 text-xs font-semibold">{i + 1}</span>}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-emerald-100/85 font-medium">
                  {stamps < 10
                    ? <span>💆 Complete <strong>{10 - stamps} more sessions</strong> to unlock your complimentary therapy!</span>
                    : <span className="text-[#e8cc8a] font-bold">🎉 Congratulations! You have a complimentary massage ready to redeem at front desk!</span>}
                </p>
              </div>

              {/* ── Active Rewards & Vouchers ───────────────────────────── */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#bfa15f]" /> Exclusive Member Perks &amp; Vouchers
                </h3>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {[
                    { code: 'CBWELCOME20', title: '20% Off Welcome Session', desc: 'Valid on your first appointment booking', exp: 'Ongoing' },
                    { code: 'MIDWEEK150',  title: '₱150 Off Midweek Calm',  desc: 'Applicable Wednesday & Thursday appointments', exp: 'Active' },
                  ].map((voucher) => (
                    <LuxuryCard key={voucher.code} className="p-4 flex flex-col justify-between hover:border-[#bfa15f]/60 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c7033]">Voucher Code</span>
                          <span className="text-[9px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">{voucher.exp}</span>
                        </div>
                        <p className="text-xs font-black text-slate-900 font-mono tracking-wider">{voucher.code}</p>
                        <p className="text-xs font-bold text-slate-800 mt-1">{voucher.title}</p>
                        <p className="text-[11px] text-slate-400">{voucher.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(voucher.code);
                          showToast(`Promo code "${voucher.code}" copied to clipboard!`);
                        }}
                        className="w-full mt-3 py-1.5 rounded-xl text-[11px] font-bold text-emerald-950 transition hover:bg-amber-50 cursor-pointer border border-slate-200 bg-white"
                      >
                        Copy Promo Code
                      </button>
                    </LuxuryCard>
                  ))}
                </div>
              </div>

              {/* ── My Appointments & Workflow Tracker ─────────────────── */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-800" /> My Appointments &amp; Treatment History
                  </h3>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl self-start sm:self-auto border border-slate-200">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'active', label: 'Upcoming' },
                      { id: 'completed', label: 'Completed' },
                      { id: 'cancelled', label: 'Cancelled' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setBookingFilter(tab.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          bookingFilter === tab.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <LuxuryCard className="p-8 text-center space-y-3">
                    <Scissors className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700 text-sm">No bookings found in this view</p>
                    <p className="text-xs text-slate-400">Schedule your relaxing therapy session with our certified specialists!</p>
                    <button
                      type="button"
                      onClick={() => setShowWizard(true)}
                      className="mt-2 px-6 py-2.5 rounded-2xl text-xs font-black text-[#041e16] transition hover:brightness-110 cursor-pointer shadow-md"
                      style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)' }}
                    >
                      Book Treatment Now
                    </button>
                  </LuxuryCard>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((b, i) => {
                      const ss = statusStyle(b.status);
                      const canManage = b.status === 'Pending' || b.status === 'Confirmed';
                      const hasTherapist = b.therapist_name && b.therapist_name !== 'Awaiting Assignment';
                      const activeStep = b.status === 'Completed' ? 4 : b.status === 'In Progress' ? 3 : b.status === 'Confirmed' ? 2 : 1;

                      return (
                        <LuxuryCard key={b.id || i} className="p-5 sm:p-6 flex flex-col gap-4">
                          {/* Top Row: Info & Status */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                            <div className="flex items-start gap-3.5">
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                                style={{
                                  background: b.status === 'In Progress'
                                    ? 'rgba(2,132,199,0.1)'
                                    : b.status === 'Completed'
                                    ? 'rgba(16,185,129,0.1)'
                                    : b.status === 'Confirmed'
                                    ? 'rgba(6,44,34,0.08)'
                                    : b.status === 'Cancelled'
                                    ? 'rgba(239,68,68,0.08)'
                                    : 'rgba(191,161,95,0.12)',
                                }}
                              >
                                {b.status === 'Cancelled' ? (
                                  <Ban className="w-5 h-5 text-red-500" />
                                ) : b.status === 'In Progress' ? (
                                  <Sparkles className="w-5 h-5 text-sky-600 animate-pulse" />
                                ) : b.status === 'Completed' ? (
                                  <CheckCheck className="w-5 h-5 text-emerald-600" />
                                ) : b.status === 'Confirmed' ? (
                                  <UserCheck className="w-5 h-5 text-emerald-800" />
                                ) : (
                                  <Clock className="w-5 h-5 text-amber-600" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-black text-slate-800 text-base leading-snug">{b.service}</p>
                                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                                    #{String(b.id).padStart(5, '0')}
                                  </span>
                                  {b.service_price && (
                                    <span className="text-[11px] font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                      ₱{Number(b.service_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                  )}
                                </div>

                                {/* Specialist Assignment */}
                                <div className="pt-0.5">
                                  {hasTherapist ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-xl border border-emerald-200/60">
                                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                                      Assigned Specialist: <strong className="font-bold text-emerald-950">{b.therapist_name}</strong>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-xl border border-amber-200/60">
                                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                                      Specialist: <span className="font-semibold">Awaiting Concierge Matching</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                                    <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                                    {new Date(b.datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                                    <Clock className="w-3.5 h-3.5 text-emerald-800" />
                                    {new Date(b.datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </span>
                                  {b.service_duration && (
                                    <>
                                      <span>·</span>
                                      <span className="flex items-center gap-1 text-amber-800 font-semibold">
                                        <Zap className="w-3 h-3 text-amber-600" /> {b.service_duration} min
                                      </span>
                                    </>
                                  )}
                                </div>
                                {b.notes && <p className="text-[11px] text-slate-500 italic pt-0.5">📋 Notes: {b.notes}</p>}
                              </div>
                            </div>

                            <span
                              className="text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto border whitespace-nowrap uppercase tracking-wider shadow-xs"
                              style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}
                            >
                              {ss.icon} {b.status}
                            </span>
                          </div>

                          {/* Payment Status Pill */}
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {b.payment_status === 'paid' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-3 py-0.5 rounded-full border border-emerald-300">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Paid • ₱{Number(b.amount_paid || b.service_price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                              </span>
                            ) : b.payment_status === 'awaiting_payment' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100/80 px-3 py-0.5 rounded-full border border-sky-300">
                                <Clock className="w-3.5 h-3.5 text-sky-600" /> Awaiting Payment Confirmation
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/80 px-3 py-0.5 rounded-full border border-amber-300">
                                <CreditCard className="w-3.5 h-3.5 text-amber-700" /> Unpaid • ₱{Number(b.service_price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })} (Pay Online or Counter)
                              </span>
                            )}
                          </div>

                          {/* 4-Step Lifecycle Progress Tracker */}
                          {b.status !== 'Cancelled' ? (
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                                <span className="uppercase tracking-wider text-[9px] font-bold text-slate-400">Appointment Workflow</span>
                                <span className="font-bold text-emerald-900">
                                  {activeStep === 1 && 'Step 1 of 4: Booking Received'}
                                  {activeStep === 2 && 'Step 2 of 4: Specialist Assigned & Confirmed'}
                                  {activeStep === 3 && 'Step 3 of 4: Treatment In Progress'}
                                  {activeStep === 4 && 'Step 4 of 4: Treatment Completed'}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { num: 1, label: 'Requested', desc: 'Received by Desk' },
                                  { num: 2, label: 'Assigned', desc: hasTherapist ? b.therapist_name.split(' ')[0] : 'Reception Desk' },
                                  { num: 3, label: 'In Treatment', desc: 'Active Session' },
                                  { num: 4, label: 'Completed', desc: 'Service Concluded' },
                                ].map((st) => {
                                  const isCurrent = activeStep === st.num;
                                  const isPast = activeStep > st.num;
                                  return (
                                    <div key={st.num} className="flex flex-col items-center text-center">
                                      <div
                                        className={`w-full h-1.5 rounded-full mb-1.5 transition-all ${
                                          isPast
                                            ? 'bg-emerald-600'
                                            : isCurrent
                                            ? st.num === 3 ? 'bg-sky-500 animate-pulse' : 'bg-emerald-800'
                                            : 'bg-slate-200'
                                        }`}
                                      />
                                      <span className={`text-[10px] font-bold truncate w-full ${isCurrent ? (st.num === 3 ? 'text-sky-600' : 'text-emerald-900') : isPast ? 'text-emerald-800' : 'text-slate-400'}`}>
                                        {st.label}
                                      </span>
                                      <span className="text-[8px] text-slate-400 truncate w-full hidden sm:block">
                                        {st.desc}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-2xl bg-red-50/60 border border-red-100 flex items-center gap-2 text-xs text-red-600">
                              <Ban className="w-4 h-4 flex-shrink-0" />
                              <span>This session was cancelled. You may book a fresh treatment anytime.</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {canManage && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                              {b.payment_status !== 'paid' && (
                                <button
                                  type="button"
                                  onClick={() => setPaymentTarget(b)}
                                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-sky-700 hover:bg-sky-800 transition cursor-pointer shadow-xs"
                                >
                                  <CreditCard className="w-3.5 h-3.5" /> Pay Online (GCash / Maya / Card)
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setRescheduleTarget(b)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer border border-slate-200"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Reschedule
                              </button>
                              <button
                                type="button"
                                onClick={() => setCancelTarget(b)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer border border-red-200"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel Appointment
                              </button>
                            </div>
                          )}

                          {b.status === 'Completed' && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <CheckCheck className="w-4 h-4 text-emerald-600" /> Completed and verified.
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowWizard(true)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#041e16] transition hover:brightness-110 cursor-pointer shadow-xs"
                                style={{ background: 'linear-gradient(135deg,#bfa15f,#e8cc8a)' }}
                              >
                                Book Again
                              </button>
                            </div>
                          )}
                        </LuxuryCard>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN (1 Col) ──────────────────────────────────── */}
            <div className="space-y-6">

              {/* Assigned Specialist Card */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-800" /> My Assigned Specialist
                </h3>
                {assignedTherapistName ? (
                  <LuxuryCard className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#bfa15f] shadow-md">
                        <img src="/therapist-hero.jpg" alt="Therapist" className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{assignedTherapistName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Licensed Massage &amp; Bodywork Specialist</p>
                      <div className="flex justify-center items-center gap-1.5 mt-1.5">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">4.9 ★ (150+ reviews)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                      ✦ Certified Cozy Blissful Expert
                    </span>
                  </LuxuryCard>
                ) : (
                  <LuxuryCard className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">No Active Specialist Assigned</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Once reception confirms your booking and assigns your specialist, their verified profile will appear here.
                    </p>
                  </LuxuryCard>
                )}
              </div>

              {/* Specialist Connection Chat */}
              {assignedTherapistName && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-800" /> Specialist Connection Chat
                  </h3>
                  <LuxuryCard className="p-4 flex flex-col" style={{ height: '320px' }}>
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-left no-scrollbar">
                      {chatMessages.map((msg, i) => {
                        const isClient = msg.sender === 'client';
                        return (
                          <div key={i} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] ${
                                isClient ? 'text-white' : 'text-slate-800 bg-slate-100'
                              }`}
                              style={
                                isClient
                                  ? {
                                      background: 'linear-gradient(135deg,#062c22,#0a3d30)',
                                      borderRadius: '16px 16px 2px 16px',
                                    }
                                  : {
                                      borderRadius: '16px 16px 16px 2px',
                                      border: '1px solid rgba(0,0,0,0.04)',
                                    }
                              }
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Suggestions */}
                    <div className="flex gap-1.5 overflow-x-auto py-2 no-scrollbar text-[9px] font-bold text-slate-500">
                      {['Please prepare lavender oil', 'I will arrive 5 mins early', 'Focus on lower back'].map((quickText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setChatInput(quickText)}
                          className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition cursor-pointer"
                        >
                          {quickText}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={sendChatMessage} className="pt-2 border-t border-slate-100 flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Message ${assignedTherapistName.split(' ')[0]}...`}
                        className="flex-1 px-3 py-2 rounded-xl text-xs text-slate-800 bg-slate-50 border border-slate-200 placeholder-slate-400 outline-none focus:border-[#bfa15f]"
                      />
                      <button
                        type="submit"
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#041e16] bg-[#bfa15f] hover:brightness-110 transition-all cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </LuxuryCard>
                </div>
              )}

              {/* Salon Concierge Info */}
              <LuxuryCard className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-emerald-800" /> Salon Hours &amp; Concierge Desk
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Daily Operating Hours:</span>
                    <span className="font-bold text-slate-800">9:00 AM – 9:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Reception Concierge:</span>
                    <span className="font-bold text-emerald-800">7 Days a Week</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">On-Site Payment:</span>
                    <span className="font-bold text-slate-800">Cash, GCash, Maya, Card</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  <span>Cozy Blissful Spa &amp; Salon Luxury Suite</span>
                </div>
              </LuxuryCard>

            </div>
          </div>
        )}
      </main>

      {/* ═══ BOOKING WIZARD MODAL ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showWizard && (
          <BookingWizard
            data={data}
            onClose={() => setShowWizard(false)}
            onSuccess={() => {
              fetchDashboardData();
              showToast('🎉 Booking registered! Reception desk is assigning your specialist.');
            }}
            onOpenPayment={(b) => setPaymentTarget(b)}
          />
        )}
      </AnimatePresence>

      {/* ═══ CANCEL MODAL ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            booking={cancelTarget}
            onClose={() => setCancelTarget(null)}
            onSuccess={(msg) => { fetchDashboardData(); showToast(msg, 'error'); }}
          />
        )}
      </AnimatePresence>

      {/* ═══ RESCHEDULE MODAL ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {rescheduleTarget && (
          <RescheduleModal
            booking={rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onSuccess={(msg) => { fetchDashboardData(); showToast(msg, 'success'); }}
          />
        )}
      </AnimatePresence>

      {/* ═══ PAYMENT MODAL (PayMongo) ════════════════════════════════════════ */}
      <AnimatePresence>
        {paymentTarget && (
          <PaymentModal
            appointment={paymentTarget}
            onClose={() => setPaymentTarget(null)}
            onSuccess={() => {
              setPaymentTarget(null);
              fetchDashboardData();
              showToast('✅ Payment submitted! Your appointment is now confirmed.', 'success');
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ FOOTER ═════════════════════════════════════════════════════════ */}
      <footer className="mt-8 py-4 px-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        <p>© {new Date().getFullYear()} Cozy Blissful Salon &amp; Spa • Luxury Sanctuary Specialist Experience</p>
      </footer>
    </div>
  );
};

export default ClientDashboard;
