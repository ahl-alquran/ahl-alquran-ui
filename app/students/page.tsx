"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { apiRequest, type Student, type StudentResponse, type RegisterStudentRequest } from "@/lib/api"
import { Search, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCities } from "@/hooks/use-cities"
import { useLevels } from "@/hooks/use-levels"
import { API_BASE_URL } from "@/lib/api"

export default function StudentsPage() {
  const router = useRouter()
  const { cities, loading: citiesLoading, error: citiesError } = useCities(API_BASE_URL)
  const { levels, loading: levelsLoading, error: levelsError } = useLevels(API_BASE_URL)

  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("1446")
  const [sortBy, setSortBy] = useState<"code" | "name">("code")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const { toast } = useToast()

  const [registerForm, setRegisterForm] = useState<RegisterStudentRequest>({
    name: "",
    nationalId: "",
    city: "",
  })

  const pageSize = 10
  const currentYear = new Date().getFullYear()
  const hijriYear = currentYear - 578
  const years = Array.from({ length: 5 }, (_, i) => hijriYear - i)

  useEffect(() => {
    fetchStudents()
  }, [currentPage, searchTerm, sortBy])

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      let endpoint = `/student/list?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&direction=ASC`

      if (searchTerm.trim()) {
        endpoint = `/student/search?search=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&direction=DESC`
      }

      const response = await apiRequest(endpoint)
      const data: StudentResponse = await response.json()

      setStudents(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل قائمة الطلاب",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    fetchStudents()
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)

    try {
      await apiRequest("/student/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      })

      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيل الطالب بنجاح",
      })

      setIsRegisterDialogOpen(false)
      setRegisterForm({
        name: "",
        nationalId: "",
        city: "",
      })
      fetchStudents()
    } catch (error) {
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ أثناء تسجيل الطالب",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
            <p className="text-gray-600 text-sm sm:text-base">قائمة الطلاب المسجلين</p>
          </div>

          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto">
                <UserPlus className="h-4 w-4" />
                <span>تسجيل طالب جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle>تسجيل طالب جديد</DialogTitle>
                <DialogDescription>أدخل بيانات الطالب الجديد</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">الرقم القومي</Label>
                  <Input
                    id="nationalId"
                    value={registerForm.nationalId}
                    onChange={(e) => setRegisterForm({ ...registerForm, nationalId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                  <Select
                    value={registerForm.city}
                    onValueChange={(value) => setRegisterForm({ ...registerForm, city: value })}
                  >
                    <SelectTrigger disabled={citiesLoading || !!citiesError}>
                      <SelectValue
                        placeholder={
                          citiesLoading ? "جاري تحميل المدن..." : citiesError ? "خطأ في تحميل المدن" : "اختر المدينة"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isRegistering}>
                  {isRegistering ? "جاري التسجيل..." : "تسجيل الطالب"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">البحث والتصفية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث عن طالب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={sortBy} onValueChange={(value: "code" | "name") => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="الترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code">الكود</SelectItem>
                    <SelectItem value="name">الاسم</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} className="w-full sm:w-auto">
                  بحث
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              قائمة الطلاب ({totalElements.toLocaleString("ar-EG")} طالب)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد نتائج</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {students.map((student) => (
                  <div
                    key={student.code}
                    className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/students/${student.code}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{student.name}</h3>
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                          <span>الكود: {student.code}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 truncate">{student.level}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  صفحة {currentPage + 1} من {totalPages}
                </div>
                <div className="flex space-x-2 space-x-reverse order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="hidden sm:inline">السابق</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">التالي</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
