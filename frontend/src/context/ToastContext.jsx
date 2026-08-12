import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, Info, XCircle, X, Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────── */
/*  TOAST CONTEXT                                              */
/* ─────────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

/* ─────────────────────────────────────────────────────────── */
/*  TYPE CONFIG                                                */
/* ─────────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    border: 'rgba(52,211,153,0.30)',
    iconColor: '#6ee7b7',
    glow: '0 8px 32px rgba(5,150,105,0.45)',
    progressColor: '#34d399',
    label: 'Success',
  },
  error: {
    icon: XCircle,
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    border: 'rgba(252,165,165,0.30)',
    iconColor: '#fca5a5',
    glow: '0 8px 32px rgba(239,68,68,0.45)',
    progressColor: '#f87171',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
    border: 'rgba(252,211,77,0.30)',
    iconColor: '#fcd34d',
    glow: '0 8px 32px rgba(245,158,11,0.45)',
    progressColor: '#fbbf24',
    label: 'Warning',
  },
  info: {
    icon: Info,
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
    border: 'rgba(147,197,253,0.30)',
    iconColor: '#93c5fd',
    glow: '0 8px 32px rgba(59,130,246,0.45)',
    progressColor: '#60a5fa',
    label: 'Info',
  },
  sparkle: {
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
    border: 'rgba(196,181,253,0.30)',
    iconColor: '#c4b5fd',
    glow: '0 8px 32px rgba(139,92,246,0.45)',
    progressColor: '#a78bfa',
    label: 'Notice',
  },
};

/* ─────────────────────────────────────────────────────────── */
/*  SINGLE TOAST ITEM                                          */
/* ─────────────────────────────────────────────────────────── */
let toastIdCounter = 0;

const ToastItem = ({ toast, onDismiss }) => {
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.success;
  const Icon = cfg.icon;
  const duration = toast.duration || 3500;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        background: cfg.gradient,
        border: `1px solid ${cfg.border}`,
        boxShadow: `${cfg.glow}, 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
        borderRadius: 18,
        overflow: 'hidden',
        minWidth: 280,
        maxWidth: 'min(480px, calc(100vw - 32px))',
        width: 'max-content',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative',
      }}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1, transformOrigin: 'left' }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2.5,
          background: cfg.progressColor,
          opacity: 0.7,
          transformOrigin: 'left center',
        }}
      />

      {/* Inner gloss */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)',
          borderRadius: '18px 18px 0 0',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div className="flex items-start gap-3 px-4 py-3.5 relative">
        {/* Icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl mt-0.5"
          style={{
            width: 34,
            height: 34,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Icon style={{ width: 18, height: 18, color: cfg.iconColor }} aria-hidden="true" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 py-0.5">
          {toast.title && (
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-0.5"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              {toast.title}
            </p>
          )}
          <p className="text-xs sm:text-[13px] font-bold text-white leading-snug">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-white/15 active:scale-90 mt-0.5"
          style={{ color: 'rgba(255,255,255,0.60)' }}
        >
          <X style={{ width: 14, height: 14 }} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  TOAST CONTAINER (rendered globally at top-center)          */
/* ─────────────────────────────────────────────────────────── */
const ToastContainer = ({ toasts, onDismiss }) => (
  <div
    aria-label="Notifications"
    style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      pointerEvents: 'none',
    }}
  >
    <AnimatePresence mode="popLayout" initial={false}>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </AnimatePresence>
  </div>
);

/* ─────────────────────────────────────────────────────────── */
/*  TOAST PROVIDER                                             */
/* ─────────────────────────────────────────────────────────── */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * showToast({ message, type?, title?, duration? })
   */
  const showToast = useCallback(({ message, type = 'success', title, duration = 3500 }) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [{ id, message, type, title, duration }, ...prev].slice(0, 5));

    timersRef.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timersRef.current[id];
    }, duration);
  }, []);

  /* Convenience shortcuts */
  const toast = {
    success: (message, opts) => showToast({ message, type: 'success', ...opts }),
    error:   (message, opts) => showToast({ message, type: 'error',   ...opts }),
    warning: (message, opts) => showToast({ message, type: 'warning', ...opts }),
    info:    (message, opts) => showToast({ message, type: 'info',    ...opts }),
    sparkle: (message, opts) => showToast({ message, type: 'sparkle', ...opts }),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
