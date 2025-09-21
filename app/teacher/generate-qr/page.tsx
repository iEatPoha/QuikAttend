"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

export default function GenerateQR() {
  const { user } = useAuth()
  const [subject, setSubject] = useState("")
  const [year, setYear] = useState("")
  const [branch, setBranch] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [classId, setClassId] = useState("")
  const [attendanceCount, setAttendanceCount] = useState({ present: 0, total: 0 })
  const [error, setError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isQRActive, setIsQRActive] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isQRActive && classId) {
      // Update live count every 5 seconds
      interval = setInterval(() => {
        fetchAttendanceCount()
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isQRActive, classId])

  const fetchAttendanceCount = async () => {
    if (!classId) return

    try {
      const response = await fetch(`/api/teacher/attendance-count/${classId}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceCount(data)
      }
    } catch (error) {
      console.error("Error fetching attendance count:", error)
    }
  }

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/teacher/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user?.id,
          subject,
          year,
          branch,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code")
      }

      setQrCode(data.qrCode)
      setClassId(data.classId)
      setIsQRActive(true)
      setAttendanceCount({ present: 0, total: data.totalStudents })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStopQR = async () => {
    if (!classId) return

    try {
      const response = await fetch(`/api/teacher/stop-qr/${classId}`, {
        method: "POST",
      })

      if (response.ok) {
        setIsQRActive(false)
        // Fetch final attendance count
        await fetchAttendanceCount()
      } else {
        setError("Failed to stop QR code")
      }
    } catch (err) {
      setError("Error stopping QR code")
    }
  }

  return (
    <AuthGuard allowedRoles={["TEACHER"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Generate QR Code" subtitle="Create QR codes for student attendance" />

        <main className="p-4 space-y-6">
          <Link href="/teacher">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {!qrCode ? (
            <Card>
              <CardHeader>
                <CardTitle>Class Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateQR} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={subject}
                      onValueChange={setSubject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math I">Math I</SelectItem>
                        <SelectItem value="Math II">Math II</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Engg Graphics">Engg Graphics</SelectItem>
                        <SelectItem value="Basic Electrical">Basic Electrical</SelectItem>
                        <SelectItem value="Basic Electronics">Basic Electronics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="EVS">EVS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={year}
                      onValueChange={setYear}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Year</SelectItem>
                        <SelectItem value="2nd">2nd Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                        <SelectItem value="4th">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      value={branch}
                      onValueChange={setBranch}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">CSE (Computer Science & Engineering)</SelectItem>
                        <SelectItem value="ECE">ECE (Electronics & Communication Engineering)</SelectItem>
                        <SelectItem value="EC">EC (Electronics Engineering)</SelectItem>
                        <SelectItem value="ME">ME (Mechanical Engineering)</SelectItem>
                        <SelectItem value="CE">CE (Civil Engineering)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate QR Code"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {subject} - {year} {branch}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {isQRActive ? (
                    <>
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg border shadow-lg">
                          <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="w-64 h-64" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">QR Code Active</div>
                        <p className="text-muted-foreground">Students can scan this QR code to mark their attendance</p>
                      </div>
                      <Alert>
                        <AlertDescription>
                          Click "Stop QR" when you want to end the attendance session.
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={handleStopQR} variant="destructive">
                          Stop QR
                        </Button>
                        <Link href="/teacher">
                          <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xl font-semibold text-muted-foreground">QR Code Stopped</div>
                      <div className="text-lg">
                        Final Attendance: <span className="font-bold text-primary">{attendanceCount.present}</span>/
                        <span className="font-bold">{attendanceCount.total}</span> students present
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Attendance session has been completed.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={() => {
                          setQrCode("")
                          setClassId("")
                          setIsQRActive(false)
                          setAttendanceCount({ present: 0, total: 0 })
                        }}>
                          Generate New QR
                        </Button>
                        <Link href="/teacher">
                          <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {isQRActive && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Live Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-green-600">{attendanceCount.present}</div>
                      <div className="text-lg text-muted-foreground">
                        out of {attendanceCount.total} students marked present
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${attendanceCount.total > 0 ? (attendanceCount.present / attendanceCount.total) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {attendanceCount.total > 0
                          ? `${Math.round((attendanceCount.present / attendanceCount.total) * 100)}% attendance`
                          : "No students enrolled"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
