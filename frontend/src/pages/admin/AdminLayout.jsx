import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, Settings, DollarSign, LogOut, Heart } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Services', path: '/admin/services', icon: Settings },
    { name: 'Payments', path: '/admin/payments', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span className="font-bold tracking-wider text-white text-lg">COZY BLISSFUL</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[140px]">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500 truncate max-w-[140px]">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-red-950/20 hover:text-red-400 rounded-xl text-sm font-medium transition duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Admin Management</h1>
            <p className="text-sm text-slate-400">Manage Cozy Blissful operational and business metrics</p>
          </div>
          <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 select-none">
            System Guard Active: Spatie permissions active
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
