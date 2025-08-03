"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 space-x-reverse">
              <BookOpen className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">أهل القرآن</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/dashboard" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>لوحة التحكم</span>
            </Link>

            <Link
              href="/students"
              className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/students" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>الطلاب</span>
            </Link>

            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-700">
              <span>مرحباً، {user?.username}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-1 space-x-reverse bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
