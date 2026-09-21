import React from 'react';
import { ChevronDown } from 'lucide-react';
import { getRoleMeta, initialOf } from '../../lib/roleMeta';

/**
 * RoleIdentityBadge — ONE minimalist pill that merges the old
 * separate `[ADMIN]` badge + `[S]` avatar circle (see screenshot).
 *
 *  ┌──────────────────────────┐
 *  │ ● ADMIN  │  (S) 🟢  ⌄    │  ← single element
 *  └──────────────────────────┘
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
  compact = false,
}) => {
  const meta = getRoleMeta(role);
  const initial = initialOf(user?.name, meta.label.charAt(0));

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={`${meta.fullLabel} profile for ${user?.name || meta.label}. ${open ? 'Close' : 'Open'} profile menu.`}
      title={`${user?.name || meta.fullLabel} — ${meta.fullLabel}`}
      className="group relative flex items-center gap-0 rounded-full transition-all active:scale-[0.97] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 min-h-[40px]"
      style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(4,30,22,0.92)',
        border: `1px solid ${open ? meta.accent : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(191,161,95,0.35)'}`,
        boxShadow: open
          ? `0 0 0 3px ${meta.accentSoft}, 0 6px 20px rgba(0,0,0,0.3)`
          : '0 3px 12px rgba(0,0,0,0.25)',
        padding: '3px',
        paddingLeft: '3px',
      }}
    >
      {/* Role label side */}
      {!compact && (
        <span
          className="hidden xs:inline sm:inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] whitespace-nowrap"
          style={{ color: isDark ? meta.accent : '#7df0c0' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: meta.dot, boxShadow: `0 0 6px ${meta.dot}` }}
            aria-hidden="true"
          />
          {meta.label}
        </span>
      )}

      {!compact && (
        <span
          aria-hidden="true"
          className="w-px self-stretch my-1 flex-shrink-0"
          style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.18)' }}
        />
      )}

      {/* Avatar side — gold ring like the screenshot */}
      <span className="relative flex items-center gap-1 pl-1 pr-1">
        <span
          className="relative block w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg,#bfa15f,#e8cc8a,#bfa15f)',
            padding: '2px',
          }}
        >
          <span
            className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#041e16,#0c4a36)' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" draggable={false} />
            ) : (
              <span className="text-xs font-black text-white leading-none">{initial}</span>
            )}
          </span>
          {online && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
              style={{ background: '#10b981', border: '2px solid #041e16' }}
              aria-hidden="true"
            />
          )}
        </span>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 mr-0.5"
          style={{
            color: isDark ? '#8a9ab0' : 'rgba(255,255,255,0.65)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          aria-hidden="true"
        />
      </span>
    </button>
  );
};

export default RoleIdentityBadge;
