'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { endpoints } from '@/config/api';
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
      const response = await axios.get(endpoints.notifications.list, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(response.data.data.notifications);
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
      const response = await axios.get(endpoints.notifications.unreadCount, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Lỗi khi tải số lượng thông báo chưa đọc:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(
        endpoints.notifications.markAsRead(id),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
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
      await axios.patch(
        endpoints.notifications.markAllAsRead,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
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

  // Tải lại số lượng thông báo chưa đọc mỗi phút
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // 60 giây
    
    return () => clearInterval(intervalId);
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