import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, ShoppingBag,
  Package, CreditCard, Settings, ChevronDown,
  LogOut, Search, Bell, HelpCircle,
  Moon, Sun, X, Home,
  TrendingUp, DollarSign, TrendingDown, Clock, AlertCircle,
  UserCheck, ShieldAlert, Gift, Hourglass, Tags, Truck,
  FileText, Coins, Wallet, UserCog, Megaphone, Boxes,
  History, Star, HeartPulse, ListOrdered,
} from 'lucide-react';

/* ── Menu: Dashboard has NO submenus — it is a direct link ─────────── */
const MENU = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard',   // direct link, no subs
    subs: [],
  },
  {
    title: 'Appointments',
    icon: Calendar,
    path: null,
    basePath: '/admin/appointments',
    subs: [
      { label: 'Calendar', tab: 'calendar', path: '/admin/appointments' },
      { label: 'Pending',  tab: 'pending',  path: '/admin/appointments' },
      { label: 'Requests', tab: 'requests', path: '/admin/appointments' },
    ],
  },
  {
    title: 'Customers',
    icon: Users,
    path: null,
    basePath: '/admin/customers',
    subs: [
      { label: 'Customer Profiles',          tab: 'profiles', path: '/admin/customers' },
      { label: 'Reviews & Feedback',         tab: 'reviews',  path: '/admin/customers' },
      { label: 'Medical & Allergy Records',  tab: 'medical',  path: '/admin/customers' },
    ],
  },
  {
    title: 'Staff & Schedule',
    icon: UserCog,
    path: null,
    basePath: '/admin/staff',
    subs: [
      { label: 'Attendance & Profiles', tab: 'profiles', path: '/admin/staff' },
      { label: 'Therapist Queue',       tab: 'queue',    path: '/admin/staff' },
      { label: 'System Permissions',    tab: 'rbac',     path: '/admin/staff' },
    ],
  },
  {
    title: 'Services & Offers',
    icon: ShoppingBag,
    path: null,
    basePath: '/admin/services',
    subs: [
      { label: 'All Services', tab: 'all',        path: '/admin/services' },
      { label: 'Categories',   tab: 'categories', path: '/admin/services' },
    ],
  },
  {
    title: 'Marketing & Loyalty',
    icon: Megaphone,
    path: null,
    basePath: '/admin/marketing',
    subs: [
      { label: 'Gift Cards & Vouchers', tab: 'giftcards', path: '/admin/marketing' },
      { label: 'Promo Campaigns',       tab: 'promos',    path: '/admin/marketing' },
    ],
  },
  {
    title: 'Inventory',
    icon: Package,
    path: null,
    basePath: '/admin/products',
    subs: [
      { label: 'Product Catalog',    tab: 'retail',    path: '/admin/products' },
      { label: 'Stock Control',      tab: 'stock',     path: '/admin/products' },
      { label: 'Suppliers & Orders', tab: 'suppliers', path: '/admin/products' },
    ],
  },
  {
    title: 'Financials',
    icon: CreditCard,
    path: null,
    basePath: '/admin/payments',
    subs: [
      { label: 'Sales',                 tab: 'sales',    path: '/admin/payments' },
      { label: 'Payroll & Commissions', tab: 'payroll',  path: '/admin/payments' },
      { label: 'Expense Tracker',       tab: 'expenses', path: '/admin/payments' },
    ],
  },
  {
    title: 'Audit Logs',
    icon: History,
    path: '/admin/audit-logs',
    basePath: '/admin/audit-logs',
    subs: [],
  },
  {
    title: 'System Settings',
    icon: Settings,
    path: '/admin/settings',
    basePath: '/admin/settings',
    subs: [],
  },
];

const SUB_ICON = {
  calendar: Calendar,   pending: Clock,        requests: AlertCircle,
  profiles: UserCheck,  reviews: Star,         medical: HeartPulse,
  queue: ListOrdered,   rbac: ShieldAlert,
  all: ShoppingBag,     categories: Hourglass,
  giftcards: Gift,      promos: Megaphone,
  retail: Tags,         stock: Truck,          suppliers: Boxes,
  sales: DollarSign,    payroll: Coins,        expenses: Wallet,
};

/* ── Colour tokens ──────────────────────────────────────────────────── */
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

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || '';
  const [search, setSearch] = useState('');

  /* ── Accordion: only ONE item expanded at a time ── */
  const [openTitle, setOpenTitle] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const t = theme === 'dark' ? D : L;
  const isDark = theme === 'dark';

  /* Auto-open the section matching the current URL */
  useEffect(() => {
    const found = MENU.find(m => m.basePath && location.pathname.startsWith(m.basePath));
    setOpenTitle(found ? found.title : null);
  }, [location.pathname]);

  /* Accordion toggle — closes current if same, closes old & opens new if different */
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

  const isSubActive = sub => {
    if (location.pathname !== sub.path) return false;
    if (activeTab) return activeTab === sub.tab;
    const parentCat = MENU.find(m => m.basePath === sub.path);
    return parentCat?.subs?.[0]?.tab === sub.tab;
  };

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
          width: 272, minWidth: 272,
          background: t.sidebar,
          borderRight: `1px solid ${t.border}`,
          boxShadow: isDark ? '4px 0 40px rgba(0,0,0,0.45)' : '4px 0 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* ── Brand ── */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${t.border}` }}>
          <button onClick={() => { navigate('/admin/dashboard'); onClose?.(); }}
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
                Home Service Spa
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
            Main Menu
          </p>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
          {filtered.map(cat => {
            const Icon = cat.icon;

            /* Dashboard: direct link, no accordion */
            if (cat.path && cat.subs.length === 0) {
              const active = location.pathname === cat.path || (cat.basePath && location.pathname.startsWith(cat.basePath));
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

            /* Other menu items: accordion */
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

        {/* ── User profile with clickable popover ── */}
        <div ref={profileRef} className="relative py-5 flex justify-center items-center flex-shrink-0" style={{ borderTop: `1px solid ${t.border}` }}>
          <button 
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '0 2px 10px rgba(6,44,34,0.3)' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            
            {/* Online Status Indicator Dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </button>

          {/* Clickable Menu Popover */}
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-[90%] left-3 right-3 lg:bottom-4 lg:left-[80%] lg:right-auto lg:w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] z-50 flex flex-col gap-1"
              >
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-left">
                  <p className="text-[9px] font-black tracking-wider uppercase text-amber-500">{user?.role || 'Administrator'}</p>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                </div>
                
                <Link to="/" onClick={() => { setProfileMenuOpen(false); onClose?.(); }} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors mt-1" style={{ textDecoration: 'none' }}>
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Back to Landing</span>
                </Link>
                
                <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left">
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
