import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { useTheme } from "../../context/ThemeContext";
import {
  CreditCard, TrendingUp, DollarSign, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Calendar, Check, X, Receipt,
  Banknote, Wallet, BarChart3, Search, Filter, Download,
  AlertTriangle, RefreshCw, Users, ArrowUpRight, ArrowDownRight,
  FileText, Trash2, Plus, Eye, EyeOff, Info,
} from "lucide-react";

/* ============================================================
   BUSINESS CONSTANTS — 60 / 40 SPLIT POLICY
   - Therapist remits FULL booking amount to admin DAILY
   - Admin releases 40% salary to therapist every FRIDAY
   - Admin retains 60% as business revenue
============================================================ */
const ADMIN_PCT     = 0.60;
const THERAPIST_PCT = 0.40;

const THERAPISTS = [
  { id:1, name:"Anna Reyes",      specialty:"Swedish & Hot Stone",   initials:"AR", grad:"linear-gradient(135deg,#78350f,#d97706)" },
  { id:2, name:"Leo Garcia",      specialty:"Deep Tissue & Sports",  initials:"LG", grad:"linear-gradient(135deg,#1e3a8a,#2563eb)" },
  { id:3, name:"Grace Tan",       specialty:"Hilot & Shiatsu",       initials:"GT", grad:"linear-gradient(135deg,#4338ca,#6366f1)" },
  { id:4, name:"Mark Villanueva", specialty:"Aromatherapy & Lomi",   initials:"MV", grad:"linear-gradient(135deg,#065f46,#059669)" },
];

const RAW_BOOKINGS = [
  {id:101,date:"2026-08-04",tid:1,svc:"Swedish Massage 60min",amt:850, st:"completed"},
  {id:102,date:"2026-08-04",tid:1,svc:"Hot Stone Therapy 90min",amt:1200,st:"completed"},
  {id:103,date:"2026-08-04",tid:2,svc:"Deep Tissue 60min",amt:900,st:"completed"},
  {id:104,date:"2026-08-05",tid:1,svc:"Swedish Massage 60min",amt:850,st:"completed"},
  {id:105,date:"2026-08-05",tid:3,svc:"Hilot Massage",amt:750,st:"completed"},
  {id:106,date:"2026-08-06",tid:2,svc:"Sports Massage 90min",amt:1100,st:"completed"},
  {id:107,date:"2026-08-06",tid:4,svc:"Aromatherapy 60min",amt:800,st:"completed"},
  {id:108,date:"2026-08-07",tid:1,svc:"Couple Massage",amt:1800,st:"completed"},
  {id:109,date:"2026-08-07",tid:3,svc:"Lomi-Lomi Massage",amt:950,st:"completed"},
  {id:110,date:"2026-08-08",tid:4,svc:"Aromatherapy 90min",amt:1000,st:"completed"},
  {id:111,date:"2026-08-08",tid:2,svc:"Deep Tissue 90min",amt:1250,st:"completed"},
  {id:201,date:"2026-08-11",tid:1,svc:"Swedish Massage 60min",amt:850,st:"completed"},
  {id:202,date:"2026-08-11",tid:2,svc:"Deep Tissue 60min",amt:900,st:"completed"},
  {id:203,date:"2026-08-12",tid:3,svc:"Hilot Massage",amt:750,st:"completed"},
  {id:204,date:"2026-08-12",tid:1,svc:"Hot Stone Therapy 90min",amt:1200,st:"completed"},
  {id:205,date:"2026-08-13",tid:4,svc:"Aromatherapy 60min",amt:800,st:"pending"},
  {id:206,date:"2026-08-13",tid:2,svc:"Sports Massage 90min",amt:1100,st:"pending"},
];

function enrich(b){
  return{...b,adminEarning:Math.round(b.amt*ADMIN_PCT),therapistEarning:Math.round(b.amt*THERAPIST_PCT)};
}
const BOOKINGS = RAW_BOOKINGS.map(enrich);

function getWeekBounds(dateStr){
  const d=new Date(dateStr+"T00:00:00"),day=d.getDay();
  const mon=new Date(d); mon.setDate(d.getDate()-day+(day===0?-6:1));
  const fri=new Date(mon); fri.setDate(mon.getDate()+4);
  const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  const fmt=(dt,o={month:"short",day:"numeric"})=>dt.toLocaleDateString("en-PH",o);
  return{
    key:mon.toISOString().slice(0,10),
    mon,fri,sun,
    label:`${fmt(mon)} – ${fmt(fri,{month:"short",day:"numeric",year:"numeric"})}`,
    fridayStr:fri.toISOString().slice(0,10),
  };
}

function isFriday(dateStr){
  return new Date(dateStr+"T00:00:00").getDay()===5;
}

/* ============================================================  THEME  */
function useC(){
  const{theme}=useTheme();const dk=theme==="dark";
  return{dk,
    page:   dk?"#080f1e":"#f0f4f8",
    card:   dk?"#0f1929":"#ffffff",
    card2:  dk?"#0d1626":"#f8fafc",
    inner:  dk?"#0a1120":"#f1f5f9",
    txt:    dk?"#e8f0fe":"#0f172a",
    sec:    dk?"#7899c0":"#475569",
    muted:  dk?"#3d566e":"#94a3b8",
    div:    dk?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",
    head:   dk?"#0a1322":"#f1f5f9",
    sh:     dk?"0 4px 32px rgba(0,0,0,0.5)":"0 2px 20px rgba(0,0,0,0.07)",
    ibg:    dk?"rgba(255,255,255,0.04)":"#ffffff",
    ibdr:   dk?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.12)",
  };
}

/* ============================================================  ATOMS  */
const peso=n=>`\u20b1${Number(n).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtDate=ds=>new Date(ds+"T00:00:00").toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"});
const fmtDow=ds=>new Date(ds+"T00:00:00").toLocaleDateString("en-PH",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

function Av({t,size=36}){
  return(<div className="flex-shrink-0 flex items-center justify-center font-black text-white shadow"
    style={{width:size,height:size,borderRadius:"50%",fontSize:size*0.35,background:t?.grad||"#334155"}}>
    {t?.initials||"?"}
  </div>);
}

function Badge({status}){
  const map={
    completed:{bg:"rgba(16,185,129,0.12)",c:"#059669",ic:Check,lbl:"Completed"},
    remitted: {bg:"rgba(59,130,246,0.12)", c:"#3b82f6",ic:Check,lbl:"Remitted"},
    pending:  {bg:"rgba(245,158,11,0.12)", c:"#d97706",ic:Clock,lbl:"Pending"},
    released: {bg:"rgba(139,92,246,0.12)", c:"#8b5cf6",ic:Check,lbl:"Released"},
    paid:     {bg:"rgba(16,185,129,0.12)", c:"#059669",ic:Check,lbl:"Paid"},
    overdue:  {bg:"rgba(239,68,68,0.12)",  c:"#ef4444",ic:AlertTriangle,lbl:"Overdue"},
  };
  const s=map[status]||map.pending;const Ic=s.ic;
  return(<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
    style={{background:s.bg,color:s.c}}>
    <Ic className="w-3 h-3"/>{s.lbl}
  </span>);
}

function SplitBar({admin,therapist}){
  const total=admin+therapist;if(!total)return null;
  const ap=Math.round((admin/total)*100);
  return(<div className="flex items-center gap-2 w-full">
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
      <div className="h-full rounded-full" style={{width:`${ap}%`,background:"linear-gradient(90deg,#059669,#0ea5e9)"}}/>
    </div>
    <span className="text-[9px] font-black text-slate-400 whitespace-nowrap">{ap}%A / {100-ap}%T</span>
  </div>);
}

function ConfirmModal({title,message,onConfirm,onCancel,confirmLabel="Confirm",variant="success",C}){
  const colors={success:{bg:"rgba(5,150,105,0.1)",c:"#059669",grad:"linear-gradient(135deg,#059669,#0a5f3c)"},
    danger:{bg:"rgba(239,68,68,0.1)",c:"#ef4444",grad:"linear-gradient(135deg,#ef4444,#b91c1c)"}};
  const col=colors[variant]||colors.success;
  return(<AnimatePresence><motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}>
    <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,y:20}}
      className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{background:C.card}}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:col.bg}}>
        <AlertTriangle className="w-6 h-6" style={{color:col.c}}/>
      </div>
      <h3 className="text-center font-black text-base mb-2" style={{color:C.txt}}>{title}</h3>
      <p className="text-center text-xs mb-6" style={{color:C.sec}}>{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-xs font-bold transition-all hover:opacity-80"
          style={{background:C.inner,color:C.sec}}>Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-xs font-black text-white shadow-lg transition-all hover:opacity-90"
          style={{background:col.grad}}>{confirmLabel}</button>
      </div>
    </motion.div>
  </motion.div></AnimatePresence>);
}

function PolicyCard({text,color="#059669",bg="rgba(5,150,105,0.08)",bdr="rgba(5,150,105,0.2)",Icon=Info}){
  return(<div className="flex items-start gap-3 p-4 rounded-2xl text-xs"
    style={{background:bg,border:`1px solid ${bdr}`}}>
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{background:`${color}22`}}>
      <Icon className="w-4 h-4" style={{color}}/>
    </div>
    <div><p className="font-black mb-1" style={{color}}>Business Policy</p>
      <p style={{color:"#7899c0"}}>{text}</p>
    </div>
  </div>);
}

function FilterBar({search,setSearch,dateFrom,setDateFrom,dateTo,setDateTo,therapistId,setTherapistId,C,showTherapist=true}){
  const is={background:C.ibg,border:`1.5px solid ${C.ibdr}`,color:C.txt};
  return(<div className="flex flex-wrap gap-2">
    <div className="relative flex-1 min-w-[160px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:C.muted}}/>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
        className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl outline-none font-medium"
        style={is}/>
      {search&&<button onClick={()=>setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
        <X className="w-3 h-3 text-slate-400"/></button>}
    </div>
    <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
      className="px-3 py-2.5 text-xs rounded-xl outline-none font-medium" style={is}/>
    <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
      className="px-3 py-2.5 text-xs rounded-xl outline-none font-medium" style={is}/>
    {showTherapist&&<select value={therapistId} onChange={e=>setTherapistId(e.target.value)}
      className="px-3 py-2.5 text-xs rounded-xl outline-none font-bold cursor-pointer" style={is}>
      <option value="">All Therapists</option>
      {THERAPISTS.map(t=><option key={t.id} value={t.id} style={{background:C.card,color:C.txt}}>{t.name}</option>)}
    </select>}
    {(search||dateFrom||dateTo||therapistId)&&
      <button onClick={()=>{setSearch("");setDateFrom("");setDateTo("");setTherapistId&&setTherapistId("");}}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold hover:opacity-80 transition-all"
        style={{background:"rgba(239,68,68,0.1)",color:"#ef4444"}}>
        <RefreshCw className="w-3.5 h-3.5"/>Clear
      </button>}
  </div>);
}

function THead({cols,C}){return(
  <thead><tr style={{background:C.head}}>
    {cols.map(c=><th key={c} className="px-4 py-3.5 text-left text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
      style={{color:C.muted}}>{c}</th>)}
  </tr></thead>
);}

function exportCSV(headers,rows,filename){
  const csv=[headers.join(","),...rows.map(r=>r.map(v=>`"${v}"`).join(","))].join("\n");
  const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
  a.download=filename;a.click();
}

