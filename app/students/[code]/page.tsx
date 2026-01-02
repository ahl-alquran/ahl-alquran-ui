"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  deleteStudent,
  updateStudent,
  type StudentDetailsData,
  type StudentExamHistory,
  fetchStudentExamHistory,
  fetchStudentDetailsByCode,
  type UpdateStudentRequest,
  API_BASE_URL,
  registerStudentExam,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Edit, Trash2, Plus } from "lucide-react"
import { useCities } from "@/hooks/use-cities"
import { useLevels } from "@/hooks/use-levels"

export default function StudentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const studentCode = typeof params.code === "string" ? Number.parseInt(params.code) : undefined

  const { cities, loading: citiesLoading, error: citiesError } = useCities(API_BASE_URL)
  const { levels, loading: levelsLoading, error: levelsError } = useLevels(API_BASE_URL)

  const [studentDetails, setStudentDetails] = useState<StudentDetailsData | null>(null)
  const [examHistory, setExamHistory] = useState<StudentExamHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Register exam dialog state
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [isRegistering, setIsRegistering] = useState(false)

  const [editForm, setEditForm] = useState<UpdateStudentRequest>({
    code: 0,
    name: "",
    nationalId: "",
    city: "",
  })

  // Compute current Hijri-like year as used elsewhere in the project
  const currentYear = new Date().getFullYear()
  const hijriYear = currentYear - 579

  useEffect(() => {
    if (studentCode) {
      fetchDetailsAndHistory(studentCode)
    } else {
      setError("كود الطالب غير صالح.")
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentCode])

  const fetchDetailsAndHistory = async (code: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedStudent = await fetchStudentDetailsByCode(code)
      setStudentDetails(fetchedStudent)
      setEditForm({
        code: fetchedStudent.code,
        name: fetchedStudent.name,
        nationalId: fetchedStudent.nationalId,
        city: fetchedStudent.city,
      })

      const historyData = await fetchStudentExamHistory(code)
      setExamHistory(historyData)
    } catch (err: any) {
      console.error("Error fetching student details or history:", err)
      setError(err.message || "حدث خطأ أثناء جلب بيانات الطالب أو تاريخ الامتحانات.")
      setStudentDetails(null)
      setExamHistory([])
      toast({
        title: "خطأ في تحميل البيانات",
        description: err.message || "حدث خطأ أثناء جلب بيانات الطالب أو تاريخ الامتحانات.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshHistory = async (code: number) => {
    try {
      const historyData = await fetchStudentExamHistory(code)
      setExamHistory(historyData)
    } catch (err: any) {
      toast({
        title: "تعذر تحديث تاريخ الامتحانات",
        description: err.message || "حاول مرة أخرى لاحقًا.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = () => {
    if (studentDetails) {
      setEditForm({
        code: studentDetails.code,
        name: studentDetails.name,
        nationalId: studentDetails.nationalId,
        city: studentDetails.city,
      })
      setIsEditDialogOpen(true)
    }
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
      if (studentCode) {
        await fetchDetailsAndHistory(studentCode)
      }
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error?.message || "حدث خطأ أثناء تحديث بيانات الطالب",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!studentDetails) return

    setIsDeleting(true)
    try {
      await deleteStudent(studentDetails.code)

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف الطالب ${studentDetails.name} بنجاح`,
      })

      window.location.href = "/students"
    } catch (error: any) {
      toast({
        title: "خطأ في الحذف",
        description: error?.message || "حدث خطأ أثناء حذف الطالب",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRegisterExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentDetails) return
    if (!selectedLevel) {
      toast({
        title: "اختر المستوى",
        description: "يرجى اختيار المستوى قبل التسجيل.",
        variant: "destructive",
      })
      return
    }
    setIsRegistering(true)
    try {
      await registerStudentExam(studentDetails.code, selectedLevel, hijriYear)
      toast({
        title: "تم تسجيل الاختبار",
        description: `تم تسجيل اختبار للطالب ${studentDetails.name} في مستوى "${selectedLevel}" لسنة ${hijriYear}`,
      })
      setIsRegisterDialogOpen(false)
      setSelectedLevel("")
      await refreshHistory(studentDetails.code)
    } catch (error: any) {
      toast({
        title: "فشل تسجيل الاختبار",
        description: error?.message || "حدث خطأ أثناء تسجيل الاختبار.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const getResultBadgeColor = (result: number) => {
    if (result >= 95) return "bg-green-100 text-green-800"
    if (result >= 85) return "bg-emerald-100 text-emerald-800"
    if (result >= 75) return "bg-lime-100 text-lime-800"
    return "bg-orange-100 text-orange-800"
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">جاري تحميل بيانات الطالب...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (!studentDetails) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <p>لم يتم العثور على الطالب.</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{studentDetails.name}</h1>
            <p className="text-gray-600 text-sm sm:text-base">بيانات الطالب وتاريخ الامتحانات</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsRegisterDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              تسجيل اختبار
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              تعديل
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 sm:mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من حذف الطالب "{studentDetails.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "جاري الحذف..." : "حذف"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">معلومات الطالب</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">الاسم:</p>
              <p className="font-medium break-words">{studentDetails.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الكود:</p>
              <p className="font-medium">{studentDetails.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">المدينة:</p>
              <p className="font-medium break-words">{studentDetails.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الرقم القومي:</p>
              <p className="font-medium">{studentDetails.nationalId}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">تاريخ الامتحانات</CardTitle>
          </CardHeader>
          <CardContent>
            {examHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-4">لا يوجد تاريخ امتحانات لهذا الطالب.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">السنة</TableHead>
                      <TableHead className="text-right">المستوى</TableHead>
                      <TableHead className="text-right">النتيجة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examHistory.map((history, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{history.year}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={history.level}>
                            {history.level}
                          </div>
                        </TableCell>
                        <TableCell>
                          {history.result < 0 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (studentCode) {
                                  router.push(`/students/${studentCode}/print`)
                                }
                              }}
                              className="text-xs sm:text-sm whitespace-nowrap"
                              aria-label="طباعة الاستمارة"
                              title="طباعة الاستمارة"
                            >
                              طباعة الاستمارة
                            </Button>
                          ) : (
                            <Badge className={getResultBadgeColor(history.result)}>{history.result}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الطالب</DialogTitle>
            <DialogDescription>تعديل بيانات الطالب {studentDetails?.name}</DialogDescription>
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
            <div className="flex flex-col sm:flex-row gap-2">
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

      {/* Register Exam Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>تسجيل اختبار جديد</DialogTitle>
            <DialogDescription>اختر المستوى وسيتم استخدام سنة {hijriYear} تلقائيًا.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterExam} className="space-y-4">
            <div className="space-y-2">
              <Label>المستوى</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={levelsLoading || !!levelsError}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      levelsLoading ? "جاري تحميل المستويات..." : levelsError ? "تعذر تحميل المستويات" : "اختر المستوى"
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="flex-1" disabled={isRegistering || !selectedLevel}>
                {isRegistering ? "جاري التسجيل..." : "تسجيل"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsRegisterDialogOpen(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  )
}
