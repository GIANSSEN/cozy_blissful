import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { SkeletonStatsRow, SkeletonSessionFeed } from '../../components/Skeleton';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import API from '../../api/axios';
import * as XLSX from 'xlsx';
import {
  Archive, Calendar, Clock, CheckCircle, XCircle,
  Mail, FileText, Eye, Search, X, Download, Upload,
  CalendarCheck, FileSpreadsheet, Info, Zap,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────── */
/*  HELPERS & STYLING MAPS                                              */
/* ─────────────────────────────────────────────────────────────────── */

const getStatusStyle = (status, isDark = false) => {
  switch (status) {
    case 'Completed':
      return {
        bg: isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.12)',
        color: isDark ? '#a5b4fc' : '#4338ca',
        border: isDark ? 'rgba(165, 180, 252, 0.4)' : 'rgba(67, 56, 202, 0.3)',
        dot: isDark ? '#a5b4fc' : '#4f46e5'
      };
    case 'Cancelled':
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.12)',
        color: isDark ? '#f87171' : '#b91c1c',
        border: isDark ? 'rgba(248, 113, 113, 0.4)' : 'rgba(185, 28, 28, 0.3)',
        dot: isDark ? '#f87171' : '#dc2626'
      };
    default:
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(100, 116, 139, 0.12)',
        color: isDark ? '#cbd5e1' : '#334155',
        border: isDark ? 'rgba(203, 213, 225, 0.4)' : 'rgba(51, 65, 85, 0.3)',
        dot: isDark ? '#cbd5e1' : '#64748b'
      };
  }
};

const fmt12 = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  return isNaN(d.getTime()) ? String(dt) : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  return isNaN(d.getTime()) ? String(dt) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const PAGE_SIZE = 12;

/* ─────────────────────────────────────────────────────────────────── */
/*  READ-ONLY DETAIL MODAL — responsive, accessible, scroll-locked      */
/* ─────────────────────────────────────────────────────────────────── */

const HistoryDetailModal = ({ record, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ss = getStatusStyle(record.status, isDark);
  const panelRef = useRef(null);

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    modalBg:       isDark ? '#141927' : '#ffffff',
    cardBg:        isDark ? '#0f1420' : '#f8fafc',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    noteBg:        isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,252,232,1)',
    noteBorder:    isDark ? 'rgba(245,158,11,0.2)' : 'rgba(253,230,138,1)',
  };

  const isCancelled = record.status === 'Cancelled';

  /* Scroll-lock + Escape + initial focus + focus return */
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => panelRef.current?.focus(), 60);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [onClose]);

  const wrap = { overflowWrap: 'break-word', wordBreak: 'break-word' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 overflow-y-auto"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        aria-describedby="history-modal-meta"
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full sm:max-w-[512px] my-auto outline-none"
        style={{
          background: C.modalBg, border: `1px solid ${C.cardBorder}`,
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          maxHeight: 'calc(100dvh - 1rem)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          background: isCancelled
            ? 'linear-gradient(135deg,#450a0a,#7f1d1d)'
            : 'linear-gradient(135deg,#1e1b4b,#312e81)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 14, flexShrink: 0,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Archive size={20} aria-hidden="true" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c7d2fe' }}>
                  Session Archive — Read Only
                </span>
                <h3 id="history-modal-title" style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '4px 0 0', ...wrap }}>
                  {record.service}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close details"
              className="shrink-0 flex items-center justify-center rounded-xl"
              style={{
                minWidth: 44, minHeight: 44, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: '#ffffff', cursor: 'pointer',
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div id="history-modal-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e0e7ff', display: 'flex', alignItems: 'center', gap: 6, ...wrap }}>
              <Calendar size={14} aria-hidden="true" /> {fmtDate(record.datetime) || '—'} at {fmt12(record.datetime) || '—'}
            </span>
            {record.service_duration && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#c7d2fe',
                background: 'rgba(255,255,255,0.1)', padding: '6px 10px', minHeight: 28,
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Clock size={12} aria-hidden="true" /> {record.service_duration} min
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '6px 12px', minHeight: 28, borderRadius: 999,
              background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
              display: 'inline-flex', alignItems: 'center',
            }}>
              {record.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="cb-scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <div style={{
            padding: 16, borderRadius: 16, background: C.cardBg,
            border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Client</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0, ...wrap }}>{record.client_name || record.client}</p>
            {record.client_email && (
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, display: 'flex', alignItems: 'flex-start', gap: 6, margin: '2px 0 0', ...wrap }}>
                <Mail size={14} aria-hidden="true" style={{ color: '#059669', flexShrink: 0, marginTop: 1 }} />
                <span style={{ minWidth: 0 }}>{record.client_email}</span>
              </p>
            )}
          </div>

          <div style={{
            padding: 16, borderRadius: 16, background: C.cardBg,
            border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Assigned Practitioner</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0, ...wrap }}>{record.therapist_name || 'Unassigned'}</p>
            {record.service_price && (
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0', ...wrap }}>
                <Zap size={13} aria-hidden="true" style={{ color: '#f59e0b', flexShrink: 0 }} /> Session Fee: ₱{record.service_price}
              </p>
            )}
          </div>

          {record.notes && (
            <div style={{ padding: 14, borderRadius: 16, background: C.noteBg, border: `1px solid ${C.noteBorder}` }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706', margin: 0 }}>Session Remarks</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '4px 0 0', lineHeight: 1.5, ...wrap }}>{record.notes}</p>
            </div>
          )}

          <div style={{
            padding: 12, borderRadius: 14, background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
            border: '1px dashed rgba(99,102,241,0.35)', display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <Info size={15} aria-hidden="true" style={{ color: '#6366f1', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: 0, ...wrap }}>
              Archived records are read-only and cannot be modified. Use Export to save a copy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px calc(12px + env(safe-area-inset-bottom))', borderTop: `1px solid ${C.cardBorder}`,
          background: C.cardBg, display: 'flex', flexShrink: 0,
        }}>
          <button
            type="button" onClick={onClose} aria-label="Close details"
            className="flex-1 rounded-[14px] text-xs font-black"
            style={{
              minHeight: 44, padding: '12px', border: `1px solid ${C.cardBorder}`,
              background: 'transparent', color: C.textSecondary, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  MAIN HISTORY PAGE — VIEW ONLY + EXCEL IMPORT / EXPORT               */
/*  Responsive: 320px → 480px → 768px → 1024px → 1440px → ultra-wide    */
/* ─────────────────────────────────────────────────────────────────── */

const AdminHistory = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const C = {
    textPrimary:   isDark ? '#e8ecf3' : '#0f172a',
    textSecondary: isDark ? '#c9d1e0' : '#1e293b',
    textMuted:     isDark ? '#94a3b8' : '#334155',
    cardBg:        isDark ? '#141927' : '#ffffff',
    cardBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    headerBg:      isDark ? '#1a2236' : '#e2e8f0',
    rowBorder:     isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
    pillBg:        isDark ? '#1e2a3a' : '#f1f5f9',
    pillBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)',
    inputBg:       isDark ? '#0f1420' : '#ffffff',
    rowHover:      isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
  };

  const [records, setRecords] = useState([]);
  const [imported, setImported] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Completed');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = 'History | Cozy Blissful Admin';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', 'View-only archive of completed and cancelled spa sessions with Excel import and export.');
    return () => { document.title = 'Admin | Cozy Blissful'; };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await API.get('/admin/appointments');
      const archived = (res.data?.recent_appointments || []).filter(
        (a) => a.status === 'Completed' || a.status === 'Cancelled'
      );
      setRecords(archived);
    } catch {
      setLoadError('Could not reach the archive server. Check your connection and try again.');
      toast.error?.('Failed to load history records from server');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  /* Reset pagination whenever the view changes */
  useEffect(() => { setPage(1); }, [search, statusFilter, records, imported]);

  /* Combined view: live archived records + session-only imported rows */
  const allRecords = useMemo(() => [
    ...records.map((r) => ({ ...r, imported: false })),
    ...imported.map((r, i) => ({ ...r, id: r.id ?? `imp-${i}`, imported: true })),
  ], [records, imported]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRecords.filter((a) => {
      const matchS = statusFilter === 'All' || a.status === statusFilter;
      const matchQ = !q ||
        (a.service || '').toLowerCase().includes(q) ||
        (a.client_name || a.client || '').toLowerCase().includes(q) ||
        (a.therapist_name || '').toLowerCase().includes(q) ||
        String(a.id).toLowerCase().includes(q);
      return matchS && matchQ;
    });
  }, [allRecords, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRecords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const completedCount = allRecords.filter((a) => a.status === 'Completed').length;
  const cancelledCount = allRecords.filter((a) => a.status === 'Cancelled').length;
  const revenue = allRecords
    .filter((a) => a.status === 'Completed')
    .reduce((sum, a) => sum + (parseFloat(a.service_price) || 0), 0);

  /* ── EXPORT TO EXCEL ── */
  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error?.('No records to export');
      return;
    }
    const rows = filtered.map((a) => ({
      'Booking ID': String(a.id).padStart(4, '0'),
      'Client': a.client_name || a.client || '',
      'Client Email': a.client_email || '',
      'Therapist': a.therapist_name || 'Unassigned',
      'Service': a.service || '',
      'Date': fmtDate(a.datetime),
      'Time': fmt12(a.datetime),
      'Duration (min)': a.service_duration || '',
      'Price (PHP)': a.service_price || '',
      'Status': a.status || '',
      'Remarks': a.notes || '',
      'Source': a.imported ? 'Imported' : 'System',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 10 }, { wch: 24 }, { wch: 28 }, { wch: 22 }, { wch: 26 },
      { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Session History');
    const stamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `CozyBlissful_History_${stamp}.xlsx`);
    toast.success?.(`Exported ${filtered.length} record${filtered.length !== 1 ? 's' : ''} to Excel`);
  };

  /* ── IMPORT FROM EXCEL (session view only — never writes to DB) ── */
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const pick = (row, ...keys) => {
          for (const k of keys) {
            const found = Object.keys(row).find((rk) => rk.toLowerCase().trim() === k.toLowerCase());
            if (found && String(row[found]).trim() !== '') return row[found];
          }
          return '';
        };
        const mapped = rows.map((row, i) => {
          const statusRaw = String(pick(row, 'Status', 'status')).toLowerCase();
          const status = statusRaw.includes('cancel') ? 'Cancelled'
            : statusRaw.includes('complete') || statusRaw === '' ? 'Completed' : statusRaw;
          return {
            id: pick(row, 'Booking ID', 'ID', 'id') || `imp-${Date.now()}-${i}`,
            client_name: pick(row, 'Client', 'Client Name', 'client'),
            client_email: pick(row, 'Client Email', 'email'),
            therapist_name: pick(row, 'Therapist') || 'Unassigned',
            service: pick(row, 'Service') || 'Imported Record',
            datetime: pick(row, 'Date', 'Datetime') || '',
            service_duration: parseInt(pick(row, 'Duration (min)', 'Duration'), 10) || null,
            service_price: parseFloat(String(pick(row, 'Price (PHP)', 'Price')).replace(/[^0-9.]/g, '')) || null,
            status: status.charAt(0).toUpperCase() + status.slice(1),
            notes: pick(row, 'Remarks', 'Notes'),
          };
        }).filter((r) => r.client_name || r.service);

        if (mapped.length === 0) {
          toast.error?.('No valid rows found — check the column headers');
        } else {
          setImported((prev) => [...prev, ...mapped]);
          toast.success?.(`Imported ${mapped.length} record${mapped.length !== 1 ? 's' : ''} (view only)`);
        }
      } catch {
        toast.error?.('Could not read file — use a valid .xlsx or .csv export');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleClearImported = () => {
    setImported([]);
    toast.success?.('Imported rows cleared');
  };

  const FILTERS = ['Completed', 'Cancelled', 'All'];

  const renderStatusBadge = (status) => {
    const ss = getStatusStyle(status, isDark);
    return (
      <span
        role="status"
        aria-label={`Status: ${status}`}
        style={{
          fontSize: 11, fontWeight: 800, padding: '6px 12px', minHeight: 28, borderRadius: 999,
          background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
          width: 'fit-content', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center',
        }}
      >
        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: ss.dot, marginRight: 6, flexShrink: 0 }} />
        {status}
      </span>
    );
  };

  return (
    <AdminLayout
      title="History"
      subtitle="Read-only archive of completed & cancelled sessions — with Excel import / export"
      icon={Archive}
    >
      <div className="space-y-4 sm:space-y-6 min-w-0">
        {/* ── Summary Metric Cards: 2-col mobile → 4-col md+ (pure CSS, no CLS) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3" role="region" aria-label="Archive summary">
          {[
            { label: 'Archived Sessions', value: allRecords.length, color: '#6366f1', accent: 'rgba(99,102,241,0.12)', Icon: Archive },
            { label: 'Completed',         value: completedCount,    color: '#059669', accent: 'rgba(5,150,105,0.12)', Icon: CheckCircle },
            { label: 'Cancelled',         value: cancelledCount,    color: '#dc2626', accent: 'rgba(239,68,68,0.12)', Icon: XCircle },
            { label: 'Revenue (₱)',       value: revenue.toLocaleString(), color: '#bfa15f', accent: 'rgba(191,161,95,0.15)', Icon: CalendarCheck },
          ].map(({ label, value, color, accent, Icon }) => (
            <div key={label} className="rounded-2xl lg:rounded-[20px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0" style={{
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div aria-hidden="true" className="w-9 h-9 sm:w-11 sm:h-11 rounded-[10px] sm:rounded-[14px] shrink-0 flex items-center justify-center" style={{
                background: accent, color,
              }}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide truncate" style={{
                  color: C.textMuted, lineHeight: 1.2,
                }} title={label}>{label}</p>
                <p className="text-xl sm:text-2xl font-black leading-none truncate tabular-nums" style={{ color, marginTop: 2 }} title={String(value)}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar: stacks on mobile, single row on lg ── */}
        <div className="rounded-[20px] p-3 sm:p-4 flex flex-col gap-3" style={{
          background: C.cardBg, border: `1px solid ${C.cardBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            {/* Search — 16px on mobile prevents iOS zoom, min 44px tall */}
            <div role="search" className="flex items-center gap-2.5 px-3.5 rounded-[14px] min-h-[44px] flex-1 w-full md:min-w-[220px]" style={{
              background: C.inputBg, border: `1px solid ${C.cardBorder}`,
            }}>
              <Search size={16} aria-hidden="true" style={{ color: C.textMuted, flexShrink: 0 }} />
              <label htmlFor="history-search" className="sr-only">Search archive by client, therapist, service or ID</label>
              <input
                id="history-search"
                type="search"
                placeholder="Search client, therapist, service, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-base md:text-xs font-semibold min-w-0"
                style={{ color: C.textPrimary }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{ minWidth: 44, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Status filter pills — 44px targets, aria-pressed */}
            <div role="group" aria-label="History status filter" className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map((f) => {
                const active = statusFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    aria-pressed={active}
                    className="rounded-xl text-[11px] font-extrabold whitespace-nowrap px-4"
                    style={{
                      minHeight: 44,
                      border: active ? '1px solid #6366f1' : `1px solid ${C.pillBorder}`,
                      background: active ? '#6366f1' : C.pillBg,
                      color: active ? '#fff' : C.textSecondary,
                      boxShadow: active ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
                      cursor: 'pointer',
                    }}
                  >{f}</button>
                );
              })}
            </div>
          </div>

          {/* Import / Export — full-width stacked on <380px, side-by-side above */}
          <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportFile}
              className="sr-only"
              aria-label="Import records from Excel file"
              tabIndex={-1}
            />
            <p className="sr-only" id="import-hint">Import is view-only. Nothing is written to the database.</p>
            <div className="flex flex-col min-[420px]:flex-row gap-2 min-[420px]:ml-auto w-full min-[420px]:w-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-describedby="import-hint"
                title="Import records from an Excel file (view only — nothing is written to the database)"
                className="flex items-center justify-center gap-1.5 rounded-[14px] text-xs font-black px-4 flex-1 min-[420px]:flex-none"
                style={{
                  minHeight: 44,
                  color: '#2563eb', background: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.25)', cursor: 'pointer',
                }}
              ><Upload size={15} aria-hidden="true" /> Import</button>
              <button
                onClick={handleExport}
                title="Export the current archive view to an Excel (.xlsx) file"
                className="flex items-center justify-center gap-1.5 rounded-[14px] text-xs font-black px-4 flex-1 min-[420px]:flex-none"
                style={{
                  minHeight: 44,
                  color: '#fff',
                  background: 'linear-gradient(135deg,#062c22,#0f5040)', border: 'none',
                  boxShadow: '0 3px 10px rgba(5,150,105,0.25)', cursor: 'pointer',
                }}
              ><Download size={15} aria-hidden="true" /> Export Excel</button>
            </div>
          </div>

          {/* Imported rows notice */}
          {imported.length > 0 && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl" style={{
              background: isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.06)',
              border: '1px dashed rgba(37,99,235,0.35)',
            }}>
              <p className="text-[11px] font-bold flex items-center gap-1.5 flex-1 min-w-0" style={{ color: '#2563eb', margin: 0, overflowWrap: 'break-word' }}>
                <FileSpreadsheet size={14} aria-hidden="true" className="shrink-0" />
                {imported.length} imported row{imported.length !== 1 ? 's' : ''} shown for viewing only — not saved to the database.
              </p>
              <button
                onClick={handleClearImported}
                className="rounded-[10px] text-[10px] font-black whitespace-nowrap px-3 shrink-0"
                style={{
                  minHeight: 44, color: '#2563eb', background: 'transparent',
                  border: '1px solid rgba(37,99,235,0.35)', cursor: 'pointer',
                }}
              >Clear Imported</button>
            </div>
          )}
        </div>

        {/* ── Content states ── */}
        {loading ? (
          <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading history records">
            <SkeletonStatsRow />
            <SkeletonSessionFeed count={5} />
          </div>
        ) : loadError ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl" role="alert" style={{
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <XCircle size={44} aria-hidden="true" style={{ color: '#dc2626', margin: '0 auto 12px' }} />
            <p className="text-lg font-black" style={{ color: C.textPrimary, margin: 0 }}>Couldn’t load history</p>
            <p className="text-xs font-semibold" style={{ color: C.textMuted, margin: '8px 0 0', overflowWrap: 'break-word' }}>{loadError}</p>
            <button
              onClick={loadData}
              className="mt-4 rounded-xl text-xs font-black px-6"
              style={{ minHeight: 44, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}
            >Retry</button>
          </div>
        ) : allRecords.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl" style={{
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <Archive size={48} aria-hidden="true" style={{ color: C.textMuted, margin: '0 auto 12px', opacity: 0.7 }} />
            <p className="text-lg font-black" style={{ color: C.textPrimary, margin: 0 }}>No archived sessions yet</p>
            <p className="text-xs font-bold" style={{ color: C.textMuted, margin: '8px 0 0', overflowWrap: 'break-word' }}>
              When a confirmed booking is marked <strong>Complete</strong> in the Bookings module, it lands here automatically.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl" style={{
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <Search size={44} aria-hidden="true" style={{ color: C.textMuted, margin: '0 auto 12px', opacity: 0.7 }} />
            <p className="text-base font-black" style={{ color: C.textPrimary, margin: 0, overflowWrap: 'break-word' }}>
              No matches{search.trim() && <> for &ldquo;{search.trim()}&rdquo;</>}{statusFilter !== 'All' && <> in {statusFilter}</>}
            </p>
            <p className="text-xs font-semibold" style={{ color: C.textMuted, margin: '8px 0 0' }}>Try a different keyword or reset the filters.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <button
                onClick={() => setSearch('')}
                className="rounded-xl text-xs font-black px-6"
                style={{ minHeight: 44, background: 'transparent', color: C.textSecondary, border: `1px solid ${C.cardBorder}`, cursor: 'pointer' }}
              >Clear search</button>
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); }}
                className="rounded-xl text-xs font-black px-6"
                style={{ minHeight: 44, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}
              >Reset filters</button>
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] overflow-hidden" style={{
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            {/* ── Mobile card stack (<md) ── */}
            <div className="md:hidden divide-y" role="list" aria-label="Archived sessions" style={{ borderColor: C.rowBorder }}>
              {pageRecords.map((appt) => (
                <article
                  key={`${appt.imported ? 'imp' : 'sys'}-${appt.id}`}
                  role="listitem"
                  onClick={() => setSelectedRecord(appt)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRecord(appt); } }}
                  tabIndex={0}
                  aria-label={`${appt.service}, ${appt.client_name || appt.client}, ${appt.status}`}
                  className="p-4 flex flex-col gap-2.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 active:opacity-90"
                  style={{ background: appt.imported ? (isDark ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.03)') : 'transparent' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-black font-mono" style={{ color: C.textMuted }}>
                      #{String(appt.id).padStart(4, '0')}
                    </span>
                    {renderStatusBadge(appt.status)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-black leading-snug" style={{ color: C.textPrimary, margin: 0, overflowWrap: 'break-word' }} title={appt.client_name || appt.client}>
                      {appt.client_name || appt.client}
                    </p>
                    <p className="text-xs font-bold" style={{ color: C.textSecondary, margin: '2px 0 0', overflowWrap: 'break-word' }} title={appt.service}>
                      {appt.service}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-[11px] font-bold flex items-center gap-1.5 min-w-0" style={{ color: C.textMuted, margin: 0 }}>
                      <Calendar size={13} aria-hidden="true" className="shrink-0" />
                      <span className="truncate">{fmtDate(appt.datetime) || '—'} · {fmt12(appt.datetime) || '—'}</span>
                    </p>
                    {appt.imported && (
                      <span style={{
                        fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                        padding: '4px 8px', minHeight: 24, borderRadius: 8, display: 'inline-flex', alignItems: 'center',
                        background: 'rgba(37,99,235,0.12)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.3)',
                      }}>Imported</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] font-semibold truncate" style={{ color: C.textMuted }}>
                      {(appt.therapist_name || 'Unassigned')}{appt.service_duration ? ` · ${appt.service_duration} min` : ''}{appt.service_price ? ` · ₱${appt.service_price}` : ''}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedRecord(appt); }}
                      aria-label={`View record ${appt.id} (read only)`}
                      className="rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-extrabold shrink-0 px-3"
                      style={{ minWidth: 44, minHeight: 44, background: 'transparent', border: `1px solid ${C.cardBorder}`, color: C.textSecondary, cursor: 'pointer' }}
                    ><Eye size={15} aria-hidden="true" /> View</button>
                  </div>
                </article>
              ))}
            </div>

            {/* ── Desktop / tablet table (md+) ── */}
            <div className="hidden md:block">
              <div
                role="region" aria-label="Archived sessions table. Scroll horizontally on tablet to see all columns."
                tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div role="table" aria-label="Session history" aria-rowcount={filtered.length} className="min-w-[860px] lg:min-w-0">
                  <div role="row" className="grid md:grid-cols-[80px_1.4fr_1.2fr_120px_100px_52px] lg:grid-cols-[90px_1.2fr_1.2fr_1.4fr_150px_110px_90px] sticky top-0 z-10" style={{
                    background: C.headerBg,
                    borderBottom: `1px solid ${C.rowBorder}`,
                    padding: '12px 16px', gap: 12,
                  }}>
                    {[
                      { label: 'ID', showTherapist: false },
                      { label: 'Client', showTherapist: false },
                      { label: 'Therapist', showTherapist: true },
                      { label: 'Service', showTherapist: false },
                      { label: 'Date & Time', showTherapist: false },
                      { label: 'Status', showTherapist: false },
                      { label: 'View', showTherapist: false },
                    ].map((h) => (
                      <div
                        role="columnheader"
                        key={h.label}
                        className={h.showTherapist ? 'hidden lg:block text-[10px] font-black uppercase tracking-[0.08em]' : 'text-[10px] font-black uppercase tracking-[0.08em]'}
                        style={{ color: C.textPrimary }}
                      >{h.label}</div>
                    ))}
                  </div>

                  {pageRecords.map((appt) => (
                    <motion.div
                      key={`${appt.imported ? 'imp' : 'sys'}-${appt.id}`}
                      role="row"
                      tabIndex={0}
                      aria-label={`${appt.service} for ${appt.client_name || appt.client}, ${appt.status}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedRecord(appt)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRecord(appt); } }}
                      className="grid md:grid-cols-[80px_1.4fr_1.2fr_120px_100px_52px] lg:grid-cols-[90px_1.2fr_1.2fr_1.4fr_150px_110px_90px] items-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 hover:brightness-[1.02]"
                      style={{
                        padding: '14px 16px', gap: 12,
                        borderBottom: `1px solid ${C.rowBorder}`,
                        background: appt.imported ? (isDark ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.03)') : 'transparent',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = C.rowHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = appt.imported ? (isDark ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.03)') : 'transparent'; }}
                    >
                      <div role="cell" className="flex flex-col gap-1 min-w-0">
                        <span className="text-[11px] font-black font-mono" style={{ color: C.textMuted }}>
                          #{String(appt.id).padStart(4, '0')}
                        </span>
                        {appt.imported && (
                          <span style={{
                            fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                            padding: '2px 6px', minHeight: 20, borderRadius: 6, width: 'fit-content',
                            display: 'inline-flex', alignItems: 'center',
                            background: 'rgba(37,99,235,0.12)', color: '#2563eb',
                            border: '1px solid rgba(37,99,235,0.3)',
                          }}>Imported</span>
                        )}
                      </div>

                      <div role="cell" className="min-w-0">
                        <p className="text-[13px] font-black truncate" style={{ color: C.textPrimary, margin: 0 }} title={appt.client_name || appt.client}>
                          {appt.client_name || appt.client}
                        </p>
                        {appt.client_email ? (
                          <p className="hidden lg:block text-[10px] font-semibold truncate" style={{ color: C.textMuted, margin: '2px 0 0' }} title={appt.client_email}>
                            {appt.client_email}
                          </p>
                        ) : (
                          <p className="hidden lg:block text-[10px] font-semibold truncate" style={{ color: C.textMuted, margin: '2px 0 0' }} title={appt.therapist_name || 'Unassigned'}>
                            {appt.therapist_name || 'Unassigned'}
                          </p>
                        )}
                        <p className="lg:hidden text-[10px] font-semibold truncate" style={{ color: C.textMuted, margin: '2px 0 0' }} title={appt.therapist_name || 'Unassigned'}>
                          {appt.therapist_name || 'Unassigned'}
                        </p>
                      </div>

                      <div role="cell" className="hidden lg:block min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: C.textSecondary, margin: 0 }} title={appt.therapist_name || 'Unassigned'}>
                          {appt.therapist_name || 'Unassigned'}
                        </p>
                      </div>

                      <div role="cell" className="min-w-0">
                        <p className="text-xs font-extrabold truncate" style={{ color: C.textPrimary, margin: 0 }} title={appt.service}>
                          {appt.service}
                        </p>
                        {appt.service_duration && (
                          <p className="text-[10px] font-semibold" style={{ color: C.textMuted, margin: '2px 0 0' }}>
                            {appt.service_duration} min{appt.service_price ? ` • ₱${appt.service_price}` : ''}
                          </p>
                        )}
                      </div>

                      <div role="cell" className="min-w-0">
                        <p className="text-xs font-black" style={{ color: C.textPrimary, margin: 0 }}>{fmtDate(appt.datetime) || '—'}</p>
                        <p className="text-[10px] font-bold" style={{ color: C.textMuted, margin: '2px 0 0' }}>{fmt12(appt.datetime) || '—'}</p>
                      </div>

                      <div role="cell">
                        {renderStatusBadge(appt.status)}
                      </div>

                      <div role="cell" className="flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedRecord(appt); }}
                          aria-label={`View record ${appt.id} (read only)`}
                          title="View record (read only)"
                          className="rounded-xl flex items-center justify-center"
                          style={{
                            minWidth: 44, minHeight: 44, padding: '8px 10px', cursor: 'pointer',
                            background: 'transparent', border: `1px solid ${C.cardBorder}`,
                            color: C.textSecondary,
                          }}
                        ><Eye size={15} aria-hidden="true" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table footer + pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between p-3 sm:px-4" style={{ borderTop: `1px solid ${C.rowBorder}` }}>
              <p className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: C.textMuted, margin: 0 }}>
                <FileText size={13} aria-hidden="true" />
                Showing {pageRecords.length} of {filtered.length} · {allRecords.length} archived total
              </p>
              {totalPages > 1 && (
                <nav aria-label="History pages" className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    aria-label="Previous page"
                    className="rounded-xl flex items-center justify-center disabled:opacity-40"
                    style={{ minWidth: 44, minHeight: 44, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, cursor: 'pointer' }}
                  ><ChevronLeft size={16} aria-hidden="true" /></button>
                  <span aria-live="polite" className="text-[11px] font-black tabular-nums px-1" style={{ color: C.textSecondary }}>
                    {safePage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    aria-label="Next page"
                    className="rounded-xl flex items-center justify-center disabled:opacity-40"
                    style={{ minWidth: 44, minHeight: 44, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textSecondary, cursor: 'pointer' }}
                  ><ChevronRight size={16} aria-hidden="true" /></button>
                </nav>
              )}
            </div>
            <p className="px-3 pb-3 sm:px-4 text-[11px] font-semibold" style={{ color: C.textMuted, margin: 0 }}>
              Archive is view-only — records are managed automatically by the booking workflow.
            </p>
          </div>
        )}

        {/* Read-only detail modal */}
        <AnimatePresence>
          {selectedRecord && (
            <HistoryDetailModal
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminHistory;
