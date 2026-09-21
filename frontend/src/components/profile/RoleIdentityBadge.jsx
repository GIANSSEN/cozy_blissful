import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { getRoleMeta, initialOf } from '../../lib/roleMeta';
import { SpringElement } from '../ui/spring-element';

/* Drag distance (px) beyond which a pointer-up counts as a drag,
   not a menu-toggle click. */
const DRAG_CLICK_THRESHOLD = 6;

/**
 * RoleIdentityBadge — role + avatar identity pill.
 *
 *  ┌───────────────────────┐
 *  │  ( S )  │  ● ADMIN  ⌄ │  ← 44px pill, fixed geometry
 *  └───────────────────────┘
 *
 * Senior-grade details:
 *  - Role indicator restored by design: colored status dot +
 *    letterspaced role label, so the active portal is always
 *    legible at a glance (role also lives in the menu header).
 *  - Fixed h-11 geometry: 36px avatar + 4px padding = exact fit,
 *    avatar NEVER protrudes above/below the pill.
 *  - 44px minimum touch target (WCAG); label gracefully hides
 *    under 420px so 320px phones never overflow.
 *  - GPU-only motion (transform/opacity/border-color): hover lift,
 *    press spring, gold sheen sweep, status pulse — all cheap,
 *    all disabled under prefers-reduced-motion.
 *  - Avatar photo is spring-draggable (elastic gold tether painted
 *    at document.body, snap-back on release). A genuine drag NEVER
 *    toggles the menu — pointer travel beyond DRAG_CLICK_THRESHOLD
 *    eats the follow-up click.
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

  const pillBg = isDark ? 'rgba(255,255,255,0.06)' : '#0a2e23';
  const pillBorder = open
    ? meta.accent
    : isDark
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(191,161,95,0.38)';
  const labelColor = isDark ? meta.accent : '#8df0c2';
  const dividerColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(232,204,138,0.22)';
  const chevronColor = isDark ? '#8a9ab0' : 'rgba(232,204,138,0.75)';

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={`${meta.fullLabel} profile for ${user?.name || meta.label}. ${open ? 'Close' : 'Open'} profile menu.`}
      title={`${user?.name || meta.fullLabel} — ${meta.fullLabel} (drag the photo, click for menu)`}
      className="group relative flex items-center h-11 rounded-full select-none cursor-pointer outline-none transition-[transform,box-shadow,border-color,opacity] duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{
        background: pillBg,
        border: `1px solid ${pillBorder}`,
        boxShadow: open
          ? `0 0 0 3px ${meta.accentSoft}, 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`
          : '0 3px 12px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)',
        padding: 4,
        paddingRight: 8,
        minHeight: 44,
        gap: 0,
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
        springClassName="stroke-[1.5] stroke-[#bfa15f] dark:stroke-[#e8cc8a]"
        onDragOffsetChange={handleDragOffset}
      >
        <span className="relative block w-9 h-9 flex-shrink-0 transition-transform duration-200 ease-out group-hover:scale-[1.04]" aria-hidden="true">
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
                borderColor: isDark ? '#171d2b' : '#0a2e23',
                boxShadow: online ? '0 0 6px rgba(16,185,129,0.8)' : '0 1px 3px rgba(0,0,0,0.4)',
              }}
            />
          </span>
        </span>
      </SpringElement>

      {/* Divider */}
      <span
        aria-hidden="true"
        className="hidden min-[420px]:block w-px h-5 flex-shrink-0"
        style={{ background: dividerColor, marginLeft: 8, marginRight: 10 }}
      />

      {/* Role indicator — dot + letterspaced label */}
      <span
        className="hidden min-[420px]:inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase whitespace-nowrap leading-none"
        style={{ color: labelColor, letterSpacing: '0.14em' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: meta.dot, boxShadow: `0 0 5px ${meta.dot}` }}
          aria-hidden="true"
        />
        {meta.label}
      </span>

      {/* Chevron */}
      <ChevronDown
        className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ease-out"
        style={{
          color: chevronColor,
          marginLeft: 6,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        aria-hidden="true"
      />
    </button>
  );
};

export default RoleIdentityBadge;
