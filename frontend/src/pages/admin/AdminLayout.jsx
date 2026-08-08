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

/* ── Searchable Navigation Quick Links Index ─────────────────────── */
const SEARCH_INDEX = [
  { label: 'Dashboard',        desc: 'Overview & Analytics',           path: '/admin/dashboard',   category: 'Pages'    },
  { label: 'Bookings',         desc: 'Manage Bookings & Schedules',     path: '/admin/appointments',category: 'Pages'    },
  { label: 'Customers',        desc: 'Client Records & History',        path: '/admin/customers',   category: 'Pages'    },
  { label: 'Services Menu',    desc: 'Manage Massage & Spa Offerings',  path: '/admin/services',    category: 'Pages'    },
  { label: 'Staff & Therapists', desc: 'Staff Accounts & Availability', path: '/admin/staff',       category: 'Pages'    },
  { label: 'Marketing & Promos',desc: 'Promotions & Discounts',         path: '/admin/marketing',   category: 'Pages'    },
  { label: 'Payments & Revenue',desc: 'Transaction History',            path: '/admin/payments',    category: 'Pages'    },
  { label: 'User Maintenance', desc: 'System RBAC & Roles',             path: '/admin/users',       category: 'Pages'    },
  { label: 'Audit Logs',       desc: 'System Logs & Security',          path: '/admin/audit-logs',  category: 'Pages'    },
  { label: 'System Settings',  desc: 'General & Spa Preferences',       path: '/admin/settings',    category: 'Settings' },
];

/* ── Breadcrumb path map ─────────────────────────────────────────── */
const BREADCRUMB_MAP = {
  '/admin/dashboard':   ['Admin', 'Dashboard'],
  '/admin/appointments':['Admin', 'Bookings'],
  '/admin/customers':   ['Admin', 'Customers'],
  '/admin/services':    ['Admin', 'Services'],
  '/admin/staff':       ['Admin', 'Staff'],
  '/admin/marketing':   ['Admin', 'Marketing'],
  '/admin/payments':    ['Admin', 'Payments'],
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
      className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl select-none"
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
        className="text-[10px] font-medium pl-1"
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

  /* outside click handler */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current     && !profileRef.current.contains(e.target))     setShowProfile(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) setIsSearchFocused(false);
      if (notifRef.current       && !notifRef.current.contains(e.target))       setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
      setTimeout(() => { item.onSelect(); onSearchSelect && onSearchSelect(item); }, 100);
    } else {
      navigate(item.path);
    }
  };

  const markAllRead_local = () => markAllRead();

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
      {/* ── Sidebar ── */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* ── Right canvas ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden min-w-0">

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
          <div className="flex items-center justify-between h-14 gap-3">

            {/* Left: Hamburger + Brand + Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#a0aec0' : '#64748b',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <Menu className="w-4 h-4" />
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
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">

              {/* Live Clock */}
              <LiveClock isDark={isDark} />

              {/* Search */}
              <div className="relative" ref={searchContainerRef}>
                <div
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 w-28 sm:w-44 md:w-52 lg:w-60"
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
                  <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? '#5c6a7e' : '#94a3b8' }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="bg-transparent border-none outline-none w-full text-xs font-medium placeholder:text-slate-400"
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
                      className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
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
                  onClick={() => setShowNotifs(v => !v)}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: showNotifs
                      ? (isDark ? 'rgba(52,211,153,0.12)' : 'rgba(10,61,48,0.08)')
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                    color: isDark ? '#a0aec0' : '#64748b',
                  }}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                      style={{ background: '#ef4444' }}
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2.5 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
                      style={{
                        background: isDark ? '#1c2333' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                      }}
                    >
                      <div
                        className="px-4 py-3 flex items-center justify-between"
                        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5" style={{ color: isDark ? '#34d399' : '#0a3d30' }} />
                          <span className="text-xs font-black" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <button
                          onClick={markAllRead_local}
                          className="text-[10px] font-bold hover:opacity-70 transition-opacity"
                          style={{ color: isDark ? '#34d399' : '#0a3d30' }}
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                        {notifs.length === 0 ? (
                          <div className="py-8 text-center text-xs" style={{ color: isDark ? '#5c6a7e' : '#94a3b8' }}>
                            No notifications yet
                          </div>
                        ) : notifs.map(n => (
                          <div
                            key={n.id}
                            className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                            style={{
                              background: n.unread
                                ? (isDark ? 'rgba(52,211,153,0.04)' : 'rgba(10,61,48,0.03)')
                                : 'transparent',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')}
                            onMouseLeave={e => (e.currentTarget.style.background = n.unread ? (isDark ? 'rgba(52,211,153,0.04)' : 'rgba(10,61,48,0.03)') : 'transparent')}
                            onClick={() => markRead(n.id)}
                          >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                              style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}>
                              {n.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[11px] font-bold truncate" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>
                                  {n.title}
                                </p>
                                {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />}
                              </div>
                              <p className="text-[10px] truncate mt-0.5" style={{ color: isDark ? '#5c6a7e' : '#64748b' }}>{n.desc}</p>
                              <p className="text-[9px] mt-1 font-medium" style={{ color: isDark ? '#3d4f63' : '#94a3b8' }}>{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                        <button
                          className="w-full py-2 text-[11px] font-bold rounded-xl transition-all hover:opacity-80"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            color: isDark ? '#a0aec0' : '#64748b',
                          }}
                        >
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Admin Role Badge */}
              <span
                className="hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em]"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg,rgba(52,211,153,0.1),rgba(52,211,153,0.06))'
                    : 'linear-gradient(135deg,rgba(10,61,48,0.08),rgba(10,61,48,0.04))',
                  border: `1px solid ${isDark ? 'rgba(52,211,153,0.25)' : 'rgba(10,61,48,0.15)'}`,
                  color: isDark ? '#34d399' : '#041e16',
                }}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Admin
              </span>

              {/* ── Profile Avatar + Dropdown ── */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(v => !v)}
                  className="relative group p-0.5 rounded-full transition-all"
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
            className="hidden sm:flex items-center gap-1.5 pb-2 -mt-0.5"
            style={{ color: isDark ? '#3d4f63' : '#94a3b8' }}
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
        <main className="flex-1 px-3 sm:px-5 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
