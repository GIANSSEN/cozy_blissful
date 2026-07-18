import React from 'react';

const LoadingSpinner = ({ fullPage = false, message = "Loading..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
      {/* Premium Multi-ring Spinner */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer Ring - Gold */}
        <div 
          className="absolute inset-0 rounded-full border-[3px] border-amber-500/10 border-t-amber-500 animate-spin" 
          style={{ animationDuration: '1.2s' }} 
        />
        {/* Middle Ring - Emerald, spinning counter-clockwise */}
        <div 
          className="absolute inset-2 rounded-full border-[3px] border-emerald-800/10 border-b-emerald-800 animate-spin" 
          style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} 
        />
        {/* Inner Ring Glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-800/20 animate-pulse" />
      </div>
      {message && (
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 fixed inset-0 z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[16rem]">
      {content}
    </div>
  );
};

export default LoadingSpinner;
