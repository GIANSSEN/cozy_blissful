import React from 'react';

// Standard clay placeholder wrapper
export const SkeletonCard = ({ className = '', style = {}, children, ...props }) => (
  <div
    className={`rounded-3xl overflow-hidden ${className}`}
    style={{
      background: 'linear-gradient(145deg, var(--bg) 0%, rgba(250,248,245,0.4) 100%)',
      boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.02), inset -2px -2px 8px rgba(255,255,255,0.8)',
      border: '1px solid var(--border)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

// Shimmer block
export const ShimmerBlock = ({ className = '', style = {} }) => (
  <div className={`shimmer rounded-xl ${className}`} style={{ minHeight: '12px', ...style }} />
);

// ── 1. Stats Row Skeletons ──
export const SkeletonStatsRow = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
    {[1, 2, 3, 4].map(idx => (
      <SkeletonCard key={idx} className="p-5 flex items-center space-x-4">
        {/* Circle/Icon placeholder */}
        <div className="w-12 h-12 rounded-2xl flex-shrink-0 shimmer" />
        <div className="flex-1 space-y-2">
          {/* Label placeholder */}
          <ShimmerBlock className="w-24 h-2.5" />
          {/* Number placeholder */}
          <ShimmerBlock className="w-12 h-5 rounded-lg" />
        </div>
      </SkeletonCard>
    ))}
  </div>
);

// ── 2. Schedule Coordinator Skeleton ──
export const SkeletonScheduleEditor = () => (
  <SkeletonCard className="p-6 space-y-5">
    <div className="space-y-2">
      <ShimmerBlock className="w-44 h-3" />
      <ShimmerBlock className="w-full h-10 rounded-xl" />
    </div>
    <div className="space-y-4">
      <ShimmerBlock className="w-72 h-3" />
      <div className="grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map(idx => (
          <div key={idx} className="p-2.5 rounded-xl flex flex-col items-center justify-center space-y-2 border border-dashed border-slate-200" style={{ height: 60 }}>
            <ShimmerBlock className="w-6 h-2" />
            <ShimmerBlock className="w-4 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  </SkeletonCard>
);

// ── 3. List / Cards Grid Skeleton ──
export const SkeletonCardList = ({ count = 4, gridCols = 'grid sm:grid-cols-2 gap-4' }) => (
  <div className={gridCols}>
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonCard key={idx} className="p-4 flex items-center justify-between">
        <div className="flex-1 min-w-0 space-y-2">
          <ShimmerBlock className="w-1/2 h-3.5" />
          <ShimmerBlock className="w-1/3 h-2.5" />
        </div>
        <ShimmerBlock className="w-20 h-6 rounded-full flex-shrink-0" />
      </SkeletonCard>
    ))}
  </div>
);

// ── 4. Session Feed / Appointment list Skeletons ──
export const SkeletonSessionFeed = ({ count = 3 }) => (
  <div className="space-y-3.5">
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonCard key={idx} className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-2xl flex-shrink-0 shimmer" />
            <div className="flex-1 min-w-0 space-y-2">
              <ShimmerBlock className="w-3/4 h-3.5" />
              <ShimmerBlock className="w-1/2 h-2.5" />
            </div>
          </div>
          <ShimmerBlock className="w-16 h-5 rounded-full flex-shrink-0" />
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <ShimmerBlock className="w-24 h-3" />
          <ShimmerBlock className="w-14 h-2.5" />
        </div>
      </SkeletonCard>
    ))}
  </div>
);

// ── 5. Calendar Matrix Table (StaffTherapists tab 2) ──
export const SkeletonCalendarGrid = () => (
  <SkeletonCard className="p-6 space-y-4">
    <div className="min-w-[600px] space-y-4">
      {/* Header row */}
      <div className="flex gap-2">
        <div className="w-40 flex-shrink-0" />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(idx => (
          <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center space-y-1">
            <ShimmerBlock className="w-6 h-2" />
            <ShimmerBlock className="w-4 h-3" />
          </div>
        ))}
      </div>

      {/* Row items */}
      {[1, 2, 3, 4].map(rowIdx => (
        <div key={rowIdx} className="flex items-center gap-2">
          <div className="w-40 flex-shrink-0 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 shimmer" />
            <div className="flex-1 space-y-1 min-w-0">
              <ShimmerBlock className="w-20 h-2.5" />
              <ShimmerBlock className="w-12 h-2" />
            </div>
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(colIdx => (
            <div key={colIdx} className="flex-1 min-w-[36px] h-9 rounded-lg shimmer" />
          ))}
        </div>
      ))}
    </div>
  </SkeletonCard>
);

// ── 6. RBAC Configuration Skeletons (AdminStaff tab 3) ──
export const SkeletonRbacList = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map(idx => (
      <SkeletonCard key={idx} className="overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex-shrink-0 shimmer" />
            <div className="space-y-1.5">
              <ShimmerBlock className="w-28 h-3.5" />
              <ShimmerBlock className="w-44 h-2.5" />
            </div>
          </div>
          <ShimmerBlock className="w-16 h-5 rounded-full" />
        </div>
        {/* Permission toggles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-slate-50">
          {[1, 2, 3, 4].map(toggleIdx => (
            <div key={toggleIdx} className="flex flex-col items-center justify-center gap-3 px-4 py-5 text-center">
              <ShimmerBlock className="w-20 h-3" />
              <ShimmerBlock className="w-28 h-2 lg:block hidden" />
              <div className="w-10 h-5.5 rounded-full shimmer" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    ))}
  </div>
);

// ── 7. Image-Text Grid Skeleton matching user reference image ──
export const ShimmerCardImageText = () => (
  <SkeletonCard className="p-5 space-y-4">
    {/* Large image/content block placeholder (rounded corners) */}
    <div className="w-full aspect-[16/10] rounded-2xl shimmer" />
    {/* 3 lines of text placeholders under the block */}
    <div className="space-y-2">
      <ShimmerBlock className="w-full h-3 rounded-lg" style={{ height: '11px' }} />
      <ShimmerBlock className="w-3/4 h-3 rounded-lg" style={{ height: '11px' }} />
      <ShimmerBlock className="w-1/2 h-3 rounded-lg" style={{ height: '11px' }} />
    </div>
  </SkeletonCard>
);

export const ImageTextSkeletonGrid = ({ cols = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }) => (
  <div className="space-y-8 animate-pulse">
    {/* Section 1 Title horizontal pill */}
    <ShimmerBlock className="w-48 h-5 rounded-lg" style={{ height: '20px' }} />

    {/* Section 1 Grid */}
    <div className={cols}>
      {[1, 2, 3].map(i => (
        <ShimmerCardImageText key={i} />
      ))}
    </div>

    {/* Section 2 Title horizontal pill */}
    <ShimmerBlock className="w-64 h-5 rounded-lg" style={{ height: '20px' }} />

    {/* Section 2 Grid */}
    <div className={cols}>
      {[1, 2, 3].map(i => (
        <ShimmerCardImageText key={i} />
      ))}
    </div>
  </div>
);

