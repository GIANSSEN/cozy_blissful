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

  /* Fetch if user is admin or currently on admin dashboard */
  const isAdmin = 
    role?.toLowerCase() === 'admin' || 
    user?.role?.toLowerCase() === 'admin' ||
    (Array.isArray(user?.roles) && user.roles.some(r => (typeof r === 'string' ? r : r?.name)?.toLowerCase() === 'admin')) ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const { data } = await API.get('/admin/notifications');
      if (data && Array.isArray(data.notifications)) {
        setNotifs(data.notifications);
        setUnreadCount(data.unread_count ?? data.notifications.filter(n => n.unread).length);
      }
    } catch (err) {
      /* fail gracefully without crashing UI */
      console.warn('Failed to fetch admin notifications:', err);
    } finally {
      setLoading(false);
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
