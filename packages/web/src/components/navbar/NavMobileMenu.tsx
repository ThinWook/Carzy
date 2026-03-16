'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavMobileMenuProps {
  isAuthenticated: boolean
  userName?: string
  onLogout: () => void
}

const MOBILE_LINKS = [
  { name: 'Ô tô', href: '/vehicles/type/car' },
  { name: 'Xe máy', href: '/vehicles/type/motorcycle' },
  { name: 'Xe đạp', href: '/vehicles/type/bicycle' },
]

export default function NavMobileMenu({ isAuthenticated, userName, onLogout }: NavMobileMenuProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
      {MOBILE_LINKS.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} block rounded-md px-3 py-2 text-base font-medium`}
        >
          {item.name}
        </Link>
      ))}

      <Link href="/vehicles/create" className="block rounded-md px-3 py-2 text-base font-medium text-white bg-orange-500 hover:bg-orange-600">
        ĐĂNG TIN
      </Link>

      {isAuthenticated ? (
        <>
          <Link href="/profile" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">
            {userName || 'Tài khoản'}
          </Link>
          <button onClick={onLogout} className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white w-full text-left">
            Đăng xuất
          </button>
        </>
      ) : (
        <>
          <Link href="/auth/login" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">
            Đăng nhập
          </Link>
          <Link href="/auth/register" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">
            Đăng ký
          </Link>
        </>
      )}
    </div>
  )
}
