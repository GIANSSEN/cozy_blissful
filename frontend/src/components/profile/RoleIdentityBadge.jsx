import React from 'react';
import { ChevronDown } from 'lucide-react';
import { getRoleMeta, initialOf } from '../../lib/roleMeta';

/**
 * RoleIdentityBadge — ONE minimalist pill merging role label + avatar.
 *
 *  ┌─────────────────────────┐
 *  │ ● ADMIN  │  (S) 🟢  ⌄   │  ← single 40px pill
 *  └─────────────────────────┘
 *
 * Senior-grade details:
 *  - Fixed h-10 geometry: 32px avatar + 4px padding = exact fit,
 *    avatar NEVER protrudes above/below the pill.
 *  - Online dot lives OUTSIDE the overflow-hidden image well,
 *    so it is never clipped.
 *  - Subtle inset top-highlight + hover lift for luxury depth.
 *
 * Props: user {name,email}, role string, avatarUrl, online bool,
 * isDark bool, open bool (dropdown state), onClick, compact bool
 * (avatar-only on tiny screens).
 */
const RoleIdentityBadge = ({
  user,
  role,
  avatarUrl,
  online = true,
  isDark = false,
  open = false,
  onClick,
  compact = false,
}) => {
  const meta = getRoleMeta(role);
  const initial = initialOf(user?.name, meta.label.charAt(0));

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
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={`${meta.fullLabel} profile for ${user?.name || meta.label}. ${open ? 'Close' : 'Open'} profile menu.`}
      title={`${user?.name || meta.fullLabel} — ${meta.fullLabel}`}
      className="group relative flex items-center h-10 rounded-full select-none cursor-pointer outline-none transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{
        background: pillBg,
        border: `1px solid ${pillBorder}`,
        boxShadow: open
          ? `0 0 0 3px ${meta.accentSoft}, 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`
          : '0 3px 12px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)',
        padding: 4,
        paddingLeft: compact ? 4 : 14,
        paddingRight: 6,
        gap: 0,
      }}
    >
      {/* Role label side */}
      {!compact && (
        <span
          className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase whitespace-nowrap leading-none"
          style={{ color: labelColor, letterSpacing: '0.14em' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: meta.dot, boxShadow: `0 0 5px ${meta.dot}` }}
            aria-hidden="true"
          />
          {meta.label}
        </span>
      )}

      {/* Divider */}
      {!compact && (
        <span
          aria-hidden="true"
          className="hidden sm:block w-px h-5 flex-shrink-0"
          style={{ background: dividerColor, marginLeft: 10, marginRight: 8 }}
        />
      )}

      {/* Avatar — gold ring, strictly contained in the 40px pill */}
      <span className="relative block w-8 h-8 flex-shrink-0" aria-hidden="true">
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
            <span className="text-[12px] font-extrabold text-[#f3e9d2] leading-none">{initial}</span>
          )}
        </span>
        {/* Online dot — sibling of the well, never clipped */}
        {online && (
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
            style={{
              background: '#10b981',
              border: '2px solid',
              borderColor: isDark ? '#171d2b' : '#0a2e23',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          />
        )}
      </span>

      {/* Chevron */}
      <ChevronDown
        className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{
          color: chevronColor,
          marginLeft: 4,
          marginRight: 2,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        aria-hidden="true"
      />
    </button>
  );
};

export default RoleIdentityBadge;
