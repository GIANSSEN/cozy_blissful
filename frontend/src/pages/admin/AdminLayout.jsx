import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Menu } from 'lucide-react';

/**
 * AdminLayout
 * Responsive dashboard template: fixed desktop sidebar or sliding mobile drawer + content panel.
 */
const AdminLayout = ({ children, title = 'Admin', subtitle }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen relative"
      style={{ background: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Backdrop for Mobile Sidebar ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar Drawer (Desktop & Mobile) ── */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* ── Right Content Canvas ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden min-w-0">
        {/* Top Header Bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8 py-4"
          style={{
            background: 'rgba(250,248,245,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,0,0,0.03)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile screens */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100/80 active:scale-95 transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-tight">{title}</h1>
              {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-none">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Access Badge */}
            <span
              className="text-[10px] font-bold px-3 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg,#fdfcfa,#f3ede4)',
                boxShadow: '2px 2px 6px #e4dfd5, -2px -2px 6px #ffffff',
                color: '#a08742',
                border: '1px solid rgba(191,161,95,0.15)',
              }}
            >
              ✦ Admin Access
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
