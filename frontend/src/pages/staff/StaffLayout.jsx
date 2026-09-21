import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from '../../components/StaffSidebar';
import { Menu, Search, LogOut, Home, X, Sun, Moon, User as UserIcon, Command } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import RoleIdentityBadge from '../../components/profile/RoleIdentityBadge';
import ProfileMenu from '../../components/profile/ProfileMenu';
import ProfileModal from '../../components/profile/ProfileModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

/* ── Staff Search Index ──────────────────────────────────────────── */
const STAFF_SEARCH_INDEX = [
  { label: 'Staff Dashboard', desc: 'Daily Overview & Operations', path: '/staff/dashboard', category: 'Pages' },
  { label: 'Manage Bookings', desc: 'Bookings & Client Scheduling', path: '/staff/appointments', category: 'Pages' },
  { label: 'Therapist Schedules', desc: 'Availability & Roster Management', path: '/staff/therapists', category: 'Pages' },
];

/**
 * StaffLayout — layout shell for staff portal pages.
 * Features functional search, keyboard shortcuts (Ctrl+K), and enhanced user avatar dropdown.
 */
const StaffLayout = ({ children, title = 'Staff Portal', subtitle, icon: PageIcon }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { user, role, logout, avatarUrl, setAvatar, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const profileRef = useRef(null);

  const isDark = theme === 'dark';

  // Filter search index
  const filteredSearch = searchQuery.trim() === ''
    ? []
    : STAFF_SEARCH_INDEX.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

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
        setMobileSearchOpen(false);
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setShowProfile(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast?.info?.('Signed out. See you soon.');
      navigate('/login');
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleSaveProfile = async (payload) => {
    const res = await updateProfile(payload);
    if (res?.ok === false) {
      toast?.error?.(res.message || 'Could not save profile.');
      return res;
    }
    toast?.success?.(res?.message || 'Profile updated.');
    return { ok: true };
  };

  const handleSelectSearchResult = (path) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchFocused(false);
    setMobileSearchOpen(false);
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
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .staff-search-hit:hover { background: ${isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.05)'} !important; }
        }
      `}</style>
      <StaffSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* ── Right canvas ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden min-w-0">

        {/* ── Top Header Bar ── */}
        <header
          className="sticky top-0 z-30 px-3 sm:px-6 lg:px-8 backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(15,20,32,0.95)' : 'rgba(255,255,255,0.95)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.03)',
          }}
        >
          {mobileSearchOpen ? (
            /* ── Mobile search active row (sm:hidden) ── */
            <div className="flex items-center h-14 gap-2 w-full sm:hidden">
              <button
                type="button"
                onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 touch-manipulation cursor-pointer"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#a0aec0' : '#64748b',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                }}
                aria-label="Back to navigation"
              >
                <X className="w-4 h-4" />
              </button>
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all min-w-0"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? '#34d399' : '#0a3d30'}`,
                  boxShadow: `0 0 0 3px ${isDark ? 'rgba(52,211,153,0.15)' : 'rgba(10,61,48,0.1)'}`,
                }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: isDark ? '#34d399' : '#0a3d30' }} />
                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  autoFocus
                  placeholder="Search staff portal…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="bg-transparent border-none outline-none w-full text-xs font-medium placeholder:text-slate-400 min-w-0"
                  style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
                  aria-label="Search staff portal"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="p-1 rounded-md text-slate-400 shrink-0" aria-label="Clear search">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Mobile search results */}
              {searchQuery.trim() !== '' && (
                <div
                  className="fixed left-3 right-3 top-16 max-h-[60vh] overflow-y-auto rounded-2xl z-50 shadow-2xl p-1.5 overscroll-contain sm:hidden"
                  style={{
                    background: isDark ? '#1c2333' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <div
                    className="px-3 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      color: isDark ? '#8a9ab0' : '#64748b',
                    }}
                  >
                    <span>Results ({filteredSearch.length})</span>
                    <button
                      type="button"
                      onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}
                      className="text-[10px] lowercase opacity-70 underline"
                    >
                      close
                    </button>
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {filteredSearch.length > 0 ? filteredSearch.map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => handleSelectSearchResult(item.path)}
                        className="staff-search-hit w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 touch-manipulation min-h-[44px]"
                        style={{ background: 'transparent' }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>{item.label}</p>
                          <p className="text-[10px] mt-0.5 truncate" style={{ color: isDark ? '#5c6a7e' : '#64748b' }}>{item.desc}</p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ml-2 shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#a0aec0' : '#475569' }}>{item.category}</span>
                      </button>
                    )) : (
                      <div className="py-6 text-center text-xs" style={{ color: isDark ? '#5c6a7e' : '#64748b' }}>
                        No results for &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
          <div className="flex items-center justify-between h-14 gap-2 sm:gap-3" role="toolbar" aria-label="Header Controls">
          {/* Left: Hamburger + Page Icon + Page Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-1 sm:mr-2">
            <button
              onClick={() => {
                setIsSearchFocused(false);
                setMobileSearchOpen(false);
                setShowProfile(false);
                setMobileSidebarOpen(true);
              }}
              aria-label="Open navigation sidebar"
              aria-expanded={mobileSidebarOpen}
              aria-controls="staff-sidebar"
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#a0aec0' : '#64748b',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
              }}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Per-page icon chip — desktop only */}
            <div
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#041e16 0%,#0c4a36 60%,#bfa15f 100%)',
                boxShadow: '0 2px 12px rgba(10,61,48,0.35)',
              }}
            >
              {PageIcon
                ? <PageIcon className="w-4 h-4 text-amber-300" />
                : <Home className="w-4 h-4 text-amber-300" />}
            </div>

            <div className="min-w-0 flex-1">
              <h1
                className="text-sm sm:text-base lg:text-lg font-black tracking-tight leading-tight truncate"
                style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
              >
                {title}
              </h1>
              {subtitle && !mobileSearchOpen && (
                <p
                  className="hidden sm:block text-[10px] mt-0.5 font-medium leading-none truncate"
                  style={{ color: isDark ? '#5c6a7e' : '#8a9099' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" role="toolbar" aria-label="Right header controls">
            {/* Mobile search trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(true);
                setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
              }}
              className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 touch-manipulation cursor-pointer shrink-0"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                color: isDark ? '#a0aec0' : '#64748b',
              }}
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Desktop search (sm+) — fluid width, never crushes the header */}
            <div className="relative hidden sm:block" ref={searchContainerRef} role="search" aria-label="Staff search">
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 sm:w-44 md:w-52 lg:w-60 focus-within:w-48 sm:focus-within:w-64"
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
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? '#5c6a7e' : '#8a9099' }} aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  role="searchbox"
                  aria-label="Search staff portal (Ctrl+K)"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="bg-transparent border-none outline-none w-full text-xs font-medium placeholder:text-slate-400 min-w-0"
                  style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 rounded-md hover:opacity-75 transition-opacity shrink-0"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                ) : (
                  <kbd
                    className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded shrink-0"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      color: isDark ? '#8a9ab0' : '#8a9099',
                    }}
                  >
                    <Command className="w-2.5 h-2.5" />K
                  </kbd>
                )}
              </div>

              {/* Search Results Dropdown — responsive: full-width sheet on phones */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim() !== '' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="fixed left-3 right-3 top-[64px] sm:inset-auto sm:absolute sm:right-0 sm:top-full sm:mt-2.5 sm:w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
                    style={{
                      maxWidth: 'calc(100vw - 1.5rem)',
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

                    <div className="max-h-[50vh] sm:max-h-72 overflow-y-auto p-1.5 space-y-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {filteredSearch.length > 0 ? (
                        filteredSearch.map((item) => (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => handleSelectSearchResult(item.path)}
                            className="staff-search-hit w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-colors group touch-manipulation min-h-[44px]"
                            style={{ background: 'transparent' }}
                          >
                            <div>
                              <p
                                className="text-xs font-bold transition-colors group-hover:text-emerald-500"
                                style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}
                              >
                                {item.label}
                              </p>
                              <p
                                className="text-[10px] mt-0.5"
                                style={{ color: isDark ? '#5c6a7e' : '#8a9099' }}
                              >
                                {item.desc}
                              </p>
                            </div>
                            <span
                              className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                              style={{
                                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                color: isDark ? '#a0aec0' : '#64748b',
                              }}
                            >
                              {item.category}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No matching results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                color: isDark ? '#f59e0b' : '#0284c7',
              }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Unified minimalist identity: role + avatar in ONE pill */}
            <div className="relative" ref={profileRef}>
              <RoleIdentityBadge
                user={user}
                role={role || 'staff'}
                avatarUrl={avatarUrl}
                isDark={isDark}
                open={showProfile}
                onClick={() => setShowProfile((v) => !v)}
              />

              <ProfileMenu
                open={showProfile}
                onClose={() => setShowProfile(false)}
                user={user}
                role={role || 'staff'}
                avatarUrl={avatarUrl}
                isDark={isDark}
                triggerRef={profileRef}
                ariaLabel="Staff profile menu"
                fallbackName="Staff Coordinator"
                items={[
                  { id: 'profile', label: 'My Profile & Photo', icon: UserIcon, iconClass: 'text-emerald-500', onSelect: () => setShowProfileModal(true) },
                  { id: 'home', label: 'Public Website', icon: Home, iconClass: 'text-amber-500', onSelect: () => navigate('/') },
                  { id: 'logout', label: 'Sign Out', icon: LogOut, danger: true, dividerBefore: true, onSelect: handleLogout },
                ]}
              />
            </div>

            {/* End right controls + main row */}
          </div>
        </div>
        )}
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 px-3 sm:px-5 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        role={role || 'staff'}
        avatarUrl={avatarUrl}
        onAvatarChange={setAvatar}
        onSave={handleSaveProfile}
        isDark={isDark}
      />
      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => !loggingOut && setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Sign out?"
        message={`${user?.name || 'Staff'} — you will be signed out of the staff portal.`}
        confirmLabel="Sign Out"
        tone="logout"
        busy={loggingOut}
        busyLabel="Signing out…"
      />
    </div>
  );
};

export default StaffLayout;
