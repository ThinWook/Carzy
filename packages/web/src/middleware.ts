import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Lấy token từ cookie hoặc local storage
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.split(' ')[1]
  
  // Lấy đường dẫn hiện tại
  const { pathname } = request.nextUrl
  
  // Các đường dẫn auth không cần kiểm tra
  const isAuthRoute = pathname.startsWith('/auth/') || 
                      pathname.includes('/login') || 
                      pathname.includes('/register') || 
                      pathname.includes('/forgot-password')
  
  // Nếu có token và không phải đường dẫn auth, kiểm tra role
  if (token && !isAuthRoute) {
    try {
      // Lấy thông tin người dùng từ cookie
      const userDataCookie = request.cookies.get('userData')?.value
      
      if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie))
        
        // Kiểm tra xem người dùng có role là 'admin' hay không
        if (userData.role === 'admin') {
          // Nếu là admin, chuyển hướng đến trang admin
          return NextResponse.redirect(new URL('http://localhost:3001', request.url))
        }
      }
    } catch (error) {
      // Nếu có lỗi, bỏ qua và cho phép truy cập
      console.error('Middleware error:', error)
    }
  }
  
  return NextResponse.next()
}

// Chỉ áp dụng middleware cho các đường dẫn sau
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/ (auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/).*)',
  ],
} 