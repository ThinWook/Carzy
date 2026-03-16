'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { favoriteApi } from '@/services/favoriteApi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  vehicleId: string
  className?: string
}

export default function FavoriteButton({ vehicleId, className = '' }: FavoriteButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Kiểm tra trạng thái yêu thích
    const checkFavoriteStatus = async () => {
      try {
        if (!user || !vehicleId) return
        const { isFavorite } = await favoriteApi.check(vehicleId)
        setIsFavorite(isFavorite)
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }

    if (vehicleId) {
      checkFavoriteStatus()
    }
  }, [vehicleId, user])

  const toggleFavorite = async () => {
    if (!user) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    if (!vehicleId || typeof vehicleId !== 'string') {
      toast.error('ID xe không hợp lệ')
      return
    }

    setIsLoading(true)
    try {
      if (isFavorite) {
        await favoriteApi.remove(vehicleId)
        toast.success('Đã xóa khỏi danh sách yêu thích')
        setIsFavorite(false)
      } else {
        await favoriteApi.add(vehicleId)
        toast.success('Đã thêm vào danh sách yêu thích')
        setIsFavorite(true)
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error)
      const status = error.response?.status
      const errorMessage = error.response?.data?.message || ''

      if (status === 401) {
        const currentPath = window.location.pathname
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại')
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      } else if (status === 400 && errorMessage.includes('đã có')) {
        toast.success('Xe đã có trong danh sách yêu thích')
        setIsFavorite(true)
      } else {
        toast.error('Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại sau.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors ${className}`}
      title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
    >
      <svg
        className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`}
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}