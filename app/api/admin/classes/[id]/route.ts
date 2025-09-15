import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // First, delete all attendance records for this class
    await prisma.attendance.deleteMany({
      where: { classId: id },
    })

    // Then delete the class
    await prisma.class.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Class and all related attendance records deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status || !["SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: { status },
      include: {
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
        _count: {
          select: {
            attendance: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Class status updated successfully",
      class: updatedClass,
    })
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
