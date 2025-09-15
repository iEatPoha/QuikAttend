import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { year, branch, date } = await request.json()

    if (!year || !branch || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const targetDate = new Date(date)

    // Find all classes for the given date, year, and branch
    const classes = await prisma.class.findMany({
      where: {
        year,
        branch,
        date: targetDate,
        status: "SCHEDULED",
      },
    })

    if (classes.length === 0) {
      return NextResponse.json({ error: "No scheduled classes found for this date" }, { status: 404 })
    }

    // Mark all classes as cancelled
    await prisma.class.updateMany({
      where: {
        year,
        branch,
        date: targetDate,
        status: "SCHEDULED",
      },
      data: {
        status: "CANCELLED",
      },
    })

    // Mark all students as having cancelled classes
    for (const classRecord of classes) {
      // Get all students for this year/branch
      const students = await prisma.user.findMany({
        where: {
          role: "STUDENT",
          year,
          branch,
        },
        select: { id: true },
      })

      // Create attendance records with CANCELLED status
      await prisma.attendance.createMany({
        data: students.map((student) => ({
          studentId: student.id,
          classId: classRecord.id,
          status: "CANCELLED" as const,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({
      message: `${classes.length} classes marked as cancelled`,
      cancelledClasses: classes.length,
    })
  } catch (error) {
    console.error("Error marking classes as cancelled:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
