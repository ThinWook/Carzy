'use client'

import { useState, useCallback } from 'react'

interface Vehicle {
  _id: string
  title: string
  make: string
  model: string
  price: number
  type: string
  year: number
  status: string
  images: string[]
  location: string
  user: { full_name: string; avatar_url?: string }
}

interface VehicleFilter {
  type?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  condition?: string
  page?: number
  limit?: number
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

/**
 * Custom hook for fetching vehicle lists with filters and pagination.
 */
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = useCallback(async (filters: VehicleFilter = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value))
        }
      })

      const response = await fetch(`/api/vehicles?${params}`)
      if (!response.ok) throw new Error('Failed to fetch vehicles')

      const data = await response.json()
      setVehicles(data.vehicles || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setVehicles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { vehicles, pagination, isLoading, error, fetchVehicles }
}
