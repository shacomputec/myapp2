
import React, { useState } from 'react';
import { useLanguage } from '../services/localization';
import { useAuth } from '../services/auth';
import { useTheme } from '../services/theme';
import { useNotifications } from '../services/notifications';
import { NOTIFICATION_ICONS } from '../constants';
import type { Page, NotificationLink } from '../types';

interface HeaderProps {
    onNotificationClick: (link: NotificationLink) => void;
}

const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const Header: React.FC<HeaderProps> = ({ onNotificationClick }) => {
  const { t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);


  if (!currentUser) {
    return null; // or a loading state
  }

  const handleNotificationItemClick = (notification: typeof notifications[0]) => {
      if (notification.link) {
          onNotificationClick(notification.link);
          setIsNotificationsOpen(false);
      }
      if (!notification.isRead) {
          markAsRead(notification.id);
      }
  };


  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-slate-800 dark:border-b dark:border-slate-700">
      <div className="flex items-center">
        {/* Search bar could go here */}
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
        <div className="relative">
            <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 mt-0.5 mr-0.5 bg-accent rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>
             {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 dark:bg-slate-800 border dark:border-slate-700 flex flex-col max-h-[80vh]">
                    <div className="p-3 flex justify-between items-center border-b dark:border-slate-700">
                        <h4 className="font-semibold text-dark-text dark:text-slate-200">Notifications</h4>
                        {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-semibold">Mark all as read</button>}
                    </div>
                    <div className="overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notification => (
                            <div key={notification.id} onClick={() => handleNotificationItemClick(notification)} className={`flex items-start p-3 border-b dark:border-slate-700 hover:bg-light-bg dark:hover:bg-slate-700/50 cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></div>}
                                <div className={`mr-3 flex-shrink-0 ${notification.isRead ? 'ml-5' : ''}`}>{NOTIFICATION_ICONS[notification.type]}</div>
                                <div className="flex-grow">
                                    <p className="text-sm text-dark-text dark:text-slate-300">{notification.message}</p>
                                    <p className="text-xs text-light-text mt-1 dark:text-slate-400">{timeAgo(notification.timestamp)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-sm text-light-text p-8 dark:text-slate-400">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={currentUser.avatarUrl}
            alt="User avatar"
          />
          <div className="ml-2">
            <p className="text-sm font-semibold text-dark-text dark:text-slate-200">{currentUser.name}</p>
            <p className="text-xs text-light-text dark:text-slate-400">{currentUser.role.name}</p>
          </div>
        </div>
        <button
            onClick={logout}
            className="text-sm p-2 border border-transparent rounded-md text-light-text hover:bg-light-bg hover:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            title="Logout"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;