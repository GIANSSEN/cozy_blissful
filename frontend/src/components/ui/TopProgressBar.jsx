import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * TopProgressBar — YouTube / GitHub / Linear style top-of-browser loading bar.
 * Provides an unmistakable indication that the browser / page is loading whenever
 * a route changes, a menu item is clicked, or an async page transition starts.
 */
let globalStartLoading = null;
let globalStopLoading = null;

export const triggerBrowserLoading = () => {
  if (globalStartLoading) globalStartLoading();
};

export const completeBrowserLoading = () => {
  if (globalStopLoading) globalStopLoading();
};

const TopProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const isFirstMount = useRef(true);

  const startProgress = () => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setVisible(true);
    setProgress(18);

    // Trickle progress up to 88%
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 88;
        }
        // Organic slowing step
        const diff = (90 - prev) * 0.18;
        return Math.min(88, prev + Math.max(diff, 1.5));
      });
    }, 120);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    finishTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 280);
  };

  // Expose global methods
  useEffect(() => {
    globalStartLoading = startProgress;
    globalStopLoading = completeProgress;

    const handleStartEvent = () => startProgress();
    const handleStopEvent = () => completeProgress();

    window.addEventListener('cb:start-loading', handleStartEvent);
    window.addEventListener('cb:stop-loading', handleStopEvent);

    return () => {
      globalStartLoading = null;
      globalStopLoading = null;
      window.removeEventListener('cb:start-loading', handleStartEvent);
      window.removeEventListener('cb:stop-loading', handleStopEvent);
    };
  }, []);

  // Intercept click on any link or navigation item
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Find closest anchor or element marked for nav loading
      const anchor = e.target.closest('a[href], [data-nav-link="true"], .sb-item');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      // If it's a real internal link that changes the route or is a nav item
      if (href) {
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || anchor.target === '_blank') {
          return;
        }
        const currentPath = window.location.pathname + window.location.search;
        if (href !== currentPath) {
          startProgress();
        }
      } else if (anchor.classList.contains('sb-item') || anchor.getAttribute('data-nav-link') === 'true') {
        startProgress();
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, []);

  // Trigger when location changes (route transition completed)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // When location updates, finish the loading bar smoothly
    completeProgress();
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 pointer-events-none z-[99999]"
      style={{
        height: '3px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 250ms ease-out',
      }}
    >
      <div
        className="h-full relative transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '150ms',
          background: 'linear-gradient(90deg, #10b981 0%, #bfa15f 60%, #e0c283 100%)',
          boxShadow: '0 0 10px rgba(191,161,95,0.7), 0 0 5px rgba(16,185,129,0.5)',
        }}
      >
        {/* Glow peg at leading edge */}
        <div
          className="absolute right-0 top-0 bottom-0 w-28 -translate-y-[1px]"
          style={{
            boxShadow: '0 0 14px 2px #e0c283, 0 0 8px 1px #10b981',
            borderRadius: '9999px',
          }}
        />
      </div>
    </div>
  );
};

export default TopProgressBar;
