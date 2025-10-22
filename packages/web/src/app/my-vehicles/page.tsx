'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { endpoints } from '@/config/api'
import axios from 'axios'

type Vehicle = {
  _id: string
  type: 'car' | 'motorcycle' | 'bicycle' | 'truck' | 'other'
  make: string
  brand?: string
  model: string
  year: number
  price: number
  title?: string
  description: string
  images: string[]
  condition: string
  mileage?: number
  location: string
  isNew?: boolean
  status?: 'pending' | 'approved' | 'rejected' | 'sold' | 'removed'
  user: {
    name: string
    email: string
    phone: string
  }
  createdAt?: string
  updatedAt?: string
}

// Tạo mapping cho loại xe sang tiếng Việt
const vehicleTypeMap = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
  bicycle: 'Xe đạp',
  truck: 'Xe tải',
  other: 'Khác'
}

// Tạo mapping cho tình trạng xe sang tiếng Việt
const conditionMap = {
  new: 'Mới',
  like_new: 'Như mới',
  good: 'Tốt',
  fair: 'Bình thường',
  poor: 'Kém'
}

// Tạo mapping cho trạng thái tin đăng
const statusMap = {
  pending: { text: 'Chờ duyệt', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  approved: { text: 'Đang hiển thị', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  rejected: { text: 'Bị từ chối', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  sold: { text: 'Đã bán', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  removed: { text: 'Đã gỡ', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
}

// Hàm định dạng ngày tháng
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'vài phút trước';
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
}

export default function MyVehicles() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Bạn cần đăng nhập để xem xe của mình')
      router.push('/auth/login')
      return
    }

    const fetchUserVehicles = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch(endpoints.vehicles.userVehicles, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Không thể lấy danh sách xe')
        }

        const data = await response.json()
        setVehicles(data)
      } catch (error) {
        console.error('Error fetching user vehicles:', error)
        setError('Không thể lấy danh sách xe')
        toast.error('Không thể lấy danh sách xe')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && isAuthenticated) {
      fetchUserVehicles()
    }
  }, [authLoading, isAuthenticated, router])

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này không?')) {
      try {
        const token = localStorage.getItem('token')
        
        // Sử dụng axios thay vì fetch để thực hiện yêu cầu DELETE
        await axios.delete(`${endpoints.API_URL}/vehicles/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Remove the deleted vehicle from state
        setVehicles(vehicles.filter(v => v._id !== id))
        toast.success('Đã xóa xe thành công')
      } catch (error) {
        console.error('Error deleting vehicle:', error)
        toast.error('Không thể xóa xe')
      }
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Xe của tôi
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-red-600">{error}</h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Thử lại
            </button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Bạn chưa có xe nào</h3>
            <p className="mt-1 text-sm text-gray-500">Hiện tại bạn chưa có xe nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="group relative bg-white border border-gray-200 rounded overflow-hidden hover:shadow transition">
                <div className="flex flex-col md:flex-row">
                  {/* Image container - Left */}
                  <div className="relative w-full md:w-40 h-40">
                    <img
                      src={vehicle.images?.[0] || 
                        (vehicle.type === 'motorcycle' ? '/images/motorcycle.jpg' : 
                         vehicle.type === 'car' ? '/images/car.jpg' : 
                         '/images/bicycle.jpg')}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = vehicle.type === 'motorcycle' ? '/images/motorcycle.jpg' : 
                                     vehicle.type === 'car' ? '/images/car.jpg' : 
                                     '/images/bicycle.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Content - Right */}
                  <div className="p-3 flex-1">
                    {/* Category badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {vehicleTypeMap[vehicle.type]}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {conditionMap[vehicle.condition as keyof typeof conditionMap] || vehicle.condition}
                      </span>
                    </div>
                    
                    {/* Basic info */}
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                      <span>{vehicle.year}</span>
                      <span>•</span>
                      <span>{vehicle.isNew ? 'Mới' : 'Đã sử dụng'}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base font-medium text-gray-900 leading-tight mb-1">
                      <Link href={`/vehicles/${vehicle._id}`} className="hover:text-blue-600">
                        {vehicle.title || `${vehicle.make} ${vehicle.model}`}
                      </Link>
                    </h3>
                    
                    {/* Price */}
                    <p className="text-base font-bold text-red-600 mb-2">
                      {vehicle.price.toLocaleString('vi-VN')} đ
                    </p>
                    
                    {/* Location info */}
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <span>{vehicle.location || 'Hà Nội'}</span>
                      {vehicle.createdAt && (
                        <>
                          <span className="mx-1">•</span>
                          <span>Đăng {formatDate(vehicle.createdAt)}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Status and actions */}
                    <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-1">
                      <div>
                        <p className="text-xs font-medium">Trạng thái: 
                          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusMap[vehicle.status || 'approved'].bgColor
                          } ${
                            statusMap[vehicle.status || 'approved'].textColor
                          }`}>
                            {statusMap[vehicle.status || 'approved'].text}
                          </span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link 
                          href={`/vehicles/edit/${vehicle._id}`}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Chỉnh sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle._id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
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