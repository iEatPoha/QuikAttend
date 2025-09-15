"use client"

import { useState, useEffect } from "react"
import { AuthGuard, useAuth } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface AttendanceRecord {
  id: string
  status: "PRESENT" | "ABSENT" | "CANCELLED"
  class: {
    subject: string
    date: string
    timeslot: {
      startTime: string
      endTime: string
    }
    teacher: {
      name: string
    }
  }
}

interface AttendanceStats {
  totalClasses: number
  presentCount: number
  absentCount: number
  cancelledCount: number
  attendancePercentage: number
}

export default function AttendanceHistory() {
  const { user } = useAuth()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceHistory()
  }, [])

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch(`/api/student/attendance-history?studentId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data.records)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case "PRESENT":
        return `${baseClasses} bg-green-100 text-green-800`
      case "ABSENT":
        return `${baseClasses} bg-red-100 text-red-800`
      case "CANCELLED":
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return baseClasses
    }
  }

  return (
    <AuthGuard allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Attendance History" subtitle="View your attendance records and statistics" />

        <main className="p-4 space-y-6">
          <Link href="/student">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Attendance Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalClasses}</div>
                    <p className="text-sm text-muted-foreground">Total Classes</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.presentCount}</div>
                    <p className="text-sm text-muted-foreground">Present</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.absentCount}</div>
                    <p className="text-sm text-muted-foreground">Absent</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.attendancePercentage.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Attendance</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading attendance history...</p>
              ) : attendanceRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.class.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {record.class.timeslot.startTime} - {record.class.timeslot.endTime}
                        </TableCell>
                        <TableCell>{record.class.subject}</TableCell>
                        <TableCell>{record.class.teacher.name}</TableCell>
                        <TableCell>
                          <span className={getStatusBadge(record.status)}>{record.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No attendance records found</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
