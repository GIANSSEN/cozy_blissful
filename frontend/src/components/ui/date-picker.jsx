import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import { MiniCalendar } from './mini-calendar';

/**
 * Reusable DatePickerInput component.
 * Displays a formatted input pill (e.g., "08/14/2026" or "mm/dd/yyyy") with a calendar icon.
 * Clicking opens a custom popup calendar dropdown with "Clear" and "Today" actions.
 *
 * Props:
 *  - value        {string}   — Date in 'YYYY-MM-DD' format (or empty string '')
 *  - onChange     {function} — Callback receiving new date string 'YYYY-MM-DD' (or '')
 *  - placeholder  {string}   — Placeholder text (default: 'mm/dd/yyyy')
 *  - isDark       {boolean}  — Optional dark mode flag
 *  - className    {string}   — Additional CSS classes
 */
export function DatePickerInput({
  value,
  onChange,
  placeholder = 'mm/dd/yyyy',
  isDark = false,
  className = '',
  style = {},
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close popup when clicking outside
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

  // Parse current selected date
  const parsedDate = React.useMemo(() => {
    if (!value) return new Date();
    const d = parseISO(value);
    return isValid(d) ? d : new Date();
  }, [value]);

  // Format displayed string
  const displayString = React.useMemo(() => {
    if (!value) return placeholder;
    const d = parseISO(value);
    return isValid(d) ? format(d, 'MM/dd/yyyy') : placeholder;
  }, [value, placeholder]);

  const handleSelectDate = (dateObj) => {
    const formatted = format(dateObj, 'yyyy-MM-dd');
    onChange?.(formatted);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    onChange?.(todayStr);
    setOpen(false);
  };

  // Styling tokens based on mode
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
        <span className="truncate">{displayString}</span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-md hover:opacity-75 transition-opacity"
              title="Clear date"
            >
              <X className="w-3 h-3" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
            </span>
          )}
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
          >
            <CalendarDays className="w-3 h-3" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
          </span>
        </div>
      </button>

      {/* Floating Popup Calendar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-[calc(100%+6px)] right-0 z-[120] w-[270px] rounded-2xl p-2.5 overflow-hidden"
            style={{
              background: token.popupBg,
              border: `1px solid ${token.popupBorder}`,
              boxShadow: token.popupShadow,
            }}
          >
            {/* Calendar */}
            <MiniCalendar
              isDark={isDark}
              selectedDate={parsedDate}
              onSelectDate={handleSelectDate}
              accentColor={token.accent}
              selectedBg={token.accent}
            />

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 px-1 border-t mt-2" style={{ borderColor: token.popupBorder }}>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                style={{ color: token.accent }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                style={{ color: token.accent }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(52,211,153,0.1)' : 'rgba(10,61,48,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
