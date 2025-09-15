import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params

    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            attendance: {
              where: { status: "PRESENT" },
            },
          },
        },
      },
    })

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Count total students for this class
    const totalStudents = await prisma.user.count({
      where: {
        role: "STUDENT",
        year: classRecord.year,
        branch: classRecord.branch,
      },
    })

    return NextResponse.json({
      present: classRecord._count.attendance,
      total: totalStudents,
    })
  } catch (error) {
    console.error("Error fetching attendance count:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
