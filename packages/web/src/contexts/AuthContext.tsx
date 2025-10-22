'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { endpoints } from '@/config/api'
import axios from 'axios'

interface User {
  _id: string
  full_name: string
  username?: string
  email: string
  phone_number: string
  address: string
  role: 'user' | 'admin'
  avatar_url?: string
  cover_image_url?: string
  rating: number
  kyc_status: 'pending' | 'verified' | 'rejected'
  identity_document_type?: 'CMND' | 'CCCD' | 'Hộ chiếu'
  identity_document_number?: string
  identity_document_images?: {
    front?: string
    back?: string
  }
  wallet_balance?: number
  favorites?: string[]
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isRefreshing: boolean
  login: (email: string, password: string) => Promise<any>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  // Function to fetch and update user data
  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await axios.get(endpoints.auth.currentUser, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = response.data;
      
      // Ensure data is valid before setting the user
      if (data && typeof data === 'object') {
        // Kiểm tra nếu tài khoản là admin, đăng xuất và không cho phép đăng nhập
        if (data.role === 'admin') {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          throw new Error('Tài khoản admin không thể đăng nhập vào trang khách hàng. Vui lòng truy cập trang quản trị tại http://localhost:3001');
        }
        
        setUser(data);
        setIsAuthenticated(true);
        
        // Also store in local storage for offline access
        localStorage.setItem('userData', JSON.stringify(data));
      } else {
        throw new Error('Invalid user data received');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Kiểm tra lỗi kết nối
      if (axios.isAxiosError(error) && !error.response) {
        // Sử dụng dữ liệu từ localStorage nếu có
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
            
            // Ngay cả khi offline, vẫn không cho phép admin đăng nhập
            if (userData.role === 'admin') {
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
              setUser(null);
              setIsAuthenticated(false);
              setIsLoading(false);
              throw new Error('Tài khoản admin không thể đăng nhập vào trang khách hàng.');
            }
            
            setUser(userData);
            setIsAuthenticated(true);
            console.log('Using cached user data');
          } catch (e) {
            // Nếu không thể parse JSON, xử lý lỗi
            localStorage.removeItem('userData');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Nếu không có dữ liệu trong localStorage
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Các lỗi khác
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Kiểm tra token trong localStorage khi component mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          setIsLoading(false)
          return
        }

        await fetchUserData(token)
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [fetchUserData])

  // Add a function to refresh user data
  const refreshUserData = async (): Promise<void> => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      await fetchUserData(token);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If refresh fails, try to use cached data
      const cachedUserData = localStorage.getItem('userData');
      if (cachedUserData) {
        try {
          const userData = JSON.parse(cachedUserData);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Error parsing cached user data:', e);
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  const login = async (email: string, password: string): Promise<any> => {
    try {
      const response = await axios.post(endpoints.auth.login, { email, password });
      
      const data = response.data;
      
      // Kiểm tra nếu tài khoản là admin, không cho phép đăng nhập
      if (data.role === 'admin') {
        throw new Error('Tài khoản admin không thể sử dụng khu vực khách hàng. Vui lòng sử dụng trang quản trị.');
      }
      
      if (!data || !data.token) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', data.token);
      
      // Check if user data exists in the response
      if (data.user && typeof data.user === 'object') {
        // Save user data to local storage for offline use
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // If no user data in response, fetch it using the token
        await fetchUserData(data.token);
      }
      
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Thêm thông báo lỗi cụ thể
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Máy chủ trả về lỗi
          throw new Error(error.response.data.message || 'Đăng nhập thất bại');
        } else if (error.request) {
          // Không nhận được phản hồi từ máy chủ
          throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và API server.');
        }
      }
      
      throw error;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await axios.post(endpoints.auth.register, userData);

      if (response.status >= 200 && response.status < 300) {
        return true;
      }

      throw new Error(response.data.message || 'Đăng ký thất bại');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Thêm thông báo lỗi cụ thể
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Máy chủ trả về lỗi
          throw new Error(error.response.data.message || 'Đăng ký thất bại');
        } else if (error.request) {
          // Không nhận được phản hồi từ máy chủ
          throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và API server.');
        }
      }
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isRefreshing,
        login,
        register,
        logout,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 