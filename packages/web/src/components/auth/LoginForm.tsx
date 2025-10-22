'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await login(email, password)
      
      toast.success('Đăng nhập thành công!')
      // Đặt cookie cho middleware
      document.cookie = `token=${response.token}; path=/; max-age=${60*60*24*30}`
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(response))}; path=/; max-age=${60*60*24*30}`
      
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đăng nhập</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Đăng nhập để tiếp tục truy cập
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900 dark:text-gray-300">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div className="text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </div>
      </form>

      <div className="text-sm text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
} 