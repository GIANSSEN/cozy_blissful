import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from '../../components/StaffSidebar';
import { Menu, Bell, Search, LogOut, Home, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Placeholder notifications ────────────────────────────────────── */
const NOTIFICATIONS = [
  { id: 1, text: 'New appointment booked by Sarah Martinez', time: '2 min ago', read: false },
  { id: 2, text: 'John Therapist updated availability for tomorrow', time: '15 min ago', read: false },
  { id: 3, text: 'Deep Tissue session confirmed for 3:00 PM', time: '1 hr ago', read: true },
  { id: 4, text: 'System backup completed successfully', time: '3 hrs ago', read: true },
];

/**
 * StaffLayout — layout shell for staff portal pages.
 * Mirrors AdminLayout structure but with StaffSidebar and staff-specific branding.
 */
const StaffLayout = ({ children, title = 'Staff Portal', subtitle }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const isDark = theme === 'dark';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div
      className="flex min-h-screen relative"
      style={{
        background: isDark ? '#0f1420' : '#f5f7fa',
        color: isDark ? '#e8ecf3' : '#1a1d23',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Sidebar ── */}
      <StaffSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

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
          {/* Left: hamburger + page title */}
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

          {/* Right: search + notification bell + badge + avatar */}
          <div className="flex items-center gap-2">
            {/* Inline search */}
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
            <div className="relative" ref={notifRef}>
              <button
                title="Notifications"
                onClick={() => { setShowNotifications(v => !v); setShowProfile(false); }}
                className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                  color: isDark ? '#a0aec0' : '#64748b',
                }}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center">
                    <span className="absolute w-2.5 h-2.5 rounded-full bg-red-500 animate-ping opacity-40" />
                    <span className="relative w-2 h-2 rounded-full bg-red-500" />
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
                    style={{
                      background: isDark ? '#1c2333' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                      <p className="text-xs font-bold" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                      {NOTIFICATIONS.map(n => (
                        <div key={n.id}
                          className="px-4 py-3 flex items-start gap-3 transition-all cursor-pointer"
                          style={{
                            background: !n.read ? (isDark ? 'rgba(52,211,153,0.04)' : 'rgba(10,61,48,0.03)') : 'transparent',
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = !n.read ? (isDark ? 'rgba(52,211,153,0.04)' : 'rgba(10,61,48,0.03)') : 'transparent'}
                        >
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium leading-snug" style={{ color: isDark ? '#c9d1e0' : '#374151' }}>
                              {n.text}
                            </p>
                            <p className="text-[9px] mt-1" style={{ color: isDark ? '#4e5a70' : '#9ca3af' }}>{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 text-center"
                      style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                      <p className="text-[10px] font-bold cursor-pointer"
                        style={{ color: isDark ? '#34d399' : '#0a3d30' }}>
                        View All Notifications
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Coordinator badge */}
            <span
              className="hidden md:flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{
                background: isDark ? 'rgba(191,161,95,0.1)' : 'rgba(191,161,95,0.08)',
                border: `1px solid ${isDark ? 'rgba(191,161,95,0.2)' : 'rgba(191,161,95,0.15)'}`,
                color: isDark ? '#d4b87a' : '#8a6d2b',
              }}
            >
              ✦ Coordinator
            </span>

            {/* Profile avatar with dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 cursor-pointer transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg,#062c22,#0f5040)',
                  boxShadow: '0 2px 8px rgba(6,44,34,0.3)',
                }}
                title={user?.name || 'Staff'}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden z-50"
                    style={{
                      background: isDark ? '#1c2333' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.12)',
                    }}
                  >
                    {/* User info */}
                    <div className="px-4 py-4 flex items-center gap-3"
                      style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)' }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>
                          {user?.name || 'Staff Member'}
                        </p>
                        <p className="text-[10px] truncate mt-0.5" style={{ color: isDark ? '#5c6a7e' : '#8a9099' }}>
                          {user?.email || 'staff@cozy.spa'}
                        </p>
                        <span className="inline-block mt-1.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
                          style={{
                            background: isDark ? 'rgba(191,161,95,0.12)' : 'rgba(191,161,95,0.1)',
                            color: isDark ? '#d4b87a' : '#8a6d2b',
                          }}>
                          Staff Coordinator
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2 space-y-0.5">
                      <button
                        onClick={() => { setShowProfile(false); navigate('/'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ color: isDark ? '#8a9ab0' : '#4a5260' }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Home className="w-4 h-4" />
                        <span>Back to Home</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ color: '#ef4444' }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

export default StaffLayout;
