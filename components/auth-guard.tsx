"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "TEACHER" | "STUDENT"
  year?: string
  branch?: string
}

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles: Array<"ADMIN" | "TEACHER" | "STUDENT">
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")

    if (!userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData) as User

      if (!allowedRoles.includes(parsedUser.role)) {
        router.push("/login")
        return
      }

      setUser(parsedUser)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
      return
    } finally {
      setIsLoading(false)
    }
  }, [router, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return { user, logout }
}
