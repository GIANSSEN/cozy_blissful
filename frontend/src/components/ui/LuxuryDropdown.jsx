import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, AlertCircle, X } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  HELPER: FIXED / COLLISION-SAFE POSITIONING                     */
/* ─────────────────────────────────────────────────────────────── */
function useDropdownPosition(isOpen, triggerRef, menuWidth = 240, align = 'auto', preferredPlacement = 'bottom', estimatedHeight = 160) {
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'bottom', align: 'left', width: menuWidth, maxHeight: estimatedHeight });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const gap = 6;

    // Vertical placement
    let placement = preferredPlacement;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (preferredPlacement === 'bottom' && spaceBelow < 120 && spaceAbove > spaceBelow + 40) {
      placement = 'top';
    } else if (preferredPlacement === 'top' && spaceAbove < 120 && spaceBelow > spaceAbove + 40) {
      placement = 'bottom';
    }

    // Horizontal alignment
    let effectiveAlign = align;
    const resolvedWidth = typeof menuWidth === 'number' ? menuWidth : Math.max(rect.width, 200);

    if (align === 'auto') {
      if (rect.left + resolvedWidth > viewportWidth - 16) {
        effectiveAlign = 'right';
      } else {
        effectiveAlign = 'left';
      }
    }

    let left = effectiveAlign === 'right' ? rect.right - resolvedWidth : rect.left;
    // Boundary checks
    if (left < 12) left = 12;
    if (left + resolvedWidth > viewportWidth - 12) {
      left = Math.max(12, viewportWidth - resolvedWidth - 12);
    }

    let top = placement === 'bottom' ? rect.bottom + gap : rect.top - gap;
    const computedMaxHeight = placement === 'bottom'
      ? Math.max(120, Math.min(estimatedHeight, spaceBelow - gap - 12))
      : Math.max(120, Math.min(estimatedHeight, spaceAbove - gap - 12));

    setCoords({
      top,
      left,
      placement,
      align: effectiveAlign,
      width: resolvedWidth,
      triggerWidth: rect.width,
      maxHeight: computedMaxHeight,
    });
  }, [triggerRef, menuWidth, align, preferredPlacement, estimatedHeight]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  return coords;
}

/* ─────────────────────────────────────────────────────────────── */
/*  LUXURY SELECT COMPONENT                                         */
/* ─────────────────────────────────────────────────────────────── */
export function LuxurySelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option…',
  label,
  icon: TriggerIcon,
  required = false,
  error,
  disabled = false,
  searchable = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  isDark = true,
  className = '',
  menuWidth = 'auto',
  id: customId,
  'aria-label': ariaLabel,
  portal = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listboxRef = useRef(null);
  const autoId = useId();
  const id = customId || autoId;
  const listboxId = `${id}-listbox`;

  const coords = useDropdownPosition(isOpen && portal, triggerRef, menuWidth === 'auto' ? undefined : menuWidth);

  // Filter options if searchable
  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  const selectedOption = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (triggerRef.current && triggerRef.current.contains(e.target)) return;
      const menuEl = document.getElementById(listboxId);
      if (menuEl && menuEl.contains(e.target)) return;
      setIsOpen(false);
      setSearchQuery('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, listboxId]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (isOpen) {
      const idx = filteredOptions.findIndex(o => o.value === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    } else {
      setActiveIndex(-1);
      setSearchQuery('');
    }
  }, [isOpen, searchable, value, filteredOptions]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !listboxRef.current) return;
    const activeEl = listboxRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => {
          let next = prev + 1;
          while (next < filteredOptions.length && filteredOptions[next].disabled) {
            next++;
          }
          return next < filteredOptions.length ? next : prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => {
          let next = prev - 1;
          while (next >= 0 && filteredOptions[next].disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(filteredOptions.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (e.target === searchInputRef.current && e.key === ' ') return;
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          const opt = filteredOptions[activeIndex];
          if (!opt.disabled) {
            onChange(opt.value);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelectOption = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Color variables
  const bgCard = isDark ? '#111827' : '#ffffff';
  const bgInner = isDark ? '#0d1424' : '#f8fafc';
  const borderCol = error
    ? '#ef4444'
    : isOpen
      ? '#059669'
      : isDark
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.1)';
  const txtCol = isDark ? '#f0f6ff' : '#0f172a';
  const txtMuted = isDark ? '#64748b' : '#94a3b8';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[34px]',
    md: 'px-3.5 py-2.5 text-xs rounded-xl min-h-[42px]',
    lg: 'px-4 py-3 text-sm rounded-2xl min-h-[48px]',
  }[size] || 'px-3.5 py-2.5 text-xs rounded-xl min-h-[42px]';

  return (
    <div className={`relative w-full ${className}`} onKeyDown={handleKeyDown}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5"
        >
          {TriggerIcon && <TriggerIcon className="w-3.5 h-3.5 text-emerald-500" />}
          <span>{label}</span>
          {required && <span className="text-red-400 font-bold">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        ref={triggerRef}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={!!error}
        aria-label={ariaLabel || label || placeholder}
        className={`w-full flex items-center justify-between gap-2.5 font-medium transition-all cursor-pointer outline-none select-none text-left ${sizeClasses} ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-emerald-500/50'
        }`}
        style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
          border: `1.5px solid ${borderCol}`,
          boxShadow: isOpen ? '0 0 0 3px rgba(5,150,105,0.15)' : 'none',
          color: selectedOption ? txtCol : txtMuted,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 flex items-center justify-center text-emerald-500">
              {React.isValidElement(selectedOption.icon) ? selectedOption.icon : <selectedOption.icon className="w-4 h-4" />}
            </span>
          )}
          {selectedOption?.badgeColor && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: selectedOption.badgeColor }}
            />
          )}
          <span className="truncate block font-semibold text-xs" style={{ color: selectedOption ? txtCol : txtMuted }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.tag && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0"
              style={{
                background: selectedOption.tagBg || 'rgba(5,150,105,0.12)',
                color: selectedOption.tagColor || '#059669',
              }}
            >
              {selectedOption.tag}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-500' : ''
          }`}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1 animate-fadeIn">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}

      {/* Dropdown Menu */}
      {portal ? (
        typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                id={listboxId}
                ref={listboxRef}
                role="listbox"
                aria-label={label || placeholder}
                initial={{ opacity: 0, scale: 0.96, y: coords.placement === 'bottom' ? -4 : 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: coords.placement === 'bottom' ? -4 : 4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-[9999] rounded-2xl overflow-hidden shadow-2xl border flex flex-col"
                style={{
                  top: coords.placement === 'bottom' ? coords.top : undefined,
                  bottom: coords.placement === 'top' ? (window.innerHeight - coords.top) : undefined,
                  left: coords.left,
                  width: coords.width,
                  maxHeight: coords.maxHeight || 300,
                  background: bgCard,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  boxShadow: isDark
                    ? '0 16px 40px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)'
                    : '0 16px 40px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Search Bar */}
                {searchable && (
                  <div
                    className="p-2.5 flex items-center gap-2 border-b flex-shrink-0"
                    style={{
                      background: bgInner,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    }}
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        setActiveIndex(0);
                      }}
                      placeholder="Search options…"
                      className="w-full bg-transparent text-xs font-medium outline-none"
                      style={{ color: txtCol }}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-0.5 rounded-full hover:bg-slate-500/20 text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Options List */}
                <div
                  ref={listboxRef}
                  className="overflow-y-auto p-1.5 space-y-1 custom-scrollbar flex-1"
                  tabIndex={-1}
                >
                  {filteredOptions.length === 0 ? (
                    <div className="py-6 px-4 text-center text-xs" style={{ color: txtMuted }}>
                      No matching options found
                    </div>
                  ) : (
                    filteredOptions.map((opt, idx) => {
                      const isSelected = opt.value === value;
                      const isActive = idx === activeIndex;

                      return (
                        <div
                          key={opt.value}
                          data-index={idx}
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={opt.disabled}
                          onClick={() => handleSelectOption(opt)}
                          onMouseEnter={() => !opt.disabled && setActiveIndex(idx)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-all select-none ${
                            opt.disabled
                              ? 'opacity-40 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                          style={{
                            background: isSelected
                              ? 'rgba(5,150,105,0.14)'
                              : isActive
                                ? isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
                                : 'transparent',
                            border: isSelected ? '1px solid rgba(5,150,105,0.3)' : '1px solid transparent',
                          }}
                        >
                          {opt.icon && (
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                background: opt.iconBg || (isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'),
                                color: opt.iconColor || (isSelected ? '#059669' : txtCol),
                              }}
                            >
                              {React.isValidElement(opt.icon) ? opt.icon : <opt.icon className="w-3.5 h-3.5" />}
                            </div>
                          )}

                          {opt.badgeColor && (
                            <div className="pt-1.5 flex-shrink-0">
                              <span className="w-2 h-2 rounded-full block" style={{ background: opt.badgeColor }} />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p
                                className={`text-xs leading-tight truncate ${isSelected ? 'font-black' : 'font-semibold'}`}
                                style={{ color: isSelected ? '#059669' : txtCol }}
                              >
                                {opt.label}
                              </p>
                              {opt.tag && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                                  style={{
                                    background: opt.tagBg || 'rgba(5,150,105,0.12)',
                                    color: opt.tagColor || '#059669',
                                  }}
                                >
                                  {opt.tag}
                                </span>
                              )}
                            </div>
                            {opt.description && (
                              <p className="text-[10px] mt-0.5 leading-snug line-clamp-2" style={{ color: txtMuted }}>
                                {opt.description}
                              </p>
                            )}
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      ) : (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={listboxId}
              ref={listboxRef}
              role="listbox"
              aria-label={label || placeholder}
              initial={{ opacity: 0, scale: 0.97, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl overflow-hidden shadow-2xl border flex flex-col"
              style={{
                maxHeight: 220,
                background: bgCard,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                boxShadow: isDark
                  ? '0 16px 40px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)'
                  : '0 16px 40px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Search Bar */}
              {searchable && (
                <div
                  className="p-2.5 flex items-center gap-2 border-b flex-shrink-0"
                  style={{
                    background: bgInner,
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  }}
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setActiveIndex(0);
                    }}
                    placeholder="Search options…"
                    className="w-full bg-transparent text-xs font-medium outline-none"
                    style={{ color: txtCol }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-0.5 rounded-full hover:bg-slate-500/20 text-slate-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Options List */}
              <div
                ref={listboxRef}
                className="overflow-y-auto p-1.5 space-y-1 custom-scrollbar flex-1"
                tabIndex={-1}
              >
                {filteredOptions.length === 0 ? (
                  <div className="py-6 px-4 text-center text-xs" style={{ color: txtMuted }}>
                    No matching options found
                  </div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = opt.value === value;
                    const isActive = idx === activeIndex;

                    return (
                      <div
                        key={opt.value}
                        data-index={idx}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled}
                        onClick={() => handleSelectOption(opt)}
                        onMouseEnter={() => !opt.disabled && setActiveIndex(idx)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-all select-none ${
                          opt.disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                        style={{
                          background: isSelected
                            ? 'rgba(5,150,105,0.14)'
                            : isActive
                              ? isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
                              : 'transparent',
                          border: isSelected ? '1px solid rgba(5,150,105,0.3)' : '1px solid transparent',
                        }}
                      >
                        {opt.icon && (
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: opt.iconBg || (isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'),
                              color: opt.iconColor || (isSelected ? '#059669' : txtCol),
                            }}
                          >
                            {React.isValidElement(opt.icon) ? opt.icon : <opt.icon className="w-3.5 h-3.5" />}
                          </div>
                        )}

                        {opt.badgeColor && (
                          <div className="pt-1.5 flex-shrink-0">
                            <span className="w-2 h-2 rounded-full block" style={{ background: opt.badgeColor }} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`text-xs leading-tight truncate ${isSelected ? 'font-black' : 'font-semibold'}`}
                              style={{ color: isSelected ? '#059669' : txtCol }}
                            >
                              {opt.label}
                            </p>
                            {opt.tag && (
                              <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                                style={{
                                  background: opt.tagBg || 'rgba(5,150,105,0.12)',
                                  color: opt.tagColor || '#059669',
                                }}
                              >
                                {opt.tag}
                              </span>
                            )}
                          </div>
                          {opt.description && (
                            <p className="text-[10px] mt-0.5 leading-snug line-clamp-2" style={{ color: txtMuted }}>
                              {opt.description}
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  LUXURY DROPDOWN MENU (ACTION MENU)                              */
/* ─────────────────────────────────────────────────────────────── */
export function LuxuryDropdownMenu({
  trigger,
  items = [],
  menuWidth = 220,
  align = 'auto',
  isDark = true,
  ariaLabel = 'Action menu',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const coords = useDropdownPosition(isOpen, triggerRef, menuWidth, align);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (triggerRef.current && triggerRef.current.contains(e.target)) return;
      const menuEl = document.getElementById(menuId);
      if (menuEl && menuEl.contains(e.target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, menuId]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    const actionableItems = items.filter(it => it.type !== 'divider' && !it.disabled);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % actionableItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + actionableItems.length) % actionableItems.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < actionableItems.length) {
          actionableItems[activeIndex].onClick?.();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const bgCard = isDark ? '#111827' : '#ffffff';
  const txtCol = isDark ? '#f0f6ff' : '#0f172a';
  const txtMuted = isDark ? '#8fa3c0' : '#64748b';
  const dividerCol = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="relative inline-block" onKeyDown={handleKeyDown}>
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={ariaLabel}
        tabIndex={0}
        className="inline-flex items-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
      >
        {trigger}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={menuId}
              ref={menuRef}
              role="menu"
              aria-label={ariaLabel}
              initial={{ opacity: 0, scale: 0.95, y: coords.placement === 'bottom' ? -4 : 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: coords.placement === 'bottom' ? -4 : 4 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              className="fixed z-[9999] rounded-2xl p-1.5 shadow-2xl border flex flex-col select-none overflow-hidden"
              style={{
                top: coords.placement === 'bottom' ? coords.top : undefined,
                bottom: coords.placement === 'top' ? (window.innerHeight - coords.top) : undefined,
                left: coords.left,
                width: coords.width,
                background: bgCard,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                boxShadow: isDark
                  ? '0 16px 40px -8px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)'
                  : '0 16px 40px -8px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {items.map((item, idx) => {
                if (item.type === 'divider') {
                  return (
                    <div
                      key={`div-${idx}`}
                      className="my-1 border-t"
                      style={{ borderColor: dividerCol }}
                    />
                  );
                }

                if (item.type === 'header') {
                  return (
                    <div
                      key={`hdr-${idx}`}
                      className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest"
                      style={{ color: txtMuted }}
                    >
                      {item.label}
                    </div>
                  );
                }

                const isDanger = item.danger;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id || item.label || idx}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.disabled) return;
                      item.onClick?.();
                      setIsOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                      item.disabled
                        ? 'opacity-35 cursor-not-allowed'
                        : isDanger
                          ? 'hover:bg-red-500/10 text-red-400 hover:text-red-500 cursor-pointer'
                          : 'hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer'
                    }`}
                    style={{
                      color: isDanger ? '#ef4444' : txtCol,
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {Icon && (
                        <Icon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isDanger ? 'text-red-500' : 'text-slate-400 group-hover:text-emerald-500'
                          }`}
                        />
                      )}
                      <div className="truncate">
                        <span className="block truncate">{item.label}</span>
                        {item.description && (
                          <span className="block text-[10px] font-normal leading-tight opacity-70">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                        style={{
                          background: item.badgeBg || (isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(5,150,105,0.12)'),
                          color: item.badgeColor || (isDanger ? '#ef4444' : '#059669'),
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  LUXURY COMBOBOX (SEARCHABLE PRESETS + CUSTOM ENTRY)             */
/* ─────────────────────────────────────────────────────────────── */
export function LuxuryCombobox({
  value,
  onChange,
  presets = [],
  placeholder = 'Type custom or pick preset…',
  label,
  icon: TriggerIcon,
  required = false,
  error,
  isDark = true,
  className = '',
  id: customId,
  portal = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const autoId = useId();
  const id = customId || autoId;
  const listboxId = `${id}-listbox`;

  const coords = useDropdownPosition(isOpen && portal, containerRef, 'auto');

  const filteredPresets = presets.filter(p =>
    p.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && containerRef.current.contains(e.target)) return;
      const menuEl = document.getElementById(listboxId);
      if (menuEl && menuEl.contains(e.target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, listboxId]);

  const handleSelectPreset = (preset) => {
    onChange(preset);
    setFilterText('');
    setIsOpen(false);
  };

  const bgCard = isDark ? '#111827' : '#ffffff';
  const txtCol = isDark ? '#f0f6ff' : '#0f172a';
  const txtMuted = isDark ? '#64748b' : '#94a3b8';
  const borderCol = error
    ? '#ef4444'
    : isOpen
      ? '#059669'
      : isDark
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.1)';

  const dropdownListContent = (
    <>
      <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
        <span>Select from Presets:</span>
        <span className="text-[9px] text-emerald-500">{filteredPresets.length} available</span>
      </div>
      <div className="overflow-y-auto space-y-0.5 custom-scrollbar flex-1 max-h-44">
        {filteredPresets.length === 0 ? (
          <div className="py-3 text-center text-xs" style={{ color: txtMuted }}>
            No preset matches &ldquo;{filterText}&rdquo; (custom entry will be saved)
          </div>
        ) : (
          filteredPresets.map(preset => {
            const isSelected = value === preset;
            return (
              <button
                key={preset}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectPreset(preset)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-500 font-black'
                    : 'hover:bg-slate-500/10'
                }`}
                style={{ color: isSelected ? '#059669' : txtCol }}
              >
                <span>{preset}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5"
        >
          {TriggerIcon && <TriggerIcon className="w-3.5 h-3.5 text-emerald-500" />}
          <span>{label}</span>
          {required && <span className="text-red-400 font-bold">*</span>}
        </label>
      )}

      {/* Input container */}
      <div
        ref={containerRef}
        className="w-full flex items-center gap-2 px-3.5 py-1 text-xs rounded-xl transition-all"
        style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
          border: `1.5px solid ${borderCol}`,
          boxShadow: isOpen ? '0 0 0 3px rgba(5,150,105,0.15)' : 'none',
        }}
      >
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setFilterText(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!value && !isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-invalid={!!error}
          className="w-full bg-transparent py-1.5 outline-none font-medium text-xs"
          style={{ color: txtCol }}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setFilterText('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Clear"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          tabIndex={-1}
          className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
          title="Toggle presets"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`}
          />
        </button>
      </div>

      {error && (
        <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1 animate-fadeIn">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}

      {/* Preset List Dropdown */}
      {!portal ? (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={listboxId}
              role="listbox"
              initial={{ opacity: 0, scale: 0.97, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl overflow-hidden shadow-2xl border flex flex-col p-1.5"
              style={{
                maxHeight: 220,
                background: bgCard,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                boxShadow: isDark
                  ? '0 16px 40px -8px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)'
                  : '0 16px 40px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {dropdownListContent}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                id={listboxId}
                role="listbox"
                initial={{ opacity: 0, scale: 0.96, y: coords.placement === 'bottom' ? -4 : 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: coords.placement === 'bottom' ? -4 : 4 }}
                transition={{ duration: 0.14 }}
                className="fixed z-[9999] rounded-2xl overflow-hidden shadow-2xl border flex flex-col p-1.5"
                style={{
                  top: coords.placement === 'bottom' ? coords.top : undefined,
                  bottom: coords.placement === 'top' ? (window.innerHeight - coords.top) : undefined,
                  left: coords.left,
                  width: coords.width,
                  maxHeight: coords.maxHeight || 240,
                  background: bgCard,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  boxShadow: isDark
                    ? '0 16px 40px -8px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)'
                    : '0 16px 40px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
                }}
                onClick={e => e.stopPropagation()}
              >
                {dropdownListContent}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      )}
    </div>
  );
}
