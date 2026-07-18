import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, ChevronDown,
  LogOut, Search, Moon, Sun, X, Home,
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
      { label: "Today's Appointments", tab: 'today',    path: '/staff/appointments' },
      { label: 'Upcoming Sessions',     tab: 'upcoming', path: '/staff/appointments' },
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
  const { user, logout } = useAuth();
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

  const handleToggle = (title) => {
    setOpenTitle(prev => (prev === title ? null : title));
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

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
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed lg:sticky top-0 h-screen flex flex-col z-40
          transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: 252, minWidth: 252,
          background: t.sidebar,
          borderRight: `1px solid ${t.border}`,
          boxShadow: isDark ? '4px 0 40px rgba(0,0,0,0.45)' : '4px 0 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* ── Brand ── */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${t.border}` }}>
          <button onClick={() => navigate('/staff/dashboard')}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
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

          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <button onClick={toggleTheme}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: t.hover, color: t.txtMuted }}
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}>
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: t.hover, color: t.txtMuted }} onClick={onClose}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-4 pt-3 pb-1 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: t.hover, border: `1px solid ${t.border}` }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.txtMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search menus…"
              className="flex-1 bg-transparent text-[12px] outline-none min-w-0"
              style={{ color: t.txt }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: t.txtMuted }}>
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
        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
          {filtered.map(cat => {
            const Icon = cat.icon;

            /* Dashboard: direct link, no accordion */
            if (cat.path && cat.subs.length === 0) {
              const active = location.pathname === cat.path;
              return (
                <Link key={cat.title} to={cat.path} onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 w-full"
                  style={{
                    background: active ? t.activeParent : 'transparent',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.hover; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? t.activeParent : 'transparent'; }}>
                  <Icon className="w-4 h-4 flex-shrink-0"
                    style={{ color: active ? t.accent : t.txtMuted }} />
                  <span className="text-[12.5px] font-semibold leading-tight flex-1"
                    style={{ color: active ? t.txt : t.txtSub }}>
                    {cat.title}
                  </span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: t.accent }} />
                  )}
                </Link>
              );
            }

            /* Accordion items */
            const basePath = cat.basePath || '';
            const isActive = location.pathname.startsWith(basePath);
            const isOpenNow = (openTitle === cat.title) || (search.length > 0 && cat.forceOpen);

            return (
              <div key={cat.title}>
                <button
                  onClick={() => handleToggle(cat.title)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150"
                  style={{ background: isActive ? t.activeParent : 'transparent' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.hover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? t.activeParent : 'transparent'; }}>
                  <Icon className="w-4 h-4 flex-shrink-0"
                    style={{ color: isActive ? t.accent : t.txtMuted }} />
                  <span className="flex-1 text-left text-[12.5px] font-semibold leading-tight truncate"
                    style={{ color: isActive ? t.txt : t.txtSub }}>
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
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: 'hidden' }}>
                      <div className="ml-4 pl-3 py-1 space-y-0.5"
                        style={{ borderLeft: `1.5px solid ${t.border}` }}>
                        {cat.subs.map(sub => {
                          const active = isSubActive(sub);
                          const SubIcon = SUB_ICON[sub.tab] || FileText;
                          return (
                            <Link key={sub.label} to={`${sub.path}?tab=${sub.tab}`} onClick={onClose}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150"
                              style={{
                                background: active ? t.activeSub : 'transparent',
                                textDecoration: 'none',
                              }}
                              onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.hover; }}
                              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? t.activeSub : 'transparent'; }}>
                              <SubIcon className="w-3.5 h-3.5 flex-shrink-0"
                                style={{ color: active ? t.activeSubTxt : t.txtMuted }} />
                              <span className="text-[11.5px] font-medium leading-tight truncate"
                                style={{ color: active ? t.activeSubTxt : t.txtSub }}>
                                {sub.label}
                              </span>
                            </Link>
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

        {/* ── Bottom links ── */}
        <div className="px-3 pt-2 pb-1 space-y-0.5 flex-shrink-0"
          style={{ borderTop: `1px solid ${t.border}` }}>
          <Link to="/" onClick={onClose}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150"
            style={{ background: 'transparent', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = t.hover; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <Home className="w-4 h-4 flex-shrink-0" style={{ color: t.txtMuted }} />
            <span className="text-[12.5px] font-semibold" style={{ color: t.txtSub }}>Back to Home</span>
          </Link>
        </div>

        {/* ── User card ── */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 2px 8px rgba(6,44,34,0.3)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold truncate leading-tight" style={{ color: t.txt }}>
                {user?.name || 'Staff'}
              </p>
              <p className="text-[10px] truncate mt-0.5" style={{ color: t.txtMuted }}>
                {user?.email || 'staff@cozy.spa'}
              </p>
            </div>
            <button title="Sign Out" onClick={handleLogout}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
              style={{ color: t.txtMuted }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = t.hover; }}
              onMouseLeave={e => { e.currentTarget.style.color = t.txtMuted; e.currentTarget.style.background = 'transparent'; }}>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StaffSidebar;
