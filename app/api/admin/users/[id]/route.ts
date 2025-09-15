import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { name, email, password, role, year, branch } = await request.json()
    const { id } = await params

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (role === "STUDENT" && (!year || !branch)) {
      return NextResponse.json({ error: "Year and branch are required for students" }, { status: 400 })
    }

    // Check if email already exists for other users
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const updateData: any = {
      name,
      email,
      role,
      year: role === "STUDENT" ? year : null,
      branch: role === "STUDENT" ? branch : null,
    }

    // Only update password if provided
    if (password) {
      updateData.password = await hashPassword(password)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        year: true,
        branch: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
