"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faCheck } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { parseBackendDate } from '@/utils/dateUtils';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}

export default function NotificationsPage() {
  const t = useTranslations('NotificationsPage');
  const locale = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const dateLocale = locale === 'en' ? enUS : fr;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | boolean> = {};
      if (filter === 'unread') params.is_read = false;
      
      const response = await api.get('/notifications/', { params });
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      if (filter === 'unread') {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      if (filter === 'unread') {
        setNotifications([]);
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };


  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-500 text-xl" />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-xl" />;
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-foreground/60 mt-1">
              {unreadCount > 0 ? t('unreadCount', { count: unreadCount }) : t('allCaughtUp')}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faCheck} />
              {t('markAllRead')}
            </button>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-slate-800 text-foreground/80 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('filterAll', { count: notifications.length })}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-slate-800 text-foreground/80 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('filterUnread', { count: unreadCount })}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <p className="text-foreground/60">
              {filter === 'unread' ? t('noUnread') : t('noNotifications')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 rounded-xl border transition-all ${
                  !notification.is_read
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                }`}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-foreground ${!notification.is_read ? 'font-semibold' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-sm text-foreground/60 mt-2">
                      {formatDistanceToNow(parseBackendDate(notification.created_at), {
                        addSuffix: true,
                        locale: dateLocale
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="shrink-0 px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      {t('markAsRead')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
