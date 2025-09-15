"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Download, Filter, Search, Calendar, Users, BookOpen, User, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface AttendanceRecord {
  id: string
  status: "PRESENT" | "ABSENT" | "CANCELLED"
  createdAt: string
  student: {
    id: string
    name: string
    email: string
    year: string | null
    branch: string | null
  }
  class: {
    id: string
    subject: string
    year: string
    branch: string
    date: string
    status: string
    teacher: {
      name: string
      email: string
    }
    timeslot: {
      dayOfWeek: number
      startTime: string
      endTime: string
    }
  }
}

interface Summary {
  total: number
  present: number
  absent: number
  cancelled: number
}

interface Filters {
  students: Array<{
    id: string
    name: string
    year: string | null
    branch: string | null
  }>
  subjects: string[]
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function AttendanceRecords() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, present: 0, absent: 0, cancelled: 0 })
  const [filters, setFilters] = useState<Filters>({ students: [], subjects: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [recordToEdit, setRecordToEdit] = useState<AttendanceRecord | null>(null)
  const [newStatus, setNewStatus] = useState<"PRESENT" | "ABSENT" | "CANCELLED">("PRESENT")

  // Filter states
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchRecords()
  }, [selectedYear, selectedBranch, selectedSubject, selectedStudent, startDate, endDate])

  const fetchRecords = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const params = new URLSearchParams()
      if (selectedYear && selectedYear !== "all") params.append("year", selectedYear)
      if (selectedBranch && selectedBranch !== "all") params.append("branch", selectedBranch)
      if (selectedSubject && selectedSubject !== "all") params.append("subject", selectedSubject)
      if (selectedStudent && selectedStudent !== "all") params.append("studentId", selectedStudent)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`/api/admin/attendance-records?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecords(data.records)
        setSummary(data.summary)
        setFilters(data.filters)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch records")
      }
    } catch (err) {
      setError("An error occurred while fetching records")
      console.error("Error fetching records:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "json") => {
    try {
      const params = new URLSearchParams()
      if (selectedYear && selectedYear !== "all") params.append("year", selectedYear)
      if (selectedBranch && selectedBranch !== "all") params.append("branch", selectedBranch)
      if (selectedSubject && selectedSubject !== "all") params.append("subject", selectedSubject)
      if (selectedStudent && selectedStudent !== "all") params.append("studentId", selectedStudent)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      params.append("format", format)

      const response = await fetch(`/api/admin/export-attendance?${params}`)
      
      if (response.ok) {
        if (format === "csv") {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Export failed")
      }
    } catch (err) {
      setError("An error occurred during export")
      console.error("Export error:", err)
    }
  }

  const clearFilters = () => {
    setSelectedYear("all")
    setSelectedBranch("all")
    setSelectedSubject("all")
    setSelectedStudent("all")
    setStartDate("")
    setEndDate("")
  }

  const handleEditAttendance = async () => {
    if (!recordToEdit) return

    try {
      const response = await fetch(`/api/admin/attendance/${recordToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSuccess("Attendance status updated successfully")
        setEditDialogOpen(false)
        setRecordToEdit(null)
        fetchRecords()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Update failed")
      }
    } catch (err) {
      setError("An error occurred while updating attendance")
      console.error("Update error:", err)
    }
  }

  const handleDeleteAttendance = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) return

    try {
      const response = await fetch(`/api/admin/attendance/${recordId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Attendance record deleted successfully")
        fetchRecords()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Delete failed")
      }
    } catch (err) {
      setError("An error occurred while deleting attendance")
      console.error("Delete error:", err)
    }
  }

  const openEditDialog = (record: AttendanceRecord) => {
    setRecordToEdit(record)
    setNewStatus(record.status)
    setEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case "ABSENT":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          title="Attendance Records" 
          subtitle="View and export all attendance data with advanced filtering" 
        />

        <main className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Records</p>
                    <p className="text-2xl font-bold">{summary.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Present</p>
                    <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-600">{summary.cancelled}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All years</SelectItem>
                      <SelectItem value="1st">1st Year</SelectItem>
                      <SelectItem value="2nd">2nd Year</SelectItem>
                      <SelectItem value="3rd">3rd Year</SelectItem>
                      <SelectItem value="4th">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="All branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All branches</SelectItem>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="EC">EC</SelectItem>
                      <SelectItem value="ME">ME</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {filters.subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="All students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All students</SelectItem>
                      {filters.students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.year} {student.branch})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={fetchRecords}>
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={() => handleExport("csv")} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button onClick={() => handleExport("json")} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Export will include all records matching the current filters
              </p>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading records...</p>
              ) : records.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No records found matching the current filters</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Class Status</TableHead>
                        <TableHead>Marked At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {record.student.year} {record.student.branch}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              {record.class.subject}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {record.class.teacher.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {format(new Date(record.class.date), "MMM dd, yyyy")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {DAYS[record.class.timeslot.dayOfWeek]} • {record.class.timeslot.startTime} - {record.class.timeslot.endTime}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.class.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(record.createdAt), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(record)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAttendance(record.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Attendance Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Attendance Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {recordToEdit && (
                  <div className="space-y-2">
                    <p><strong>Student:</strong> {recordToEdit.student.name}</p>
                    <p><strong>Subject:</strong> {recordToEdit.class.subject}</p>
                    <p><strong>Date:</strong> {format(new Date(recordToEdit.class.date), "MMM dd, yyyy")}</p>
                    <p><strong>Current Status:</strong> {recordToEdit.status}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="status">New Status</Label>
                  <Select value={newStatus} onValueChange={(value: "PRESENT" | "ABSENT" | "CANCELLED") => setNewStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">Present</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditAttendance}>
                    Update Status
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AuthGuard>
  )
}
