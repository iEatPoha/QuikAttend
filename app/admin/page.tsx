"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Clock, FileText, Calendar } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Admin Dashboard" subtitle="Manage users, timeslots, and attendance records" />

        <main className="p-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Add, edit, and delete teachers and students</p>
                <Link href="/admin/users">
                  <Button className="w-full">Manage Users</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeslot Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Configure class schedules and timetables</p>
                <Link href="/admin/timeslots">
                  <Button className="w-full">Manage Timeslots</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attendance Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">View, filter, and export all attendance data</p>
                <Link href="/admin/attendance-records">
                  <Button className="w-full">Manage Records</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Classes Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Manage class schedules and delete class data</p>
                <Link href="/admin/classes">
                  <Button className="w-full">Manage Classes</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
