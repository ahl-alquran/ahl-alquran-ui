export const API_BASE_URL = "http://localhost:8080"

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
      throw new Error(`خطأ في الخادم: ${response.status}`)
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
  level: string
  year: number
}

export interface UpdateStudentRequest {
  code: number
  name: string
  nationalId: string
  city: string
  level: string
  year: number
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
