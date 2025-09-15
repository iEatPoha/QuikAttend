import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year")
    const branch = searchParams.get("branch")

    // Build where clause for filtering
    const whereClause: any = {}

    if (year && year !== "all") whereClause.year = year
    if (branch && branch !== "all") whereClause.branch = branch

    // Fetch classes with related data
    const classes = await prisma.class.findMany({
      where: whereClause,
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
      orderBy: [
        { date: "desc" },
        { subject: "asc" },
      ],
    })

    return NextResponse.json({
      classes,
    })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


