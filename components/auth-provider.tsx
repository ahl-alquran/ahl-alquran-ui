"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  username: string
  authorities: string
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

  useEffect(() => {
    const token = localStorage.getItem("jwt-token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            username: payload.username,
            authorities: payload.authorities,
          })
        } else {
          localStorage.removeItem("jwt-token")
        }
      } catch (error) {
        localStorage.removeItem("jwt-token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8080/auth/apiLogin", {
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
          setUser({
            username: payload.username,
            authorities: payload.authorities,
          })
          return true
        }
      } else {
        console.error("Login failed with status:", response.status)
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم على المنفذ 8080")
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
