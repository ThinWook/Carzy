'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { chatApi } from '@/services/chatApi'
import { toast } from 'react-hot-toast'

type Chat = {
  _id: string
  participants: {
    _id: string
    name: string
    avatar?: string
  }[]
  lastMessage?: {
    content: string
    timestamp: string
    read: boolean
  }
  vehicleId?: string
}

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Lấy danh sách chat từ API
  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!isAuthenticated || !user) {
          setChats([])
          setIsLoading(false)
          return
        }

        const responseData = await chatApi.getList()

        // Chuyển đổi dữ liệu từ API sang định dạng cần thiết
        const chatData = responseData.map((chat: any) => {
          const otherParticipant = chat.participants.find((p: any) => p._id !== user._id) || {}
          
          return {
            _id: chat._id,
            participants: [
              { 
                _id: otherParticipant._id, 
                name: otherParticipant.full_name || 'Người dùng', 
                avatar: otherParticipant.avatar_url 
              },
              { _id: user._id, name: 'You' }
            ],
            lastMessage: chat.messages && chat.messages.length > 0 ? {
              content: chat.messages[chat.messages.length - 1].content,
              timestamp: chat.messages[chat.messages.length - 1].createdAt,
              read: chat.messages[chat.messages.length - 1].read
            } : undefined,
            vehicleId: chat.vehicle?._id
          }
        })

        setChats(chatData)
      } catch (error) {
        console.error('Lỗi khi tải danh sách chat:', error)
        toast.error('Không thể tải danh sách trò chuyện. Vui lòng thử lại sau.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChats()
  }, [isAuthenticated, user])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    // Check if it's today
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    // Check if it's within the last week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    if (date > oneWeekAgo) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    // Otherwise, show the date
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants.find(p => p._id !== user?._id)
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-2xl">
        {/* Header Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button 
              className="px-6 py-4 border-b-2 border-orange-500 text-gray-900 text-sm font-medium"
            >
              HOẠT ĐỘNG
            </button>
            <button 
              className="px-6 py-4 text-gray-500 text-sm font-medium"
            >
              TIN MỚI
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập ít nhất 3 ký tự để bắt đầu tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="border-b border-gray-200 px-4 py-2 flex justify-between items-center">
          <div className="relative">
            <button className="flex items-center text-sm text-gray-700 font-medium">
              <span>Tất cả</span>
              <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button className="text-gray-400 hover:text-gray-500">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Chat List */}
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Đang tải cuộc trò chuyện...</p>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map(chat => {
              const otherParticipant = chat.participants.find(p => p._id !== user?._id)
              return (
                <li key={chat._id}>
                  <Link href={`/chat/${chat._id}`} className="flex items-center px-4 py-3 hover:bg-gray-50">
                    {/* Avatar */}
                    <div className="flex-shrink-0 h-12 w-12 relative">
                      {otherParticipant?.avatar ? (
                        <img 
                          src={otherParticipant.avatar} 
                          alt={otherParticipant.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-lg">
                          {otherParticipant?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Chat Info */}
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {otherParticipant?.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {chat.lastMessage ? formatTimestamp(chat.lastMessage.timestamp) : ''}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {chat.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">Không tìm thấy cuộc trò chuyện nào phù hợp</p>
            </div>
          )}
        </ul>

        {/* Hidden Chat Toggle Button */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <button className="bg-white border border-gray-300 rounded-full py-2 px-6 shadow-md text-sm text-gray-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
            </svg>
            Ẩn hội thoại
          </button>
        </div>
      </div>
    </div>
  )
} 