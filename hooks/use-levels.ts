"use client"

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api"

interface Level {
  name: string
}

interface UseLevelsReturn {
  levels: Level[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useLevels(baseUrl: string): UseLevelsReturn {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLevels = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiRequest("/student/level/list")
      const data: Level[] = await response.json()
      setLevels(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch levels")
      setLevels([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [baseUrl])

  return {
    levels,
    loading,
    error,
    refetch: fetchLevels,
  }
}
