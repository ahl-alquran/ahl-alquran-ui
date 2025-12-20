"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { fetchStudentResultForTester, updateStudentResult } from "@/lib/api"

// Interface for tester student result
interface TesterStudentResult {
  name: string
  code: number
  level: string
  result: number
  city: string
  year: number
}

export default function TesterResultsPage() {
  const [studentCode, setStudentCode] = useState("")
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined)
  const [result, setResult] = useState<TesterStudentResult | null>(null)
  const [resultValue, setResultValue] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (!user.authorities?.includes("TESTER")) {
        router.push("/dashboard")
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
          variant: "destructive",
        })
      }
    }
  }, [user, isLoading, router, toast])

useEffect(() => {
  const currentYear = new Date().getFullYear()
  const hijriYear = currentYear - 578 // approximate Hijri year
  setSelectedYear(hijriYear.toString())
}, [])

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setResult(null)
      setResultValue("")

      if (!studentCode || !selectedYear) {
        toast({
          title: "خطأ",
          description: "الرجاء إدخال كود الطالب واختيار السنة.",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      try {
        const studentResult = await fetchStudentResultForTester(studentCode, Number.parseInt(selectedYear))

        if (studentResult) {
          setResult(studentResult)
          setResultValue(studentResult.result.toString())
          toast({
            title: "نجاح",
            description: "تم جلب النتائج بنجاح.",
          })
        } else {
          toast({
            title: "لا توجد نتائج",
            description: "لم يتم العثور على نتائج لهذا الطالب في السنة المحددة.",
            variant: "default",
          })
        }
      } catch (err: any) {
        console.error("Error fetching tester result:", err)
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

  const handleSave = useCallback(async () => {
    if (!result) return

    // Check constraint: can't change if result > 0
    if (result.result > 0) {
      toast({
        title: "غير مسموح",
        variant: "destructive",
      })
      return
    }

    const newResultValue = Number.parseInt(resultValue)
    if (isNaN(newResultValue) || newResultValue < 0) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال قيمة صحيحة للنتيجة.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await updateStudentResult(result.code, result.year, newResultValue)
      toast({
        title: "نجاح",
        description: "تم حفظ النتيجة بنجاح.",
      })
      // Update local state
      setResult({ ...result, result: newResultValue })
    } catch (err: any) {
      console.error("Error saving result:", err)
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء حفظ النتيجة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [result, resultValue, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!user || !user.authorities?.includes("TESTER")) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">نتائج الطلاب - المختبر</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentCode">كود الطالب</Label>
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
                <Label>السنة</Label>
                <Input value={`هـ ${selectedYear}`} disabled />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                "بحث"
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-center">تفاصيل الطالب</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">الاسم:</p>
                  <p className="font-medium">{result.name}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">الكود:</p>
                  <p className="font-medium">{result.code}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">المستوى:</p>
                  <p className="font-medium">{result.level}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">المدينة:</p>
                  <p className="font-medium">{result.city}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result">النتيجة</Label>
                  <Input
                    id="result"
                    type="number"
                    min="0"
                    value={resultValue}
                    onChange={(e) => setResultValue(e.target.value)}
                    disabled={result.result > 0 || saving}
                    placeholder="أدخل النتيجة"
                  />
                  {result.result > 0 && (
                    <p className="text-xs text-amber-600">لا يمكنك تغيير النتيجة</p>
                  )}
                </div>
                <Button onClick={handleSave} className="w-full" disabled={saving || result.result > 0}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ النتيجة"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
