'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface VehiclesLayoutProps {
  children: ReactNode
}

export default function VehiclesLayout({ children }: VehiclesLayoutProps) {
  const pathname = usePathname()
  const isTypePage = pathname?.startsWith('/vehicles/type/')
  const isDetailPage = pathname?.match(/^\/vehicles\/[0-9a-fA-F]{24}$/)

  // Nếu là trang chi tiết hoặc trang type, không hiển thị layout
  if (isDetailPage || isTypePage) {
    return <>{children}</>
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {children}
      </div>
    </div>
  )
} 