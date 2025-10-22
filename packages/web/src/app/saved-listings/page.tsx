'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { endpoints } from '@/config/api'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Vehicle {
  _id: string
  make: string
  model: string
  year: number
  price: number
  images: string[]
  status: string
}

export default function SavedListings() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavoriteVehicles = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }

        // Lấy danh sách yêu thích từ API
        const response = await axios.get(endpoints.favorites.list, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Favorite vehicles:', response.data)
        setVehicles(response.data.favorites || [])
      } catch (error) {
        console.error('Error fetching favorite vehicles:', error)
        toast.error('Không thể tải danh sách xe yêu thích')
      } finally {
        setLoading(false)
      }
    }

    fetchFavoriteVehicles()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tin đăng đã lưu</h1>
          <p className="mt-2 text-gray-600">
            Danh sách các xe bạn đã yêu thích
          </p>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có tin đăng yêu thích</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu lưu các tin đăng bạn quan tâm để xem lại sau.
            </p>
            <div className="mt-6">
              <Link
                href="/vehicles"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Xem danh sách xe
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <Image
                    src={vehicle.images[0] || '/car-placeholder.jpg'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </h3>
                  <p className="mt-1 text-xl font-semibold text-blue-600">
                    {vehicle.price.toLocaleString('vi-VN')}đ
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/vehicles/${vehicle._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 