"use client";

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, useDragControls, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * spring-element — draggable element with a live SVG spring tether.
 *
 * Ported from TSX to JSX for this codebase (JS + Tailwind v4, no TS).
 * Uses the already-installed framer-motion v12 — the exact same engine
 * as the `motion` package (Motion is framer-motion renamed), so no extra
 * dependency was installed.
 *
 * Three additive, backwards-compatible props vs the original:
 *  - overlayClassName: z-index of the fixed spring-tether SVG
 *    (default 'z-40'; pass 'z-[130]' when used inside ModalShell).
 *  - onDragOffsetChange({x, y}): fired on every drag frame so parents
 *    (e.g. a menu-trigger avatar) can tell a real drag apart from a click.
 *  - dragActivationThreshold (default 10px): the pointer must travel
 *    this far while pressed before the drag engages. Plain clicks and
 *    accidental micro-movements never move the element.
 */
const generateSpringPath = (
  x1,
  y1,
  x2,
  y2,
  springConfig = {},
) => {
  const {
    coilCount = 8,
    amplitudeMin = 8,
    amplitudeMax = 20,
    curveRatioMin = 0.5,
    curveRatioMax = 1,
    bezierOffset = 8,
  } = springConfig;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 2) return `M${x1},${y1}`;
  const d = dist / coilCount;
  const h = Math.max(0.8, 1 - (dist - 40) / 200);
  const amplitude = Math.max(
    amplitudeMin,
    Math.min(amplitudeMax, amplitudeMax * h),
  );
  const curveRatio =
    dist <= 40
      ? curveRatioMax
      : dist <= 120
        ? curveRatioMax - ((dist - 40) / 80) * (curveRatioMax - curveRatioMin)
        : curveRatioMin;
  const ux = dx / dist,
    uy = dy / dist;
  const perpX = -uy,
    perpY = ux;

  const path = [];
  for (let i = 0; i < coilCount; i++) {
    const sx = x1 + ux * (i * d);
    const sy = y1 + uy * (i * d);
    const ex = x1 + ux * ((i + 1) * d);
    const ey = y1 + uy * ((i + 1) * d);

    const mx = x1 + ux * ((i + 0.5) * d) + perpX * amplitude;
    const my = y1 + uy * ((i + 0.5) * d) + perpY * amplitude;

    const c1x = sx + d * curveRatio * ux;
    const c1y = sy + d * curveRatio * uy;
    const c2x = mx + ux * bezierOffset;
    const c2y = my + uy * bezierOffset;
    const c3x = mx - ux * bezierOffset;
    const c3y = my - uy * bezierOffset;
    const c4x = ex - d * curveRatio * ux;
    const c4y = ey - d * curveRatio * uy;

    if (i === 0) path.push(`M${sx},${sy}`);
    else path.push(`L${sx},${sy}`);
    path.push(`C${c1x},${c1y} ${c2x},${c2y} ${mx},${my}`);
    path.push(`C${c3x},${c3y} ${c4x},${c4y} ${ex},${ey}`);
  }
  return path.join(' ');
};

function useMotionValueValue(mv) {
  return React.useSyncExternalStore(
    (callback) => {
      const unsub = mv.on('change', callback);
      return unsub;
    },
    () => mv.get(),
    () => mv.get(),
  );
}

export const Component = ({
  ref,
  children,
  className,
  springClassName,
  overlayClassName = 'z-40',
  dragElastic = 0.2,
  springConfig = { stiffness: 200, damping: 16 },
  springPathConfig = {},
  onDragOffsetChange,
  dragActivationThreshold = 10,
  ...props
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useDragControls();
  const downPos = React.useRef(null);

  const springX = useSpring(x, {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
  });
  const springY = useSpring(y, {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
  });

  const sx = useMotionValueValue(springX);
  const sy = useMotionValueValue(springY);

  const childRef = React.useRef(null);
  React.useImperativeHandle(ref, () => childRef.current);
  const [center, setCenter] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);

  /* Viewport-center of the element — the tether's anchor point.
     Re-measured on mount/resize/scroll AND at every drag start so
     the spring always originates from the true on-screen position. */
  const measureCenter = React.useCallback(() => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, []);

  React.useLayoutEffect(() => {
    measureCenter();
    window.addEventListener('resize', measureCenter);
    window.addEventListener('scroll', measureCenter, true);
    return () => {
      window.removeEventListener('resize', measureCenter);
      window.removeEventListener('scroll', measureCenter, true);
    };
  }, [measureCenter]);

  /* Intentional-drag gating: record press point, engage framer's drag
     controls only after the pointer travels past the threshold.
     e.buttons > 0 guarantees a button is actually held (hover moves
     and scroll gestures never start a drag). */
  const handlePointerDown = (e) => {
    downPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    const start = downPos.current;
    if (!start || isDragging || e.buttons === 0) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > dragActivationThreshold) {
      downPos.current = null;
      controls.start(e);
    }
  };

  const handlePointerUp = () => {
    downPos.current = null;
  };

  React.useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isDragging]);

  const path = generateSpringPath(
    center.x,
    center.y,
    center.x + sx,
    center.y + sy,
    springPathConfig,
  );

  /* The tether MUST live at document.body level. Any ancestor with
     backdrop-filter / filter / transform (all app headers use
     backdrop-blur) becomes the containing block for `position: fixed`,
     which misplaces viewport-measured path coordinates and makes the
     spring render off-box (invisible) while dragging.
     h-dvh (not h-screen): on mobile the layout viewport (100vh) differs
     from the visual viewport when the URL bar shows/hides, while drag
     coordinates from getBoundingClientRect() are visual-viewport based.
     Dynamic viewport units keep the tether endpoint glued to the avatar. */
  const overlay = (
    <svg
      width="100vw"
      height="100vh"
      aria-hidden="true"
        className={cn(
          'fixed inset-0 w-screen h-screen h-dvh pointer-events-none',
          overlayClassName,
        )}
    >
      <path
        d={path}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'stroke-2 stroke-neutral-900 dark:stroke-neutral-100 fill-none',
          springClassName,
        )}
      />
    </svg>
  );

  return (
    <>
      {typeof document !== 'undefined' ? createPortal(overlay, document.body) : overlay}
      <motion.div
        ref={childRef}
        className={cn(
          'z-50 touch-pan-y',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          className,
        )}
        style={{
          x: springX,
          y: springY,
        }}
        drag
        dragListener={false}
        dragControls={controls}
        dragElastic={dragElastic}
        dragMomentum={false}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={() => {
          measureCenter();
          setIsDragging(true);
        }}
        onDrag={(_, info) => {
          x.set(info.offset.x);
          y.set(info.offset.y);
          onDragOffsetChange?.({ x: info.offset.x, y: info.offset.y });
        }}
        onDragEnd={() => {
          x.set(0);
          y.set(0);
          setIsDragging(false);
          downPos.current = null;
        }}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const SpringElement = Component;
export default Component;
