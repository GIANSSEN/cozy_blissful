import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import {
  History, Search, ShieldCheck, PlusCircle, Pencil,
  Trash2, LogIn, Settings as SettingsIcon,
} from 'lucide-react';

/* ── Mock audit trail entries ────────────────────────────────────── */
const MOCK_LOGS = [
  { id: 1, actor: 'Admin (You)',      action: 'update',  entity: 'RBAC Permissions',        detail: "Updated permissions for role 'staff'", timestamp: '2026-07-18 14:32' },
  { id: 2, actor: 'Maria Santos',     action: 'login',    entity: 'Auth',                    detail: 'Signed in from 122.55.14.20',           timestamp: '2026-07-18 09:10' },
  { id: 3, actor: 'Admin (You)',      action: 'create',  entity: 'Service Catalog',         detail: "Added new service 'Couple Massage'",   timestamp: '2026-07-17 17:45' },
  { id: 4, actor: 'John Doe',         action: 'delete',  entity: 'Product Inventory',       detail: "Removed product 'Sample Trial Kit'",   timestamp: '2026-07-17 11:02' },
  { id: 5, actor: 'Admin (You)',      action: 'update',  entity: 'System Settings',         detail: 'Changed booking lead-time to 2 hours',  timestamp: '2026-07-16 16:20' },
  { id: 6, actor: 'Anna Reyes',       action: 'login',    entity: 'Auth',                    detail: 'Signed in from 178.20.9.4',             timestamp: '2026-07-16 08:55' },
  { id: 7, actor: 'Admin (You)',      action: 'create',  entity: 'Marketing',               detail: "Issued gift card 'CB-GIFT-1000'",       timestamp: '2026-07-15 13:12' },
];

const ACTION_META = {
  create: { label: 'Created', icon: PlusCircle, color: '#0a3d30', bg: 'rgba(10,61,48,0.08)' },
  update: { label: 'Updated', icon: Pencil,      color: '#b45309', bg: 'rgba(191,161,95,0.12)' },
  delete: { label: 'Deleted', icon: Trash2,      color: '#b91c1c', bg: 'rgba(239,68,68,0.08)' },
  login:  { label: 'Login',   icon: LogIn,       color: '#3b55e6', bg: 'rgba(59,85,230,0.08)' },
};

const AdminAuditLogs = () => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const filtered = MOCK_LOGS.filter(log => {
    const matchSearch = !search ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'All' || log.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <AdminLayout title="Audit Logs" subtitle="System-wide activity trail for accountability & security">
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actor, entity, detail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-800"
              style={{ background: '#faf9f6' }}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['All', 'create', 'update', 'delete', 'login'].map(a => (
              <button
                key={a}
                onClick={() => setFilterAction(a)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                  filterAction === a ? 'bg-emerald-950 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {a === 'All' ? 'All' : ACTION_META[a].label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center shadow-sm">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-200">No matching log entries</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="relative space-y-3">
            {filtered.map(log => {
              const meta = ACTION_META[log.action];
              const Icon = meta.icon;
              return (
                <div key={log.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{log.actor}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-400">on {log.entity}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{log.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">{log.timestamp}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center pt-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Audit records are retained for 12 months for compliance purposes.
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
