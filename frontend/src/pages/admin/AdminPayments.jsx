import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { useTheme } from "../../context/ThemeContext";
import { MiniCalendar } from "../../components/ui/mini-calendar";
import { DatePickerInput } from "../../components/ui/date-picker";
import { format } from "date-fns";
import {
  CreditCard, TrendingUp, DollarSign, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Calendar, Check, X, Receipt,
  Banknote, Wallet, BarChart3, Search, Filter, Download,
  AlertTriangle, RefreshCw, Users, ArrowUpRight, ArrowDownRight,
  FileText, Trash2, Plus, Eye, EyeOff, Info, CalendarDays, Coins,
} from "lucide-react";


/* ============================================================
   BUSINESS CONSTANTS — 60 / 40 SPLIT POLICY
   - Therapist remits FULL booking amount to admin DAILY
   - Admin releases 40% salary to therapist every FRIDAY
   - Admin retains 60% as business revenue
============================================================ */
const ADMIN_PCT = 0.60;
const THERAPIST_PCT = 0.40;

const THERAPISTS = [
  { id: 1, name: "Anna Reyes", specialty: "Swedish & Hot Stone", initials: "AR", grad: "linear-gradient(135deg,#78350f,#d97706)" },
  { id: 2, name: "Leo Garcia", specialty: "Deep Tissue & Sports", initials: "LG", grad: "linear-gradient(135deg,#1e3a8a,#2563eb)" },
  { id: 3, name: "Grace Tan", specialty: "Hilot & Shiatsu", initials: "GT", grad: "linear-gradient(135deg,#4338ca,#6366f1)" },
  { id: 4, name: "Mark Villanueva", specialty: "Aromatherapy & Lomi", initials: "MV", grad: "linear-gradient(135deg,#065f46,#059669)" },
];

const RAW_BOOKINGS = [
  { id: 101, date: "2026-08-04", tid: 1, svc: "Swedish Massage 60min", amt: 850, st: "completed" },
  { id: 102, date: "2026-08-04", tid: 1, svc: "Hot Stone Therapy 90min", amt: 1200, st: "completed" },
  { id: 103, date: "2026-08-04", tid: 2, svc: "Deep Tissue 60min", amt: 900, st: "completed" },
  { id: 104, date: "2026-08-05", tid: 1, svc: "Swedish Massage 60min", amt: 850, st: "completed" },
  { id: 105, date: "2026-08-05", tid: 3, svc: "Hilot Massage", amt: 750, st: "completed" },
  { id: 106, date: "2026-08-06", tid: 2, svc: "Sports Massage 90min", amt: 1100, st: "completed" },
  { id: 107, date: "2026-08-06", tid: 4, svc: "Aromatherapy 60min", amt: 800, st: "completed" },
  { id: 108, date: "2026-08-07", tid: 1, svc: "Couple Massage", amt: 1800, st: "completed" },
  { id: 109, date: "2026-08-07", tid: 3, svc: "Lomi-Lomi Massage", amt: 950, st: "completed" },
  { id: 110, date: "2026-08-08", tid: 4, svc: "Aromatherapy 90min", amt: 1000, st: "completed" },
  { id: 111, date: "2026-08-08", tid: 2, svc: "Deep Tissue 90min", amt: 1250, st: "completed" },
  { id: 201, date: "2026-08-11", tid: 1, svc: "Swedish Massage 60min", amt: 850, st: "completed" },
  { id: 202, date: "2026-08-11", tid: 2, svc: "Deep Tissue 60min", amt: 900, st: "completed" },
  { id: 203, date: "2026-08-12", tid: 3, svc: "Hilot Massage", amt: 750, st: "completed" },
  { id: 204, date: "2026-08-12", tid: 1, svc: "Hot Stone Therapy 90min", amt: 1200, st: "completed" },
  { id: 205, date: "2026-08-13", tid: 4, svc: "Aromatherapy 60min", amt: 800, st: "pending" },
  { id: 206, date: "2026-08-13", tid: 2, svc: "Sports Massage 90min", amt: 1100, st: "pending" },
];

function enrich(b) {
  return { ...b, adminEarning: Math.round(b.amt * ADMIN_PCT), therapistEarning: Math.round(b.amt * THERAPIST_PCT) };
}
const BOOKINGS = RAW_BOOKINGS.map(enrich);

function getWeekBounds(dateStr) {
  const d = new Date(dateStr + "T00:00:00"), day = d.getDay();
  const mon = new Date(d); mon.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const fmt = (dt, o = { month: "short", day: "numeric" }) => dt.toLocaleDateString("en-PH", o);
  return {
    key: mon.toISOString().slice(0, 10),
    mon, fri, sun,
    label: `${fmt(mon)} – ${fmt(fri, { month: "short", day: "numeric", year: "numeric" })}`,
    fridayStr: fri.toISOString().slice(0, 10),
  };
}

function isFriday(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay() === 5;
}

/* ============================================================  THEME  */
function useC() {
  const { theme } = useTheme(); const dk = theme === "dark";
  return {
    dk,
    page: dk ? "#080f1e" : "#f0f4f8",
    card: dk ? "#0f1929" : "#ffffff",
    card2: dk ? "#0d1626" : "#f8fafc",
    inner: dk ? "#0a1120" : "#f1f5f9",
    txt: dk ? "#e8f0fe" : "#0f172a",
    sec: dk ? "#7899c0" : "#475569",
    muted: dk ? "#3d566e" : "#94a3b8",
    div: dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    head: dk ? "#0a1322" : "#f1f5f9",
    sh: dk ? "0 4px 32px rgba(0,0,0,0.5)" : "0 2px 20px rgba(0,0,0,0.07)",
    ibg: dk ? "rgba(255,255,255,0.04)" : "#ffffff",
    ibdr: dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
  };
}

/* ============================================================  ATOMS  */
const peso = n => `\u20b1${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = ds => new Date(ds + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const fmtDow = ds => new Date(ds + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

function Av({ t, size = 36 }) {
  return (<div className="flex-shrink-0 flex items-center justify-center font-black text-white shadow"
    style={{ width: size, height: size, borderRadius: "50%", fontSize: size * 0.35, background: t?.grad || "#334155" }}>
    {t?.initials || "?"}
  </div>);
}

function Badge({ status }) {
  const map = {
    completed: { bg: "rgba(16,185,129,0.12)", c: "#059669", ic: Check, lbl: "Completed" },
    remitted: { bg: "rgba(59,130,246,0.12)", c: "#3b82f6", ic: Check, lbl: "Remitted" },
    pending: { bg: "rgba(245,158,11,0.12)", c: "#d97706", ic: Clock, lbl: "Pending" },
    released: { bg: "rgba(139,92,246,0.12)", c: "#8b5cf6", ic: Check, lbl: "Released" },
    paid: { bg: "rgba(16,185,129,0.12)", c: "#059669", ic: Check, lbl: "Paid" },
    overdue: { bg: "rgba(239,68,68,0.12)", c: "#ef4444", ic: AlertTriangle, lbl: "Overdue" },
  };
  const s = map[status] || map.pending; const Ic = s.ic;
  return (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
    style={{ background: s.bg, color: s.c }}>
    <Ic className="w-3 h-3" />{s.lbl}
  </span>);
}

function SplitBar({ admin, therapist }) {
  const total = admin + therapist; if (!total) return null;
  const ap = Math.round((admin / total) * 100);
  return (<div className="flex items-center gap-2 w-full">
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div className="h-full rounded-full" style={{ width: `${ap}%`, background: "linear-gradient(90deg,#059669,#0ea5e9)" }} />
    </div>
    <span className="text-[9px] font-black text-slate-400 whitespace-nowrap">{ap}%A / {100 - ap}%T</span>
  </div>);
}

function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = "Confirm", variant = "success", C }) {
  const colors = {
    success: { bg: "rgba(5,150,105,0.1)", c: "#059669", grad: "linear-gradient(135deg,#059669,#0a5f3c)" },
    danger: { bg: "rgba(239,68,68,0.1)", c: "#ef4444", grad: "linear-gradient(135deg,#ef4444,#b91c1c)" }
  };
  const col = colors[variant] || colors.success;
  return (<AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ background: C.card }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: col.bg }}>
        <AlertTriangle className="w-6 h-6" style={{ color: col.c }} />
      </div>
      <h3 className="text-center font-black text-base mb-2" style={{ color: C.txt }}>{title}</h3>
      <p className="text-center text-xs mb-6" style={{ color: C.sec }}>{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-xs font-bold transition-all hover:opacity-80"
          style={{ background: C.inner, color: C.sec }}>Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-xs font-black text-white shadow-lg transition-all hover:opacity-90"
          style={{ background: col.grad }}>{confirmLabel}</button>
      </div>
    </motion.div>
  </motion.div></AnimatePresence>);
}

function PolicyCard({ text, color = "#059669", bg = "rgba(5,150,105,0.08)", bdr = "rgba(5,150,105,0.2)", Icon = Info }) {
  return (<div className="flex items-start gap-3 p-4 rounded-2xl text-xs"
    style={{ background: bg, border: `1px solid ${bdr}` }}>
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: `${color}22` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div><p className="font-black mb-1" style={{ color }}>Business Policy</p>
      <p style={{ color: "#7899c0" }}>{text}</p>
    </div>
  </div>);
}

function FilterBar({ search, setSearch, dateFrom, setDateFrom, dateTo, setDateTo, therapistId, setTherapistId, C, showTherapist = true }) {
  const is = { background: C.ibg, border: `1.5px solid ${C.ibdr}`, color: C.txt };
  return (<div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2.5">
    <div className="relative flex-1 min-w-[140px] w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: C.muted }} />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
        className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl outline-none font-medium"
        style={is} />
      {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
        <X className="w-3 h-3 text-slate-400" /></button>}
    </div>
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <DatePickerInput value={dateFrom} onChange={setDateFrom} placeholder="mm/dd/yyyy" isDark={C.dk} className="flex-1 sm:flex-none" />
      <span className="text-xs font-bold flex-shrink-0" style={{ color: C.muted }}>to</span>
      <DatePickerInput value={dateTo} onChange={setDateTo} placeholder="mm/dd/yyyy" isDark={C.dk} className="flex-1 sm:flex-none" />
    </div>
    {showTherapist && <select value={therapistId} onChange={e => setTherapistId(e.target.value)}
      className="w-full sm:w-auto px-3 py-2.5 text-xs rounded-xl outline-none font-bold cursor-pointer" style={is}>
      <option value="">All Therapists</option>
      {THERAPISTS.map(t => <option key={t.id} value={t.id} style={{ background: C.card, color: C.txt }}>{t.name}</option>)}
    </select>}
    {(search || dateFrom || dateTo || therapistId) &&
      <button onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setTherapistId && setTherapistId(""); }}
        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold hover:opacity-80 transition-all w-full sm:w-auto"
        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
        <RefreshCw className="w-3.5 h-3.5" />Clear
      </button>}
  </div>);
}

function THead({ cols, C }) {
  return (
    <thead><tr style={{ background: C.head }}>
      {cols.map(c => <th key={c} className="px-4 py-3.5 text-left text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
        style={{ color: C.muted }}>{c}</th>)}
    </tr></thead>
  );
}

function exportCSV(headers, rows, filename) {
  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
  const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = filename; a.click();
}


/* ============================================================
   TAB 1 — DAILY SALES LOGS
============================================================ */
function TabSales() {
  const C = useC();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tid, setTid] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return BOOKINGS.filter(b => {
      if (statusFilter !== "all" && b.st !== statusFilter) return false;
      if (tid && b.tid !== Number(tid)) return false;
      if (dateFrom && b.date < dateFrom) return false;
      if (dateTo && b.date > dateTo) return false;
      if (search) {
        const q = search.toLowerCase();
        const t = THERAPISTS.find(x => x.id === b.tid);
        if (!b.svc.toLowerCase().includes(q) && !(t?.name.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [search, dateFrom, dateTo, tid, statusFilter]);

  const done = filtered.filter(b => b.st === "completed");
  const gross = done.reduce((s, b) => s + b.amt, 0);
  const admTotal = done.reduce((s, b) => s + b.adminEarning, 0);
  const thrTotal = done.reduce((s, b) => s + b.therapistEarning, 0);
  const pending = filtered.filter(b => b.st === "pending").length;

  const handleExport = () => {
    exportCSV(
      ["Date", "Therapist", "Service", "Status", "Booking Amt", "Admin (60%)", "Therapist (40%)"],
      filtered.map(b => {
        const t = THERAPISTS.find(x => x.id === b.tid);
        return [b.date, t?.name || "-", b.svc, b.st, b.amt, b.adminEarning, b.therapistEarning];
      }), "daily_sales_logs.csv"
    );
  };

  return (<div className="space-y-4">
    {/* KPI */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { l: "Total Bookings", v: filtered.length, c: "#3b82f6", bg: "rgba(59,130,246,0.1)", ic: Calendar, sub: `${pending} pending` },
        { l: "Gross Revenue", v: peso(gross), c: "#059669", bg: "rgba(5,150,105,0.1)", ic: TrendingUp, sub: "Completed sessions" },
        { l: "Admin Revenue (60%)", v: peso(admTotal), c: "#0ea5e9", bg: "rgba(14,165,233,0.1)", ic: Wallet, sub: "Business share" },
        { l: "Therapist Earnings (40%)", v: peso(thrTotal), c: "#d97706", bg: "rgba(217,119,6,0.1)", ic: Banknote, sub: "To be paid Friday" },
      ].map(k => (
        <div key={k.l} className="p-4 sm:p-5 rounded-2xl" style={{ background: C.card, boxShadow: C.sh }}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest leading-tight" style={{ color: C.muted }}>{k.l}</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.bg }}>
              <k.ic className="w-4 h-4" style={{ color: k.c }} />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black truncate" style={{ color: k.c }}>{k.v}</p>
          <p className="text-[10px] mt-1" style={{ color: C.muted }}>{k.sub}</p>
        </div>
      ))}
    </div>

    {/* Filters + Actions */}
    <div className="p-4 rounded-2xl space-y-3" style={{ background: C.card, boxShadow: C.sh }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1">
          {["all", "completed", "pending"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black capitalize transition-all"
              style={statusFilter === s
                ? { background: "linear-gradient(135deg,#059669,#0a5f3c)", color: "#fff" }
                : { background: C.inner, color: C.sec }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black hover:opacity-80 transition-all"
          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
          <Download className="w-3.5 h-3.5" />Export CSV
        </button>
      </div>
      <FilterBar search={search} setSearch={setSearch} dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo} therapistId={tid} setTherapistId={setTid} C={C} />
    </div>

    {/* Table */}
    <div className="rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.sh }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px]">
          <THead cols={["Date", "Therapist", "Service", "Status", "Booking Amt", "Admin 60%", "Therapist 40%", "Split"]} C={C} />
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Receipt className="w-10 h-10 text-slate-600" />
                  <p className="text-sm font-bold" style={{ color: C.muted }}>No records match your filters</p>
                </div>
              </td></tr>
            )}
            {filtered.map((b, i) => {
              const t = THERAPISTS.find(x => x.id === b.tid);
              return (<tr key={b.id} className="transition-all"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${C.div}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.inner}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td className="px-4 py-3.5 text-xs font-medium whitespace-nowrap" style={{ color: C.sec }}>{fmtDate(b.date)}</td>
                <td className="px-4 py-3.5">
                  {t ? (<div className="flex items-center gap-2">
                    <Av t={t} size={30} /><span className="text-xs font-semibold whitespace-nowrap" style={{ color: C.txt }}>{t.name}</span>
                  </div>) : <span className="text-xs" style={{ color: C.muted }}>—</span>}
                </td>
                <td className="px-4 py-3.5 text-xs font-medium" style={{ color: C.sec }}>{b.svc}</td>
                <td className="px-4 py-3.5"><Badge status={b.st} /></td>
                <td className="px-4 py-3.5 text-xs font-black" style={{ color: C.txt }}>{peso(b.amt)}</td>
                <td className="px-4 py-3.5 text-xs font-black text-emerald-500">{b.st === "completed" ? peso(b.adminEarning) : "—"}</td>
                <td className="px-4 py-3.5 text-xs font-black" style={{ color: "#d97706" }}>{b.st === "completed" ? peso(b.therapistEarning) : "—"}</td>
                <td className="px-4 py-3.5 w-32">{b.st === "completed" && <SplitBar admin={b.adminEarning} therapist={b.therapistEarning} />}</td>
              </tr>);
            })}
          </tbody>
          {done.length > 0 && (
            <tfoot><tr style={{ borderTop: `2px solid ${C.div}`, background: C.head }}>
              <td colSpan={4} className="px-4 py-3 text-xs font-black" style={{ color: C.muted }}>
                TOTALS ({done.length} completed)
              </td>
              <td className="px-4 py-3 text-sm font-black" style={{ color: C.txt }}>{peso(gross)}</td>
              <td className="px-4 py-3 text-sm font-black text-emerald-500">{peso(admTotal)}</td>
              <td className="px-4 py-3 text-sm font-black" style={{ color: "#d97706" }}>{peso(thrTotal)}</td>
              <td />
            </tr></tfoot>
          )}
        </table>
      </div>
    </div>
  </div>);
}


/* ============================================================
   TAB 2 — WEEKLY PAYROLL (40%)
============================================================ */
function TabPayroll() {
  const C = useC();
  const [released, setReleased] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const done = BOOKINGS.filter(b => b.st === "completed");

  const weeklyData = useMemo(() => {
    const map = {};
    done.forEach(b => {
      const w = getWeekBounds(b.date);
      if (!map[w.key]) map[w.key] = { ...w, therapists: {} };
      const tk = b.tid;
      if (!map[w.key].therapists[tk]) map[w.key].therapists[tk] = { sessions: 0, gross: 0, salary: 0, adminRev: 0, bookings: [] };
      map[w.key].therapists[tk].sessions += 1;
      map[w.key].therapists[tk].gross += b.amt;
      map[w.key].therapists[tk].salary += b.therapistEarning;
      map[w.key].therapists[tk].adminRev += b.adminEarning;
      map[w.key].therapists[tk].bookings.push(b);
    });
    let weeks = Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
    if (dateFrom) weeks = weeks.filter(w => w.fridayStr >= dateFrom);
    if (dateTo) weeks = weeks.filter(w => w.key <= dateTo);
    return weeks;
  }, [done, dateFrom, dateTo]);

  const totalSalary = Object.entries(released).filter(([, v]) => v).length;
  const pendingCount = weeklyData.reduce((s, w) => s + Object.keys(w.therapists).filter(tid => !released[`${w.key}_${tid}`]).length, 0);

  const doRelease = (rk, name, amount) => setConfirm({
    rk, title: "Release Weekly Salary",
    message: `Release ${peso(amount)} weekly salary to ${name}? This action will be recorded.`, amount, name
  });

  const confirmRelease = () => {
    setReleased(p => ({ ...p, [confirm.rk]: true }));
    setConfirm(null);
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayIsFriday = new Date().getDay() === 5;

  return (<div className="space-y-4">
    {confirm && <ConfirmModal title={confirm.title} message={confirm.message}
      onConfirm={confirmRelease} onCancel={() => setConfirm(null)}
      confirmLabel={`Release ${peso(confirm.amount)}`} C={C} />}

    {/* Friday Alert */}
    {todayIsFriday && (
      <div className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(139,92,246,0.15)" }}>
          <Banknote className="w-5 h-5" style={{ color: "#8b5cf6" }} />
        </div>
        <div>
          <p className="text-sm font-black" style={{ color: "#8b5cf6" }}>Today is Friday — Salary Payout Day!</p>
          <p className="text-xs mt-0.5" style={{ color: "#7899c0" }}>
            {pendingCount > 0 ? `${pendingCount} therapist(s) awaiting salary release.` : "All salaries have been released for this week."}
          </p>
        </div>
        {pendingCount > 0 && <span className="ml-auto px-3 py-1.5 rounded-xl text-xs font-black"
          style={{ background: "rgba(139,92,246,0.2)", color: "#8b5cf6" }}>{pendingCount} pending</span>}
      </div>
    )}

    <PolicyCard text="Therapists earn 40% per completed booking. The admin retains 60% as business revenue. Accumulated earnings (Mon–Fri) are released every Friday as weekly salary."
      color="#3b82f6" bg="rgba(59,130,246,0.08)" bdr="rgba(59,130,246,0.2)" Icon={Banknote} />

    {/* Filters */}
    <div className="p-4 rounded-2xl" style={{ background: C.card, boxShadow: C.sh }}>
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-[10px] font-black uppercase tracking-wider flex-shrink-0" style={{ color: C.muted }}>
          <Filter className="w-3 h-3 inline mr-1" />Week range:
        </label>
        <DatePickerInput value={dateFrom} onChange={setDateFrom} placeholder="mm/dd/yyyy" isDark={C.dk} />
        <span className="text-xs" style={{ color: C.muted }}>to</span>
        <DatePickerInput value={dateTo} onChange={setDateTo} placeholder="mm/dd/yyyy" isDark={C.dk} />
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-bold hover:opacity-80"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          <RefreshCw className="w-3 h-3" />Reset
        </button>}
      </div>
    </div>

    {/* Weekly blocks */}
    {weeklyData.length === 0 && (
      <div className="py-16 text-center rounded-2xl" style={{ background: C.card }}>
        <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-bold" style={{ color: C.muted }}>No payroll data found</p>
      </div>
    )}
    {weeklyData.map(w => {
      const wG = Object.values(w.therapists).reduce((s, t) => s + t.gross, 0);
      const wA = Object.values(w.therapists).reduce((s, t) => s + t.adminRev, 0);
      const wS = Object.values(w.therapists).reduce((s, t) => s + t.salary, 0);
      const allReleased = Object.keys(w.therapists).every(tid => released[`${w.key}_${tid}`]);
      const isPastFriday = w.fridayStr <= today;

      return (<div key={w.key} className="rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.sh }}>
        {/* Week header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: `1px solid ${C.div}`, background: C.head }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: allReleased ? "rgba(139,92,246,0.15)" : "rgba(245,158,11,0.15)" }}>
              <Calendar className="w-5 h-5" style={{ color: allReleased ? "#8b5cf6" : "#d97706" }} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>Week of</p>
              <p className="font-black text-sm" style={{ color: C.txt }}>{w.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: isFriday(w.fridayStr) && w.fridayStr === today ? "#8b5cf6" : C.muted }}>
                {isPastFriday ? "Payout date: " + fmtDate(w.fridayStr) : "Upcoming payout: " + fmtDate(w.fridayStr)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>Gross</p>
              <p className="text-sm font-black" style={{ color: C.txt }}>{peso(wG)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>Admin (60%)</p>
              <p className="text-sm font-black text-emerald-500">{peso(wA)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>Salaries (40%)</p>
              <p className="text-sm font-black" style={{ color: "#d97706" }}>{peso(wS)}</p>
            </div>
            {allReleased && (
              <span className="px-3 py-1.5 rounded-xl text-[10px] font-black"
                style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>All Released</span>
            )}
          </div>
        </div>

        {/* Therapist rows */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <THead cols={["Therapist", "Specialization", "Sessions", "Gross Remitted", "Admin (60%)", "Salary (40%)", "Status", "Action"]} C={C} />
            <tbody>
              {Object.entries(w.therapists).map(([tidStr, data], ri) => {
                const t = THERAPISTS.find(x => x.id === Number(tidStr));
                const rk = `${w.key}_${tidStr}`;
                const isR = !!released[rk];
                const canRelease = isPastFriday || todayIsFriday;
                return (<tr key={tidStr} className="transition-all"
                  style={{ borderTop: ri === 0 ? "none" : `1px solid ${C.div}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.inner}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <Av t={t} size={36} />
                      <div><p className="text-xs font-bold" style={{ color: C.txt }}>{t?.name}</p>
                        <p className="text-[10px]" style={{ color: C.muted }}>{t?.specialty}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs" style={{ color: C.sec }}>{t?.specialty}</td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                      {data.sessions} {data.sessions === 1 ? "session" : "sessions"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-black" style={{ color: C.txt }}>{peso(data.gross)}</td>
                  <td className="px-4 py-4 text-xs font-black text-emerald-500">{peso(data.adminRev)}</td>
                  <td className="px-4 py-4">
                    <p className="text-base font-black" style={{ color: "#d97706" }}>{peso(data.salary)}</p>
                  </td>
                  <td className="px-4 py-4"><Badge status={isR ? "released" : "pending"} /></td>
                  <td className="px-4 py-4">
                    {isR ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                        style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                        <Check className="w-3 h-3" />Released
                      </span>
                    ) : canRelease ? (
                      <button onClick={() => doRelease(rk, t?.name, data.salary)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white shadow-lg hover:opacity-90 transition-all"
                        style={{ background: "linear-gradient(135deg,#8b5cf6,#4338ca)" }}>
                        <Banknote className="w-3.5 h-3.5" />Release Salary
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                        style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}>
                        <Clock className="w-3 h-3" />Awaiting Friday
                      </span>
                    )}
                  </td>
                </tr>);
              })}
            </tbody>
            <tfoot><tr style={{ borderTop: `2px solid ${C.div}`, background: C.head }}>
              <td colSpan={3} className="px-4 py-3 text-xs font-black" style={{ color: C.muted }}>WEEK TOTAL</td>
              <td className="px-4 py-3 text-sm font-black" style={{ color: C.txt }}>{peso(wG)}</td>
              <td className="px-4 py-3 text-sm font-black text-emerald-500">{peso(wA)}</td>
              <td className="px-4 py-3 text-base font-black" style={{ color: "#d97706" }}>{peso(wS)}</td>
              <td colSpan={2} />
            </tr></tfoot>
          </table>
        </div>
      </div>);
    })}
  </div>);
}


/* ============================================================
   TAB 3 — DAILY REMITTANCE
============================================================ */
function TabRemittance() {
  const C = useC();
  const [remitted, setRemitted] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const done = BOOKINGS.filter(b => b.st === "completed");

  const byDate = useMemo(() => {
    const map = {};
    done.forEach(b => {
      if (dateFrom && b.date < dateFrom) return;
      if (dateTo && b.date > dateTo) return;
      if (!map[b.date]) map[b.date] = {};
      if (!map[b.date][b.tid]) map[b.date][b.tid] = { rows: [], gross: 0, adminEarn: 0, thrEarn: 0 };
      map[b.date][b.tid].rows.push(b);
      map[b.date][b.tid].gross += b.amt;
      map[b.date][b.tid].adminEarn += b.adminEarning;
      map[b.date][b.tid].thrEarn += b.therapistEarning;
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [done, dateFrom, dateTo]);

  const tot = {
    gross: done.reduce((s, b) => s + b.amt, 0),
    admin: done.reduce((s, b) => s + b.adminEarning, 0),
    thr: done.reduce((s, b) => s + b.therapistEarning, 0),
  };

  const allCount = byDate.reduce((s, [, tm]) => s + Object.keys(tm).length, 0);
  const remittedCount = Object.values(remitted).filter(Boolean).length;

  const doMarkRemitted = (rk, name, gross) => setConfirm({
    rk,
    title: "Confirm Remittance",
    message: `${name} has remitted ${peso(gross)} for the day. Mark as received?`,
  });

  return (<div className="space-y-4">
    {confirm && <ConfirmModal title={confirm.title} message={confirm.message}
      onConfirm={() => { setRemitted(p => ({ ...p, [confirm.rk]: true })); setConfirm(null); }}
      onCancel={() => setConfirm(null)} confirmLabel="Mark Remitted" C={C} />}

    {/* KPI strip */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { l: "Total Gross", v: peso(tot.gross), c: "#3b82f6", bg: "rgba(59,130,246,0.1)", ic: BarChart3 },
        { l: "Admin Revenue (60%)", v: peso(tot.admin), c: "#059669", bg: "rgba(5,150,105,0.1)", ic: Wallet },
        { l: "Therapist Earnings (40%)", v: peso(tot.thr), c: "#d97706", bg: "rgba(217,119,6,0.1)", ic: Banknote },
      ].map(k => (
        <div key={k.l} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl" style={{ background: C.card, boxShadow: C.sh }}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: C.muted }}>{k.l}</p>
            <p className="text-xl font-black" style={{ color: k.c }}>{k.v}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: k.bg }}>
            <k.ic className="w-5 h-5" style={{ color: k.c }} />
          </div>
        </div>
      ))}
    </div>

    {/* Progress */}
    <div className="p-4 rounded-2xl" style={{ background: C.card, boxShadow: C.sh }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-black" style={{ color: C.txt }}>Remittance Progress Today</p>
        <p className="text-xs font-black" style={{ color: remittedCount === allCount && allCount > 0 ? "#059669" : "#d97706" }}>
          {remittedCount}/{allCount} received
        </p>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.inner }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${allCount ? Math.round((remittedCount / allCount) * 100) : 0}%`,
            background: "linear-gradient(90deg,#059669,#0ea5e9)"
          }} />
      </div>
      <p className="text-[10px] mt-2" style={{ color: C.muted }}>
        Therapists remit the full booking amount daily. Admin logs each receipt here.
      </p>
    </div>

    <PolicyCard text="Each therapist hands over the FULL collection to admin daily. Admin records the remittance here, then computes and releases 40% as weekly salary every Friday." />

    {/* Date filter */}
    <div className="p-4 rounded-2xl" style={{ background: C.card, boxShadow: C.sh }}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.muted }}>
          <Filter className="w-3 h-3 inline mr-1" />Date range:
        </label>
        <DatePickerInput value={dateFrom} onChange={setDateFrom} placeholder="mm/dd/yyyy" isDark={C.dk} />
        <span className="text-xs" style={{ color: C.muted }}>to</span>
        <DatePickerInput value={dateTo} onChange={setDateTo} placeholder="mm/dd/yyyy" isDark={C.dk} />
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-bold hover:opacity-80"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          <RefreshCw className="w-3 h-3" />Reset
        </button>}
      </div>
    </div>

    {/* Accordion */}
    <div className="space-y-3">
      {byDate.length === 0 && (
        <div className="py-16 text-center rounded-2xl" style={{ background: C.card }}>
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold" style={{ color: C.muted }}>No remittance records found</p>
        </div>
      )}
      {byDate.map(([date, tMap]) => {
        const dayG = Object.values(tMap).reduce((s, t) => s + t.gross, 0);
        const dayA = Object.values(tMap).reduce((s, t) => s + t.adminEarn, 0);
        const dayT = Object.values(tMap).reduce((s, t) => s + t.thrEarn, 0);
        const isOpen = expanded === date;
        const allDayRemitted = Object.keys(tMap).every(tid => remitted[`${date}_${tid}`]);
        const dow = new Date(date + "T00:00:00").getDay();
        const dayColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899"];

        return (<div key={date} className="rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.sh }}>
          <button onClick={() => setExpanded(isOpen ? null : date)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left hover:opacity-90 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-white text-sm"
                style={{ background: `${dayColors[dow]}22`, color: dayColors[dow], border: `2px solid ${dayColors[dow]}44` }}>
                {new Date(date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short" }).slice(0, 2)}
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: C.txt }}>{fmtDow(date)}</p>
                <p className="text-[10px] flex items-center gap-2" style={{ color: C.muted }}>
                  <span>{Object.keys(tMap).length} therapist(s)</span>
                  <span>•</span>
                  <span>{Object.values(tMap).reduce((s, t) => s + t.rows.length, 0)} bookings</span>
                  {allDayRemitted && <span className="text-emerald-500 font-bold">• All remitted</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>Day Gross</p>
                <p className="text-sm font-black" style={{ color: C.txt }}>{peso(dayG)}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>Admin (60%)</p>
                <p className="text-sm font-black text-emerald-500">{peso(dayA)}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>Therapist (40%)</p>
                <p className="text-sm font-black" style={{ color: "#d97706" }}>{peso(dayT)}</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
                : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />}
            </div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="px-3 sm:px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${C.div}`, paddingTop: 14 }}>
                  {Object.entries(tMap).map(([tidStr, data]) => {
                    const t = THERAPISTS.find(x => x.id === Number(tidStr));
                    const rk = `${date}_${tidStr}`; const isR = !!remitted[rk];
                    return (<div key={tidStr} className="rounded-2xl overflow-hidden border"
                      style={{
                        borderColor: isR ? "rgba(5,150,105,0.25)" : "rgba(255,255,255,0.06)",
                        background: isR ? "rgba(5,150,105,0.04)" : C.inner
                      }}>
                      <div className="flex flex-wrap items-center gap-3 p-4">
                        <Av t={t} size={40} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black" style={{ color: C.txt }}>{t?.name}</p>
                          <p className="text-[10px]" style={{ color: C.muted }}>{t?.specialty}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: C.muted }}>Gross Remitted</p>
                            <p className="text-sm font-black" style={{ color: C.txt }}>{peso(data.gross)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: C.muted }}>Admin (60%)</p>
                            <p className="text-sm font-black text-emerald-500">{peso(data.adminEarn)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: C.muted }}>Therapist (40%)</p>
                            <p className="text-sm font-black" style={{ color: "#d97706" }}>{peso(data.thrEarn)}</p>
                          </div>
                          {isR ? (
                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black"
                              style={{ background: "rgba(5,150,105,0.12)", color: "#059669" }}>
                              <Check className="w-3.5 h-3.5" />Remitted
                            </div>
                          ) : (
                            <button onClick={() => doMarkRemitted(rk, t?.name, data.gross)}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-lg hover:opacity-90 transition-all"
                              style={{ background: "linear-gradient(135deg,#059669,#0a5f3c)" }}>
                              <Check className="w-3.5 h-3.5" />Mark Remitted
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Booking breakdown */}
                      <div className="overflow-x-auto" style={{ borderTop: `1px solid ${C.div}` }}>
                        <table className="w-full min-w-[440px]">
                          <THead cols={["Service", "Booking Amt", "Admin (60%)", "Therapist (40%)"]} C={C} />
                          <tbody>
                            {data.rows.map((b, ri) => (
                              <tr key={b.id} className="transition-all"
                                style={{ borderTop: ri === 0 ? "none" : `1px solid ${C.div}` }}
                                onMouseEnter={e => e.currentTarget.style.background = C.head}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <td className="px-4 py-2.5 text-xs font-medium" style={{ color: C.sec }}>{b.svc}</td>
                                <td className="px-4 py-2.5 text-xs font-black" style={{ color: C.txt }}>{peso(b.amt)}</td>
                                <td className="px-4 py-2.5 text-xs font-black text-emerald-500">{peso(b.adminEarning)}</td>
                                <td className="px-4 py-2.5 text-xs font-black" style={{ color: "#d97706" }}>{peso(b.therapistEarning)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>);
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>);
      })}
    </div>
  </div>);
}


/* ============================================================
   TAB 4 — EXPENSE TRACKER
============================================================ */
const EXPENSE_CATS = ["Utilities", "Rent", "Supplies", "Equipment", "Salaries", "Maintenance", "Marketing", "Other"];
const INIT_EXPENSES = [
  { id: 1, desc: "Electricity Bill", cat: "Utilities", amt: 4850, date: "2026-08-01", status: "paid", notes: "August billing cycle" },
  { id: 2, desc: "Monthly Rent", cat: "Rent", amt: 25000, date: "2026-08-02", status: "paid", notes: "" },
  { id: 3, desc: "Essential Oils Restock", cat: "Supplies", amt: 3500, date: "2026-08-05", status: "paid", notes: "Lavender, eucalyptus" },
  { id: 4, desc: "Cleaning Supplies", cat: "Supplies", amt: 1200, date: "2026-08-10", status: "pending", notes: "" },
  { id: 5, desc: "Internet Bill", cat: "Utilities", amt: 2500, date: "2026-08-01", status: "paid", notes: "Fiber 100 Mbps" },
  { id: 6, desc: "Massage Table Repair", cat: "Maintenance", amt: 1800, date: "2026-08-08", status: "paid", notes: "Table no.3 hinge" },
];

function TabExpenses() {
  const C = useC();
  const [expenses, setExpenses] = useState(INIT_EXPENSES);
  const [adding, setAdding] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [form, setForm] = useState({ desc: "", cat: "Supplies", amt: "", date: new Date().toISOString().slice(0, 10), notes: "", status: "pending" });
  const [errors, setErrors] = useState({});
  const nextId = useCallback(() => Math.max(0, ...expenses.map(e => e.id)) + 1, [expenses]);

  const validate = () => {
    const e = {};
    if (!form.desc.trim()) e.desc = "Description is required";
    if (!form.amt || isNaN(Number(form.amt)) || Number(form.amt) <= 0) e.amt = "Enter a valid amount";
    if (!form.date) e.date = "Date is required";
    return e;
  };

  const handleSave = () => {
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    if (editItem) {
      setExpenses(p => p.map(e => e.id === editItem.id ? { ...e, ...form, amt: Number(form.amt) } : e));
      setEditItem(null);
    } else {
      setExpenses(p => [{ ...form, id: nextId(), amt: Number(form.amt) }, ...p]);
      setAdding(false);
    }
    setForm({ desc: "", cat: "Supplies", amt: "", date: new Date().toISOString().slice(0, 10), notes: "", status: "pending" });
    setErrors({});
  };

  const openEdit = (item) => {
    setEditItem(item); setAdding(false);
    setForm({ desc: item.desc, cat: item.cat, amt: String(item.amt), date: item.date, notes: item.notes || "", status: item.status });
    setErrors({});
  };

  const doDelete = (id) => setConfirm({ id, title: "Delete Expense", message: "Delete this expense record? This cannot be undone.", variant: "danger" });
  const confirmDelete = () => { setExpenses(p => p.filter(e => e.id !== confirm.id)); setConfirm(null); };

  const togglePaid = (id) => setExpenses(p => p.map(e => e.id === id ? { ...e, status: e.status === "paid" ? "pending" : "paid" } : e));

  const filtered = expenses.filter(e => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (catFilter && e.cat !== catFilter) return false;
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    if (search && !e.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totPaid = expenses.filter(e => e.status === "paid").reduce((s, e) => s + e.amt, 0);
  const totPend = expenses.filter(e => e.status === "pending").reduce((s, e) => s + e.amt, 0);
  const totAll = totPaid + totPend;

  const is = (err) => ({
    background: C.ibg, border: `1.5px solid ${err ? '#f87171' : C.ibdr}`, color: C.txt,
    boxShadow: err ? "0 0 0 3px rgba(248,113,113,0.1)" : "none"
  });

  const cancelForm = () => {
    setAdding(false); setEditItem(null); setErrors({});
    setForm({ desc: "", cat: "Supplies", amt: "", date: new Date().toISOString().slice(0, 10), notes: "", status: "pending" });
  };

  const handleExport = () => exportCSV(
    ["Date", "Description", "Category", "Amount", "Status", "Notes"],
    filtered.map(e => [e.date, e.desc, e.cat, e.amt, e.status, e.notes || ""])
    , "expenses.csv");

  return (<div className="space-y-4">
    {confirm && (confirm.variant === "danger" ? (
      <ConfirmModal title={confirm.title} message={confirm.message}
        onConfirm={confirmDelete} onCancel={() => setConfirm(null)}
        confirmLabel="Delete" variant="danger" C={C} />
    ) : null)}

    {/* KPI */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { l: "Total Expenses", v: peso(totAll), c: "#6366f1", bg: "rgba(99,102,241,0.1)", ic: Receipt },
        { l: "Paid", v: peso(totPaid), c: "#059669", bg: "rgba(5,150,105,0.1)", ic: CheckCircle2 },
        { l: "Pending", v: peso(totPend), c: "#d97706", bg: "rgba(217,119,6,0.1)", ic: Clock },
        { l: "This Month", v: expenses.length + " entries", c: "#3b82f6", bg: "rgba(59,130,246,0.1)", ic: FileText },
      ].map(k => (
        <div key={k.l} className="p-4 rounded-2xl" style={{ background: C.card, boxShadow: C.sh }}>
          <div className="flex items-start justify-between gap-1 mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest leading-tight" style={{ color: C.muted }}>{k.l}</p>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.bg }}>
              <k.ic className="w-4 h-4" style={{ color: k.c }} />
            </div>
          </div>
          <p className="text-lg font-black" style={{ color: k.c }}>{k.v}</p>
          {k.l === "Total Expenses" && totAll > 0 && (
            <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.inner }}>
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((totPaid / totAll) * 100)}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Actions bar */}
    <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl"
      style={{ background: C.card, boxShadow: C.sh }}>
      <div className="flex gap-1.5">
        {["all", "paid", "pending"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-black capitalize transition-all"
            style={statusFilter === s ? { background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff" } : { background: C.inner, color: C.sec }}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black hover:opacity-80 transition-all"
          style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
          <Download className="w-3.5 h-3.5" />Export
        </button>
        {!editItem && (
          <button onClick={() => { setAdding(p => !p); setEditItem(null); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-black text-white shadow-md hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}>
            {adding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {adding ? "Cancel" : "Add Expense"}
          </button>
        )}
      </div>
    </div>

    {/* Filters */}
    <div className="p-4 rounded-2xl space-y-2.5" style={{ background: C.card, boxShadow: C.sh }}>
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: C.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..."
            className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl outline-none font-medium"
            style={{ background: C.ibg, border: `1.5px solid ${C.ibdr}`, color: C.txt }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2.5 text-xs rounded-xl outline-none font-bold cursor-pointer"
          style={{ background: C.ibg, border: `1.5px solid ${C.ibdr}`, color: C.txt }}>
          <option value="" style={{ background: C.card, color: C.txt }}>All Categories</option>
          {EXPENSE_CATS.map(c => <option key={c} value={c} style={{ background: C.card, color: C.txt }}>{c}</option>)}
        </select>
        <DatePickerInput value={dateFrom} onChange={setDateFrom} placeholder="mm/dd/yyyy" isDark={C.dk} />
        <DatePickerInput value={dateTo} onChange={setDateTo} placeholder="mm/dd/yyyy" isDark={C.dk} />
        {(search || catFilter || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(""); setCatFilter(""); setDateFrom(""); setDateTo(""); }}
            className="flex items-center gap-1 px-2.5 py-2.5 rounded-xl text-[10px] font-bold hover:opacity-80"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            <RefreshCw className="w-3 h-3" />Clear
          </button>
        )}
      </div>
    </div>

    {/* Add / Edit form */}
    <AnimatePresence>
      {(adding || editItem) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="p-5 rounded-2xl space-y-4" style={{
            background: C.card, boxShadow: C.sh,
            border: `2px solid ${editItem ? "rgba(59,130,246,0.3)" : "rgba(99,102,241,0.3)"}`
          }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-black" style={{ color: C.txt }}>
              {editItem ? "Edit Expense" : "Add New Expense"}
            </p>
            <button onClick={cancelForm} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
              style={{ background: C.inner, color: C.sec }}><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Description {errors.desc && <span className="text-red-400 normal-case font-medium">— {errors.desc}</span>}
              </label>
              <input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
                placeholder="e.g. Massage oil restock"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                style={is(errors.desc)} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Category</label>
              <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-bold cursor-pointer" style={is(false)}>
                {EXPENSE_CATS.map(c => <option key={c} value={c} style={{ background: C.card, color: C.txt }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Amount (PHP) {errors.amt && <span className="text-red-400 normal-case font-medium">— {errors.amt}</span>}
              </label>
              <input type="number" value={form.amt} onChange={e => setForm({ ...form, amt: e.target.value })}
                placeholder="0.00" min={1}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium transition-all"
                style={is(errors.amt)} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Date {errors.date && <span className="text-red-400 normal-case font-medium">— {errors.date}</span>}
              </label>
              <DatePickerInput value={form.date} onChange={d => setForm({ ...form, date: d })} placeholder="mm/dd/yyyy" isDark={C.dk} className="w-full" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-bold cursor-pointer" style={is(false)}>
                <option value="pending" style={{ background: C.card, color: C.txt }}>Pending</option>
                <option value="paid" style={{ background: C.card, color: C.txt }}>Paid</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Notes (optional)</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional details..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-medium"
                style={is(false)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={cancelForm} className="px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-80 transition-all"
              style={{ background: C.inner, color: C.sec }}>Cancel</button>
            <button onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-lg hover:opacity-90 transition-all"
              style={{ background: editItem ? "linear-gradient(135deg,#3b82f6,#1d4ed8)" : "linear-gradient(135deg,#6366f1,#4338ca)" }}>
              {editItem ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Table */}
    <div className="rounded-2xl overflow-hidden" style={{ background: C.card, boxShadow: C.sh }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <THead cols={["Date", "Description", "Category", "Amount", "Status", "Notes", "Actions"]} C={C} />
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Receipt className="w-10 h-10 text-slate-600" />
                  <p className="text-sm font-bold" style={{ color: C.muted }}>No expenses match your filters</p>
                </div>
              </td></tr>
            )}
            {filtered.map((e, i) => (
              <tr key={e.id} className="transition-all group"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${C.div}` }}
                onMouseEnter={ev => ev.currentTarget.style.background = C.inner}
                onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: C.sec }}>{fmtDate(e.date)}</td>
                <td className="px-4 py-3.5 text-xs font-bold" style={{ color: C.txt }}>{e.desc}</td>
                <td className="px-4 py-3.5">
                  <span className="text-[10px] font-black px-2 py-1 rounded-lg" style={{ background: C.head, color: C.sec }}>{e.cat}</span>
                </td>
                <td className="px-4 py-3.5 text-sm font-black text-red-400">{peso(e.amt)}</td>
                <td className="px-4 py-3.5">
                  <button onClick={() => togglePaid(e.id)} title="Click to toggle status">
                    <Badge status={e.status} />
                  </button>
                </td>
                <td className="px-4 py-3.5 text-xs" style={{ color: C.muted }}>{e.notes || "—"}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(e)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }} title="Edit">
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => doDelete(e.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }} title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot><tr style={{ borderTop: `2px solid ${C.div}`, background: C.head }}>
              <td colSpan={3} className="px-4 py-3 text-xs font-black" style={{ color: C.muted }}>
                TOTALS ({filtered.length} entries)
              </td>
              <td className="px-4 py-3 text-sm font-black text-red-400">
                {peso(filtered.reduce((s, e) => s + e.amt, 0))}
              </td>
              <td colSpan={3} />
            </tr></tfoot>
          )}
        </table>
      </div>
    </div>
  </div>);
}

/* ============================================================
   ROOT EXPORT
============================================================ */
export default function AdminPayments() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "sales";
  const C = useC();

  const tabs = {
    sales: { label: "Daily Sales Logs", component: <TabSales /> },
    payroll: { label: "Weekly Payroll (40%)", component: <TabPayroll /> },
    remittance: { label: "Daily Remittance", component: <TabRemittance /> },
    expenses: { label: "Expense Tracker", component: <TabExpenses /> },
  };

  return (
    <AdminLayout title="Financials" subtitle={tabs[activeTab]?.label || "Daily Sales Logs"} icon={CreditCard}>
      <style>{`
        select option{background:#0f1929!important;color:#e8f0fe!important;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.6);}
      `}</style>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18 }}>
          {tabs[activeTab]?.component || <TabSales />}
        </motion.div>
      </AnimatePresence>
    </AdminLayout>
  );
}
