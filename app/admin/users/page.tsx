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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: "TEACHER" | "STUDENT"
  year?: string
  branch?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TEACHER" as "TEACHER" | "STUDENT",
    year: "",
    branch: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Operation failed")
      }

      setSuccess(editingUser ? "User updated successfully" : "User created successfully")
      setIsDialogOpen(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("User deleted successfully")
        fetchUsers()
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
      name: "",
      email: "",
      password: "",
      role: "TEACHER",
      year: "",
      branch: "",
    })
    setEditingUser(null)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      year: user.year || "",
      branch: user.branch || "",
    })
    setIsDialogOpen(true)
  }

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader title="User Management" subtitle="Add, edit, and delete teachers and students" />

        <main className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password {editingUser && "(leave blank to keep current)"}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "TEACHER" | "STUDENT") => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="STUDENT">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.role === "STUDENT" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select
                          value={formData.year}
                          onValueChange={(value) => setFormData({ ...formData, year: value })}
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
                          value={formData.branch}
                          onValueChange={(value) => setFormData({ ...formData, branch: value })}
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
                    </>
                  )}
                  <Button type="submit" className="w-full">
                    {editingUser ? "Update User" : "Create User"}
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

          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading users...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Year/Branch</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          {user.role === "STUDENT" && user.year && user.branch ? `${user.year} ${user.branch}` : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
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
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
