import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Calendar, ShoppingBag, CreditCard, Globe,
  Users, BarChart2, UserCheck, Landmark, Settings,
  PlusCircle, Bell, MessageSquare, HelpCircle, Sparkles,
  ChevronRight, LogOut, Search,
} from 'lucide-react';

// ── Nav item definition ────────────────────────────────────────────────────
const navMain = [
  { label: 'Home',                path: '/admin/dashboard',     icon: Home        },
  { label: 'Appointments',        path: '/admin/appointments',  icon: Calendar    },
  { label: 'Services & items',    path: '/admin/services',      icon: ShoppingBag },
  { label: 'Payments & invoices', path: '/admin/payments',      icon: CreditCard  },
  { label: 'Online',              path: '/admin/online',        icon: Globe       },
  { label: 'Customers',           path: '/admin/customers',     icon: Users       },
  { label: 'Reports',             path: '/admin/reports',       icon: BarChart2   },
  { label: 'Staff',               path: '/admin/staff',         icon: UserCheck   },
  { label: 'Banking',             path: '/admin/banking',       icon: Landmark    },
  { label: 'Settings',            path: '/admin/settings',      icon: Settings    },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filtered = navMain.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="w-[200px] min-h-screen flex flex-col relative z-10"
      style={{
        background: '#faf8f5',
        boxShadow: '4px 0 24px rgba(0,0,0,0.06)',
        borderRight: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Brand Selector ─────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3">
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all duration-200 hover:shadow-clay-sm group"
          style={{
            background: 'linear-gradient(135deg,#fdfcfa 0%,#f3ede4 100%)',
            boxShadow: '4px 4px 10px #e0dbd3, -4px -4px 10px #ffffff',
            border: '1px solid rgba(191,161,95,0.15)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/cb-logo.jpg"
              alt="CB"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              style={{ boxShadow: '2px 2px 6px rgba(0,0,0,0.15)' }}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-900 truncate leading-tight">Cozy Blissful</p>
              <p className="text-[10px] text-gold-700 font-medium tracking-wide uppercase leading-tight" style={{ color: '#a08742' }}>Home Service Spa</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ── Search ─────────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-2xl"
          style={{ boxShadow: 'inset 3px 3px 7px #e5e0d8, inset -3px -3px 7px #ffffff' }}
        >
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-xs text-slate-600 placeholder-slate-400 outline-none min-w-0"
          />
        </div>
      </div>

      {/* ── Main Nav ───────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto pb-4">
        {filtered.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path ||
            (path === '/admin/dashboard' && location.pathname === '/admin');
          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 group ${
                active
                  ? 'text-emerald-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg,#fdfcfa 0%,#ece8e0 100%)',
                      boxShadow: '4px 4px 10px #ddd8cf, -4px -4px 10px #ffffff, inset 1px 1px 3px rgba(255,255,255,0.9)',
                      color: '#062c22',
                      fontWeight: 600,
                    }
                  : {}
              }
            >
              <Icon
                className="w-4 h-4 flex-shrink-0 transition-colors"
                style={{ color: active ? '#062c22' : undefined }}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}

        {/* Add more */}
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-all mt-1">
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          <span>Add more</span>
        </button>
      </nav>

      {/* ── Footer Utilities ───────────────────────────────────────── */}
      <div
        className="px-4 py-4 border-t space-y-3"
        style={{ borderColor: 'rgba(0,0,0,0.05)' }}
      >
        {/* User profile */}
        <button className="w-full flex items-center gap-2.5 text-left group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#062c22,#0f5040)', boxShadow: '2px 2px 6px rgba(6,44,34,0.3)' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-700 truncate leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@cozy.spa'}</p>
          </div>
        </button>

        {/* Bottom icon row */}
        <div className="flex items-center justify-between">
          {[
            { Icon: Bell,          label: 'Notifications' },
            { Icon: MessageSquare, label: 'Messages'      },
            { Icon: HelpCircle,    label: 'Help'          },
            { Icon: Sparkles,      label: 'AI'            },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              title={label}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-800 transition-all duration-200"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '3px 3px 8px #ddd8cf, -3px -3px 8px #ffffff';
                e.currentTarget.style.background = '#faf8f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <button
            title="Sign Out"
            onClick={handleLogout}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
