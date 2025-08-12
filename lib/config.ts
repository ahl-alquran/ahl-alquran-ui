export const config = {
  isDevelopment: process.env.NODE_ENV === "development",
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LfkFpsrAAAAAF7pPzh0bVUYGJ4B8YSDLOgOXHh-", // Default value added
}
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";