"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { config, checkBackendHealth } from "@/lib/config"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    const connected = await checkBackendHealth()
    setIsConnected(connected)
    setIsChecking(false)
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (isConnected === null) {
    return (
      <Alert>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>جاري فحص الاتصال بالخادم...</AlertDescription>
      </Alert>
    )
  }

  if (isConnected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">متصل بالخادم بنجاح ({config.apiBaseUrl})</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>لا يمكن الاتصال بالخادم ({config.apiBaseUrl})</span>
        <Button
          variant="outline"
          size="sm"
          onClick={checkConnection}
          disabled={isChecking}
          className="mr-2 bg-transparent"
        >
          {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : "إعادة المحاولة"}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
