import axios from 'axios'
import { API_URL } from '../config/api'

/**
 * Axios instance configured for the Carzy API.
 * Automatically sends HttpOnly cookies (withCredentials: true) with every request.
 */
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Optional: Interceptors for logging or global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Thêm các xử lý lỗi toàn cục tại đây nếu cần (vd: redirect login khi 401)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        // Có thể emit event hoặc xử lý token expiration
        console.warn('Unauthorized or Token expired');
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
