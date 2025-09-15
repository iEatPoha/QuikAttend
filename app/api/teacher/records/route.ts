import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 })
    }

    const records = await prisma.class.findMany({
      where: {
        teacherId,
        status: { in: ["COMPLETED", "ACTIVE"] },
      },
      include: {
        timeslot: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
        _count: {
          select: {
            attendance: {
              where: { status: "PRESENT" },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Add total students count for each record
    const recordsWithTotal = await Promise.all(
      records.map(async (record) => {
        const totalStudents = await prisma.user.count({
          where: {
            role: "STUDENT",
            year: record.year,
            branch: record.branch,
          },
        })

        return {
          ...record,
          totalStudents,
        }
      }),
    )

    return NextResponse.json({ records: recordsWithTotal })
  } catch (error) {
    console.error("Error fetching teacher records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
