import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status || !["PRESENT", "ABSENT", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: { status },
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
          },
        },
      },
    })

    return NextResponse.json({
      message: "Attendance updated successfully",
      attendance: updatedAttendance,
    })
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.attendance.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Attendance record deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
