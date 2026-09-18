import React, { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  Menu, Search, LogOut, Home, X, Settings, Sun, Moon,
  Sparkles, Command, Bell, ChevronRight, Clock,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SEARCH_INDEX = [
  { label: 'Dashboard',            desc: 'Overview & Analytics',           path: '/admin/dashboard',               category: 'Pages'     },
  { label: 'Bookings',             desc: 'Manage Bookings & Schedules',     path: '/admin/appointments',            category: 'Pages'     },
  { label: 'Customers',            desc: 'Client Records & History',        path: '/admin/customers',               category: 'Pages'     },
  { label: 'Services Menu',        desc: 'Manage Massage & Spa Offerings',  path: '/admin/services',                category: 'Pages'     },
  { label: 'Staff & Therapists',   desc: 'Staff Accounts & Availability',   path: '/admin/staff',                   category: 'Pages'     },
  { label: 'History',              desc: 'Completed & Cancelled Sessions',  path: '/admin/history',                 category: 'Pages'     },
  { label: 'User Maintenance',     desc: 'System RBAC & Roles',             path: '/admin/users',                   category: 'Pages'     },
  { label: 'Audit Logs',           desc: 'System Logs & Security',          path: '/admin/audit-logs',              category: 'Pages'     },
  { label: 'System Settings',      desc: 'General & Spa Preferences',       path: '/admin/settings',                category: 'Settings'  },
];

/* ── Breadcrumb path map ─────────────────────────────────────────── */
const BREADCRUMB_MAP = {
  '/admin/dashboard':   ['Admin', 'Dashboard'],
  '/admin/appointments':['Admin', 'Bookings'],
  '/admin/customers':   ['Admin', 'Customers'],
  '/admin/services':    ['Admin', 'Services'],
  '/admin/staff':       ['Admin', 'Staff'],
  '/admin/history':     ['Admin', 'History'],
  '/admin/users':       ['Admin', 'User Maintenance'],
  '/admin/audit-logs':  ['Admin', 'Audit Logs'],
  '/admin/settings':    ['Admin', 'Settings'],
};

/* ── Remove static mock — now driven by NotificationContext ─────── */


/* ── Live Clock component ────────────────────────────────────────── */
const LiveClock = ({ isDark }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh  = now.getHours().toString().padStart(2, '0');
  const mm  = now.getMinutes().toString().padStart(2, '0');
  const ss  = now.getSeconds().toString().padStart(2, '0');
  const day = now.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div
      className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl select-none shrink-0 whitespace-nowrap transition-all"
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      }}
    >
      <Clock className="w-3 h-3 flex-shrink-0" style={{ color: isDark ? '#34d399' : '#0a3d30' }} />
      <span
        className="text-[11px] font-black tabular-nums"
        style={{ color: isDark ? '#e8ecf3' : '#1a1d23', fontVariantNumeric: 'tabular-nums' }}
      >
        {hh}:{mm}
        <span
          className="font-medium"
          style={{
            color: isDark ? '#4e6070' : '#9ca3af',
            animation: 'blink 1s step-end infinite',
          }}
        >:{ss}</span>
      </span>
      <span
        className="hidden lg:inline-block text-[10px] font-medium pl-1"
        style={{
          color: isDark ? '#5c6a7e' : '#8a9099',
          borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          paddingLeft: '0.5rem',
        }}
      >
        {day}
      </span>
    </div>
  );
};

/**
 * AdminLayout — Pro Shell
 * Sidebar left · slim header top · content area
 */
const AdminLayout = ({ children, title = 'Admin', subtitle, icon: PageIcon, searchData = [], onSearchSelect }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfile,       setShowProfile]        = useState(false);
  const [showNotifs,        setShowNotifs]          = useState(false);
  const [searchQuery,       setSearchQuery]         = useState('');
  const [isSearchFocused,   setIsSearchFocused]     = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { user, logout }       = useAuth();
  const { notifs, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate               = useNavigate();
  const location               = useLocation();

  const searchInputRef      = useRef(null);
  const searchContainerRef  = useRef(null);
  const profileRef          = useRef(null);
  const notifRef            = useRef(null);

  const isDark      = theme === 'dark';

  const breadcrumbs = BREADCRUMB_MAP[location.pathname] || ['Admin', title];

  /* merged search index */
  const allSearchItems = useMemo(() => [...SEARCH_INDEX, ...searchData], [searchData]);

  const filteredSearch = searchQuery.trim() === ''
    ? []
    : allSearchItems
        .filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 12);

  /* outside click handler (mouse + touch) */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) setIsSearchFocused(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  /* Ctrl+K shortcut */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowProfile(false);
        setShowNotifs(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleSelectSearchResult = (item) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    if (item.onSelect) {
      navigate(item.path);
      setTimeout(() => {
        item.onSelect();
        if (onSearchSelect) onSearchSelect(item);
      }, 100);
    } else {
      navigate(item.path);
    }
  };

  const markAllRead_local = () => markAllRead();

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setShowNotifs(false);

    if (notif.appointment_id) {
      if (
        notif.type === 'new_booking' ||
        notif.title?.toLowerCase().includes('new') ||
        notif.title?.toLowerCase().includes('received')
      ) {
        navigate(`/admin/appointments?tab=pending&id=${notif.appointment_id}`);
      } else if (
        notif.type === 'cancelled' ||
        notif.type === 'reschedule' ||
        notif.title?.toLowerCase().includes('reschedule') ||
        notif.title?.toLowerCase().includes('cancel')
      ) {
        navigate(`/admin/appointments?tab=requests&id=${notif.appointment_id}`);
      } else {
        navigate(`/admin/appointments?tab=confirmed&id=${notif.appointment_id}`);
      }
    } else {
      if (notif.type === 'new_booking' || notif.title?.toLowerCase().includes('booking')) {
        navigate('/admin/appointments?tab=pending');
      } else if (notif.type === 'audit_log') {
        navigate('/admin/audit-logs');
      } else if (notif.type === 'customer') {
        navigate('/admin/customers');
      } else {
        navigate('/admin/appointments');
      }
    }
  };

  /* ── CSS injection for blink animation ── */
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div
      className="flex min-h-screen relative"
      style={{
        background: isDark ? '#0f1420' : '#f2f4f7',
        color: isDark ? '#e8ecf3' : '#1a1d23',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Skip to Content ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-bold focus:bg-white focus:text-emerald-800 focus:shadow-xl"
      >
        Skip to main content
      </a>
      {/* ── Sidebar ── */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* ── Right canvas ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-clip min-w-0">

        {/* ════════════════════════════════════════
            TOP HEADER BAR
        ════════════════════════════════════════ */}
        <header
          className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 backdrop-blur-xl"
          style={{
            background: isDark
              ? 'rgba(13,17,28,0.96)'
              : 'rgba(255,255,255,0.96)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.35)'
              : '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          {/* ── Main row ── */}
          <div className="flex items-center justify-between h-14 gap-2 sm:gap-3" role="toolbar" aria-label="Header Controls">

            {/* Left: Hamburger + Brand + Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-1 sm:mr-2">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open navigation sidebar"
                aria-expanded={mobileSidebarOpen}
                aria-controls="admin-sidebar"
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#a0aec0' : '#64748b',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <Menu className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Logo mark — desktop only: per-page icon */}
              <div
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg,#041e16 0%,#0c4a36 60%,#bfa15f 100%)',
                  boxShadow: '0 2px 12px rgba(10,61,48,0.35)',
                }}
              >
                {PageIcon
                  ? <PageIcon className="w-4 h-4 text-amber-300" />
                  : <Sparkles className="w-4 h-4 text-amber-300" />}
              </div>

              {/* Title + subtitle */}
              <div className="min-w-0">
                <h1
                  className="text-sm sm:text-base font-black tracking-tight leading-tight truncate"
                  style={{ color: isDark ? '#e8ecf3' : '#0d1117' }}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p
                    className="hidden sm:block text-[10px] mt-0 font-medium truncate"
                    style={{ color: isDark ? '#4e5e72' : '#94a3b8' }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right controls */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
              role="toolbar"
              aria-label="Right header controls"
            >

              {/* Live Clock */}
              <LiveClock isDark={isDark} />

              {/* Search */}
              <div className="relative" ref={searchContainerRef} role="search" aria-label="Admin search">
                <div
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 w-28 focus-within:w-40 sm:focus-within:w-48 sm:w-44 md:w-52 lg:w-60"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    border: isSearchFocused
                      ? `1px solid ${isDark ? '#34d399' : '#0a3d30'}`
                      : `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: isSearchFocused
                      ? `0 0 0 3px ${isDark ? 'rgba(52,211,153,0.15)' : 'rgba(10,61,48,0.1)'}`
                      : 'none',
                  }}
                >
                  <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? '#5c6a7e' : '#94a3b8' }} aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    role="searchbox"
                    aria-label="Search pages and actions (Ctrl+K)"
                    aria-autocomplete="list"
                    aria-expanded={isSearchFocused && searchQuery.trim() !== ''}
                    aria-haspopup="listbox"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="bg-transparent border-none outline-none w-full text-xs font-medium placeholder:text-slate-400 min-w-0"
                    style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
                  />
                  {searchQuery ? (
                    <button onClick={() => setSearchQuery('')} className="p-0.5 rounded-md hover:opacity-75 transition-opacity">
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  ) : (
                    <kbd
                      className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        color: isDark ? '#8a9ab0' : '#94a3b8',
                      }}
                    >
                      <Command className="w-2.5 h-2.5" />K
                    </kbd>
                  )}
                </div>

                {/* Search dropdown */}
                <AnimatePresence>
                  {isSearchFocused && searchQuery.trim() !== '' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-2xl overflow-hidden z-50 shadow-2xl"
                      style={{
                        background: isDark ? '#1c2333' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                      }}
                    >
                      <div
                        className="px-4 py-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider"
                        style={{
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          color: isDark ? '#8a9ab0' : '#64748b',
                        }}
                      >
                        <span>Results ({filteredSearch.length})</span>
                        <span className="text-[9px] lowercase opacity-70">esc to close</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
                        {filteredSearch.length > 0 ? filteredSearch.map((item, idx) => {
                          const isBkg = item.category === 'Booking';
                          const isSt  = item.category === 'Settings';
                          const bbg   = isBkg ? 'rgba(5,150,105,0.15)' : isSt ? 'rgba(99,102,241,0.15)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)');
                          const bc    = isBkg ? '#059669' : isSt ? '#6366f1' : (isDark ? '#a0aec0' : '#475569');
                          return (
                            <button
                              key={item._key || `${item.label}-${idx}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all"
                              style={{ background: 'transparent' }}
                              onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(52,211,153,0.08)' : 'rgba(10,61,48,0.05)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p className="text-xs font-bold truncate" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>
                                  {isBkg && <span style={{ marginRight: 4, opacity: 0.7 }}>📅</span>}
                                  {item.label}
                                </p>
                                <p className="text-[10px] mt-0.5 truncate" style={{ color: isDark ? '#5c6a7e' : '#64748b' }}>{item.desc}</p>
                              </div>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ml-2 flex-shrink-0" style={{ background: bbg, color: bc }}>{item.category}</span>
                            </button>
                          );
                        }) : (
                          <div className="py-6 text-center text-xs" style={{ color: isDark ? '#5c6a7e' : '#64748b' }}>
                            No results for "{searchQuery}"
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Notification Bell ── */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifs(v => !v);
                  }}
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  aria-haspopup="dialog"
                  aria-expanded={showNotifs}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 touch-manipulation cursor-pointer"
                  style={{
                    background: showNotifs
                      ? (isDark ? 'rgba(52,211,153,0.16)' : 'rgba(10,61,48,0.12)')
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    border: `1px solid ${showNotifs ? (isDark ? '#34d399' : '#0a3d30') : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)')}`,
                    color: showNotifs ? (isDark ? '#34d399' : '#0a3d30') : (isDark ? '#a0aec0' : '#64748b'),
                  }}
                >
                  <Bell className="w-4 h-4 transition-transform duration-200" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-0 right-0 min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center text-[9px] font-black text-white pointer-events-none shadow-sm z-10"
                      style={{
                        background: '#ef4444',
                        border: `2px solid ${isDark ? '#0d111c' : '#ffffff'}`,
                        lineHeight: 1,
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Backdrop */}
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNotifs(false);
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        setShowNotifs(false);
                      }}
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>

                {/* Notification Panel */}
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      role="dialog"
                      aria-modal="true"
                      aria-label="Notifications panel"
                      className="absolute right-[-44px] sm:right-0 top-full mt-2.5 rounded-2xl overflow-hidden z-50 shadow-2xl"
                      style={{
                        width: 'min(380px, calc(100vw - 1.5rem))',
                        maxWidth: 'calc(100vw - 1.5rem)',
                        background: isDark ? '#18202f' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                        boxShadow: isDark
                          ? '0 20px 40px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)'
                          : '0 20px 35px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
                      }}
                    >
                      {/* Panel Header */}
                      <div
                        className="px-4 py-3 flex items-center justify-between gap-2"
                        style={{
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(10,61,48,0.08)' }}
                          >
                            <Bell className="w-3.5 h-3.5" style={{ color: isDark ? '#34d399' : '#0a3d30' }} />
                          </div>
                          <span className="text-xs font-black tracking-tight" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                            >
                              {unreadCount} new
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAllRead_local();
                              }}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                              style={{
                                background: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.08)',
                                color: isDark ? '#34d399' : '#0a3d30',
                              }}
                              aria-label="Mark all notifications as read"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNotifs(false);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer active:scale-90"
                            aria-label="Close notifications"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Notification list items */}
                      <div
                        className="overflow-y-auto divide-y touch-auto overscroll-contain"
                        style={{
                          maxHeight: 'min(60vh, 400px)',
                          borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          WebkitOverflowScrolling: 'touch',
                        }}
                      >
                        {notifs.length === 0 ? (
                          <div className="py-10 px-4 text-center text-xs flex flex-col items-center gap-2.5" style={{ color: isDark ? '#5c6a7e' : '#94a3b8' }}>
                            <div
                              className="w-11 h-11 rounded-2xl flex items-center justify-center"
                              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                            >
                              <Bell className="w-5 h-5 opacity-40" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-300 text-xs">All caught up!</p>
                              <p className="text-[10px] mt-0.5 opacity-70">No pending notifications right now.</p>
                            </div>
                          </div>
                        ) : notifs.map(n => (
                          <button
                            key={n.id}
                            type="button"
                            className="w-full text-left flex items-start gap-3 p-3.5 cursor-pointer transition-all focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none active:scale-[0.99] touch-manipulation"
                            style={{
                              background: n.unread
                                ? (isDark ? 'rgba(52,211,153,0.06)' : 'rgba(10,61,48,0.04)')
                                : 'transparent',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)')}
                            onMouseLeave={e => (e.currentTarget.style.background = n.unread ? (isDark ? 'rgba(52,211,153,0.06)' : 'rgba(10,61,48,0.04)') : 'transparent')}
                            onClick={() => handleNotifClick(n)}
                            aria-label={`${n.title}: ${n.desc}`}
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm shadow-xs"
                              style={{
                                background: n.unread
                                  ? (isDark ? 'rgba(52,211,153,0.15)' : 'rgba(10,61,48,0.1)')
                                  : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                                border: `1px solid ${n.unread ? (isDark ? 'rgba(52,211,153,0.3)' : 'rgba(10,61,48,0.2)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
                              }}
                            >
                              {n.icon || '🔔'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-[11px] leading-tight ${n.unread ? 'font-bold' : 'font-semibold'}`}
                                  style={{ color: isDark ? '#e8ecf3' : '#1a1d23', wordBreak: 'break-word' }}
                                >
                                  {n.title}
                                </p>
                                {n.unread && (
                                  <span className="flex h-2 w-2 relative flex-shrink-0 mt-0.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] mt-1 line-clamp-2 leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b', wordBreak: 'break-word' }}>
                                {n.desc}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] font-medium" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                  {n.time}
                                </span>
                                {n.appointment_id && (
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                    style={{
                                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                      color: isDark ? '#a0aec0' : '#64748b',
                                    }}
                                  >
                                    #{n.appointment_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div
                        className="p-2.5 flex items-center gap-2"
                        style={{
                          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotifs(false);
                            navigate('/admin/appointments');
                          }}
                          className="flex-1 py-2 text-[11px] font-bold rounded-xl transition-all hover:opacity-80 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                          style={{
                            background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(10,61,48,0.08)',
                            color: isDark ? '#34d399' : '#0a3d30',
                            border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : 'rgba(10,61,48,0.15)'}`,
                          }}
                        >
                          View All Bookings
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Admin Role Badge */}
              <span
                className="hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em]"
                aria-label="User role: Administrator"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg,rgba(52,211,153,0.1),rgba(52,211,153,0.06))'
                    : 'linear-gradient(135deg,rgba(10,61,48,0.08),rgba(10,61,48,0.04))',
                  border: `1px solid ${isDark ? 'rgba(52,211,153,0.25)' : 'rgba(10,61,48,0.15)'}`,
                  color: isDark ? '#34d399' : '#041e16',
                }}
              >
                <Sparkles className="w-3 h-3 text-amber-400" aria-hidden="true" />
                Admin
              </span>

              {/* ── Profile Avatar + Dropdown ── */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(v => !v)}
                  aria-label={`User profile for ${user?.name || 'Admin'}. ${showProfile ? 'Close' : 'Open'} profile menu`}
                  aria-haspopup="dialog"
                  aria-expanded={showProfile}
                  className="relative group p-0.5 rounded-full transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #bfa15f, #e8cc8a, #bfa15f)',
                    boxShadow: showProfile
                      ? '0 4px 18px rgba(191,161,95,0.5)'
                      : '0 2px 10px rgba(191,161,95,0.25)',
                  }}
                  title={user?.name || 'Admin Profile'}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #041e16, #0c4a36)' }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                    style={{
                      background: '#10b981',
                      borderColor: isDark ? '#0d111c' : '#ffffff',
                    }}
                  />
                </button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2.5 w-64 rounded-2xl overflow-hidden z-50 shadow-2xl"
                      style={{
                        background: isDark ? '#1c2333' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                      }}
                    >
                      {/* Header */}
                      <div
                        className="px-4 py-4 flex items-center gap-3"
                        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #041e16, #0c4a36)',
                            boxShadow: '0 2px 8px rgba(4,30,22,0.4)',
                          }}
                        >
                          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs font-black truncate" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>
                            {user?.name || 'System Administrator'}
                          </p>
                          <p className="text-[10px] truncate mt-0.5" style={{ color: isDark ? '#5c6a7e' : '#8a9099' }}>
                            {user?.email || 'admin@cozyblissful.com'}
                          </p>
                          <span
                            className="inline-flex items-center gap-1 mt-1.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{
                              background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(10,61,48,0.07)',
                              color: isDark ? '#34d399' : '#041e16',
                            }}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Administrator
                          </span>
                        </div>
                      </div>

                      {/* Menu */}
                      <div className="p-2 space-y-0.5 text-left">
                        {[
                          { label: 'System Settings', icon: Settings, onClick: () => { setShowProfile(false); navigate('/admin/settings'); }, iconClass: 'text-emerald-500 group-hover:rotate-45 transition-transform' },
                          { label: 'Public Website',  icon: Home,     onClick: () => { setShowProfile(false); navigate('/'); },                iconClass: 'text-amber-500' },
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={item.onClick}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group"
                            style={{ color: isDark ? '#c9d1e0' : '#374151' }}
                            onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <item.icon className={`w-4 h-4 ${item.iconClass}`} />
                            <span>{item.label}</span>
                          </button>
                        ))}

                        <button
                          onClick={toggleTheme}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{ color: isDark ? '#c9d1e0' : '#374151' }}
                          onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
                            <span>Theme Mode</span>
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                              color: isDark ? '#34d399' : '#041e16',
                            }}
                          >
                            {isDark ? 'Dark' : 'Light'}
                          </span>
                        </button>

                        <div className="my-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{ color: '#ef4444' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
          </div>

          {/* ── Breadcrumb sub-row ── */}
          <div
            className="flex items-center gap-1.5 pb-2 -mt-0.5 overflow-x-auto"
            style={{ color: isDark ? '#3d4f63' : '#94a3b8', scrollbarWidth: 'none' }}
          >
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb}>
                {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                <span
                  className="text-[10px] font-semibold"
                  style={{
                    color: i === breadcrumbs.length - 1
                      ? (isDark ? '#34d399' : '#0a3d30')
                      : (isDark ? '#3d4f63' : '#94a3b8'),
                  }}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </header>

        {/* ── Page Content ── */}
        <main
          id="main-content"
          className="flex-1 px-3 sm:px-5 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
