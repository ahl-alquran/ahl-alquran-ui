"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchPublicStudentResult, type PublicStudentResult } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { config } from "@/lib/config" // Add this import

// Declare grecaptcha to avoid TypeScript errors
declare global {
  interface Window {
    grecaptcha: any
  }
}

export default function PublicResultsPage() {
  const [studentCode, setStudentCode] = useState("")
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined)
  const [result, setResult] = useState<PublicStudentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [years, setYears] = useState<number[]>([])
  const [recaptchaReady, setRecaptchaReady] = useState(false) // New state for reCAPTCHA readiness
  const { toast } = useToast()

  useEffect(() => {
    // Generate years for the select dropdown (e.g., current year and past 5 years)
    const currentYear = new Date().getFullYear()
    const hijriYear = currentYear - 578
    const generatedYears = Array.from({ length: 5 }, (_, i) => hijriYear - i)
    setYears(generatedYears)
    setSelectedYear(currentYear.toString()) // Set current year as default

    // Wait for reCAPTCHA to be ready
    if (typeof window.grecaptcha.enterprise !== "undefined" && window.grecaptcha.enterprise.ready) {
      window.grecaptcha.enterprise.ready(() => {
        setRecaptchaReady(true)
      })
    } else {
      // Fallback if grecaptcha is not immediately available (though layout.tsx should load it)
      const interval = setInterval(() => {
        if (typeof window.grecaptcha.enterprise !== "undefined" && window.grecaptcha.enterprise.ready) {
          window.grecaptcha.enterprise.ready(() => {
            setRecaptchaReady(true)
          })
          clearInterval(interval)
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setResult(null)

      if (!studentCode || !selectedYear) {
        toast({
          title: "خطأ",
          description: "الرجاء إدخال رمز الطالب واختيار السنة.",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      try {
        // reCAPTCHA readiness is now handled by the recaptchaReady state and button disabled prop
        const recaptchaResponse = await window.grecaptcha.enterprise.execute(config.recaptchaSiteKey, {
          // Use config.recaptchaSiteKey
          action: "submit",
        })

        const studentResult = await fetchPublicStudentResult(
          studentCode,
          Number.parseInt(selectedYear),
          recaptchaResponse,
        )

        if (studentResult) {
          setResult(studentResult)
          toast({
            title: "نجاح",
            description: "تم جلب النتائج بنجاح.",
          })
        } else {
          setError("لم يتم العثور على نتائج لهذا الطالب في السنة المحددة.")
          toast({
            title: "لا توجد نتائج",
            description: "لم يتم العثور على نتائج لهذا الطالب في السنة المحددة.",
            variant: "default",
          })
        }
      } catch (err: any) {
        console.error("Error fetching public result:", err)
        setError(err.message || "حدث خطأ أثناء جلب النتائج. الرجاء المحاولة مرة أخرى.")
        toast({
          title: "خطأ",
          description: err.message || "حدث خطأ أثناء جلب النتائج. الرجاء المحاولة مرة أخرى.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [studentCode, selectedYear, toast],
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">نتائج الطلاب</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentCode">رمز الطالب</Label>
              <Input
                id="studentCode"
                type="text"
                placeholder="أدخل رمز الطالب"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">السنة</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear} disabled={loading}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                        هـ {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !recaptchaReady}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                "عرض النتائج"
              )}
            </Button>
          </form>

          {!recaptchaReady && <div className="mt-4 text-center text-sm text-gray-500">جاري تحميل reCAPTCHA...</div>}

          {error && (
            <div className="mt-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-center">تفاصيل النتيجة</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الاسم:</p>
                  <p className="font-medium">{result.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الرمز:</p>
                  <p className="font-medium">{result.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">المستوى:</p>
                  <p className="font-medium">{result.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">النتيجة:</p>
                  <p className="font-medium">{result.result}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">المدينة:</p>
                  <p className="font-medium">{result.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">السنة:</p>
                  <p className="font-medium">{result.year}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
