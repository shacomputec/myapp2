
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { Notification } from '../types';
import { MOCK_NOTIFICATIONS } from '../constants';
import { useAuth } from './auth';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const { currentUser } = useAuth();

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    // Admins see their specific notifications in this mock-up
    if (currentUser.role.name === 'Administrator') {
        return notifications.filter(n => n.userId === 'S005').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return notifications.filter(n => n.userId === currentUser.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [currentUser, notifications]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.isRead).length;
  }, [userNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
      if (!currentUser) return;
      const userNotificationIds = new Set(userNotifications.map(n => n.id));
      setNotifications(prev =>
        prev.map(n => (userNotificationIds.has(n.id) ? { ...n, isRead: true } : n))
      );
  }, [currentUser, userNotifications]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      id: `N${Date.now()}`,
      ...notificationData,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);
  
  const value = useMemo(() => ({
    notifications: userNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  }), [userNotifications, unreadCount, markAsRead, markAllAsRead, addNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};