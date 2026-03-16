import apiClient from '@/lib/apiClient'
import { endpoints } from '@/config/api'

export const chatApi = {
  /**
   * Lấy danh sách cuộc trò chuyện
   */
  getList: async () => {
    const { data } = await apiClient.get(endpoints.chat.list)
    return data
  },

  /**
   * Lấy chi tiết một cuộc trò chuyện (bao gồm tin nhắn)
   */
  getById: async (id: string) => {
    const { data } = await apiClient.get(endpoints.chat.getById(id))
    return data
  },

  /**
   * Tạo cuộc trò chuyện mới hoặc lấy cuộc hiện có với một người bán/xe cụ thể
   */
  create: async (payload: { participantId: string; vehicleId?: string }) => {
    const { data } = await apiClient.post(endpoints.chat.create, payload)
    return data
  },

  /**
   * Gửi tin nhắn vào một cuộc trò chuyện
   */
  sendMessage: async (id: string, content: string) => {
    const { data } = await apiClient.post(endpoints.chat.sendMessage(id), { content })
    return data
  },

  /**
   * Đánh dấu tin nhắn trong cuộc trò chuyện là đã đọc
   */
  markAsRead: async (id: string) => {
    const { data } = await apiClient.put(endpoints.chat.markAsRead(id))
    return data
  },
}
