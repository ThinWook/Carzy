'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowSmallLeftIcon } from '@heroicons/react/24/outline';

// Component hiển thị từng thông báo
const NotificationCard = ({ notification, onRead }: { notification: Notification; onRead: () => void }) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch (e) {
      return dateString;
    }
  };

  // Xác định biểu tượng dựa trên loại thông báo
  const getIcon = () => {
    switch (notification.type) {
      case 'vehicle_approved':
        return (
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'vehicle_rejected':
        return (
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'new_message':
        return (
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'new_follower':
        return (
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        );
      case 'system':
      default:
        return (
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Xử lý khi click vào thông báo
  const handleClick = () => {
    if (!notification.is_read) {
      onRead();
    }
  };

  return (
    <div 
      className={`flex p-4 rounded-lg mb-3 ${notification.is_read ? 'bg-white border border-gray-200' : 'bg-blue-50 border border-blue-200'} hover:bg-gray-50 transition-colors duration-150`}
      onClick={handleClick}
    >
      {getIcon()}
      <div className="ml-3 flex-1">
        {notification.link ? (
          <Link href={notification.link} className="block">
            <div className="font-medium text-gray-900">{notification.title}</div>
            <div className="text-sm text-gray-500">{notification.message}</div>
            <div className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</div>
          </Link>
        ) : (
          <>
            <div className="font-medium text-gray-900">{notification.title}</div>
            <div className="text-sm text-gray-500">{notification.message}</div>
            <div className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</div>
          </>
        )}
      </div>
    </div>
  );
};

// Component chính
export default function NotificationsPage() {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // Tải lại thông báo khi chuyển đến trang này
    fetchNotifications();
  }, [fetchNotifications]);

  // Lọc thông báo theo tab đang chọn
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.is_read);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông báo của bạn</h1>
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowSmallLeftIcon className="h-5 w-5 mr-1" />
          Quay lại trang chủ
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="bg-white rounded-md inline-flex shadow-sm">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              activeTab === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('unread')}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông báo...</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div>
          {filteredNotifications.map(notification => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onRead={() => markAsRead(notification._id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' ? 'Bạn chưa có thông báo nào' : 'Không có thông báo chưa đọc'}
          </h2>
          <p className="text-gray-500">
            {activeTab === 'all'
              ? 'Thông báo sẽ xuất hiện khi có hoạt động mới liên quan đến tài khoản của bạn'
              : 'Tất cả thông báo của bạn đã được đánh dấu là đã đọc'}
          </p>
        </div>
      )}
    </div>
  );
} 