import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateQRCodeImage, type QRCodeData } from "@/lib/qr-utils"
import { getCurrentTimeslot } from "@/lib/attendance-utils"

export async function POST(request: NextRequest) {
  try {
    const { teacherId, subject, year, branch } = await request.json()

    if (!teacherId || !subject || !year || !branch) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find the current timeslot
    const timeslot = await getCurrentTimeslot(year, branch)

    if (!timeslot) {
      return NextResponse.json({ error: "No class scheduled right now" }, { status: 400 })
    }

    // Count total students for this year/branch
    const totalStudents = await prisma.user.count({
      where: {
        role: "STUDENT",
        year,
        branch,
      },
    })

    const now = new Date()
    const qrExpiry = new Date(now.getTime() + 60 * 1000) // 60 seconds from now

    // Create or update class record
    const classRecord = await prisma.class.upsert({
      where: {
        teacherId_timeslotId_date: {
          teacherId,
          timeslotId: timeslot.id,
          date: new Date(now.toDateString()), // Today's date without time
        },
      },
      update: {
        subject,
        qrExpiry,
        status: "ACTIVE",
      },
      create: {
        teacherId,
        subject,
        year,
        branch,
        timeslotId: timeslot.id,
        date: new Date(now.toDateString()),
        qrExpiry,
        status: "ACTIVE",
      },
    })

    // Generate QR code data
    const qrData: QRCodeData = {
      classId: classRecord.id,
      timestamp: now.getTime(),
      teacherId,
    }

    // Generate QR code image
    const qrCodeImage = await generateQRCodeImage(qrData)

    // Update class with QR code
    await prisma.class.update({
      where: { id: classRecord.id },
      data: { qrCode: JSON.stringify(qrData) },
    })

    // Schedule automatic absent marking after QR expires
    setTimeout(async () => {
      try {
        const { markAbsentStudents } = await import("@/lib/attendance-utils")
        await markAbsentStudents(classRecord.id)
      } catch (error) {
        console.error("Error auto-marking absent students:", error)
      }
    }, 60 * 1000) // 60 seconds

    return NextResponse.json({
      qrCode: qrCodeImage,
      classId: classRecord.id,
      totalStudents,
      expiryTime: qrExpiry.toISOString(),
    })
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
