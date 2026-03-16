import apiClient from '@/lib/apiClient'
import { endpoints } from '@/config/api'

export const userApi = {
  /**
   * Lấy thông tin profile người dùng hiện tại
   */
  getProfile: async () => {
    const { data } = await apiClient.get(endpoints.auth.currentUser)
    return data
  },

  /**
   * Cập nhật thông tin profile
   */
  updateProfile: async (profileData: any) => {
    const { data } = await apiClient.put(endpoints.auth.updateProfile, profileData)
    return data
  },

  /**
   * Upload avatar mới
   */
  updateAvatar: async (formData: FormData) => {
    const { data } = await apiClient.post(endpoints.auth.uploadAvatar, formData)
    return data
  },

  /**
   * Upload ảnh bìa mới
   */
  updateCoverImage: async (formData: FormData) => {
    const { data } = await apiClient.post(endpoints.auth.uploadCoverImage, formData)
    return data
  },

  /**
   * Upload tài liệu KYC (CMND/CCCD)
   */
  uploadKycDocuments: async (formData: FormData) => {
    const { data } = await apiClient.post(endpoints.kyc.uploadDocuments, formData)
    return data
  },

  /**
   * Cập nhật thông tin KYC
   */
  updateKyc: async (kycData: any) => {
    const { data } = await apiClient.put(endpoints.kyc.update, kycData)
    return data
  },
}
