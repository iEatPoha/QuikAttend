"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Timeslot {
  id: string
  year: string
  branch: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TimeslotManagement() {
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [timeslots, setTimeslots] = useState<Timeslot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTimeslot, setEditingTimeslot] = useState<Timeslot | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: "",
    endTime: "",
  })

  const fetchTimeslots = async () => {
    if (!selectedYear || !selectedBranch) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/timeslots?year=${selectedYear}&branch=${selectedBranch}`)
      if (response.ok) {
        const data = await response.json()
        setTimeslots(data.timeslots)
      }
    } catch (error) {
      console.error("Error fetching timeslots:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeslots()
  }, [selectedYear, selectedBranch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!selectedYear || !selectedBranch) {
      setError("Please select year and branch first")
      return
    }

    try {
      const payload = {
        ...formData,
        year: selectedYear,
        branch: selectedBranch,
      }

      const url = editingTimeslot ? `/api/admin/timeslots/${editingTimeslot.id}` : "/api/admin/timeslots"
      const method = editingTimeslot ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Operation failed")
      }

      setSuccess(editingTimeslot ? "Timeslot updated successfully" : "Timeslot created successfully")
      setIsDialogOpen(false)
      resetForm()
      fetchTimeslots()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleDelete = async (timeslotId: string) => {
    if (!confirm("Are you sure you want to delete this timeslot?")) return

    try {
      const response = await fetch(`/api/admin/timeslots/${timeslotId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Timeslot deleted successfully")
        fetchTimeslots()
      } else {
        const data = await response.json()
        setError(data.error || "Delete failed")
      }
    } catch (err) {
      setError("An error occurred while deleting")
    }
  }

  const resetForm = () => {
    setFormData({
      dayOfWeek: 1,
      startTime: "",
      endTime: "",
    })
    setEditingTimeslot(null)
  }

  const openEditDialog = (timeslot: Timeslot) => {
    setEditingTimeslot(timeslot)
    setFormData({
      dayOfWeek: timeslot.dayOfWeek,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
    })
    setIsDialogOpen(true)
  }

  // Create timetable grid
  const createTimetableGrid = () => {
    const grid: { [key: string]: Timeslot[] } = {}

    // Group timeslots by day
    timeslots.forEach((slot) => {
      const day = DAYS[slot.dayOfWeek]
      if (!grid[day]) grid[day] = []
      grid[day].push(slot)
    })

    // Sort timeslots by start time
    Object.keys(grid).forEach((day) => {
      grid[day].sort((a, b) => a.startTime.localeCompare(b.startTime))
    })

    return grid
  }

  const timetableGrid = createTimetableGrid()

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Timeslot Management" subtitle="Configure class schedules and timetables" />

        <main className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Year and Branch Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Year and Branch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
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
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}
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
              </div>
            </CardContent>
          </Card>

          {selectedYear && selectedBranch && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Timetable for {selectedYear} {selectedBranch}
                </h2>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Timeslot
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTimeslot ? "Edit Timeslot" : "Add New Timeslot"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dayOfWeek">Day of Week</Label>
                        <Select
                          value={formData.dayOfWeek.toString()}
                          onValueChange={(value) => setFormData({ ...formData, dayOfWeek: Number.parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {editingTimeslot ? "Update Timeslot" : "Create Timeslot"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
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

              {/* Timetable Grid */}
              <div className="grid gap-4">
                {DAYS.map((day, dayIndex) => (
                  <Card key={day}>
                    <CardHeader>
                      <CardTitle className="text-lg">{day}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {timetableGrid[day] && timetableGrid[day].length > 0 ? (
                        <div className="space-y-2">
                          {timetableGrid[day].map((slot) => (
                            <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <span className="font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(slot)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(slot.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No timeslots scheduled</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
