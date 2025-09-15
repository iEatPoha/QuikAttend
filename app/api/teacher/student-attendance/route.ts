import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")
    const year = searchParams.get("year")
    const branch = searchParams.get("branch")
    const studentName = searchParams.get("studentName")
    const subject = searchParams.get("subject")

    if (!teacherId || !year || !branch || !studentName) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        student: {
          name: {
            contains: studentName,
            mode: "insensitive",
          },
          year,
          branch,
        },
        class: {
          teacherId,
          ...(subject ? { subject: { contains: subject, mode: "insensitive" } } : {}),
        },
      },
      include: {
        student: {
          select: {
            name: true,
          },
        },
        class: {
          select: {
            subject: true,
            date: true,
            timeslot: {
              select: {
                startTime: true,
                endTime: true,
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

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Error fetching student attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
