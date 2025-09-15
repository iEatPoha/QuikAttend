import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year")
    const branch = searchParams.get("branch")
    const subject = searchParams.get("subject")
    const studentId = searchParams.get("studentId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build where clause for filtering
    const whereClause: any = {}

    if (year) whereClause.year = year
    if (branch) whereClause.branch = branch
    if (subject) whereClause.subject = { contains: subject }

    // Date filtering
    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) whereClause.date.gte = new Date(startDate)
      if (endDate) whereClause.date.lte = new Date(endDate)
    }

    // Fetch attendance records with related data
    const attendanceRecords = await prisma.attendance.findMany({
      where: studentId ? { studentId } : {
        class: whereClause
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            year: true,
            branch: true,
          },
        },
        class: {
          select: {
            id: true,
            subject: true,
            year: true,
            branch: true,
            date: true,
            status: true,
            teacher: {
              select: {
                name: true,
                email: true,
              },
            },
            timeslot: {
              select: {
                dayOfWeek: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
      orderBy: [
        { class: { date: "desc" } },
        { student: { name: "asc" } },
      ],
    })

    // Get summary statistics
    const totalRecords = attendanceRecords.length
    const presentCount = attendanceRecords.filter(record => record.status === "PRESENT").length
    const absentCount = attendanceRecords.filter(record => record.status === "ABSENT").length
    const cancelledCount = attendanceRecords.filter(record => record.status === "CANCELLED").length

    // Get unique students, subjects, and classes for filtering options
    const uniqueStudents = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, year: true, branch: true },
      orderBy: { name: "asc" },
    })

    const uniqueSubjects = await prisma.class.findMany({
      select: { subject: true },
      distinct: ["subject"],
      orderBy: { subject: "asc" },
    })

    return NextResponse.json({
      records: attendanceRecords,
      summary: {
        total: totalRecords,
        present: presentCount,
        absent: absentCount,
        cancelled: cancelledCount,
      },
      filters: {
        students: uniqueStudents,
        subjects: uniqueSubjects.map(s => s.subject),
      },
    })
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
