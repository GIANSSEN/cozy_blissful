import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Menu, Bell, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminLayout
 * InfinitySpace-inspired shell: sidebar on the left, slim top-bar + content on the right.
 */
const AdminLayout = ({ children, title = 'Admin', subtitle }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();

  const isDark = theme === 'dark';

  return (
    <div
      className="flex min-h-screen relative"
      style={{
        background: isDark ? '#0f1420' : '#f5f7fa',
        color: isDark ? '#e8ecf3' : '#1a1d23',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Sidebar (desktop sticky / mobile drawer) ── */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* ── Right canvas ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden min-w-0">

        {/* ── Top header bar ── */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8 py-3.5 backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(15,20,32,0.97)' : 'rgba(255,255,255,0.97)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: isDark ? '0 1px 12px rgba(0,0,0,0.25)' : '0 1px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Left: hamburger (mobile) + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#a0aec0' : '#64748b',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
              }}
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <h1
                className="text-base lg:text-lg font-black tracking-tight leading-tight"
                style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="text-[10px] mt-0.5 font-medium leading-none"
                  style={{ color: isDark ? '#5c6a7e' : '#8a9099' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: search + badge + avatar */}
          <div className="flex items-center gap-2">
            {/* Inline search (desktop) */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px]"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                color: isDark ? '#5c6a7e' : '#8a9099',
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search anything…</span>
            </div>

            {/* Notification bell */}
            <button
              title="Notifications"
              className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                color: isDark ? '#a0aec0' : '#64748b',
              }}
            >
              <Bell className="w-4 h-4" />
              {/* Notification dot */}
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: '#ef4444' }}
              />
            </button>

            {/* Admin access badge */}
            <span
              className="hidden md:flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{
                background: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.07)',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : 'rgba(10,61,48,0.12)'}`,
                color: isDark ? '#34d399' : '#062c22',
              }}
            >
              ✦ Admin
            </span>

            {/* User avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg,#062c22,#0f5040)',
                boxShadow: '0 2px 8px rgba(6,44,34,0.3)',
              }}
              title={user?.name || 'Admin'}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
