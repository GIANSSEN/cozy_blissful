import React from 'react';

/**
 * ProfileField — minimalist labeled control with inline validation.
 * One component guarantees identical error UX in every modal/form.
 */
const ProfileField = ({
  id,
  label,
  required = false,
  error = '',
  hint = '',
  children,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="text-[11px] font-semibold text-red-600 dark:text-red-400 leading-snug">
        {error}
      </p>
    ) : hint ? (
      <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>
    ) : null}
  </div>
);

export const profileInputClass = (hasError, isDark) =>
  `w-full px-3.5 py-2.5 rounded-2xl text-sm outline-none transition border min-h-[44px] ${
    hasError
      ? 'border-red-400 bg-red-50/60 text-slate-900 dark:bg-red-500/10 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
      : isDark
        ? 'border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#bfa15f] focus:bg-white focus:ring-2 focus:ring-[#bfa15f]/20'
  }`;

export default ProfileField;
