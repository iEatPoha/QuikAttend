"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "./auth-guard"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <span className="text-sm text-muted-foreground truncate">
            {user?.name}
            {user?.role === "STUDENT" && user?.year && user?.branch && (
              <span className="ml-2">
                ({formatYear(user.year)} {user.branch})
              </span>
            )}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

function formatYear(year: string) {
  switch (year) {
    case "1st":
      return "1st Year"
    case "2nd":
      return "2nd Year"
    case "3rd":
      return "3rd Year"
    case "4th":
      return "4th Year"
    default:
      return year
  }
}
