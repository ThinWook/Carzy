import apiClient from '@/lib/apiClient'
import { endpoints } from '@/config/api'

export const vehicleApi = {
  /**
   * Lấy danh sách xe với các bộ lọc
   */
  getAll: async (filters = {}) => {
    const { data } = await apiClient.get(endpoints.vehicles.list, { params: filters })
    return data
  },

  /**
   * Tìm kiếm xe chuyên sâu
   */
  search: async (queryStr: string) => {
    const { data } = await apiClient.get(`${endpoints.vehicles.search}?${queryStr}`)
    return data
  },

  /**
   * Lấy xe theo ID
   */
  getById: async (id: string) => {
    const { data } = await apiClient.get(endpoints.vehicles.detail(id))
    return data
  },

  /**
   * Lấy xe theo loại (car, motorcycle, bicycle)
   */
  getByType: async (type: string) => {
    const { data } = await apiClient.get(endpoints.vehicles.getByType(type))
    return data
  },

  /**
   * Đăng tin mua bán xe mới
   */
  create: async (vehicleData: any) => {
    const { data } = await apiClient.post(endpoints.vehicles.create, vehicleData)
    return data
  },

  /**
   * Cập nhật thông tin xe
   */
  update: async (id: string, vehicleData: any) => {
    const { data } = await apiClient.put(endpoints.vehicles.update(id), vehicleData)
    return data
  },

  /**
   * Xóa xe
   */
  delete: async (id: string) => {
    const { data } = await apiClient.delete(endpoints.vehicles.delete(id))
    return data
  },

  /**
   * Lấy danh sách xe của người dùng hiện tại
   */
  getUserVehicles: async () => {
    const { data } = await apiClient.get(endpoints.vehicles.userVehicles)
    return data
  },

  /**
   * Upload danh sách hình ảnh
   */
  uploadImages: async (formData: FormData) => {
    const { data } = await apiClient.post(endpoints.vehicles.upload, formData)
    return data
  },
}
