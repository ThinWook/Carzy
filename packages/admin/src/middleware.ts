import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Đường dẫn đến trang đăng nhập
  const signinUrl = new URL('/signin', request.url)
  
  // Bỏ qua các trang không cần xác thực
  if (
    request.nextUrl.pathname.startsWith('/signin') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname.includes('/_next') ||
    request.nextUrl.pathname.includes('/images') || 
    request.nextUrl.pathname.includes('/fonts/')
  ) {
    return NextResponse.next()
  }

  // Chuyển hướng trang đăng ký về trang đăng nhập
  if (request.nextUrl.pathname.startsWith('/signup')) {
    return NextResponse.redirect(signinUrl)
  }

  // Kiểm tra token
  const token = request.cookies.get('token')?.value
  if (!token) {
    // Chuyển hướng đến trang đăng nhập nếu không có token
    return NextResponse.redirect(signinUrl)
  }

  // Kiểm tra thông tin người dùng
  const userDataCookie = request.cookies.get('userData')?.value
  if (!userDataCookie) {
    return NextResponse.redirect(signinUrl)
  }

  try {
    // Giải mã thông tin người dùng từ cookie
    const userData = JSON.parse(decodeURIComponent(userDataCookie))
    
    // Kiểm tra token có hết hạn không
    const tokenExpiry = userData.exp
    const currentTime = Math.floor(Date.now() / 1000)
    
    if (tokenExpiry && currentTime > tokenExpiry) {
      console.log('Token đã hết hạn, chuyển hướng về trang đăng nhập')
      return NextResponse.redirect(signinUrl)
    }
    
    // Kiểm tra role admin
    if (userData.role !== 'admin') {
      return NextResponse.redirect(signinUrl)
    }
    
    // Cho phép truy cập nếu là admin
    return NextResponse.next()
  } catch (error) {
    console.error('Lỗi khi đọc thông tin người dùng:', error)
    return NextResponse.redirect(signinUrl)
  }
}

// Cấu hình các đường dẫn cần kiểm tra middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 