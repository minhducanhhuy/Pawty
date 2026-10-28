import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { NotificationItem } from '../types';
import { api } from '../api/endpoints';
import { API_BASE_URL, USE_MOCK_ENV } from '../api/client';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  inAppBanner: NotificationItem | null;
  dismissBanner: () => void;
  reloadNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  pushLocalNotification: (notif: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) => void;
  emitSocket: (event: string, payload: unknown) => void;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [inAppBanner, setInAppBanner] = useState<NotificationItem | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const reloadNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.items);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    reloadNotifications();
  }, [reloadNotifications]);

  const pushLocalNotification = useCallback(
    (notif: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) => {
      const item: NotificationItem = {
        ...notif,
        id: `notif_${Date.now()}`,
        isRead: false,
        createdAt: 'Vừa xong',
      };
      setNotifications((prev) => [item, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setInAppBanner(item);
      setTimeout(() => {
        setInAppBanner((curr) => (curr?.id === item.id ? null : curr));
      }, 4000);
    },
    [],
  );

  useEffect(() => {
    if (!token || USE_MOCK_ENV) return;
    const wsUrl = API_BASE_URL.replace(/\/api$/, '');
    const sock = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 2,
      timeout: 2500,
    });
    socketRef.current = sock;

    sock.on('notification_created', (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setInAppBanner(notif);
    });

    return () => {
      sock.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const markAllRead = useCallback(async () => {
    try {
      await api.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  }, []);

  const emitSocket = useCallback((event: string, payload: unknown) => {
    socketRef.current?.emit(event, payload);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        inAppBanner,
        dismissBanner: () => setInAppBanner(null),
        reloadNotifications,
        markAllRead,
        pushLocalNotification,
        emitSocket,
        socket: socketRef.current,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
