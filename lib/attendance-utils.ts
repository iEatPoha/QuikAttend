import { prisma } from "./prisma"

export async function markAbsentStudents(classId: string) {
  try {
    // Get the class details
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!classRecord) {
      throw new Error("Class not found")
    }

    // Get all students for this year/branch
    const allStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        year: classRecord.year,
        branch: classRecord.branch,
      },
      select: { id: true },
    })

    // Get students who already have attendance marked
    const existingAttendance = await prisma.attendance.findMany({
      where: { classId },
      select: { studentId: true },
    })

    const presentStudentIds = new Set(existingAttendance.map((a) => a.studentId))

    // Find students who are absent
    const absentStudents = allStudents.filter((student) => !presentStudentIds.has(student.id))

    // Mark absent students
    if (absentStudents.length > 0) {
      await prisma.attendance.createMany({
        data: absentStudents.map((student) => ({
          studentId: student.id,
          classId,
          status: "ABSENT" as const,
        })),
      })
    }

    // Update class status to completed
    await prisma.class.update({
      where: { id: classId },
      data: { status: "COMPLETED" },
    })

    return {
      totalStudents: allStudents.length,
      presentStudents: presentStudentIds.size,
      absentStudents: absentStudents.length,
    }
  } catch (error) {
    console.error("Error marking absent students:", error)
    throw error
  }
}

export async function getCurrentTimeslot(year: string, branch: string) {
  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  const dayOfWeek = now.getDay()

  return await prisma.timeslot.findFirst({
    where: {
      year,
      branch,
      dayOfWeek,
      startTime: { lte: currentTime },
      endTime: { gte: currentTime },
    },
  })
}
