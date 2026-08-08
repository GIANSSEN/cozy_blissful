import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }) => {
  const { user, role } = useAuth();
  const [notifs, setNotifs]         = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]       = useState(false);
  const intervalRef                 = useRef(null);

  /* Only fetch if the logged-in user is an admin */
  const isAdmin = role === 'admin';

  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await API.get('/admin/notifications');
      setNotifs(data.notifications || []);
      setUnreadCount(data.unread_count ?? 0);
    } catch {
      /* silently fail — don't spam errors on poll failures */
    }
  }, [isAdmin]);

  /* Initial fetch + 30-second polling */
  useEffect(() => {
    if (!isAdmin) return;

    fetchNotifications();

    intervalRef.current = setInterval(fetchNotifications, 30_000);

    /* Re-fetch on window focus */
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAdmin, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    try {
      await API.post(`/admin/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await API.post('/admin/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch { /* silent */ }
  }, []);

  const refresh = useCallback(() => fetchNotifications(), [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ notifs, unreadCount, loading, markRead, markAllRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
};
