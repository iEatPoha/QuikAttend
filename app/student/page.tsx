"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scan, History } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  return (
    <AuthGuard allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Student Dashboard" subtitle="Mark attendance and view history" />

        <main className="p-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Scan QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Scan teacher&apos;s QR code to mark attendance</p>
                <Link href="/student/scan">
                  <Button className="w-full">Scan QR</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">View your attendance records</p>
                <Link href="/student/history">
                  <Button className="w-full">View History</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
