import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoleMeta, initialOf } from '../../lib/roleMeta';

/**
 * ProfileMenu — ONE shared identity dropdown for every role
 * (admin / staff / therapist / client).
 *
 * Senior-grade interaction + responsive guarantees:
 *  - Full keyboard support: ArrowUp/Down (wrap), Home/End,
 *    Enter/Space activate, Escape closes AND refocuses the badge,
 *    Tab closes and lets focus move naturally.
 *  - Focus lands on the first item when the menu opens.
 *  - Viewport-guarded width: never overflows small phones.
 *  - 44px touch targets, CSS-only hover (touch-safe), visible
 *    focus rings, proper menu/menuitem roles.
 *
 * Props:
 *  open, onClose, user {name,email}, role, avatarUrl, isDark,
 *  triggerRef (wrapper around the badge, used for Escape refocus),
 *  ariaLabel, fallbackName, badgeText (role chip override),
 *  items: [{ id, label, icon: IconComp, iconClass, danger,
 *             trailing (node), dividerBefore, keepOpen, onSelect }]
 */
const ProfileMenu = ({
  open,
  onClose,
  user,
  role = 'client',
  avatarUrl = null,
  isDark = false,
  triggerRef = null,
  ariaLabel = 'Profile menu',
  fallbackName = 'User',
  badgeText = null,
  items = [],
}) => {
  const meta = getRoleMeta(role);
  const itemRefs = useRef([]);

  /* Focus the first item on open for keyboard users. */
  useEffect(() => {
    if (!open) return;
    itemRefs.current = [];
    const t = setTimeout(() => itemRefs.current[0]?.focus(), 70);
    return () => clearTimeout(t);
  }, [open ]);

  const refocusTrigger = () => {
    triggerRef?.current?.querySelector?.('button')?.focus?.();
  };

  const handleKeyDown = (e) => {
    const nodes = itemRefs.current.filter(Boolean);
    if (nodes.length === 0) return;
    const idx = nodes.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose?.();
      setTimeout(refocusTrigger, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      (nodes[idx + 1] || nodes[0])?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      (nodes[idx - 1] || nodes[nodes.length - 1])?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      nodes[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      nodes[nodes.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      /* Let focus travel naturally, but dismiss the floating menu. */
      onClose?.();
    }
  };

  const activate = (item) => () => {
    if (!item.keepOpen) onClose?.();
    item.onSelect?.();
  };

  const setItemRef = (i) => (el) => {
    itemRefs.current[i] = el;
  };

  const chipBg = isDark ? meta.accentSoft : 'rgba(10,61,48,0.07)';
  const chipColor = isDark ? meta.accent : '#041e16';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          role="menu"
          aria-label={ariaLabel}
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          className="absolute right-0 mt-2.5 rounded-2xl overflow-hidden z-50 shadow-2xl w-[min(16.5rem,calc(100vw-2rem))]"
          style={{
            background: isDark ? '#1c2333' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          {/* Identity header */}
          <div
            className="px-4 py-4 flex items-center gap-3"
            style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg,#041e16,#0c4a36)',
                boxShadow: '0 2px 8px rgba(4,30,22,0.4)',
                border: '2px solid #bfa15f',
              }}
              aria-hidden="true"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" draggable={false} />
                : initialOf(user?.name, meta.label.charAt(0))}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-black truncate" style={{ color: isDark ? '#e8ecf3' : '#1a1d23' }}>
                {user?.name || fallbackName}
              </p>
              {user?.email && (
                <p className="text-[10px] truncate mt-0.5" style={{ color: isDark ? '#5c6a7e' : '#8a9099' }}>
                  {user.email}
                </p>
              )}
              <span
                className="inline-flex items-center gap-1 mt-1.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: chipBg, color: chipColor }}
              >
                {badgeText || meta.fullLabel}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="p-2 text-left">
            {items.map((item, i) => {
              const Icon = item.icon;
              const danger = !!item.danger;
              return (
                <React.Fragment key={item.id}>
                  {item.dividerBefore && (
                    <div
                      className="my-1 h-px"
                      role="separator"
                      style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    ref={setItemRef(i)}
                    type="button"
                    role="menuitem"
                    onClick={activate(item)}
                    className={`w-full flex items-center gap-2.5 px-3 rounded-xl text-xs transition-all min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 active:scale-[0.99] ${
                      danger
                        ? 'font-bold text-red-500 hover:bg-red-500/10'
                        : isDark
                          ? 'font-semibold text-[#c9d1e0] hover:bg-white/[0.06]'
                          : 'font-semibold text-[#374151] hover:bg-black/[0.04]'
                    }`}
                  >
                    {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${item.iconClass || ''}`} aria-hidden="true" />}
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.trailing}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileMenu;
