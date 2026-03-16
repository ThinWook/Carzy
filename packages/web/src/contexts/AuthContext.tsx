'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { endpoints } from '@/config/api'
import apiClient from '@/lib/apiClient'
import axios from 'axios'

export interface User {
  _id: string
  full_name: string
  email: string
  phone_number: string
  address: string
  role: 'user' | 'admin'
  avatar_url?: string
  cover_image_url?: string
  rating: number
  kyc_status: 'pending' | 'verified' | 'rejected' | 'unverified'
  identity_document_type?: 'cmnd' | 'cccd' | 'passport'
  identity_document_number?: string
  identity_document_images?: { front?: string; back?: string }
  bank_account_name?: string
  bank_account_number?: string
  bank_name?: string
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
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const clearAuthData = useCallback(async () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('userData')
    try {
      if (pathname !== '/auth/login') {
        await apiClient.post(endpoints.auth.logout)
      }
    } catch {
      // Ignore errors on logout
    }
  }, [pathname])

  const fetchUserData = useCallback(async () => {
    try {
      // apiClient tự động đính kèm HttpOnly cookie
      const { data } = await apiClient.get(endpoints.auth.currentUser)
      
      if (data && data.role === 'admin') {
        throw new Error('Tài khoản admin không thể đăng nhập vào trang khách hàng. Vui lòng truy cập trang quản trị hệ thống.')
      }
      
      setUser(data)
      setIsAuthenticated(true)
      localStorage.setItem('userData', JSON.stringify(data))
    } catch (error) {
      // Nếu API lỗi (hết hạn cookie/chưa login) -> fallback localStorage
      const cached = localStorage.getItem('userData')
      if (cached && !axios.isAxiosError(error)) {
        try {
           const parsed = JSON.parse(cached)
           if (parsed.role !== 'admin') {
             setUser(parsed)
             setIsAuthenticated(true)
             return
           }
        } catch {}
      }
      clearAuthData()
    } finally {
      setIsLoading(false)
    }
  }, [clearAuthData])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const refreshUserData = async (): Promise<void> => {
    if (isRefreshing) return
    setIsRefreshing(true)
    await fetchUserData()
    setIsRefreshing(false)
  }

  const login = async (email: string, password: string): Promise<any> => {
    try {
      setIsLoading(true)
      const { data } = await apiClient.post(endpoints.auth.login, { email, password })
      
      if (data.role === 'admin') {
        throw new Error('Tài khoản admin không thể sử dụng khu vực khách hàng. Vui lòng sử dụng trang quản trị.')
      }

      setUser(data)
      setIsAuthenticated(true)
      localStorage.setItem('userData', JSON.stringify(data))
      
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Đăng nhập thất bại')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      await apiClient.post(endpoints.auth.register, userData)
      // Tự động fetch data vì cookie đã được set server side
      await fetchUserData()
      return true
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Đăng ký thất bại')
      }
      throw error
    }
  }

  const logout = async () => {
    await clearAuthData()
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