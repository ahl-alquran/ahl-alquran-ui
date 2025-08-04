"use client"

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api" // Import apiRequest

interface City {
  name: string
}

interface UseCitiesReturn {
  cities: City[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCities(baseUrl: string): UseCitiesReturn {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCities = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use apiRequest from lib/api
      const response = await apiRequest("/student/city/list")

      // apiRequest already handles !response.ok and throws errors,
      // so we can directly parse the JSON here.
      const data: City[] = await response.json()
      setCities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cities")
      setCities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCities()
  }, [baseUrl]) // Depend on baseUrl to refetch if it changes

  return {
    cities,
    loading,
    error,
    refetch: fetchCities,
  }
}
