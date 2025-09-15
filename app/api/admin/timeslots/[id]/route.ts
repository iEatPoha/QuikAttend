import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { year, branch, dayOfWeek, startTime, endTime } = await request.json()
    const { id } = await params

    if (!year || !branch || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for overlapping timeslots (excluding current one)
    const existingTimeslot = await prisma.timeslot.findFirst({
      where: {
        year,
        branch,
        dayOfWeek,
        id: { not: id },
        OR: [
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
          },
          {
            AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
          },
          {
            AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
          },
        ],
      },
    })

    if (existingTimeslot) {
      return NextResponse.json({ error: "Timeslot overlaps with existing slot" }, { status: 400 })
    }

    const timeslot = await prisma.timeslot.update({
      where: { id },
      data: {
        year,
        branch,
        dayOfWeek,
        startTime,
        endTime,
      },
    })

    return NextResponse.json({ timeslot })
  } catch (error) {
    console.error("Error updating timeslot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.timeslot.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting timeslot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
