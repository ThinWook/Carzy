'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { io, Socket } from 'socket.io-client'

type Message = {
  _id: string
  sender: string
  content: string
  read: boolean
  createdAt: string
}

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
  messages: Message[]
}

export default function ChatWindow() {
  const { id } = useParams()
  const { user } = useAuth()
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await response.json()
        setChat(data)
        setMessages(data.messages)
      } catch (error) {
        console.error('Error fetching chat:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchChat()
    }
  }, [id])

  useEffect(() => {
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    newSocket.emit('join_chat', id)

    newSocket.on('message_received', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      newSocket.emit('leave_chat', id)
      newSocket.disconnect()
    }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch(`http://localhost:5000/api/chat/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newMessage })
      })

      const data = await response.json()
      setMessages(prev => [...prev, data])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Chat not found</h2>
          <p className="mt-2 text-gray-600">The chat you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const otherParticipant = chat.participants.find(p => p._id !== user?._id)

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-lg">
                  {otherParticipant?.name.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {otherParticipant?.name}
              </h3>
              <p className="text-sm text-gray-500">
                {chat.vehicle.brand} {chat.vehicle.model}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.sender === user?._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 ${
                message.sender === user?._id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
} 