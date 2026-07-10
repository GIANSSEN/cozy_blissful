import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle, Shield, User, Briefcase } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect dynamically based on role
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.role === 'therapist') {
        navigate('/therapist/dashboard');
      } else {
        navigate('/booking/dashboard');
      }
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleType) => {
    let testEmail = '';
    if (roleType === 'admin') {
      testEmail = 'admin@example.com';
    } else if (roleType === 'therapist') {
      testEmail = 'therapist@example.com';
    } else {
      testEmail = 'client@example.com';
    }
    
    setEmail(testEmail);
    setPassword('password');
    setError(null);
    setIsSubmitting(true);

    const result = await login(testEmail, 'password');
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.role === 'therapist') {
        navigate('/therapist/dashboard');
      } else {
        navigate('/booking/dashboard');
      }
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your role-based dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="glass py-8 px-6 sm:px-10 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-950/40 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-200"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </span>
              )}
            </button>
          </form>

          {/* Quick Login Helpers */}
          <div className="border-t border-slate-900 pt-6">
            <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Demo Quick Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex flex-col items-center justify-center space-y-1.5 transition"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('therapist')}
                className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex flex-col items-center justify-center space-y-1.5 transition"
              >
                <Briefcase className="w-4 h-4 text-emerald-500" />
                <span>Therapist</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('client')}
                className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex flex-col items-center justify-center space-y-1.5 transition"
              >
                <User className="w-4 h-4 text-indigo-500" />
                <span>Client</span>
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 transition font-medium">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
