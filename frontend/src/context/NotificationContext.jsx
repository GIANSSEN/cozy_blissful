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

const POLL_INTERVAL = 10_000; // 10s real-time polling

export const NotificationProvider = ({ children }) => {
  const { user, role } = useAuth();

  const [notifs,      setNotifs]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const intervalRef = useRef(null);

  /* Robust admin/staff detection */
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const isAdmin =
    role === 'admin' ||
    role === 'staff' ||
    storedRole === 'admin' ||
    storedRole === 'staff' ||
    (user && (user.role === 'admin' || user.role === 'staff')) ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

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
        setLastFetched(new Date());
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

    // Poll every 10s
    intervalRef.current = setInterval(() => fetchNotifications(true), POLL_INTERVAL);

    // Re-fetch on tab focus or visibility change
    const onFocus = () => fetchNotifications(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(true);
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
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
