'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { endpoints } from '@/config/api'

export default function EditProfile() {
  const { user, isAuthenticated, isLoading, refreshUserData } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  
  const [kycStep, setKycStep] = useState(1)
  const [kycData, setKycData] = useState({
    identity_document_type: '',
    identity_document_number: '',
    front_image: null as File | null,
    back_image: null as File | null,
    bank_account_name: '',
    bank_account_number: '',
    bank_name: ''
  })

  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState('')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

  const [frontImagePreview, setFrontImagePreview] = useState('')
  const [backImagePreview, setBackImagePreview] = useState('')
  const frontImageInputRef = useRef<HTMLInputElement>(null)
  const backImageInputRef = useRef<HTMLInputElement>(null)

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.full_name || '',
        email: user.email || '',
        phone: user.phone_number || '',
        address: user.address || '',
      })
      setAvatarPreview(user.avatar_url || '/user-avatar.png')
      setCoverImagePreview(user.cover_image_url || '/cover-placeholder.jpg')
      
      // Initialize KYC data if available
      if (user.identity_document_type) {
        setKycData(prev => ({
          ...prev,
          identity_document_type: user.identity_document_type || '',
          identity_document_number: user.identity_document_number || ''
        }))
        
        // Set image previews if available
        if (user.identity_document_images?.front) {
          setFrontImagePreview(user.identity_document_images.front)
        }
        if (user.identity_document_images?.back) {
          setBackImagePreview(user.identity_document_images.back)
        }
      }
    } else {
      // Set default avatar if user data is not available
      setAvatarPreview('/user-avatar.png')
      setCoverImagePreview('/cover-placeholder.jpg')
    }
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle cover image file selection
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImagePreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click when camera icon is clicked
  const triggerAvatarUpload = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click()
    }
  }

  // Trigger cover image file input click when camera icon is clicked
  const triggerCoverImageUpload = () => {
    if (coverImageInputRef.current) {
      coverImageInputRef.current.click()
    }
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle KYC data changes
  const handleKycChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setKycData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle ID document front image upload
  const handleFrontImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Chỉ chấp nhận định dạng JPEG hoặc PNG')
        return
      }
      
      setKycData(prev => ({ ...prev, front_image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFrontImagePreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle ID document back image upload
  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Chỉ chấp nhận định dạng JPEG hoặc PNG')
        return
      }
      
      setKycData(prev => ({ ...prev, back_image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBackImagePreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click
  const triggerFrontImageUpload = () => {
    if (frontImageInputRef.current) {
      frontImageInputRef.current.click()
    }
  }

  // Trigger file input click
  const triggerBackImageUpload = () => {
    if (backImageInputRef.current) {
      backImageInputRef.current.click()
    }
  }

  // Move to next KYC step
  const nextKycStep = () => {
    // Validate current step
    if (kycStep === 1 && !kycData.identity_document_type) {
      toast.error('Vui lòng chọn loại giấy tờ')
      return
    }
    
    if (kycStep === 2 && !kycData.identity_document_number) {
      toast.error('Vui lòng nhập số giấy tờ')
      return
    }
    
    if (kycStep === 3 && (!kycData.front_image || !kycData.back_image) && 
        (!frontImagePreview || !backImagePreview)) {
      toast.error('Vui lòng tải lên ảnh mặt trước và mặt sau')
      return
    }
    
    setKycStep(prev => Math.min(prev + 1, 5))
  }

  // Move to previous KYC step
  const prevKycStep = () => {
    setKycStep(prev => Math.max(prev - 1, 1))
  }

  // Upload KYC documents
  const uploadKycDocuments = async (): Promise<{front?: string, back?: string} | null> => {
    if (!kycData.front_image && !kycData.back_image) return null
    
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      
      if (kycData.front_image) {
        formData.append('front', kycData.front_image)
      }
      
      if (kycData.back_image) {
        formData.append('back', kycData.back_image)
      }
      
      const response = await fetch(`${endpoints.kyc.uploadDocuments}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: 'same-origin'
      })
      
      if (!response.ok) {
        throw new Error('KYC document upload failed')
      }
      
      const data = await response.json()
      return data.urls
    } catch (error) {
      console.error('Error uploading KYC documents:', error)
      toast.error('Error uploading documents')
      return null
    }
  }

  // Submit KYC information
  const submitKyc = async () => {
    setIsSubmitting(true)
    
    try {
      // Step 1: Upload documents if new ones were provided
      const documentUrls = await uploadKycDocuments()
      
      // Step 2: Update KYC information
      const token = localStorage.getItem('token')
      const kycUpdateData = {
        identity_document_type: kycData.identity_document_type,
        identity_document_number: kycData.identity_document_number,
        identity_document_images: documentUrls,
        bank_account_name: kycData.bank_account_name,
        bank_account_number: kycData.bank_account_number,
        bank_name: kycData.bank_name,
        kyc_status: 'pending' // Set status to pending when submitting
      }
      
      const response = await fetch(`${endpoints.kyc.update}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(kycUpdateData),
      })
      
      if (!response.ok) {
        throw new Error('KYC update failed')
      }
      
      toast.success('Thông tin KYC đã được gửi, vui lòng chờ xét duyệt')
      router.push('/profile')
    } catch (error) {
      console.error('Error submitting KYC:', error)
      toast.error('Gửi thông tin KYC thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Upload avatar to server
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null
    
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    
    try {
      console.log('Uploading avatar to:', endpoints.auth.uploadAvatar);
      const token = localStorage.getItem('token')
      
      // Log the request for debugging
      console.log('Avatar upload request:', {
        url: endpoints.auth.uploadAvatar,
        fileSize: avatarFile.size,
        fileType: avatarFile.type,
        fileName: avatarFile.name
      });
      
      const response = await fetch(endpoints.auth.uploadAvatar, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header, browser will set it with boundary for FormData
        },
        body: formData,
        // Use 'same-origin' instead of 'include' for credentials
        credentials: 'same-origin'
      })
      
      // Log the response status for debugging
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        // Try to get the error message from the response
        let errorMessage = 'Avatar upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json()
      console.log('Upload successful, response:', data);
      return data.avatar_url
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Error uploading avatar')
      return null
    }
  }

  // Upload cover image to server
  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImageFile) return null
    
    const formData = new FormData()
    formData.append('coverImage', coverImageFile)
    
    try {
      console.log('Uploading cover image to:', endpoints.auth.uploadCoverImage);
      const token = localStorage.getItem('token')
      
      // Log the request for debugging
      console.log('Cover image upload request:', {
        url: endpoints.auth.uploadCoverImage,
        fileSize: coverImageFile.size,
        fileType: coverImageFile.type,
        fileName: coverImageFile.name
      });
      
      const response = await fetch(endpoints.auth.uploadCoverImage, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header, browser will set it with boundary for FormData
        },
        body: formData,
        credentials: 'same-origin'
      })
      
      // Log the response status for debugging
      console.log('Cover image upload response status:', response.status);
      
      if (!response.ok) {
        // Try to get the error message from the response
        let errorMessage = 'Cover image upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json()
      console.log('Cover image upload successful, response:', data);
      return data.cover_image_url
    } catch (error) {
      console.error('Error uploading cover image:', error)
      toast.error('Error uploading cover image')
      return null
    }
  }

  // Update profile information
  const updateProfile = async (avatarUrl: string | null, coverImageUrl: string | null) => {
    try {
      const token = localStorage.getItem('token')
      const dataToUpdate = { ...formData }
      
      if (avatarUrl) {
        dataToUpdate.avatar = avatarUrl
      }

      if (coverImageUrl) {
        dataToUpdate.coverImage = coverImageUrl
      }
      
      const response = await fetch(endpoints.auth.updateProfile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToUpdate),
      })
      
      if (!response.ok) {
        throw new Error('Profile update failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If in KYC flow and on last step, submit KYC info instead
    if (kycStep === 5) {
      await submitKyc()
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Step 1: Upload avatar and cover image if new ones were selected
      const [avatarUrl, coverImageUrl] = await Promise.all([
        avatarFile ? uploadAvatar() : null,
        coverImageFile ? uploadCoverImage() : null
      ])
      
      // Step 2: Update profile with form data and new image URLs if available
      await updateProfile(avatarUrl, coverImageUrl)
      
      // Step 3: Refresh user data in the context
      await refreshUserData()
      
      toast.success('Profile updated successfully')
      router.push('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Navigation breadcrumb */}
      <div className="flex items-center py-3 text-sm mb-6">
        <Link href="/" className="text-blue-500 hover:underline">Trang chủ</Link>
        <span className="mx-2">·</span>
        <Link href="/profile" className="text-blue-500 hover:underline">Trang cá nhân</Link>
        <span className="mx-2">·</span>
        <span className="text-gray-500">Chỉnh sửa thông tin</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Chỉnh sửa thông tin cá nhân</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Cover image upload section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Ảnh bìa</h2>
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2">
              <img
                src={coverImagePreview || '/cover-placeholder.jpg'}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <button 
                type="button"
                onClick={triggerCoverImageUpload}
                className="absolute bottom-3 right-3 bg-white bg-opacity-90 p-2 rounded-full cursor-pointer hover:bg-gray-100 shadow-md"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input 
                type="file" 
                ref={coverImageInputRef}
                onChange={handleCoverImageChange} 
                accept="image/*"
                className="hidden" 
              />
            </div>
            <p className="text-xs text-gray-500">Khuyến nghị: Ảnh có kích thước 1200x300 pixel</p>
          </div>

          {/* Avatar upload section */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <img
                src={avatarPreview || '/user-avatar.png'} 
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
              <button 
                type="button"
                onClick={triggerAvatarUpload}
                className="absolute bottom-0 right-0 bg-white bg-opacity-90 p-2 rounded-full cursor-pointer hover:bg-gray-100 shadow-md"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input 
                type="file" 
                ref={avatarInputRef}
                onChange={handleAvatarChange} 
                accept="image/*"
                className="hidden" 
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="mt-8 flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <Link
              href="/profile"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>

      {/* KYC form section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Xác minh danh tính (KYC)</h1>
        
        {/* Show different content based on KYC status */}
        {user?.kyc_status === 'verified' ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Tài khoản đã được xác minh</h3>
                <p className="mt-2 text-sm text-green-700">Tài khoản của bạn đã được xác minh thành công. Bạn có thể sử dụng đầy đủ các tính năng của hệ thống.</p>
              </div>
            </div>
          </div>
        ) : user?.kyc_status === 'pending' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Đang chờ xác minh</h3>
                <p className="mt-2 text-sm text-yellow-700">Thông tin của bạn đang được kiểm duyệt, vui lòng chờ.</p>
              </div>
            </div>
          </div>
        ) : user?.kyc_status === 'rejected' ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Xác minh thất bại</h3>
                <p className="mt-2 text-sm text-red-700">Thông tin KYC của bạn chưa đạt yêu cầu. Vui lòng cập nhật lại thông tin.</p>
              </div>
            </div>
          </div>
        ) : (
          // KYC Step UI for users who haven't started KYC
          <div>
            {/* Step indicators */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map(step => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        kycStep === step 
                          ? 'bg-blue-500 text-white' 
                          : kycStep > step 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {kycStep > step ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    <span className="text-xs mt-1">
                      {step === 1 ? 'Loại giấy tờ' : 
                       step === 2 ? 'Số giấy tờ' : 
                       step === 3 ? 'Upload ảnh' : 
                       step === 4 ? 'Thông tin NH' : 'Xác nhận'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative flex items-center justify-between mt-2">
                <div className="absolute left-0 right-0 h-0.5 bg-gray-200" />
                <div 
                  className="absolute left-0 h-0.5 bg-blue-500 transition-all" 
                  style={{ width: `${(kycStep - 1) * 25}%` }} 
                />
              </div>
            </div>

            {/* Step 1: Document Type */}
            {kycStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="identity_document_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Loại giấy tờ tùy thân
                  </label>
                  <select
                    id="identity_document_type"
                    name="identity_document_type"
                    value={kycData.identity_document_type}
                    onChange={handleKycChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Chọn loại giấy tờ</option>
                    <option value="CMND">CMND</option>
                    <option value="CCCD">CCCD</option>
                    <option value="Hộ chiếu">Hộ chiếu</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Document Number */}
            {kycStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="identity_document_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Số giấy tờ
                  </label>
                  <input
                    type="text"
                    id="identity_document_number"
                    name="identity_document_number"
                    value={kycData.identity_document_number}
                    onChange={handleKycChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Nhập số giấy tờ tùy thân"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {kycData.identity_document_type === 'Hộ chiếu' 
                      ? 'Nhập số hộ chiếu, có thể bao gồm chữ cái và số.' 
                      : 'Chỉ nhập số, không bao gồm dấu cách hoặc ký tự đặc biệt.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Document Images */}
            {kycStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh mặt trước
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {frontImagePreview ? (
                      <div className="relative">
                        <img 
                          src={frontImagePreview} 
                          alt="Front" 
                          className="max-h-48 max-w-full" 
                        />
                        <button
                          type="button"
                          onClick={triggerFrontImageUpload}
                          className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md"
                        >
                          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="front-image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Tải ảnh lên</span>
                            <input 
                              id="front-image-upload" 
                              ref={frontImageInputRef}
                              type="file" 
                              className="sr-only" 
                              accept="image/jpeg, image/png"
                              onChange={handleFrontImageChange}
                            />
                          </label>
                          <p className="pl-1">hoặc kéo và thả</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh mặt sau
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {backImagePreview ? (
                      <div className="relative">
                        <img 
                          src={backImagePreview} 
                          alt="Back" 
                          className="max-h-48 max-w-full" 
                        />
                        <button
                          type="button"
                          onClick={triggerBackImageUpload}
                          className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md"
                        >
                          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="back-image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Tải ảnh lên</span>
                            <input 
                              id="back-image-upload" 
                              ref={backImageInputRef}
                              type="file" 
                              className="sr-only" 
                              accept="image/jpeg, image/png"
                              onChange={handleBackImageChange}
                            />
                          </label>
                          <p className="pl-1">hoặc kéo và thả</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Bank Account Info */}
            {kycStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Chủ tài khoản ngân hàng
                  </label>
                  <input
                    type="text"
                    id="bank_account_name"
                    name="bank_account_name"
                    value={kycData.bank_account_name}
                    onChange={handleKycChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Nhập tên chủ tài khoản"
                  />
                </div>
                
                <div>
                  <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    id="bank_account_number"
                    name="bank_account_number"
                    value={kycData.bank_account_number}
                    onChange={handleKycChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Nhập số tài khoản"
                  />
                </div>
                
                <div>
                  <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ngân hàng
                  </label>
                  <select
                    id="bank_name"
                    name="bank_name"
                    value={kycData.bank_name}
                    onChange={handleKycChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Chọn ngân hàng</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="Agribank">Agribank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="VPBank">VPBank</option>
                    <option value="MB Bank">MB Bank</option>
                    <option value="TPBank">TPBank</option>
                    <option value="ACB">ACB</option>
                    <option value="Sacombank">Sacombank</option>
                    <option value="VIB">VIB</option>
                    <option value="HDBank">HDBank</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {kycStep === 5 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Thông tin xác minh</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Loại giấy tờ: {kycData.identity_document_type}</li>
                          <li>Số giấy tờ: {kycData.identity_document_number}</li>
                          <li>Ảnh mặt trước và mặt sau: {frontImagePreview && backImagePreview ? 'Đã tải lên' : 'Chưa tải lên'}</li>
                          {kycData.bank_account_name && <li>Chủ tài khoản: {kycData.bank_account_name}</li>}
                          {kycData.bank_account_number && <li>Số tài khoản: {kycData.bank_account_number}</li>}
                          {kycData.bank_name && <li>Ngân hàng: {kycData.bank_name}</li>}
                        </ul>
                      </div>
                      <p className="mt-3 text-sm text-blue-700">
                        Vui lòng kiểm tra kỹ thông tin trước khi gửi yêu cầu xác minh. Sau khi gửi, hệ thống sẽ xử lý trong vòng 24-48 giờ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex space-x-4">
              {kycStep > 1 && (
                <button
                  type="button"
                  onClick={prevKycStep}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Quay lại
                </button>
              )}
              
              {kycStep < 5 ? (
                <button
                  type="button"
                  onClick={nextKycStep}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitKyc}
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi xác minh'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 