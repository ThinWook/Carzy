'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationApi } from '@/services/notificationApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export type Notification = {
  _id: string;
  user_id: string;
  type: 'vehicle_approved' | 'vehicle_rejected' | 'new_message' | 'new_follower' | 'system';
  title: string;
  message: string;
  reference_id?: string;
  reference_model?: 'Vehicle' | 'Chat' | 'User';
  link?: string;
  is_read: boolean;
  created_at: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // Gọi qua notificationApi (tự động có cookie)
      const data = await notificationApi.getList(1, 50);
      setNotifications(data.data?.notifications || []);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await notificationApi.getUnreadCount();
      setUnreadCount(data.data?.count || 0);
    } catch (error) {
      console.error('Lỗi khi tải số lượng thông báo chưa đọc:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      
      // Cập nhật state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      // Cập nhật unreadCount
      setUnreadCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
      toast.error('Không thể đánh dấu thông báo đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      
      // Cập nhật state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          is_read: true
        }))
      );
      
      // Đặt unreadCount về 0
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
      toast.error('Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  // Tải thông báo và số lượng chưa đọc khi người dùng đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user?._id]);

  // Bỏ tải lại số lượng thông báo chưa đọc mỗi phút để tránh spam log server
  // Bạn có thể mở lại với thời gian dài hơn (vd: 5 phút) nếu cần realtime
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // const intervalId = setInterval(() => {
    //   fetchUnreadCount();
    // }, 60000 * 5); // 5 phút
    
    // return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 