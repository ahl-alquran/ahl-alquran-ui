"use client"

import { useState, useEffect } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiRequest, fetchStudentCountByLevel, type LevelStudentCount } from "@/lib/api"
import { Users, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [studentsByYear, setStudentsByYear] = useState<number>(0)
  const [studentsByLevel, setStudentsByLevel] = useState<LevelStudentCount[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [isLoading, setIsLoading] = useState(true)
  const [isLevelsLoading, setIsLevelsLoading] = useState(true)
  const { toast } = useToast()

  const currentYear = new Date().getFullYear()
  const hijriYear = currentYear - 578
  const years = Array.from({ length: 5 }, (_, i) => hijriYear - i)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchStudentsByYear()
    fetchStudentsByLevelData()
  }, [selectedYear])

  const fetchDashboardData = async () => {
    try {
      const response = await apiRequest("/student/count")
      const count = await response.json()
      setTotalStudents(count)
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل إجمالي عدد الطلاب",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStudentsByYear = async () => {
    try {
      const response = await apiRequest(`/student/count/by-year/${selectedYear}`)
      const count = await response.json()
      setStudentsByYear(count)
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل عدد الطلاب للسنة المحددة",
        variant: "destructive",
      })
    }
  }

  const fetchStudentsByLevelData = async () => {
    setIsLevelsLoading(true)
    try {
      const data = await fetchStudentCountByLevel(Number.parseInt(selectedYear))
      setStudentsByLevel(data)
    } catch (error) {
      toast({
        title: "خطأ في تحميل بيانات المستويات",
        description: "حدث خطأ أثناء تحميل عدد الطلاب حسب المستوى",
        variant: "destructive",
      })
      setStudentsByLevel([])
    } finally {
      setIsLevelsLoading(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600">نظرة عامة على إحصائيات الطلاب</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">إجمالي عدد الطلاب</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                ) : (
                  totalStudents.toLocaleString("ar-EG")
                )}
              </div>
              <p className="text-xs text-muted-foreground">العدد الإجمالي للطلاب المسجلين</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">عدد الطلاب حسب السنة</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full">
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
                <div className="text-2xl font-bold">{studentsByYear.toLocaleString("ar-EG")}</div>
                <p className="text-xs text-muted-foreground">عدد الطلاب المسجلين في سنة {selectedYear}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Card for Students by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-700">
              عدد الطلاب حسب المستوى (سنة {selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLevelsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-6 w-full rounded"></div>
                ))}
              </div>
            ) : studentsByLevel.length === 0 ? (
              <div className="text-center text-gray-500">لا توجد بيانات للمستويات في هذه السنة.</div>
            ) : (
              <div className="space-y-2">
                {studentsByLevel.map((levelData) => (
                  <div
                    key={levelData.levelName}
                    className="flex justify-between items-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700 font-medium">{levelData.levelName}</span>
                    <span className="font-bold text-gray-900">{levelData.studentCount.toLocaleString("ar-EG")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
