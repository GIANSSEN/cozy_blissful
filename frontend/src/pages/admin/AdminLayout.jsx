import React from 'react';
import Sidebar from '../../components/Sidebar';

/**
 * AdminLayout
 * Two-column layout: fixed claymorphic sidebar (left) + scrollable cream canvas (right).
 * Used as the shell for all /admin/* pages.
 */
const AdminLayout = ({ children, title = 'Admin', subtitle }) => {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Left: Sticky Sidebar ─────────────────────────────────── */}
      <div className="sticky top-0 h-screen flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Right: Scrollable Content Canvas ─────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top chrome bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-8 py-4"
          style={{
            background: 'rgba(250,248,245,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg,#fdfcfa,#f3ede4)',
                boxShadow: '3px 3px 8px #ddd8cf, -3px -3px 8px #ffffff',
                color: '#a08742',
                border: '1px solid rgba(191,161,95,0.2)',
              }}
            >
              ✦ Admin Access
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
