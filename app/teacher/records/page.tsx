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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface ClassRecord {
  id: string
  subject: string
  year: string
  branch: string
  date: string
  timeslot: {
    startTime: string
    endTime: string
  }
  _count: {
    attendance: number
  }
  totalStudents: number
}

interface StudentAttendance {
  student: {
    name: string
  }
  status: string
  class: {
    subject: string
    date: string
    timeslot: {
      startTime: string
      endTime: string
    }
  }
}

export default function AttendanceRecords() {
  const { user } = useAuth()
  const [classRecords, setClassRecords] = useState<ClassRecord[]>([])
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchYear, setSearchYear] = useState("")
  const [searchBranch, setSearchBranch] = useState("")
  const [searchStudent, setSearchStudent] = useState("")
  const [searchSubject, setSearchSubject] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchClassRecords()
  }, [])

  const fetchClassRecords = async () => {
    try {
      const response = await fetch(`/api/teacher/records?teacherId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setClassRecords(data.records)
      }
    } catch (error) {
      console.error("Error fetching class records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchYear || !searchBranch || !searchStudent) return

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        teacherId: user?.id || "",
        year: searchYear,
        branch: searchBranch,
        studentName: searchStudent,
      })
      if (searchSubject) params.append("subject", searchSubject)
      const response = await fetch(`/api/teacher/student-attendance?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStudentAttendance(data.attendance)
      }
    } catch (error) {
      console.error("Error searching student attendance:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <AuthGuard allowedRoles={["TEACHER"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Attendance Records" subtitle="View past classes and attendance data" />

        <main className="p-4 space-y-6">
          <Link href="/teacher">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Class Records */}
          <Card>
            <CardHeader>
              <CardTitle>Past Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading records...</p>
              ) : classRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Year/Branch</TableHead>
                      <TableHead>Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {record.timeslot.startTime} - {record.timeslot.endTime}
                        </TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>
                          {record.year} {record.branch}
                        </TableCell>
                        <TableCell>
                          {record._count.attendance}/{record.totalStudents}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No class records found</p>
              )}
            </CardContent>
          </Card>

          {/* Student Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Student Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStudentSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchYear">Year</Label>
                    <Select value={searchYear} onValueChange={setSearchYear}>
                      <SelectTrigger id="searchYear">
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
                    <Label htmlFor="searchSubject">Subject (optional)</Label>
                    <Input
                      id="searchSubject"
                      value={searchSubject}
                      onChange={(e) => setSearchSubject(e.target.value)}
                      placeholder="e.g., Math I"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="searchBranch">Branch</Label>
                    <Select value={searchBranch} onValueChange={setSearchBranch}>
                      <SelectTrigger id="searchBranch">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="ECE">ECE</SelectItem>
                        <SelectItem value="EC">EC</SelectItem>
                        <SelectItem value="ME">ME</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="searchStudent">Student Name</Label>
                    <Input
                      id="searchStudent"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Enter student name"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </form>

              {studentAttendance.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Attendance History for {searchStudent} ({searchYear} {searchBranch})
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAttendance.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{format(new Date(record.class.date), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            {record.class.timeslot.startTime} - {record.class.timeslot.endTime}
                          </TableCell>
                          <TableCell>{record.class.subject}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                record.status === "PRESENT"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "ABSENT"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {record.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
