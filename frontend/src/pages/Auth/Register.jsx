import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Design helpers ──────────────────────────────────────────────────────────

const ClayCard = ({ children, className = '', style = {} }) => (
  <div
    className={`rounded-3xl ${className}`}
    style={{
      background: 'linear-gradient(145deg,#fdfcfa 0%,#f5f0e8 100%)',
      boxShadow: '24px 24px 48px #eae6df, -24px -24px 48px #ffffff, inset 4px 4px 10px rgba(255,255,255,0.9), inset -4px -4px 10px rgba(0,0,0,0.025)',
      border: '1px solid rgba(255,255,255,0.85)',
      ...style,
    }}
  >
    {children}
  </div>
);

const ClayInput = ({ label, id, rightAdornment, error, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        id={id}
        className="w-full px-4 py-3.5 rounded-2xl text-sm text-slate-700 placeholder-slate-400 outline-none transition pr-10"
        style={{
          background: 'linear-gradient(145deg,#f5f0e8,#ece8e0)',
          boxShadow: 'inset 4px 4px 8px #e0dbd3, inset -4px -4px 8px #ffffff',
          border: error ? '1.5px solid #fca5a5' : '1.5px solid transparent',
        }}
        {...props}
      />
      {rightAdornment && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          {rightAdornment}
        </div>
      )}
    </div>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Strict password requirements mapping the backend facade rules:
    // min 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!passwordRegex.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, numbers, and special symbols.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validation check
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const result = await register(name, email, password, confirmPassword);

    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.role === 'therapist') {
        navigate('/therapist/dashboard');
      } else {
        navigate('/booking/dashboard');
      }
    } else {
      if (result.errors) {
        // Map backend validation errors inline
        const mappedErrors = {};
        Object.keys(result.errors).forEach((key) => {
          // Map laravel snake_case or default keys to camelCase keys for state
          const fieldKey = key === 'password_confirmation' ? 'confirmPassword' : key;
          mappedErrors[fieldKey] = result.errors[key][0];
        });
        setFieldErrors(mappedErrors);
        setError('Please fix the validation errors below.');
      } else {
        setError(result.error);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-30 pointer-events-none blur-[80px]"
        style={{ background: 'radial-gradient(circle, #bfa15f40, transparent)' }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-20 pointer-events-none blur-[70px]"
        style={{ background: 'radial-gradient(circle, #062c2240, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo / brand header */}
        <div className="text-center mb-8">
          <img
            src="/cb-logo.jpg"
            alt="Cozy Blissful"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
            style={{ boxShadow: '0 8px 24px rgba(6,44,34,0.18), 0 0 0 4px rgba(191,161,95,0.25)' }}
          />
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">Register a new client account</p>
        </div>

        <ClayCard className="p-8 space-y-6">
          {/* Error alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl flex items-start space-x-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-red-600 font-medium">{error}</span>
            </motion.div>
          )}

          {/* Registration form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <ClayInput
              label="Full Name"
              id="register-name"
              type="text"
              required
              value={name}
              error={fieldErrors.name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="John Doe"
            />

            <ClayInput
              label="Email Address"
              id="register-email"
              type="email"
              required
              value={email}
              error={fieldErrors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              placeholder="name@example.com"
            />

            <ClayInput
              label="Password"
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              error={fieldErrors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              placeholder="••••••••"
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <ClayInput
              label="Confirm Password"
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              error={fieldErrors.confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                }
              }}
              placeholder="••••••••"
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 transition p-0.5"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <button
              type="submit"
              id="register-submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-4 font-bold text-white rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{
                background: 'linear-gradient(135deg,#062c22 0%,#0a3d30 100%)',
                boxShadow: '0 8px 24px rgba(6,44,34,0.22)',
              }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold transition-colors" style={{ color: '#062c22' }}>
              Login here
            </Link>
          </p>
        </ClayCard>
      </motion.div>
    </div>
  );
};

export default Register;
