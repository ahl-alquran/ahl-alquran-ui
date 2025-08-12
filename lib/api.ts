// This file is included to ensure API_BASE_URL and apiRequest are available for useCities.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("jwt-token")

  const config: RequestInit = {
    ...options,
    mode: "cors", // Explicitly set CORS mode
    credentials: "omit", // Don't send credentials
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("jwt-token")
        window.location.href = "/login"
        throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى")
      }
      // Try to parse error body, otherwise show status
      let message = `خطأ في الخادم: ${response.status}`
      try {
        const err = await response.json()
        if (err?.message) message = err.message
      } catch {}
      throw new Error(message)
    }

    return response
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم")
    }
    throw error
  }
}

export interface Student {
  name: string
  code: number
  level: string
  result: number
  city: string
  year: number
  nationalId: string
}

// New interface for student details from /student/{code} endpoint
export interface StudentDetailsData {
  name: string
  code: number
  city: string
  nationalId: string
}

export interface StudentResponse {
  content: Student[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  first: boolean
  empty: boolean
}

export interface RegisterStudentRequest {
  name: string
  nationalId: string
  city: string
}

export interface UpdateStudentRequest {
  code: number
  name: string
  nationalId: string
  city: string
}

// New interfaces for User Management
export interface User {
  name: string
  username: string
  mobileNumber: string // Matches the /user/list response
  email: string
  authorities: string[] // Already an array from auth-provider
}

export interface RegisterUserRequest {
  name: string
  email: string
  mobile: string // Matches the /user/add request body
  username: string
  password: string
  role: "ADMIN" | "USER" // Specific roles
}

// New API functions for User Management
export async function fetchUsers(): Promise<User[]> {
  const response = await apiRequest("/user/list")
  return await response.json()
}

export async function addUser(user: RegisterUserRequest): Promise<void> {
  await apiRequest("/user/add", {
    method: "POST",
    body: JSON.stringify(user),
  })
}

export async function deleteUser(username: string): Promise<void> {
  await apiRequest(`/user/delete?username=${username}`, {
    method: "DELETE",
  })
}

// Delete student
export async function deleteStudent(studentCode: number): Promise<string> {
  const response = await apiRequest(`/student?code=${studentCode}`, {
    method: "DELETE",
  })
  return await response.text()
}

// Update student
export async function updateStudent(student: UpdateStudentRequest): Promise<void> {
  await apiRequest("/student/update", {
    method: "POST",
    body: JSON.stringify(student),
  })
}

// New interface for student count by level
export interface LevelStudentCount {
  levelName: string
  studentCount: number
}

// New API function to fetch student count by level
export async function fetchStudentCountByLevel(year: number): Promise<LevelStudentCount[]> {
  const response = await apiRequest(`/report/count/student-by-level/${year}`)
  return await response.json()
}

// New API function to download Excel report for a specific level
export async function downloadExcelReport(level: string, year: number): Promise<Blob> {
  const encodedLevel = encodeURIComponent(level)
  const response = await apiRequest(`/report/excel?level=${encodedLevel}&year=${year}`)
  return await response.blob()
}

// New API function to download Excel report for all students in a year
export async function downloadAllStudentsExcelReport(year: number): Promise<Blob> {
  const response = await apiRequest(`/report/excel/all?year=${year}`)
  return await response.blob()
}

// Interface for public student result
export interface PublicStudentResult {
  name: string
  code: number
  level: string
  result: number
  city: string
  year: number
}

// New API function to fetch public student result
export async function fetchPublicStudentResult(
  code: string,
  year: number,
  recaptchaResponse: string,
): Promise<PublicStudentResult | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/public/result?code=${code}&year=${year}&recaptchaResponse=${recaptchaResponse}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `خطأ في الخادم: ${response.status}`)
    }

    const data = await response.json()
    if (data && Object.keys(data).length > 0) {
      return data as PublicStudentResult
    } else {
      return null
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم")
    }
    throw error
  }
}

// New interface for student exam history
export interface StudentExamHistory {
  year: number
  level: string
  result: number
}

// New API function to fetch student exam history
export async function fetchStudentExamHistory(code: number): Promise<StudentExamHistory[]> {
  const response = await apiRequest(`/student/history?code=${code}`)
  return await response.json()
}

// New API function to fetch single student details by code
export async function fetchStudentDetailsByCode(code: number): Promise<StudentDetailsData> {
  const response = await apiRequest(`/student/${code}`)
  return await response.json()
}

// New API function to register a student's exam
export interface RegisterExamRequest {
  code: string
  level: string
  year: string
}

export async function registerStudentExam(code: number, level: string, year: number): Promise<void> {
  const payload: RegisterExamRequest = {
    code: String(code),
    level,
    year: String(year),
  }
  await apiRequest(`/student/exam/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
