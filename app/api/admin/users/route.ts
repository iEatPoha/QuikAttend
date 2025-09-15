import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["TEACHER", "STUDENT"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        year: true,
        branch: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, year, branch } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (role === "STUDENT" && (!year || !branch)) {
      return NextResponse.json({ error: "Year and branch are required for students" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        year: role === "STUDENT" ? year : null,
        branch: role === "STUDENT" ? branch : null,
      },
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
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
