import React, { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { Menu, Search, LogOut, Home, X, Settings, Sun, Moon, Sparkles, User as UserIcon, Command } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Searchable Navigation Quick Links Index ─────────────────────── */
const SEARCH_INDEX = [
  { label: 'Dashboard', desc: 'Overview & Analytics', path: '/admin/dashboard', category: 'Pages' },
  { label: 'Appointments', desc: 'Manage Bookings & Schedules', path: '/admin/appointments', category: 'Pages' },
  { label: 'Customers', desc: 'Client Records & History', path: '/admin/customers', category: 'Pages' },
  { label: 'Services Menu', desc: 'Manage Massage & Spa Offerings', path: '/admin/services', category: 'Pages' },
  { label: 'Staff & Therapists', desc: 'Staff Accounts & Availability', path: '/admin/staff', category: 'Pages' },
  { label: 'Marketing & Promos', desc: 'Promotions & Discounts', path: '/admin/marketing', category: 'Pages' },
  { label: 'Payments & Revenue', desc: 'Transaction History', path: '/admin/payments', category: 'Pages' },
  { label: 'User Maintenance', desc: 'System RBAC & Roles', path: '/admin/users', category: 'Pages' },
  { label: 'Audit Logs', desc: 'System Logs & Security', path: '/admin/audit-logs', category: 'Pages' },
  { label: 'System Settings', desc: 'General & Spa Preferences', path: '/admin/settings', category: 'Settings' },
];

/**
 * AdminLayout
 * InfinitySpace-inspired shell: sidebar on the left, slim top-bar + content on the right.
 * Features functional search, keyboard shortcuts (Ctrl+K), and enhanced user avatar dropdown.
 */
const AdminLayout = ({ children, title = 'Admin', subtitle, searchData = [], onSearchSelect }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const profileRef = useRef(null);

  const isDark = theme === 'dark';

  // Merge static nav index with live page data
  const allSearchItems = useMemo(() => [
    ...SEARCH_INDEX,
    ...searchData,
  ], [searchData]);

  // Filter combined search index
  const filteredSearch = searchQuery.trim() === ''
    ? []
    : allSearchItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 12); // cap at 12 results

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowProfile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSelectSearchResult = (item) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    // Live data items (appointments etc.) have an onSelect callback
    if (item.onSelect) {
      navigate(item.path);
      setTimeout(() => { item.onSelect(); onSearchSelect && onSearchSelect(item); }, 100);
    } else {
      navigate(item.path);
    }
  };

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
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* ── Right canvas ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden min-w-0">

        {/* ── Top Header Bar ── */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(15,20,32,0.95)' : 'rgba(255,255,255,0.95)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.03)',
          }}
        >
          {/* Left: Hamburger + Page Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#a0aec0' : '#64748b',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
              }}
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="min-w-0 flex-1">
              <h1
                className="text-sm sm:text-base lg:text-lg font-black tracking-tight leading-tight truncate"
                style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="hidden sm:block text-[11px] mt-0.5 font-medium truncate"
                  style={{ color: isDark ? '#5c6a7e' : '#8a9099' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Functional Search + Role Badge + User Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Functional Interactive Search Box */}
            <div className="relative" ref={searchContainerRef}>
              <div
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all duration-200 w-28 sm:w-48 md:w-56 lg:w-64"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: isSearchFocused
                    ? `1px solid ${isDark ? '#34d399' : '#0a3d30'}`
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                  boxShadow: isSearchFocused
                    ? `0 0 0 3px ${isDark ? 'rgba(52,211,153,0.15)' : 'rgba(10,61,48,0.1)'}`
                    : 'none',
                }}
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? '#5c6a7e' : '#8a9099' }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="bg-transparent border-none outline-none w-full text-xs font-medium placeholder:text-slate-400"
                  style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 rounded-md hover:opacity-75 transition-opacity"
                  >
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                ) : (
                  <kbd
                    className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      color: isDark ? '#8a9ab0' : '#8a9099',
                    }}
                  >
                    <Command className="w-2.5 h-2.5" />K
                  </kbd>
                )}
              </div>

              {/* Live Search Results Dropdown */}
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
                      <span>Search Results ({filteredSearch.length})</span>
                      <span className="text-[9px] lowercase opacity-70">esc to close</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                      {filteredSearch.length > 0 ? (
                        filteredSearch.map((item, idx) => {
                          const isBooking = item.category === 'Booking';
                          const isSettings = item.category === 'Settings';
                          const badgeBg = isBooking
                            ? 'rgba(5,150,105,0.15)'
                            : isSettings
                            ? 'rgba(99,102,241,0.15)'
                            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)');
                          const badgeColor = isBooking
                            ? '#059669'
                            : isSettings
                            ? '#6366f1'
                            : (isDark ? '#a0aec0' : '#475569');
                          return (
                            <button
                              key={item._key || `${item.label}-${idx}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all group"
                              style={{ background: 'transparent' }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = isDark
                                  ? 'rgba(52,211,153,0.1)'
                                  : 'rgba(10,61,48,0.05)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = 'transparent')
                              }
                            >
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p
                                  className="text-xs font-bold transition-colors group-hover:text-emerald-500 truncate"
                                  style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
                                >
                                  {isBooking && <span style={{ marginRight: 4, opacity: 0.7 }}>📅</span>}
                                  {item.label}
                                </p>
                                <p
                                  className="text-[10px] mt-0.5 truncate"
                                  style={{ color: isDark ? '#5c6a7e' : '#64748b' }}
                                >
                                  {item.desc}
                                </p>
                              </div>
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ml-2 flex-shrink-0"
                                style={{ background: badgeBg, color: badgeColor }}
                              >
                                {item.category}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="py-6 text-center text-xs" style={{ color: isDark ? '#5c6a7e' : '#64748b' }}>
                          No matching results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Role Badge */}
            <span
              className="hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]"
              style={{
                background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(10,61,48,0.07)',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.25)' : 'rgba(10,61,48,0.15)'}`,
                color: isDark ? '#34d399' : '#041e16',
              }}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Admin</span>
            </span>

            {/* Enhanced Profile Avatar Button & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile((v) => !v)}
                className="relative group p-0.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                style={{
                  background: 'linear-gradient(135deg, #bfa15f, #e8cc8a)',
                  boxShadow: '0 3px 12px rgba(191,161,95,0.3)',
                }}
                title={user?.name || 'Admin Profile'}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, #041e16, #0c4a36)',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                {/* Online Indicator Green Dot */}
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 z-20"
                  style={{ background: '#10b981', borderColor: isDark ? '#0f1420' : '#ffffff' }}
                />
              </button>

              {/* Profile Dropdown Menu */}
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
                    {/* Profile Header */}
                    <div
                      className="px-4 py-4 flex items-center gap-3"
                      style={{
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #041e16, #0c4a36)',
                          boxShadow: '0 2px 8px rgba(4,30,22,0.4)',
                        }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p
                          className="text-xs font-black truncate"
                          style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
                        >
                          {user?.name || 'System Administrator'}
                        </p>
                        <p
                          className="text-[10px] truncate mt-0.5"
                          style={{ color: isDark ? '#5c6a7e' : '#8a9099' }}
                        >
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

                    {/* Quick Menu Options */}
                    <div className="p-2 space-y-1 text-left">
                      <button
                        onClick={() => {
                          setShowProfile(false);
                          navigate('/admin/settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group"
                        style={{ color: isDark ? '#c9d1e0' : '#374151' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = isDark
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.04)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Settings className="w-4 h-4 text-emerald-500 group-hover:rotate-45 transition-transform" />
                        <span>System Settings</span>
                      </button>

                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{ color: isDark ? '#c9d1e0' : '#374151' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = isDark
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.04)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div className="flex items-center gap-2.5">
                          {isDark ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-sky-600" />
                          )}
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

                      <button
                        onClick={() => {
                          setShowProfile(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{ color: isDark ? '#c9d1e0' : '#374151' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = isDark
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.04)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Home className="w-4 h-4 text-amber-500" />
                        <span>Public Website</span>
                      </button>

                      <div
                        className="my-1 h-px"
                        style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                      />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-red-500 hover:bg-red-500/10"
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

        {/* ── Page Content ── */}
        <main className="flex-1 px-3 sm:px-5 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
