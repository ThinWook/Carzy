'use client'

import { useState, useCallback } from 'react'
import { vehicleApi } from '@/services/vehicleApi'

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
      // vehicleApi request configures query params via axios automatically
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )

      const data = await vehicleApi.getAll(cleanFilters)
      setVehicles(data.vehicles || [])
      setPagination(data.pagination || null)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Unknown error')
      setVehicles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { vehicles, pagination, isLoading, error, fetchVehicles }
}
