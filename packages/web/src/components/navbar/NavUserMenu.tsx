'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import { ChatBubbleLeftRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import NotificationIcon from '../notifications/NotificationIcon'

interface User {
  full_name?: string
  avatar_url?: string
}

interface NavUserMenuProps {
  user: User | null
  isAuthenticated: boolean
  onLogout: () => void
}

export default function NavUserMenu({ user, isAuthenticated, onLogout }: NavUserMenuProps) {
  if (!isAuthenticated) {
    return (
      <>
        <Link href="/vehicles/create" className="flex items-center rounded-md bg-orange-500 px-3 py-1.5 text-white hover:bg-orange-600 focus:outline-none mr-3 transition-colors">
          <span className="text-sm font-medium">ĐĂNG TIN</span>
        </Link>
        <Link href="/auth/login" className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
          Đăng nhập
        </Link>
        <Link href="/auth/register" className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
          Đăng ký
        </Link>
      </>
    )
  }

  return (
    <>
      <NotificationIcon />
      <Link href="/chat" className="p-1 text-gray-400 hover:text-white focus:outline-none mr-3 active:scale-95 transition-all duration-150">
        <span className="sr-only">Tin nhắn</span>
        <ChatBubbleLeftRightIcon className="h-6 w-6" aria-hidden="true" />
      </Link>
      <Link href="/my-vehicles" className="flex items-center rounded-md bg-gray-800 px-3 py-1 text-gray-400 hover:text-white focus:outline-none mr-3">
        <Squares2X2Icon className="h-5 w-5 mr-1" aria-hidden="true" />
        <span className="text-sm">Quản lý tin</span>
      </Link>
      <Link href="/vehicles/create" className="flex items-center rounded-md bg-orange-500 px-3 py-1.5 text-white hover:bg-orange-600 focus:outline-none mr-3 transition-colors">
        <span className="text-sm font-medium">ĐĂNG TIN</span>
      </Link>

      <Menu as="div" className="relative ml-3">
        <Menu.Button className="flex items-center px-3 py-1.5 text-sm font-medium text-white hover:opacity-75 focus:outline-none">
          <img className="h-6 w-6 rounded-full mr-2" src={user?.avatar_url || '/user-avatar.png'} alt="Avatar" />
          <span>{user?.full_name || 'Tài khoản'}</span>
          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Menu.Button>
        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
          <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {/* User info */}
            <div className="px-4 py-3">
              <Link href="/profile" className="block hover:bg-gray-50 -mx-4 -my-3 px-4 py-3 rounded-t-md transition duration-150">
                <div className="flex items-center">
                  <img className="h-10 w-10 rounded-full" src={user?.avatar_url || '/user-avatar.png'} alt="Avatar" />
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.full_name || 'Tài khoản'}</div>
                  </div>
                </div>
              </Link>
            </div>
            <hr className="my-1" />

            {/* Menu items */}
            {[
              { href: '/orders/purchases', label: 'Đơn mua' },
              { href: '/orders/sales', label: 'Đơn bán' },
              { href: '/saved-listings', label: 'Tin đăng đã lưu' },
              { href: '/my-reviews', label: 'Đánh giá từ tôi' },
              { href: '/profile/edit', label: 'Cài đặt tài khoản' },
              { href: '/help', label: 'Trợ giúp' },
            ].map((item) => (
              <Menu.Item key={item.href}>
                {({ active }) => (
                  <Link href={item.href} className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}>
                    {item.label}
                  </Link>
                )}
              </Menu.Item>
            ))}

            <hr className="my-1" />
            <Menu.Item>
              {({ active }) => (
                <button onClick={onLogout} className={`${active ? 'bg-gray-100' : ''} flex w-full items-center px-4 py-2 text-sm text-gray-700`}>
                  Đăng xuất
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  )
}
