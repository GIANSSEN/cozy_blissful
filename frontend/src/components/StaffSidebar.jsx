import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, ChevronDown,
  LogOut, Search, Moon, Sun, X, Home, ChevronLeft,
  CalendarDays, Clock, UserCheck, Activity,
  FileText,
} from 'lucide-react';

/* ── Staff-specific menu — limited scope ─────────────────────────── */
const MENU = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/staff/dashboard',
    subs: [],
  },
  {
    title: 'Therapist Management',
    icon: Users,
    path: null,
    basePath: '/staff/therapists',
    subs: [
      { label: 'Schedule Coordinator', tab: 'schedule',     path: '/staff/therapists' },
      { label: 'Availability Calendar', tab: 'availability', path: '/staff/therapists' },
    ],
  },
  {
    title: 'Bookings Overview',
    icon: Calendar,
    path: null,
    basePath: '/staff/appointments',
    subs: [
      { label: "Today's Bookings",   tab: 'today',    path: '/staff/appointments' },
      { label: 'Upcoming Bookings',  tab: 'upcoming', path: '/staff/appointments' },
    ],
  },
];

const SUB_ICON = {
  schedule: CalendarDays,
  availability: Activity,
  today: Clock,
  upcoming: UserCheck,
};

/* ── Colour tokens (same system as admin Sidebar) ────────────────── */
const L = {
  bg: '#ffffff', sidebar: '#ffffff',
  hover: '#f5f7fa', activeParent: '#f0f4ff', activeSub: '#eef2ff',
  activeSubTxt: '#3b55e6', accent: '#0a3d30', gold: '#bfa15f',
  border: 'rgba(0,0,0,0.07)',
  txt: '#1a1d23', txtMuted: '#8a9199', txtSub: '#4a5260',
};
const D = {
  bg: '#12161e', sidebar: '#161b26',
  hover: '#1e2535', activeParent: '#1c2840', activeSub: '#1a2c45',
  activeSubTxt: '#7aadff', accent: '#34d399', gold: '#d4b87a',
  border: 'rgba(255,255,255,0.07)',
  txt: '#dde3ef', txtMuted: '#4e5a70', txtSub: '#8a9ab0',
};

const StaffSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || '';
  const [search, setSearch] = useState('');
  const [openTitle, setOpenTitle] = useState(null);

  const t = theme === 'dark' ? D : L;
  const isDark = theme === 'dark';

  /* Auto-open the section matching the current URL */
  useEffect(() => {
    const found = MENU.find(m => m.basePath && location.pathname.startsWith(m.basePath));
    setOpenTitle(found ? found.title : null);
  }, [location.pathname]);

  /* Lock background scroll while the mobile drawer is open (mobile only) */
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023.98px)');
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const handleToggle = (title) => {
    setOpenTitle(prev => (prev === title ? null : title));
  };

  const handleLogout = async () => { await logout(); onClose?.(); navigate('/login'); };

  /* Search filter */
  const filtered = MENU.map(cat => {
    const q = search.toLowerCase();
    if (!q) return cat;
    const subHits = cat.subs.filter(s => s.label.toLowerCase().includes(q));
    const parentHit = cat.title.toLowerCase().includes(q);
    if (parentHit || subHits.length > 0) {
      return { ...cat, subs: parentHit ? cat.subs : subHits, forceOpen: true };
    }
    return null;
  }).filter(Boolean);

  const isSubActive = sub =>
    location.pathname === sub.path &&
    (activeTab === sub.tab ||
      (!activeTab && ['schedule', 'today'].includes(sub.tab)));

  return (
    <>
      {/* Hover/active visuals are CSS-only, gated behind
          (hover:hover) so touch devices never get sticky "auto touch"
          highlights from emulated mouseenter events. */}
      <style>{`
        #staff-sidebar { --sb-hover: ${t.hover}; --sb-danger: ${isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'}; -webkit-tap-highlight-color: transparent; }
        @media (hover: hover) and (pointer: fine) {
          #staff-sidebar .sb-item:not(.sb-active):hover { background: var(--sb-hover) !important; }
          #staff-sidebar .sb-danger:not(.sb-active):hover { background: var(--sb-danger) !important; }
        }
      `}</style>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        role="navigation"
        aria-label="Staff Navigation"
        id="staff-sidebar"
        className={`
          fixed lg:sticky top-0 h-[100dvh] flex flex-col shrink-0 z-[100] lg:z-30 antialiased select-none
          transition-transform duration-300 ease-out w-[min(86vw,320px)] lg:w-60 xl:w-[272px]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: t.sidebar,
          borderRight: `1px solid ${t.border}`,
          boxShadow: isDark ? '4px 0 40px rgba(0,0,0,0.45)' : '4px 0 24px rgba(0,0,0,0.06)',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
      >
        {/* ── Brand ── */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${t.border}` }}>
          <button type="button" onClick={() => { navigate('/staff/dashboard'); onClose?.(); }}
            aria-label="Go to Staff Dashboard"
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-xl p-1 -m-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none">
            <div className="w-9 h-9 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ boxShadow: '0 4px 14px rgba(10,61,48,0.35)' }}>
              <img src="/cb-logo.jpg" alt="CB" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black leading-tight truncate" style={{ color: t.txt }}>
                Cozy Blissful
              </p>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5 truncate"
                style={{ color: t.gold }}>
                Staff Portal
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            <button type="button" onClick={toggleTheme}
              aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              style={{ background: t.hover, color: t.txtMuted }}
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}>
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button type="button"
              aria-label="Close sidebar navigation"
              className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                color: isDark ? '#e8ecf3' : '#1a1d23',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}
              onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-4 pt-3 pb-1 flex-shrink-0" role="search">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: t.hover, border: `1px solid ${t.border}` }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.txtMuted }} aria-hidden="true" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search menus…"
              aria-label="Filter navigation menu"
              className="flex-1 bg-transparent text-[12px] outline-none min-w-0"
              style={{ color: t.txt }} />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search input" style={{ color: t.txtMuted }}>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── Label ── */}
        <div className="px-5 pt-3 pb-1 flex-shrink-0">
          <p className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: t.txtMuted }}>
            Staff Menu
          </p>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pb-2 space-y-0.5" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }} aria-label="Main Navigation">
          {filtered.map(cat => {
            const Icon = cat.icon;

            /* Dashboard: direct link, no accordion */
            if (cat.path && cat.subs.length === 0) {
              const active = location.pathname === cat.path;
              return (
                <Link key={cat.title} to={cat.path} onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors w-full min-h-[40px] active:scale-[0.98] touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none sb-item ${active ? 'sb-active' : ''}`}
                  style={{
                    background: active ? t.activeParent : 'transparent',
                    textDecoration: 'none',
                  }}>
                  <Icon className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
                    style={{ color: active ? t.accent : t.txtMuted }} />
                  <span className="text-[12.5px] font-semibold leading-tight flex-1"
                    style={{ color: active ? t.txt : t.txtSub, letterSpacing: '-0.01em' }}>
                    {cat.title}
                  </span>
                  {active && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: t.accent }} />
                  )}
                </Link>
              );
            }

            /* Accordion items */
            const basePath = cat.basePath || '';
            const isActive = location.pathname.startsWith(basePath);
            const isOpenNow = (openTitle === cat.title) || (search.length > 0 && cat.forceOpen);
            const subId = `staff-subnav-${cat.title.replace(/\s+/g, '-').toLowerCase()}`;

            return (
              <div key={cat.title}>
                <button
                  type="button"
                  onClick={() => handleToggle(cat.title)}
                  aria-expanded={isOpenNow}
                  aria-controls={subId}
                  className={`group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors min-h-[40px] active:scale-[0.98] touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none sb-item ${isActive ? 'sb-active' : ''}`}
                  style={{ background: isActive ? t.activeParent : 'transparent' }}>
                  <Icon className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
                    style={{ color: isActive ? t.accent : t.txtMuted }} />
                  <span className="flex-1 text-left text-[12.5px] font-semibold leading-tight truncate"
                    style={{ color: isActive ? t.txt : t.txtSub, letterSpacing: '-0.01em' }}>
                    {cat.title}
                  </span>
                  <motion.span animate={{ rotate: isOpenNow ? 180 : 0 }} transition={{ duration: 0.2 }}
                    className="flex-shrink-0">
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: t.txtMuted }} />
                  </motion.span>
                </button>

                {/* Sub-drawer */}
                <AnimatePresence initial={false}>
                  {isOpenNow && (
                    <motion.div key="sub"
                      id={subId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: 'hidden' }}>
                      <div className="ml-4 pl-3 py-1 space-y-0.5"
                        style={{ borderLeft: `1.5px solid ${t.border}` }}>
                        {cat.subs.map((sub, idx) => {
                          const active = isSubActive(sub);
                          const SubIcon = SUB_ICON[sub.tab] || FileText;
                          return (
                            <motion.div key={sub.label}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.18, delay: idx * 0.04, ease: 'easeOut' }}>
                              <Link to={`${sub.path}?tab=${sub.tab}`} onClick={onClose}
                                aria-current={active ? 'page' : undefined}
                                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors min-h-[36px] active:scale-[0.98] touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none sb-item ${active ? 'sb-active' : ''}`}
                                style={{
                                  background: active ? t.activeSub : 'transparent',
                                  textDecoration: 'none',
                                }}>
                                <SubIcon className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
                                  style={{ color: active ? t.activeSubTxt : t.txtMuted }} />
                                <span className="text-[11.5px] font-medium leading-tight truncate transition-transform duration-150 group-hover:translate-x-0.5"
                                  style={{ color: active ? t.activeSubTxt : t.txtSub, letterSpacing: '-0.005em' }}>
                                  {sub.label}
                                </span>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* ── Footer actions — pinned, respects phone gesture bar ── */}
        <div className="px-3 pt-3 flex-shrink-0 space-y-0.5" style={{ borderTop: `1px solid ${t.border}`, paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <Link to="/" onClick={onClose}
            aria-label="Back to Customer Website Homepage"
            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors min-h-[40px] touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none sb-item"
            style={{ background: 'transparent', textDecoration: 'none' }}>
            <Home className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5"
              style={{ color: t.txtMuted }} />
            <span className="flex-1 text-left text-[12.5px] font-semibold leading-tight"
              style={{ color: t.txtSub, letterSpacing: '-0.01em' }}>
              Back to Home
            </span>
            <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0"
              style={{ color: t.txtMuted }} />
          </Link>

          <button type="button" onClick={handleLogout}
            aria-label="Sign out of Staff Account"
            className="group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors min-h-[40px] touch-manipulation focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none sb-danger"
            style={{ background: 'transparent' }}>
            <LogOut className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
              style={{ color: '#ef4444' }} />
            <span className="flex-1 text-left text-[12.5px] font-semibold leading-tight"
              style={{ color: '#ef4444', letterSpacing: '-0.01em' }}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default StaffSidebar;
