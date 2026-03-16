'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface VehicleSearchResult {
  _id: string
  title: string
  make: string
  model: string
  price: number
  type: string
  year: number
  images: string[]
}

/**
 * Custom hook — tách toàn bộ search logic khỏi Navbar.
 * Xử lý: debounce query, gọi API, navigate kết quả, đóng dropdown.
 */
export function useVehicleSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VehicleSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsLoading(true)
    setShowResults(true)

    try {
      const params = new URLSearchParams({ search: searchQuery.trim(), limit: '5' })
      const response = await fetch(`/api/vehicles/quick-search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.vehicles || [])
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    fetchResults(value)
  }, [fetchResults])

  const handleSearch = useCallback((e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    if (query.trim()) {
      router.push(`/vehicles/search?query=${encodeURIComponent(query.trim())}`)
      setShowResults(false)
    }
  }, [query, router])

  const handleResultClick = useCallback((id: string) => {
    router.push(`/vehicles/${id}`)
    setShowResults(false)
    setQuery('')
  }, [router])

  const closeResults = useCallback(() => setShowResults(false), [])

  // Close dropdown on outside click
  useEffect(() => {
    document.addEventListener('click', closeResults)
    return () => document.removeEventListener('click', closeResults)
  }, [closeResults])

  return {
    query,
    results,
    isLoading,
    showResults,
    setShowResults,
    handleQueryChange,
    handleSearch,
    handleResultClick,
  }
}
