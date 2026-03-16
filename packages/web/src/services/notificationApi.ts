import apiClient from '@/lib/apiClient'
import { endpoints } from '@/config/api'

export const notificationApi = {
  /**
   * Lấy danh sách thông báo của người dùng
   */
  getList: async (page = 1, limit = 20) => {
    const { data } = await apiClient.get(endpoints.notifications.list, {
      params: { page, limit },
    })
    return data
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: async () => {
    const { data } = await apiClient.get(endpoints.notifications.unreadCount)
    return data
  },

  /**
   * Đánh dấu một thông báo là đã đọc
   */
  markAsRead: async (id: string) => {
    const { data } = await apiClient.patch(endpoints.notifications.markAsRead(id))
    return data
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async () => {
    const { data } = await apiClient.patch(endpoints.notifications.markAllAsRead)
    return data
  },
}
