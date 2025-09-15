"use client"

import { useState, useEffect, useRef } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Camera, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Html5QrcodeScanner } from "html5-qrcode"

export default function ScanQR() {
  const { user } = useAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)
  const [error, setError] = useState("")
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup scanner when component unmounts
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setError("")
      setIsScanning(true)
      
      // Check for HTTPS requirement on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      
      if (isMobile && !isLocalhost && location.protocol !== 'https:') {
        setError("📱 Mobile devices require HTTPS for camera access. Please use manual input or access via HTTPS.")
        setIsScanning(false)
        return
      }
      
      // Clear any existing scanner
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
      
      if (scannerElementRef.current) {
        scannerElementRef.current.innerHTML = ""
      }

      // Wait for the DOM element to be available
      setTimeout(() => {
        const qrReaderElement = document.getElementById("qr-reader")
        if (!qrReaderElement) {
          setError("QR scanner element not found. Please try again.")
          setIsScanning(false)
          return
        }

        // Create new scanner with mobile-optimized settings
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          {
            qrbox: isMobile ? { width: 200, height: 200 } : { width: 250, height: 250 },
            fps: isMobile ? 10 : 5,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2,
            useBarCodeDetectorIfSupported: true,
          },
          false
        )

        try {
          scannerRef.current.render(
            (decodedText) => {
              // QR code scanned successfully
              handleQRScan(decodedText)
            },
            (error) => {
              // Scanning error (usually just no QR code in view)
              // Don't show error for normal scanning behavior
              console.log("QR scan error (normal):", error)
            }
          )
        } catch (error: any) {
          console.error("Scanner render error:", error)
          
          // Provide more specific error messages
          if (error.name === 'NotAllowedError') {
            setError("📷 Camera permission denied. Please allow camera access and try again.")
          } else if (error.name === 'NotFoundError') {
            setError("📷 No camera found. Please check your device has a camera.")
          } else if (error.name === 'NotSupportedError') {
            setError("📷 Camera not supported. Please use manual input.")
          } else if (isMobile && !isLocalhost && location.protocol !== 'https:') {
            setError("📱 Mobile devices require HTTPS for camera access. Please use manual input or access via HTTPS.")
          } else {
            setError("📷 Failed to initialize camera. Please check permissions or use manual input.")
          }
          setIsScanning(false)
        }
      }, 100) // Small delay to ensure DOM is updated
    } catch (err) {
      setError("📷 Unable to access camera. Please check permissions or use manual input.")
      console.error("Camera error:", err)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleQRScan = async (qrData: string) => {
    try {
      // Stop scanning once we get a result
      stopCamera()

      const response = await fetch("/api/student/mark-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData,
          studentId: user?.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setScanResult({ success: true, message: data.message })
      } else {
        setScanResult({ success: false, message: data.error })
      }
    } catch (err) {
      setScanResult({ success: false, message: "Failed to mark attendance" })
    }
  }

  const handleManualInput = async () => {
    const qrData = prompt("Enter QR code data manually:")
    if (!qrData) return

    try {
      const response = await fetch("/api/student/mark-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData,
          studentId: user?.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setScanResult({ success: true, message: data.message })
      } else {
        setScanResult({ success: false, message: data.error })
      }
    } catch (err) {
      setScanResult({ success: false, message: "Failed to mark attendance" })
    }
  }

  return (
    <AuthGuard allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Scan QR Code" subtitle="Mark your attendance by scanning teacher's QR code" />

        <main className="p-4 space-y-6">
          <Link href="/student">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {scanResult ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  {scanResult.success ? (
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                  )}
                  <h2 className="text-xl font-semibold">{scanResult.success ? "Attendance Marked!" : "Scan Failed"}</h2>
                  <p className="text-muted-foreground">{scanResult.message}</p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setScanResult(null)}>Scan Another</Button>
                    <Link href="/student">
                      <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!isScanning ? (
                  <div className="text-center space-y-4">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Click the button below to start scanning</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📱 <strong>Mobile devices:</strong> Camera requires HTTPS or localhost</p>
                        <p>💻 <strong>Desktop:</strong> Allow camera permissions when prompted</p>
                        <p>🔧 <strong>Troubleshooting:</strong> If camera fails, use "Enter Code Manually"</p>
                        <p>⚠️ <strong>Network access:</strong> Use https://your-ip:3000 for mobile HTTPS</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button onClick={startCamera} className="w-full">
                        Start Camera
                      </Button>
                      <Button variant="outline" onClick={handleManualInput} className="w-full bg-transparent">
                        Enter Code Manually
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div ref={scannerElementRef} id="qr-reader" className="w-full max-w-md mx-auto"></div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={stopCamera}>
                        Stop Camera
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Position the QR code within the frame to scan automatically
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
