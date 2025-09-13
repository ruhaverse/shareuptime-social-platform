'use client';

import React, { useState, useEffect } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { shareupColors } from '@/styles/shareup-colors';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  postId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      user: { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz' },
      content: 'liked your post',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isRead: false,
      postId: 'post1',
    },
    {
      id: '2',
      type: 'comment',
      user: { id: '2', firstName: 'Zeynep', lastName: 'Kaya' },
      content: 'commented on your post: "Harika paylaşım! 👏"',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      isRead: false,
      postId: 'post2',
    },
    {
      id: '3',
      type: 'follow',
      user: { id: '3', firstName: 'Mehmet', lastName: 'Demir' },
      content: 'started following you',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: true,
    },
    {
      id: '4',
      type: 'mention',
      user: { id: '4', firstName: 'Ayşe', lastName: 'Özkan' },
      content: 'mentioned you in a post',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
      postId: 'post3',
    },
    {
      id: '5',
      type: 'share',
      user: { id: '5', firstName: 'Can', lastName: 'Yıldız' },
      content: 'shared your post',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: false,
      postId: 'post4',
    },
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'mention': return '🏷️';
      case 'share': return '📤';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-red-100 text-red-600';
      case 'comment': return 'bg-blue-100 text-blue-600';
      case 'follow': return 'bg-green-100 text-green-600';
      case 'mention': return 'bg-yellow-100 text-yellow-600';
      case 'share': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <ShareupLayout currentPath="/notifications">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-shareup-dark">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-shareup-red text-white text-sm rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </h1>
              {unreadCount > 0 && (
                <ShareupButton
                  title="Mark all as read"
                  onPress={markAllAsRead}
                  variant="secondary"
                  size="small"
                />
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-white rounded-lg p-1 border border-shareup-lighter-gray">
              <button
                onClick={() => setFilter('all')}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200
                  ${filter === 'all'
                    ? 'bg-shareup-primary text-white'
                    : 'text-shareup-gray hover:bg-shareup-light'
                  }
                `}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200
                  ${filter === 'unread'
                    ? 'bg-shareup-primary text-white'
                    : 'text-shareup-gray hover:bg-shareup-light'
                  }
                `}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <ShareupCard
                  key={notification.id}
                  padding="none"
                  className={`
                    cursor-pointer hover:shadow-lg transition-all duration-200
                    ${!notification.isRead ? 'border-l-4 border-l-shareup-primary bg-blue-50/30' : ''}
                  `}
                >
                  <div className="p-4 flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-shareup-profile flex items-center justify-center">
                        {notification.user.profilePicture ? (
                          <img 
                            src={notification.user.profilePicture} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold">
                            {notification.user.firstName[0]}{notification.user.lastName[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-shareup-dark' : 'text-shareup-gray'}`}>
                            <span className="font-semibold text-shareup-dark">
                              {notification.user.firstName} {notification.user.lastName}
                            </span>
                            {' '}
                            {notification.content}
                          </p>
                          <p className="text-xs text-shareup-gray mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        
                        {/* Notification Icon */}
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center ml-3 flex-shrink-0
                          ${getNotificationColor(notification.type)}
                        `}>
                          <span className="text-sm">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {notification.type === 'follow' && (
                        <div className="mt-3">
                          <ShareupButton
                            title="Follow Back"
                            onPress={() => console.log('Follow back:', notification.user.id)}
                            variant="primary"
                            size="small"
                          />
                        </div>
                      )}
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-shareup-primary rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </ShareupCard>
              ))
            ) : (
              <ShareupCard className="text-center py-12">
                <span className="text-6xl mb-4 block">🔔</span>
                <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </h3>
                <p className="text-shareup-gray">
                  {filter === 'unread' 
                    ? 'All caught up! Check back later for new notifications.'
                    : 'When you get notifications, they\'ll show up here.'
                  }
                </p>
              </ShareupCard>
            )}
          </div>

          {/* Quick Actions */}
          {filteredNotifications.length > 0 && (
            <ShareupCard className="mt-6">
              <h3 className="text-lg font-semibold text-shareup-dark mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-3 bg-shareup-light rounded-lg hover:bg-shareup-primary hover:text-white transition-all duration-200 text-center">
                  <span className="block text-xl mb-1">🔕</span>
                  <span className="text-sm font-medium">Mute All</span>
                </button>
                <button className="p-3 bg-shareup-light rounded-lg hover:bg-shareup-primary hover:text-white transition-all duration-200 text-center">
                  <span className="block text-xl mb-1">⚙️</span>
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </div>
            </ShareupCard>
          )}
        </div>
      </div>
    </ShareupLayout>
  );
}
