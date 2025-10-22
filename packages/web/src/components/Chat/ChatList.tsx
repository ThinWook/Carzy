'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Chat = {
  _id: string
  participants: {
    _id: string
    name: string
    email: string
  }[]
  vehicle: {
    _id: string
    brand: string
    model: string
    price: number
  }
  lastMessage: string
  messages: {
    sender: string
    content: string
    read: boolean
    createdAt: string
  }[]
}

export default function ChatList() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await response.json()
        setChats(data)
      } catch (error) {
        console.error('Error fetching chats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchChats()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Your Conversations</h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {chats.map((chat) => {
            const otherParticipant = chat.participants.find(p => p._id !== user?._id)
            const lastMessage = chat.messages[chat.messages.length - 1]
            const unreadCount = chat.messages.filter(m => !m.read && m.sender !== user?._id).length

            return (
              <li key={chat._id}>
                <Link href={`/chat/${chat._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-lg">
                              {otherParticipant?.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600 truncate">
                            {otherParticipant?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {chat.vehicle.brand} {chat.vehicle.model}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {unreadCount}
                          </span>
                        )}
                        <div className="ml-4 text-sm text-gray-500">
                          {new Date(chat.lastMessage).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 truncate">
                        {lastMessage?.content}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
} 