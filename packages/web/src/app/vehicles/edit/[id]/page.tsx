'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { endpoints } from '@/config/api'
import axios from 'axios'

interface VehicleParams {
  id: string
}

const schema = yup.object({
  title: yup.string().required('Tiêu đề rao bán là bắt buộc'),
  description: yup.string().required('Mô tả chi tiết là bắt buộc'),
  make: yup.string().required('Hãng xe là bắt buộc'),
  model: yup.string().required('Dòng xe là bắt buộc'),
  year: yup.number()
    .required('Năm sản xuất là bắt buộc')
    .min(2000, 'Năm sản xuất phải sau năm 2000')
    .max(new Date().getFullYear() + 1, 'Năm sản xuất không thể trong tương lai'),
  mileage: yup.number()
    .required('Số km đã đi là bắt buộc')
    .min(0, 'Số km đã đi phải là số dương'),
  price: yup.number()
    .required('Giá bán là bắt buộc')
    .min(0, 'Giá bán phải là số dương'),
  location: yup.string().required('Địa chỉ/Khu vực là bắt buộc'),
  license_plate: yup.string(),
}).required()

type VehicleFormData = yup.InferType<typeof schema>

export default function EditVehicle({ params }: { params: VehicleParams }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isVehicleLoading, setIsVehicleLoading] = useState(true)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [vehicleType, setVehicleType] = useState<string>('')
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: yupResolver(schema),
    mode: 'onBlur'
  })
  
  // Lấy thông tin xe cần chỉnh sửa
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setIsVehicleLoading(true)
        const token = localStorage.getItem('token')
        
        const response = await axios.get(
          `${endpoints.API_URL}/vehicles/${params.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        const vehicleData = response.data
        
        // Cập nhật loại xe
        setVehicleType(vehicleData.type)
        
        // Cập nhật hình ảnh
        if (vehicleData.images && vehicleData.images.length > 0) {
          setImageUrls(vehicleData.images)
        }
        
        // Reset form với giá trị mới
        reset({
          title: vehicleData.title,
          description: vehicleData.description,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          mileage: vehicleData.mileage,
          price: vehicleData.price,
          location: vehicleData.location,
          license_plate: vehicleData.license_plate,
        })
        
        toast.success('Đã tải thông tin xe thành công')
      } catch (error) {
        console.error('Error fetching vehicle data:', error)
        toast.error('Không thể tải thông tin xe')
        router.push('/my-vehicles')
      } finally {
        setIsVehicleLoading(false)
      }
    }
    
    if (params.id) {
      fetchVehicleData()
    }
  }, [params.id, reset, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      toast.loading('Đang tải lên hình ảnh...')
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token xác thực')
      }
      
      const formData = new FormData()
      
      Array.from(files).forEach(file => {
        formData.append('images', file)
      })
      
      const response = await axios.post(
        endpoints.vehicles.upload,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      const uploadedUrls = response.data.urls
      setImageUrls(prev => [...prev, ...uploadedUrls])
      
      toast.dismiss()
      toast.success(`Đã tải lên ${uploadedUrls.length} hình ảnh thành công`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.dismiss()
      toast.error('Không thể tải lên hình ảnh. Vui lòng thử lại.')
    }
  }
  
  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để chỉnh sửa tin xe')
        router.push('/auth/login')
        return
      }

      setIsLoading(true)
      
      const vehicleData = {
        type: vehicleType,
        ...data,
        images: imageUrls,
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token xác thực')
      }

      const { data: responseData } = await axios.put(
        `${endpoints.API_URL}/vehicles/${params.id}`, 
        vehicleData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      )
      
      toast.success(responseData.message || 'Cập nhật tin xe thành công')
      router.push('/my-vehicles')
    } catch (error: any) {
      console.error('Update error:', error)
      
      if (error.response) {
        const errorData = error.response.data
        if (errorData.message) {
          toast.error(errorData.message)
        } else {
          toast.error('Không thể cập nhật tin xe')
        }
      } else {
        toast.error('Lỗi kết nối đến server')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isVehicleLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Chỉnh sửa thông tin xe
        </h1>
        <button
          onClick={() => router.push('/my-vehicles')}
          className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Thông tin cơ bản */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Thông tin cơ bản</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Tiêu đề rao bán <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="title"
                    {...register('title')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    rows={3}
                    {...register('description')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                  Hãng xe <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="make"
                    {...register('make')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.make && (
                    <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  Dòng xe <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="model"
                    {...register('model')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.model && (
                    <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Năm sản xuất <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="year"
                    {...register('year')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
                  Số km đã đi <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="mileage"
                    {...register('mileage')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.mileage && (
                    <p className="mt-1 text-sm text-red-600">{errors.mileage.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="price"
                    {...register('price')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="location"
                    {...register('location')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700">
                  Biển số xe
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="license_plate"
                    {...register('license_plate')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Ví dụ: 30A-12345"
                  />
                  {errors.license_plate && (
                    <p className="mt-1 text-sm text-red-600">{errors.license_plate.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hình ảnh */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Hình ảnh xe</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="mb-4">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Tải lên hình ảnh
              </label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                JPG, PNG hoặc GIF tối đa 5MB (tối đa 10 hình)
              </p>
            </div>

            {imageUrls.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh đã tải lên</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                        <img
                          src={url}
                          alt={`Ảnh ${index + 1}`}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/my-vehicles')}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
} 