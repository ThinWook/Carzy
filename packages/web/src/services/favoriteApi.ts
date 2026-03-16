import apiClient from '@/lib/apiClient'
import { endpoints } from '@/config/api'

export const favoriteApi = {
  /**
   * Lấy danh sách tin đăng đã lưu (yêu thích)
   */
  getList: async () => {
    const { data } = await apiClient.get(endpoints.favorites.list)
    return data
  },

  /**
   * Thêm xe vào danh sách yêu thích
   */
  add: async (vehicleId: string) => {
    const { data } = await apiClient.post(endpoints.favorites.add(vehicleId))
    return data
  },

  /**
   * Xóa xe khỏi danh sách yêu thích
   */
  remove: async (vehicleId: string) => {
    const { data } = await apiClient.delete(endpoints.favorites.remove(vehicleId))
    return data
  },

  /**
   * Kiểm tra xem xe đã được lưu chưa
   */
  check: async (vehicleId: string) => {
    const { data } = await apiClient.get(endpoints.favorites.check(vehicleId))
    return data
  },
}
