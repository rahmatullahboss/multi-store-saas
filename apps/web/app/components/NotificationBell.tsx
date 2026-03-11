import React, { useEffect, useState, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import { Bell, BellRing, Check, ShoppingCart, AlertTriangle, Star, DollarSign, X } from 'lucide-react';
import { cn } from '~/utils/cn';
import { useTranslation } from '~/contexts/LanguageContext';

export type NotificationType = 'new_order' | 'low_stock' | 'store_review' | 'payment';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeAgo: string;
  createdAt: string;
}

interface NotificationBellProps {
  storeId: number;
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case 'new_order':
      return <ShoppingCart className="w-4 h-4 text-blue-500" />;
    case 'low_stock':
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'store_review':
      return <Star className="w-4 h-4 text-yellow-500" />;
    case 'payment':
      return <DollarSign className="w-4 h-4 text-green-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

export const NotificationBell: React.FC<NotificationBellProps> = ({ storeId }) => {
  const { t } = useTranslation();
  const fetcher = useFetcher<AppNotification[]>();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`notifications_read_${storeId}`);
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error('Failed to load read notifications', e);
    }
  }, [storeId]);

  // Save read notifications to localStorage
  const saveReadIds = (ids: Set<string>) => {
    try {
      localStorage.setItem(`notifications_read_${storeId}`, JSON.stringify(Array.from(ids)));
    } catch (e) {
      console.error('Failed to save read notifications', e);
    }
  };

  // Poll for notifications
  useEffect(() => {
    // Initial fetch
    fetcher.load(`/api/notifications?storeId=${storeId}`);

    // Poll every 30 seconds
    const interval = setInterval(() => {
      if (fetcher.state === 'idle') {
        fetcher.load(`/api/notifications?storeId=${storeId}`);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [storeId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const notifications = fetcher.data || [];
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    saveReadIds(newReadIds);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newReadIds = new Set(readIds);
    notifications.forEach(n => newReadIds.add(n.id));
    setReadIds(newReadIds);
    saveReadIds(newReadIds);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <BellRing className="w-5 h-5" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </>
        ) : (
          <Bell className="w-5 h-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto overflow-x-hidden flex-1 overscroll-contain">
            {fetcher.state === 'loading' && !notifications.length ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {notifications.map((notification) => {
                  const isRead = readIds.has(notification.id);
                  return (
                    <li
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-gray-50 transition-colors flex gap-3 group relative",
                        isRead ? "opacity-75" : "bg-blue-50/30"
                      )}
                      onClick={(e) => {
                         if (!isRead) handleMarkAsRead(notification.id, e);
                      }}
                    >
                      <div className={cn(
                        "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        notification.type === 'new_order' && "bg-blue-100",
                        notification.type === 'low_stock' && "bg-orange-100",
                        notification.type === 'store_review' && "bg-yellow-100",
                        notification.type === 'payment' && "bg-green-100"
                      )}>
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          isRead ? "text-gray-700" : "text-gray-900"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                          {notification.timeAgo}
                        </p>
                      </div>

                      {!isRead && (
                        <div className="absolute right-4 top-4 flex flex-col items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Mark as read"
                            >
                              <X className="w-3 h-3" />
                            </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
