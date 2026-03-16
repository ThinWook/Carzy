'use client'

import React, { useEffect, useState } from 'react'

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    try {
      if (typeof window !== 'undefined') {
        ;(window as any).__HYDRATED__ = true
      }
      if (typeof document !== 'undefined' && document.body) {
        document.body.dataset.hydrated = 'true'
      }
    } catch (e) {}
  }, [])

  if (!hasMounted) {
    return null
  }

  return <>{children}</>
} 