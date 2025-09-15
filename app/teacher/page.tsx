"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, FileText } from "lucide-react"
import Link from "next/link"

export default function TeacherDashboard() {
  return (
    <AuthGuard allowedRoles={["TEACHER"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Teacher Dashboard" subtitle="Manage attendance and classes" />

        <main className="p-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Generate QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Create QR codes for student attendance</p>
                <Link href="/teacher/generate-qr">
                  <Button className="w-full">Generate QR</Button>
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
                <p className="text-muted-foreground mb-4">View past classes and attendance data</p>
                <Link href="/teacher/records">
                  <Button className="w-full">View Records</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
