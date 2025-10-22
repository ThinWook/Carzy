'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { endpoints } from '@/config/api'
import axios from 'axios'
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
        // Kiểm tra xem user đã đăng nhập chưa
        const token = localStorage.getItem('token')
        if (!token || !vehicleId) return

        console.log('Checking favorite status for vehicle:', vehicleId)
        
        // Gọi API kiểm tra trạng thái yêu thích
        const response = await axios.get(endpoints.favorites.check(vehicleId), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const { isFavorite } = response.data
        console.log('Favorite status:', isFavorite)
        setIsFavorite(isFavorite)
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }

    if (vehicleId) {
      checkFavoriteStatus()
    }
  }, [vehicleId])

  const toggleFavorite = async () => {
    if (!user) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    // Kiểm tra vehicleId
    if (!vehicleId || typeof vehicleId !== 'string') {
      console.error('Invalid vehicleId:', vehicleId)
      toast.error('ID xe không hợp lệ')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('Toggling favorite for vehicle:', vehicleId)
      console.log('Current favorite state:', isFavorite)

      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        console.log('Removing from favorites...')
        const response = await axios.delete(endpoints.favorites.remove(vehicleId), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Remove response:', response.data)
        toast.success('Đã xóa khỏi danh sách yêu thích')
        setIsFavorite(false)
      } else {
        // Thêm vào danh sách yêu thích
        console.log('Adding to favorites...')
        try {
          const response = await axios.post(
            endpoints.favorites.add(vehicleId),
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          console.log('Add response:', response.data)
          toast.success('Đã thêm vào danh sách yêu thích')
          setIsFavorite(true)
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 400) {
            const errorMessage = error.response.data.message
            console.log('Error message from server:', errorMessage)
            
            if (errorMessage.includes('đã có trong danh sách yêu thích')) {
              // Nếu xe đã có trong danh sách yêu thích, cập nhật UI
              console.log('Vehicle already in favorites, updating UI...')
              toast.success('Xe đã có trong danh sách yêu thích')
              setIsFavorite(true)
              return
            }
          }
          throw error
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config
        })

        if (error.response?.status === 401) {
          // Token hết hạn hoặc không hợp lệ
          const currentPath = window.location.pathname
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại')
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        } else if (error.response?.status === 400) {
          // Lỗi request không hợp lệ
          console.error('Invalid request:', error.response.data)
          toast.error(error.response.data.message || 'Yêu cầu không hợp lệ. Vui lòng thử lại sau.')
        } else {
          // Các lỗi khác
          toast.error('Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại sau.')
        }
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