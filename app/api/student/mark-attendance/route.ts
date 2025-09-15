import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseQRCodeData, isQRCodeExpired } from "@/lib/qr-utils"

export async function POST(request: NextRequest) {
  try {
    const { qrData, studentId } = await request.json()

    if (!qrData || !studentId) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Parse QR code data
    const parsedData = parseQRCodeData(qrData)
    if (!parsedData) {
      return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 })
    }

    const { classId, timestamp, teacherId } = parsedData

    // Check if QR code is expired
    if (isQRCodeExpired(timestamp)) {
      return NextResponse.json({ error: "QR code has expired" }, { status: 400 })
    }

    // Find the class and verify it's active
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        timeslot: true,
        teacher: {
          select: { name: true },
        },
      },
    })

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    if (classRecord.teacherId !== teacherId) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    if (classRecord.status !== "ACTIVE") {
      return NextResponse.json({ error: "Class is not active" }, { status: 400 })
    }

    // Verify student belongs to this class
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    })

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Invalid student" }, { status: 400 })
    }

    if (student.year !== classRecord.year || student.branch !== classRecord.branch) {
      return NextResponse.json({ error: "You are not enrolled in this class" }, { status: 400 })
    }

    // Check if student has already marked attendance for this class
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
    })

    if (existingAttendance) {
      return NextResponse.json({ error: "Attendance already marked for this class" }, { status: 400 })
    }

    // Mark attendance
    await prisma.attendance.create({
      data: {
        studentId,
        classId,
        status: "PRESENT",
      },
    })

    return NextResponse.json({
      message: `Attendance marked successfully for ${classRecord.subject} by ${classRecord.teacher.name}`,
      classDetails: {
        subject: classRecord.subject,
        teacher: classRecord.teacher.name,
        time: `${classRecord.timeslot.startTime} - ${classRecord.timeslot.endTime}`,
      },
    })
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
