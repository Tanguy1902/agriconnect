"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Link } from '@/i18n/routing';
import api from '@/lib/api';
import { parseBackendDate } from '@/utils/dateUtils';
import { useTranslations, useLocale } from 'next-intl';


interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: number) => void;
  onClose: () => void;
}

export default function NotificationPanel({ 
  notifications, 
  loading, 
  onMarkAsRead,
  onClose 
}: NotificationPanelProps) {
  const t = useTranslations('Notifications');
  const locale = useLocale();
  
  // Malagasy locale is not directly available in date-fns, 
  // we can fallback to French or English or define a custom one if needed.
  // For now, let's use French for 'fr' and 'mg', and English for others.
  const dateLocale = locale === 'en' ? enUS : fr;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-500" />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />;
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 max-h-[32rem] overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-foreground">{t('title')}</h3>
          <button 
            onClick={() => {
              api.post('/notifications/mark-all-read').then(() => {
                // We might need a way to refresh the parent state here
                // For now, let's just assume it works and the next poll will fix it
                // or the user can refresh
              });
            }}
            className="text-xs text-foreground/60 hover:text-primary transition-colors"
          >
            {t('markAllRead')}
          </button>
        </div>
        <Link 
          href="/dashboard/notifications"
          className="text-sm text-primary hover:underline"
          onClick={onClose}
        >
          {t('viewAll')}
        </Link>
      </div>


      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center text-foreground/60">
            {t('loading')}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-foreground/60">
            {t('noNotifications')}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    onMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''} text-foreground`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-foreground/60 mt-1">
                      {formatDistanceToNow(parseBackendDate(notification.created_at), { 
                        addSuffix: true,
                        locale: dateLocale 
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
