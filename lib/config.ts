export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  isDevelopment: process.env.NODE_ENV === "development",
}

// Helper function to check if backend is running
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/health`, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    })
    return response.ok
  } catch {
    return false
  }
}
