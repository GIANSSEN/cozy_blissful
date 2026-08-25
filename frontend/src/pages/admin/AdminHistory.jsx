import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import API from '../../api/axios';
import * as XLSX from 'xlsx';
import {
  Archive, Calendar, Clock, CheckCircle, XCircle,
  Mail, FileText, Eye, Search, X, Download, Upload,
  CalendarCheck, FileSpreadsheet, Info, Zap,
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
    case 'Confirmed':
      return {
        bg: isDark ? 'rgba(22, 163, 74, 0.22)' : 'rgba(22, 163, 74, 0.12)',
        color: isDark ? '#4ade80' : '#15803d',
        border: isDark ? 'rgba(74, 222, 128, 0.4)' : 'rgba(21, 128, 61, 0.3)',
        dot: isDark ? '#4ade80' : '#16a34a'
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

/* ─────────────────────────────────────────────────────────────────── */
/*  READ-ONLY DETAIL MODAL (no actions — History is view only)          */
/* ─────────────────────────────────────────────────────────────────── */

const HistoryDetailModal = ({ record, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ss = getStatusStyle(record.status, isDark);

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

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        style={{
          background: C.modalBg, border: `1px solid ${C.cardBorder}`,
          borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          width: '100%', maxWidth: 512, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: isCancelled
            ? 'linear-gradient(135deg,#450a0a,#7f1d1d)'
            : 'linear-gradient(135deg,#1e1b4b,#312e81)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 14,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Archive size={20} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c7d2fe' }}>
                  Session Archive — Read Only
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '4px 0 0' }}>{record.service}</h3>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#ffffff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#e0e7ff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> {fmtDate(record.datetime)} at {fmt12(record.datetime)}
            </span>
            {record.service_duration && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#c7d2fe',
                background: 'rgba(255,255,255,0.1)', padding: '2px 10px',
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Clock size={12} /> {record.service_duration} min
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '2px 10px', borderRadius: 999,
              background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
            }}>
              {record.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Client info */}
          <div style={{
            padding: 16, borderRadius: 16, background: C.cardBg,
            border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Client</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{record.client_name || record.client}</p>
            {record.client_email && (
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0' }}>
                <Mail size={14} style={{ color: '#059669' }} /> {record.client_email}
              </p>
            )}
          </div>

          {/* Therapist info */}
          <div style={{
            padding: 16, borderRadius: 16, background: C.cardBg,
            border: `1px solid ${C.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>Assigned Practitioner</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{record.therapist_name || 'Unassigned'}</p>
            {record.service_price && (
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0' }}>
                <Zap size={13} style={{ color: '#f59e0b' }} /> Session Fee: ₱{record.service_price}
              </p>
            )}
          </div>

          {/* Notes */}
          {record.notes && (
            <div style={{
              padding: 14, borderRadius: 16, background: C.noteBg,
              border: `1px solid ${C.noteBorder}`,
            }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706', margin: 0 }}>Session Remarks</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '4px 0 0', lineHeight: 1.5 }}>{record.notes}</p>
            </div>
          )}

          {/* View-only notice */}
          <div style={{
            padding: 12, borderRadius: 14, background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
            border: '1px dashed rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Info size={15} style={{ color: '#6366f1', flexShrink: 0 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: 0 }}>
              Archived records are read-only and cannot be modified. Use Export to save a copy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: `1px solid ${C.cardBorder}`,
          background: C.cardBg, display: 'flex', flexShrink: 0,
        }}>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.cardBorder}`,
            background: 'transparent', color: C.textSecondary, fontSize: 12, fontWeight: 900, cursor: 'pointer',
          }}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  MAIN HISTORY PAGE — VIEW ONLY + EXCEL IMPORT / EXPORT               */
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
    rowHover:      isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  };

  const [records, setRecords] = useState([]);
  const [imported, setImported] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Completed');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isWide, setIsWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    const fn = () => setIsWide(window.innerWidth >= 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    document.title = 'History | Cozy Blissful Admin';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', 'View-only archive of completed and cancelled spa sessions with Excel import and export.');
    return () => { document.title = 'Admin | Cozy Blissful'; };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/appointments');
      // History only archives finished bookings — Completed & Cancelled
      const archived = (res.data?.recent_appointments || []).filter(
        (a) => a.status === 'Completed' || a.status === 'Cancelled'
      );
      setRecords(archived);
    } catch {
      toast.error?.('Failed to load history records from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* Combined view: live archived records + session-only imported rows */
  const allRecords = useMemo(() => [
    ...records.map((r) => ({ ...r, imported: false })),
    ...imported.map((r, i) => ({ ...r, id: r.id ?? `imp-${i}`, imported: true })),
  ], [records, imported]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allRecords.filter((a) => {
      const matchS = statusFilter === 'All' || a.status === statusFilter;
      const matchQ = !q ||
        (a.service || '').toLowerCase().includes(q) ||
        (a.client_name || a.client || '').toLowerCase().includes(q) ||
        (a.therapist_name || '').toLowerCase().includes(q) ||
        String(a.id).includes(q);
      return matchS && matchQ;
    });
  }, [allRecords, search, statusFilter]);

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
    const rows = filtered.map((a, i) => ({
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
      '_idx': i,
    }));
    rows.forEach((r) => delete r._idx);

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

  return (
    <AdminLayout
      title="History"
      subtitle="Read-only archive of completed & cancelled sessions — with Excel import / export"
      icon={Archive}
    >
      <div className="space-y-4 sm:space-y-6">

        {/* ── Summary Metric Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isWide ? 'repeat(4,1fr)' : 'repeat(2,1fr)',
          gap: isWide ? 12 : 8,
        }}>
          {[
            { label: 'Archived Sessions', value: allRecords.length, color: '#6366f1', accent: 'rgba(99,102,241,0.12)', Icon: Archive },
            { label: 'Completed',         value: completedCount,    color: '#059669', accent: 'rgba(5,150,105,0.12)', Icon: CheckCircle },
            { label: 'Cancelled',         value: cancelledCount,    color: '#dc2626', accent: 'rgba(239,68,68,0.12)', Icon: XCircle },
            { label: 'Revenue (₱)',       value: revenue.toLocaleString(), color: '#bfa15f', accent: 'rgba(191,161,95,0.15)', Icon: CalendarCheck },
          ].map(({ label, value, color, accent, Icon }) => (
            <div key={label} style={{
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: isWide ? 20 : 16,
              padding: isWide ? 16 : '12px 10px',
              display: 'flex', alignItems: 'center',
              gap: isWide ? 12 : 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              minWidth: 0,
            }}>
              <div style={{
                width: isWide ? 44 : 34, height: isWide ? 44 : 34, borderRadius: isWide ? 14 : 10, flexShrink: 0,
                background: accent, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={isWide ? 20 : 16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  fontSize: isWide ? 10 : 9, fontWeight: 800, letterSpacing: isWide ? '0.06em' : '0.02em',
                  textTransform: 'uppercase', color: C.textMuted, margin: 0,
                  lineHeight: 1.2, wordBreak: 'break-word',
                }}>{label}</p>
                <p style={{ fontSize: isWide ? 26 : 20, fontWeight: 900, color, margin: '2px 0 0', lineHeight: 1 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar: search, filters, import / export ── */}
        <div style={{
          background: C.cardBg, border: `1px solid ${C.cardBorder}`,
          borderRadius: 20, padding: '14px 16px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {/* Search */}
          <div style={{
            flex: '1 1 220px', minWidth: 200, display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 14px', borderRadius: 14,
            background: C.inputBg, border: `1px solid ${C.cardBorder}`,
          }}>
            <Search size={15} style={{ color: C.textMuted, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search archive by client, therapist, service or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, fontWeight: 600, color: C.textPrimary }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {FILTERS.map((f) => {
              const active = statusFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  style={{
                    padding: '8px 14px', borderRadius: 12, cursor: 'pointer',
                    fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap',
                    border: active ? '1px solid #6366f1' : `1px solid ${C.pillBorder}`,
                    background: active ? '#6366f1' : C.pillBg,
                    color: active ? '#fff' : C.textSecondary,
                    boxShadow: active ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
                  }}
                >{f}</button>
              );
            })}
          </div>

          {/* Import / Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import records from an Excel file (view only — nothing is written to the database)"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
                fontSize: 12, fontWeight: 900,
                color: '#2563eb', background: 'rgba(37,99,235,0.1)',
                border: '1px solid rgba(37,99,235,0.25)',
              }}
            ><Upload size={15} /> Import</button>
            <button
              onClick={handleExport}
              title="Export the current archive view to an Excel (.xlsx) file"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
                fontSize: 12, fontWeight: 900, color: '#fff',
                background: 'linear-gradient(135deg,#062c22,#0f5040)', border: 'none',
                boxShadow: '0 3px 10px rgba(5,150,105,0.25)',
              }}
            ><Download size={15} /> Export Excel</button>
          </div>

          {/* Imported rows notice */}
          {imported.length > 0 && (
            <div style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 10, padding: '8px 14px', borderRadius: 12,
              background: isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.06)',
              border: '1px dashed rgba(37,99,235,0.35)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileSpreadsheet size={14} />
                {imported.length} imported row{imported.length !== 1 ? 's' : ''} shown for viewing only — not saved to the database.
              </p>
              <button
                onClick={handleClearImported}
                style={{
                  padding: '5px 12px', borderRadius: 10, cursor: 'pointer',
                  fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap',
                  color: '#2563eb', background: 'transparent', border: '1px solid rgba(37,99,235,0.35)',
                }}
              >Clear Imported</button>
            </div>
          )}
        </div>

        {/* ── Archive Table ── */}
        {loading ? (
          <div className="py-16"><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: 48, textAlign: 'center', borderRadius: 24,
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <Archive size={48} style={{ color: C.textMuted, margin: '0 auto 12px', opacity: 0.7 }} />
            <p style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, margin: 0 }}>No archived sessions yet</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: '8px 0 0' }}>
              When a confirmed booking is marked <strong>Complete</strong> in the Bookings module, it lands here automatically.
            </p>
          </div>
        ) : (
          <div style={{
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 860 }}>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isWide ? '90px 1.2fr 1.2fr 1.4fr 150px 110px 90px' : '90px 1.4fr 150px 110px 90px',
                  background: C.headerBg,
                  borderBottom: `1px solid ${C.rowBorder}`,
                  padding: '12px 16px', gap: 12,
                }}>
                  {['ID', 'Client', ...(isWide ? ['Therapist'] : []), 'Service', 'Date & Time', 'Status', 'View'].map((h) => (
                    <div key={h} style={{
                      fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: C.textPrimary,
                    }}>{h}</div>
                  ))}
                </div>

                {/* Rows */}
                {filtered.map((appt) => {
                  const ss = getStatusStyle(appt.status, isDark);
                  return (
                    <motion.div
                      key={`${appt.imported ? 'imp' : 'sys'}-${appt.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isWide ? '90px 1.2fr 1.2fr 1.4fr 150px 110px 90px' : '90px 1.4fr 150px 110px 90px',
                        alignItems: 'center',
                        padding: '14px 16px', gap: 12,
                        borderBottom: `1px solid ${C.rowBorder}`,
                        background: appt.imported ? (isDark ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.03)') : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => setSelectedRecord(appt)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = appt.imported ? (isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.06)') : C.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = appt.imported ? (isDark ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.03)') : 'transparent')}
                    >
                      {/* ID */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: C.textMuted, fontFamily: 'monospace' }}>
                          #{String(appt.id).padStart(4, '0')}
                        </span>
                        {appt.imported && (
                          <span style={{
                            fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                            padding: '1px 6px', borderRadius: 6, width: 'fit-content',
                            background: 'rgba(37,99,235,0.12)', color: '#2563eb',
                            border: '1px solid rgba(37,99,235,0.3)',
                          }}>Imported</span>
                        )}
                      </div>

                      {/* Client */}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {appt.client_name || appt.client}
                        </p>
                        {isWide && appt.client_email && (
                          <p style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {appt.client_email}
                          </p>
                        )}
                      </div>

                      {/* Therapist */}
                      {isWide && (
                        <p style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {appt.therapist_name || 'Unassigned'}
                        </p>
                      )}

                      {/* Service */}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {appt.service}
                        </p>
                        {appt.service_duration && (
                          <p style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, margin: '2px 0 0' }}>
                            {appt.service_duration} min{appt.service_price ? ` • ₱${appt.service_price}` : ''}
                          </p>
                        )}
                      </div>

                      {/* Date & Time */}
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary, margin: 0 }}>{fmtDate(appt.datetime)}</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, margin: '2px 0 0' }}>{fmt12(appt.datetime)}</p>
                      </div>

                      {/* Status */}
                      <span style={{
                        fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 999,
                        background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
                        width: 'fit-content', whiteSpace: 'nowrap',
                      }}>{appt.status}</span>

                      {/* View */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedRecord(appt); }}
                          title="View record (read only)"
                          style={{
                            padding: '8px 10px', borderRadius: 12, cursor: 'pointer',
                            background: 'transparent', border: `1px solid ${C.cardBorder}`,
                            color: C.textSecondary, display: 'flex', alignItems: 'center',
                          }}
                        ><Eye size={15} /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Table footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', flexWrap: 'wrap', gap: 8,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={13} />
                Showing {filtered.length} of {allRecords.length} archived record{allRecords.length !== 1 ? 's' : ''}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, margin: 0 }}>
                Archive is view-only — records are managed automatically by the booking workflow.
              </p>
            </div>
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
