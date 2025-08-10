"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  type StudentDetailsData, // Changed from Student
  type StudentExamHistory,
  fetchStudentExamHistory,
  fetchStudentDetailsByCode, // New function for fetching details
  type UpdateStudentRequest,
  API_BASE_URL,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Edit, Trash2 } from 'lucide-react'
import { useCities } from "@/hooks/use-cities"

export default function StudentDetailsPage() {
  const params = useParams()
  const studentCode = typeof params.code === 'string' ? Number.parseInt(params.code) : undefined

  const { cities, loading: citiesLoading, error: citiesError } = useCities(API_BASE_URL)

  const [studentDetails, setStudentDetails] = useState<StudentDetailsData | null>(null) // Changed type
  const [examHistory, setExamHistory] = useState<StudentExamHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [editForm, setEditForm] = useState<UpdateStudentRequest>({
    code: 0,
    name: "",
    nationalId: "",
    city: "",
  })

  useEffect(() => {
    if (studentCode) {
      fetchDetailsAndHistory(studentCode)
    } else {
      setError("رمز الطالب غير صالح.")
      setIsLoading(false)
    }
  }, [studentCode])

  const fetchDetailsAndHistory = async (code: number) => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch student details using the new dedicated API
      const fetchedStudent = await fetchStudentDetailsByCode(code)
      setStudentDetails(fetchedStudent)
      setEditForm({
        code: fetchedStudent.code,
        name: fetchedStudent.name,
        nationalId: fetchedStudent.nationalId,
        city: fetchedStudent.city,
      })

      // Fetch exam history
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
        fetchDetailsAndHistory(studentCode) // Re-fetch to update displayed details
      }
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

  const handleDelete = async () => {
    if (!studentDetails) return;

    setIsDeleting(true)
    try {
      await deleteStudent(studentDetails.code)

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف الطالب ${studentDetails.name} بنجاح`,
      })

      // Redirect to students list after successful deletion
      window.location.href = "/students"
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

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex items-center justify-center">
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
        <div className="min-h-screen flex items-center justify-center">
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>لم يتم العثور على الطالب.</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900"> {studentDetails.name}</h1>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Edit className="h-4 w-4" />
              <span className="mr-2">تعديل</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="mr-2">حذف</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من حذف الطالب "{studentDetails.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
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

        <Card>
          <CardHeader>
            <CardTitle>معلومات الطالب</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">الاسم:</p>
              <p className="font-medium">{studentDetails.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الكود:</p>
              <p className="font-medium">{studentDetails.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">المدينة:</p>
              <p className="font-medium">{studentDetails.city}</p>
            </div>        
            <div>
              <p className="text-sm text-gray-500">الرقم القومي:</p>
              <p className="font-medium">{studentDetails.nationalId}</p>
            </div>
            {/* Level and Year are no longer displayed here as they are not returned by the new API */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تاريخ الامتحانات</CardTitle>
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
                        <TableCell>{history.year}</TableCell>
                        <TableCell>{history.level}</TableCell>
                        <TableCell>
                          <Badge className={getResultBadgeColor(history.result)}>
                            {history.result}
                          </Badge>
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
        <DialogContent className="max-w-md">
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
            {/* Level and Year fields removed from edit form */}
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
    </ProtectedLayout>
  )
}
