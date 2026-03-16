'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import NavSearchBar from './navbar/NavSearchBar'
import NavUserMenu from './navbar/NavUserMenu'
import NavMobileMenu from './navbar/NavMobileMenu'

const CATEGORIES = [
  { name: 'Ô tô', href: '/vehicles/type/car' },
  { name: 'Xe máy', href: '/vehicles/type/motorcycle' },
  { name: 'Xe đạp', href: '/vehicles/type/bicycle' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo + Categories */}
              <div className="flex items-center">
                <Link href="/" className="inline-block mr-6">
                  <div className="bg-[#1e293b] border-4 border-white rounded px-2 py-1">
                    <span className="text-white font-bold text-xl">Carzy</span>
                  </div>
                </Link>
                <div className="hidden md:flex items-baseline space-x-4">
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.href} href={cat.href} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search bar — desktop */}
              <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
                <NavSearchBar />
              </div>

              {/* User menu — desktop */}
              <div className="hidden md:flex items-center ml-4 md:ml-6">
                <NavUserMenu user={user} isAuthenticated={isAuthenticated} onLogout={logout} />
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {open ? <XMarkIcon className="block h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="block h-6 w-6" aria-hidden="true" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="px-4 pt-2 pb-3 border-t border-gray-700 md:hidden">
            <NavSearchBar />
          </div>

          {/* Mobile navigation panel */}
          <Disclosure.Panel className="md:hidden">
            <NavMobileMenu
              isAuthenticated={isAuthenticated}
              userName={user?.full_name}
              onLogout={logout}
            />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}