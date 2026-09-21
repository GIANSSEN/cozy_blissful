import React from 'react';
import { LogOut, AlertTriangle, Trash2, Info } from 'lucide-react';
import ModalShell from './ModalShell';

const ICONS = {
  logout: LogOut,
  danger: AlertTriangle,
  delete: Trash2,
  info: Info,
};

const GRADIENTS = {
  logout: 'linear-gradient(135deg,#041e16 0%,#0c4a36 100%)',
  danger: 'linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)',
  delete: 'linear-gradient(135deg,#7f1d1d 0%,#b91c1c 100%)',
  info: 'linear-gradient(135deg,#0c2b4d 0%,#1d4ed8 100%)',
};

/**
 * ConfirmModal — minimalist confirm dialog for logout / cancel /
 * delete / destructive actions. One look everywhere.
 */
const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action needs your confirmation.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'logout',
  busy = false,
  busyLabel = 'Working…',
}) => {
  const Icon = ICONS[tone] || ICONS.logout;
  const isDanger = tone === 'danger' || tone === 'delete';

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={title}
      subtitle={message}
      icon={<Icon className="w-5 h-5 text-white" />}
      headerGradient={GRADIENTS[tone] || GRADIENTS.logout}
      maxWidth="max-w-sm"
      busy={busy}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 sm:flex-none sm:min-w-[110px] py-2.5 px-4 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
            className="flex-1 sm:flex-none sm:min-w-[130px] py-2.5 px-4 rounded-2xl text-xs font-black text-white transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer min-h-[44px] disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
            style={{
              background: isDanger
                ? 'linear-gradient(135deg,#dc2626,#991b1b)'
                : 'linear-gradient(135deg,#bfa15f,#e8cc8a)',
              color: isDanger ? '#fff' : '#041e16',
            }}
          >
            {busy && <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
            {busy ? busyLabel : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {isDanger
          ? 'This cannot be undone. Please double-check before continuing.'
          : 'You can always sign back in anytime. Your bookings stay safe.'}
      </p>
    </ModalShell>
  );
};

export default ConfirmModal;
