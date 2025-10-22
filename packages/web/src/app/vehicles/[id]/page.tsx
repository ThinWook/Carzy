'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from '@/config/api'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import FavoriteButton from '@/components/FavoriteButton'

// Định nghĩa kiểu dữ liệu theo cấu trúc mới từ API
interface Vehicle {
  _id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  images: string[];
  description?: string;
  location: string;
  condition?: string;
  features?: string[];
  status?: 'approved' | 'pending' | 'rejected';
  user: {
    _id: string;
    full_name: string;
    phone_number: string;
    email: string;
    avatar_url?: string;
  };
  type: string;
  make: string;
  model: string;
  body_type?: string;
  fuel_type?: string;
  transmission?: string;
  currency: string;
  verification_level: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

// Component hiển thị thumbnail
function ImageThumbnails({ 
  images, 
  selectedImage, 
  onSelect 
}: { 
  images: string[]; 
  selectedImage: string; 
  onSelect: (img: string) => void 
}) {
  if (!images || images.length <= 1) return null;
  
  return (
    <div className="grid grid-cols-4 gap-2 mt-2">
      {images.map((img, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(img)}
          className={`relative w-full aspect-square overflow-hidden rounded-md ${
            selectedImage === img ? 'ring-2 ring-indigo-500' : ''
          }`}
        >
          <Image
            src={img}
            alt={`Thumbnail ${idx + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 150px"
          />
        </button>
      ))}
    </div>
  );
}

// Component hiển thị tính năng
function FeaturesList({ features }: { features: string[] }) {
  if (!features || features.length === 0) return null;
  
  return (
    <div className="mt-6">
      <h4 className="text-md font-medium text-gray-900">Tính năng:</h4>
      <ul className="mt-2 grid grid-cols-1 gap-y-1 sm:grid-cols-2 list-disc pl-4 text-sm text-gray-600">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}

// Component hiển thị thông tin chi tiết xe
function VehicleInfo({ vehicle }: { vehicle: Vehicle }) {
  // Kiểm tra kiểu dữ liệu
  if (!vehicle || !vehicle._id || !vehicle.user || !vehicle.user._id) {
    console.error('Dữ liệu xe không hợp lệ trong VehicleInfo:', vehicle)
    return (
      <div className="text-center p-4">
        <p className="text-red-600">Thông tin xe không hợp lệ</p>
      </div>
    )
  }

  // Định dạng giá theo tiền Việt Nam
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  // Định dạng ngày đăng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `Đăng ${diffDays} ngày trước`;
  };

  return (
    <div className="mt-0 lg:mt-0 px-4 pt-6 lg:px-0">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {vehicle.title}
        </h1>
      </div>

      <div className="mt-2">
        <p className="text-2xl font-bold text-red-600">{formatPrice(vehicle.price)}</p>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center text-sm text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {vehicle.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(vehicle.created_at)}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {vehicle.user.avatar_url ? (
                <Image
                  src={vehicle.user.avatar_url}
                  alt={vehicle.user.full_name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="text-gray-500 font-bold text-xl">
                  {vehicle.user.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-base font-semibold text-gray-900">
              {vehicle.user.full_name} 
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <svg className="mr-1 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                5 (1)
              </span>
            </h3>
            <p className="text-xs text-gray-500">Hoạt động 2 giờ trước • Phản hồi: 74%</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          type="button"
          onClick={() => window.location.href = `tel:${vehicle.user.phone_number}`}
          className="flex-1 flex items-center justify-center rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
        >
          Gọi điện
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              // Kiểm tra xem người dùng đã đăng nhập chưa
              const token = localStorage.getItem('token')
              if (!token) {
                window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
                return
              }
              
              if (!vehicle || !vehicle._id || !vehicle.user || !vehicle.user._id) {
                throw new Error('Thông tin xe hoặc người bán không hợp lệ')
              }
              
              // Chuyển đổi ID sang chuỗi nếu chúng là số
              const vehicleId = vehicle._id;
              const sellerId = vehicle.user._id;
              
              console.log('Sending chat request with data:', { vehicleId, sellerId });
              
              // Tạo cuộc trò chuyện mới hoặc mở cuộc trò chuyện hiện có
              const response = await axios.post(
                endpoints.chat.create, 
                { 
                  vehicleId, 
                  sellerId 
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  }
                }
              )
              
              // Kiểm tra response trước khi chuyển hướng
              console.log('Chat creation response:', response.data);
              
              // Chuyển hướng đến trang chat với ID chat vừa tạo
              if (response.data && response.data._id) {
                window.location.href = `/chat/${response.data._id}`;
              } else {
                throw new Error('Không nhận được ID chat hợp lệ từ server');
              }
            } catch (error) {
              console.error('Lỗi khi bắt đầu cuộc trò chuyện:', error);
              
              // Hiển thị thông báo lỗi cụ thể hơn nếu có
              if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
              } else {
                toast.error('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại sau.');
              }
            }
          }}
          className="flex-1 ml-2 flex items-center justify-center rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Chat
        </button>
      </div>
    </div>
  );
}

// Component chính
export default function VehicleDetail() {
  const { id } = useParams()
  const [selectedImage, setSelectedImage] = useState('')
  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      try {
        const response = await axios.get(endpoints.vehicles.detail(id as string))
        const data = response.data
        
        // Đặt ảnh đầu tiên là ảnh được chọn
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0])
        }
        
        return data
      } catch (error) {
        console.error('Error fetching vehicle:', error)
        throw error
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5 // 5 phút
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Đã xảy ra lỗi</h2>
          <p className="mt-2 text-gray-600">Không thể tải thông tin xe. Vui lòng thử lại sau.</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy xe</h2>
          <p className="mt-2 text-gray-600">Xe bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    )
  }

  // Kiểm tra kiểu dữ liệu của vehicle
  if (!vehicle._id || !vehicle.user || !vehicle.user._id) {
    console.error('Dữ liệu xe không hợp lệ:', vehicle)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Dữ liệu không hợp lệ</h2>
          <p className="mt-2 text-gray-600">Thông tin xe không đầy đủ. Vui lòng thử lại sau.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="relative">
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton vehicleId={vehicle._id} />
            </div>
            <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
              {/* Phần hiển thị ảnh */}
              <div className="flex flex-col">
                <div className="relative aspect-h-9 aspect-w-16 overflow-hidden rounded-lg mb-4">
                  {selectedImage ? (
                    <div className="relative h-full">
                      <Image
                        src={selectedImage}
                        alt={vehicle.title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
                        priority
                      />
                      {/* Overlay buttons */}
                      <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div className="flex justify-end">
                          <button className="bg-white rounded-full p-2 mr-2 shadow-md">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                            </svg>
                          </button>
                          <button className="bg-white rounded-full p-2 shadow-md">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="w-full flex justify-center">
                          <div className="bg-white py-2 px-4 rounded-full shadow-md">
                            <span className="text-sm font-medium">4 / 4</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-200">
                      <p className="text-gray-500">Không có ảnh</p>
                    </div>
                  )}
                </div>

                <ImageThumbnails 
                  images={vehicle.images || []} 
                  selectedImage={selectedImage} 
                  onSelect={setSelectedImage} 
                />
                
                {/* Mô tả chi tiết */}
                <div className="mt-6 bg-white shadow-sm border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Mô tả chi tiết</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {vehicle.description ? (
                      vehicle.description
                    ) : (
                      <div>
                        {vehicle.type === 'motorcycle' && (
                          <>
                            <p>Xe như ảnh năm sản xuất {vehicle.year} sác đẹy 3 tiếng quảng đường thực tế {vehicle.mileage}km</p>
                            <p>Tăng tốc 3s đc 50km</p>
                            <p>Biển số {vehicle.licensePlate || '41 MD'} ko bằng lái</p>
                            <p>Nhắn để hiển số: 059595***</p>
                          </>
                        )}
                        {vehicle.type === 'car' && (
                          <>
                            <p>Xe đời {vehicle.year}, đã đi được {vehicle.mileage}km</p>
                            <p>Tình trạng xe: {vehicle.condition === 'new' ? 'Mới' : 'Đã qua sử dụng'}</p>
                            <p>Biển số: {vehicle.licensePlate || 'Chưa đăng ký'}</p>
                            <p>Liên hệ để biết thêm chi tiết</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Thông số kỹ thuật */}
                <div className="mt-6 bg-white shadow-sm border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông số kỹ thuật</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Loại xe:</div>
                        <div className="text-sm text-gray-600">
                          {vehicle.type === 'car' && 'Ô tô'}
                          {vehicle.type === 'motorcycle' && 'Xe máy điện'}
                          {vehicle.type === 'bicycle' && 'Xe đạp'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Hãng xe:</div>
                        <div className="text-sm text-gray-600">{vehicle.make || 'DKBike'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Xuất xứ:</div>
                        <div className="text-sm text-gray-600">Lắp ráp tại Việt Nam</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Động cơ:</div>
                        <div className="text-sm text-gray-600">{'>'} 1000 W</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Trọng lượng:</div>
                        <div className="text-sm text-gray-600">{'>'} 20 kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết xe */}
              <VehicleInfo vehicle={vehicle} />
            </div>
          </div>
        </div>

        {/* Tin đăng tương tự */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tin đăng tương tự</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Item 1 */}
            <div className="group relative bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/dihq5xkcj/image/upload/v1694690725/vehicles/motorcycle1_qinlop.jpg"
                  alt="Vision"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <button className="bg-white p-1.5 rounded-full shadow-sm">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span>2020</span>
                  <span className="mx-1">•</span>
                  <span>Xe máy điện</span>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  <Link href="/vehicles/123" className="hover:text-blue-600">
                    Vision
                  </Link>
                </h3>
                <p className="text-base font-bold text-red-600 mb-2">
                  10.000.000 đ
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Tp Hồ Chí Minh</span>
                  <span className="mx-1">•</span>
                  <span>1 ngày trước</span>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group relative bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/dihq5xkcj/image/upload/v1694690723/vehicles/motorcycle2_jsfkkt.jpg"
                  alt="Honda Lead 125cc"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <button className="bg-white p-1.5 rounded-full shadow-sm">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span>2019</span>
                  <span className="mx-1">•</span>
                  <span>Xe tay ga</span>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  <Link href="/vehicles/456" className="hover:text-blue-600">
                    Honda Lead 125cc
                  </Link>
                </h3>
                <p className="text-base font-bold text-red-600 mb-2">
                  15.000.000 đ
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Quận Thủ Đức</span>
                  <span className="mx-1">•</span>
                  <span>2 ngày trước</span>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="group relative bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/dihq5xkcj/image/upload/v1694690722/vehicles/motorcycle3_zvvujl.jpg"
                  alt="Honda Vario 150"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <button className="bg-white p-1.5 rounded-full shadow-sm">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span>2021</span>
                  <span className="mx-1">•</span>
                  <span>Xe tay ga</span>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  <Link href="/vehicles/789" className="hover:text-blue-600">
                    Honda Vario 150
                  </Link>
                </h3>
                <p className="text-base font-bold text-red-600 mb-2">
                  20.500.000 đ
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Quận 1</span>
                  <span className="mx-1">•</span>
                  <span>3 ngày trước</span>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="group relative bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/dihq5xkcj/image/upload/v1694690723/vehicles/motorcycle4_rczpwr.jpg"
                  alt="Honda SH 150i"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <button className="bg-white p-1.5 rounded-full shadow-sm">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span>2022</span>
                  <span className="mx-1">•</span>
                  <span>Xe tay ga</span>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  <Link href="/vehicles/101112" className="hover:text-blue-600">
                    Honda SH 150i
                  </Link>
                </h3>
                <p className="text-base font-bold text-red-600 mb-2">
                  90.000.000 đ
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Quận 7</span>
                  <span className="mx-1">•</span>
                  <span>5 ngày trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 