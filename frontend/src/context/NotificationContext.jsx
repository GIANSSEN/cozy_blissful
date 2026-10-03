import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};

const POLL_INTERVAL = 30_000; // 30s smart polling to prevent server request lag
const FOCUS_COOLDOWN = 15_000; // Min 15s between tab-focus refreshes

export const NotificationProvider = ({ children }) => {
  const { user, role } = useAuth();

  const [notifs,      setNotifs]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const intervalRef = useRef(null);
  const lastFetchTimestamp = useRef(0);

  /* Robust admin/staff detection with active token check */
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const isAdmin =
    Boolean(token) &&
    (role === 'admin' ||
      role === 'staff' ||
      storedRole === 'admin' ||
      storedRole === 'staff' ||
      (user && (user.role === 'admin' || user.role === 'staff')) ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')));

  /* ─── Core fetch ─────────────────────────────────────────────── */
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!isAdmin) return;

    if (!silent) setLoading(true);
    try {
      const { data } = await API.get('/admin/notifications');
      if (data && Array.isArray(data.notifications)) {
        setNotifs(data.notifications);
        setUnreadCount(
          typeof data.unread_count === 'number'
            ? data.unread_count
            : data.notifications.filter((n) => n.unread).length
        );
        const now = new Date();
        setLastFetched(now);
        lastFetchTimestamp.current = now.getTime();
      }
    } catch (err) {
      // Silently ignore auth errors (e.g. 401 on logout)
      if (err?.response?.status !== 401) {
        console.warn('[Notifications] fetch failed:', err?.message ?? err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAdmin]);

  /* ─── Polling + focus re-fetch ───────────────────────────────── */
  useEffect(() => {
    if (!isAdmin) {
      setNotifs([]);
      setUnreadCount(0);
      return;
    }

    // Immediate first fetch
    fetchNotifications();

    // Poll every 30s only when document is visible
    intervalRef.current = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchNotifications(true);
      }
    }, POLL_INTERVAL);

    // Re-fetch on tab focus or visibility change only if cooldown elapsed
    const handleRecheck = () => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible' &&
        Date.now() - lastFetchTimestamp.current >= FOCUS_COOLDOWN
      ) {
        fetchNotifications(true);
      }
    };

    window.addEventListener('focus', handleRecheck);
    document.addEventListener('visibilitychange', handleRecheck);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('focus', handleRecheck);
      document.removeEventListener('visibilitychange', handleRecheck);
    };
  }, [isAdmin, fetchNotifications]);

  /* ─── Mark single read (optimistic) ─────────────────────────── */
  const markRead = useCallback(async (id) => {
    // Optimistic update
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await API.post(`/admin/notifications/${id}/read`);
    } catch {
      // Revert on failure
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  /* ─── Mark all read (optimistic) ────────────────────────────── */
  const markAllRead = useCallback(async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);

    try {
      await API.post('/admin/notifications/read-all');
    } catch {
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  /* ─── Expose refresh so panel can force-refresh on open ──────── */
  const refresh = useCallback(() => fetchNotifications(), [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifs, unreadCount, loading, lastFetched, markRead, markAllRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
