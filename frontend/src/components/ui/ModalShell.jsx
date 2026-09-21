import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * ModalShell — one consistent glassmorphism dialog used by every
 * popup in the app (profile, confirm, logout, cancel, reschedule…).
 *
 * Guarantees senior-grade UX:
 *  - ESC to close (unless busy)
 *  - backdrop click to close (unless busy / persistent)
 *  - body scroll lock while open
 *  - initial focus on dialog + aria roles
 *  - bottom-sheet on mobile, centered card on desktop
 */
const ModalShell = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = 'max-w-lg',
  busy = false,
  persistent = false,
  labelledBy,
  headerGradient = 'linear-gradient(135deg,#041e16 0%,#0c4a36 100%)',
}) => {
  const panelRef = useRef(null);
  const titleId = labelledBy || 'modal-shell-title';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => panelRef.current?.focus(), 60);
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy && !persistent) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, busy, persistent, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
          style={{ background: 'rgba(4,20,15,0.62)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy && !persistent) onClose?.();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ scale: 0.96, opacity: 0, y: 22 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 22 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} my-auto max-h-[94dvh] sm:max-h-[90vh] flex flex-col rounded-t-[1.75rem] sm:rounded-[1.75rem] overflow-hidden shadow-2xl bg-white dark:bg-[#161b26] border border-[rgba(191,161,95,0.28)] outline-none`}
          >
            {/* Header */}
            <div className="px-5 sm:px-6 py-5 flex-shrink-0 text-white" style={{ background: headerGradient }}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)' }}
                >
                  {icon}
                </div>
                <button
                  type="button"
                  onClick={() => !busy && onClose?.()}
                  disabled={busy}
                  aria-label="Close dialog"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer disabled:opacity-50 min-w-[36px] min-h-[36px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h2 id={titleId} className="font-black text-base sm:text-lg tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {title}
              </h2>
              {subtitle && <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{subtitle}</p>}
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end flex-shrink-0 border-t border-slate-100 dark:border-white/10 bg-slate-50/90 dark:bg-black/20"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalShell;
