import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, Users, ShoppingBag,
  Package, CreditCard, Settings, ChevronRight, ChevronDown,
  LogOut, Search, Bell, MessageSquare, HelpCircle, Sparkles,
  TrendingUp, DollarSign, TrendingDown, Clock, AlertCircle,
  UserCheck, ShieldAlert, Gift, Hourglass, Tags, Beaker, Truck,
  FileText, Coins, Wallet, Sliders, Globe, X
} from 'lucide-react';

const MENU_STRUCTURE = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    basePath: '/admin/dashboard',
    submenus: [
      { label: 'Operational Overview', tab: 'operational', path: '/admin/dashboard' },
      { label: 'Sales & Revenue Analytics', tab: 'sales', path: '/admin/dashboard' },
      { label: 'Booking Funnel Stats', tab: 'funnel', path: '/admin/dashboard' }
    ]
  },
  {
    title: 'Bookings & Appointments',
    icon: Calendar,
    basePath: '/admin/appointments',
    submenus: [
      { label: 'Master Calendar View', tab: 'calendar', path: '/admin/appointments' },
      { label: 'Pending Approvals', tab: 'pending', path: '/admin/appointments' },
      { label: 'Cancellation & Reschedule', tab: 'requests', path: '/admin/appointments' }
    ]
  },
  {
    title: 'User Management',
    icon: Users,
    basePath: '/admin/staff',
    submenus: [
      { label: 'Therapists & Staff Profiles', tab: 'profiles', path: '/admin/staff' },
      { label: 'Customer Database', tab: 'customers', path: '/admin/staff' },
      { label: 'Role Access Control (RBAC)', tab: 'rbac', path: '/admin/staff' }
    ]
  },
  {
    title: 'Service Maintenance',
    icon: ShoppingBag,
    basePath: '/admin/services',
    submenus: [
      { label: 'All Services', tab: 'all', path: '/admin/services' },
      { label: 'Promos & Packages', tab: 'promos', path: '/admin/services' },
      { label: 'Categories & Durations', tab: 'categories', path: '/admin/services' }
    ]
  },
  {
    title: 'Product Maintenance',
    icon: Package,
    basePath: '/admin/products',
    submenus: [
      { label: 'Retail Products', tab: 'retail', path: '/admin/products' },
      { label: 'Internal Supplies', tab: 'supplies', path: '/admin/products' },
      { label: 'Stock Control & Suppliers', tab: 'stock', path: '/admin/products' }
    ]
  },
  {
    title: 'Financials & Reports',
    icon: CreditCard,
    basePath: '/admin/payments',
    submenus: [
      { label: 'Daily Sales Logs', tab: 'sales', path: '/admin/payments' },
      { label: 'Payroll & Commissions', tab: 'payroll', path: '/admin/payments' },
      { label: 'Expense Tracker', tab: 'expenses', path: '/admin/payments' }
    ]
  },
  {
    title: 'System Settings',
    icon: Settings,
    basePath: '/admin/settings',
    submenus: [
      { label: 'Spa Configuration', tab: 'config', path: '/admin/settings' },
      { label: 'Content Management (CMS)', tab: 'cms', path: '/admin/settings' },
      { label: 'Notification Rules', tab: 'notifications', path: '/admin/settings' }
    ]
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || '';
  const [search, setSearch] = useState('');
  
  // Track expanded parent menu items
  const [expanded, setExpanded] = useState({});

  // Auto-expand active parent category on mount or navigation
  useEffect(() => {
    const activeParent = MENU_STRUCTURE.find(item => 
      location.pathname.startsWith(item.basePath)
    );
    if (activeParent) {
      setExpanded(prev => ({ ...prev, [activeParent.title]: true }));
    }
  }, [location.pathname]);

  const toggleExpand = (title) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter menu items by search keyword
  const filteredMenu = MENU_STRUCTURE.map(category => {
    const matchingSubmenus = category.submenus.filter(sub => 
      sub.label.toLowerCase().includes(search.toLowerCase())
    );
    const parentMatches = category.title.toLowerCase().includes(search.toLowerCase());
    
    if (parentMatches || matchingSubmenus.length > 0) {
      return {
        ...category,
        submenus: parentMatches ? category.submenus : matchingSubmenus,
        // Auto-expand if search query matches something inside
        forceExpand: search.length > 0
      };
    }
    return null;
  }).filter(Boolean);

  const getSubmenuIcon = (tab) => {
    switch (tab) {
      // Dashboard
      case 'operational': return TrendingUp;
      case 'sales': return DollarSign;
      case 'funnel': return TrendingDown;
      // Bookings
      case 'calendar': return Calendar;
      case 'pending': return Clock;
      case 'requests': return AlertCircle;
      // User management
      case 'profiles': return UserCheck;
      case 'customers': return Users;
      case 'rbac': return ShieldAlert;
      // Services
      case 'all': return ShoppingBag;
      case 'promos': return Gift;
      case 'categories': return Hourglass;
      // Products
      case 'retail': return Tags;
      case 'supplies': return Beaker;
      case 'stock': return Truck;
      // Financials
      case 'payroll': return Coins;
      case 'expenses': return Wallet;
      // Settings
      case 'config': return Sliders;
      case 'cms': return Globe;
      case 'notifications': return Bell;
      default: return FileText;
    }
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 h-screen w-[260px] flex flex-col z-40 transition-transform duration-350 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        background: '#faf8f5',
        boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        borderRight: '1px solid rgba(0,0,0,0.03)',
      }}
    >
      {/* ── Brand / Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all duration-200 hover:shadow-sm"
          style={{
            background: 'linear-gradient(135deg,#fdfcfa 0%,#f3ede4 100%)',
            boxShadow: '3px 3px 8px #e5decb, -3px -3px 8px #ffffff',
            border: '1px solid rgba(191,161,95,0.15)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/cb-logo.jpg"
              alt="CB"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              style={{ boxShadow: '1px 1px 4px rgba(0,0,0,0.1)' }}
            />
            <div className="min-w-0">
              <p className="text-xs font-black text-emerald-950 truncate leading-tight">Cozy Blissful</p>
              <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ color: '#a08742' }}>Home Service Spa</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </button>

        {/* Mobile Close Button */}
        <button
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 ml-2"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Search ─────────────────────────────────────────────────── */}
      <div className="px-5 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ boxShadow: 'inset 2px 2px 6px #e8e2d4, inset -2px -2px 6px #ffffff' }}
        >
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menus..."
            className="flex-1 bg-transparent text-xs text-slate-600 placeholder-slate-400 outline-none min-w-0"
          />
        </div>
      </div>

      {/* ── Collapsible Menu Stack ──────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pb-4 custom-scrollbar">
        {filteredMenu.map((category) => {
          const Icon = category.icon;
          const isSelected = location.pathname.startsWith(category.basePath);
          const isExpanded = expanded[category.title] || category.forceExpand;

          return (
            <div key={category.title} className="space-y-0.5">
              {/* Category Header */}
              <button
                onClick={() => toggleExpand(category.title)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                  isSelected 
                    ? 'text-emerald-950 bg-[#f4ebd9]/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-800' : 'text-slate-400'}`} />
                  <span className="truncate">{category.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Submenu Drawer */}
              {isExpanded && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-200/60 ml-5">
                  {category.submenus.map((sub) => {
                    const isSubActive = location.pathname === sub.path && (activeTab === sub.tab || (sub.tab === 'operational' && !activeTab) || (sub.tab === 'calendar' && !activeTab) || (sub.tab === 'profiles' && !activeTab) || (sub.tab === 'all' && !activeTab) || (sub.tab === 'retail' && !activeTab) || (sub.tab === 'sales' && !activeTab && sub.path === '/admin/payments') || (sub.tab === 'config' && !activeTab && sub.path === '/admin/settings'));
                    const SubIcon = getSubmenuIcon(sub.tab);
                    
                    return (
                      <Link
                        key={sub.label}
                        to={`${sub.path}?tab=${sub.tab}`}
                        onClick={onClose} // close mobile drawer
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                          isSubActive
                            ? 'text-emerald-950 font-bold bg-[#ece6da]/50 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                        }`}
                      >
                        <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-emerald-800' : 'text-slate-400'}`} />
                        <span className="truncate">{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div
        className="px-4 py-4 border-t space-y-3 flex-shrink-0"
        style={{ borderColor: 'rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-2.5 px-1.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '1px 1px 4px rgba(6,44,34,0.2)' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || 'admin@cozy.spa'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {[
            { Icon: Bell,          label: 'Notifications' },
            { Icon: MessageSquare, label: 'Messages'      },
            { Icon: HelpCircle,    label: 'Help'          },
            { Icon: Sparkles,      label: 'AI Helper'     },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              title={label}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-800 transition-all duration-200"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <button
            title="Sign Out"
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
