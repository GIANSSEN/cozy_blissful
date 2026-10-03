import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertTriangle, Trash2, Info, X, Loader2 } from 'lucide-react';

const ICONS = {
  logout: LogOut,
  danger: AlertTriangle,
  delete: Trash2,
  info: Info,
};

const THEMES = {
  logout: {
    iconBg: 'radial-gradient(circle, rgba(191,161,95,0.22) 0%, rgba(12,74,54,0.3) 100%)',
    iconBorder: 'rgba(191,161,95,0.35)',
    iconColor: '#e0c283',
    glow: 'rgba(191,161,95,0.18)',
    btnBg: 'linear-gradient(135deg, #bfa15f 0%, #dfc384 100%)',
    btnText: '#041e16',
  },
  danger: {
    iconBg: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(153,27,27,0.3) 100%)',
    iconBorder: 'rgba(239,68,68,0.35)',
    iconColor: '#f87171',
    glow: 'rgba(239,68,68,0.2)',
    btnBg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    btnText: '#ffffff',
  },
  delete: {
    iconBg: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(185,28,28,0.3) 100%)',
    iconBorder: 'rgba(239,68,68,0.35)',
    iconColor: '#f87171',
    glow: 'rgba(239,68,68,0.2)',
    btnBg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    btnText: '#ffffff',
  },
  info: {
    iconBg: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(29,78,216,0.3) 100%)',
    iconBorder: 'rgba(59,130,246,0.35)',
    iconColor: '#60a5fa',
    glow: 'rgba(59,130,246,0.2)',
    btnBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    btnText: '#ffffff',
  },
};

/**
 * ConfirmModal — Compact, responsive, perfectly proportioned confirmation dialog.
 * Designed to look balanced and refined on both mobile and desktop (never oversized).
 */
const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Sign out?',
  message = 'Are you sure you want to end your session?',
  confirmLabel = 'Sign Out',
  cancelLabel = 'Cancel',
  tone = 'logout',
  busy = false,
  busyLabel = 'Signing out…',
}) => {
  const panelRef = useRef(null);
  const Icon = ICONS[tone] || ICONS.logout;
  const theme = THEMES[tone] || THEMES.logout;
  const isDanger = tone === 'danger' || tone === 'delete';

  // Handle ESC key and focus trapping
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, busy, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6"
          style={{
            background: 'rgba(3, 14, 10, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) onClose?.();
          }}
          role="presentation"
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            tabIndex={-1}
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center relative overflow-hidden shadow-2xl bg-white dark:bg-[#151a24] border border-slate-200/80 dark:border-[rgba(191,161,95,0.28)] outline-none"
            style={{
              boxShadow: `0 20px 40px -10px rgba(0,0,0,0.5), 0 0 25px ${theme.glow}`,
            }}
          >
            {/* Subtle luxury ambient highlight */}
            <div
              className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-24 rounded-full pointer-events-none blur-2xl opacity-60 dark:opacity-40"
              style={{ background: theme.btnBg }}
            />

            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => !busy && onClose?.()}
              disabled={busy}
              aria-label="Close dialog"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition active:scale-95 disabled:opacity-40 cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Badge */}
            <div className="flex justify-center mb-3.5 relative z-10">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center relative shadow-inner"
                style={{
                  background: theme.iconBg,
                  border: `1.5px solid ${theme.iconBorder}`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color: theme.iconColor }} />
              </div>
            </div>

            {/* Title */}
            <h2
              id="confirm-modal-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h2>

            {/* Message */}
            <p
              id="confirm-modal-desc"
              className="text-xs text-slate-600 dark:text-slate-300/85 mt-1.5 leading-relaxed px-1 font-medium"
            >
              {message}
            </p>

            {/* Reassurance text */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-normal">
              {isDanger
                ? 'This action cannot be undone.'
                : 'You can sign back in anytime. Your data stays safe.'}
            </p>

            {/* Actions: 2 balanced columns */}
            <div className="grid grid-cols-2 gap-2.5 mt-5 pt-1 relative z-10">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="w-full h-10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200/80 dark:hover:bg-white/[0.14] border border-slate-200 dark:border-white/10 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                autoFocus
                className="w-full h-10 rounded-xl text-xs font-bold transition-all hover:brightness-105 active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-md"
                style={{
                  background: theme.btnBg,
                  color: theme.btnText,
                }}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{busyLabel}</span>
                  </>
                ) : (
                  <span>{confirmLabel}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;

