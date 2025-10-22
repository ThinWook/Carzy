'use client';

import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Component hiển thị từng thông báo riêng lẻ
const NotificationItem = ({ notification, onRead }: { notification: Notification; onRead: () => void }) => {
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
      className={`flex p-3 ${notification.is_read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50 transition-colors duration-150`}
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
export default function NotificationIcon() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Lọc thông báo theo tab đang chọn
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.is_read);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="relative p-1 text-gray-400 hover:text-white focus:outline-none active:scale-95 active:opacity-80 transition-all duration-150">
          <span className="sr-only">Thông báo</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-lg font-medium text-gray-900">Thông báo</h2>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-150"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium flex-1 text-center transition duration-150 ${
                activeTab === 'all' 
                  ? 'border-b-2 border-orange-500 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 text-sm font-medium flex-1 text-center transition duration-150 ${
                activeTab === 'unread' 
                  ? 'border-b-2 border-orange-500 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Đang tải thông báo...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification} 
                  onRead={() => markAsRead(notification._id)} 
                />
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                {activeTab === 'all' ? 'Bạn chưa có thông báo nào.' : 'Không có thông báo chưa đọc.'}
              </div>
            )}
          </div>
          
          {notifications.length > 10 && (
            <div className="p-2 text-center">
              <Link 
                href="/notifications" 
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-150"
              >
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 