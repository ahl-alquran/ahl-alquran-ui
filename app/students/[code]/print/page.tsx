"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  fetchStudentDetailsByCode,
  fetchStudentExamHistory,
  type StudentDetailsData,
  type StudentExamHistory,
} from "@/lib/api"
import { Loader2, ArrowRight, Printer } from "lucide-react"

export default function StudentPrintPage() {
  const params = useParams()
  const router = useRouter()
  const studentCode = typeof params.code === "string" ? Number.parseInt(params.code) : undefined

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<StudentDetailsData | null>(null)
  const [firstHistory, setFirstHistory] = useState<StudentExamHistory | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!studentCode) {
        setError("رمز الطالب غير صالح.")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const [details, history] = await Promise.all([
          fetchStudentDetailsByCode(studentCode),
          fetchStudentExamHistory(studentCode),
        ])
        setStudent(details)
        setFirstHistory(history && history.length > 0 ? history[0] : null)
      } catch (err: any) {
        setError(err?.message || "حدث خطأ أثناء تحميل بيانات الطباعة.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentCode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">جاري التحضير للطباعة...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-4 bg-white">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4">{error}</div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push(`/students/${studentCode}`)}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة لصفحة الطالب
          </Button>
        </div>
      </main>
    )
  }

  if (!student) {
    return (
      <main className="max-w-3xl mx-auto p-4 bg-white">
        <div className="text-gray-600">لم يتم العثور على بيانات الطالب.</div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push(`/students/${studentCode}`)}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة لصفحة الطالب
          </Button>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Local style to ensure any global nav/header is hidden on this route just in case */}
            <style jsx global>{`
        @media print {
          /* Hide navigation, headers, and other UI elements */
          header, nav, .print\\:hidden { 
            display: none !important; 
          }
          
          /* Hide reCAPTCHA elements */
          .grecaptcha-badge,
          iframe[src*="recaptcha"],
          div[class*="recaptcha"],
          #recaptcha-container,
          [data-sitekey] {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Hide any floating elements that might interfere */
          div[style*="position: fixed"],
          div[style*="position: absolute"][style*="bottom"],
          div[style*="z-index"] {
            display: none !important;
          }
          
          /* Ensure clean print layout */
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Remove shadows and borders for cleaner print */
          .shadow, .shadow-md, .shadow-lg {
            box-shadow: none !important;
          }
        }
        
        /* Also hide during screen view for consistency */
        header, nav { 
          display: none !important; 
        }
      `}</style>

      <main className="max-w-3xl mx-auto p-4 print:max-w-none">
        {/* Controls (hidden in print) */}
        <div className="flex gap-2 justify-end mb-4 print:hidden">
          <Button variant="outline" onClick={() => router.push(`/students/${studentCode}`)}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
        </div>

        <Card className="shadow print:shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">مسابقة أهل القرآن</CardTitle>
            <p className="text-gray-600 mt-1">مسابقة أهل القرآن </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="font-semibold text-lg mb-3">بيانات الطالب</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">الاسم</div>
                  <div className="font-medium">{student.name}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">الكود</div>
                  <div className="font-medium">{student.code}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">المدينة</div>
                  <div className="font-medium">{student.city}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">الرقم القومي</div>
                  <div className="font-medium">{student.nationalId}</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">بيانات الاختبار</h2>
              {firstHistory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">المستوى</div>
                    <div className="font-medium">{firstHistory.level}</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">السنة</div>
                    <div className="font-medium">{firstHistory.year}</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">النتيجة</div>
                    <div className="font-medium">---------------</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">لا يوجد سجل امتحان لعرضه.</div>
              )}
            </section>

              <div className="border-b border-dashed pt-16">
                </div>

            <section>
              <h2 className="font-semibold text-lg mb-3">نسخة الطالب</h2>
              {firstHistory ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">الاسم</div>
                  <div className="font-medium">{student.name}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">الكود</div>
                  <div className="font-medium">{student.code}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">المستوى</div>
                  <div className="font-medium">{firstHistory.level}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">المدينة</div>
                  <div className="font-medium">{student.city}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">التاريخ</div>
                  <div className="font-medium">-</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">رقم المسلسل</div>
                  <div className="font-medium">-</div>
                </div>
              </div>
              ) : (
                <div className="text-gray-600">لا يوجد سجل امتحان لعرضه.</div>
              )}
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
