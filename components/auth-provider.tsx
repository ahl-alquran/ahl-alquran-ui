"use client"

import type React from "react"
import { API_BASE_URL } from "@/lib/config" // Import API_BASE_URL

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api" // Import apiRequest

interface User {
  username: string
  name: string // Add name field
  mobileNumber?: string // Add mobileNumber field
  email?: string // Add email field
  authorities: string[] // Changed to string array
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchUserDetails = async (username: string) => {
    try {
      const response = await apiRequest(`/auth/me?username=${username}`)
      const userData = await response.json()
      return userData as Omit<User, "authorities"> // Return user data without authorities
    } catch (error) {
      console.error("Failed to fetch user details:", error)
      return null
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("jwt-token")
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          if (payload.exp * 1000 > Date.now()) {
            const userDetails = await fetchUserDetails(payload.username)
            if (userDetails) {
              setUser({
                username: payload.username,
                name: userDetails.name,
                mobileNumber: userDetails.mobileNumber,
                email: userDetails.email,
                // Parse authorities string into an array
                authorities: payload.authorities ? payload.authorities.split(",") : [],
              })
            } else {
              localStorage.removeItem("jwt-token")
            }
          } else {
            localStorage.removeItem("jwt-token")
          }
        } catch (error) {
          localStorage.removeItem("jwt-token")
        }
      }
      setIsLoading(false)
    }
    initializeAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/apiLogin`, {
        // Replace hardcoded URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
        credentials: "omit", // Don't send credentials for this request
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === "OK" && data.jwtToken) {
          localStorage.setItem("jwt-token", data.jwtToken)
          const payload = JSON.parse(atob(data.jwtToken.split(".")[1]))

          const userDetails = await fetchUserDetails(payload.username)
          if (userDetails) {
            setUser({
              username: payload.username,
              name: userDetails.name,
              mobileNumber: userDetails.mobileNumber,
              email: userDetails.email,
              // Parse authorities string into an array
              authorities: payload.authorities ? payload.authorities.split(",") : [],
            })
            return true
          } else {
            localStorage.removeItem("jwt-token") // Clear token if user details can't be fetched
            return false
          }
        }
      } else {
        console.error("Login failed with status:", response.status)
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم ")
      }
      throw new Error("حدث خطأ أثناء تسجيل الدخول")
    }
  }

  const logout = () => {
    localStorage.removeItem("jwt-token")
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
