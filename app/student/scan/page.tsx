"use client"

import { useState, useEffect, useRef } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Camera, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Html5Qrcode, Html5QrcodeSupportedFormats, type Html5QrcodeCamera } from "html5-qrcode"

export default function ScanQR() {
  const { user } = useAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)
  const [error, setError] = useState("")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerElementRef = useRef<HTMLDivElement>(null)
  const [cameras, setCameras] = useState<Html5QrcodeCamera[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [isEnumerating, setIsEnumerating] = useState(false)
  const [torchAvailable, setTorchAvailable] = useState(false)
  const [torchOn, setTorchOn] = useState(false)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current = null
        })
      }
    }
  }, [])

  const enumerateCameras = async () => {
    try {
      setIsEnumerating(true)
      setError("")
      const devices = await Html5Qrcode.getCameras()
      setCameras(devices)
      const backCam = devices.find(d => /back|rear|environment/i.test(d.label))
      setSelectedCameraId((backCam ? backCam.id : devices[0]?.id) ?? null)
    } catch (e: any) {
      setError("Unable to list cameras. Check permissions.")
    } finally {
      setIsEnumerating(false)
    }
  }

  useEffect(() => {
    enumerateCameras()
  }, [])

  const startCamera = async (cameraId?: string) => {
    try {
      setError("")
      setIsScanning(true)
      // Ensure DOM updates so the scanner element exists
      await new Promise((r) => setTimeout(r, 50))
      
      // Check for HTTPS requirement on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      
      if (isMobile && !isLocalhost && location.protocol !== 'https:') {
        setError("📱 Mobile devices require HTTPS for camera access. Please use manual input or access via HTTPS.")
        setIsScanning(false)
        return
      }
      
      // Stop previous if any
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {})
        scannerRef.current = null
      }

      const elementId = "qr-reader"
      const element = document.getElementById(elementId)
      if (!element) {
        setError("QR scanner element not found. Please try again.")
        setIsScanning(false)
        return
      }

      const chosenId = cameraId ?? selectedCameraId ?? (cameras[0]?.id ?? null)
      if (!chosenId) {
        setError("No camera available.")
        setIsScanning(false)
        return
      }

      const qrbox = isMobile ? { width: 240, height: 240 } : { width: 300, height: 300 }
      const config = {
        fps: isMobile ? 10 : 6,
        qrbox,
        aspectRatio: 1.0,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      } as any

      const html5 = new Html5Qrcode(elementId)
      scannerRef.current = html5

      const onSuccess = (decodedText: string) => {
        handleQRScan(decodedText)
      }
      const onError = (_err: string) => {}

      try {
        await html5.start({ deviceId: { exact: chosenId } }, config, onSuccess, onError)
        setSelectedCameraId(chosenId)
        const capabilities = (await (html5 as any).getRunningTrackCameraCapabilities?.()) || {}
        setTorchAvailable(!!capabilities.torch)
        setTorchOn(false)
      } catch (error: any) {
        console.error("Scanner start error:", error)
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
    } catch (err) {
      setError("📷 Unable to access camera. Please check permissions or use manual input.")
      console.error("Camera error:", err)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {}).finally(() => {
        scannerRef.current = null
      })
    }
    setIsScanning(false)
  }

  const switchToCamera = async (id: string) => {
    await startCamera(id)
  }

  const toggleTorch = async () => {
    if (!scannerRef.current) return
    try {
      const newState = !torchOn
      await (scannerRef.current as any).applyVideoConstraints?.({ advanced: [{ torch: newState }] })
      setTorchOn(newState)
    } catch {}
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
                      <p className="text-muted-foreground">Select a camera, press Start, and point at the QR.</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Mobile requires HTTPS or localhost for camera access.</p>
                        <p>• Allow camera permission when prompted.</p>
                        <p>• If issues persist, use Enter Code Manually.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Select a camera and press Start.</div>
                      <div className="flex items-center gap-2">
                        <select
                          className="w-full border rounded-md bg-background p-2 text-sm"
                          value={selectedCameraId ?? ''}
                          onChange={(e) => setSelectedCameraId(e.target.value)}
                        >
                          {cameras.map(cam => (
                            <option key={cam.id} value={cam.id}>{cam.label || cam.id}</option>
                          ))}
                        </select>
                        <Button onClick={() => startCamera(selectedCameraId || undefined)} disabled={!selectedCameraId}>
                          Start
                        </Button>
                      </div>
                      <Button variant="outline" onClick={handleManualInput} className="w-full bg-transparent">
                        Enter Code Manually
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div ref={scannerElementRef} id="qr-reader" className="w-full max-w-md mx-auto"></div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded-md bg-background p-2 text-sm"
                          value={selectedCameraId ?? ''}
                          onChange={(e) => switchToCamera(e.target.value)}
                        >
                          {cameras.map(cam => (
                            <option key={cam.id} value={cam.id}>{cam.label || cam.id}</option>
                          ))}
                        </select>
                      </div>
                      {torchAvailable && (
                        <Button variant="outline" onClick={toggleTorch}>{torchOn ? 'Torch Off' : 'Torch On'}</Button>
                      )}
                      <Button variant="outline" onClick={stopCamera}>
                        Stop Camera
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Position the QR inside the frame. It will scan automatically.
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
