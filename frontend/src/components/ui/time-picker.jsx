import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock3, ChevronDown } from 'lucide-react';

const DEFAULT_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
];

const to24h = (t) => {
  const [time, mer] = t.split(' ');
  let [h] = time.split(':').map(Number);
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h;
};

/**
 * Reusable TimePickerInput component.
 * Clicking opens an animated dropdown of time slots grouped by
 * Morning / Afternoon / Evening for quick scanning.
 *
 * Props:
 *  - value       {string}   — selected slot e.g. '02:00 PM' (or empty string '')
 *  - onChange    {function} — callback receiving the selected slot string (or '')
 *  - slots       {array}    — available time slots (default: salon hours 9AM–8PM)
 *  - placeholder {string}   — placeholder text (default: 'Select time')
 *  - isDark      {boolean}  — optional dark mode flag
 *  - className   {string}   — additional CSS classes
 *  - style       {object}   — inline styles for the container
 */
export function TimePickerInput({
  value,
  onChange,
  slots = DEFAULT_SLOTS,
  placeholder = 'Select time',
  isDark = false,
  className = '',
  style = {},
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const groups = useMemo(() => {
    const g = { Morning: [], Afternoon: [], Evening: [] };
    slots.forEach((t) => {
      const h = to24h(t);
      if (h < 12) g.Morning.push(t);
      else if (h < 17) g.Afternoon.push(t);
      else g.Evening.push(t);
    });
    return Object.entries(g).filter(([, list]) => list.length > 0);
  }, [slots]);

  const handleSelect = (t) => {
    onChange?.(t);
    setOpen(false);
  };

  const token = {
    bg: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    text: value ? (isDark ? '#e8ecf3' : '#0f172a') : (isDark ? '#4e5a70' : '#94a3b8'),
    popupBg: isDark ? '#161b26' : '#ffffff',
    popupBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    popupShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 16px 40px rgba(0,0,0,0.12)',
    accent: isDark ? '#34d399' : '#0a3d30',
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`} style={{ minWidth: 150, ...style }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 outline-none select-none cursor-pointer"
        style={{
          background: token.bg,
          border: `1.5px solid ${open ? token.accent : token.border}`,
          color: token.text,
          boxShadow: open ? `0 0 0 3px ${isDark ? 'rgba(52,211,153,0.15)' : 'rgba(10,61,48,0.08)'}` : 'none',
        }}
      >
        <span className="truncate">{value || placeholder}</span>
        <div className="flex items-center gap-1">
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
          >
            <Clock3 className="w-3 h-3" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
          </span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          />
        </div>
      </button>

      {/* Floating Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-[calc(100%+6px)] right-0 z-[120] w-full min-w-[220px] rounded-2xl p-2.5 overflow-y-auto max-h-[240px]"
            style={{
              background: token.popupBg,
              border: `1px solid ${token.popupBorder}`,
              boxShadow: token.popupShadow,
            }}
          >
            {groups.map(([label, list]) => (
              <div key={label} className="mb-2 last:mb-0">
                <div
                  className="px-1 pb-1.5 text-[9px] font-black uppercase tracking-widest"
                  style={{ color: isDark ? '#8a9ab0' : '#94a3b8' }}
                >
                  {label}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {list.map((t) => {
                    const active = t === value;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleSelect(t)}
                        className="rounded-lg py-1.5 text-[10.5px] font-bold transition-all duration-150 cursor-pointer"
                        style={{
                          background: active ? token.accent : 'transparent',
                          color: active
                            ? (isDark ? '#0a1a0f' : '#ffffff')
                            : (isDark ? '#dde3ef' : '#334155'),
                          outline: active ? 'none' : `1px solid ${token.popupBorder}`,
                        }}
                        onMouseEnter={(e) => {
                          if (!active) e.currentTarget.style.background = isDark ? 'rgba(52,211,153,0.12)' : 'rgba(10,61,48,0.07)';
                        }}
                        onMouseLeave={(e) => {
                          if (!active) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {t.replace(':00', '')}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
