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
        setError("كود الطالب غير صالح.")
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
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 5mm;
          }
          
          header, nav, .print\\:hidden { 
            display: none !important; 
          }
          
          .grecaptcha-badge,
          iframe[src*="recaptcha"],
          div[class*="recaptcha"],
          #recaptcha-container,
          [data-sitekey] {
            display: none !important;
            visibility: hidden !important;
          }
          
          div[style*="position: fixed"],
          div[style*="position: absolute"][style*="bottom"],
          div[style*="z-index"] {
            display: none !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .shadow, .shadow-md, .shadow-lg {
            box-shadow: none !important;
          }
          
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .print-card {
            border: none !important;
            box-shadow: none !important;
          }
          
          .print-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 8px 16px !important;
          }
          
          .print-logo {
            width: 77px !important;
            height: 77px !important;
          }
          
          .print-title {
            font-size: 20px !important;
            font-weight: bold !important;
          }
          
          .print-subtitle {
            font-size: 14px !important;
          }
          
          .section-title {
            font-size: 16px !important;
            margin-bottom: 8px !important;
          }
          
          .info-label {
            font-size: 12px !important;
          }
          
          .info-value {
            font-size: 14px !important;
          }
          
          .print-table {
            font-size: 13px !important;
          }
          
          .space-compact {
            margin-top: 12px !important;
            margin-bottom: 12px !important;
          }
          
          .grid-compact {
            gap: 8px !important;
          }
          
          .border-item {
            padding: 8px !important;
          }
        }
        
        header, nav { 
          display: none !important; 
        }
      `}</style>
      <main className="max-w-3xl mx-auto p-4 print:max-w-none print:p-0 print-container">
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

        <Card className="shadow print:shadow-none print-card">
          <CardHeader className="text-center pb-3 print:pb-2 print-header">
            <img src="/logo.png" alt="Logo" className="hidden print:block print-logo" />
            <div className="flex-1">
              <CardTitle className="text-xl font-bold print-title">مسابقة أهل القرآن</CardTitle>
              <p className="text-gray-500 text-base print-subtitle mt-0.5">أهل القرآن</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 print:space-y-3">
            <section>
              <h2 className="font-semibold text-xl mb-2 print:mb-1.5">بيانات الطالب</h2>
              <div className="grid grid-cols-2 gap-2 print:gap-1.5">
                <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                  <div className="text-lg text-gray-500 mb-0.5 ">الاسم</div>
                  <div className=" text-xl ">{student.name}</div>
                </div>
                <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                  <div className="text-lg text-gray-500 mb-0.5 ">الكود</div>
                  <div className=" text-xl ">{student.code}</div>
                </div>
                <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                  <div className="text-lg text-gray-500 mb-0.5 ">المدينة</div>
                  <div className="text-xl ">{student.city}</div>
                </div>
                <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                  <div className="text-lg text-gray-500 mb-0.5 ">الرقم القومي</div>
                  <div className="text-xl ">{student.nationalId}</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-semibold text-xl mb-2 print:mb-1.5">بيانات الاختبار</h2>
              {firstHistory ? (
                <div className="space-y-3 print:space-y-2">
                  <div className="grid grid-cols-2 gap-2 print:gap-1.5">
                    <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                      <div className="text-lg text-gray-500 mb-0.5 ">المستوى</div>
                      <div className="text-xl ">{firstHistory.level}</div>
                    </div>
                    <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                      <div className="text-lg text-gray-500 mb-0.5 ">السنة</div>
                      <div className="text-xl ">{firstHistory.year}</div>
                    </div>
                  </div>

                  {/* Scoring Table – EXACT match to provided image */}
                  <div className="mt-2">
                    <h3 className="font-semibold mb-1.5 text-xl print:mb-1">
                      جدول الدرجات
                    </h3>

                    <table className="w-full border-2 border-black text-sm ">
                      <thead>
                        <tr>
                          <th className="border-2 border-black text-center py-1 w-1/6">
                            السؤال
                          </th>
                          <th className="border-2 border-black text-center py-1 w-2/6">
                            الدرجة
                          </th>
                          <th className="border-2 border-black text-center py-1 w-1/6">
                            السؤال
                          </th>
                          <th className="border-2 border-black text-center py-1 w-2/6">
                            الدرجة
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {[
                          ["السؤال السادس", "السؤال الأول"],
                          ["السؤال السابع", "السؤال الثاني"],
                          ["السؤال الثامن", "السؤال الثالث"],
                          ["السؤال التاسع", "السؤال الرابع"],
                          ["السؤال العاشر", "السؤال الخامس"],
                        ].map(([rightQ, leftQ], i) => (
                          <tr key={i}>
                            {/* Left block (6–10) */}
                            <td className="border-2 border-black text-center py-1">{leftQ}</td>
                            <td className="border-2 border-black text-center py-1">
                              &nbsp;
                            </td>

                            {/* Right block (1–5) */}
                            <td className="border-2 border-black text-center py-1">{rightQ}</td>
                            <td className="border-2 border-black text-center py-1">
                              &nbsp;
                            </td>
                          </tr>
                        ))}

                        {/* Total row */}
                        <tr>
                          <td
                            colSpan={1}
                            className="border-2 border-black text-center font-bold py-1"
                          >
                            المجموع الكلي
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              ) : (
                <div className="text-gray-600 text-sm">لا يوجد سجل امتحان لعرضه.</div>
              )}
            </section>

            <div className="border-b-2 border-dashed border-gray-400 pt-6 print:mt-5"></div>

            <section>
              <h2 className="font-semibold text-xl mb-2 print:mb-1.5 print:mt-10">نسخة الطالب</h2>
              {firstHistory ? (
                <div className="grid grid-cols-2 gap-2 print:gap-1.5">
                  <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                    <div className="text-lg text-gray-500 mb-0.5">الاسم</div>
                    <div className="text-xl">{student.name}</div>
                  </div>
                  <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                    <div className="text-lg text-gray-500 mb-0.5">الكود</div>
                    <div className=" text-xl">{student.code}</div>
                  </div>
                  <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                    <div className="text-lg text-gray-500 mb-0.5 ">المستوى</div>
                    <div className=" text-xl ">{firstHistory.level}</div>
                  </div>
                  <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                    <div className="text-lg text-gray-500 mb-0.5 ">المدينة</div>
                    <div className=" text-xl">{student.city}</div>
                  </div>
                  <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                    <div className="text-lg text-gray-500 mb-0.5 ">التاريخ</div>
                    <div className=" text-xl ">-</div>
                  </div>
                  <div className="border rounded p-2 print:p-1.5 print:border-gray-700">
                    <div className="text-lg text-gray-500 mb-0.5 ">رقم المسلسل</div>
                    <div className=" text-xl ">-</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 text-xl">لا يوجد سجل امتحان لعرضه.</div>
              )}
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}