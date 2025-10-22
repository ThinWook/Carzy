'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ShareIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { endpoints } from '@/config/api'

export default function Profile() {
  const { user, isAuthenticated, isLoading, refreshUserData } = useAuth()
  const router = useRouter()
  const [activeListingTab, setActiveListingTab] = useState('active')
  const [avatarPreview, setAvatarPreview] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [vehicleCounts, setVehicleCounts] = useState({
    total: 0,
    active: 0,
    sold: 0
  })

  // Refresh user data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshUserData();
    }
  }, [isAuthenticated, refreshUserData]);

  // Fetch user vehicles
  useEffect(() => {
    const fetchUserVehicles = async () => {
      if (isAuthenticated && user) {
        try {
          // Make sure user data is refreshed first to ensure token is valid
          await refreshUserData();
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No authentication token found');
            router.push('/auth/login');
            return;
          }
          
          const { data } = await axios.get(endpoints.vehicles.userVehicles, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Make sure we received valid data
          if (data && Array.isArray(data)) {
            setVehicles(data);
            
            // Calculate counts
            const activeVehicles = data.filter((v: any) => v.status === 'pending' || v.status === 'approved');
            const soldVehicles = data.filter((v: any) => v.status === 'sold');
            
            setVehicleCounts({
              total: data.length,
              active: activeVehicles.length,
              sold: soldVehicles.length
            });
          }
        } catch (error) {
          console.error('Error fetching user vehicles:', error);
          
          // Handle 401 Unauthorized specifically
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Token is invalid or expired - clear it and redirect
            localStorage.removeItem('token');
            router.push('/auth/login');
          }
        }
      }
    };

    fetchUserVehicles();
  }, [isAuthenticated, user, refreshUserData, router]);

  // Authentication redirect - MUST be called unconditionally
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click when camera icon is clicked
  const triggerAvatarUpload = () => {
    router.push('/profile/edit');
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Return loading or empty state while checking authentication
  if (!isAuthenticated) {
    return null; // Return null while redirecting
  }

  // Format the registration date
  const formatRegistrationDate = () => {
    if (!user || !user.created_at) return "Chưa có thông tin";
    
    const createdDate = new Date(user.created_at);
    // Format the date in Vietnamese style
    return createdDate.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Helper function to format KYC status for display
  const formatKycStatus = (status: string | undefined) => {
    if (!status) return 'Chưa xác thực';
    
    switch (status) {
      case 'verified':
        return 'Đã xác thực';
      case 'pending':
        return 'Đang chờ xác thực';
      case 'rejected':
        return 'Xác thực thất bại';
      default:
        return 'Chưa xác thực';
    }
  };

  // Helper function to get KYC icon color based on status
  const getKycStatusColor = (status: string | undefined) => {
    if (!status) return 'text-gray-400';
    
    switch (status) {
      case 'verified':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  // Thông báo KYC dựa trên trạng thái
  const renderKycNotification = () => {
    if (!user || !user.kyc_status) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.3-.921 1.603-.921 1.902 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Bạn cần hoàn thành xác thực KYC để đăng tin bán xe. 
                <Link href="/profile/edit" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                  Xác thực ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (user.kyc_status === 'pending') {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Thông tin KYC của bạn đang được xem xét. Bạn sẽ có thể đăng tin bán xe sau khi được xác thực.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (user.kyc_status === 'rejected') {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Thông tin KYC của bạn đã bị từ chối. Vui lòng cập nhật lại thông tin để có thể đăng tin bán xe.
                <Link href="/profile/edit" className="font-medium underline text-red-700 hover:text-red-600 ml-1">
                  Cập nhật ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (user.kyc_status === 'verified') {
      return (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Tài khoản của bạn đã được xác thực KYC. Bạn có thể đăng tin bán xe.
                <Link href="/vehicles/create" className="font-medium underline text-green-700 hover:text-green-600 ml-1">
                  Đăng tin ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Display active vehicles or message if none exist
  const renderActiveVehicles = () => {
    const activeVehicles = vehicles.filter(v => v.status === 'pending' || v.status === 'approved')
    
    if (activeVehicles.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="w-24 h-24 mx-auto flex items-center justify-center bg-gray-100 rounded-full opacity-50">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"></path>
            </svg>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Bạn chưa có tin đăng đang hiển thị
          </p>
          <div className="mt-4">
            <Link 
              href="/vehicles/create"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
            >
              ĐĂNG TIN NGAY
            </Link>
          </div>
        </div>
      )
    }
    
    return (
      <div className="space-y-3">
        {activeVehicles.map(vehicle => (
          <div key={vehicle._id} className="border border-gray-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={vehicle.images?.[0] || '/car-placeholder.jpg'} 
                    alt={vehicle.make} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {vehicle.title || `${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                </h4>
                <p className="mt-1 text-sm text-green-600 font-medium">
                  {new Intl.NumberFormat('vi-VN').format(vehicle.price)} {vehicle.currency || 'đ'}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Đăng ngày: {new Date(vehicle.created_at || vehicle.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <Link href={`/vehicles/edit/${vehicle._id}`} className="text-xs text-blue-600 hover:underline">
                    Chỉnh sửa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Display sold vehicles or message if none exist
  const renderSoldVehicles = () => {
    const soldVehicles = vehicles.filter(v => v.status === 'sold')
    
    if (soldVehicles.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="w-24 h-24 mx-auto flex items-center justify-center bg-gray-100 rounded-full opacity-50">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"></path>
            </svg>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Bạn chưa có tin đăng đã bán
          </p>
        </div>
      )
    }
    
    return (
      <div className="space-y-3">
        {soldVehicles.map(vehicle => (
          <div key={vehicle._id} className="border border-gray-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={vehicle.images?.[0] || '/car-placeholder.jpg'} 
                    alt={vehicle.make} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {vehicle.title || `${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                </h4>
                <p className="mt-1 text-sm text-green-600 font-medium">
                  {new Intl.NumberFormat('vi-VN').format(vehicle.price)} {vehicle.currency || 'đ'}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Đã bán: {new Date(vehicle.sold_at || vehicle.updated_at || vehicle.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                  <button className="text-xs text-blue-600 hover:underline">Đăng lại</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Navigation breadcrumb */}
      <div className="flex items-center py-3 text-sm">
        <Link href="/" className="text-blue-500 hover:underline">Trang chủ</Link>
        <span className="mx-2">·</span>
        <span className="text-gray-500">Trang cá nhân của {user?.full_name || 'Quốc'}</span>
      </div>

      {/* KYC notification */}
      {renderKycNotification()}

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Profile info */}
        <div className="md:w-1/3">
          {/* Profile card */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Cover image */}
            <div className="relative">
              <div className="w-full h-28 bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={user?.cover_image_url || '/cover-placeholder.jpg'} 
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={triggerAvatarUpload}
                className="absolute top-2 right-2 bg-white bg-opacity-70 p-1 rounded-full"
                type="button"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <div className="absolute -bottom-10 left-4">
                <div className="relative">
                  <img
                    src={user?.avatar_url || '/user-avatar.png'}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white"
                  />
                  <button 
                    onClick={triggerAvatarUpload}
                    className="absolute bottom-0 right-0 bg-white bg-opacity-90 p-1 rounded-full cursor-pointer hover:bg-gray-100"
                    type="button"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 pt-12">
              <div className="flex flex-col">
                {/* Profile info - remove the avatar part since we've moved it */}
                <div className="md:text-center">
                  <h1 className="text-xl font-medium">{user?.full_name || 'Quốc'}</h1>
                  <div className="flex items-center mt-1 text-sm text-gray-500 md:justify-center">
                    <span>{user?.rating || '0.0'}</span>
                    <div className="flex ml-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs">Chưa có đánh giá</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500 md:justify-center md:gap-4">
                    <div>
                      <span className="font-medium text-gray-900">0</span> Người theo dõi
                    </div>
                    <div className="ml-4 md:ml-0">
                      <span className="font-medium text-gray-900">0</span> Đang theo dõi
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 w-full">
                      <ShareIcon className="w-4 h-4 mr-2" />
                      Chia sẻ trang của bạn
                    </button>
                    <Link href="/profile/edit" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full">
                      Chỉnh sửa trang cá nhân
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* User stats and info */}
            <div className="px-4 pb-4">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="block text-sm text-gray-500">Phản hồi chat: Chưa có thông tin</span>
                </div>
              </div>
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="block text-sm text-gray-500">Đã tham gia: {formatRegistrationDate()}</span>
                </div>
              </div>
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0">
                  <svg className={`w-5 h-5 ${getKycStatusColor(user?.kyc_status)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="block text-sm text-gray-500">
                    Đã xác thực: <span className={`font-medium ${getKycStatusColor(user?.kyc_status)}`}>{formatKycStatus(user?.kyc_status)}</span>
                    {user?.kyc_status === 'verified' && (
                      <span className="inline-flex ml-2 items-center space-x-1">
                        <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 0a10 10 0 1010 10A10 10 0 0010 0zm3.5 8H12v4.21l3.17 1.67-.67 1.37-3.5-1.75v-5.5h2.5z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="block text-sm text-gray-500">Địa chỉ: {user?.address || 'Chưa cung cấp'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Listings section for small screens */}
          <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden md:hidden">
            {/* Header for listings section */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Tin đăng của bạn</h2>
              <p className="text-sm text-gray-500">Tổng số: {vehicleCounts.total} tin đăng</p>
            </div>

            {/* Tabs for Active and Sold listings */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button 
                  onClick={() => setActiveListingTab('active')}
                  className={`px-4 py-3 text-sm font-medium flex-1 text-center transition duration-150 ${
                    activeListingTab === 'active' 
                      ? 'border-b-2 border-orange-500 text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ĐANG HIỂN THỊ ({vehicleCounts.active})
                </button>
                <button 
                  onClick={() => setActiveListingTab('sold')}
                  className={`px-4 py-3 text-sm font-medium flex-1 text-center transition duration-150 ${
                    activeListingTab === 'sold' 
                      ? 'border-b-2 border-orange-500 text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ĐÃ BÁN ({vehicleCounts.sold})
                </button>
              </div>
            </div>

            {/* Tab content - only one section is shown based on active tab */}
            <div className="p-4">
              {activeListingTab === 'active' ? renderActiveVehicles() : renderSoldVehicles()}
            </div>
          </div>
        </div>

        {/* Right column: Listings */}
        <div className="md:w-2/3 hidden md:block">
          {/* Listings section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header for listings section */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Tin đăng của bạn</h2>
              <p className="text-sm text-gray-500">Tổng số: {vehicleCounts.total} tin đăng</p>
            </div>

            {/* Tabs for Active and Sold listings */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button 
                  onClick={() => setActiveListingTab('active')}
                  className={`px-4 py-3 text-sm font-medium flex-1 text-center transition duration-150 ${
                    activeListingTab === 'active' 
                      ? 'border-b-2 border-orange-500 text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ĐANG HIỂN THỊ ({vehicleCounts.active})
                </button>
                <button 
                  onClick={() => setActiveListingTab('sold')}
                  className={`px-4 py-3 text-sm font-medium flex-1 text-center transition duration-150 ${
                    activeListingTab === 'sold' 
                      ? 'border-b-2 border-orange-500 text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ĐÃ BÁN ({vehicleCounts.sold})
                </button>
              </div>
            </div>

            {/* Tab content - only one section is shown based on active tab */}
            <div className="p-4">
              {activeListingTab === 'active' ? renderActiveVehicles() : renderSoldVehicles()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 