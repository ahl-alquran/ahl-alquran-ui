"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  apiRequest,
  deleteStudent,
  updateStudent,
  type Student,
  type StudentResponse,
  type RegisterStudentRequest,
  type UpdateStudentRequest,
} from "@/lib/api"
import { Search, UserPlus, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("1446")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const { toast } = useToast()

  const [registerForm, setRegisterForm] = useState<RegisterStudentRequest>({
    name: "",
    nationalId: "",
    city: "",
    level: "",
    year: Number.parseInt(selectedYear),
  })

  const [editForm, setEditForm] = useState<UpdateStudentRequest>({
    code: 0,
    name: "",
    nationalId: "",
    city: "",
    level: "",
    year: Number.parseInt(selectedYear),
  })

  const pageSize = 10
  const currentYear = new Date().getFullYear();
  const hijriYear = currentYear - 578;
  const years = Array.from({ length: 5 }, (_, i) => hijriYear - i);

  const levels = [
    "المستوى الأول القرآن الكريم كاملاً",
    "المستوى الثاني عشرون جزءً",
    "المستوى الثالث نصف القرآن الكريم",
    "المستوى الرابع ثمانية أجزاء",
    "المستوى الخامس ربع القرآن الكريم",
    "المستوى السادس خمسة أجزاء",
    "المستوى السابع ثلاثة أجزاء",
    "المستوى الثامن جزءان",
    "المستوى التاسع جزء واحد",
  ]

  const cities = ["بني بخيت", "عمر باشا", "المنيا", "أسيوط", "سوهاج"]

  useEffect(() => {
    fetchStudents()
  }, [selectedYear, currentPage, searchTerm])

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      let endpoint = `/student/by-year?year=${selectedYear}&page=${currentPage}&size=${pageSize}&sortBy=result&direction=DESC`

      if (searchTerm.trim()) {
        endpoint = `/student/by-year/search?year=${selectedYear}&search=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=${pageSize}&sortBy=result&direction=DESC`
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

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setEditForm({
      code: student.code,
      name: student.name,
      nationalId: "", // This would need to be included in the Student interface if available
      city: student.city,
      level: student.level,
      year: student.year,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      await updateStudent(editForm)

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الطالب بنجاح",
      })

      setIsEditDialogOpen(false)
      setSelectedStudent(null)
      fetchStudents()
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث بيانات الطالب",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (studentCode: number, studentName: string) => {
    setIsDeleting(true)

    try {
      const result = await deleteStudent(studentCode)

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف الطالب ${studentName} بنجاح`,
      })

      fetchStudents()
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الطالب",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getResultBadgeColor = (result: number) => {
    if (result >= 95) return "bg-green-100 text-green-800"
    if (result >= 85) return "bg-emerald-100 text-emerald-800"
    if (result >= 75) return "bg-lime-100 text-lime-800"
    return "bg-orange-100 text-orange-800"
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
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
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
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الطالب</DialogTitle>
              <DialogDescription>تعديل بيانات الطالب {selectedStudent?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">الاسم</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nationalId">الرقم القومي</Label>
                <Input
                  id="edit-nationalId"
                  value={editForm.nationalId}
                  onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">المدينة</Label>
                <Select value={editForm.city} onValueChange={(value) => setEditForm({ ...editForm, city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">المستوى</Label>
                <Select value={editForm.level} onValueChange={(value) => setEditForm({ ...editForm, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">السنة</Label>
                <Select
                  value={editForm.year.toString()}
                  onValueChange={(value) => setEditForm({ ...editForm, year: Number.parseInt(value) })}
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
              <div className="flex space-x-2 space-x-reverse">
                <Button type="submit" className="flex-1" disabled={isUpdating}>
                  {isUpdating ? "جاري التحديث..." : "تحديث البيانات"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-32">
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
                  <div key={student.code} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span>الكود: {student.code}</span>
                          <span>•</span>
                          <span>المدينة: {student.city}</span>
                          <span>•</span>
                          <span>السنة: {student.year}</span>
                        </div>
                        <p className="text-sm text-gray-700">{student.level}</p>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge className={getResultBadgeColor(student.result)}>{student.result}%</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف الطالب "{student.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(student.code, student.name)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isDeleting}
                              >
                                {isDeleting ? "جاري الحذف..." : "حذف"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
