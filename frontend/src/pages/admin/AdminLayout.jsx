import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * AdminLayout
 * Responsive dashboard template: fixed desktop sidebar or sliding mobile drawer + content panel.
 */
const AdminLayout = ({ children, title = 'Admin', subtitle }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      className="flex min-h-screen relative"
      style={{
        background: theme === 'dark' ? '#0b1320' : '#f7f2eb',
        color: theme === 'dark' ? '#f8fafc' : '#0f1720',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Backdrop for Mobile Sidebar ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar Drawer (Desktop & Mobile) ── */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* ── Right Content Canvas ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b px-6 lg:px-8 py-4 backdrop-blur-xl"
          style={{
            background: theme === 'dark' ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: theme === 'dark' ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.12)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile screens */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className={`lg:hidden rounded-xl border px-2 p-2 transition ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-900/90 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className={`text-lg lg:text-xl font-black tracking-tight leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{title}</h1>
              {subtitle && <p className={`text-[11px] mt-0.5 font-medium leading-none ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] shadow-[0_10px_30px_-20px_rgba(20,83,45,0.8)] ${theme === 'dark' ? 'border-slate-700 bg-slate-900/85 text-emerald-200' : 'border-slate-200 bg-slate-50 text-emerald-800'}`}>
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
