import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "أهل القرآن - نظام إدارة الطلاب",
  description: "نظام إدارة طلاب أهل القرآن",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Google reCAPTCHA v3 script */}
        <script
          src={`https://www.google.com/recaptcha/enterprise.js?render=6LfkFpsrAAAAAF7pPzh0bVUYGJ4B8YSDLOgOXHh-`}
          async
          defer
        ></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
