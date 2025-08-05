export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  isDevelopment: process.env.NODE_ENV === "development",
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LfkFpsrAAAAAF7pPzh0bVUYGJ4B8YSDLOgOXHh-", // Default value added
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
