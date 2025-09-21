import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { markAbsentStudents } from "@/lib/attendance-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 })
    }

    // Find the class record
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    if (classRecord.status !== "ACTIVE") {
      return NextResponse.json({ error: "Class is not active" }, { status: 400 })
    }

    // Update class status to COMPLETED
    await prisma.class.update({
      where: { id: classId },
      data: { 
        status: "COMPLETED",
        qrExpiry: new Date(), // Set expiry to now
      },
    })

    // Mark absent students
    await markAbsentStudents(classId)

    return NextResponse.json({ 
      message: "QR code stopped successfully",
      status: "COMPLETED"
    })
  } catch (error) {
    console.error("Error stopping QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


