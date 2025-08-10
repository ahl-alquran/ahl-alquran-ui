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
import {
  apiRequest,
  type Student,
  type StudentResponse,
  type RegisterStudentRequest,
} from "@/lib/api"
import { Search, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'
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
    level: "",
    year: Number.parseInt(selectedYear),
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
        endpoint = `/student/search?search=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&direction=ASC`
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
        level: "",
        year: Number.parseInt(selectedYear),
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
            <p className="text-gray-600">قائمة الطلاب المسجلين</p>
          </div>

          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 space-x-reverse">
                <UserPlus className="h-4 w-4" />
                <span>تسجيل طالب جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                <div className="space-y-2">
                  <Label htmlFor="level">المستوى</Label>
                  <Select
                    value={registerForm.level}
                    onValueChange={(value) => setRegisterForm({ ...registerForm, level: value })}
                  >
                    <SelectTrigger disabled={levelsLoading || !!levelsError}>
                      <SelectValue
                        placeholder={
                          levelsLoading
                            ? "جاري تحميل المستويات..."
                            : levelsError
                              ? "خطأ في تحميل المستويات"
                              : "اختر المستوى"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.name} value={level.name}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">السنة</Label>
                  <Select
                    value={registerForm.year.toString()}
                    onValueChange={(value) => setRegisterForm({ ...registerForm, year: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
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
            <CardTitle>البحث والتصفية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
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
              <Select value={sortBy} onValueChange={(value: "code" | "name") => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="الترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code">الكود</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>بحث</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلاب ({totalElements.toLocaleString("ar-EG")} طالب)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد نتائج</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.code}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/students/${student.code}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span>الكود: {student.code}</span>
                        </div>
                        <p className="text-sm text-gray-700">{student.level}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  صفحة {currentPage + 1} من {totalPages}
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    التالي
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
