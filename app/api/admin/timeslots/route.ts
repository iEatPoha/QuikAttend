import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year")
    const branch = searchParams.get("branch")

    if (!year || !branch) {
      return NextResponse.json({ error: "Year and branch are required" }, { status: 400 })
    }

    const timeslots = await prisma.timeslot.findMany({
      where: {
        year,
        branch,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })

    return NextResponse.json({ timeslots })
  } catch (error) {
    console.error("Error fetching timeslots:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { year, branch, dayOfWeek, startTime, endTime } = await request.json()

    if (!year || !branch || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for overlapping timeslots
    const existingTimeslot = await prisma.timeslot.findFirst({
      where: {
        year,
        branch,
        dayOfWeek,
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

    const timeslot = await prisma.timeslot.create({
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
    console.error("Error creating timeslot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
