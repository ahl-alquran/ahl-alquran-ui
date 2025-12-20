"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut, Users, BarChart3, UserCog, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAdmin = user?.authorities?.includes("ADMIN")
  const isTester = user?.authorities?.includes("TESTER")

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {!isTester && (
              <Link
                href="/dashboard"
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/dashboard" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>لوحة التحكم</span>
              </Link>
            )}

            {!isTester && (
              <Link
                href="/students"
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/students" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>الطلاب</span>
              </Link>
            )}

            {isTester && (
              <Link
                href="/tester-results"
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/tester-results" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>النتائج</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/users"
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/users" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <UserCog className="h-4 w-4" />
                <span>المستخدمون</span>
              </Link>
            )}

            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-700">
              <span>مرحباً، {user?.name || user?.username}</span>
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="p-2">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {!isTester && (
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium w-full ${
                    pathname === "/dashboard" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>لوحة التحكم</span>
                </Link>
              )}

              {!isTester && (
                <Link
                  href="/students"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium w-full ${
                    pathname === "/students" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>الطلاب</span>
                </Link>
              )}

              {isTester && (
                <Link
                  href="/tester-results"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium w-full ${
                    pathname === "/tester-results" ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>النتائج</span>
                </Link>
              )}

              <div className="px-3 py-2 text-sm text-gray-700 border-t mt-2 pt-2">
                <span>مرحباً، {user?.name || user?.username}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  closeMobileMenu()
                }}
                className="flex items-center space-x-1 space-x-reverse bg-transparent w-full justify-start mx-3 mb-2"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
