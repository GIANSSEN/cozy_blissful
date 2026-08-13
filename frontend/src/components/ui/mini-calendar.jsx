import * as React from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isSameMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * MiniCalendar — a fully self-contained monthly calendar widget.
 *
 * Props:
 *  - isDark         {boolean}  — matches the sidebar theme token
 *  - selectedDate   {Date}     — externally controlled selection (optional)
 *  - onSelectDate   {fn}       — callback when a date is clicked (optional)
 *  - accentColor    {string}   — CSS color for the "today" ring (optional)
 *  - selectedBg     {string}   — background for selected day (optional)
 */
const MiniCalendar = ({
  isDark = false,
  selectedDate: externalSelected,
  onSelectDate,
  accentColor,
  selectedBg,
}) => {
  const [viewMonth, setViewMonth] = React.useState(new Date());
  const [internalSelected, setInternalSelected] = React.useState(new Date());

  // Allow both controlled (external) and uncontrolled (internal) use
  const selected = externalSelected ?? internalSelected;

  const handleSelect = (day) => {
    if (!externalSelected) setInternalSelected(day);
    onSelectDate?.(day);
  };

  // Build calendar grid: from start of first week to end of last week in the month
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Theme-aware tokens
  const token = {
    bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    txt: isDark ? '#dde3ef' : '#1a1d23',
    txtMuted: isDark ? '#4e5a70' : '#8a9199',
    txtSub: isDark ? '#8a9ab0' : '#4a5260',
    hover: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    todayRing: accentColor ?? (isDark ? '#34d399' : '#0a3d30'),
    selectedBg: selectedBg ?? (isDark ? '#34d399' : '#0a3d30'),
    selectedTxt: isDark ? '#0a1a0f' : '#ffffff',
    outOfMonth: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.22)',
  };

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{
        background: token.bg,
        border: `1px solid ${token.border}`,
      }}
    >
      {/* ── Month header ── */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <button
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 flex-shrink-0"
          style={{ color: token.txtMuted, background: token.hover }}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        <span
          className="text-[11px] font-bold tracking-[0.06em] uppercase select-none"
          style={{ color: token.txt }}
        >
          {format(viewMonth, 'MMM yyyy')}
        </span>

        <button
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 flex-shrink-0"
          style={{ color: token.txtMuted, background: token.hover }}
          aria-label="Next month"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* ── Day-of-week labels ── */}
      <div className="grid grid-cols-7 px-2 pb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] font-bold uppercase tracking-wider select-none"
            style={{ color: token.txtMuted }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Day grid ── */}
      <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-2.5">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isSelected = isSameDay(day, selected);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleSelect(day)}
              className={cn(
                'relative mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium transition-all duration-150 select-none',
                'hover:scale-110 active:scale-95',
                !isCurrentMonth && 'opacity-30 pointer-events-none'
              )}
              style={{
                background: isSelected
                  ? token.selectedBg
                  : 'transparent',
                color: isSelected
                  ? token.selectedTxt
                  : isCurrentMonth
                  ? token.txt
                  : token.outOfMonth,
                outline: isTodayDate && !isSelected
                  ? `1.5px solid ${token.todayRing}`
                  : 'none',
                outlineOffset: '-1px',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = token.hover;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
              }}
              aria-label={format(day, 'MMMM d, yyyy')}
              aria-pressed={isSelected}
            >
              <time dateTime={format(day, 'yyyy-MM-dd')}>
                {format(day, 'd')}
              </time>
              {/* Today indicator dot */}
              {isTodayDate && !isSelected && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: token.todayRing }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { MiniCalendar };
