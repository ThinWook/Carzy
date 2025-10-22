import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import ClientOnly from '@/components/ClientOnly'
import QueryProvider from '@/components/providers/QueryProvider'
import { NotificationProvider } from '@/contexts/NotificationContext'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Carzy Marketplace',
  description: 'Chợ xe cũ (ô tô, xe máy, xe đạp)',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnly>
          <QueryProvider>
            <AuthProvider>
              <NotificationProvider>
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
                <Toaster />
              </NotificationProvider>
            </AuthProvider>
          </QueryProvider>
        </ClientOnly>
      </body>
    </html>
  )
}
