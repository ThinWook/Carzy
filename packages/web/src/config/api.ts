export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const endpoints = {
  vehicles: {
    list: `${API_URL}/vehicles`,
    search: `${API_URL}/vehicles/search`,
    getByType: (type: string) => `${API_URL}/vehicles/type/${type}`,
    detail: (id: string) => `${API_URL}/vehicles/${id}`,
    create: `${API_URL}/vehicles`,
    update: (id: string) => `${API_URL}/vehicles/${id}`,
    delete: (id: string) => `${API_URL}/vehicles/${id}`,
    userVehicles: `${API_URL}/vehicles/user`,
    upload: `${API_URL}/vehicles/upload`,
  },
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    refreshToken: `${API_URL}/auth/refresh-token`,
    currentUser: `${API_URL}/auth/current-user`,
    updateProfile: `${API_URL}/users/profile`,
    uploadAvatar: `${API_URL}/users/avatar`,
    uploadCoverImage: `${API_URL}/users/cover-image`,
  },
  favorites: {
    list: `${API_URL}/favorites`,
    add: (vehicleId: string) => `${API_URL}/favorites/${vehicleId}`,
    remove: (vehicleId: string) => `${API_URL}/favorites/${vehicleId}`,
    check: (vehicleId: string) => `${API_URL}/favorites/check/${vehicleId}`,
  },
  chat: {
    list: `${API_URL}/chat`,
    getById: (id: string) => `${API_URL}/chat/${id}`,
    sendMessage: (id: string) => `${API_URL}/chat/${id}/messages`,
    markAsRead: (id: string) => `${API_URL}/chat/${id}/read`,
    create: `${API_URL}/chat`,
  },
  kyc: {
    uploadDocuments: `${API_URL}/users/upload-kyc-documents`,
    update: `${API_URL}/users/update-kyc`,
  },
  notifications: {
    list: `${API_URL}/notifications`,
    unreadCount: `${API_URL}/notifications/unread-count`,
    markAsRead: (id: string) => `${API_URL}/notifications/${id}/read`,
    markAllAsRead: `${API_URL}/notifications/read-all`,
  },
  API_URL,
} 