import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { getRoleMeta, initialOf } from '../../lib/roleMeta';
import { SpringElement } from '../ui/spring-element';

/* Drag distance (px) beyond which a pointer-up counts as a drag,
   not a menu-toggle click. */
const DRAG_CLICK_THRESHOLD = 6;

/**
 * RoleIdentityBadge — compact avatar-only identity button.
 *
 *  ┌────────────┐
 *  │  ( S )  ⌄  │  ← 44px touch target, no text indicator
 *  └────────────┘
 *
 * Senior-grade details:
 *  - No role text indicator by design: the role lives in the
 *    ProfileMenu header chip, keeping the header calm on every
 *    screen size (320px phones up to desktop).
 *  - 44px minimum touch target (WCAG), 36px avatar + padding.
 *  - GPU-only motion (transform/opacity): hover lift, press
 *    spring, gold sheen sweep, status pulse — all cheap.
 *  - Respects prefers-reduced-motion (pulse + sheen off).
 *  - Avatar photo is spring-draggable (elastic gold tether,
 *    snap-back on release). A genuine drag NEVER toggles the
 *    menu — pointer travel beyond DRAG_CLICK_THRESHOLD eats
 *    the follow-up click.
 *
 * Props: user {name,email}, role string, avatarUrl, online bool,
 * isDark bool, open bool (dropdown state), onClick.
 */
const RoleIdentityBadge = ({
  user,
  role,
  avatarUrl,
  online = true,
  isDark = false,
  open = false,
  onClick,
}) => {
  const meta = getRoleMeta(role);
  const initial = initialOf(user?.name, meta.label.charAt(0));

  /* True while the pointer just finished a real drag — the next
     click event is the drag's own release and must be swallowed. */
  const suppressClick = useRef(false);

  const handlePointerDown = () => {
    suppressClick.current = false;
  };

  const handleClick = (e) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  const handleDragOffset = ({ x, y }) => {
    if (Math.hypot(x, y) > DRAG_CLICK_THRESHOLD) suppressClick.current = true;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={`${meta.fullLabel} profile for ${user?.name || meta.fullLabel}. ${open ? 'Close' : 'Open'} profile menu.`}
      title={`${user?.name || meta.fullLabel} — ${meta.fullLabel}`}
      className="group relative flex items-center rounded-full select-none cursor-pointer outline-none transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(4,30,22,0.05)',
        border: `1px solid ${open ? meta.accent : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(191,161,95,0.35)'}`,
        boxShadow: open
          ? `0 0 0 3px ${meta.accentSoft}, 0 8px 24px rgba(0,0,0,0.25)`
          : '0 2px 10px rgba(0,0,0,0.18)',
        padding: 3,
        minHeight: 44,
        minWidth: 44,
        gap: 2,
      }}
    >
      {/* Gold sheen sweep on hover — pointer-transparent, purely decorative */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 motion-reduce:opacity-0 transition-opacity duration-500"
        style={{ background: 'linear-gradient(105deg,transparent 42%,rgba(232,204,138,0.13) 50%,transparent 58%)' }}
      />

      {/* Avatar — spring-draggable gold ring.
          Drag it: elastic gold tether stretches, photo snaps back.
          A real drag never toggles the menu (see suppressClick). */}
      <SpringElement
        className="relative block w-9 h-9 flex-shrink-0"
        springClassName="[stroke-width:1.5] stroke-[#bfa15f]"
        onDragOffsetChange={handleDragOffset}
      >
        <span className="relative block w-9 h-9 flex-shrink-0 transition-transform duration-200 ease-out group-hover:scale-[1.05]" aria-hidden="true">
          {/* Gold ring */}
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(135deg,#8c7033 0%,#e8cc8a 45%,#bfa15f 70%,#8c7033 100%)' }}
          />
          {/* Photo / initial well (the ONLY overflow-hidden layer) */}
          <span
            className="absolute flex items-center justify-center overflow-hidden rounded-full"
            style={{
              inset: 2,
              background: avatarUrl ? '#041e16' : 'linear-gradient(135deg,#041e16 0%,#0c4a36 100%)',
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" draggable={false} />
            ) : (
              <span className="text-[13px] font-extrabold text-[#f3e9d2] leading-none">{initial}</span>
            )}
          </span>
          {/* Status dot — sibling of the well, never clipped.
              Gentle pulse when online, calm slate when offline. */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5" aria-hidden="true">
            {online && (
              <span
                className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping motion-reduce:animate-none [animation-duration:2.4s]"
              />
            )}
            <span
              className="absolute inline-flex w-full h-full rounded-full"
              style={{
                background: online ? '#10b981' : '#64748b',
                border: '2px solid',
                borderColor: isDark ? '#171d2b' : '#ffffff',
                boxShadow: online ? '0 0 6px rgba(16,185,129,0.8)' : '0 1px 3px rgba(0,0,0,0.4)',
              }}
            />
          </span>
        </span>
      </SpringElement>

      {/* Chevron */}
      <ChevronDown
        className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ease-out"
        style={{
          color: isDark ? '#8a9ab0' : '#64748b',
          marginRight: 4,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        aria-hidden="true"
      />
    </button>
  );
};

export default RoleIdentityBadge;
