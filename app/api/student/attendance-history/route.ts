import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Get student info
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    })

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Invalid student" }, { status: 400 })
    }

    // Get all classes for this student's year/branch
    const allClasses = await prisma.class.findMany({
      where: {
        year: student.year!,
        branch: student.branch!,
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        timeslot: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
        teacher: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Get attendance records for this student
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId,
      },
      include: {
        class: {
          include: {
            timeslot: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
            teacher: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        class: {
          date: "desc",
        },
      },
    })

    // Create a map of class attendance
    const attendanceMap = new Map()
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.classId, record)
    })

    // Build complete attendance history
    const completeRecords = allClasses.map((classRecord) => {
      const attendance = attendanceMap.get(classRecord.id)
      return {
        id: attendance?.id || `${classRecord.id}-absent`,
        status: attendance?.status || (classRecord.status === "CANCELLED" ? "CANCELLED" : "ABSENT"),
        class: {
          subject: classRecord.subject,
          date: classRecord.date,
          timeslot: classRecord.timeslot,
          teacher: classRecord.teacher,
        },
      }
    })

    // Calculate statistics
    const totalClasses = completeRecords.length
    const presentCount = completeRecords.filter((r) => r.status === "PRESENT").length
    const absentCount = completeRecords.filter((r) => r.status === "ABSENT").length
    const cancelledCount = completeRecords.filter((r) => r.status === "CANCELLED").length
    const attendancePercentage = totalClasses > 0 ? (presentCount / (totalClasses - cancelledCount)) * 100 : 0

    const stats = {
      totalClasses,
      presentCount,
      absentCount,
      cancelledCount,
      attendancePercentage,
    }

    return NextResponse.json({
      records: completeRecords,
      stats,
    })
  } catch (error) {
    console.error("Error fetching attendance history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
