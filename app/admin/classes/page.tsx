"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Trash2, Edit, Calendar, Users, BookOpen, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Class {
  id: string
  subject: string
  year: string
  branch: string
  date: string
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  teacher: {
    name: string
    email: string
  }
  timeslot: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }
  _count: {
    attendance: number
  }
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function ClassesManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [selectedYear, selectedBranch])

  const fetchClasses = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const params = new URLSearchParams()
      if (selectedYear && selectedYear !== "all") params.append("year", selectedYear)
      if (selectedBranch && selectedBranch !== "all") params.append("branch", selectedBranch)

      const response = await fetch(`/api/admin/classes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch classes")
      }
    } catch (err) {
      setError("An error occurred while fetching classes")
      console.error("Error fetching classes:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClass = async (classToDelete: Class) => {
    try {
      const response = await fetch(`/api/admin/classes/${classToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess(`Class "${classToDelete.subject}" and all related attendance records deleted successfully`)
        setDeleteDialogOpen(false)
        setClassToDelete(null)
        fetchClasses()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Delete failed")
      }
    } catch (err) {
      setError("An error occurred while deleting the class")
      console.error("Delete error:", err)
    }
  }

  const handleStatusChange = async (classId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSuccess("Class status updated successfully")
        fetchClasses()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Status update failed")
      }
    } catch (err) {
      setError("An error occurred while updating status")
      console.error("Status update error:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "COMPLETED":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const clearFilters = () => {
    setSelectedYear("all")
    setSelectedBranch("all")
  }

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          title="Classes Management" 
          subtitle="Manage class schedules and delete class data" 
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

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
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

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading classes...</p>
              ) : classes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No classes found matching the current filters</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Year/Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((classItem) => (
                        <TableRow key={classItem.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              {classItem.subject}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {classItem.teacher.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {format(new Date(classItem.date), "MMM dd, yyyy")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {DAYS[classItem.timeslot.dayOfWeek]} • {classItem.timeslot.startTime} - {classItem.timeslot.endTime}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {classItem.year} {classItem.branch}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={classItem.status}
                              onValueChange={(value) => handleStatusChange(classItem.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {classItem._count.attendance}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setClassToDelete(classItem)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete Class
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>
                  Are you sure you want to delete the class <strong>"{classToDelete?.subject}"</strong>?
                </p>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ This will permanently delete:
                  </p>
                  <ul className="text-sm text-destructive mt-2 space-y-1">
                    <li>• The class record</li>
                    <li>• All attendance records for this class ({classToDelete?._count.attendance} records)</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => classToDelete && handleDeleteClass(classToDelete)}
                  >
                    Delete Class
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


