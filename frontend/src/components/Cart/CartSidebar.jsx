import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Banknote,
  Building2,
  Home,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useCart, peso } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import API from "../../api/axios";
import { DatePickerInput } from "../ui/date-picker";
import { TimePickerInput } from "../ui/time-picker";

const EASE = [0.22, 1, 0.36, 1];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash on Visit", sub: "Pay cash after session is done", icon: Banknote },
];

const SERVICE_TYPES = [
  { id: "salon", label: "Visit Salon", sub: "Private suite", icon: Building2 },
  { id: "home", label: "Home Service", sub: "We come to you", icon: Home },
];

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* Stash key for a validated-but-guest checkout waiting on sign-in. */
const PENDING_KEY = "cb_pending_booking_v1";

/* Salon hours — must match backend ClientController (9:00 AM – 9:00 PM). */
const OPEN_MIN = 9 * 60;
const CLOSE_MIN = 21 * 60;

/* "1 hr" / "1.5 hrs" / "30 min" display strings → minutes. Falls back to 60. */
const parseDurToMin = (dur) => {
  if (typeof dur === "number" && Number.isFinite(dur)) return Math.max(15, Math.round(dur));
  const s = String(dur || "");
  const hrs = s.match(/([\d.]+)\s*hrs?/i);
  if (hrs && Number.isFinite(Number(hrs[1]))) return Math.max(15, Math.round(Number(hrs[1]) * 60));
  const mins = s.match(/(\d+)\s*min/i);
  if (mins) return Math.max(15, Number(mins[1]));
  return 60;
};

/* TimePicker "02:00 PM" → "14:00" for the backend datetime payload. */
const to24h = (t) => {
  const m = String(t || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
};

const to12h = (hhmm) => {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const mer = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${mer}`;
};

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  date: "",
  time: "",
  serviceType: "salon",
  payment: "cash",
  notes: "",
};

const inputCls = (hasError) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:font-medium placeholder:text-slate-300 outline-none transition-all duration-200 focus:ring-2 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 hover:border-slate-300 focus:border-emerald-800/40 focus:ring-emerald-900/10"
  }`;

/* ── Field wrapper ───────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
      {label}
      {required && <span className="text-emerald-700">*</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-1 text-[10.5px] font-bold text-red-500"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

/* ── Option pill (radio group) ───────────────────────────────────── */
const OptionPill = ({ active, onClick, icon: Icon, label, sub }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
      active
        ? "border-emerald-800/50 bg-emerald-50/80 shadow-sm shadow-emerald-900/10"
        : "border-slate-200 bg-white hover:border-slate-300"
    }`}
  >
    <span
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
        active ? "bg-emerald-900 text-amber-300" : "bg-slate-100 text-slate-400"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
    <span className="min-w-0">
      <span className={`block truncate text-[11.5px] font-bold ${active ? "text-emerald-950" : "text-slate-600"}`}>
        {label}
      </span>
      <span className="block truncate text-[10px] font-medium text-slate-400">{sub}</span>
    </span>
  </button>
);

/* ── Cart item row ───────────────────────────────────────────────── */
const ItemRow = ({ item }) => {
  const { updateQty, removeItem } = useCart();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.22 } }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
    >
      <img
        src={item.img}
        alt={item.name}
        loading="lazy"
        className="h-20 w-20 flex-shrink-0 rounded-xl object-cover sm:h-[72px] sm:w-[72px]"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold leading-snug text-slate-800">{item.name}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
              {item.categoryLabel}
              {item.dur && ` · ${item.dur}`}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            onClick={() => removeItem(item.id)}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 active:scale-90"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => updateQty(item.id, Number(item.qty) - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-all hover:text-emerald-800 active:scale-90"
            >
              <Minus className="h-3 w-3" strokeWidth={3} />
            </button>
            <span className="w-6 text-center text-xs font-black text-slate-700 tabular-nums">{item.qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => updateQty(item.id, Number(item.qty) + 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-all hover:text-emerald-800 active:scale-90 disabled:opacity-30"
              disabled={Number(item.qty) >= 20}
            >
              <Plus className="h-3 w-3" strokeWidth={3} />
            </button>
          </div>
          <p className="text-sm font-black text-emerald-950 tabular-nums">
            {peso(Number(item.price) * Number(item.qty))}
            {Number(item.qty) > 1 && (
              <span className="ml-1 text-[10px] font-semibold text-slate-400">({peso(item.price)} ea)</span>
            )}
          </p>
        </div>
      </div>
    </motion.li>
  );
};

/* ══════════════════════════════════════════════════════════════════
   CART SIDEBAR
══════════════════════════════════════════════════════════════════ */
export default function CartSidebar({ onLockChange }) {
  const { items, isOpen, closeCart, clearCart, count, subtotal } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState("cart");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const panelRef = useRef(null);

  /* Combined visit length in minutes (quantity-aware) for hours-fit checks. */
  const totalDuration = items.reduce(
    (n, i) => n + parseDurToMin(i.dur) * Math.max(1, Number(i.qty) || 1),
    0
  );

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => (e[key] ? { ...e, [key]: null } : e));
  };

  /* Reset checkout flow each time the sidebar is re-opened + restore a
     sign-in-pending booking form saved before the login redirect. */
  useEffect(() => {
    if (!isOpen) return;
    if (view === "success") setView("cart");
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.form) setForm({ ...EMPTY_FORM, ...saved.form });
      }
    } catch {
      /* corrupted stash — start fresh */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* Scroll lock (body + Lenis) + ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    onLockChange?.(true);

    const onKey = (e) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      onLockChange?.(false);
    };
  }, [isOpen, closeCart, onLockChange]);

  /* Mirrors backend POST /booking/store rules so the server never sees a
     payload the UI could have rejected (names, PH mobile, hours-fit…). */
  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 3) e.name = "Please enter your full name";
    else if (form.name.trim().length > 150) e.name = "Name is too long (max 150 characters)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email address";
    const phone = form.phone.replace(/[\s-]/g, "");
    if (!/^(\+639|09)\d{9}$/.test(phone)) e.phone = "Use a PH mobile number (09XXXXXXXXX)";
    if (form.serviceType === "home" && (!form.address.trim() || form.address.trim().length < 8))
      e.address = "Home service requires your complete address";
    else if (form.address.trim() && form.address.trim().length > 0 && form.address.trim().length < 8)
      e.address = "Address looks too short";
    else if (form.address.trim().length > 500) e.address = "Address is too long (max 500 characters)";
    if (!form.date) e.date = "Pick your preferred date";
    else if (form.date < todayISO()) e.date = "Date cannot be in the past";
    const time24 = to24h(form.time);
    if (!form.time) e.time = "Pick a time slot";
    else if (!time24) e.time = "Invalid time — pick a slot again";
    else {
      const [hh, mm] = time24.split(":").map(Number);
      const startMin = hh * 60 + mm;
      const visitMin = Math.max(15, totalDuration || 60);
      if (startMin < OPEN_MIN || startMin + visitMin > CLOSE_MIN) {
        const lastStart = to12h(
          `${String(Math.floor((CLOSE_MIN - visitMin) / 60)).padStart(2, "0")}:${String((CLOSE_MIN - visitMin) % 60).padStart(2, "0")}`
        );
        e.time =
          CLOSE_MIN - visitMin < OPEN_MIN
            ? "This visit is too long for one day — remove a service"
            : `Must fit salon hours 9:00 AM – 9:00 PM (last start for ${visitMin} min: ${lastStart})`;
      } else if (new Date(`${form.date}T${time24}:00`) <= new Date()) {
        e.time = "That slot is already in the past — pick a later time";
      }
    }
    if (form.notes.trim().length > 2000) e.notes = "Requests are too long (max 2000 characters)";
    else if (/<[^>]*>/.test(form.notes)) e.notes = "Requests cannot contain HTML or links";
    setErrors(e);
    return Object.keys(e).filter((k) => e[k]).length === 0;
  };

  const stashForLogin = () => {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ form, savedAt: Date.now() }));
    } catch {
      /* storage unavailable — cart itself stays in-memory */
    }
    toast.info("Sign in to confirm your booking — your cart is saved.", { title: "Login required" });
    closeCart();
    navigate("/login", { state: { from: "/" } });
  };

  /* Real checkout: validate → resolve menu names to service IDs → live
     slot check → POST /booking/store. Guests are routed through login
     first (booking endpoints require a client session); nothing is faked. */
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitError("");
    if (items.length === 0) return;
    if (!validate()) return;

    if (!localStorage.getItem("token")) {
      stashForLogin();
      return;
    }

    setSubmitting(true);
    try {
      const time24 = to24h(form.time);
      const visitMin = Math.min(Math.max(15, totalDuration || 60), 480);

      // 1. Resolve landing-menu names to backend service IDs.
      let catalog = [];
      try {
        const dash = await API.get("/booking/dashboard");
        catalog = dash.data?.available_services || [];
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setSubmitting(false);
          stashForLogin();
          return;
        }
        throw err;
      }
      const byName = new Map(
        catalog.map((s) => [String(s.name || "").trim().toLowerCase(), s])
      );
      const serviceIds = [];
      const unmatched = [];
      items.forEach((it) => {
        const hit = byName.get(String(it.name || "").trim().toLowerCase());
        if (!hit || !Number.isFinite(Number(hit.id))) {
          unmatched.push(it.name);
          return;
        }
        const qty = Math.max(1, Math.min(20, Number(it.qty) || 1));
        for (let k = 0; k < qty; k += 1) serviceIds.push(Number(hit.id));
      });
      if (unmatched.length > 0) {
        setSubmitError(
          `We couldn't match ${unmatched.length === 1 ? "this service" : "these services"} to the live menu: ${unmatched.join(", ")}. Please book ${unmatched.length === 1 ? "it" : "them"} from your client dashboard after signing in.`
        );
        return;
      }

      // 2. Live slot check so two clients can't grab the same window.
      const slotRes = await API.get("/booking/available-slots", {
        params: { date: form.date, service_id: serviceIds[0], total_duration: visitMin },
      });
      const avail = slotRes.data?.available_slots || [];
      if (!avail.includes(time24)) {
        setErrors((prev) => ({ ...prev, time: "That slot just filled — pick another time" }));
        toast.warning("That slot was just taken. Please pick another time.", { title: "Slot unavailable" });
        return;
      }

      // 3. Create the booking (one row per service — grouped as one visit).
      const res = await API.post("/booking/store", {
        service_ids: serviceIds,
        primary_service_id: serviceIds[0],
        datetime: `${form.date}T${time24}:00`,
        total_duration: visitMin,
        notes: form.notes.trim(),
        client_name: form.name.trim(),
        client_phone: form.phone.trim(),
        client_address: form.address.trim(),
        payment_method: "cash",
      });
      const booking = res.data?.booking;
      if (!booking || booking.id == null) throw new Error("empty-booking");

      setOrder({
        ref: `#${String(booking.id).padStart(4, "0")}`,
        placedAt: new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        date: form.date,
        time: form.time,
        serviceType: SERVICE_TYPES.find((t) => t.id === form.serviceType)?.label || "Visit Salon",
        payment: "Cash on Visit",
        notes: form.notes.trim(),
        itemCount: count,
        total: Number(booking.service_price ?? subtotal),
        services: items.map((i) => `${i.name} ×${i.qty}`),
      });
      clearCart();
      try {
        localStorage.removeItem(PENDING_KEY);
      } catch {
        /* ignore */
      }
      setView("success");
      toast.success("Booking request received! We will confirm your slot shortly.", { title: "Request sent" });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setSubmitting(false);
        stashForLogin();
        return;
      }
      const serverMsg = err?.response?.data?.message;
      const fieldErrs = err?.response?.data?.errors;
      if (status === 422 && fieldErrs && typeof fieldErrs === "object") {
        const mapped = {};
        if (fieldErrs.datetime) {
          mapped.time = Array.isArray(fieldErrs.datetime) ? fieldErrs.datetime[0] : String(fieldErrs.datetime);
        }
        if (fieldErrs.notes) {
          mapped.notes = Array.isArray(fieldErrs.notes) ? fieldErrs.notes[0] : String(fieldErrs.notes);
        }
        if (Object.keys(mapped).length > 0) setErrors((prev) => ({ ...prev, ...mapped }));
      }
      setSubmitError(serverMsg || "Could not reach the booking server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBrowse = () => {
    closeCart();
    setTimeout(() => {
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const headings = {
    cart: { title: "Your Cart", sub: `${count} ${count === 1 ? "service" : "services"} reserved` },
    checkout: { title: "Booking Details", sub: "Tell us how to prepare for you" },
    success: { title: "Booking Confirmed", sub: "See you soon at Cozy Blissful" },
  };

  const prettyDate = (iso) => {
    try {
      return new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            aria-hidden
            className="fixed inset-0 z-[85] bg-[#04100a]/55 backdrop-blur-[3px]"
          />

          {/* Panel */}
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={headings[view].title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.42, ease: EASE }}
            style={{ willChange: "transform" }}
            className="fixed inset-y-0 right-0 z-[90] flex h-full w-full max-w-md max-w-[100vw] flex-col bg-[#faf9f7] shadow-2xl"
          >
            {/* Header */}
            <div className="relative flex-shrink-0 overflow-hidden px-5 py-4 sm:px-6" style={{ background: "linear-gradient(135deg,#041e16,#073328)" }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {view === "checkout" && !submitting ? (
                    <button
                      type="button"
                      onClick={() => setView("cart")}
                      aria-label="Back to cart"
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-400/15 text-amber-300">
                      {view === "success" ? <BadgeCheck className="h-4.5 w-4.5" /> : <ShoppingCart className="h-4 w-4" />}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-black tracking-wide text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {headings[view].title}
                    </h2>
                    <p className="truncate text-[10px] font-bold uppercase tracking-widest text-amber-300/70">
                      {headings[view].sub}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={closeCart}
                  aria-label="Close cart"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Stepper dots */}
              <div className="mt-3.5 flex items-center gap-1.5">
                {["cart", "checkout", "success"].map((s, i) => (
                  <span
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      ["cart", "checkout", "success"].indexOf(view) >= i ? "bg-amber-400" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ══ BODY ══ */}
            {view === "cart" && (
              <>
                {items.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-900/5 ring-8 ring-emerald-900/[0.04]"
                    >
                      <ShoppingBag className="h-10 w-10 text-emerald-900/25" strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="text-base font-black text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Your cart is empty
                    </h3>
                    <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-slate-400">
                      Browse our salon menu and tap <span className="font-bold text-emerald-800">Add to Cart</span> on the services you'd love.
                    </p>
                    <button
                      type="button"
                      onClick={goBrowse}
                      className="group mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black text-[#041e16] transition-all hover:brightness-110 active:scale-95"
                      style={{ background: "linear-gradient(135deg,#bfa15f,#e8cc8a)", boxShadow: "0 6px 20px rgba(191,161,95,0.4)" }}
                    >
                      Browse Our Menu
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div data-lenis-prevent className="cb-cart-scroll flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
                      <ul className="space-y-3">
                        <AnimatePresence initial={false}>
                          {items.map((item) => (
                            <ItemRow key={item.id} item={item} />
                          ))}
                        </AnimatePresence>
                      </ul>
                      <p className="mt-4 rounded-xl border border-dashed border-emerald-800/20 bg-emerald-900/[0.04] px-4 py-3 text-center text-[10.5px] font-semibold leading-relaxed text-emerald-900/70">
                        No prepayment needed — you'll only pay after we confirm your booking via SMS or email.
                      </p>
                    </div>

                    {/* Footer summary */}
                    <div className="flex-shrink-0 border-t border-slate-200/80 bg-white px-5 pb-[max(1.15rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Subtotal</span>
                        <span className="tabular-nums">{peso(subtotal)}</span>
                      </div>
                      <div className="mb-3.5 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-800">Total</span>
                        <motion.span
                          key={subtotal}
                          initial={{ scale: 1.12 }}
                          animate={{ scale: 1 }}
                          className="text-lg font-black tabular-nums text-emerald-950"
                        >
                          {peso(subtotal)}
                        </motion.span>
                      </div>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setView("checkout")}
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-[#041e16] transition-all hover:brightness-110"
                        style={{ background: "linear-gradient(135deg,#c9a851,#e8cc8a)", boxShadow: "0 8px 24px rgba(191,161,95,0.45)" }}
                      >
                        Fill Out Booking Details
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.button>
                    </div>
                  </>
                )}
              </>
            )}

            {view === "checkout" && (
              <>
                <div data-lenis-prevent className="cb-cart-scroll flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
                  {/* Client details */}
                  <section className="mb-5">
                    <h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-950">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-900 text-[9px] font-black text-amber-300">1</span>
                      Client Information
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field label="Full Name" required error={errors.name}>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setField("name", e.target.value)}
                            placeholder="Juan Dela Cruz"
                            autoComplete="name"
                            aria-invalid={!!errors.name}
                            className={inputCls(errors.name)}
                          />
                        </Field>
                      </div>
                      <Field label="Email Address" required error={errors.email}>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          placeholder="you@email.com"
                          autoComplete="email"
                          inputMode="email"
                          aria-invalid={!!errors.email}
                          className={inputCls(errors.email)}
                        />
                      </Field>
                      <Field label="Mobile Number" required error={errors.phone}>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          placeholder="09XX XXX XXXX"
                          autoComplete="tel"
                          inputMode="tel"
                          aria-invalid={!!errors.phone}
                          className={inputCls(errors.phone)}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* Schedule */}
                  <section className="mb-5">
                    <h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-950">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-900 text-[9px] font-black text-amber-300">2</span>
                      Schedule & Setup
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Preferred Date" required error={errors.date}>
                        <DatePickerInput
                          value={form.date}
                          onChange={(v) => setField("date", v)}
                          placeholder="mm/dd/yyyy"
                          className="w-full"
                          style={{ minWidth: "100%" }}
                        />
                      </Field>
                      <Field label="Preferred Time" required error={errors.time}>
                        <TimePickerInput
                          value={form.time}
                          onChange={(v) => setField("time", v)}
                          className="w-full"
                          style={{ minWidth: "100%" }}
                        />
                      </Field>
                    </div>

                    <div className="mt-3 grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5">
                      {SERVICE_TYPES.map((t) => (
                        <OptionPill
                          key={t.id}
                          active={form.serviceType === t.id}
                          onClick={() => setField("serviceType", t.id)}
                          icon={t.icon}
                          label={t.label}
                          sub={t.sub}
                        />
                      ))}
                    </div>

                    <div className="mt-3">
                      <Field
                        label={form.serviceType === "home" ? "Complete Address" : "Address (optional)"}
                        required={form.serviceType === "home"}
                        error={errors.address}
                      >
                        <textarea
                          rows={2}
                          value={form.address}
                          onChange={(e) => setField("address", e.target.value)}
                          placeholder={form.serviceType === "home" ? "House no., street, barangay, city" : "Only if availing home service"}
                          aria-invalid={!!errors.address}
                          className={`${inputCls(errors.address)} resize-none`}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* Payment */}
                  <section className="mb-5">
                    <h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-950">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-900 text-[9px] font-black text-amber-300">3</span>
                      Billing & Payment
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {PAYMENT_METHODS.map((p) => (
                        <OptionPill
                          key={p.id}
                          active={form.payment === p.id}
                          onClick={() => setField("payment", p.id)}
                          icon={p.icon}
                          label={p.label}
                          sub={p.sub}
                        />
                      ))}
                    </div>
                    <div className="mt-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-[11.5px] leading-relaxed text-amber-900">
                      <p className="font-semibold">
                        💡 <span className="font-bold">Zero advance payment:</span> You will pay cash at the reception counter only after your wellness session is happily completed.
                      </p>
                    </div>
                    <div className="mt-3">
                      <Field label="Special Requests (optional)" error={errors.notes}>
                        <textarea
                          rows={2}
                          value={form.notes}
                          onChange={(e) => setField("notes", e.target.value)}
                          placeholder="Allergies, preferred therapist gender, pregnant/senior considerations…"
                          aria-invalid={!!errors.notes}
                          className={`${inputCls(errors.notes)} resize-none`}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* Order recap */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500">Order Summary</h3>
                    <ul className="space-y-1.5">
                      {items.map((i) => (
                        <li key={i.id} className="flex items-baseline justify-between gap-3 text-[11.5px]">
                          <span className="min-w-0 truncate font-semibold text-slate-600">
                            {i.name} <span className="text-slate-400">×{i.qty}</span>
                          </span>
                          <span className="flex-shrink-0 font-bold tabular-nums text-slate-700">
                            {peso(Number(i.price) * Number(i.qty))}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                      <span className="text-xs font-black text-slate-800">Total to pay on visit</span>
                      <span className="text-base font-black tabular-nums text-emerald-950">{peso(subtotal)}</span>
                    </div>
                  </section>
                </div>

                <div className="flex-shrink-0 border-t border-slate-200/80 bg-white px-5 pb-[max(1.15rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
                  <AnimatePresence>
                    {submitError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="mb-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[11px] font-bold leading-relaxed text-red-600"
                      >
                        {submitError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <motion.button
                    type="button"
                    whileTap={submitting ? undefined : { scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-[#041e16] transition-all enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-80"
                    style={{ background: "linear-gradient(135deg,#c9a851,#e8cc8a)", boxShadow: "0 8px 24px rgba(191,161,95,0.45)" }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        Confirm Booking Request · {peso(subtotal)}
                      </>
                    )}
                  </motion.button>
                  <p className="mt-2 text-center text-[9.5px] font-semibold text-slate-400">
                    Free cancellation up to 3 hours before your schedule.
                    {!localStorage.getItem("token") && " You'll sign in to confirm — your cart is saved."}
                  </p>
                </div>
              </>
            )}

            {view === "success" && order && (
              <div data-lenis-prevent className="cb-cart-scroll flex-1 overflow-y-auto overscroll-contain px-5 py-7 sm:px-6">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="mb-4 flex h-20 w-20 items-center justify-center rounded-full shadow-lg shadow-emerald-900/20"
                    style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
                  >
                    <BadgeCheck className="h-10 w-10 text-white" strokeWidth={2.2} />
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Salamat, {order.name.split(" ")[0]}!
                  </h3>
                  <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-slate-500">
                    Your booking request has been received. Our team will contact you shortly to confirm your slot.
                  </p>
                  <div className="mt-4 w-full rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-50/60 px-5 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-700">Reference No.</p>
                    <p className="mt-0.5 text-lg font-black tracking-[0.14em] text-emerald-950">{order.ref}</p>
                    <p className="text-[9.5px] font-semibold text-slate-400">Placed {order.placedAt}</p>
                  </div>
                </div>

                <dl className="mt-6 space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  {[
                    ["Services", order.services.join(" · ")],
                    ["Schedule", `${prettyDate(order.date)} · ${order.time}`],
                    ["Setup", order.serviceType],
                    ["Payment", order.payment],
                    ["Contact", `${order.phone} · ${order.email}`],
                    ...(order.address ? [["Address", order.address]] : []),
                    ...(order.notes ? [["Requests", order.notes]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                      <dt className="w-20 flex-shrink-0 text-[9.5px] font-black uppercase tracking-widest text-slate-400">{k}</dt>
                      <dd className="break-words text-[11.5px] font-semibold capitalize text-slate-700">{v}</dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                    <dt className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">Total ({order.itemCount} svc)</dt>
                    <dd className="text-base font-black tabular-nums text-emerald-950">{peso(order.total)}</dd>
                  </div>
                </dl>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={goBrowse}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-900/15 bg-white py-3.5 text-sm font-black text-emerald-950 shadow-sm transition-all hover:bg-emerald-50 active:scale-[0.98]"
                >
                  Continue Browsing Services
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
