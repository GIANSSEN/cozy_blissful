import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import {
  Sliders, Globe, Bell, Save, CheckCircle2, UserPlus,
  Users, Shield, Clock, Phone, Mail, MapPin, Sparkles,
  Plus, Search, X, Edit3, Lock, Eye, EyeOff, AlertCircle,
  BadgeCheck, RotateCcw, Key, Percent, Briefcase,
  DollarSign, Building, ChevronRight, CheckCheck, RefreshCw, Send
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────── */
/*  INITIAL MOCK DATA & CONFIG                                          */
/* ─────────────────────────────────────────────────────────────────── */

const INITIAL_STAFF = [
  { id: 1, name: 'Maria Santos', email: 'maria.santos@cozy.spa', phone: '+63 917 111 2222', role: 'staff', specialty: 'Front Desk & Scheduling', shift: 'Morning', commRate: 0, status: 'active', joined: '2025-01-15', emergency: 'Juan Santos (+63 917 000 1111)' },
  { id: 2, name: 'Anna Reyes', email: 'anna.reyes@cozy.spa', phone: '+63 919 555 6666', role: 'therapist', specialty: 'Swedish & Hot Stone Massage', shift: 'Afternoon', commRate: 35, status: 'active', joined: '2025-02-20', emergency: 'Pedro Reyes (+63 919 000 2222)' },
  { id: 3, name: 'Juan Dela Cruz', email: 'juan.delacruz@cozy.spa', phone: '+63 918 333 4444', role: 'manager', specialty: 'Operations & Inventory Lead', shift: 'Full Day', commRate: 0, status: 'active', joined: '2025-01-05', emergency: 'Elena Dela Cruz (+63 918 000 3333)' },
  { id: 4, name: 'Grace Tan', email: 'grace.tan@cozy.spa', phone: '+63 921 999 0000', role: 'therapist', specialty: 'Hilot & Shiatsu Therapy', shift: 'Evening', commRate: 30, status: 'inactive', joined: '2025-03-01', emergency: 'Kevin Tan (+63 921 000 4444)' }
];

const ROLE_DETAILS = {
  manager: { label: 'Spa Manager', desc: 'Full operational override & financials access', color: '#0a3d30', bg: 'rgba(10,61,48,0.1)', grad: 'linear-gradient(135deg,#062c22,#0a3d30)' },
  staff: { label: 'Staff Coordinator', desc: 'Appointment booking, customer queue & scheduling', color: '#3b55e6', bg: 'rgba(59,85,230,0.1)', grad: 'linear-gradient(135deg,#1e3a8a,#3b55e6)' },
  therapist: { label: 'Therapist Practitioner', desc: 'Assigned home-service sessions & commission tracking', color: '#b45309', bg: 'rgba(180,83,9,0.1)', grad: 'linear-gradient(135deg,#78350f,#b45309)' },
  receptionist: { label: 'Front Desk Reception', desc: 'Inquiries, walk-ins & customer registration', color: '#0891b2', bg: 'rgba(8,145,178,0.1)', grad: 'linear-gradient(135deg,#164e63,#0891b2)' }
};

const SHIFTS = ['Morning (06:00 AM - 02:00 PM)', 'Afternoon (01:00 PM - 09:00 PM)', 'Evening (03:00 PM - 11:00 PM)', 'Full Day / Flexible'];

/* ─────────────────────────────────────────────────────────────────── */
/*  VALIDATION ENGINE FOR STAFF FORM                                    */
/* ─────────────────────────────────────────────────────────────────── */

function validateStaffForm(form, existingStaff = [], isEdit = false, currentId = null) {
  const errors = {};

  // Name
  if (!form.name.trim()) {
    errors.name = 'Full name is required';
  } else if (form.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  // Email
  if (!form.email.trim()) {
    errors.email = 'Work email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address (e.g. name@cozy.spa)';
  } else {
    const duplicate = existingStaff.find(s => s.email.toLowerCase() === form.email.trim().toLowerCase() && (!isEdit || s.id !== currentId));
    if (duplicate) {
      errors.email = 'This email address is already assigned to another staff member';
    }
  }

  // Phone
  if (!form.phone.trim()) {
    errors.phone = 'Mobile contact number is required';
  } else if (!/^(09|\+639)\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Enter a valid PH mobile number (e.g. +63 917 123 4567 or 09171234567)';
  }

  // Specialty
  if (!form.specialty.trim()) {
    errors.specialty = 'Specialization / Role Position title is required';
  }

  // Commission Rate
  if (form.role === 'therapist') {
    const comm = Number(form.commRate);
    if (isNaN(comm) || comm < 0 || comm > 100) {
      errors.commRate = 'Commission rate must be between 0% and 100%';
    }
  }

  // Password Validation for New Staff
  if (!isEdit) {
    if (!form.password) {
      errors.password = 'Initial password is required for account creation';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = 'Password must contain at least one uppercase letter (A-Z)';
    } else if (!/[0-9]/.test(form.password)) {
      errors.password = 'Password must contain at least one number (0-9)';
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return errors;
}

/* ─────────────────────────────────────────────────────────────────── */
/*  ADD STAFF MODAL (SENIOR DEV UX & VALIDATION)                        */
/* ─────────────────────────────────────────────────────────────────── */

function AddStaffModal({ isOpen, onClose, onAddStaff, existingStaff }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'therapist',
    specialty: '',
    shift: 'Morning (06:00 AM - 02:00 PM)',
    commRate: 35,
    status: 'active',
    emergency: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      setForm({
        name: '',
        email: '',
        phone: '',
        role: 'therapist',
        specialty: '',
        shift: 'Morning (06:00 AM - 02:00 PM)',
        commRate: 35,
        status: 'active',
        emergency: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pwd = 'CB@';
    for (let i = 0; i < 7; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pwd += Math.floor(Math.random() * 90 + 10);
    handleChange('password', pwd);
    handleChange('confirmPassword', pwd);
  };

  const handleNext = () => {
    const step1Errors = {};
    if (!form.name.trim()) step1Errors.name = 'Full name is required';
    if (!form.email.trim()) step1Errors.email = 'Work email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) step1Errors.email = 'Valid email is required';
    else if (existingStaff.find(s => s.email.toLowerCase() === form.email.trim().toLowerCase())) step1Errors.email = 'Email already registered';
    if (!form.phone.trim()) step1Errors.phone = 'Mobile contact is required';
    if (!form.specialty.trim()) step1Errors.specialty = 'Specialization is required';

    if (Object.keys(step1Errors).length > 0) {
      setErrors(step1Errors);
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateStaffForm(form, existingStaff, false);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.name || validationErrors.email || validationErrors.phone || validationErrors.specialty) {
        setStep(1);
      }
      return;
    }

    const newStaffObj = {
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role,
      specialty: form.specialty.trim(),
      shift: form.shift.split(' ')[0],
      commRate: form.role === 'therapist' ? Number(form.commRate) : 0,
      status: form.status,
      joined: new Date().toISOString().split('T')[0],
      emergency: form.emergency.trim() || 'N/A'
    };

    onAddStaff(newStaffObj);
    onClose();
  };

  const selectedRole = ROLE_DETAILS[form.role] || ROLE_DETAILS.therapist;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8 ${
          isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: selectedRole.grad }}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Onboard New Staff Member</h3>
              <p className="text-xs text-slate-400">Step {step} of 2 — {step === 1 ? 'Personal & Professional Details' : 'Account Access & Security'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5">
          <motion.div
            className="h-full bg-emerald-500"
            animate={{ width: step === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {step === 1 ? (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Select Staff System Role *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(ROLE_DETAILS).map(([rKey, rMeta]) => {
                    const isSelected = form.role === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => handleChange('role', rKey)}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition ${
                          isSelected
                            ? isDark
                              ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                              : 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600'
                            : isDark
                              ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: rMeta.grad }}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{rMeta.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{rMeta.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Teresa Mendoza"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition ${
                      errors.name
                        ? 'border-red-500 bg-red-50/20 text-red-500'
                        : isDark ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Work Email Address *</label>
                  <input
                    type="email"
                    placeholder="teresa@cozy.spa"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition ${
                      errors.email
                        ? 'border-red-500 bg-red-50/20 text-red-500'
                        : isDark ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Mobile Contact Number *</label>
                  <input
                    type="text"
                    placeholder="+63 917 888 9999"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition ${
                      errors.phone
                        ? 'border-red-500 bg-red-50/20 text-red-500'
                        : isDark ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone}</p>}
                </div>

                {/* Specialization / Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Specialization / Position Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Deep Tissue & Reflexology"
                    value={form.specialty}
                    onChange={(e) => handleChange('specialty', e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition ${
                      errors.specialty
                        ? 'border-red-500 bg-red-50/20 text-red-500'
                        : isDark ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                  {errors.specialty && <p className="text-[10px] text-red-500 font-medium">{errors.specialty}</p>}
                </div>

                {/* Shift Preference */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Default Assigned Shift</label>
                  <select
                    value={form.shift}
                    onChange={(e) => handleChange('shift', e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition ${
                      isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'
                    }`}
                  >
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Commission Rate (Therapist only) */}
                {form.role === 'therapist' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Commission Share Rate (%) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="35"
                        value={form.commRate}
                        onChange={(e) => handleChange('commRate', e.target.value)}
                        className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition pr-8 ${
                          errors.commRate
                            ? 'border-red-500 bg-red-50/20 text-red-500'
                            : isDark ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600'
                        }`}
                      />
                      <Percent className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                    </div>
                    {errors.commRate && <p className="text-[10px] text-red-500 font-medium">{errors.commRate}</p>}
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">Emergency Contact Person & Contact No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Roberto Mendoza (+63 918 777 6666)"
                  value={form.emergency}
                  onChange={(e) => handleChange('emergency', e.target.value)}
                  className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition ${
                    isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Staff Summary Card Preview */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold" style={{ background: selectedRole.grad }}>
                    {form.name ? form.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{form.name || 'Unnamed Staff Member'}</h4>
                    <p className="text-[11px] text-slate-400">{form.email || 'no-email'} • {form.specialty || selectedRole.label}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: selectedRole.bg, color: selectedRole.color }}>
                  {selectedRole.label}
                </span>
              </div>

              {/* Password Setup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-400">Login Initial Password *</label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate Secure Pass
                  </button>
                </div>

                {/* Password input */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters with Uppercase & Number"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition pr-10 ${
                      errors.password
                        ? 'border-red-500 bg-red-50/20 text-red-500'
                        : isDark ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-medium">{errors.password}</p>}

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter initial password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none transition ${
                      errors.confirmPassword
                        ? 'border-red-500 bg-red-50/20 text-red-500'
                        : isDark ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 font-medium">{errors.confirmPassword}</p>}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-xs font-semibold">Immediate Activation Status</p>
                    <p className="text-[11px] text-slate-400">Active accounts can log into their respective staff/therapist portals immediately.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('status', form.status === 'active' ? 'inactive' : 'active')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      form.status === 'active'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                        : 'border-slate-600 bg-slate-800 text-slate-400'
                    }`}
                  >
                    {form.status === 'active' ? '✓ Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </form>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ← Back to Details
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20"
            >
              Continue to Security →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Save & Create Staff Account
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  EDIT STAFF MODAL                                                    */
/* ─────────────────────────────────────────────────────────────────── */

function EditStaffModal({ isOpen, onClose, staffMember, onSaveStaff, existingStaff }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'therapist',
    specialty: '',
    shift: 'Morning',
    commRate: 35,
    status: 'active',
    emergency: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (staffMember) {
      setForm({
        name: staffMember.name || '',
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        role: staffMember.role || 'therapist',
        specialty: staffMember.specialty || '',
        shift: staffMember.shift || 'Morning',
        commRate: staffMember.commRate ?? 35,
        status: staffMember.status || 'active',
        emergency: staffMember.emergency || ''
      });
      setErrors({});
    }
  }, [staffMember]);

  if (!isOpen || !staffMember) return null;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const validationErrors = validateStaffForm(form, existingStaff, true, staffMember.id);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSaveStaff({
      ...staffMember,
      ...form,
      commRate: form.role === 'therapist' ? Number(form.commRate) : 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden ${
          isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold bg-emerald-600">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Edit Staff Profile</h3>
              <p className="text-[11px] text-slate-400">{staffMember.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none ${
                  errors.name ? 'border-red-500' : isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none ${
                  errors.email ? 'border-red-500' : isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Phone Contact *</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none ${
                  errors.phone ? 'border-red-500' : isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Specialty / Title *</label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none ${
                  errors.specialty ? 'border-red-500' : isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {errors.specialty && <p className="text-[10px] text-red-500">{errors.specialty}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Assigned Role</label>
              <select
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none ${
                  isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}
              >
                {Object.entries(ROLE_DETAILS).map(([rk, rm]) => (
                  <option key={rk} value={rk}>{rm.label}</option>
                ))}
              </select>
            </div>

            {form.role === 'therapist' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Commission Rate (%)</label>
                <input
                  type="number"
                  value={form.commRate}
                  onChange={(e) => handleChange('commRate', e.target.value)}
                  className={`w-full rounded-2xl border px-3.5 py-2.5 text-xs outline-none ${
                    errors.commRate ? 'border-red-500' : isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                  }`}
                />
                {errors.commRate && <p className="text-[10px] text-red-500">{errors.commRate}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-400">Status</span>
            <button
              type="button"
              onClick={() => handleChange('status', form.status === 'active' ? 'inactive' : 'active')}
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                form.status === 'active' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-slate-600 text-slate-400'
              }`}
            >
              {form.status === 'active' ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-700">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl">
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  MAIN SYSTEM SETTINGS PAGE                                           */
/* ─────────────────────────────────────────────────────────────────── */

const AdminSettings = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'config');
  const [toastMessage, setToastMessage] = useState('');

  // Staff State
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [searchStaff, setSearchStaff] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Spa Config State
  const [spaConfig, setSpaConfig] = useState({
    name: 'Cozy Blissful Spa Salon',
    hoursOpen: '06:00 AM',
    hoursClose: '11:00 PM',
    address: 'Metropolitan Manila, Philippines',
    phone: '+63 999 543 5913',
    coverageRadius: '25 km radius (Metro Manila & Rizal)',
    currency: 'PHP (₱)',
    cancellationWindow: '2 hours before session'
  });

  // CMS Copy State
  const [cmsConfig, setCmsConfig] = useState({
    heroTitle: 'Spa & Salon Quality at Your Service.',
    heroSubtitle: 'Premium Spa Salon & Wellness',
    heroDescription: 'Professional massage therapy, hair and nail care — delivered to your sanctuary. Available 7 days a week, 6:00 AM – 11:00 PM.',
    facebookUrl: 'https://facebook.com/cozyblissful',
    instagramUrl: 'https://instagram.com/cozyblissful',
    promoBannerText: '✨ Special Offer: Get 15% off on Weekend Combination Massages!'
  });

  // Notification Triggers
  const [notifications, setNotifications] = useState({
    smsBookingCreated: true,
    smsBookingApproved: true,
    emailBookingCreated: true,
    emailPromoUpdates: false,
    therapistDispatchAlert: true
  });

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    triggerToast('System configurations updated successfully!');
  };

  const handleAddStaff = (newStaff) => {
    setStaffList(prev => [newStaff, ...prev]);
    triggerToast(`Added ${newStaff.name} as ${ROLE_DETAILS[newStaff.role]?.label || newStaff.role}`);
  };

  const handleSaveStaff = (updatedStaff) => {
    setStaffList(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    triggerToast(`Profile for ${updatedStaff.name} updated!`);
  };

  const toggleStaffStatus = (id) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'active' ? 'inactive' : 'active';
        triggerToast(`${s.name} is now ${nextStatus}`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchStaff.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchStaff.toLowerCase()) ||
                          s.specialty.toLowerCase().includes(searchStaff.toLowerCase());
      const matchRole = filterRole === 'all' || s.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [staffList, searchStaff, filterRole]);

  const tabItems = [
    { id: 'config', label: 'Spa & Business Config', icon: Sliders },
    { id: 'staff', label: 'Staff Provisioning', icon: UserPlus, badge: staffList.length },
    { id: 'cms', label: 'Content Management', icon: Globe },
    { id: 'notifications', label: 'Alert Triggers', icon: Bell }
  ];

  const fieldStyles = `w-full rounded-2xl border px-4 py-3 text-xs outline-none transition shadow-sm ${
    isDark
      ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
      : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200/80'
  }`;

  return (
    <AdminLayout title="System Settings" subtitle="Configure operating profile, staff access control, landing page copy & notification triggers" icon={Sliders}>
      <div className="space-y-6">
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950 text-emerald-100 px-5 py-3.5 text-xs font-bold shadow-2xl shadow-emerald-950/40"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation Pill Bar */}
        <div className={`rounded-3xl border p-1.5 shadow-sm ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50/90'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-3 text-xs font-bold transition-all relative ${
                    active
                      ? isDark
                        ? 'border border-emerald-500/40 bg-slate-900 text-emerald-400 shadow-md'
                        : 'border border-emerald-500/30 bg-emerald-100/90 text-emerald-950 shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                      active
                        ? 'bg-emerald-500 text-white'
                        : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: SPA CONFIGURATION */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveGeneral} className={`rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6 ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-emerald-500">Business Profile</p>
                <h2 className="text-lg font-bold mt-1">Spa Details & Operational Hours</h2>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/20"
              >
                <Save className="h-3.5 w-3.5" /> Save Changes
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Official Spa Brand Name</label>
                <input
                  type="text"
                  value={spaConfig.name}
                  onChange={(e) => setSpaConfig({ ...spaConfig, name: e.target.value })}
                  className={fieldStyles}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Hotline Contact Number</label>
                <input
                  type="text"
                  value={spaConfig.phone}
                  onChange={(e) => setSpaConfig({ ...spaConfig, phone: e.target.value })}
                  className={fieldStyles}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Daily Opening Schedule Time</label>
                <input
                  type="text"
                  value={spaConfig.hoursOpen}
                  onChange={(e) => setSpaConfig({ ...spaConfig, hoursOpen: e.target.value })}
                  className={fieldStyles}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Daily Closing Cut-off Time</label>
                <input
                  type="text"
                  value={spaConfig.hoursClose}
                  onChange={(e) => setSpaConfig({ ...spaConfig, hoursClose: e.target.value })}
                  className={fieldStyles}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Service Coverage Area</label>
                <input
                  type="text"
                  value={spaConfig.address}
                  onChange={(e) => setSpaConfig({ ...spaConfig, address: e.target.value })}
                  className={fieldStyles}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Therapist Dispatch Radius Limit</label>
                <input
                  type="text"
                  value={spaConfig.coverageRadius}
                  onChange={(e) => setSpaConfig({ ...spaConfig, coverageRadius: e.target.value })}
                  className={fieldStyles}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Auto-Cancellation Buffer Window</label>
                <input
                  type="text"
                  value={spaConfig.cancellationWindow}
                  onChange={(e) => setSpaConfig({ ...spaConfig, cancellationWindow: e.target.value })}
                  className={fieldStyles}
                />
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: STAFF PROVISIONING & QUICK MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="space-y-5">
            {/* Header & Add Staff Button */}
            <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-emerald-500">Access Control & Staffing</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {staffList.filter(s => s.status === 'active').length} Active Accounts
                  </span>
                </div>
                <h2 className="text-lg font-bold mt-1">Staff Provisioning & System Access</h2>
                <p className="text-xs text-slate-400 mt-0.5">Onboard therapists and administrative staff with direct role permissions & credentials.</p>
              </div>

              {/* Add New Staff Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsAddStaffOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/25 transition flex-shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add New Staff Member</span>
              </motion.button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl border ${
                isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
              }`}>
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search staff by name, work email, or specialty..."
                  value={searchStaff}
                  onChange={(e) => setSearchStaff(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none"
                />
                {searchStaff && (
                  <button onClick={() => setSearchStaff('')} className="text-slate-400 hover:text-slate-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'manager', 'staff', 'therapist'].map(roleKey => {
                  const isActive = filterRole === roleKey;
                  const label = roleKey === 'all' ? 'All Roles' : (ROLE_DETAILS[roleKey]?.label || roleKey);
                  return (
                    <button
                      key={roleKey}
                      onClick={() => setFilterRole(roleKey)}
                      className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap border ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-600 text-white shadow-md'
                          : isDark ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Staff List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStaff.map((staff) => {
                const roleMeta = ROLE_DETAILS[staff.role] || ROLE_DETAILS.therapist;
                const isActive = staff.status === 'active';

                return (
                  <motion.div
                    key={staff.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition shadow-sm ${
                      isDark ? 'border-slate-800 bg-slate-950/80 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ background: roleMeta.grad }}>
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{staff.name}</h3>
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{staff.email}</p>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{staff.specialty}</p>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0" style={{ background: roleMeta.bg, color: roleMeta.color }}>
                        {roleMeta.label}
                      </span>
                    </div>

                    <div className={`p-3 rounded-2xl text-[11px] space-y-1.5 ${
                      isDark ? 'bg-slate-900/60 text-slate-400' : 'bg-slate-50 text-slate-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3 h-3 text-slate-400" /> {staff.phone}
                        </span>
                        <span className="font-semibold">{staff.shift} Shift</span>
                      </div>
                      {staff.role === 'therapist' && (
                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 mt-1.5">
                          <span>Commission Share:</span>
                          <span className="font-bold text-amber-500">{staff.commRate}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Joined: {staff.joined}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStaffStatus(staff.id)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition ${
                            isActive
                              ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : 'border-slate-700 text-slate-400 bg-slate-800 hover:bg-slate-700'
                          }`}
                        >
                          {isActive ? '✓ Active' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setEditingStaff(staff)}
                          className="p-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredStaff.length === 0 && (
                <div className={`col-span-full p-12 text-center rounded-3xl border border-dashed ${
                  isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-600'
                }`}>
                  <UserPlus className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-40" />
                  <p className="text-sm font-bold">No staff accounts match your search filters</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing your search query or onboard a new staff member.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONTENT MANAGEMENT (CMS) */}
        {activeTab === 'cms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleSaveGeneral} className={`lg:col-span-7 rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6 ${
              isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between border-b pb-5 border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-emerald-500">Landing Page Copy</p>
                  <h2 className="text-lg font-bold mt-1">Hero Banner Messaging</h2>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/20"
                >
                  <Save className="h-3.5 w-3.5" /> Save Copy
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Main Heading Title</label>
                  <input
                    type="text"
                    value={cmsConfig.heroTitle}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroTitle: e.target.value })}
                    className={fieldStyles}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Pill Badge Subtitle Copy</label>
                  <input
                    type="text"
                    value={cmsConfig.heroSubtitle}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroSubtitle: e.target.value })}
                    className={fieldStyles}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Hero Subdescription Copy</label>
                  <textarea
                    rows="4"
                    value={cmsConfig.heroDescription}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, heroDescription: e.target.value })}
                    className={`${fieldStyles} resize-none min-h-[100px]`}
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Announcement Ticker Banner Copy</label>
                  <input
                    type="text"
                    value={cmsConfig.promoBannerText}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, promoBannerText: e.target.value })}
                    className={fieldStyles}
                  />
                </div>
              </div>
            </form>

            {/* Live Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-6 rounded-3xl border ${
                isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Client Preview Card</h3>
                </div>

                {/* Hero Banner Mock Card */}
                <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white space-y-4 border border-emerald-500/30 shadow-2xl">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {cmsConfig.heroSubtitle || 'Pill Subtitle'}
                  </span>
                  <h2 className="text-xl font-black leading-tight text-emerald-100">
                    {cmsConfig.heroTitle || 'Main Hero Title'}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cmsConfig.heroDescription || 'Hero Description copy goes here...'}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-emerald-500/20 text-[10px] text-emerald-400 font-semibold">
                    <span>⚡ Available 7 Days a Week</span>
                    <button type="button" className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-bold">Book Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ALERT NOTIFICATION RULES */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleSaveGeneral} className={`rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6 ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-5 border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-emerald-500">Automated Messaging</p>
                <h2 className="text-lg font-bold mt-1">SMS & Email Notification Triggers</h2>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/20"
              >
                <Save className="h-3.5 w-3.5" /> Save Rules
              </button>
            </div>

            <div className="grid gap-4">
              {[
                { key: 'smsBookingCreated', title: 'Send Instant SMS on Booking Creation', desc: 'Alert customer and staff immediately when a new home-service booking is requested.' },
                { key: 'smsBookingApproved', title: 'Send SMS Notification on Confirmation', desc: 'Notify customer when their requested time slot is officially approved by admin.' },
                { key: 'emailBookingCreated', title: 'Send Digital Email Receipt & Instructions', desc: 'Email session confirmation, therapist assignment and prep guidelines to customer.' },
                { key: 'therapistDispatchAlert', title: 'Dispatch Alert to Assigned Therapist', desc: 'Push instant notification to assigned therapist with client location details.' },
                { key: 'emailPromoUpdates', title: 'Enable Promotional Marketing Campaigns', desc: 'Include opt-in customer emails in monthly discount & voucher announcements.' }
              ].map((item) => (
                <div key={item.key} className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition ${
                  isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/70'
                }`}>
                  <div className="space-y-1">
                    <p className="text-xs font-bold">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 p-1 ${
                      notifications[item.key] ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white shadow-md"
                      animate={{ x: notifications[item.key] ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </form>
        )}

        {/* Modals */}
        <AddStaffModal
          isOpen={isAddStaffOpen}
          onClose={() => setIsAddStaffOpen(false)}
          onAddStaff={handleAddStaff}
          existingStaff={staffList}
        />

        <EditStaffModal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          staffMember={editingStaff}
          onSaveStaff={handleSaveStaff}
          existingStaff={staffList}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
