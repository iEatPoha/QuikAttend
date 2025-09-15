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
    const format = searchParams.get("format") || "csv"

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

    if (format === "csv") {
      // Generate CSV content
      const csvHeaders = [
        "Student Name",
        "Student Email",
        "Student Year",
        "Student Branch",
        "Subject",
        "Teacher Name",
        "Class Date",
        "Day of Week",
        "Start Time",
        "End Time",
        "Attendance Status",
        "Class Status",
        "Marked At"
      ]

      const csvRows = attendanceRecords.map(record => [
        record.student.name,
        record.student.email,
        record.student.year || "",
        record.student.branch || "",
        record.class.subject,
        record.class.teacher.name,
        record.class.date.toISOString().split('T')[0],
        getDayName(record.class.timeslot.dayOfWeek),
        record.class.timeslot.startTime,
        record.class.timeslot.endTime,
        record.status,
        record.class.status,
        record.createdAt.toISOString()
      ])

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(","))
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance-records-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else if (format === "json") {
      // Return JSON format
      return NextResponse.json({
        exportDate: new Date().toISOString(),
        filters: {
          year,
          branch,
          subject,
          studentId,
          startDate,
          endDate,
        },
        records: attendanceRecords,
        summary: {
          total: attendanceRecords.length,
          present: attendanceRecords.filter(r => r.status === "PRESENT").length,
          absent: attendanceRecords.filter(r => r.status === "ABSENT").length,
          cancelled: attendanceRecords.filter(r => r.status === "CANCELLED").length,
        },
      })
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error exporting attendance records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayOfWeek] || "Unknown"
}
